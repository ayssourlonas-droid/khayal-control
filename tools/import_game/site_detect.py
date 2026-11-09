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
