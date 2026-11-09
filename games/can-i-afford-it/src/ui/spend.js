/* 第二关：信用卡和日常消费的页面（开局、按月过日子、年终结算）。计算都在 core/spend.js。 */
import { cardArtSVG, moodFaceSVG } from '../art/spend.js';
import { ymOf, ymText } from '../core/calendar.js';
import { payroll } from '../core/finance.js';
import { BASE_HAPPY, MONTHS, POLICIES, billOptions, cardLimit, itemOf, joyAt, joySpec, matured, monthItems, newSpend, priceOf, revolveAPR, roomAfterBill, spendDefaults, stepSpend, universes } from '../core/spend.js';
import { esc, pct, signYuan, wan, yuan } from '../core/util.js';
import { ASSETS, CARD, CITIES, KINDS, assetById, cityById, DATA_AS_OF } from '../data/index.js';
import { aboutLinksHTML } from './about.js';
import { charts, lineChart } from './charts.js';
import { $, $$ } from './dom.js';
import { term } from './help.js';
import { openAsk, render, toast } from './shell.js';
import { numField } from './start.js';
import { UI, save, store } from './state.js';

export const moodWord = h => h<35?'闷闷不乐':h<45?'有点丧':h<55?'平平淡淡':h<65?'小确幸':h<78?'挺开心':'有点飘';
const HOW = { impulse:'冲动买', plan:'计划买', skip:'不买' };
const fundOf = S => S.wish.reduce((s,w)=>s+w.saved,0);
const curHappy = S => S.hist.length ? S.hist[S.hist.length-1].happy : BASE_HAPPY;

/* 关卡切换（开局页和结算页顶部） */
export function levelSegHTML(){
  return `<div class="seg level-seg" role="group" aria-label="选关卡"><button data-level="house" aria-pressed="${UI.level!=='spend'}">第一关 · 买房</button><button data-level="spend" aria-pressed="${UI.level==='spend'}">第二关 · 日常消费</button></div>`;
}
export function spendStage(){ return store.S ? (store.S.ended ? 'send' : 'splay') : 'sstart'; }
function ensureCfg(){
  const d = spendDefaults(UI.cfg.cityId);
  if(UI.cfg.rent == null) UI.cfg.rent = d.rent;
  if(UI.cfg.cash2 == null) UI.cfg.cash2 = d.cash2;
}

/* ============================================================
   开局
   ============================================================ */
export function renderSpendStart(){
  ensureCfg();
  const c = UI.cfg;
  $('#v-sstart').innerHTML = `
  ${levelSegHTML()}
  <div class="hero"><div class="hero-copy"><span class="eyebrow">第二关 · 日常消费</span><h1>钱去哪了</h1><p>工资到账、信用卡账单、每个月冒出来的"想要"。过完一年，看看钱还剩多少、开心还剩多少。</p></div><div class="hero-art">${cardArtSVG()}</div></div>
  <div class="card stack">
    <h3>你的设定</h3>
    <div class="grid2">
      <div class="field"><label for="in-scity">城市</label><select class="inp" id="in-scity">${CITIES.map(ct=>`<option value="${ct.id}" ${ct.id===c.cityId?'selected':''}>${ct.name}</option>`).join('')}</select></div>
      ${numField('in2-salary','税前月薪','salary','元',0,500000)}
      ${numField('in2-cash2','手头存款','cash2','元',0,1e7)}
      ${numField('in2-rent','房租','rent','元',0,50000)}
      ${numField('in2-living','吃饭、通勤、日用','living','元',0,100000)}
      <div class="field"><span class="lab"><span>年终奖 ${term('bonus')}</span></span><div class="seg">${[0,1,2,3].map(b=>`<button data-bonus="${b}" aria-pressed="${c.bonus===b}">${b===0?'没有':b+' 个月'}</button>`).join('')}</div></div>
    </div>
    <p class="small" id="s-preview"></p>
  </div>
  <div class="card stack">
    <h3>这一关怎么玩</h3>
    <ol class="rules">
      <li><b>每个月会冒出 2–3 件想买的东西。</b>三种买法：冲动买（马上刷卡）、计划买（放进心愿单${term('wish')}，攒钱、冷静一阵再决定）、不买。</li>
      <li><b>信用卡下个月才出账单。</b>可以全额还、只还最低${term('minpay')}、分期${term('installment')}，或者干脆不还。</li>
      <li><b>开心会消退${term('adapt')}。</b>新东西的开心过得快，旅行、演唱会这类体验留下的回忆久一点。欠的钱越多，压力越大。</li>
    </ol>
    <p class="small muted">一年后，和"全都冲动买""全都计划买""全都不买"三个平行宇宙里的你比一比。</p>
  </div>
  <button class="btn primary block" data-act="s-start">开始这一年</button>
  <p class="foot">数据截至 ${DATA_AS_OF}。信用卡规则按国内常见做法简化：最低还款 10%，循环利息日息万分之五（年化约 ${Math.round(revolveAPR()*100)/100}%），多数银行全额计息；银行是虚构的。商品价格是常见价位的估算，开心值和"开心消退得多快"是游戏设定，不是测量值。你填的数字只保存在这台设备上。</p>
  ${aboutLinksHTML()}`;
  updateSpendStart();
}
export function updateSpendStart(){
  const el = $('#s-preview'); if(!el) return;
  const c = UI.cfg, city = cityById(c.cityId);
  const net = payroll(c.salary, city, c.gjjPct ?? 7, city.rentDed).net;
  const free = net - c.rent - c.living;
  el.innerHTML = `税后到手约 <b class="num">${yuan(net)}</b>/月，房租加生活 <b class="num">${yuan(c.rent + c.living)}</b>，每月能自由支配约 <b class="num" style="color:${free>0?'var(--ink)':'var(--warn)'}">${yuan(free)}</b>。信用卡额度 <b class="num">${yuan(cardLimit(Math.round(net)))}</b>${term('limit')}（到手月薪的 ${CARD.limitMul} 倍）。`;
}
export function startSpend(){
  ensureCfg();
  const c = UI.cfg;
  if(!(c.salary > 0)){ toast('请填税前月薪'); return; }
  store.S = newSpend(c, (Date.now() ^ Math.floor(Math.random()*1e9))>>>0);
  save(); render(); window.scrollTo({top:0});
}

/* ============================================================
   按月过日子
   ============================================================ */
function owedNow(S){
  const c = S.card, b = c.bill;
  return (b ? b.total : 0) + c.insts.reduce((s,x)=>s + x.prin*(x.left - (b?1:0)), 0) + c.cur;
}
function defaultBill(S){
  if(S.dec.bill) return S.dec.bill;
  const o = billOptions(S); const f = o.find(x=>x.id==='full');
  return f && f.ok ? 'full' : null;
}
/* 按现在选好的还款方式，还完账单后手上还有多少现金 */
function cashAfterBill(S){
  const id = defaultBill(S); const o = billOptions(S).find(x=>x.id===id);
  return S.cash - (o ? Math.min(o.pay, Math.max(0,S.cash)) : 0);
}
/* 这件东西按这种买法，这个月付得起吗（考虑同一个月里别的选择） */
function afford(S, key, how){
  if(how==='skip') return { ok:true };
  const inst = monthItems(S).find(x=>x.key===key); const it = itemOf(inst);
  if(how==='plan' && it.plan?.wait>0) return { ok:true };
  let room = roomAfterBill(S, defaultBill(S)), cash = cashAfterBill(S);
  monthItems(S).forEach(x=>{
    if(x.key===key) return; const h = S.dec.items[x.key]; const ix = itemOf(x);
    if(h==='impulse'){ const p = priceOf(S, x, 'impulse'); if(room >= p) room -= p; else cash -= p; }
    if(h==='plan' && !(ix.plan?.wait>0)){ const p = priceOf(S, x, 'plan'); if(cash >= p) cash -= p; else room -= p; }
  });
  const p = priceOf(S, inst, how);
  if(how==='impulse') return room >= p ? { ok:true, way:'card' } : cash >= p ? { ok:true, way:'cash' } : { ok:false, room, cash, p };
  return cash >= p ? { ok:true, way:'cash' } : room >= p ? { ok:true, way:'card' } : { ok:false, room, cash, p };
}
const hl = j => j.hl >= 12 ? '很久' : j.hl < 1 ? '不到一个月' : `约 ${Math.round(j.hl)} 个月`;

function tmHTML(S, inst){
  const it = itemOf(inst); const k = KINDS[it.kind]; const ch = S.dec.items[inst.key];
  const pI = priceOf(S, inst, 'impulse'), pP = priceOf(S, inst, 'plan');
  const jI = joySpec(inst, 'impulse'), jP = joySpec({ ...inst, want:1 }, 'plan');
  const wait = it.plan?.wait || 0; const sk = it.skip || {};
  const frozen = S.card.frozen;
  const skipSub = sk.later ? `开心 −${sk.penalty}，之后可能要花 ${yuan(sk.later.price)}` : sk.penalty ? `开心 −${sk.penalty}，持续 ${sk.months||1} 个月` : `省下 ${yuan(pI)}`;
  return `<div class="tm ${ch?'':'todo'}" id="tm-${inst.key}">
    <div class="tm-head"><span class="badge k-${it.kind}" aria-hidden="true">${esc(it.name[0])}</span><div class="tm-t"><b>${esc(it.name)}</b><span class="small muted">${esc(it.hook)}</span></div><span class="tag">${k.name}</span></div>
    <div class="choices tm-choices">
      <button class="choice" data-tm="${inst.key}:impulse" aria-pressed="${ch==='impulse'}"><span class="ct">冲动买</span><span class="ce">${esc(it.impulse.label)}</span><span class="ce"><b class="num">${yuan(pI)}</b> · ${frozen?'现金':'刷卡'}</span><span class="ce joy">开心 +${Math.round(jI.joy)}，${hl(jI)}后减半</span></button>
      <button class="choice" data-tm="${inst.key}:plan" aria-pressed="${ch==='plan'}"><span class="ct">计划买</span><span class="ce">${esc(it.plan.label)}</span>${wait>0?`<span class="ce">进心愿单，<b class="num">${yuan(pP)}</b> · ${wait} 个月后再决定</span><span class="ce joy">冷静后再看还想不想要</span>`:`<span class="ce"><b class="num">${yuan(pP)}</b> · 现金</span><span class="ce joy">开心 +${Math.round(jP.joy)}，${hl(jP)}后减半</span>`}</button>
      <button class="choice" data-tm="${inst.key}:skip" aria-pressed="${ch==='skip'}"><span class="ct">不买</span><span class="ce">${esc(sk.label||'不买了')}</span><span class="ce">${skipSub}</span></button>
    </div>
  </div>`;
}
function billHTML(S){
  const b = S.card.bill, c = S.card;
  if(!b) return `<div class="card stack" id="bill-card"><div class="row between"><h3>信用卡</h3><span class="small muted">额度 ${yuan(S.limit)}</span></div>
    <p class="small">这个月刷的钱，下个月才出账单。到期前全额还清，就一分利息都不收${term('grace')}。</p></div>`;
  const opts = billOptions(S); const sel = defaultBill(S);
  const row = (n, a) => a > 0.5 ? `<div class="rline"><span class="n">${n}</span><span class="a">${yuan(a)}</span></div>` : '';
  return `<div class="card stack" id="bill-card">
    <div class="row between"><h3>${ymOf(S.t).m}月 信用卡账单</h3><span class="small muted">最低还款 ${yuan(b.min)}</span></div>
    <div class="bill-total num">${yuan(b.total)}</div>
    <div class="stack-s small">${row('上个月刷卡', b.purch)}${row('分期本期（含手续费）', b.inst)}${row('上期没还完的', b.carry)}${row('利息', b.int)}${row('违约金', b.fee)}${row('之前欠着的利息和费用', b.arrears)}</div>
    <div class="bill-opts">${opts.map(o=>{
      const short = !o.ok ? `现金不够，还差 ${yuan(o.pay - Math.max(0,S.cash))}` : '';
      const extra = o.n ? `之后每月 ${yuan(o.per)} × ${o.n} 期，手续费共 ${yuan(o.fees)}，折算年化 ${pct(o.apr,1)}` : o.note;
      return `<button class="choice bopt ${o.id==='none'?'danger':''}" data-bill="${o.id}" aria-pressed="${sel===o.id}"><span class="ct">${o.label}</span><span class="ce"><b class="num">${o.id.startsWith('i')?`现在付 ${yuan(o.pay)}`:yuan(o.pay)}</b></span><span class="ce">${short?`<span style="color:var(--warn)">${short}</span>`:esc(extra)}</span></button>`;
    }).join('')}</div>
    <p class="small muted">分期看折算年化${term('apr')}。循环利息${term('revolve')}年化约 ${pct(revolveAPR(),2)}，是首套房贷利率的 6 倍左右。${c.overdue?`你已经逾期 ${c.overdue} 次${term('latefee')}。`:''}${c.frozen?'<b style="color:var(--warn)">卡已停用</b>，还清欠款才能恢复。':''}</p>
  </div>`;
}
function wishHTML(S){
  if(!S.wish.length) return '';
  return `<div class="card stack" id="wish-card"><div class="row between"><h3>心愿单 ${term('wish')}</h3><span class="small muted">已攒 ${yuan(fundOf(S))}</span></div>
    ${S.wish.map(w=>{
      const p = Math.min(1, w.saved/Math.max(1,w.target));
      if(w.left > 0) return `<div class="wish"><div class="row between"><b>${esc(w.name)}</b><span class="small muted num">${yuan(w.saved)} / ${yuan(w.target)}</span></div><div class="meter"><i style="width:${Math.round(p*100)}%"></i></div><span class="hint">还要等 ${w.left} 个月，这个月存 ${yuan((w.target-w.saved)/w.left)}。期待本身也让人开心${term('antic')}</span></div>`;
      const d = S.dec.wish[w.key]; const waited = w.wait + (w.waited||0);
      return `<div class="wish ripe ${d?'':'todo'}" id="wish-${w.key}"><div class="row between"><b>${esc(w.name)}</b><span class="tag ${w.saved>=w.target-1?'':'warn'}">${w.saved>=w.target-1?'攒够了':`还差 ${yuan(w.target-w.saved)}`}</span></div>
        <p class="small">冷静了 ${waited} 个月，你对它的想要还剩 <b class="num">${Math.round(w.want*100)}%</b>。现在买 ${yuan(w.target)}，开心 +${Math.round(w.joy)}。</p>
        <div class="meter"><i style="width:${Math.round(w.want*100)}%;background:${w.want<0.5?'var(--muted)':'var(--seal)'}"></i></div>
        <div class="choices"><button class="choice" data-wish="${w.key}:buy" aria-pressed="${d==='buy'}"><span class="ct">买</span><span class="ce">用攒的钱</span></button><button class="choice" data-wish="${w.key}:wait" aria-pressed="${d==='wait'}"><span class="ct">再等等</span><span class="ce">多攒一个月</span></button><button class="choice" data-wish="${w.key}:drop" aria-pressed="${d==='drop'}"><span class="ct">不要了</span><span class="ce">钱回到零钱</span></button></div>
      </div>`;
    }).join('')}
  </div>`;
}
function joyHTML(S){
  const t = S.t; const h = S.hist[S.hist.length-1];
  const act = S.joys.map(j=>({ j, now:joyAt(j,t) })).filter(x=>x.now>0.3).sort((a,b)=>b.now-a.now).slice(0,5);
  return `<div class="card stack"><div class="row between"><h3>开心会消退 ${term('adapt')}</h3><span class="small muted">本月开心值 ${Math.round(curHappy(S))}</span></div>
    ${act.length ? act.map(({j,now})=>`<div class="joyrow"><span class="n">${esc(j.name)}</span><span class="meter"><i style="width:${Math.round(now/j.joy*100)}%;background:var(--seal)"></i></span><span class="num small">+${Math.round(j.joy)} → +${Math.round(now)}</span></div>`).join('') : '<p class="small muted">还没买东西。买到手那个月最开心，之后一个月比一个月淡。</p>'}
    ${h ? `<p class="tiny muted">上个月：买的东西 +${Math.round(h.joy)} · 心愿单里的期待 +${Math.round(h.antic)} · 欠款压力 −${Math.round(h.stress)} · 没买的遗憾 −${Math.round(h.pen)}</p>` : ''}
    ${S.hist.length>=2 ? '<div class="chart" id="s-mini"></div>' : ''}
  </div>`;
}
function openHTML(S){
  return `<div class="receipt"><div class="receipt-head"><span class="t">${ymOf(S.t).m}月 已经发生的</span><span class="small muted num">${ymText(S.t)}</span></div>
    ${S.open.map(([n,a,tag])=>`<div class="rline ${a>0?'in':''}"><span class="n">${esc(n)}</span><span class="a" ${tag==='owe'?'style="color:var(--warn)"':''}>${signYuan(a)}</span></div>`).join('')}
    <div class="rline sum"><span class="n">手上现金</span><span class="a">${yuan(S.cash)}</span></div></div>`;
}
function lastHTML(S){
  const R = S.rec; if(!R) return '';
  const notes = R.notes.length ? `<div class="callout small">${R.notes.map(n=>`<div>${esc(n)}</div>`).join('')}</div>` : '';
  return `${notes}<details class="details"><summary>上个月（${ymText(R.t)}）的流水</summary><div class="stack-s small" style="padding-top:8px">${R.lines.length?R.lines.map(([n,a])=>`<div class="rline"><span class="n">${esc(n)}</span><span class="a">${signYuan(a)}</span></div>`).join(''):'<span class="muted">这个月什么都没买，也没还款</span>'}</div></details>`;
}
export function renderSpendPlay(){
  charts.list = [];
  const S = store.S; const h = curHappy(S);
  const items = monthItems(S); const done = items.filter(x=>S.dec.items[x.key]).length;
  const room = roomAfterBill(S, defaultBill(S));
  $('#v-splay').innerHTML = `
  <div class="life-cols">
  <div class="stack">
    <div class="card hud">
      <div class="avatar">${moodFaceSVG(h)}</div>
      <div class="hud-main">
        <div class="date-line"><span class="d">${ymText(S.t)}</span><span class="small muted num">第 ${S.t}/${MONTHS} 个月</span></div>
        <div class="meter" role="meter" aria-label="开心值" aria-valuenow="${Math.round(h)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.round(h)}%;background:${h<45?'var(--muted)':'var(--seal)'}"></i></div>
        <div class="row between small"><span>开心值 <b class="num">${Math.round(h)}</b> · ${moodWord(h)}</span><span class="muted">${esc(cityById(S.cityId).name)}</span></div>
      </div>
    </div>
    <div class="stat-grid">
      <div class="stat"><div class="k">现金</div><div class="v" style="color:${S.cash<0?'var(--warn)':'var(--ink)'}">${wan(S.cash)}</div></div>
      <div class="stat"><div class="k">${S.card.frozen?'信用卡':'可用额度'}</div><div class="v" style="color:${S.card.frozen?'var(--warn)':'var(--ink)'}">${S.card.frozen?'已停用':wan(room)}</div></div>
      <div class="stat"><div class="k">欠信用卡</div><div class="v" style="color:${owedNow(S)>S.net?'var(--warn)':'var(--ink)'}">${wan(owedNow(S))}</div></div>
      <div class="stat"><div class="k">心愿单已攒</div><div class="v">${wan(fundOf(S))}</div></div>
    </div>
    ${lastHTML(S)}
    ${billHTML(S)}
    ${openHTML(S)}
  </div>
  <div class="stack">
    <div class="card stack" id="tm-card"><div class="row between"><h3>这个月想买的</h3><span class="tiny muted">已决定 ${done}/${items.length}</span></div>
      ${items.map(x=>tmHTML(S, x)).join('')}
    </div>
    ${wishHTML(S)}
    ${joyHTML(S)}
  </div>
  </div>`;
  $('#action-bar').innerHTML = `<div class="in in2"><button class="btn primary" data-act="s-next">${S.t===MONTHS?'过完这一年 →':'下个月 →'}</button><button class="btn" data-act="s-more">更多</button></div>`;
  if(S.hist.length>=2) lineChart($('#s-mini'), { series:[{ name:'开心值', color:'var(--seal)', data:S.hist.map(x=>x.happy) }], xLabel:(i, axis)=>axis ? `${ymOf(S.hist[i].t).m}月` : ymText(S.hist[i].t), height:140, compact:true, fmt:v=>String(Math.round(v)), zero:false, label:'每月开心值' });
}

/* ---------- 选择 ---------- */
export function chooseBill(id){
  const S = store.S; const o = billOptions(S).find(x=>x.id===id); if(!o) return;
  if(!o.ok){ toast(`现金只有 ${yuan(S.cash)}，不够${o.label}`); return; }
  S.dec.bill = id; save(); renderSpendPlay();
}
export function chooseTm(v){
  const S = store.S; const [key, how] = v.split(':');
  if(S.dec.items[key]===how){ delete S.dec.items[key]; save(); return renderSpendPlay(); }
  const a = afford(S, key, how);
  if(!a.ok){ toast(`额度和现金都不够：还能刷 ${yuan(Math.max(0,a.room))}，现金 ${yuan(Math.max(0,a.cash))}`, 2600); return; }
  S.dec.items[key] = how;
  if(how==='impulse' && a.way==='cash') toast(S.card.frozen ? '卡已停用，用现金付' : '额度不够了，用现金付', 1800);
  save(); renderSpendPlay();
}
export function chooseWish(v){
  const S = store.S; const [key, d] = v.split(':');
  S.dec.wish[key] = d; save(); renderSpendPlay();
}

/* ---------- 下个月 ---------- */
export async function nextSpendMonth(){
  const S = store.S; if(!S || S.ended || UI.busy) return;
  if(S.card.bill && !S.dec.bill){
    const d = defaultBill(S); if(d) S.dec.bill = d;
    else { const el = $('#bill-card'); el.scrollIntoView({behavior:'smooth', block:'center'}); flash(el); toast('现金不够全额还，选一种还法'); return; }
  }
  const todo = [...monthItems(S).filter(x=>!S.dec.items[x.key]).map(x=>'#tm-'+x.key), ...matured(S).filter(w=>!S.dec.wish[w.key]).map(w=>'#wish-'+w.key)];
  if(todo.length){ const el = $(todo[0]); if(el){ el.scrollIntoView({behavior:'smooth', block:'center'}); flash(el); } toast(`还有 ${todo.length} 件事没决定`); return; }
  const b = S.card.bill;
  if(b && S.dec.bill==='none'){
    const ok = await openAsk({ icon:'warn', tone:'bad', title:'确定这个月不还信用卡？', text:`连最低还款 ${yuan(b.min)} 都不还，就是逾期：要交违约金（最低还款未还部分的 5%），征信上会留下记录，以后贷款买房都会被看到。连续逾期 ${CARD.freezeAfter} 期，卡会被停用。`, options:[{ id:'no', label:'算了，回去选', cls:'primary' }, { id:'yes', label:'就不还', cls:'danger' }] });
    if(ok!=='yes') return;
  }
  if(b && S.dec.bill==='min' && !S.seenMin){
    const left = b.purch + b.carry - Math.max(0, b.min - (b.inst+b.int+b.fee+b.arrears));
    const int = (CARD.fullInterest ? b.purch : Math.min(b.purch,left))*CARD.dailyRate*CARD.firstCycleDays + left*CARD.dailyRate*CARD.cycleDays;
    const ok = await openAsk({ title:'只还最低，会怎样', text:`这次只还 ${yuan(b.min)}，剩下 ${yuan(left)} 转到下个月。下期账单会多出利息约 <b>${yuan(int)}</b>${CARD.fullInterest?'：多数银行是"全额计息"，没还清的话，这期所有消费都从记账那天开始算利息，包括你已经还了的那部分':''}。`, options:[{ id:'yes', label:'知道了，就还最低', cls:'primary' }, { id:'no', label:'回去换一种' }] });
    if(ok!=='yes') return;
    S.seenMin = true;
  }
  const t0 = S.t;
  stepSpend(S); save(); render(); window.scrollTo({top:0});
  if(!S.ended){ const hh = S.hist[S.hist.length-1]; toast(`${ymText(t0)}过完了：开心值 ${Math.round(hh.happy)}`, 1800); }
}
function flash(el){ el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }

export async function spendMore(){
  const c = await openAsk({ title:'更多', options:[
    { id:'rules', label:'规则说明', sub:'三种买法、信用卡账单、开心值怎么算' },
    { id:'house', label:'去玩第一关', sub:'这一局会保留，随时回来' },
    { id:'restart', label:'重新开始这一年', sub:'放弃这一局，回到设定', cls:'danger' },
    { id:'x', label:'取消' },
  ]});
  if(c==='rules') return showRules();
  if(c==='house'){ UI.level = 'house'; save(); render(); window.scrollTo({top:0}); return; }
  if(c==='restart'){ const ok = await openAsk({ title:'确定放弃这一局？', text:'这一年的进度会清空。', options:[{ id:'yes', label:'重新开始', cls:'primary' }, { id:'no', label:'取消' }] }); if(ok==='yes'){ store.S = null; save(); render(); window.scrollTo({top:0}); } }
}
function showRules(){
  return openAsk({ title:'第二关规则', body:`<div class="txt stack-s">
    <p><b>三种买法</b>：冲动买 = 马上刷卡，价格按原价甚至加价；计划买 = 放进心愿单，每月攒一点，到期后看看自己还想不想要（经常会遇上促销，也经常不想要了）；不买 = 钱留着，但该花的钱省掉会有代价。</p>
    <p><b>信用卡</b>：这个月刷的，下个月出账单。全额还不收利息；只还最低（10%）的话，剩下的按日息万分之五计息，而且多数银行全额计息；分期按每期手续费收钱，折算年化约 13%–14%；不还就是逾期。</p>
    <p><b>开心值</b>：平时是 50。买到东西那个月最开心，之后按"半衰期"一个月一个月变淡；体验类会留下一部分回忆；心愿单里等着的东西会带来一点期待；欠款越多压力越大；该花没花（比如没随份子、牙疼不看）会扣开心值。买得越多，多出来的开心越不明显。</p>
    <p>这些开心值的数字是游戏设定，方向参考了心理学研究，不是测量值。</p></div>`, options:[{ id:'ok', label:'懂了', cls:'primary' }] });
}

/* ============================================================
   年终结算
   ============================================================ */
const SERIES = [
  { k:'you', name:'你', color:'var(--ink)' },
  { k:'impulse', name:POLICIES.impulse.name, color:'var(--s-buy)' },
  { k:'plan', name:POLICIES.plan.name, color:'var(--s-inv)' },
  { k:'skip', name:POLICIES.skip.name, color:'var(--muted)', dash:true },
];
export function renderSpendEnd(){
  charts.list = [];
  const S = store.S; const U = universes(S); const you = U.you;
  const a = assetById(UI.asset || 'csi');
  const best = you.buys.filter(b=>b.price>=100).sort((x,y)=>y.per1k-x.per1k);
  const top = best.slice(0,3), bottom = best.length>3 ? best.slice(-3).reverse() : [];
  /* 和"全计划"比少存了多少；如果你比全计划存得多，就和"全冲动"比 */
  const gapPlan = U.plan.change - you.change, gapImp = you.change - U.impulse.change;
  const d = gapPlan > 1000 ? gapPlan : gapImp; const vsPlan = gapPlan > 1000;
  const fv = (amt, n) => { const r = a.R/100; return r>0 ? amt*(Math.pow(1+r,n)-1)/r : amt*n; };
  const verdict = (()=>{
    const dh = U.impulse.avgHappy - U.plan.avgHappy, dm = U.plan.change - U.impulse.change;
    return `全都计划买，比全都冲动买少花 <b class="num">${wan(U.impulse.want - U.plan.want)}</b>，年底多剩 <b class="num">${wan(dm)}</b>，平均开心值${dh>0.5?`只低 <b class="num">${dh.toFixed(1)}</b>`:dh<-0.5?`反而高 <b class="num">${(-dh).toFixed(1)}</b>`:'几乎一样'}。全都不买钱最多，但开心值最低：不是不买，是有计划、有节制地买。`;
  })();
  $('#v-send').innerHTML = `
  ${levelSegHTML()}
  <div class="card stack">
    <span class="eyebrow">第二关 · ${ymText(1)} – ${ymText(MONTHS)}</span>
    <h2>这一年结束了</h2>
    <div class="kpis">
      <div class="kpi"><div class="k">年底比年初</div><div class="v" style="color:${you.change>=0?'var(--plus)':'var(--down)'}">${you.change>=0?'+':''}${wan(you.change)}</div></div>
      <div class="kpi"><div class="k">平均开心值</div><div class="v">${you.avgHappy.toFixed(1)}</div></div>
      <div class="kpi"><div class="k">花在"想要"上</div><div class="v">${wan(you.want)}</div></div>
      <div class="kpi"><div class="k">给银行的利息和费用</div><div class="v" style="color:${you.cost>0?'var(--warn)':'var(--ink)'}">${wan(you.cost)}</div></div>
    </div>
    <p class="small">冲动买 ${you.impulse} 次 · 计划买 ${you.planned} 次 · 不买 ${you.skipped} 次 · 心愿单里放弃 ${you.dropped} 件${you.overdue?` · <span style="color:var(--warn)">逾期 ${you.overdue} 次</span>`:''}${you.debt>1?` · 年底还欠信用卡 ${wan(you.debt)}`:''}</p>
  </div>
  <div class="card stack">
    <h3>平行宇宙：同样的一年，换一种买法</h3>
    <div class="tbl-wrap"><table class="tbl fit"><thead><tr><th></th><th>存下</th><th>开心</th><th>花掉</th><th>利息</th></tr></thead><tbody>
      ${SERIES.map(s=>{ const u = U[s.k]; return `<tr ${s.k==='you'?'class="me"':''}><th><span class="sw" style="background:${s.color}"></span> ${s.name}</th><td class="num" style="color:${u.change>=0?'var(--plus)':'var(--down)'}">${u.change>=0?'+':''}${wan(u.change)}</td><td class="num">${u.avgHappy.toFixed(1)}</td><td class="num">${wan(u.want)}</td><td class="num">${wan(u.cost)}</td></tr>`; }).join('')}
    </tbody></table></div>
    <p class="tiny muted">存下 = 年底比年初多出来的钱（扣掉欠信用卡的）；开心 = 12 个月的平均开心值；花掉 = 花在"想要"上的钱；利息 = 给银行的利息、分期手续费和违约金。</p>
    <p class="small">${verdict}</p>
    <h3>每个月的开心值</h3><div class="chart" id="s-happy"></div>
    <h3>手上的钱（扣掉欠信用卡的）</h3><div class="chart" id="s-nw"></div>
    <div class="legend">${SERIES.map(s=>`<span><span class="ln" style="border-color:${s.color};${s.dash?'border-top-style:dashed':''}"></span>${s.name}</span>`).join('')}</div>
  </div>
  ${best.length ? `<div class="card stack">
    <h3>最值和最不值的一笔</h3>
    <p class="small muted">"一年累计开心"= 从买到手那个月到年底，每个月的开心加起来。体验类和用得上的东西消退得慢，累计更多。</p>
    <div class="stack-s"><b class="small">最值</b>${top.map(b=>buyRow(b,true)).join('')}</div>
    ${bottom.length?`<div class="stack-s"><b class="small">最不值</b>${bottom.map(b=>buyRow(b,false)).join('')}</div>`:''}
  </div>` : ''}
  ${d > 500 ? `<div class="card stack">
    <h3>如果每年都差这么多</h3>
    <p class="small">${vsPlan?`你比"全都计划买"少存了 <b class="num">${yuan(d)}</b>。`:`你比"全都冲动买"多存了 <b class="num">${yuan(d)}</b>。`}如果每年都差这么多，把这笔钱每年投进 <b>${a.name}</b>（假设年化 ${a.R}%，不是预测）：</p>
    <div class="seg">${ASSETS.map(x=>`<button data-asset="${x.id}" aria-pressed="${a.id===x.id}">${x.name}</button>`).join('')}</div>
    <div class="pu"><div class="w"><div class="k">10 年后</div><div class="v">${wan(fv(d,10))}</div></div><div class="w"><div class="k">30 年后</div><div class="v">${wan(fv(d,30))}</div></div></div>
    <p class="small muted">本金分别是 ${wan(d*10)} 和 ${wan(d*30)}，多出来的是复利。</p>
  </div>` : ''}
  <div class="row"><button class="btn primary" data-act="s-again">再过一年（换一批诱惑）</button><button class="btn" data-act="s-reset">改设定</button></div>
  ${aboutLinksHTML()}`;
  const xl = (i, axis) => axis ? `${ymOf(i+1).m}月` : ymText(i+1);
  lineChart($('#s-happy'), { series:SERIES.map(s=>({ name:s.name, color:s.color, dash:s.dash, data:U[s.k].happyLine })), xLabel:xl, height:220, fmt:v=>String(Math.round(v)), zero:false, endLabels:false, label:'四个平行宇宙每月的开心值' });
  lineChart($('#s-nw'), { series:SERIES.map(s=>({ name:s.name, color:s.color, dash:s.dash, data:U[s.k].nwLine })), xLabel:xl, height:220, endLabels:false, label:'四个平行宇宙手上的钱' });
}
function buyRow(b, good){
  return `<div class="buyrow ${good?'good':'bad'}"><span class="badge k-${itemOf(b).kind} sm" aria-hidden="true">${esc(b.name[0])}</span><span class="n"><b>${esc(b.name)}</b><small>${HOW[b.how]} · ${yuan(b.price)} · ${ymText(b.t)}</small></span><span class="num small">一年累计开心 ${Math.round(b.area)}<br><span class="muted">每千元 ${b.per1k.toFixed(1)}</span></span></div>`;
}
export function spendAgain(){ const S = store.S; store.S = newSpend({ ...UI.cfg }, (S.seed*2654435761 + 97)>>>0); save(); render(); window.scrollTo({top:0}); }
export function spendReset(){ store.S = null; save(); render(); window.scrollTo({top:0}); }
