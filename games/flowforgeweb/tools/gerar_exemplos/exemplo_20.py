"""Jogo_2048 — o clássico 2048 em 1 página: setas do teclado, botões na tela, deslize (touch/mouse), desfazer, recorde e jogo salvo.
Todo o código fica dentro do .flowmobile (OnLoad da página e eventos dos componentes)."""
from lib import *
import os, json
here = os.path.dirname(os.path.abspath(__file__))
MOTOR = r'''window.DG = (function () {
  const $ = id => document.getElementById(id);
  const KEY = 'jogo2048_v1', N = 4;
  const som = (n, v) => { try { if (window.Sons) window.Sons.play(n, v); } catch (e) {} }; // sons (componente Game Sound), se o projeto tiver
  const COR = { 0: ['#cdc1b4', '#776e65'], 2: ['#eee4da', '#776e65'], 4: ['#ede0c8', '#776e65'], 8: ['#f2b179', '#fff'], 16: ['#f59563', '#fff'], 32: ['#f67c5f', '#fff'],
    64: ['#f65e3b', '#fff'], 128: ['#edcf72', '#fff'], 256: ['#edcc61', '#fff'], 512: ['#edc850', '#fff'], 1024: ['#edc53f', '#fff'], 2048: ['#edc22e', '#fff'] };
  const D = { grade: [], pontos: 0, melhor: 0, ganhou: false, fim: false, anterior: null, rnd: Math.random };
  const vazia = () => Array.from({ length: N }, () => Array(N).fill(0));
  const valida = g => Array.isArray(g) && g.length === N && g.every(l => Array.isArray(l) && l.length === N && l.every(v => Number.isInteger(v) && v >= 0 && (v === 0 || (v & (v - 1)) === 0)));
  const copia = g => g.map(l => l.slice());
  function salvar() { try { localStorage.setItem(KEY, JSON.stringify({ grade: D.grade, pontos: D.pontos, melhor: D.melhor, ganhou: D.ganhou })); } catch (e) {} }
  function carregar() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && valida(d.grade)) { D.grade = d.grade; D.pontos = Math.max(0, +d.pontos || 0); D.melhor = Math.max(D.pontos, +d.melhor || 0); D.ganhou = !!d.ganhou; return true; }
      if (d && Number.isFinite(+d.melhor)) D.melhor = Math.max(0, +d.melhor);
    } catch (e) { /* salvo corrompido: começa um jogo novo */ }
    return false;
  }
  D.sorteia = () => {
    const livres = []; D.grade.forEach((l, r) => l.forEach((v, c) => { if (!v) livres.push([r, c]); }));
    if (!livres.length) return false;
    const [r, c] = livres[Math.floor(D.rnd() * livres.length)];
    D.grade[r][c] = D.rnd() < 0.9 ? 2 : 4; return true;
  };
  D.novo = () => {
    D.grade = vazia(); D.pontos = 0; D.ganhou = false; D.fim = false; D.anterior = null;
    som('start'); D.sorteia(); D.sorteia(); salvar(); D.desenha();
  };
  // junta uma linha para o início: [2,2,4,0] -> [4,4,0,0]; devolve a nova linha e os pontos
  D.linha = l => {
    const v = l.filter(x => x); let pts = 0; const o = [];
    for (let i = 0; i < v.length; i++) {
      if (v[i] === v[i + 1]) { o.push(v[i] * 2); pts += v[i] * 2; i++; } else o.push(v[i]);
    }
    while (o.length < N) o.push(0);
    return { linha: o, pontos: pts };
  };
  D.sem = g => { // sem jogadas possíveis?
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (!g[r][c] || (c < N - 1 && g[r][c] === g[r][c + 1]) || (r < N - 1 && g[r][c] === g[r + 1][c])) return false;
    }
    return true;
  };
  // dir: 'esq' | 'dir' | 'cima' | 'baixo'
  D.mover = dir => {
    if (D.fim) return false;
    const antes = copia(D.grade); let pts = 0;
    for (let i = 0; i < N; i++) {
      const idx = []; for (let j = 0; j < N; j++) idx.push(dir === 'esq' ? [i, j] : dir === 'dir' ? [i, N - 1 - j] : dir === 'cima' ? [j, i] : [N - 1 - j, i]);
      const r = D.linha(idx.map(([a, b]) => D.grade[a][b])); pts += r.pontos;
      idx.forEach(([a, b], j) => { D.grade[a][b] = r.linha[j]; });
    }
    if (JSON.stringify(antes) === JSON.stringify(D.grade)) return false; // nada se mexeu: não conta
    D.anterior = { grade: antes, pontos: D.pontos, ganhou: D.ganhou, melhor: D.melhor };
    D.pontos += pts; D.melhor = Math.max(D.melhor, D.pontos);
    som(pts ? 'merge' : 'tick');
    D.sorteia();
    let msg = '';
    if (!D.ganhou && D.grade.some(l => l.includes(2048))) { D.ganhou = true; msg = 'Você chegou ao 2048! Continue jogando.'; som('win'); }
    if (D.sem(D.grade)) { D.fim = true; som('lose'); msg = 'Fim de jogo! Sem movimentos. Pontos: ' + D.pontos; }
    salvar(); D.desenha(msg); return true;
  };
  D.desfazer = () => {
    if (!D.anterior) { D.desenha('Nada para desfazer.'); return false; }
    D.grade = D.anterior.grade; D.pontos = D.anterior.pontos; D.ganhou = D.anterior.ganhou; D.melhor = Math.max(D.melhor, D.anterior.melhor);
    D.anterior = null; D.fim = false; salvar(); som('blip'); D.desenha('Jogada desfeita.'); return true;
  };
  D.desenha = msg => {
    const t = $('tabuleiro'); if (!t) return;
    if (!t.dataset.ok) {
      t.dataset.ok = '1';
      t.style.cssText += ';display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:8px;padding:8px;box-sizing:border-box;background:#bbada0;border-radius:12px;touch-action:none;user-select:none';
      let x0 = null, y0 = null;
      t.onpointerdown = e => { x0 = e.clientX; y0 = e.clientY; };
      t.onpointerup = e => {
        if (x0 === null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
        D.mover(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'dir' : 'esq') : (dy > 0 ? 'baixo' : 'cima'));
      };
      for (const id of ['lblPts', 'lblMelhor']) { const e = $(id); e.style.cssText += ';display:flex;align-items:center;justify-content:center;border-radius:10px;font-weight:700;font-size:16px'; }
      for (const id of ['btnEsq', 'btnCima', 'btnBaixo', 'btnDir']) $(id).style.fontSize = '22px';
    }
    t.innerHTML = '';
    D.grade.forEach(l => l.forEach(v => {
      const c = document.createElement('div'), k = COR[v] || ['#3c3a32', '#fff'];
      c.className = 'dg-celula'; c.dataset.v = v; c.textContent = v || '';
      c.style.cssText = 'display:flex;align-items:center;justify-content:center;border-radius:8px;font-weight:800;background:' + k[0] + ';color:' + k[1] + ';font-size:' + (v >= 1024 ? 22 : v >= 128 ? 28 : 34) + 'px';
      t.appendChild(c);
    }));
    $('lblPts').textContent = 'Pontos: ' + D.pontos;
    $('lblMelhor').textContent = 'Melhor: ' + D.melhor;
    $('lblMsg').textContent = msg || (D.fim ? 'Fim de jogo!' : 'Use as setas, os botões ou deslize.');
  };
  D.iniciar = () => {
    if (!carregar()) { D.grade = vazia(); D.sorteia(); D.sorteia(); D.pontos = 0; D.ganhou = false; }
    D.fim = D.sem(D.grade); D.anterior = null; D.desenha();
  };
  if (!window.__dgTecla) {
    window.__dgTecla = true;
    const mapa = { ArrowLeft: 'esq', ArrowRight: 'dir', ArrowUp: 'cima', ArrowDown: 'baixo', a: 'esq', d: 'dir', w: 'cima', s: 'baixo' };
    document.addEventListener('keydown', e => {
      const dir = mapa[e.key]; if (!dir || e.ctrlKey || e.metaKey || e.altKey) return;
      const alvo = e.target && e.target.tagName; if (alvo === 'INPUT' || alvo === 'TEXTAREA' || alvo === 'SELECT') return;
      if (!window.DG || !document.getElementById('tabuleiro')) return;
      e.preventDefault(); window.DG.mover(dir);
    });
  }
  return D;
})();
'''
JS = 'if (!window.DG) {\n' + MOTOR + '}\nDG.iniciar();'
ui = [
    it('heading', 'heading1', '2048', 20, 70, 350, 40, bg='transparent'),
    it('label', 'lblPts', 'Pontos: 0', 20, 118, 170, 38, bg='#eee4da', color='#776e65'),
    it('label', 'lblMelhor', 'Melhor: 0', 200, 118, 170, 38, bg='#eee4da', color='#776e65'),
    it('panel', 'tabuleiro', '', 20, 166, 350, 350, bg='#bbada0'),
    it('button', 'btnEsq', '←', 20, 528, 80, 46, {'click': "DG.mover('esq');"}),
    it('button', 'btnCima', '↑', 110, 528, 80, 46, {'click': "DG.mover('cima');"}),
    it('button', 'btnBaixo', '↓', 200, 528, 80, 46, {'click': "DG.mover('baixo');"}),
    it('button', 'btnDir', '→', 290, 528, 80, 46, {'click': "DG.mover('dir');"}),
    it('button', 'btnNovo', 'Novo jogo', 20, 586, 170, 46, {'click': 'DG.novo();'}, bg='#f59563', color='#ffffff'),
    it('button', 'btnDesfazer', 'Desfazer', 200, 586, 170, 46, {'click': 'DG.desfazer();'}),
    it('label', 'lblMsg', '', 20, 642, 350, 30, bg='transparent', color='#776e65'),
]
p = proj('2048', [('Jogo', ui, {'onload': JS})], theme='#f59563')
dest = os.path.join(here, '..', '..', 'examples', 'Jogo_2048.flowmobile')
json.dump(p, open(dest, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')

# ---------- sons: o motor chama Sons.play (som); aqui entram o componente Game Sound e o botão 🔊/🔇 ----------
from sons import pos_salvar
pos_salvar('Jogo_2048', [])
