import os,sys
import common,glob
from playwright.sync_api import sync_playwright
PORT=os.environ.get('PORT','8766'); R=[]
def t(l,ok,d=''): R.append(bool(ok)); print('✓' if ok else '✗',l,'' if ok else d)
SPY="window.__gum=0;(function(){var md=navigator.mediaDevices;if(!md)return;var o=md.getUserMedia&&md.getUserMedia.bind(md);md.getUserMedia=function(){window.__gum++;return o?o.apply(null,arguments):Promise.reject(new Error('x'))};})()"
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']); c=b.new_context(permissions=['camera'],viewport={'width':1400,'height':800}); pg=c.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script(SPY)
    pg.goto(f'http://localhost:{PORT}/index.html'); pg.wait_for_timeout(600)
    close=lambda:pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    gum=lambda:pg.evaluate("window.__gum")
    allow=lambda:pg.evaluate("document.getElementById('preview').getAttribute('allow')")
    close(); t('abrir o IDE sem projeto não pede câmera',gum()==0)
    for n in ['Calculadora_Interativa','Jogo_da_Velha_IA','Editor_de_Texto']:
        pg.set_input_files('#fileInput',f'{common.ROOT}/examples/{n}.flowmobile'); pg.wait_for_timeout(700); close()
        pg.click('[data-tab="preview"]'); pg.wait_for_timeout(900)
    t('projetos sem componente câmera: Preview não pede câmera',gum()==0,gum())
    t('Preview sem câmera: iframe sem permissão de camera/microfone','camera' not in allow() and 'microphone' not in allow(),allow())
    pg.click('#debugBtn'); pg.wait_for_timeout(900); t('Debug sem câmera não pede câmera',gum()==0 and 'camera' not in allow(),(gum(),allow()))
    pg.click('#dbgClose')
    # adiciona o componente câmera pelo IDE
    pg.click('[data-tab="design"]'); pg.evaluate("document.querySelector('#toolbox [data-kind=\"camera\"], #toolbox button[data-type=\"camera\"]')?.click()")
    pg.wait_for_timeout(500)
    has=pg.evaluate("project.pages.flatMap(p=>p.items).some(x=>x.kind==='camera')")
    if not has:
        pg.fill('#toolbox input','Camera'); pg.wait_for_timeout(300)
        pg.evaluate("(()=>{const b=[...document.querySelectorAll('#toolbox button')].find(x=>/camera|câmera/i.test(x.textContent)&&x.offsetParent);b&&b.click()})()"); pg.wait_for_timeout(500)
        has=pg.evaluate("project.pages.flatMap(p=>p.items).some(x=>x.kind==='camera')")
    t('componente câmera adicionado pelo IDE',has)
    t('adicionar o componente no Design não pede câmera',gum()==0,gum())
    pg.click('[data-tab="preview"]'); pg.wait_for_timeout(1500)
    t('com componente câmera, Preview inclui permissão camera',  'camera' in allow(),allow())
    fg=pg.evaluate("document.getElementById('preview').contentWindow.__gum")
    t('com componente câmera, o Preview pede a câmera',fg>=1,fg)
    # export sem câmera: nada de getUserMedia
    pg.set_input_files('#fileInput',f'{common.ROOT}/examples/Calculadora_Interativa.flowmobile'); pg.wait_for_timeout(700); close()
    html=pg.evaluate("FlowForgeImageAssets.resolveHtml(generated())"); open(f'{common.OUT}/nocam.html','w',encoding='utf-8').write(html)
    t('export sem câmera não contém atributos de câmera','<video' not in html and 'allow="camera' not in html)
    n0=gum()
    t('sem erros JS no IDE',not errs,errs)
    b.close()
    b=p.chromium.launch(args=['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']); c=b.new_context(permissions=['camera']); pg=c.new_page(); pg.add_init_script(SPY)
    pg.goto(f'file://{common.OUT}/nocam.html'); pg.wait_for_timeout(800)
    t('app exportado sem câmera não pede câmera',pg.evaluate("window.__gum")==0)
    b.close()
print('TOTAL',sum(R),'/',len(R))
sys.exit(0 if all(R) else 1)
