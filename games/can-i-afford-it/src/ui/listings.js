/* 看房页：房源卡片和筛选。 */
import { homeSVG } from '../art/scenes.js';
import { annuity } from '../core/finance.js';
import { genListings } from '../core/setup.js';
import { wan, yuan } from '../core/util.js';
import { LPR5, deepPackOf, cityById } from '../data/index.js';
import { $ } from './dom.js';
import { UI } from './state.js';

/* ============================================================
   看房
   ============================================================ */
export function renderListings(){
  const c = UI.cfg, city = cityById(c.cityId);
  if(!UI.listings){ UI.seed = (Date.now() ^ Math.floor(Math.random()*1e9))>>>0; UI.listings = genListings(city, UI.seed); }
  const funds = c.savings + c.gift;
  const hasSeg = UI.listings.some(L=>L.seg);
  const seg = hasSeg ? (UI.seg||'全部') : '全部';
  const shown = UI.listings.filter(L=>seg==='全部' || L.seg===seg);
  const v = $('#v-listings');
  v.innerHTML = `
    <div class="row between"><div class="stack-s"><span class="eyebrow">${city.name} · 在售房源${hasSeg?' · 深度版':''}</span><h2>挑一套，跟它过 30 年</h2></div><button class="btn sm ghost" data-act="back-start">← 改家底</button></div>
    <p class="small muted">你手上能动用的钱：<b class="num" style="color:var(--ink)">${wan(funds)}</b>（存款 + 父母资助）。卡片上的月供按最低首付、30 年、利率 3.05% 粗算。点进去能看户型图和装修效果图。</p>
    ${hasSeg?`<div class="seg" id="seg-filter">${(deepPackOf(city)?.segments||[]).map(s=>`<button data-seg="${s}" aria-pressed="${s===seg}">${s}<span class="tiny muted"> ${s==='全部'?UI.listings.length:UI.listings.filter(L=>L.seg===s).length}</span></button>`).join('')}</div>`:''}
    <div class="listings">${shown.map(L=>listingCard(L, city)).join('')}</div>
    ${hasSeg?`<p class="foot">板块价格参考：禧泰 2026年8–9月区县挂牌均价、2026年8月高新区和天府新区板块二手均价，豪宅和别墅参考公开报道的新房售价；带 * 的为估算。</p>`:''}
    <div class="row"><button class="btn sm" data-act="reroll">换一批房源</button></div>`;
}
export function listingCard(L, city){
  const minDown = L.commercial?30:15; const years = L.commercial?10:30; const rate = L.commercial?LPR5+0.3:3.05;
  const pay = annuity(L.total*(1-minDown/100), rate, years*12);
  return `<button class="listing" data-pick="${L.i}">
    <div class="pic">${homeSVG(L.type, L.name+L.i)}<div class="tagline">${[[L.cat,'red'],...L.tags].map(([t,c])=>`<span class="tag ${c||''}">${t}</span>`).join('')}</div></div>
    <div class="body">
      <div class="row between" style="gap:6px"><span class="name">${L.name}</span><span class="small muted">${L.district}${L.plate?' · '+L.plate:''}${L.est?'*':''}</span></div>
      <div class="price"><span class="total">${wan(L.total)}</span><span class="small muted num">${L.unit.toLocaleString()} 元/㎡</span>${L.seg?`<span class="tag">${L.seg}</span>`:''}</div>
      <div class="kv"><span>${L.rooms}</span><span class="num">${L.area}㎡${L.gift?` +送${L.gift}㎡`:''}</span><span>${L.cat==='二手'?L.year+'年建成':L.deliver?L.year+'年交房':'现房'}</span><span>${L.deco}</span>${L.height?`<span>${L.height}</span>`:''}</div>
      <p class="small" style="color:var(--ink-2)">${L.note}</p>
      <div class="kv"><span>最低首付 <b class="num">${wan(L.total*minDown/100)}</b></span><span>月供约 <b class="num">${yuan(pay)}</b></span><span>同类房租 <b class="num">${yuan(L.rent)}</b>/月</span></div>
    </div></button>`;
}
