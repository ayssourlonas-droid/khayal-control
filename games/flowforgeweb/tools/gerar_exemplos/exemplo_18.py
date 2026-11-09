"""Rastreador_de_Habitos — app de 3 páginas (Hoje, Semana, Hábitos): marcar hábitos do dia, sequência de dias seguidos,
grade dos últimos 7 dias (com correção de dias passados) e cadastro/remoção de hábitos; tudo salvo no aparelho.
O motor (dados e telas) fica embutido neste arquivo (MOTOR) e dentro do .flowmobile, e é carregado no OnLoad de cada página (uma única vez); cada página chama a sua tela no OnShow."""
from lib import *
import os, json
here = os.path.dirname(os.path.abspath(__file__))
# O roteador usa a URL (#/page/...): ao recarregar numa página interna só o OnLoad dela roda. Por isso o código compartilhado
# é carregado (uma única vez, protegido por "if (!window.HB)") no OnLoad de TODAS as páginas.
MOTOR = r'''/* Rastreador de Hábitos — dados e telas (Hoje, Semana, Hábitos). Executa no OnLoad da primeira página;
   cada página chama a sua função no OnShow. Tudo fica salvo no aparelho (localStorage). */
window.HB = (function () {
  const KEY = 'habitos_v1', MAX = 10;
  const PADRAO = ['Beber 2 L de água', 'Ler 10 minutos', 'Exercício', 'Meditar'];
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const padrao = () => ({ habitos: PADRAO.map((n, i) => ({ id: i + 1, nome: n })), feitos: {}, prox: PADRAO.length + 1 });
  function carregar() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.habitos) && d.feitos && typeof d.feitos === 'object') return d;
    } catch (e) { /* dados antigos ou corrompidos: começa do zero */ }
    return padrao();
  }
  let dados = carregar();
  const salvar = () => { try { localStorage.setItem(KEY, JSON.stringify(dados)); } catch (e) {} };
  const H = { agora: () => new Date() };

  // ---- datas (meio-dia evita problemas de horário de verão) ----
  const dia = n => { const d = H.agora(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
  const chave = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const feito = (id, k) => (dados.feitos[k] || []).includes(id);

  // ---- regras ----
  H.alternar = (id, k) => {
    const a = dados.feitos[k] || [], i = a.indexOf(id);
    if (i >= 0) a.splice(i, 1); else a.push(id);
    dados.feitos[k] = a;
    if (!a.length) delete dados.feitos[k];
    salvar();
  };
  // dias seguidos até hoje (se hoje ainda não foi feito, a sequência de ontem continua valendo)
  H.sequencia = id => {
    let n = 0, i = feito(id, chave(dia(0))) ? 0 : 1;
    while (i < 400 && feito(id, chave(dia(i)))) { n++; i++; }
    return n;
  };
  H.dados = () => dados;
  H.chave = chave;
  H.dia = dia;

  // ---- tela Hoje ----
  H.hoje = () => {
    const lista = $('hjLista'); if (!lista) return;
    const k = chave(dia(0)), total = dados.habitos.length;
    const ok = dados.habitos.filter(h => feito(h.id, k)).length, pct = total ? Math.round(ok * 100 / total) : 0;
    const dt = dia(0).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    $('hjData').textContent = dt.charAt(0).toUpperCase() + dt.slice(1);
    $('hjProgresso').textContent = ok + ' de ' + total + ' concluídos (' + pct + '%)';
    const barra = $('hjBarra'); barra.style.borderRadius = '7px'; barra.style.overflow = 'hidden';
    barra.innerHTML = '<div style="height:100%;width:' + pct + '%;background:#22c55e;transition:width .3s"></div>';
    lista.innerHTML = ''; lista.style.overflowY = 'auto'; lista.style.padding = '2px';
    if (!total) lista.innerHTML = '<p style="color:#64748b;text-align:center;margin-top:40px">Nenhum hábito ainda.<br>Cadastre na aba Hábitos.</p>';
    dados.habitos.forEach(h => {
      const f = feito(h.id, k), s = H.sequencia(h.id), row = document.createElement('div');
      row.className = 'hb-linha'; row.dataset.id = h.id; row.dataset.feito = f ? '1' : '';
      row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:8px;border-radius:12px;cursor:pointer;border:1px solid ' + (f ? '#86efac' : '#e2e8f0') + ';background:' + (f ? '#dcfce7' : '#ffffff');
      row.innerHTML = '<span style="width:28px;height:28px;flex:none;border-radius:50%;border:2px solid ' + (f ? '#16a34a' : '#94a3b8') + ';background:' + (f ? '#16a34a' : 'transparent') + ';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">' + (f ? '✓' : '') + '</span>'
        + '<span class="hb-nome" style="flex:1;font-size:16px;' + (f ? 'text-decoration:line-through;color:#64748b' : 'color:#0f172a') + '"></span>'
        + '<span class="hb-seq" style="font-size:14px;color:#b45309;font-weight:700;white-space:nowrap">' + (s ? '🔥 ' + s : '') + '</span>';
      row.querySelector('.hb-nome').textContent = h.nome;  // textContent: nomes nunca viram HTML
      row.onclick = () => { H.alternar(h.id, k); H.hoje(); };
      lista.appendChild(row);
    });
    $('hjMsg').textContent = !total ? 'Adicione seus primeiros hábitos.' : pct === 100 ? 'Tudo feito hoje! Sequências mantidas.' : ok === 0 ? 'Comece por um hábito pequeno.' : 'Falta pouco, continue!';
  };

  // ---- tela Semana ----
  H.semana = () => {
    const g = $('smGrade'); if (!g) return;
    const dias = []; for (let i = 6; i >= 0; i--) dias.push(dia(i));
    const ini = 'DSTQQSS';
    let html = '<table style="width:100%;border-collapse:collapse;font-size:14px"><tr><th></th>'
      + dias.map((d, i) => '<th style="padding:4px 0;color:#475569;' + (i === 6 ? 'background:#e0e7ff;border-radius:8px' : '') + '">' + ini.charAt(d.getDay()) + '<br><small>' + d.getDate() + '</small></th>').join('') + '</tr>';
    let feitos = 0, melhor = null;
    dados.habitos.forEach(h => {
      let n = 0;
      html += '<tr><td style="padding:6px 4px;max-width:118px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(h.nome) + '</td>'
        + dias.map(d => {
          const k = chave(d), f = feito(h.id, k); if (f) n++;
          return '<td data-h="' + h.id + '" data-k="' + k + '" style="text-align:center;cursor:pointer;font-size:20px;color:' + (f ? '#16a34a' : '#cbd5e1') + '">' + (f ? '●' : '○') + '</td>';
        }).join('') + '</tr>';
      feitos += n; if (!melhor || n > melhor.n) melhor = { nome: h.nome, n: n };
    });
    g.innerHTML = html + '</table>';
    g.style.overflowY = 'auto';
    g.onclick = e => { const td = e.target.closest('td[data-k]'); if (td) { H.alternar(+td.dataset.h, td.dataset.k); H.semana(); } };
    const possivel = dados.habitos.length * 7;
    $('smResumo').textContent = possivel ? 'Taxa da semana: ' + Math.round(feitos * 100 / possivel) + '% (' + feitos + ' de ' + possivel + ')' : 'Nenhum hábito cadastrado.';
    $('smMelhor').textContent = melhor && melhor.n ? 'Melhor hábito: ' + melhor.nome + ' (' + melhor.n + '/7)' : 'Marque hábitos para ver o melhor da semana.';
  };

  // ---- tela Hábitos (gerenciar) ----
  H.gerenciar = () => {
    const lista = $('gdLista'); if (!lista) return;
    lista.innerHTML = ''; lista.style.overflowY = 'auto'; lista.style.padding = '2px';
    dados.habitos.forEach(h => {
      const row = document.createElement('div'); row.className = 'hb-gerencia';
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:8px;border-radius:12px;border:1px solid #e2e8f0;background:#fff';
      row.innerHTML = '<span class="hb-nome" style="flex:1;font-size:16px;color:#0f172a"></span><button class="hb-del" title="Remover" style="border:0;background:#fee2e2;color:#b91c1c;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:15px">Remover</button>';
      row.querySelector('.hb-nome').textContent = h.nome;
      row.querySelector('.hb-del').onclick = () => H.remover(h.id);
      lista.appendChild(row);
    });
    $('gdInfo').textContent = dados.habitos.length + ' de ' + MAX + ' hábitos';
  };
  H.adicionar = () => {
    const el = $('gdNome'), info = $('gdInfo'), nome = (el.value || '').trim().replace(/\s+/g, ' ');
    if (!nome) { info.textContent = 'Digite o nome do hábito.'; return false; }
    if (nome.length > 28) { info.textContent = 'Use no máximo 28 letras.'; return false; }
    if (dados.habitos.length >= MAX) { info.textContent = 'Limite de ' + MAX + ' hábitos atingido.'; return false; }
    if (dados.habitos.some(h => h.nome.toLowerCase() === nome.toLowerCase())) { info.textContent = 'Esse hábito já existe.'; return false; }
    dados.habitos.push({ id: dados.prox++, nome: nome }); salvar();
    el.value = ''; H.gerenciar(); info.textContent = 'Hábito adicionado: ' + nome;
    return true;
  };
  H.remover = id => {
    dados.habitos = dados.habitos.filter(h => h.id !== id);
    Object.keys(dados.feitos).forEach(k => { dados.feitos[k] = dados.feitos[k].filter(x => x !== id); if (!dados.feitos[k].length) delete dados.feitos[k]; });
    salvar(); H.gerenciar();
  };
  H.restaurar = () => {
    if (!confirm('Voltar aos hábitos padrão? O histórico será apagado.')) return false;
    dados = padrao(); salvar(); H.gerenciar(); return true;
  };
  return H;
})();
'''
JS = 'if (!window.HB) {\n' + MOTOR + '}\n'
PAGES = ['Hoje', 'Semana', 'Hábitos']
def nav(prefix, atual):
    out = []
    for i, nome in enumerate(PAGES):
        kw = dict(bg=BTN, color='#ffffff') if nome == atual else {}
        out.append(it('button', f'{prefix}Nav{i}', nome, [20, 139, 259][i], 122, 113, 40, {'click': f'ffNavigate("{nome}");'}, **kw))
    return out
hoje = [
    it('heading', 'hjTitle', 'Hábitos de hoje', 20, 70, 350, 40, bg='transparent'),
    *nav('hj', 'Hoje'),
    it('label', 'hjData', '', 20, 172, 350, 28, bg='transparent', color='#475569'),
    it('label', 'hjProgresso', '0 de 4 concluídos (0%)', 20, 204, 350, 26, bg='transparent', color='#0f172a'),
    it('panel', 'hjBarra', '', 20, 236, 350, 14, bg='#e2e8f0'),
    it('panel', 'hjLista', '', 20, 264, 350, 346, bg='#f8fafc'),
    it('label', 'hjMsg', '', 20, 620, 350, 44, bg='transparent', color='#334155'),
]
semana = [
    it('heading', 'smTitle', 'Últimos 7 dias', 20, 70, 350, 40, bg='transparent'),
    *nav('sm', 'Semana'),
    it('panel', 'smGrade', '', 20, 176, 350, 300, bg='#f8fafc'),
    it('label', 'smResumo', '', 20, 488, 350, 28, bg='transparent', color='#0f172a'),
    it('label', 'smMelhor', '', 20, 520, 350, 28, bg='transparent', color='#0f172a'),
    it('label', 'smDica', 'Toque numa bolinha para marcar ou corrigir um dia.', 20, 560, 350, 44, bg='transparent', color='#64748b'),
]
habitos = [
    it('heading', 'gdTitle', 'Meus hábitos', 20, 70, 350, 40, bg='transparent'),
    *nav('gd', 'Hábitos'),
    it('input', 'gdNome', 'Novo hábito (ex.: Estudar inglês)', 20, 176, 232, 44, {'keydown': "if(event.key==='Enter')HB.adicionar();"}),
    it('button', 'gdAdd', 'Adicionar', 260, 176, 110, 44, {'click': 'HB.adicionar();'}, bg=BTN, color='#ffffff'),
    it('label', 'gdInfo', '', 20, 230, 350, 28, bg='transparent', color='#475569'),
    it('panel', 'gdLista', '', 20, 264, 350, 330, bg='#f8fafc'),
    it('button', 'gdReset', 'Restaurar hábitos padrão', 20, 604, 350, 44, {'click': 'HB.restaurar();'}),
]
p = proj('Rastreador de Hábitos', [
    ('Hoje', hoje, {'onload': JS, 'onshow': 'window.HB && HB.hoje();'}),
    ('Semana', semana, {'onload': JS, 'onshow': 'window.HB && HB.semana();'}),
    ('Hábitos', habitos, {'onload': JS, 'onshow': 'window.HB && HB.gerenciar();'}),
], theme='#16a34a')
dest = os.path.join(here, '..', '..', 'examples', 'Rastreador_de_Habitos.flowmobile')
json.dump(p, open(dest, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
