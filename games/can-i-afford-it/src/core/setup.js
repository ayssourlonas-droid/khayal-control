/* 开局：默认家底、生成房源（普通城市按模板生成，深度城市读数据包）。 */
import { deepPackOf } from '../data/index.js';
import { START_Y } from './calendar.js';
import { clamp, makeRng } from './util.js';
import { spendDefaults } from './spend.js';
import { NAME_A, NAME_B, cityById } from '../data/index.js';

/* 深度城市包：房源来自 data/cities/<包名>.json */
export function genDeep(city, pack, seed){
  const rng = makeRng(seed); const used = new Set();
  return pack.listings.map((sp,i)=>{
    const area = rng.int(sp.area[0], sp.area[1]);
    const unit = Math.round(rng.range(sp.unit[0], sp.unit[1])/100)*100;
    const total = Math.round(unit*area/10000)*10000;
    let a; do { a = rng.pick(NAME_A); } while(used.has(a)); used.add(a); const name = a + rng.pick(NAME_B);
    const deliver = sp.deliver ? rng.int(sp.deliver[0], sp.deliver[1]) : 0;
    const year = sp.year ? rng.int(sp.year[0], sp.year[1]) : (START_Y + Math.ceil(deliver/12));
    const gift = sp.gift ? rng.int(sp.gift[0], sp.gift[1]) : 0;
    const rent = Math.max(300, Math.round(total/(sp.ratio*12)/50)*50);
    const tags = sp.tags.map(t=>[...t]);
    if(deliver) tags.unshift([`${deliver}个月后交房`,'warn']);
    return {i, key:sp.key, seg:sp.seg, type:sp.type, plan:sp.plan, view:sp.view, cat:sp.cat, deco:sp.deco, commercial:!!sp.commercial, district:sp.district, plate:sp.plate, est:!!sp.est,
      area, inner: gift? area+gift : 0, gift, unit, total, name, deliver, year, rooms:sp.rooms, rent, tags, sellerTax:sp.sellerTax||0, school:sp.school||0, note:sp.note,
      fee:sp.fee, renoMult:sp.renoMult||1, drift:sp.drift, height:sp.height};
  });
}

export function defaultCfg(cityId){
  const c = cityById(cityId);
  return {cityId:c.id, age:28, salary:c.salary, bonus:1, gjjPct:7, savings:c.id==='hg'?50000:300000, gift:c.id==='hg'?0:200000, living:c.living, spouse:false, spouseSalary:Math.round(c.salary*0.9/500)*500, market:'random', ...spendDefaults(c.id)};
}

/* ---------- 房源 ---------- */
export function genListings(city, seed){
  const pack = deepPackOf(city); if(pack) return genDeep(city, pack, seed);
  const rng = makeRng(seed);
  const D = [...city.d].sort((a,b)=>b[1]-a[1]); const n = D.length;
  const pd = i => D[clamp(i,0,n-1)];
  const specs = [
    {type:'old',      di:0,                  area:[42,62],   f:0.92, cat:'二手',     deco:'旧装'},
    {type:'tower',    di:1,                  area:[84,98],   f:1.0,  cat:'二手',     deco:'简装'},
    {type:'new',      di:Math.floor(n*0.4),  area:[89,108],  f:1.1,  cat:'新房·现房', deco:'精装'},
    {type:'offplan',  di:Math.floor(n*0.55), area:[98,122],  f:0.97, cat:'新房·期房', deco:'毛坯'},
    {type:'yangfang', di:n-2,                area:[125,143], f:1.05, cat:'新房·现房', deco:'毛坯'},
    {type:'loft',     di:1,                  area:[36,52],   f:0.5,  cat:'商住公寓', deco:'精装', commercial:1},
  ];
  const used = new Set();
  return specs.map((sp,i)=>{
    const [dn, dp, est] = pd(sp.di);
    const area = rng.int(sp.area[0], sp.area[1]);
    const unit = Math.round(dp*sp.f*rng.range(0.94,1.06)/100)*100;
    const total = Math.round(unit*area/1000)*1000;
    let a; do { a = rng.pick(NAME_A); } while(used.has(a)); used.add(a); const name = a + rng.pick(NAME_B);
    const deliver = sp.type==='offplan' ? rng.int(18,30) : 0;
    const year = sp.cat==='二手' ? (sp.type==='old' ? rng.int(1991,2003) : rng.int(2011,2019)) : (START_Y + Math.ceil(deliver/12));
    const rooms = area<55?'1室1厅':area<75?'2室1厅':area<100?'3室1厅':area<126?'3室2厅':'4室2厅';
    const ratio = sp.commercial ? city.ratio*0.6 : city.ratio;
    const rent = Math.max(300, Math.round(total/(ratio*12)/50)*50);
    const tags = []; let sellerTax = 0, school = 0, note = '';
    if(sp.type==='old'){ school = rng()<0.75?1:0; if(school) tags.push(['学区房','red']); tags.push(['无电梯']); if(rng()<0.5){ tags.push(['满五唯一']); } else { sellerTax=1; tags.push(['不满五','warn']); } note = school ? '老小区、没电梯，但对口重点小学。学区政策一变，溢价可能说没就没。' : '老小区、没电梯，胜在位置好、上班近。'; }
    if(sp.type==='tower'){ tags.push(['近地铁']); if(rng()<0.6) tags.push(['满五唯一']); else { sellerTax=1; tags.push(['满二','warn']); } note = '次新小区，户型方正，二手房要付中介费。'; }
    if(sp.type==='new'){ tags.push(['精装交付'],['现房']); note = '开发商现房，拿钥匙就能住；要交专项维修资金。'; }
    if(sp.type==='offplan'){ tags.push([`${deliver}个月后交房`,'warn'],['毛坯']); note = `期房比现房便宜一点，但交房前每月要同时付房租和月供，还有延期甚至烂尾的风险。`; }
    if(sp.type==='yangfang'){ tags.push(['低密洋房'],['远郊']); note = '面积大、环境好，通勤单程 1 小时起。'; }
    if(sp.type==='loft'){ tags.push(['40年产权','warn'],['水电商用','warn'],['不能用公积金','warn']); note = '总价低、首付门槛看着低。但首付至少 30%、贷款最长 10 年、契税 3%，转手很难。'; }
    return {i, type:sp.type, cat:sp.cat, deco:sp.deco, commercial:!!sp.commercial, district:dn, est:!!est, area, unit, total, name, deliver, year, rooms, rent, tags, sellerTax, school, note};
  });
}
