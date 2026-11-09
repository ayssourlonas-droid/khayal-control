"""Roda as suítes HTML de tests/ (uma ou todas).   Uso: python tools/run_suites.py [nome ...]"""
import glob, os, sys
import common
from playwright.sync_api import sync_playwright

names = sys.argv[1:] or sorted(os.path.basename(f)[:-10] for f in glob.glob(common.ROOT + "/tests/*_test.html"))
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for name in names:
        pg = b.new_page(viewport={"width": 1800, "height": 1000}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(f"{common.URL}/tests/{name}_test.html")
        pg.wait_for_function("document.body.dataset.test", timeout=240000)
        ok = pg.evaluate("document.body.dataset.test") == "PASS"
        resumo = pg.inner_text("#summary") if pg.query_selector("#summary") else ("PASS" if ok else "FAIL")
        print(("✓" if ok else "✗"), f"{name:26s}", resumo)
        for l in (pg.inner_text("#out") if pg.query_selector("#out") else "").split("\n"):
            if l.startswith(("FAIL", "ERRO")): print("     ", l[:300])
        if errs: print("      erros JS:", errs[:3])
        bad += (not ok); pg.close()
    b.close()
sys.exit(1 if bad else 0)
