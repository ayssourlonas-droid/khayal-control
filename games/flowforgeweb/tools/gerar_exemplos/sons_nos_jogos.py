"""Põe sons (componente Game Sound + botão 🔊/🔇) nos 9 jogos clássicos de examples/, que não têm gerador próprio.
Edita os .flowmobile no lugar e é seguro rodar de novo (pula os que já têm o componente Sons).
Uso: python tools/gerar_exemplos/sons_nos_jogos.py"""
import json, os
from sons import aplicar
raiz = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'examples')
P = lambda n: "Sons.play('%s');" % n
JOGOS = {
 'Snake': [
  ("if(window.ffSnake){let d=", "if(window.ffSnake){" + P('tick') + "let d="),
  ("clearInterval(window.ffSnakeTimer);window.ffSnake={", P('start') + "clearInterval(window.ffSnakeTimer);window.ffSnake={"),
  ("q.score++;do{", "q.score++;" + P('coin') + "do{"),
  ("clearInterval(window.ffSnakeTimer);st.textContent='Fim de jogo", "clearInterval(window.ffSnakeTimer);" + P('lose') + "st.textContent='Fim de jogo")],
 'Pong_IA': [
  ("if(window.ffPong)window.ffPong.p=", "if(window.ffPong)" + P('tick') + "if(window.ffPong)window.ffPong.p="),
  ("clearInterval(window.ffPongTimer);window.ffPong={", P('start') + "clearInterval(window.ffPongTimer);window.ffPong={"),
  ("if(ny<=0||ny>=10){q.dy*=-1;", "if(ny<=0||ny>=10){q.dy*=-1;" + P('blip')),
  ("q.dx=1;q.score++;nx=1}else{return end()}}", "q.dx=1;q.score++;nx=1;" + P('pop') + "}else{" + P('lose') + "return end()}}"),
  ("q.dx=-1;q.score++;nx=16}else{return end()}}", "q.dx=-1;q.score++;nx=16;" + P('blip') + "}else{" + P('win') + "return end()}}")],
 'Breakout': [
  ("if(window.ffBreak)window.ffBreak.p=", "if(window.ffBreak)" + P('tick') + "if(window.ffBreak)window.ffBreak.p="),
  ("clearInterval(window.ffBreakTimer);window.ffBreak={", P('start') + "clearInterval(window.ffBreakTimer);window.ffBreak={"),
  ("if(nx<0||nx>15){q.dx*=-1;", "if(nx<0||nx>15){q.dx*=-1;" + P('blip')),
  ("if(ny<0){q.dy=1;", "if(ny<0){q.dy=1;" + P('blip')),
  ("q.dy=-1;ny=10}else{clearInterval(window.ffBreakTimer);", "q.dy=-1;ny=10;" + P('click') + "}else{clearInterval(window.ffBreakTimer);" + P('lose')),
  ("q.bricks=q.bricks.filter(i=>i!==bi);q.score++;", "q.bricks=q.bricks.filter(i=>i!==bi);q.score++;" + P('pop')),
  ("st.textContent='Você venceu!';draw()", P('win') + "st.textContent='Você venceu!';draw()")],
 'Genius_Simon': [
  ("window.ffSimonFlash=function(n){const b=", "window.ffSimonFlash=function(n){Sons.tone([415,310,252,209][n],260,'sine',0.55);const b="),
  ("g.accept=false;document.getElementById('simonStatus').textContent='Errou!", "g.accept=false;" + P('lose') + "document.getElementById('simonStatus').textContent='Errou!"),
  ("document.getElementById('simonStatus').textContent='Certo!';", P('coin') + "document.getElementById('simonStatus').textContent='Certo!';")],
 'Jogo_da_Memoria': [
  ("b.textContent=b.dataset.v;if(!g.first)", "b.textContent=b.dataset.v;" + P('pop') + "if(!g.first)"),
  ("g.pairs++;document.getElementById('memStatus')", "g.pairs++;Sons.play(g.pairs===4?'win':'coin');document.getElementById('memStatus')"),
  ("g.lock=true;let a=g.first;", "g.lock=true;" + P('error') + "let a=g.first;"),],
 'Adivinhe_o_Numero': [
  ("document.getElementById('guessStatus').textContent='Digite um número entre 1 e 100';return}", P('error') + "document.getElementById('guessStatus').textContent='Digite um número entre 1 e 100';return}"),
  ("window.ffTries++;", "window.ffTries++;Sons.play(n===window.ffSecret?'win':n<window.ffSecret?'blip':'tick');")],
 'Teste_de_Reflexo': [
  ("s.textContent='Seu tempo: '+ms+' ms';", P('coin') + "s.textContent='Seu tempo: '+ms+' ms';"),
  ("s.textContent='Queimou! Comece novamente.';", P('error') + "s.textContent='Queimou! Comece novamente.';"),
  ("b.style.background='#22c55e';s.textContent='Agora!'", "b.style.background='#22c55e';Sons.tone(880,140,'square',0.45);s.textContent='Agora!'")],
 'Pedra_Papel_Tesoura_IA': [
  ("document.getElementById('rpsStatus').textContent='Você: '", "Sons.play(r==='Empate'?'blip':r==='Você venceu!'?'win':'lose');document.getElementById('rpsStatus').textContent='Você: '")],
 'Jogo_da_Velha_IA': [
  ("if(l){paint(b,l);status.textContent=(b[l[0]]==='X'?'Você venceu!':'A IA venceu!');return true}", "if(l){paint(b,l);Sons.play(b[l[0]]==='X'?'win':'lose');status.textContent=(b[l[0]]==='X'?'Você venceu!':'A IA venceu!');return true}"),
  ("if(b.every(Boolean)){paint(b);status.textContent='Empate!';return true}", "if(b.every(Boolean)){paint(b);Sons.play('blip');status.textContent='Empate!';return true}"),
  ("board[pos]='X';paint(board);", "board[pos]='X';Sons.play('pop');paint(board);"),
  ("if(choice>=0)board[choice]='O';paint(board);", "if(choice>=0){board[choice]='O';Sons.play('click')}paint(board);")],
}
for nome, hooks in JOGOS.items():
    f = os.path.join(raiz, nome + '.flowmobile'); p = json.load(open(f, encoding='utf-8'))
    ok = aplicar(p, hooks)
    if ok: json.dump(p, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(('com sons: ' if ok else 'já tinha:  ') + nome)
