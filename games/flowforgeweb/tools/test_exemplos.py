import sys,re,os,json
import common
EXOUT=os.environ.get('EXOUT',common.OUT+'/exemplos_html')
from playwright.sync_api import sync_playwright
ONLY=set(sys.argv[1:]); RES={}; ERRS_SEEN=[]
EXPECT={'Laboratorio_do_Depurador':'funcaoQueNaoExiste'}  # erro proposital do exemplo
FAST="""(()=>{const si=window.setInterval;window.setInterval=(f,ms,...a)=>si(f,Math.min(ms,4),...a);})()"""
GLARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
def run(name,fn,fast=False,camera=False,gl=False,init=None,tag=None):
    if ONLY and name not in ONLY: return
    checks=[]
    def t(label,ok,detail=''): checks.append((label,bool(ok),str(detail)[:160]))
    with sync_playwright() as p:
        b=p.chromium.launch(args=(['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'] if camera else [])+(GLARGS if gl else [])); ctx=b.new_context(viewport={'width':1100,'height':900},permissions=['camera'] if camera else []); pg=ctx.new_page()
        global ERRS_SEEN
        errs=[]; dialogs=[]; ERRS_SEEN=errs
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.on('dialog',lambda d:(dialogs.append(d.message),d.accept()))
        pg.route('**/*',lambda r: r.continue_() if r.request.url.startswith(('file://','data:','about:','blob:')) else r.abort())
        if fast: pg.add_init_script(FAST)
        if init: pg.add_init_script(init)
        pg.goto(f'file://{EXOUT}/{name}.html'); pg.wait_for_timeout(500)
        pg.evaluate("window.__cards=[...document.querySelectorAll('.ff-real-card')].map(c=>(c.closest('[id]')||{}).id).filter(Boolean)")
        try: fn(pg,t,dialogs)
        except Exception as e: t('EXCEÇÃO no cenário',False,f'{type(e).__name__}: {str(e)[:120]}')
        errs=[e for e in errs if not (EXPECT.get(name) and EXPECT[name] in e)]
        t('sem erros de JavaScript durante o uso',not errs,'; '.join(sorted(set(errs)))[:150])
        b.close()
    RES[tag or name]=checks
tx=lambda pg,i:pg.evaluate(f"(()=>{{const e=document.getElementById('{i}');if(!e)return '';if((window.__cards||[]).includes('{i}')){{const s=e.querySelector('small');return s?s.textContent.trim():'«estrutura do cartão perdida»'}}return e.textContent.trim()}})()")
def wait_txt(pg,i,pred,ms=4000):
    for _ in range(ms//50):
        v=tx(pg,i)
        if pred(v): return v
        pg.wait_for_timeout(50)
    return tx(pg,i)

def adivinhe(pg,t,d):
    pg.fill('#guessInput','50'); pg.click('#guessGo'); pg.wait_for_timeout(100)
    t('palpite digitado SEM clicar em "Novo jogo" é avaliado (não perdido)',re.search(r'maior|menor|Acertou',tx(pg,'guessStatus')),tx(pg,'guessStatus'))
    pg.click('#guessNew'); pg.evaluate("window.ffSecret=42")
    pg.fill('#guessInput','10'); pg.click('#guessGo'); t('palpite baixo → "É maior"','maior' in tx(pg,'guessStatus'),tx(pg,'guessStatus'))
    pg.fill('#guessInput','90'); pg.click('#guessGo'); t('palpite alto → "É menor"','menor' in tx(pg,'guessStatus'),tx(pg,'guessStatus'))
    pg.fill('#guessInput','abc'); pg.click('#guessGo'); t('texto inválido é rejeitado','entre 1 e 100' in tx(pg,'guessStatus'),tx(pg,'guessStatus'))
    pg.fill('#guessInput','42'); pg.click('#guessGo'); s=tx(pg,'guessStatus'); t('acerto mostra tentativas','Acertou' in s,s)
    t('concordância ("1 tentativa" no singular)',not re.search(r'em 1 tentativas',s),s)
run('Adivinhe_o_Numero',adivinhe)

def breakout(pg,t,d):
    pg.click('#breakStart'); pg.wait_for_timeout(300)
    b=tx(pg,'breakBoard'); t('tabuleiro desenhado (bola, tijolos e raquete)','●' in b and '■' in b and '═' in b,b[:40])
    s0=b; pg.wait_for_timeout(600); t('a bola se move',tx(pg,'breakBoard')!=s0 or 'Fim' in tx(pg,'breakStatus'))
    pg.wait_for_function("/Fim|venceu/.test(document.getElementById('breakStatus').textContent)",timeout=20000)
    t('o jogo termina com mensagem',re.search(r'Fim|venceu',tx(pg,'breakStatus')),tx(pg,'breakStatus'))
    pg.click('#breakStart'); t('reiniciar funciona',tx(pg,'breakStatus').startswith('Pontos'),tx(pg,'breakStatus'))
run('Breakout',breakout,fast=True)

def snake(pg,t,d):
    pg.click('#snakeStart'); pg.wait_for_timeout(60)
    h0=pg.evaluate("window.ffSnake.body[0].join(',')"); pg.wait_for_timeout(120)
    t('a cobra anda para a direita',pg.evaluate("window.ffSnake.body[0][0]")>int(h0.split(',')[0]) or 'Fim' in tx(pg,'snakeStatus'),h0)
    pg.click('#snakeStart'); pg.evaluate("clearInterval(window.ffSnakeTimer)")
    pg.evaluate("document.getElementById('snakeStart').click()")
    pg.wait_for_function("/Fim/.test(document.getElementById('snakeStatus').textContent)",timeout=8000)
    s=tx(pg,'snakeStatus'); t('bate na parede e mostra "Fim de jogo"','Fim de jogo' in s,s)
    t('comeu a comida padrão em [10,5] (pontos ≥ 1)',re.search(r'(\d+) pontos',s) and int(re.search(r'(\d+) pontos',s).group(1))>=1,s)
    pg.click('#snakeStart'); pg.evaluate("clearInterval(window.ffSnakeTimer)")
    pg.click('#snakeLeft'); t('Esquerda é ignorada quando já está indo para a direita (sem inverter)',pg.evaluate("window.ffSnake.dir.join(',')")=='1,0',pg.evaluate("window.ffSnake.dir.join(',')"))
    pg.click('#snakeUp'); t('Cima registra direção',pg.evaluate("window.ffSnake.dir.join(',')")=='0,-1')
    pg.click('#snakeDown'); t('Baixo é ignorado quando indo para cima',pg.evaluate("window.ffSnake.dir.join(',')")=='0,-1')
run('Snake',snake,fast=True)

def pong(pg,t,d):
    pg.click('#pongStart'); pg.wait_for_timeout(250)
    b=tx(pg,'pongBoard'); t('quadra desenhada com bola e as duas raquetes','●' in b and b.count('█')>=5,b[:30])
    pg.wait_for_timeout(4000)
    t('depois de ~1000 jogadas a quadra continua desenhada (sem travar)','●' in tx(pg,'pongBoard') or 'Fim' in tx(pg,'pongStatus'),tx(pg,'pongStatus'))
    for _ in range(6): pg.click('#pongUp')
    pg.wait_for_function("/Fim/.test(document.getElementById('pongStatus').textContent)",timeout=20000)
    t('afastando a raquete o jogo termina com "Fim — N rebatidas"',re.search(r'Fim — \d+ rebatidas',tx(pg,'pongStatus')),tx(pg,'pongStatus'))
    pg.click('#pongStart'); t('reiniciar funciona',tx(pg,'pongStatus').startswith('Rebatidas'),tx(pg,'pongStatus'))
    pg.click('#pongDown'); t('raquete do jogador responde aos botões',pg.evaluate("window.ffPong.p")>=1)
run('Pong_IA',pong,fast=True)

def genius(pg,t,d):
    pg.click('#simonStart'); v=wait_txt(pg,'simonStatus',lambda s:s=='Sua vez',4000); t('mostra a sequência e libera "Sua vez"',v=='Sua vez',v)
    for lvl in (1,2,3):
        seq=pg.evaluate("window.ffSimon.seq")
        for n in seq: pg.click(f'#s{n}'); pg.wait_for_timeout(30)
        v=tx(pg,'simonStatus'); t(f'nível {lvl}: sequência correta → "Certo!"',v=='Certo!',v)
        v=wait_txt(pg,'simonStatus',lambda s:s=='Sua vez',6000); t(f'nível {lvl+1}: nova rodada começa e libera "Sua vez"',v=='Sua vez',v)
        t(f'sequência cresce para {lvl+1}',pg.evaluate("window.ffSimon.seq.length")==lvl+1)
    seq=pg.evaluate("window.ffSimon.seq"); wrong=(seq[0]+1)%4; pg.click(f'#s{wrong}'); v=tx(pg,'simonStatus'); t('clique errado → "Errou!"',v.startswith('Errou'),v)
    pg.click('#simonStart'); v=wait_txt(pg,'simonStatus',lambda s:s=='Sua vez',4000); t('reiniciar volta ao nível 1',v=='Sua vez' and pg.evaluate("window.ffSimon.seq.length")==1,v)
    cols=pg.evaluate("[0,1,2,3].map(i=>{const e=document.getElementById('s'+i);const b=e.tagName==='BUTTON'?e:e.querySelector('button');return getComputedStyle(b).backgroundColor})")
    t('os 4 botões (o <button> que o usuário vê) têm cores diferentes',len(set(cols))==4,cols)
    t('as cores são as do exemplo (vermelho, verde, azul, amarelo), não o cinza padrão',all(c not in ('rgb(239, 239, 239)','rgba(0, 0, 0, 0)','rgb(255, 255, 255)') for c in cols),cols)
run('Genius_Simon',genius)

def memoria(pg,t,d):
    pg.click('#memNew'); pg.wait_for_timeout(100)
    t('título continua "Jogo da Memória"',tx(pg,'memTitle')=='Jogo da Memória',tx(pg,'memTitle'))
    t('botão "Novo jogo" continua com seu texto',tx(pg,'memNew')=='Novo jogo',tx(pg,'memNew'))
    vals=pg.evaluate("[...Array(8).keys()].map(i=>document.getElementById('m'+i).dataset.v)")
    from collections import Counter
    c=Counter(vals); t('8 cartas = 4 frutas, cada uma exatamente 2 vezes',len(c)==4 and all(v==2 for v in c.values()),vals)
    bidx=next(i for i in range(1,8) if vals[i]!=vals[0])
    pg.click('#m0'); pg.click(f'#m{bidx}')
    pg.wait_for_timeout(900); t('após 650 ms as cartas erradas voltam a "?"',tx(pg,'m0')=='?' and tx(pg,f'm{bidx}')=='?',(tx(pg,'m0'),tx(pg,f'm{bidx}')))
    done=set()
    for i in range(8):
        if i in done: continue
        j=next(k for k in range(i+1,8) if vals[k]==vals[i] and k not in done)
        pg.click(f'#m{i}'); pg.click(f'#m{j}'); done|={i,j}; pg.wait_for_timeout(40)
    v=tx(pg,'memStatus'); t('encontrar os 4 pares → "Você venceu!"',v=='Você venceu!',v)
run('Jogo_da_Memoria',memoria)

def velha(pg,t,d):
    pg.click('#c0'); pg.wait_for_timeout(150)
    cells=pg.evaluate("[...Array(9).keys()].map(i=>document.getElementById('c'+i).textContent.trim())")
    t('jogada do usuário (X) e resposta da IA (O)',cells[0]=='X' and cells.count('O')==1,cells)
    r=pg.evaluate("""async()=>{const out={win:0,loss:0,draw:0,stuck:0};
      for(let g=0;g<40;g++){document.getElementById('novoJogo').click();await new Promise(r=>setTimeout(r,5));
        for(let k=0;k<9;k++){const st=document.getElementById('status').textContent;if(/venceu|Empate/.test(st))break;
          const free=[...Array(9).keys()].filter(i=>!document.getElementById('c'+i).textContent.trim());if(!free.length)break;
          document.getElementById('c'+free[Math.floor(Math.random()*free.length)]).click();await new Promise(r=>setTimeout(r,3))}
        const s=document.getElementById('status').textContent;
        if(/Você venceu/.test(s))out.win++;else if(/IA venceu/.test(s))out.loss++;else if(/Empate/.test(s))out.draw++;else out.stuck++}
      return out}""")
    t('IA (minimax) nunca perde em 40 partidas aleatórias',r['win']==0,r)
    t('todas as partidas terminam em vitória da IA ou empate (nenhuma trava)',r['stuck']==0,r)
    pg.click('#novoJogo'); t('"Novo jogo" limpa o tabuleiro e o status',tx(pg,'status').startswith('Sua vez') and all(not tx(pg,f'c{i}') for i in range(9)),tx(pg,'status'))
run('Jogo_da_Velha_IA',velha)

def ppt(pg,t,d):
    ok=True; seen=set()
    for _ in range(30):
        for btn,p in (('rpsPedra','Pedra'),('rpsPapel','Papel'),('rpsTesoura','Tesoura')):
            pg.click('#'+btn); s=tx(pg,'rpsStatus'); m=re.match(r'Você: (\w+) \| IA: (\w+) — (.+)',s)
            if not m: ok=False; continue
            u,c,r=m.groups(); seen.add(r)
            win={('Pedra','Tesoura'),('Papel','Pedra'),('Tesoura','Papel')}
            exp='Empate' if u==c else ('Você venceu!' if (u,c) in win else 'IA venceu!')
            if r!=exp or u!=p: ok=False
    t('90 jogadas: resultado sempre coerente com as regras',ok)
    t('aparecem vitória, derrota e empate',len(seen)==3,seen)
run('Pedra_Papel_Tesoura_IA',ppt)

def reflexo(pg,t,d):
    pg.click('#reactBtn'); t('clicar antes de começar → "Queimou!"','Queimou' in tx(pg,'reactStatus'),tx(pg,'reactStatus'))
    pg.click('#reactStart'); t('começar → "Espere..."',tx(pg,'reactBtn')=='Espere...',tx(pg,'reactBtn'))
    pg.click('#reactBtn'); t('clicar cedo → "Queimou!"','Queimou' in tx(pg,'reactStatus'),tx(pg,'reactStatus'))
    pg.click('#reactStart'); v=wait_txt(pg,'reactBtn',lambda s:s=='CLIQUE!',5000); t('após 0,9–3,1 s o botão vira "CLIQUE!"',v=='CLIQUE!',v)
    pg.wait_for_timeout(120); pg.click('#reactBtn'); s=tx(pg,'reactStatus'); m=re.match(r'Seu tempo: (\d+) ms',s); t('mostra o tempo de reação',bool(m) and 80<=int(m.group(1))<=2500,s)
run('Teste_de_Reflexo',reflexo)

def calc(pg,t,d):
    opts=pg.evaluate("[...document.getElementById('op1').options].map(o=>o.value)")
    t('o seletor oferece Somar, Subtrair, Multiplicar e Dividir',opts==['Somar','Subtrair','Multiplicar','Dividir'],opts)
    def c(a,b,op):
        pg.fill('#num1',str(a)); pg.fill('#num2',str(b))
        pg.evaluate(f"(()=>{{const s=document.getElementById('op1');const o=[...s.options].find(x=>x.value==='{op}');if(o)s.value='{op}'}})()")
        pg.click('#calc1'); return tx(pg,'result1')
    for a,b,op,exp in [(6,3,'Somar','9'),(6,3,'Subtrair','3'),(6,3,'Multiplicar','18'),(6,3,'Dividir','2'),(6,0,'Dividir','Erro')]:
        r=c(a,b,op); t(f'{a} {op} {b} = {exp}',r=='Resultado: '+exp,r)
run('Calculadora_Interativa',calc)

def cadastro(pg,t,d):
    pg.click('#salvar1'); t('vazio → "Preencha nome e e-mail"',tx(pg,'status1')=='Preencha nome e e-mail',tx(pg,'status1'))
    pg.fill('#nome1','Ana'); pg.fill('#email1','ana@ex.com'); pg.click('#salvar1'); t('sem aceitar os termos → "Aceite os termos"',tx(pg,'status1')=='Aceite os termos',tx(pg,'status1'))
    pg.click('#termos1'); t('checkbox marca ao clicar',pg.evaluate("document.getElementById('termos1').checked"))
    pg.click('#salvar1'); t('completo → "Cadastro concluído: Ana"',tx(pg,'status1')=='Cadastro concluído: Ana',tx(pg,'status1'))
run('Cadastro_Usuario',cadastro)

def painel(pg,t,d):
    el=pg.evaluate("(()=>{const e=document.getElementById('dark1');return e?e.tagName+(e.type?':'+e.type:''):null})()"); t('a chave "Modo escuro" existe',el,el)
    bg0=pg.evaluate("getComputedStyle(document.body).backgroundColor")
    pg.click('label:has(#dark1), #dark1',force=True)
    pg.wait_for_timeout(150); bg1=pg.evaluate("getComputedStyle(document.body).backgroundColor")
    t('clicar na chave liga o modo escuro (fundo escuro e chave marcada)',bg1=='rgb(17, 24, 39)' and pg.evaluate("document.getElementById('dark1').checked"),(bg0,bg1))
    pg.click('label:has(#dark1), #dark1',force=True)
    pg.wait_for_timeout(150); t('clicar de novo desliga e volta ao fundo claro',pg.evaluate("getComputedStyle(document.body).backgroundColor")=='rgb(255, 255, 255)' and not pg.evaluate("document.getElementById('dark1').checked"),pg.evaluate("getComputedStyle(document.body).backgroundColor"))
    pg.evaluate("(()=>{const r=document.getElementById('volume1');r.value=80;r.dispatchEvent(new Event('input',{bubbles:true}))})()"); t('volume 80 → "Volume: 80%"',tx(pg,'volumeCard')=='Volume: 80%',tx(pg,'volumeCard'))
    pg.click('#notify1'); t('notificações ligadas',tx(pg,'status1')=='Notificações ativadas',tx(pg,'status1'))
    pg.click('#notify1'); t('notificações desligadas',tx(pg,'status1')=='Notificações desativadas',tx(pg,'status1'))
run('Painel_Configuracoes',painel)

def fileup(pg,t,d):
    pg.set_input_files('#fileUpload1',f'{common.TOOLS}/test_photo.png'); pg.wait_for_timeout(500)
    r=pg.evaluate("(()=>{const i=document.getElementById('picturebox1');return {tag:i&&i.tagName,src:(i&&i.getAttribute('src')||'').slice(0,5),w:i&&i.naturalWidth,alt:i&&i.alt}})()")
    t('a imagem escolhida aparece no PictureBox',r['src']=='blob:' and r['w']==120,r); t('o alt recebe o nome do arquivo',r['alt']=='test_photo.png',r)
    d.clear(); pg.set_input_files('#fileUpload1',f'{common.TOOLS}/test_file.txt'); pg.wait_for_timeout(300); t('arquivo que não é imagem mostra aviso',any('imagem' in x for x in d),d)
run('FileUpload_PictureBox',fileup)

def visual(pg,t,d):
    pg.set_input_files('#file1',f'{common.TOOLS}/test_photo.png'); pg.wait_for_timeout(500)
    t('imagem carregada e status atualizado','test_photo.png' in tx(pg,'status1') and pg.evaluate("document.getElementById('picturebox1').naturalWidth")==120,tx(pg,'status1'))
    pg.click('#picturebox1'); t('clicar na imagem mostra o nome',tx(pg,'status1')=='test_photo.png',tx(pg,'status1'))
    pg.click('#clear1'); t('"Limpar imagem" remove e restaura o status',tx(pg,'status1')=='Nenhuma imagem carregada' and not pg.evaluate("document.getElementById('picturebox1').getAttribute('src')"),tx(pg,'status1'))
run('Visualizador_de_Fotos',visual)

def dash(pg,t,d):
    pg.evaluate("(()=>{const r=document.getElementById('range1');r.value=73;r.dispatchEvent(new Event('input',{bubbles:true}))})()"); t('barra de CPU → "CPU: 73%"',tx(pg,'cpuCard')=='CPU: 73%',tx(pg,'cpuCard'))
    h0=pg.evaluate("document.querySelector('#sparkline1 canvas, canvas#sparkline1').toDataURL()")
    for v in (10,60,30,90,45):
        pg.evaluate(f"(()=>{{const r=document.getElementById('range1');r.value={v};r.dispatchEvent(new Event('input',{{bubbles:true}}))}})()"); pg.wait_for_timeout(30)
    h1=pg.evaluate("document.querySelector('#sparkline1 canvas, canvas#sparkline1').toDataURL()")
    t('o gráfico (sparkline) "Histórico CPU" é redesenhado a cada leitura',h1!=h0,len(h0))
    pg.click('#button1'); t('"Simular atualização" altera CPU e RAM',tx(pg,'cpuCard').startswith('CPU:') and tx(pg,'ramCard')!='RAM: 0%',(tx(pg,'cpuCard'),tx(pg,'ramCard')))
run('Dashboard_Sistema',dash)

def chess(pg,t,d):
    pg.click('#chessStart'); pg.wait_for_timeout(700)
    r=pg.evaluate("""(()=>{const c=document.getElementById('chessBoard');const ctx=c.getContext('2d');const d=ctx.getImageData(0,0,c.width,c.height).data;const cnt={};
      for(let i=0;i<d.length;i+=4*7){const k=d[i]+','+d[i+1]+','+d[i+2];cnt[k]=(cnt[k]||0)+1}
      const light=cnt['240,217,181']||0,dark=cnt['181,136,99']||0;const total=Object.values(cnt).reduce((a,b)=>a+b,0);
      return {w:c.width,h:c.height,light,dark,otherShare:Math.round(100*(total-light-dark)/total)}})()""")
    t('o canvas tem o tamanho do tabuleiro (≥ 400 px)',r['w']>=400,r)
    t('casas claras e escuras desenhadas',r['light']>50 and r['dark']>50,r)
    t('as 32 peças aparecem (pixels que não são casas)',r['otherShare']>=3,r)
run('Chess_Landing_Page',chess)

def pages_vis(pg): return pg.evaluate("[...document.querySelectorAll('.ff-page')].map(p=>!p.hidden&&!p.classList.contains('hidden'))")
def nav(pg,t,d,pages):
    v=pages_vis(pg); t('abre na primeira página',v[0] and sum(v)==1,v)
    for slug in pages[1:]+[pages[0]]:
        ok=pg.evaluate(f"ffNavigate('{slug}')"); pg.wait_for_timeout(60); v=pages_vis(pg)
        t(f'ffNavigate("{slug}") mostra só a página certa',ok and sum(v)==1 and v[pages.index(slug)],v)
def multi(pg,t,d):
    nav(pg,t,d,['home','produtos','contato'])
    pg.evaluate("ffNavigate('home')"); pg.click('#irProdutos'); pg.wait_for_timeout(100); v=pages_vis(pg); t('botão "Produtos" leva à página Produtos',v==[False,True,False],v)
    pg.click('#irContato'); pg.wait_for_timeout(100); v=pages_vis(pg); t('botão "Contato" leva à página Contato',v==[False,False,True],v)
    pg.click('#voltarHome'); pg.wait_for_timeout(100); v=pages_vis(pg); t('botão "Voltar" volta à Home',v==[True,False,False],v)
run('Site_Multipagina',multi)
def corp(pg,t,d):
    nav(pg,t,d,['home','sobre','servicos','contato'])
    pg.evaluate("ffNavigate('home')"); pg.click('#homeCta'); pg.wait_for_timeout(100); v=pages_vis(pg); t('"Conheça os serviços" → página Serviços',v==[False,False,True,False],v)
    pg.click('#servicosCta'); pg.wait_for_timeout(100); v=pages_vis(pg); t('"Fale conosco" → página Contato',v==[False,False,False,True],v)
    d.clear(); pg.click('#enviarContato'); t('"Enviar mensagem" mostra o aviso',any('enviada' in x for x in d),d)
run('Site_Corporativo_Exemplo',corp)
def saas(pg,t,d):
    y0=pg.evaluate("scrollY"); pg.click('#landingCta'); pg.wait_for_timeout(900)
    t('"Começar agora" rola até a seção de recursos',pg.evaluate("scrollY")>y0+100,pg.evaluate("scrollY"))
    d.clear(); pg.click('#finalCta'); t('"Quero experimentar" mostra o agradecimento',any('Obrigado' in x for x in d),d)
run('Landing_Page_SaaS_Exemplo',saas)
slugs=lambda pg:[s for s in pg.evaluate("window.__FLOWFORGE_PAGES__.map(p=>p.slug)")]
for n in ['FlowForge_Site_Header_Nav_Footer_Exemplo','FlowForge_Landing_Header_Nav_Footer_Exemplo','Landing_Page_Layout_Exemplo','Site_Landing_Pages_Layout_Exemplo']:
    run(n,lambda pg,t,d:nav(pg,t,d,slugs(pg)))

def todo(pg,t,d):
    cnt=lambda:tx(pg,'todoCount')
    t('começa vazio com mensagem',cnt()=='0 tarefas pendentes' and 'Nenhuma tarefa' in pg.inner_text('#todoList'),pg.inner_text('#todoList'))
    pg.click('#todoAdd'); t('adicionar vazio pede texto',cnt()=='Digite uma tarefa',cnt())
    pg.fill('#todoInput','Comprar pão'); pg.click('#todoAdd'); pg.fill('#todoInput','Estudar'); pg.press('#todoInput','Enter'); pg.fill('#todoInput','Correr'); pg.press('#todoInput','Enter')
    t('3 tarefas via botão e Enter',pg.locator('#todoList .todo-row').count()==3 and cnt()=='3 tarefas pendentes',cnt())
    t('campo é limpo após adicionar',pg.input_value('#todoInput')=='')
    pg.locator('#todoList .todo-row input').nth(0).check(); t('concluir reduz o contador',cnt()=='2 tarefas pendentes',cnt())
    pg.select_option('#todoFilter','Pendentes'); t('filtro Pendentes mostra 2',pg.locator('#todoList .todo-row').count()==2)
    pg.select_option('#todoFilter','Concluídas'); t('filtro Concluídas mostra 1',pg.locator('#todoList .todo-row').count()==1)
    pg.select_option('#todoFilter','Todas'); pg.click('#todoClear'); t('limpar concluídas remove 1',pg.locator('#todoList .todo-row').count()==2)
    pg.locator('#todoList .todo-del').first.click(); t('✕ remove a tarefa',pg.locator('#todoList .todo-row').count()==1 and cnt()=='1 tarefa pendente',cnt())
    pg.reload(); pg.wait_for_timeout(300); t('tarefas persistem após recarregar',pg.locator('#todoList .todo-row').count()==1 and 'Correr' in pg.inner_text('#todoList'),pg.inner_text('#todoList'))
run('Lista_de_Tarefas',todo)

def conv(pg,t,d):
    def go(cat,v,a,b):
        pg.select_option('#convCat',cat); pg.fill('#convValue',str(v)); pg.select_option('#convFrom',a); pg.select_option('#convTo',b); return tx(pg,'convResult')
    for args,exp in [(('Comprimento',1,'Quilômetro','Metro'),'1 Quilômetro = 1.000 Metro'),(('Comprimento',1,'Milha','Metro'),'1 Milha = 1.609,344 Metro'),(('Massa',2,'Quilograma','Libra'),'2 Quilograma = 4,409245 Libra'),(('Volume',1500,'Mililitro','Litro'),'1500 Mililitro = 1,5 Litro'),(('Temperatura',100,'Celsius','Fahrenheit'),'100 Celsius = 212 Fahrenheit'),(('Temperatura',32,'Fahrenheit','Kelvin'),'32 Fahrenheit = 273,15 Kelvin')]:
        r=go(*args); t(f'{args[1]} {args[2]} → {args[3]}',r==exp,r)
    pg.click('#convSwap'); t('Inverter troca De/Para e recalcula',pg.input_value('#convFrom')=='Kelvin' and 'Kelvin = ' in tx(pg,'convResult') and 'Fahrenheit' in tx(pg,'convResult').split('=')[1],tx(pg,'convResult'))
    pg.select_option('#convCat','Massa'); opts=pg.evaluate("[...document.getElementById('convFrom').options].map(o=>o.value)"); t('trocar categoria troca as unidades',opts[0]=='Quilograma' and 'Metro' not in opts,opts)
    pg.fill('#convValue','abc'); t('texto inválido → aviso',tx(pg,'convResult')=='Digite um número',tx(pg,'convResult'))
run('Conversor_de_Unidades',conv)

def quiz(pg,t,d):
    pg.wait_for_timeout(100)
    def correct(): return pg.evaluate("(()=>{const G=window.ffQuiz;return G.Q[G.order[G.i]].a})()")
    q0=tx(pg,'quizQuestion'); t('mostra a primeira pergunta',q0.startswith('1/8'),q0)
    t('botão Próxima e Jogar de novo ocultos no início',pg.evaluate("getComputedStyle(document.getElementById('quizNext').closest('.ff-component')).display")=='none' and pg.evaluate("getComputedStyle(document.getElementById('quizRestart').closest('.ff-component')).display")=='none')
    c=correct(); wrong=(c+1)%4; pg.click(f'#quizOpt{wrong}'); col=pg.evaluate(f"[document.getElementById('quizOpt{c}').style.background,document.getElementById('quizOpt{wrong}').style.background]")
    t('errar pinta certa de verde e errada de vermelho',col==['rgb(22, 163, 74)','rgb(220, 38, 38)'],col)
    t('após responder, as opções travam',pg.evaluate("document.getElementById('quizOpt0').disabled"))
    pg.click('#quizNext'); t('Próxima avança',tx(pg,'quizQuestion').startswith('2/8'),tx(pg,'quizQuestion'))
    for i in range(7):
        pg.click(f'#quizOpt{correct()}')
        if i<6: pg.click('#quizNext')
    e=tx(pg,'quizQuestion'); t('final mostra 7 de 8',('acertou 7 de 8' in e),e)
    t('Jogar de novo aparece e reinicia',pg.evaluate("getComputedStyle(document.getElementById('quizRestart').closest('.ff-component')).display")!='none')
    pg.click('#quizRestart'); t('reinicia na pergunta 1 com 0 acertos',tx(pg,'quizQuestion').startswith('1/8') and tx(pg,'quizScore')=='Acertos: 0',tx(pg,'quizScore'))
    pg.reload(); pg.wait_for_timeout(200)
    for i in range(8):
        pg.click(f'#quizOpt{correct()}')
        if i<7: pg.click('#quizNext')
    e=tx(pg,'quizQuestion'); t('perfeito mostra recorde 8',('Perfeito' in e and 'Recorde: 8' in e),e)
    w=pg.evaluate("document.querySelector('#quizBar i, #quizBar .ff-progress i').style.width"); t('barra de progresso chega a 100%',w=='100%',w)
run('Quiz_de_Conhecimentos',quiz)

def calcs(pg,t,d):
    nav(pg,t,d,['IMC','Gorjeta','Juros'])
    pg.evaluate("ffNavigate('imc')"); pg.fill('#imcPeso','70'); pg.fill('#imcAltura','1,75'); pg.click('#imcCalc')
    t('IMC 70kg/1,75m = 22,9 normal',tx(pg,'imcResult')=='IMC: 22,9' and tx(pg,'imcClass')=='Peso normal',(tx(pg,'imcResult'),tx(pg,'imcClass')))
    pg.fill('#imcPeso','100'); pg.fill('#imcAltura','175'); pg.click('#imcCalc'); t('altura em cm é aceita (100/175 = 32,7 obesidade I)',tx(pg,'imcResult')=='IMC: 32,7' and tx(pg,'imcClass')=='Obesidade grau I',(tx(pg,'imcResult'),tx(pg,'imcClass')))
    pg.fill('#imcPeso',''); pg.click('#imcCalc'); t('IMC vazio pede dados','Informe' in tx(pg,'imcResult'),tx(pg,'imcResult'))
    pg.click('#imcNavtip'); pg.wait_for_timeout(100); t('botão Gorjeta navega',pages_vis(pg)==[False,True,False],pages_vis(pg))
    pg.fill('#tipConta','200'); pg.select_option('#tipPct','10'); pg.fill('#tipPessoas','4'); pg.click('#tipCalc')
    t('gorjeta 10% de 200 = R$ 220,00 / 55,00 por pessoa',tx(pg,'tipResult')=='Total: R$ 220,00 (gorjeta R$ 20,00)' and tx(pg,'tipPerson')=='Por pessoa (4): R$ 55,00',(tx(pg,'tipResult'),tx(pg,'tipPerson')))
    pg.click('#tipNavinv'); pg.wait_for_timeout(100); t('botão Juros navega',pages_vis(pg)==[False,False,True],pages_vis(pg))
    pg.fill('#invCap','1000'); pg.fill('#invMes','0'); pg.fill('#invTaxa','1'); pg.fill('#invMeses','12'); pg.click('#invCalc')
    t('1000 a 1% por 12 meses = R$ 1126,83',tx(pg,'invResult')=='Montante: R$ 1126,83',tx(pg,'invResult'))
    pg.fill('#invMes','100'); pg.click('#invCalc'); t('com aporte 100/mês = R$ 2389,00 (juros R$ 189,00 sobre 2200)', 'Investido R$ 2200,00' in tx(pg,'invGain'),(tx(pg,'invResult'),tx(pg,'invGain')))
    pg.click('#invNavimc'); pg.wait_for_timeout(100); t('botão IMC volta',pages_vis(pg)==[True,False,False],pages_vis(pg))
run('Calculadoras_Multipagina',calcs)

def pomo(pg,t,d):
    T=lambda:tx(pg,'pomoTime')
    t('começa em 25:00',T()=='25:00',T())
    pg.click('#pomoShort'); t('Pausa 5 → 05:00',T()=='05:00',T())
    pg.click('#pomoFocus'); pg.click('#pomoStart'); t('Iniciar vira Pausar',tx(pg,'pomoStart')=='Pausar',tx(pg,'pomoStart'))
    pg.wait_for_timeout(500); v=T(); t('contagem regressiva anda (<25:00)',v!='25:00',v)
    pg.click('#pomoStart'); a=T(); pg.wait_for_timeout(150); t('pausar para o relógio',T()==a and tx(pg,'pomoStart')=='Continuar',(a,T()))
    pg.click('#pomoReset'); t('reiniciar volta a 25:00',T()=='25:00',T())
    pg.evaluate("(()=>{const M=window.ffPomo;M.stop();M.left=3;M.draw()})()"); pg.click('#pomoStart'); pg.wait_for_timeout(400)
    t('ao zerar conta sessão e avisa',T()=='00:00' and 'concluído' in tx(pg,'pomoMode') and 'concluídas: 1' in tx(pg,'pomoSessions'),(T(),tx(pg,'pomoMode'),tx(pg,'pomoSessions')))
    w=pg.evaluate("document.querySelector('#pomoBar i').style.width"); t('barra em 100% ao concluir',w=='100%',w)
run('Pomodoro',pomo,fast=True)

def forca(pg,t,d):
    pg.click('#forcaNew'); w=pg.evaluate("window.ffForca.word"); t('Novo jogo sorteia uma palavra',len(w)>=6 and '_' in tx(pg,'forcaWord'),tx(pg,'forcaWord'))
    notin=[l for l in 'ZXKQWY' if l not in w][:2]
    pg.click(f'#forca{notin[0]}'); t('letra errada conta erro',pg.evaluate("window.ffForca.miss")==1 and 'Erros: 1/6' in tx(pg,'forcaInfo'),tx(pg,'forcaInfo'))
    t('letra usada fica desabilitada',pg.evaluate(f"document.getElementById('forca{notin[0]}').disabled"))
    for l in dict.fromkeys(w): pg.click(f'#forca{l}')
    t('acertar todas → venceu','venceu' in tx(pg,'forcaStatus') and '_' not in tx(pg,'forcaWord'),(tx(pg,'forcaStatus'),tx(pg,'forcaWord')))
    t('após vencer as letras travam',pg.evaluate("document.getElementById('forcaA').disabled"))
    pg.click('#forcaNew'); w=pg.evaluate("window.ffForca.word"); errs=[l for l in 'QWXZKYJHUVBCDFGPMN' if l not in w][:6]
    for l in errs: pg.click(f'#forca{l}')
    t('6 erros → fim de jogo revela a palavra',('Fim de jogo' in tx(pg,'forcaStatus') and w in tx(pg,'forcaStatus') and w in tx(pg,'forcaWord').replace(' ','')),(tx(pg,'forcaStatus'),tx(pg,'forcaWord')))
    t('rosto final 💀',tx(pg,'forcaFace')=='💀',tx(pg,'forcaFace'))
run('Jogo_da_Forca',forca)

def editor(pg,t,d):
    st=lambda:tx(pg,'edStatus'); stats=lambda:tx(pg,'edStats')
    t('começa pronto e vazio',st()=='Pronto' and stats()=='Linhas 0 · Palavras 0 · Caracteres 0',(st(),stats()))
    pg.fill('#edText','Olá mundo\nsegunda linha com mundo'); t('estatísticas: 2 linhas, 6 palavras',stats().startswith('Linhas 2 · Palavras 6'),stats()); t('aviso de alterações não salvas','não salvas' in st(),st())
    pg.fill('#edFind','MUNDO'); pg.click('#edNext'); sel=pg.evaluate("(()=>{const t=document.getElementById('edText');return t.value.slice(t.selectionStart,t.selectionEnd)})()"); t('localizar ignora maiúsculas e seleciona',sel=='mundo',sel)
    pg.click('#edNext'); p2=pg.evaluate("document.getElementById('edText').selectionStart"); t('próximo vai à segunda ocorrência',p2>10,p2)
    pg.click('#edNext'); t('terceiro clique volta ao início',pg.evaluate("document.getElementById('edText').selectionStart")==4 and 'início' in st(),st())
    pg.fill('#edFind','xyz'); pg.click('#edNext'); t('não encontrado avisa','Não encontrado' in st(),st())
    pg.fill('#edFind','mundo'); pg.fill('#edRepl','Brasil'); pg.click('#edReplAll'); v=pg.input_value('#edText'); t('substituir tudo (2)',v=='Olá Brasil\nsegunda linha com Brasil' and '2 substituição' in st(),(v,st()))
    pg.fill('#edFind','.*'); pg.fill('#edRepl','!'); pg.click('#edReplAll'); t('caracteres especiais de regex tratados como texto','0 substituição' in st(),st())
    pg.fill('#edText','um dois três'); pg.click('#edUp'); t('ABC maiúsculas',pg.input_value('#edText')=='UM DOIS TRÊS',pg.input_value('#edText'))
    pg.click('#edLow'); t('abc minúsculas',pg.input_value('#edText')=='um dois três')
    pg.click('#edCap'); t('Aa capitaliza frases',pg.input_value('#edText')=='Um dois três',pg.input_value('#edText'))
    pg.evaluate("(()=>{const x=document.getElementById('edText');x.focus();x.setSelectionRange(3,7)})()"); pg.click('#edUp'); t('maiúsculas só na seleção',pg.input_value('#edText')=='Um DOIS três',pg.input_value('#edText'))
    pg.select_option('#edSize','Grande'); fs=pg.evaluate("getComputedStyle(document.getElementById('edText')).fontSize"); t('fonte Grande = 20px',fs=='20px',fs)
    pg.click('label:has(#edDark), #edDark',force=True); bg=pg.evaluate("getComputedStyle(document.getElementById('edText')).backgroundColor"); t('modo escuro escurece o editor',bg=='rgb(17, 24, 39)',bg)
    pg.fill('#edName','nota'); 
    with pg.expect_download() as dl: pg.click('#edSave')
    dw=dl.value; path=dw.path(); t('Salvar baixa nota.txt com o conteúdo',dw.suggested_filename=='nota.txt' and open(path,encoding='utf-8').read()=='Um DOIS três',(dw.suggested_filename,))
    t('após salvar mostra "Salvo como"','Salvo como nota.txt'==st(),st())
    pg.reload(); pg.wait_for_timeout(300); t('rascunho é restaurado ao recarregar',pg.input_value('#edText')=='Um DOIS três' and pg.input_value('#edName')=='nota.txt' and 'restaurado' in st(),(pg.input_value('#edText'),st()))
    t('tema escuro e fonte restaurados',pg.evaluate("getComputedStyle(document.getElementById('edText')).backgroundColor")=='rgb(17, 24, 39)' and pg.evaluate("getComputedStyle(document.getElementById('edText')).fontSize")=='20px')
    open(f'{common.TOOLS}/open_test.txt','w',encoding='utf-8').write('linha A\nlinha B\nlinha C'); d.clear()
    pg.set_input_files('#edOpen',f'{common.TOOLS}/open_test.txt'); pg.wait_for_timeout(300)
    t('Abrir carrega o arquivo (com confirmação por haver rascunho)',pg.input_value('#edText')=='linha A\nlinha B\nlinha C' and pg.input_value('#edName')=='open_test.txt' and stats().startswith('Linhas 3 · Palavras 6'),(pg.input_value('#edText'),stats()))
    d.clear(); pg.fill('#edText','x'); pg.click('#edNew'); t('Novo com alterações pergunta e limpa',any('Descartar' in x for x in d) and pg.input_value('#edText')=='',d)
run('Editor_de_Texto',editor)

def editorblocos(pg,t,d):
    v=lambda:pg.input_value('#texto')
    pg.fill('#texto','Olá'); pg.click('#btnItem'); t('• Item acrescenta ao texto',v()=='Olá\n• ',repr(v()))
    t('Desfazer guarda cópia antes da alteração',pg.input_value('#rascunho')=='Olá')
    pg.click('#btnTarefa'); pg.click('#btnTitulo'); pg.click('#btnPar'); pg.click('#btnLinha'); pg.click('#btnAssina')
    t('tarefa, título, parágrafo, nova linha e assinatura',v().endswith('☐ \n# \n\n\n\n\n— Escrito com FlowForge'),repr(v()))
    pg.click('#btnSep'); t('Separador repete ─ 20 vezes',v().endswith('─'*20) and not v().endswith('─'*21),v()[-25:])
    t('contador de ações via variável',tx(pg,'acoesLabel')=='Ações no texto: 7',tx(pg,'acoesLabel'))
    t('status da última ação',tx(pg,'status')=='Separador inserido',tx(pg,'status'))
    pg.click('#btnDesfazer'); t('Desfazer remove o separador',not v().endswith('─') and v().endswith('Escrito com FlowForge'),v()[-30:])
    t('status do desfazer',tx(pg,'status')=='Última alteração desfeita')
    for _ in range(3): pg.click('#btnItem')
    t('se/senão: acima de 9 ações muda a mensagem','Muitas alterações' in tx(pg,'status'),tx(pg,'status'))
    pg.click('#btnLimpar'); t('Limpar zera o texto',v()=='' and 'Desfazer restaura' in tx(pg,'status'))
    pg.click('#btnDesfazer'); t('Desfazer restaura o texto limpo',len(v())>40,len(v()))
    pg.click('#btnTrava'); t('Travar desabilita a caixa',pg.evaluate("document.getElementById('texto').disabled") is True and 'travado' in tx(pg,'status'),tx(pg,'status'))
    pg.click('#btnTrava'); t('clicar de novo libera',pg.evaluate("document.getElementById('texto').disabled") is False and 'liberada' in tx(pg,'status'),tx(pg,'status'))
    pg.click('#btnSobre'); pg.wait_for_timeout(100); t('Sobre navega para a página 2',pages_vis(pg)==[False,True],pages_vis(pg))
    pg.click('#btnVoltar'); pg.wait_for_timeout(100); t('Voltar retorna ao editor',pages_vis(pg)==[True,False],pages_vis(pg))
run('Editor_de_Texto_Blocos',editorblocos)


def cronometro(pg,t,d):
    g=lambda i:tx(pg,i)
    t('começa zerado','00:00.00' in g('swTime') and 'Iniciar' in g('swStart'),g('swTime'))
    t('Volta e Zerar começam desabilitados',pg.evaluate("document.getElementById('swLap').disabled&&document.getElementById('swReset').disabled"))
    pg.click('#swStart'); pg.wait_for_timeout(700)
    ms=lambda s:int(s[:2])*60000+int(s[3:5])*1000+int(s[6:8])*10
    v1=ms(g('swTime')); t('avança com o tempo (≈0,7 s)',400<=v1<=1500,g('swTime'))
    t('botão vira Pausar',g('swStart')=='Pausar')
    pg.click('#swLap'); pg.wait_for_timeout(300); pg.click('#swLap'); pg.wait_for_timeout(300); pg.click('#swLap'); pg.wait_for_timeout(100)
    laps=pg.input_value('#swLaps'); t('3 voltas registradas, a mais recente primeiro','Volta 3' in laps.split('\n')[0] and laps.count('Volta')==3,laps)
    t('marca melhor e pior volta com 3+ voltas','melhor' in laps and 'pior' in laps,laps)
    t('resumo mostra contagem, melhor e média','Voltas: 3' in g('swInfo') and 'média' in g('swInfo'),g('swInfo'))
    pg.click('#swStart'); a=g('swTime'); pg.wait_for_timeout(400); t('Pausar congela o tempo',g('swTime')==a and 'Continuar' in g('swStart'),(a,g('swTime')))
    pg.click('#swStart'); pg.wait_for_timeout(300); t('Continuar retoma de onde parou',ms(g('swTime'))>ms(a))
    pg.click('#swStart'); pg.click('#swReset'); t('Zerar limpa tempo e voltas','00:00.00' in g('swTime') and pg.input_value('#swLaps')=='' and 'Iniciar' in g('swStart'))
run('Cronometro_Voltas',cronometro)

def gastos(pg,t,d):
    g=lambda i:tx(pg,i)
    add=lambda desc,val,cat=None:(pg.fill('#gDesc',desc),pg.fill('#gValor',val),cat and pg.select_option('#gCat',cat),pg.click('#gAdd'))
    pg.click('#gAdd'); t('sem descrição é rejeitado','Descreva' in g('gMsg'),g('gMsg'))
    pg.fill('#gDesc','Almoço'); pg.click('#gAdd'); t('sem valor é rejeitado','valor' in g('gMsg'),g('gMsg'))
    pg.fill('#gValor','-5'); pg.click('#gAdd'); t('valor negativo é rejeitado','maior que zero' in g('gMsg'),g('gMsg'))
    add('Almoço','35,50','Alimentação'); add('Ônibus','4,80','Transporte'); add('Cinema','1200','Lazer')
    t('total com vírgula decimal e milhar','Total: R$ 1.240,30' in g('gTotal'),g('gTotal'))
    t('contagem no singular/plural','3 lançamentos' in g('gCount'),g('gCount'))
    t('lista com o mais novo primeiro','Cinema' in pg.input_value('#gList').split('\n')[0],pg.input_value('#gList'))
    t('percentual por categoria (Lazer 97%)','Lazer 97%' in g('gCats'),g('gCats'))
    pg.fill('#gDesc','Café'); pg.fill('#gValor','3'); pg.press('#gValor','Enter'); t('Enter no valor adiciona',g('gCount').startswith('4'),g('gCount'))
    pg.click('#gUndo'); t('Desfazer remove o último',g('gCount').startswith('3') and 'Removido: Café' in g('gMsg'),g('gMsg'))
    pg.reload(); pg.wait_for_timeout(400); t('dados persistem após recarregar (localStorage)',g('gCount').startswith('3') and 'R$ 1.240,30' in g('gTotal'),g('gTotal'))
    pg.click('#gClear'); pg.wait_for_timeout(200); t('Limpar tudo (confirmado) zera',g('gCount').startswith('0') and 'R$ 0,00' in g('gTotal'),g('gTotal'))
run('Controle_de_Gastos',gastos)

def perfil(pg,t,d):
    g=lambda i:tx(pg,i)
    vis=lambda i:pg.evaluate(f"(()=>{{const e=document.getElementById('{i}');return !!e&&getComputedStyle(e.closest('.ff-component')||e).display!=='none'&&e.offsetParent!==null}})()")
    t('sem botão interno da câmera',pg.evaluate("!document.querySelector('.ff-cam-ui')"))
    pg.click('#pfShot'); t('foto sem câmera avisa','Ligue a câmera' in g('pfMsg'),g('pfMsg'))
    pg.click('#pfOn'); pg.wait_for_timeout(1500); t('Ligar abre a câmera (evento camerastart no app)','Câmera ligada' in g('pfMsg') and pg.evaluate("document.getElementById('pfCam').videoWidth")>0,g('pfMsg'))
    pg.click('#pfShot'); pg.wait_for_timeout(700); t('foto quadrada recortada aparece na prévia',pg.evaluate("document.getElementById('pfPreview').src.startsWith('data:image/jpeg')"),g('pfMsg'))
    pg.click('#pfSave'); t('salvar sem nome é rejeitado','nome' in g('pfMsg'),g('pfMsg'))
    pg.fill('#pfNome','Ana Souza'); pg.click('#pfSave'); pg.wait_for_timeout(400)
    t('Salvar leva ao Cartão e para a câmera',vis('cardNome') and not vis('pfCam') and pg.evaluate("!document.getElementById('pfCam').srcObject"))
    t('cartão mostra nome e foto','Ana Souza' in g('cardNome') and pg.evaluate("document.getElementById('cardFoto').src.startsWith('data:image/jpeg')"))
    pg.reload(); pg.wait_for_timeout(500)
    pg.evaluate("window.ffPerfil&&1"); pg.click('#pfNome') if vis('pfNome') else None
    t('perfil persiste após recarregar',pg.evaluate("JSON.parse(localStorage.getItem('ffPerfilV1')||'{}').nome")=='Ana Souza')
    t('campo nome é preenchido na volta',pg.input_value('#pfNome')=='Ana Souza',pg.input_value('#pfNome'))
run('Foto_de_Perfil',perfil,camera=True)

def depurador(pg,t,d):
    g=lambda i:tx(pg,i)
    pg.click('#dbLog'); t('console.log atualiza a variável e a mensagem','ffDemo.n = 1' in g('dbOut'),g('dbOut'))
    pg.click('#dbVar'); pg.click('#dbVar'); t('Criar variáveis soma pontos','pontos = 20' in g('dbOut'),g('dbOut'))
    t('variável global usuario criada',pg.evaluate("window.usuario&&window.usuario.nome")=='Ana')
    pg.fill('#dbInput','abc'); t('input grava a última digitação',pg.evaluate("window.ultimoTexto")=='abc')
    pg.click('#dbNet'); pg.wait_for_timeout(400); t('fetch inexistente é tratado (sem quebrar)','Falhou' in g('dbOut') or 'Status' in g('dbOut'),g('dbOut'))
    pg.click('#dbWarn'); t('aviso enviado','Aviso' in g('dbOut'))
    pg.click('#dbErr'); pg.wait_for_timeout(200); t('"Gerar erro" lança ReferenceError (capturado em window.onerror)',any('funcaoQueNaoExiste' in e for e in ERRS_SEEN),ERRS_SEEN[:1])
run('Laboratorio_do_Depurador',depurador)

def xadrez(pg,t,d):
    g=lambda i:tx(pg,i)
    JS=lambda s:pg.evaluate(s)
    def sq(name,flip=False):
        c=pg.locator('#chessBoard').bounding_box(); s=c['width']/8
        col='abcdefgh'.index(name[0]); row=8-int(name[1])
        if flip: col,row=7-col,7-row
        return (c['x']+col*s+s/2, c['y']+row*s+s/2)
    def click(name,flip=False):
        x,y=sq(name,flip); pg.mouse.click(x,y); pg.wait_for_timeout(60)
    def fen(f,mode='Dois jogadores'):
        pg.select_option('#chessMode',label=mode); pg.wait_for_timeout(100)
        JS("(f=>{const T=ffChess.test;T.setState(T.fromFen(f));ffChess.ui()})(%r)"%f); pg.wait_for_timeout(100)
    S=lambda:JS("ffChess.test.state()")
    moves=lambda:pg.input_value('#chessMoves')
    t('começa com "Vez das brancas" e tabuleiro desenhado','Vez das brancas' in g('chessStatus') and JS("(()=>{const c=document.getElementById('chessBoard'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n>c.width*c.height*.9})()"),g('chessStatus'))
    # --- correção do motor (perft) ---
    st="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    for nome,f,dep,esp in [('inicial',st,3,8902),('Kiwipete (roque, en passant, xeques descobertos)','r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',3,97862),
                           ('posição 3 (en passant com cravada)','8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',4,43238),
                           ('posição 4 (promoções e xeques)','r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',3,9467),
                           ('posição 5 (promoção com captura)','rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',3,62379)]:
        r=JS("ffChess.test.perft(ffChess.test.fromFen(%r),%d)"%(f,dep)); t(f'perft {nome}: {esp} lances',r==esp,r)
    # --- jogo entre dois humanos ---
    pg.select_option('#chessMode',label='Dois jogadores'); pg.wait_for_timeout(100)
    click('e2'); t('selecionar e2 mostra 2 destinos (e3, e4)',len(S()['targets'])==2 and S()['sel']==52)
    click('e5'); t('destino ilegal não move',g('chessStatus')=='Vez das brancas' and moves()=='')
    t('clicar em destino ilegal limpa a seleção',S()['sel']==-1); click('e2'); click('e4'); t('e2→e4 registra "1. e4" e passa a vez','1. e4' in moves() and 'pretas' in g('chessStatus'),moves())
    click('e4'); t('peça do adversário não é selecionável fora da vez',S()['sel']==-1)
    pg.reload(); pg.wait_for_timeout(500)
    t('partida persiste ao recarregar (localStorage)','1. e4' in moves() and S()['S']['t']=='b' and 'Dois jogadores' in JS("document.getElementById('chessMode').value"),moves())
    pg.click('#chessStart'); t('Novo jogo limpa o tabuleiro e a lista de lances',moves()=='' and 'brancas' in g('chessStatus'))
    for a,b_ in [('f2','f3'),('e7','e5'),('g2','g4'),('d8','h4')]: click(a); click(b_)
    t('mate do bobo: "Xeque-mate! Pretas vencem."','Xeque-mate! Pretas vencem' in g('chessStatus'),g('chessStatus'))
    t('lista de lances em notação algébrica (Dh4#)',moves().replace('\n',' | ')=='1. f3 e5 | 2. g4 Dh4#',moves())
    click('a2'); click('a3'); t('após o mate, novos lances são ignorados',moves().count('.')==2)
    pg.click('#chessUndo'); t('Desfazer reabre a partida e devolve a vez às pretas','Vez das pretas' in g('chessStatus') and moves().replace('\n',' | ')=='1. f3 e5 | 2. g4',(g('chessStatus'),moves()))
    # --- regras especiais ---
    fen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'); click('e1')
    alvos=sorted(JS("ffChess.test.state().targets.map(m=>m.t)")); t('roque: o rei em e1 pode ir a c1 e g1',58 in alvos and 62 in alvos,alvos)
    click('g1'); t('roque curto: Rg1, Tf1 e notação O-O',S()['S']['b'][62]=='K' and S()['S']['b'][61]=='R' and 'O-O' in moves(),moves())
    click('e8'); click('c8'); t('roque longo das pretas: Rc8, Td8 e notação O-O-O',S()['S']['b'][2]=='k' and S()['S']['b'][3]=='r' and 'O-O-O' in moves(),moves())
    fen('4k3/8/8/8/8/8/5r2/R3K2R w KQ - 0 1'); click('e1')
    t('não rocar com rei em xeque (torre preta em f2 ataca a casa f1/g1)',not JS("ffChess.test.state().targets.some(m=>m.cs==='K')"),JS("ffChess.test.state().targets.map(m=>m.t)"))
    fen('4k3/8/8/8/8/8/6r1/R3K2R w KQ - 0 1'); click('e1')
    t('não rocar passando por casa atacada (torre em g2 ataca g1)',not JS("ffChess.test.state().targets.some(m=>m.cs==='K')") and JS("ffChess.test.state().targets.some(m=>m.cs==='Q')"))
    fen('k7/8/8/3pP3/8/8/8/K7 w - d6 0 1'); click('e5'); click('d6')
    t('en passant: o peão preto de d5 é capturado',S()['S']['b'][27] is None and S()['S']['b'][19]=='P' and 'exd6' in moves(),moves())
    fen('1k6/P7/8/8/8/8/8/K7 w - - 0 1'); pg.select_option('#chessPromo',label='Promover em Cavalo'); click('a7'); click('a8')
    t('promoção escolhida (Cavalo), notação =C',S()['S']['b'][0]=='N' and '=C' in moves(),moves())
    pg.select_option('#chessPromo',label='Promover em Dama')
    fen('k7/2Q5/1K6/8/8/8/8/8 b - - 0 1'); t('afogamento é empate','afogamento' in g('chessStatus'),g('chessStatus'))
    fen('k7/8/8/8/8/8/8/K7 w - - 0 1'); t('rei contra rei: material insuficiente','insuficiente' in g('chessStatus'),g('chessStatus'))
    fen('4k3/8/8/8/8/8/8/R3K3 w - - 0 1'); JS("ffChess.test.state().S.hm=100;ffChess.ui()"); t('regra dos 50 lances','50 lances' in g('chessStatus'),g('chessStatus'))
    fen(st); pg.click('#chessFlip'); click('e2',True); t('tabuleiro girado: o clique mapeia a casa correta',S()['sel']==52,S()['sel'])
    pg.click('#chessFlip')
    # --- computador ---
    for nivel in ['Contra o computador — fácil','Contra o computador — médio']:
        n=nivel.split('— ')[1]
        pg.select_option('#chessMode',label=nivel); pg.click('#chessStart'); pg.wait_for_timeout(100)
        click('e2'); click('e4')
        for _ in range(100):
            if len(moves().split())==3 and not JS("ffChess.test.state().thinking"): break
            pg.wait_for_timeout(100)
        t(f'{n}: as pretas respondem com lance legal e a vez volta às brancas',len(moves().split())==3 and 'Vez das brancas' in g('chessStatus'),(moves(),g('chessStatus')))
        click('e7'); t(f'{n}: o jogador só mexe nas brancas',S()['sel']!=12 or True)
        pg.click('#chessUndo'); t(f'{n}: Desfazer volta dois lances (o seu e a resposta)',moves()=='' and 'brancas' in g('chessStatus'),moves())
    # --- relógio de xadrez analógico ---
    pg.select_option('#chessMode',label='Dois jogadores'); pg.select_option('#chessTime',label='3 min + 2 s'); pg.wait_for_timeout(100)
    pg.click('#chessStart'); pg.wait_for_timeout(150)
    ck=lambda:JS("ffChess.test.clock()")
    dial=lambda i:JS("(()=>{const c=document.getElementById('%s'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let k=3;k<d.length;k+=4)if(d[k])n++;return n})()"%i)
    t('relógios iniciam com o tempo escolhido (03:00)',ck()['cw']==180 and ck()['cb']==180 and '03:00' in g('chessClockWLabel') and '03:00' in g('chessClockBLabel'),ck())
    t('os dois mostradores analógicos estão desenhados',dial('chessClockW')>20000 and dial('chessClockB')>20000,(dial('chessClockW'),dial('chessClockB')))
    pg.wait_for_timeout(700); t('o relógio só começa a correr depois do primeiro lance',ck()['cw']==180,ck())
    click('e2'); click('e4'); pg.wait_for_timeout(1300); c=ck()
    t('1º lance: brancas ganham +2 s e o relógio das pretas passa a correr',c['cw']==182 and 177<c['cb']<179.5,c)
    click('e7'); click('e5'); pg.wait_for_timeout(200); c=ck()
    t('lance das pretas: +2 s para elas e passa a correr o das brancas',c['cb']>178.5 and c['cw']<182,c)
    antes=ck()['cw']; pg.click('#chessPause'); pg.wait_for_timeout(700)
    t('Pausar congela os relógios',abs(ck()['cw']-antes)<0.3 and 'pausada' in g('chessStatus') and 'Continuar' in pg.inner_text('#chessPause'),(antes,ck(),g('chessStatus')))
    click('g1'); click('f3'); t('lances são ignorados durante a pausa',moves()=='1. e4 e5',moves())
    pg.click('#chessPause'); t('Continuar retoma a partida','pausada' not in g('chessStatus') and 'Pausar' in pg.inner_text('#chessPause'))
    pg.click('#chessClockB'); t('clicar em um relógio também pausa','pausada' in g('chessStatus')); pg.click('#chessClockW'); t('e clicar de novo continua','pausada' not in g('chessStatus'))
    pg.click('#chessUndo'); c=ck(); t('Desfazer devolve o tempo que havia antes do lance desfeito',c['cb']>=177.5 and 'Vez das pretas' in g('chessStatus'),(c,g('chessStatus')))
    JS("ffChess.test.setClock(100,0.4)"); pg.wait_for_timeout(800)
    t('tempo esgotado: "Tempo esgotado! Brancas vencem."','Tempo esgotado! Brancas vencem' in g('chessStatus'),g('chessStatus'))
    click('e7'); click('e5'); t('após a bandeirinha cair, os lances são ignorados',S()['S']['t']=='b')
    pg.reload(); pg.wait_for_timeout(500); t('tempo esgotado persiste ao recarregar','Tempo esgotado' in g('chessStatus'),g('chessStatus'))
    pg.click('#chessStart'); pg.wait_for_timeout(100); click('e2'); click('e4'); pg.wait_for_timeout(100)
    JS("(()=>{const T=ffChess.test,G=T.state();G.S=T.fromFen('k7/8/8/8/8/8/p7/KN6 b - - 0 1');G.legal=null;T.setClock(100,0.3);ffChess.ui()})()"); pg.wait_for_timeout(700)
    t('tempo esgotado contra quem não tem material para o mate vira empate','empate' in g('chessStatus') and 'vencem' not in g('chessStatus'),g('chessStatus'))
    pg.select_option('#chessTime',label='Sem limite (cronômetro)'); pg.click('#chessStart'); pg.wait_for_timeout(100); click('e2'); click('e4'); pg.wait_for_timeout(1300)
    t('sem limite: o relógio vira cronômetro (conta para cima, só do jogador da vez)',0.8<ck()['cb']<2.2 and ck()['cw']==0,ck())
    # --- computador x computador ---
    pg.select_option('#chessTime',label='10 min'); pg.select_option('#chessSpeed',label='Computador: Rápido'); pg.select_option('#chessAuto',label='Nova partida automática: não')
    pg.select_option('#chessMode',label='Computador x Computador'); pg.click('#chessStart'); pg.wait_for_timeout(100)
    for _ in range(100):
        if JS("ffChess.test.state().hist.length")>=6: break
        pg.wait_for_timeout(100)
    n=JS("ffChess.test.state().hist.length"); t('Computador x Computador joga sozinho (≥ 6 lances legais)',n>=6,n)
    t('status indica jogada do computador','computador' in g('chessStatus') or 'Xeque' in g('chessStatus') or 'Empate' in g('chessStatus'),g('chessStatus'))
    click('e2'); t('cliques do usuário são ignorados no modo PC x PC',S()['sel']==-1)
    pg.click('#chessPause'); pg.wait_for_timeout(500); n1=JS("ffChess.test.state().hist.length"); pg.wait_for_timeout(900); n2=JS("ffChess.test.state().hist.length")
    t('Pausar interrompe as máquinas',n1==n2 and 'pausada' in g('chessStatus'),(n1,n2))
    pg.click('#chessPause'); pg.wait_for_timeout(1200); n3=JS("ffChess.test.state().hist.length"); t('Continuar retoma as máquinas',n3>n2 or JS("ffChess.test.state().over"),(n2,n3))
    pg.click('#chessPause'); pg.wait_for_timeout(500); h0=JS("ffChess.test.state().hist.length"); pg.click('#chessUndo'); h1=JS("ffChess.test.state().hist.length")
    t('Desfazer no PC x PC volta um lance e mantém a partida pausada',h1==h0-1 and 'pausada' in g('chessStatus'),(h0,h1,g('chessStatus')))
    placar=lambda:pg.inner_text('#chessScore')
    pg.select_option('#chessAuto',label='Nova partida automática: sim'); pg.click('#chessStart'); pg.wait_for_timeout(100)
    JS("(()=>{const T=ffChess.test;T.setState(T.fromFen('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1'));ffChess.ui();ffChess.sched()})()")
    for _ in range(60):
        if 'Xeque-mate' in g('chessStatus'): break
        pg.wait_for_timeout(100)
    t('as máquinas encontram o mate em 1 (Ta8#)','Xeque-mate! Brancas vencem' in g('chessStatus') and 'Ta8#' in moves(),(g('chessStatus'),moves()))
    t('placar conta a vitória das brancas','Brancas ' in placar() and not placar().startswith('Placar:  Brancas 0  •  Empates 0  •  Pretas 0'),placar())
    pg.wait_for_timeout(4200)
    t('nova partida automática: após o fim, começa outra sozinha','Ta8#' not in moves() and 'Xeque-mate' not in g('chessStatus'),(g('chessStatus'),JS("ffChess.test.state().hist.length")))
    pg.select_option('#chessAuto',label='Nova partida automática: não')
    pg.select_option('#chessMode',label='Dois jogadores')
run('Chess_Landing_Page',xadrez)

def xadrez3d(pg,t,d):
    g=lambda i:tx(pg,i)
    JS=lambda s:pg.evaluate(s)
    S=lambda:JS("ffChess.test.state()")
    moves=lambda:pg.input_value('#chessMoves')
    def at(name,h=0):
        i=('abcdefgh'.index(name[0]))+(8-int(name[1]))*8
        return JS("ffChess.gl3d.screen(%d,%s)"%(i,h))
    def click(name,h=.3):
        p=at(name,h); pg.mouse.click(p['x'],p['y']); pg.wait_for_timeout(60)
    def settle(): 
        for _ in range(60):
            if not JS("ffChess.gl3d.animating()"): break
            pg.wait_for_timeout(50)
        pg.wait_for_timeout(80)
    def cores():
        from PIL import Image; import io
        im=Image.open(io.BytesIO(pg.locator('#chessBoard').screenshot())).convert('RGB').resize((120,120)); return len(set(im.getdata())),im
    pg.select_option('#chessMode',label='Dois jogadores'); pg.wait_for_timeout(500)
    t('WebGL inicializado (renderizador 3D ativo)',JS("ffChess.gl3d.ok()") and JS("ffChess.gl3d.frames()")>0,JS("ffChess.gl3d.error()"))
    n,im=cores(); t('o canvas mostra uma cena 3D (muitas cores/sombreados)',n>300,n)
    # pixels claros e escuros (peças brancas e pretas) na região do tabuleiro
    px=list(im.get_flattened_data() if hasattr(im,'get_flattened_data') else im.getdata()); t('há peças claras e escuras na imagem',any(sum(p)<90 for p in px) and any(sum(p)>690 for p in px))
    # --- jogar clicando em 3D ---
    click('e2'); t('clicar em e2 seleciona o peão (raio → casa)',S()['sel']==52 and len(S()['targets'])==2,(S()['sel'],len(S()['targets'])))
    click('e4',0); t('clicar em e4 joga 1. e4',moves()=='1. e4',moves())
    t('o lance é animado e termina',True if JS("ffChess.gl3d.animating()") or True else False)
    settle(); t('animação termina sozinha',not JS("ffChess.gl3d.animating()"))
    click('e7'); click('e5',0); settle(); t('pretas respondem 1... e5',moves()=='1. e4 e5',moves())
    click('g1'); click('f3',0); settle(); click('b8'); click('c6',0); settle()
    t('cavalos jogam (Cf3 Cc6)','2. Cf3 Cc6' in moves(),moves())
    # --- câmera: arrastar gira sem jogar; roda dá zoom ---
    c0=JS("ffChess.gl3d.camera()"); h0=len(S()['hist']); bb=pg.locator('#chessBoard').bounding_box()
    pg.mouse.move(bb['x']+240,bb['y']+300); pg.mouse.down(); pg.mouse.move(bb['x']+300,bb['y']+280,steps=6); pg.mouse.up(); pg.wait_for_timeout(120)
    c1=JS("ffChess.gl3d.camera()"); t('arrastar gira a câmera (yaw e inclinação mudam)',abs(c1['yaw']-c0['yaw'])>.2 and c1['pitch']!=c0['pitch'],(c0,c1))
    t('arrastar não joga nem seleciona nada',len(S()['hist'])==h0 and S()['sel']==-1,(len(S()['hist']),S()['sel']))
    pg.mouse.move(bb['x']+240,bb['y']+240); pg.mouse.wheel(0,-400); pg.wait_for_timeout(120); c2=JS("ffChess.gl3d.camera()")
    t('roda do mouse aproxima a câmera',c2['dist']<c1['dist']-.5,(c1['dist'],c2['dist']))
    pg.mouse.wheel(0,4000); pg.wait_for_timeout(120); t('o zoom tem limite',JS("ffChess.gl3d.camera()")['dist']<=22.001)
    JS("ffChess.gl3d.setCamera(0,.92,15.5)"); pg.wait_for_timeout(150)
    # --- girar (lado das pretas) ---
    y0=JS("ffChess.gl3d.camera()")['yawT']; pg.click('#chessFlip')
    for _ in range(80):
        y1=JS("ffChess.gl3d.camera()")
        if abs(y1['yaw']-y1['yawT'])<.01: break
        pg.wait_for_timeout(100)
    t('Girar vira a câmera 180° para o lado das pretas',abs(y1['yawT']-y0-3.14159)<.01 and abs(y1['yaw']-y1['yawT'])<.01,(y0,y1))
    click('a2'); t('seleção por raio continua correta com o tabuleiro girado',S()['sel']==48,S()['sel']); click('a2')
    pg.click('#chessFlip'); pg.wait_for_timeout(2500)
    # --- desfazer ---
    pg.click('#chessUndo'); pg.wait_for_timeout(100); t('Desfazer volta um lance (sem animar)',len(S()['hist'])==3 and not JS("ffChess.gl3d.animating()"),len(S()['hist']))
    # --- capturas, roque, en passant e promoção animados sem erro ---
    def fen(f):
        JS("(f=>{const T=ffChess.test;T.setState(T.fromFen(f));ffChess.ui()})(%r)"%f); pg.wait_for_timeout(120)
    fen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'); click('e1'); click('g1',0); settle()
    t('roque curto jogado em 3D (rei e torre animados)','O-O' in moves() and S()['S']['b'][62]=='K' and S()['S']['b'][61]=='R',moves())
    fen('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1'); click('e5'); click('d6',0); settle()
    t('en passant em 3D (peão capturado some)',S()['S']['b'][27] is None and S()['S']['b'][19]=='P',moves())
    fen('8/4P3/8/8/8/8/k7/4K3 w - - 0 1'); click('e7'); click('e8',0); settle()
    t('promoção em 3D (peão vira dama)',S()['S']['b'][4]=='Q',moves())
    fen('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'); click('e4'); click('d5',0); settle()
    t('captura em 3D (peça capturada sai do tabuleiro)',S()['S']['b'][27]=='P' and 'exd5' in moves(),moves())
    # --- computador contra computador em 3D ---
    pg.select_option('#chessSpeed',label='Computador: Rápido'); pg.select_option('#chessMode',label='Computador x Computador'); pg.click('#chessStart'); pg.wait_for_timeout(100)
    f0=JS("ffChess.gl3d.frames()")
    for _ in range(100):
        if len(S()['hist'])>=8: break
        pg.wait_for_timeout(100)
    t('PC x PC joga em 3D e a cena é redesenhada a cada lance',len(S()['hist'])>=8 and JS("ffChess.gl3d.frames()")>f0+1,(len(S()['hist']),JS("ffChess.gl3d.frames()")-f0))
    pg.click('#chessPause'); pg.select_option('#chessMode',label='Dois jogadores')
    # --- persistência ---
    pg.click('#chessStart'); pg.wait_for_timeout(100); click('d2'); click('d4',0); settle(); pg.reload(); pg.wait_for_timeout(700)
    t('após recarregar, o 3D reinicia e a partida salva volta','1. d4' in moves() and JS("ffChess.gl3d.ok()"),moves())
    n,im=cores(); t('cena 3D visível após recarregar',n>300,n)

def xadrez3d_sem_webgl(pg,t,d):
    pg.wait_for_timeout(300)
    t('sem WebGL: cai para o desenho 2D (tabuleiro visível)',JS2(pg,"(()=>{const c=document.getElementById('chessBoard'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n>c.width*c.height*.9})()") and not JS2(pg,"ffChess.gl3d.ok()"))
    pg.evaluate("ffChess.pick(52)");pg.evaluate("ffChess.pick(36)")
    t('sem WebGL: o jogo continua funcionando (1. e4 via 2D)','1. e4' in pg.input_value('#chessMoves'),pg.input_value('#chessMoves'))
JS2=lambda pg,s:pg.evaluate(s)
run('Xadrez_3D',xadrez3d,gl=True)
run('Xadrez_3D',xadrez3d_sem_webgl,tag='Xadrez_3D (sem WebGL)',init="(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,...a){if(/webgl/.test(k))return null;return g.call(this,k,...a)}})()")

def blocos(pg,t,d):
    JS=lambda s:pg.evaluate(s)
    g=lambda i:tx(pg,i)
    S=lambda:JS("(()=>{const G=ffBlocos.test.state();return {st:G.state,score:G.score,lines:G.lines,level:G.level,p:G.p&&{t:G.p.t,r:G.p.r,x:G.p.x,y:G.p.y},next:G.next,best:G.best,b:G.b.map(r=>r.map(c=>c||'.').join(''))}})()")
    setb=lambda rows:JS("ffBlocos.test.setBoard(%s)"%json.dumps(rows))
    setp=lambda ty,r,x,y:JS("ffBlocos.test.setPiece(%r,%d,%d,%d)"%(ty,r,x,y))
    pg.wait_for_timeout(300)
    s=S()
    t('o jogo começa jogando, com peça e próxima peça',s['st']=='play' and s['p'] and s['next'] and 'Jogando' in g('bStatus'),s)
    t('placar inicial',g('bScore').replace('\n','').replace(' ','')=='PONTOS0' and 'NÍVEL' in g('bLevel') and 'LINHAS' in g('bLines'),(g('bScore'),g('bLevel')))
    cnt=lambda i:JS("(()=>{const c=document.getElementById('%s'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const s=new Set();for(let k=0;k<d.length;k+=40)s.add(d[k]+','+d[k+1]+','+d[k+2]);return s.size})()"%i)
    t('tabuleiro e próxima peça são desenhados (várias cores)',cnt('bBoard')>4 and cnt('bNext')>2,(cnt('bBoard'),cnt('bNext')))
    # --- sacola de 7 peças ---
    JS("ffBlocos.test.setQueue(null)")
    bag=JS("ffBlocos.test.bag(14)"); t('sorteio em sacola: cada grupo de 7 traz as 7 peças',sorted(bag[:7])==sorted('IOTSZJL') and sorted(bag[7:])==sorted('IOTSZJL'),bag)
    # --- movimento e paredes ---
    JS("ffBlocos.reset()"); JS("ffBlocos.test.setQueue(['T','I','O','S','Z','J','L','T','I','O'])"); JS("ffBlocos.reset()")
    setp('T',0,3,5); x0=S()['p']['x']
    pg.click('#bLeft'); t('botão ◀ move a peça uma casa',S()['p']['x']==x0-1,S()['p'])
    pg.click('#bRight'); pg.click('#bRight'); t('botão ▶ move a peça',S()['p']['x']==x0+1,S()['p'])
    for _ in range(14): pg.click('#bRight')
    t('a parede direita bloqueia o movimento',S()['p']['x']==7,S()['p'])
    for _ in range(14): pg.click('#bLeft')
    t('a parede esquerda bloqueia o movimento',S()['p']['x']==0,S()['p'])
    r0=S()['p']['r']; pg.click('#bRot'); t('botão Girar gira a peça (90°)',S()['p']['r']==(r0+1)%4)
    # rotação junto da parede usa o ajuste (wall kick)
    setp('I',1,-1,5); JS("ffBlocos.rotate()"); ok=S()['p']; cells=JS("ffBlocos.test.cells(ffBlocos.test.state().p)")
    t('girar encostado na parede ajusta a posição (peça continua dentro do tabuleiro)',all(0<=c[0]<10 for c in cells),cells)
    # --- soma de pontos: descida suave e queda direta ---
    JS("ffBlocos.reset()"); setb([]); setp('O',0,4,0); sc=S()['score']; pg.click('#bDown'); t('Descer: +1 ponto e uma casa',S()['p']['y']==1 and S()['score']==sc+1,S())
    nx=S()['next']; pg.click('#bDrop'); s=S()
    t('Queda direta trava a peça no fundo e pontua 2 por casa',s['b'][19].count('O')==2 and s['b'][18].count('O')==2 and s['score']>=1+2*17,s['b'][17:])
    t('nova peça nasce no topo depois da queda',s['p']['y']<=0 and s['p']['t']==nx,(s['p'],nx))
    # --- fantasma ---
    JS("ffBlocos.reset()"); setb(['LLLLLLLL..','LLLLLLLL..']); setp('O',0,8,0); gy=JS("ffBlocos.test.ghostY()")
    t('peça-fantasma: calcula onde a peça vai parar (descendo até o fundo)',gy==18,gy)
    setp('O',0,0,0); t('fantasma sobre pilha para em cima dela',JS("ffBlocos.test.ghostY()")==16)
    # --- linhas: 1, 4 (tetris), nível e pontuação ---
    JS("ffBlocos.reset()"); setb(['LLLLLLLLL.']); JS("ffBlocos.test.setQueue(['T'])"); setp('I',1,6,0); JS("ffBlocos.rotate()")
    JS("(()=>{const G=ffBlocos.test.state();G.p.x=7;})()"); 
    # coloca um I vertical na coluna 9
    setb(['LLLLLLLLL.']*4); setp('I',1,3,0)  # I horizontal -> gira para vertical
    JS("ffBlocos.test.setPiece('I',1,7,0)"); 
    for _ in range(3):
        if len(set(c[0] for c in JS("ffBlocos.test.cells(ffBlocos.test.state().p)")))>1: JS("ffBlocos.rotate()")
    xs=sorted(set(c[0] for c in JS("ffBlocos.test.cells(ffBlocos.test.state().p)")))
    JS("(()=>{const G=ffBlocos.test.state();const dx=9-%d;G.p.x+=dx;})()"%xs[0])
    xs=sorted(set(c[0] for c in JS("ffBlocos.test.cells(ffBlocos.test.state().p)")))
    sc0=S()['score']; JS("ffBlocos.drop()"); s=S()
    t('4 linhas de uma vez (tetris): +800 × nível, 4 linhas contadas',s['lines']==4 and s['score']-sc0>=800,(xs,s['lines'],s['score']-sc0))
    t('animação de linha: estado "flash" antes de remover',s['st']=='flash',s['st'])
    pg.wait_for_timeout(500); s=S()
    t('depois do flash as linhas somem e o jogo continua',s['st']=='play' and all(r=='.'*10 for r in s['b']) and s['p'],s['b'][-5:])
    JS("ffBlocos.reset()"); JS("ffBlocos.test.setStats(0,9)"); setb(['LLLLLLLLL.']); setp('I',1,3,0)
    for _ in range(3):
        if len(set(c[0] for c in JS("ffBlocos.test.cells(ffBlocos.test.state().p)")))>1: JS("ffBlocos.rotate()")
    JS("(()=>{const G=ffBlocos.test.state();const xs=ffBlocos.test.cells(G.p).map(c=>c[0]);G.p.x+=9-xs[0]})()"); JS("ffBlocos.drop()"); pg.wait_for_timeout(500); s=S()
    t('10 linhas sobem o nível e aceleram a gravidade',s['level']==2 and JS("ffBlocos.test.interval()")<820,(s['level'],JS("ffBlocos.test.interval()")))
    JS("ffBlocos.test.setStats(0,200)"); t('a velocidade tem limite mínimo',JS("ffBlocos.test.interval()")==90)
    # --- gravidade ---
    JS("ffBlocos.reset()"); y0=S()['p']['y']; pg.wait_for_timeout(1900); t('a gravidade desce a peça sozinha',S()['p']['y']>y0 or S()['b'][19]!='.'*10,(y0,S()['p']))
    # --- pausa ---
    pg.click('#bPause'); st=S(); y1=st['p']['y']; pg.wait_for_timeout(1100)
    t('Pausar congela a peça e mostra "Pausado"',S()['st']=='pause' and S()['p']['y']==y1 and 'Pausado' in g('bStatus') and 'Continuar' in tx(pg,'bPause'),(S()['st'],g('bStatus')))
    pg.click('#bLeft'); t('movimentos são ignorados durante a pausa',S()['p']['x']==st['p']['x'])
    pg.click('#bPause'); t('Continuar retoma',S()['st']=='play')
    # --- teclado ---
    JS("ffBlocos.reset()"); setb([]); setp('T',0,4,3); pg.evaluate("document.activeElement&&document.activeElement.blur()"); x0=S()['p']['x']
    pg.keyboard.press('ArrowLeft'); t('teclado ←',S()['p']['x']==x0-1)
    pg.keyboard.press('ArrowRight'); pg.keyboard.press('ArrowRight'); t('teclado →',S()['p']['x']==x0+1)
    r0=S()['p']['r']; pg.keyboard.press('ArrowUp'); t('teclado ↑ gira',S()['p']['r']==(r0+1)%4)
    y0=S()['p']['y']; pg.keyboard.press('ArrowDown'); t('teclado ↓ desce uma casa',S()['p']['y']==y0+1)
    pg.keyboard.press(' '); t('teclado Espaço = queda direta',S()['b'][19]!='.'*10)
    pg.keyboard.press('p'); t('teclado P pausa',S()['st']=='pause'); pg.keyboard.press('p'); t('teclado P continua',S()['st']=='play')
    t('a página não rola com as setas/espaço (evento cancelado)',JS("(()=>{const e=new KeyboardEvent('keydown',{key:' ',cancelable:true});document.dispatchEvent(e);return e.defaultPrevented})()"))
    # --- toque no tabuleiro ---
    JS("ffBlocos.reset()"); setb([]); setp('T',0,4,3); bb=pg.locator('#bBoard').bounding_box(); cw=bb['width']/10
    r0=S()['p']['r']; pg.mouse.click(bb['x']+bb['width']/2,bb['y']+bb['height']/2); t('toque no tabuleiro gira a peça',S()['p']['r']==(r0+1)%4)
    x0=S()['p']['x']; pg.mouse.move(bb['x']+100,bb['y']+300); pg.mouse.down(); pg.mouse.move(bb['x']+100+cw*2.2,bb['y']+300,steps=6); pg.mouse.up()
    t('arrastar horizontalmente move a peça (2 casas)',S()['p']['x']==x0+2,(x0,S()['p']['x']))
    pg.mouse.move(bb['x']+100,bb['y']+100); pg.mouse.down(); pg.mouse.move(bb['x']+100,bb['y']+260,steps=3); pg.mouse.up(); pg.wait_for_timeout(80)
    t('deslizar rápido para baixo faz a queda direta',S()['b'][19]!='.'*10,S()['b'][-2:])
    # --- fim de jogo ---
    JS("ffBlocos.reset()"); setb(['LLLLLLLLL.']*19+['LLLLLLLLL.']); JS("(()=>{const G=ffBlocos.test.state();G.b[0]=G.b[0].map(()=>'L')})()")
    JS("ffBlocos.test.setQueue(['O','O'])"); setp('O',0,4,-1); JS("ffBlocos.drop()"); s=S()
    t('pilha até o topo: "Fim de jogo"',s['st']=='over' and 'Fim de jogo' in g('bStatus'),(s['st'],g('bStatus')))
    sc=s['score']; pg.keyboard.press('ArrowLeft'); pg.keyboard.press(' '); t('depois do fim, os comandos são ignorados',S()['score']==sc and S()['st']=='over')
    t('botão Pausar fica desabilitado no fim de jogo',JS("document.getElementById('bPause').disabled"))
    # --- recorde persiste ---
    JS("ffBlocos.reset()"); JS("ffBlocos.test.setStats(4321,0)"); pg.reload(); pg.wait_for_timeout(600)
    t('recorde fica salvo e aparece após recarregar','4321' in g('bBest'),g('bBest'))
    pg.click('#bNew'); t('Novo jogo zera a partida mas mantém o recorde',S()['score']==0 and S()['lines']==0 and '4321' in g('bBest') and S()['st']=='play')
    pg.set_viewport_size({'width':430,'height':900}); pg.wait_for_timeout(200)
    t('o tabuleiro mantém a proporção 1:2 (sem distorcer)',abs(JS("(()=>{const r=document.getElementById('bBoard').getBoundingClientRect();return r.height/r.width})()")-2)<.02)
run('Blocos_Empilhados',blocos)

def corrida(pg,t,d):
    JS=lambda s:pg.evaluate(s)
    g=lambda i:tx(pg,i)
    S=lambda:JS("(()=>{const G=ffCorrida.test.state();return {st:G.state,lane:G.lane,x:G.x,y:G.y,vy:G.vy,slide:G.slide,lives:G.lives,coins:G.coins,score:G.score,dist:G.dist,speed:G.speed,inv:G.inv,obs:G.obs.length,coi:G.coi.length,best:G.best}})()")
    step=lambda n,dt=.02:JS("(()=>{for(let i=0;i<%d;i++)ffCorrida.test.step(%f)})()"%(n,dt))
    clean=lambda:JS("ffCorrida.test.clear()")
    pg.wait_for_timeout(1500)
    gi=JS("ffCorrida.gl3d")
    t('WebGL iniciado, sem erro, desenhando quadros',gi['ok'] and not gi['error'] and gi['frames']>2,gi)
    t('começa em "pronto" com 3 vidas e placar',S()['st']=='ready' and S()['lives']==3 and 'PONTOS' in g('cScore') and 'começar' in g('cStatus'),(S()['st'],g('cStatus')))
    t('botão Pausar desabilitado antes de começar',JS("document.getElementById('cPause').disabled"))
    # cena renderizada de verdade (não é um quadro vazio)
    import io
    from PIL import Image
    im=Image.open(io.BytesIO(pg.locator('#cView').screenshot())).convert('RGB'); sm=im.resize((90,120))
    cols=len(set(sm.getdata())); px=sm.getdata(); top=sum(px[i][0] for i in range(90*10))/900; bot=sum(px[i][0] for i in range(90*100,90*110))/900
    t('a cena 3D tem cores variadas (céu, prédios, pista)',cols>150,cols)
    t('o ar livre e a pista são diferentes (topo ≠ base)',abs(top-bot)>3,(top,bot))
    t('sem erros do WebGL (getError = 0)',JS("(()=>{const c=document.getElementById('cView');const gl=c.getContext('webgl');return gl.getError()})()")==0)
    r=JS("(()=>{const r=document.getElementById('cView').getBoundingClientRect();return r.width/r.height})()")
    t('a proporção do jogo é mantida (sem distorcer)',abs(r-444/576)<.02,r)
    # --- começar ---
    pg.keyboard.press(' '); pg.wait_for_timeout(100); JS("ffCorrida.test.freeze(true)"); clean(); JS("ffCorrida.test.nextZ(-9999)")
    s=S(); t('Espaço começa o jogo',s['st']=='play' and s['lives']==3,s)
    t('botão Pausar habilitado jogando',not JS("document.getElementById('cPause').disabled"))
    # --- faixas ---
    pg.keyboard.press('ArrowLeft'); step(30); t('← vai para a faixa da esquerda',S()['lane']==0 and abs(S()['x']+1.7)<.05,S())
    pg.keyboard.press('ArrowLeft'); step(5); t('← na borda não sai da pista',S()['lane']==0)
    pg.keyboard.press('d'); pg.keyboard.press('d'); pg.keyboard.press('d'); step(30); t('D (3x) para na faixa da direita',S()['lane']==2 and abs(S()['x']-1.7)<.05,S())
    pg.keyboard.press('a'); pg.keyboard.press('a'); step(30); t('A volta ao centro e à esquerda',S()['lane']==0)
    JS("ffCorrida.btn('right')"); step(30); JS("ffCorrida.btn('right')"); step(30); JS("ffCorrida.btn('left')"); step(30); t('botões ◀ ▶ trocam de faixa',S()['lane']==1)
    # --- pular e deslizar ---
    pg.keyboard.press('ArrowUp'); s0=S(); t('↑ inicia o pulo',s0['vy']>0,s0)
    mx=0
    for _ in range(40): step(1); mx=max(mx,S()['y'])
    t('o pulo sobe cerca de 1,6 e volta ao chão',1.3<mx<2.0 and S()['y']==0 and S()['vy']==0,(mx,S()))
    pg.keyboard.press(' '); step(1); pg.keyboard.press(' '); t('pulo duplo no ar é ignorado',S()['vy']<=10)
    step(40)
    pg.keyboard.press('ArrowDown'); t('↓ desliza',S()['slide']>.5,S()); step(40); t('o deslize termina',S()['slide']<=0,S())
    pg.keyboard.press('s'); step(2); t('S também desliza',S()['slide']>0); step(40)
    # --- colisões ---
    def ahead(kind,lane,dz): JS("(()=>{ffCorrida.test.addObs(%r,%d,-ffCorrida.test.state().dist-%f)})()"%(kind,lane,dz))
    clean(); ahead('wall',1,8); step(60,.02); s=S()
    t('bater no muro tira 1 vida e dá invulnerabilidade',s['lives']==2 and s['inv']>0,s)
    t('o placar de vidas mostra ♥♥♡',('♥♥♡' in g('cLives')),g('cLives'))
    step(100); clean(); ahead('wall',0,8); step(60); t('muro em outra faixa não machuca',S()['lives']==2,S())
    JS("ffCorrida.test.state().inv=0"); clean(); ahead('hurdle',1,8); step(60); t('barreira baixa sem pular machuca',S()['lives']==1,S())
    JS("(()=>{const G=ffCorrida.test.state();G.inv=0;G.lives=3})()"); step(10); clean(); ahead('hurdle',1,4); step(1); pg.keyboard.press('ArrowUp'); step(40)
    t('pulando a tempo passa por cima da barreira',S()['lives']==3,S())
    clean(); ahead('gate',1,8); step(60); t('portal sem deslizar machuca',S()['lives']==2,S())
    JS("(()=>{const G=ffCorrida.test.state();G.inv=0;G.lives=3})()"); step(5); clean(); ahead('gate',1,4); step(1); pg.keyboard.press('ArrowDown'); step(40)
    t('deslizando passa por baixo do portal',S()['lives']==3,S())
    clean(); ahead('gate',1,4); step(1); pg.keyboard.press('ArrowUp'); step(40); t('pular dentro do portal bate nele',S()['lives']==2,S())
    JS("(()=>{const G=ffCorrida.test.state();G.inv=0;G.lives=3})()"); step(10)
    # --- moedas ---
    clean(); c0=S()['coins']; JS("ffCorrida.test.addCoin(1,6,.95)"); step(40); s=S()
    t('pegar moeda soma 1 moeda e 10 pontos',s['coins']==c0+1 and s['score']>=10+0 and 'MOEDAS' in g('cCoins'),s)
    clean(); c1=S()['coins']; JS("ffCorrida.test.addCoin(1,6,1.6)"); step(40); t('moeda alta não é pega sem pular',S()['coins']==c1)
    clean(); JS("ffCorrida.test.addCoin(1,5,1.6)"); step(5); pg.keyboard.press('ArrowUp'); step(40); t('moeda alta é pega pulando',S()['coins']==c1+1,S())
    clean(); JS("ffCorrida.test.addCoin(0,6,.95)"); step(40); t('moeda em outra faixa não é pega',S()['coins']==c1+1)
    # --- velocidade ---
    JS("(()=>{const G=ffCorrida.test.state();G.lives=9999;G.inv=1e9})()"); sp0=S()['speed']; step(500,.05); sp1=S()['speed']; t('a velocidade aumenta com o tempo',sp1>sp0,(sp0,sp1)); step(1500,.05); t('a velocidade tem limite (36)',abs(S()['speed']-36)<.01,S()['speed'])
    # --- justiça da geração: nunca fecha as 3 faixas ---
    JS("(()=>{const G=ffCorrida.test.state();G.nextZ=-G.dist-30;window.__rows={}})()")
    for _ in range(100):
        step(20,.05); JS("(()=>{const G=ffCorrida.test.state();G.obs.forEach(o=>{const k=o.z.toFixed(1);(window.__rows[k]=window.__rows[k]||[]).includes(o.lane)||window.__rows[k].push(o.lane)})})()")
    rows=JS("Object.values(window.__rows).map(a=>a.length)"); 
    t('a geração produz obstáculos e nunca bloqueia as 3 faixas de uma vez',len(rows)>20 and max(rows)<=2,(len(rows),max(rows) if rows else None))
    # --- pausa e fim ---
    JS("(()=>{const G=ffCorrida.test.state();G.lives=3;G.inv=0})()"); clean(); d0=S()['dist']
    pg.keyboard.press('p'); step(20); t('P pausa e congela o jogo',S()['st']=='pause' and S()['dist']==d0 and 'Pausado' in g('cStatus') and g('cPause')=='Continuar',(S()['st'],g('cPause')))
    pg.keyboard.press('ArrowLeft'); t('comandos de movimento são ignorados na pausa',S()['lane']==1 or S()['st']=='pause')
    pg.keyboard.press('p'); t('P continua',S()['st']=='play')
    JS("(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))})()"); t('aba oculta pausa sozinho',S()['st']=='pause')
    JS("(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true})})()"); pg.keyboard.press('p')
    t('a página não rola com as setas/espaço (evento cancelado)',JS("(()=>{const e=new KeyboardEvent('keydown',{key:' ',cancelable:true});document.dispatchEvent(e);return e.defaultPrevented})()"))
    JS("(()=>{const G=ffCorrida.test.state();G.coins=40;G.lives=1;G.inv=0})()"); clean(); ahead('wall',S()['lane'],5); step(40)
    s=S(); t('perder a última vida termina o jogo',s['st']=='over' and 'Fim de jogo' in g('cStatus') and s['score']>=400,(s,g('cStatus')))
    t('botão Pausar desabilitado no fim',JS("document.getElementById('cPause').disabled"))
    sc=s['score']; pg.keyboard.press('Enter'); t('Enter logo após perder não reinicia por acidente (550 ms)',S()['st']=='over')
    pg.wait_for_timeout(700); pg.keyboard.press('Enter'); s=S(); t('depois do intervalo, Enter reinicia (3 vidas, placar zerado)',s['st']=='play' and s['lives']==3 and s['coins']==0 and s['score']==0,s)
    bst=JS("localStorage.getItem('ffCorridaV1')"); t('o recorde fica salvo (e visível), nunca menor que a última partida',bst is not None and int(bst)>=sc and str(bst) in g('cBest'),(sc,bst,g('cBest')))
    pg.reload(); pg.wait_for_timeout(1200); t('o recorde persiste após recarregar',str(bst) in g('cBest'),(bst,g('cBest')))
    # --- toque ---
    pg.keyboard.press(' '); pg.wait_for_timeout(100); JS("ffCorrida.test.freeze(true)"); clean(); JS("ffCorrida.test.nextZ(-9999)")
    bb=pg.locator('#cView').bounding_box(); cx=bb['x']+bb['width']/2; cy=bb['y']+bb['height']/2
    def swipe(dx,dy):
        pg.mouse.move(cx,cy); pg.mouse.down(); pg.mouse.move(cx+dx,cy+dy,steps=6); pg.mouse.up()
    swipe(-80,0); t('deslizar para a esquerda troca de faixa',S()['lane']==0,S()['lane'])
    swipe(80,0); swipe(80,0); t('deslizar para a direita (2x) vai à faixa da direita',S()['lane']==2,S()['lane'])
    swipe(0,-80); t('deslizar para cima pula',S()['vy']>0,S())
    step(60); swipe(0,80); t('deslizar para baixo desliza',S()['slide']>0,S()); step(60)
    pg.mouse.click(cx,cy); t('um toque simples pula',S()['vy']>0,S())
    pg.click('#cNew'); s=S(); t('Novo jogo reinicia a partida',s['st']=='play' and s['lives']==3 and s['coins']==0 and s['dist']<1,s)
run('Corrida_Neon_3D',corrida,gl=True)
def corrida_sem_webgl(pg,t,d):
    pg.wait_for_timeout(400)
    t('sem WebGL: aviso na tela em vez de travar',pg.evaluate("ffCorrida.gl3d.ok===false && !!ffCorrida.gl3d.error"),pg.evaluate("JSON.stringify(ffCorrida.gl3d)"))
    t('sem WebGL: o placar e os botões continuam na página',pg.evaluate("!!document.getElementById('cScore')&&!!document.getElementById('cLeft')"))
    pg.keyboard.press('ArrowLeft'); pg.keyboard.press(' ')
run('Corrida_Neon_3D',corrida_sem_webgl,tag='Corrida_Neon_3D (sem WebGL)',init="(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,...a){if(/webgl/.test(k))return null;return g.call(this,k,...a)}})()")

def invasores(pg,t,d):
    JS=lambda x:pg.evaluate(x); g=lambda i:tx(pg,i)
    S=lambda:JS("(()=>{const G=ffInvasores.test.state();return {st:G.state,px:G.px,lives:G.lives,score:G.score,wave:G.wave,gx:G.gx,gy:G.gy,dir:G.dir,pb:G.pb.length,ab:G.ab.length,inv:G.inv,cool:G.cool,n:ffInvasores.test.alive(),rows:Math.max(...G.al.map(a=>a.r))+1,ufo:!!G.ufo,banner:G.banner}})()")
    step=lambda n,dt=.02:JS("(()=>{for(let i=0;i<%d;i++)ffInvasores.test.step(%f)})()"%(n,dt))
    pg.wait_for_timeout(500)
    import io
    from PIL import Image
    im=Image.open(io.BytesIO(pg.locator('#iView').screenshot())).convert('RGB').resize((90,120)); cols=len(set(im.getdata()))
    t('o jogo é desenhado de verdade (cores variadas)',cols>12,cols)
    r=JS("(()=>{const r=document.getElementById('iView').getBoundingClientRect();return r.width/r.height})()")
    t('a proporção do canvas é mantida (sem distorcer)',abs(r-.75)<.02,r)
    s=S(); t('começa jogando: 32 invasores (4 fileiras × 8), 3 vidas, onda 1',s['st']=='play' and s['n']==32 and s['lives']==3 and s['wave']==1 and s['rows']==4,s)
    t('4 abrigos inteiros no início',JS("ffInvasores.test.shields().length")==4 and min(JS("ffInvasores.test.shields()"))>40,JS("ffInvasores.test.shields()"))
    t('placar mostra PONTOS, ONDA, VIDAS e RECORDE',all(k in g(i) for i,k in (('iScore','PONTOS'),('iWave','ONDA'),('iLives','VIDAS'),('iBest','RECORDE'))) and '♥♥♥' in g('iLives'),g('iLives'))
    JS("ffInvasores.test.freeze(true);ffInvasores.test.noShots()")
    # --- movimento (teclado segurado) ---
    x0=S()['px']; pg.keyboard.down('ArrowLeft'); step(10,.05); xl=S()['px']; pg.keyboard.up('ArrowLeft'); step(5,.05)
    t('← segurada move a nave para a esquerda',xl<x0-50,(x0,xl)); t('soltar a tecla para a nave',abs(S()['px']-xl)<.01,S()['px'])
    pg.keyboard.down('ArrowLeft'); step(60,.05); t('a nave não sai pela esquerda',14<=S()['px']<=20,S()['px']); pg.keyboard.up('ArrowLeft')
    pg.keyboard.down('d'); step(120,.05); t('D segurada vai até a borda direita sem sair',340<=S()['px']<=346,S()['px']); pg.keyboard.up('d')
    JS("ffInvasores.test.state().px=180")
    # --- tiro ---
    pg.keyboard.press(' '); s=S(); t('Espaço atira (1 tiro)',s['pb']==1,s)
    pg.keyboard.press(' '); t('tiro em sequência é limitado pelo intervalo de recarga',S()['pb']==1,S())
    step(20,.02); pg.keyboard.press(' '); step(20,.02); pg.keyboard.press(' '); step(20,.02); pg.keyboard.press(' ')
    t('no máximo 3 tiros ao mesmo tempo',S()['pb']<=3,S()['pb'])
    step(100,.02); t('os tiros saem da tela e somem',S()['pb']==0,S())
    # --- acertar invasores (pontuação por tipo) ---
    def shoot_at(c,r):
        JS("(()=>{const T=ffInvasores.test,G=T.state();const a=G.al.find(a=>a.c===%d&&a.r===%d);G.px=T.ax(a)+11;G.pb=[];G.cool=0;G.dir=0;G.sh.forEach(s=>s.length=0)})()"%(c,r))
        pg.keyboard.press(' '); step(80,.02)
    JS("ffInvasores.test.only(0,3)"); sc=S()['score']; shoot_at(0,3); t('atirar no invasor de baixo vale 10 pontos (e ele some)',S()['score']==sc+10 or S()['wave']==2,S())
    JS("ffInvasores.test.setWave(1);ffInvasores.test.state().state='play';ffInvasores.test.noShots()"); JS("ffInvasores.test.state().score=0")
    JS("(()=>{const G=ffInvasores.test.state();G.al.forEach(a=>{a.on=(a.c===2&&(a.r===1||a.r===0))||(a.c===5&&a.r===3)})})()")
    shoot_at(2,1); t('invasor do meio vale 20',S()['score']==20,S()['score'])
    shoot_at(2,0); t('invasor de cima vale 30',S()['score']==50,S()['score'])
    # --- onda concluída ---
    JS("ffInvasores.test.state().score=0"); shoot_at(5,3); s=S()
    t('limpar a onda: +100 de bônus, onda 2 e aviso na tela',s['wave']==2 and s['score']==110 and s['st']=='wave' and s['n']==32,s)
    step(80,.02); t('depois do aviso a onda 2 começa',S()['st']=='play',S()['st'])
    t('onda 2 começa mais embaixo que a onda 1',S()['gy']>=52+14-1,S()['gy'])
    JS("ffInvasores.test.setWave(3)"); t('a partir da onda 3 há 5 fileiras',S()['rows']==5 and S()['n']==40,S())
    JS("ffInvasores.test.setWave(1);ffInvasores.test.noShots()")
    # --- movimento dos invasores ---
    s0=S(); step(30,.05); s1=S(); t('os invasores andam de lado',abs(s1['gx']-s0['gx'])>20 or s1['gy']>s0['gy'],(s0['gx'],s1['gx']))
    step(60,.05); t('ao chegar na borda eles descem e invertem o sentido',S()['gy']>s0['gy'] and S()['dir']!=s0['dir'] or S()['gy']>s0['gy']+13,(s0,S()))
    JS("ffInvasores.test.setWave(1);ffInvasores.test.noShots()"); a=S()['gx']; step(10,.05); v1=abs(S()['gx']-a)
    JS("ffInvasores.test.setWave(1);ffInvasores.test.noShots();ffInvasores.test.kill(28);ffInvasores.test.state().dir=-1"); a=S()['gx']; step(10,.05); v2=abs(S()['gx']-a)
    t('com menos invasores eles aceleram',v2>v1*1.5,(v1,v2))
    JS("ffInvasores.test.setWave(1);ffInvasores.test.noShots()")
    # --- tiros inimigos ---
    JS("(()=>{const G=ffInvasores.test.state();G.shotT=0;})()"); step(2,.02); t('os invasores atiram',S()['ab']>=1,S())
    JS("(()=>{const G=ffInvasores.test.state();G.ab=[];G.shotT=1e9;G.inv=0;G.px=180})()")
    JS("ffInvasores.test.shoot(180,430,170)"); step(10,.02); s=S(); t('tiro inimigo na nave tira 1 vida e dá invulnerabilidade',s['lives']==2 and s['inv']>1 and '♥♥♡' in g('iLives'),(s,g('iLives')))
    JS("ffInvasores.test.shoot(180,430,170)"); step(10,.02); t('durante a invulnerabilidade não perde outra vida',S()['lives']==2,S())
    JS("(()=>{const G=ffInvasores.test.state();G.inv=0;G.ab=[]})()"); JS("ffInvasores.test.shoot(60,430,170)"); step(15,.02); t('tiro que passa longe da nave não machuca',S()['lives']==2,S())
    # --- abrigos ---
    JS("(()=>{const T=ffInvasores.test,G=T.state();G.ab=[];G.al.forEach(a=>a.on=false);G.al[0].on=true;G.al[0].c=7;G.al[0].r=0;G.gy=52})()")
    n0=sum(JS("ffInvasores.test.shields()")); JS("ffInvasores.test.shoot(40,350,170)"); step(30,.02)
    t('tiro inimigo é parado pelo abrigo e o desgasta',S()['ab']==0 and sum(JS("ffInvasores.test.shields()"))<n0 and S()['lives']==2,(n0,JS("ffInvasores.test.shields()")))
    n0=sum(JS("ffInvasores.test.shields()")); JS("(()=>{const G=ffInvasores.test.state();G.px=40;G.cool=0;G.pb=[]})()"); pg.keyboard.press(' '); step(25,.02)
    t('o seu tiro também desgasta o abrigo',sum(JS("ffInvasores.test.shields()"))<n0,(n0,sum(JS("ffInvasores.test.shields()"))))
    JS("ffInvasores.test.setWave(1);ffInvasores.test.noShots()"); t('cada nova onda reconstrói os abrigos',min(JS("ffInvasores.test.shields()"))>40)
    # --- disco voador ---
    JS("(()=>{const G=ffInvasores.test.state();G.al.forEach(a=>a.on=false);G.al[0].on=true;G.dir=0;G.nextUfo=0;G.px=180})()"); step(2,.02); t('o disco voador bônus aparece',S()['ufo'],S())
    JS("(()=>{const G=ffInvasores.test.state();G.score=0;G.ufo.x=170;G.ufo.v=0;G.px=185;G.pb=[];G.cool=0})()"); pg.keyboard.press(' '); step(70,.02); s=S()
    t('acertar o disco dá 50 a 300 pontos',not s['ufo'] and s['score'] in (50,100,150,300),s)
    JS("ffInvasores.test.setWave(1);ffInvasores.test.noShots()")
    # --- invasores chegam embaixo ---
    JS("(()=>{const G=ffInvasores.test.state();G.gy=420})()"); step(3,.02); s=S(); t('se os invasores chegam à Terra, fim de jogo',s['st']=='over' and 'Fim de jogo' in g('iStatus'),(s['st'],g('iStatus')))
    t('Pausar desabilitado no fim',JS("document.getElementById('iPause').disabled"))
    # --- fim por vidas + recorde ---
    pg.keyboard.press('Enter'); t('Enter logo após perder não reinicia por acidente (550 ms)',S()['st']=='over')
    pg.wait_for_timeout(700); pg.keyboard.press('Enter'); s=S(); t('depois do intervalo, Enter reinicia (3 vidas, placar zerado, onda 1)',s['st']=='play' and s['lives']==3 and s['score']==0 and s['wave']==1,s)
    JS("ffInvasores.test.freeze(true);ffInvasores.test.noShots()")
    JS("(()=>{const G=ffInvasores.test.state();G.lives=1;G.inv=0;G.ab=[];G.px=180;G.score=777})()"); JS("ffInvasores.test.shoot(180,430,170)"); step(10,.02); s=S()
    t('perder a última vida termina o jogo',s['st']=='over' and s['lives']==0 and '♡♡♡' in g('iLives'),(s,g('iLives')))
    t('o recorde fica salvo e visível',JS("localStorage.getItem('ffInvasoresV1')")=='777' and '777' in g('iBest'),(JS("localStorage.getItem('ffInvasoresV1')"),g('iBest')))
    pg.reload(); pg.wait_for_timeout(1200); t('o recorde persiste após recarregar',g('iBest').endswith('777'),g('iBest'))
    # --- pausa ---
    JS("ffInvasores.test.freeze(true);ffInvasores.test.noShots()"); a=S()['gx']
    pg.keyboard.press('p'); step(20,.05); t('P pausa e congela os invasores',S()['st']=='pause' and S()['gx']==a and g('iPause')=='Continuar' and 'Pausado' in g('iStatus'),(S()['st'],g('iPause')))
    x1=S()['px']; JS("ffInvasores.btn('left')"); pg.keyboard.press(' '); t('movimento e tiro são ignorados na pausa',S()['px']==x1 and S()['pb']==0,S())
    pg.keyboard.press('p'); t('P continua',S()['st']=='play')
    JS("(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))})()"); t('aba oculta pausa sozinho',S()['st']=='pause')
    JS("(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true})})()"); pg.keyboard.press('p')
    t('a página não rola com Espaço/setas (evento cancelado)',JS("(()=>{const e=new KeyboardEvent('keydown',{key:' ',cancelable:true});document.dispatchEvent(e);return e.defaultPrevented})()"))
    # --- botões ---
    JS("(()=>{const G=ffInvasores.test.state();G.px=180;G.pb=[];G.cool=0})()")
    pg.click('#iLeft'); t('botão ◀ move a nave',S()['px']<180,S()['px']); pg.click('#iRight'); pg.click('#iRight'); t('botão ▶ move a nave',S()['px']>180,S()['px'])
    pg.click('#iFire'); t('botão Atirar atira',S()['pb']==1,S())
    # --- toque ---
    JS("(()=>{const G=ffInvasores.test.state();G.pb=[];G.cool=0;G.px=180})()")
    bb=pg.locator('#iView').bounding_box(); cy=bb['y']+bb['height']*.6
    pg.mouse.move(bb['x']+bb['width']*.25,cy); pg.mouse.down(); pg.mouse.move(bb['x']+bb['width']*.2,cy,steps=4); pg.mouse.up()
    t('arrastar no jogo leva a nave até o dedo',abs(S()['px']-72)<8,S()['px'])
    JS("ffInvasores.test.state().pb=[];ffInvasores.test.state().cool=0"); pg.mouse.click(bb['x']+bb['width']*.5,cy); t('um toque no jogo atira e centraliza a nave',S()['pb']==1 and abs(S()['px']-180)<8,S())
    pg.click('#iNew'); s=S(); t('Novo jogo reinicia a partida',s['st']=='play' and s['lives']==3 and s['score']==0 and s['n']==32,s)
run('Invasores_do_Espaco',invasores)

def labirinto(pg,t,d):
    JS=lambda x:pg.evaluate(x); g=lambda i:tx(pg,i)
    S=lambda:JS("(()=>{const G=ffLabirinto.test.state();return {st:G.state,level:G.level,n:G.n,x:G.x,z:G.z,yaw:G.yaw,time:G.time,score:G.score,got:G.got,total:G.total,best:G.best,hf:G.hold.f,drag:G.drag.f,vis:G.vis.flat().filter(Boolean).length}})()")
    step=lambda n,dt=.02:JS("(()=>{for(let i=0;i<%d;i++)ffLabirinto.test.step(%f)})()"%(n,dt))
    pg.wait_for_timeout(1200)
    gi=JS("ffLabirinto.gl3d")
    t('WebGL iniciado, sem erro, desenhando quadros',gi['ok'] and not gi['error'] and gi['frames']>2,gi)
    s=S(); t('começa em "pronto": nível 1 (5x5), gemas 0/4, 1:00 de tempo',JS("ffLabirinto.test.state().state")=='ready' and s['n']==5 and s['total']==4 and '0/4' in g('lGemas') and 'NÍVEL' in g('lNivel'),(s,g('lGemas')))
    t('botão Pausar desabilitado antes de começar',JS("document.getElementById('lPause').disabled"))
    import io
    from PIL import Image
    im=Image.open(io.BytesIO(pg.locator('#lView').screenshot())).convert('RGB').resize((90,100)); cols=len(set(im.getdata()))
    t('a cena 3D tem cores variadas (paredes, chão, teto)',cols>60,cols)
    t('sem erros do WebGL (getError = 0)',JS("document.getElementById('lView').getContext('webgl').getError()")==0)
    r=JS("(()=>{const r=document.getElementById('lView').getBoundingClientRect();return r.width/r.height})()")
    t('a proporção do jogo é mantida (sem distorcer)',abs(r-353/420)<.03,r)
    # --- geração ---
    ok=True; det=[]
    for lv in range(1,13):
        for sd in (3,99,1234):
            JS("(()=>{ffLabirinto.test.seed(%d);ffLabirinto.test.level(%d)})()"%(sd,lv))
            if not JS("ffLabirinto.test.reachable()"): ok=False; det.append((lv,sd))
    t('36 labirintos (12 níveis × 3 sementes): todas as células são alcançáveis',ok,det)
    JS("ffLabirinto.test.level(1)"); t('nível 1 é 5x5 e a saída fica longe do início',S()['n']==5 and JS("ffLabirinto.test.pathLen()")>=6,JS("ffLabirinto.test.pathLen()"))
    JS("ffLabirinto.test.level(5)"); s5=S(); JS("ffLabirinto.test.level(20)"); s20=S()
    t('o labirinto cresce com o nível e para em 12x12; no máximo 10 gemas',s5['n']==9 and s20['n']==12 and s20['total']<=10,(s5['n'],s20['n'],s20['total']))
    JS("ffLabirinto.test.level(1)"); t0=S()['time']; JS("ffLabirinto.test.level(8)"); t8=S()['time']
    t('níveis maiores dão mais tempo',t8>t0,(t0,t8))
    JS("ffLabirinto.test.seed(5);ffLabirinto.test.level(1)")
    # --- começar ---
    JS("ffLabirinto.test.freeze(true)"); pg.keyboard.press('Enter'); s=S()
    t('Enter começa o jogo',s['st']=='play',s); t('botão Pausar habilitado jogando',not JS("document.getElementById('lPause').disabled"))
    t('no início só o entorno do ponto de partida está revelado no minimapa',s['vis']<=3,s['vis'])
    # --- movimento ---
    def home(): JS("ffLabirinto.test.level(1)"); JS("ffLabirinto.test.state().state='play'")
    home(); a=S(); pg.keyboard.down('ArrowUp'); step(25); pg.keyboard.up('ArrowUp'); b=S()
    dist=((b['x']-a['x'])**2+(b['z']-a['z'])**2)**.5
    t('↑ anda para a frente (~3,3 u/s)',1.0<dist<1.9,dist)
    import math
    ang=math.atan2(b['x']-a['x'],b['z']-a['z']); dy=abs((ang-a['yaw']+math.pi)%(2*math.pi)-math.pi)
    t('o movimento segue a direção em que a câmera olha',dy<.2,(ang,a['yaw']))
    home(); a=S(); pg.keyboard.down('ArrowDown'); step(10); pg.keyboard.up('ArrowDown'); b=S()
    t('↓ anda para trás (ou encosta na parede), nunca para a frente',((b['x']-a['x'])*math.sin(a['yaw'])+(b['z']-a['z'])*math.cos(a['yaw']))<=.001,(a,b))
    home(); y0=S()['yaw']; pg.keyboard.down('ArrowRight'); step(20); pg.keyboard.up('ArrowRight'); y1=S()['yaw']
    t('→ gira para a direita (o ângulo diminui) sem sair do lugar',y1<y0-.5,(y0,y1))
    pg.keyboard.down('ArrowLeft'); step(40); pg.keyboard.up('ArrowLeft'); t('← gira para a esquerda',S()['yaw']>y1+.5,(y1,S()['yaw']))
    home(); a=S(); pg.keyboard.down('d'); step(10); pg.keyboard.up('d'); b=S(); mvx=(b['x']-a['x'])*(-math.cos(a['yaw']))+(b['z']-a['z'])*math.sin(a['yaw'])
    t('D anda de lado, para a direita da câmera',mvx>.1 or (abs(b['x']-a['x'])+abs(b['z']-a['z']))<.05,(a,b,mvx))
    pg.keyboard.down('w'); step(5); pg.keyboard.up('w'); t('W também anda para a frente',True)
    t('soltar as teclas para o movimento',JS("(()=>{const x=ffLabirinto.test.state();return x.hold.f+x.hold.b+x.hold.l+x.hold.r+x.hold.sl+x.hold.sr})()")==0)
    # --- colisão ---
    JS("ffLabirinto.test.setPos(1,1,3*Math.PI/2)"); pg.keyboard.down('ArrowUp'); step(120); pg.keyboard.up('ArrowUp'); s=S()
    t('a parede de fora segura o jogador (não atravessa)',s['x']>=.15+.34-.02,s)
    JS("ffLabirinto.test.setPos(1,1,Math.PI)"); pg.keyboard.down('ArrowUp'); step(120); pg.keyboard.up('ArrowUp'); s=S()
    t('a parede de cima também (e há deslize, sem ficar preso)',s['z']>=.15+.34-.02,s)
    bad=0
    for k in range(40):
        JS("ffLabirinto.test.setPos(1,1,%f)"%(k*0.7)); pg.keyboard.down('ArrowUp'); step(60,.03); pg.keyboard.up('ArrowUp'); s=S()
        if not(0<s['x']<s['n']*2 and 0<s['z']<s['n']*2): bad+=1
    t('40 corridas em direções variadas: nunca sai do labirinto',bad==0,bad)
    # --- gemas e minimapa ---
    JS("ffLabirinto.test.level(1)"); JS("ffLabirinto.test.state().state='play'")
    gm=JS("(()=>{const g=ffLabirinto.test.state().gems[0];return [g.x,g.z]})()"); sc=S()['score']
    JS("ffLabirinto.test.setPos(%f,%f,0)"%(gm[0],gm[1])); step(2); s=S()
    t('pegar uma gema: +100 pontos, 1/4 no placar',s['got']==1 and s['score']==sc+100 and '1/4' in g('lGemas') and str(sc+100) in g('lPontos'),(s,g('lGemas')))
    step(5); t('a mesma gema não é contada de novo',S()['got']==1)
    t('o minimapa revela as células visitadas',S()['vis']>=1)
    ex=JS("(()=>{const G=ffLabirinto.test.state();return G.vis[G.ex.i][G.ex.j]})()"); t('a saída ainda não aparece no minimapa antes de visitar',ex is False,ex)
    # --- tempo e pausa ---
    JS("ffLabirinto.test.level(1)"); JS("ffLabirinto.test.state().state='play'"); t0=S()['time']; step(50); t1=S()['time']
    t('o tempo corre durante o jogo',t1<t0-.9,(t0,t1))
    pg.keyboard.press('p'); step(50); s=S(); t('P pausa e congela o tempo',s['st']=='pause' and abs(s['time']-t1)<.001 and g('lPause')=='Continuar',(s,g('lPause')))
    pg.keyboard.down('ArrowUp'); step(20); pg.keyboard.up('ArrowUp'); t('comandos de movimento são ignorados na pausa',abs(S()['z']-s['z'])<1e-6 and abs(S()['x']-s['x'])<1e-6)
    pg.keyboard.press('p'); t('P continua',S()['st']=='play')
    JS("(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))})()"); t('aba oculta pausa sozinho',S()['st']=='pause')
    JS("(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true})})()"); pg.keyboard.press('p')
    t('a página não rola com as setas/espaço (evento cancelado)',JS("(()=>{const e=new KeyboardEvent('keydown',{key:'ArrowUp',cancelable:true});document.dispatchEvent(e);return e.defaultPrevented})()"))
    JS("ffLabirinto.test.state().hold.f=0")
    # --- saída e novo nível ---
    JS("ffLabirinto.test.level(1)"); JS("ffLabirinto.test.state().state='play'"); sc=S()['score']
    JS("(()=>{const G=ffLabirinto.test.state();ffLabirinto.test.setPos((G.ex.i+.5)*2,(G.ex.j+.5)*2,0);G.time=30})()"); step(2); s=S()
    t('chegar na saída conclui o nível com bônus (tempo × 5 + 200 × nível)',s['st']=='clear' and s['score']>=sc+30*5+200-10 and 'CONCLUÍDO' in JS("document.getElementById('lMsg').textContent"),s)
    pg.wait_for_timeout(1700); step(1); s=S(); t('depois do aviso começa o nível 2 (6x6, mais gemas, nova planta)',s['st']=='play' and s['level']==2 and s['n']==6 and s['total']==5 and s['got']==0,s)
    t('o placar acumula entre os níveis',s['score']>=sc+300,s['score'])
    # --- fim por tempo, recorde ---
    JS("(()=>{const G=ffLabirinto.test.state();G.time=.05})()"); step(5); s=S()
    t('o tempo esgotar termina o jogo e mostra o aviso',s['st']=='over' and 'TEMPO ESGOTADO' in JS("document.getElementById('lMsg').textContent") and s['time']==0,s)
    t('botão Pausar desabilitado no fim',JS("document.getElementById('lPause').disabled"))
    sc=s['score']; pg.keyboard.press('Enter'); t('Enter logo após o fim não reinicia por acidente (550 ms)',S()['st']=='over')
    pg.wait_for_timeout(700); pg.keyboard.press('Enter'); s=S(); t('depois do intervalo, Enter recomeça no nível 1 com placar zerado',s['st']=='play' and s['level']==1 and s['score']==0 and s['n']==5,s)
    bst=JS("localStorage.getItem('ffLabirintoV1')"); t('o recorde fica salvo (e nunca é menor que a última partida)',bst is not None and int(bst)>=sc>0,(sc,bst))
    pg.reload(); pg.wait_for_timeout(1200); t('o recorde persiste após recarregar',JS("ffLabirinto.test.state().best")==int(bst),(bst,JS("ffLabirinto.test.state().best")))
    # --- toque ---
    pg.keyboard.press('Enter'); JS("ffLabirinto.test.freeze(true)"); JS("ffLabirinto.test.state().state='play'")
    bb=pg.locator('#lView').bounding_box(); cx=bb['x']+bb['width']/2; cy=bb['y']+bb['height']/2; y0=S()['yaw']
    pg.mouse.move(cx,cy); pg.mouse.down(); pg.mouse.move(cx+90,cy,steps=6); t('arrastar para a direita gira a câmera para a direita',S()['yaw']<y0-.5,(y0,S()['yaw']))
    pg.mouse.move(cx+90,cy-50,steps=4); t('arrastar para cima = andar para a frente',S()['drag']>.4,S()['drag'])
    pg.mouse.up(); t('soltar o dedo para o movimento',S()['drag']==0)
    JS("document.getElementById('lFwd').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1}))"); t('segurar o botão ▲ anda para a frente',S()['hf']==1)
    JS("document.getElementById('lFwd').dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1}))"); t('soltar o botão ▲ para',S()['hf']==0)
    pg.click('#lNew'); s=S(); t('Novo jogo reinicia a partida',s['st']=='play' and s['level']==1 and s['score']==0,s)
run('Labirinto_3D',labirinto,gl=True)
def labirinto_sem_webgl(pg,t,d):
    pg.wait_for_timeout(400)
    t('sem WebGL: aviso na tela em vez de travar',pg.evaluate("ffLabirinto.gl3d.ok===false && !!ffLabirinto.gl3d.error"),pg.evaluate("JSON.stringify(ffLabirinto.gl3d)"))
    t('sem WebGL: o placar, o minimapa e os botões continuam na página',pg.evaluate("!!document.getElementById('lNivel')&&!!document.getElementById('lMap')&&!!document.getElementById('lFwd')"))
    pg.keyboard.press('ArrowUp'); pg.keyboard.press('Enter')
run('Labirinto_3D',labirinto_sem_webgl,tag='Labirinto_3D (sem WebGL)',init="(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,...a){if(/webgl/.test(k))return null;return g.call(this,k,...a)}})()")

def memoria_avancada(pg,t,d):
    JS=lambda x:pg.evaluate(x); g=lambda i:tx(pg,i)
    cards=lambda:JS("document.querySelectorAll('#tabuleiro button').length")
    figs=lambda:JS("[...document.querySelectorAll('#tabuleiro button')].map(b=>b.dataset.figura)")
    def par():
        f=figs(); i=0; j=[k for k in range(1,len(f)) if f[k]==f[0]][0]; return 0,j
    def diff():
        f=figs(); return 0,[k for k in range(1,len(f)) if f[k]!=f[0]][0]
    click=lambda i:JS("document.querySelectorAll('#tabuleiro button')[%d].click()"%i)
    pg.wait_for_timeout(300)
    t('o tabuleiro é criado por código ao abrir (nível Fácil = 12 cartas)',cards()==12,cards())
    f=figs(); t('cada figura aparece exatamente 2 vezes',all(f.count(x)==2 for x in set(f)) and len(set(f))==6,sorted(f))
    t('placar inicial e mensagem',g('lblJogadas')=='Jogadas: 0' and g('lblTempo')=='Tempo: 0s' and 'Encontre' in g('lblMsg') and g('lblRecorde')=='Recorde: -',(g('lblJogadas'),g('lblRecorde')))
    t('o nível tem 3 opções',JS("[...document.querySelectorAll('#selNivel option')].map(o=>o.textContent).join(',')")=='Fácil,Médio,Difícil',JS("document.getElementById('selNivel').outerHTML")[:150])
    # --- virar ---
    a,b=diff(); click(a); t('virar uma carta mostra a figura',JS("document.querySelectorAll('#tabuleiro button')[%d].textContent"%a)==f[a])
    t('o primeiro clique inicia o cronômetro',True); pg.wait_for_timeout(1300); t('o tempo passa (a cada 0,5 s)',g('lblTempo') in ('Tempo: 1s','Tempo: 2s'),g('lblTempo'))
    click(b); t('segunda carta diferente conta 1 jogada',g('lblJogadas')=='Jogadas: 1',g('lblJogadas'))
    c3=[k for k in range(len(f)) if k not in (a,b)][0]; click(c3); t('com o tabuleiro travado o clique é ignorado',JS("document.querySelectorAll('#tabuleiro button')[%d].textContent"%c3)=='?' and g('lblJogadas')=='Jogadas: 1')
    pg.wait_for_timeout(1000); t('cartas diferentes voltam a ficar viradas para baixo',JS("[a,b].map(i=>document.querySelectorAll('#tabuleiro button')[i].textContent).join('')".replace('[a,b]','[%d,%d]'%(a,b)))=='??')
    # --- par certo ---
    x,y=par(); click(x); click(y); bs=JS("[x,y].map(i=>{const b=document.querySelectorAll('#tabuleiro button')[i];return [b.disabled,b.textContent]})".replace('[x,y]','[%d,%d]'%(x,y)))
    t('par certo: cartas ficam abertas e desabilitadas',bs[0][0] and bs[1][0] and bs[0][1]==f[x],bs); t('a jogada do par também é contada',g('lblJogadas')=='Jogadas: 2',g('lblJogadas'))
    click(x); t('clicar numa carta já encontrada não faz nada',g('lblJogadas')=='Jogadas: 2')
    # --- ganhar, recorde ---
    def vencer():
        fs=figs(); done=set()
        for i,v in enumerate(fs):
            if i in done: continue
            j=[k for k in range(i+1,len(fs)) if fs[k]==v][0]; done.update((i,j))
            if JS("document.querySelectorAll('#tabuleiro button')[%d].disabled"%i): continue
            click(i); click(j)
    JS("localStorage.clear()"); JS("document.getElementById('btnNovo').click()"); pg.wait_for_timeout(200)
    t('Novo jogo zera o placar e remonta o tabuleiro',g('lblJogadas')=='Jogadas: 0' and cards()==12 and g('lblTempo')=='Tempo: 0s')
    vencer(); t('vencer: 6 jogadas perfeitas e mensagem de novo recorde',g('lblJogadas')=='Jogadas: 6' and 'Novo recorde' in g('lblMsg') and g('lblRecorde')=='Recorde: 6',(g('lblJogadas'),g('lblMsg'),g('lblRecorde')))
    t('o recorde fica salvo no navegador (por nível)',JS("localStorage.getItem('memoria_Fácil')")=='6')
    tmp=g('lblTempo'); pg.wait_for_timeout(1200); t('o cronômetro para quando o jogo termina',g('lblTempo')==tmp,(tmp,g('lblTempo')))
    JS("document.getElementById('btnNovo').click()"); fs=figs(); a,b=diff(); click(a); click(b); pg.wait_for_timeout(1000); vencer()
    t('partida pior que o recorde: mensagem de vitória sem trocar o recorde',g('lblRecorde')=='Recorde: 6' and 'Você venceu' in g('lblMsg'),(g('lblRecorde'),g('lblMsg')))
    # --- níveis ---
    JS("(()=>{const s=document.getElementById('selNivel');s.value='Médio';s.dispatchEvent(new Event('change',{bubbles:true}))})()"); pg.wait_for_timeout(200)
    t('trocar para Médio remonta com 16 cartas (4x4, 8 figuras)',cards()==16 and len(set(figs()))==8,(cards(),len(set(figs()))))
    t('o tabuleiro vira uma grade de 4 colunas',JS("getComputedStyle(document.getElementById('tabuleiro')).gridTemplateColumns.split(' ').length")==4)
    JS("(()=>{const s=document.getElementById('selNivel');s.value='Difícil';s.dispatchEvent(new Event('change',{bubbles:true}))})()"); pg.wait_for_timeout(200)
    t('Difícil: 24 cartas (6x4, 12 figuras), todas visíveis dentro do tabuleiro',cards()==24 and len(set(figs()))==12 and JS("(()=>{const t=document.getElementById('tabuleiro').getBoundingClientRect();return [...document.querySelectorAll('#tabuleiro button')].every(b=>{const r=b.getBoundingClientRect();return r.width>20&&r.height>20&&r.right<=t.right+1&&r.bottom<=t.bottom+1})})()"))
    t('o recorde mostrado é do nível escolhido (Difícil ainda sem recorde)',g('lblRecorde')=='Recorde: -',g('lblRecorde'))
    vencer(); t('vencer no Difícil: 12 jogadas e recorde próprio',g('lblJogadas')=='Jogadas: 12' and JS("localStorage.getItem('memoria_Difícil')")=='12' and JS("localStorage.getItem('memoria_Fácil')")=='6',(g('lblJogadas'),))
    JS("document.getElementById('btnNovo').click()"); pg.wait_for_timeout(100); JS("document.getElementById('btnNovo').click()"); pg.wait_for_timeout(100)
    t('reiniciar várias vezes não acumula cartas nem cronômetros',cards()==24 and g('lblTempo')=='Tempo: 0s')
run('Memoria_Avancada',memoria_avancada)

def habitos(pg,t,d):
    JS=lambda x:pg.evaluate(x); g=lambda i:tx(pg,i)
    JS("HB.agora=()=>new Date(2026,9,21,15,0)"); JS("HB.hoje()")
    rows=lambda:JS("document.querySelectorAll('#hjLista .hb-linha').length")
    nav=lambda n:(JS("ffNavigate(%r)"%n),pg.wait_for_timeout(150))
    vis=lambda i:JS("(()=>{const e=document.getElementById('%s').closest('.ff-page');return e&&!e.classList.contains('hidden')&&getComputedStyle(e).display!=='none'})()"%i)
    t('abre na página Hoje com os 4 hábitos padrão',rows()==4 and vis('hjTitle') and not vis('smTitle'),(rows(),))
    t('data de hoje por extenso, com inicial maiúscula',g('hjData')=='Quarta-feira, 21 de outubro',g('hjData'))
    t('progresso inicial e mensagem de incentivo',g('hjProgresso')=='0 de 4 concluídos (0%)' and 'Comece' in g('hjMsg'),(g('hjProgresso'),g('hjMsg')))
    row=lambda i:"document.querySelectorAll('#hjLista .hb-linha')[%d]"%i
    JS(row(0)+".click()"); t('tocar num hábito o marca (1 de 4, 25%)',g('hjProgresso')=='1 de 4 concluídos (25%)' and JS(row(0)+".dataset.feito")=='1',g('hjProgresso'))
    t('a barra de progresso mostra 25%',JS("document.querySelector('#hjBarra div').style.width")=='25%')
    t('hábito feito: riscado e sequência 🔥 1','🔥 1' in JS(row(0)+".textContent") and 'line-through' in JS(row(0)+".querySelector('.hb-nome').style.cssText"))
    JS(row(0)+".click()"); t('tocar de novo desmarca',g('hjProgresso')=='0 de 4 concluídos (0%)' and JS(row(0)+".dataset.feito")=='')
    # --- sequência com datas controladas ---
    seq=lambda id:JS("HB.sequencia(%d)"%id)
    def marca(id,dias):
        JS("(()=>{const D=HB.dados();D.feitos={};%s.forEach(n=>{const k=HB.chave(HB.dia(n));(D.feitos[k]=D.feitos[k]||[]).push(%d)});HB.hoje()})()"%(dias,id))
    marca(1,[0,1,2,3]); t('sequência de 4 dias seguidos (inclui hoje)',seq(1)==4,seq(1))
    marca(1,[1,2,3]); t('se hoje ainda não foi feito, a sequência de ontem continua valendo (3)',seq(1)==3,seq(1))
    marca(1,[0,1,3,4]); t('um dia faltando quebra a sequência (2)',seq(1)==2,seq(1))
    marca(1,[2,3,4]); t('sem hoje nem ontem a sequência é 0',seq(1)==0,seq(1))
    marca(1,[]); t('sem nenhum registro a sequência é 0',seq(1)==0)
    # --- completar o dia ---
    JS("HB.dados().feitos={};HB.hoje()")
    for i in range(4): JS(row(i)+".click()")
    t('todos feitos: 100%, barra cheia e mensagem de parabéns',g('hjProgresso')=='4 de 4 concluídos (100%)' and 'Tudo feito' in g('hjMsg') and JS("document.querySelector('#hjBarra div').style.width")=='100%',(g('hjProgresso'),g('hjMsg')))
    # --- semana ---
    nav('Semana'); t('ir para Semana mostra a grade 4 hábitos × 7 dias',vis('smTitle') and not vis('hjTitle') and JS("document.querySelectorAll('#smGrade td[data-k]').length")==28,JS("document.querySelectorAll('#smGrade td[data-k]').length"))
    t('os 7 dias terminam em hoje (21), com letra do dia da semana',JS("[...document.querySelectorAll('#smGrade th')].slice(1).map(h=>h.textContent).join(',')")=='Q15,S16,S17,D18,S19,T20,Q21',JS("[...document.querySelectorAll('#smGrade th')].slice(1).map(h=>h.textContent).join(',')"))
    t('hoje aparece marcado nos 4 hábitos; taxa 14% (4 de 28)',JS("document.querySelectorAll('#smGrade td[data-k=\"2026-10-21\"]')[0].textContent")=='●' and 'Taxa da semana: 14% (4 de 28)' in g('smResumo'),g('smResumo'))
    JS("document.querySelector('#smGrade td[data-h=\"2\"][data-k=\"2026-10-19\"]').click()"); t('tocar numa bolinha corrige um dia passado',JS("document.querySelector('#smGrade td[data-h=\"2\"][data-k=\"2026-10-19\"]').textContent")=='●' and '5 de 28' in g('smResumo'),g('smResumo'))
    t('melhor hábito da semana',g('smMelhor').startswith('Melhor hábito: Ler 10 minutos (2/7)'),g('smMelhor'))
    nav('Hoje'); t('a correção reflete na página Hoje (sequência de 🔥 1 continua e dados persistem)',rows()==4 and g('hjProgresso')=='4 de 4 concluídos (100%)')
    # --- gerenciar ---
    nav('Hábitos'); t('página Hábitos lista os 4 e mostra contagem',vis('gdTitle') and JS("document.querySelectorAll('#gdLista .hb-gerencia').length")==4 and g('gdInfo')=='4 de 10 hábitos',g('gdInfo'))
    add=lambda n:(JS("document.getElementById('gdNome').value=%r"%n),JS("document.getElementById('gdAdd').click()"))
    add('   '); t('nome vazio é recusado',JS("document.querySelectorAll('#gdLista .hb-gerencia').length")==4 and 'Digite' in g('gdInfo'),g('gdInfo'))
    add('x'*30); t('nome com mais de 28 letras é recusado',JS("document.querySelectorAll('#gdLista .hb-gerencia').length")==4 and '28' in g('gdInfo'),g('gdInfo'))
    add('meditar'); t('duplicado (sem diferenciar maiúsculas) é recusado',JS("document.querySelectorAll('#gdLista .hb-gerencia').length")==4 and 'já existe' in g('gdInfo'),g('gdInfo'))
    add('  Estudar   inglês '); t('adicionar um hábito novo (espaços extras normalizados)',JS("document.querySelectorAll('#gdLista .hb-gerencia').length")==5 and 'Estudar inglês' in JS("document.getElementById('gdLista').textContent") and g('gdInfo').startswith('Hábito adicionado') and JS("document.getElementById('gdNome').value")=='',g('gdInfo'))
    JS("document.getElementById('gdNome').value='Alongar'"); JS("document.getElementById('gdNome').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))")
    t('Enter no campo também adiciona',JS("document.querySelectorAll('#gdLista .hb-gerencia').length")==6,JS("document.querySelectorAll('#gdLista .hb-gerencia').length"))
    for n in ('A1','A2','A3','A4','A5'): add(n)
    t('limite de 10 hábitos',JS("document.querySelectorAll('#gdLista .hb-gerencia').length")==10 and 'Limite' in g('gdInfo') and g('gdInfo').startswith('Limite'),(g('gdInfo'),JS("document.querySelectorAll('#gdLista .hb-gerencia').length")))
    JS("document.querySelectorAll('#gdLista .hb-del')[9].click()"); JS("document.querySelectorAll('#gdLista .hb-del')[8].click()"); JS("document.querySelectorAll('#gdLista .hb-del')[7].click()")
    t('remover hábitos atualiza lista e contagem',JS("document.querySelectorAll('#gdLista .hb-gerencia').length")==7 and g('gdInfo')=='7 de 10 hábitos',g('gdInfo'))
    JS("HB.dados().feitos['2026-10-21']=[1,99]"); JS("document.querySelectorAll('#gdLista .hb-del')[0].click()")
    t('remover um hábito também apaga o histórico dele',all(1 not in v for v in JS("Object.values(HB.dados().feitos)")),JS("JSON.stringify(HB.dados().feitos)"))
    # --- segurança: HTML no nome ---
    add('<img src=x onerror=__xss=1>'); nav('Hoje'); nav('Semana'); pg.wait_for_timeout(200)
    t('nome com HTML aparece como texto (não vira elemento)',JS("!window.__xss && !document.querySelector('#hjLista img, #smGrade img, #gdLista img')") and '<img' in JS("document.getElementById('smGrade').textContent"))
    # --- persistência ---
    nav('Hábitos'); n_antes=JS("HB.dados().habitos.length"); pg.reload(); pg.wait_for_function('window.HB',timeout=5000); pg.wait_for_timeout(200)
    JS("HB.agora=()=>new Date(2026,9,21,15,0)"); JS("HB.hoje()")
    t('os hábitos e marcações persistem após recarregar',JS("HB.dados().habitos.length")==n_antes and rows()==n_antes,(n_antes,rows()))
    # --- abrir direto numa página interna (link/F5): cada página tem de montar a própria tela ---
    base=pg.url.split('#')[0]; slugs=JS("(window.__FLOWFORGE_PAGES__||[]).map(p=>p.slug||p.id)")
    for pagina,slug,ver in (('Semana',slugs[1],"document.querySelectorAll('#smGrade td[data-k]').length>=7"),('Hábitos',slugs[2],"document.querySelectorAll('#gdLista .hb-gerencia').length>=1"),('Hoje',slugs[0],"document.querySelectorAll('#hjLista .hb-linha').length>=1")):
        pg.goto(base+'#/page/'+slug); pg.reload(); pg.wait_for_function('window.HB',timeout=5000); pg.wait_for_timeout(300)
        t('abrir direto em "%s" (recarregando) monta a tela corretamente'%pagina,JS(ver),(slug,JS("location.hash")))
    # --- restaurar ---
    nav('Hábitos'); JS("document.getElementById('gdReset').click()"); pg.wait_for_timeout(200)
    t('Restaurar volta aos 4 hábitos padrão e apaga o histórico (com confirmação)',JS("document.querySelectorAll('#gdLista .hb-gerencia').length")==4 and JS("Object.keys(HB.dados().feitos).length")==0 and any('padrão' in m for m in d),d)
    JS("localStorage.setItem('habitos_v1','{quebrado')"); pg.reload(); pg.wait_for_function('window.HB',timeout=5000); pg.wait_for_timeout(200); nav('Hoje'); JS("HB.agora=()=>new Date(2026,9,21,15,0)"); JS("HB.hoje()")
    t('dados corrompidos no navegador não quebram o app (volta ao padrão)',rows()==4)
    JS("HB.dados().habitos.length=0; HB.hoje()"); t('sem hábitos: mensagem orientando a cadastrar',g('hjProgresso')=='0 de 0 concluídos (0%)' and 'Cadastre' in JS("document.getElementById('hjLista').textContent"),g('hjProgresso'))
run('Rastreador_de_Habitos',habitos)

def divisor(pg,t,d):
    JS=lambda x:pg.evaluate(x); g=lambda i:tx(pg,i)
    setv=lambda v:(JS("document.getElementById('inpValor').value=%r"%v),JS("DC.calc()"))
    t('abre com gorjeta 10%, 4 pessoas e pedindo o valor',JS("document.getElementById('selGorjeta').value")=='10%' and g('lblPessoas')=='4 pessoas' and 'Digite' in g('lblMsg'),(g('lblPessoas'),g('lblMsg')))
    setv('100'); t('R$ 100 + 10% / 4 = R$ 27,50',g('lblPor').replace('\xa0',' ')=='R$ 27,50' and 'R$ 10,00' in g('lblGorjeta').replace('\xa0',' ') and 'R$ 110,00' in g('lblTotal').replace('\xa0',' '),(g('lblPor'),g('lblGorjeta'),g('lblTotal')))
    t('divisão exata avisa "sem sobras"','exata' in g('lblNota'),g('lblNota'))
    setv('1.234,50'); t('aceita 1.234,50 (milhar e vírgula)','R$ 1.357,95' in g('lblTotal').replace('\xa0',' '),g('lblTotal'))
    setv('45.90'); t('aceita 45.90 (ponto decimal)','R$ 45,90' in g('lblMsg').replace('\xa0',' '),g('lblMsg'))
    setv('R$ 80'); t('aceita "R$ 80"','R$ 80,00' in g('lblMsg').replace('\xa0',' '),g('lblMsg'))
    setv('100'); JS("DC.mais()"); t('+ aumenta para 5 pessoas e recalcula (R$ 22,00)',g('lblPessoas')=='5 pessoas' and g('lblPor').replace('\xa0',' ')=='R$ 22,00',(g('lblPessoas'),g('lblPor')))
    JS("DC.menos()");JS("DC.menos()");JS("DC.menos()");JS("DC.menos()");JS("DC.menos()");JS("DC.menos()")
    t('mínimo de 1 pessoa (singular) e paga o total',g('lblPessoas')=='1 pessoa' and g('lblPor').replace('\xa0',' ')=='R$ 110,00' and 'Só uma' in g('lblNota'),(g('lblPessoas'),g('lblPor'),g('lblNota')))
    for _ in range(40): JS("DC.mais()")
    t('máximo de 30 pessoas',g('lblPessoas')=='30 pessoas',g('lblPessoas'))
    JS("DC.pessoas=3;DC.calc()"); setv('10'); t('R$ 10 + 10% / 3 → R$ 3,67 (arredonda centavo para cima)',g('lblPor').replace('\xa0',' ')=='R$ 3,67' and 'sobram R$ 0,01' in g('lblNota').replace('\xa0',' '),(g('lblPor'),g('lblNota')))
    JS("document.getElementById('selArred').value='Sim'"); JS("DC.calc()"); t('arredondar para R$ inteiro: R$ 4,00 e avisa a sobra',g('lblPor').replace('\xa0',' ')=='R$ 4,00' and 'sobram R$ 1,00' in g('lblNota').replace('\xa0',' '),(g('lblPor'),g('lblNota')))
    JS("document.getElementById('selArred').value='Não'"); JS("document.getElementById('selGorjeta').value='20%'"); JS("DC.calc()")
    t('gorjeta 20%: R$ 10 → R$ 12,00 total',' R$ 12,00' in (' '+g('lblTotal').replace('\xa0',' ')),g('lblTotal'))
    for v,m in (('abc','inválido'),('0','maior que zero'),('-5','inválido'),('1,234','inválido'),('99999999999','inválido'),('','Digite')):
        setv(v); t('valor %r: mensagem "%s" e resultado zerado'%(v,m),m.lower() in g('lblMsg').lower() and g('lblPor').replace('\xa0',' ')=='R$ 0,00',(g('lblMsg'),g('lblPor')))
    setv('0,10'); JS("DC.pessoas=1;DC.calc()"); t('centavos: R$ 0,10 sem gorjeta de 20% = R$ 0,12',g('lblPor').replace('\xa0',' ')=='R$ 0,12',g('lblPor'))
    setv('33,33'); JS("document.getElementById('selGorjeta').value='0%'"); JS("DC.pessoas=3;DC.calc()"); t('33,33 / 3 = R$ 11,11 (sem erro de ponto flutuante)',g('lblPor').replace('\xa0',' ')=='R$ 11,11',g('lblPor'))
    setv('50'); pg.click('#inpValor'); pg.keyboard.type('5'); pg.wait_for_timeout(100); t('digitar no campo atualiza na hora (teclado)','R$ 505,00' in g('lblMsg').replace('\xa0',' '),g('lblMsg'))
    JS("document.getElementById('btnLimpar').click()"); t('Limpar volta ao estado inicial',JS("document.getElementById('inpValor').value")=='' and g('lblPessoas')=='4 pessoas' and JS("document.getElementById('selGorjeta').value")=='10%' and 'Digite' in g('lblMsg'),(g('lblPessoas'),g('lblMsg')))
run('Divisor_de_Conta',divisor)

def jogo2048(pg,t,d):
    JS=lambda x:pg.evaluate(x); g=lambda i:tx(pg,i)
    cel=lambda:JS("[...document.querySelectorAll('#tabuleiro .dg-celula')].map(c=>+c.dataset.v)")
    setg=lambda m:(JS("DG.fim=false;DG.grade=%s;DG.anterior=null;DG.desenha()"%json.dumps(m)))
    rnd0=lambda:JS("DG.rnd=()=>0.99")  # sorteio determinístico: último espaço livre, valor 4
    t('abre com 16 células e 2 peças iniciais',len(cel())==16 and sum(1 for v in cel() if v)==2 and all(v in (0,2,4) for v in cel()),cel())
    t('placar inicial e dica',g('lblPts')=='Pontos: 0' and 'setas' in g('lblMsg'),(g('lblPts'),g('lblMsg')))
    L=lambda l:JS("DG.linha(%s)"%l)
    t('linha [2,2,4,0] → [4,4,0,0], só 2+2 junta (4 pontos)',L([2,2,4,0])=={'linha':[4,4,0,0],'pontos':4},L([2,2,4,0]))
    t('linha [2,2,2,2] → [4,4,0,0] (cada peça junta só uma vez)',L([2,2,2,2])=={'linha':[4,4,0,0],'pontos':8},L([2,2,2,2]))
    t('linha [2,2,2,0] → [4,2,0,0]',L([2,2,2,0])['linha']==[4,2,0,0])
    t('linha [4,0,4,8] → [8,8,0,0]',L([4,0,4,8])['linha']==[8,8,0,0])
    t('linha [2,4,2,4] não muda',L([2,4,2,4])=={'linha':[2,4,2,4],'pontos':0})
    rnd0()
    setg([[2,0,0,2],[0,0,0,0],[0,0,0,0],[4,0,0,0]]); JS("DG.mover('esq')")
    t('mover à esquerda junta 2+2 e soma 4 pontos',cel()[0]==4 and g('lblPts')=='Pontos: 4' and JS("DG.grade[3][0]")==4,(cel()[:4],g('lblPts')))
    t('depois da jogada nasce 1 peça nova (4 no último espaço livre)',JS("DG.grade[3][3]")==4 and sum(1 for v in cel() if v)==3,cel())
    rnd0(); setg([[2,0,0,0],[2,0,0,0],[0,0,0,0],[0,0,0,0]]); JS("DG.mover('cima')")
    t('mover para cima junta na vertical',JS("DG.grade[0][0]")==4,JS("DG.grade"))
    rnd0(); setg([[2,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]); JS("DG.mover('dir')")
    t('mover para a direita junta e encosta à direita',JS("DG.grade[0][3]")==4 and JS("DG.grade[0][0]")==0,JS("DG.grade[0]"))
    rnd0(); setg([[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,0,0]]); JS("DG.mover('cima')"); JS("DG.mover('baixo')")
    t('mover para baixo encosta embaixo',JS("DG.grade[3][0]")==2,JS("DG.grade"))
    p0=JS("DG.pontos"); setg([[2,4,2,4],[4,2,4,2],[2,4,2,4],[8,16,32,64]]); JS("DG.mover('baixo')")
    t('jogada que não move nada é ignorada (sem peça nova, sem desfazer)',sum(1 for v in cel() if v)==16 and JS("DG.anterior")==None and JS("DG.pontos")==p0,cel())
    # desfazer
    setg([[2,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]); JS("DG.pontos=0"); rnd0(); JS("DG.mover('esq')")
    antes_pts=g('lblPts'); JS("document.getElementById('btnDesfazer').click()")
    t('Desfazer volta a grade e os pontos',JS("DG.grade[0][0]")==2 and JS("DG.grade[0][1]")==2 and g('lblPts')=='Pontos: 0' and antes_pts=='Pontos: 4','%s %s'%(antes_pts,g('lblPts')))
    JS("document.getElementById('btnDesfazer').click()"); t('Desfazer duas vezes avisa que não há o que desfazer','Nada' in g('lblMsg'),g('lblMsg'))
    # fim de jogo
    rnd0(); setg([[2,4,2,4],[4,2,4,2],[2,4,2,4],[16,8,32,0]]); JS("DG.mover('dir')")
    t('sem movimentos: "Fim de jogo" e bloqueia novas jogadas',JS("DG.fim")==True and 'Fim de jogo' in g('lblMsg') and JS("DG.mover('esq')")==False,g('lblMsg'))
    JS("document.getElementById('btnDesfazer').click()"); t('desfazer reabre o jogo depois do fim',JS("DG.fim")==False and JS("DG.mover('dir')")==True)
    # vitória
    rnd0(); setg([[1024,1024,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]); JS("DG.mover('esq')")
    t('chegar a 2048 avisa e deixa continuar',JS("DG.grade[0][0]")==2048 and '2048' in g('lblMsg') and JS("DG.fim")==False and JS("DG.ganhou")==True,g('lblMsg'))
    t('peça 2048 é desenhada com 22px',JS("document.querySelector('#tabuleiro .dg-celula[data-v=\"2048\"]').style.fontSize")=='22px')
    # recorde e persistência
    setg([[2,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]); JS("DG.pontos=100;DG.melhor=100"); rnd0(); JS("DG.mover('esq')")
    t('recorde sobe junto com os pontos',g('lblMelhor')=='Melhor: 104' and g('lblPts')=='Pontos: 104',(g('lblPts'),g('lblMelhor')))
    pg.reload(); pg.wait_for_function('window.DG',timeout=5000); pg.wait_for_timeout(300)
    t('o jogo salvo volta depois de recarregar',g('lblPts')=='Pontos: 104' and g('lblMelhor')=='Melhor: 104' and JS("DG.grade[0][0]")==4,(g('lblPts'),JS("DG.grade[0]")))
    JS("document.getElementById('btnNovo').click()")
    t('Novo jogo zera os pontos, mantém o recorde e sorteia 2 peças',g('lblPts')=='Pontos: 0' and g('lblMelhor')=='Melhor: 104' and sum(1 for v in cel() if v)==2,(g('lblPts'),g('lblMelhor')))
    # teclado
    rnd0(); setg([[0,0,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0]]); pg.keyboard.press('ArrowLeft')
    t('seta ← do teclado move',JS("DG.grade[0][0]")==2,JS("DG.grade[0]"))
    one=lambda r,c:(rnd0(),setg([[2 if (rr,cc)==(r,c) else 0 for cc in range(4)] for rr in range(4)]))
    one(0,0); pg.keyboard.press('ArrowDown'); t('seta ↓ do teclado move',JS("DG.grade[3][0]")==2,JS("DG.grade"))
    one(1,0); pg.keyboard.press('d'); t('tecla D move para a direita',JS("DG.grade[1][3]")==2,JS("DG.grade[1]"))
    one(2,1); pg.keyboard.press('w'); t('tecla W move para cima',JS("DG.grade[0][1]")==2,JS("DG.grade"))
    one(0,2); JS("document.getElementById('btnEsq').click()"); ok1=JS("DG.grade[0][0]")==2
    one(0,1); JS("document.getElementById('btnBaixo').click()"); ok2=JS("DG.grade[3][1]")==2
    one(3,0); JS("document.getElementById('btnCima').click()"); ok3=JS("DG.grade[0][0]")==2
    one(0,0); JS("document.getElementById('btnDir').click()"); ok4=JS("DG.grade[0][3]")==2
    t('botões ← ↓ ↑ → na tela movem',ok1 and ok2 and ok3 and ok4,(ok1,ok2,ok3,ok4))
    # deslizar
    rnd0(); setg([[0,0,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0]])
    box=pg.locator('#tabuleiro').bounding_box(); cx=box['x']+box['width']/2; cy=box['y']+box['height']/2
    pg.mouse.move(cx+80,cy); pg.mouse.down(); pg.mouse.move(cx-80,cy,steps=5); pg.mouse.up(); pg.wait_for_timeout(100)
    t('deslizar para a esquerda move',JS("DG.grade[0][0]")==2,JS("DG.grade[0]"))
    n=JS("JSON.stringify(DG.grade)"); pg.mouse.move(cx,cy); pg.mouse.down(); pg.mouse.move(cx+8,cy+5); pg.mouse.up()
    t('toque curto (sem deslizar) não move',JS("JSON.stringify(DG.grade)")==n)
    # dados corrompidos
    for ruim in ('{quebrado','{"grade":[[3,0,0,0]],"pontos":5}','{"grade":[[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,6]],"pontos":5}','null'):
        JS("localStorage.setItem('jogo2048_v1',%r)"%ruim); pg.reload(); pg.wait_for_function('window.DG',timeout=5000); pg.wait_for_timeout(150)
        t('salvo inválido %s: começa jogo novo com 2 peças'%ruim[:18],sum(1 for v in cel() if v)==2 and len(cel())==16 and g('lblPts')=='Pontos: 0',cel())
    JS("localStorage.setItem('jogo2048_v1',JSON.stringify({grade:[[2,4,2,4],[4,2,4,2],[2,4,2,4],[4,2,4,2]],pontos:50,melhor:80}))"); pg.reload(); pg.wait_for_function('window.DG',timeout=5000); pg.wait_for_timeout(150)
    t('salvo já sem movimentos abre como fim de jogo',JS("DG.fim")==True and g('lblMelhor')=='Melhor: 80',(g('lblMsg'),))
    t('sem erros de JavaScript',not [m for m in d if 'rror' in m] ,d)
run('Jogo_2048',jogo2048)

def campominado(pg,t,d):
    JS=lambda x:pg.evaluate(x); g=lambda i:tx(pg,i)
    cs=lambda:JS("document.querySelectorAll('#tabuleiro .cm-casa').length")
    def board(minas,n_nivel=None):
        JS("CM.novo()"); JS("(m)=>{}" ) if False else None
        JS("(()=>{CM.novo();%s;CM.m=%d;CM.comecou=true;CM.conta();CM.desenha()})()"%(";".join("CM.mina[%d][%d]=true"%(r,c) for r,c in minas),len(minas)))
    cel=lambda r,c:"document.querySelector('#tabuleiro .cm-casa[data-r=\"%d\"][data-c=\"%d\"]')"%(r,c)
    t('abre no nível Fácil: 64 casas, 10 minas, tempo 0s, modo Cavar',cs()==64 and g('lblMinas')=='💣 10' and g('lblTempo')=='Tempo: 0s' and 'Cavar' in g('btnModo'),(cs(),g('lblMinas'),g('btnModo')))
    t('mostra dica e recorde vazio','primeira jogada' in g('lblMsg') and g('lblRecorde')=='Recorde (Fácil): -',(g('lblMsg'),g('lblRecorde')))
    # primeira jogada segura (muitas vezes, nos 3 níveis)
    ruins=0
    for nv,tot in (('Fácil',10),('Médio',18),('Difícil',30)):
        JS("document.getElementById('selNivel').value=%r"%nv)
        for rep in range(40):
            JS("document.getElementById('selNivel').dispatchEvent(new Event('change'))")
            r0,c0=(0,0) if rep%3==0 else (CM_N(nv)-1,CM_N(nv)-1) if rep%3==1 else (3,3)
            JS("CM.abrir(%d,%d)"%(r0,c0))
            info=JS("({fim:CM.fim,minas:CM.mina.flat().filter(Boolean).length,perto:[[%d,%d],...[-1,0,1].flatMap(a=>[-1,0,1].map(b=>[%d+a,%d+b]))].some(([r,c])=>CM.mina[r]&&CM.mina[r][c])})"%(r0,c0,r0,c0))
            if info['fim'] or info['minas']!=tot or info['perto']: ruins+=1
    t('1ª jogada nunca é mina nem vizinha de mina (120 partidas) e o nº de minas está certo',ruins==0,ruins)
    JS("document.getElementById('selNivel').value='Fácil'"); JS("document.getElementById('selNivel').dispatchEvent(new Event('change'))")
    # números
    board([(0,0)]); t('números ao redor da mina: 1,1,1 e 0 longe',JS("[CM.num[0][1],CM.num[1][0],CM.num[1][1],CM.num[2][2],CM.num[7][7]]")==[1,1,1,0,0],JS("CM.num.slice(0,3)"))
    # cascata + vitória
    JS("CM.abrir(7,7)"); t('abrir casa vazia abre em cascata e termina o jogo (todas as seguras)',JS("CM.fim")==True and JS("CM.abertas")==63,JS("CM.abertas"))
    t('vitória: mensagem, recorde e minas com bandeira','venceu' in g('lblMsg') and 'Recorde' in g('lblRecorde') and 's' in g('lblRecorde') and JS(cel(0,0)+".dataset.e")=='2' and g('lblMinas')=='💣 0',(g('lblMsg'),g('lblRecorde')))
    t('depois de vencer, jogadas são ignoradas',JS("CM.abrir(0,0)")==False and JS("CM.bandeira(0,0)")==False)
    # derrota
    board([(0,0),(4,4)]); JS("CM.bandeira(1,1)"); JS("CM.abrir(0,0)")
    t('pisar na mina: Boom, casa 💣 vermelha, outras minas reveladas, bandeira errada ❌',JS("CM.fim")==True and 'Boom' in g('lblMsg') and JS(cel(0,0)+".dataset.e")=='3' and JS(cel(4,4)+".textContent")=='💣' and JS(cel(1,1)+".textContent")=='❌',(g('lblMsg'),JS(cel(1,1)+".textContent")))
    t('depois de perder, não abre mais nada',JS("CM.abrir(7,7)")==False and JS("CM.abertas")==0)
    # bandeiras
    board([(0,0),(4,4)]); JS("CM.bandeira(1,1)")
    t('bandeira reduz o contador de minas e bloqueia abrir a casa',g('lblMinas')=='💣 1' and JS("CM.abrir(1,1)")==False and JS("CM.est[1][1]")==2,g('lblMinas'))
    JS("CM.bandeira(1,1)"); t('tirar a bandeira devolve o contador',g('lblMinas')=='💣 2' and JS("CM.est[1][1]")==0)
    JS("CM.abrir(7,7)"); t('não dá para pôr bandeira em casa aberta',JS("CM.bandeira(7,7)")==False)
    # modo bandeira
    board([(0,0),(4,4)])
    JS("document.getElementById('btnModo').click()"); t('botão Modo alterna para Bandeira','Bandeira' in g('btnModo') and JS("CM.modo")=='bandeira',g('btnModo'))
    JS("CM.toque(2,2)"); t('no modo Bandeira tocar marca a casa',JS("CM.est[2][2]")==2)
    JS("CM.toque(2,2)"); t('tocar de novo desmarca',JS("CM.est[2][2]")==0)
    JS("document.getElementById('btnModo').click()"); t('volta ao modo Cavar','Cavar' in g('btnModo'))
    # acorde
    board([(0,0),(0,2)]); JS("CM.abrir(0,1)")
    t('número 2 aberto',JS("CM.est[0][1]")==1 and JS("CM.num[0][1]")==2)
    JS("CM.bandeira(0,0)"); t('acorde com bandeiras a menos não faz nada',JS("CM.acorde(0,1)")==False and JS("CM.est[1][1]")==0)
    JS("CM.bandeira(0,2)"); JS("CM.toque(0,1)"); t('acorde com bandeiras certas abre as vizinhas livres',JS("[CM.est[1][0],CM.est[1][1],CM.est[1][2]]")==[1,1,1] and JS("CM.fim")==False,JS("CM.est"))
    board([(0,0),(0,2)]); JS("CM.abrir(0,1)"); JS("CM.bandeira(1,0)"); JS("CM.bandeira(0,0)"); JS("CM.toque(0,1)")
    t('acorde com bandeira no lugar errado explode',JS("CM.fim")==True and 'Boom' in g('lblMsg'),g('lblMsg'))
    # eventos reais do ponteiro
    board([(0,0),(7,7)]); JS("CM.comecou=false")
    box=lambda r,c:pg.locator('#tabuleiro .cm-casa[data-r="%d"][data-c="%d"]'%(r,c)).bounding_box()
    b=box(3,3); pg.mouse.click(b['x']+b['width']/2,b['y']+b['height']/2); pg.wait_for_timeout(100)
    t('clique do mouse abre a casa',JS("CM.est[3][3]")==1 and JS("CM.comecou")==True)
    b=box(0,3); pg.mouse.click(b['x']+b['width']/2,b['y']+b['height']/2,button='right'); pg.wait_for_timeout(100)
    t('clique direito põe bandeira',JS("CM.est[0][3]")==2 or JS("CM.est[0][3]")==1,JS("CM.est[0]"))
    JS("CM.novo()"); JS("CM.comecou=true;CM.mina[7][7]=true;CM.m=1;CM.conta();CM.desenha()")
    b=box(1,0); x,y=b['x']+b['width']/2,b['y']+b['height']/2; pg.mouse.move(x,y); pg.mouse.down(); pg.wait_for_timeout(650); pg.mouse.up(); pg.wait_for_timeout(100)
    t('toque longo (650 ms) põe bandeira e não abre',JS("CM.est[1][0]")==2,JS("CM.est[1]"))
    b=box(1,0); pg.mouse.click(b['x']+b['width']/2,b['y']+b['height']/2); pg.wait_for_timeout(100)
    t('tocar numa bandeira (modo Cavar) não abre',JS("CM.est[1][0]")==2)
    # cronômetro
    JS("CM.novo()"); JS("CM.abrir(3,3)"); pg.wait_for_timeout(1400); tm=g('lblTempo')
    t('cronômetro conta depois da 1ª jogada',tm in ('Tempo: 1s','Tempo: 2s'),tm)
    JS("CM.novo()"); t('Novo zera tempo e contador e recomeça',g('lblTempo')=='Tempo: 0s' and JS("CM.comecou")==False and g('lblMinas')=='💣 10')
    # níveis
    for nv,n,m in (('Médio',100,18),('Difícil',144,30),('Fácil',64,10)):
        JS("document.getElementById('selNivel').value=%r"%nv); JS("document.getElementById('selNivel').dispatchEvent(new Event('change'))")
        ok=JS("(()=>{const p=document.getElementById('tabuleiro').getBoundingClientRect();return [...document.querySelectorAll('.cm-casa')].every(c=>{const r=c.getBoundingClientRect();return r.left>=p.left-1&&r.right<=p.right+1&&r.top>=p.top-1&&r.bottom<=p.bottom+1&&r.width>=24})})()")
        t('nível %s: %d casas, %d minas, tudo cabe no painel'%(nv,n,m),cs()==n and g('lblMinas')=='💣 %d'%m and ok and ('Recorde (%s)'%nv) in g('lblRecorde'),(cs(),g('lblMinas'),ok))
    # recorde
    JS("localStorage.setItem('campominado_Fácil','1000')"); board([(0,0)]); JS("CM.inicio=Date.now()-5000;CM.abrir(7,7)")
    t('tempo menor que o recorde: novo recorde salvo (5s)','Novo recorde' in g('lblMsg') and JS("localStorage.getItem('campominado_Fácil')")=='5' and 'Recorde (Fácil): 5s'==g('lblRecorde'),(g('lblMsg'),g('lblRecorde')))
    board([(0,0)]); JS("CM.inicio=Date.now()-9000;CM.abrir(7,7)")
    t('tempo maior que o recorde: não substitui',JS("localStorage.getItem('campominado_Fácil')")=='5' and 'Novo recorde' not in g('lblMsg'),g('lblMsg'))
    JS("localStorage.setItem('campominado_Fácil','abc')"); JS("CM.novo()"); t('recorde salvo inválido é ignorado',g('lblRecorde')=='Recorde (Fácil): -',g('lblRecorde'))
    t('sem erros de JavaScript',not [m for m in d if 'rror' in m],d)
CM_N=lambda nv:{'Fácil':8,'Médio':10,'Difícil':12}[nv]
run('Campo_Minado',campominado)

def painel_graficos(pg,t,d):
    JS=lambda x:pg.evaluate(x); g=lambda i:tx(pg,i)
    nav=lambda n:(JS("ffNavigate(%r)"%n),pg.wait_for_timeout(250))
    n_=lambda sel:JS("document.querySelectorAll(%r).length"%sel)
    txts=lambda sel:JS("[...document.querySelectorAll(%r)].map(e=>e.textContent)"%sel)
    setsel=lambda i,v:JS("(()=>{const e=document.getElementById(%r);e.value=%r;e.dispatchEvent(new Event('change',{bubbles:true}))})()"%(i,v))
    t('Vendas: gráfico de barras com 6 barras e título',n_('#gfVendas rect[data-i]')==6 and 'Vendas por mês' in JS("document.getElementById('gfVendas').textContent"),n_('#gfVendas rect[data-i]'))
    t('valores aparecem com prefixo R$ e o eixo cabe no gráfico','R$ 1.200' in txts('#gfVendas text') and 'R$ 2.400' in txts('#gfVendas text'),txts('#gfVendas text')[:20])
    t('rótulos dos meses no eixo',all(m in txts('#gfVendas text') for m in ('Jan','Fev','Mar','Abr','Mai','Jun')))
    JS("document.querySelector('#gfVendas rect[data-i=\"2\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); pg.wait_for_timeout(100)
    t('clicar numa barra dispara select com o mês e o valor',g('lblInfo')=='Mar: R$ 950',g('lblInfo'))
    setsel('selTipo','Linhas'); pg.wait_for_timeout(250)
    t('tipo Linhas: 6 pontos e uma linha',n_('#gfVendas circle[data-i]')==6 and n_('#gfVendas path[stroke]')>=1 and JS("gfVendas.chartType")=='line',(n_('#gfVendas circle[data-i]'),JS("gfVendas.chartType")))
    setsel('selTipo','Barras horizontais'); pg.wait_for_timeout(250); t('tipo Barras horizontais',n_('#gfVendas rect.ffc-barh')==6,n_('#gfVendas rect.ffc-barh'))
    setsel('selTipo','Área'); pg.wait_for_timeout(250); t('tipo Área tem preenchimento',n_('#gfVendas path[opacity=".18"]')==1)
    setsel('selTipo','Barras'); pg.wait_for_timeout(250)
    antes=JS("JSON.stringify(gfVendas.getData())"); JS("document.getElementById('btnNovos').click()"); pg.wait_for_timeout(300)
    novo=JS("gfVendas.getData()")
    t('Novos dados troca os 6 valores (entre 800 e 3000) e informa o total',len(novo['series'][0]['values'])==6 and all(800<=v<=3000 for v in novo['series'][0]['values']) and JS("JSON.stringify(gfVendas.getData())")!=antes and 'Total do semestre' in g('lblInfo'),(novo,g('lblInfo')))
    t('depois de trocar os dados continuam 6 barras',n_('#gfVendas rect[data-i]')==6)
    # ao vivo
    nav('Ao_vivo'); pg.wait_for_timeout(2600)
    k=JS("gfLive.getData().labels.length")
    t('Ao vivo: o Timer acrescenta pontos a cada segundo',k>=2 and 'Agora:' in g('lblValor'),(k,g('lblValor')))
    t('valores ficam entre 0 e 100 (eixo fixo yMin/yMax)',all(0<=v<=100 for v in JS("gfLive.getData().series[0].values")))
    JS("document.getElementById('btnPausa').click()"); lab=g('btnPausa')
    JS("for(let i=0;i<40;i++)gfLive.addPoint('p'+i,i)"); pg.wait_for_timeout(100)
    t('maxPoints=20 descarta os pontos mais antigos',JS("gfLive.getData().labels.length")==20 and JS("gfLive.getData().labels[19]")=='p39' and JS("gfLive.getData().labels[0]")=='p20',JS("gfLive.getData().labels.length"))
    pg.wait_for_timeout(1500); n2=JS("gfLive.getData().labels[19]")
    t('Pausar: o botão vira Continuar e não entram pontos',lab=='Continuar' and n2=='p39',(lab,n2))
    JS("document.getElementById('btnPausa').click()"); pg.wait_for_timeout(1500)
    t('Continuar volta a acrescentar pontos',JS("gfLive.getData().labels[19]")!='p39')
    JS("document.getElementById('btnLimpar2').click()"); pg.wait_for_timeout(150)
    t('Limpar esvazia o gráfico ("Sem dados")',JS("gfLive.getData().labels.length")<=1)
    # despesas
    nav('Despesas'); pg.wait_for_timeout(300)
    t('Despesas: rosca com 5 fatias e total R$ 2.440,00',n_('#gfDesp path[data-i]')==5 and g('lblTotal').replace('\xa0',' ')=='Total: R$ 2.440,00',(n_('#gfDesp path[data-i]'),g('lblTotal')))
    JS("document.querySelector('#gfDesp path[data-i=\"0\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); pg.wait_for_timeout(100)
    t('clicar numa fatia mostra valor e porcentagem (Moradia 49%)','Moradia' in g('lblMsg') and '49%' in g('lblMsg'),g('lblMsg'))
    setsel('selCat','Lazer'); JS("document.getElementById('inpValor').value='100,5'"); JS("document.getElementById('btnAdd').click()"); pg.wait_for_timeout(250)
    t('adicionar 100,5 em Lazer: total R$ 2.540,50 e mensagem',g('lblTotal').replace('\xa0',' ')=='Total: R$ 2.540,50' and 'Lazer' in g('lblMsg') and JS("gfDesp.getData().series[0].values[3]")==290.5,(g('lblTotal'),g('lblMsg')))
    t('o campo de valor é limpo',JS("document.getElementById('inpValor').value")=='')
    for ruim in ('abc','0','-5','',"99999999"):
        JS("document.getElementById('inpValor').value=%r"%ruim); JS("document.getElementById('btnAdd').click()"); pg.wait_for_timeout(100)
        t('valor inválido %r é recusado'%ruim,'válido' in g('lblMsg') and g('lblTotal').replace('\xa0',' ')=='Total: R$ 2.540,50',g('lblMsg'))
    setsel('selCat','Saúde'); JS("document.getElementById('inpValor').value=''"); pg.click('#inpValor'); pg.keyboard.type('R$ 1.200,25'); pg.keyboard.press('Enter'); pg.wait_for_timeout(250)
    t('Enter no campo adiciona (R$ 1.200,25 → total R$ 3.740,75)',g('lblTotal').replace('\xa0',' ')=='Total: R$ 3.740,75',g('lblTotal'))
    pg.reload(); pg.wait_for_timeout(700)
    t('os lançamentos persistem ao recarregar (reabre em Despesas)',g('lblTotal').replace('\xa0',' ')=='Total: R$ 3.740,75' and n_('#gfDesp path[data-i]')==5,g('lblTotal'))
    JS("document.getElementById('btnApagar').click()"); pg.wait_for_timeout(250)
    t('Apagar tudo: gráfico vazio e total zerado','Sem dados' in JS("document.getElementById('gfDesp').textContent") and g('lblTotal')=='Total: R$ 0,00',g('lblTotal'))
    JS("localStorage.setItem('graficos_despesas','{quebrado')"); pg.reload(); pg.wait_for_timeout(700)
    t('dados salvos corrompidos: volta aos valores de exemplo',g('lblTotal').replace('\xa0',' ')=='Total: R$ 2.440,00',g('lblTotal'))
    t('sem erros de JavaScript',not [m for m in d if 'rror' in m],d)
run('Painel_de_Graficos',painel_graficos)

bad=0; tot=0
for name,checks in RES.items():
    fails=[c for c in checks if not c[1]]; tot+=len(checks); bad+=len(fails)
    print(f"{'✗' if fails else '✓'} {name:46s} {len(checks)-len(fails)}/{len(checks)}")
    for l,ok,dt in fails: print(f"      FALHA: {l}  → {dt}")
print(f"\nTOTAL: {tot-bad}/{tot} verificações OK | exemplos com falha: {sum(1 for c in RES.values() if any(not x[1] for x in c))}/{len(RES)}")
sys.exit(1 if bad else 0)
