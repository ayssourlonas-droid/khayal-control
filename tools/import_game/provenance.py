"""فحص أصل الوسائط (الصور والأصوات والخطوط) وإشارات الخادم."""
import json
import re
import subprocess
from pathlib import Path

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
