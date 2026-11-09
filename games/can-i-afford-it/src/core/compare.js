/* 买房 vs 租房投资的独立模型：净资产曲线、波动区间、盈亏平衡房价涨幅。 */
import { sellCost } from './engine.js';
import { schedule } from './finance.js';
import { makeRng } from './util.js';

/* ---------- 独立对比模型（对比页用） ---------- */
export function compareModel(p){
  const loan = p.price*(1-p.down/100);
  const n = p.years*12, H = p.horizon*12;
  const sch = loan>0 ? schedule(loan, p.rate, n, p.method) : [];
  const rm = Math.log(1+p.R/100)/12;
  const buy=[], rent=[], rows=[];
  let port = p.price*p.down/100 + p.fees;
  let rentSum = 0, intSum = 0;
  for(let m=1;m<=H;m++){
    const row = sch[m-1]; const pay = row?row.pay:0, bal = row?row.bal:0; if(row) intSum += row.int;
    const rentM = p.rent*Math.pow(1+p.rentG/100, Math.floor((m-1)/12));
    const hv = p.price*Math.pow(1+p.houseG/100, m/12);
    port = port*Math.exp(rm) + (pay + p.fee - rentM);
    rentSum += rentM;
    buy.push(hv*(1-sellCost) - bal); rent.push(port);
    rows.push({m, hv, bal, pay, rentM, port, eq: hv*(1-sellCost)-bal});
  }
  return {buy, rent, rows, rentSum, intSum, loan, pay1: sch[0]?sch[0].pay:0};
}
export function compareBand(p, sigma, paths=160){
  const H = p.horizon*12; const loan = p.price*(1-p.down/100); const sch = loan>0 ? schedule(loan, p.rate, p.years*12, p.method) : [];
  const rm = Math.log(1+p.R/100)/12, s = sigma/100/Math.sqrt(12);
  const all = Array.from({length:H}, ()=>new Float64Array(paths));
  const rng = makeRng(12345);
  for(let k=0;k<paths;k++){
    let port = p.price*p.down/100 + p.fees;
    for(let m=1;m<=H;m++){ const row=sch[m-1]; const pay=row?row.pay:0; const rentM = p.rent*Math.pow(1+p.rentG/100, Math.floor((m-1)/12)); port = port*Math.exp(rm + s*rng.normal()) + (pay + p.fee - rentM); all[m-1][k] = port; }
  }
  const q = (arr, f) => { const a = Array.from(arr).sort((x,y)=>x-y); return a[Math.floor(f*(a.length-1))]; };
  return all.map(a=>({lo:q(a,0.25), hi:q(a,0.75)}));
}
export function breakevenG(p){
  const f = g => { const r = compareModel({...p, houseG:g}); return r.buy[r.buy.length-1] - r.rent[r.rent.length-1]; };
  let lo=-15, hi=25; if(f(lo)>0) return -Infinity; if(f(hi)<0) return Infinity;
  for(let i=0;i<50;i++){ const mid=(lo+hi)/2; if(f(mid)>0) hi=mid; else lo=mid; }
  return (lo+hi)/2;
}
