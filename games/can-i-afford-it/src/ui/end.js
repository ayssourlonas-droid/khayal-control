/* 结局页。 */
import { aboutLinksHTML } from './about.js';
import { avatarSVG } from '../art/scenes.js';
import { ymText } from '../core/calendar.js';
import { debtBalance, mortBalance, worlds } from '../core/engine.js';
import { pct, trimZ, wan, yuan } from '../core/util.js';
import { ASSETS, assetById, cityById } from '../data/index.js';
import { charts, lineChart } from './charts.js';
import { $ } from './dom.js';
import { UI, store } from './state.js';
import { levelSegHTML } from './spend.js';

/* ============================================================
   结局
   ============================================================ */
export function renderEnd(){
  charts.list = [];
  const g = store.G, E = g.ended, city = cityById(g.cfg.cityId), S = g.st;
  const totalPaid = g.tot.mortPaid + g.tot.prepay;
  const avgNet = g.hist.length ? g.hist.reduce((s,h)=>s+h.net,0)/g.hist.length : 1;
  const bankYears = avgNet>0 ? totalPaid/avgNet/12 : 0;
  let title, badge, text;
  const years = trimZ((g.t/12).toFixed(1));
  if(E.type==='payoff'){ title='上岸了'; badge='房贷还清'; text=`从 ${ymText(1)} 到 ${ymText(g.t)}，${years} 年，你一共还给银行 ${yuan(totalPaid)}，其中利息 ${yuan(g.tot.int)}。房产证终于干干净净。`; }
  else if(E.type==='foreclose'){ const auction=g.house.value*0.7, legal=auction*0.05, rest=auction-legal-mortBalance(g)-debtBalance(g); title='房子被法拍了'; badge='断供'; text=`连续 3 个月没还上房贷，银行起诉。房子按估值七折拍出 ${yuan(auction)}，扣掉诉讼费、还完贷款和借款，${rest>=0?`剩下 ${yuan(rest)}`:`还倒欠 ${yuan(-rest)}`}。征信进了黑名单，几年内很难再贷款。`; E.rest = rest; }
  else if(E.type==='sold'){ title = E.forced?'被迫卖房':'卖房离场'; badge = E.q.net + 0 > g.planSnap.upfront ? '赚钱离场' : '割肉离场'; text=`第 ${g.t} 个月以 ${yuan(E.q.v)} 卖出（买入 ${yuan(g.L.total)}），扣掉税费、还清贷款后到手 ${yuan(E.q.net)}。当初掏出的首付税费装修是 ${yuan(g.planSnap.upfront)}。`; }
  else if(E.type==='horizon'){ title=`${years} 年过去了`; badge='全款人生'; text=`没有房贷的 ${years} 年。房子现在估值 ${yuan(g.house.value)}。`; }
  else { title='阶段性成绩单'; badge='房奴进行中'; text=`还了 ${g.t} 期，还欠银行 ${yuan(mortBalance(g))}。`; }
  const titles = [];
  if(city.id==='hg') titles.push('鹤岗躺平王');
  if(S.hair<30) titles.push('秃头房奴'); else if(S.hair>85 && g.t>24) titles.push('发量守护者');
  if(g.tot.platInt>30000) titles.push('网贷养房人');
  if(E.type==='payoff' && g.t < g.horizon*0.7) titles.push('提前上岸王');
  if(g.overdueEver===0 && E.type!=='foreclose' && g.t>12) titles.push('零逾期');
  if(g.kids>=2) titles.push('二胎房奴');
  const a = assetById(UI.asset);
  const W = worlds(g, a, UI.vol); const w = W[W.length-1] || {buy:0, rent:0};
  let buyFinal = w.buy, rentFinal = w.rent;
  if(E.type==='sold'){ buyFinal = g.cash + g.gjjBal; }
  if(E.type==='foreclose'){ buyFinal = g.cash + g.gjjBal + (E.rest||0); }
  const v = $('#v-end');
  v.innerHTML = `
  ${levelSegHTML()}
  <div class="card stack ending">
    <div class="row" style="gap:16px"><div class="avatar">${avatarSVG(S)}</div><div class="stack-s"><span class="titlebadge">${badge}</span><h1>${title}</h1></div></div>
    <p class="answer">${text}</p>
    ${titles.length?`<div class="row" style="gap:6px">${titles.map(t=>`<span class="tag red">${t}</span>`).join('')}</div>`:''}
  </div>
  <div class="kpis">
    <div class="kpi"><div class="k">还给银行</div><div class="v">${wan(totalPaid)}</div></div>
    <div class="kpi"><div class="k">其中利息</div><div class="v" style="color:var(--s-buy)">${wan(g.tot.int)}</div></div>
    <div class="kpi"><div class="k">为银行打工</div><div class="v">${trimZ(bankYears.toFixed(1))} 年</div></div>
    <div class="kpi"><div class="k">网贷/借款利息</div><div class="v">${wan(g.tot.platInt)}</div></div>
    <div class="kpi"><div class="k">房价变化</div><div class="v ${g.house.value>=g.L.total?'delta-up':'delta-down'}">${g.house.value>=g.L.total?'+':''}${pct((g.house.value/g.L.total-1)*100)}</div></div>
    <div class="kpi"><div class="k">剩余发量</div><div class="v">${Math.round(S.hair)}%</div></div>
  </div>
  <div class="card stack">
    <h3>平行宇宙的你</h3>
    <p class="small muted">同样的工资、同样的意外，只是没买房：租同类房子，把首付税费和每月"月供−房租"的差额投进下面选的品种。</p>
    <div class="seg" id="seg-asset-end">${ASSETS.map(x=>`<button data-asset="${x.id}" aria-pressed="${UI.asset===x.id}">${x.name} ${x.R}%</button>`).join('')}</div>
    <label class="check"><input type="checkbox" id="in-vol-end" ${UI.vol?'checked':''}><span>加入市场波动（会有大涨大跌的年份）</span></label>
    <div class="pu">
      <div class="w"><div class="k"><span class="sw" style="background:var(--s-buy)"></span>买房的你</div><div class="v">${wan(buyFinal)}</div></div>
      <div class="w"><div class="k"><span class="sw" style="background:var(--s-inv)"></span>租房+${a.name}</div><div class="v">${wan(rentFinal)}</div></div>
    </div>
    <p class="answer">${buyFinal>=rentFinal?`买房多出 <b>${wan(buyFinal-rentFinal)}</b>。`:`没买房的你多出 <b style="color:var(--s-inv)">${wan(rentFinal-buyFinal)}</b>。`}</p>
    <div class="chart" id="end-chart"></div>
    <div class="legend"><span><span class="ln" style="border-color:var(--s-buy)"></span>买房：净资产</span><span><span class="ln" style="border-color:var(--s-inv)"></span>租房+投资：净资产</span></div>
  </div>
  ${aboutLinksHTML()}
  <div class="row"><button class="btn primary" data-act="again">同样设置再来一局</button><button class="btn" data-act="newcity">换个城市</button><button class="btn ghost" data-act="tab-compare">按自己的假设算一算 →</button></div>`;
  if(W.length>1) lineChart($('#end-chart'), {series:[{name:'买房',color:'var(--s-buy)',data:W.map(x=>x.buy)},{name:'租房+'+a.name,color:'var(--s-inv)',data:W.map(x=>x.rent)}], xLabel:i=>ymText(W[i].t), height:240});
}
