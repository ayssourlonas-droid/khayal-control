"""Código do Jogo da Memória do tutorial, dividido em blocos explicáveis.
Usado por exemplo_17.py (gera o .flowmobile) e por tools/gravar_tutorial.py (digita o código no vídeo)."""

# (título curto do bloco, código). O código inteiro vai no evento click() do botão "Novo jogo".
BLOCOS = [
("Configuração: níveis e figuras", """// 1) Configuração: níveis e figuras do jogo
const NIVEIS = { 'Fácil': [4, 3], 'Médio': [4, 4], 'Difícil': [6, 4] };
const FIGURAS = ['🍎','🍌','🍒','🍇','🍉','🍓','🥝','🍍','🍋','🥥','🍑','🥕'];
const [colunas, linhas] = NIVEIS[selNivel.value] || NIVEIS['Médio'];
"""),
("Sorteio das cartas", """// 2) Sorteio: cada figura aparece duas vezes, embaralhadas
const pares = FIGURAS.slice(0, (colunas * linhas) / 2);
const cartas = [...pares, ...pares].sort(() => Math.random() - 0.5);
"""),
("Estado do jogo e placar", """// 3) Estado do jogo (e zera o relógio da partida anterior)
clearInterval(window.relogio);
let primeira = null, trava = false, achados = 0, jogadas = 0, inicio = 0;
lblJogadas.textContent = 'Jogadas: 0';
lblTempo.textContent = 'Tempo: 0s';
lblMsg.textContent = 'Encontre todos os pares!';
const chave = 'memoria_' + selNivel.value;
const melhor = localStorage.getItem(chave);
lblRecorde.textContent = 'Recorde: ' + (melhor ? melhor : '-');
"""),
("Montando o tabuleiro", """// 4) Tabuleiro: uma grade com um botão para cada carta
tabuleiro.innerHTML = '';
tabuleiro.style.display = 'grid';
tabuleiro.style.gridTemplateColumns = 'repeat(' + colunas + ', 1fr)';
tabuleiro.style.gridTemplateRows = 'repeat(' + linhas + ', 1fr)';
tabuleiro.style.gap = '8px';
cartas.forEach(figura => {
  const carta = document.createElement('button');
  carta.textContent = '?';
  carta.dataset.figura = figura;
  carta.style.fontSize = '26px';
  carta.onclick = () => virar(carta);
  tabuleiro.appendChild(carta);
});
"""),
("Virar uma carta", """// 5) Virar uma carta: compara a primeira com a segunda
function virar(carta) {
  if (trava || carta.disabled || carta === primeira) return;
  if (!inicio) {
    inicio = Date.now();
    window.relogio = setInterval(() => {
      lblTempo.textContent = 'Tempo: ' + Math.floor((Date.now() - inicio) / 1000) + 's';
    }, 500);
  }
  carta.textContent = carta.dataset.figura;
  carta.style.background = '#fef3c7';
  if (!primeira) { primeira = carta; return; }
  jogadas++;
  lblJogadas.textContent = 'Jogadas: ' + jogadas;
  if (primeira.dataset.figura === carta.dataset.figura) {
    [primeira, carta].forEach(c => { c.disabled = true; c.style.background = '#bbf7d0'; });
    primeira = null;
    if (++achados === cartas.length / 2) fim();
  } else {
    trava = true;
    setTimeout(() => {
      [primeira, carta].forEach(c => { c.textContent = '?'; c.style.background = ''; });
      primeira = null;
      trava = false;
    }, 800);
  }
}
"""),
("Fim de jogo e recorde", """// 6) Fim de jogo: para o relógio e guarda o recorde
function fim() {
  clearInterval(window.relogio);
  const segundos = Math.floor((Date.now() - inicio) / 1000);
  const melhorAtual = Number(localStorage.getItem(chave)) || 999;
  if (jogadas < melhorAtual) {
    localStorage.setItem(chave, jogadas);
    lblRecorde.textContent = 'Recorde: ' + jogadas;
    lblMsg.textContent = 'Novo recorde! ' + jogadas + ' jogadas em ' + segundos + 's';
  } else {
    lblMsg.textContent = 'Você venceu em ' + jogadas + ' jogadas e ' + segundos + 's!';
  }
}
"""),
]
CLICK = "\n".join(b[1] for b in BLOCOS)
CHANGE = "btnNovo.click();\n"
ONLOAD = "btnNovo.click();"
NIVEIS_JSON = '["Fácil","Médio","Difícil"]'

# Interface (coordenadas de projeto; y já considera a barra superior do app)
UI = [
    # (tipo, nome, texto, x, y, largura, altura)
    ("heading", "heading1", "Jogo da Memória", 20, 70, 350, 40),
    ("label", "lblJogadas", "Jogadas: 0", 20, 122, 110, 44),
    ("label", "lblTempo", "Tempo: 0s", 140, 122, 110, 44),
    ("label", "lblRecorde", "Recorde: -", 260, 122, 110, 44),
    ("select", "selNivel", "", 20, 178, 170, 44),
    ("button", "btnNovo", "Novo jogo", 200, 178, 170, 44),
    ("panel", "tabuleiro", "", 20, 234, 350, 350),
    ("label", "lblMsg", "Encontre todos os pares!", 20, 596, 350, 50),
]
