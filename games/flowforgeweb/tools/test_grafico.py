"""Componente Gráfico (chart): caixa de ferramentas, propriedades, exportação e API por código."""
import os, sys, json
import common
sys.path.insert(0, os.path.join(common.TOOLS, 'gerar_exemplos'))
from lib import *
from playwright.sync_api import sync_playwright
R = []
def t(l, ok, d=''): R.append(bool(ok)); print('✓' if ok else '✗', l, '' if ok else d)
L = 'Jan,Fev,Mar,Abr,Mai,Jun'
items = [
 it('chart', 'cBar', '', 5, 60, 380, 200, chartType='bar', values='[12,19,8,15,22,17]', chartLabels=L, chartTitle='Barras'),
 it('chart', 'cMulti', '', 5, 270, 380, 200, chartType='line', values='[[1,2,3],[3,2,1]]', chartLabels='A,B,C', chartSeries='X,Y'),
 it('chart', 'cPie', '', 5, 480, 380, 200, chartType='pie', values='[1,2,3]', chartLabels='a,b,c'),
 it('label', 'lbl', '', 5, 690, 380, 30),
]
proj_ = proj('G', [('P', items)])
json.dump(proj_, open(common.OUT + '/grafico_t.flowmobile', 'w', encoding='utf-8'), ensure_ascii=False)
json.dump(proj('Sem', [('P', [it('label', 'a', 'oi', 5, 60, 100, 30)])]), open(common.OUT + '/sem_grafico.flowmobile', 'w', encoding='utf-8'), ensure_ascii=False)
with sync_playwright() as pw:
    b = pw.chromium.launch(); errs = []
    ide = b.new_context(viewport={'width': 1400, 'height': 950}).new_page(); ide.on('pageerror', lambda e: errs.append('IDE ' + str(e)))
    cl = lambda: ide.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    ide.goto(f'{common.URL}/index.html'); ide.wait_for_timeout(500); cl()
    # --- editor ---
    t('o Gráfico está na caixa de ferramentas (Dados)', ide.evaluate("!!document.querySelector('#tools .tool[data-kind=chart]')"))
    ide.evaluate("project=fresh();render()"); ide.click('#tools .tool[data-kind=chart]'); ide.wait_for_timeout(500)
    t('adicionar mostra um gráfico real (6 barras, título)', ide.evaluate("document.querySelectorAll('.component .ff-chart2 svg rect[data-i]').length")==6 and 'Vendas por mês' in ide.evaluate("document.querySelector('.component .ff-chart2').textContent"))
    it0 = ide.evaluate("(()=>{const x=ffItems().find(i=>i.kind==='chart');return {name:x.name,type:x.chartType,labels:x.chartLabels,ev:Object.keys(x.events)}})()")
    t('padrões do item: nome Grafico1, tipo bar, evento padrão select', it0['name']=='Grafico1' and it0['type']=='bar' and it0['ev']==['select'], it0)
    ide.evaluate("(()=>{const x=ffItems().find(i=>i.kind==='chart');const el=document.querySelector('.component[data-id=\"'+x.id+'\"]');el.click()})()"); ide.wait_for_timeout(300)
    labs = ide.evaluate("[...document.querySelectorAll('#props label, #props .fieldLabel, #props span')].map(e=>e.textContent.trim())")
    t('painel de propriedades tem os campos do gráfico', all(any(k in x for x in labs) for k in ('Título do gráfico','Rótulos','Nomes das séries','Mostrar valores','Máximo de pontos','Prefixo')), labs[:40])
    ide.evaluate("(()=>{const x=ffItems().find(i=>i.kind==='chart');x.chartType='doughnut';render()})()"); ide.wait_for_timeout(300)
    t('mudar o tipo no editor redesenha (rosca: 6 fatias)', ide.evaluate("document.querySelectorAll('.component .ff-chart2 svg path[data-i]').length")==6)
    # exportação: motor só entra quando há gráfico
    ide.set_input_files('#fileInput', common.OUT + '/sem_grafico.flowmobile'); ide.wait_for_timeout(600); cl()
    h0 = ide.evaluate("FlowForgeImageAssets.resolveHtml(generated())")
    t('projeto sem gráfico não leva o motor de gráficos', 'FlowForgeChart' not in h0 and 'ffc-style' not in h0)
    ide.set_input_files('#fileInput', common.OUT + '/grafico_t.flowmobile'); ide.wait_for_timeout(700); cl()
    html = ide.evaluate("FlowForgeImageAssets.resolveHtml(generated())"); open(common.OUT + '/grafico_t.html', 'w', encoding='utf-8').write(html)
    t('projeto com gráfico leva o motor', 'window.FlowForgeChart' in html)
    # --- runtime ---
    pg = b.new_context(viewport={'width': 420, 'height': 800}).new_page(); pg.on('pageerror', lambda e: errs.append('RUN ' + str(e)))
    pg.goto('file://' + common.OUT + '/grafico_t.html'); pg.wait_for_timeout(1000)
    J = lambda x: pg.evaluate(x); n = lambda sel: J("document.querySelectorAll(%r).length" % sel)
    t('3 gráficos desenhados (svg com role=img)', n('svg[role=img]')==3)
    t('barras: 6 barras, rótulos e título', n('#cBar rect[data-i]')==6 and 'Barras' in J("cBar.textContent") and 'Mai' in J("cBar.textContent"))
    t('duas séries: 6 pontos e legenda X/Y', n('#cMulti circle[data-i]')==6 and 'X' in J("cMulti.textContent") and 'Y' in J("cMulti.textContent"))
    t('pizza: 3 fatias e legenda a,b,c', n('#cPie path[data-i]')==3 and 'c' in J("cPie.textContent"))
    t('API existe no componente (setData/addPoint/clear/getData)', J("['setData','addPoint','clear','getData','toImage','download'].every(k=>typeof cBar[k]==='function')"))
    # formatos de dados
    sd = lambda lab, val, ser='': J("(()=>{cBar.setData(%s,%s,%s);return JSON.stringify(cBar.getData())})()" % (json.dumps(lab), json.dumps(val), json.dumps(ser)))
    d = json.loads(sd(['a','b'], [1,2]));                         t('lista simples', d['series'][0]['values']==[1,2] and d['labels']==['a','b'], d)
    d = json.loads(sd('a,b,c', '[[1,2,3],[4,5,6]]', 'S1,S2'));   t('várias séries como texto JSON + nomes', len(d['series'])==2 and d['series'][1]['name']=='S2' and d['labels']==['a','b','c'], d)
    d = json.loads(sd([], {'Jan':10,'Fev':20}));                  t('objeto {rótulo: valor}', d['labels']==['Jan','Fev'] and d['series'][0]['values']==[10,20], d)
    d = json.loads(sd([], {'Vendas':[1,2],'Custos':[3,4]}));      t('objeto {série: [valores]}', [s['name'] for s in d['series']]==['Vendas','Custos'], d)
    d = json.loads(sd([], [{'label':'x','value':5},{'label':'y','value':7}])); t('lista de {label, value}', d['labels']==['x','y'] and d['series'][0]['values']==[5,7], d)
    d = json.loads(sd(['a','b','c'], '4, 5; 6'));                 t('texto "4, 5; 6"', d['series'][0]['values']==[4,5,6], d)
    d = json.loads(sd(['a','b'], ['x', None, 3]));               t('valores inválidos viram 0', d['series'][0]['values']==[0,0,3], d)
    d = json.loads(sd('a', '[1,2,3]')); pg.wait_for_timeout(150);   t('menos rótulos que valores: completa com 1,2,3…', n('#cBar rect[data-i]')==3 and 'a' in J("cBar.textContent") and '2' in J("cBar.textContent"))
    # addPoint / clear / maxPoints
    J("cBar.setData(['a'],[1])"); J("cBar.addPoint('b',2)"); J("cBar.addPoint(null,3)"); pg.wait_for_timeout(120)
    d = J("cBar.getData()"); t('addPoint acrescenta (rótulo nulo vira o nº)', d['labels']==['a','b','3'] and d['series'][0]['values']==[1,2,3], d)
    J("cBar.maxPoints=3;cBar.addPoint('d',4)"); d = J("cBar.getData()"); t('maxPoints descarta os mais antigos', d['labels']==['b','3','d'] and d['series'][0]['values']==[2,3,4], d)
    J("cBar.setData(['a','b'],[[1,2],[3,4]])"); J("cBar.addPoint('c',[5,6])"); d = J("cBar.getData()"); t('addPoint com uma lista alimenta as séries', d['series'][0]['values']==[1,2,5] and d['series'][1]['values']==[3,4,6], d)
    J("cBar.clear()"); pg.wait_for_timeout(120); t('clear: "Sem dados"', 'Sem dados' in J("cBar.textContent") and J("cBar.getData().labels.length")==0)
    J("cBar.addPoint('x',5)"); pg.wait_for_timeout(120); t('depois de limpar dá para acrescentar', n('#cBar rect[data-i]')==1)
    # propriedades
    J("cBar.setData(['a','b','c'],[3,-2,5])"); 
    for tp, sel, cnt in (('bar','rect[data-i]',3),('hbar','rect.ffc-barh',3),('line','circle[data-i]',3),('area','path[opacity=".18"]',1),('pie','path[data-i]',2),('doughnut','path[data-i]',2)):
        J("cBar.chartType=%r" % tp); pg.wait_for_timeout(120); t('chartType = %s' % tp, n('#cBar ' + sel)==cnt, (n('#cBar ' + sel), cnt))
    J("cBar.chartType='bar';cBar.chartTitle='Novo título'"); pg.wait_for_timeout(120); t('chartTitle', 'Novo título' in J("cBar.textContent"))
    J("cBar.setData(['a','b'],[[1,2],[3,4]],'P,Q')"); pg.wait_for_timeout(150); com = n('#cBar rect:not([data-i])')==2
    J("cBar.legend=false"); pg.wait_for_timeout(150); sem = n('#cBar rect:not([data-i])')==0
    t('legenda aparece com 2 séries e some com legend=false', com and sem, (com, sem))
    J("cBar.legend=true;cBar.showValues=false"); pg.wait_for_timeout(120); t('showValues=false esconde os números dos valores', not any(x in ('1','3','4') for x in J("[...document.querySelectorAll('#cBar text')].filter(e=>e.getAttribute('pointer-events')==='none').map(e=>e.textContent)")))
    # segurança / bordas
    J("cBar.setData(['<img src=x onerror=window.__x=1>','b'],[1,2])"); pg.wait_for_timeout(150); t('rótulos com HTML viram texto (sem XSS)', n('#cBar img')==0 and not J("window.__x") and '<img' in J("cBar.textContent"))
    J("cPie.setData(['a','b'],[0,0])"); pg.wait_for_timeout(120); t('pizza com tudo zero: "Sem dados"', 'Sem dados' in J("cPie.textContent"))
    J("cPie.setData(['a','b'],[-3,5])"); pg.wait_for_timeout(120); t('pizza ignora valor negativo (1 fatia inteira)', n('#cPie [data-i]')==1 and n('#cPie circle[data-i]')==1)
    J("cPie.chartType='doughnut'"); pg.wait_for_timeout(120); t('rosca com 1 fatia inteira desenha', n('#cPie path[data-i]')==1)
    J("cBar.setData(['a','b','c'],[1e9,2.5e9,5e8])"); pg.wait_for_timeout(120); t('números enormes viram 1B/M no eixo (compacto)', any('M' in x for x in J("[...document.querySelectorAll('#cBar text')].map(e=>e.textContent)")))
    J("cBar.setData(['a','b'],[0.001,0.002])"); pg.wait_for_timeout(120); t('números minúsculos não geram NaN', 'NaN' not in J("cBar.innerHTML") and n('#cBar rect[data-i]')==2)
    J("cBar.setData(['a','b'],[5,5])"); pg.wait_for_timeout(120); t('valores todos iguais não quebram a escala', 'NaN' not in J("cBar.innerHTML") and 'Infinity' not in J("cBar.innerHTML"))
    J("cBar.setData(Array.from({length:500},(_, i)=>'p'+i),Array.from({length:500},(_, i)=>Math.sin(i/20)*50));cBar.chartType='line'"); pg.wait_for_timeout(250); t('500 pontos em linha: sem marcadores e sem erro', n('#cBar circle')==0 and n('#cBar svg')==1 and 'NaN' not in J("cBar.innerHTML"))
    J("cBar.chartType='bar'"); pg.wait_for_timeout(250); t('500 barras desenham', n('#cBar rect[data-i]')==500)
    # evento select
    J("cBar.setData(['a','b','c'],[10,20,30]);cBar.chartType='bar'"); pg.wait_for_timeout(150)
    J("window.__ev=null;cBar.addEventListener('select',e=>window.__ev=e.detail)"); box = pg.locator('#cBar rect[data-i="1"]').bounding_box(); pg.mouse.click(box['x']+box['width']/2, box['y']+box['height']/2); pg.wait_for_timeout(100)
    d = J("window.__ev"); t('clique numa barra: detail {index,label,value}', d and d['index']==1 and d['label']=='b' and d['value']==20, d)
    t('propriedade selected guarda o último clique', J("cBar.selected && cBar.selected.label")=='b')
    # tamanho e responsividade
    w0 = J("cBar.querySelector('svg').getAttribute('viewBox')"); J("cBar.style.width='200px'"); pg.wait_for_timeout(300)
    t('redimensionar o componente redesenha (viewBox muda)', J("cBar.querySelector('svg').getAttribute('viewBox')")!=w0, (w0, J("cBar.querySelector('svg').getAttribute('viewBox')")))
    # imagem
    u = J("cBar.toImage().then(x=>x.slice(0,22))"); t('toImage devolve PNG (data URI)', u=='data:image/png;base64,', u)
    # cores/prefixos pelas propriedades do item
    t('sem erros de JavaScript', not errs, errs[:3])
    b.close()
print('\nTOTAL %d / %d' % (sum(R), len(R))); sys.exit(0 if all(R) else 1)
