exec(open('exemplo_08.py').read().split('def snippet')[0].split('from lib import *')[1].join(['from lib import *\n','']) if False else '')
from lib import *
import json,os
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'exemplo_08.py'),encoding='utf-8').read()
head=src.split('def item(')[0]
exec(head)
_comp=comp
def comp(b):
    if b['type']=='cameraStart': return f"FlowForgeCamera.start({q(b['target'])}).catch(()=>{{}});"
    if b['type']=='cameraStop': return f"FlowForgeCamera.stop({q(b['target'])});"
    return _comp(b)
def ev(name,blocks): return ({name:'\n'.join(map(comp,blocks))},{name:blocks})
def item(kind,name,text,x,y,w,h,event=None,blocks=None,**kw):
    d=it(kind,name,text,x,y,w,h,**kw)
    if event: d['events'],d['blocks']=ev(event,blocks)
    return d
def code(kind,name,text,x,y,w,h,event,js,**kw): return it(kind,name,text,x,y,w,h,{event:js},**kw)
S=lambda t,v:setv(t,'textContent',v)
HIDE_ON=lambda t:B('hide',t); SHOW=lambda t:B('show',t)
cam=item('camera','camera1','Câmera',24,92,400,250,'camerastart',[S('status','Câmera ligada ✔'),SHOW('ativo')],hideCameraButton=True,autoplay=False,facingMode='environment',muted=True,fit='cover')
cam['events']['camerastop']='\n'.join(map(comp,[S('status','Câmera desligada'),HIDE_ON('ativo')]))
cam['blocks']['camerastop']=[S('status','Câmera desligada'),HIDE_ON('ativo')]
cam['events']['cameraerror']="document.getElementById('status').textContent='⚠ '+event.detail.message;"
items=[
 it('label','ativo','● AO VIVO',330,58,94,24,color='#dc2626'),
 it('heading','titulo','Estúdio de Câmera',24,2,400,40),
 it('label','status','Câmera desligada',24,56,400,30,color='#475569'),
 cam,
 item('button','btnStart','▶ Ligar',24,352,120,42,'click',[S('status','Iniciando câmera…'),B('cameraStart','camera1')],bg=BTN,color='#ffffff'),
 item('button','btnStop','■ Desligar',154,352,120,42,'click',[B('cameraStop','camera1')],bg='#475569',color='#ffffff'),
 code('button','btnFlip','⇄ Trocar',284,352,140,42,'click',"window.facing=(window.facing||'environment')==='user'?'environment':'user';\ndocument.getElementById('status').textContent='Trocando para câmera '+(window.facing==='user'?'frontal':'traseira')+'…';\nFlowForgeCamera.start('camera1',{facingMode:window.facing}).catch(()=>{});",bg='#0f766e',color='#ffffff'),
 code('button','btnShot','📷 Tirar foto',24,404,200,42,'click',"try{\n document.getElementById('foto').src=FlowForgeCamera.capture('camera1','image/jpeg',0.9);\n window.fotos=(window.fotos||0)+1;\n document.getElementById('contador').textContent='Fotos tiradas: '+window.fotos;\n document.getElementById('status').textContent='Foto capturada ✔';\n}catch(e){document.getElementById('status').textContent='⚠ Ligue a câmera antes de tirar a foto';}",bg='#16a34a',color='#ffffff'),
 code('button','btnDev','Listar câmeras',234,404,190,42,'click',"FlowForgeCamera.devices().then(function(l){document.getElementById('status').textContent=l.length+' câmera(s) encontrada(s)'+(l.length&&l[0].label?': '+l.map(function(d){return d.label}).join(', '):'');});",bg='#e2e8f0',color='#0f172a'),
 it('label','contador','Fotos tiradas: 0',24,456,400,28,color='#475569'),
 it('picturebox','foto','',24,490,400,250,bg='#e2e8f0'),
 code('button','btnBaixar','⬇ Baixar foto',24,750,400,42,'click',"var f=document.getElementById('foto');\nif(!/^data:image/.test(f.src||'')){document.getElementById('status').textContent='Tire uma foto antes de baixar';}\nelse{var a=document.createElement('a');a.href=f.src;a.download='foto-flowforge.jpg';document.body.appendChild(a);a.click();a.remove();document.getElementById('status').textContent='Foto baixada ✔';}",bg=BTN,color='#ffffff'),
]
pg=('Principal',items,{"onload":"var a=document.getElementById('ativo');if(a&&a.closest('.ff-component'))a.closest('.ff-component').style.display='none';","onshow":""})
save('Estudio_de_Camera',proj('Estúdio de Câmera',[pg]))
