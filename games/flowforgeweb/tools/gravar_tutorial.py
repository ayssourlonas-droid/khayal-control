"""Grava um VÍDEO-TUTORIAL do FlowForge WebStudio: cria do zero o Jogo da Memória (3 níveis, tabuleiro criado por código,
jogadas, cronômetro e recorde salvo), em capítulos, com cartões de título, legendas explicativas, cursor visível e
o código digitado ao vivo em blocos. O código vem de tools/gerar_exemplos/memoria_codigo.py (o mesmo do exemplo Memoria_Avancada).

Uso:  python tools/gravar_tutorial.py [pasta_de_saída]      -> tutorial_memoria.mp4, tutorial_memoria.flowmobile, capitulos.txt
      FF_RAPIDO=1 python tools/gravar_tutorial.py ...        -> ensaio rápido (sem esperas), com capturas de tela por capítulo
Requer Playwright (Chromium) e ffmpeg."""
import sys, os, glob, shutil, subprocess, tempfile, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, 'gerar_exemplos'))
import common
import memoria_codigo as M
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else common.OUT
os.makedirs(OUT, exist_ok=True)
FAST = bool(os.environ.get('FF_RAPIDO'))
W, H = 1440, 810
K = .08 if FAST else 1.0            # escala das esperas
TYPE = 1 if FAST else 0             # atraso extra por caractere (o editor já leva ~45 ms por tecla)
TYPE_UI = 1 if FAST else 45         # ms por caractere nos campos

OVERLAY = r"""
(()=>{
 if(window.__demo) return;
 const css=document.createElement('style');
 css.textContent=`
 #demoCur{position:fixed;left:0;top:0;width:26px;height:26px;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px);filter:drop-shadow(0 2px 3px rgba(0,0,0,.55))}
 #demoCap{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483646;pointer-events:none;background:rgba(10,14,24,.9);color:#fff;font:600 21px/1.35 system-ui,sans-serif;padding:12px 24px;border-radius:12px;border:1px solid rgba(255,255,255,.18);width:max-content;max-width:74vw;text-align:center;transition:opacity .25s;opacity:0}
 #demoCap.on{opacity:1}
 #demoBadge{position:fixed;left:14px;top:12px;z-index:2147483646;pointer-events:none;background:#2563eb;color:#fff;font:700 15px/1 system-ui,sans-serif;padding:8px 14px;border-radius:999px;opacity:0;transition:opacity .3s;box-shadow:0 2px 8px rgba(0,0,0,.35)}
 #demoBadge.on{opacity:1}
 .demoRip{position:fixed;z-index:2147483645;pointer-events:none;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:3px solid #38bdf8;animation:demoRip .55s ease-out forwards}
 @keyframes demoRip{to{transform:scale(4.2);opacity:0}}
 #demoCard{position:fixed;inset:0;z-index:2147483647;background:linear-gradient(135deg,#0b1020,#1e2a5a);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;text-align:center;transition:opacity .5s;padding:40px}
 #demoCard h1{font-size:52px;margin:0 0 16px}#demoCard h2{font-size:22px;margin:0 0 10px;color:#93c5fd;letter-spacing:.14em;text-transform:uppercase}
 #demoCard p{font-size:24px;margin:6px 0;color:#c7d2fe}#demoCard ul{list-style:none;padding:0;margin:18px 0 0;font-size:25px;line-height:1.7;text-align:left;color:#e0e7ff}
 #demoCard li::before{content:'✓  ';color:#4ade80;font-weight:700}`;
 document.head.appendChild(css);
 const cur=document.createElement('div');cur.id='demoCur';
 cur.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M3 2l7.6 19 2.7-7.7L21 10.6z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
 const cap=document.createElement('div');cap.id='demoCap';
 const badge=document.createElement('div');badge.id='demoBadge';
 const card=document.createElement('div');card.id='demoCard';
 document.body.append(cur,cap,badge,card);
 window.__demo={x:-100,y:-100,
  cap(t){cap.textContent=t||'';cap.classList.toggle('on',!!t)},
  badge(t){badge.textContent=t||'';badge.classList.toggle('on',!!t)},
  card(html){if(html){card.innerHTML=html;card.style.opacity=1;card.style.pointerEvents='auto'}else{card.style.opacity=0;card.style.pointerEvents='none'}},
  move(x,y,ms){return new Promise(res=>{const x0=this.x,y0=this.y,t0=performance.now();const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
   const f=n=>{const k=Math.min(1,(n-t0)/ms),e=ease(k);this.x=x0+(x-x0)*e;this.y=y0+(y-y0)*e;cur.style.transform='translate('+this.x+'px,'+this.y+'px)';k<1?requestAnimationFrame(f):res()};requestAnimationFrame(f)})},
  rip(){const r=document.createElement('div');r.className='demoRip';r.style.left=this.x+'px';r.style.top=this.y+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),700)}};
})()
"""

def main():
    tmp = tempfile.mkdtemp(prefix='fftut_')
    marks = []
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = b.new_context(viewport={'width': W, 'height': H}, record_video_dir=tmp, record_video_size={'width': W, 'height': H})
        pg = ctx.new_page(); errs = []
        t0 = time.time()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('http://localhost', 'data:', 'about:', 'blob:')) else r.abort())
        pg.goto(common.URL + '/index.html'); pg.wait_for_timeout(500)
        pg.evaluate("FlowForgeI18n.setLanguage('pt-BR')"); pg.evaluate(OVERLAY)
        pg.evaluate("__demo.card('<h1>FlowForge WebStudio</h1>')"); pg.wait_for_timeout(400)

        # ---------- ajudantes ----------
        def wait(ms): pg.wait_for_timeout(int(ms * K))
        def reading(text): return max(1700, len(text) * 62)
        def cap(t, hold=None):
            pg.evaluate("t=>__demo.cap(t)", t); wait(reading(t) if hold is None else hold)
        def nocap(): pg.evaluate("__demo.cap('')")
        def shot(n):
            if FAST: pg.screenshot(path=os.path.join(OUT, f'ensaio_{n}.png'))
        def center(sel, nth=0):
            loc = pg.locator(sel).nth(nth); loc.scroll_into_view_if_needed(); wait(250)
            bb = loc.bounding_box()
            return bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
        def go(x, y, ms=620):
            pg.evaluate("([x,y,ms])=>__demo.move(x,y,ms)", [x, y, 40 if FAST else ms]); pg.mouse.move(x, y)
        def click_xy(x, y, after=330):
            go(x, y); wait(110); pg.evaluate("__demo.rip()"); pg.mouse.click(x, y); wait(after)
        def click(sel, nth=0): x, y = center(sel, nth); click_xy(x, y)
        def dbl(sel, nth=0):
            x, y = center(sel, nth); go(x, y); wait(120); pg.evaluate("__demo.rip()"); pg.mouse.dblclick(x, y); wait(600)
        def field(sel, text, nth=0):
            x, y = center(sel, nth); click_xy(x, y, 150); pg.keyboard.press('Control+a'); pg.keyboard.type(text, delay=TYPE_UI); pg.keyboard.press('Tab'); wait(200)
        def tool(kind): click(f'#tools button[data-kind={kind}]')
        def tab(name): click(f'#tabs button[data-tab={name}]'); wait(400)
        def typecode(code):
            """Digita código linha a linha; Esc antes do Enter evita que o autocompletar roube o Enter."""
            lines = code.rstrip('\n').split('\n')
            for i, ln in enumerate(lines):
                pg.keyboard.type(ln, delay=TYPE)
                if i < len(lines) - 1: pg.keyboard.press('Escape'); pg.keyboard.press('Enter')
            pg.keyboard.press('Escape')
        def chapter(n, title, sub, total=6):
            marks.append((time.time() - t0, f'Capítulo {n}: {title}'))
            pg.evaluate("__demo.cap('');__demo.badge('')")
            pg.evaluate("h=>__demo.card(h)", f'<h2>Capítulo {n} de {total}</h2><h1>{title}</h1><p>{sub}</p>'); wait(2600)
            pg.evaluate("__demo.card('')"); wait(600)
            pg.evaluate("t=>__demo.badge(t)", f'{n}/{total} · {title}')

        try:
            # ---------- introdução ----------
            marks.append((0, 'Introdução'))
            pg.evaluate("""h=>__demo.card(h)""", '<h2>Tutorial</h2><h1>Criando um Jogo da Memória</h1><p>no FlowForge WebStudio, do zero ao jogo funcionando</p>'
                        '<ul><li>Interface com componentes e propriedades</li><li>Tabuleiro criado por código (3 níveis)</li><li>Jogadas, cronômetro e recorde salvo</li><li>Eventos, Preview e exportação</li></ul>')
            wait(7500); pg.evaluate("__demo.card('')"); wait(700)

            # ---------- 1. projeto ----------
            chapter(1, 'Novo projeto', 'Escolha o tipo e a estrutura inicial')
            cap('Ao abrir o FlowForge, escolha o tipo de projeto. Para um jogo de celular, use "App HTML5".')
            click('#newDlg button >> nth=0'); wait(700)
            cap('O assistente define a estrutura: navegação, framework e as páginas. Teremos uma só página, "Jogo", e sem navegação.')
            pg.select_option('#wizNavigation', 'none'); wait(500)
            field('#wizPageNames', 'Jogo'); wait(400)
            click('#wizCreate'); wait(900); nocap()
            cap('Dê um nome ao projeto no painel da direita.', 1500)
            field('#projectName', 'Jogo da Memória'); shot('1')

            # ---------- 2. interface ----------
            chapter(2, 'Montando a interface', 'Componentes, nomes e propriedades')
            cap('Clique num componente da caixa de ferramentas para adicioná-lo. Todo componente tem Nome, Texto, posição (X, Y) e tamanho.')
            for kind, name, text, x, y, w, h in M.UI:
                if kind == 'heading':
                    tool(kind); field('#pText', text)
                else:
                    tool(kind); field('#pName', name)
                    if text: field('#pText', text)
                field('#pX', str(x)); field('#pY', str(y)); field('#pWidth', str(w)); field('#pHeight', str(h))
                if name == 'heading1': cap('O título do jogo.', 900)
                if name == 'lblRecorde': cap('Três rótulos para o placar. Dica: use prefixos (lbl, sel, btn) nos nomes: é assim que você os chamará no código.')
                if name == 'selNivel':
                    cap('A lista de níveis. Em "Itens (JSON)" escrevemos as opções.', 800)
                    field('#propDynamic textarea[data-key=items]', M.NIVEIS_JSON)
                if name == 'btnNovo': cap('O botão que começa (e reinicia) o jogo.', 1200)
                if name == 'tabuleiro': cap('O painel "tabuleiro" começa vazio: as cartas serão criadas pelo código, conforme o nível.')
                if name == 'lblMsg': cap('E um rótulo para as mensagens ao jogador.', 1200)
            nocap(); wait(800); shot('2')

            # ---------- 3. lógica ----------
            chapter(3, 'A lógica do jogo', 'Todo o código no evento click() do botão')
            cap('Duplo clique no botão "Novo jogo" abre o editor de código direto no evento click(). Vamos escrever o jogo em 6 blocos.')
            dbl('#stage .ff-kind-button', 0)
            expl = [
                'Bloco 1 — Configuração: os níveis (colunas × linhas), as figuras e a leitura do nível escolhido na lista.',
                'Bloco 2 — Sorteio: pegamos metade das figuras, duplicamos (pares) e embaralhamos com sort().',
                'Bloco 3 — Estado do jogo: variáveis da partida, placar zerado e o recorde salvo no navegador (localStorage), um por nível.',
                'Bloco 4 — Tabuleiro: apagamos o painel, ligamos a grade (CSS grid) e criamos um botão para cada carta.',
                'Bloco 5 — Virar uma carta: inicia o cronômetro, mostra a figura e compara a primeira com a segunda. Par certo fica aberto; errado volta em 0,8 s.',
                'Bloco 6 — Fim de jogo: para o relógio e atualiza o recorde se foram menos jogadas.',
            ]
            for (titulo, code), e in zip(M.BLOCOS, expl):
                cap(e, max(2200, len(e) * 45)); nocap(); typecode(code); pg.keyboard.press('Enter'); pg.keyboard.press('Enter'); wait(900); marks.append((time.time() - t0, f'  código: {titulo}'))
            shot('3')

            # ---------- 4. eventos ----------
            chapter(4, 'Ligando os eventos', 'Troca de nível e início automático')
            tab('design')
            cap('Quando o jogador troca o nível, o jogo deve recomeçar. Duplo clique na lista abre o evento change().')
            dbl('#stage .ff-kind-select', 0)
            cap('Basta "clicar" no botão por código: btnNovo.click() reaproveita toda a lógica.', 1800)
            typecode(M.CHANGE); wait(700)
            tab('design')
            cap('E para o jogo já começar montado? A aba "Ações", sem nenhum componente selecionado, mostra os Eventos da Página.')
            bb = pg.locator('#stage').bounding_box(); click_xy(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] - 40, 300)
            click('#actionTab'); wait(500)
            cap('OnLoad roda uma vez, quando a página abre. Chamamos o botão de novo ali.', 1800)
            ta = '#ffPageOnLoad'
            x, y = center(ta); click_xy(x, y, 150); typecode(M.ONLOAD); wait(500)
            click('#ffPageEventsApply'); wait(800); shot('4')

            # ---------- 5. testar ----------
            chapter(5, 'Testando no Preview', 'O app roda de verdade dentro do IDE')
            tab('preview'); wait(1200)
            fr = pg.frame_locator('#preview')
            def cards(): return fr.locator('#tabuleiro button')
            def figs(): return cards().evaluate_all("els=>els.map(e=>e.dataset.figura)")
            def card_click(i):
                bb = cards().nth(i).bounding_box(); click_xy(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2, 380)
            cap('O tabuleiro apareceu sozinho, pelo OnLoad. Vamos errar de propósito: duas cartas diferentes.', 2200)
            f = figs(); a = 0; b2 = [k for k in range(1, len(f)) if f[k] != f[0]][0]
            card_click(a); card_click(b2); cap('Figuras diferentes: contam uma jogada e voltam a ficar viradas depois de 0,8 s.', 2400); wait(900)
            cap('Agora acertando os pares: cartas iguais ficam abertas (verde) e travadas.', 1800)
            done = set()
            for i, v in enumerate(f):
                if i in done: continue
                j = [k for k in range(i + 1, len(f)) if f[k] == v][0]; done.update((i, j)); card_click(i); card_click(j)
                if len(done) == 4: cap('O cronômetro e as jogadas atualizam a cada movimento.', 1800); nocap()
            wait(600); shot('5a')
            cap('Ao achar o último par, o cronômetro para e o recorde é gravado no navegador.', 2600)
            # mudar o nível pela lista (evento change)
            sel = fr.locator('#selNivel').bounding_box(); click_xy(sel['x'] + sel['width'] / 2, sel['y'] + sel['height'] / 2, 300)
            fr.locator('#selNivel').select_option('Difícil'); wait(900)
            cap('Trocando para "Difícil" o evento change() remonta tudo: agora 24 cartas, em 6 colunas. O recorde é separado por nível.', 3200); shot('5b')
            f = figs(); done = set(); n = 0
            for i, v in enumerate(f):
                if i in done: continue
                j = [k for k in range(i + 1, len(f)) if f[k] == v][0]; done.update((i, j)); card_click(i); card_click(j); n += 1
                if n == 5: break
            wait(600)

            # ---------- 6. publicar ----------
            chapter(6, 'Publicando', 'Salvar e exportar')
            cap('Salve o projeto (.flowmobile) para continuar depois, ou exporte. Em projetos de app, o menu Exportar oferece HTML e também o pacote Android (APK).', 3000)
            click('#exportMenuBtn'); wait(2600)
            pg.keyboard.press('Escape'); pg.evaluate("document.body.click()"); wait(500); nocap()
            pg.evaluate("__demo.badge('')")
            marks.append((time.time() - t0, 'Resumo'))
            pg.evaluate("h=>__demo.card(h)", '<h2>Resumo</h2><h1>O que você aprendeu</h1><ul><li>Criar um projeto de app e montar a interface</li><li>Nomear componentes e usá-los no código</li>'
                        '<li>Gerar elementos (as cartas) com JavaScript</li><li>Eventos: click, change e OnLoad da página</li><li>Salvar dados no aparelho (localStorage)</li><li>Testar no Preview e exportar</li></ul>')
            wait(8000)
        except Exception:
            pg.screenshot(path=os.path.join(OUT, 'erro.png')); raise
        proj = pg.evaluate("JSON.stringify(project,null,2)")
        pg.close(); ctx.close(); b.close()
    vids = glob.glob(os.path.join(tmp, '*.webm'))
    if errs: print('ERROS JS durante a gravação:', errs)
    open(os.path.join(OUT, 'tutorial_memoria.flowmobile'), 'w', encoding='utf-8').write(proj)
    with open(os.path.join(OUT, 'capitulos.txt'), 'w', encoding='utf-8') as fh:
        for s, t in marks: fh.write(f'{int(s)//60:02d}:{int(s)%60:02d}  {t}\n')
    if not FAST:
        dst = os.path.join(OUT, 'tutorial_memoria.mp4')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', vids[0], '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst], check=True)
        print('vídeo:', dst)
    shutil.rmtree(tmp, ignore_errors=True)
    print('app:', os.path.join(OUT, 'tutorial_memoria.flowmobile'))

main()
