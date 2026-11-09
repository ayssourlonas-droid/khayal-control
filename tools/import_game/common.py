"""ثوابت وأدوات مشتركة: السجلات والمراحل والمؤقّت وتنفيذ الأوامر وواجهة GitHub."""
import json
import os
import re
import subprocess
import threading
import time
import urllib.request
import urllib.error

ALLOWED = ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "CC0-1.0", "CC-BY-4.0",
           "CC-BY-3.0", "GPL-3.0", "ISC", "Zlib"]  # OWNED/PARTNER لا تُقبل تلقائياً

PREBUILT_DIRS = ["docs", "dist", "build", "www", "release", "web", "html", "public"]
EXCLUDE_DIRS = {".git", "node_modules", ".github", "__MACOSX"}
MAX_FILE = 25 * 1024 * 1024          # حد Cloudflare Pages للملف الواحد
MAX_FILES = 18000                    # حد Cloudflare 20,000
MAX_TOTAL_FAIL = 150 * 1024 * 1024
MAX_TOTAL_WARN = 60 * 1024 * 1024

TRACKERS = [
    "googlesyndication.com", "doubleclick.net", "google-analytics.com", "googletagmanager.com",
    "adsbygoogle", "facebook.net", "connect.facebook", "unityads", "applovin", "adcolony",
    "ironsrc", "vungle", "chartboost", "admob", "mopub", "popads", "propellerads",
    "adsterra", "taboola", "outbrain", "yandex.ru/metrika", "mc.yandex", "hotjar.com",
    "clarity.ms", "sentry.io", "gameanalytics.com", "poki.com/sdk", "crazygames.com/sdk",
    "gamedistribution.com", "gamemonetize.com", "y8.com", "kongregate.com/javascripts",
]
SAFE_CDNS = {"cdnjs.cloudflare.com", "cdn.jsdelivr.net", "unpkg.com", "fonts.googleapis.com",
             "fonts.gstatic.com", "ajax.googleapis.com", "code.jquery.com", "127.0.0.1", "localhost"}

TEXT_EXT = {".html", ".htm", ".js", ".mjs", ".css", ".json"}

# سجل التعديلات التلقائية (يظهر في التقرير)
FIXES = {}
HTML_SKIPPED = []


def fixed(name, n=1):
    FIXES[name] = FIXES.get(name, 0) + n


# ───────────── أدوات عامة ─────────────
def log(*a):
    print(*a, flush=True)


# ───────────── قياس الزمن ومراقبة التأخر (لمعرفة سبب البطء عند حدوثه) ─────────────
_T0 = time.time()
_STAGE = {"name": "بدء", "t": time.time()}
TIMINGS = []                      # [(مرحلة، ثوانٍ)]
COUNT = {"commands": 0, "browser_tests": 0}
LAST_CMD = {"cmd": "", "t": 0.0}
_WATCHDOG = {"timer": None}


def stage(name):
    """يسجّل نهاية المرحلة السابقة وبداية مرحلة جديدة مع الزمن المنقضي."""
    now = time.time()
    if _STAGE["name"]:
        TIMINGS.append((_STAGE["name"], round(now - _STAGE["t"], 1)))
    _STAGE.update(name=name, t=now)
    if name:
        log(f"⏱ [{int(now - _T0)}ث منذ البدء] المرحلة: {name}")


def timings_text():
    now = time.time()
    rows = TIMINGS + [(_STAGE["name"], round(now - _STAGE["t"], 1))]
    return "؛ ".join(f"{n}: {int(t)}ث" for n, t in rows if t >= 1)


def _watchdog_fire():
    """قبل أن يقطع GitHub المهمة (40 دقيقة) نكتب أين كنا بالضبط ثم ننهي بفشل واضح."""
    now = time.time()
    cmd = LAST_CMD["cmd"]
    lines = [
        "## ⏱ تجاوز المهلة الداخلية",
        f"مضى {int((now - _T0) / 60)} دقيقة منذ البدء، والمرحلة الجارية: **{_STAGE['name']}** "
        f"(منذ {int((now - _STAGE['t']) / 60)} دقيقة).",
        f"آخر أمر: `{cmd[:200]}` (منذ {int(now - LAST_CMD['t'])} ثانية)" if cmd else "لم يُشغَّل أمر خارجي بعد.",
        f"عدد الأوامر الخارجية: {COUNT['commands']}؛ عدد اختبارات المتصفح: {COUNT['browser_tests']}",
        "أزمنة المراحل: " + timings_text(),
        "التفسير المرجّح: بناء npm ثقيل، أو تكرار اختبارات المتصفح أثناء تقليل الملفات/تحسين الوسائط "
        "(جرّب prune=junk/off أو media=off لهذه اللعبة).",
    ]
    txt = "\n".join(lines)
    print(txt, flush=True)
    sp = os.environ.get("GITHUB_STEP_SUMMARY")
    if sp:
        try:
            with open(sp, "a", encoding="utf-8") as f:
                f.write(txt + "\n")
        except Exception:
            pass
    print(f"::error title=تجاوز المهلة الداخلية::المرحلة الجارية: {_STAGE['name']}", flush=True)
    os._exit(3)


def start_watchdog():
    sec = float(os.environ.get("WATCHDOG_SEC") or float(os.environ.get("WATCHDOG_MIN", "35")) * 60)
    t = threading.Timer(sec, _watchdog_fire)
    t.daemon = True
    t.start()
    _WATCHDOG["timer"] = t


def stop_watchdog():
    if _WATCHDOG["timer"]:
        _WATCHDOG["timer"].cancel()


def _heartbeat(cmd_text, t0, stop):
    while not stop.wait(120):
        log(f"⏳ ما زال يعمل منذ {int(time.time() - t0)}ث: {cmd_text[:80]}  (المرحلة: {_STAGE['name']})")


def run(cmd, cwd=None, timeout=900, check=True, env=None):
    cmd_text = " ".join(cmd) if isinstance(cmd, list) else cmd
    log("$", cmd_text)
    e = os.environ.copy()
    e["CI"] = "1"
    if env:
        e.update(env)
    COUNT["commands"] += 1
    LAST_CMD.update(cmd=cmd_text, t=time.time())
    hb_stop = threading.Event()
    threading.Thread(target=_heartbeat, args=(cmd_text, time.time(), hb_stop), daemon=True).start()
    try:
        r = subprocess.run(cmd, cwd=cwd, timeout=timeout, env=e, text=True,
                           shell=isinstance(cmd, str),
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    finally:
        hb_stop.set()
    tail = (r.stdout or "")[-2500:]
    if tail:
        log(tail)
    if check and r.returncode != 0:
        raise RuntimeError(f"فشل الأمر: {cmd} (رمز {r.returncode})")
    return r


def parse_repo(url):
    from urllib.parse import urlparse
    u = urlparse(url.strip())
    host = (u.netloc or "").lower()
    segs = [s for s in u.path.split("/") if s]
    if host in ("github.com", "www.github.com") and len(segs) >= 2:
        if len(segs) >= 3 and segs[2] in ("issues", "pull", "pulls", "actions", "discussions", "wiki",
                                          "releases", "commit", "commits", "compare", "security", "pulse"):
            return None  # رابط صفحة داخل المستودع (مشكلة/طلب دمج...) وليس رابط اللعبة
        return segs[0], re.sub(r"\.git$", "", segs[1])
    if host.endswith(".github.io"):
        owner = host.split(".")[0]
        return owner, (segs[0] if segs else f"{owner}.github.io")
    return None


def api(path):
    req = urllib.request.Request("https://api.github.com" + path)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "gamehub-importer")
    tok = os.environ.get("GH_API_TOKEN")
    if tok:
        req.add_header("Authorization", f"Bearer {tok}")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"GitHub API {e.code} لـ {path}")


def slugify(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s or "game"


def pretty_title(name):
    t = re.sub(r"[-_.]+", " ", name).strip()
    return " ".join(w.capitalize() if w.islower() else w for w in t.split()) or name
