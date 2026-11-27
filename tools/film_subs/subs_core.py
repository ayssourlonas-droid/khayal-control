"""منطق ترجمة الترجمات (SRT) بلا اعتماديات ثقيلة: قراءة/كتابة، تجميع الجمل، توزيع الترجمة على الأسطر، التفاف الأسطر.
يُختبر وحده بلا نماذج (translate_fn تُمرَّر من الخارج)."""
import math
import re
import textwrap
from dataclasses import dataclass


@dataclass
class Cue:
    start: float  # ثوانٍ
    end: float
    text: str


_TC = re.compile(r"(\d+):(\d+):(\d+)[,.](\d{1,3})\s*-->\s*(\d+):(\d+):(\d+)[,.](\d{1,3})")
_TAGS = re.compile(r"<[^>]+>|\{\\[^}]*\}")


def _secs(h, m, s, ms):
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms.ljust(3, "0")) / 1000.0


def clean(text: str) -> str:
    """نص السطر بلا وسوم ولا فواصل أسطر."""
    return re.sub(r"\s+", " ", _TAGS.sub("", text)).strip()


def parse_srt(raw: str) -> list:
    raw = raw.replace("﻿", "").replace("\r\n", "\n").replace("\r", "\n")
    cues = []
    for block in re.split(r"\n\s*\n", raw.strip()):
        lines = block.split("\n")
        for i, ln in enumerate(lines):
            m = _TC.search(ln)
            if m:
                g = m.groups()
                text = clean("\n".join(lines[i + 1:]))
                if text:
                    cues.append(Cue(_secs(*g[:4]), _secs(*g[4:]), text))
                break
    cues.sort(key=lambda c: c.start)
    return cues


def _fmt(t: float) -> str:
    t = max(0.0, t)
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def compose_srt(cues: list) -> str:
    out = []
    for i, c in enumerate(cues, 1):
        out.append(f"{i}\n{_fmt(c.start)} --> {_fmt(c.end)}\n{c.text}\n")
    return "\n".join(out)


_END = re.compile(r"[.!?…؟»\")\]]\s*$")


def group_cues(cues: list, max_group: int = 4, max_gap: float = 1.2) -> list:
    """يجمع أسطراً متتالية في «جملة» واحدة ليترجمها المحرك بسياقها (الترجمة سطراً سطراً تُفسد المعنى)."""
    groups, cur = [], []
    for c in cues:
        if cur:
            gap = c.start - cur[-1].end
            if gap > max_gap or len(cur) >= max_group or _END.search(cur[-1].text):
                groups.append(cur)
                cur = []
        cur.append(c)
    if cur:
        groups.append(cur)
    return groups


def split_by_weights(text: str, weights: list) -> list:
    """يوزّع كلمات الترجمة على الأسطر بنسبة طول أسطر الأصل (كل سطر كلمة على الأقل ما أمكن)."""
    words = text.split()
    n = len(weights)
    if n == 1:
        return [text.strip()]
    if len(words) <= n:
        parts = [" ".join(words[i:i + 1]) for i in range(len(words))]
        return parts + [""] * (n - len(parts))
    total = float(sum(weights)) or 1.0
    counts = [max(1, int(round(len(words) * w / total))) for w in weights]
    while sum(counts) > len(words):
        counts[counts.index(max(counts))] -= 1
    while sum(counts) < len(words):
        counts[counts.index(max(counts))] += 1
    parts, pos = [], 0
    for k in counts:
        parts.append(" ".join(words[pos:pos + k]))
        pos += k
    return parts


def wrap_lines(text: str, width: int = 42) -> str:
    text = text.strip()
    lines = textwrap.wrap(text, width=width, break_long_words=False) or [""]
    if len(lines) > 2:
        w = math.ceil(len(text) / 2) + 8
        lines = textwrap.wrap(text, width=w, break_long_words=False) or [""]
    return "\n".join(lines)


def split_long_cue(c: Cue, max_chars: int = 84) -> list:
    """مقطع طويل (من Whisper مثلاً) يُقسم إلى أسطر بزمن متناسب."""
    if len(c.text) <= max_chars:
        return [c]
    parts = re.split(r"(?<=[.!?،,;:؟…])\s+", c.text)
    chunks, cur = [], ""
    for p in parts:
        if cur and len(cur) + len(p) + 1 > max_chars:
            chunks.append(cur)
            cur = p
        else:
            cur = (cur + " " + p).strip()
    if cur:
        chunks.append(cur)
    if len(chunks) <= 1:
        return [c]
    total = float(sum(len(x) for x in chunks))
    out, t = [], c.start
    for x in chunks:
        d = (c.end - c.start) * len(x) / total
        out.append(Cue(t, t + d, x))
        t += d
    return out


def translate_cues(cues: list, translate_fn, batch: int = 24, progress=None) -> list:
    """translate_fn(list[str]) -> list[str]. يرجع أسطراً بنفس توقيت الأصل وبالترجمة موزّعة بينها."""
    groups = group_cues(cues)
    texts = [" ".join(c.text for c in g) for g in groups]
    translated = []
    for i in range(0, len(texts), batch):
        translated += translate_fn(texts[i:i + batch])
        if progress:
            progress(min(i + batch, len(texts)), len(texts))
    out = []
    for g, t in zip(groups, translated):
        parts = split_by_weights(t, [max(1, len(c.text)) for c in g])
        for c, p in zip(g, parts):
            if p.strip():
                out.append(Cue(c.start, c.end, wrap_lines(p)))
    return out
