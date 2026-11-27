#!/usr/bin/env python3
"""يضيف مسارات الترجمة الجديدة إلى سجل الفيلم في data_films.json (مستودع البيانات)، بعد بوابة الرخصة:
الترجمة تعديل (Adaptation) فلا تُضاف إلا لرخصة تسمح بها. وللرخص التي تشترط إعلان التعديل يُضاف إلى سطر الاعتماد."""
import base64
import json
import os
import sys
import urllib.request

FILM_ID = os.environ["FILM_ID"].strip()
EPISODE = os.environ.get("EPISODE", "").strip()
REPO = os.environ.get("DATA_REPO") or os.environ["GITHUB_REPOSITORY"]
BRANCH = os.environ.get("DATA_BRANCH") or os.environ.get("GITHUB_REF_NAME") or "main"
TOKEN = os.environ.get("PUBLISH_TOKEN") or os.environ.get("GITHUB_TOKEN", "")
BASE_URL = (os.environ.get("HOST_BASE_URL") or "").rstrip("/")
HOST_REPO = os.environ.get("HOST_REPO") or os.environ["GITHUB_REPOSITORY"]
FILE = "data_films.json"

# الرخص التي تسمح بالتعديل (الترجمة): المحجوب منها NC/ND وغير المعروف
OK = {"CC0-1.0", "PUBLIC-DOMAIN", "OWNED", "PARTNER", "CC-BY-4.0", "CC-BY-3.0", "CC-BY-SA-4.0", "CC-BY-SA-3.0"}
NEED_NOTICE = {"CC-BY-4.0", "CC-BY-3.0", "CC-BY-SA-4.0", "CC-BY-SA-3.0"}
LANG_AR = {"ar": "العربية", "en": "English", "fr": "Français", "es": "Español", "pt": "Português", "de": "Deutsch",
           "ru": "Русский", "tr": "Türkçe", "hi": "हिन्दी", "zh": "中文", "zh-CN": "中文"}


def api(method, path, body=None):
    req = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}/contents/{path}" + (f"?ref={BRANCH}" if method == "GET" else ""),
        data=json.dumps(body).encode() if body else None, method=method,
        headers={"Authorization": f"Bearer {TOKEN}", "Accept": "application/vnd.github+json",
                 "Content-Type": "application/json", "User-Agent": "khayal-subs"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def main():
    rep = json.load(open("out/report.json", encoding="utf-8"))
    if EPISODE:
        print("::notice::حلقة مسلسل: رُفعت الملفات ولم يُعدَّل السجل (دعم الحلقات في السجل لم يُبنَ بعد)")
        for f in rep["files"]:
            print(f"  {f['lang']}: {f['path']}")
        return
    cur = api("GET", FILE)
    films = json.loads(base64.b64decode(cur["content"]).decode("utf-8"))
    film = next((f for f in films if str(f.get("id")) == FILM_ID), None)
    if film is None:
        sys.exit(f"::error::الفيلم {FILM_ID} غير موجود في {FILE}: احفظه من تطبيق المتحكم أولاً ثم أعد التشغيل")
    d = film.setdefault("details_scene", {})
    lic = str(d.get("license", ""))
    if lic not in OK:
        sys.exit(f"::error::رخصة الفيلم ({lic or 'فارغة'}) لا تسمح بالتعديل/الترجمة: لم يُضف شيء إلى السجل")

    root = BASE_URL or f"https://raw.githubusercontent.com/{HOST_REPO}/{BRANCH}"
    tracks = [t for t in (d.get("subtitle_tracks") or []) if isinstance(t, dict)]
    for f in rep["files"]:
        tracks = [t for t in tracks if t.get("lang") != f["lang"]]
        tracks.append({"lang": f["lang"], "title": LANG_AR.get(f["lang"], f["lang"]) + " (آلية)", "url": f"{root}/{f['path']}"})
    d["subtitle_tracks"] = tracks
    d.pop("subtitle_url", None)
    if lic in NEED_NOTICE and "ترجمة آلية" not in str(d.get("credit", "")):
        d["credit"] = (str(d.get("credit", "")).rstrip() + " • تم التعديل: ترجمة آلية").strip(" •")
    api("PUT", FILE, {"message": f"film {FILM_ID}: subtitles {','.join(f['lang'] for f in rep['files'])} [skip ci] [CF-Pages-Skip]",
                      "content": base64.b64encode(json.dumps(films, ensure_ascii=False, indent=2).encode("utf-8")).decode(),
                      "sha": cur["sha"], "branch": BRANCH})
    print(f"::notice::أُضيفت {len(rep['files'])} ترجمة إلى سجل الفيلم {FILM_ID}")


if __name__ == "__main__":
    main()
