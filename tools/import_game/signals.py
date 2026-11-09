"""إشارات تدل على أن المستودع لعبة، وهل يحتاج خلفية أو بناء."""
import re
from pathlib import Path

_GAME_MARKERS = re.compile(r"(<canvas|getContext\(|requestAnimationFrame|phaser|pixi|three(?:\.module)?\.js|babylon|kaboom|"
                           r"createjs|melonjs|excalibur|playcanvas|\bgame\b)", re.I)


def unbuilt_template(webroot: Path, src: Path):
    """موقع Jekyll/قالب غير مبني (وسوم Liquid أو front matter): ليس نسخة جاهزة للعرض."""
    why = []
    idx = webroot / "index.html"
    try:
        head = idx.read_text("utf-8", errors="ignore")[:20000]
    except Exception:
        head = ""
    if head.lstrip().startswith("---"):
        why.append("index.html يبدأ بـ front matter (---)")
    if re.search(r"\{\{\s*(site|page|content)\b|\{%\s*(include|for|if|assign)\b", head):
        why.append("index.html فيه وسوم Liquid ({{ }} أو {% %})")
    if (src / "_config.yml").is_file() and ((src / "_layouts").is_dir() or (src / "_includes").is_dir()):
        why.append("مجلدات Jekyll (_layouts/_includes مع _config.yml)")
    return why


def game_signals(site: Path, limit=4_000_000):
    """هل توجد مؤشرات أن الموقع لعبة؟ (canvas/requestAnimationFrame/مكتبة ألعاب…). للتحذير فقط."""
    seen = 0
    for f in site.rglob("*"):
        if f.suffix.lower() not in (".html", ".js", ".mjs") or not f.is_file():
            continue
        try:
            t = f.read_text("utf-8", errors="ignore")
        except Exception:
            continue
        seen += len(t)
        if _GAME_MARKERS.search(t):
            return True
        if seen > limit:
            break
    return False


_BACKEND_MARKERS = [
    (re.compile(r"NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|[a-z0-9-]+\.supabase\.co"), "Supabase (حسابات/بيانات)"),
    (re.compile(r"NEXT_PUBLIC_ROOMS_URL|NEXT_PUBLIC_API_URL|NEXT_PUBLIC_SERVER_URL|VITE_API_URL|VITE_SERVER_URL"), "رابط خادم يُضبط وقت البناء"),
    (re.compile(r"[a-z0-9-]+\.firebaseio\.com|firebaseapp\.com|[a-z0-9-]+\.convex\.cloud|\.herokuapp\.com"), "خدمة سحابية (Firebase/Convex/Heroku)"),
    (re.compile(r"new WebSocket\(\s*[\"'`]wss?://(?!localhost|127\.0\.0\.1)"), "WebSocket إلى خادم خارجي"),
    (re.compile(r"NEXT_PUBLIC_STRIPE|pk_(?:live|test)_[A-Za-z0-9]{10,}"), "مدفوعات Stripe"),
]


def backend_signals(site: Path, limit=6_000_000):
    """علامات أن اللعبة تعتمد على خادم/حساب خارجي (قد تعلق على شاشة التحميل بلا إعدادات الخادم)."""
    found, seen = {}, 0
    for f in site.rglob("*"):
        if f.suffix.lower() not in (".js", ".mjs", ".html") or not f.is_file():
            continue
        try:
            t = f.read_text("utf-8", errors="ignore")
        except Exception:
            continue
        seen += len(t)
        for rx, label in _BACKEND_MARKERS:
            if label not in found and rx.search(t):
                found[label] = f.name
        if seen > limit:
            break
    return list(found)
