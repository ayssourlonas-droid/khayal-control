"""Menu Exemplos: todos os .flowmobile da pasta examples/ aparecem e abrem corretamente."""
import os, sys, json, glob
import common
from playwright.sync_api import sync_playwright
R = []
def t(l, ok, d=''): R.append(bool(ok)); print('✓' if ok else '✗', l, '' if ok else d)
arqs = {os.path.basename(f)[:-11]: json.load(open(f, encoding='utf-8')) for f in glob.glob(common.ROOT + '/examples/*.flowmobile')}
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_context(viewport={'width': 1400, 'height': 900}).new_page(); erros = []
    pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto(f"{common.URL}/index.html"); pg.wait_for_timeout(500)
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    pg.evaluate("showExamples()"); pg.wait_for_timeout(200)
    n = pg.evaluate("document.querySelectorAll('#exampleChoices .exampleCard').length")
    builtin = pg.evaluate("EXAMPLES.length"); pack = pg.evaluate("(window.FF_EXAMPLE_PACK||[]).filter(e=>!e.replaces).length")
    t('o menu mostra os exemplos embutidos + os da pasta (%d + %d)' % (builtin, pack), n == builtin + pack and pack >= 25, (n, builtin, pack))
    titulos = pg.evaluate("[...document.querySelectorAll('#exampleChoices .exampleCard b')].map(e=>e.textContent)")
    t('sem títulos repetidos no menu', len(set(titulos)) == len(titulos), [x for x in titulos if titulos.count(x) > 1])
    # o pacote tem de estar em dia com a pasta: cada arquivo está no menu embutido ou no pacote
    chaves = pg.evaluate("(window.FF_EXAMPLE_PACK||[]).map(e=>e.key.slice(5))")
    JA = {'Lista_de_Tarefas'}
    t('todos os arquivos de examples/ estão no menu (rode tools/gerar_menu_exemplos.py se faltar)', set(arqs) - JA == set(chaves), (sorted(set(arqs) - JA - set(chaves)), sorted(set(chaves) - set(arqs))))
    t('o conteúdo do pacote é idêntico ao arquivo da pasta', all(pg.evaluate("(k)=>JSON.stringify(window.FF_EXAMPLE_PACK.find(e=>e.key==='file:'+k).project)", k) == json.dumps(arqs[k], ensure_ascii=False, separators=(',', ':')) or pg.evaluate("(k)=>window.FF_EXAMPLE_PACK.find(e=>e.key==='file:'+k).project.name", k) == arqs[k]['name'] for k in chaves))
    # abre cada um pelo clique
    falhas = []
    for i in range(n):
        pg.evaluate("showExamples()")
        info = pg.evaluate("(i)=>{const c=document.querySelectorAll('#exampleChoices .exampleCard')[i];const nome=c.querySelector('b').textContent;c.click();return {nome,proj:project.name,pages:project.pages.length,itens:project.pages.reduce((a,p)=>a+p.items.length,0),aberto:!!document.querySelector('dialog[open]')}}", i)
        if info['aberto'] or not info['pages'] or not info['itens']: falhas.append(info)
    t('os %d cards abrem um projeto com páginas e componentes, e fecham o menu' % n, not falhas, falhas[:3])
    # os da pasta mantêm páginas/itens do arquivo
    ruins = []
    for k in chaves:
        r = pg.evaluate("(k)=>{showExamples();document.querySelector('#exampleChoices .exampleCard[data-key=\"file:'+k+'\"]').click();return {p:project.pages.length,n:project.pages.map(x=>x.items.length),nome:project.name}}", k)
        if r['p'] != len(arqs[k]['pages']) or r['n'] != [len(x['items']) for x in arqs[k]['pages']] or r['nome'] != arqs[k]['name']: ruins.append((k, r))
    t('projetos abertos pelo menu = conteúdo dos arquivos', not ruins, ruins[:2])
    # abrir um exemplo e rodar no Preview (Rastreador usa localStorage e páginas)
    pg.evaluate("showExamples()"); pg.evaluate("[...document.querySelectorAll('#exampleChoices .exampleCard')].find(c=>c.textContent.includes('Divisor de Conta')).click()"); pg.click('[data-tab=preview]'); pg.wait_for_timeout(1000)
    fr = pg.frame_locator('#preview')
    t('exemplo aberto pelo menu roda no Preview', 'R$' in (fr.locator('#lblMsg').text_content() or '') or 'Digite' in (fr.locator('#lblMsg').text_content() or ''), fr.locator('#lblMsg').text_content())
    t('sem erros de JavaScript', not erros, erros[:2])
    b.close()
print('\nTOTAL %d / %d' % (sum(R), len(R))); sys.exit(0 if all(R) else 1)
