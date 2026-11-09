// A boss's parts per frame, in their state (bosses/index.js draws the hull round them):
//   partStage(p)                       0 | 1 | 2, how cracked a part is drawn (hp lost out of max)
//   halos(ctx, b, pal, t)              the pulsing glow round each live weak point
//   partBodies(ctx, b, B, look, t)     whole, cracked as it loses hp, white for FLASH s after a hit,
//                                      split open once `cracked`, charred wreckage once destroyed
//   lifts(ctx, b, B, a)                a white lift on the hull and every live part (the boss named)
//   partLights(ctx, b, B, look, t)     their lights (weak points pulse; fissures fade in with a burst)
//   warns(ctx, b, B, look, t)          a charge-up on every part about to fire
// What changed when (hit, crack) is this module's own memory, a WeakMap per part; a part first seen
// already cracked is drawn finished, so a cloned world never plays the transition again. Nothing on
// world or fx is written.
import { glow, star } from '../sprites.js';
import { clamp, smooth } from '../../core/math.js';
import { cracked, exposed, wreck } from './cracks.js';
import { hullFlash } from './bake.js';

const FLASH = 0.06; // s a part shows white after losing hp
const CRACK = 0.6; // s a plate takes to split open
const NEVER = -1e9;

export function partStage(p) {
  if (p.hp >= p.max) return 0;
  return (p.max - p.hp) / p.max > 0.5 ? 2 : 1;
}

const partMemo = new WeakMap();

function memo(p, t) {
  let m = partMemo.get(p);
  if (!m) {
    m = { hp: p.hp, hit: NEVER, cracked: p.cracked, crackAt: NEVER };
    partMemo.set(p, m);
  }
  if (p.hp < m.hp) m.hit = t;
  m.hp = p.hp;
  if (p.cracked !== m.cracked) [m.cracked, m.crackAt] = [p.cracked, t];
  return m;
}

const corner = (p, set) => [p.x - set.w / 2 - set.m, p.y - set.h / 2 - set.m];
const pulseOf = (p, t) => 0.5 + 0.5 * Math.sin(t * 5.2 + p.dx * 0.02);

export function halos(ctx, b, pal, t) {
  ctx.globalCompositeOperation = 'lighter';
  for (const p of b.parts) {
    if (p.hp <= 0 || !p.weak) continue;
    const r = Math.max(p.w, p.h) * 0.95;
    ctx.globalAlpha = 0.26 + 0.3 * pulseOf(p, t);
    ctx.drawImage(glow(pal.weak), p.x - r, p.y - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// The white lift on the hull and every live part while the boss's species is being said, at alpha a.
export function lifts(ctx, b, B, a) {
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a;
  ctx.drawImage(hullFlash(B), b.x + B.hull.x0, b.y + B.hull.y0);
  for (const p of b.parts) {
    if (p.hp <= 0) continue;
    const set = B.parts[p.id];
    const [x, y] = corner(p, set);
    ctx.drawImage(set.flash, x, y);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

export function partBodies(ctx, b, B, look, t) {
  for (const p of b.parts) {
    const set = B.parts[p.id];
    const m = memo(p, t);
    const [x, y] = corner(p, set);
    if (p.hp <= 0) {
      ctx.drawImage(wreck(set), x, y);
      continue;
    }
    const stage = partStage(p);
    const img = p.cracked ? exposed(set, look.palette.boss.weak).body : stage ? cracked(set, stage) : set.body;
    ctx.drawImage(img, x, y);
    if (t >= m.hit && t - m.hit < FLASH) {
      ctx.globalAlpha = p.weak ? 0.55 : 0.3; // a nudge, not a blackout: the autopilot never stops firing
      ctx.drawImage(set.flash, x, y);
      ctx.globalAlpha = 1;
    }
  }
}

export function partLights(ctx, b, B, look, t) {
  for (const p of b.parts) {
    const set = B.parts[p.id];
    const [x, y] = corner(p, set);
    if (p.hp <= 0) {
      ctx.globalAlpha = 0.4 * (0.6 + 0.4 * Math.sin(t * 17 + p.dx));
      const r = Math.min(p.w, p.h) * 0.7;
      ctx.drawImage(glow('#ff5a1a'), p.x - r, p.y - r, r * 2, r * 2);
      continue;
    }
    const m = memo(p, t);
    const pulse = pulseOf(p, t);
    ctx.globalAlpha = p.weak ? 0.65 + 0.35 * pulse : 1;
    ctx.drawImage(set.lights, x, y);
    if (p.cracked) {
      const c = smooth((t - m.crackAt) / CRACK);
      ctx.globalAlpha = c * (0.6 + 0.4 * pulse);
      ctx.drawImage(exposed(set, look.palette.boss.weak).lights, x, y);
      if (c < 1) {
        const r = Math.max(p.w, p.h) * (0.6 + c);
        ctx.globalAlpha = 1 - c;
        ctx.drawImage(glow('#ffffff'), p.x - r, p.y - r, r * 2, r * 2);
      }
    }
  }
}

// A glow in the enemy colour swelling toward the shot, a white-hot core, a spinning flare in the
// last half, and the part's own lights flaring.
export function warns(ctx, b, B, look, t) {
  const col = look.palette.enemy;
  for (const w of b.warns) {
    const p = b.parts.find((q) => q.id === w.part);
    if (!p) continue;
    const e = clamp(1 - w.left / w.total, 0, 1);
    const r = 28 + 84 * e;
    ctx.globalAlpha = 0.35 + 0.6 * e;
    ctx.drawImage(glow(col), p.x - r, p.y - r, r * 2, r * 2);
    const c = 5 + 18 * e;
    ctx.globalAlpha = e;
    ctx.drawImage(glow('#ffffff'), p.x - c, p.y - c, c * 2, c * 2);
    const set = B.parts[p.id];
    const [x, y] = corner(p, set);
    ctx.globalAlpha = e * 0.7;
    ctx.drawImage(set.lights, x, y);
    if (e > 0.45) {
      const s = ((e - 0.45) / 0.55) * 64;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(t * 3 + p.dx);
      ctx.globalAlpha = 0.9;
      ctx.drawImage(star(col), -s, -s, s * 2, s * 2);
      ctx.restore();
    }
  }
}
