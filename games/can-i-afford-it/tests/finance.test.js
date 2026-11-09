import { describe, it, expect } from 'vitest';
import { annuity, schedule, payroll, taxBonus, newLoan, loanDue, loanApply, loanReset } from '../src/core/finance.js';
import { combinedSchedule } from '../src/core/finance.js';
import { cityById } from '../src/data/index.js';

describe('房贷公式', () => {
  it('等额本息：100 万、30 年、3.05%，月供 ¥4,243.05', () => {
    expect(annuity(1e6, 3.05, 360)).toBeCloseTo(4243.05, 1);
  });
  it('等额本息：总利息约 52.75 万，最后一期还清', () => {
    const s = schedule(1e6, 3.05, 360, 'ei');
    expect(s.reduce((a, r) => a + r.int, 0)).toBeCloseTo(527500, -1);
    expect(s[359].bal).toBeCloseTo(0, 4);
  });
  it('等额本金：首月 ¥5,319.44，总利息约 45.88 万', () => {
    const s = schedule(1e6, 3.05, 360, 'ep');
    expect(s[0].pay).toBeCloseTo(5319.44, 1);
    expect(s.reduce((a, r) => a + r.int, 0)).toBeCloseTo(458771, -1);
  });
  it('零利率时平均摊还', () => {
    expect(annuity(120000, 0, 12)).toBe(10000);
  });
  it('逐月扣款和一次性算的计划表一致', () => {
    const L = newLoan('com', 500000, 3.1, 240, 'ei');
    const s = schedule(500000, 3.1, 240, 'ei');
    for (let i = 0; i < 240; i++) { const d = loanDue(L); expect(d.int).toBeCloseTo(s[i].int, 6); loanApply(L, d); }
    expect(L.balance).toBe(0);
  });
  it('利率变化后重新计算月供，余额不变', () => {
    const L = newLoan('com', 500000, 3.5, 360, 'ei');
    for (let i = 0; i < 12; i++) loanApply(L, loanDue(L));
    const bal = L.balance; L.rate = 3.2; loanReset(L);
    expect(L.balance).toBe(bal);
    expect(L.pay).toBeCloseTo(annuity(bal, 3.2, 348), 6);
  });
  it('组合贷 = 商贷 + 公积金分别计算再相加', () => {
    const c = combinedSchedule({ com: 600000, comRate: 3.05, gjj: 400000, gjjRate: 2.6, years: 30 }, 'ei');
    expect(c[0].pay).toBeCloseTo(annuity(600000, 3.05, 360) + annuity(400000, 2.6, 360), 6);
  });
});

describe('工资和个税', () => {
  it('北京税前 2 万：社保 2100、公积金 1400、个税 840、到手 15660', () => {
    const p = payroll(20000, cityById('bj'), 7, 1000);
    expect(p.si).toBeCloseTo(2100); expect(p.gjj).toBeCloseTo(1400); expect(p.tax).toBeCloseTo(840); expect(p.net).toBeCloseTo(15660);
    expect(p.gjjIn).toBeCloseTo(2800);
  });
  it('没有收入时到手为 0', () => {
    expect(payroll(0, cityById('cd'), 7, 0).net).toBe(0);
  });
  it('年终奖单独计税：3 万交 900', () => {
    expect(taxBonus(30000)).toBe(900);
  });
});
