#!/usr/bin/env python3
"""ترجمة ترجمات فيلم/مسلسل على GitHub Actions، حتى لو استغرق ساعات.

المصدر (SOURCE_URL) أحد ثلاثة: ملف ترجمة (srt/vtt/ass) ← يُترجم مباشرة؛ أو صوت/فيديو ← يُفرَّغ نصاً بـ faster-whisper (Whisper)
ثم يُترجم. المحرك: nllb (NLLB-200 عبر CTranslate2، محلي وقوي، الافتراضي) أو google (deep-translator) كاحتياط.
الناتج: out/films/<id>[/e<N>]/sub_<lang>.srt (+ sub_<src>.srt إن كان المصدر صوتاً) و out/report.json.
أي فشل في لغة لا يوقف باقي اللغات."""
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
from subs_core import Cue, compose_srt, parse_srt, split_long_cue, translate_cues  # noqa: E402

FILM_ID = os.environ["FILM_ID"].strip()
EPISODE = os.environ.get("EPISODE", "").strip()
SOURCE_URL = os.environ["SOURCE_URL"].strip()
SOURCE_LANG = (os.environ.get("SOURCE_LANG", "auto").strip() or "auto").lower()
TARGETS = [t.strip() for t in os.environ.get("TARGETS", "ar").split(",") if t.strip()]
ENGINE = os.environ.get("ENGINE", "nllb").strip()
NLLB_MODEL = os.environ.get("NLLB_MODEL", "1.3B").strip()
WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "small").strip()
CT2_DIR = os.environ.get("CT2_DIR", str(Path.home() / "ct2" / f"nllb-{NLLB_MODEL}"))
MAX_GB = 8

NLLB = {"ar": "arb_Arab", "en": "eng_Latn", "fr": "fra_Latn", "es": "spa_Latn", "pt": "por_Latn", "de": "deu_Latn",
        "ru": "rus_Cyrl", "tr": "tur_Latn", "hi": "hin_Deva", "zh": "zho_Hans", "zh-CN": "zho_Hans", "it": "ita_Latn",
        "ja": "jpn_Jpan", "ko": "kor_Hang", "nl": "nld_Latn", "pl": "pol_Latn", "id": "ind_Latn", "fa": "pes_Arab",
        "ur": "urd_Arab", "he": "heb_Hebr", "uk": "ukr_Cyrl", "sv": "swe_Latn", "vi": "vie_Latn", "th": "tha_Thai"}

OUT = Path("out")
BASE = OUT / "films" / FILM_ID / (f"e{EPISODE}" if EPISODE else "")
report = {"film_id": FILM_ID, "episode": EPISODE, "files": [], "errors": [], "source_lang": ""}


def log(m):
    print(m, flush=True)


def notice(m):
    print(f"::notice::{m}", flush=True)


def download(url: str, dest: Path):
    if not url.startswith("https://"):
        raise SystemExit("رابط المصدر يجب أن يبدأ بـ https://")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 khayal-subs"})
    got = 0
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            got += len(chunk)
            if got > MAX_GB * (1 << 30):
                raise SystemExit(f"الملف أكبر من {MAX_GB}GB")
            f.write(chunk)
    log(f"نُزِّل {got / 1e6:.1f}MB")


def to_srt_text(path: Path) -> str:
    if path.suffix.lower() == ".srt":
        return path.read_text("utf-8", errors="replace")
    out = path.with_suffix(".conv.srt")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), str(out)], check=True)
    return out.read_text("utf-8", errors="replace")


def detect_lang(cues) -> str:
    try:
        from langdetect import detect  # noqa: PLC0415
        return detect(" ".join(c.text for c in cues[:200]))[:2]
    except Exception:
        return "en"


def transcribe(media: Path):
    wav = media.with_suffix(".wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(media), "-vn", "-ac", "1", "-ar", "16000", "-f", "wav", str(wav)],
                   check=True)
    from faster_whisper import WhisperModel  # noqa: PLC0415
    log(f"Whisper: {WHISPER_MODEL} على CPU (قد يستغرق ساعات للأفلام الطويلة)")
    model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)
    lang = None if SOURCE_LANG == "auto" else SOURCE_LANG
    segs, info = model.transcribe(str(wav), language=lang, vad_filter=True, beam_size=5, condition_on_previous_text=False)
    cues, t0 = [], time.time()
    for s in segs:
        txt = s.text.strip()
        if txt:
            cues += split_long_cue(Cue(float(s.start), float(s.end), txt))
        if len(cues) % 50 == 0:
            log(f"فُرِّغ حتى {s.end / 60:.1f} دقيقة (مضى {(time.time() - t0) / 60:.1f} د)")
    return cues, info.language


# ───────────── المحركات ─────────────
def make_nllb(src: str, tgt: str):
    import ctranslate2  # noqa: PLC0415
    import transformers  # noqa: PLC0415
    hf = f"facebook/nllb-200-distilled-{NLLB_MODEL}"
    tok = transformers.AutoTokenizer.from_pretrained(hf, src_lang=NLLB[src])
    tr = ctranslate2.Translator(CT2_DIR, device="cpu", compute_type="int8", inter_threads=1, intra_threads=os.cpu_count() or 4)

    def fn(texts):
        toks = [tok.convert_ids_to_tokens(tok.encode(t)) for t in texts]
        res = tr.translate_batch(toks, target_prefix=[[NLLB[tgt]]] * len(toks), beam_size=4, max_decoding_length=256,
                                 repetition_penalty=1.1, no_repeat_ngram_size=4)
        return [tok.decode(tok.convert_tokens_to_ids(r.hypotheses[0][1:])) for r in res]
    return fn


def make_google(src: str, tgt: str):
    from deep_translator import GoogleTranslator  # noqa: PLC0415
    g = GoogleTranslator(source="auto" if src == "auto" else src, target="zh-CN" if tgt == "zh" else tgt)

    def fn(texts):
        out = []
        for t in texts:
            for k in range(3):
                try:
                    out.append(g.translate(t) or t)
                    break
                except Exception:
                    time.sleep(2 * (k + 1))
            else:
                out.append(t)
        return out
    return fn


def get_translator(src: str, tgt: str):
    if ENGINE == "nllb" and src in NLLB and tgt in NLLB and Path(CT2_DIR).exists():
        try:
            return make_nllb(src, tgt), "nllb"
        except Exception as e:  # noqa: BLE001
            notice(f"تعذّر NLLB ({e}) فالتحويل إلى google")
    return make_google(src, tgt), "google"


def save(cues, lang: str, note: str):
    BASE.mkdir(parents=True, exist_ok=True)
    p = BASE / f"sub_{lang}.srt"
    p.write_text(compose_srt(cues), "utf-8")
    rel = str(p.relative_to(OUT)).replace("\\", "/")
    report["files"].append({"lang": lang, "path": rel, "cues": len(cues), "note": note})
    log(f"✓ {lang}: {len(cues)} سطراً → {rel}")


def main():
    work = Path("work")
    work.mkdir(exist_ok=True)
    name = re.sub(r"[?#].*$", "", SOURCE_URL.rsplit("/", 1)[-1]) or "source"
    src_file = work / ("src" + (Path(name).suffix.lower() or ".bin"))
    log(f"تنزيل المصدر: {SOURCE_URL}")
    download(SOURCE_URL, src_file)

    if src_file.suffix.lower() in (".srt", ".vtt", ".ass", ".ssa"):
        cues = parse_srt(to_srt_text(src_file))
        src_lang = detect_lang(cues) if SOURCE_LANG == "auto" else SOURCE_LANG
        origin = "ترجمة"
    else:
        cues, src_lang = transcribe(src_file)
        origin = "تفريغ آلي"
        if SOURCE_LANG != "auto":
            src_lang = SOURCE_LANG
        save(cues, src_lang, "تفريغ آلي بـ Whisper")
    if not cues:
        raise SystemExit("لم أجد أي نص في المصدر")
    report["source_lang"] = src_lang
    notice(f"المصدر: {origin} ({src_lang}) — {len(cues)} سطراً")

    for tgt in TARGETS:
        if tgt == src_lang or (tgt == "zh-CN" and src_lang == "zh"):
            log(f"تخطي {tgt}: هي لغة المصدر")
            continue
        try:
            fn, used = get_translator(src_lang, tgt)
            out = translate_cues(cues, fn, progress=lambda a, b: log(f"  {tgt}: {a}/{b}") if a % 120 < 24 else None)
            if len(out) < max(1, len(cues) // 3):
                raise RuntimeError(f"ناتج قصير ({len(out)} من {len(cues)})")
            save(out, tgt, f"ترجمة آلية ({used})")
        except Exception as e:  # noqa: BLE001
            report["errors"].append({"lang": tgt, "error": str(e)[:300]})
            print(f"::warning::فشلت ترجمة {tgt}: {e}", flush=True)

    OUT.mkdir(exist_ok=True)
    (OUT / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), "utf-8")
    if not report["files"]:
        raise SystemExit("لم تنجح أي لغة")


if __name__ == "__main__":
    main()
