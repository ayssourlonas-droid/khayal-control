"""اكتشاف مجلد الموقع وبناؤه ونسخه (npm/pnpm/yarn، فرع gh-pages، كشف خوادم الزمن الحقيقي)."""
import json
import os
import re
import shutil
import time
from pathlib import Path

from common import EXCLUDE_DIRS, PREBUILT_DIRS, run

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


def _build_if_needed_raw(src: Path, override, build_cmd, notes):
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


# ───────────── كشف الصفحة الدعائية واختيار مجلد اللعبة ─────────────
# بعض المستودعات تنشر موقعاً ترويجياً (عن المطوّر وسجل المشروع وروابط) وفيه زر «Play» يفتح اللعبة في مجلد فرعي.
# هنا نكتشف ذلك ونجعل مجلد اللعبة هو الجذر، وكل قرار (أو تردّد) يُكتب في ملاحظات التقرير.
_ENGINE_RE = re.compile(
    r"phaser|pixi|three(\.min)?\.js|babylon|kaboom|kaplay|p5(\.min)?\.js|createjs|easeljs|konva|melonjs|"
    r"excalibur|playcanvas|cocos|godot|construct|crafty|gdevelop|littlejs|matter(\.min)?\.js|"
    r"\bimpact\b|box2d|planck|howler|babylonjs|aframe|a-frame")
_GAME_CODE_RE = re.compile(r"requestanimationframe|<canvas|getcontext\s*\(|new\s+audio\s*\(|keydown|touchstart")
_LANDING_WORDS = ("about", "timeline", "credits", "download", "github", "features", "roadmap", "contributing",
                  "documentation", "install", "open source", "follow me", "twitter", "my website", "star on",
                  "changelog", "get started")
_PLAY_TEXT_RE = re.compile(
    r"^\s*(play( now| online| game| demo| it)?|try( it| now| the game| demo)?|demo|live demo|launch( game)?|"
    r"start( playing| game)?|العب|ابدأ|العب الآن)\s*[!.»>→]*\s*$", re.I)
_PLAY_DIRS = ("play", "game", "app", "demo", "live", "playground", "web", "client", "www", "dist", "build", "public")
_NOT_GAME_DIRS = {"prototypes", "prototype", "proto", "docs", "doc", "examples", "example", "tests", "test", "timeline",
                  "history", "old", "archive", "images", "img", "assets", "static", "style", "styles", "css", "js",
                  "favicons", "screenshots", "blog", "node_modules", ".git", ".github"}
_SOFT_PARENT_REFS = re.compile(
    r"favicon|apple-touch|mstile|android-chrome|safari-pinned|manifest|browserconfig|og[_-]?image|\.ico$|robots\.txt|"
    r"sitemap|licen[sc]e|readme", re.I)


def _read_text(p: Path, limit=2_000_000):
    try:
        if p.stat().st_size > limit:
            return ""
        return p.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def _local_scripts(html: str, base: Path, max_files=6):
    out = []
    for m in re.finditer(r"<script\b[^>]*\bsrc=[\"']([^\"']+)[\"']", html, re.I):
        u = m.group(1).split("?")[0].split("#")[0]
        if re.match(r"^(https?:)?//|^data:", u, re.I):
            continue
        q = (base / u.lstrip("/")) if u.startswith("/") else (base / u)
        try:
            q = q.resolve()
        except OSError:
            continue
        if q.is_file() and len(out) < max_files:
            out.append(q)
    return out


def _game_signals(d: Path):
    """علامات أن هذا المجلد لعبة فعلية: canvas أو محرك ألعاب أو حلقة رسم/صوت. يرجع (درجة، أسباب)."""
    idx = d / "index.html"
    html = _read_text(idx)
    low = html.lower()
    score, why = 0, []
    if "<canvas" in low:
        score += 2
        why.append("وسم canvas")
    scripts = _local_scripts(html, d)
    names = " ".join(s.name.lower() for s in scripts) + " " + low
    em = _ENGINE_RE.search(names)
    if em:
        score += 2
        why.append(f"محرك/مكتبة ألعاب ({em.group(0)})")
    code_hit = bool(_GAME_CODE_RE.search(low))
    if not code_hit:
        for s in scripts:
            if _GAME_CODE_RE.search(_read_text(s, 600_000).lower()):
                code_hit = True
                break
    if code_hit:
        score += 1
        why.append("شيفرة لعب (رسم/صوت/لمس)")
    return score, why


def _landing_signals(root: Path):
    """علامات أن index.html في الجذر صفحة دعائية لا لعبة. يرجع (درجة، أسباب، روابط محلية مع نصوصها)."""
    html = _read_text(root / "index.html")
    low = html.lower()
    score, why = 0, []
    if len(re.findall(r"<section\b", low)) >= 2:
        score += 1
        why.append("عدة أقسام <section>")
    text = re.sub(r"<script.*?</script>|<style.*?</style>|<[^>]+>", " ", low, flags=re.S)
    hits = sorted({w for w in _LANDING_WORDS if w in text})
    if len(hits) >= 4:
        score += 2
        why.append("كلمات موقع دعائي: " + ", ".join(hits[:6]))
    elif len(hits) >= 2:
        score += 1
        why.append("كلمات موقع دعائي: " + ", ".join(hits[:6]))
    if len(re.findall(r"href=[\"']#", low)) >= 3:
        score += 1
        why.append("روابط تنقّل داخل الصفحة (#)")
    ext = len(re.findall(r"href=[\"']https?://", low))
    if ext >= 3:
        score += 1
        why.append(f"{ext} رابطاً خارجياً")
    links = []
    for m in re.finditer(r"<a\b[^>]*?href=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", html, re.I | re.S):
        href = m.group(1).strip()
        txt = re.sub(r"<[^>]+>", " ", m.group(2))
        txt = re.sub(r"\s+", " ", txt).strip()
        if re.match(r"^(https?:)?//|^(mailto|tel|javascript|data):|^#", href, re.I):
            continue
        links.append((href, txt))
    return score, why, links


def _dir_of_link(root: Path, href: str):
    href = href.split("#")[0].split("?")[0]
    if not href:
        return None
    p = (root / href.lstrip("/")) if href.startswith("/") else (root / href)
    try:
        p = p.resolve()
        rr = root.resolve()
    except OSError:
        return None
    if not str(p).startswith(str(rr)) or p == rr:
        return None
    if p.is_dir() and (p / "index.html").is_file():
        return p
    if p.is_file() and p.name.lower() in ("index.html", "index.htm"):
        return p.parent if p.parent != rr else None
    return None


def _parent_dependencies(cand: Path, root: Path):
    """ملفات خارج مجلد اللعبة تعتمد عليها صفحتها (../ أو مسار مطلق). الأيقونات والمانيفست لا تُحسب حرجة."""
    html = _read_text(cand / "index.html")
    blobs = [html]
    for m in re.finditer(r"<link\b[^>]*\bhref=[\"']([^\"']+\.css)[\"']", html, re.I):
        q = cand / m.group(1).split("?")[0]
        blobs.append(_read_text(q, 1_000_000))
    refs = set()
    for b in blobs:
        for m in re.finditer(r"(?:src|href)=[\"']([^\"']+)[\"']|url\(\s*[\"']?([^)\"']+)", b, re.I):
            u = (m.group(1) or m.group(2) or "").split("?")[0].split("#")[0]
            if not u or re.match(r"^(https?:)?//|^(data|mailto|javascript):|^#", u, re.I):
                continue
            refs.add(u)
    critical, soft = [], []
    rr = root.resolve()
    for u in sorted(refs):
        if u.startswith("/"):
            q = rr / u.lstrip("/")
        elif u.startswith(".."):
            q = cand / u
        else:
            continue
        try:
            q = q.resolve()
        except OSError:
            continue
        if not str(q).startswith(str(rr)) or str(q).startswith(str(cand.resolve())) or not q.is_file():
            continue
        (soft if _SOFT_PARENT_REFS.search(u) else critical).append(u)
    return critical, soft


def _tree_size(d: Path, skip: Path = None):
    n, b = 0, 0
    for dp, dns, fns in os.walk(d):
        dns[:] = [x for x in dns if x not in EXCLUDE_DIRS]
        if skip is not None and Path(dp).resolve() == skip.resolve():
            dns[:] = []
            continue
        for fn in fns:
            try:
                b += (Path(dp) / fn).stat().st_size
                n += 1
            except OSError:
                pass
    return n, b


def refine_webroot(root: Path, src: Path, notes):
    """إن كان index.html في الجذر صفحة دعائية وفيها رابط واضح لمجلد اللعبة، يرجع مجلد اللعبة؛ وإلا يرجع الجذر كما هو.
    كل ما يُكتشف أو يتردَّد فيه يُكتب في notes."""
    try:
        if not (root / "index.html").is_file():
            return root
        game_score, game_why = _game_signals(root)
        land_score, land_why, links = _landing_signals(root)

        # مرشّحون: (1) روابط بنص «Play/Demo/...» تشير إلى مجلد محلي، (2) مجلدات بأسماء معتادة للعبة
        cands = {}  # path -> {"rank":int,"how":str}
        for href, txt in links:
            d = _dir_of_link(root, href)
            if not d:
                continue
            rel_parts = {x.lower() for x in d.resolve().relative_to(root.resolve()).parts}
            if rel_parts & _NOT_GAME_DIRS:
                continue
            if _PLAY_TEXT_RE.match(txt):
                cands[d] = {"rank": 0, "how": f"زر «{txt}» يشير إليه"}
        for name in _PLAY_DIRS:
            d = root / name
            if d.is_dir() and (d / "index.html").is_file() and d not in cands:
                cands[d] = {"rank": 1, "how": f"اسم المجلد «{name}»"}

        is_landing = land_score >= 3 and game_score == 0
        if not cands:
            if land_score >= 3 and game_score == 0:
                notes.append("تحذير: index.html في الجذر يبدو صفحة دعائية (" + "؛ ".join(land_why) +
                             ") ولم يُعثر على مجلد لعبة واضح؛ نُسخ الجذر كما هو. إن لم تظهر اللعبة فأعد الاستيراد وحدّد «مجلد الويب»")
            return root
        if not is_landing:
            if land_score >= 2 and game_score == 0:
                best = sorted(cands.items(), key=lambda kv: kv[1]["rank"])[0][0]
                notes.append(f"تنبيه: وُجد مجلد «{best.relative_to(root)}» قد يكون اللعبة الفعلية وindex.html في الجذر قد يكون صفحة "
                             "تعريفية (دلائل ضعيفة: " + "؛ ".join(land_why) + ")؛ لم يُغيَّر شيء. حدّد «مجلد الويب» إن أردت استعماله")
            return root

        # تقييم المرشحين: يجب أن يحوي علامات لعبة، ولا يعتمد على ملفات حرجة خارجه
        scored, rejected = [], []
        for d, info in cands.items():
            gs, gw = _game_signals(d)
            if gs <= 0:
                rejected.append(f"«{d.relative_to(root)}» ({info['how']}): لا علامات لعبة فيه")
                continue
            crit, soft = _parent_dependencies(d, root)
            if crit:
                rejected.append(f"«{d.relative_to(root)}» ({info['how']}): يعتمد على ملفات خارجه ({', '.join(crit[:4])})")
                continue
            scored.append((info["rank"], -gs, len(d.relative_to(root).parts), str(d), d, info, gw, soft))
        if not scored:
            notes.append("تحذير: الجذر صفحة دعائية (" + "؛ ".join(land_why) + ") لكن لا مرشح صالح لمجلد اللعبة: " +
                         " | ".join(rejected) + ". نُسخ الجذر كما هو")
            return root
        scored.sort(key=lambda s: s[:4])
        _, _, _, _, chosen, info, gw, soft = scored[0]

        files_all, bytes_all = _tree_size(root)
        files_keep, bytes_keep = _tree_size(chosen)
        rel = chosen.relative_to(root)
        notes.append(f"اكتُشفت صفحة دعائية في الجذر ({'؛ '.join(land_why)}) وليس فيها علامات لعبة؛ "
                     f"اختير مجلد اللعبة «{rel}» ({info['how']}؛ علاماته: {'، '.join(gw)})")
        notes.append(f"حُذف الباقي من النشر: {files_all - files_keep} ملفاً ({(bytes_all - bytes_keep) // 1024} KB)، "
                     f"وبقي {files_keep} ملفاً ({bytes_keep // 1024} KB)")
        if len(scored) > 1:
            others = "، ".join(f"«{s[4].relative_to(root)}»" for s in scored[1:4])
            notes.append(f"مرشحون آخرون لم يُختاروا: {others}")
        if rejected:
            notes.append("مرشحون مُستبعدون: " + " | ".join(rejected[:4]))
        if soft:
            notes.append(f"ملاحظة: الصفحة تشير إلى {len(soft)} ملف ثانوي خارج مجلدها (أيقونات/مانيفست) لن تُنسخ، ولا تؤثر على اللعب")
        notes.append("إن كانت اللعبة الفعلية في مجلد آخر فأعد الاستيراد مع تحديد «مجلد الويب»")
        return chosen
    except Exception as e:  # الكشف تحسين اختياري: لا يُفشل الاستيراد أبداً
        notes.append(f"تعذّر كشف الصفحة الدعائية ({type(e).__name__}: {e}); نُسخ الجذر كما هو")
        return root


def build_if_needed(src: Path, override, build_cmd, notes):
    """كالسابق، ثم (إن لم يحدّد المستخدم مجلداً بنفسه) يستبدل الصفحة الدعائية بمجلد اللعبة."""
    root = _build_if_needed_raw(src, override, build_cmd, notes)
    if root and not override:
        root = refine_webroot(root, src, notes)
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
