/* 贷款方案：首付、公积金、银行审批、税费、借款平台汇总成一个方案对象。 */
import { annuity, firstPay, payroll, totalInterest } from './finance.js';
import { renoCostOf, styleOf } from './renovation.js';
import { clamp, wan, yuan } from './util.js';
import { BANKS, GJJ_RATE, GJJ_RATE_SHORT, LPR5, PLATFORMS, RENO_BY_DECO, cityById } from '../data/index.js';

/* ---------- 贷款方案 ---------- */
export function defaultLoanCtl(L, cfg){
  const city = cityById(cfg.cityId);
  const commercial = L.commercial;
  const minDown = commercial?30:15;
  const funds = cfg.savings + cfg.gift;
  // 默认首付：钱够就首付 30%，否则最低
  let down = commercial ? 30 : 30;
  if(L.total*0.3 + L.total*0.04 > funds) down = minDown;
  if(L.total <= funds*0.7) down = 100;
  const reno = RENO_BY_DECO[L.deco][L.deco==='毛坯'?0:(L.deco==='旧装'||L.deco==='精装')?1:0];
  return {down, bank:'anju', gjj:0, years: commercial?10:Math.min(30, 70-cfg.age), method:'ei', reno, style:styleOf(reno,''), cob:false, plats:{}};
}

export function loanPlan(L, cfg, ctl){
  const city = cityById(cfg.cityId);
  const commercial = L.commercial;
  const gp = city.gjjPolicy || null;                       // 城市公积金特别政策（如成都 2026 新政）
  const newHomePolicy = !!gp && L.cat.startsWith('新房');
  const minDown = commercial ? 30 : (ctl.gjj>0 ? (newHomePolicy ? gp.newHomeMinDown : 20) : 15);
  const down = clamp(ctl.down, minDown, 100);
  const downAmt = Math.round(L.total*down/100);
  const loanTotal = L.total - downAmt;
  const gjjMaxW = gp ? (cfg.spouse ? gp.dual : gp.single) * (newHomePolicy ? gp.newHomeBoost : 1) : city.gjjMax;
  const gjjCap = commercial ? 0 : Math.min(gjjMaxW*1e4, loanTotal);
  const gjjAmt = clamp(ctl.gjj, 0, gjjCap);
  const comAmt = loanTotal - gjjAmt;
  const maxYears = commercial ? 10 : Math.min(30, 70-cfg.age);
  const years = clamp(ctl.years, 1, maxYears);
  const n = years*12;
  const bank = BANKS.find(b=>b.id===ctl.bank) || BANKS[0];
  const plats = PLATFORMS.map(p=>({p, amt:ctl.plats[p.id]||0})).filter(x=>x.amt>0);
  const hasNet = plats.some(x=>['p2p','illegal','consumer'].includes(x.p.kind));
  let spread = commercial ? 0.3 : bank.spread;
  if(hasNet && !bank.strict) spread += 0.2;
  const comRate = Math.round((LPR5 + spread)*100)/100;
  const gjjRate = years<=5 ? GJJ_RATE_SHORT : GJJ_RATE;
  const comPay = firstPay(comAmt, comRate, n, ctl.method);
  const gjjPay = firstPay(gjjAmt, gjjRate, n, ctl.method);
  const mPay = comPay + gjjPay;
  const intTotal = totalInterest(comAmt, comRate, n, ctl.method) + totalInterest(gjjAmt, gjjRate, n, ctl.method);
  // 税费
  const deedRate = commercial ? 3 : (L.area<=140 ? 1 : 1.5);
  const deed = Math.round(L.total*deedRate/100);
  const agent = L.cat==='二手' ? Math.round(L.total*0.02) : 0;
  const sellerTax = L.sellerTax ? Math.round(L.total*0.01) : 0;
  const fund = L.cat.startsWith('新房') ? Math.round(L.area*150) : 0;
  const misc = loanTotal>0 ? 1500 : 500;
  const renoKey = RENO_BY_DECO[L.deco].includes(ctl.reno) ? ctl.reno : RENO_BY_DECO[L.deco][0];
  const renoStyle = styleOf(renoKey, ctl.style);
  const renoCost = renoCostOf(L, renoKey, renoStyle);
  const renoNow = L.deliver ? 0 : renoCost, renoLater = L.deliver ? renoCost : 0;
  const upfront = downAmt + deed + agent + sellerTax + fund + misc + renoNow;
  const platTotal = plats.reduce((s,x)=>s+x.amt,0);
  const platRecv = plats.reduce((s,x)=>s+(x.p.kind==='illegal'?x.amt*0.7:x.amt),0);
  const platPay = plats.reduce((s,x)=>s+(x.p.apr===0 ? x.amt/x.p.term : annuity(x.amt, x.p.apr, x.p.term)),0);
  const funds = cfg.savings + cfg.gift + platRecv;
  const left = funds - upfront;
  // 收入（审批口径：税后）
  const own = payroll(cfg.salary, city, cfg.gjjPct, loanTotal>0?1000:city.rentDed);
  const spouseNet = cfg.spouse ? payroll(cfg.spouseSalary, city, cfg.gjjPct, 0).net : 0;
  const income = own.net + spouseNet + (ctl.cob ? 6000 : 0);
  const debtPay = mPay + platPay;
  const need = bank.ratio * debtPay;
  const reasons = [];
  if(left < 0) reasons.push({k:'fund', t:`首付、税费和装修还差 ${wan(-left)}。可以提高贷款比例、换便宜的房，或者去借钱。`});
  if(loanTotal>0 && bank.strict && hasNet) reasons.push({k:'credit', t:`征信上有网贷/消费借款记录，${bank.name}直接拒贷。换一家银行，或者别借网贷。`});
  if(loanTotal>0 && income < need) reasons.push({k:'income', t:`${bank.name}要求月收入 ≥ 月负债的 ${bank.ratio} 倍：需要 ${yuan(need)}，你的税后收入是 ${yuan(income)}。`});
  const buffer = left - (cfg.living + mPay + platPay)*6;
  return {L, ctl:{...ctl, reno:renoKey, style:renoStyle, down, years, gjj:gjjAmt}, gjjMaxW, gjjPolicy:gp, newHomePolicy, renoStyle, minDown, maxYears, gjjCap, down, downAmt, loanTotal, gjjAmt, comAmt, years, n, bank, spread, comRate, gjjRate, comPay, gjjPay, mPay, intTotal,
    deedRate, deed, agent, sellerTax, fund, misc, renoKey, renoCost, renoNow, renoLater, upfront, plats, platTotal, platRecv, platPay, funds, left, own, spouseNet, income, debtPay, need, reasons, ok: reasons.length===0, buffer, hasNet,
    dti: own.net+spouseNet>0 ? debtPay/(own.net+spouseNet) : 9};
}
