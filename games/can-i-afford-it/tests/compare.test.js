import { describe, it, expect } from 'vitest';
import { compareModel, breakevenG } from '../src/core/compare.js';

const base = { price: 1500000, down: 30, rate: 3.05, years: 30, method: 'ei', rent: 3200, rentG: 1, houseG: 0, fees: 80000, fee: 280, horizon: 30, R: 4 };

describe('买房 vs 租房投资', () => {
  it('房价涨得越多，买房越划算', () => {
    const a = compareModel({ ...base, houseG: 0 }), b = compareModel({ ...base, houseG: 3 });
    expect(b.buy.at(-1)).toBeGreaterThan(a.buy.at(-1));
    expect(b.rent.at(-1)).toBeCloseTo(a.rent.at(-1), 6);
  });
  it('盈亏平衡点：投资收益越高，需要的房价涨幅越大', () => {
    const g2 = breakevenG({ ...base, R: 2.5 }), g6 = breakevenG({ ...base, R: 6 });
    expect(g6).toBeGreaterThan(g2);
    const at = compareModel({ ...base, R: 6, houseG: g6 });
    expect(Math.abs(at.buy.at(-1) - at.rent.at(-1))).toBeLessThan(500);
  });
  it('30 年后贷款还清', () => {
    expect(compareModel(base).rows.at(-1).bal).toBeCloseTo(0, 2);
  });
});
