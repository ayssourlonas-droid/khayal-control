"""Campo_Minado — o clássico Campo Minado em 1 página: 3 níveis, primeira jogada sempre segura, bandeiras (clique direito, toque longo
ou modo Bandeira), abrir em cascata, "acorde" (clicar num número já satisfeito), cronômetro e recorde por nível.
Todo o código fica dentro do .flowmobile (OnLoad da página e eventos dos componentes)."""
from lib import *
import os, json
here = os.path.dirname(os.path.abspath(__file__))
MOTOR = r'''window.CM = (function () {
  const $ = id => document.getElementById(id);
  const som = (n, v) => { try { if (window.Sons) window.Sons.play(n, v); } catch (e) {} }; // sons (componente Game Sound), se o projeto tiver
  const NIVEIS = { 'Fácil': [8, 8, 10], 'Médio': [10, 10, 18], 'Difícil': [12, 12, 30] };
  const COR = ['', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#111827', '#6b7280'];
  const D = { n: 8, m: 10, mina: [], num: [], est: [], jogando: false, fim: false, comecou: false, inicio: 0, relogio: 0, modo: 'cavar', rnd: Math.random, abertas: 0, bandeiras: 0, nivel: 'Fácil' };
  const viz = (r, c) => { const o = []; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { if ((a || b) && r + a >= 0 && r + a < D.n && c + b >= 0 && c + b < D.n) o.push([r + a, c + b]); } return o; };
  const matriz = v => Array.from({ length: D.n }, () => Array(D.n).fill(v));
  D.novo = () => {
    som('start'); clearInterval(D.relogio);
    D.nivel = $('selNivel').value in NIVEIS ? $('selNivel').value : 'Fácil';
    D.n = NIVEIS[D.nivel][0]; D.m = NIVEIS[D.nivel][2];
    D.mina = matriz(false); D.num = matriz(0); D.est = matriz(0);
    D.comecou = false; D.fim = false; D.abertas = 0; D.bandeiras = 0; D.inicio = 0; D.modo = 'cavar';
    $('btnModo').textContent = 'Modo: Cavar ⛏'; $('btnNovo').textContent = '🙂 Novo';
    $('lblTempo').textContent = 'Tempo: 0s';
    $('lblMsg').textContent = 'Toque numa casa para começar. A primeira jogada é sempre segura.';
    D.recorde(); D.desenha();
  };
  D.recorde = () => {
    let r = 0; try { r = Number(localStorage.getItem('campominado_' + D.nivel)); } catch (e) {}
    $('lblRecorde').textContent = 'Recorde (' + D.nivel + '): ' + (Number.isFinite(r) && r > 0 ? Math.round(r) + 's' : '-');
  };
  // põe as minas depois da 1ª jogada, longe da casa clicada e das vizinhas
  D.minar = (r0, c0) => {
    const proibido = new Set([r0 * D.n + c0, ...viz(r0, c0).map(([a, b]) => a * D.n + b)]);
    const livres = []; for (let i = 0; i < D.n * D.n; i++) if (!proibido.has(i)) livres.push(i);
    for (let i = livres.length - 1; i > 0; i--) { const j = Math.floor(D.rnd() * (i + 1)); [livres[i], livres[j]] = [livres[j], livres[i]]; }
    livres.slice(0, D.m).forEach(i => { D.mina[Math.floor(i / D.n)][i % D.n] = true; });
    D.conta();
  };
  D.conta = () => { for (let r = 0; r < D.n; r++) for (let c = 0; c < D.n; c++) D.num[r][c] = viz(r, c).filter(([a, b]) => D.mina[a][b]).length; };
  D.comeca = () => {
    if (D.inicio) return; D.inicio = Date.now();
    D.relogio = setInterval(() => { $('lblTempo').textContent = 'Tempo: ' + Math.floor((Date.now() - D.inicio) / 1000) + 's'; }, 250);
  };
  D.abrir = (r, c) => {
    if (D.fim || D.est[r][c] !== 0) return false;
    if (!D.comecou) { D.comecou = true; D.minar(r, c); D.comeca(); $('lblMsg').textContent = 'Abra todas as casas seguras. Bandeira: clique direito, toque longo ou modo Bandeira.'; }
    if (D.mina[r][c]) { D.perdeu(r, c); return true; }
    const antes = D.abertas;
    const pilha = [[r, c]];
    while (pilha.length) {   // cascata sem recursão (não estoura a pilha)
      const [a, b] = pilha.pop(); if (D.est[a][b] !== 0) continue;
      D.est[a][b] = 1; D.abertas++;
      if (D.num[a][b] === 0) viz(a, b).forEach(([x, y]) => { if (D.est[x][y] === 0) pilha.push([x, y]); });
    }
    if (D.abertas === D.n * D.n - D.m) D.ganhou(); else { som(D.abertas - antes > 3 ? 'merge' : 'pop'); D.desenha(); }
    return true;
  };
  D.bandeira = (r, c) => {
    if (D.fim || D.est[r][c] === 1) return false;
    D.est[r][c] = D.est[r][c] === 2 ? 0 : 2; D.bandeiras += D.est[r][c] === 2 ? 1 : -1; som('flag'); D.desenha(); return true;
  };
  // clicar num número já aberto, com o nº certo de bandeiras em volta, abre as outras vizinhas
  D.acorde = (r, c) => {
    if (D.fim || D.est[r][c] !== 1 || !D.num[r][c]) return false;
    const v = viz(r, c); if (v.filter(([a, b]) => D.est[a][b] === 2).length !== D.num[r][c]) return false;
    v.forEach(([a, b]) => { if (!D.fim) D.abrir(a, b); }); return true;
  };
  D.toque = (r, c) => {
    if (D.est[r][c] === 1) return D.acorde(r, c);
    return D.modo === 'cavar' ? D.abrir(r, c) : D.bandeira(r, c);
  };
  D.perdeu = (r, c) => {
    D.fim = true; clearInterval(D.relogio); D.est[r][c] = 3; som('explosion'); setTimeout(() => som('lose'), 600);
    $('btnNovo').textContent = '😵 Novo'; D.desenha('Boom! Você pisou numa mina. Toque em Novo para tentar de novo.');
  };
  D.ganhou = () => {
    D.fim = true; clearInterval(D.relogio); som('win');
    for (let r = 0; r < D.n; r++) for (let c = 0; c < D.n; c++) if (D.mina[r][c]) D.est[r][c] = 2;
    D.bandeiras = D.m;
    const s = Math.max(1, Math.round((Date.now() - D.inicio) / 1000)); let msg = 'Você venceu em ' + s + 's!';
    try { const k = 'campominado_' + D.nivel, ant = Number(localStorage.getItem(k)); if (!(ant > 0) || s < ant) { localStorage.setItem(k, s); msg += ' Novo recorde!'; } } catch (e) {}
    $('btnNovo').textContent = '😎 Novo'; D.recorde(); D.desenha(msg);
  };
  D.alternaModo = () => {
    som('click'); D.modo = D.modo === 'cavar' ? 'bandeira' : 'cavar';
    $('btnModo').textContent = D.modo === 'cavar' ? 'Modo: Cavar ⛏' : 'Modo: Bandeira 🚩'; return D.modo;
  };
  D.desenha = msg => {
    const t = $('tabuleiro'); if (!t) return;
    const tam = Math.floor((342 - 2 * (D.n - 1)) / D.n);
    if (!t.dataset.ok) {
      t.dataset.ok = '1';
      for (const id of ['lblMinas', 'lblTempo']) $(id).style.cssText += ';display:flex;align-items:center;justify-content:center;border-radius:10px;font-weight:700;font-size:16px';
      t.style.cssText += ';display:grid;gap:2px;padding:4px;box-sizing:border-box;background:#94a3b8;border-radius:10px;touch-action:manipulation;user-select:none;-webkit-user-select:none';
      t.oncontextmenu = e => { e.preventDefault(); const c = e.target.closest('.cm-casa'); if (c && !D.longo) D.bandeira(+c.dataset.r, +c.dataset.c); };
      let timer = 0, alvo = null;
      t.onpointerdown = e => {
        const c = e.target.closest('.cm-casa'); D.longo = false; if (!c || e.button === 2) return; alvo = c;
        timer = setTimeout(() => { D.longo = true; D.bandeira(+c.dataset.r, +c.dataset.c); }, 450);
      };
      const solta = () => clearTimeout(timer);
      t.onpointerleave = solta; t.onpointercancel = solta;
      t.onpointerup = e => {
        clearTimeout(timer); const c = e.target.closest('.cm-casa');
        if (D.longo) { D.longo = false; return; }
        if (c && c === alvo && e.button === 0) D.toque(+c.dataset.r, +c.dataset.c);
        alvo = null;
      };
    }
    t.style.gridTemplateColumns = 'repeat(' + D.n + ',' + tam + 'px)'; t.style.gridTemplateRows = 'repeat(' + D.n + ',' + tam + 'px)'; t.style.justifyContent = 'center'; t.style.alignContent = 'center';
    t.innerHTML = '';
    for (let r = 0; r < D.n; r++) for (let c = 0; c < D.n; c++) {
      const e = D.est[r][c], el = document.createElement('div'); let txt = '', bg = '#cbd5e1', cor = '#0f172a';
      el.className = 'cm-casa'; el.dataset.r = r; el.dataset.c = c; el.dataset.e = e;
      if (e === 1) { bg = '#f1f5f9'; txt = D.num[r][c] || ''; cor = COR[D.num[r][c]] || cor; }
      else if (e === 2) { txt = D.fim && !D.mina[r][c] ? '❌' : '🚩'; }
      else if (e === 3) { bg = '#fca5a5'; txt = '💣'; }
      else if (D.fim && D.mina[r][c]) { bg = '#e2e8f0'; txt = '💣'; }
      el.textContent = txt; el.dataset.n = e === 1 ? D.num[r][c] : '';
      el.style.cssText = 'display:flex;align-items:center;justify-content:center;border-radius:4px;font-weight:800;cursor:pointer;width:' + tam + 'px;height:' + tam + 'px;background:' + bg + ';color:' + cor + ';font-size:' + Math.round(tam * 0.55) + 'px';
      t.appendChild(el);
    }
    $('lblMinas').textContent = '💣 ' + (D.m - D.bandeiras);
    if (msg) $('lblMsg').textContent = msg;
  };
  return D;
})();
'''
JS = 'if (!window.CM) {\n' + MOTOR + '}\nCM.novo();'
ui = [
    it('heading', 'heading1', 'Campo Minado', 20, 70, 350, 40, bg='transparent'),
    it('select', 'selNivel', '', 20, 118, 150, 44, {'change': 'CM.novo();'}, items=['Fácil', 'Médio', 'Difícil']),
    it('button', 'btnModo', 'Modo: Cavar ⛏', 180, 118, 190, 44, {'click': 'CM.alternaModo();'}),
    it('label', 'lblMinas', '💣 10', 20, 172, 110, 40, bg='#fee2e2', color='#991b1b'),
    it('label', 'lblTempo', 'Tempo: 0s', 140, 172, 110, 40, bg='#e0f2fe', color='#075985'),
    it('button', 'btnNovo', '🙂 Novo', 260, 172, 110, 40, {'click': 'CM.novo();'}, bg='#16a34a', color='#ffffff'),
    it('panel', 'tabuleiro', '', 20, 222, 350, 350, bg='#94a3b8'),
    it('label', 'lblMsg', '', 20, 580, 350, 48, bg='transparent', color='#334155'),
    it('label', 'lblRecorde', '', 20, 634, 350, 28, bg='transparent', color='#64748b'),
]
p = proj('Campo Minado', [('Jogo', ui, {'onload': JS})], theme='#16a34a')
dest = os.path.join(here, '..', '..', 'examples', 'Campo_Minado.flowmobile')
json.dump(p, open(dest, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')

# ---------- sons: o motor chama Sons.play (som); aqui entram o componente Game Sound e o botão 🔊/🔇 ----------
from sons import pos_salvar
pos_salvar('Campo_Minado', [])
