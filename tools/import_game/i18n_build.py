"""بناء ملف الترجمة `_i18n.json` للعبة من النصوص التي التُقطت أثناء اختبار المتصفح.

الفكرة: لا نعدّل ملفات اللعبة. نكتب بجانبها ملفاً واحداً فيه نصوصها بكل اللغات، وتطبيق اللاعبين يجلبه ويحقن
سكربتاً (games_app/lib/i18n_loader.dart) يستبدل النصوص وقت اللعب بلغة اللاعب.

شكل الملف:
  {"v": 1, "engine": "google", "langs": ["ar", "fr", ...],
   "meta": {"title": {"ar": "...", ...}, "description": {"ar": "...", ...}},
   "strings": {"Score: {#}": {"ar": "النتيجة: {1}", "fr": "Score : {1}"}, ...}}

مفتاح النص مُطبَّع: مسافات مطوية ومقصوصة، وكل سلسلة أرقام تصبح {#}. قيمة الترجمة تحمل {1} {2}… بترتيب الأرقام في الأصل.
القاعدة نفسها في سكربت الحقن وفي I18N_HARVEST_JS (browser_check.py): لا تغيّرها في موضع دون الآخرين.
"""
import json
import re

from common import log

# اللغات الشهيرة (رموز Google). يمكن تقليصها من مدخل الاستيراد i18n_langs.
LANGS = ["ar", "en", "fr", "es", "pt", "de", "it", "ru", "tr", "zh-CN", "ja", "ko", "hi", "id", "fa", "ur", "bn",
         "vi", "th", "pl", "nl", "uk", "ms"]
NUM_RE = re.compile(r"[0-9]+(?:[.,][0-9]+)*")  # ASCII فقط: يطابق \d في JS (لا يطابق الأرقام الهندية)
ARABIC_RE = re.compile(r"[؀-ۿ]")
LETTER_RE = re.compile(r"[^\W\d_]", re.U)
CODEISH_RE = re.compile(r"\{\{|\}\}|\{%|%\}|<%|%>|\$\{|%[sdif]\b|https?://|www\.|\.(?:js|png|jpg|mp3|json|html)\b|[<>]|=>|;\s*$")
MAX_STRINGS = 500  # سقف لكل لعبة: يضبط عدد الطلبات وحجم الملف (الملتقط أثناء الاختبار له الأولوية)


def norm_key(s: str) -> str:
    """مطابقة لما يفعله سكربت الحقن: طيّ المسافات + قص + أرقام ← {#}."""
    return NUM_RE.sub("{#}", re.sub(r"\s+", " ", s).strip())


def parse_langs(raw: str):
    """«fr, es» ← ['fr','es']؛ فارغ أو «all» ← كل اللغات. يتجاهل رموزاً غريبة."""
    raw = (raw or "").strip()
    if not raw or raw.lower() == "all":
        return list(LANGS)
    out = []
    for x in re.split(r"[,\s،]+", raw):
        x = x.strip()
        if re.fullmatch(r"[A-Za-z]{2,3}(-[A-Za-z]{2,4})?", x):
            out.append(x if x.lower() not in ("zh", "zh-cn") else "zh-CN")
    return list(dict.fromkeys(out))


# ---- استخراج ثابت: كل النصوص المكتوبة في ملفات اللعبة (تشمل شاشات لم تظهر أثناء الاختبار) ----
_JS_STR = re.compile(r"""(?<![\w$.])(?:'((?:[^'\\\n]|\\.){2,160})'|"((?:[^"\\\n]|\\.){2,160})"|`((?:[^`\\$\n]|\\.){2,160})`)""")
_S = r"""(?:'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")"""
_ID = r"[A-Za-z_$][\w$.]*(?:\([^()\n]*\)|\[[^\]\n]*\])*"
_CONCAT = re.compile(r"(?:%s|%s)(?:\s*\+\s*(?:%s|%s))+" % (_S, _ID, _S, _ID))
_TEMPLATE = re.compile(r"`((?:[^`\\\n]|\\.){2,200})`")
_PLACEHOLDER = re.compile(r"\$\{[^{}\n]*\}")
_HTML_TEXT = re.compile(r">([^<>{}]{2,200})<")
_HTML_ATTR = re.compile(r"""\b(?:title|alt|placeholder|aria-label)\s*=\s*["']([^"'<>]{2,160})["']""", re.I)
_NONLATIN = re.compile(r"[^\x00-\u024f\W\d_]")  # حرف ليس لاتينياً
_SKIP_DIRS = {"node_modules", ".git", "_i18n"}
_IDENT = re.compile(r"^[a-z]+(?:[A-Z][a-z0-9]*)+$|^[A-Za-z_$][\w$]*$|^[\w./#:-]+$|^#?[0-9a-fA-F]{3,8}$")


def _uilike(t: str) -> bool:
    """يشبه نصاً للاعب لا كوداً: فيه مسافة بين كلمتين أو يبدأ بحرف كبير، وليس معرّفاً/مساراً/لون/CSS."""
    t = t.strip()
    if _NONLATIN.search(t) and not CODEISH_RE.search(t) and 2 <= len(t) <= 160 and not re.search(r"[{}\\<>=;]", t):
        return True  # نص بكتابة غير لاتينية (صينية/روسية…): يُقبل مع google فقط (يُرشَّح في build)
    if re.fullmatch(r"[A-Z][a-z]{2,15}(?:\.\.\.|[.!:…])?", t):
        return True  # كلمة واجهة مفردة (Play, Score, Loading...)
    if not (2 <= len(t) <= 160) or len(LETTER_RE.findall(t)) < 3 or CODEISH_RE.search(t) or _IDENT.match(t):
        return False
    if re.search(r"[{}\\|=]|^\s*(?:\d+(?:px|em|%)|rgba?\()|\b(?:function|return|var|let|const)\b|[a-z][A-Z]", t) and " " not in t:
        return False
    if re.search(r"[{}\\]|\)\s*\{|;\s|=\s*[\w(]", t):
        return False
    return " " in t or t[0].isupper()


# كلمات صغيرة شائعة في الكود لا تُعرض للاعب (أحداث DOM وقيم CSS وثوابت)
_CODE_WORDS = set("""true false null undefined none auto default click keydown keyup keypress mouse mousedown mouseup mousemove
touch touchstart touchend touchmove move over out hover focus blur change input submit load error resize scroll wheel
left right top bottom center middle block inline flex grid hidden visible absolute relative fixed static solid dashed
bold normal italic sans serif monospace arial helvetica verdana georgia pointer text image audio video canvas webgl
object string number boolean function array json html body head div span button style script data type value id
class name src href url path file width height color red green blue black white gray grey orange yellow purple pink
open close start stop pause play end init create update destroy add remove get set post put delete head options
main idle walk run jump fall attack hit dead die spawn enemy player bullet idle linear ease""".split())
_DATA_KEY = re.compile(r"""\b(?:name|title|label|text|desc(?:ription)?|caption|message|hint|tooltip|item|type)\s*:\s*(?:'([a-z][a-z ]{2,24})'|"([a-z][a-z ]{2,24})")""")


def _lower_words(txt, from_json=False):
    """كلمات/عبارات صغيرة من مواضع بيانات (قيم JSON، أو name:/title:/label:… في JS)، تُستعمل غالباً كقيم متغيّرات داخل
    جمل («You found »+item). مفاتيح قليلة القيمة وحدها، فتأتي في آخر القائمة ويقطعها السقف أولاً."""
    out = []
    if from_json:
        for m in re.finditer(r'"([a-z][a-z ]{2,24})"(?!\s*:)', txt):
            out.append(m.group(1))
    else:
        for m in _DATA_KEY.finditer(txt):
            out.append(m.group(1) or m.group(2))
    return [w.strip() for w in out if w.strip() and w.strip() not in _CODE_WORDS and len(w.strip()) >= 3]


def star(acc, joined):
    """نمط بمتغيّر نصي: \x01 يمثّل المتغيّر. يُضاف كمفتاح فيه {*} (يطابقه المحمّل كحل أخير). شرط: 5 حروف حرفية على الأقل."""
    chk = joined.replace("\x01", "x")
    lit = joined.replace("\x01", "")
    if len(LETTER_RE.findall(lit)) < 5 or not _uilike(chk):
        return
    k = re.sub(r"\x01+", "\x01", norm_key(joined)).replace("\x01", "{*}")
    if k not in acc:
        acc.append(k)


def extract_static(site_dir, max_files=400, max_bytes=3_000_000):
    """يمسح js/html/json في موقع اللعبة ويرجع قائمة نصوص تبدو للاعب. لا يقرأ *.min.js الضخمة ولا المكتبات."""
    import pathlib
    out, seen, star_keys, low = [], set(), [], []
    root = pathlib.Path(site_dir)
    files = [f for f in root.rglob("*") if f.is_file() and f.suffix.lower() in (".js", ".mjs", ".html", ".htm", ".json")
             and not (_SKIP_DIRS & set(f.relative_to(root).parts)) and f.name != "_i18n.json"]
    files.sort(key=lambda f: f.stat().st_size)
    for f in files[:max_files]:
        try:
            if f.stat().st_size > max_bytes:
                continue
            if re.search(r"(?:^|[-_.])(?:phaser|three|pixi|babylon|jquery|howler|lodash|react|vue|bundle|vendor)(?:[-_.]|$)", f.name, re.I):
                continue  # مكتبات: نصوصها رسائل خطأ لا نصوص لعبة
            txt = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        cand = []
        if f.suffix.lower() in (".html", ".htm"):
            cand += _HTML_TEXT.findall(txt) + _HTML_ATTR.findall(txt)
        if f.suffix.lower() == ".json":
            low += _lower_words(txt, from_json=True)
            try:
                def walk(o):
                    if isinstance(o, str):
                        cand.append(o)
                    elif isinstance(o, dict):
                        for v in o.values():
                            walk(v)
                    elif isinstance(o, list):
                        for v in o:
                            walk(v)
                walk(json.loads(txt))
            except Exception:
                pass
        else:
            low += _lower_words(txt)
            for m in _JS_STR.finditer(txt):
                cand.append(m.group(1) or m.group(2) or m.group(3) or "")
            # نصوص مركّبة: "Level "+n+" done"  ←  "Level 0 done" (الرقم يصير {#} بالتطبيع)، وكل جزء حرفي منفصلاً
            for m in _CONCAT.finditer(txt):
                parts = re.findall(_S + "|" + _ID, m.group(0))
                lits = [x[1:-1] for x in parts if x[:1] in "'\""]
                if lits and len(parts) > len(lits):
                    cand.append("".join(x[1:-1] if x[:1] in "'\"" else "0" for x in parts))
                    cand += [x.strip() for x in lits if len(x.strip()) > 2]
                    star(star_keys, "".join(x[1:-1] if x[:1] in "'\"" else "\x01" for x in parts))
            for m in _TEMPLATE.finditer(txt):
                if "${" in m.group(1):
                    body = m.group(1)
                    cand.append(_PLACEHOLDER.sub("0", body))
                    star(star_keys, _PLACEHOLDER.sub("\x01", body))
                    cand += [x.strip() for x in _PLACEHOLDER.split(body) if len(x.strip()) > 2]
        for c in cand:
            c = c.replace("\\n", " ").replace("\\'", "'").replace('\\"', '"')
            if _uilike(c):
                k = norm_key(c)
                if k not in seen:
                    seen.add(k)
                    out.append(c)
    tail = [k for k in star_keys if k not in seen]
    seen.update(tail)
    return out + tail + [w for w in dict.fromkeys(low) if norm_key(w) not in seen]


def prepare_strings(raw, extra=None):
    """نصوص ملتقطة (+ ثابتة extra) ← مفاتيح مُطبَّعة فريدة تصلح للترجمة. الملتقطة أثناء التشغيل لها الأولوية،
    ثم الثابتة، ثم يُرتَّب الناتج بالأقصر أولاً (قوائم وأزرار)."""
    seen, out = set(), []
    for s in list(raw or []) + list(extra or []):
        if not isinstance(s, str):
            continue
        k = norm_key(s)
        if k in seen or not (2 <= len(k) <= 200) or len(LETTER_RE.findall(k)) < 2 or CODEISH_RE.search(k):
            continue
        seen.add(k)
        out.append(k)
    out = out[:MAX_STRINGS]
    out.sort(key=lambda x: (len(x), x))
    return out


def _to_mt(key: str):
    """{#} ← {1} {2}… قبل إرسال النص للمحرّك. يرجع (نص, عدد الأرقام)."""
    n = 0

    def rep(_):
        nonlocal n
        n += 1
        return "{%d}" % n

    return re.sub(r"\{[#*]\}", rep, key), n


def _placeholders_ok(out: str, n: int) -> bool:
    return all(out.count("{%d}" % i) == 1 for i in range(1, n + 1)) and len(re.findall(r"\{\d+\}", out)) == n


def build(strings, tr, langs, title="", description=""):
    """يرجع قاموس الملف. tr: ترجمة translate_ar.Translator. strings: مفاتيح مُطبَّعة."""
    langs = [l for l in langs if l]
    data = {"v": 1, "engine": tr.name, "langs": [], "meta": {"title": {}, "description": {}}, "strings": {}}
    if getattr(tr, "name", "") != "google":  # المحرّك المحلي en→X فقط: نتجاهل النصوص غير اللاتينية
        strings = [k for k in strings if not _NONLATIN.search(k)]
    mt = {k: _to_mt(k) for k in strings}  # key -> (نص للمحرّك, عدد الأرقام)
    for lang in langs:
        got = tr.lines([v[0] for v in mt.values()], lang) if mt else {}
        ok_any = False
        for key, (src, n) in mt.items():
            dst = got.get(src.strip())
            if not dst or dst == src or not _placeholders_ok(dst, n):
                continue
            if lang == "ar" and ARABIC_RE.search(key):
                continue
            data["strings"].setdefault(key, {})[lang] = dst
            ok_any = True
        for field, text in (("title", title), ("description", description)):
            text = (text or "").strip()
            if text and not (lang == "ar" and ARABIC_RE.search(text)):
                r = tr.one(text[:900], lang)
                if r and r != text:
                    data["meta"][field][lang] = r
                    ok_any = True
        if ok_any:
            data["langs"].append(lang)
        else:
            log(f"🌐 لا ترجمات ناجحة للغة {lang}")
    data["strings"] = {k: v for k, v in data["strings"].items() if v}
    return data


def dumps(data) -> str:
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
