/* 金融计算：等额本息/本金、逐月扣款、利率重定价、个税和五险一金、组合贷计划表。纯函数，有单元测试。 */

/* ============================================================
   金融计算
   ============================================================ */
export function annuity(P, rate, n){ const r = rate/1200; if(n<=0) return P; if(r===0) return P/n; const k=Math.pow(1+r,n); return P*r*k/(k-1); }
export function schedule(P, rate, n, method){
  const rows=[]; let bal=P; const r=rate/1200; const pay=annuity(P,rate,n); const bp=P/n;
  for(let i=0;i<n;i++){ const int=bal*r; let pr = method==='ep' ? bp : pay-int; if(i===n-1) pr=bal; bal-=pr; rows.push({int, pr, pay:int+pr, bal:Math.max(0,bal)}); }
  return rows;
}
export function newLoan(kind, P, rate, months, method){
  const L = {kind, principal:P, balance:P, rate, months, left:months, method, pay:0, basePrin:0, paidInt:0, paidPrin:0};
  loanReset(L); return L;
}
export function loanReset(L){ if(L.left<=0||L.balance<=0){L.pay=0;L.basePrin=0;return;} if(L.method==='ep') L.basePrin=L.balance/L.left; else L.pay=annuity(L.balance,L.rate,L.left); }
export function loanDue(L){
  if(L.balance<=0||L.left<=0) return {int:0,pr:0,total:0};
  const int = L.balance*L.rate/1200;
  let pr = L.method==='ep' ? L.basePrin : L.pay-int;
  if(L.left<=1 || pr>L.balance) pr=L.balance;
  return {int, pr, total:int+pr};
}
export function loanApply(L,due){ L.balance-=due.pr; L.left-=1; L.paidInt+=due.int; L.paidPrin+=due.pr; if(L.balance<0.5||L.left<=0){L.balance=0;L.left=0;} }

export const TAX_Y = [[36000,.03,0],[144000,.10,2520],[300000,.20,16920],[420000,.25,31920],[660000,.30,52920],[960000,.35,85920],[Infinity,.45,181920]];
export const TAX_B = [[3000,.03,0],[12000,.10,210],[25000,.20,1410],[35000,.25,2660],[55000,.30,4410],[80000,.35,7160],[Infinity,.45,15160]];
export function taxAnnual(x){ if(x<=0) return 0; for(const [lim,r,q] of TAX_Y) if(x<=lim) return x*r-q; return 0; }
export function taxBonus(b){ if(b<=0) return 0; const m=b/12; for(const [lim,r,q] of TAX_B) if(m<=lim) return b*r-q; return 0; }
/* 月薪 → 到手：社保个人 10.5%（养老8+医疗2+失业0.5），公积金按比例，基数上限约为城市平均工资 1.8 倍 */
export function payroll(gross, city, gjjPct, deduct){
  if(gross<=0) return {net:0, si:0, gjj:0, tax:0, gjjIn:0};
  const base = Math.min(gross, city.salary*1.8);
  const si = base*0.105, gjj = base*gjjPct/100;
  const tax = taxAnnual((gross - si - gjj - 5000 - deduct)*12)/12;
  return {net: gross-si-gjj-tax, si, gjj, tax, gjjIn: gjj*2};
}
export function firstPay(P, rate, n, method){ if(P<=0) return 0; return method==='ep' ? P/n + P*rate/1200 : annuity(P,rate,n); }
export function totalInterest(P, rate, n, method){ if(P<=0) return 0; if(method==='ep') return P*rate/1200*(n+1)/2; return annuity(P,rate,n)*n - P; }
export function combinedSchedule(c, method){
  const n = c.years*12; const a = c.com>0?schedule(c.com,c.comRate,n,method):[]; const b = c.gjj>0?schedule(c.gjj,c.gjjRate,n,method):[];
  return Array.from({length:n},(_,i)=>{ const x=a[i]||{int:0,pr:0,pay:0,bal:0}, y=b[i]||{int:0,pr:0,pay:0,bal:0}; return {int:x.int+y.int, pr:x.pr+y.pr, pay:x.pay+y.pay, bal:x.bal+y.bal}; });
}
