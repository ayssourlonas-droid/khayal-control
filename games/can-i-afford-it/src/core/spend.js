/* 第二关：信用卡和日常消费。纯计算，不碰页面。

   一局 12 个月。每个月开始时：发工资、付房租和生活费（钱不够就刷卡）、出上个月的信用卡账单。
   然后玩家做三类决定：
     1. 账单怎么还：全额 / 最低还款 / 账单分期 / 先不还（逾期）
     2. 这个月冒出来的 2–3 个"想买"：冲动买（刷卡）/ 计划买（进心愿单，攒钱、冷静、等促销）/ 不买
     3. 心愿单里攒够钱的东西：买 / 不要了
   点"下个月"后结算，算出这个月的开心值。

   开心会消退：每次买东西得到的开心，按"半衰期"一个月一个月往下掉；体验类会留下一部分回忆。
   欠信用卡的钱越多，压力越大，开心值越低。

   同一个种子下，每个月出现什么诱惑、冷静后还想不想要，都在开局时定好，
   所以可以用同样的经历跑出"全冲动 / 全计划 / 全不买"三个平行宇宙，和玩家自己的选择比。 */
import { CARD, KINDS, assetById, cityById, temptById, TEMPT } from '../data/index.js';
import { ymOf } from './calendar.js';
import { payroll, taxBonus } from './finance.js';
import { clamp, makeRng } from './util.js';

export const SPEND_VERSION = 1;
export const MONTHS = 12;
export const BASE_HAPPY = 50;
const EPS = 0.5;
const r10 = x => Math.round(x/10)*10;
const r2 = x => Math.round(x*100)/100;

/* ============================================================
   开局
   ============================================================ */
/* 第二关的默认值：房租按这座城市 50㎡ 左右的房子估，手头存款按两个月到手工资估 */
export function spendDefaults(cityId){
  const c = cityById(cityId);
  const net = payroll(c.salary, c, 7, c.rentDed).net;
  return {
    rent: Math.max(500, Math.round(c.price*50/(c.ratio*12)/100)*100),
    cash2: Math.max(3000, Math.round(net*2/1000)*1000),
  };
}

export function cardLimit(net){ return clamp(Math.round(net*CARD.limitMul/1000)*1000, CARD.limitMin, CARD.limitMax); }
export function lifeMulOf(net){ const L = CARD.lifestyle; return Math.round(clamp(net/L.base, L.min, L.max)*20)/20; }

/* 12 个月的诱惑日程。每个月 2–3 个，季节性的（双11、618、春节）一定会出现，偶尔夹一个意外开销。 */
export function genPlan(seed){
  const rng = makeRng((seed ^ 0x5eed5eed)>>>0);
  const normal = TEMPT.items.filter(x=>!x.accident), accidents = TEMPT.items.filter(x=>x.accident);
  const recent = []; const usedAcc = new Set(); const plan = [];
  for(let t=1; t<=MONTHS; t++){
    const m = ymOf(t).m;
    const must = normal.filter(x=>x.months && x.months.includes(m) && (x.weight||1)>=5);
    const k = must.length ? 3 : (rng() < 0.15 ? 3 : 2);
    const pick = [...must];
    while(pick.length < k){
      const pool = normal.filter(x=>!pick.includes(x) && !recent.slice(-3).some(r=>r.includes(x.id)) && (!x.months || x.months.includes(m)));
      const ws = pool.map(x=>(x.weight||1)*(x.months?3:1)); const sum = ws.reduce((a,b)=>a+b,0);
      if(!pool.length || sum<=0) break;
      let u = rng()*sum, i = 0; while(u > ws[i] && i < ws.length-1){ u -= ws[i]; i++; }
      pick.push(pool[i]);
    }
    if(t>1 && rng() < 0.15){
      const left = accidents.filter(a=>!usedAcc.has(a.id));
      if(left.length){ const a = left[Math.floor(rng()*left.length)]; usedAcc.add(a.id); if(pick.length>=3) pick.pop(); pick.push(a); }
    }
    recent.push(pick.map(x=>x.id));
    plan.push(pick.map((x,i)=>{
      const u = rng();
      const fade = x.plan && x.plan.wait>0 ? clamp((x.plan.fade||0)*2*u, 0, 0.9) : 0;
      return { key:`${t}-${i}`, id:x.id, want:r2(1-fade) };
    }));
  }
  return { plan, bonusK: r2(0.6 + rng()*0.6) };
}

export function newSpend(cfg, seed){
  const city = cityById(cfg.cityId);
  const pay = payroll(cfg.salary, city, cfg.gjjPct ?? 7, city.rentDed);
  const net = Math.round(pay.net);
  const def = spendDefaults(city.id);
  const { plan, bonusK } = genPlan(seed);
  const S = {
    v: SPEND_VERSION, seed, cityId: city.id,
    cfg: { cityId: city.id, salary: cfg.salary, bonus: cfg.bonus||0, gjjPct: cfg.gjjPct ?? 7,
      rent: cfg.rent ?? def.rent, living: cfg.living ?? city.living, cash2: cfg.cash2 ?? def.cash2 },
    t: 1, ended: false,
    net, limit: cardLimit(net), lifeMul: lifeMulOf(net), bonusK,
    cash: cfg.cash2 ?? def.cash2, startCash: cfg.cash2 ?? def.cash2,
    card: { cur:0, carry:0, arrears:0, pendInt:0, pendFee:0, insts:[], bill:null, overdue:0, streak:0, frozen:false },
    wish: [], joys: [], pens: [], later: [],
    plan, dec: { bill:null, items:{}, wish:{} },
    hist: [], open: [], rec: null, buys: [],
    tot: { income:0, fixed:0, want:0, impulse:0, planned:0, skipped:0, dropped:0, saved:0, interest:0, instFee:0, instFeeBilled:0, late:0, yield:0, onCard:0 },
  };
  openMonth(S);
  return S;
}

/* ============================================================
   价格、开心值
   ============================================================ */
export const itemOf = inst => temptById(inst.id);
export function priceOf(S, inst, how){
  const it = itemOf(inst); const base = it.price * (it.life ? S.lifeMul : 1);
  const mul = how==='impulse' ? (it.impulse?.mul ?? 1) : how==='plan' ? (it.plan?.priceMul ?? (1 - (it.plan?.disc ?? 0))) : 0;
  const p = base*mul;
  return (it.life || mul!==1) ? r10(p) : p;
}
export function joySpec(inst, how){
  const it = itemOf(inst); const k = KINDS[it.kind]; const o = how==='impulse' ? it.impulse : it.plan;
  const joy = (o?.joy ?? it.joy) * (o?.joyMul ?? 1) * (how==='plan' && (it.plan?.wait||0)>0 ? inst.want : 1);
  return { joy, hl: o?.halfLife ?? it.halfLife ?? k.halfLife, floor: it.floor ?? k.floor };
}
/* 开心值 0–100，平时是 50。买得越多，多出来的开心越不明显（边际递减），所以用一条会饱和的曲线 */
export const happyOf = x => clamp(BASE_HAPPY + 45*Math.tanh(x/35), 0, 100);
/* 开心会消退：刚买到时是 joy，之后每过 hl 个月减半，体验类最后留下 floor 比例的回忆 */
export function joyAt(j, t){
  const age = t - j.t0; if(age < 0) return 0;
  return j.joy * (j.floor + (1-j.floor)*Math.pow(0.5, age/j.hl));
}
export function joyArea(j, until=MONTHS){ let s=0; for(let t=j.t0; t<=until; t++) s += joyAt(j, t); return s; }

/* ============================================================
   信用卡
   ============================================================ */
export const instDue = card => card.insts.filter(x=>x.left>0).reduce((s,x)=>s + x.prin + x.fee, 0);
export const instPrinLeft = card => card.insts.reduce((s,x)=>s + x.prin*x.left, 0);
/* 还欠银行多少（不含这个月刚刷、下个月才出账的消费） */
export function cardDebt(S){ const c = S.card; return c.carry + c.arrears + instPrinLeft(c) + c.pendInt + c.pendFee; }
/* 已经用掉的额度：这个月刷的 + 账单里还没还的消费本金 + 分期还没还的本金 */
export function usedLimit(S){ const c = S.card; const b = c.bill; return c.cur + (b ? b.purch + b.carry : c.carry) + instPrinLeft(c); }
/* 按某种还法还完账单后，还剩多少额度（界面用来提示"刷得了吗"） */
export function roomAfterBill(S, choice){
  const c = S.card; if(c.frozen) return 0; const b = c.bill;
  if(!b) return Math.max(0, S.limit - usedLimit(S));
  const opt = billOptions(S).find(o=>o.id===(choice||'full'));
  const nonPrin = b.inst + b.int + b.fee + b.arrears, prin = b.purch + b.carry;
  const pay = Math.min(opt ? opt.pay : 0, Math.max(0, S.cash));
  const prinLeft = (choice||'full').startsWith('i') ? prin : Math.max(0, prin - Math.max(0, pay - nonPrin));
  return Math.max(0, S.limit - (c.cur + prinLeft + instPrinLeft(c)));
}

/* 分期的折算年化利率：每期还 本金/n + 本金×费率，用内部收益率法折算 */
export function aprOf(n, fee){
  const pay = 1/n + fee; let lo = 0, hi = 0.2;
  for(let k=0;k<80;k++){ const r = (lo+hi)/2; let pv = 0; for(let i=1;i<=n;i++) pv += pay/Math.pow(1+r,i); if(pv > 1) lo = r; else hi = r; }
  return (lo+hi)/2*12*100;
}
export const revolveAPR = () => CARD.dailyRate*365*100;

function makeBill(S){
  const c = S.card;
  const purch = c.cur, inst = instDue(c), int = c.pendInt, fee = c.pendFee, carry = c.carry, arrears = c.arrears;
  const total = purch + inst + int + fee + carry + arrears;
  if(total < EPS){ c.bill = null; return; }
  const min = Math.min(total, Math.ceil(inst + int + fee + arrears + CARD.minPayRate*(purch + carry)));
  S.tot.instFeeBilled += c.insts.filter(x=>x.left>0).reduce((s2,x)=>s2 + x.fee, 0);
  c.bill = { purch, inst, int, fee, carry, arrears, total, min };
  c.cur = 0;
}

/* 这个月账单的几种还法：要付多少、钱够不够 */
export function billOptions(S){
  const b = S.card.bill; if(!b) return [];
  const nonPrin = b.inst + b.int + b.fee + b.arrears; const prin = b.purch + b.carry;
  const opts = [
    { id:'full', label:'全额还款', pay:b.total, note:'不产生利息' },
    { id:'min', label:'最低还款', pay:b.min, note:`剩下的按日息万分之${CARD.dailyRate*1e4}计息${CARD.fullInterest?'，本期消费全额计息':''}` },
  ];
  if(prin >= 600) CARD.installments.forEach(o=>{
    const per = prin/o.n + prin*o.fee;
    opts.push({ id:'i'+o.n, n:o.n, label:`分 ${o.n} 期`, pay:nonPrin, per, fees:prin*o.fee*o.n, apr:aprOf(o.n,o.fee), note:`之后每月还 ${Math.round(per)} 元` });
  });
  opts.push({ id:'none', label:'先不还', pay:0, note:'逾期：违约金、上征信' });
  opts.forEach(o=>{ o.ok = o.pay <= Math.max(0,S.cash) + EPS; });
  return opts;
}

/* ============================================================
   每月开始：工资、房租、生活费、意外支出、出账单
   ============================================================ */
function payOut(S, amount, label, lines){
  if(amount <= 0) return;
  const fromCash = Math.min(amount, Math.max(0, S.cash)); S.cash -= fromCash;
  let rest = amount - fromCash;
  if(rest > EPS && !S.card.frozen){ const room = Math.max(0, S.limit - usedLimit(S)); const onCard = Math.min(rest, room); S.card.cur += onCard; S.tot.onCard += onCard; rest -= onCard; if(onCard>EPS) lines.push([`${label}（钱不够，刷卡）`, -onCard, 'card']); }
  if(rest > EPS){ S.cash -= rest; lines.push([`${label}（找朋友借的）`, -rest, 'owe']); }
  if(fromCash > EPS) lines.push([label, -fromCash]);
}
function openMonth(S){
  const city = cityById(S.cityId); const { m } = ymOf(S.t); const lines = [];
  const R = assetById(CARD.cashYieldAsset).R;
  const fund = S.wish.reduce((s,w)=>s+w.saved,0);
  const y = Math.round((Math.max(0,S.cash) + fund)*R/100/12);
  if(y > 0){ S.cash += y; S.tot.yield += y; lines.push(['零钱理财收益', y]); }
  S.cash += S.net; S.tot.income += S.net; lines.push(['工资到账（税后）', S.net]);
  if(m===1 && S.cfg.bonus>0){
    const b = Math.round(S.cfg.salary*S.cfg.bonus*S.bonusK/100)*100; const net = b - taxBonus(b);
    S.cash += net; S.tot.income += net; lines.push(['年终奖（单独计税）', net]);
  }
  makeBill(S);
  const fixed = S.cfg.rent + S.cfg.living; S.tot.fixed += fixed;
  payOut(S, S.cfg.rent, '房租', lines);
  payOut(S, S.cfg.living, '吃饭、通勤、日用', lines);
  for(const L of S.later.filter(x=>x.t===S.t)){ S.tot.fixed += L.price; payOut(S, L.price, L.name, lines); }
  S.open = lines;
  S.dec = { bill: null, items: {}, wish: {} };
}

/* ============================================================
   结算一个月
   ============================================================ */
export const matured = S => S.wish.filter(w=>w.left<=0);
export const monthItems = S => S.plan[S.t-1] || [];

/* 刷卡买得起吗：先看额度，再看现金 */
export function canPay(S, price, preferCard=true){
  const room = S.card.frozen ? 0 : Math.max(0, S.limit - usedLimit(S));
  if(preferCard && room >= price - EPS) return 'card';
  if(S.cash >= price - EPS) return 'cash';
  if(!preferCard && room >= price - EPS) return 'card';
  return null;
}
function spend(S, price, way){ if(way==='card'){ S.card.cur += price; S.tot.onCard += price; } else S.cash -= price; }

export function stepSpend(S){
  if(S.ended) return;
  const t = S.t, c = S.card, lines = [], notes = [];
  // ---- 1. 还账单 ----
  const b = c.bill; let overdue = false;
  if(b){
    const ch = S.dec.bill || 'full';
    const nonPrin = b.inst + b.int + b.fee + b.arrears, prin = b.purch + b.carry;
    const want = ch==='full' ? b.total : ch==='min' ? b.min : ch==='none' ? 0 : nonPrin;
    const required = ch.startsWith('i') ? nonPrin : b.min;
    const pay = Math.min(want, Math.max(0, S.cash)); S.cash -= pay;
    if(pay > EPS) lines.push([`还信用卡（${ch==='full'?'全额':ch==='min'?'最低还款':ch==='none'?'没还':'分期后的部分'}）`, -pay]);
    // 本月到期的分期，这一期算是出账了
    c.insts.forEach(x=>{ if(x.left>0) x.left--; }); c.insts = c.insts.filter(x=>x.left>0);
    const paidNon = Math.min(pay, nonPrin); c.arrears = nonPrin - paidNon;
    let prinLeft = prin - Math.max(0, pay - nonPrin);
    if(ch.startsWith('i') && prin > EPS){
      const o = CARD.installments.find(x=>'i'+x.n===ch);
      c.insts.push({ n:o.n, left:o.n, prin:prin/o.n, fee:prin*o.fee, rate:o.fee, t });
      S.tot.instFee += prin*o.fee*o.n;
      notes.push(`账单 ${Math.round(prin)} 元分成 ${o.n} 期，每期手续费 ${Math.round(prin*o.fee)} 元`);
      prinLeft = 0;
    }
    prinLeft = Math.max(0, prinLeft);
    c.pendInt = 0; c.pendFee = 0;
    if(prinLeft > EPS){
      const base1 = CARD.fullInterest ? b.purch : Math.min(b.purch, prinLeft);
      c.pendInt = base1*CARD.dailyRate*CARD.firstCycleDays + prinLeft*CARD.dailyRate*CARD.cycleDays;
      S.tot.interest += c.pendInt;
    }
    c.carry = prinLeft;
    c.bill = null;
    if(pay + EPS < required){
      overdue = true; c.overdue++; c.streak++;
      c.pendFee = Math.max(CARD.lateFeeMin, CARD.lateFeeRate*(required - pay)); S.tot.late += c.pendFee;
      notes.push(`没还够最低还款，逾期了：下期多收违约金 ${Math.round(c.pendFee)} 元，征信上会留下记录`);
      if(c.streak >= CARD.freezeAfter && !c.frozen){ c.frozen = true; notes.push('连续逾期，信用卡被停用了'); }
    } else c.streak = 0;
    if(c.frozen && cardDebt(S) < EPS && c.cur < EPS){ c.frozen = false; c.streak = 0; notes.push('欠款还清，信用卡恢复使用'); }
  }
  // ---- 2. 心愿单里到期的 ----
  for(const w of matured(S)){
    const d = S.dec.wish[w.key] || (w.want >= 0.5 ? 'buy' : 'drop');
    if(d==='wait'){ w.left = 1; w.waited = (w.waited||0) + 1; continue; }   // 再等一个月，接着攒
    S.wish = S.wish.filter(x=>x!==w);
    if(d==='buy'){
      S.cash += w.saved; const way = canPay(S, w.target, false) || 'cash'; spend(S, w.target, way);
      S.joys.push({ name:w.name, joy:w.joy, hl:w.hl, floor:w.floor, t0:t, price:w.target, how:'plan', id:w.id });
      S.buys.push({ t, id:w.id, name:w.name, price:w.target, how:'plan', joy:w.joy, hl:w.hl, floor:w.floor });
      S.tot.want += w.target; S.tot.planned++;
      lines.push([`心愿单：${w.name}`, -w.target, way==='card'?'card':'']);
    } else {
      S.cash += w.saved; S.tot.dropped++; S.tot.saved += w.full;
      notes.push(`心愿单里的「${w.name}」不想要了，攒的 ${Math.round(w.saved)} 元回到零钱`);
    }
  }
  // ---- 3. 这个月的诱惑 ----
  monthItems(S).forEach(inst=>{
    const it = itemOf(inst); const how = S.dec.items[inst.key] || 'skip';
    if(how==='impulse' || (how==='plan' && !(it.plan?.wait>0))){
      const price = priceOf(S, inst, how); const way = canPay(S, price, how==='impulse');
      if(!way){ notes.push(`想买「${it.name}」，但额度和现金都不够，没买成`); S.tot.skipped++; return; }
      spend(S, price, way); const js = joySpec(inst, how);
      S.joys.push({ name:it.name, ...js, t0:t, price, how, id:it.id });
      S.buys.push({ t, id:it.id, name:it.name, price, how, ...js });
      S.tot.want += price; if(how==='impulse') S.tot.impulse++; else S.tot.planned++;
      lines.push([`${how==='impulse'?'冲动买':'计划买'}：${it.name}`, -price, way==='card'?'card':'']);
    } else if(how==='plan'){
      const target = priceOf(S, inst, 'plan'); const js = joySpec(inst, 'plan');
      S.wish.push({ key:inst.key, id:it.id, name:it.name, kind:it.kind, target, full:priceOf(S, inst, 'impulse'), saved:0, left:it.plan.wait, wait:it.plan.wait, want:inst.want, joy:js.joy, base:it.plan.joy ?? it.joy, hl:js.hl, floor:js.floor, added:t });
    } else {
      S.tot.skipped++; S.tot.saved += priceOf(S, inst, 'impulse');
      const sk = it.skip || {};
      if(sk.penalty) S.pens.push({ name:it.name, val:sk.penalty, until:t + (sk.months||1) - 1 });
      if(sk.later) S.later.push({ t:t + sk.later.after, price:sk.later.price, name:sk.later.name });
    }
  });
  // ---- 4. 心愿单攒钱 ----
  for(const w of S.wish.filter(x=>x.left>0)){
    const need = (w.target - w.saved)/w.left; const put = Math.max(0, Math.min(need, S.cash));
    S.cash -= put; w.saved += put; w.left--;
    if(put > EPS) lines.push([`存进心愿单：${w.name}`, -put, 'fund']);
  }
  // ---- 5. 开心值 ----
  const joySum = S.joys.reduce((s,j)=>s + joyAt(j,t), 0);
  const antic = S.wish.reduce((s,w)=>s + (w.base||w.joy)*(KINDS[w.kind]?.antic||0), 0);
  const debt = cardDebt(S);
  const stress = Math.min(18, 18*debt/(2*Math.max(1,S.net))) + (overdue ? 12 : 0) + (S.cash < -EPS ? 8 : 0);
  const pen = S.pens.filter(p=>p.until>=t).reduce((s,p)=>s+p.val, 0);
  const happy = happyOf(joySum + antic - stress - pen);
  const fund = S.wish.reduce((s,w)=>s+w.saved,0);
  S.hist.push({ t, happy, joy:joySum, antic, stress, pen, cash:S.cash, fund, debt, cur:c.cur, nw: netWorth(S) });
  S.rec = { t, open:S.open, lines, notes, happy };
  // ---- 6. 下个月 ----
  S.t++;
  if(S.t > MONTHS){ S.ended = true; return; }
  openMonth(S);
}

/* 净资产 = 现金 + 心愿单里攒的钱 − 欠信用卡的所有钱（包括这个月刚刷、下个月要还的） */
export function netWorth(S){ const fund = S.wish.reduce((s,w)=>s+w.saved,0); return S.cash + fund - cardDebt(S) - S.card.cur; }

/* ============================================================
   平行宇宙：同样的 12 个月，换一种买法
   ============================================================ */
export const POLICIES = {
  impulse: { name:'全都冲动买', d:'想买就刷卡，账单还不起就只还最低' },
  plan: { name:'全都计划买', d:'进心愿单，冷静后还想要才买，账单全额还' },
  skip: { name:'全都不买', d:'能不花就不花，该花的也省' },
};
export function autoDecide(S, policy){
  const opts = billOptions(S); let cash = S.cash;
  if(opts.length){
    const full = opts.find(o=>o.id==='full'), min = opts.find(o=>o.id==='min');
    const o = full.ok ? full : min.ok ? min : opts.find(x=>x.id==='none');
    S.dec.bill = o.id; cash -= Math.min(o.pay, Math.max(0, cash));
  }
  /* 计划买 = 量入为出：现金不够就先不买，心愿单攒不够就再等等 */
  if(policy==='plan'){
    matured(S).forEach(w=>{
      const d = w.want < 0.6 ? 'drop' : (w.saved >= w.target - 1 || cash >= w.target - w.saved) ? 'buy' : (w.waited||0) < 2 ? 'wait' : 'drop';
      S.dec.wish[w.key] = d; if(d==='buy') cash -= Math.max(0, w.target - w.saved);
    });
    monthItems(S).forEach(inst=>{
      const it = itemOf(inst);
      if(it.plan?.wait>0){ S.dec.items[inst.key] = 'plan'; return; }
      const p = priceOf(S, inst, 'plan');
      if(cash >= p){ S.dec.items[inst.key] = 'plan'; cash -= p; } else S.dec.items[inst.key] = 'skip';
    });
    return;
  }
  monthItems(S).forEach(inst=>{ S.dec.items[inst.key] = policy; });
  matured(S).forEach(w=>{ S.dec.wish[w.key] = w.want >= 0.5 ? 'buy' : 'drop'; });
}
export function runPolicy(cfg, seed, policy){
  const S = newSpend(cfg, seed);
  while(!S.ended){ autoDecide(S, policy); stepSpend(S); }
  return S;
}

/* ============================================================
   结算
   ============================================================ */
export function summary(S){
  const H = S.hist; const n = H.length || 1;
  const avgHappy = H.reduce((s,h)=>s+h.happy,0)/n;
  const nw = H.length ? H[H.length-1].nw : netWorth(S);
  const cost = S.tot.interest + S.tot.instFee + S.tot.late;
  const buys = S.buys.map(b=>{ const area = joyArea({ joy:b.joy, hl:b.hl, floor:b.floor, t0:b.t }); return { ...b, area, per1k: b.price>0 ? area/b.price*1000 : 0 }; });
  return { avgHappy, nw, change: nw - S.startCash, want: S.tot.want, cost, interest:S.tot.interest, instFee:S.tot.instFee, late:S.tot.late,
    overdue: S.card.overdue, frozen: S.card.frozen, buys, impulse:S.tot.impulse, planned:S.tot.planned, skipped:S.tot.skipped, dropped:S.tot.dropped,
    happyLine: H.map(h=>h.happy), nwLine: H.map(h=>h.nw), debt: cardDebt(S) + S.card.cur };
}
export function universes(S){
  const cfg = { ...S.cfg }; const out = { you: summary(S) };
  for(const k of Object.keys(POLICIES)) out[k] = summary(runPolicy(cfg, S.seed, k));
  return out;
}
