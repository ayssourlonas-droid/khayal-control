/* 人生页：每月流水、还款进度、平行宇宙、更多操作（提前还款、卖房）、钱不够时的选择。 */
import { avatarSVG } from '../art/scenes.js';
import { START_Y, ymOf, ymText } from '../core/calendar.js';
import { CHOICES, debtBalance, drawChoices, equityNow, logEv, mortBalance, newDebt, rentEqAt, saleQuote, setShortage, stepMonth, worlds } from '../core/engine.js';
import { annuity, loanDue, loanReset, payroll } from '../core/finance.js';
import { clamp, esc, makeRng, pct, signYuan, wan, yuan } from '../core/util.js';
import { ASSETS, PLATFORMS, assetById, cityById, platById } from '../data/index.js';
import { charts, lineChart } from './charts.js';
import { $, $$ } from './dom.js';
import { term } from './help.js';
import { askVals, openAsk, render, toast } from './shell.js';
import { UI, save, store } from './state.js';
/* ============================================================
   人生（按月还贷）
   ============================================================ */
export function moodOf(s){ return s<25?'岁月静好':s<45?'略有压力':s<65?'压力山大':s<85?'濒临崩溃':'原地爆炸'; }
export function renderLife(){
  charts.list = [];
  const g = store.G, city = cityById(g.cfg.cityId), S = g.st, L = g.L;
  const v = $('#v-life');
  const mort = mortBalance(g), debt = debtBalance(g);
  const due = g.loans.map(loanDue); const nextPay = due.reduce((s,d)=>s+d.total,0), nextInt = due.reduce((s,d)=>s+d.int,0);
  const dateTxt = g.t>0 ? ymText(g.t) : '刚签完合同';
  const H = g.horizon;
  const net = g.last ? g.last.netIncome : payroll(g.salary, city, g.cfg.gjjPct, 1000).net + (g.married?payroll(g.spouseSalary,city,g.cfg.gjjPct,0).net:0);
  const dayPay = net/30;
  const lastPay = g.last ? g.last.mortDue : nextPay, lastInt = g.last ? g.last.intPart : nextInt;
  const days = dayPay>0 ? lastPay/dayPay : 30, idays = dayPay>0 ? lastInt/dayPay : 0;
  const W = worlds(g, assetById(UI.asset), false); const w = W[W.length-1];
  const buyNow = g.cash + g.gjjBal + equityNow(g);
  const rentNow = w ? w.rent : g.cash + g.gjjBal + g.cmp.invest0;
  const status = !g.house.movedIn ? (g.house.deliverLeft>0 ? `等交房 · 还剩 ${g.house.deliverLeft} 个月` : `装修中 · 还剩 ${g.house.renoLeft} 个月`) : '已入住';
  v.innerHTML = `
  <div class="life-cols">
  <div class="stack">
    <div class="card hud">
      <div class="avatar">${avatarSVG(S)}</div>
      <div class="hud-main">
        <div class="date-line"><span class="d">${dateTxt}</span><span class="small muted num">${g.hadLoan?`第 ${Math.min(g.t,H)}/${H} 期`:`全款 · 第 ${g.t} 个月`}</span></div>
        <div class="meter stress" role="meter" aria-label="压力值" aria-valuenow="${Math.round(S.stress)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${S.stress}%"></i></div>
        <div class="row between small"><span>压力 <b class="num">${Math.round(S.stress)}</b> · ${moodOf(S.stress)}</span><span class="muted">${L.name} · ${status}</span></div>
      </div>
    </div>
    <div class="stat-grid">
      <div class="stat"><div class="k">现金</div><div class="v" style="color:${g.cash<0?'var(--warn)':'var(--ink)'}">${wan(g.cash)}</div></div>
      <div class="stat"><div class="k">还欠银行</div><div class="v">${wan(mort)}</div></div>
      <div class="stat"><div class="k">房子估值 <span class="${g.house.value>=L.total?'delta-up':'delta-down'}">${g.house.value>=L.total?'▲':'▼'}${pct(Math.abs(g.house.value/L.total-1)*100)}</span></div><div class="v">${wan(g.house.value)}</div></div>
      <div class="stat"><div class="k">${debt>0?'其他借款':'公积金账户'}</div><div class="v" style="color:${debt>0?'var(--warn)':'var(--ink)'}">${wan(debt>0?debt:g.gjjBal)}</div></div>
    </div>
    ${receiptHTML(g, nextPay, nextInt)}
    <div class="card stack">
      <div class="workdays">
        <div><div class="big">${days>=30?'30+':Math.round(days)}</div><div class="small muted">天</div></div>
        <div class="stack-s" style="flex:1;min-width:0"><b>${g.t>0?'上个月':'每个月'}，你有 ${days>=30?'一整个月':Math.round(days)+' 天'}在给银行打工</b><span class="small muted">其中 ${Math.round(Math.min(idays,30))} 天的工资只够付利息（按税后日薪 ${yuan(dayPay)} 算）</span></div>
      </div>
      <div class="cal" aria-hidden="true">${Array.from({length:30},(_,i)=>`<i class="${i<Math.round(Math.min(idays,30))?'b':i<Math.round(Math.min(days,30))?'p':''}"></i>`).join('')}</div>
      <div class="legend"><span><i style="background:var(--s-buy)"></i>付利息</span><span><i style="background:var(--s-inv)"></i>还本金</span><span><i style="background:var(--paper-2);border:1px solid var(--line)"></i>归你自己</span></div>
    </div>
  </div>
  <div class="stack">
    <div class="card stack">
      <div class="row between"><h3>这个月顺手做点什么？</h3><span class="tiny muted">可不选，下个月结算</span></div>
      <div class="choices">${(g.choices.length?g.choices:drawChoices(g, makeRng(g.t+7))).map(id=>{ const c=CHOICES.find(x=>x.id===id); return `<button class="choice" data-choice="${c.id}" aria-pressed="${g.chosen===c.id}"><span class="ct">${c.t}</span><span class="ce">${c.id==='room'?`每月+${yuan(Math.round(rentEqAt(g,g.t+1)*0.35/50)*50)} · 幸福-6`:c.e}</span></button>`; }).join('')}</div>
    </div>
    ${g.hadLoan ? monthsGridHTML(g) : ''}
    <div class="card stack">
      <div class="row between"><h3>平行宇宙：如果当初没买</h3><button class="btn sm ghost" data-act="tab-compare">详细对比 →</button></div>
      <p class="small muted">另一个你租同样的房子（${yuan(rentEqAt(g,Math.max(1,g.t)))}/月），把首付、税费和每月"月供−房租"的差额全投进 <b>${assetById(UI.asset).name}</b>（假设年化 ${assetById(UI.asset).R}%）。</p>
      <div class="seg" id="seg-asset-life">${ASSETS.map(a=>`<button data-asset="${a.id}" aria-pressed="${UI.asset===a.id}">${a.name}</button>`).join('')}</div>
      <div class="pu">
        <div class="w"><div class="k"><span class="sw" style="background:var(--s-buy)"></span>买房的你 · 净资产</div><div class="v">${wan(buyNow)}</div></div>
        <div class="w"><div class="k"><span class="sw" style="background:var(--s-inv)"></span>租房投资的你</div><div class="v">${wan(rentNow)}</div></div>
      </div>
      <p class="small">${buyNow>=rentNow?`目前买房领先 <b class="num delta-up">${wan(buyNow-rentNow)}</b>`:`目前租房投资领先 <b class="num" style="color:var(--s-inv)">${wan(rentNow-buyNow)}</b>`}。净资产${term('networth')} = 现金 + 公积金 + 房子按估值卖掉扣 2% 费用后还清贷款剩的钱（或投资账户）。</p>
      ${g.hist.length>2 ? `<div class="chart" id="mini-chart"></div>` : ''}
    </div>
    <div class="card stack">
      <h3>身体和心情</h3>
      ${barRow('发量', S.hair, '压力超过 55 就开始掉')}
      ${barRow('幸福感', S.happy)}
      ${barRow('健康', S.health)}
      <div class="row small" style="gap:8px"><span class="muted">征信${term('credit')}</span>${g.overdueEver?`<span class="tag warn">有逾期 ${g.overdueEver} 次</span>`:'<span class="tag">良好</span>'}${g.netEver?'<span class="tag warn">有网贷记录</span>':''}${g.married?'<span class="tag">已婚</span>':''}${g.kids?`<span class="tag">娃×${g.kids}</span>`:''}${g.cat?'<span class="tag">有猫</span>':''}${g.car?'<span class="tag">有车</span>':''}${!g.employed?'<span class="tag warn">待业中</span>':''}</div>
    </div>
    <div class="card stack">
      <h3>大事记</h3>
      <div class="loglist">${g.log.length? g.log.slice(0,12).map(l=>`<div><time>${l.t>0?ymText(l.t).replace('年','.').replace('月',''):'签约'}</time><span style="color:${l.tone==='bad'?'var(--warn)':l.tone==='good'?'var(--plus)':'var(--ink-2)'}">${esc(l.text)}</span></div>`).join('') : '<p class="small muted">还没发生什么。点"下个月"开始还第一期。</p>'}</div>
    </div>
  </div>
  </div>`;
  $('#action-bar').innerHTML = `<div class="in"><button class="btn primary" data-act="next" ${UI.busy?'disabled':''}>下个月 →</button><button class="btn dark" data-act="year" ${UI.busy?'disabled':''}>快进一年</button><button class="btn" data-act="more" aria-label="更多操作" ${UI.busy?'disabled':''}>更多</button></div>`;
  if(g.hist.length>2){
    const a = assetById(UI.asset); const W2 = worlds(g, a, false);
    lineChart($('#mini-chart'), {series:[{name:'买房',color:'var(--s-buy)',data:W2.map(x=>x.buy)},{name:'租房+'+a.name,color:'var(--s-inv)',data:W2.map(x=>x.rent)}], xLabel:i=>ymText(W2[i].t), height:180, compact:true});
  }
}
export function barRow(k, val, hint){ return `<div class="stack-s"><div class="row between small"><span>${k}</span><span class="num">${Math.round(val)}/100</span></div><div class="meter"><i style="width:${clamp(val,0,100)}%;background:${val<30?'var(--warn)':'var(--ink-2)'}"></i></div>${hint?`<span class="hint">${hint}</span>`:''}</div>`; }
export function receiptHTML(g, nextPay, nextInt){
  if(!g.last){
    const city = cityById(g.cfg.cityId);
    return `<div class="receipt"><div class="receipt-head"><span class="t">购房合同</span><span class="small muted num">${START_Y}.10</span></div>
      <div class="rline"><span class="n">${g.L.name}（${g.L.district}，${g.L.area}㎡）</span><span class="a">${yuan(g.L.total)}</span></div>
      <div class="rline"><span class="n">首付 ${g.planSnap.down}%</span><span class="a">${yuan(g.planSnap.downAmt)}</span></div>
      <div class="rline"><span class="n">税费杂费</span><span class="a">${yuan(g.planSnap.fees)}</span></div>
      ${g.hadLoan?`<div class="rline"><span class="n">贷款 ${g.planSnap.years} 年 · ${g.planSnap.bank}<small>${g.planSnap.method==='ei'?'等额本息':'等额本金'} · 商贷 ${g.planSnap.comRate}%</small></span><span class="a">${yuan(g.planSnap.loanTotal)}</span></div>
      <div class="rline sum"><span class="n">第 1 期（${ymText(1)}）应还</span><span class="a">${yuan(nextPay)}</span></div>`:`<div class="rline sum"><span class="n">全款，不欠银行</span><span class="a">✓</span></div>`}
      <div class="stamp pop">已签约</div></div>`;
  }
  const R = g.last;
  return `<div class="receipt print" aria-live="polite"><div class="receipt-head"><span class="t">${ymOf(R.t).m}月 账户流水</span><span class="small muted num">${ymText(R.t)}</span></div>
    ${R.lines.map(([n,a,note])=>`<div class="rline ${a>0?'in':''}"><span class="n">${esc(n)}${note?`<small>${esc(note)}</small>`:''}</span><span class="a">${a===0?'—':signYuan(a)}</span></div>`).join('')}
    <div class="rline sum"><span class="n">本月结余</span><span class="a" style="color:${R.total>=0?'var(--plus)':'var(--ink)'}">${signYuan(R.total)}</span></div>
    <div class="rline"><span class="n small">账户余额</span><span class="a">${yuan(g.cash)}</span></div>
    ${g.hadLoan&&mortBalance(g)>0?`<div class="rline"><span class="n small">下期应还（利息占 ${pct(nextPay>0?nextInt/nextPay*100:0,0)}）</span><span class="a">${yuan(nextPay)}</span></div>`:''}
    <div class="stamp pop">${R.skipped?'逾 期':'已扣款'}</div></div>`;
}
export function monthsGridHTML(g){
  const n = g.horizon; const cols = Math.ceil(n/12);
  const cells = [];
  for(let i=1;i<=cols*12;i++){
    if(i>n){ cells.push('<i style="visibility:hidden"></i>'); continue; }
    const h = g.hist[i-1];
    if(h){ if(h.skip) cells.push('<i class="late"></i>'); else if(h.pay>0){ const s=h.intShare; cells.push(`<i class="paid" style="background:color-mix(in oklab, var(--s-buy) ${Math.round(s*100)}%, var(--s-inv))"></i>`); } else cells.push('<i class="paid" style="background:var(--line)"></i>'); }
    else if(i===g.t+1 && mortBalance(g)>0) cells.push('<i class="cur"></i>');
    else if(mortBalance(g)<=0) cells.push('<i style="opacity:.3"></i>');
    else cells.push('<i></i>');
  }
  const paidInt = g.tot.int, paidPrin = g.tot.prin;
  const startY = ymOf(1).y, endY = ymOf(n).y;
  return `<div class="card stack">
    <div class="row between"><h3>${n} 期还款进度 ${term('interest')}</h3><span class="small muted num">${g.t}/${n}</span></div>
    <div style="overflow-x:auto"><div class="months" style="grid-template-columns:repeat(${cols},minmax(6px,1fr));min-width:${cols*8}px" aria-label="每列一年，每格一个月">${cells.join('')}</div></div>
    <div class="row between tiny muted num"><span>${startY}</span><span>每列 = 1 年</span><span>${endY}</span></div>
    <div class="legend"><span><i style="background:var(--s-buy)"></i>越红：当月月供里利息越多</span><span><i style="background:var(--s-inv)"></i>越蓝：本金越多</span><span><i style="background:var(--warn)"></i>逾期</span></div>
    <p class="small">已还 <b class="num">${yuan(paidPrin+paidInt)}</b>，其中利息 <b class="num" style="color:var(--s-buy)">${yuan(paidInt)}</b>（${paidPrin+paidInt>0?pct(paidInt/(paidPrin+paidInt)*100,0):'0%'}）。前几年的月供，大头都是利息。</p>
  </div>`;
}

/* ---------- 推进时间 ---------- */
export async function runMonths(k){
  if(UI.busy || !store.G || store.G.ended) return;
  UI.busy = true; $$('#action-bar button').forEach(b=>b.disabled=true);
  try{
    for(let i=0;i<k;i++){
      const res = await stepMonth(store.G);
      if(store.G.justMoved){ store.G.justMoved=false; await openAsk({icon:'key',tone:'good',title:'搬进新家',text:`${store.G.L.name}，${store.G.L.area}㎡。从今天起不用再交房租，开始交物业费（${yuan(Math.round(store.G.L.area*(store.G.L.fee ?? cityById(store.G.cfg.cityId).fee)))}/月）。`,options:[{id:'ok',label:'开心',cls:'primary'}]}); }
      if(res==='sold' || res==='end' || store.G.ended) break;
      const {m} = ymOf(store.G.t);
      if(m===12){ const yr = ymOf(store.G.t).y; const hs = store.G.hist.filter(h=>ymOf(h.t).y===yr); const paid = hs.reduce((s,h)=>s+h.pay,0); const ints = hs.reduce((s,h)=>s+h.pay*h.intShare,0); if(paid>0) toast(`${yr} 年账单：还房贷 ${yuan(paid)}，其中利息 ${yuan(ints)}`, 3200); }
      if(k>1){ UI.busy=false; renderLife(); UI.busy=true; $$('#action-bar button').forEach(b=>b.disabled=true); await new Promise(r=>setTimeout(r, 90)); }
    }
  } finally {
    UI.busy = false; save(); render(); if(store.G && store.G.ended) window.scrollTo({top:0});
  }
}

/* 钱不够 */
setShortage(async (g, need, label, canSkip)=>{
  while(g.cash < need - 0.5){
    const gap = need - g.cash;
    g.borrowed = g.borrowed || {};
    const q = saleQuote(g);
    const opts = PLATFORMS.map(p=>{
      const amt = Math.ceil(gap/(p.kind==='illegal'?0.7:1)/p.step)*p.step;
      const room = p.max - (g.borrowed[p.id]||0);
      const credit = (p.kind==='bank' && (g.overdueEver>0 || g.netEver)) ? '征信有网贷/逾期记录，银行不批' : (p.kind==='family' && (g.borrowed.family||0)>0 && g.debts.some(d=>d.id==='family')) ? '上次借的还没还完，不好意思再开口' : '';
      const pay = p.apr===0?amt/p.term:annuity(amt,p.apr,p.term);
      return {id:'p:'+p.id, label:`${p.name}：借 ${yuan(amt)}`, sub: credit || (amt>room ? `额度不够（最多还能借 ${yuan(Math.max(0,room))}）` : `年化 ${p.apr}% · ${p.term} 期 · 以后每月多还 ${yuan(pay)}`), disabled: !!credit || amt>room, cls: p.kind==='illegal'?'danger':''};
    });
    if(canSkip) opts.push({id:'skip', label: label==='装修款'?'先不装修，凑合住':'这个月先不还（逾期）', sub: label==='装修款'?'幸福-10':'征信留污点；连续逾期 3 个月，银行起诉、法拍房子', cls:'danger'});
    opts.push({id:'sell', label:'卖房止损', sub:`按估值挂牌，扣掉税费和贷款，到手约 ${wan(q.net)}`});
    const c = await openAsk({icon:'warn', tone:'bad', title:`${label}还差 ${yuan(gap)}`, text:`需要 ${yuan(need)}，账户里只有 ${yuan(g.cash)}${g.gjjBal>0?`（公积金余额 ${yuan(g.gjjBal)} 已自动抵扣）`:''}。怎么办？`, options:opts});
    if(c==='skip') return 'skip';
    if(c==='sell'){ finalizeSale(g, true); return 'sold'; }
    const p = platById(c.slice(2)); const amt = Math.ceil(gap/(p.kind==='illegal'?0.7:1)/p.step)*p.step;
    const d = newDebt(p, amt); d.fresh = true; g.debts.push(d);
    const recv = p.kind==='illegal' ? amt*0.7 : amt;
    g.cash += recv; g.borrowed[p.id] = (g.borrowed[p.id]||0)+amt; g.cmp.borrowNow = (g.cmp.borrowNow||0)+recv;
    (g._lines = g._lines||[]).push([`${p.name}借款到账`, recv, p.kind==='illegal'?`借 ${yuan(amt)}，砍头息 30%`:`年化 ${p.apr}%`]);
    if(['p2p','illegal','consumer'].includes(p.kind)) g.netEver = 1;
    logEv(g, `为了${label}，从${p.name}借了 ${yuan(amt)}`, p.apr>=10?'bad':'');
  }
  return 'paid';
});
export function finalizeSale(g, forced){
  const q = saleQuote(g);
  g.cash += q.net; g.loans.forEach(l=>{l.balance=0;l.left=0;}); g.debts=[];
  g.ended = {type:'sold', q, forced};
}

/* 更多操作 */
export async function moreMenu(){
  const g = store.G; const mort = mortBalance(g), debt = debtBalance(g);
  const c = await openAsk({title:'更多操作', options:[
    {id:'prepay', label:'提前还房贷', sub: mort>0?`剩余本金 ${wan(mort)}，现金 ${wan(g.cash)}`:'房贷已还清', disabled: mort<=0 || g.cash<10000},
    {id:'repay', label:'还清其他借款', sub: debt>0?`网贷/消费贷/亲友借款共 ${wan(debt)}`:'没有其他借款', disabled: debt<=0},
    {id:'sell', label:'卖掉房子', sub:'按估值挂牌出售，结束这一局'},
    {id:'quit', label:'到此为止，看结算', sub:'不卖房，直接看现在的成绩单'},
    {id:'lvl2', label:'去玩第二关：日常消费', sub:'这一局会保留，随时回来'},
    {id:'restart', label:'重新开局', sub:'放弃这一局，回到选城市', cls:'danger'},
    {id:'x', label:'取消'},
  ]});
  if(c==='lvl2'){ UI.level='spend'; save(); render(); window.scrollTo({top:0}); return; }
  if(c==='prepay') return prepayFlow();
  if(c==='repay') return repayFlow();
  if(c==='sell'){
    const q = saleQuote(g);
    const ok = await openAsk({icon:'gavel', title:'卖房清算', text:`估值 ${yuan(q.v)}，中介费 ${yuan(q.agent)}${q.vat?`，增值税 ${yuan(q.vat)}（不满 2 年）`:''}${q.it?`，个税 ${yuan(q.it)}`:''}，还清房贷 ${yuan(q.mort)}${q.debt?` 和其他借款 ${yuan(q.debt)}`:''}，到手 <b>${yuan(q.net)}</b>。`, options:[{id:'yes',label:'确认卖出',cls:'primary'},{id:'no',label:'再想想'}]});
    if(ok==='yes'){ finalizeSale(g,false); save(); render(); window.scrollTo({top:0}); }
    return;
  }
  if(c==='quit'){ g.ended = {type:'quit'}; save(); render(); window.scrollTo({top:0}); return; }
  if(c==='restart'){ const ok = await openAsk({title:'确定放弃这一局？', text:'进度会清空。', options:[{id:'yes',label:'重新开始',cls:'primary'},{id:'no',label:'取消'}]}); if(ok==='yes'){ store.G=null; UI.stage='start'; UI.listings=null; UI.pick=null; UI.ctl=null; save(); render(); window.scrollTo({top:0}); } }
}
export async function prepayFlow(){
  const g = store.G; const loans = g.loans.filter(l=>l.balance>0);
  const L0 = loans.find(l=>l.kind==='com') || loans[0];
  const maxAmt = Math.floor(Math.min(g.cash, L0.balance)/10000)*10000;
  const body = `<div class="field"><label for="pp-amt">提前还 <span class="num" id="pp-o"></span></label><input type="range" id="pp-amt" data-k="amt" min="10000" max="${Math.max(10000,maxAmt)}" step="10000" value="${Math.min(maxAmt, 100000)}"></div>
    <div class="field"><span class="lab">还完之后</span><div class="seg" id="pp-mode"><button data-k="mode" data-val="short" aria-pressed="true">月供不变，缩短年限</button><button data-val="less" aria-pressed="false">年限不变，减少月供</button></div></div>
    <p class="small" id="pp-res"></p>`;
  const calc = (amt, mode)=>{
    const before = L0.method==='ep' ? L0.balance*L0.rate/1200*(L0.left+1)/2 : annuity(L0.balance,L0.rate,L0.left)*L0.left - L0.balance;
    const B = L0.balance - amt; if(B<=0) return {save:before, txt:'直接还清这笔贷款'};
    let n = L0.left, pay;
    if(mode==='short'){ if(L0.method==='ep'){ n = Math.ceil(B/L0.basePrin); } else { const r=L0.rate/1200; const P0=annuity(L0.balance,L0.rate,L0.left); n = Math.ceil(-Math.log(1-r*B/P0)/Math.log(1+r)); } }
    const after = L0.method==='ep' ? B*L0.rate/1200*(n+1)/2 : annuity(B,L0.rate,n)*n - B;
    pay = L0.method==='ep' ? B/n + B*L0.rate/1200 : annuity(B,L0.rate,n);
    return {save: before-after, n, pay};
  };
  const c = await openAsk({icon:'bank', title:`提前还${L0.name}`, text:`剩余本金 ${yuan(L0.balance)}，还剩 ${L0.left} 期，年利率 ${L0.rate}%。`, body, options:[{id:'ok',label:'还款',cls:'primary'},{id:'x',label:'取消'}], mount(sh){
    const amtIn = $('#pp-amt',sh), seg = $('#pp-mode',sh);
    const upd = ()=>{ const amt=+amtIn.value; const mode = $('[aria-pressed="true"]',seg).dataset.val; const r = calc(amt,mode); $('#pp-o',sh).textContent = yuan(amt); $('#pp-res',sh).innerHTML = r.n ? `预计少付利息 <b class="num" style="color:var(--plus)">${yuan(r.save)}</b>；之后月供 <b class="num">${yuan(r.pay)}</b>，还剩 <b class="num">${r.n}</b> 期。` : `${r.txt}，少付利息 <b class="num" style="color:var(--plus)">${yuan(r.save)}</b>。`; };
    seg.addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; $$('button',seg).forEach(x=>{ x.setAttribute('aria-pressed', String(x===b)); x.removeAttribute('data-k'); }); b.dataset.k='mode'; upd(); });
    amtIn.addEventListener('input', upd); upd();
  }});
  if(c!=='ok') return;
  const amt = Math.min(+askVals.amt, g.cash, L0.balance); const mode = askVals.mode || 'short';
  const r = calc(amt, mode);
  g.cash -= amt; L0.balance -= amt; g.tot.prepay += amt; g.tot.prin += amt; L0.paidPrin += amt;
  if(L0.balance<=0.5){ L0.balance=0; L0.left=0; } else { if(mode==='short') L0.left = r.n; loanReset(L0); }
  if(g.cmp.contribs.length) g.cmp.contribs[g.cmp.contribs.length-1] += amt; else g.cmp.invest0 += amt;
  if(g.hist.length){ const h=g.hist[g.hist.length-1]; h.cash=g.cash; h.mort=mortBalance(g); }
  logEv(g, `提前还款 ${yuan(amt)}，预计少付利息 ${yuan(r.save)}`, 'good'); g.st.stress = Math.max(0, g.st.stress-5);
  if(g.hadLoan && mortBalance(g)<=0.5) g.ended = {type:'payoff'};
  save(); render();
}
export async function repayFlow(){
  const g = store.G; const ds = g.debts.filter(d=>d.balance>0);
  const c = await openAsk({title:'还清哪一笔？', text:`现金 ${yuan(g.cash)}`, options:[...ds.map((d,i)=>({id:String(i), label:`${d.name}：${yuan(d.balance)}`, sub:`年化 ${d.apr}%，还剩 ${d.left} 期`, disabled: g.cash < d.balance})), {id:'x',label:'取消'}]});
  if(c==='x'||c==null) return;
  const d = ds[+c]; g.cash -= d.balance; if(g.cmp.contribs.length) g.cmp.contribs[g.cmp.contribs.length-1] += d.balance; else g.cmp.invest0 += d.balance;
  logEv(g, `还清了${d.name} ${yuan(d.balance)}`, 'good'); d.balance = 0; g.debts = g.debts.filter(x=>x.balance>0);
  if(g.hist.length){ const h=g.hist[g.hist.length-1]; h.cash=g.cash; h.debt=debtBalance(g); }
  save(); render();
}
