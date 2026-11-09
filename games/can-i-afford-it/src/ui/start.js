/* 开局页：选城市、填家底。 */
import { DATA_AS_OF, GJJ_RATE, LPR5 } from '../data/index.js';
import { aboutLinksHTML } from './about.js';
import { skylineSVG } from '../art/scenes.js';
import { payroll } from '../core/finance.js';
import { defaultCfg } from '../core/setup.js';
import { trimZ, wan, yuan } from '../core/util.js';
import { CITIES, MARKETS, cityById } from '../data/index.js';
import { $, $$ } from './dom.js';
import { term } from './help.js';
import { UI, save } from './state.js';
import { levelSegHTML } from './spend.js';

/* ============================================================
   开局
   ============================================================ */
export function renderStart(){
  const c = UI.cfg; const city = cityById(c.cityId);
  const v = $('#v-start');
  v.innerHTML = `
  ${levelSegHTML()}
  <div class="hero" id="hero"><div class="hero-copy"><span class="eyebrow">第一关 · 买房</span><h1>买得起吗</h1><p>先在这里背一次房贷：选城市、填工资、挑房子、找银行，再一个月一个月地还。</p></div><div id="hero-art">${skylineSVG(city)}</div></div>
  <div class="card stack">
    <div class="row between"><h3>选一座城市</h3><span class="city-note">住宅挂牌均价 · 2026年8–9月</span></div>
    <div class="city-grid" id="city-grid">${CITIES.map(ct=>`<button class="city" data-city="${ct.id}" aria-pressed="${ct.id===c.cityId}"><b>${ct.name}${ct.deep?' <span class="tag red" style="font-size:10px;padding:0 4px;vertical-align:2px">深度</span>':''}</b><span class="num">${ct.price>=10000?trimZ((ct.price/1e4).toFixed(2))+'万':ct.price.toLocaleString()}${ct.est?'*':''}/㎡</span></button>`).join('')}</div>
    <p class="small muted" id="city-hint"></p>
  </div>
  <div class="card stack">
    <h3>你的家底</h3>
    <div class="grid2">
      ${numField('in-age','年龄','age','岁',18,60)}
      ${numField('in-salary','税前月薪','salary','元',0,500000)}
      ${numField('in-savings','存款','savings','元',0,1e8)}
      ${numField('in-gift','父母资助（不用还）','gift','元',0,1e8)}
      ${numField('in-living','每月生活开销','living','元',0,100000)}
      <div class="field"><label for="in-gjj"><span>公积金缴存比例 ${term('gjjpct')}</span><span class="num" id="o-gjj">${c.gjjPct}%</span></label><input type="range" id="in-gjj" min="5" max="12" step="1" value="${c.gjjPct}"></div>
    </div>
    <div class="field"><span class="lab"><span>年终奖 ${term('bonus')}</span></span><div class="seg" id="seg-bonus">${[0,1,2,3,6].map(b=>`<button data-bonus="${b}" aria-pressed="${c.bonus===b}">${b===0?'没有':b+' 个月'}</button>`).join('')}</div></div>
    <p class="small" id="pay-preview"></p>
    <details class="details stack-s"><summary>更多设定：另一半、房价走势</summary>
      <div class="stack" style="padding-top:10px">
        <label class="check"><input type="checkbox" id="in-spouse" ${c.spouse?'checked':''}><span>已婚，另一半一起还贷</span></label>
        <div id="spouse-box" ${c.spouse?'':'hidden'}>${numField('in-spouse-salary','另一半税前月薪','spouseSalary','元',0,500000)}</div>
        <div class="field"><span class="lab">房价剧本</span><div class="seg" id="seg-market">${Object.entries(MARKETS).map(([k,m])=>`<button data-market="${k}" aria-pressed="${c.market===k}">${m.name}</button>`).join('')}</div><p class="hint">随机：每年行情重新摇号（-6%~+5%），叠加月度波动。</p></div>
      </div>
    </details>
  </div>
  <button class="btn primary block" data-act="go-listings">去看房</button>
  <p class="foot">数据截至 ${DATA_AS_OF}：城市均价来自中国房价行情（禧泰数据）住宅挂牌均价，鹤岗为估算；各区价格部分为估算。房贷利率按 LPR（5年期以上 ${LPR5}%）、首套公积金 ${GJJ_RATE}%。随机事件和投资收益都是模拟，仅供感受压力，不构成任何投资建议。你填的数字只保存在这台设备上。</p>
  ${aboutLinksHTML()}`;
  updateStartHints();
}
export function numField(id,label,key,unit,min,max){ return `<div class="field"><label for="${id}">${label}</label><div class="inp-wrap"><input class="inp num" id="${id}" data-cfg="${key}" type="number" inputmode="numeric" min="${min}" max="${max}" value="${UI.cfg[key]}"><span class="unit">${unit}</span></div></div>`; }
export function updateStartHints(){
  const c = UI.cfg, city = cityById(c.cityId);
  const p = payroll(c.salary, city, c.gjjPct, city.rentDed);
  const yrs = (city.price*90)/(c.salary*12);
  $('#city-hint').innerHTML = `${city.name}（${city.tier}）均价 <b class="num">${city.price.toLocaleString()}</b> 元/㎡，一套 90㎡ 约 <b class="num">${wan(city.price*90)}</b>，相当于你 <b class="num">${trimZ(yrs.toFixed(1))}</b> 年的税前工资。售租比约 ${city.ratio}${term('ratio')}：买房的钱够租 ${city.ratio} 年。`;
  $('#pay-preview').innerHTML = c.salary>0 ? `税后到手约 <b class="num">${yuan(p.net)}</b>/月 · 公积金账户每月入账 <b class="num">${yuan(p.gjjIn)}</b>（个人+公司） · 现金合计 <b class="num">${wan(c.savings+c.gift)}</b>` : '没有工资收入也能玩，不过银行大概率不批贷款。';
}

/* ============================================================
   事件绑定
   ============================================================ */
export function selectCity(id){
  const old = cityById(UI.cfg.cityId), city = cityById(id);
  const oldDef = defaultCfg(old.id), newDef = defaultCfg(city.id);
  UI.cfg.cityId = id;
  for(const k of ['salary','living','savings','gift','spouseSalary','rent','cash2']){
    if(!UI.touched[k] || UI.cfg[k]===oldDef[k] || UI.cfg[k]==null){ UI.cfg[k] = newDef[k]; $$(`[data-cfg="${k}"]`).forEach(el=>{ el.value = UI.cfg[k]; }); }
  }
  $$('#city-grid .city').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.city===id)));
  const art = $('#hero-art'); if(art) art.innerHTML = skylineSVG(city);
  UI.listings = null; if($('#city-hint')) updateStartHints(); save();
}
