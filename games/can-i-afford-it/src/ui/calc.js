/* 房贷计算器页。 */
import { annuity, combinedSchedule, schedule } from '../core/finance.js';
import { pct, wan, yuan } from '../core/util.js';
import { CARD, GJJ_RATE, LPR5 } from '../data/index.js';
import { aprOf, revolveAPR } from '../core/spend.js';
import { barChart, charts } from './charts.js';
import { $ } from './dom.js';
import { methodExplainHTML, term } from './help.js';
import { UI, save } from './state.js';

/* ============================================================
   房贷计算器
   ============================================================ */
export function renderCalc(){
  if(UI.calcMode==='card') return renderCardCalc();
  if(!UI.calc) UI.calc = {com:1000000, comRate:3.05, gjj:0, gjjRate:2.6, years:30, method:'ei', ppYear:5, ppAmt:200000};
  const c = UI.calc;
  const v = $('#v-calc');
  v.innerHTML = `
  ${calcModeSeg()}
  <div class="stack-s"><span class="eyebrow">房贷计算器</span><h2>每个月还多少，利息一共多少</h2><p class="small muted">商贷按 LPR ${LPR5}% 减点（首套常见 3.05%），公积金首套 ${GJJ_RATE}%。支持组合贷和提前还款。</p></div>
  <div class="card stack">
    <div class="grid2">
      ${calcNum('com','商业贷款金额')}
      ${calcRange('comRate','商贷年利率',2,6,0.05,'%')}
      ${calcNum('gjj','公积金贷款金额')}
      ${calcRange('gjjRate','公积金年利率',2,4,0.05,'%')}
      ${calcRange('years','贷款年限',1,30,1,' 年')}
      <div class="field"><span class="lab"><span>还款方式 ${term('method')}</span></span><div class="seg" id="seg-calc-method"><button data-cmethod="ei" aria-pressed="${c.method==='ei'}">等额本息</button><button data-cmethod="ep" aria-pressed="${c.method==='ep'}">等额本金</button></div></div>
    </div>
    <div id="calc-explain" class="stack-s"></div>
  </div>
  <div class="card stack">
    <div class="kpis" id="calc-kpis"></div>
    <div class="tbl-wrap"><table class="tbl fit" id="calc-vs"></table></div>
    <h3>每年还的钱里，多少是利息</h3>
    <div class="chart" id="calc-chart"></div>
    <div class="legend"><span><i style="background:var(--s-inv)"></i>本金</span><span><i style="background:var(--s-buy)"></i>利息</span></div>
  </div>
  <div class="card stack">
    <h3>提前还款</h3>
    <div class="grid2">${calcRange('ppYear','第几年末还',1,29,1,' 年')}${calcNum('ppAmt','提前还多少（商贷）')}</div>
    <div id="calc-pp"></div>
  </div>
  <div class="card stack">
    <h3>逐年明细</h3>
    <div class="tbl-wrap" style="max-height:360px;overflow:auto"><table class="tbl" id="calc-table"></table></div>
  </div>`;
  updateCalc();
}
export function calcNum(k,label){ return `<div class="field"><label for="calc-${k}">${label}</label><div class="inp-wrap"><input class="inp num" id="calc-${k}" data-calc="${k}" type="number" inputmode="numeric" min="0" step="10000" value="${UI.calc[k]}"><span class="unit">元</span></div></div>`; }
export function calcRange(k,label,min,max,step,unit){ return `<div class="field"><label for="calc-${k}">${label} <span class="num" id="calco-${k}">${UI.calc[k]}${unit}</span></label><input type="range" id="calc-${k}" data-calc="${k}" data-unit="${unit}" min="${min}" max="${max}" step="${step}" value="${UI.calc[k]}"></div>`; }
export function updateCalc(){
  const c = UI.calc; charts.list = [];
  const P = c.com + c.gjj; const n = c.years*12;
  const S = combinedSchedule(c, c.method);
  if($('#calc-explain')) $('#calc-explain').innerHTML = methodExplainHTML(c);
  const sumInt = S.reduce((s,r)=>s+r.int,0);
  $('#calc-kpis').innerHTML = P<=0 ? '<p class="small muted">先填贷款金额。</p>' : `
    <div class="kpi"><div class="k">首月月供</div><div class="v">${yuan(S[0].pay)}</div></div>
    <div class="kpi"><div class="k">${c.method==='ep'?'每月递减':'末月月供'}</div><div class="v">${c.method==='ep'?yuan(S[0].pay-S[1]?.pay||0):yuan(S[n-1].pay)}</div></div>
    <div class="kpi"><div class="k">总利息</div><div class="v" style="color:var(--s-buy)">${wan(sumInt)}</div></div>
    <div class="kpi"><div class="k">本息合计</div><div class="v">${wan(P+sumInt)}</div></div>
    <div class="kpi"><div class="k">利息 / 本金</div><div class="v">${pct(sumInt/P*100,0)}</div></div>
    <div class="kpi"><div class="k">首月利息占比</div><div class="v">${pct(S[0].int/S[0].pay*100,0)}</div></div>`;
  if(P<=0){ $('#calc-vs').innerHTML=''; $('#calc-chart').innerHTML=''; $('#calc-table').innerHTML=''; $('#calc-pp').innerHTML=''; return; }
  const A = combinedSchedule(c,'ei'), B = combinedSchedule(c,'ep');
  const iA = A.reduce((s,r)=>s+r.int,0), iB = B.reduce((s,r)=>s+r.int,0);
  $('#calc-vs').innerHTML = `<thead><tr><th>方式</th><th>首月月供</th><th>末月月供</th><th>总利息</th></tr></thead><tbody><tr class="${c.method==='ei'?'hl':''}"><td>等额本息</td><td>${yuan(A[0].pay)}</td><td>${yuan(A[n-1].pay)}</td><td>${wan(iA)}</td></tr><tr class="${c.method==='ep'?'hl':''}"><td>等额本金</td><td>${yuan(B[0].pay)}</td><td>${yuan(B[n-1].pay)}</td><td>${wan(iB)}</td></tr></tbody>`;
  const rows = []; for(let y=0;y<c.years;y++){ const seg=S.slice(y*12,y*12+12); rows.push({label:`${y+1}`, a:seg.reduce((s,r)=>s+r.pr,0), b:seg.reduce((s,r)=>s+r.int,0), bal:seg[seg.length-1].bal, pay:seg.reduce((s,r)=>s+r.pay,0)}); }
  barChart($('#calc-chart'), {rows:rows.map(r=>({...r,label:`第${r.label}年`})), height:220});
  $('#calc-table').innerHTML = `<thead><tr><th>年</th><th>当年还款</th><th>本金</th><th>利息</th><th>剩余本金</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.label}</td><td>${yuan(r.pay)}</td><td>${yuan(r.a)}</td><td>${yuan(r.b)}</td><td>${yuan(r.bal)}</td></tr>`).join('')}</tbody>`;
  // 提前还款（只对商贷）
  const k = Math.min(c.ppYear*12, n-1);
  if(c.com>0 && c.ppAmt>0 && k<n){
    const base = schedule(c.com, c.comRate, n, c.method); const B0 = base[k-1].bal; const amt = Math.min(c.ppAmt, B0);
    const intBefore = base.slice(k).reduce((s,r)=>s+r.int,0);
    const B1 = B0-amt, left = n-k, r = c.comRate/1200;
    let nShort = left, payShort, payLess;
    if(B1<=0){ $('#calc-pp').innerHTML = `<p class="answer">第 ${c.ppYear} 年末商贷只剩 ${yuan(B0)}，直接还清，少付利息 <b>${yuan(intBefore)}</b>。</p>`; return; }
    if(c.method==='ei'){ const P0 = annuity(B0,c.comRate,left); nShort = Math.ceil(-Math.log(1-r*B1/P0)/Math.log(1+r)); payShort = annuity(B1,c.comRate,nShort); payLess = annuity(B1,c.comRate,left); }
    else { const bp = c.com/n; nShort = Math.ceil(B1/bp); payShort = B1/nShort + B1*r; payLess = B1/left + B1*r; }
    const iShort = c.method==='ei' ? payShort*nShort - B1 : B1*r*(nShort+1)/2;
    const iLess = c.method==='ei' ? payLess*left - B1 : B1*r*(left+1)/2;
    $('#calc-pp').innerHTML = `<p class="small muted">第 ${c.ppYear} 年末商贷剩余本金 ${yuan(B0)}，原本还要付利息 ${yuan(intBefore)}。提前还 ${yuan(amt)} 之后：</p>
      <div class="tbl-wrap"><table class="tbl fit"><thead><tr><th>方案</th><th>之后月供</th><th>剩余</th><th>少付利息</th></tr></thead><tbody>
      <tr><td>缩短年限</td><td>${yuan(payShort)}</td><td>${nShort} 期</td><td style="color:var(--plus)">${yuan(intBefore-iShort)}</td></tr>
      <tr><td>减少月供</td><td>${yuan(payLess)}</td><td>${left} 期</td><td style="color:var(--plus)">${yuan(intBefore-iLess)}</td></tr></tbody></table></div>
      <p class="small">缩短年限：月供不变，少还 ${left-nShort} 期，省的利息更多。减少月供：期数不变，每个月更宽裕。如果手上的钱投资年化能稳定超过 ${c.comRate}%，提前还款就不一定划算。</p>`;
  } else $('#calc-pp').innerHTML = '<p class="small muted">填一个提前还款金额看看能省多少利息。</p>';
  save();
}

/* ============================================================
   信用卡分期计算器：每期手续费看着低，折算年化是多少；和只还最低比一比
   ============================================================ */
const calcModeSeg = () => `<div class="seg level-seg" role="group" aria-label="计算器"><button data-calcmode="mort" aria-pressed="${UI.calcMode!=='card'}">房贷</button><button data-calcmode="card" aria-pressed="${UI.calcMode==='card'}">信用卡分期</button></div>`;
export const feeFor = n => Math.round((CARD.installments.find(o=>o.n===n) || CARD.installments[CARD.installments.length-1]).fee*10000)/100;
export function renderCardCalc(){
  if(!UI.ccalc) UI.ccalc = { amt:10000, n:12, fee:feeFor(12) };
  const c = UI.ccalc;
  $('#v-calc').innerHTML = `
  ${calcModeSeg()}
  <div class="stack-s"><span class="eyebrow">信用卡分期计算器</span><h2>"每期只要 0.65%"，到底贵不贵</h2><p class="small muted">分期手续费按最初的本金算，每期都一样；可你欠的本金每个月都在变少。所以要换算成折算年化${term('apr')}才看得出真实成本。</p></div>
  <div class="card stack">
    <div class="grid2">
      <div class="field"><label for="cc-amt">分期金额</label><div class="inp-wrap"><input class="inp num" id="cc-amt" data-ccalc="amt" type="number" inputmode="numeric" min="0" step="1000" value="${c.amt}"><span class="unit">元</span></div></div>
      <div class="field"><span class="lab">分几期</span><div class="seg" id="seg-cc-n">${[3,6,12,24].map(n=>`<button data-ccn="${n}" aria-pressed="${c.n===n}">${n} 期</button>`).join('')}</div></div>
      <div class="field"><label for="cc-fee">每期手续费率 <span class="num" id="cco-fee">${c.fee}%</span></label><input type="range" id="cc-fee" data-ccalc="fee" data-unit="%" min="0" max="1.5" step="0.05" value="${c.fee}"></div>
    </div>
  </div>
  <div class="card stack">
    <div class="kpis" id="cc-kpis"></div>
    <h3>同样的钱，${c.n} 个月里三种还法</h3>
    <div class="tbl-wrap"><table class="tbl fit" id="cc-vs"></table></div>
    <p class="small" id="cc-note"></p>
  </div>`;
  updateCardCalc();
}
/* 只还最低：第一期全额计息（从记账日算），之后对没还的部分按日息计息 */
export function minPayPath(P, months){
  const d = CARD.dailyRate; let carry = P, int = 0, paidInt = 0, first = 0, last = 0;
  for(let k=1;k<=months;k++){
    const min = int + CARD.minPayRate*carry; if(k===1) first = min; last = min;
    paidInt += int;
    const prin = CARD.minPayRate*carry; const before = carry; carry -= prin;
    int = (k===1 && CARD.fullInterest ? before*d*CARD.firstCycleDays : 0) + carry*d*CARD.cycleDays;
  }
  return { first, last, paidInt: paidInt + int, left: carry };
}
export function updateCardCalc(){
  const c = UI.ccalc; const P = Math.max(0, c.amt), n = c.n, f = c.fee/100;
  const per = P/n + P*f, fees = P*f*n, apr = aprOf(n, f);
  $('#cc-kpis').innerHTML = P<=0 ? '<p class="small muted">先填分期金额。</p>' : `
    <div class="kpi"><div class="k">每期还</div><div class="v">${yuan(per)}</div></div>
    <div class="kpi"><div class="k">手续费合计</div><div class="v" style="color:var(--s-buy)">${yuan(fees)}</div></div>
    <div class="kpi"><div class="k">折算年化</div><div class="v">${pct(apr,1)}</div></div>`;
  const M = minPayPath(P, n);
  $('#cc-vs').innerHTML = P<=0 ? '' : `<thead><tr><th>还法</th><th>每月还</th><th>${n} 个月的利息/手续费</th><th>${n} 个月后还欠</th></tr></thead><tbody>
    <tr class="hl"><td>账单分期 ${n} 期</td><td>${yuan(per)}</td><td>${yuan(fees)}</td><td>0</td></tr>
    <tr><td>只还最低 ${term('minpay')}</td><td>${yuan(M.first)} → ${yuan(M.last)}</td><td>${yuan(M.paidInt)}</td><td>${yuan(M.left)}</td></tr>
    <tr><td>先攒钱，再买</td><td>—</td><td>0</td><td>0</td></tr></tbody>`;
  $('#cc-note').innerHTML = P<=0 ? '' : `每期 ${pct(c.fee,2)} 乘以 12 是 ${pct(c.fee*12,1)}，但实际折算年化是 <b>${pct(apr,1)}</b>，因为你占用银行的钱越来越少，手续费却没少。只还最低更贵：循环利息年化 ${pct(revolveAPR(),2)}，${n} 个月后还欠 ${yuan(M.left)}。房贷利率才 3% 左右。`;
  save();
}
