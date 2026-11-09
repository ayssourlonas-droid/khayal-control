"""Divisor_de_Conta — app de 1 página: valor da conta, gorjeta, nº de pessoas e arredondamento; mostra quanto cada um paga.
Todo o código fica dentro do .flowmobile (OnLoad da página + eventos dos componentes)."""
from lib import *
import os, json
here = os.path.dirname(os.path.abspath(__file__))
MOTOR = r'''window.DC = (function () {
  const $ = id => document.getElementById(id);
  const MAXP = 30, MAXV = 1000000;
  const D = { pessoas: 4 };
  const brl = c => 'R$ ' + (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // aceita "45,90", "45.90", "1.234,50" e "R$ 80"
  D.ler = txt => {
    let s = String(txt || '').replace(/R\$|\s/g, '');
    if (!s) return null;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return NaN;
    return Math.round(parseFloat(s) * 100);
  };
  // trabalha em centavos (sem erros de ponto flutuante)
  D.conta = (valor, pct, n, arred) => {
    const gorjeta = Math.round(valor * pct / 100), total = valor + gorjeta;
    let por = Math.ceil(total / n);
    if (arred) por = Math.ceil(por / 100) * 100;
    return { gorjeta: gorjeta, total: total, por: por, cobrado: por * n, sobra: por * n - total };
  };
  D.calc = () => {
    if (!$('lblPessoas')) return;
    const est = (id, css) => { const e = $(id); if (e && !e.dataset.est) { e.style.cssText += ';' + css; e.dataset.est = '1'; } };
    est('lblPor', 'font-size:38px;font-weight:700;display:flex;align-items:center;justify-content:center;border-radius:12px');
    est('lblPessoas', 'font-size:22px;font-weight:600;display:flex;align-items:center;justify-content:center');
    est('btnMenos', 'font-size:26px;border-radius:12px'); est('btnMais', 'font-size:26px;border-radius:12px');
    $('lblPessoas').textContent = D.pessoas + (D.pessoas === 1 ? ' pessoa' : ' pessoas');
    const v = D.ler($('inpValor').value), pct = parseInt($('selGorjeta').value, 10) || 0, arred = $('selArred').value === 'Sim';
    const campos = ['lblGorjeta', 'lblTotal', 'lblPor', 'lblNota'];
    if (v === null || Number.isNaN(v) || v <= 0 || v > MAXV * 100) {
      $('lblMsg').textContent = v === null ? 'Digite o valor da conta.' : v === 0 ? 'O valor precisa ser maior que zero.' : 'Valor inválido. Exemplo: 125,90';
      $('lblPor').textContent = 'R$ 0,00'; $('lblGorjeta').textContent = 'Gorjeta: R$ 0,00'; $('lblTotal').textContent = 'Total: R$ 0,00'; $('lblNota').textContent = '';
      return null;
    }
    const r = D.conta(v, pct, D.pessoas, arred);
    $('lblMsg').textContent = 'Valor da conta: ' + brl(v);
    $('lblGorjeta').textContent = 'Gorjeta (' + pct + '%): ' + brl(r.gorjeta);
    $('lblTotal').textContent = 'Total: ' + brl(r.total);
    $('lblPor').textContent = brl(r.por);
    $('lblNota').textContent = D.pessoas === 1 ? 'Só uma pessoa: paga o total.' : r.sobra > 0 ? 'Arredondando, sobram ' + brl(r.sobra) + ' (vira gorjeta extra).' : 'Divisão exata, sem sobras.';
    return r;
  };
  D.mais = () => { if (D.pessoas < MAXP) D.pessoas++; D.calc(); };
  D.menos = () => { if (D.pessoas > 1) D.pessoas--; D.calc(); };
  D.limpar = () => { $('inpValor').value = ''; $('selGorjeta').value = '10%'; $('selArred').value = 'Não'; D.pessoas = 4; D.calc(); };
  D.tecla = () => setTimeout(D.calc, 0);
  return D;
})();
'''
JS = 'if (!window.DC) {\n' + MOTOR + '}\nif (!document.getElementById("inpValor").value) selGorjeta.value = "10%";\nDC.calc();'
ui = [
    it('heading', 'heading1', 'Divisor de Conta', 20, 70, 350, 40, bg='transparent'),
    it('label', 'lblV', 'Valor da conta (R$)', 20, 120, 350, 24, bg='transparent', color='#475569'),
    it('input', 'inpValor', '', 20, 146, 350, 46, {'keydown': 'DC.tecla();'}),
    it('label', 'lblG', 'Gorjeta', 20, 204, 170, 24, bg='transparent', color='#475569'),
    it('select', 'selGorjeta', '', 20, 230, 170, 44, {'change': 'DC.calc();'}),
    it('label', 'lblA', 'Arredondar p/ cima', 200, 204, 170, 24, bg='transparent', color='#475569'),
    it('select', 'selArred', '', 200, 230, 170, 44, {'change': 'DC.calc();'}),
    it('button', 'btnMenos', '−', 20, 292, 60, 48, {'click': 'DC.menos();'}),
    it('label', 'lblPessoas', '4 pessoas', 90, 292, 210, 48, bg='transparent', color='#0f172a'),
    it('button', 'btnMais', '+', 310, 292, 60, 48, {'click': 'DC.mais();'}),
    it('label', 'lblMsg', '', 20, 356, 350, 26, bg='transparent', color='#475569'),
    it('label', 'lblGorjeta', '', 20, 384, 350, 26, bg='transparent', color='#475569'),
    it('label', 'lblTotal', '', 20, 412, 350, 26, bg='transparent', color='#475569'),
    it('label', 'lblTit', 'Cada pessoa paga', 20, 450, 350, 26, bg='transparent', color='#0f172a'),
    it('label', 'lblPor', 'R$ 0,00', 20, 478, 350, 60, bg='#dcfce7', color='#166534'),
    it('label', 'lblNota', '', 20, 548, 350, 44, bg='transparent', color='#64748b'),
    it('button', 'btnLimpar', 'Limpar', 20, 604, 350, 46, {'click': 'DC.limpar();'}),
]
for x in ui:
    if x['name'] == 'selGorjeta': x['items'] = ['0%', '5%', '10%', '12%', '15%', '20%']
    if x['name'] == 'selArred': x['items'] = ['Não', 'Sim']
    if x['name'] == 'inpValor': x['text'] = ''
p = proj('Divisor de Conta', [('Divisor de Conta', ui, {'onload': JS})], theme='#0ea5e9')
dest = os.path.join(here, '..', '..', 'examples', 'Divisor_de_Conta.flowmobile')
json.dump(p, open(dest, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
