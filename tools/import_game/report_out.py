"""مخرجات التقرير: ملخّص GitHub وتعليقات ::notice/::error التي يقرأها تطبيق التحكم."""
import json
import os

from common import log

def _esc(t):
    return t.replace("%", "%25").replace("\r", "").replace("\n", "%0A")


def emit_annotations(r):
    """ملاحظات GitHub (تظهر في تطبيق Game Control داخل تفاصيل التشغيل)."""
    notes = r.get("notes") or []
    warns = r.get("warnings") or []
    reasons_ = r.get("reasons") or []
    # نتيجة مُهيكلة يقرؤها تطبيق المتحكم ليلوّن الحكم (أحمر/أخضر/برتقالي) ويشرحه بالعربية
    try:
        res = {"status": r.get("status"), "repo": r.get("repo_url", ""), "slug": r.get("slug", ""),
               "license": r.get("license") or "", "warnings": len(warns), "reasons": len(reasons_)}
        print(f"::notice title=خيال-نتيجة::{_esc(json.dumps(res, ensure_ascii=False))}", flush=True)
    except Exception:
        pass
    if reasons_:
        body = _esc("\n".join("• " + x for x in reasons_))
        print(f"::error title=أسباب الفشل::{body}", flush=True)
    if notes:
        body = _esc("\n".join("• " + x for x in notes))
        print(f"::notice title=تقرير الاستيراد ({r.get('status')})::{body}", flush=True)
    if warns:
        body = _esc("\n".join("• " + x for x in warns))
        print(f"::warning title=تحذيرات الاستيراد::{body}", flush=True)


def write_summary(r):
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    lines = [f"## استيراد لعبة: {r.get('repo_url', '')}", f"**الحالة: {r.get('status')}**", ""]
    for k, title in (("reasons", "أسباب الفشل"), ("warnings", "تحذيرات"), ("notes", "ملاحظات")):
        if r.get(k):
            lines.append(f"### {title}")
            lines += [f"- {x}" for x in r[k]]
            lines.append("")
    txt = "\n".join(lines)
    log(txt)
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(txt + "\n")
