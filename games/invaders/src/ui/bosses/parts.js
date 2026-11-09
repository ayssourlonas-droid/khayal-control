// A boss's parts per frame, in their state (bosses/index.js draws the hull round them):
//   partStage(p)                       0 | 1 | 2, how cracked a part is drawn (hp lost out of max)
//   halos(ctx, b, pal, t, k)           the pulsing glow round each live weak point
//   partBodies(ctx, b, B, look, t)     whole, cracked as it loses hp, white for FLASH s after a hit,
//                                      split open once `cracked`, sliding open once a phase opens
//                                      it, charred wreckage once destroyed
//   partLights(ctx, b, B, look, t, k)  their lights (weak points pulse; fissures and opened ports
//                                      fade in with a burst), at strength k
//   warns(ctx, b, B, look, t, k)       a charge-up on every part about to fire
//   alive(b, id), glowAt(ctx, b, p, color, dx, dy, r, a)
//                                      for a module's live extras: a part still standing, and a
//                                      glow at a part's centre, dx, dy aside, in boss coordinates
// What changed when (hit, crack, open) is this module's own memory, a WeakMap per part; a part
// first seen already open or cracked is drawn finished, so a frozen dev frame or a cloned world
// never replays the transition. Nothing on world or fx is written.
import { glow, star } from '../sprites.js';
import { clamp, smooth } from '../../core/math.js';
import { cracked, exposed, wreck } from './cracks.js';

const FLASH = 0.06; // s a part shows white after losing hp
const OPEN = 1.6; // s a part takes to slide open (the fortress trench)
const CRACK = 0.6; // s a plate takes to split open
const NEVER = -1e9;

export const alive = (b, id) => b.parts.find((p) => p.id === id && p.hp > 0);

export function glowAt(ctx, b, p, color, dx, dy, r, a) {
  ctx.globalAlpha = a;
  ctx.drawImage(glow(color), p.x - b.x + dx - r, p.y - b.y + dy - r, r * 2, r * 2);
}

export function partStage(p) {
  if (p.hp >= p.max) return 0;
  return (p.max - p.hp) / p.max > 0.5 ? 2 : 1;
}

const partMemo = new WeakMap();

function memo(p, t) {
  let m = partMemo.get(p);
  if (!m) {
    m = { hp: p.hp, hit: NEVER, cracked: p.cracked, crackAt: NEVER, open: p.open, openAt: NEVER };
    partMemo.set(p, m);
  }
  if (p.hp < m.hp) m.hit = t;
  m.hp = p.hp;
  if (p.cracked !== m.cracked) [m.cracked, m.crackAt] = [p.cracked, t];
  if (p.open !== m.open) [m.open, m.openAt] = [p.open, t];
  return m;
}

const corner = (p, set) => [p.x - set.w / 2 - set.m, p.y - set.h / 2 - set.m];
const pulseOf = (p, t) => 0.5 + 0.5 * Math.sin(t * 5.2 + p.dx * 0.02);

// The closed art split down the middle, its halves sliding apart and fading over the open art.
function sliding(ctx, img, x, y, e) {
  const hw = img.width / 2;
  ctx.globalAlpha = 1 - e;
  ctx.drawImage(img, 0, 0, hw, img.height, x - e * hw, y, hw, img.height);
  ctx.drawImage(img, hw, 0, hw, img.height, x + hw + e * hw, y, hw, img.height);
  ctx.globalAlpha = 1;
}

export function halos(ctx, b, pal, t, k) {
  ctx.globalCompositeOperation = 'lighter';
  for (const p of b.parts) {
    if (p.hp <= 0 || !p.weak) continue;
    const r = Math.max(p.w, p.h) * 0.95;
    ctx.globalAlpha = k * (0.26 + 0.3 * pulseOf(p, t));
    ctx.drawImage(glow(pal.weak), p.x - r, p.y - r, r * 2, r * 2);
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
      ctx.drawImage(wreck(set, p.open), x, y);
      continue;
    }
    const stage = partStage(p);
    const img = p.cracked ? exposed(set, look.palette.boss.weak).body : stage ? cracked(set, stage) : set.body;
    if (p.open && set.open) {
      ctx.drawImage(set.open.body, x, y);
      const e = smooth((t - m.openAt) / OPEN);
      if (e < 1) sliding(ctx, img, x, y, e);
    } else ctx.drawImage(img, x, y);
    if (t >= m.hit && t - m.hit < FLASH) {
      ctx.globalAlpha = p.armor ? 0.3 : 0.55; // a nudge, not a blackout: the autopilot never stops firing
      ctx.drawImage(set.flash, x, y);
      ctx.globalAlpha = 1;
    }
  }
}

// A part sliding open floods light: a white core and a swelling glow in the weak colour, a tall
// shaft of light up and down from the gap between the doors and a streak across the hull.
function openBurst(ctx, p, weak, e, k) {
  const f = Math.sin(Math.PI * e);
  const r = 60 + 340 * e;
  ctx.globalAlpha = k * f;
  ctx.drawImage(glow(weak), p.x - r, p.y - r, r * 2, r * 2);
  ctx.drawImage(glow('#ffffff'), p.x - r * 0.3, p.y - r * 0.3, r * 0.6, r * 0.6);
  ctx.drawImage(glow('#fff0d0'), p.x - 24 - 40 * f, p.y - 520, 48 + 80 * f, 1040);
  ctx.drawImage(glow(weak), p.x - 520 * f, p.y - 30, 1040 * f, 60);
}

export function partLights(ctx, b, B, look, t, k) {
  for (const p of b.parts) {
    const set = B.parts[p.id];
    const [x, y] = corner(p, set);
    if (p.hp <= 0) {
      ctx.globalAlpha = k * 0.4 * (0.6 + 0.4 * Math.sin(t * 17 + p.dx));
      const r = Math.min(p.w, p.h) * 0.7;
      ctx.drawImage(glow('#ff5a1a'), p.x - r, p.y - r, r * 2, r * 2);
      continue;
    }
    const m = memo(p, t);
    const pulse = pulseOf(p, t);
    const a = k * (p.weak ? 0.65 + 0.35 * pulse : 1);
    if (p.open && set.open) {
      const e = smooth((t - m.openAt) / OPEN);
      ctx.globalAlpha = a * e;
      ctx.drawImage(set.open.lights, x, y);
      if (e < 1) openBurst(ctx, p, look.palette.boss.weak, e, k);
      ctx.globalAlpha = a * (1 - e);
    } else ctx.globalAlpha = a;
    ctx.drawImage(set.lights, x, y);
    if (p.cracked) {
      const c = smooth((t - m.crackAt) / CRACK);
      ctx.globalAlpha = k * c * (0.6 + 0.4 * pulse);
      ctx.drawImage(exposed(set, look.palette.boss.weak).lights, x, y);
      if (c < 1) {
        const r = Math.max(p.w, p.h) * (0.6 + c);
        ctx.globalAlpha = k * (1 - c);
        ctx.drawImage(glow('#ffffff'), p.x - r, p.y - r, r * 2, r * 2);
      }
    }
  }
}

// A glow in the enemy colour swelling toward the shot, a white-hot core, a spinning flare in the
// last half, and the part's own lights flaring.
export function warns(ctx, b, B, look, t, k) {
  const col = look.palette.enemy;
  for (const w of b.warns) {
    const p = b.parts.find((q) => q.id === w.part);
    if (!p) continue;
    const e = clamp(1 - w.left / w.total, 0, 1);
    const r = 28 + 84 * e;
    ctx.globalAlpha = k * (0.35 + 0.6 * e);
    ctx.drawImage(glow(col), p.x - r, p.y - r, r * 2, r * 2);
    const c = 5 + 18 * e;
    ctx.globalAlpha = k * e;
    ctx.drawImage(glow('#ffffff'), p.x - c, p.y - c, c * 2, c * 2);
    const set = B.parts[p.id];
    const [x, y] = corner(p, set);
    ctx.globalAlpha = k * e * 0.7;
    ctx.drawImage(set.lights, x, y);
    if (e > 0.45) {
      const s = ((e - 0.45) / 0.55) * 64;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(t * 3 + p.dx);
      ctx.globalAlpha = k * 0.9;
      ctx.drawImage(star(col), -s, -s, s * 2, s * 2);
      ctx.restore();
    }
  }
}
