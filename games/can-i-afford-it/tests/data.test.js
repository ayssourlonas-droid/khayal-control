import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { CITIES, BANKS, PLATFORMS, ASSETS, RENO, RENO_BY_DECO, STYLES, TIER_STYLES, PLANS, GLOSSARY, POLICY, DEEP_PACKS } from '../src/data/index.js';

describe('数据文件', () => {
  it('政策数据有日期和来源', () => {
    expect(POLICY.asOf).toMatch(/^\d{4}-\d{2}$/);
    expect(POLICY.sources.length).toBeGreaterThan(0);
    for (const k of ['lpr5', 'gjjRate', 'gjjRateShort']) expect(POLICY[k]).toBeGreaterThan(0);
  });
  it('每个城市字段齐全、数值合理', () => {
    const ids = new Set();
    for (const c of CITIES) {
      expect(ids.has(c.id)).toBe(false); ids.add(c.id);
      for (const k of ['name', 'price', 'ratio', 'salary', 'gjjMax', 'rentDed', 'living', 'fee', 'land']) expect(c[k], `${c.id}.${k}`).toBeDefined();
      expect(c.price).toBeGreaterThan(500); expect(c.ratio).toBeGreaterThan(5);
      expect(c.d.length).toBeGreaterThan(2);
      for (const [n, p] of c.d) { expect(typeof n).toBe('string'); expect(p).toBeGreaterThan(500); }
      if (c.deepPack) expect(DEEP_PACKS[c.deepPack], c.id).toBeDefined();
    }
  });
  it('银行、平台、投资品种字段齐全', () => {
    for (const b of BANKS) expect(b.ratio).toBeGreaterThan(1);
    for (const p of PLATFORMS) { expect(p.max).toBeGreaterThan(0); expect(p.term).toBeGreaterThan(0); expect(p.step).toBeGreaterThan(0); }
    for (const a of ASSETS) expect(a.R).toBeGreaterThanOrEqual(0);
  });
  it('装修档位、风格互相对得上', () => {
    for (const tiers of Object.values(RENO_BY_DECO)) for (const t of tiers) expect(RENO[t], t).toBeDefined();
    for (const list of Object.values(TIER_STYLES)) for (const s of list) expect(STYLES[s], s).toBeDefined();
  });
  it('深度包房源引用的户型模板都存在', () => {
    for (const pack of Object.values(DEEP_PACKS)) for (const L of pack.listings) {
      expect(PLANS[L.plan], `${L.key}.plan`).toBeDefined();
      expect(L.unit[0]).toBeLessThanOrEqual(L.unit[1]);
      expect(L.area[0]).toBeLessThanOrEqual(L.area[1]);
    }
  });
  it('界面里用到的术语解释都存在', () => {
    const dir = new URL('../src/ui/', import.meta.url);
    const used = new Set();
    for (const f of readdirSync(dir)) {
      const s = readFileSync(new URL(f, dir), 'utf8');
      for (const m of s.matchAll(/term\('([a-z]+)'\)/g)) used.add(m[1]);
    }
    expect(used.size).toBeGreaterThan(10);
    for (const k of used) expect(GLOSSARY[k], k).toBeDefined();
  });
});
