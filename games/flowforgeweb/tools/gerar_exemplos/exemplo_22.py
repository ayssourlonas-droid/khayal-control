"""Painel_de_Graficos — app de 3 páginas que mostra o componente Gráfico: Vendas (tipo do gráfico, novos dados, clique nas barras),
Ao vivo (addPoint com maxPoints e Timer) e Despesas (rosca com lançamentos salvos no aparelho).
Todo o código fica dentro do .flowmobile (eventos das páginas e dos componentes)."""
from lib import *
import os, json
here = os.path.dirname(os.path.abspath(__file__))
PAGES = ['Vendas', 'Ao_vivo', 'Despesas']  # nomes de página não têm espaço (viram Ao_vivo)
ROTULO = {'Ao_vivo': 'Ao vivo'}
def nav(prefix, atual):
    out = []
    for i, nome in enumerate(PAGES):
        kw = dict(bg=BTN, color='#ffffff') if nome == atual else {}
        out.append(it('button', f'{prefix}Nav{i}', ROTULO.get(nome, nome), [20, 139, 259][i], 122, 113, 40, {'click': f'ffNavigate("{nome}");'}, **kw))
    return out
MESES = 'Jan,Fev,Mar,Abr,Mai,Jun'
TIPOS = {'Barras': 'bar', 'Barras horizontais': 'hbar', 'Linhas': 'line', 'Área': 'area'}

# ---------------- Vendas ----------------
VENDAS_INI = """// Mostra os dados atuais (ficam no próprio gráfico)
lblInfo.textContent = 'Toque numa barra para ver o valor.';
"""
TIPO_CHANGE = ("const tipos = " + json.dumps(TIPOS, ensure_ascii=False) + ";\n"
               "gfVendas.chartType = tipos[selTipo.value] || 'bar';\n")
NOVOS = """// Sorteia 6 valores novos e troca os dados do gráfico
const valores = [];
for (let i = 0; i < 6; i++) valores.push(Math.round(800 + Math.random() * 2200));
gfVendas.setData(['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], valores);
const total = valores.reduce((a, b) => a + b, 0);
lblInfo.textContent = 'Novos dados! Total do semestre: R$ ' + total.toLocaleString('pt-BR');
"""
SELECT_VENDAS = """// event.detail = { index, label, value, series }
lblInfo.textContent = event.detail.label + ': R$ ' + event.detail.value.toLocaleString('pt-BR');
"""
vendas = [
    it('heading', 'vdTitle', 'Vendas do semestre', 20, 70, 350, 40, bg='transparent'),
    *nav('vd', 'Vendas'),
    it('chart', 'gfVendas', '', 20, 172, 350, 250, {'select': SELECT_VENDAS}, chartType='bar', chartTitle='Vendas por mês', chartLabels=MESES,
       values='[1200,1850,950,2100,1700,2400]', chartSeries='Vendas', valuePrefix='R$ ', legend=True, showValues=True, chartGrid=True, animate=True),
    it('select', 'selTipo', '', 20, 432, 170, 44, {'change': TIPO_CHANGE}, items=list(TIPOS)),
    it('button', 'btnNovos', 'Novos dados', 200, 432, 170, 44, {'click': NOVOS}),
    it('label', 'lblInfo', 'Toque numa barra para ver o valor.', 20, 488, 350, 50, bg='transparent', color='#334155'),
]

# ---------------- Ao vivo ----------------
TICK = """// A cada segundo acrescenta um ponto; o gráfico guarda só os últimos 20 (maxPoints)
if (window.__aoVivoPausa) return;
window.__aoVivo = Math.max(5, Math.min(95, (window.__aoVivo ?? 50) + (Math.random() - 0.5) * 18));
const agora = new Date();
const hora = String(agora.getMinutes()).padStart(2, '0') + ':' + String(agora.getSeconds()).padStart(2, '0');
gfLive.addPoint(hora, Math.round(window.__aoVivo));
lblValor.textContent = 'Agora: ' + Math.round(window.__aoVivo) + '%';
"""
PAUSA = """window.__aoVivoPausa = !window.__aoVivoPausa;
btnPausa.textContent = window.__aoVivoPausa ? 'Continuar' : 'Pausar';
lblValor.textContent = window.__aoVivoPausa ? 'Pausado' : 'Agora: ' + Math.round(window.__aoVivo ?? 50) + '%';
"""
LIMPA = """gfLive.clear();
window.__aoVivo = 50;
lblValor.textContent = 'Gráfico limpo. Novos pontos a cada segundo.';
"""
live = [
    it('heading', 'lvTitle', 'Uso da CPU ao vivo', 20, 70, 350, 40, bg='transparent'),
    *nav('lv', 'Ao_vivo'),
    it('chart', 'gfLive', '', 20, 172, 350, 250, chartType='area', chartTitle='CPU (%)', chartLabels='', values='[]', chartSeries='CPU',
       valueSuffix='%', yMin=0, yMax=100, maxPoints=20, showValues=False, smooth=True, animate=False, chartColors='#0ea5e9'),
    it('label', 'lblValor', 'Novos pontos a cada segundo.', 20, 432, 350, 36, bg='transparent', color='#334155'),
    it('button', 'btnPausa', 'Pausar', 20, 478, 170, 44, {'click': PAUSA}),
    it('button', 'btnLimpar2', 'Limpar', 200, 478, 170, 44, {'click': LIMPA}),
    it('timer', 'tmLive', 'Timer', 20, 600, 90, 34, {'tick': TICK}, interval=1000, enabled=True),
]

# ---------------- Despesas ----------------
CATS = ['Moradia', 'Comida', 'Transporte', 'Lazer', 'Saúde']
DESP_LER = """// lê os lançamentos salvos no aparelho (ou usa valores de exemplo)
let d = null;
try { d = JSON.parse(localStorage.getItem('graficos_despesas')); } catch (e) {}
if (!d || typeof d !== 'object') d = { Moradia: 1200, Comida: 650, Transporte: 280, Lazer: 190, Saúde: 120 };
"""
DESP_DESENHA = """const nomes = Object.keys(d);
gfDesp.setData(nomes, nomes.map(n => d[n]));
const total = nomes.reduce((a, n) => a + d[n], 0);
lblTotal.textContent = 'Total: R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
"""
DESP_SHOW = DESP_LER + DESP_DESENHA
ADD = DESP_LER + """// aceita 45,90 / 45.90 / R$ 1.200,50
let txt = inpValor.value.replace(/R\\$|\\s/g, '');
if (txt.includes(',')) txt = txt.replace(/\\./g, '').replace(',', '.');
const v = Number(txt);
if (!txt || !isFinite(v) || v <= 0 || v > 1000000) {
  lblMsg.textContent = 'Digite um valor válido. Exemplo: 45,90';
  return;
}
d[selCat.value] = Math.round(((d[selCat.value] || 0) + v) * 100) / 100;
try { localStorage.setItem('graficos_despesas', JSON.stringify(d)); } catch (e) {}
inpValor.value = '';
lblMsg.textContent = 'Adicionado em ' + selCat.value + ': R$ ' + v.toLocaleString('pt-BR');
""" + DESP_DESENHA
ADD_KEY = "if(event.key==='Enter')btnAdd.click();"
ZERA = """const d = {};
try { localStorage.setItem('graficos_despesas', JSON.stringify(d)); } catch (e) {}
gfDesp.clear();
lblTotal.textContent = 'Total: R$ 0,00';
lblMsg.textContent = 'Lançamentos apagados. Adicione novos acima.';
"""
SEL_DESP = "lblMsg.textContent = event.detail.label + ': R$ ' + event.detail.value.toLocaleString('pt-BR') + ' (' + Math.round(event.detail.value * 100 / Math.max(1, gfDesp.getData().series[0].values.reduce((a, b) => a + b, 0))) + '%)';"
desp = [
    it('heading', 'dsTitle', 'Minhas despesas', 20, 70, 350, 40, bg='transparent'),
    *nav('ds', 'Despesas'),
    it('chart', 'gfDesp', '', 20, 172, 350, 240, {'select': SEL_DESP}, chartType='doughnut', chartTitle='Despesas do mês', chartLabels=','.join(CATS),
       values='[1200,650,280,190,120]', valuePrefix='R$ ', legend=True, showValues=True, animate=True),
    it('select', 'selCat', '', 20, 422, 170, 44, items=CATS),
    it('input', 'inpValor', 'Valor (ex.: 45,90)', 200, 422, 170, 44, {'keydown': ADD_KEY}),
    it('button', 'btnAdd', 'Adicionar', 20, 476, 170, 44, {'click': ADD}, bg=BTN, color='#ffffff'),
    it('button', 'btnApagar', 'Apagar tudo', 200, 476, 170, 44, {'click': ZERA}),
    it('label', 'lblTotal', '', 20, 530, 350, 30, bg='transparent', color='#0f172a'),
    it('label', 'lblMsg', 'Toque numa fatia para ver o valor.', 20, 564, 350, 50, bg='transparent', color='#64748b'),
]
p = proj('Painel de Gráficos', [
    ('Vendas', vendas, {'onshow': VENDAS_INI}),
    ('Ao_vivo', live, {}),
    ('Despesas', desp, {'onshow': DESP_SHOW}),
], theme='#4f46e5')
dest = os.path.join(here, '..', '..', 'examples', 'Painel_de_Graficos.flowmobile')
json.dump(p, open(dest, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
