import { describe, it, expect } from 'vitest';
import { CITIES, PLATFORMS, cityById } from '../src/data/index.js';
import { defaultCfg, genListings } from '../src/core/setup.js';
import { defaultLoanCtl, loanPlan } from '../src/core/loan.js';
import { initLife, stepMonth, setAsk, setShortage, newDebt, worlds, mortBalance } from '../src/core/engine.js';
import { makeRng } from '../src/core/util.js';
import { assetById } from '../src/data/index.js';

/* 随机玩很多局：不能报错，每个月流水合计必须等于现金变化 */
async function playOne(k){
  const city = CITIES[k % CITIES.length];
  const cfg = defaultCfg(city.id);
  const rng = makeRng(k * 7 + 1);
  const Ls = genListings(city, k + 99);
  const L = Ls[k % Ls.length];
  const ctl = defaultLoanCtl(L, cfg);
  let P = loanPlan(L, cfg, ctl);
  if (P.left < 0) { ctl.plats = { family: Math.min(300000, Math.ceil(-P.left / 10000) * 10000) }; P = loanPlan(L, cfg, ctl); }
  if (!P.ok) { ctl.bank = 'nong'; ctl.cob = true; P = loanPlan(L, cfg, ctl); }
  if (!P.ok) return { skipped: true };
  const g = initLife(cfg, L, P, k + 5);
  setAsk(async spec => { const o = (spec.options || []).filter(x => !x.disabled); return o[Math.floor(rng() * o.length)].id; });
  setShortage(async (g, need, label, canSkip) => {
    g.borrowed = g.borrowed || {};
    for (const p of PLATFORMS) {
      const amt = Math.ceil((need - g.cash) / (p.kind === 'illegal' ? 0.7 : 1) / p.step) * p.step;
      if (amt <= p.max - (g.borrowed[p.id] || 0) && rng() < 0.7) {
        const d = newDebt(p, amt); d.fresh = true; g.debts.push(d);
        const recv = p.kind === 'illegal' ? amt * 0.7 : amt;
        g.cash += recv; g.borrowed[p.id] = (g.borrowed[p.id] || 0) + amt; g.cmp.borrowNow = (g.cmp.borrowNow || 0) + recv;
        (g._lines = g._lines || []).push(['借款', recv]);
        if (g.cash >= need) return 'paid';
      }
    }
    return canSkip ? 'skip' : 'paid';
  });
  let res, months = 0;
  while (true) {
    const before = g.cash;
    res = await stepMonth(g); months++;
    if (res === 'sold') break;
    if (Math.abs((g.cash - before) - g.last.total) > 1) throw new Error(`流水对不上：${city.id} ${L.type} 第${g.t}月`);
    if (res === 'end' || months > 400) break;
  }
  const W = worlds(g, assetById('csi'), true);
  if (W.some(w => !isFinite(w.buy) || !isFinite(w.rent))) throw new Error('平行宇宙出现 NaN');
  return { type: g.ended?.type || res, hair: g.st.hair };
}

describe('整局模拟', () => {
  it('120 局随机人生全部跑完，账目每月都对得上', async () => {
    const tally = {};
    for (let k = 0; k < 120; k++) { const r = await playOne(k); if (!r.skipped) tally[r.type] = (tally[r.type] || 0) + 1; }
    const total = Object.values(tally).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(60);
    expect((tally.payoff || 0) + (tally.horizon || 0)).toBeGreaterThan(0);
  }, 60000);

  it('全款买房也能一直玩到结束', async () => {
    const cfg = { ...defaultCfg('hg') };
    const L = genListings(cityById('hg'), 3)[0];
    const ctl = { ...defaultLoanCtl(L, cfg), down: 100 };
    const P = loanPlan(L, cfg, ctl);
    expect(P.loanTotal).toBe(0);
    const g = initLife(cfg, L, P, 9);
    setAsk(async spec => spec.options[0].id); setShortage(async () => 'paid');
    for (let i = 0; i < 24; i++) await stepMonth(g);
    expect(mortBalance(g)).toBe(0);
  });
});
