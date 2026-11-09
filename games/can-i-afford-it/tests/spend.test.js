import { describe, expect, it } from 'vitest';
import { CARD, KINDS, TEMPT } from '../src/data/index.js';
import { defaultCfg } from '../src/core/setup.js';
import { ymOf } from '../src/core/calendar.js';
import { MONTHS, aprOf, billOptions, genPlan, happyOf, joyAt, monthItems, newSpend, revolveAPR, runPolicy, stepSpend, summary } from '../src/core/spend.js';

const cfg = defaultCfg('cd');
/* 开一局，第 1 个月只冲动买一件指定价格的东西（用 tea 这类小东西也行），其余不买 */
function oneBuy(seed=11){
  const S = newSpend(cfg, seed);
  const items = monthItems(S);
  items.forEach((x,i)=>{ S.dec.items[x.key] = i===0 ? 'impulse' : 'skip'; });
  stepSpend(S);
  return S;
}
const skipAll = S => monthItems(S).forEach(x=>{ S.dec.items[x.key] = 'skip'; });

describe('第二关数据', () => {
  it('每个诱惑字段齐全', () => {
    for (const it of TEMPT.items) {
      expect(KINDS[it.kind], it.id).toBeDefined();
      expect(it.price > 0 && it.joy > 0, it.id).toBe(true);
      expect(typeof it.hook, it.id).toBe('string');
      expect(it.impulse?.label && it.plan?.label && it.skip?.label, it.id).toBeTruthy();
      expect(it.plan.wait >= 0, it.id).toBe(true);
      if (it.plan.wait > 0) expect(it.plan.fade >= 0 && it.plan.fade < 1, it.id).toBe(true);
      else expect(it.plan.priceMul > 0, it.id).toBe(true);
    }
    expect(new Set(TEMPT.items.map(x=>x.id)).size).toBe(TEMPT.items.length);
  });
  it('信用卡规则在合理范围', () => {
    expect(CARD.minPayRate).toBe(0.1);
    expect(revolveAPR()).toBeCloseTo(18.25, 2);
    for (const o of CARD.installments) { const a = aprOf(o.n, o.fee); expect(a).toBeGreaterThan(10); expect(a).toBeLessThan(18.5); }
  });
});

describe('日程', () => {
  it('同一个种子得到同样的 12 个月', () => {
    expect(genPlan(42)).toEqual(genPlan(42));
    const { plan } = genPlan(42);
    expect(plan.length).toBe(MONTHS);
    plan.forEach(m => { expect(m.length).toBeGreaterThanOrEqual(2); expect(m.length).toBeLessThanOrEqual(3); });
  });
  it('双11 在 11 月、春节回家在 1 月一定出现', () => {
    for (let seed=1; seed<30; seed++) {
      const { plan } = genPlan(seed);
      plan.forEach((m, i) => {
        const mon = ymOf(i+1).m;
        if (mon===11) expect(m.some(x=>x.id==='d11')).toBe(true);
        if (mon===1) expect(m.some(x=>x.id==='spring')).toBe(true);
      });
    }
  });
});

describe('信用卡账单', () => {
  it('第一个月没有账单，工资和房租已经结算', () => {
    const S = newSpend(cfg, 5);
    expect(S.card.bill).toBe(null);
    expect(S.cash).toBeCloseTo(S.startCash + S.net + S.tot.yield - S.cfg.rent - S.cfg.living, 6);
  });
  it('全额还款不收利息', () => {
    const S = oneBuy(); const P = S.card.bill.purch; expect(P).toBeGreaterThan(0);
    S.dec.bill = 'full'; skipAll(S); stepSpend(S);
    expect(S.tot.interest).toBe(0); expect(S.card.carry).toBe(0);
  });
  it('只还最低：剩下的按日息万五计息，本期消费全额计息', () => {
    const S = oneBuy(); const b = S.card.bill;
    S.dec.bill = 'min'; skipAll(S); stepSpend(S);
    const left = b.purch - b.min;
    const expected = b.purch*CARD.dailyRate*CARD.firstCycleDays + left*CARD.dailyRate*CARD.cycleDays;
    expect(S.card.carry).toBeCloseTo(left, 6);
    expect(S.card.pendInt).toBeCloseTo(expected, 6);
    expect(S.card.overdue).toBe(0);
    expect(S.card.bill.int).toBeCloseTo(expected, 6);
  });
  it('账单分期：不收利息，每期本金加手续费，手续费按最初本金算', () => {
    const S = oneBuy(); const P = S.card.bill.purch;
    S.dec.bill = 'i12'; skipAll(S); stepSpend(S);
    const fee = CARD.installments.find(o=>o.n===12).fee;
    expect(S.tot.interest).toBe(0);
    expect(S.tot.instFee).toBeCloseTo(P*fee*12, 6);
    expect(S.card.bill.inst).toBeCloseTo(P/12 + P*fee, 6);
    const opts = billOptions(S); expect(opts.find(o=>o.id==='full').pay).toBeCloseTo(P/12 + P*fee, 6);
  });
  it('不还就逾期：违约金是最低还款未还部分的 5%，连续两期停卡', () => {
    const S = oneBuy(); const b = S.card.bill;
    S.dec.bill = 'none'; skipAll(S); stepSpend(S);
    expect(S.card.overdue).toBe(1);
    expect(S.card.pendFee).toBeCloseTo(Math.max(CARD.lateFeeMin, CARD.lateFeeRate*b.min), 6);
    S.dec.bill = 'none'; skipAll(S); stepSpend(S);
    expect(S.card.frozen).toBe(true);
    expect(S.hist[S.hist.length-1].stress).toBeGreaterThan(10);
  });
});

describe('开心值', () => {
  it('每过一个半衰期减半，体验留下回忆', () => {
    const j = { joy:10, hl:2, floor:0, t0:1 };
    expect(joyAt(j,1)).toBe(10); expect(joyAt(j,3)).toBeCloseTo(5, 6); expect(joyAt(j,5)).toBeCloseTo(2.5, 6);
    const e = { joy:10, hl:6, floor:0.25, t0:1 };
    expect(joyAt(e, 200)).toBeCloseTo(2.5, 3);
  });
  it('开心值在 0–100 之间，买得越多边际越小', () => {
    expect(happyOf(0)).toBe(50);
    expect(happyOf(1000)).toBeLessThanOrEqual(100); expect(happyOf(-1000)).toBeGreaterThanOrEqual(0);
    expect(happyOf(10)-happyOf(0)).toBeGreaterThan(happyOf(40)-happyOf(30));
  });
});

describe('整局', () => {
  it('账目对得上：年底的钱 = 年初 + 收入 − 固定支出 − 想要 − 利息手续费违约金', () => {
    for (const city of ['cd','bj','hg']) for (const policy of ['impulse','plan','skip']) for (let seed=1; seed<=15; seed++) {
      const S = runPolicy(defaultCfg(city), seed*101, policy); const T = S.tot;
      const nw = summary(S).nw;
      const expected = S.startCash + T.income + T.yield - T.fixed - T.want - T.interest - T.late - T.instFeeBilled;
      expect(nw, `${city} ${policy} ${seed}`).toBeCloseTo(expected, 4);
      expect(S.hist.length).toBe(MONTHS); expect(S.ended).toBe(true);
    }
  });
  it('三个平行宇宙的方向：不买存得最多但最不开心，计划买比冲动买存得多', () => {
    const avg = (k, f) => { let s=0; for (let seed=1; seed<=40; seed++) s += f(summary(runPolicy(cfg, seed*7919, k))); return s/40; };
    const ch = k => avg(k, x=>x.change), hp = k => avg(k, x=>x.avgHappy);
    expect(ch('skip')).toBeGreaterThan(ch('plan'));
    expect(ch('plan')).toBeGreaterThan(ch('impulse') + 20000);
    expect(hp('skip')).toBeLessThan(hp('plan') - 10);
    expect(Math.abs(hp('impulse') - hp('plan'))).toBeLessThan(8);
    expect(avg('impulse', x=>x.cost)).toBeGreaterThan(0);
    expect(avg('plan', x=>x.cost)).toBeLessThan(50);
  });
});
