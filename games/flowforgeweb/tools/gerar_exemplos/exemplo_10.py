from lib import *
import json
D="var $=function(i){return document.getElementById(i)};"

# ================= 1. Cronômetro com voltas =================
P1=D+"""if(!window.ffSw){var W=window.ffSw={t0:0,acc:0,run:false,h:null,laps:[]};W.now=function(){return W.acc+(W.run?performance.now()-W.t0:0)};
W.fmt=function(ms){var c=Math.floor(ms/10)%100,s=Math.floor(ms/1000)%60,m=Math.floor(ms/60000);return(m<10?'0':'')+m+':'+(s<10?'0':'')+s+'.'+(c<10?'0':'')+c};
W.draw=function(){var e=$('swTime');e.textContent=W.fmt(W.now());e.style.cssText+=';font-size:58px;font-weight:700;text-align:center;font-variant-numeric:tabular-nums';$('swStart').textContent=W.run?'Pausar':(W.acc>0?'Continuar':'Iniciar');$('swLap').disabled=!W.run;$('swReset').disabled=W.run||W.acc===0;
 var best=Infinity,worst=-1,bi=-1,wi=-1;W.laps.forEach(function(l,i){if(l<best){best=l;bi=i}if(l>worst){worst=l;wi=i}});
 var lines=W.laps.map(function(l,i){var tag=W.laps.length>2?(i===bi?'  ▲ melhor':(i===wi?'  ▼ pior':'')):'';return 'Volta '+(i+1)+'   '+W.fmt(l)+tag}).reverse();
 $('swLaps').value=lines.join('\\n');$('swInfo').textContent=W.laps.length?('Voltas: '+W.laps.length+' • melhor '+W.fmt(best)+' • média '+W.fmt(W.laps.reduce(function(a,b){return a+b},0)/W.laps.length)):'Toque em Iniciar e depois em Volta.'};
W.toggle=function(){if(W.run){W.acc=W.now();W.run=false;clearInterval(W.h);W.h=null}else{W.t0=performance.now();W.run=true;W.h=setInterval(W.draw,30)}W.draw()};
W.lap=function(){if(!W.run)return;var total=W.now(),prev=W.laps.reduce(function(a,b){return a+b},0);W.laps.push(total-prev);W.draw()};
W.reset=function(){W.run=false;clearInterval(W.h);W.h=null;W.acc=0;W.laps=[];W.draw()};W.draw()}"""
items=[
 it('heading','swTitle','Cronômetro',24,16,420,44,bg='transparent'),
 it('label','swTime','00:00.00',24,70,420,90,bg='transparent'),
 it('button','swStart','Iniciar',24,176,200,52,{"click":P1+"window.ffSw.toggle();"},bg=BTN,color='#ffffff'),
 it('button','swLap','Volta',244,176,200,52,{"click":P1+"window.ffSw.lap();"}),
 it('button','swReset','Zerar',24,240,420,40,{"click":P1+"window.ffSw.reset();"}),
 it('label','swInfo','Toque em Iniciar e depois em Volta.',24,296,420,30,bg='transparent',color='#475569'),
 it('textarea','swLaps','',24,332,420,230,{}),
]
items[-1]['readOnly']=True
save('Cronometro_Voltas',proj('Cronômetro com Voltas',[('Principal',items,{'onload':P1})]))

# ================= 2. Controle de Gastos =================
P2=D+"""if(!window.ffGastos){var G=window.ffGastos={items:[],K:'ffGastosV1'};try{G.items=JSON.parse(localStorage.getItem(G.K)||'[]')}catch(e){G.items=[]}
G.brl=function(v){return 'R$ '+v.toFixed(2).replace('.',',').replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.')};
G.save=function(){try{localStorage.setItem(G.K,JSON.stringify(G.items))}catch(e){}};
G.draw=function(){var tot=0,cat={};G.items.forEach(function(x){tot+=x.v;cat[x.c]=(cat[x.c]||0)+x.v});
 $('gTotal').textContent='Total: '+G.brl(tot);
 var keys=Object.keys(cat).sort(function(a,b){return cat[b]-cat[a]});
 $('gCats').textContent=keys.length?keys.map(function(k){return k+' '+Math.round(cat[k]/tot*100)+'%'}).join(' • '):'Nenhum gasto ainda.';
 $('gList').value=G.items.slice().reverse().map(function(x){return x.d+'  —  '+G.brl(x.v)+'  ('+x.c+')'}).join('\\n');
 $('gCount').textContent=G.items.length+(G.items.length===1?' lançamento':' lançamentos')};
G.msg=function(t,bad){var m=$('gMsg');m.textContent=t;m.style.color=bad?'#dc2626':'#16a34a'};
G.add=function(){var d=$('gDesc').value.trim(),raw=String($('gValor').value).replace(',','.'),v=parseFloat(raw);
 if(!d){G.msg('Descreva o gasto.',true);return}if(isNaN(v)||v<=0){G.msg('Informe um valor maior que zero.',true);return}
 G.items.push({d:d,v:Math.round(v*100)/100,c:$('gCat').value});G.save();$('gDesc').value='';$('gValor').value='';G.msg('Gasto adicionado ✔');G.draw();$('gDesc').focus()};
G.undo=function(){if(!G.items.length){G.msg('Nada para desfazer.',true);return}var x=G.items.pop();G.save();G.msg('Removido: '+x.d);G.draw()};
G.clear=function(){if(!G.items.length)return;if(confirm('Apagar todos os lançamentos?')){G.items=[];G.save();G.msg('Lista limpa.');G.draw()}};G.draw()}"""
items=[
 it('heading','gTitle','Controle de Gastos',24,12,420,44,bg='transparent'),
 it('input','gDesc','Descrição (ex.: almoço)',24,64,420,42,{"keydown":P2+"if(event.key==='Enter')window.ffGastos.add();"}),
 it('input','gValor','Valor (R$)',24,114,200,42,{"keydown":P2+"if(event.key==='Enter')window.ffGastos.add();"}),
 it('select','gCat','Categoria',236,114,208,42,{},items=['Alimentação','Transporte','Moradia','Lazer','Saúde','Outros']),
 it('button','gAdd','Adicionar gasto',24,166,420,46,{"click":P2+"window.ffGastos.add();"},bg=BTN,color='#ffffff'),
 it('label','gMsg','',24,218,420,28,bg='transparent'),
 it('label','gTotal','Total: R$ 0,00',24,250,420,40,bg='transparent'),
 it('label','gCats','Nenhum gasto ainda.',24,292,420,44,bg='transparent',color='#475569'),
 it('textarea','gList','',24,342,420,190,{}),
 it('label','gCount','0 lançamentos',24,540,200,30,bg='transparent',color='#475569'),
 it('button','gUndo','Desfazer último',24,574,200,42,{"click":P2+"window.ffGastos.undo();"}),
 it('button','gClear','Limpar tudo',244,574,200,42,{"click":P2+"window.ffGastos.clear();"},bg='#dc2626',color='#ffffff'),
]
items[8]['readOnly']=True
save('Controle_de_Gastos',proj('Controle de Gastos',[('Principal',items,{'onload':P2})]))

# ================= 3. Foto de Perfil (câmera + 2 páginas) =================
P3=D+"""if(!window.ffPerfil){var F=window.ffPerfil={K:'ffPerfilV1',foto:'',nome:''};try{var s=JSON.parse(localStorage.getItem(F.K)||'{}');F.foto=s.foto||'';F.nome=s.nome||''}catch(e){}
F.msg=function(t,bad){var m=$('pfMsg');if(m){m.textContent=t;m.style.color=bad?'#dc2626':'#16a34a'}};
F.card=function(){var i=$('cardFoto'),n=$('cardNome'),v=$('cardVazio');if(!i)return;i.style.display=F.foto?'':'none';if(F.foto)i.src=F.foto;n.textContent=F.nome||'Seu nome';v.style.display=F.foto?'none':''};
F.save=function(){try{localStorage.setItem(F.K,JSON.stringify({foto:F.foto,nome:F.nome}))}catch(e){F.msg('Não foi possível salvar neste navegador.',true);return false}return true};
F.shot=function(){try{var c=FlowForgeCamera.capture('pfCam','image/jpeg',0.85);
 var im=new Image();im.onload=function(){var S=240,cv=document.createElement('canvas');cv.width=cv.height=S;var x=cv.getContext('2d'),m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,S,S);F.tmp=cv.toDataURL('image/jpeg',0.85);$('pfPreview').src=F.tmp;F.msg('Foto capturada. Toque em Salvar perfil.')};im.src=c}catch(e){F.msg('Ligue a câmera antes de tirar a foto.',true)}};
F.persist=function(){var n=$('pfNome').value.trim();if(!n){F.msg('Digite seu nome.',true);return false}if(!F.tmp&&!F.foto){F.msg('Tire uma foto primeiro.',true);return false}F.nome=n;if(F.tmp)F.foto=F.tmp;if(F.save()){F.msg('Perfil salvo ✔');return true}return false};
F.card();var nm=$('pfNome');if(nm&&F.nome&&!nm.value)nm.value=F.nome}"""
cam=item=None
cam=it('camera','pfCam','Câmera',24,64,420,250,{"camerastart":P3+"window.ffPerfil.msg('Câmera ligada ✔');","cameraerror":P3+"window.ffPerfil.msg('⚠ '+event.detail.message,true);"},hideCameraButton=True,autoplay=False,facingMode='user',muted=True,fit='cover')
items=[
 it('heading','pfTitle','Foto de Perfil',24,12,420,44,bg='transparent'),
 cam,
 it('button','pfOn','▶ Ligar câmera',24,324,200,44,{"click":P3+"FlowForgeCamera.start('pfCam',{facingMode:'user'}).catch(function(){});"},bg=BTN,color='#ffffff'),
 it('button','pfShot','📷 Tirar foto',244,324,200,44,{"click":P3+"window.ffPerfil.shot();"},bg='#16a34a',color='#ffffff'),
 it('picturebox','pfPreview','',24,380,120,120,bg='#e2e8f0'),
 it('input','pfNome','Seu nome',156,380,288,44,{}),
 it('button','pfSave','Salvar perfil',156,434,288,44,{"click":P3+"if(window.ffPerfil.persist()){FlowForgeCamera.stop('pfCam');window.ffPerfil.card();FlowForgeNavigate('Cartão');}"},bg=BTN,color='#ffffff'),
 it('label','pfMsg','Ligue a câmera e tire sua foto.',24,510,420,30,bg='transparent',color='#475569'),
]
items[4]['alt']='Pré-visualização'
cartao=[
 it('heading','cardTitle','Seu Cartão',24,12,420,44,bg='transparent'),
 it('picturebox','cardFoto','',114,70,240,240,bg='#e2e8f0'),
 it('label','cardVazio','Nenhuma foto salva ainda.',24,170,420,40,bg='transparent',color='#64748b'),
 it('heading','cardNome','Seu nome',24,324,420,44,bg='transparent'),
 it('button','cardRefazer','↻ Refazer foto',24,390,200,44,{"click":P3+"FlowForgeNavigate('Perfil');"},bg=BTN,color='#ffffff'),
 it('button','cardApagar','Apagar perfil',244,390,200,44,{"click":P3+"if(confirm('Apagar foto e nome salvos?')){window.ffPerfil.foto='';window.ffPerfil.nome='';window.ffPerfil.tmp='';window.ffPerfil.save();window.ffPerfil.card();}"},bg='#dc2626',color='#ffffff'),
]
save('Foto_de_Perfil',proj('Foto de Perfil',[('Perfil',items,{'onload':P3,'onshow':"if(window.ffPerfil){window.ffPerfil.card()}"}),('Cartão',cartao,{'onload':P3,'onshow':P3})]))

# ================= 4. Demonstração do depurador =================
P4=D+"""if(!window.ffDemo){window.ffDemo={n:0};}"""
items=[
 it('heading','dbTitle','Laboratório do Depurador',24,12,420,44,bg='transparent'),
 it('label','dbHelp','Abra o app pelo botão Debug do IDE e use os botões abaixo. Veja o resultado nas abas Console, Erros, Eventos, Variáveis e Rede.',24,60,420,64,bg='transparent',color='#475569'),
 it('button','dbLog','console.log',24,136,200,42,{"click":P4+"window.ffDemo.n++;console.log('Clique número',window.ffDemo.n,{ok:true,lista:[1,2,3]});$('dbOut').textContent='Registrado no Console (variável ffDemo.n = '+window.ffDemo.n+')';"},bg=BTN,color='#ffffff'),
 it('button','dbWarn','console.warn',244,136,200,42,{"click":P4+"console.warn('Atenção: isto é um aviso');$('dbOut').textContent='Aviso enviado ao Console';"}),
 it('button','dbErr','Gerar erro',24,188,200,42,{"click":P4+"$('dbOut').textContent='Vai falhar…';funcaoQueNaoExiste();"},bg='#dc2626',color='#ffffff'),
 it('button','dbPromise','Promise rejeitada',244,188,200,42,{"click":P4+"Promise.reject(new Error('Falha assíncrona de exemplo'));$('dbOut').textContent='Promise rejeitada enviada';"}),
 it('button','dbNet','Requisição (fetch)',24,240,200,42,{"click":P4+"$('dbOut').textContent='Buscando…';fetch('dados-que-nao-existem.json').then(function(r){$('dbOut').textContent='Status '+r.status}).catch(function(e){$('dbOut').textContent='Falhou: '+e.message});"}),
 it('button','dbVar','Criar variáveis',244,240,200,42,{"click":P4+"window.usuario={nome:'Ana',nivel:3};window.pontos=(window.pontos||0)+10;window.ativo=true;$('dbOut').textContent='Veja a aba Variáveis (pontos = '+window.pontos+')';"}),
 it('input','dbInput','Digite algo (gera eventos input/change)',24,294,420,42,{"input":P4+"window.ultimoTexto=event.target.value;"}),
 it('label','dbOut','Aguardando…',24,348,420,60,bg='#f1f5f9',color='#0f172a'),
 it('label','dbTip','Dica: na aba Console digite uma expressão, por exemplo  pontos * 2  ou  ffDemo.n  e tecle Enter.',24,420,420,64,bg='transparent',color='#475569'),
]
save('Laboratorio_do_Depurador',proj('Laboratório do Depurador',[('Principal',items,{'onload':P4+"console.info('App carregado');console.warn('Exemplo: aviso no onload');","onshow":""})]))
