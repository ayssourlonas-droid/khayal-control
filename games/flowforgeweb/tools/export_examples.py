"""Abre cada examples/*.flowmobile no IDE e salva o HTML exportado em tools/_out/exemplos_html/.
Uso: python tools/export_examples.py"""
import glob, os
import common
from playwright.sync_api import sync_playwright

dest = common.OUT + "/exemplos_html"; os.makedirs(dest, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for f in sorted(glob.glob(common.ROOT + "/examples/*.flowmobile")):
        name = os.path.basename(f)[:-11]
        ctx = b.new_context(viewport={"width": 1400, "height": 950}); pg = ctx.new_page()
        pg.route("**/*", lambda r: r.continue_() if r.request.url.startswith(("http://localhost", "data:", "about:", "blob:")) else r.abort())
        pg.goto(common.URL + "/index.html"); pg.wait_for_timeout(400)
        pg.evaluate("FlowForgeI18n.setLanguage('pt-BR');document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
        pg.set_input_files("#fileInput", f); pg.wait_for_timeout(700)
        html = pg.evaluate("FlowForgeImageAssets.resolveHtml(generated())")
        open(f"{dest}/{name}.html", "w", encoding="utf-8").write(html)
        ctx.close()
    b.close()
print("exportados:", len(glob.glob(dest + "/*.html")), "→", dest)
