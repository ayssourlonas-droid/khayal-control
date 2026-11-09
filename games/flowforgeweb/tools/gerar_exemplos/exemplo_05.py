from lib import *
# ---------- Pomodoro ----------
P="""var $=function(i){return document.getElementById(i)};if(!window.ffPomo){var M=window.ffPomo={modes:{'Foco':25,'Pausa':5,'Pausa longa':15},mode:'Foco',left:25*60,total:25*60,timer:null,done:0};M.fmt=function(s){var m=Math.floor(s/60),x=s%60;return(m<10?'0':'')+m+':'+(x<10?'0':'')+x};M.bar=function(p){var el=$('pomoBar');el=el.classList.contains('ff-progress')?el:(el.querySelector('.ff-progress')||el);var i=el.querySelector('i');if(i)i.style.setProperty('width',p+'%');el.setAttribute('aria-valuenow',p);var s=el.querySelector('span');if(s)s.textContent=Math.round(p)+'%'};M.draw=function(){var tm=$('pomoTime');tm.textContent=M.fmt(M.left);tm.style.cssText+=';font-size:72px;font-weight:700;line-height:1;text-align:center';$('pomoMode').textContent=M.mode+(M.timer?' — em andamento':' — pausado');$('pomoSessions').textContent='Sessões de foco concluídas: '+M.done;$('pomoStart').textContent=M.timer?'Pausar':(M.left<M.total?'Continuar':'Iniciar');M.bar((M.total-M.left)/M.total*100);document.title=M.fmt(M.left)+' · '+M.mode};M.stop=function(){clearInterval(M.timer);M.timer=null};M.set=function(m){M.stop();M.mode=m;M.total=M.left=M.modes[m]*60;M.draw()};M.tick=function(){M.left--;if(M.left<=0){M.left=0;M.stop();if(M.mode==='Foco')M.done++;M.draw();$('pomoMode').textContent=M.mode+' — concluído!';try{if(navigator.vibrate)navigator.vibrate(200)}catch(e){}return}M.draw()};M.toggle=function(){if(M.timer){M.stop();M.draw();return}if(M.left<=0)M.left=M.total;M.timer=setInterval(M.tick,1000);M.draw()};M.reset=function(){M.stop();M.left=M.total;M.draw()};M.draw()}"""
items=[
 it('heading','pomoTitle','Pomodoro',24,16,420,48,bg='transparent'),
 it('button','pomoFocus','Foco 25',24,76,134,40,{"click":P+"window.ffPomo.set('Foco');"},bg=BTN,color='#ffffff'),
 it('button','pomoShort','Pausa 5',166,76,134,40,{"click":P+"window.ffPomo.set('Pausa');"}),
 it('button','pomoLong','Pausa 15',308,76,134,40,{"click":P+"window.ffPomo.set('Pausa longa');"}),
 it('label','pomoTime','25:00',24,136,420,110,bg='transparent'),
 it('label','pomoMode','Foco — pausado',24,250,420,32,bg='transparent'),
 it('progress','pomoBar','',24,292,420,16,{},value=0),
 it('button','pomoStart','Iniciar',24,328,200,52,{"click":P+"window.ffPomo.toggle();"},bg=BTN,color='#ffffff'),
 it('button','pomoReset','Reiniciar',244,328,200,52,{"click":P+"window.ffPomo.reset();"}),
 it('label','pomoSessions','Sessões de foco concluídas: 0',24,396,420,32,bg='transparent'),
]
save('Pomodoro',proj('Pomodoro',[('Principal',items,{'onload':P})]))
