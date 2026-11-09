/* 借钱凑首付：直接输入、长按加减、补齐缺口/拉满/清零。 */
import { annuity } from '../core/finance.js';
import { clamp, esc, trimZ, wan, yuan } from '../core/util.js';
import { PLATFORMS, platById } from '../data/index.js';
import { $ } from './dom.js';
import { updateLoan } from './loan.js';
import { UI } from './state.js';

/* ---------- 借款输入 ---------- */
export const platAmt = id => (UI.ctl && UI.ctl.plats[id]) || 0;
export function setPlat(id, amt){ const p = platById(id); UI.ctl.plats[id] = clamp(Math.round(amt/100)*100, 0, p.max); }
export function gapFor(p, P){ if(P.left>=0) return 0; return Math.ceil(-P.left/(p.kind==='illegal'?0.7:1)/p.step)*p.step; }
export function platRowHTML(p){
  return `<div class="plat" data-row="${p.id}">
    <div class="pn">${p.name} <span class="tag ${p.apr>=20?'warn':''}">年化 ${p.apr}%</span></div>
    <div class="amtbox">
      <button type="button" class="step" data-step="${p.id}" data-d="-1" aria-label="少借一点（按住连续减）">−</button>
      <div class="inp-wrap"><input class="inp num" id="pl-${p.id}" data-platin="${p.id}" type="text" inputmode="decimal" autocomplete="off" value="0" aria-label="${esc(p.name)}借款金额，单位万元"><span class="unit">万</span></div>
      <button type="button" class="step" data-step="${p.id}" data-d="1" aria-label="多借一点（按住连续加）">+</button>
    </div>
    <div class="quick">
      <button type="button" class="chip" data-platset="${p.id}" data-v="gap" id="plg-${p.id}">补齐缺口</button>
      <button type="button" class="chip" data-platset="${p.id}" data-v="max">拉满 ${wan(p.max)}</button>
      <button type="button" class="chip" data-platset="${p.id}" data-v="0">清零</button>
    </div>
    <div class="pd">${p.d}<span id="plp-${p.id}"></span></div>
  </div>`;
}
export function updatePlats(P){
  PLATFORMS.forEach(p=>{
    const a = platAmt(p.id); const inp = $('#pl-'+p.id); if(!inp) return;
    if(document.activeElement !== inp) inp.value = a ? trimZ((a/1e4).toFixed(2)) : '0';
    const pay = a ? (p.apr===0 ? a/p.term : annuity(a,p.apr,p.term)) : 0;
    $('#plp-'+p.id).innerHTML = a ? ` <b>每月还 ${yuan(pay)}</b>，共 ${p.term} 期，${p.apr===0?'不用付利息，但欠了人情':`总共多还利息 ${yuan(pay*p.term - a)}`}${p.kind==='illegal'?`，到手只有 ${yuan(a*0.7)}`:''}。` : '';
    const g = gapFor(p, P); const gb = $('#plg-'+p.id);
    gb.disabled = g<=0 || a>=p.max; gb.textContent = g>0 && a<p.max ? `补齐缺口 +${wan(Math.min(g, p.max-a))}` : '补齐缺口';
    $(`[data-platset="${p.id}"][data-v="max"]`).disabled = a>=p.max;
    $(`[data-platset="${p.id}"][data-v="0"]`).disabled = a<=0;
    $(`[data-row="${p.id}"]`).classList.toggle('used', a>0);
  });
  const tot = P.platTotal, recv = P.platRecv, pay = P.platPay;
  $('#plat-sum').innerHTML = P.left<0
    ? `<div class="verdict bad"><span class="ic">!</span><div>首付和税费还差 <b class="num">${yuan(-P.left)}</b>。点任意平台的"补齐缺口"，一次借够。</div></div>`
    : tot>0 ? `<div class="verdict ok"><span class="ic">✓</span><div>钱凑够了。一共借 <b class="num">${wan(tot)}</b>${recv<tot?`（到手 ${wan(recv)}）`:''}，以后每月要多还 <b class="num">${yuan(pay)}</b>。</div></div>`
    : `<div class="verdict ok"><span class="ic">✓</span><div>自己的钱够付首付和税费，不用借。</div></div>`;
}
/* 长按连续加减 */
export let HOLD = null;
export function stopHold(){ if(HOLD){ clearTimeout(HOLD.t); HOLD = null; } }
document.addEventListener('pointerdown', e=>{
  const b = e.target.closest('[data-step]'); if(!b || b.disabled) return;
  e.preventDefault(); try{ b.setPointerCapture(e.pointerId); }catch(_){}
  stopHold();
  const id = b.dataset.step, dir = +b.dataset.d; let n = 0;
  const tick = ()=>{ const p = platById(id); const mult = n<6?1 : n<16?2 : 5; const before = platAmt(id); setPlat(id, before + dir*p.step*mult); n++; updateLoan(); if(platAmt(id)===before) stopHold(); };
  tick();
  HOLD = {t: setTimeout(function rep(){ if(!HOLD) return; tick(); if(HOLD) HOLD.t = setTimeout(rep, n<6?140 : n<16?80 : 50); }, 380)};
});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>document.addEventListener(ev, stopHold, true));
window.addEventListener('blur', stopHold);
document.addEventListener('contextmenu', e=>{ if(e.target.closest('[data-step]')) e.preventDefault(); });
