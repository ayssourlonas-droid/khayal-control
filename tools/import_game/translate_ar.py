"""ترجمة آلية بمكتبة (لا ذكاء اصطناعي توليدي ولا مفتاح).

المحرّكات:
  google  : مكتبة deep-translator (واجهة ترجمة Google المجانية، تحتاج اتصالاً، بلا مفتاح). الافتراضي. تكتشف لغة المصدر تلقائياً.
  offline : مكتبة argostranslate (نموذج محلي، مصدره الإنجليزية فقط، حزمة لكل لغة هدف تُنزَّل مرة).

المستويات (INPUT_TRANSLATE):
  off  : بلا ترجمة.
  meta : اسم اللعبة (العربي) ووصفها وتصنيفاتها فقط (الافتراضي).
  full : meta + ملف _i18n.json بنصوص اللعبة بكل اللغات الشهيرة (يبنيه i18n_build.py؛ يُحقن عند اللعب ولا تُعدَّل ملفات اللعبة).

أي فشل في الترجمة لا يوقف الاستيراد: تبقى النصوص الأصلية ويُسجَّل تنبيه.
"""
import re
import time

from common import log

ARABIC_RE = re.compile(r"[؀-ۿ]")
LATIN_RE = re.compile(r"[A-Za-z]")
CODEISH_RE = re.compile(r"\{\{|\}\}|\{%|%\}|<%|%>|\$\{|\{\d*\}|%[sdif]\b|\bundefined\b|\bnull\b")

# ───────────── التصنيفات: قاموس يُغني عن المحرّك (ترجمة التصنيفات الآلية رديئة) ─────────────
GENERIC_TAG_WORDS = {
    "game", "games", "html5", "html", "browser", "web", "webgl", "canvas", "canvas2d", "css", "js", "javascript",
    "typescript", "phaser", "phaser3", "threejs", "three", "pixi", "pixijs", "vue", "react", "node", "nodejs", "demo",
    "open", "source", "opensource", "free", "online", "mobile", "pwa", "html5-game", "gamedev", "indie", "project",
    "clone", "simple", "mini", "vanilla", "es6", "wasm", "svg", "2d", "3d", "voxel", "voxels", "isometric",
}
TAG_PHRASES = {
    "tower defense": "دفاع الأبراج", "tower defence": "دفاع الأبراج", "city builder": "بناء المدن",
    "side scroller": "تمرير جانبي", "match 3": "مطابقة ثلاثية", "match three": "مطابقة ثلاثية",
    "hack and slash": "قطع وتقطيع", "battle royale": "باتل رويال", "endless runner": "جري لا نهائي",
    "point and click": "أشر وانقر", "card game": "ألعاب ورق", "board game": "ألعاب لوحية",
    "idle game": "ألعاب تراكمية", "word game": "ألعاب كلمات", "text adventure": "مغامرة نصية",
    "top down": "منظور علوي", "turn based": "دور بدور", "real time": "زمن حقيقي", "role playing": "لعب أدوار",
}
TAG_WORDS = {
    "arcade": "أركيد", "puzzle": "ألغاز", "racing": "سباق", "race": "سباق", "shooter": "تصويب", "shooting": "تصويب",
    "platformer": "منصات", "platform": "منصات", "action": "أكشن", "adventure": "مغامرة", "strategy": "استراتيجية",
    "rpg": "لعب أدوار", "simulation": "محاكاة", "simulator": "محاكاة", "sports": "رياضة", "sport": "رياضة",
    "card": "ورق", "cards": "ورق", "board": "لوحية", "casual": "ترفيهية", "idle": "تراكمية", "incremental": "تراكمية",
    "clicker": "نقرات", "runner": "جري", "endless": "لا نهائي", "snake": "ثعبان", "tetris": "تتريس",
    "chess": "شطرنج", "checkers": "داما", "memory": "ذاكرة", "word": "كلمات", "words": "كلمات", "trivia": "أسئلة",
    "quiz": "اختبار", "math": "رياضيات", "drawing": "رسم", "music": "موسيقى", "rhythm": "إيقاع",
    "fighting": "قتال", "zombie": "زومبي", "zombies": "زومبي", "space": "فضاء", "pixel": "بكسل", "retro": "ريترو",
    "horror": "رعب", "survival": "بقاء", "sandbox": "ساندبوكس", "physics": "فيزياء", "flight": "طيران",
    "flying": "طيران", "driving": "قيادة", "car": "سيارات", "cars": "سيارات", "farming": "زراعة", "cooking": "طبخ",
    "fishing": "صيد", "ball": "كرة", "football": "كرة قدم", "soccer": "كرة قدم", "basketball": "كرة سلة",
    "golf": "غولف", "billiards": "بلياردو", "pool": "بلياردو", "solitaire": "سوليتير", "mahjong": "ماجونغ",
    "sudoku": "سودوكو", "maze": "متاهة", "jumping": "قفز", "roguelike": "روغ لايك", "multiplayer": "متعدد اللاعبين",
    "singleplayer": "لاعب واحد", "educational": "تعليمية", "kids": "أطفال", "builder": "بناء", "building": "بناء",
    "city": "مدينة", "defense": "دفاع", "defence": "دفاع", "tower": "أبراج", "shoot": "تصويب", "clicker-game": "نقرات",
    "match": "مطابقة", "match3": "مطابقة ثلاثية", "bubble": "فقاعات", "tank": "دبابات", "tanks": "دبابات",
    "dungeon": "زنازين", "platformers": "منصات", "fps": "منظور شخصي", "stealth": "تخفّي", "management": "إدارة",
    "tycoon": "إدارة أعمال", "racer": "سباق", "paddle": "مضرب", "breakout": "كسر الطوب", "pong": "بونغ",
    "minesweeper": "كاسحة ألغام", "2048": "2048", "frogger": "فروغر", "flappy": "فلابي", "bird": "طائر",
    "ninja": "نينجا", "pirate": "قراصنة", "robot": "روبوت", "robots": "روبوت", "dinosaur": "ديناصور",
    "cat": "قطة", "dog": "كلب", "fantasy": "فانتازيا", "medieval": "العصور الوسطى", "sci-fi": "خيال علمي",
    "scifi": "خيال علمي", "war": "حرب", "military": "عسكرية", "detective": "تحري", "mystery": "غموض",
    "escape": "هروب", "hidden": "أشياء مخفية", "coloring": "تلوين", "dress": "تلبيس", "dating": "مواعدة",
    "trading": "تجارة", "economy": "اقتصاد", "gravity": "جاذبية", "bouncing": "ارتداد", "swipe": "سحب",
    "reflex": "ردة فعل", "typing": "كتابة", "puzzles": "ألغاز", "logic": "منطق", "brain": "ذكاء", "trivia-game": "أسئلة",
}


def needs_translation(s: str, any_script: bool = False) -> bool:
    """نص يحتاج ترجمة: بلا حروف عربية وبلا أنماط قوالب/شيفرة. الافتراضي إنجليزي (حرفان لاتينيان فأكثر)؛
    any_script=True (محرّك google يكشف لغة المصدر تلقائياً) يقبل أي كتابة: صينية وروسية ويابانية…"""
    if ARABIC_RE.search(s) or CODEISH_RE.search(s):
        return False
    if any_script:
        return len(re.findall(r"[^\W\d_]", s)) >= 2
    return len(LATIN_RE.findall(s)) >= 2


def _arabic_ok(src: str, out) -> bool:
    if not out or not ARABIC_RE.search(out):
        return False
    return len(out) <= max(40, len(src) * 6)


# ───────────── المحرّكات ─────────────
class GoogleEngine:
    name = "google"

    def __init__(self):
        from deep_translator import GoogleTranslator  # noqa: PLC0415
        self._cls, self._t = GoogleTranslator, {}

    def one(self, text: str, lang: str = "ar"):
        t = self._t.get(lang)
        if t is None:
            t = self._t[lang] = self._cls(source="auto", target=lang)
        for attempt in range(3):
            try:
                return t.translate(text)
            except Exception as e:  # noqa: BLE001
                if attempt == 2:
                    log(f"⚠ ترجمة Google ({lang}) فشلت:", str(e)[:100])
                    return None
                time.sleep(1.5 * (attempt + 1))
        return None


class OfflineEngine:
    name = "offline"

    def __init__(self):
        import argostranslate.package as pk  # noqa: PLC0415
        import argostranslate.translate as tr  # noqa: PLC0415
        self._pk, self._tr, self._ok = pk, tr, {}
        self._avail = None
        self._ensure("ar")  # يفشل هنا فنجرّب المحرّك الآخر إن لم تتوفر حتى العربية

    def _ensure(self, lang):
        """يثبّت حزمة en→lang مرة واحدة؛ يرمي استثناءً إن لم توجد."""
        if lang in self._ok:
            if not self._ok[lang]:
                raise RuntimeError(f"لا توجد حزمة en→{lang}")
            return
        code = lang.split("-")[0]
        langs = {l.code: l for l in self._tr.get_installed_languages()}
        if not ("en" in langs and code in langs and langs["en"].get_translation(langs[code])):
            if self._avail is None:
                self._pk.update_package_index()
                self._avail = self._pk.get_available_packages()
            pkg = next((p for p in self._avail if p.from_code == "en" and p.to_code == code), None)
            if pkg is None:
                self._ok[lang] = False
                raise RuntimeError(f"لا توجد حزمة en→{lang}")
            self._pk.install_from_path(pkg.download())
        self._ok[lang] = True

    def one(self, text: str, lang: str = "ar"):
        try:
            self._ensure(lang)
            return self._tr.translate(text, "en", lang.split("-")[0])
        except Exception as e:  # noqa: BLE001
            log(f"⚠ ترجمة argos ({lang}) فشلت:", str(e)[:100])
            return None


class Translator:
    """يغلّف محرّكاً بذاكرة مؤقتة وسقف وقت وعدد طلبات، ويتحقق من الناتج."""

    def __init__(self, engine, budget_s=420, max_calls=700, delay=0.12):
        self.engine, self.cache = engine, {}
        self.deadline, self.calls_left, self.delay = time.time() + budget_s, max_calls, delay
        self.failed = 0

    @property
    def name(self):
        return getattr(self.engine, "name", "custom")

    def extend_budget(self, budget_s, max_calls):
        """مرحلة أكبر (ملف اللغات): نرفع السقف دون إنشاء محرّك جديد."""
        self.deadline = max(self.deadline, time.time() + budget_s)
        self.calls_left = max(self.calls_left, max_calls)

    def _pause(self):
        if self.delay and getattr(self.engine, "name", "") == "google":
            time.sleep(self.delay)

    @staticmethod
    def _valid(src, out, lang):
        if not out:
            return False
        if lang == "ar":
            return _arabic_ok(src, out)
        return len(out) <= max(40, len(src) * 8)

    def one(self, text: str, lang: str = "ar"):
        text = text.strip()
        if not text:
            return None
        k = (lang, text)
        if k in self.cache:
            return self.cache[k]
        if time.time() > self.deadline or self.calls_left <= 0:
            return None
        self.calls_left -= 1
        res = self.engine.one(text, lang)
        res = res.strip() if isinstance(res, str) else None
        if not self._valid(text, res, lang):
            self.failed += 1
            res = None
        self.cache[k] = res
        self._pause()
        return res

    def many(self, texts, lang: str = "ar"):
        """{الأصل: الترجمة} للناجح فقط."""
        out = {}
        for t in dict.fromkeys(x.strip() for x in texts if x and x.strip()):
            r = self.one(t, lang)
            if r:
                out[t] = r
        return out

    def lines(self, texts, lang: str, chunk_chars=3000, chunk_lines=40):
        """ترجمة قائمة نصوص (بلا أسطر داخلية) بدفعات: كل دفعة طلب واحد بنصوص مفصولة بسطر جديد.
        إن لم يرجع المحرّك العدد نفسه من الأسطر نترجم نصوص تلك الدفعة واحداً واحداً.
        المحرّك المحلي (offline) ترجمته سريعة فلا يحتاج دفعات."""
        texts = [t.strip() for t in texts]
        out, i = {}, 0
        batchable = getattr(self.engine, "name", "") == "google"
        while i < len(texts):
            j, size = i, 0
            while j < len(texts) and j - i < chunk_lines and size + len(texts[j]) < chunk_chars:
                size += len(texts[j]) + 1
                j += 1
            j = max(j, i + 1)
            part = [t for t in texts[i:j] if (lang, t) not in self.cache]
            if part and batchable and len(part) > 1 and time.time() <= self.deadline and self.calls_left > 0:
                self.calls_left -= 1
                res = self.engine.one("\n".join(part), lang)
                got = res.split("\n") if isinstance(res, str) else []
                if len(got) == len(part):
                    for src, dst in zip(part, got):
                        dst = dst.strip()
                        self.cache[(lang, src)] = dst if self._valid(src, dst, lang) else None
                self._pause()
            for t in texts[i:j]:
                r = self.one(t, lang)  # ما لم تُترجم الدفعة (أو فشلت) يُترجم فردياً
                if r:
                    out[t] = r
            i = j
        return out


def make_translator(engine_name: str):
    """(Translator|None, ملاحظة). يجرّب المحرّك المطلوب ثم الآخر، ولا يرمي استثناءً."""
    order = ["offline", "google"] if engine_name == "offline" else ["google", "offline"]
    errs = []
    for n in order:
        try:
            eng = GoogleEngine() if n == "google" else OfflineEngine()
            note = "" if n == order[0] else f"تعذّر محرّك {order[0]} ({errs[0]})؛ استُعمل {n}"
            return Translator(eng), note
        except Exception as e:  # noqa: BLE001
            errs.append(f"{n}: {str(e)[:80]}")
    return None, "تعذّر تهيئة مكتبة الترجمة (" + " | ".join(errs) + ")"


# ───────────── البيانات الوصفية ─────────────
def translate_tags(tags, tr):
    """{تصنيف إنجليزي: تسمية عربية} لما أمكن؛ المفتاح الإنجليزي يبقى للتصفية في التطبيق."""
    out = {}
    for tag in tags or []:
        key = str(tag).strip().lower()
        if not key or ARABIC_RE.search(key):
            continue
        plain = re.sub(r"[-_]+", " ", key)
        hit = None
        for ph, ar in TAG_PHRASES.items():
            if ph in plain:
                hit = ar
                break
        if not hit:
            parts = [p for p in plain.split() if p not in GENERIC_TAG_WORDS]
            if not parts:
                continue  # كلها كلمات تقنية عامة: تبقى الإنجليزية كما هي
            if all(p in TAG_WORDS for p in parts):
                hit = " ".join(dict.fromkeys(TAG_WORDS[p] for p in parts))
            # تصنيف غير معروف (غالباً اسم أداة أو مشروع): يبقى بالإنجليزية بدل ترجمة آلية عشوائية
        if hit:
            out[str(tag)] = hit
    return out


def translate_meta(meta: dict, tr):
    """يضيف إلى meta: title_ar (إن لم يضعه المالك) وdescription_ar وtags_ar. يرجع قائمة الحقول المترجمة."""
    done = []
    title = str(meta.get("title_en") or "").strip()
    if not str(meta.get("title_ar") or "").strip() and needs_translation(title, tr.name == "google"):
        r = tr.one(title)
        if r:
            meta["title_ar"] = r
            done.append("الاسم")
    desc = str(meta.get("description") or "").strip()
    if desc and needs_translation(desc, tr.name == "google"):
        r = tr.one(desc[:900])
        if r:
            meta["description_ar"] = r
            done.append("الوصف")
    tags_ar = translate_tags(meta.get("tags") or [], tr)
    if tags_ar:
        meta["tags_ar"] = tags_ar
        done.append("التصنيفات")
    if done:
        meta["translation"] = {"engine": tr.name, "fields": done, "mode": "machine"}
    return done
