/* 户型、装修和贷款页：户型图、效果图浏览、首付/年限/银行、审批结果和一键解决办法、签约。 */
import { floorPlanSVG } from '../art/floorplan.js';
import { interiorSVG } from '../art/interior.js';
import { ymText } from '../core/calendar.js';
import { drawChoices, initLife, logEv } from '../core/engine.js';
import { annuity } from '../core/finance.js';
import { defaultLoanCtl, loanPlan } from '../core/loan.js';
import { renoArea, renoCostOf, renoMonthsOf, roomsOf, styleOf } from '../core/renovation.js';
import { hashStr, makeRng, pct, trimZ, wan, yuan } from '../core/util.js';
import { BANKS, GJJ_RATE, GJJ_RATE_SHORT, LPR5, PLATFORMS, RENO_BY_DECO, RENO_SPLIT, STYLES, TIER_STYLES, cityById } from '../data/index.js';
import { platAmt, platRowHTML, updatePlats } from './borrow.js';
import { $, $$ } from './dom.js';
import { methodExplainHTML, term } from './help.js';
import { openAsk, render } from './shell.js';
import { UI, save, store } from './state.js';

/* ============================================================
   贷款
   ============================================================ */
export function curPlan(){ const L = UI.listings[UI.pick]; return loanPlan(L, UI.cfg, UI.ctl); }
export function renderLoan(){
  const L = UI.listings[UI.pick]; const city = cityById(UI.cfg.cityId);
  if(!UI.ctl) UI.ctl = defaultLoanCtl(L, UI.cfg);
  const P = curPlan(); const ctl = P.ctl;
  const v = $('#v-loan');
  v.innerHTML = `
  <div class="row between"><div class="stack-s"><span class="eyebrow">第二步 · 户型、装修和贷款</span><h2>${L.name} · ${wan(L.total)}</h2></div><button class="btn sm ghost" data-act="back-listings">← 换房</button></div>
  <div class="card stack">
    <div class="row between"><h3>户型图</h3><span class="small muted">${L.rooms} · ${L.district}${L.plate?' · '+L.plate:''}</span></div>
    <div class="plan">${floorPlanSVG(L)}</div>
    <div class="facts">
      <div><span>建筑面积</span><b class="num">${L.area}㎡</b></div>
      ${L.gift?`<div><span>赠送花园</span><b class="num">${L.gift}㎡</b></div><div><span>实得面积</span><b class="num">${L.inner}㎡</b></div>`:`<div><span>单价</span><b class="num">${L.unit.toLocaleString()}</b></div>`}
      <div><span>物业费</span><b class="num">${L.fee ?? city.fee} 元/㎡</b></div>
      <div><span>楼层</span><b>${L.height || (L.cat==='二手'?'中楼层':'—')}</b></div>
      <div><span>交付</span><b>${L.deco}${L.deliver?` · ${L.deliver}个月后`:''}</b></div>
      <div><span>同类月租</span><b class="num">${yuan(L.rent)}</b></div>
    </div>
    <p class="hint">户型图为示意，各房间面积按套内约 82% 估算。</p>
  </div>
  <div class="card stack" id="gallery">
    <div class="row between"><h3>装修效果图</h3><span class="tiny muted">选哪档就按哪档算装修款</span></div>
    <div class="seg" id="seg-room">${roomsOf(L).map((r,i)=>`<button data-room="${i}" aria-pressed="${(UI.view?.room||0)===i}">${r}</button>`).join('')}</div>
    <div class="render" id="render"></div>
    <div class="seg" id="seg-tier"></div>
    <div class="seg" id="seg-style"></div>
    <div id="o-reno" class="stack-s"></div>
  </div>
  <div class="card stack">
    <div class="row between"><h3>首付</h3><span class="small muted" id="o-mindown"></span></div>
    <div class="field"><label for="in-down"><span>首付比例 ${term('down')}</span><span class="num" id="o-down"></span></label><input type="range" id="in-down" min="${P.minDown}" max="100" step="1" value="${ctl.down}"></div>
    <p class="hint">${L.commercial?'商业用房（商住公寓）首付最低 30%，不能用公积金，贷款最长 10 年。':P.newHomePolicy?`首套商贷最低首付 15%。${city.name}新政：买新房用公积金贷款，首付最低 ${P.gjjPolicy.newHomeMinDown}%（政策到 ${P.gjjPolicy.until}）。首付拉到 100% 就是全款。`:'首套住房商贷最低首付 15%；用了公积金贷款最低 20%。首付拉到 100% 就是全款。'}</p>
  </div>
  <div class="card stack" id="loan-box">
    <h3>贷款</h3>
    <div class="field"><label for="in-years">贷款年限 <span class="num" id="o-years"></span></label><input type="range" id="in-years" min="1" max="${P.maxYears}" step="1" value="${ctl.years}"><p class="hint">年龄 + 贷款年限一般不能超过 70 岁${L.commercial?'；商业用房最长 10 年':''}。</p></div>
    <div class="field"><span class="lab"><span>还款方式 ${term('method')}</span></span><div class="seg" id="seg-method"><button data-method="ei" aria-pressed="${ctl.method==='ei'}">等额本息（每月一样）</button><button data-method="ep" aria-pressed="${ctl.method==='ep'}">等额本金（先多后少）</button></div><div id="method-explain" class="stack-s"></div></div>
    <div class="field" ${L.commercial?'hidden':''}><label for="in-gjjamt"><span>公积金贷款 ${term('gjj')}</span><span class="num" id="o-gjjamt"></span></label><input type="range" id="in-gjjamt" min="0" max="${P.gjjCap}" step="10000" value="${ctl.gjj}"><p class="hint">公积金利率 ${GJJ_RATE}%（5年以内 ${GJJ_RATE_SHORT}%）。${P.gjjPolicy?`${city.name}新政：单人最高 ${P.gjjPolicy.single} 万、夫妻双方 ${P.gjjPolicy.dual} 万，买新建住房上浮 ${Math.round((P.gjjPolicy.newHomeBoost-1)*100)}%（这套最多 ${trimZ(P.gjjMaxW.toFixed(0))} 万）${P.gjjPolicy.subsidyRate?`；公积金利息再补贴 ${Math.round(P.gjjPolicy.subsidyRate*100)}%，每笔累计最多 ${wan(P.gjjPolicy.subsidyCap)}`:''}。`:`${city.name}家庭最高约 ${city.gjjMax} 万。`}剩下的部分走商贷。</p></div>
    <div class="field"><span class="lab"><span>商贷银行（LPR ${LPR5}% + 加点）${term('lpr')}</span></span><div class="bank-list" id="bank-list">${BANKS.map(b=>`<button class="bank" data-bank="${b.id}" aria-pressed="${ctl.bank===b.id}"><span class="tiny muted">${b.tag}</span><b>${b.name}</b><span class="rate num">${(L.commercial?LPR5+0.3:LPR5+b.spread).toFixed(2)}%</span><span class="d">${b.d}</span></button>`).join('')}</div></div>
  </div>
  <div class="card stack">
    <h3>钱从哪来</h3>
    <div class="ledger" id="ledger"></div>
  </div>
  <div class="card stack">
    <div class="row between"><h3>借钱凑首付</h3><span class="tiny muted">平台名称均为虚构</span></div>
    <p class="small muted">现实里银行要求首付是自有资金，消费贷、网贷挪作首付都违规。这里让你借，是为了看清后果。看不懂的词：年化利率${term('apr')} 征信${term('credit')} 砍头息${term('kantou')}</p>
    <div id="plat-sum"></div>
    <p class="hint">金额单位是万元，可以直接输入；按住 − / + 会连续加减，越按越快。</p>
    <div id="plats">${PLATFORMS.map(platRowHTML).join('')}</div>
    <label class="check"><input type="checkbox" id="in-cob" ${ctl.cob?'checked':''}><span>让父母做共同还款人${term('cob')}（审批时收入 +¥6,000/月，实际还是你还）</span></label>
  </div>
  <div class="card stack">
    <h3>银行审批</h3>
    <div id="verdict"></div>
    <div class="kpis k3" id="loan-kpis"></div>
  </div>`;
  $('#loan-cta').innerHTML = `<div class="in"><div class="sum" id="cta-sum"></div><button class="btn primary" data-act="sign" id="btn-sign">签合同，开始还贷</button></div>`;
  updateLoan();
}
export function updateLoan(){
  const L = UI.listings[UI.pick]; const city = cityById(UI.cfg.cityId);
  const P = curPlan(); const ctl = P.ctl;
  UI.ctl.down = ctl.down; UI.ctl.years = ctl.years; UI.ctl.gjj = ctl.gjj; UI.ctl.reno = ctl.reno;
  const dIn = $('#in-down'); if(dIn){ dIn.min = P.minDown; if(+dIn.value!==ctl.down) dIn.value = ctl.down; }
  const yIn = $('#in-years'); if(yIn && +yIn.value!==ctl.years) yIn.value = ctl.years;
  const gIn = $('#in-gjjamt'); if(gIn){ gIn.max = P.gjjCap; if(+gIn.value!==ctl.gjj) gIn.value = ctl.gjj; }
  $('#o-down').textContent = ctl.down>=100 ? '全款 '+wan(P.downAmt) : `${ctl.down}% · ${wan(P.downAmt)}`;
  $('#o-mindown').textContent = `最低 ${P.minDown}%`;
  $('#o-years').textContent = `${ctl.years} 年 · ${ctl.years*12} 期`;
  if($('#o-gjjamt')) $('#o-gjjamt').textContent = ctl.gjj>0 ? `${wan(ctl.gjj)} · 商贷 ${wan(P.comAmt)}` : '不用';
  $('#loan-box').style.opacity = P.loanTotal>0 ? 1 : 0.5;
  updateGallery(P);
  const lg = [
    ['首付', P.downAmt], [`契税 ${P.deedRate}%${term('deed')}`, P.deed], P.agent?[`中介费 2%${term('agent')}`, P.agent]:null, P.sellerTax?[`卖方个税（转嫁给买方）1%${term('sellertax')}`, P.sellerTax]:null,
    P.fund?[`专项维修资金${term('fund')}`, P.fund]:null, ['登记、评估等杂费', P.misc], P.renoNow?['装修', P.renoNow]:null,
  ].filter(Boolean);
  $('#ledger').innerHTML = lg.map(([k,x])=>`<div class="l"><span>${k}</span><span>${yuan(x)}</span></div>`).join('') +
    `<div class="l total"><span>现在要掏的钱</span><span>${yuan(P.upfront)}</span></div>` +
    `<div class="l" style="margin-top:8px"><span>存款</span><span>${yuan(UI.cfg.savings)}</span></div><div class="l"><span>父母资助</span><span>${yuan(UI.cfg.gift)}</span></div>` +
    (P.platRecv?`<div class="l"><span>借来的钱（到手）</span><span>${yuan(P.platRecv)}</span></div>`:'') +
    `<div class="l total"><span>${P.left>=0?'签完还剩':'还差'}</span><span style="color:${P.left>=0?'var(--ink)':'var(--warn)'}">${yuan(Math.abs(P.left))}</span></div>` +
    (P.renoLater?`<p class="hint">期房交房时还要再付装修款 ${yuan(P.renoLater)}。</p>`:'') +
    (P.left>=0 && P.buffer<0 ? `<p class="hint" style="color:var(--warn)">剩下的钱撑不过 6 个月开销+月供，遇到点意外就会很紧。</p>`:'');
  updatePlats(P);
  $('#method-explain').innerHTML = methodExplainHTML({com:P.comAmt, comRate:P.comRate, gjj:P.gjjAmt, gjjRate:P.gjjRate, years:P.years, method:P.ctl.method});
  const ok = P.ok;
  $('#verdict').innerHTML = P.loanTotal===0 && P.left>=0 ? `<div class="verdict ok"><span class="ic">✓</span><div>全款买房，不用找银行。</div></div>` :
    ok ? `<div class="verdict ok"><span class="ic">✓</span><div><b>${P.bank.name}批了。</b> 商贷利率 ${P.comRate}%${P.hasNet&&!P.bank.strict?'（有网贷记录，加了 0.2%）':''}${P.gjjAmt?`，公积金 ${P.gjjRate}%`:''}。</div></div>` :
    P.reasons.map(r=>`<div class="verdict bad"><span class="ic">!</span><div>${r.t}</div></div>`).join('') + fixesHTML(P);
  const dti = P.dti;
  $('#loan-kpis').innerHTML = `
    <div class="kpi"><div class="k">首月月供${P.platPay?'（含借款）':''}</div><div class="v">${yuan(P.mPay+P.platPay)}</div></div>
    <div class="kpi"><div class="k">占税后收入${term('dti')}</div><div class="v" style="color:${dti>0.5?'var(--warn)':'var(--ink)'}">${P.mPay+P.platPay>0?pct(dti*100,0):'0%'}</div></div>
    <div class="kpi"><div class="k">房贷总利息</div><div class="v">${wan(P.intTotal)}</div></div>`;
  $('#cta-sum').innerHTML = !ok ? `<span style="color:var(--warn);font-weight:600">还不能签：${P.reasons.map(r=>({fund:'钱不够',credit:'有网贷被拒',income:'收入不够'})[r.k]).join('、')}</span><br>点右边按钮看原因和解决办法`
    : P.loanTotal>0 ? `首月月供 <b>${yuan(P.mPay)}</b><br>${P.years}年总利息 ${wan(P.intTotal)}` : `全款 <b>${wan(L.total)}</b><br>不欠银行一分钱`;
  const sb = $('#btn-sign'); sb.disabled = false; sb.setAttribute('aria-describedby','cta-sum'); sb.classList.toggle('blocked', !ok);
  sb.textContent = ok ? '签合同，开始还贷' : '为什么不能签？';
  save();
}

/* 装修效果图浏览 */
export const TIER_LABEL = {raw:'毛坯现状', none:'不装修', light:'刷墙+家电', basic:'简装', mid:'中档', lux:'豪装'};
export function updateGallery(P){
  const L = UI.listings[UI.pick]; if(!$('#render')) return;
  P = P || curPlan();
  UI.view = UI.view || {room:0, tier:P.renoKey};
  if(UI.view.tier!=='raw' && UI.view.tier!==P.renoKey) UI.view.tier = P.renoKey;
  const tiers = (L.deco==='毛坯' ? ['raw'] : []).concat(RENO_BY_DECO[L.deco]);
  const tier = UI.view.tier; const style = styleOf(tier==='raw'?'basic':tier, P.renoStyle);
  $('#seg-tier').innerHTML = tiers.map(t=>{ const cost = t==='raw'||t==='none' ? 0 : renoCostOf(L, t, styleOf(t, P.renoStyle)); return `<button data-tier="${t}" aria-pressed="${tier===t}">${TIER_LABEL[t]}${t!=='raw'?`<span class="tiny muted num"> ${cost?wan(cost):'¥0'}</span>`:''}</button>`; }).join('');
  const styles = TIER_STYLES[tier] || [];
  $('#seg-style').hidden = styles.length<2;
  $('#seg-style').innerHTML = styles.length<2 ? '' : `<span class="tiny muted" style="align-self:center">风格</span>` + styles.map(k=>`<button data-style="${k}" aria-pressed="${style===k}">${STYLES[k].name}${STYLES[k].mult!==1?`<span class="tiny muted"> ×${STYLES[k].mult}</span>`:''}</button>`).join('');
  $$('#seg-room button').forEach(b=>b.setAttribute('aria-pressed', String(+b.dataset.room===UI.view.room)));
  const rooms = roomsOf(L);
  const gkey = [L.name, UI.view.room, tier, style].join('|');
  if(UI._gkey !== gkey || !$('#render svg')) $('#render').innerHTML = interiorSVG(L, UI.view.room, tier, style) + `<button class="nav prev" data-roomnav="-1" aria-label="上一个房间">‹</button><button class="nav next" data-roomnav="1" aria-label="下一个房间">›</button><span class="room-name">${rooms[UI.view.room]} · ${UI.view.room+1}/${rooms.length}</span>`;
  UI._gkey = gkey;
  const area = renoArea(L);
  let cap;
  if(tier==='raw') cap = `<p class="small">交房时的毛坯状态：水泥墙地，水电没走，没法直接住。点下面的档位看装修后的样子。</p>`;
  else if(tier==='none') cap = `<p class="small">保持${L.deco}现状直接入住，不花装修钱。</p>`;
  else {
    const cost = P.renoCost, months = renoMonthsOf(L, tier), [a,b,c] = RENO_SPLIT[tier];
    const per = Math.round(cost/area);
    cap = `<p class="small"><b>${tier==='mid'||tier==='lux'?STYLES[style].name:''}${TIER_LABEL[tier]}</b>：约 <span class="num">${per.toLocaleString()}</span> 元/㎡ × ${area}㎡${L.gift?'（含赠送面积）':''} = <b class="num" style="color:var(--seal)">${yuan(cost)}</b>，工期约 ${months} 个月${L.deliver?'，期房交房时付':'，装修期间继续租房'}。${(L.renoMult||1)>1?`${L.type.startsWith('villa')?'别墅':'大宅'}单价按 ×${L.renoMult} 算。`:''}</p>
      <div class="split" aria-label="装修款构成"><i style="flex:${a};background:var(--s-inv)"></i><i style="flex:${b};background:var(--s-buy)"></i><i style="flex:${c};background:var(--warn)"></i></div>
      <div class="legend"><span><i style="background:var(--s-inv)"></i>硬装 ${wan(cost*a/100)}</span><span><i style="background:var(--s-buy)"></i>家具软装 ${wan(cost*b/100)}</span><span><i style="background:var(--warn)"></i>家电 ${wan(cost*c/100)}</span></div>`;
  }
  $('#o-reno').innerHTML = cap + `<p class="hint">效果图是按档位和风格生成的示意图，不是实景照片。</p>`;
}

/* 审批没过：给出一键解决办法 */
export function fixesHTML(P){
  const ks = P.reasons.map(r=>r.k); const fx = [];
  const netIds = PLATFORMS.filter(p=>['p2p','illegal','consumer'].includes(p.kind) && platAmt(p.id)>0);
  const nong = BANKS.find(b=>b.id==='nong');
  if(ks.includes('fund')){ fx.push(['plats','去借钱补齐缺口']); if(P.down>P.minDown) fx.push(['mindown',`首付降到最低 ${P.minDown}%`]); }
  if(ks.includes('credit')){ if(netIds.length) fx.push(['clearnet','清掉网贷和某呗借款']); if(P.bank.strict) fx.push(['nong','换成城郊农商行（不拒网贷）']); }
  if(ks.includes('income')){
    if(P.platPay>0) fx.push(['clearall',`清空所有借款（每月少还 ${yuan(P.platPay)}）`]);
    if(P.bank.id!=='nong') fx.push(['nong',`换城郊农商行（收入是月供 ${nong.ratio} 倍就批）`]);
    if(!P.ctl.cob) fx.push(['cob','让父母做共同还款人']);
    if(P.years<P.maxYears) fx.push(['maxyears',`贷款年限拉到 ${P.maxYears} 年`]);
    const room0 = P.income/P.bank.ratio - P.platPay;
    if(room0>0){ const maxLoan0 = room0/annuity(1, P.comRate, P.n); const d = Math.ceil((1 - maxLoan0/P.L.total)*100); if(d>P.down && d<100 && P.L.total*(d-P.down)/100 <= Math.max(0,P.left)) fx.push(['down:'+d, `首付提到 ${d}%（多付 ${wan(P.L.total*(d-P.down)/100)}）`]); }
  }
  let tip = '';
  if(ks.includes('income')){
    const room = P.income/P.bank.ratio - P.platPay;
    const rate = P.comRate, n = P.n;
    const maxLoan = room>0 ? room/annuity(1, rate, n) : 0;
    tip = room>0 ? `<p class="small">按你现在的收入，${P.bank.name}最多批每月 <b class="num">${yuan(room)}</b> 的房贷，大约能贷 <b class="num">${wan(maxLoan)}</b>（${P.years}年）。这套房要贷 <b class="num">${wan(P.loanTotal)}</b>${maxLoan<P.loanTotal*0.6?'，差得有点多，可以考虑换一套总价低一些的房子':''}。</p>`
      : `<p class="small">平台借款的月还款已经超过银行允许的上限，先把借款清掉再看。</p>`;
  }
  const seen = new Set(); const fx2 = fx.filter(([k])=>seen.has(k)?false:(seen.add(k),true));
  return tip + (fx2.length ? `<div class="quick fixes"><span class="small" style="align-self:center;font-weight:600">一键试试：</span>${fx2.map(([k,t])=>`<button type="button" class="chip" data-fix="${k}">${t}</button>`).join('')}</div>` : '');
}

export async function signFlow(){
  const P = curPlan(); if(!P.ok) return;
  const L = UI.listings[UI.pick], city = cityById(UI.cfg.cityId);
  if(P.left>=0 && P.buffer<0){
    const c = await openAsk({icon:'warn', tone:'bad', title:`签完只剩 ${yuan(P.left)}`, text:'不够撑 6 个月的生活费加月供。失业、生病，任何一件事都可能逼你去借网贷。确定要签？', options:[{id:'yes',label:'签！',cls:'primary'},{id:'no',label:'再调整一下'}]});
    if(c!=='yes') return;
  }
  const seed = (UI.seed ^ hashStr(JSON.stringify(UI.ctl)) ^ (Date.now()&0xffffff))>>>0;
  store.G = initLife(UI.cfg, L, P, seed);
  store.G.choices = drawChoices(store.G, makeRng(seed+1));
  logEv(store.G, `在${city.name}${L.district}买下${L.name}（${L.area}㎡，${wan(L.total)}），${P.loanTotal>0?`贷款 ${wan(P.loanTotal)}，${P.years} 年`:'全款'}`);
  if(P.platTotal) logEv(store.G, `为凑首付借了 ${wan(P.platTotal)}`, 'bad');
  UI.stage='life'; UI.cmp=null; save(); render(); window.scrollTo({top:0});
  const H = store.G.house;
  const how = H.movedIn ? '拿钥匙就能住。' : L.deliver ? `期房，还要 ${L.deliver} 个月才交房，交房后再装修 ${H.renoMonths} 个月。这期间你还得租房（${yuan(H.rentNow)}/月），房租和月供一起付。` : `装修 ${H.renoMonths} 个月，期间继续租房（${yuan(H.rentNow)}/月）。`;
  await openAsk({icon:'key', tone:'good', title:'合同签好了', text:`${how}${P.loanTotal>0?` 第一期月供 ${yuan(P.mPay)} 将在 ${ymText(1)} 自动扣款。`:''} 每个月点一次"下个月"，账户流水会一条条打出来。`, options:[{id:'ok',label:'开始',cls:'primary'}]});
}
