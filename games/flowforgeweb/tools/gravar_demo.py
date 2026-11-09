"""Grava um vídeo do FlowForge WebStudio sendo usado de verdade: cria um app do zero (assistente de novo projeto,
componentes, propriedades, código, Preview) com cursor visível, cliques destacados e legendas.

Uso:  python tools/gravar_demo.py [pasta_de_saída]     (gera demo_flowforge.mp4 e o app em demo_contador.flowmobile)
Requer Playwright (Chromium) e ffmpeg."""
import sys, os, json, glob, shutil, subprocess, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else common.OUT
os.makedirs(OUT, exist_ok=True)
W, H = 1440, 810

OVERLAY = r"""
(()=>{
 if(window.__demo) return;
 const css=document.createElement('style');
 css.textContent=`
 #demoCur{position:fixed;left:0;top:0;width:26px;height:26px;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px);filter:drop-shadow(0 2px 3px rgba(0,0,0,.55))}
 #demoCap{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:2147483646;pointer-events:none;background:rgba(10,14,24,.88);color:#fff;font:600 22px/1.3 system-ui,sans-serif;padding:12px 24px;border-radius:12px;border:1px solid rgba(255,255,255,.18);max-width:80vw;text-align:center;transition:opacity .25s;opacity:0}
 #demoCap.on{opacity:1}
 .demoRip{position:fixed;z-index:2147483645;pointer-events:none;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:3px solid #38bdf8;animation:demoRip .55s ease-out forwards}
 @keyframes demoRip{to{transform:scale(4.2);opacity:0}}
 #demoTitle{position:fixed;inset:0;z-index:2147483647;background:linear-gradient(135deg,#0b1020,#1e2a5a);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;text-align:center;transition:opacity .6s}
 #demoTitle h1{font-size:54px;margin:0 0 14px}#demoTitle p{font-size:24px;margin:0;color:#c7d2fe}`;
 document.head.appendChild(css);
 const cur=document.createElement('div');cur.id='demoCur';
 cur.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M3 2l7.6 19 2.7-7.7L21 10.6z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
 const cap=document.createElement('div');cap.id='demoCap';
 const tt=document.createElement('div');tt.id='demoTitle';
 tt.innerHTML='<h1>FlowForge WebStudio</h1><p>Criando um app do zero, passo a passo</p>';
 document.body.append(cur,cap,tt);
 window.__demo={x:-100,y:-100,
  cap(t){cap.textContent=t||'';cap.classList.toggle('on',!!t)},
  title(on){tt.style.opacity=on?1:0;tt.style.pointerEvents=on?'auto':'none'},
  move(x,y,ms){return new Promise(res=>{const x0=this.x,y0=this.y,t0=performance.now();const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
   const f=n=>{const k=Math.min(1,(n-t0)/ms),e=ease(k);this.x=x0+(x-x0)*e;this.y=y0+(y-y0)*e;cur.style.transform='translate('+this.x+'px,'+this.y+'px)';k<1?requestAnimationFrame(f):res()};requestAnimationFrame(f)})},
  rip(){const r=document.createElement('div');r.className='demoRip';r.style.left=this.x+'px';r.style.top=this.y+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),700)}};
})()
"""

def main():
    tmp = tempfile.mkdtemp(prefix='ffvideo_')
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = b.new_context(viewport={'width': W, 'height': H}, record_video_dir=tmp, record_video_size={'width': W, 'height': H})
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('http://localhost', 'data:', 'about:', 'blob:')) else r.abort())
        pg.goto(common.URL + '/index.html'); pg.wait_for_timeout(500)
        pg.evaluate("FlowForgeI18n.setLanguage('pt-BR')"); pg.evaluate(OVERLAY); pg.wait_for_timeout(300)
        pg.evaluate("__demo.title(true)")

        # ---------- ajudantes ----------
        def wait(ms): pg.wait_for_timeout(ms)
        def cap(t, ms=0):
            pg.evaluate("t=>__demo.cap(t)", t)
            if ms: wait(ms)
        def center(sel, nth=0):
            bb = pg.locator(sel).nth(nth).bounding_box()
            return bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
        def go(x, y, ms=650):
            pg.evaluate("([x,y,ms])=>__demo.move(x,y,ms)", [x, y, ms]); pg.mouse.move(x, y)
        def click_xy(x, y):
            go(x, y); wait(120); pg.evaluate("__demo.rip()"); pg.mouse.click(x, y); wait(350)
        def click(sel, nth=0):
            x, y = center(sel, nth); click_xy(x, y)
        def dbl(sel, nth=0):
            x, y = center(sel, nth); go(x, y); wait(120); pg.evaluate("__demo.rip()"); pg.mouse.dblclick(x, y); wait(500)
        def field(sel, text, delay=55):
            x, y = center(sel); click_xy(x, y); pg.keyboard.press('Control+a'); pg.keyboard.type(text, delay=delay); pg.keyboard.press('Tab'); wait(250)
        def tool(kind): click(f'#tools button[data-kind={kind}]')
        def tab(name): click(f'#tabs button[data-tab={name}]'); wait(400)

        # ---------- 1. novo projeto ----------
        wait(1800); pg.evaluate("__demo.title(false)"); wait(800)
        cap('1. Novo projeto: escolha "App HTML5" (mobile / PWA)', 600)
        click('#newDlg button >> nth=0'); wait(700)
        cap('2. O assistente define a estrutura: nome da página e navegação', 400)
        pg.select_option('#wizNavigation', 'none'); wait(500)
        field('#wizPageNames', 'Contador'); wait(500)
        click('#wizCreate'); wait(900)

        # ---------- 2. componentes e propriedades ----------
        cap('3. Clique num componente da caixa de ferramentas para adicioná-lo', 500)
        tool('heading'); cap('4. As propriedades ficam no painel da direita: texto, posição e tamanho', 300)
        field('#pText', 'Contador de Cliques'); field('#pX', '20'); field('#pY', '76'); field('#pWidth', '350'); field('#pHeight', '50')
        cap('5. Um rótulo para mostrar o valor', 300)
        tool('label'); field('#pName', 'lblContador'); field('#pText', 'Cliques: 0'); field('#pX', '20'); field('#pY', '146'); field('#pWidth', '350'); field('#pHeight', '70')
        cap('6. Dois botões: contar e zerar', 300)
        tool('button'); field('#pName', 'btnContar'); field('#pText', 'Contar +1'); field('#pX', '20'); field('#pY', '246'); field('#pWidth', '350'); field('#pHeight', '56')
        tool('button'); field('#pName', 'btnZerar'); field('#pText', 'Zerar'); field('#pX', '20'); field('#pY', '318'); field('#pWidth', '350'); field('#pHeight', '50')
        cap('O visual está pronto. Falta a lógica', 1500)

        # ---------- 3. código ----------
        cap('7. Duplo clique no botão abre o evento click() no editor de código', 500)
        dbl('#stage .ff-kind-button', 0)
        cap('8. Escrevendo a ação do botão "Contar +1"', 300)
        pg.keyboard.type("window.contagem = (window.contagem || 0) + 1;\nlblContador.textContent = 'Cliques: ' + window.contagem;", delay=38); wait(900)
        tab('design'); cap('9. Agora o botão "Zerar"', 300)
        dbl('#stage .ff-kind-button', 1)
        pg.keyboard.type("window.contagem = 0;\nlblContador.textContent = 'Cliques: 0';", delay=38); wait(900)

        # ---------- 4. preview ----------
        cap('10. Aba Preview: o app roda de verdade, dentro do IDE', 400)
        tab('preview'); wait(900)
        fr = pg.frame_locator('#preview')
        def pclick(i):
            bb = fr.locator('button:has-text("%s")' % ('Contar +1' if i == 0 else 'Zerar')).first.bounding_box(); click_xy(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2)
        cap('Cada clique em "Contar +1" atualiza o rótulo', 300)
        for _ in range(4): pclick(0); wait(350)
        wait(700); cap('"Zerar" volta a zero', 300); pclick(1); wait(1200)

        # ---------- 5. exportar ----------
        cap('11. Pronto para publicar: o menu Exportar gera HTML e, em projetos de app, também o pacote Android (APK)', 400)
        click('#exportMenuBtn'); wait(2600)
        pg.keyboard.press('Escape'); pg.evaluate("document.body.click()"); wait(500)
        cap('Esse app foi feito sem escrever HTML. Obrigado por assistir!', 2800)

        proj = pg.evaluate("JSON.stringify(project,null,2)") if pg.evaluate("typeof project!=='undefined'") else None
        pg.close(); ctx.close(); b.close()
    vids = glob.glob(os.path.join(tmp, '*.webm'))
    if errs: print('ERROS JS durante a gravação:', errs)
    src = vids[0]; dst = os.path.join(OUT, 'demo_flowforge.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst], check=True)
    if proj: open(os.path.join(OUT, 'demo_contador.flowmobile'), 'w', encoding='utf-8').write(proj)
    shutil.rmtree(tmp, ignore_errors=True)
    print('vídeo:', dst, '| app:', os.path.join(OUT, 'demo_contador.flowmobile') if proj else '(sem projeto)')

main()
