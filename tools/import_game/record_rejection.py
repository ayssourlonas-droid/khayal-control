#!/usr/bin/env python3
"""يسجّل المستودع المرفوض في data_import_rejected.json كي يتجاهله الاكتشاف ويمكن العودة إليه لاحقاً من تطبيق المتحكم.
يُشغَّل بعد فشل مرحلة prepare. لا يُفشل المهمة أبداً (التسجيل ثانوي)."""
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

FILE = "data_import_rejected.json"


def norm(u):
    u = (u or "").strip().lower().rstrip("/")
    return u[:-4] if u.endswith(".git") else u


def sh(cmd, check=True):
    return subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=check)


def main():
    url = (os.environ.get("INPUT_REPO_URL") or "").strip()
    if not url:
        print("لا رابط: تخطي")
        return
    report = {}
    rp = Path(os.environ.get("PKG_DIR", "pkg")) / "report.json"
    if rp.is_file():
        try:
            report = json.loads(rp.read_text(encoding="utf-8"))
        except Exception:
            report = {}
    reasons = report.get("reasons") or []
    reason = "؛ ".join(str(r) for r in reasons)[:700] if reasons else "تعطّل الاستيراد قبل إنتاج تقرير (انظر سجل التشغيل)"
    run_url = f"{os.environ.get('GITHUB_SERVER_URL', 'https://github.com')}/{os.environ.get('GITHUB_REPOSITORY', '')}/actions/runs/{os.environ.get('GITHUB_RUN_ID', '')}"
    path = Path(FILE)
    try:
        data = json.loads(path.read_text(encoding="utf-8")) if path.is_file() else []
        if not isinstance(data, list):
            data = []
    except Exception:
        print("data_import_rejected.json ليس JSON صالحاً: لن أكتب فوقه")
        return
    key = norm(url)
    old = next((e for e in data if isinstance(e, dict) and norm(e.get("url", "")) == key), None)
    entry = {
        "url": url,
        "repo": url.split("github.com/")[-1].rstrip("/").removesuffix(".git"),
        "reason": reason,
        "license": report.get("license") or "",
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "attempts": int((old or {}).get("attempts", 0)) + 1,
        "run_url": run_url,
    }
    if old:
        old.clear()
        old.update(entry)
    else:
        data.append(entry)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    sh(["git", "config", "user.name", "github-actions[bot]"])
    sh(["git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"])
    sh(["git", "add", FILE])
    if sh(["git", "diff", "--cached", "--quiet"], check=False).returncode == 0:
        print("لا تغيير")
        return
    # العلامتان تمنعان بناء Cloudflare وتشغيل Actions لهذا الـcommit (ملف بيانات للتطبيق فقط)
    sh(["git", "commit", "-m", f"rejected: {entry['repo']} [skip ci] [CF-Pages-Skip]"])
    for i in range(5):
        r = sh(["git", "push", "origin", "HEAD:" + (os.environ.get("GITHUB_REF_NAME") or "main")], check=False)
        if r.returncode == 0:
            print("سُجّل في", FILE, ":", entry["repo"])
            return
        print(r.stdout[-400:])
        sh(["git", "pull", "--rebase", "origin", os.environ.get("GITHUB_REF_NAME") or "main"], check=False)
        time.sleep(3 * (i + 1))
    print("تعذّر الدفع بعد عدة محاولات")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # التسجيل ثانوي ولا يُفشل المهمة
        print("تعذّر تسجيل الرفض:", e)
    sys.exit(0)
