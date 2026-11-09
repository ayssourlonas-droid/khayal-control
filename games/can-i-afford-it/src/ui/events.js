/* 全局事件：所有按钮和输入框的点击、输入都在这里分发。 */
import { showAbout, showSupport } from './about.js';
import { defaultLoanCtl } from '../core/loan.js';
import { roomsOf, styleOf } from '../core/renovation.js';
import { wan } from '../core/util.js';
import { ASSETS, PLATFORMS, assetById, platById } from '../data/index.js';
import { gapFor, platAmt, setPlat } from './borrow.js';
import { feeFor, renderCardCalc, updateCalc, updateCardCalc } from './calc.js';
import { renderCompare, updateCompare } from './compare.js';
import { $, $$ } from './dom.js';
import { renderEnd } from './end.js';
import { showTerm } from './help.js';
import { moreMenu, runMonths } from './life.js';
import { renderListings } from './listings.js';
import { curPlan, signFlow, updateGallery, updateLoan } from './loan.js';
import { render, setTab, toast } from './shell.js';
import { selectCity, updateStartHints } from './start.js';
import { chooseBill, chooseTm, chooseWish, nextSpendMonth, spendAgain, spendMore, spendReset, startSpend, updateSpendStart } from './spend.js';
import { UI, save, store } from './state.js';

document.addEventListener('click', async e=>{
  const t = e.target.closest('button'); if(!t || t.disabled) return;
  if(t.closest('#sheet')) return;
  const d = t.dataset;
  if(d.term){ e.preventDefault(); return showTerm(d.term); }
  if(d.tab){ return setTab(d.tab); }
  if(d.level){ UI.level = d.level; save(); render(); return window.scrollTo({top:0}); }
  if(d.bill){ return chooseBill(d.bill); }
  if(d.tm){ return chooseTm(d.tm); }
  if(d.wish){ return chooseWish(d.wish); }
  if(d.city){ return selectCity(d.city); }
  if(d.bonus!==undefined){ UI.cfg.bonus=+d.bonus; $$('[data-bonus]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.bonus===UI.cfg.bonus))); return save(); }
  if(d.market){ UI.cfg.market=d.market; $$('#seg-market button').forEach(b=>b.setAttribute('aria-pressed',String(b===t))); return save(); }
  if(d.pick!==undefined){ UI.pick=+d.pick; UI.view={room:0, tier:null}; UI.ctl=defaultLoanCtl(UI.listings[UI.pick], UI.cfg); UI.stage='loan'; save(); render(); return window.scrollTo({top:0}); }
  if(d.method){ UI.ctl.method=d.method; $$('#seg-method button').forEach(b=>b.setAttribute('aria-pressed',String(b===t))); return updateLoan(); }
  if(d.bank){ UI.ctl.bank=d.bank; $$('#bank-list .bank').forEach(b=>b.setAttribute('aria-pressed',String(b===t))); return updateLoan(); }
  if(d.seg){ UI.seg=d.seg; save(); return renderListings(); }
  if(d.room!==undefined){ UI.view.room=+d.room; return updateGallery(); }
  if(d.roomnav){ const n=roomsOf(UI.listings[UI.pick]).length; UI.view.room=(UI.view.room+(+d.roomnav)+n)%n; return updateGallery(); }
  if(d.tier){ if(d.tier==='raw'){ UI.view.tier='raw'; return updateGallery(); } UI.ctl.reno=d.tier; UI.ctl.style=styleOf(d.tier, UI.ctl.style); UI.view.tier=d.tier; return updateLoan(); }
  if(d.style){ UI.ctl.style=d.style; return updateLoan(); }
  if(d.step){ if(e.detail===0){ const p=platById(d.step); setPlat(p.id, platAmt(p.id)+(+d.d)*p.step); updateLoan(); } return; }
  if(d.fix){
    const f = d.fix;
    if(f==='plats'){ $('#plat-sum').scrollIntoView({behavior:'smooth', block:'center'}); return; }
    if(f==='mindown') UI.ctl.down = 0;
    if(f.startsWith('down:')) UI.ctl.down = +f.slice(5);
    if(f==='clearnet') PLATFORMS.forEach(p=>{ if(['p2p','illegal','consumer'].includes(p.kind)) UI.ctl.plats[p.id]=0; });
    if(f==='clearall') UI.ctl.plats = {};
    if(f==='nong'){ UI.ctl.bank='nong'; $$('#bank-list .bank').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.bank==='nong'))); }
    if(f==='cob'){ UI.ctl.cob=true; const cb=$('#in-cob'); if(cb) cb.checked=true; }
    if(f==='maxyears'){ UI.ctl.years = 99; }
    updateLoan(); const P1 = curPlan(); toast(P1.ok ? '银行批了，可以签合同了' : `还有 ${P1.reasons.length} 个问题`, 1800); return;
  }
  if(d.platset){ const p=platById(d.platset); const P0=curPlan(); const v = d.v==='max' ? p.max : d.v==='gap' ? platAmt(p.id)+gapFor(p,P0) : 0; setPlat(p.id, v); updateLoan(); if(d.v==='max'||d.v==='gap') toast(`${p.name}：借 ${wan(platAmt(p.id))}`, 1600); return; }
  if(d.choice){ store.G.chosen = store.G.chosen===d.choice?null:d.choice; $$('.choice').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.choice===store.G.chosen))); return save(); }
  if(d.asset){ UI.asset=d.asset; if(UI.cmp && UI.tab==='compare'){ UI.cmp.asset=d.asset; UI.cmp.R=assetById(d.asset).R; } save(); return render(); }
  if(d.calcmode){ UI.calcMode = d.calcmode; save(); return render(); }
  if(d.ccn){ UI.ccalc.n = +d.ccn; UI.ccalc.fee = Math.round(feeFor(+d.ccn)*100)/100; return renderCardCalc(); }
  if(d.cmethod){ UI.calc.method=d.cmethod; $$('#seg-calc-method button').forEach(b=>b.setAttribute('aria-pressed',String(b===t))); return updateCalc(); }
  switch(d.act){
    case 'go-listings': { const c=UI.cfg; if(!(c.age>=18&&c.age<=60)){ toast('年龄请填 18~60'); return; } if(UI.listingsCity!==c.cityId){ UI.listings=null; UI.listingsCity=c.cityId; } UI.stage='listings'; save(); render(); return window.scrollTo({top:0}); }
    case 'back-start': UI.stage='start'; save(); render(); return window.scrollTo({top:0});
    case 'reroll': UI.listings=null; render(); return;
    case 'back-listings': UI.stage='listings'; save(); render(); return window.scrollTo({top:0});
    case 'sign': { const P0 = curPlan(); if(!P0.ok){ const v=$('#verdict'); v.scrollIntoView({behavior:'smooth', block:'center'}); v.classList.remove('flash'); void v.offsetWidth; v.classList.add('flash'); return; } return signFlow(); }
    case 'next': return runMonths(1);
    case 'year': return runMonths(12);
    case 'more': return moreMenu();
    case 'again': store.G=null; UI.listings=null; UI.pick=null; UI.ctl=null; UI.stage='listings'; save(); render(); return window.scrollTo({top:0});
    case 'newcity': store.G=null; UI.listings=null; UI.pick=null; UI.ctl=null; UI.stage='start'; save(); render(); return window.scrollTo({top:0});
    case 'tab-compare': UI.cmp=null; return setTab('compare');
    case 'cmp-reset': UI.cmp=null; return renderCompare();
    case 'about': return showAbout();
    case 'support': return showSupport();
    case 's-start': return startSpend();
    case 's-next': return nextSpendMonth();
    case 's-more': return spendMore();
    case 's-again': return spendAgain();
    case 's-reset': return spendReset();
  }
});
document.addEventListener('input', e=>{
  const t = e.target; const d = t.dataset;
  if(d.platin){ const v = parseFloat(String(t.value).replace(/[^\d.]/g,'')); const p = platById(d.platin); setPlat(p.id, isNaN(v)?0:v*1e4); if(!isNaN(v) && v*1e4>p.max) toast(`${p.name}最多只能借 ${wan(p.max)}`, 1600); return updateLoan(); }
  if(d.cfg){ UI.cfg[d.cfg] = Math.max(0, +t.value||0); UI.touched[d.cfg]=true; if(UI.level==='spend') updateSpendStart(); else updateStartHints(); return save(); }
  if(t.id==='in-gjj'){ UI.cfg.gjjPct=+t.value; $('#o-gjj').textContent=t.value+'%'; updateStartHints(); return save(); }
  if(t.id==='in-down'){ UI.ctl.down=+t.value; return updateLoan(); }
  if(t.id==='in-years'){ UI.ctl.years=+t.value; return updateLoan(); }
  if(t.id==='in-gjjamt'){ UI.ctl.gjj=+t.value; return updateLoan(); }
  if(d.cmp){ const val = +t.value; UI.cmp[d.cmp] = isNaN(val)?0:val; if(d.unit!==undefined) $('#cmpo-'+d.cmp).textContent = t.value + d.unit; if(d.cmp==='R'){ const a = ASSETS.find(x=>Math.abs(x.R-val)<1e-9); $$('#seg-asset-cmp button').forEach(b=>b.setAttribute('aria-pressed', String(!!a && b.dataset.asset===a.id))); UI.cmp.asset = a ? a.id : 'custom'; } return updateCompare(); }
  if(d.ccalc){ UI.ccalc[d.ccalc] = Math.max(0, +t.value||0); if(d.unit!==undefined) $('#cco-'+d.ccalc).textContent = t.value + d.unit; return updateCardCalc(); }
  if(d.calc){ UI.calc[d.calc] = Math.max(0, +t.value||0); if(d.unit!==undefined) $('#calco-'+d.calc).textContent = t.value + d.unit; return updateCalc(); }
});
document.addEventListener('change', e=>{
  const t = e.target;
  if(t.id==='in-scity'){ selectCity(t.value); return render(); }
  if(t.id==='in-spouse'){ UI.cfg.spouse=t.checked; $('#spouse-box').hidden=!t.checked; updateStartHints(); return save(); }
  if(t.id==='in-cob'){ UI.ctl.cob=t.checked; return updateLoan(); }
  if(t.dataset.platin){ t.blur(); return updateLoan(); }
  if(t.id==='in-vol-end'){ UI.vol=t.checked; save(); return renderEnd(); }
  if(t.id==='in-cmp-band'){ UI.cmp.band=t.checked; return updateCompare(); }
});
