"""تنظيف ملفات HTML: إزالة الإعلانات/التتبّع، تحويل المسارات المطلقة، وفحص الأنماط المريبة."""
import os
import re
from pathlib import Path

from common import HTML_SKIPPED, MAX_FILE, SAFE_CDNS, TEXT_EXT, TRACKERS, fixed

SCRIPT_RE = re.compile(r"<script\b([^>]*)>(.*?)</script>", re.I | re.S)
ATTR_ABS_RE = re.compile(r'''(\b(?:src|href|data-src|poster)\s*=\s*)(["'])/(?!/)([^"']*)\2''', re.I)
INLINE_AD_RE = re.compile(r"adsbygoogle|gtag\(|googletag|fbq\(|ga\(\s*['\"]create", re.I)


HTTP_ATTR_RE = re.compile(r"""(\b(?:src|href|data-src|poster)\s*=\s*)(["'])(http://[^"']+)\2""", re.I)


def process_html(path: Path, depth: int, removed: list, rewritten: list):
    raw = path.read_bytes()
    try:
        t = raw.decode("utf-8")
    except UnicodeDecodeError:
        HTML_SKIPPED.append(path.name)  # لا نعدّل ملفاً بترميز غير UTF-8 كي لا نتلفه
        return
    orig = t

    def drop_script(m):
        attrs, body = m.group(1), m.group(2)
        src = re.search(r'src\s*=\s*["\']([^"\']+)["\']', attrs, re.I)
        s = src.group(1) if src else ""
        if s and any(tr in s.lower() for tr in TRACKERS):
            removed.append(f"{path.name}: {s[:90]}")
            fixed("إزالة وسم إعلانات/تتبّع")
            return ""
        if not s and INLINE_AD_RE.search(body):
            removed.append(f"{path.name}: سكربت داخلي لإعلانات/تتبّع")
            fixed("إزالة وسم إعلانات/تتبّع")
            return ""
        return m.group(0)

    t = SCRIPT_RE.sub(drop_script, t)

    prefix = "../" * depth

    def fix_abs(m):
        val = m.group(3)
        if val == "":
            return f"{m.group(1)}{m.group(2)}#{m.group(2)}" if m.group(1).lower().startswith("href") else m.group(0)
        rewritten.append(f"{path.name}: /{val[:60]}")
        fixed("مسار مطلق ← نسبي")
        return f"{m.group(1)}{m.group(2)}{prefix}{val}{m.group(2)}"

    t = ATTR_ABS_RE.sub(fix_abs, t)

    # موارد http:// داخل صفحة https تُحجب من المتصفح (mixed content) ← نرقّيها إلى https
    def to_https(m):
        url = m.group(3)
        if re.match(r"http://(127\.0\.0\.1|localhost)", url):
            return m.group(0)
        fixed("http ← https")
        return f"{m.group(1)}{m.group(2)}https://{url[7:]}{m.group(2)}"

    t = HTTP_ATTR_RE.sub(to_https, t)

    # ترميز UTF-8 صريح إن لم يوجد (يمنع تشويه الحروف العربية)
    hm = re.search(r"<head[^>]*>", t, re.I)
    if hm and not re.search(r"<meta[^>]+charset", t, re.I):
        t = t[:hm.end()] + '<meta charset="utf-8">' + t[hm.end():]
        fixed("إضافة meta charset")

    if t != orig:
        path.write_text(t, encoding="utf-8")


# ───────────── فحص أنماط مريبة (إرشادي؛ لا يمنع النشر لكنه يوقف النشر المباشر) ─────────────
SUSPICIOUS_HIGH = [
    (r"coinhive|coin-hive|cryptonight|cryptoloot|webminer|minero\.cc|jsecoin|stratum\+tcp|authedmine", "تعدين عملات (miner)"),
    (r"eval\s*\(\s*(?:window\.)?atob\s*\(", "تنفيذ كود مشفّر بـ eval(atob(...))"),
    (r"new\s+Function\s*\(\s*(?:window\.)?atob\s*\(", "تنفيذ كود مشفّر بـ Function(atob(...))"),
    (r"document\.write\s*\(\s*unescape\s*\(", "document.write(unescape(...)) — إخفاء كود"),
    (r"(?:window\.)?top\.location(?:\.href)?\s*=\s*[\"']https?://", "إعادة توجيه الصفحة الأم لموقع خارجي"),
]
SUSPICIOUS_MEDIUM = [
    (r"navigator\.sendBeacon\s*\(", "إرسال بيانات خلفياً (sendBeacon)"),
    (r"navigator\.mediaDevices\.getUserMedia|navigator\.getUserMedia", "طلب كاميرا/ميكروفون"),
    (r"navigator\.geolocation", "طلب الموقع الجغرافي"),
    (r"Notification\.requestPermission", "طلب إذن الإشعارات"),
    (r"navigator\.clipboard\.readText", "قراءة الحافظة"),
    (r"new\s+WebSocket\s*\(\s*[\"']wss?://(?!localhost|127\.0\.0\.1)", "اتصال WebSocket بخادم خارجي"),
    (r"(?:window\.)?location(?:\.href)?\s*=\s*[\"']https?://(?!localhost|127\.0\.0\.1)", "إعادة توجيه لموقع خارجي"),
    (r"createElement\s*\(\s*[\"']script[\"']\s*\)[^;]{0,200}\.src\s*=\s*[\"']https?://", "تحميل سكربت خارجي ديناميكياً"),
]


def scan_suspicious(site: Path):
    """يبحث في ملفات JS/HTML عن أنماط معروفة بالإساءة. نتيجة: {'high': [...], 'medium': [...]} (وصف + اسم ملف)."""
    res = {"high": [], "medium": []}
    seen = set()
    comp = [(re.compile(p, re.I), d, "high") for p, d in SUSPICIOUS_HIGH] + \
           [(re.compile(p, re.I), d, "medium") for p, d in SUSPICIOUS_MEDIUM]
    for dp, _, fns in os.walk(site):
        for fn in fns:
            fp = Path(dp) / fn
            if fp.suffix.lower() not in (".js", ".mjs", ".html", ".htm"):
                continue
            try:
                if fp.stat().st_size > 12 * 1024 * 1024:
                    continue
                txt = fp.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            rel = str(fp.relative_to(site)).replace(os.sep, "/")
            for rx, desc, level in comp:
                if (desc, level) in seen:
                    continue
                if rx.search(txt):
                    seen.add((desc, level))
                    res[level].append(f"{desc} ({rel})")
    return res


# معرّفات فضاءات الأسماء (xmlns في SVG/XML) تبدو كروابط لكنها ليست طلبات شبكة ولا مواقع تُزار
NAMESPACE_HOSTS = {
    "www.w3.org", "w3.org", "purl.org", "xml.org", "www.opengis.net", "ns.adobe.com", "schemas.microsoft.com",
    "schemas.openxmlformats.org", "www.inkscape.org", "inkscape.sourceforge.net", "sodipodi.sourceforge.net",
    "web.resource.org", "creativecommons.org", "www.sitemaps.org", "www.rdfs.org", "xmlns.com",
}


def sanitize(site: Path):
    removed, rewritten, tracker_hits, ext_hosts = [], [], set(), set()
    files = 0
    total = 0
    big = []
    for dp, dns, fns in os.walk(site):
        for fn in fns:
            p = Path(dp) / fn
            files += 1
            sz = p.stat().st_size
            total += sz
            if sz > MAX_FILE:
                big.append(f"{p.relative_to(site)} ({sz // 1048576}MB)")
            ext = p.suffix.lower()
            if ext in (".html", ".htm"):
                depth = len(p.relative_to(site).parts) - 1
                process_html(p, depth, removed, rewritten)
            if ext in TEXT_EXT and sz <= 6 * 1024 * 1024:
                txt = p.read_text(encoding="utf-8", errors="ignore").lower()
                for tr in TRACKERS:
                    if tr in txt:
                        tracker_hits.add(f"{tr} في {p.relative_to(site)}")
                for h in re.findall(r"https?://([a-z0-9.-]+)", txt):
                    if h not in SAFE_CDNS and h not in NAMESPACE_HOSTS and "." in h:
                        ext_hosts.add(h)
    return {
        "files": files, "total": total, "big_files": big,
        "removed": removed, "rewritten": rewritten,
        "tracker_hits": sorted(tracker_hits)[:20],
        "external_hosts": sorted(ext_hosts)[:30],
    }
