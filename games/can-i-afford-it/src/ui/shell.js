/* 界面外壳：弹窗、提示条、页面切换和总渲染入口。 */
import { bannerSVG } from '../art/scenes.js';
import { setAsk } from '../core/engine.js';
import { esc } from '../core/util.js';
import { renderCalc } from './calc.js';
import { charts } from './charts.js';
import { renderCompare } from './compare.js';
import { $, $$ } from './dom.js';
import { renderEnd } from './end.js';
import { renderLife } from './life.js';
import { renderListings } from './listings.js';
import { renderLoan } from './loan.js';
import { renderStart } from './start.js';
import { renderSpendEnd, renderSpendPlay, renderSpendStart, spendStage } from './spend.js';
import { UI, save, store } from './state.js';

export function toast(msg, ms=2600){ const t=$('#toast'); t.textContent=msg; t.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>t.hidden=true, ms); }

export let askVals = {};
export function openAsk(spec){
  return new Promise(resolve=>{
    const m=$('#modal'), sh=$('#sheet');
    const opts = (spec.options||[]).map(o=>`<button class="opt ${o.cls||''}" data-opt="${esc(o.id)}" ${o.disabled?'disabled':''}><b>${o.label}</b>${o.sub?`<span>${o.sub}</span>`:''}</button>`).join('');
    sh.innerHTML = `${spec.icon?`<div class="ill">${bannerSVG(spec.icon, spec.tone)}</div>`:''}<h3 id="sheet-title">${spec.title}</h3>${spec.text?`<p class="txt">${spec.text}</p>`:''}${spec.body||''}<div class="opts">${opts}</div>`;
    m.hidden=false; document.body.style.overflow='hidden'; $('#toast').hidden=true;
    if(spec.mount) spec.mount(sh);
    const first = sh.querySelector('.opt:not([disabled])'); if(first) setTimeout(()=>first.focus({preventScroll:true}),30);
    const onClick = e=>{
      const b = e.target.closest('[data-opt]'); if(!b || b.disabled) return;
      askVals = {}; $$('[data-k]', sh).forEach(i=>{ askVals[i.dataset.k] = i.type==='checkbox'?i.checked: i.dataset.val!==undefined ? i.dataset.val : i.value; });
      sh.removeEventListener('click', onClick); m.hidden=true; document.body.style.overflow=''; resolve(b.dataset.opt);
    };
    sh.addEventListener('click', onClick);
  });
}
setAsk(openAsk);

export function setTab(tab){
  UI.tab = tab; $('#toast').hidden = true;
  $$('.tab').forEach(b=>b.setAttribute('aria-selected', String(b.dataset.tab===tab)));
  render(); window.scrollTo({top:0});
  save();
}
export function lifeStage(){ return store.G ? (store.G.ended ? 'end' : 'life') : UI.stage; }
export function render(){
  charts.list = [];
  const views = ['start','listings','loan','life','end','sstart','splay','send','compare','calc'];
  const cur = UI.tab==='life' ? (UI.level==='spend' ? spendStage() : lifeStage()) : UI.tab;
  views.forEach(v=>{ $('#v-'+v).hidden = v!==cur; });
  $('#app').classList.toggle('wide', ['life','compare','splay','send'].includes(cur));
  $('#action-bar').hidden = !(cur==='life' || cur==='splay');
  $('#loan-cta').hidden = cur!=='loan';
  ({start:renderStart, listings:renderListings, loan:renderLoan, life:renderLife, end:renderEnd, sstart:renderSpendStart, splay:renderSpendPlay, send:renderSpendEnd, compare:renderCompare, calc:renderCalc})[cur]();
}
