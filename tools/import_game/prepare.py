#!/usr/bin/env python3
"""
المرحلة 1 (بلا أسرار): جلب لعبة من GitHub، فحص رخصتها، بناؤها إن لزم،
تنظيفها، اختبارها بمتصفح آلي، وتجهيز حزمة جاهزة للنشر في work/out.
لا يستخدم أي ذكاء اصطناعي. التعديل الوحيد على الملفات: إزالة وسوم إعلانات/تتبّع معروفة
وتحويل المسارات المطلقة في ملفات HTML إلى نسبية.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlparse

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


# ───────────── اكتشاف مجلد الويب والبناء ─────────────
def has_index(d: Path):
    return (d / "index.html").is_file()


def root_index_needs_build(src: Path):
    p = src / "index.html"
    if not p.is_file():
        return False
    t = p.read_text(encoding="utf-8", errors="ignore")
    return bool(re.search(r'src=["\']/?src/|\.(tsx|jsx|ts)["\']', t))


def find_webroot(src: Path, override=""):
    if override:
        d = (src / override).resolve()
        if str(d).startswith(str(src.resolve())) and has_index(d):
            return d
        return None
    for name in PREBUILT_DIRS:
        d = src / name
        if d.is_dir() and has_index(d):
            return d
    if has_index(src):
        if not root_index_needs_build(src):
            return src
        # index.html يشير إلى src/... لكن بلا package.json لا يوجد ما يُبنى: وحدات ES عادية تعمل كما هي
        if not (src / "package.json").is_file():
            return src
    return None


def newest_index(src: Path):
    best, best_t = None, 0
    for name in ["dist", "build", "out", "docs", "public", "www"]:
        d = src / name
        if d.is_dir() and has_index(d):
            t = (d / "index.html").stat().st_mtime
            if t >= best_t:
                best, best_t = d, t
    return best


_OUT_NAMES = ("dist", "build", "out", "public", "www", "client", "web", "site", "static")
_REALTIME_DEPS = {"ws", "socket.io", "colyseus", "@colyseus/core", "@colyseus/ws-transport", "uwebsockets.js",
                  "geckos.io-server", "@geckos.io/server", "peer", "peerjs-server"}


def find_built_output(src: Path, since: float):
    """بعد البناء: يبحث عن أي مجلد فيه index.html جديد (مثل dist/public أو client/dist أو apps/web/dist)."""
    cands = []
    for f in src.rglob("index.html"):
        rel = f.relative_to(src).parts
        if any(x in ("node_modules", ".git", ".github") for x in rel):
            continue
        try:
            mt = f.stat().st_mtime
        except OSError:
            continue
        if mt < since - 2:
            continue
        d = f.parent
        in_out = any(x in _OUT_NAMES or x.startswith(".output") for x in rel[:-1])
        if not in_out:
            continue
        # نفضّل المجلد الذي يحوي ملفات مبنية (assets أو js) وأقلّها عمقاً
        has_assets = (d / "assets").is_dir() or any(d.glob("*.js"))
        cands.append((0 if has_assets else 1, len(rel), -mt, d))
    cands.sort(key=lambda c: c[:3])
    return cands[0][3] if cands else None


def realtime_server(src: Path):
    """اعتمادات خادم لحظي (WebSocket/غرف) في package.json الرئيسي أو في server/backend: لعبة جماعية تحتاج خادماً."""
    found = set()
    for rel in ("package.json", "server/package.json", "backend/package.json", "apps/server/package.json",
                "packages/server/package.json"):
        pj = src / rel
        if not pj.is_file():
            continue
        try:
            data = json.loads(pj.read_text("utf-8", errors="ignore"))
        except Exception:
            continue
        deps = {**(data.get("dependencies") or {}), **(data.get("devDependencies") or {})}
        found |= {d for d in deps if d in _REALTIME_DEPS}
    return sorted(found)


def detect_pm(src: Path, data) -> str:
    """مدير الحزم الذي يستعمله المشروع فعلاً: pnpm أو yarn أو npm (الافتراضي)."""
    pmf = str((data or {}).get("packageManager", "")) if isinstance(data, dict) else ""
    if pmf.startswith("pnpm") or (src / "pnpm-lock.yaml").is_file() or (src / "pnpm-workspace.yaml").is_file():
        return "pnpm"
    if pmf.startswith("yarn") or ((src / "yarn.lock").is_file() and not (src / "package-lock.json").is_file()):
        return "yarn"
    return "npm"


def pnpm_version(src: Path, data) -> str:
    pmf = str((data or {}).get("packageManager", "")) if isinstance(data, dict) else ""
    m = re.match(r"pnpm@(\d+(?:\.\d+){0,2})", pmf)
    if m:
        return m.group(1)
    try:
        lf = (src / "pnpm-lock.yaml").read_text(encoding="utf-8", errors="ignore")[:400]
        m = re.search(r"lockfileVersion:\s*'?(\d+)", lf)
        if m:
            return {"5": "7", "6": "8"}.get(m.group(1), "9")
    except Exception:
        pass
    return "9"


def try_pages_branch(owner, repo, work: Path, notes):
    """إن لم توجد نسخة ويب في الفرع الرئيسي: نجرّب فرع gh-pages، وهو النسخة التي نشرها المطوّر على GitHub Pages
    (شائع لمشاريع Godot/Unity المصدرية). يرجع مجلد الويب أو None."""
    url = f"https://github.com/{owner}/{repo}.git"
    try:
        r = run(["git", "ls-remote", "--heads", url, "gh-pages"], check=False, timeout=120)
    except Exception:
        return None
    if "refs/heads/gh-pages" not in (r.stdout or ""):
        return None
    dest = work / "pages"
    try:
        run(["git", "clone", "--depth", "1", "-b", "gh-pages", url, str(dest)], timeout=900)
    except Exception:
        return None
    shutil.rmtree(dest / ".git", ignore_errors=True)
    if not (dest / "index.html").is_file():
        return None
    notes.append("لا توجد نسخة ويب في الفرع الرئيسي، فاستُعملت النسخة المنشورة من المطوّر في فرع gh-pages "
                 "(ليست مبنية من الكود هنا، وقد تكون أقدم أو أحدث منه)")
    return dest


def build_if_needed(src: Path, override, build_cmd, notes):
    root = find_webroot(src, override)
    if root:
        notes.append(f"مجلد الويب الجاهز: {root.relative_to(src) if root != src else '.'}")
        return root
    pkg = src / "package.json"
    if not pkg.is_file():
        if has_index(src):  # احتياط: لا بناء ولا package.json لكن توجد صفحة
            notes.append("لا يوجد package.json: نسخ index.html كما هو")
            return src
        return None
    try:
        data = json.loads(pkg.read_text(encoding="utf-8"))
    except Exception:
        data = {}
    scripts = data.get("scripts", {}) if isinstance(data, dict) else {}
    if not build_cmd and "build" not in scripts:
        if has_index(src):  # لا أمر بناء لكن توجد صفحة جاهزة
            notes.append("لا يوجد أمر build: نسخ index.html كما هو")
            return src
        return None
    t_build = time.time()
    pm = detect_pm(src, data)
    notes.append(f"لا يوجد مجلد جاهز، جارٍ بناء المشروع بـ {pm}")
    if pm == "pnpm":
        ver = pnpm_version(src, data)
        run(["npm", "install", "-g", f"pnpm@{ver}", "--no-audit", "--no-fund"], timeout=300)
        try:
            run(["pnpm", "install", "--frozen-lockfile"], cwd=src, timeout=900)
        except RuntimeError:
            run(["pnpm", "install", "--no-frozen-lockfile"], cwd=src, timeout=900)
        build_default = ["pnpm", "run", "build"]
    elif pm == "yarn":
        try:
            run(["yarn", "install", "--frozen-lockfile"], cwd=src, timeout=900)
        except RuntimeError:
            run(["yarn", "install"], cwd=src, timeout=900)
        build_default = ["yarn", "run", "build"]
    else:
        if (src / "package-lock.json").is_file():
            run(["npm", "ci", "--no-audit", "--no-fund"], cwd=src, timeout=900)
        else:
            run(["npm", "install", "--no-audit", "--no-fund"], cwd=src, timeout=900)
        build_default = ["npm", "run", "build"]
    if build_cmd:
        run(build_cmd, cwd=src, timeout=900)  # نص أمر واحد؛ يُنفَّذ عبر الصدفة
    else:
        run(build_default, cwd=src, timeout=900)
    root = find_webroot(src, override) or newest_index(src) or find_built_output(src, t_build)
    if root and root != src:
        notes.append(f"مجلد الناتج المبني: {root.relative_to(src)}")
    return root


# ───────────── التنظيف ─────────────
def copy_site(webroot: Path, dest: Path):
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    for dp, dns, fns in os.walk(webroot):
        dns[:] = [d for d in dns if d not in EXCLUDE_DIRS]
        rel = Path(dp).relative_to(webroot)
        (dest / rel).mkdir(parents=True, exist_ok=True)
        for fn in fns:
            if fn.endswith(".map") or fn == ".DS_Store":
                continue
            sp = Path(dp) / fn
            if sp.is_symlink():
                continue
            shutil.copy2(sp, dest / rel / fn)


SCRIPT_RE = re.compile(r"<script\b([^>]*)>(.*?)</script>", re.I | re.S)
ATTR_ABS_RE = re.compile(r'''(\b(?:src|href|data-src|poster)\s*=\s*)(["'])/(?!/)([^"']*)\2''', re.I)
INLINE_AD_RE = re.compile(r"adsbygoogle|gtag\(|googletag|fbq\(|ga\(\s*['\"]create", re.I)


HTTP_ATTR_RE = re.compile(r"""(\b(?:src|href|data-src|poster)\s*=\s*)(["'])(http://[^"']+)\2""", re.I)


def process_html(path: Path, depth: int, removed: list, rewritten: list):
    raw = path.read_bytes()
    try:
        t = raw.decode("utf-8")
    except UnicodeDecodeError:
        HTML_SKIPPED.append(path.name)  # لا نعدّل ملفاً بترميز غير UTF-8 كي لا نتلفه
        return
    orig = t

    def drop_script(m):
        attrs, body = m.group(1), m.group(2)
        src = re.search(r'src\s*=\s*["\']([^"\']+)["\']', attrs, re.I)
        s = src.group(1) if src else ""
        if s and any(tr in s.lower() for tr in TRACKERS):
            removed.append(f"{path.name}: {s[:90]}")
            fixed("إزالة وسم إعلانات/تتبّع")
            return ""
        if not s and INLINE_AD_RE.search(body):
            removed.append(f"{path.name}: سكربت داخلي لإعلانات/تتبّع")
            fixed("إزالة وسم إعلانات/تتبّع")
            return ""
        return m.group(0)

    t = SCRIPT_RE.sub(drop_script, t)

    prefix = "../" * depth

    def fix_abs(m):
        val = m.group(3)
        if val == "":
            return f"{m.group(1)}{m.group(2)}#{m.group(2)}" if m.group(1).lower().startswith("href") else m.group(0)
        rewritten.append(f"{path.name}: /{val[:60]}")
        fixed("مسار مطلق ← نسبي")
        return f"{m.group(1)}{m.group(2)}{prefix}{val}{m.group(2)}"

    t = ATTR_ABS_RE.sub(fix_abs, t)

    # موارد http:// داخل صفحة https تُحجب من المتصفح (mixed content) ← نرقّيها إلى https
    def to_https(m):
        url = m.group(3)
        if re.match(r"http://(127\.0\.0\.1|localhost)", url):
            return m.group(0)
        fixed("http ← https")
        return f"{m.group(1)}{m.group(2)}https://{url[7:]}{m.group(2)}"

    t = HTTP_ATTR_RE.sub(to_https, t)

    # ترميز UTF-8 صريح إن لم يوجد (يمنع تشويه الحروف العربية)
    hm = re.search(r"<head[^>]*>", t, re.I)
    if hm and not re.search(r"<meta[^>]+charset", t, re.I):
        t = t[:hm.end()] + '<meta charset="utf-8">' + t[hm.end():]
        fixed("إضافة meta charset")

    if t != orig:
        path.write_text(t, encoding="utf-8")


# ───────────── فحص أنماط مريبة (إرشادي؛ لا يمنع النشر لكنه يوقف النشر المباشر) ─────────────
SUSPICIOUS_HIGH = [
    (r"coinhive|coin-hive|cryptonight|cryptoloot|webminer|minero\.cc|jsecoin|stratum\+tcp|authedmine", "تعدين عملات (miner)"),
    (r"eval\s*\(\s*(?:window\.)?atob\s*\(", "تنفيذ كود مشفّر بـ eval(atob(...))"),
    (r"new\s+Function\s*\(\s*(?:window\.)?atob\s*\(", "تنفيذ كود مشفّر بـ Function(atob(...))"),
    (r"document\.write\s*\(\s*unescape\s*\(", "document.write(unescape(...)) — إخفاء كود"),
    (r"(?:window\.)?top\.location(?:\.href)?\s*=\s*[\"']https?://", "إعادة توجيه الصفحة الأم لموقع خارجي"),
]
SUSPICIOUS_MEDIUM = [
    (r"navigator\.sendBeacon\s*\(", "إرسال بيانات خلفياً (sendBeacon)"),
    (r"navigator\.mediaDevices\.getUserMedia|navigator\.getUserMedia", "طلب كاميرا/ميكروفون"),
    (r"navigator\.geolocation", "طلب الموقع الجغرافي"),
    (r"Notification\.requestPermission", "طلب إذن الإشعارات"),
    (r"navigator\.clipboard\.readText", "قراءة الحافظة"),
    (r"new\s+WebSocket\s*\(\s*[\"']wss?://(?!localhost|127\.0\.0\.1)", "اتصال WebSocket بخادم خارجي"),
    (r"(?:window\.)?location(?:\.href)?\s*=\s*[\"']https?://(?!localhost|127\.0\.0\.1)", "إعادة توجيه لموقع خارجي"),
    (r"createElement\s*\(\s*[\"']script[\"']\s*\)[^;]{0,200}\.src\s*=\s*[\"']https?://", "تحميل سكربت خارجي ديناميكياً"),
]


def scan_suspicious(site: Path):
    """يبحث في ملفات JS/HTML عن أنماط معروفة بالإساءة. نتيجة: {'high': [...], 'medium': [...]} (وصف + اسم ملف)."""
    res = {"high": [], "medium": []}
    seen = set()
    comp = [(re.compile(p, re.I), d, "high") for p, d in SUSPICIOUS_HIGH] + \
           [(re.compile(p, re.I), d, "medium") for p, d in SUSPICIOUS_MEDIUM]
    for dp, _, fns in os.walk(site):
        for fn in fns:
            fp = Path(dp) / fn
            if fp.suffix.lower() not in (".js", ".mjs", ".html", ".htm"):
                continue
            try:
                if fp.stat().st_size > 12 * 1024 * 1024:
                    continue
                txt = fp.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            rel = str(fp.relative_to(site)).replace(os.sep, "/")
            for rx, desc, level in comp:
                if (desc, level) in seen:
                    continue
                if rx.search(txt):
                    seen.add((desc, level))
                    res[level].append(f"{desc} ({rel})")
    return res


def sanitize(site: Path):
    removed, rewritten, tracker_hits, ext_hosts = [], [], set(), set()
    files = 0
    total = 0
    big = []
    for dp, dns, fns in os.walk(site):
        for fn in fns:
            p = Path(dp) / fn
            files += 1
            sz = p.stat().st_size
            total += sz
            if sz > MAX_FILE:
                big.append(f"{p.relative_to(site)} ({sz // 1048576}MB)")
            ext = p.suffix.lower()
            if ext in (".html", ".htm"):
                depth = len(p.relative_to(site).parts) - 1
                process_html(p, depth, removed, rewritten)
            if ext in TEXT_EXT and sz <= 6 * 1024 * 1024:
                txt = p.read_text(encoding="utf-8", errors="ignore").lower()
                for tr in TRACKERS:
                    if tr in txt:
                        tracker_hits.add(f"{tr} في {p.relative_to(site)}")
                for h in re.findall(r"https?://([a-z0-9.-]+)", txt):
                    if h not in SAFE_CDNS and "." in h:
                        ext_hosts.add(h)
    return {
        "files": files, "total": total, "big_files": big,
        "removed": removed, "rewritten": rewritten,
        "tracker_hits": sorted(tracker_hits)[:20],
        "external_hosts": sorted(ext_hosts)[:30],
    }


# ───────────── الغلاف ─────────────
COVER_RE = re.compile(r"(cover|thumb|thumbnail|banner|preview|splash|og[-_]?image|icon|logo)", re.I)


def pick_cover(site: Path, src: Path):
    cands = []
    for base in (site, src):
        for dp, dns, fns in os.walk(base):
            dns[:] = [d for d in dns if d not in EXCLUDE_DIRS]
            for fn in fns:
                if fn.lower().endswith((".png", ".jpg", ".jpeg", ".webp")) and COVER_RE.search(fn):
                    p = Path(dp) / fn
                    sz = p.stat().st_size
                    if 8_000 <= sz <= 2_500_000:
                        score = sz + (10_000_000 if "cover" in fn.lower() or "thumb" in fn.lower() else 0)
                        cands.append((score, p))
        if cands:
            break
    if not cands:
        return None
    cands.sort(reverse=True)
    return cands[0][1]


# ───────────── اختبار بمتصفح آلي ─────────────
EXPLORE_KEYS = ["Space", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
                "KeyW", "KeyA", "KeyS", "KeyD", "KeyZ", "KeyX", "Escape"]


def _explore(page, w=412, h=915, seconds=45):
    """لاعب آلي عشوائي (monkey test): يلمس ويسحب ويضغط مفاتيح، ويسرّع الزمن الافتراضي للصفحة
    بـ clock.run_for (مؤقتات وrequestAnimationFrame تُنفَّذ فوراً) ليغطي وقتاً لعبياً أطول بكثير من الوقت الحقيقي.
    البذرة ثابتة كي تتشابه جولات المقارنة. لا يستطيع إنهاء مراحل بذكاء؛ هو يوسّع التغطية فقط."""
    import random
    import time
    rnd = random.Random(7)
    t0 = time.time()
    has_clock = hasattr(page, "clock")
    if has_clock:
        try:
            page.clock.install()
        except Exception:
            has_clock = False
    virtual_ms = 0
    try:
        while time.time() - t0 < seconds:
            r = rnd.random()
            if r < 0.45:
                page.touchscreen.tap(rnd.randint(10, w - 10), rnd.randint(10, h - 10))
            elif r < 0.70:
                page.keyboard.press(rnd.choice(EXPLORE_KEYS))
            else:
                x1, y1 = rnd.randint(30, w - 30), rnd.randint(60, h - 60)
                x2, y2 = rnd.randint(30, w - 30), rnd.randint(60, h - 60)
                page.mouse.move(x1, y1)
                page.mouse.down()
                page.mouse.move(x2, y2, steps=6)
                page.mouse.up()
            step = rnd.randint(800, 2500)
            if has_clock:
                try:
                    page.clock.run_for(step)  # يشغّل step ملّي ثانية افتراضية دفعة واحدة
                    virtual_ms += step
                except Exception:
                    has_clock = False
            page.wait_for_timeout(250 if has_clock else step)
    except Exception:
        pass
    return virtual_ms


def browser_test(site: Path, work: Path, shot: Path, explore=False, seconds=45):
    COUNT["browser_tests"] += 1
    log(f"🌐 اختبار متصفح رقم {COUNT['browser_tests']} (المرحلة: {_STAGE['name']})")
    res = {"ran": False, "console_errors": [], "failed_requests": [], "status_ok": False,
           "blank": False, "external_requests": [], "missing": [], "used": []}
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        return res
    import http.server
    import functools

    serve = work / "serve"
    if serve.exists():
        shutil.rmtree(serve)
    serve.mkdir(parents=True)
    os.symlink(site.resolve(), serve / "game")

    class H(http.server.SimpleHTTPRequestHandler):
        extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                          ".wasm": "application/wasm", ".js": "text/javascript",
                          ".mjs": "text/javascript", ".json": "application/json"}

        def log_message(self, *a):
            pass

    handler = functools.partial(H, directory=str(serve))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch(args=["--no-sandbox"])
            ctx = b.new_context(viewport={"width": 412, "height": 915}, device_scale_factor=2,
                                is_mobile=True, has_touch=True)
            page = ctx.new_page()
            page.on("console", lambda m: res["console_errors"].append(m.text[:200]) if m.type == "error" else None)
            page.on("pageerror", lambda e: res["console_errors"].append(("JS: " + str(e))[:200]))
            page.on("requestfailed", lambda r: res["failed_requests"].append(r.url[:150]))
            used = set()

            def on_req(r):
                u = r.url
                if u.startswith(f"http://127.0.0.1:{port}/game/"):
                    used.add(unquote(urlparse(u).path[len("/game/"):]))

            page.on("request", on_req)

            def on_resp(r):
                u = r.url
                if r.status >= 400:
                    res["failed_requests"].append(f"{r.status} {u[:140]}")
                    if r.status == 404 and u.startswith(f"http://127.0.0.1:{port}/game/"):
                        res["missing"].append(urlparse(u).path[len("/game/"):])
                if not u.startswith(f"http://127.0.0.1:{port}"):
                    res["external_requests"].append(u.split("/")[2] if "//" in u else u)

            page.on("response", on_resp)
            resp = page.goto(f"http://127.0.0.1:{port}/game/index.html", wait_until="load", timeout=45000)
            res["status_ok"] = bool(resp and resp.status == 200)
            page.wait_for_timeout(6000)
            try:
                page.screenshot(path=str(shot.with_name("_title.png")))  # لقطة الشاشة الأولى (احتياطي للغلاف)
            except Exception:
                pass
            if explore:
                res["virtual_ms"] = _explore(page, 412, 915, seconds)
            info = page.evaluate(
                "() => ({n: document.querySelectorAll('canvas,svg,img,video,iframe,button').length,"
                " t: (document.body ? document.body.innerText : '').trim().length})")
            res["blank"] = info["n"] == 0 and info["t"] < 5
            page.screenshot(path=str(shot))
            res["used"] = sorted(used)
            b.close()
        res["ran"] = True
    except Exception as e:
        res["console_errors"].append(f"فشل الاختبار الآلي: {str(e)[:200]}")
    finally:
        srv.shutdown()
    res["external_requests"] = sorted(set(res["external_requests"]))[:20]
    res["console_errors"] = res["console_errors"][:12]
    res["failed_requests"] = res["failed_requests"][:12]
    res["missing"] = list(dict.fromkeys(res["missing"]))[:400]
    res["used"] = res["used"][:5000]
    return res


# ───────────── إصلاح حالة الأحرف (Linux حساس لها، ويندوز لا) ─────────────
def fix_case(site: Path, missing):
    """ملف مطلوب باسم 'Assets/Hero.PNG' وموجود فعلاً باسم 'assets/hero.png': ننسخه بالاسم المطلوب.
    لا نلمس أي كود؛ نضيف نسخة فقط."""
    index = {}
    for dp, dns, fns in os.walk(site):
        for fn in fns:
            rel = str((Path(dp) / fn).relative_to(site)).replace(os.sep, "/")
            index.setdefault(rel.lower(), rel)
    n = 0
    root = site.resolve()
    for m in missing:
        m = unquote(m).lstrip("/")
        if not m or ".." in m.split("/"):
            continue
        real = index.get(m.lower())
        if not real or real == m:
            continue
        dest = site / m
        try:
            dest.resolve().relative_to(root)
        except ValueError:
            continue
        if not dest.exists():
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(site / real, dest)
            n += 1
        if n >= 300:
            break
    return n


# ───────────── فحص JavaScript بـ ESLint (تقرير فقط، لا يعدّل الكود) ─────────────
VENDOR_RE = re.compile(
    r"(\.min\.|jquery|phaser|three|pixi|howler|lodash|bootstrap|react|vue|angular|babylon|createjs|easeljs|"
    r"tweenjs|soundjs|preloadjs|box2d|matter|cannon|gsap|zepto|underscore|backbone|moment|konva|fabric|kaboom|"
    r"excalibur|melon|crafty|enchant|cocos|emscripten|unity|godot)", re.I)
LINT_RULES = {
    "no-dupe-keys": "error", "no-func-assign": "error", "no-dupe-args": "error",
    "no-const-assign": "error", "no-import-assign": "error", "valid-typeof": "error",
    "use-isnan": "error", "no-unsafe-negation": "error", "no-dupe-else-if": "error",
    "no-unreachable": "warn", "no-self-assign": "warn",
}


def lint_js(site: Path, work: Path):
    res = {"ran": False, "checked": 0, "skipped": 0, "errors": 0, "warnings": 0, "samples": []}
    scripts, modules = [], []
    for dp, dns, fns in os.walk(site):
        for fn in fns:
            if not fn.lower().endswith((".js", ".mjs")):
                continue
            p = Path(dp) / fn
            rel = str(p.relative_to(site)).replace(os.sep, "/")
            sz = p.stat().st_size
            if sz > 400 * 1024 or sz < 20 or VENDOR_RE.search(fn):
                res["skipped"] += 1
                continue
            txt = p.read_text(encoding="utf-8", errors="ignore")
            if sz / (txt.count("\n") + 1) > 200:  # سطور طويلة جداً = مصغّر
                res["skipped"] += 1
                continue
            is_mod = fn.lower().endswith(".mjs") or re.search(r"(?m)^\s*(import\s[^(]|export\s)", txt)
            (modules if is_mod else scripts).append(rel)
    res["checked"] = len(scripts) + len(modules)
    if not res["checked"]:
        return res
    lint_dir = work / "lint"
    lint_dir.mkdir(parents=True, exist_ok=True)
    try:
        run(["npm", "install", "--prefix", str(lint_dir), "eslint@9", "--no-audit", "--no-fund"], timeout=300)
    except Exception as e:
        res["error"] = f"تعذّر تثبيت ESLint: {str(e)[:80]}"
        return res
    eslint = lint_dir / "node_modules" / "eslint" / "bin" / "eslint.js"
    rules = json.dumps(LINT_RULES)
    for kind, files in (("script", scripts), ("module", modules)):
        if not files:
            continue
        cfg = lint_dir / f"cfg_{kind}.mjs"
        cfg.write_text(
            'export default [{files:["**/*.js","**/*.mjs"],'
            f'languageOptions:{{ecmaVersion:"latest",sourceType:"{kind}"}},rules:{rules}}}];\n',
            encoding="utf-8")
        for i in range(0, len(files), 80):
            chunk = files[i:i + 80]
            try:
                r = subprocess.run(["node", str(eslint), "-c", str(cfg), "-f", "json", "--no-warn-ignored", *chunk],
                                   cwd=site, capture_output=True, text=True, timeout=300)
                data = json.loads(r.stdout or "[]")
            except Exception:
                continue
            res["ran"] = True
            for f in data:
                for m in f.get("messages", []):
                    if m.get("severity") == 2:
                        res["errors"] += 1
                        if len(res["samples"]) < 8:
                            rel = os.path.relpath(f.get("filePath", ""), site)
                            res["samples"].append(f"{rel}:{m.get('line', '?')} {str(m.get('message', ''))[:80]}")
                    else:
                        res["warnings"] += 1
    return res


# ───────────── تقليل الملفات (حذف ما لا تحتاجه اللعبة، مع تحقق بالتجربة) ─────────────
PRUNE_EXTS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".svg",              # صور
    ".mp3", ".ogg", ".wav", ".m4a", ".aac", ".flac", ".mp4", ".webm", ".mov", ".avi",  # صوت/فيديو
    ".ttf", ".otf", ".woff", ".woff2", ".eot",                                      # خطوط
    ".psd", ".xcf", ".blend", ".ai", ".kra", ".sketch", ".fig", ".aseprite",        # أعمال الفنان
    ".zip", ".rar", ".7z", ".tar", ".gz", ".pdf", ".md",                           # أرشيف/توثيق
}
CORPUS_EXTS = {".html", ".htm", ".js", ".mjs", ".css", ".json", ".xml", ".svg", ".atlas", ".fnt", ".tmx",
               ".tsx", ".plist", ".yml", ".yaml", ".csv", ".webmanifest", ".manifest", ".txt"}
JUNK_NAMES = re.compile(
    r"^(package(-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|tsconfig.*\.json|\.eslintrc.*|\.prettierrc.*|"
    r"\.editorconfig|\.gitignore|\.gitattributes|\.npmrc|\.babelrc|webpack\.config\..*|rollup\.config\..*|"
    r"vite\.config\..*|gulpfile\..*|gruntfile\..*|makefile|dockerfile|\.travis\.yml|appveyor\.yml|"
    r"changelog.*|contributing.*|code_of_conduct.*)$", re.I)
JUNK_DIRS = {"test", "tests", "__tests__", "spec", "screenshots", "screenshot", "promo", "marketing", ".idea", ".vscode"}
KEEP_RE = re.compile(r"^(licen[sc]e|copying|notice|source\.txt|_cover\.)", re.I)


def _rel(site, p):
    return str(p.relative_to(site)).replace(os.sep, "/")


def build_tokens(site: Path, skip: set):
    toks = set()
    for dp, dns, fns in os.walk(site):
        for fn in fns:
            p = Path(dp) / fn
            if p.suffix.lower() not in CORPUS_EXTS or _rel(site, p) in skip:
                continue
            try:
                if p.stat().st_size > 8 * 1024 * 1024:
                    continue
                txt = p.read_text(encoding="utf-8", errors="ignore").lower()
            except OSError:
                continue
            toks.update(re.findall(r"[a-z0-9_\-\.]{3,}", txt))
    return toks


def find_prune_candidates(site: Path, used: set, mode: str):
    """يرجع قائمة مسارات نرى أنها غير لازمة، ويُتحقَّق منها بعدها بالتجربة."""
    files = []
    for dp, dns, fns in os.walk(site):
        for fn in fns:
            files.append(Path(dp) / fn)
    rels = [_rel(site, f) for f in files]
    used_l = {u.lower() for u in used}

    def is_junk(rel):
        parts = rel.split("/")
        if KEEP_RE.match(parts[-1]) or rel.lower() == "index.html":
            return False
        if JUNK_NAMES.match(parts[-1]):
            return True
        if any(d.lower() in JUNK_DIRS for d in parts[:-1]):
            return True
        if Path(parts[-1]).suffix.lower() in {".psd", ".xcf", ".blend", ".ai", ".kra", ".sketch", ".fig", ".aseprite", ".md"}:
            return True
        return False

    junk = {r for r in rels if is_junk(r)}
    tokens = build_tokens(site, junk)

    def referenced(rel):
        name = rel.split("/")[-1].lower()
        stem = name.rsplit(".", 1)[0] if "." in name else name
        if rel.lower() in used_l or name in tokens:
            return True
        return len(stem) < 3 or stem in tokens

    cands = {r for r in junk if not referenced(r)}
    if mode != "smart":
        return sorted(cands)

    # ملفات الوسائط: نبحث عن غير المشار إليها وغير المطلوبة أثناء التجربة
    by_dir = {}
    for r in rels:
        by_dir.setdefault(os.path.dirname(r), []).append(r)

    explicit_dir = {d: any(referenced(f) for f in fl) for d, fl in by_dir.items()}

    def dir_dynamic(d):
        while d:
            name = d.split("/")[-1].lower()
            if d in by_dir and not explicit_dir[d] and (len(name) < 3 or name in tokens):
                return True
            d = os.path.dirname(d)
        return False

    fam = {}
    for r in rels:
        name = r.split("/")[-1].lower()
        stem, _, ext = name.rpartition(".")
        key = (os.path.dirname(r), re.sub(r"\d+", "#", stem), ext)
        fam.setdefault(key, []).append(r)

    def family_protected(r):
        name = r.split("/")[-1].lower()
        stem, _, ext = name.rpartition(".")
        key = (os.path.dirname(r), re.sub(r"\d+", "#", stem), ext)
        members = fam[key]
        if any(referenced(m) for m in members):
            return True
        prefix = re.split(r"\d", stem, maxsplit=1)[0]
        return len(members) > 1 and (len(prefix) < 3 or prefix in tokens)

    for r in rels:
        name = r.split("/")[-1]
        if KEEP_RE.match(name) or Path(name).suffix.lower() not in PRUNE_EXTS or r in cands:
            continue
        if referenced(r) or dir_dynamic(os.path.dirname(r)) or family_protected(r):
            continue
        cands.add(r)
    return sorted(cands)


def prune_site(site: Path, work: Path, shot: Path, base: dict, mode: str):
    """يحجر الملفات المرشّحة، يعيد الاختبار، ويستعيد ما تبيّن أن اللعبة تطلبه.
    إن ساء الاختبار بشكل عام يتراجع عن كل شيء."""
    result = {"mode": mode, "removed": [], "restored": 0, "rolled_back": False, "bytes": 0}
    cands = find_prune_candidates(site, set(base.get("used", [])), mode)
    if not cands:
        return result
    quarantine = work / "quarantine"
    if quarantine.exists():
        shutil.rmtree(quarantine)
    quarantine.mkdir(parents=True)
    moved = {}
    for r in cands:
        src = site / r
        if not src.is_file():
            continue
        dst = quarantine / r
        dst.parent.mkdir(parents=True, exist_ok=True)
        moved[r] = src.stat().st_size
        shutil.move(str(src), str(dst))

    def restore(rel):
        if rel in moved:
            (site / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(quarantine / rel), str(site / rel))
            del moved[rel]
            return True
        return False

    base_missing = {m.lower() for m in base.get("missing", [])}
    base_errs = len(base.get("console_errors", []))
    for _ in range(4):
        t2 = browser_test(site, work, shot, explore=True, seconds=40)
        if not t2["ran"] or not t2["status_ok"] or t2["blank"] or len(t2["console_errors"]) > base_errs + 2:
            for r in list(moved):
                restore(r)
            result["rolled_back"] = True
            break
        lower_map = {m.lower(): m for m in moved}
        need = [lower_map[m.lower()] for m in t2["missing"] if m.lower() in lower_map and m.lower() not in base_missing]
        if not need:
            break
        for r in need:
            if restore(r):
                result["restored"] += 1
    else:
        # لم نستقر بعد 4 جولات: تراجع كامل للأمان
        for r in list(moved):
            restore(r)
        result["rolled_back"] = True

    result["removed"] = sorted(moved.items(), key=lambda kv: -kv[1])
    result["bytes"] = sum(moved.values())
    shutil.rmtree(quarantine, ignore_errors=True)
    return result


# ───────────── الرئيسي ─────────────
# ---------- أصل الوسائط (صور/أصوات): إشارات فقط، لا حكم قانوني ----------
_PROV_KW = re.compile(
    r"(credit|attribution|freesound|kenney|opengameart|pixabay|itch\.io|cc[- ]?by|cc0|creative commons|"
    r"public domain|royalt|ai[- ]generated|generated (?:by|with|using) (?:ai|an? ai|midjourney|dall-?e|stable diffusion|chatgpt|gpt)|"
    r"midjourney|dall-?e|stable diffusion|chatgpt|"
    r"(?:sprites?|sounds?|music|audio|sfx|fonts?) (?:from|by|authored|made|created|released|courtesy)|"
    r"(?:pngs?|images?|art|asset pack)[^.]{0,40}(?:released under|licensed)|"
    r"authored separately|©)", re.I)
_PROV_MEDIA = re.compile(r"(image|sprite|sound|audio|music|sfx|asset|art\b|artwork|icon|font|texture|tileset|graphic)", re.I)
_PROV_SOURCE = re.compile(
    r"(freesound|kenney|opengameart|pixabay|itch\.io|cc[- ]?by|cc0|creative commons|public domain|"
    r"licensed under|courtesy|credit|attribution)", re.I)
_BOILER = ("permission is hereby", "the above copyright", "copyright (c)", "the software is provided",
           "authors or copyright holders", "in no event shall", "furnished to do so", "copies or substantial")
_PROV_BAD = re.compile(
    r"(non[- ]?commercial|all rights reserved|no commercial|personal use only|not for commercial|"
    r"do not (?:redistribute|reuse))", re.I)
_PROV_BRANDS = re.compile(
    r"(?<![a-z])(mario|pokemon|pok\u00e9mon|nintendo|zelda|sonic|disney|marvel|minecraft|lego|pixar|ghibli|"
    r"star[ _-]?wars|harry[ _-]?potter|angry[ _-]?birds|fortnite|roblox)(?![a-z])", re.I)
_FONT_EXT = {".ttf", ".otf", ".woff", ".woff2"}
_AUDIO_EXT = {".ogg", ".mp3", ".wav", ".m4a", ".flac", ".opus"}
_IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}


_SERVER_DEPS = {"express", "koa", "fastify", "hapi", "@hapi/hapi", "socket.io", "colyseus", "@colyseus/core", "ws",
                "knex", "mysql", "mysql2", "pg", "mongodb", "mongoose", "sequelize", "typeorm", "prisma", "@prisma/client",
                "@mikro-orm/core", "nestjs", "@nestjs/core"}


def server_side_hints(src: Path):
    """علامات أن المشروع يحتاج خادماً/قاعدة بيانات (لا يعمل كموقع ثابت)."""
    hints = []
    pj = src / "package.json"
    if pj.is_file():
        try:
            data = json.loads(pj.read_text("utf-8", errors="ignore"))
            deps = {**(data.get("dependencies") or {}), **(data.get("devDependencies") or {})}
            found = sorted(d for d in deps if d in _SERVER_DEPS)
            if found:
                hints.append("اعتمادات خادم: " + "، ".join(found[:5]))
        except Exception:
            pass
    for n in ("Dockerfile", "docker-compose.yml", "docker-compose.yaml", ".env.example", "server.js", "server"):
        if (src / n).exists():
            hints.append(n)
    return hints


_NOISE_VAL = re.compile(r"^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{16,}|[\W\d_]+)$", re.I)


def _meaningful_meta(v):
    v = str(v).strip()
    return len(v) >= 3 and not _NOISE_VAL.match(v) and bool(re.search(r"[A-Za-z\u0600-\u06FF]{3,}", v))


def scan_provenance(src: Path):
    """يجمع كل ما يُعرف آلياً عن مصدر الصور والأصوات. النتيجة إشارات للمراجعة وليست ضماناً."""
    skip = {".git", "node_modules", "dist", "build", ".github"}
    docs, media_audio, media_img, brands, fonts, prompts = [], [], [], [], [], []
    for f in src.rglob("*"):
        if not f.is_file() or any(x in skip for x in f.relative_to(src).parts):
            continue
        ext = f.suffix.lower()
        rel = f.relative_to(src)
        if ext in _AUDIO_EXT:
            media_audio.append(f)
        elif ext in _IMG_EXT:
            media_img.append(f)
        elif ext in _FONT_EXT:
            fonts.append(str(rel))
        if "prompt" in f.stem.lower() and ext in (".md", ".txt"):
            prompts.append(str(rel))
        if _PROV_BRANDS.search(f.stem):
            brands.append(str(rel))
        name = f.name.lower()
        if len(rel.parts) <= 2 and ext in ("", ".md", ".txt", ".rst") and name.startswith(
            ("readme", "license", "licence", "credit", "attribution", "notice", "assets", "copying", "authors")
        ) and f.stat().st_size < 300_000:
            docs.append(f)
    claims, bad = [], []
    for d in docs[:40]:
        try:
            lines = d.read_text("utf-8", errors="ignore").splitlines()
        except Exception:
            continue
        for ln in lines:
            t = ln.strip().lstrip("#>*-| ").strip()
            if not t or len(t) < 8:
                continue
            if _PROV_BAD.search(t):
                bad.append(f"{d.name}: {t[:160]}")
            elif (_PROV_KW.search(t) and (_PROV_MEDIA.search(t) or _PROV_SOURCE.search(t))
                  and not any(b in t.lower() for b in _BOILER)):
                claims.append(f"{d.name}: {t[:140]}")
    authors, tagged_audio, tagged_img = set(), 0, 0
    for f in media_audio[:80]:
        try:
            r = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format_tags", "-of", "json", str(f)],
                               capture_output=True, text=True, timeout=20)
            tags = (json.loads(r.stdout or "{}").get("format") or {}).get("tags") or {}
            tags = {k.lower(): v for k, v in tags.items()}
            useful = {k: v for k, v in tags.items() if k in ("artist", "author", "copyright", "comment", "title",
                                                              "album", "publisher", "composer", "license", "url")}
            if useful:
                tagged_audio += 1
                for k in ("artist", "author", "copyright", "composer", "publisher", "license", "url"):
                    if useful.get(k) and _meaningful_meta(useful[k]):
                        authors.add(f"{k}={str(useful[k])[:80]}")
        except Exception:
            pass
    try:
        from PIL import Image
        for f in media_img[:300]:
            try:
                im = Image.open(f)
                ex = im.getexif()
                vals = [ex.get(315), ex.get(33432)] + [im.info.get(k) for k in ("Author", "Copyright", "Source")]
                vals = [str(v)[:80] for v in vals if v and not isinstance(v, bytes) and _meaningful_meta(v)]
                if vals:
                    tagged_img += 1
                    authors.update(vals)
            except Exception:
                pass
    except Exception:
        pass
    return {
        "images": len(media_img), "audio": len(media_audio), "fonts": fonts[:6], "prompt_files": prompts[:3],
        "claims": claims[:6], "restrictive": bad[:6], "brand_names": brands[:8],
        "tagged_audio": tagged_audio, "tagged_images": tagged_img, "authors": sorted(authors)[:10],
    }


def provenance_lines(pv):
    """(ملاحظات، تحذيرات) بالعربية من نتيجة scan_provenance."""
    notes, warns = [], []
    notes.append(f"الوسائط: {pv['images']} صورة و{pv['audio']} صوتاً")
    for c in pv["claims"]:
        notes.append(f"تصريح المطوّر عن الوسائط: {c}")
    if pv.get("prompt_files"):
        notes.append("وجود ملف prompt (" + "، ".join(pv["prompt_files"]) + "): الصور أو الكود على الأرجح مولَّدة بالذكاء الاصطناعي")
    if pv.get("fonts"):
        warns.append(f"خطوط مضمّنة ({len(pv['fonts'])}): تأكد من ترخيصها، مثل " + "، ".join(pv["fonts"][:3]))
    if pv["authors"]:
        notes.append("بيانات داخل الملفات: " + "؛ ".join(pv["authors"]))
    for b in pv["restrictive"]:
        warns.append(f"شرط تقييد محتمل في الوثائق: {b}")
    if pv["brand_names"]:
        warns.append("أسماء ملفات تشبه علامات تجارية معروفة: " + "، ".join(pv["brand_names"]))
    if pv["audio"] and not pv["tagged_audio"] and not any(_PROV_SOURCE.search(c) for c in pv["claims"]):
        warns.append(f"مصدر الأصوات (العدد: {pv["audio"]}) غير موثّق في اللعبة؛ ستُنشر وتُعالَج بلاغات أصحاب الحقوق")
    if pv["images"] and not pv["tagged_images"] and not any(_PROV_SOURCE.search(c) for c in pv["claims"]):
        warns.append("مصدر الصور غير موثّق في اللعبة؛ ستُنشر وتُعالَج بلاغات أصحاب الحقوق")
    sourced = any(_PROV_SOURCE.search(c) for c in pv["claims"]) or bool(pv["tagged_audio"] or pv["tagged_images"])
    pv["documented"] = bool(sourced)
    if sourced:
        pv["summary_ar"] = "مصدر الوسائط مذكور من المطوّر: " + " | ".join(pv["claims"][:2] + pv["authors"][:2])
    elif pv["claims"] or pv.get("prompt_files"):
        pv["summary_ar"] = "المطوّر يصرّح بأصل جزئي للوسائط (غير مفصّل): " + " | ".join(pv["claims"][:2])
    else:
        pv["summary_ar"] = "مصدر الوسائط غير موثّق من المطوّر"
    return notes, warns


_GAME_MARKERS = re.compile(r"(<canvas|getContext\(|requestAnimationFrame|phaser|pixi|three(?:\.module)?\.js|babylon|kaboom|"
                           r"createjs|melonjs|excalibur|playcanvas|\bgame\b)", re.I)


def unbuilt_template(webroot: Path, src: Path):
    """موقع Jekyll/قالب غير مبني (وسوم Liquid أو front matter): ليس نسخة جاهزة للعرض."""
    why = []
    idx = webroot / "index.html"
    try:
        head = idx.read_text("utf-8", errors="ignore")[:20000]
    except Exception:
        head = ""
    if head.lstrip().startswith("---"):
        why.append("index.html يبدأ بـ front matter (---)")
    if re.search(r"\{\{\s*(site|page|content)\b|\{%\s*(include|for|if|assign)\b", head):
        why.append("index.html فيه وسوم Liquid ({{ }} أو {% %})")
    if (src / "_config.yml").is_file() and ((src / "_layouts").is_dir() or (src / "_includes").is_dir()):
        why.append("مجلدات Jekyll (_layouts/_includes مع _config.yml)")
    return why


def game_signals(site: Path, limit=4_000_000):
    """هل توجد مؤشرات أن الموقع لعبة؟ (canvas/requestAnimationFrame/مكتبة ألعاب…). للتحذير فقط."""
    seen = 0
    for f in site.rglob("*"):
        if f.suffix.lower() not in (".html", ".js", ".mjs") or not f.is_file():
            continue
        try:
            t = f.read_text("utf-8", errors="ignore")
        except Exception:
            continue
        seen += len(t)
        if _GAME_MARKERS.search(t):
            return True
        if seen > limit:
            break
    return False


_BACKEND_MARKERS = [
    (re.compile(r"NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|[a-z0-9-]+\.supabase\.co"), "Supabase (حسابات/بيانات)"),
    (re.compile(r"NEXT_PUBLIC_ROOMS_URL|NEXT_PUBLIC_API_URL|NEXT_PUBLIC_SERVER_URL|VITE_API_URL|VITE_SERVER_URL"), "رابط خادم يُضبط وقت البناء"),
    (re.compile(r"[a-z0-9-]+\.firebaseio\.com|firebaseapp\.com|[a-z0-9-]+\.convex\.cloud|\.herokuapp\.com"), "خدمة سحابية (Firebase/Convex/Heroku)"),
    (re.compile(r"new WebSocket\(\s*[\"'`]wss?://(?!localhost|127\.0\.0\.1)"), "WebSocket إلى خادم خارجي"),
    (re.compile(r"NEXT_PUBLIC_STRIPE|pk_(?:live|test)_[A-Za-z0-9]{10,}"), "مدفوعات Stripe"),
]


def backend_signals(site: Path, limit=6_000_000):
    """علامات أن اللعبة تعتمد على خادم/حساب خارجي (قد تعلق على شاشة التحميل بلا إعدادات الخادم)."""
    found, seen = {}, 0
    for f in site.rglob("*"):
        if f.suffix.lower() not in (".js", ".mjs", ".html") or not f.is_file():
            continue
        try:
            t = f.read_text("utf-8", errors="ignore")
        except Exception:
            continue
        seen += len(t)
        for rx, label in _BACKEND_MARKERS:
            if label not in found and rx.search(t):
                found[label] = f.name
        if seen > limit:
            break
    return list(found)


def main():
    start_watchdog()
    repo_url = os.environ.get("INPUT_REPO_URL", "").strip()
    subdir = os.environ.get("INPUT_SUBDIR", "").strip().strip("/")
    build_cmd = os.environ.get("INPUT_BUILD_CMD", "").strip()
    orientation = os.environ.get("INPUT_ORIENTATION", "portrait").strip() or "portrait"
    tags = os.environ.get("INPUT_TAGS", "").strip()
    title_ar = os.environ.get("INPUT_TITLE_AR", "").strip()
    auto_publish = os.environ.get("INPUT_AUTO_PUBLISH", "no").strip().lower()
    prune_mode = os.environ.get("INPUT_PRUNE", "smart").strip().lower()
    if prune_mode not in ("smart", "junk", "off"):
        prune_mode = "smart"
    media_mode = os.environ.get("INPUT_MEDIA", "safe").strip().lower()
    if media_mode not in ("safe", "off"):
        media_mode = "safe"
    work = Path(os.environ.get("WORK_DIR", "work")).resolve()
    out = work / "out"
    if work.exists():
        shutil.rmtree(work)
    out.mkdir(parents=True)

    reasons, warnings, notes = [], [], []

    def finish(status):
        stop_watchdog()
        stage("")  # يغلق المرحلة الأخيرة
        report["timings"] = [{"stage": n, "seconds": t} for n, t in TIMINGS if n]
        report["commands"] = COUNT["commands"]
        report["browser_tests"] = COUNT["browser_tests"]
        notes.append("الأزمنة: " + "؛ ".join(f"{n}: {int(t)}ث" for n, t in TIMINGS if n and t >= 1)
                     + f" (أوامر: {COUNT['commands']}، اختبارات متصفح: {COUNT['browser_tests']})")
        report["status"] = status
        report["reasons"] = reasons
        report["warnings"] = warnings
        report["notes"] = notes
        (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        if status != "fail":
            # ملاحظات الاستيراد تُحفظ مع ملفات اللعبة (games/<slug>/_import_report.json) فيقرؤها تطبيق التحكم دائماً
            try:
                keep = {
                    "date": report.get("date"), "status": status,
                    "source": report.get("repo_url"), "commit": report.get("commit"), "license": report.get("license"),
                    "warnings": warnings, "notes": notes,
                    "console_errors": [str(x)[:300] for x in (report.get("console_errors") or [])[:8]],
                    "failed_requests": [str(x)[:300] for x in (report.get("failed_requests") or [])[:10]],
                    "external_requests": [str(x)[:300] for x in (report.get("external_requests") or [])[:10]],
                    "cover_candidates": report.get("cover_candidates", []),
                    "lint": {k: (report.get("lint") or {}).get(k) for k in ("ran", "checked", "errors")},
                    "fixes": report.get("fixes", {}),
                }
                (site / "_import_report.json").write_text(json.dumps(keep, ensure_ascii=False, indent=1), encoding="utf-8")
            except Exception as e:
                log("تعذّر حفظ ملاحظات الاستيراد:", e)
        write_summary(report)
        emit_annotations(report)
        if status == "fail":
            log("✗ فشل:", "; ".join(reasons))
            sys.exit(1)

    report = {"repo_url": repo_url, "date": datetime.now(timezone.utc).isoformat()}

    pr = parse_repo(repo_url)
    if not pr:
        reasons.append("الرابط ليس رابط مستودع لعبة (https://github.com/صاحب/مستودع) ولا صفحة github.io")
        finish("fail")
    owner, repo = pr
    report.update(owner=owner, repo=repo)

    stage("الرخصة")
    # 1) الرخصة
    try:
        info = api(f"/repos/{owner}/{repo}")
    except Exception as e:
        reasons.append(str(e))
        finish("fail")
    lic = info.get("license") or {}
    spdx = lic.get("spdx_id") if isinstance(lic, dict) else None
    report["license"] = spdx
    if info.get("private"):
        reasons.append("المستودع خاص")
    if not spdx:
        reasons.append("لا توجد رخصة في المستودع (كل الحقوق محفوظة)")
    elif spdx not in ALLOWED:
        reasons.append(f"الرخصة {spdx} غير مسموحة للاستيراد التلقائي")
    if reasons:
        finish("fail")
    notes.append("رخصة المستودع تخص الكود؛ أصل الصور والأصوات يُفحص بإشارات آلية أدناه")

    stage("جلب المستودع")
    # 2) الجلب
    src = work / "src"
    run(["git", "clone", "--depth", "1", f"https://github.com/{owner}/{repo}.git", str(src)], timeout=600)
    sha = run(["git", "rev-parse", "HEAD"], cwd=src).stdout.strip().splitlines()[-1]
    try:
        pv = scan_provenance(src)
        prov_notes, prov_warns = provenance_lines(pv)
        report["provenance"] = pv
    except Exception as e:
        pv = None
        prov_notes, prov_warns = [f"تعذّر فحص أصل الوسائط: {e}"], []
    report["commit"] = sha
    report["repo_size_kb"] = int(info.get("size") or 0)
    report["description"] = (info.get("description") or "").strip()
    report["topics"] = info.get("topics") or []
    pushed = (info.get("pushed_at") or "")[:4]
    report["year"] = pushed or str(datetime.now().year)
    report["owner_login"] = (info.get("owner") or {}).get("login", owner)

    stage("البحث/البناء")
    # 3) مجلد الويب
    try:
        webroot = build_if_needed(src, subdir, build_cmd, notes)
    except Exception as e:
        reasons.append(f"فشل البناء: {e}")
        finish("fail")
    if not webroot:
        webroot = try_pages_branch(owner, repo, work, notes)
    if not webroot:
        sh = server_side_hints(src)
        if sh:
            reasons.append("هذا مشروع يحتاج خادماً أو قاعدة بيانات (" + "؛ ".join(sh[:4]) + ") ولا يعمل كموقع ثابت، "
                           "فلا يمكن استضافته على Cloudflare Pages ولا تشغيله في التطبيق. هذه ليست مشكلة في الاستيراد.")
        else:
            reasons.append("لم أجد نسخة ويب (index.html) ولا أمر بناء. قد يكون مشروع Unity/Godot مصدرياً. "
                           "جرّب إدخال subdir أو build_cmd")
        finish("fail")
    rt = realtime_server(src)
    if rt:
        reasons.append("هذه لعبة جماعية تحتاج خادماً لحظياً (" + "، ".join(rt) + ") ولا تعمل كموقع ثابت، "
                       "فلا يمكن استضافتها على Cloudflare Pages ولا تشغيلها في التطبيق. هذه ليست مشكلة في الاستيراد.")
        finish("fail")
    sh_ok = server_side_hints(src)
    if sh_ok:
        warnings.append("المستودع يحوي ملفات خادم (" + "؛ ".join(sh_ok[:4]) + ") لكن الواجهة بُنيت كموقع ثابت. "
                        "قد تعمل اللعبة وحدها وقد تحتاج الخادم لميزات اختيارية؛ جرّبها بـ«تجربة اللعبة» قبل الاعتماد")
    tmpl = unbuilt_template(webroot, src)
    if tmpl:
        reasons.append("هذا موقع/قالب غير مبني (" + "؛ ".join(tmpl) + ") وليس لعبة جاهزة للتشغيل. "
                       "إن كان لعبة حقاً فاستعمل build_cmd أو subdir يشير إلى نسخة مبنية.")
        finish("fail")
    notes.extend(prov_notes)  # ملاحظات أصل الوسائط تظهر فقط للألعاب القابلة للاستيراد
    warnings.extend(prov_warns)

    stage("تنظيف")
    # 4) تنظيف
    site = out / "site"
    big_warn = None
    copy_site(webroot, site)
    s = sanitize(site)
    be = backend_signals(site)
    if be:
        warnings.append("تعتمد على خدمات خارجية (" + "، ".join(be) + "): على الأرجح لن تعمل كاملة داخل التطبيق "
                        "(قد تعلق على شاشة التحميل لأن إعدادات الخادم لم تُضبط وقت البناء). جرّبها قبل الاعتماد")
        report["backend_signals"] = be
    if not game_signals(site):
        warnings.append("لا توجد مؤشرات أن هذا الموقع لعبة (لا canvas ولا requestAnimationFrame ولا مكتبة ألعاب)؛ "
                        "راجعه جيداً قبل الاعتماد")
    report["stats"] = {k: s[k] for k in ("files", "total")}
    if s["files"] > MAX_FILES:
        reasons.append(f"عدد الملفات {s['files']} يتجاوز {MAX_FILES}")
    if s["total"] > MAX_TOTAL_FAIL:
        reasons.append(f"الحجم {s['total'] // 1048576}MB كبير جداً")
    elif s["total"] > MAX_TOTAL_WARN:
        big_warn = f"الحجم كبير قبل تحسين الوسائط: {s['total'] // 1048576}MB"
        warnings.append(big_warn)
    if s["big_files"]:
        reasons.append("ملفات تتجاوز 25MB (حد Cloudflare): " + ", ".join(s["big_files"][:5]))
    if s["removed"]:
        warnings.append(f"أُزيلت {len(s['removed'])} وسوم إعلانات/تتبّع من HTML")
    report["removed_tags"] = s["removed"][:20]
    if HTML_SKIPPED:
        warnings.append("ملفات HTML بترميز غير UTF-8 لم تُعدَّل: " + ", ".join(HTML_SKIPPED[:5]))
    if s["tracker_hits"]:
        warnings.append("إشارات لمواقع إعلانات/تتبّع داخل الكود لم تُزَل (راجعها): " + "؛ ".join(s["tracker_hits"][:6]))
    if s["external_hosts"]:
        warnings.append("روابط لمواقع خارجية: " + ", ".join(s["external_hosts"][:8]))
    sus = scan_suspicious(site)
    report["suspicious"] = sus
    if sus["high"]:
        warnings.append("⛔ أنماط مريبة جداً (راجع الكود قبل أي نشر): " + "؛ ".join(sus["high"][:5]))
    if sus["medium"]:
        notes.append("أنماط تستحق الانتباه: " + "؛ ".join(sus["medium"][:6]))
    if reasons:
        finish("fail")

    stage("عزل التخزين")
    # 4ب) عزل بيانات اللعبة (localStorage/IndexedDB/Cache) عن بقية الألعاب على نفس النطاق
    try:
        import isolate_storage
        n_iso = isolate_storage.inject(site, slugify(repo))
        if n_iso:
            fixed("عزل تخزين اللعبة", n_iso)
            notes.append(f"عُزل تخزين اللعبة عن باقي الألعاب (بادئة khayal:{slugify(repo)}:) في {n_iso} صفحة")
    except Exception as e:
        warnings.append(f"تعذّر عزل التخزين: {str(e)[:100]}")

    stage("ترخيص ومصدر")
    # 5) ترخيص + مصدر داخل مجلد اللعبة
    for fn in os.listdir(src):
        if re.match(r"(?i)^(licen[sc]e|copying|notice)", fn) and (src / fn).is_file():
            shutil.copy2(src / fn, site / fn)

    stage("اختبار المتصفح")
    # 6) اختبار
    shot = out / "_shot.png"
    t = browser_test(site, work, shot, explore=True, seconds=60)
    if t["ran"] and t["missing"]:
        n_alias = fix_case(site, t["missing"])
        if n_alias:
            fixed("نسخ ملفات بحالة الأحرف المطلوبة", n_alias)
            t = browser_test(site, work, shot, explore=True, seconds=60)
    report["test"] = {k: t[k] for k in ("ran", "status_ok", "blank")}
    if t.get("virtual_ms"):
        notes.append(f"لاعب آلي عشوائي: جُرّب نحو {t['virtual_ms'] // 1000} ثانية لعب افتراضية خلال 60 ثانية حقيقية")
    report["console_errors"] = t["console_errors"]
    report["failed_requests"] = t["failed_requests"]
    report["external_requests"] = t["external_requests"]
    if not t["ran"]:
        warnings.append("لم يعمل الاختبار الآلي (Playwright)")
    else:
        if not t["status_ok"]:
            reasons.append("index.html لا يُحمَّل (ليس 200)")
        if t["blank"]:
            reasons.append("الصفحة فارغة بعد 6 ثوانٍ")
        local_fail = [f for f in t["failed_requests"]
                      if re.match(r"^(4|5)\d\d ", f) and "favicon" not in f.lower()]
        if local_fail:
            warnings.append(f"{len(local_fail)} ملفات لم تُحمَّل (404 ونحوه): مثال: {local_fail[0][:100]}")
        if t["console_errors"]:
            warnings.append(f"{len(t['console_errors'])} أخطاء في الكونسول، أولها: {t['console_errors'][0][:100]}")
    if reasons:
        finish("fail")

    stage("الغلاف")
    # 6-0) نبحث عن الغلاف الآن (قبل تقليل الملفات وتحسين الوسائط) كي تبقى الأسماء والملفات الأصلية
    cover_pick = None
    try:
        import cover_finder
        cover_pick = cover_finder.choose(site, src, t.get("used", []), work,
                                         title_shot=shot.with_name("_title.png"), final_shot=shot,
                                         blank=bool(t.get("blank")))
        report["cover_candidates"] = cover_pick.get("top", [])
    except Exception as e:
        warnings.append(f"تعذّر البحث عن الغلاف: {str(e)[:120]}")

    stage("تقليل الملفات")
    # 6أ) تقليل الملفات
    files_before = sum(len(f) for _, _, f in os.walk(site))
    if spdx == "GPL-3.0" and prune_mode != "off":
        notes.append("رخصة GPL-3.0: لم تُحذف أي ملفات (يجب إتاحة المصدر كاملاً)")
        prune_mode = "off"
    if prune_mode != "off" and t["ran"]:
        pr = prune_site(site, work, shot, t, prune_mode)
        n_rm = len(pr["removed"])
        report["prune"] = {"mode": prune_mode, "removed": n_rm, "bytes": pr["bytes"],
                           "restored": pr["restored"], "rolled_back": pr["rolled_back"]}
        if pr["rolled_back"]:
            warnings.append("حذف الملفات سبّب أخطاء في الاختبار فتم التراجع عنه كاملاً (اللعبة بقيت كما هي)")
        elif n_rm:
            files_after = sum(len(f) for _, _, f in os.walk(site))
            notes.append(f"تقليل الملفات: حُذف {n_rm} ملفاً ({pr['bytes'] // 1024} KB)؛ من {files_before} إلى {files_after}"
                         + (f"؛ استُعيد {pr['restored']} ملفاً تبيّن أن اللعبة تطلبه" if pr["restored"] else ""))
            (out / "pruned.txt").write_text(
                "\n".join(f"{sz}\t{rel}" for rel, sz in pr["removed"]), encoding="utf-8")
            fixed("حذف ملفات غير لازمة", n_rm)
        else:
            notes.append("تقليل الملفات: لا ملفات يمكن حذفها بأمان")

    stage("تحسين الوسائط")
    # 6أ-2) تحسين الوسائط (صور/صوت/فيديو/خطوط)
    if media_mode != "off" and t["ran"]:
        if spdx == "GPL-3.0":
            notes.append("رخصة GPL-3.0: لم تُحسَّن الوسائط")
        else:
            try:
                import optimize_media
                size_before = sum(f.stat().st_size for f in site.rglob("*") if f.is_file())
                mo = optimize_media.optimize(
                    site, work, lambda: browser_test(site, work, shot, explore=True, seconds=40), t)
                size_after = sum(f.stat().st_size for f in site.rglob("*") if f.is_file())
                report["media"] = {"stages": mo["stages"], "before": size_before, "after": size_after}
                if mo["skipped_reason"]:
                    notes.append("تحسين الوسائط: " + mo["skipped_reason"])
                names = {"image": "صور", "audio": "صوت", "video": "فيديو", "font": "خطوط"}
                for st in mo["stages"]:
                    if st["rolled_back"]:
                        warnings.append(f"تحسين {names[st['kind']]} سبّب أخطاء في الاختبار فتم التراجع عنه")
                    elif st["converted"]:
                        notes.append(f"تحسين {names[st['kind']]}: {st['converted']} ملفاً، وفّر {st['saved'] // 1024} KB"
                                     + (f"؛ استُعيد {st['restored']} أصلياً تبيّن أن اللعبة تطلبه" if st["restored"] else ""))
                        fixed("تحسين وسائط " + names[st["kind"]], st["converted"])
                if big_warn and size_after <= MAX_TOTAL_WARN and big_warn in warnings:
                    warnings.remove(big_warn)  # لم يعد الحجم كبيراً بعد التحسين
                    notes.append(f"زال تحذير الحجم بعد تحسين الوسائط ({size_after // 1048576}MB)")
                if size_before > size_after:
                    notes.append(f"حجم اللعبة بعد تحسين الوسائط: {size_before // 1048576}MB ← {size_after // 1048576}MB "
                                 "(الاختبار الآلي لا يغطي كل المراحل؛ جرّب اللعبة بنفسك)")
            except Exception as e:
                warnings.append(f"تعذّر تحسين الوسائط: {str(e)[:120]}")

    stage("فحص JavaScript")
    # 6ب) فحص JavaScript (تقرير فقط)
    lint = lint_js(site, work)
    report["lint"] = lint
    if lint.get("error"):
        warnings.append(lint["error"])
    elif lint["errors"]:
        warnings.append(f"ESLint: {lint['errors']} أخطاء برمجية في {lint['checked']} ملفات، أولها: {lint['samples'][0]}")
    elif lint["ran"]:
        notes.append(f"ESLint: لا أخطاء في {lint['checked']} ملفات")
    if lint["skipped"]:
        notes.append(f"{lint['skipped']} ملفات JS مصغّرة أو من مكتبات معروفة لم تُفحص")

    # سجل التعديلات التلقائية
    for k, v in FIXES.items():
        notes.append(f"تعديل تلقائي: {k} × {v}")
    report["fixes"] = dict(FIXES)
    (site / "SOURCE.txt").write_text(
        f"Source: https://github.com/{owner}/{repo}\nCommit: {sha}\nLicense: {spdx}\n"
        f"Imported: {report['date']}\nAutomated changes (see report): {json.dumps(FIXES, ensure_ascii=False)}\n"
        + ("\nMedia provenance (automated signals, not a legal guarantee):\n"
           + "".join(f"- {x}\n" for x in (pv["claims"] + pv["authors"] + pv["restrictive"]))
           + f"- images: {pv['images']}, audio: {pv['audio']}, tagged audio: {pv['tagged_audio']}\n" if pv else ""),
        encoding="utf-8")

    stage("إخراج الغلاف")
    # 7) الغلاف: نجهّزه بمكتبة Pillow (تصغير دون قصّ، وخلفية مموّهة إن لم تناسب نسبة البطاقة)
    cover_name = ""
    if cover_pick and cover_pick.get("path"):
        try:
            import cover_finder
            cover_name = cover_finder.render(cover_pick["path"], site / "_cover")
            if cover_pick.get("fallback"):
                warnings.append(cover_pick["note"])
            else:
                notes.append(cover_pick["note"])
        except Exception as e:
            warnings.append(f"تعذّر تجهيز الغلاف: {str(e)[:120]}")
            ext = Path(cover_pick["path"]).suffix.lower() or ".png"
            cover_name = "_cover" + ext
            shutil.copy2(cover_pick["path"], site / cover_name)
    if not cover_name:
        warnings.append("لا توجد صورة غلاف ولا لقطة شاشة صالحة")

    slug = slugify(repo)
    meta = {
        "slug": slug, "title_en": pretty_title(repo), "title_ar": title_ar,
        "description": report["description"], "developer": report["owner_login"],
        "license": spdx, "source_url": f"https://github.com/{owner}/{repo}",
        "orientation": orientation if orientation in ("portrait", "landscape", "both") else "portrait",
        "tags": [x.strip() for x in re.split(r"[,،]", tags) if x.strip()] or report["topics"][:3],
        "year": report["year"], "repo_size_kb": report.get("repo_size_kb", 0), "cover_name": cover_name, "auto_publish": auto_publish,
        "suspicious_high": report.get("suspicious", {}).get("high", []),
    }
    (out / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    report["slug"] = slug
    finish("warn" if warnings else "ok")


def _esc(t):
    return t.replace("%", "%25").replace("\r", "").replace("\n", "%0A")


def emit_annotations(r):
    """ملاحظات GitHub (تظهر في تطبيق Game Control داخل تفاصيل التشغيل)."""
    notes = r.get("notes") or []
    warns = r.get("warnings") or []
    reasons_ = r.get("reasons") or []
    # نتيجة مُهيكلة يقرؤها تطبيق المتحكم ليلوّن الحكم (أحمر/أخضر/برتقالي) ويشرحه بالعربية
    try:
        res = {"status": r.get("status"), "repo": r.get("repo_url", ""), "slug": r.get("slug", ""),
               "license": r.get("license") or "", "warnings": len(warns), "reasons": len(reasons_)}
        print(f"::notice title=خيال-نتيجة::{_esc(json.dumps(res, ensure_ascii=False))}", flush=True)
    except Exception:
        pass
    if reasons_:
        body = _esc("\n".join("• " + x for x in reasons_))
        print(f"::error title=أسباب الفشل::{body}", flush=True)
    if notes:
        body = _esc("\n".join("• " + x for x in notes))
        print(f"::notice title=تقرير الاستيراد ({r.get('status')})::{body}", flush=True)
    if warns:
        body = _esc("\n".join("• " + x for x in warns))
        print(f"::warning title=تحذيرات الاستيراد::{body}", flush=True)


def write_summary(r):
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    lines = [f"## استيراد لعبة: {r.get('repo_url', '')}", f"**الحالة: {r.get('status')}**", ""]
    for k, title in (("reasons", "أسباب الفشل"), ("warnings", "تحذيرات"), ("notes", "ملاحظات")):
        if r.get(k):
            lines.append(f"### {title}")
            lines += [f"- {x}" for x in r[k]]
            lines.append("")
    txt = "\n".join(lines)
    log(txt)
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(txt + "\n")


if __name__ == "__main__":
    main()
