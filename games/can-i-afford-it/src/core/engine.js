/* 人生引擎：每月工资、扣款、随机事件、逾期和断供、平行宇宙对比。和界面无关，弹窗通过 setAsk / setShortage 注入。 */
import { ymOf } from './calendar.js';
import { annuity, loanApply, loanDue, loanReset, newLoan, payroll, taxBonus } from './finance.js';
import { renoMonthsOf } from './renovation.js';
import { clamp, hashStr, makeRng, pct, wan, yuan } from './util.js';
import { LPR5, MARKETS, cityById, platById } from '../data/index.js';

/* ---------- 开始人生 ---------- */
export function newDebt(p, amt){
  const pay = p.apr===0 ? amt/p.term : annuity(amt, p.apr, p.term);
  return {id:p.id, name:p.name, kind:p.kind, apr:p.apr, balance:amt, left:p.term, pay, orig:amt};
}
export function initLife(cfg, L, plan, seed){
  const city = cityById(cfg.cityId);
  const loans = [];
  if(plan.comAmt>0) loans.push(Object.assign(newLoan('com', plan.comAmt, plan.comRate, plan.n, plan.ctl.method), {spread:plan.spread, name: L.commercial?'商业用房贷款':'商业贷款'}));
  if(plan.gjjAmt>0) loans.push(Object.assign(newLoan('gjj', plan.gjjAmt, plan.gjjRate, plan.n, plan.ctl.method), {name:'公积金贷款'}));
  const debts = plan.plats.map(x=>newDebt(x.p, x.amt));
  const renoMonths = renoMonthsOf(L, plan.renoKey);
  const g = {
    v:2, seed, rs:seed, cfg:{...cfg}, L, planSnap:{down:plan.down, downAmt:plan.downAmt, comRate:plan.comRate, gjjRate:plan.gjjRate, years:plan.years, method:plan.ctl.method, bank:plan.bank.name, upfront:plan.upfront, intTotal:plan.intTotal, mPay:plan.mPay, loanTotal:plan.loanTotal, fees:plan.deed+plan.agent+plan.sellerTax+plan.fund+plan.misc, reno:plan.renoCost},
    t:0, cash:plan.left, gjjBal:0, salary:cfg.salary, married:!!cfg.spouse, spouseSalary:cfg.spouse?cfg.spouseSalary:0,
    employed:true, unemp:0, nextSalary:0, living:cfg.living, kids:0, cat:0, roomRent:0, perf:0, love:0, car:0, age:cfg.age,
    loans, debts, lpr:LPR5,
    house:{value:L.total, movedIn: !L.deliver && renoMonths===0, deliverLeft:L.deliver, renoLeft: L.deliver?0:renoMonths, renoLater:plan.renoLater, renoMonths, rentNow:Math.max(300,Math.round(L.rent*0.75/50)*50), lanwei:0},
    st:{stress:30, hair:100, happy:62, health:82}, bump:0,
    overdue:0, overdueEver:0, netEver:plan.hasNet?1:0, bankclUsed: plan.plats.some(x=>x.p.id==='bankcl') ? 1 : 0,
    mu: cfg.market==='random' ? -0.01 : MARKETS[cfg.market].mu,
    hist:[], log:[], last:null, choices:[], chosen:null, gjjSub: (city.gjjPolicy && city.gjjPolicy.subsidyCap && plan.gjjAmt>0) ? city.gjjPolicy.subsidyCap : 0, gjjSubRate: city.gjjPolicy?.subsidyRate || 0,
    tot:{int:0, prin:0, platInt:0, rent:0, fee:0, prepay:0, mortPaid:0},
    cmp:{invest0: plan.upfront - plan.platRecv, contribs:[], rentPaid:0},
    horizon: plan.loanTotal>0 ? plan.n : 360, hadLoan: plan.loanTotal>0,
    ended:null,
  };
  return g;
}

export const rngOf = g => { const r = makeRng(0); r.setState(g.rs); return r; };
export const mortBalance = g => g.loans.reduce((s,l)=>s+l.balance,0);
export const debtBalance = g => g.debts.reduce((s,d)=>s+d.balance,0);
export const sellCost = 0.02;
export function equityNow(g){ return g.house.value*(1-sellCost) - mortBalance(g) - debtBalance(g); }
export function rentEqAt(g, t){ return g.L.rent*Math.pow(1.01, Math.floor((t-1)/12)); }
export function logEv(g, text, tone){ g.log.unshift({t:g.t, text, tone}); if(g.log.length>40) g.log.length=40; }

/* ---------- 每月可选（像外卖挑单） ---------- */
export const CHOICES = [
  {id:'side',  t:'接个周末私活',   e:'+¥3,000 · 健康-4 · 发量-1', ok:g=>g.employed, fx:{cash:3000, health:-4, hair:-1}},
  {id:'ride',  t:'下班跑两周外卖', e:'+¥1,800 · 健康-5 · 幸福-2', fx:{cash:1800, health:-5, happy:-2}},
  {id:'ot',    t:'主动加班冲绩效', e:'+¥1,200 · 发量-2 · 涨薪概率↑', ok:g=>g.employed, fx:{cash:1200, hair:-2, perf:1}},
  {id:'cook',  t:'这个月只吃食堂', e:'省¥900 · 幸福-3', fx:{cash:900, happy:-3}},
  {id:'dine',  t:'下馆子犒劳自己', e:'-¥800 · 幸福+5', fx:{cash:-800, happy:5}},
  {id:'trip',  t:'带爸妈出去玩',   e:'-¥6,000 · 幸福+12', fx:{cash:-6000, happy:12}},
  {id:'phone', t:'换台新手机',     e:'-¥6,000 · 幸福+5', fx:{cash:-6000, happy:5}},
  {id:'gym',   t:'办张健身年卡',   e:'-¥2,500 · 健康+10', fx:{cash:-2500, health:10}},
  {id:'course',t:'报班考证',       e:'-¥4,000 · 涨薪概率↑↑', fx:{cash:-4000, perf:2}},
  {id:'cat',   t:'领养一只猫',     e:'-¥2,000 · 每月+¥300开销 · 幸福+15', ok:g=>!g.cat, fx:{cash:-2000, happy:15, cat:1}},
  {id:'room',  t:'把次卧租出去',   e:'每月多收一份房租 · 幸福-6', ok:g=>g.house.movedIn && g.L.area>=80 && !g.roomRent && !g.kids, fx:{room:1, happy:-6}},
  {id:'xianyu',t:'闲鱼卖掉闲置',   e:'+¥1,200', fx:{cash:1200}},
  {id:'lotto', t:'买两张彩票',     e:'-¥20 · 万一呢', fx:{cash:-20, lotto:1}},
  {id:'date',  t:'约会 / 相亲',    e:'-¥1,500 · 幸福+3 · 结婚概率↑', ok:g=>!g.married && g.age<40, fx:{cash:-1500, happy:3, love:1}},
  {id:'massage',t:'去做个按摩',    e:'-¥400 · 压力-6', fx:{cash:-400, stress:-6}},
];
export function drawChoices(g, rng){
  const pool = CHOICES.filter(c=>!c.ok || c.ok(g));
  const out=[]; while(out.length<3 && pool.length){ out.push(pool.splice(Math.floor(rng()*pool.length),1)[0].id); }
  return out;
}

/* ---------- 随机事件 ---------- */
export const EVENTS = [
  {id:'promo', w:g=>g.employed?0.07+g.perf*0.08:0, run(g,r,R){ const p=r.range(0.08,0.2); g.salary=Math.round(g.salary*(1+p)/100)*100; g.perf=0; g.st.happy+=8; return {icon:'up',tone:'good',title:'升职加薪',text:`领导终于看见你了，月薪涨 ${pct(p*100,0)}，现在税前 ${yuan(g.salary)}。`}; }},
  {id:'bonus', w:g=>g.employed?0.15:0, run(g,r,R){ const a=Math.round(r.range(3000,15000)/100)*100; g.cash+=a; R.push(['项目奖金',a]); return {log:`项目上线，发了 ${yuan(a)} 奖金`, tone:'good'}; }},
  {id:'layoff',w:g=>g.employed?0.035:0, async run(g,r,R){
      const comp = Math.round(g.salary*r.int(2,5));
      const c = await ask({icon:'brief',tone:'bad',title:'公司"优化"了你',text:`部门裁员，给了 N+1 补偿 ${yuan(comp)}。房贷可不等人。`, options:[
        {id:'fast',label:'马上找工作',sub:'空窗 1 个月，新工作降薪 15%~25%'},
        {id:'rest',label:'拿钱歇一歇，慢慢找',sub:'空窗 3~6 个月，每月领约 ¥1,800 失业金，新工作薪资持平'}]});
      g.cash+=comp; R.push(['裁员补偿 N+1',comp]); g.employed=false; g.bump+=18; g.st.happy-=10;
      if(c==='fast'){ g.unemp=1; g.nextSalary=Math.round(g.salary*r.range(0.75,0.85)/100)*100; } else { g.unemp=r.int(3,6); g.nextSalary=Math.round(g.salary*r.range(0.92,1.08)/100)*100; }
      return {log:`被裁员，拿到补偿 ${yuan(comp)}，预计空窗 ${g.unemp} 个月`, tone:'bad'}; }},
  {id:'cut',   w:g=>g.employed?0.035:0, run(g,r,R){ const p=r.range(0.08,0.2); g.salary=Math.round(g.salary*(1-p)/100)*100; g.st.happy-=6; g.bump+=8; return {icon:'down',tone:'bad',title:'降本增效',text:`公司统一降薪 ${pct(p*100,0)}，你的税前月薪变成 ${yuan(g.salary)}。月供一分没少。`}; }},
  {id:'sick',  w:g=>0.18+(100-g.st.health)/250, run(g,r,R){ const a=Math.round(r.range(2000,18000)/100)*100; g.cash-=a; g.st.health=Math.min(100,g.st.health+6); g.bump+=6; R.push(['看病（医保报销后）',-a]); return a>10000 ? {icon:'cross',tone:'bad',title:'生病住院',text:`熬夜太多，住了几天院，医保报销后自付 ${yuan(a)}。`} : {log:`生病看医生，自付 ${yuan(a)}`, tone:'bad'}; }},
  {id:'parent',w:()=>0.1, async run(g,r,R){ const a=Math.round(r.range(20000,60000)/1000)*1000;
      const c = await ask({icon:'cross',tone:'bad',title:'爸妈住院了',text:`医生说要做个手术，自费部分大约 ${yuan(a)}。`, options:[
        {id:'all',label:`全部我来出 ${yuan(a)}`,sub:'幸福值不变，存款告急'},
        {id:'half',label:`和兄弟姐妹分摊，出 ${yuan(a/2)}`,sub:'少出一半，但心里过意不去：幸福-6'}]});
      const pay = c==='all'?a:a/2; g.cash-=pay; if(c==='half') g.st.happy-=6; R.push(['父母医疗费',-pay]); return {log:`爸妈住院，出了 ${yuan(pay)}`, tone:'bad'}; }},
  {id:'wed',   w:()=>0.3, run(g,r,R){ const a=r.pick([600,800,1000,1200,1600,2000]); g.cash-=a; R.push(['朋友结婚随礼',-a]); return {log:`朋友结婚，随礼 ${yuan(a)}`}; }},
  {id:'crack', w:()=>0.1, run(g,r,R){ const a=Math.round(r.range(1500,4500)/100)*100; g.cash-=a; R.push(['手机摔碎了',-a]); return {log:`手机摔碎，换新花了 ${yuan(a)}`}; }},
  {id:'appl',  w:g=>g.house.movedIn?0.18:0, run(g,r,R){ const it=r.pick(['热水器','空调','冰箱','洗衣机']); const a=Math.round(r.range(1200,5000)/100)*100; g.cash-=a; R.push([it+'坏了',-a]); return {log:`${it}坏了，花了 ${yuan(a)}`}; }},
  {id:'leak',  w:g=>g.house.movedIn?0.08:0, run(g,r,R){ const a=Math.round(r.range(2000,8000)/100)*100; g.cash-=a; g.st.happy-=5; R.push(['卫生间漏水赔楼下',-a]); return {log:`卫生间漏水到楼下，赔了 ${yuan(a)}`, tone:'bad'}; }},
  {id:'marry', w:g=>(!g.married&&g.age<40)?0.05+g.love*0.1:0, async run(g,r,R){
      const sal = Math.round(cityById(g.cfg.cityId).salary*r.range(0.7,1.2)/500)*500;
      const c = await ask({icon:'ring',tone:'good',title:'TA 答应你了',text:`对方月薪约 ${yuan(sal)}，两个人一起还房贷会轻松不少。婚礼怎么办？`, options:[
        {id:'big',label:'办一场婚礼',sub:'花费约 ¥100,000~150,000，收回份子钱约一半；幸福+20'},
        {id:'trip',label:'旅行结婚',sub:'花费约 ¥30,000；幸福+12'},
        {id:'no',label:'再等等',sub:'先不结'}]});
      if(c==='no'){ g.love=0; return {log:'暂时不结婚'}; }
      g.married=true; g.spouseSalary=sal; g.living+=1500; g.love=0;
      if(c==='big'){ const cost=Math.round(r.range(100000,150000)/1000)*1000, back=Math.round(cost*r.range(0.4,0.6)/1000)*1000; g.cash+=back-cost; g.st.happy+=20; R.push(['婚礼（扣除份子钱）',back-cost]); }
      else { g.cash-=30000; g.st.happy+=12; R.push(['旅行结婚',-30000]); }
      return {log:`结婚了！对方月薪 ${yuan(sal)}`, tone:'good'}; }},
  {id:'baby',  w:g=>(g.married&&g.kids<2&&g.age<42)?0.07:0, run(g,r,R){ const a=Math.round(r.range(20000,40000)/1000)*1000; g.cash-=a; g.kids++; g.st.happy+=15; g.bump+=10; R.push(['生娃（生产+月嫂）',-a]); return {icon:'baby',tone:'good',title:`第${g.kids}个孩子出生了`,text:`一次性花了 ${yuan(a)}，以后每月开销多 ¥2,500。个税多一项子女扣除。`}; }},
  {id:'metro', w:()=>0.1, run(g,r,R){ g.house.value*=1.03; return {log:'小区附近规划新地铁站，估值 +3%', tone:'good'}; }},
  {id:'dump',  w:()=>0.14, run(g,r,R){ g.house.value*=0.96; g.st.happy-=3; return {log:'隔壁新盘降价开卖，你的房子估值 -4%', tone:'bad'}; }},
  {id:'school',w:g=>g.L.school?0.04:0, run(g,r,R){ g.house.value*=0.86; g.L.school=0; g.bump+=10; return {icon:'down',tone:'bad',title:'学区划片调整',text:'教育局重新划片，你家不再对口那所重点小学，学区溢价一夜蒸发，估值 -14%。'}; }},
  {id:'coin',  w:()=>0.05, async run(g,r,R){
      const c = await ask({icon:'chart',title:'朋友拉你"上车"',text:'"这个币下个月要翻十倍，带你一起！"',options:[{id:'in',label:'投 ¥30,000 试试',sub:'高风险'},{id:'no',label:'算了，房贷要紧'}]});
      if(c==='no') return {log:'拒绝了朋友的"暴富机会"'};
      g.cash-=30000; if(r()<0.22){ g.cash+=75000; R.push(['朋友的币（赚了）',45000]); return {log:'投币居然赚了 ¥45,000', tone:'good'}; }
      const back=Math.round(30000*r.range(0.05,0.3)); g.cash+=back; g.st.happy-=8; R.push(['朋友的币（亏了）',back-30000]); return {log:`投币亏了 ${yuan(30000-back)}`, tone:'bad'}; }},
  {id:'recall',w:g=>g.debts.some(d=>d.id==='bankcl')?0.05:0, run(g,r,R){
      const d=g.debts.find(x=>x.id==='bankcl'); const bal=d.balance; d.balance=0; d.left=0;
      const fromCash=Math.min(Math.max(0,g.cash), bal); g.cash-=fromCash; const rest=bal-fromCash; R.push(['消费贷被提前收回',-fromCash]);
      if(rest>0){ const p=platById('p2p'); const nd=newDebt({...p,max:1e9}, rest); nd.name='极速有钱（周转消费贷）'; nd.fresh=true; g.debts.push(nd); g.netEver=1; }
      g.cmp.extraOut=(g.cmp.extraOut||0)+fromCash;
      g.bump+=20; g.st.happy-=10;
      return {icon:'bank',tone:'bad',title:'银行抽贷',text:`银行贷后检查发现消费贷流入了购房款，要求一次性还清剩余 ${yuan(bal)}。`+(rest>0?`现金不够，只能借年化 23.9% 的网贷周转 ${yuan(rest)}。`:'用存款还上了。')}; }},
  {id:'collect',w:g=>g.debts.some(d=>d.kind==='illegal'&&d.balance>0)?1.2:0, run(g,r,R){ g.st.happy-=18; g.bump+=22; return {icon:'warn',tone:'bad',title:'暴力催收',text:'催收电话打到了你领导和爸妈那里，通讯录里的人都收到了短信。'}; }},
  {id:'delay', w:g=>(!g.house.movedIn&&g.house.deliverLeft>3)?0.04:0, run(g,r,R){ g.house.deliverLeft+=6; g.st.happy-=8; g.bump+=8; return {icon:'crane',tone:'bad',title:'延期交房',text:'开发商发通知：因"不可抗力"，交房推迟 6 个月。房租和月供还得接着双线付。'}; }},
  {id:'lanwei',w:g=>(!g.house.movedIn&&g.house.deliverLeft>3&&!g.house.lanwei)?0.01:0, run(g,r,R){ g.house.deliverLeft+=24; g.house.lanwei=1; g.house.value*=0.75; g.st.happy-=25; g.bump+=30; return {icon:'crane',tone:'bad',title:'楼盘停工了',text:'开发商资金链断裂，工地停工。政府介入"保交楼"，预计再晚 2 年交房。月供照还，估值 -25%。'}; }},
  {id:'car',   w:g=>!g.car&&g.age<45?0.04:0, async run(g,r,R){
      const c = await ask({icon:'key',title:'要不要买辆车？',text:'通勤太辛苦了。一辆 15 万的车：首付 3 万，车贷 12 万分 3 年（年化 3.5%），每月油费停车约 ¥800。',options:[{id:'buy',label:'买！',sub:'幸福+10'},{id:'no',label:'继续挤地铁'}]});
      if(c==='no') return {log:'没买车，继续挤地铁'};
      g.car=1; g.cash-=30000; g.living+=800; g.st.happy+=10; g.debts.push(newDebt({id:'car',name:'车贷',kind:'car',apr:3.5,term:36},120000)); R.push(['买车首付',-30000]); return {log:'买了车，背上 3 年车贷', tone:'bad'}; }},
];

/* ---------- 弹窗选择（由 UI 层实现 ask） ---------- */
export let ask = async () => null;
export function setAsk(fn){ ask = fn; }

/* ---------- 一个月 ---------- */
export async function stepMonth(g){
  const city = cityById(g.cfg.cityId);
  const r = rngOf(g);
  g.t++; const {y,m} = ymOf(g.t);
  const lines = [];             // 回单行：[名称, 金额, 备注]
  const extra = [];             // 事件带来的现金变动行
  let housingOut = 0;           // 平行宇宙：买房世界额外的住房现金流
  g.cmp.borrowNow = 0; g.cmp.extraOut = 0;

  // ---- 年度：LPR 重定价、通胀、房价行情 ----
  if(m===1 && g.t>1){
    const d = r.pick([-0.1,-0.1,-0.05,0,0,0,0,0.05,0.1]);
    const old = g.lpr; g.lpr = Math.round(clamp(g.lpr+d, 2.6, 4.6)*100)/100;
    g.loans.forEach(l=>{ if(l.kind==='com'){ l.rate = Math.round((g.lpr + l.spread)*100)/100; loanReset(l); } });
    g.living = Math.round(g.living*1.02/10)*10;
    if(g.cfg.market==='random') g.mu = r.range(-0.06,0.05);
    g.age++;
    logEv(g, d===0 ? `新年：LPR 维持 ${g.lpr}%，商贷利率不变` : `新年：LPR ${d<0?'下调':'上调'}至 ${g.lpr}%，商贷利率重定价${d<0?'，月供降了':'，月供涨了'}`, d<0?'good':d>0?'bad':'');
  }
  if(m===3 && g.employed && g.t>1){
    const p = clamp(r.range(-0.01,0.04) + g.perf*0.025, 0, 0.15); g.perf=0;
    if(p>0.002){ g.salary = Math.round(g.salary*(1+p)/100)*100; logEv(g, `年度调薪 +${pct(p*100)}，税前月薪 ${yuan(g.salary)}`, 'good'); }
    else logEv(g, '年度调薪：今年没涨');
  }

  // ---- 失业恢复 ----
  if(!g.employed){
    if(g.unemp<=0){ g.employed=true; g.salary=g.nextSalary||g.salary; logEv(g, `找到新工作，税前月薪 ${yuan(g.salary)}`, 'good'); g.st.happy+=6; }
  }

  // ---- 收入 ----
  const hasMort = mortBalance(g)>0;
  const deduct = (hasMort ? 1000 : city.rentDed) + g.kids*2000;
  let netIncome = 0;
  if(g.employed){
    const p = payroll(g.salary, city, g.cfg.gjjPct, deduct);
    g.cash += p.net; g.gjjBal += p.gjjIn; netIncome += p.net;
    lines.push(['工资到账（税后）', p.net, `税前 ${yuan(g.salary)} · 社保 ${yuan(p.si)} · 公积金 ${yuan(p.gjj)} · 个税 ${yuan(p.tax)}`]);
  } else {
    const ub = 1800; g.cash += ub; netIncome += ub; g.unemp--;
    lines.push(['失业保险金', ub, `待业中，还有约 ${Math.max(0,g.unemp)} 个月`]);
  }
  if(g.married && g.spouseSalary>0){
    const p = payroll(g.spouseSalary, city, g.cfg.gjjPct, 0); g.cash += p.net; g.gjjBal += p.gjjIn; netIncome += p.net;
    lines.push(['配偶工资（税后）', p.net]);
  }
  if(m===1 && g.employed && g.cfg.bonus>0 && g.t>1){
    const b = Math.round(g.salary*g.cfg.bonus*r.range(0.4,1.3)/100)*100; const net = b - taxBonus(b);
    g.cash += net; lines.push(['年终奖（单独计税）', net, `税前 ${yuan(b)}`]);
  }
  if(g.roomRent){ const rr = Math.round(rentEqAt(g,g.t)*0.35/50)*50; g.cash += rr; netIncome += rr; lines.push(['次卧租金', rr]); }
  if(m===6 && g.employed){ const rf = Math.round(r.range(-800,2500)/10)*10; g.cash += rf; lines.push([rf>=0?'个税汇算退税':'个税汇算补税', rf]); }

  // ---- 固定支出 ----
  const living = g.living + g.cat*300 + g.kids*2500;
  g.cash -= living; lines.push(['生活开销', -living, g.kids?`含孩子 ${g.kids} 个`:'吃饭、通勤、话费、日用']);
  if(m===2){ const a = Math.round(r.range(2000,6000)/100)*100; g.cash -= a; lines.push(['春节：红包+年货+路费', -a]); }
  if(!g.house.movedIn){ const rent=g.house.rentNow; g.cash -= rent; housingOut += rent; g.tot.rent += rent; lines.push(['房租（还没住进新家）', -rent, g.house.deliverLeft>0?`距交房还有 ${g.house.deliverLeft} 个月`:`装修中，还要 ${g.house.renoLeft} 个月`]); }
  else { const fr = g.L.fee ?? city.fee; const fee = Math.round(g.L.area*fr); g.cash -= fee; housingOut += fee; g.tot.fee += fee; lines.push(['物业费', -fee, `${g.L.area}㎡ × ${fr}元`]); }

  // ---- 上月的选择 ----
  if(g.chosen){
    const c = CHOICES.find(x=>x.id===g.chosen); const fx = c.fx;
    if(fx.cash){ g.cash += fx.cash; lines.push([c.t, fx.cash]); }
    if(fx.health) g.st.health += fx.health; if(fx.happy) g.st.happy += fx.happy; if(fx.hair) g.st.hair += fx.hair;
    if(fx.perf) g.perf += fx.perf; if(fx.love) g.love += fx.love; if(fx.cat) g.cat = 1; if(fx.stress) g.bump += fx.stress;
    if(fx.room){ g.roomRent = 1; logEv(g,'次卧租出去了，每月多一份收入'); }
    if(fx.lotto && r()<0.03){ const w = r.pick([200,1000,5000]); g.cash += w; lines.push(['彩票中奖！', w]); logEv(g, `彩票中了 ${yuan(w)}`, 'good'); }
    g.chosen = null;
  }

  // ---- 随机事件 ----
  let evShown = null;
  if(r() < 0.34){
    const cands = EVENTS.map(e=>({e, w:e.w(g)})).filter(x=>x.w>0);
    const sum = cands.reduce((s,x)=>s+x.w,0); let k = r()*sum; let pick = null;
    for(const x of cands){ k -= x.w; if(k<=0){ pick = x.e; break; } }
    if(pick){
      const R = []; g.rs = r.state();
      const res = await pick.run(g, r, R);
      R.forEach(([n,a])=>lines.push([n,a]));
      if(res){ if(res.title) evShown = res; logEv(g, res.log || res.title + '：' + res.text, res.tone); }
    }
  }
  if(evShown){ g.rs = r.state(); await ask({icon:evShown.icon, tone:evShown.tone, title:evShown.title, text:evShown.text, options:[{id:'ok',label:'知道了',cls:'primary'}]}); }

  // ---- 还款 ----
  const dues = g.loans.map(loanDue);
  const mortDue = dues.reduce((s,d)=>s+d.total,0);
  const debtDue = g.debts.filter(d=>d.balance>0&&!d.fresh).reduce((s,d)=>s+Math.min(d.pay, d.balance*(1+d.apr/1200)),0);
  const offset = Math.min(g.gjjBal, mortDue);
  let need = mortDue + debtDue - offset;
  let skipped = false;
  if(g.cash < need - 0.5){
    g.rs = r.state();
    const res = await shortage(g, need, '本月还款', mortDue>0);
    takeLines(g, lines);
    if(res==='sold') return 'sold';
    if(res==='skip') skipped = true;
  }
  if(skipped){
    g.overdue++; g.overdueEver++;
    g.loans.forEach((l,i)=>{ l.balance += dues[i].int*0.5; });
    g.debts.forEach(d=>{ if(d.balance>0) d.balance += d.balance*d.apr/1200*1.5; });
    lines.push(['本月房贷：逾期未还', 0, `已连续逾期 ${g.overdue} 个月 · 加收罚息`]);
    logEv(g, `房贷逾期第 ${g.overdue} 个月，征信留下污点`, 'bad'); g.bump += 25;
  } else {
    g.overdue = 0;
    if(offset>0){ g.gjjBal -= offset; g.cash += offset; }
    g.loans.forEach((l,i)=>{ const d=dues[i]; if(d.total<=0) return; g.cash -= d.total; loanApply(l,d); g.tot.int += d.int; g.tot.prin += d.pr; g.tot.mortPaid += d.total; housingOut += d.total;
      lines.push([`${l.name}扣款`, -d.total, `本金 ${yuan(d.pr)} · 利息 ${yuan(d.int)} · 年利率 ${l.rate}%`]); });
    if(offset>0) lines.push(['公积金账户冲还贷', offset, `账户余额 ${yuan(g.gjjBal)}`]);
    if(g.gjjSub>0){ const gi = g.loans.findIndex(l=>l.kind==='gjj'); if(gi>=0 && dues[gi].int>0){ const rate = g.gjjSubRate || 0.2; const sub = Math.min(g.gjjSub, dues[gi].int*rate); g.gjjSub -= sub; g.cash += sub; housingOut -= sub; lines.push([`公积金贴息 ${Math.round(rate*100)}%（${city.name}新政）`, sub, `累计上限 ${yuan(city.gjjPolicy?.subsidyCap||0)}，还剩 ${yuan(g.gjjSub)}`]); } }
    g.debts.forEach(d=>{ if(d.balance<=0) return; if(d.fresh){ d.fresh=false; return; } const int=d.balance*d.apr/1200; let pay=Math.min(d.pay, d.balance+int); if(d.left<=1) pay=d.balance+int; const pr=pay-int; d.balance=Math.max(0,d.balance-pr); d.left--; if(d.left<=0) d.balance=0; g.cash-=pay; g.tot.platInt+=int; housingOut+=pay; lines.push([`${d.name}还款`, -pay, `年化 ${d.apr}% · 还剩 ${wan(d.balance)}`+(int>0?` · 其中利息 ${yuan(int)}`:'')]); });
    g.debts = g.debts.filter(d=>d.balance>0.5);
  }
  // ---- 交房、装修、入住 ----
  const H = g.house;
  if(!H.movedIn){
    if(H.deliverLeft>0){ H.deliverLeft--;
      if(H.deliverLeft===0){
        g.rs = r.state();
        await ask({icon:'key',tone:'good',title:'交房了！',text:`等了这么久，终于拿到钥匙。毛坯房要先装修 ${H.renoMonths} 个月，装修款 ${yuan(H.renoLater)} 现在就得付。`,options:[{id:'ok',label:'付装修款，开工',cls:'primary'}]});
        if(g.cash < H.renoLater){ const res = await shortage(g, H.renoLater, '装修款', true); takeLines(g, lines); if(res==='sold') return 'sold'; if(res==='skip'){ H.renoLater=0; H.renoMonths=0; g.st.happy-=10; logEv(g,'钱不够装修，水泥地上铺张床先住进去','bad'); } }
        if(H.renoLater>0){ g.cash -= H.renoLater; housingOut += H.renoLater; lines.push(['装修款', -H.renoLater]); }
        H.renoLeft = H.renoMonths; H.renoLater = 0;
      }
    } else if(H.renoLeft>0){ H.renoLeft--; }
    if(H.deliverLeft===0 && H.renoLeft===0){ H.movedIn = true; g.st.happy += 15; logEv(g, `搬进新家了！`, 'good'); g.justMoved = true; }
  }
  housingOut += (g.cmp.extraOut||0) - (g.cmp.borrowNow||0);

  // ---- 房价 ----
  H.value *= Math.exp(g.mu/12 + 0.035/Math.sqrt(12)*r.normal() + (g.L.drift ?? (g.L.commercial?-0.03:0))/12);

  // ---- 状态 ----
  const debtPay = mortDue + debtDue;
  const out = living + debtPay + (H.movedIn?0:H.rentNow);
  const dti = netIncome>0 ? debtPay/netIncome : (debtPay>0?1.5:0);
  const buffer = g.cash / Math.max(1,out);
  let target = dti*100 + (buffer<1?25:buffer<3?12:buffer<6?4:0) + (g.overdue?30:0) + (!g.employed?20:0) + (g.debts.some(d=>d.apr>=10)?8:0) + (!H.movedIn?6:0);
  target = clamp(target,0,100);
  const S = g.st;
  S.stress = clamp(S.stress*0.55 + target*0.45 + g.bump, 0, 100); g.bump = 0;
  if(S.stress>55) S.hair -= (S.stress-55)/40; else if(S.stress<35) S.hair += 0.3;
  S.health += (82-S.health)*0.04 - (S.stress>75?1:0);
  S.happy += (62 + (H.movedIn?8:0) - S.stress*0.3 - S.happy)*0.08 - (g.debts.some(d=>d.kind==='family')?0.4:0);
  for(const k of ['hair','health','happy']) S[k] = clamp(S[k],0,100);

  // ---- 平行宇宙 ----
  const rentEq = rentEqAt(g, g.t);
  g.cmp.contribs.push(housingOut - rentEq); g.cmp.rentPaid += rentEq;

  // ---- 记录 ----
  const curDue = g.loans.map(loanDue); const curInt = curDue.reduce((s,d)=>s+d.int,0), curTot = curDue.reduce((s,d)=>s+d.total,0);
  g.hist.push({t:g.t, cash:g.cash, gjj:g.gjjBal, hv:H.value, mort:mortBalance(g), debt:debtBalance(g), stress:S.stress, skip:skipped, intShare: dues.length&&mortDue>0 ? dues.reduce((s,d)=>s+d.int,0)/mortDue : 0, pay: skipped?0:mortDue, net:netIncome});
  g.last = {t:g.t, lines, total: lines.reduce((s,l)=>s+l[1],0), skipped, mortDue, intPart: dues.reduce((s,d)=>s+d.int,0), netIncome, nextDue: curTot, nextInt: curInt};
  g.choices = drawChoices(g, r);
  g.rs = r.state();

  // ---- 结局判定 ----
  if(g.overdue>=3){ g.ended = {type:'foreclose'}; return 'end'; }
  if(g.hadLoan && mortBalance(g)<=0.5 && !g.ended){ g.ended = {type:'payoff'}; return 'end'; }
  if(g.t >= g.horizon){ g.ended = {type:'horizon'}; return 'end'; }
  return 'ok';
}

export function takeLines(g, lines){ (g._lines||[]).forEach(l=>lines.push(l)); g._lines=[]; }
/* 钱不够时（由 UI 弹窗决定） */
export let shortage = async () => 'skip';
export function setShortage(fn){ shortage = fn; }

/* 平行宇宙：租房 + 把首付和每月差额拿去投资 */
export function parallelSeries(g, asset, vol){
  const rng = makeRng(hashStr(g.seed+':'+asset.id));
  const mu = Math.log(1+asset.R/100)/12, s = asset.sigma/100/Math.sqrt(12);
  let p = g.cmp.invest0; const out = [];
  for(const c of g.cmp.contribs){ p = p*Math.exp(mu + (vol? s*rng.normal() : 0)) + c; out.push(p); }
  return out;
}
export function worlds(g, asset, vol){
  const port = parallelSeries(g, asset, vol);
  return g.hist.map((h,i)=>{ const common = h.cash + h.gjj; const buy = common + h.hv*(1-sellCost) - h.mort - h.debt; const rent = common + port[i]; return {t:h.t, buy, rent, port:port[i], equity: h.hv*(1-sellCost)-h.mort-h.debt}; });
}

/* 卖房清算 */
export function saleQuote(g){
  const v = g.house.value; const held = g.t;
  const agent = v*0.01; const vat = held<24 && !g.L.commercial ? v*0.053 : g.L.commercial ? v*0.05 : 0;
  const it = g.L.commercial ? Math.max(0,(v-g.L.total))*0.2 : (held<60 ? v*0.01 : 0);
  const net = v - agent - vat - it - mortBalance(g) - debtBalance(g);
  return {v, agent, vat, it, mort:mortBalance(g), debt:debtBalance(g), net};
}
