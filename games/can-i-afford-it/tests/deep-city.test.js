import { describe, it, expect } from 'vitest';
import { cityById, RENO_BY_DECO, TIER_STYLES } from '../src/data/index.js';
import { defaultCfg, genListings } from '../src/core/setup.js';
import { defaultLoanCtl, loanPlan } from '../src/core/loan.js';
import { initLife, stepMonth, setAsk, setShortage } from '../src/core/engine.js';

const city = cityById('cd');
const Ls = genListings(city, 7);

describe('成都深度包', () => {
  it('生成 12 套房源，覆盖别墅、大平层、四代宅', () => {
    expect(Ls).toHaveLength(12);
    const types = new Set(Ls.map(L => L.type));
    for (const t of ['villa', 'villa2', 'flat', 'gen4', 'resort', 'loft']) expect(types.has(t)).toBe(true);
  });
  it('公积金额度：单人 80 万，买新房上浮到 96 万；夫妻 120 万 → 144 万', () => {
    const hy = Ls.find(L => L.key === 'hy');
    const single = loanPlan(hy, { ...defaultCfg('cd') }, { ...defaultLoanCtl(hy, defaultCfg('cd')), down: 15, gjj: 9e9 });
    expect(single.gjjMaxW).toBeCloseTo(96);
    const dual = loanPlan(hy, { ...defaultCfg('cd'), spouse: true }, { ...defaultLoanCtl(hy, defaultCfg('cd')), down: 15, gjj: 9e9 });
    expect(dual.gjjMaxW).toBeCloseTo(144);
    const old = Ls.find(L => L.key === 'old');
    expect(loanPlan(old, defaultCfg('cd'), defaultLoanCtl(old, defaultCfg('cd'))).gjjMaxW).toBeCloseTo(80);
  });
  it('新房用公积金首付最低 15%，二手房 20%', () => {
    const cfg = defaultCfg('cd');
    const hy = Ls.find(L => L.key === 'hy'), dy = Ls.find(L => L.key === 'dy');
    expect(loanPlan(hy, cfg, { ...defaultLoanCtl(hy, cfg), gjj: 100000 }).minDown).toBe(15);
    expect(loanPlan(dy, cfg, { ...defaultLoanCtl(dy, cfg), gjj: 100000 }).minDown).toBe(20);
  });
  it('每套房每个装修档位都能签约并跑 30 个月，账目对得上，有公积金贴息', async () => {
    setAsk(async spec => (spec.options || []).filter(o => !o.disabled)[0].id);
    setShortage(async () => 'skip');
    let subsidised = 0;
    for (const L of Ls) {
      const cfg = { ...defaultCfg('cd'), salary: L.total > 5e6 ? 400000 : L.total > 2e6 ? 60000 : 15000, savings: Math.max(300000, L.total * 0.5), spouse: true, spouseSalary: 15000 };
      for (const tier of RENO_BY_DECO[L.deco]) {
        const style = (TIER_STYLES[tier] || ['plain']).slice(-1)[0];
        const P = loanPlan(L, cfg, { ...defaultLoanCtl(L, cfg), reno: tier, style, gjj: L.commercial ? 0 : 2e6 });
        if (!P.ok) continue;
        const g = initLife(cfg, L, P, 11);
        for (let i = 0; i < 30; i++) {
          const c0 = g.cash; const r = await stepMonth(g); if (r !== 'ok') break;
          expect(Math.abs((g.cash - c0) - g.last.total)).toBeLessThan(1);
          if (g.last.lines.some(l => String(l[0]).startsWith('公积金贴息'))) subsidised++;
        }
      }
    }
    expect(subsidised).toBeGreaterThan(0);
  }, 60000);
});
