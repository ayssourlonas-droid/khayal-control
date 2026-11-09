from lib import *
import json
# ---------- Jogo da Forca ----------
W={"Frutas":["MORANGO","ABACAXI","LARANJA","MELANCIA","BANANA"],"Animais":["ELEFANTE","GIRAFA","TARTARUGA","GOLFINHO","CAVALO"],"Tecnologia":["TECLADO","NAVEGADOR","PROGRAMA","INTERNET","SERVIDOR"]}
P="""var $=function(i){return document.getElementById(i)};if(!window.ffForca){var F=window.ffForca={W:%s,word:'',cat:'',hit:{},miss:0,over:true,max:6,art:['😀','😐','😟','😨','😰','😱','💀']};F.draw=function(){$('forcaFace').style.fontSize='48px';$('forcaWord').style.cssText+=';font-size:30px;font-weight:700;letter-spacing:2px';var w=F.word.split('').map(function(c){return F.hit[c]||F.over&&F.miss>=F.max?c:'_'}).join(' ');$('forcaWord').textContent=w||'Clique em Novo jogo';$('forcaInfo').textContent=F.word?('Dica: '+F.cat+' · Erros: '+F.miss+'/'+F.max):'';$('forcaFace').textContent=F.art[F.miss];'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function(l){var b=$('forca'+l);if(b){b.disabled=F.over||!!F.hit[l]||!!F.tried[l];b.style.background=F.hit[l]?'#bbf7d0':F.tried[l]?'#fecaca':'#ffffff'}})};F.tried={};F.start=function(){var cats=Object.keys(F.W);F.cat=cats[Math.floor(Math.random()*cats.length)];var l=F.W[F.cat];F.word=l[Math.floor(Math.random()*l.length)];F.hit={};F.tried={};F.miss=0;F.over=false;$('forcaStatus').textContent='Escolha uma letra';F.draw()};F.guess=function(l){if(F.over||F.tried[l])return;F.tried[l]=true;if(F.word.indexOf(l)>=0){F.hit[l]=true;if(F.word.split('').every(function(c){return F.hit[c]})){F.over=true;$('forcaStatus').textContent='Você venceu! 🎉'}else $('forcaStatus').textContent='Boa!'}else{F.miss++;if(F.miss>=F.max){F.over=true;$('forcaStatus').textContent='Fim de jogo! A palavra era '+F.word}else $('forcaStatus').textContent='Letra errada'}F.draw()};F.draw()}""" % json.dumps(W,ensure_ascii=False)
items=[
 it('heading','forcaTitle','Jogo da Forca',24,12,420,44,bg='transparent'),
 it('label','forcaFace','😀',24,60,100,70,bg='transparent'),
 it('label','forcaWord','Clique em Novo jogo',130,64,330,60,bg='transparent'),
 it('label','forcaInfo','',24,136,420,28,bg='transparent'),
 it('label','forcaStatus','Clique em Novo jogo para começar',24,166,420,28,bg='transparent'),
]
L="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
for n,l in enumerate(L):
    r,c=divmod(n,7)
    items.append(it('button',f'forca{l}',l,24+c*62,206+r*50,56,44,{"click":P+f"window.ffForca.guess('{l}');"}))
items.append(it('button','forcaNew','Novo jogo',24,206+4*50+6,200,48,{"click":P+"window.ffForca.start();"},bg=BTN,color='#ffffff'))
save('Jogo_da_Forca',proj('Jogo da Forca',[('Principal',items,{'onload':P})]))
# ---------- sons (componente Game Sound) ----------
from sons import pos_salvar
S = lambda n: "Sons.play('%s');" % n
pos_salvar('Jogo_da_Forca', [
    ("return F.hit[c]})){F.over=true;", "return F.hit[c]})){F.over=true;" + S('win')),
    ("else $('forcaStatus').textContent='Boa!'", "else{" + S('pop') + "$('forcaStatus').textContent='Boa!'}"),
    ("if(F.miss>=F.max){F.over=true;", "if(F.miss>=F.max){F.over=true;" + S('lose')),
    ("else $('forcaStatus').textContent='Letra errada'", "else{" + S('error') + "$('forcaStatus').textContent='Letra errada'}"),
    ("F.over=false;$('forcaStatus').textContent='Escolha uma letra'", "F.over=false;" + S('start') + "$('forcaStatus').textContent='Escolha uma letra'")])
