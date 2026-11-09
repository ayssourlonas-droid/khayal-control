from lib import *
# ---------- Quiz ----------
Q=[("Qual é o maior planeta do Sistema Solar?",["Marte","Júpiter","Saturno","Terra"],1),
("Quantos estados tem o Brasil (sem contar o Distrito Federal)?",["26","27","25","24"],0),
("Qual linguagem roda nativamente nos navegadores?",["Python","C#","JavaScript","Java"],2),
("Qual é o resultado de 7 × 8?",["54","56","58","64"],1),
("Quem pintou a Mona Lisa?",["Michelangelo","Van Gogh","Leonardo da Vinci","Picasso"],2),
("Qual elemento químico tem símbolo O?",["Ouro","Oxigênio","Ósmio","Prata"],1),
("Em que continente fica o Egito?",["Ásia","Europa","África","Oceania"],2),
("Qual é a capital da Argentina?",["Santiago","Montevidéu","Lima","Buenos Aires"],3)]
import json
P="var $=function(i){return document.getElementById(i)};var vis=function(i,on){var b=$(i),w=b.closest('.ff-component')||b;w.style.display=on?'':'none'};if(!window.ffQuiz){var G=window.ffQuiz={Q:%s,i:0,score:0,lock:false,order:[]};G.best=function(){try{return Number(localStorage.getItem('ffQuizBest')||0)}catch(e){return 0}};G.bar=function(p){var el=$('quizBar');el=el.classList.contains('ff-progress')?el:(el.querySelector('.ff-progress')||el);var i=el.querySelector('i');if(i)i.style.setProperty('width',p+'%%');el.setAttribute('aria-valuenow',p);var s=el.querySelector('span');if(s)s.textContent=Math.round(p)+'%%'};G.show=function(){var q=G.Q[G.order[G.i]];$('quizQuestion').textContent=(G.i+1)+'/'+G.Q.length+' — '+q.q;for(var k=0;k<4;k++){var b=$('quizOpt'+k);b.textContent=q.o[k];b.style.background='#ffffff';b.style.color='#222222';b.disabled=false}vis('quizNext',false);$('quizScore').textContent='Acertos: '+G.score;G.bar(G.i/G.Q.length*100);G.lock=false};G.start=function(){G.i=0;G.score=0;G.order=G.Q.map(function(_,k){return k}).sort(function(){return Math.random()-.5});vis('quizRestart',false);G.show()};G.pick=function(k){if(G.lock)return;G.lock=true;var q=G.Q[G.order[G.i]],ok=k===q.a;if(ok)G.score++;for(var j=0;j<4;j++){var b=$('quizOpt'+j);b.disabled=true;if(j===q.a){b.style.background='#16a34a';b.style.color='#ffffff'}else if(j===k){b.style.background='#dc2626';b.style.color='#ffffff'}}$('quizScore').textContent='Acertos: '+G.score+(ok?' — Correto!':' — Errou');G.bar((G.i+1)/G.Q.length*100);if(G.i+1<G.Q.length){vis('quizNext',true);}else{G.end()}};G.end=function(){var n=G.score,t=G.Q.length,b=G.best();if(n>b){try{localStorage.setItem('ffQuizBest',String(n))}catch(e){}b=n}$('quizQuestion').textContent='Fim do quiz! Você acertou '+n+' de '+t+(n===t?' — Perfeito!':n>=t*0.6?' — Muito bem!':' — Tente de novo!')+' (Recorde: '+b+')';vis('quizRestart',true);vis('quizNext',false)};G.next=function(){G.i++;G.show()};G.start()}" % json.dumps([{"q":q,"o":o,"a":a} for q,o,a in Q],ensure_ascii=False)
items=[
 it('heading','quizTitle','Quiz de Conhecimentos',24,16,420,48,bg='transparent'),
 it('progress','quizBar','',24,74,420,16,{},value=0),
 it('label','quizQuestion','Carregando...',24,100,420,84,bg='transparent'),
]
for k in range(4):
    items.append(it('button',f'quizOpt{k}','',24,196+k*56,420,48,{"click":P+f"window.ffQuiz.pick({k});"}))
items+=[
 it('label','quizScore','Acertos: 0',24,430,300,32,bg='transparent'),
 it('button','quizNext','Próxima →',284,424,160,44,{"click":P+"window.ffQuiz.next();"},bg=BTN,color='#ffffff'),
 it('button','quizRestart','Jogar de novo',24,480,200,44,{"click":P+"window.ffQuiz.start();"},bg=BTN,color='#ffffff'),
]
save('Quiz_de_Conhecimentos',proj('Quiz de Conhecimentos',[('Principal',items,{'onload':P})]))
# ---------- sons (componente Game Sound) ----------
from sons import pos_salvar
pos_salvar('Quiz_de_Conhecimentos', [
    ("if(ok)G.score++;", "if(ok)G.score++;Sons.play(ok?'coin':'error');"),
    ("G.end=function(){var n=G.score,t=G.Q.length,b=G.best();", "G.end=function(){var n=G.score,t=G.Q.length,b=G.best();setTimeout(function(){Sons.play(n===t?'win':n>=t*0.6?'powerup':'lose')},450);")])
