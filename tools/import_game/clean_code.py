"""تنظيف الكود: تصغير JavaScript وCSS (بلا تغيير أسماء المتغيرات) وضغط JSON، مع تراجع تلقائي إن ساء الاختبار.

الأداة: esbuild (سريعة ومعروفة بالموثوقية). لا نستعمل `--minify-identifiers` أبداً كي تبقى أسماء الدوال والمتغيرات
كما هي (ألعاب كثيرة تعتمد عليها عبر window/eval). نحفظ تعليقات الرخصة (/*! ... */ و@license).
المراحل: 1) تصغير الفراغات + بنية الكود، فإن ساء الاختبار → 2) الفراغات فقط، فإن ساء → تراجع كامل.
لا يُستعمل مع الرخص ذات الحقوق المتبادلة (يجب إبقاء المصدر كما هو).
"""
import json
import os
import re
import shutil
import subprocess
from pathlib import Path

from browser_check import browser_test
from common import log, run

ESBUILD_VERSION = "0.24.2"
SKIP_DIRS = {"node_modules", ".git"}
MIN_GAIN = 0.03  # لا نستبدل الملف إلا إن وفّر 3% على الأقل


def _candidates(site: Path):
    js, css, js_json = [], [], []
    for dp, dns, fns in os.walk(site):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            p = Path(dp) / fn
            low = fn.lower()
            try:
                sz = p.stat().st_size
            except OSError:
                continue
            if sz < 300 or sz > 8 * 1024 * 1024 or ".min." in low:
                continue
            rel = p.relative_to(site).as_posix()
            if low.endswith((".js", ".mjs", ".css")):
                try:
                    txt = p.read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    continue
                if sz / (txt.count("\n") + 1) > 200:  # مصغّر أصلاً
                    continue
                (css if low.endswith(".css") else js).append(rel)
            elif low.endswith(".json") and sz <= 3 * 1024 * 1024:
                js_json.append(rel)
    return js, css, js_json


def _esbuild(bin_path: Path, site: Path, out_dir: Path, files, flags):
    """يشغّل esbuild على مجموعة؛ عند الفشل يجرّب كل ملف وحده. يعيد قائمة الملفات التي نجحت."""
    ok = []
    for i in range(0, len(files), 60):
        chunk = files[i:i + 60]
        base = [str(bin_path), *chunk, f"--outdir={out_dir}", "--outbase=.", "--charset=utf8",
                "--legal-comments=inline", "--log-level=error", "--allow-overwrite", *flags]
        r = subprocess.run(base, cwd=site, capture_output=True, text=True, timeout=300)
        if r.returncode == 0:
            ok.extend(chunk)
            continue
        for f in chunk[:150]:
            one = [str(bin_path), f, f"--outdir={out_dir}", "--outbase=.", "--charset=utf8",
                   "--legal-comments=inline", "--log-level=error", "--allow-overwrite", *flags]
            try:
                r1 = subprocess.run(one, cwd=site, capture_output=True, text=True, timeout=120)
            except Exception:
                continue
            if r1.returncode == 0:
                ok.append(f)
    return ok


def _json_compact(p: Path):
    txt = p.read_text(encoding="utf-8")
    data = json.loads(txt)
    new = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return new if len(new.encode("utf-8")) < len(txt.encode("utf-8")) * (1 - MIN_GAIN) else None


def clean_site(site: Path, work: Path, shot: Path, base: dict):
    res = {"ran": False, "files": 0, "before": 0, "after": 0, "mode": "", "rolled_back": False, "error": ""}
    js, css, jsons = _candidates(site)
    if not (js or css or jsons):
        return res
    lint_dir = work / "lint"
    lint_dir.mkdir(parents=True, exist_ok=True)
    try:
        run(["npm", "install", "--prefix", str(lint_dir), f"esbuild@{ESBUILD_VERSION}", "--no-audit", "--no-fund"], timeout=300)
    except Exception as e:
        res["error"] = f"تعذّر تثبيت esbuild: {str(e)[:80]}"
        return res
    bin_path = lint_dir / "node_modules" / ".bin" / "esbuild"
    if not bin_path.exists():
        res["error"] = "esbuild غير موجود بعد التثبيت"
        return res

    backup = work / "clean_backup"
    if backup.exists():
        shutil.rmtree(backup)
    backup.mkdir(parents=True)
    out_dir = work / "clean_out"
    changed = {}  # rel -> حجم الأصل

    def restore_all():
        for rel in list(changed):
            src = backup / rel
            if src.is_file():
                shutil.copy2(src, site / rel)
        changed.clear()

    def apply(mode):
        """mode: 'full' (فراغات + بنية الكود) أو 'ws' (فراغات فقط)."""
        restore_all()
        if out_dir.exists():
            shutil.rmtree(out_dir)
        out_dir.mkdir(parents=True)
        jflags = ["--target=es2020", "--minify-whitespace", "--minify-syntax"] if mode == "full" else ["--target=es2020", "--minify-whitespace"]
        done = _esbuild(bin_path, site, out_dir, js, jflags) + _esbuild(bin_path, site, out_dir, css, ["--minify"])
        for rel in done:
            o = out_dir / rel
            s = site / rel
            if not o.is_file() or not s.is_file():
                continue
            osz, nsz = s.stat().st_size, o.stat().st_size
            if 0 < nsz < osz * (1 - MIN_GAIN):
                dst = backup / rel
                dst.parent.mkdir(parents=True, exist_ok=True)
                if not dst.exists():
                    shutil.copy2(s, dst)
                changed[rel] = osz
                shutil.copy2(o, s)
        for rel in jsons:
            p = site / rel
            try:
                new = _json_compact(p)
            except Exception:
                continue
            if new is None:
                continue
            osz = p.stat().st_size
            dst = backup / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            if not dst.exists():
                shutil.copy2(p, dst)
            changed[rel] = osz
            p.write_text(new, encoding="utf-8")

    def worse(t2):
        base_errs = len(base.get("console_errors", []))
        base_missing = {m.lower() for m in base.get("missing", [])}
        new_missing = [m for m in t2.get("missing", []) if m.lower() not in base_missing]
        return (not t2["ran"] or not t2["status_ok"] or t2["blank"]
                or len(t2["console_errors"]) > base_errs + 1 or bool(new_missing))

    res["ran"] = True
    for mode in ("full", "ws"):
        apply(mode)
        if not changed:
            res["mode"] = mode
            break
        t2 = browser_test(site, work, shot, explore=True, seconds=40)
        if not worse(t2):
            res["mode"] = mode
            break
        log(f"🧹 التنظيف ({mode}) ساء الاختبار؛ نتراجع")
        restore_all()
    else:
        res["rolled_back"] = True
        res["mode"] = ""
    if not res["rolled_back"]:
        res["files"] = len(changed)
        res["before"] = sum(changed.values())
        res["after"] = sum((site / rel).stat().st_size for rel in changed if (site / rel).is_file())
    shutil.rmtree(out_dir, ignore_errors=True)
    shutil.rmtree(backup, ignore_errors=True)
    return res
