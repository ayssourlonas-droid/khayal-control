"""تقليل حجم الموقع: حذف الملفات غير المستعملة بحذر (smart/junk)."""
import os
import re
import shutil
from pathlib import Path

from browser_check import browser_test

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
