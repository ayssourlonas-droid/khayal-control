#!/usr/bin/env python3
"""
تضمين خطوط Google Fonts داخل اللعبة بدل تحميلها من خوادم Google وقت اللعب.

ماذا يفعل (كل ما يلي قابل للضبط من fonts_map.json بجانب هذا الملف):
  1) يجد روابط fonts.googleapis.com (وسوم <link> و @import) وروابط fonts.gstatic.com المباشرة في ملفات HTML/CSS.
  2) يجمع كل العائلات المطلوبة والأوزان والمائل، ويقلّص الأوزان الكثيرة إلى وزنين (400 و700) فيرسم المتصفح
     الباقي بأقرب وزن (مع كتابة نطاق الوزن في @font-face كي لا يتغير شيء في كود اللعبة).
  3) يُسقط الخط المائل (يرسمه المتصفح مائلاً صناعياً) ما لم يكن المطلوب مائلاً فقط.
  4) يضع سقفاً: عدد عائلات أقصى وحجم إجمالي أقصى؛ الأقل استعمالاً في كود اللعبة يُحذف أولاً (فيعمل الخط الاحتياطي).
  5) يختار الأجزاء (subsets) بحسب الحروف المستعملة فعلاً في اللعبة: اللاتيني دائماً، وغيره إن وُجدت حروفه.
  6) جدول استبدال يتحكم به صاحب المستودع (replace)، وطرازات للتصنيف (كرتوني/عصري/بكسلي...) مع استبدال تلقائي اختياري لكل طراز.
  7) خط عربي احتياطي (Tajawal) يُضاف لنفس أسماء العائلات (بنطاق unicode-range العربي) إن وُجد نص عربي في اللعبة.
  8) يكتب _gfonts/fonts.css وملفات woff2 وملف FONTS.txt بالتراخيص، ويعدّل الروابط إلى مسارات نسبية.
  9) لا يُفشل الاستيراد أبداً: إن فشل تنزيل عائلة تبقى روابطها كما هي ويُكتب تحذير.

الاستعمال المستقل:  python3 fonts_local.py مجلد_اللعبة [مجلد آخر ...] [--dry-run]
"""
import hashlib
import html as htmllib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    from common import log
except Exception:  # عند التشغيل المستقل بلا common
    def log(*a):
        print(*a, flush=True)

FONT_DIR = "_gfonts"
CSS_NAME = "fonts.css"
UA = ("Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/124.0.0.0 Mobile Safari/537.36")  # متصفح حديث كي تعيد Google ملفات woff2 مجزّأة

DEFAULTS = {
    "enabled": True,
    "keep_weights": [400, 700],      # الأوزان التي نُبقيها عند كثرة الأوزان
    "max_weights": 2,                # إن طُلب أقل أو يساوي هذا العدد من الأوزان لا نقلّصها
    "drop_italic": True,             # نُسقط المائل إن طُلب مع العادي
    "max_families": 3,
    "max_total_kb": 450,
    "subsets": "auto",               # auto | latin | all
    "replace": {},                   # {"Fredoka One": "Baloo 2"} الاسم الأصلي يبقى في كود اللعبة والملفات من البديل
    "style_defaults": {              # بديل لكل طراز (مفتوح افتراضياً؛ يُضبط من تطبيق متحكم)
        "cartoon": "Baloo 2", "modern": "Inter", "pixel": "Pixelify Sans", "fantasy": "Cinzel",
        "tech": "Orbitron", "mono": "JetBrains Mono", "hand": "Caveat", "serif": "Lora"
    },
    "auto_replace_styles": ["cartoon", "modern", "pixel", "fantasy", "tech", "mono", "hand", "serif"],
    "full_weights": [],              # عائلات لا تُقلَّص أوزانها
    "skip": [],                      # عائلات تُترك على روابطها الخارجية
    "arabic_fallback": "auto",       # auto | always | never
    "arabic_family": "Tajawal",
    "inject_default": True,          # ألعاب بلا أي خط معرَّف: نحقن لها خطاً (دون ذكاء اصطناعي، بقواعد بسيطة)
    "default_style": "modern",       # الطراز الافتراضي؛ يتحول إلى بكسلي/برمجي إن دلّت الشيفرة على ذلك
}

STYLE_AR = {"pixel": "بكسلي", "cartoon": "كرتوني", "modern": "عصري", "fantasy": "فانتازي", "tech": "تقني",
            "mono": "برمجي", "hand": "خط يد", "serif": "كلاسيكي بخطوط ذات زوائد"}
_STYLE_LISTS = {
    "pixel": "press start 2p|silkscreen|vt323|pixelify sans|jersey 10|tiny5|dotgothic16|bitcount",
    "cartoon": "fredoka|fredoka one|baloo 2|baloo|bangers|luckiest guy|comic neue|chewy|lilita one|sniglet|"
               "bubblegum sans|patrick hand|boogaloo|paytone one|gochi hand|carter one|titan one|londrina solid",
    "modern": "poppins|inter|montserrat|roboto|open sans|lato|nunito|nunito sans|raleway|source sans pro|"
              "source sans 3|work sans|dm sans|rubik|ubuntu|manrope|outfit|plus jakarta sans|mulish|quicksand|"
              "titillium web|noto sans|cabin|karla|barlow|space grotesk|news cycle|telex",
    "fantasy": "cinzel|cinzel decorative|medievalsharp|uncial antiqua|metamorphous|almendra|im fell english|"
               "pirata one|eagle lake|new rocker|macondo|jim nightshade",
    "tech": "orbitron|audiowide|rajdhani|exo 2|share tech mono|michroma|oxanium|saira|russo one|"
            "electrolize|aldrich|syncopate|bungee",
    "mono": "jetbrains mono|fira code|source code pro|roboto mono|ibm plex mono|space mono|inconsolata|"
            "courier prime|ubuntu mono",
    "hand": "pacifico|caveat|dancing script|shadows into light|indie flower|permanent marker|kalam|amatic sc|"
            "satisfy|gloria hallelujah|handlee|architects daughter",
    "serif": "playfair display|merriweather|lora|pt serif|libre baskerville|crimson text|eb garamond|bitter|roboto slab",
}
STYLE_OF = {n: s for s, names in _STYLE_LISTS.items() for n in names.split("|")}

# تراخيص معروفة (الباقي: خطوط Google Fonts غالباً OFL-1.1)
LICENSES = {
    "roboto": "Apache-2.0", "roboto mono": "Apache-2.0", "roboto slab": "Apache-2.0", "material icons": "Apache-2.0",
    "ubuntu": "Ubuntu Font Licence 1.0", "ubuntu mono": "Ubuntu Font Licence 1.0",
}
DEFAULT_LICENSE = "SIL Open Font License 1.1 (خطوط Google Fonts؛ راجع صفحة الخط على fonts.google.com للتأكد)"

GF_HOST = r"(?:https?:)?//fonts\.googleapis\.com/"
GS_HOST = r"(?:https?:)?//fonts\.gstatic\.com/"
LINK_TAG = re.compile(r"<link\b[^>]*>", re.I | re.S)
IMPORT_RE = re.compile(r"@import\s+(?:url\(\s*)?[\"']?(" + GF_HOST + r"[^\"')\s;]+)[\"']?\s*\)?[^;]*;", re.I)
GSTATIC_URL = re.compile(r"url\(\s*[\"']?(" + GS_HOST + r"[^)\"'\s]+)[\"']?\s*\)", re.I)
FACE_RE = re.compile(r"(?:/\*\s*([\w-]+)\s*\*/\s*)?@font-face\s*\{([^}]*)\}", re.S)
TEXT_EXT = {".html", ".htm", ".css", ".js", ".mjs", ".json", ".txt", ".xml", ".svg", ".md"}
REWRITE_EXT = {".html", ".htm", ".css"}


# ───────────── الإعدادات ─────────────
def load_config():
    cfg = json.loads(json.dumps(DEFAULTS))
    p = Path(__file__).with_name("fonts_map.json")
    if p.is_file():
        try:
            user = json.loads(p.read_text(encoding="utf-8"))
            for k, v in user.items():
                if k.startswith("_"):
                    continue
                if isinstance(v, dict) and isinstance(cfg.get(k), dict):
                    cfg[k].update(v)
                else:
                    cfg[k] = v
        except Exception as e:
            log("تعذّر قراءة fonts_map.json:", e)
    return cfg


# ───────────── شبكة ─────────────
def _get(url, tries=3, binary=False):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            return data if binary else data.decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (400, 404):  # طلب غير صالح: لا فائدة من إعادة المحاولة
                break
        except Exception as e:
            last = e
        time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"{type(last).__name__}: {str(last)[:100]}")


# ───────────── تحليل روابط Google Fonts ─────────────
def _norm_url(u):
    u = htmllib.unescape(u.strip())
    return "https:" + u if u.startswith("//") else u.replace("http://", "https://", 1)


def _family_name(s):
    return re.sub(r"\s+", " ", urllib.parse.unquote_plus(s)).strip()


def _v1_styles(spec):
    normal, ital = set(), set()
    if not spec:
        return {400}, set()
    for tok in spec.lower().split(","):
        tok = tok.strip()
        if tok in ("regular", ""):
            normal.add(400)
        elif tok == "italic":
            ital.add(400)
        elif tok == "bold":
            normal.add(700)
        elif tok in ("bolditalic", "bi"):
            ital.add(700)
        else:
            m = re.match(r"^(\d{3})(i|italic)?$", tok)
            if m:
                (ital if m.group(2) else normal).add(int(m.group(1)))
    return (normal or ({400} if not ital else set())), ital


def parse_gf_url(url):
    """يرجع قائمة عائلات: {name, normal:set, italic:set, var:(lo,hi)|None, opaque:spec|None}."""
    path, _, query = _norm_url(url).partition("?")
    fams = []
    for part in query.split("&"):
        if not part.startswith("family="):
            continue
        val = part[len("family="):]
        if "css2" in path:
            name, _, spec = val.partition(":")
            fams.append(_parse_v2(_family_name(name), urllib.parse.unquote(spec)))
        else:
            for item in urllib.parse.unquote_plus(val).split("|"):
                name, _, spec = item.partition(":")
                n, i = _v1_styles(spec)
                fams.append({"name": _family_name(name), "normal": n, "italic": i, "var": None, "opaque": None})
    return fams


def _parse_v2(name, spec):
    fam = {"name": name, "normal": set(), "italic": set(), "var": None, "opaque": None}
    if "@" not in spec:
        fam["normal"].add(400)
        return fam
    axes_part, _, tuples = spec.partition("@")
    axes = [a.strip() for a in axes_part.split(",") if a.strip()]
    if any(a not in ("ital", "wght") for a in axes):
        fam["opaque"] = spec  # محاور خاصة (wdth, opsz, FILL...): نطلبها كما هي دون تقليص
        return fam
    for t in tuples.split(";"):
        d = dict(zip(axes, [x.strip() for x in t.split(",")]))
        it = d.get("ital", "0") == "1"
        w = d.get("wght", "400")
        if ".." in w:
            lo, _, hi = w.partition("..")
            try:
                lo, hi = int(lo), int(hi)
            except ValueError:
                continue
            cur = fam["var"]
            fam["var"] = (min(lo, cur[0]), max(hi, cur[1])) if cur else (lo, hi)
            if it:
                fam["italic"].add(lo)
        else:
            try:
                (fam["italic"] if it else fam["normal"]).add(int(w))
            except ValueError:
                pass
    if not fam["normal"] and not fam["italic"] and not fam["var"]:
        fam["normal"].add(400)
    return fam


def _merge(plan, fam):
    cur = plan.get(fam["name"].lower())
    if not cur:
        fam = dict(fam, normal=set(fam["normal"]), italic=set(fam["italic"]), order=len(plan))
        plan[fam["name"].lower()] = fam
        return
    cur["normal"] |= fam["normal"]
    cur["italic"] |= fam["italic"]
    if fam["var"]:
        cur["var"] = (min(cur["var"][0], fam["var"][0]), max(cur["var"][1], fam["var"][1])) if cur["var"] else fam["var"]
    if fam["opaque"] and not cur["opaque"]:
        cur["opaque"] = fam["opaque"]


# ───────────── اختيار الأوزان ─────────────
def _nearest(w, keep):
    return sorted(keep, key=lambda k: (abs(k - w), -k))[0]


def _reduce(weights, cfg, full):
    """يرجع (قاموس وزن مطلوب ← وزن مخدوم). لا تقليص إن كان العدد صغيراً أو العائلة في full_weights."""
    ws = sorted(weights)
    if full or len(ws) <= int(cfg["max_weights"]):
        return {w: w for w in ws}
    keep = [int(k) for k in cfg["keep_weights"]]
    return {w: _nearest(w, keep) for w in ws}


def _spec_for(fam, cfg):
    """يبني مواصفة الطلب إلى Google ويرجع (spec، served) حيث served: {(مائل؟، وزن مطلوب): وزن مخدوم}."""
    if fam["opaque"]:
        return fam["opaque"], {}
    full = fam["name"].lower() in [x.lower() for x in cfg["full_weights"]]
    normal, ital = set(fam["normal"]), set(fam["italic"])
    if cfg["drop_italic"] and normal:
        ital = set()
    if fam["var"]:
        lo, hi = fam["var"]
        if ital:
            return f"ital,wght@0,{lo}..{hi};1,{lo}..{hi}", {}
        return f"wght@{lo}..{hi}", {}
    if not normal and not ital:
        normal = {400}
    served, tuples = {}, []
    for it, ws in ((False, normal), (True, ital)):
        for r, k in _reduce(ws, cfg, full).items():
            served[(it, r)] = k
            tuples.append((1 if it else 0, k))
    tuples = sorted(set(tuples))
    if ital:
        return "ital,wght@" + ";".join(f"{i},{w}" for i, w in tuples), served
    return "wght@" + ";".join(str(w) for _, w in tuples), served


def _css2_url(name, spec):
    return "https://fonts.googleapis.com/css2?family=" + urllib.parse.quote_plus(name) + (":" + spec if spec else "") + "&display=swap"


# ───────────── تحليل CSS الراجع من Google ─────────────
def parse_faces(css):
    faces = []
    for m in FACE_RE.finditer(css):
        d = {}
        for pm in re.finditer(r"([\w-]+)\s*:\s*([^;]+);?", m.group(2)):
            d[pm.group(1).lower()] = pm.group(2).strip()
        src = re.search(r"url\(\s*[\"']?([^)\"']+)[\"']?\s*\)", d.get("src", ""))
        if not src:
            continue
        faces.append({"subset": m.group(1) or "", "style": d.get("font-style", "normal"),
                      "weight": d.get("font-weight", "400"), "url": src.group(1),
                      "range": d.get("unicode-range", ""), "family": d.get("font-family", "").strip("'\" ")})
    return faces


def _intervals(rng):
    out = []
    for m in re.finditer(r"U\+([0-9A-Fa-f?]+)(?:-([0-9A-Fa-f]+))?", rng or ""):
        a, b = m.group(1), m.group(2)
        if "?" in a:
            out.append((int(a.replace("?", "0"), 16), int(a.replace("?", "F"), 16)))
        else:
            out.append((int(a, 16), int(b or a, 16)))
    return out


def _wanted_face(face, nonascii, mode):
    sub = face["subset"].lower()
    if mode == "all" or not face["range"] or sub in ("latin", ""):
        return True
    if mode == "latin":
        return False
    iv = _intervals(face["range"])
    return any(lo <= c <= hi for c in nonascii for lo, hi in iv)


# ───────────── قراءة ملفات اللعبة ─────────────
def _scan(site: Path):
    rewrite, nonascii, budget = [], set(), 40 * 1024 * 1024
    texts = []
    for dp, dns, fns in os.walk(site):
        dns[:] = [d for d in dns if d not in (".git", "node_modules", FONT_DIR)]
        for fn in fns:
            p = Path(dp) / fn
            ext = p.suffix.lower()
            if ext not in TEXT_EXT:
                continue
            try:
                if p.stat().st_size > 3 * 1024 * 1024 or budget <= 0:
                    continue
                t = p.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            budget -= len(t)
            nonascii |= {ord(c) for c in set(t) if ord(c) >= 0x80}
            if ext in REWRITE_EXT:
                rewrite.append((p, t))
            texts.append(t)
    return rewrite, texts, nonascii


def _usage(name, texts):
    pat = re.compile(re.escape(name), re.I)
    n = 0
    for t in texts:
        t = re.sub(r"fonts\.googleapis\.com/[^\"'\s)>]*", "", t)
        n += len(pat.findall(t))
    return n


def _has_arabic(cps):
    return any(0x600 <= c <= 0x6FF or 0x750 <= c <= 0x77F or 0xFB50 <= c <= 0xFDFF or 0xFE70 <= c <= 0xFEFF for c in cps)


def _slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "font"


def _rel(from_file: Path, target: Path):
    return os.path.relpath(target, from_file.parent).replace(os.sep, "/")


def _style_of(name):
    return STYLE_OF.get(name.lower())


# ───────────── ألعاب بلا خطوط: حقن خط افتراضي ─────────────
_SYSTEM_FAMILIES = {
    "arial", "helvetica", "helvetica neue", "sans-serif", "serif", "system-ui", "-apple-system", "blinkmacsystemfont",
    "segoe ui", "verdana", "tahoma", "trebuchet ms", "georgia", "times new roman", "times", "courier new", "courier",
    "monospace", "cursive", "fantasy", "ui-sans-serif", "ui-serif", "ui-monospace", "oxygen", "ubuntu", "cantarell",
    "droid sans", "roboto", "inherit", "initial", "unset", "apple color emoji", "segoe ui emoji", "noto color emoji",
    "lucida grande", "impact", "comic sans ms", "arial black", "consolas", "menlo", "monaco",
}
_ALIASABLE = ("arial", "helvetica", "segoe ui", "verdana", "tahoma", "trebuchet ms")
_FONT_FILE_EXT = {".woff", ".woff2", ".ttf", ".otf", ".eot"}


def _declared_families(texts):
    names = set()
    for t in texts:
        for m in re.finditer(r"font-family\s*:\s*([^;}{]+)", t, re.I):
            names |= {x.strip().strip("'\" ").lower() for x in m.group(1).split(",") if x.strip()}
        for m in re.finditer(r"""\.font\s*=\s*["']([^"']+)["']""", t):
            tail = m.group(1)
            names |= {x.strip().strip("'\" ").lower() for x in tail.split(" ", 2)[-1].split(",") if x.strip()}
    return names


def _pick_style(texts, declared, cfg):
    blob = "\n".join(texts)[:2_000_000]
    if re.search(r"image-rendering\s*:\s*(pixelated|crisp-edges)|imageSmoothingEnabled\s*=\s*(false|0)", blob, re.I):
        return "pixel"
    first = [d for d in declared if d not in ("inherit", "initial", "unset")]
    if first and all(d in ("monospace", "courier new", "courier", "consolas", "menlo", "monaco", "ui-monospace") for d in first):
        return "mono"
    return cfg.get("default_style") or "modern"


def inject_default(site: Path, rewrite, texts, nonascii, notes, warnings, cfg, res, dry_run=False):
    """لعبة بلا @font-face ولا ملفات خطوط وكل خطوطها خطوط نظام: نضمّن لها خطاً من Google (يُنزَّل الآن) ونربطه."""
    if not cfg.get("inject_default", True) or not rewrite:
        return False
    if (site / FONT_DIR).exists():
        return False  # سبق التضمين
    for dp, dns, fns in os.walk(site):
        dns[:] = [d for d in dns if d not in (".git", "node_modules")]
        if any(Path(f).suffix.lower() in _FONT_FILE_EXT for f in fns):
            return False  # للعبة خطوطها
    if any(re.search(r"@font-face|new\s+FontFace\(", t) for t in texts):
        return False
    declared = _declared_families(texts)
    if declared - _SYSTEM_FAMILIES:
        return False  # خط مسمّى غير خط نظام (ربما خط ويب محمّل بطريقة أخرى)
    html = [(p, t) for p, t in rewrite if p.suffix.lower() in (".html", ".htm")]
    if not html:
        return False
    visible = sum(len(re.sub(r"<[^>]+>", "", re.sub(r"(?is)<(script|style)\b.*?</\1>", "", t)).strip()) for _, t in html)
    if not declared and visible < 20:
        return False  # لا نص ولا خطوط معرّفة: لا فائدة
    style = _pick_style(texts, declared, cfg)
    family = (cfg.get("style_defaults") or {}).get(style) or "Inter"
    if dry_run:
        notes.append(f"[تجريبي] لعبة بلا خطوط: سيُحقن خط «{family}» (الطراز: {STYLE_AR.get(style, style)})")
        return False

    fdir = site / FONT_DIR
    try:
        fam = {"name": family, "normal": {400, 700}, "italic": set(), "var": None, "opaque": None}
        spec = "wght@400;700"
        faces = parse_faces(_get(_css2_url(family, spec)))
        if not faces:
            raise RuntimeError("لا وجوه")
        fdir.mkdir(exist_ok=True)
        mode = cfg.get("subsets", "auto")
        rules, saved = [], {}
        for fc in faces:
            if not _wanted_face(fc, nonascii, mode):
                continue
            w = re.sub(r"\s+", "-", fc["weight"].strip())
            fn = f"{_slug(family)}-{w}-{_slug(fc['subset']) or 'all'}.woff2"
            data = _get(fc["url"], binary=True)
            if len(data) < 200 or data[:4] not in (b"wOF2", b"wOFF"):
                raise RuntimeError("ملف خط غير صالح")
            (fdir / fn).write_bytes(data)
            saved[fn] = len(data)
            fw = "100 550" if fc["weight"] == "400" else "551 900"
            rng = f";unicode-range:{fc['range']}" if fc["range"] else ""
            rules.append((fc, fn, f"font-weight:{fw};font-display:swap;src:url('{fn}') format('woff2'){rng}"))
        if not rules:
            raise RuntimeError("لا أجزاء مطلوبة")

        names_in_text = {n for n in _ALIASABLE if n in declared}
        families = [family] + sorted(names_in_text)
        css = ["/* خط افتراضي مضمَّن (اللعبة لا تعرّف خطوطاً). التراخيص في FONTS.txt */"]
        for nm in families:
            for _, _, body in rules:
                css.append(f"@font-face{{font-family:'{nm}';font-style:normal;{body}}}")
        arabic_done = False
        if cfg["arabic_fallback"] == "always" or (cfg["arabic_fallback"] == "auto" and _has_arabic(nonascii)):
            try:
                ar = cfg["arabic_family"]
                af = {f["weight"]: f for f in parse_faces(_get(_css2_url(ar, "wght@400;700"))) if f["subset"].lower() == "arabic"}
                if "400" in af and "700" in af:
                    for wd, key in (("100 550", "400"), ("551 900", "700")):
                        f = af[key]
                        fn = f"{_slug(ar)}-{key}-arabic.woff2"
                        (fdir / fn).write_bytes(_get(f["url"], binary=True))
                        saved[fn] = (fdir / fn).stat().st_size
                        for nm in families:
                            css.append(f"@font-face{{font-family:'{nm}';font-style:normal;font-weight:{wd};font-display:swap;"
                                       f"src:url('{fn}') format('woff2');unicode-range:{f['range']}}}")
                    arabic_done = True
            except Exception as e:
                warnings.append(f"تعذّر الخط العربي الاحتياطي: {str(e)[:80]}")
        generic = "monospace" if style == "mono" else "sans-serif"
        css.append(f"body,button,input,select,textarea{{font-family:'{family}',{generic}}}")
        (fdir / CSS_NAME).write_text("\n".join(css) + "\n", encoding="utf-8")
        (fdir / "FONTS.txt").write_text(
            f"خط مضمَّن افتراضياً (اللعبة لا تعرّف خطوطاً):\n- {family}: {LICENSES.get(family.lower(), DEFAULT_LICENSE)} — "
            f"https://fonts.google.com/specimen/{urllib.parse.quote_plus(family)}\n"
            + (f"- {cfg['arabic_family']} (احتياطي للعربية): {DEFAULT_LICENSE}\n" if arabic_done else ""), encoding="utf-8")

        # أول ملف لاتيني عادي يُحمَّل مسبقاً كي لا يرسم الـcanvas أول إطار بالخط القديم
        pre = next((fn for fc, fn, _ in rules if fc["weight"] == "400" and (fc["subset"] or "latin").lower() == "latin"), None)
        changed = 0
        for p, t in html:
            rel = _rel(p, fdir / CSS_NAME)
            tag = f'<link rel="stylesheet" href="{rel}">'
            if pre:
                tag = (f'<link rel="preload" href="{_rel(p, fdir / pre)}" as="font" type="font/woff2" crossorigin>' + tag)
            if re.search(r"</head>", t, re.I):
                nt = re.sub(r"</head>", tag + "</head>", t, count=1, flags=re.I)
            elif re.search(r"<head[^>]*>", t, re.I):
                nt = re.sub(r"(<head[^>]*>)", r"\1" + tag, t, count=1, flags=re.I)
            else:
                nt = tag + t
            p.write_text(nt, encoding="utf-8")
            changed += 1
        res["files"] = len(saved) + 2
        res["kb"] = sum(saved.values()) // 1024
        res["changed"] = changed
        res["families"] = [{"name": family, "style": style, "weights": ["400", "700"], "subsets": ["injected"],
                            "replaced_by": "", "note": "", "requested": []}]
        notes.append(f"اللعبة لا تعرّف خطوطاً (خطوط النظام فقط): حُقن لها خط «{family}» (الطراز: {STYLE_AR.get(style, style)}) "
                     f"مع {len(names_in_text)} اسم نظام مُشار إليه به؛ {len(saved)} ملف، {res['kb']} KB"
                     + (f"، وخط {cfg['arabic_family']} للعربية" if arabic_done else ""))
        return True
    except Exception as e:
        try:
            import shutil
            shutil.rmtree(fdir, ignore_errors=True)
        except Exception:
            pass
        warnings.append(f"تعذّر حقن خط افتراضي: {str(e)[:100]}")
        return False


# ───────────── الدالة الرئيسية ─────────────
def localize(site, notes=None, warnings=None, cfg=None, dry_run=False):
    """يضمّن الخطوط داخل مجلد الموقع. يرجع تقريراً: families/files/kb/dropped/failed/leftover/changed."""
    site = Path(site)
    notes = notes if notes is not None else []
    warnings = warnings if warnings is not None else []
    cfg = cfg or load_config()
    res = {"files": 0, "kb": 0, "families": [], "dropped": [], "failed": [], "leftover": [], "changed": 0}
    if not cfg.get("enabled", True):
        return res

    rewrite, texts, nonascii = _scan(site)

    # 1) نجمع كل روابط Google Fonts في الوسوم و@import وروابط gstatic المباشرة
    urls, gstatic = set(), set()
    for p, t in rewrite:
        for m in LINK_TAG.finditer(t):
            tag = m.group(0)
            h = re.search(r"href\s*=\s*[\"']([^\"']+)[\"']", tag, re.I)
            if h and re.match(GF_HOST, h.group(1), re.I) and "/css" in h.group(1):
                urls.add(_norm_url(h.group(1)))
        for m in IMPORT_RE.finditer(t):
            urls.add(_norm_url(m.group(1)))
        for m in GSTATIC_URL.finditer(t):
            gstatic.add(_norm_url(m.group(1)))
    if not urls and not gstatic:
        inject_default(site, rewrite, texts, nonascii, notes, warnings, cfg, res, dry_run)
        return res

    skip = {s.lower() for s in cfg["skip"]}
    url_fams, plan = {}, {}
    for u in sorted(urls):
        fams = parse_gf_url(u)
        url_fams[u] = [f["name"] for f in fams]
        for f in fams:
            if f["name"].lower() not in skip:
                _merge(plan, f)

    # 2) سقف عدد العائلات: الأكثر استعمالاً في كود اللعبة يبقى
    ranked = sorted(plan.values(), key=lambda f: (-_usage(f["name"], texts), f["order"]))
    keep_names = [f["name"] for f in ranked[:int(cfg["max_families"])]]
    for f in ranked[int(cfg["max_families"]):]:
        res["dropped"].append(f["name"])
        warnings.append(f"خط «{f['name']}» غير مضمَّن (تجاوز سقف {cfg['max_families']} عائلات؛ الأقل استعمالاً في الكود)؛ "
                        "يُرسم النص بالخط الاحتياطي")
    plan = {k: v for k, v in plan.items() if v["name"] in keep_names}

    # طراز كل عائلة (للتقرير ولاستبدال الأنماط)
    styles = {f["name"]: _style_of(f["name"]) for f in plan.values()}
    repl = {}
    for f in plan.values():
        target = next((v for k, v in cfg["replace"].items() if k.lower() == f["name"].lower()), "")
        st = styles.get(f["name"])
        if not target and st in cfg["auto_replace_styles"]:
            target = cfg["style_defaults"].get(st, "") or ""
        if target and target.lower() != f["name"].lower():
            repl[f["name"]] = target

    if dry_run:
        for f in plan.values():
            spec, served = _spec_for(f, cfg)
            st = styles.get(f["name"])
            line = f"{f['name']}: الأوزان المطلوبة {sorted(f['normal']) or '-'}"
            if f["italic"]:
                line += f" + مائل {sorted(f['italic'])}"
            if served:
                line += f" ← تُخدم: {sorted(set(served.values()))}"
            if st:
                line += f" (طراز: {STYLE_AR[st]})"
            if f["name"] in repl:
                line += f" ← بديل: {repl[f['name']]}"
            notes.append("[تجريبي] " + line)
        notes.append(f"[تجريبي] روابط CSS: {len(urls)}، ملفات gstatic مباشرة: {len(gstatic)}، "
                     f"حروف غير لاتينية مستعملة: {len(nonascii)}")
        return res

    # 3) تنزيل الخطوط
    fdir = site / FONT_DIR
    fdir.mkdir(exist_ok=True)
    face_rules, files_kb, family_info, failed = [], {}, [], set()
    arabic_needed = (cfg["arabic_fallback"] == "always") or (cfg["arabic_fallback"] == "auto" and _has_arabic(nonascii))

    def fetch_family(name, src_name, fam):
        """يجلب وجوه عائلة؛ يجرّب المواصفة المقلَّصة ثم الأصلية ثم الأساسية. يرجع (faces, served, how)."""
        spec, served = _spec_for(fam, cfg)
        tries = [(spec, served, "")]
        full_fam = dict(fam, normal=set(fam["normal"]), italic=set(fam["italic"]))
        orig_cfg = dict(cfg, drop_italic=False, max_weights=99)
        o_spec, o_served = _spec_for(full_fam, orig_cfg)
        if o_spec != spec:
            tries.append((o_spec, o_served, "الوزن/المائل المطلوب غير متوفر فجُلبت المواصفة الأصلية"))
        tries.append(("", {(False, 400): 400}, "جُلب الوزن العادي فقط"))
        last = None
        for sp, sv, how in tries:
            try:
                css = _get(_css2_url(src_name, sp))
                faces = parse_faces(css)
                if faces:
                    return faces, sv, how
            except Exception as e:
                last = e
        raise RuntimeError(str(last)[:120] if last else "لا وجوه")

    def save_face(fam_name, face):
        w = re.sub(r"\s+", "-", face["weight"].strip())
        nm = f"{_slug(fam_name)}-{w}{'-italic' if face['style'] == 'italic' else ''}-{_slug(face['subset']) or 'all'}"
        fn = nm + ".woff2"
        p = fdir / fn
        if p.exists() and p.name in files_kb and files_kb[p.name][1] != face["url"]:
            fn = nm + "-" + hashlib.sha1(face["url"].encode()).hexdigest()[:6] + ".woff2"
            p = fdir / fn
        if fn not in files_kb:
            data = _get(face["url"], binary=True)
            if len(data) < 200 or data[:4] not in (b"wOF2", b"wOFF"):
                raise RuntimeError("ملف خط غير صالح")
            p.write_bytes(data)
            files_kb[fn] = (len(data), face["url"])
        return fn

    served_by_alias = {}
    for fam in sorted(plan.values(), key=lambda f: f["order"]):
        name = fam["name"]
        src_name = repl.get(name, name)
        try:
            try:
                faces, served, how = fetch_family(name, src_name, fam)
            except RuntimeError:
                if src_name != name:  # البديل غير متوفر: نعود إلى الخط الأصلي
                    warnings.append(f"البديل «{src_name}» لـ«{name}» غير متوفر؛ استُعمل الخط الأصلي")
                    src_name = name
                    faces, served, how = fetch_family(name, name, fam)
                else:
                    raise
            used_faces, kbs = [], 0
            for fc in faces:
                if not _wanted_face(fc, nonascii, cfg["subsets"]):
                    continue
                fn = save_face(src_name, fc)
                used_faces.append((fc, fn))
            if not used_faces:
                raise RuntimeError("لا أجزاء مطلوبة")
            served_by_alias[name] = used_faces
            for fc, fn in used_faces:
                is_it = fc["style"] == "italic"
                try:
                    k = int(fc["weight"])
                except ValueError:
                    k = None
                if k is not None and served:
                    rs = sorted(r for (it, r), kk in served.items() if it == is_it and kk == k) or [k]
                    wdesc = f"{rs[0]} {rs[-1]}" if rs[0] != rs[-1] else str(rs[0])
                else:
                    wdesc = fc["weight"]
                rule = (f"@font-face{{font-family:'{name}';font-style:{fc['style']};font-weight:{wdesc};"
                        f"font-display:swap;src:url('{fn}') format('woff2')"
                        + (f";unicode-range:{fc['range']}" if fc["range"] else "") + "}")
                face_rules.append((name, rule))
            subs = sorted({fc["subset"] or "all" for fc, _ in used_faces})
            wts = sorted({fc["weight"] for fc, _ in used_faces})
            info = {"name": name, "style": styles.get(name), "weights": wts, "subsets": subs,
                    "replaced_by": src_name if src_name != name else "", "note": how,
                    "requested": sorted(fam["normal"] | fam["italic"]) or ([fam["var"][0], fam["var"][1]] if fam["var"] else [])}
            family_info.append(info)
        except Exception as e:
            failed.add(name)
            res["failed"].append(name)
            warnings.append(f"تعذّر تضمين خط «{name}» ({str(e)[:90]}): بقيت روابطه على Google Fonts")

    # 4) خط عربي احتياطي بنفس أسماء العائلات (unicode-range العربي) فيُرسم العربي بخط واحد متناسق
    arabic_done = False
    if arabic_needed and served_by_alias:
        try:
            ar = cfg["arabic_family"]
            faces = [f for f in parse_faces(_get(_css2_url(ar, "wght@400;700"))) if f["subset"].lower() == "arabic"]
            by_w = {f["weight"]: f for f in faces}
            if "400" in by_w and "700" in by_w:
                f4, f7 = save_face(ar, by_w["400"]), save_face(ar, by_w["700"])
                for name in served_by_alias:
                    for wdesc, fn, f in (("100 550", f4, by_w["400"]), ("551 900", f7, by_w["700"])):
                        face_rules.append((name, f"@font-face{{font-family:'{name}';font-style:normal;font-weight:{wdesc};"
                                                 f"font-display:swap;src:url('{fn}') format('woff2');unicode-range:{f['range']}}}"))
                arabic_done = True
        except Exception as e:
            warnings.append(f"تعذّر إضافة الخط العربي الاحتياطي: {str(e)[:90]}")

    # 5) سقف الحجم الإجمالي: نحذف الأقل استعمالاً حتى نلتزم
    def total_kb():
        return sum(v[0] for v in files_kb.values()) // 1024
    while total_kb() > int(cfg["max_total_kb"]) and len(served_by_alias) > 1:
        victim = min(served_by_alias, key=lambda n: _usage(n, texts))
        served_by_alias.pop(victim)
        face_rules[:] = [(n, r) for n, r in face_rules if n != victim]
        family_info[:] = [i for i in family_info if i["name"] != victim]
        res["dropped"].append(victim)
        warnings.append(f"حُذف خط «{victim}» لأن حجم الخطوط تجاوز {cfg['max_total_kb']} KB؛ يُرسم بالخط الاحتياطي")
        still = {fn for _, r in face_rules for fn in re.findall(r"url\('([^']+)'\)", r)}
        for fn in list(files_kb):
            if fn not in still:
                try:
                    (fdir / fn).unlink()
                except OSError:
                    pass
                files_kb.pop(fn)

    # 6) ملفات gstatic المباشرة: تنزيل كما هي
    g_map = {}
    for u in sorted(gstatic):
        try:
            ext = Path(urllib.parse.urlparse(u).path).suffix.lower() or ".woff2"
            fn = "ext-" + hashlib.sha1(u.encode()).hexdigest()[:10] + ext
            data = _get(u, binary=True)
            if len(data) < 200:
                raise RuntimeError("ملف صغير")
            (fdir / fn).write_bytes(data)
            files_kb[fn] = (len(data), u)
            g_map[u] = fn
        except Exception as e:
            warnings.append(f"تعذّر تنزيل ملف خط مباشر ({str(e)[:60]}): بقي رابطه الخارجي")

    if not served_by_alias and not g_map:
        try:
            fdir.rmdir()
        except OSError:
            pass
        return res

    # 7) نكتب fonts.css وFONTS.txt
    if face_rules:
        css = "/* خطوط مضمَّنة محلياً (كانت على Google Fonts). التراخيص في FONTS.txt */\n" + "\n".join(r for _, r in face_rules) + "\n"
        (fdir / CSS_NAME).write_text(css, encoding="utf-8")
    lic_lines = ["خطوط مضمَّنة في هذه اللعبة (نُزّلت من Google Fonts وقت الاستيراد):", ""]
    for i in family_info:
        src = i["replaced_by"] or i["name"]
        lic_lines.append(f"- {src}: {LICENSES.get(src.lower(), DEFAULT_LICENSE)} — https://fonts.google.com/specimen/{urllib.parse.quote_plus(src)}"
                         + (f" (تُستعمل باسم «{i['name']}» في كود اللعبة)" if i["replaced_by"] else ""))
    if arabic_done:
        lic_lines.append(f"- {cfg['arabic_family']} (احتياطي للعربية): {DEFAULT_LICENSE}")
    lic_lines += ["", "تنص رخصة OFL على جواز التضمين وإعادة التوزيع مع بقاء الإشعار؛ هذا الملف هو الإشعار."]
    (fdir / "FONTS.txt").write_text("\n".join(lic_lines) + "\n", encoding="utf-8")

    # 8) نعدّل الروابط في ملفات HTML/CSS
    css_target = fdir / CSS_NAME

    def url_ok(u):
        fams = url_fams.get(u, [])
        return bool(fams) and not any(n in failed for n in fams) and bool(face_rules)

    changed = 0
    for p, t in rewrite:
        orig, state = t, {"placed": False}

        def link_cb(m):
            tag = m.group(0)
            low = tag.lower()
            if "fonts.g" not in low:
                return tag
            rel = re.search(r"\brel\s*=\s*[\"']?([\w-]+)", tag, re.I)
            rel = rel.group(1).lower() if rel else ""
            h = re.search(r"href\s*=\s*[\"']([^\"']+)[\"']", tag, re.I)
            href = h.group(1) if h else ""
            if rel in ("preconnect", "dns-prefetch", "preload", "prefetch") and re.search(r"fonts\.g(?:oogleapis|static)\.com", href, re.I):
                return ""  # لا حاجة لها بعد التضمين
            if re.match(GF_HOST, href, re.I) and "/css" in href and url_ok(_norm_url(href)):
                if state["placed"]:
                    return ""
                state["placed"] = True
                return f'<link rel="stylesheet" href="{_rel(p, css_target)}">'
            return tag
        t = LINK_TAG.sub(link_cb, t)

        def imp_cb(m):
            u = _norm_url(m.group(1))
            return f'@import url("{_rel(p, css_target)}");' if url_ok(u) else m.group(0)
        t = IMPORT_RE.sub(imp_cb, t)

        def gs_cb(m):
            u = _norm_url(m.group(1))
            fn = g_map.get(u)
            return f'url("{_rel(p, fdir / fn)}")' if fn else m.group(0)
        t = GSTATIC_URL.sub(gs_cb, t)

        if t != orig:
            p.write_text(t, encoding="utf-8")
            changed += 1
    res["changed"] = changed

    # 9) ما بقي من إشارات (غالباً داخل JS) يُذكر في التقرير
    left = []
    for dp, dns, fns in os.walk(site):
        dns[:] = [d for d in dns if d != FONT_DIR]
        for fn in fns:
            q = Path(dp) / fn
            if q.suffix.lower() in TEXT_EXT:
                try:
                    if re.search(r"fonts\.g(?:oogleapis|static)\.com", q.read_text(encoding="utf-8", errors="ignore")):
                        left.append(str(q.relative_to(site)).replace(os.sep, "/"))
                except OSError:
                    pass
    res["leftover"] = left[:6]
    if left:
        warnings.append("ما زالت إشارات إلى Google Fonts في: " + "، ".join(left[:4]) +
                        " (غالباً شيفرة JS أو WebFont Loader تضيفها وقت التشغيل؛ لم تُعدَّل)")

    # 10) التقرير
    res["files"] = len(files_kb) + 2  # + fonts.css وFONTS.txt
    res["kb"] = total_kb()
    res["families"] = family_info
    res["arabic_fallback"] = arabic_done
    if family_info:
        parts = []
        for i in family_info:
            s = f"{i['name']}" + (f" ← {i['replaced_by']}" if i["replaced_by"] else "")
            s += f" ({'، '.join(i['weights'])}؛ {'+'.join(i['subsets'])})"
            parts.append(s)
        notes.append("خطوط Google ضُمِّنت محلياً (لا اتصال بـ Google وقت اللعب): " + " | ".join(parts)
                     + f" — {len(files_kb)} ملف خط، {res['kb']} KB")
        for i in family_info:
            req = [w for w in i["requested"]]
            kept = {w for w in i["weights"]}
            if len(req) > len(kept) and all(re.fullmatch(r"\d+", w) for w in kept):
                notes.append(f"قُلِّصت أوزان «{i['name']}» من {len(req)} إلى {len(kept)} (يُرسم الباقي بأقرب وزن)")
            if i["note"]:
                notes.append(f"«{i['name']}»: {i['note']}")
        sty = [f"{i['name']}={STYLE_AR[i['style']]}" for i in family_info if i["style"] and not i["replaced_by"]]
        if sty:
            notes.append("طراز الخطوط (يمكن استبدالها من fonts_map.json): " + "، ".join(sty))
    if arabic_done:
        notes.append(f"أُضيف خط {cfg['arabic_family']} احتياطياً للنص العربي لنفس أسماء العائلات")
    if g_map:
        notes.append(f"نُزّل {len(g_map)} ملف خط مباشر من fonts.gstatic.com")
    notes.append(f"تراخيص الخطوط في {FONT_DIR}/FONTS.txt")
    return res


# ───────────── تشغيل مستقل ─────────────
def main(argv):
    dry = "--dry-run" in argv
    dirs = [a for a in argv if not a.startswith("--")]
    if not dirs:
        print(__doc__)
        return 0
    total = {"games": 0, "files": 0, "failed": 0}
    for d in dirs:
        notes, warns = [], []
        try:
            r = localize(d, notes, warns, dry_run=dry)
        except Exception as e:
            print(f"✗ {d}: {type(e).__name__}: {e}")
            total["failed"] += 1
            continue
        if r["files"] or r["failed"] or r["dropped"] or any(n.startswith("[تجريبي]") for n in notes):
            total["games"] += 1
            total["files"] += r["files"]
            print(f"== {d}")
            for n in notes:
                print("  •", n)
            for w in warns:
                print("  ⚠", w)
    print(f"\nالمجموع: {total['games']} لعبة عُدّلت، {total['files']} ملفاً أُضيف، {total['failed']} فشلت")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
