#!/usr/bin/env python3
"""
المرحلة 1 (بلا أسرار): جلب لعبة من GitHub، فحص رخصتها، بناؤها إن لزم،
تنظيفها، اختبارها بمتصفح آلي، وتجهيز حزمة جاهزة للنشر في work/out.
لا يستخدم أي ذكاء اصطناعي. التعديل الوحيد على الملفات: إزالة وسوم إعلانات/تتبّع معروفة
وتحويل المسارات المطلقة في ملفات HTML إلى نسبية.
"""
import json
import json
import os
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

from browser_check import browser_test, fix_case, lint_js
from common import ALLOWED, COPYLEFT, COUNT, FIXES, HTML_SKIPPED, MAX_FILES, MAX_TOTAL_FAIL, MAX_TOTAL_WARN, TIMINGS, api, fixed, log, parse_repo, pretty_title, run, slugify, stage, start_watchdog, stop_watchdog
from html_sanitize import sanitize, scan_suspicious
from provenance import provenance_lines, scan_provenance, server_side_hints
from prune import prune_site
from report_out import emit_annotations, write_summary
from signals import backend_signals, game_signals, unbuilt_template
from site_detect import build_if_needed, copy_site, realtime_server, try_pages_branch

def main():
    start_watchdog()
    repo_url = os.environ.get("INPUT_REPO_URL", "").strip()
    subdir = os.environ.get("INPUT_SUBDIR", "").strip().strip("/")
    build_cmd = os.environ.get("INPUT_BUILD_CMD", "").strip()
    orientation = os.environ.get("INPUT_ORIENTATION", "portrait").strip() or "portrait"
    tags = os.environ.get("INPUT_TAGS", "").strip()
    title_ar = os.environ.get("INPUT_TITLE_AR", "").strip()
    auto_publish = os.environ.get("INPUT_AUTO_PUBLISH", "no").strip().lower()
    prune_mode = os.environ.get("INPUT_PRUNE", "smart").strip().lower()
    if prune_mode not in ("smart", "junk", "off"):
        prune_mode = "smart"
    media_mode = os.environ.get("INPUT_MEDIA", "safe").strip().lower()
    if media_mode not in ("safe", "off"):
        media_mode = "safe"
    work = Path(os.environ.get("WORK_DIR", "work")).resolve()
    out = work / "out"
    if work.exists():
        shutil.rmtree(work)
    out.mkdir(parents=True)

    reasons, warnings, notes = [], [], []

    def finish(status):
        stop_watchdog()
        stage("")  # يغلق المرحلة الأخيرة
        report["timings"] = [{"stage": n, "seconds": t} for n, t in TIMINGS if n]
        report["commands"] = COUNT["commands"]
        report["browser_tests"] = COUNT["browser_tests"]
        notes.append("الأزمنة: " + "؛ ".join(f"{n}: {int(t)}ث" for n, t in TIMINGS if n and t >= 1)
                     + f" (أوامر: {COUNT['commands']}، اختبارات متصفح: {COUNT['browser_tests']})")
        report["status"] = status
        report["reasons"] = reasons
        report["warnings"] = warnings
        report["notes"] = notes
        (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        if status != "fail":
            # ملاحظات الاستيراد تُحفظ مع ملفات اللعبة (games/<slug>/_import_report.json) فيقرؤها تطبيق التحكم دائماً
            try:
                keep = {
                    "date": report.get("date"), "status": status,
                    "source": report.get("repo_url"), "commit": report.get("commit"), "license": report.get("license"),
                    "warnings": warnings, "notes": notes,
                    "console_errors": [str(x)[:300] for x in (report.get("console_errors") or [])[:8]],
                    "failed_requests": [str(x)[:300] for x in (report.get("failed_requests") or [])[:10]],
                    "external_requests": [str(x)[:300] for x in (report.get("external_requests") or [])[:10]],
                    "cover_candidates": report.get("cover_candidates", []),
                    "lint": {k: (report.get("lint") or {}).get(k) for k in ("ran", "checked", "errors")},
                    "fixes": report.get("fixes", {}),
                }
                (site / "_import_report.json").write_text(json.dumps(keep, ensure_ascii=False, indent=1), encoding="utf-8")
            except Exception as e:
                log("تعذّر حفظ ملاحظات الاستيراد:", e)
        write_summary(report)
        emit_annotations(report)
        if status == "fail":
            log("✗ فشل:", "; ".join(reasons))
            sys.exit(1)

    report = {"repo_url": repo_url, "date": datetime.now(timezone.utc).isoformat()}

    pr = parse_repo(repo_url)
    if not pr:
        reasons.append("الرابط ليس رابط مستودع لعبة (https://github.com/صاحب/مستودع) ولا صفحة github.io")
        finish("fail")
    owner, repo = pr
    report.update(owner=owner, repo=repo)

    stage("الرخصة")
    # 1) الرخصة
    try:
        info = api(f"/repos/{owner}/{repo}")
    except Exception as e:
        reasons.append(str(e))
        finish("fail")
    lic = info.get("license") or {}
    spdx = lic.get("spdx_id") if isinstance(lic, dict) else None
    report["license"] = spdx
    if info.get("private"):
        reasons.append("المستودع خاص")
    if not spdx:
        reasons.append("لا توجد رخصة في المستودع (كل الحقوق محفوظة)")
    elif spdx not in ALLOWED:
        reasons.append(f"الرخصة {spdx} غير مسموحة للاستيراد التلقائي")
    if reasons:
        finish("fail")
    notes.append("رخصة المستودع تخص الكود؛ أصل الصور والأصوات يُفحص بإشارات آلية أدناه")
    if spdx in COPYLEFT:
        warnings.append(f"رخصة حقوق متبادلة ({spdx}): أي عمل مشتق يلزمه نشر المصدر بالرخصة نفسها؛ راجعها قبل النشر العام")

    stage("جلب المستودع")
    # 2) الجلب
    src = work / "src"
    run(["git", "clone", "--depth", "1", f"https://github.com/{owner}/{repo}.git", str(src)], timeout=600)
    sha = run(["git", "rev-parse", "HEAD"], cwd=src).stdout.strip().splitlines()[-1]
    try:
        pv = scan_provenance(src)
        prov_notes, prov_warns = provenance_lines(pv)
        report["provenance"] = pv
    except Exception as e:
        pv = None
        prov_notes, prov_warns = [f"تعذّر فحص أصل الوسائط: {e}"], []
    report["commit"] = sha
    report["repo_size_kb"] = int(info.get("size") or 0)
    report["description"] = (info.get("description") or "").strip()
    report["topics"] = info.get("topics") or []
    pushed = (info.get("pushed_at") or "")[:4]
    report["year"] = pushed or str(datetime.now().year)
    report["owner_login"] = (info.get("owner") or {}).get("login", owner)

    stage("البحث/البناء")
    # 3) مجلد الويب
    try:
        webroot = build_if_needed(src, subdir, build_cmd, notes)
    except Exception as e:
        reasons.append(f"فشل البناء: {e}")
        finish("fail")
    if not webroot:
        webroot = try_pages_branch(owner, repo, work, notes)
    if not webroot:
        sh = server_side_hints(src)
        if sh:
            reasons.append("هذا مشروع يحتاج خادماً أو قاعدة بيانات (" + "؛ ".join(sh[:4]) + ") ولا يعمل كموقع ثابت، "
                           "فلا يمكن استضافته على Cloudflare Pages ولا تشغيله في التطبيق. هذه ليست مشكلة في الاستيراد.")
        else:
            reasons.append("لم أجد نسخة ويب (index.html) ولا أمر بناء. قد يكون مشروع Unity/Godot مصدرياً. "
                           "جرّب إدخال subdir أو build_cmd")
        finish("fail")
    rt = realtime_server(src)
    if rt:
        reasons.append("هذه لعبة جماعية تحتاج خادماً لحظياً (" + "، ".join(rt) + ") ولا تعمل كموقع ثابت، "
                       "فلا يمكن استضافتها على Cloudflare Pages ولا تشغيلها في التطبيق. هذه ليست مشكلة في الاستيراد.")
        finish("fail")
    sh_ok = server_side_hints(src)
    if sh_ok:
        warnings.append("المستودع يحوي ملفات خادم (" + "؛ ".join(sh_ok[:4]) + ") لكن الواجهة بُنيت كموقع ثابت. "
                        "قد تعمل اللعبة وحدها وقد تحتاج الخادم لميزات اختيارية؛ جرّبها بـ«تجربة اللعبة» قبل الاعتماد")
    tmpl = unbuilt_template(webroot, src)
    if tmpl:
        reasons.append("هذا موقع/قالب غير مبني (" + "؛ ".join(tmpl) + ") وليس لعبة جاهزة للتشغيل. "
                       "إن كان لعبة حقاً فاستعمل build_cmd أو subdir يشير إلى نسخة مبنية.")
        finish("fail")
    notes.extend(prov_notes)  # ملاحظات أصل الوسائط تظهر فقط للألعاب القابلة للاستيراد
    warnings.extend(prov_warns)

    stage("تنظيف")
    # 4) تنظيف
    site = out / "site"
    big_warn = None
    copy_site(webroot, site)
    s = sanitize(site)
    be = backend_signals(site)
    if be:
        warnings.append("تعتمد على خدمات خارجية (" + "، ".join(be) + "): على الأرجح لن تعمل كاملة داخل التطبيق "
                        "(قد تعلق على شاشة التحميل لأن إعدادات الخادم لم تُضبط وقت البناء). جرّبها قبل الاعتماد")
        report["backend_signals"] = be
    if not game_signals(site):
        warnings.append("لا توجد مؤشرات أن هذا الموقع لعبة (لا canvas ولا requestAnimationFrame ولا مكتبة ألعاب)؛ "
                        "راجعه جيداً قبل الاعتماد")
    report["stats"] = {k: s[k] for k in ("files", "total")}
    if s["files"] > MAX_FILES:
        reasons.append(f"عدد الملفات {s['files']} يتجاوز {MAX_FILES}")
    if s["total"] > MAX_TOTAL_FAIL:
        reasons.append(f"الحجم {s['total'] // 1048576}MB كبير جداً")
    elif s["total"] > MAX_TOTAL_WARN:
        big_warn = f"الحجم كبير قبل تحسين الوسائط: {s['total'] // 1048576}MB"
        warnings.append(big_warn)
    if s["big_files"]:
        reasons.append("ملفات تتجاوز 25MB (حد Cloudflare): " + ", ".join(s["big_files"][:5]))
    if s["removed"]:
        warnings.append(f"أُزيلت {len(s['removed'])} وسوم إعلانات/تتبّع من HTML")
    report["removed_tags"] = s["removed"][:20]
    if HTML_SKIPPED:
        warnings.append("ملفات HTML بترميز غير UTF-8 لم تُعدَّل: " + ", ".join(HTML_SKIPPED[:5]))
    if s["tracker_hits"]:
        warnings.append("إشارات لمواقع إعلانات/تتبّع داخل الكود لم تُزَل (راجعها): " + "؛ ".join(s["tracker_hits"][:6]))
    if s["external_hosts"]:
        warnings.append("روابط لمواقع خارجية: " + ", ".join(s["external_hosts"][:8]))
    sus = scan_suspicious(site)
    report["suspicious"] = sus
    if sus["high"]:
        warnings.append("⛔ أنماط مريبة جداً (راجع الكود قبل أي نشر): " + "؛ ".join(sus["high"][:5]))
    if sus["medium"]:
        notes.append("أنماط تستحق الانتباه: " + "؛ ".join(sus["medium"][:6]))
    if reasons:
        finish("fail")

    stage("عزل التخزين")
    # 4ب) عزل بيانات اللعبة (localStorage/IndexedDB/Cache) عن بقية الألعاب على نفس النطاق
    try:
        import isolate_storage
        n_iso = isolate_storage.inject(site, slugify(repo))
        if n_iso:
            fixed("عزل تخزين اللعبة", n_iso)
            notes.append(f"عُزل تخزين اللعبة عن باقي الألعاب (بادئة khayal:{slugify(repo)}:) في {n_iso} صفحة")
    except Exception as e:
        warnings.append(f"تعذّر عزل التخزين: {str(e)[:100]}")

    stage("ترخيص ومصدر")
    # 5) ترخيص + مصدر داخل مجلد اللعبة
    for fn in os.listdir(src):
        if re.match(r"(?i)^(licen[sc]e|copying|notice)", fn) and (src / fn).is_file():
            shutil.copy2(src / fn, site / fn)

    stage("اختبار المتصفح")
    # 6) اختبار
    shot = out / "_shot.png"
    t = browser_test(site, work, shot, explore=True, seconds=60)
    if t["ran"] and t["missing"]:
        n_alias = fix_case(site, t["missing"])
        if n_alias:
            fixed("نسخ ملفات بحالة الأحرف المطلوبة", n_alias)
            t = browser_test(site, work, shot, explore=True, seconds=60)
    report["test"] = {k: t[k] for k in ("ran", "status_ok", "blank")}
    if t.get("virtual_ms"):
        notes.append(f"لاعب آلي عشوائي: جُرّب نحو {t['virtual_ms'] // 1000} ثانية لعب افتراضية خلال 60 ثانية حقيقية")
    report["console_errors"] = t["console_errors"]
    report["failed_requests"] = t["failed_requests"]
    report["external_requests"] = t["external_requests"]
    if not t["ran"]:
        warnings.append("لم يعمل الاختبار الآلي (Playwright)")
    else:
        if not t["status_ok"]:
            reasons.append("index.html لا يُحمَّل (ليس 200)")
        if t["blank"]:
            reasons.append("الصفحة فارغة بعد 6 ثوانٍ")
        local_fail = [f for f in t["failed_requests"]
                      if re.match(r"^(4|5)\d\d ", f) and "favicon" not in f.lower()]
        if local_fail:
            warnings.append(f"{len(local_fail)} ملفات لم تُحمَّل (404 ونحوه): مثال: {local_fail[0][:100]}")
        if t["console_errors"]:
            warnings.append(f"{len(t['console_errors'])} أخطاء في الكونسول، أولها: {t['console_errors'][0][:100]}")
    if reasons:
        finish("fail")

    stage("الغلاف")
    # 6-0) نبحث عن الغلاف الآن (قبل تقليل الملفات وتحسين الوسائط) كي تبقى الأسماء والملفات الأصلية
    cover_pick = None
    try:
        import cover_finder
        cover_pick = cover_finder.choose(site, src, t.get("used", []), work,
                                         title_shot=shot.with_name("_title.png"), final_shot=shot,
                                         blank=bool(t.get("blank")))
        report["cover_candidates"] = cover_pick.get("top", [])
    except Exception as e:
        warnings.append(f"تعذّر البحث عن الغلاف: {str(e)[:120]}")

    stage("تقليل الملفات")
    # 6أ) تقليل الملفات
    files_before = sum(len(f) for _, _, f in os.walk(site))
    if spdx in COPYLEFT and prune_mode != "off":
        notes.append(f"رخصة {spdx}: لم تُحذف أي ملفات (يجب إتاحة المصدر كاملاً)")
        prune_mode = "off"
    if prune_mode != "off" and t["ran"]:
        pr = prune_site(site, work, shot, t, prune_mode)
        n_rm = len(pr["removed"])
        report["prune"] = {"mode": prune_mode, "removed": n_rm, "bytes": pr["bytes"],
                           "restored": pr["restored"], "rolled_back": pr["rolled_back"]}
        if pr["rolled_back"]:
            warnings.append("حذف الملفات سبّب أخطاء في الاختبار فتم التراجع عنه كاملاً (اللعبة بقيت كما هي)")
        elif n_rm:
            files_after = sum(len(f) for _, _, f in os.walk(site))
            notes.append(f"تقليل الملفات: حُذف {n_rm} ملفاً ({pr['bytes'] // 1024} KB)؛ من {files_before} إلى {files_after}"
                         + (f"؛ استُعيد {pr['restored']} ملفاً تبيّن أن اللعبة تطلبه" if pr["restored"] else ""))
            (out / "pruned.txt").write_text(
                "\n".join(f"{sz}\t{rel}" for rel, sz in pr["removed"]), encoding="utf-8")
            fixed("حذف ملفات غير لازمة", n_rm)
        else:
            notes.append("تقليل الملفات: لا ملفات يمكن حذفها بأمان")

    stage("تحسين الوسائط")
    # 6أ-2) تحسين الوسائط (صور/صوت/فيديو/خطوط)
    if media_mode != "off" and t["ran"]:
        if spdx in COPYLEFT:
            notes.append(f"رخصة {spdx}: لم تُحسَّن الوسائط")
        else:
            try:
                import optimize_media
                size_before = sum(f.stat().st_size for f in site.rglob("*") if f.is_file())
                mo = optimize_media.optimize(
                    site, work, lambda: browser_test(site, work, shot, explore=True, seconds=40), t)
                size_after = sum(f.stat().st_size for f in site.rglob("*") if f.is_file())
                report["media"] = {"stages": mo["stages"], "before": size_before, "after": size_after}
                if mo["skipped_reason"]:
                    notes.append("تحسين الوسائط: " + mo["skipped_reason"])
                names = {"image": "صور", "audio": "صوت", "video": "فيديو", "font": "خطوط"}
                for st in mo["stages"]:
                    if st["rolled_back"]:
                        warnings.append(f"تحسين {names[st['kind']]} سبّب أخطاء في الاختبار فتم التراجع عنه")
                    elif st["converted"]:
                        notes.append(f"تحسين {names[st['kind']]}: {st['converted']} ملفاً، وفّر {st['saved'] // 1024} KB"
                                     + (f"؛ استُعيد {st['restored']} أصلياً تبيّن أن اللعبة تطلبه" if st["restored"] else ""))
                        fixed("تحسين وسائط " + names[st["kind"]], st["converted"])
                if big_warn and size_after <= MAX_TOTAL_WARN and big_warn in warnings:
                    warnings.remove(big_warn)  # لم يعد الحجم كبيراً بعد التحسين
                    notes.append(f"زال تحذير الحجم بعد تحسين الوسائط ({size_after // 1048576}MB)")
                if size_before > size_after:
                    notes.append(f"حجم اللعبة بعد تحسين الوسائط: {size_before // 1048576}MB ← {size_after // 1048576}MB "
                                 "(الاختبار الآلي لا يغطي كل المراحل؛ جرّب اللعبة بنفسك)")
            except Exception as e:
                warnings.append(f"تعذّر تحسين الوسائط: {str(e)[:120]}")

    stage("فحص JavaScript")
    # 6ب) فحص JavaScript (تقرير فقط)
    lint = lint_js(site, work)
    report["lint"] = lint
    if lint.get("error"):
        warnings.append(lint["error"])
    elif lint["errors"]:
        warnings.append(f"ESLint: {lint['errors']} أخطاء برمجية في {lint['checked']} ملفات، أولها: {lint['samples'][0]}")
    elif lint["ran"]:
        notes.append(f"ESLint: لا أخطاء في {lint['checked']} ملفات")
    if lint["skipped"]:
        notes.append(f"{lint['skipped']} ملفات JS مصغّرة أو من مكتبات معروفة لم تُفحص")

    # سجل التعديلات التلقائية
    for k, v in FIXES.items():
        notes.append(f"تعديل تلقائي: {k} × {v}")
    report["fixes"] = dict(FIXES)
    (site / "SOURCE.txt").write_text(
        f"Source: https://github.com/{owner}/{repo}\nCommit: {sha}\nLicense: {spdx}\n"
        f"Imported: {report['date']}\nAutomated changes (see report): {json.dumps(FIXES, ensure_ascii=False)}\n"
        + ("\nMedia provenance (automated signals, not a legal guarantee):\n"
           + "".join(f"- {x}\n" for x in (pv["claims"] + pv["authors"] + pv["restrictive"]))
           + f"- images: {pv['images']}, audio: {pv['audio']}, tagged audio: {pv['tagged_audio']}\n" if pv else ""),
        encoding="utf-8")

    stage("إخراج الغلاف")
    # 7) الغلاف: نجهّزه بمكتبة Pillow (تصغير دون قصّ، وخلفية مموّهة إن لم تناسب نسبة البطاقة)
    cover_name = ""
    if cover_pick and cover_pick.get("path"):
        try:
            import cover_finder
            cover_name = cover_finder.render(cover_pick["path"], site / "_cover")
            if cover_pick.get("fallback"):
                warnings.append(cover_pick["note"])
            else:
                notes.append(cover_pick["note"])
        except Exception as e:
            warnings.append(f"تعذّر تجهيز الغلاف: {str(e)[:120]}")
            ext = Path(cover_pick["path"]).suffix.lower() or ".png"
            cover_name = "_cover" + ext
            shutil.copy2(cover_pick["path"], site / cover_name)
    if not cover_name:
        warnings.append("لا توجد صورة غلاف ولا لقطة شاشة صالحة")

    slug = slugify(repo)
    meta = {
        "slug": slug, "title_en": pretty_title(repo), "title_ar": title_ar,
        "description": report["description"], "developer": report["owner_login"],
        "license": spdx, "source_url": f"https://github.com/{owner}/{repo}",
        "orientation": orientation if orientation in ("portrait", "landscape", "both") else "portrait",
        "tags": [x.strip() for x in re.split(r"[,،]", tags) if x.strip()] or report["topics"][:3],
        "year": report["year"], "repo_size_kb": report.get("repo_size_kb", 0), "cover_name": cover_name, "auto_publish": auto_publish,
        "suspicious_high": report.get("suspicious", {}).get("high", []),
    }
    (out / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    report["slug"] = slug
    finish("warn" if warnings else "ok")


if __name__ == "__main__":
    main()
