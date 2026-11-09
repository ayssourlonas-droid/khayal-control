/* 术语解释和"等额本息 vs 等额本金"对比卡。 */
import { combinedSchedule } from '../core/finance.js';
import { clamp, esc, r1, wan, yuan } from '../core/util.js';
import { GLOSSARY } from '../data/index.js';
import { $ } from './dom.js';
import { openAsk } from './shell.js';
import { UI } from './state.js';

export function term(key){ const g = GLOSSARY[key]; return g ? `<button type="button" class="term" data-term="${key}" aria-label="解释：${esc(g.t)}">?</button>` : ''; }
export function showTerm(key){
  if(UI.busy || !$('#modal').hidden) return;
  const g = GLOSSARY[key]; if(!g) return;
  openAsk({title:g.t, body:`<div class="txt stack-s">${g.d}</div>`, options:[{id:'ok', label:'懂了', cls:'primary'}]});
}

/* 等额本息 vs 等额本金：带实时数字的对比 */
export function methodExplainHTML(o){
  const P0 = (o.com||0) + (o.gjj||0); if(P0<=0) return '';
  const n = o.years*12;
  const A = combinedSchedule(o,'ei'), B = combinedSchedule(o,'ep');
  const iA = A.reduce((s,r)=>s+r.int,0), iB = B.reduce((s,r)=>s+r.int,0);
  const eiPay = A[0].pay, epFirst = B[0].pay, epLast = B[n-1].pay, dec = n>1 ? B[0].pay-B[1].pay : 0;
  let cross = B.findIndex(r=>r.pay < eiPay); cross = cross<0 ? n : cross;
  const W=320, H=78, pl=4, pr=4, pt=8, pb=14;
  const hi = Math.max(epFirst, eiPay)*1.04, lo = Math.min(epLast, eiPay)*0.92;
  const x = i => pl + i/(n-1||1)*(W-pl-pr), y = v => pt + (hi-v)/(hi-lo||1)*(H-pt-pb);
  const stepN = Math.max(1, Math.floor(n/60));
  const idx = []; for(let i=0;i<n;i+=stepN) idx.push(i); if(idx[idx.length-1]!==n-1) idx.push(n-1);
  const lineB = idx.map((i,k)=>`${k?'L':'M'}${r1(x(i))} ${r1(y(B[i].pay))}`).join(' ');
  const on = o.method;
  return `<div class="mx">
    <div class="mx-col ${on==='ei'?'on':''}"><b><span class="sw" style="background:var(--s-inv)"></span> 等额本息</b><span>每月都还 <b class="num">${yuan(eiPay)}</b>，${o.years} 年不变</span><span>总利息 <b class="num">${wan(iA)}</b></span><span class="muted">像交房租一样固定，好规划</span></div>
    <div class="mx-col ${on==='ep'?'on':''}"><b><span class="sw" style="background:var(--s-buy)"></span> 等额本金</b><span>首月 <b class="num">${yuan(epFirst)}</b>，每月少约 <b class="num">${yuan(dec)}</b></span><span>总利息 <b class="num">${wan(iB)}</b>，少 ${wan(iA-iB)}</span><span class="muted">先苦后甜，越还越轻松</span></div>
  </div>
  <svg class="mx-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="两种还款方式每月还款额随时间变化">
    <line x1="${pl}" x2="${W-pr}" y1="${H-pb+0.5}" y2="${H-pb+0.5}" stroke="var(--line)"/>
    <path d="M${r1(x(0))} ${r1(y(eiPay))} L${r1(x(n-1))} ${r1(y(eiPay))}" stroke="var(--s-inv)" stroke-width="2" fill="none"/>
    <path d="${lineB}" stroke="var(--s-buy)" stroke-width="2" fill="none"/>
    ${cross<n?`<circle cx="${r1(x(cross))}" cy="${r1(y(eiPay))}" r="3.5" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.5"/>`:''}
    <text x="${pl}" y="${H-2}" font-size="9" fill="var(--muted)">第1个月</text><text x="${W-pr}" y="${H-2}" font-size="9" fill="var(--muted)" text-anchor="end">第${n}个月</text>
    ${cross<n?`<text x="${r1(clamp(x(cross),40,W-60))}" y="${r1(y(eiPay)-7)}" font-size="9" fill="var(--ink-2)" text-anchor="middle">第${Math.floor(cross/12)+1}年起等额本金月供更低</text>`:''}
  </svg>
  <p class="small">简单说：选等额本金，第 1 个月要多还 <b class="num">${yuan(epFirst-eiPay)}</b>，大约第 ${Math.floor(cross/12)+1} 年开始每月比等额本息还得少，整体少付利息 <b class="num">${wan(iA-iB)}</b>。银行审批按首月月供算，所以等额本金更难批。</p>`;
}
