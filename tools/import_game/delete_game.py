#!/usr/bin/env python3
"""حذف لعبة من جذورها: سجلها في القوائم الثلاث + مجلدها games/<slug>/ + فهرس الاستيراد + صفحة الحقوق.
بعده يصبح المستودع كأن اللعبة لم تُستورد قط (يُنفَّذ من workflow: delete-game.yml).
المتغيرات: GAME_ID (إلزامي)، PLAY_URL (اختياري، لاستنتاج المجلد)."""
import os
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "import_game"))
import publish as pub  # noqa: E402  (load/save/write_credits والثوابت)

ROOT = Path(os.environ.get("REPO_DIR", ".")).resolve()
INDEX = "data_import_index.json"
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,80}$")


def slug_of(url):
    m = re.search(r"/games/([a-z0-9][a-z0-9-]*)/?", str(url or ""))
    return m.group(1) if m else ""


def say(lines):
    txt = "\n".join(lines)
    print(txt)
    p = os.environ.get("GITHUB_STEP_SUMMARY")
    if p:
        with open(p, "a", encoding="utf-8") as f:
            f.write(txt + "\n")


def main():
    gid = os.environ.get("GAME_ID", "").strip()
    if not re.fullmatch(r"\d+", gid):
        raise SystemExit("GAME_ID غير صالح")
    files = {n: ROOT / n for n in (pub.GAMES, pub.FEATURED, pub.PENDING)}
    lists = {n: pub.load(p) for n, p in files.items()}
    index = pub.load(ROOT / INDEX)

    slug = slug_of(os.environ.get("PLAY_URL", ""))
    found = [e for lst in lists.values() for e in lst if str(e.get("id")) == gid]
    for e in found:
        s = slug_of((e.get("details_scene") or {}).get("play_url"))
        if s:
            if slug and s != slug:
                raise SystemExit(f"تعارض: رابط اللعبة يشير إلى {slug} بينما سجلها يشير إلى {s}؛ لن أحذف شيئاً")
            slug = s
    if not slug:
        for e in index:
            if str(e.get("id")) == gid and e.get("slug"):
                slug = e["slug"]
    if slug and not SLUG_RE.match(slug):
        raise SystemExit(f"اسم مجلد غير آمن: {slug}")

    gdir = (ROOT / "games" / slug) if slug else None
    if not found and not (gdir and gdir.is_dir()) and not any(str(e.get("id")) == gid for e in index):
        raise SystemExit(f"لم أجد اللعبة id={gid}: لا سجل ولا مجلد")

    removed = []
    for n in lists:
        before = len(lists[n])
        lists[n] = [e for e in lists[n]
                    if str(e.get("id")) != gid
                    and not (slug and slug_of((e.get("details_scene") or {}).get("play_url")) == slug)]
        if len(lists[n]) != before:
            pub.save(files[n], lists[n])
            removed.append(f"{n}: {before - len(lists[n])}")
    n_idx = len(index)
    index = [e for e in index if str(e.get("id")) != gid and not (slug and e.get("slug") == slug)]
    if len(index) != n_idx:
        pub.save(ROOT / INDEX, index)
        removed.append(f"{INDEX}: {n_idx - len(index)}")
    if gdir and gdir.is_dir():
        if gdir.resolve().parent != (ROOT / "games").resolve():
            raise SystemExit("مسار المجلد خارج games/؛ توقفت")
        n_files = sum(1 for f in gdir.rglob("*") if f.is_file())
        shutil.rmtree(gdir)
        removed.append(f"games/{slug}/: {n_files} ملفاً")
    if (ROOT / "legal").is_dir() or index:
        pub.write_credits(ROOT, index)
        removed.append("legal/credits (أُعيد توليدها)")
    say(["## تم الحذف الجذري", f"اللعبة id={gid}" + (f" (المجلد {slug})" if slug else "")] + [f"- {r}" for r in removed])


if __name__ == "__main__":
    main()
