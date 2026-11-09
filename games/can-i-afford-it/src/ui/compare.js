/* "买房vs投资"页。 */
import { breakevenG, compareBand, compareModel } from '../core/compare.js';
import { esc, pct, wan, yuan } from '../core/util.js';
import { ASSETS, assetById, cityById } from '../data/index.js';
import { charts, lineChart } from './charts.js';
import { $ } from './dom.js';
import { term } from './help.js';
import { UI, save, store } from './state.js';

/* ============================================================
   对比页：买房 vs 租房+投资
   ============================================================ */
export function defaultCmp(){
  if(store.G){ const L=store.G.L, city=cityById(store.G.cfg.cityId); return {price:L.total, down:store.G.planSnap.down, rate:store.G.planSnap.comRate||3.05, years:store.G.planSnap.years||30, method:store.G.planSnap.method||'ei', rent:L.rent, rentG:1, houseG:0, asset:UI.asset, R:assetById(UI.asset).R, fees:store.G.planSnap.fees+store.G.planSnap.reno, fee:Math.round(L.area*(L.fee ?? city.fee)), horizon:store.G.planSnap.years||30, band:false, from:L.name}; }
  const city = cityById(UI.cfg.cityId); const price = Math.round(city.price*90/1e4)*1e4;
  return {price, down:30, rate:3.05, years:30, method:'ei', rent:Math.round(price/(city.ratio*12)/50)*50, rentG:1, houseG:0, asset:'csi', R:6, fees:Math.round(price*0.03+90*1200), fee:Math.round(90*city.fee), horizon:30, band:false, from:`${city.name} 90㎡ 均价房`};
}
export function renderCompare(){
  if(!UI.cmp) UI.cmp = defaultCmp();
  const c = UI.cmp;
  const v = $('#v-compare');
  v.innerHTML = `
  <div class="stack-s"><span class="eyebrow">买房 vs 租房+投资</span><h2>同一笔钱，房子和基金谁跑得快？</h2><p class="small muted">A：首付买房，每月还贷。B：租同样的房子，把首付和税费一次性投进去，每月再把"月供+物业费−房租"的差额定投。看 N 年后谁的净资产多。当前参数：${esc(c.from)}。</p></div>
  <div class="card stack">
    <div class="grid2">
      ${cmpNum('price','房价总价','元')}
      ${cmpNum('rent','同类房子月租金','元')}
      ${cmpRange('down','首付比例',15,100,5,'%')}
      ${cmpRange('rate','房贷利率',2,6,0.05,'%')}
      ${cmpRange('years','贷款年限',5,30,1,' 年')}
      ${cmpRange('horizon','观察多少年后',5,30,1,' 年')}
      ${cmpRange('houseG','房价每年涨跌',-8,8,0.5,'%')}
      ${cmpRange('rentG','租金每年涨幅',-3,5,0.5,'%')}
    </div>
    <div class="field"><span class="lab">钱投到哪</span><div class="seg" id="seg-asset-cmp">${ASSETS.map(a=>`<button data-asset="${a.id}" aria-pressed="${c.asset===a.id}">${a.name}</button>`).join('')}</div></div>
    ${cmpRange('R',`假设年化收益 ${term('ret')}`,0,15,0.5,'%')}
    <label class="check"><input type="checkbox" id="in-cmp-band" ${c.band?'checked':''}><span>显示投资波动范围（按历史波动模拟 160 次，阴影是中间一半的结果）</span></label>
    <p class="hint">首付外的税费装修按 ${yuan(c.fees)} 计；物业费 ${yuan(c.fee)}/月；卖房按估值扣 2% 费用。${store.G?'<button class="btn sm ghost" data-act="cmp-reset">用这局的房子</button>':''}</p>
  </div>
  <div class="card stack">
    <p class="answer" id="cmp-answer"></p>
    <div class="kpis k3" id="cmp-kpis"></div>
    <div class="chart" id="cmp-chart"></div>
    <div class="legend"><span><span class="ln" style="border-color:var(--s-buy)"></span>买房：房子卖掉还清贷款后剩的钱${term('networth')}</span><span><span class="ln" style="border-color:var(--s-inv)"></span>租房+投资：投资账户</span></div>
    <div class="tbl-wrap"><table class="tbl" id="cmp-table"></table></div>
    <p class="foot">年化收益是假设值，不是预测：沪深300 过去二十年大起大落，标普500、纳指100 要通过 QDII 买，还有汇率和额度限制。没算的东西：房子的居住稳定性、户口和学区；租房的搬家成本；投资账户的赎回费。不构成投资建议。</p>
  </div>`;
  updateCompare();
}
export function cmpNum(k,label,unit){ return `<div class="field"><label for="cmp-${k}">${label}</label><div class="inp-wrap"><input class="inp num" id="cmp-${k}" data-cmp="${k}" type="number" inputmode="numeric" min="0" value="${UI.cmp[k]}"><span class="unit">${unit}</span></div></div>`; }
export function cmpRange(k,label,min,max,step,unit){ return `<div class="field"><label for="cmp-${k}"><span>${label}</span><span class="num" id="cmpo-${k}">${UI.cmp[k]}${unit}</span></label><input type="range" id="cmp-${k}" data-cmp="${k}" data-unit="${unit}" min="${min}" max="${max}" step="${step}" value="${UI.cmp[k]}"></div>`; }
export function updateCompare(){
  const c = UI.cmp; charts.list = [];
  const a = assetById(c.asset);
  const p = {...c, horizon: c.horizon};
  const r = compareModel(p);
  const n = r.buy.length; const bF = r.buy[n-1], rF = r.rent[n-1];
  const g = breakevenG(p);
  const sigma = c.asset==='custom' ? 15 : (ASSETS.find(x=>x.id===c.asset)?.sigma ?? 15);
  const band = c.band && sigma>0 ? compareBand(p, sigma) : null;
  const custom = Math.abs(c.R - a.R)>1e-9;
  const nm = custom ? `年化 ${c.R}% 的投资` : a.name;
  $('#cmp-answer').innerHTML = `${c.horizon} 年后，买房的你净资产约 <b>${wan(bF)}</b>，租房投资${esc(nm)}的你约 <b style="color:var(--s-inv)">${wan(rF)}</b>，${bF>=rF?'买房多':'租房投资多'} <b>${wan(Math.abs(bF-rF))}</b>。` +
    (isFinite(g) ? ` 房价要每年至少 <b>${g>=0?'涨':'跌不超过'} ${pct(Math.abs(g),1)}</b>，买房才跑得赢。` : g===-Infinity ? ' 这组假设下，房价怎么跌买房都更划算。' : ' 这组假设下，房价每年涨 25% 也跑不赢。');
  $('#cmp-kpis').innerHTML = `
    <div class="kpi"><div class="k">首月月供</div><div class="v">${yuan(r.pay1)}</div></div>
    <div class="kpi"><div class="k">${c.horizon}年付的利息</div><div class="v" style="color:var(--s-buy)">${wan(r.intSum)}</div></div>
    <div class="kpi"><div class="k">${c.horizon}年付的房租</div><div class="v" style="color:var(--s-inv)">${wan(r.rentSum)}</div></div>`;
  lineChart($('#cmp-chart'), {series:[{name:'买房',color:'var(--s-buy)',data:r.buy},{name:'租房+投资',color:'var(--s-inv)',data:r.rent}], band, xLabel:(i,short)=> short?`${Math.round((i+1)/12)}年`:`第 ${Math.floor(i/12)+1} 年第 ${i%12+1} 个月`, xTick:i=>(i+1)%(c.horizon>15?60:c.horizon>8?24:12)===0, height:280});
  const marks = []; for(let y=5;y<=c.horizon;y+=5) marks.push(y); if(marks[marks.length-1]!==c.horizon) marks.push(c.horizon);
  $('#cmp-table').innerHTML = `<thead><tr><th>第几年</th><th>房价</th><th>剩余贷款</th><th>买房净资产</th><th>投资账户</th><th>差额</th></tr></thead><tbody>${marks.map(y=>{ const row=r.rows[y*12-1]; const d=row.eq-row.port; return `<tr class="${y===c.horizon?'hl':''}"><td>${y}</td><td>${wan(row.hv)}</td><td>${wan(row.bal)}</td><td>${wan(row.eq)}</td><td>${wan(row.port)}</td><td style="color:${d>=0?'var(--s-buy)':'var(--s-inv)'}">${d>=0?'买房 +':'投资 +'}${wan(Math.abs(d))}</td></tr>`; }).join('')}</tbody>`;
  save();
}
