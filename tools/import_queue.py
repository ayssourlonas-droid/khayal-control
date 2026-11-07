#!/usr/bin/env python3
"""طابور استيراد على خادم GitHub: يأخذ قائمة روابط ويشغّل workflow «Import game» لكل رابط واحداً بعد الآخر،
وينتظر انتهاء كل واحد قبل التالي (فلا يُلغي GitHub الأقدم عند الازدحام)، ولا يحتاج بقاء التطبيق مفتوحاً.
المتغيرات: QUEUE_URLS (رابط في كل سطر)، ORIENTATION, PRUNE, MEDIA, AI_TEST, AI_STEPS، و GH_TOKEN. يستعمل أداة gh."""
import json
import os
import re
import subprocess
import sys
import time

WF = "import-game.yml"
MAX_URLS = 30
PER_GAME_MIN = 50          # أقصى انتظار للعبة الواحدة (دقائق) ثم تُلغى ويُكمل الطابور
POLL_SEC = int(os.environ.get("QUEUE_POLL_SEC", "20"))
APPEAR_SEC = int(os.environ.get("QUEUE_APPEAR_SEC", "120"))
URL_RE = re.compile(r"^https://github\.com/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+?(?:\.git)?/?$")


def gh(*args, check=True):
    r = subprocess.run(["gh", *args], capture_output=True, text=True)
    if check and r.returncode != 0:
        raise RuntimeError((r.stderr or r.stdout).strip()[:300])
    return r.stdout


def run_ids():
    out = gh("run", "list", "--workflow", WF, "--limit", "20", "--json", "databaseId")
    return {x["databaseId"] for x in json.loads(out or "[]")}


def say(lines):
    txt = "\n".join(lines)
    print(txt, flush=True)
    p = os.environ.get("GITHUB_STEP_SUMMARY")
    if p:
        with open(p, "a", encoding="utf-8") as f:
            f.write(txt + "\n")


def run_one(url, opts):
    before = run_ids()
    gh("workflow", "run", WF,
       "-f", f"repo_url={url}", "-f", f"orientation={opts['orientation']}", "-f", "auto_publish=no",
       "-f", f"prune={opts['prune']}", "-f", f"media={opts['media']}",
       "-f", f"ai_test={opts['ai_test']}", "-f", f"ai_steps={opts['ai_steps']}")
    rid, t0 = None, time.time()
    while rid is None and time.time() - t0 < APPEAR_SEC:
        time.sleep(min(POLL_SEC, 5))
        new = sorted(run_ids() - before)
        if new:
            rid = new[-1]
    if rid is None:
        return None, "لم يظهر التشغيل", ""
    t0 = time.time()
    while time.time() - t0 < PER_GAME_MIN * 60:
        time.sleep(POLL_SEC)
        v = json.loads(gh("run", "view", str(rid), "--json", "status,conclusion,url"))
        if v.get("status") == "completed":
            return rid, v.get("conclusion") or "unknown", v.get("url", "")
    gh("run", "cancel", str(rid), check=False)
    return rid, "timeout", ""


def main():
    raw = [x.strip() for x in re.split(r"[\s,]+", os.environ.get("QUEUE_URLS", "")) if x.strip()]
    urls, seen = [], set()
    for u in raw:
        k = u.lower().rstrip("/").removesuffix(".git")
        if k in seen:
            continue
        seen.add(k)
        urls.append(u)
    bad = [u for u in urls if not URL_RE.match(u)]
    urls = [u for u in urls if URL_RE.match(u)][:MAX_URLS]
    if not urls:
        raise SystemExit("لا توجد روابط صالحة (الشكل: https://github.com/صاحب/مستودع)")
    opts = {
        "orientation": os.environ.get("ORIENTATION", "portrait"),
        "prune": os.environ.get("PRUNE", "smart"),
        "media": os.environ.get("MEDIA", "safe"),
        "ai_test": os.environ.get("AI_TEST", "no"),
        "ai_steps": os.environ.get("AI_STEPS", "20"),
    }
    say([f"## طابور الاستيراد ({len(urls)} لعبة)"] + [f"- تجاهلتُ رابطاً غير صالح: {b}" for b in bad])
    rows, ok = [], 0
    for i, u in enumerate(urls, 1):
        print(f"▶ [{i}/{len(urls)}] {u}", flush=True)
        try:
            rid, concl, link = run_one(u, opts)
        except Exception as e:  # خطأ إرسال/شبكة: نكمل مع الباقي
            rid, concl, link = None, f"خطأ: {e}", ""
        ok += concl == "success"
        rows.append(f"| {i} | {u} | {concl} | {link} |")
        print(f"   النتيجة: {concl} {link}", flush=True)
    say(["", "| # | المستودع | النتيجة | التشغيل |", "|---|---|---|---|"] + rows + ["", f"**نجح {ok} من {len(urls)}**"])


if __name__ == "__main__":
    main()
