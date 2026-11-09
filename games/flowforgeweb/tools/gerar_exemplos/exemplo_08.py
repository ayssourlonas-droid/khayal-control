from lib import *
import json
q=lambda v:json.dumps(str(v if v is not None else ''),ensure_ascii=False)
def expr(v,s):
    if s:
        k=s['kind']
        if k=='component': return f"document.getElementById({q(s['target'])})?.{s.get('prop') or 'value'}"
        if k=='variable': return f"window[{q(s['name'])}]"
        if k=='number': return str(s['value'])
        if k=='math': return f"({expr(s.get('a'),s.get('as'))} {s.get('op','+')} {expr(s.get('b'),s.get('bs'))})"
        if k=='join': return f"String({expr(s.get('a'),s.get('as'))})+String({expr(s.get('b'),s.get('bs'))})"
        if k=='logic': return f"({expr(s.get('a'),s.get('as'))} {s.get('op','==')} {expr(s.get('b'),s.get('bs'))})"
    return q(v)
def comp(b):
    t=b['type']
    if t=='set': return f"document.getElementById({q(b['target'])}).{b.get('prop') or 'textContent'}={expr(b.get('value'),b.get('source'))};"
    if t=='show': return f"document.getElementById({q(b['target'])})?.closest('.ff-component')?.style.setProperty('display','');"
    if t=='hide': return f"document.getElementById({q(b['target'])})?.closest('.ff-component')?.style.setProperty('display','none');"
    if t=='alert': return f"alert({q(b.get('value') or 'Olá!')});"
    if t=='navigate': return f"FlowForgeNavigate({q(b.get('value'))});"
    if t=='inc': return f"window[{q(b.get('target') or 'contador')}]=(Number(window[{q(b.get('target') or 'contador')}])||0)+{int(b.get('value') or 1)};"
    if t=='repeat': return f"for(let ff_i=0;ff_i<{max(0,int(b.get('value') or 1))};ff_i++){{\n"+'\n'.join(map(comp,b.get('body',[])))+"\n}"
    if t=='if':
        e=f"if({b.get('left') or 'true'} {b.get('op') or '=='} {expr(b.get('right'),b.get('source'))}){{\n"+'\n'.join(map(comp,b.get('body',[])))+"\n}"
        if b.get('elseBody'): e+="else{\n"+'\n'.join(map(comp,b['elseBody']))+"\n}"
        return e
    raise Exception(t)
def B(type,target='',prop='textContent',value='',**kw):
    d={'type':type,'target':target,'prop':prop,'value':value,'left':'true','op':'==','right':'','body':[],'elseBody':[]}; d.update(kw); return d
def setv(target,prop,value='',source=None): 
    b=B('set',target,prop,value); 
    if source: b['source']=source
    return b
comp_v=lambda t,p='value':{'kind':'component','target':t,'prop':p}
def blk(items_by_ev): return items_by_ev
def ev(name,blocks): return ({name:'\n'.join(map(comp,blocks))},{name:blocks})
def item(kind,name,text,x,y,w,h,event=None,blocks=None,**kw):
    d=it(kind,name,text,x,y,w,h,**kw)
    if event: d['events'],d['blocks']=ev(event,blocks)
    return d
# --- tail comum depois de uma alteração
def tail(msg):
    return [B('inc','acoes',value='1'),
            setv('acoesLabel','textContent',source={'kind':'join','a':'Ações no texto: ','b':'','bs':{'kind':'variable','name':'acoes'}}),
            B('if',left='window.acoes',op='>',source={'kind':'number','value':9},
              body=[setv('status','textContent','Muitas alterações — use Desfazer ou revise o texto')],
              elseBody=[setv('status','textContent',msg)])]
def backup(): return setv('rascunho','value',source=comp_v('texto'))
def append(txt): return setv('texto','value',source={'kind':'join','a':'','as':comp_v('texto'),'b':txt,'bs':None})
def snippet(name,label,x,y,w,txt,msg): return item('button',name,label,x,y,w,40,'click',[backup(),append(txt)]+tail(msg))
items=[
 it('heading','titulo','Editor de Texto em Blocos',24,12,420,44,bg='transparent'),
 it('textarea','texto','',24,62,420,230),
 snippet('btnItem','• Item',24,302,100,'\n• ','Item de lista inserido'),
 snippet('btnTarefa','☐ Tarefa',134,302,100,'\n☐ ','Tarefa inserida'),
 snippet('btnTitulo','# Título',244,302,100,'\n# ','Título inserido'),
 snippet('btnAssina','— Assinatura',354,302,90,'\n\n— Escrito com FlowForge','Assinatura inserida'),
 item('button','btnSep','Separador ─',24,350,140,40,'click',[backup(),B('repeat',value='20',body=[append('─')] ) ]+tail('Separador inserido')),
 snippet('btnLinha','Nova linha ↵',174,350,130,'\n','Nova linha'),
 snippet('btnPar','Parágrafo ¶',314,350,130,'\n\n','Parágrafo inserido'),
 item('button','btnDesfazer','↶ Desfazer',24,402,130,40,'click',[setv('texto','value',source=comp_v('rascunho')),setv('status','textContent','Última alteração desfeita')],bg=BTN,color='#ffffff'),
 item('button','btnLimpar','Limpar tudo',164,402,130,40,'click',[backup(),setv('texto','value',''),B('inc','acoes',value='1'),setv('acoesLabel','textContent',source={'kind':'join','a':'Ações no texto: ','b':'','bs':{'kind':'variable','name':'acoes'}}),setv('status','textContent','Texto limpo (Desfazer restaura)')]),
 item('button','btnTrava','🔒 Travar / liberar',304,402,140,40,'click',[B('if',left="document.getElementById('texto').disabled",op='==',source={'kind':'logic','a':'1','op':'==','b':'1'},
        body=[setv('texto','disabled',source={'kind':'logic','a':'1','op':'!=','b':'1'}),setv('status','textContent','Edição liberada')],
        elseBody=[setv('texto','disabled',source={'kind':'logic','a':'1','op':'==','b':'1'}),setv('status','textContent','Texto travado para leitura')])]),
 it('label','status','Pronto para escrever',24,452,420,26,bg='transparent',color='#2563eb'),
 it('label','acoesLabel','Ações no texto: 0',24,478,300,26,bg='transparent',color='#6b7280'),
 item('button','btnSobre','Sobre',344,470,100,38,'click',[B('navigate',value='Sobre')]),
 it('label','rascunhoTitulo','Cópia de segurança (usada pelo Desfazer):',24,516,420,24,bg='transparent',color='#6b7280'),
 it('textarea','rascunho','',24,542,420,90),
]
sobre=[
 it('heading','sobreTitulo','Sobre este exemplo',24,12,420,44,bg='transparent'),
 it('label','sobreTexto','Este editor foi criado só com a programação por blocos: nenhum código foi digitado. Os botões usam blocos de definir propriedade, juntar texto, somar variável, repetir, se/senão e ir para página.',24,64,420,110,bg='transparent'),
 item('button','btnVoltar','← Voltar ao editor',24,190,200,44,'click',[B('navigate',value='Editor')],bg=BTN,color='#ffffff'),
]
for i in sobre:
    if i['name']=='sobreTexto': i['multiline']=True
save('Editor_de_Texto_Blocos',proj('Editor de Texto em Blocos',[('Editor',items),('Sobre',sobre)]))
