"""البحث عن غلاف اللعبة الأصلي (الصورة التي يتعرف بها اللاعب على اللعبة) وتجهيزه للتطبيق.

المصادر (بالترتيب التقريبي للثقة، والفيصل هو الدرجة):
  1) og:image / twitter:image في index.html
  2) صور README (الأولى أقوى)
  3) صور باسم صريح: cover / poster / key-art / hero / banner / title / preview / screenshot ...
  4) الصور التي حمّلتها اللعبة فعلاً عند تشغيلها (من الاختبار الآلي)
  5) لقطة شاشة الشاشة الأولى (احتياطي)
الأيقونات والشعارات الصغيرة والأجزاء (sprites/tiles) تُهمل أو تُخفَّض درجتها.
لا حدّ أعلى للحجم: الصورة الكبيرة تُصغَّر بمكتبة Pillow (render).
كل ما هنا ترتيب بالتقدير (heuristic) وليس فهماً لمحتوى الصورة؛ يُراجَع الغلاف يدوياً في «للمراجعة».
"""
import hashlib
import os
import re
import shutil
import urllib.request
from pathlib import Path
from urllib.parse import unquote, urlparse, urljoin

IMG_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif")
SKIP_DIRS = {".git", "node_modules", "__MACOSX"}
MAX_REMOTE = 8 * 1024 * 1024
MIN_ACCEPT = 40          # أدنى درجة لقبول مرشّح (دونها نستعمل لقطة الشاشة)
POSTER_W, POSTER_H = 470, 700  # بطاقة التفاصيل في تطبيق خيال
OUT_W, OUT_H = POSTER_W * 2, POSTER_H * 2

T1 = re.compile(r"(cover|poster|key[-_ ]?art|box[-_ ]?art|capsule|hero|promo|feature)", re.I)
T2 = re.compile(r"(title|splash|banner|header|preview|thumb|thumbnail|social|card|(^|[^a-z])og([^a-z]|$))", re.I)
T3 = re.compile(r"(screen[-_ ]?shot|gameplay|screen|menu|main|background|(^|[^a-z])bg([^a-z]|$)|start|intro|loading)", re.I)
LOGO = re.compile(r"(icon|logo|favicon|apple[-_ ]?touch|android[-_ ]?chrome|mstile)", re.I)
FAV = re.compile(r"(favicon|apple[-_ ]?touch|android[-_ ]?chrome|mstile)", re.I)
NEG = re.compile(
    r"(sprite|tile|atlas|sheet|font|glyph|button|btn|cursor|particle|texture|bullet|enemy|coin|digit|number|"
    r"anim|frame|shadow|shine|glow|effect|(^|[^a-z])fx([^a-z]|$)|badge|shield|block|brick|platform|ground|cloud|"
    r"\d+x\d+|[-_]\d+$)", re.I)
GOOD_DIRS = {"screenshots", "screenshot", "promo", "marketing", "media", "press", "store", "docs", ".github", "preview", "previews"}
BAD_DIRS = {"sprites", "sprite", "tiles", "tilesets", "textures", "fonts", "sounds", "audio", "atlas", "ui", "particles", "anim",
            "animations", "frames", "sfx", "music"}
BAD_HOSTS = ("shields.io", "badge", "travis-ci", "codecov", "coveralls", "buymeacoffee", "ko-fi", "opencollective",
             "badgen", "github.com/sponsors", "api.netlify", "readthedocs", "img.youtube", "visitor-badge", "hits.seeyoufarm",
             "komarev", "wakatime", "capsule-render", "readme-typing", "github-readme-stats", "skillicons")


def _dims(path):
    try:
        from PIL import Image
        with Image.open(path) as im:
            return im.size
    except Exception:
        return None


def _hash(path):
    try:
        return hashlib.md5(Path(path).read_bytes()).hexdigest()
    except Exception:
        return ""


def _fetch(url, dest_dir, tag):
    """ينزّل صورة https صغيرة نسبياً؛ يعيد المسار أو None."""
    try:
        u = urlparse(url)
        if u.scheme != "https" or any(b in url.lower() for b in BAD_HOSTS):
            return None
        m = re.match(r"https://github\.com/([^/]+)/([^/]+)/blob/(.+)$", url)
        if m:
            url = f"https://raw.githubusercontent.com/{m.group(1)}/{m.group(2)}/{m.group(3).split('?')[0]}"
        req = urllib.request.Request(url, headers={"User-Agent": "khayal-importer"})
        with urllib.request.urlopen(req, timeout=20) as r:
            ctype = (r.headers.get("Content-Type") or "").lower()
            if not ctype.startswith("image/") or "svg" in ctype:
                return None
            data = r.read(MAX_REMOTE + 1)
        if len(data) > MAX_REMOTE or len(data) < 1500:
            return None
        ext = ".png" if "png" in ctype else ".jpg" if "jp" in ctype else ".webp" if "webp" in ctype else ".gif" if "gif" in ctype else ""
        if not ext:
            return None
        dest_dir.mkdir(parents=True, exist_ok=True)
        p = dest_dir / f"{tag}{ext}"
        p.write_bytes(data)
        return p
    except Exception:
        return None


def _resolve(ref, base_dir, root, dl_dir, tag):
    """مرجع صورة (رابط أو مسار) ← ملف محلي إن أمكن."""
    ref = (ref or "").strip().strip("<>").split("#")[0]
    if not ref or ref.startswith("data:"):
        return None
    if ref.startswith("//"):
        ref = "https:" + ref
    if ref.startswith("http://"):
        ref = "https://" + ref[7:]
    if ref.startswith("https://"):
        return _fetch(ref, dl_dir, tag)
    ref = unquote(ref.split("?")[0])
    p = (root / ref.lstrip("/")) if ref.startswith("/") else (base_dir / ref)
    try:
        p = p.resolve()
        p.relative_to(root.resolve())
    except Exception:
        return None
    return p if p.is_file() and p.suffix.lower() in IMG_EXT else None


def _readme_images(src):
    out = []
    for fn in os.listdir(src):
        if re.match(r"(?i)^readme(\.[a-z]+)?$", fn) and (src / fn).is_file():
            try:
                txt = (src / fn).read_text(encoding="utf-8", errors="ignore")[:300_000]
            except Exception:
                continue
            for m in re.finditer(r"!\[[^\]]*\]\(\s*<?([^)\s>]+)|<img[^>]+?src\s*=\s*[\"']([^\"']+)", txt, re.I):
                ref = m.group(1) or m.group(2)
                if ref and ref not in out:
                    out.append(ref)
            break
    return out


def _meta_images(site):
    out = []
    for fn in ("index.html", "index.htm"):
        p = site / fn
        if p.is_file():
            try:
                txt = p.read_text(encoding="utf-8", errors="ignore")[:400_000]
            except Exception:
                continue
            for m in re.finditer(r"<meta[^>]+(?:property|name)\s*=\s*[\"'](?:og:image(?::url)?|twitter:image(?::src)?)[\"'][^>]*>", txt, re.I):
                c = re.search(r"content\s*=\s*[\"']([^\"']+)", m.group(0), re.I)
                if c:
                    out.append(c.group(1))
            for m in re.finditer(r"<link[^>]+rel\s*=\s*[\"']image_src[\"'][^>]*>", txt, re.I):
                c = re.search(r"href\s*=\s*[\"']([^\"']+)", m.group(0), re.I)
                if c:
                    out.append(c.group(1))
            break
    return out


def _score(path, origin, order, used_set):
    """يعيد (درجة، سبب) لمرشّح؛ الأعلى أفضل."""
    d = _dims(path)
    if not d:
        return -999, "غير مقروءة"
    w, h = d
    name = path.stem.lower()
    parts = {x.lower() for x in path.parts[:-1]}
    sc, why = 0, []
    if origin == "og":
        sc += 90; why.append("og:image")
    elif origin == "readme":
        b = max(25, 80 - 12 * order)
        sc += b; why.append(f"README #{order + 1}")
    if origin in ("file", "runtime") and path.as_posix() in used_set:
        sc += 10; why.append("حمّلتها اللعبة")
    if FAV.search(name):
        sc -= 90; why.append("favicon")
    elif T1.search(name):
        sc += 100; why.append("اسم غلاف")
    elif T2.search(name):
        sc += 70; why.append("اسم عنوان/بانر")
    elif T3.search(name):
        sc += 40; why.append("اسم شاشة")
    elif LOGO.search(name):
        if min(w, h) >= 300:
            sc += 10; why.append("شعار كبير")
        else:
            sc -= 60; why.append("أيقونة صغيرة")
    if NEG.search(name) and not T1.search(name):
        sc -= 45; why.append("اسم جزء/عنصر")
    if parts & GOOD_DIRS:
        sc += 25; why.append("مجلد ترويج")
    if parts & BAD_DIRS:
        sc -= 40; why.append("مجلد أجزاء")
    r = w / h if h else 1
    big = max(w, h)
    if big < 96:
        sc -= 120
    elif big < 200:
        sc -= 60
    elif big < 400:
        sc -= 15
    if r > 3.2 or r < 0.3:
        sc -= 60; why.append("نسبة غريبة")
    elif 0.5 <= r <= 2.2:
        sc += 10
    if 0.92 <= r <= 1.08 and not T1.search(name):
        sc -= 20; why.append("مربعة")
    if w * h >= 600 * 400:
        sc += 8
    try:
        if path.stat().st_size < 3000:
            sc -= 40; why.append("ملف صغير جداً")
    except Exception:
        pass
    return sc, "، ".join(why)


def choose(site, src, used, work, title_shot=None, final_shot=None, blank=False):
    """يختار أفضل غلاف؛ يعيد dict: path (نسخة محفوظة خارج site)، origin، score، note، fallback."""
    site, src, work = Path(site), Path(src), Path(work)
    dl = work / "cover_dl"
    used_set = {Path(u).as_posix() for u in (used or [])}
    used_abs = set()
    for u in used_set:
        p = (site / u)
        if p.is_file():
            used_abs.add(p.as_posix())
    cands, seen = [], set()

    def add(path, origin, order=0):
        if not path:
            return
        path = Path(path)
        key = _hash(path) or path.as_posix()
        if key in seen:
            return
        seen.add(key)
        sc, why = _score(path, origin, order, used_abs)
        cands.append({"score": sc, "path": path, "origin": origin, "why": why})

    for i, ref in enumerate(_meta_images(site)):
        add(_resolve(ref, site, site, dl, f"og{i}"), "og", i)
    for i, ref in enumerate(_readme_images(src)):
        add(_resolve(ref, src, src, dl, f"readme{i}"), "readme", i)
    for base in (site, src):  # site أولاً ليُحتسب إن كانت الصورة حمّلتها اللعبة
        for dp, dns, fns in os.walk(base):
            dns[:] = [d for d in dns if d not in SKIP_DIRS]
            for fn in fns:
                if fn.lower().endswith(IMG_EXT):
                    p = Path(dp) / fn
                    try:
                        if p.stat().st_size > 30 * 1024 * 1024:
                            continue
                    except Exception:
                        continue
                    add(p, "runtime" if p.as_posix() in used_abs else "file")

    cands.sort(key=lambda c: c["score"], reverse=True)
    best = cands[0] if cands else None
    out = {"fallback": False, "path": None, "origin": "", "score": 0, "note": "", "top": [
        f"{c['score']}: {c['path'].name} ({c['why']})" for c in cands[:3]]}
    if best and best["score"] >= MIN_ACCEPT:
        keep = work / ("_cover_pick" + best["path"].suffix.lower())
        shutil.copy2(best["path"], keep)
        out.update(path=keep, origin=best["origin"], score=best["score"],
                   note=f"الغلاف: {best['path'].name} ← {best['why']} (درجة {best['score']})")
        return out
    for shot, label in ((title_shot, "الشاشة الأولى"), (final_shot, "نهاية الاختبار")):
        if shot and Path(shot).is_file() and not blank:
            keep = work / "_cover_pick.png"
            shutil.copy2(shot, keep)
            out.update(path=keep, origin="screenshot", fallback=True,
                       note=f"لا توجد صورة غلاف مناسبة؛ استُخدمت لقطة {label} (يُفضّل استبدالها)")
            return out
    if best and best["score"] > -50:
        keep = work / ("_cover_pick" + best["path"].suffix.lower())
        shutil.copy2(best["path"], keep)
        out.update(path=keep, origin=best["origin"], score=best["score"], fallback=True,
                   note=f"لا غلاف مناسباً؛ أُخذ أفضل المتاح: {best['path'].name} ({best['why']})")
    return out


def render(path, dest_stem):
    """يجهّز الغلاف للتطبيق (بطاقة بورتريه 470×700، بدقة ضعفين) دون قصّ الصورة الأصلية.
    - صورة قريبة من نسبة البطاقة: تُصغَّر فقط (لا تكبير).
    - غير ذلك (عريضة مثلاً): تُوضع كاملة في الوسط فوق خلفية مموّهة من الصورة نفسها.
    يعيد اسم الملف الناتج (WebP)."""
    from PIL import Image, ImageFilter, ImageEnhance
    im = Image.open(path)
    try:
        im.seek(0)
    except Exception:
        pass
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")
    w, h = im.size
    r = w / h
    target = POSTER_W / POSTER_H
    if 0.8 * target <= r <= 1.2 * target:
        k = min(1.0, OUT_H / h, OUT_W / w) if (w > OUT_W or h > OUT_H) else 1.0
        if k < 1.0:
            im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
        canvas = im
    else:
        bg = im.convert("RGB")
        # خلفية: تكبير حتى تغطي اللوحة ثم تمويه وتعتيم
        kb = max(OUT_W / w, OUT_H / h)
        bgr = bg.resize((max(1, round(w * kb)), max(1, round(h * kb))), Image.BILINEAR)
        left, top = (bgr.width - OUT_W) // 2, (bgr.height - OUT_H) // 2
        bgr = bgr.crop((left, top, left + OUT_W, top + OUT_H)).filter(ImageFilter.GaussianBlur(28))
        bgr = ImageEnhance.Brightness(bgr).enhance(0.55)
        # الصورة الأصلية كاملة في الوسط (بعرض اللوحة أو بحسب الارتفاع)
        kf = min(OUT_W / w, OUT_H / h)
        if kf > 1:
            kf = min(kf, 1.0)  # لا تكبير فوق الأصل
        fg = im.resize((max(1, round(w * kf)), max(1, round(h * kf))), Image.LANCZOS)
        canvas = bgr.convert("RGB")
        canvas.paste(fg, ((OUT_W - fg.width) // 2, (OUT_H - fg.height) // 2), fg if fg.mode == "RGBA" else None)
        has_alpha = False
    dest = Path(dest_stem).with_suffix(".webp")
    # WebP (يدعم الشفافية وأصغر حجماً)، كما نحوّل بقية صور اللعبة
    canvas.save(dest, "WEBP", quality=88, method=6)
    return dest.name
