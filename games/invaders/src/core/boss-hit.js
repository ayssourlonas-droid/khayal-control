import { syncBoss } from './boss-phase.js';
import { emit } from './util.js';

// What hurts a boss. The parts are the targets: damage.js lists them, and these are the rules.
//   weak part  full damage        armor plate  25 %        bare hull  none (it still soaks shots)
// A shot or the beam goes through that rule (hurtPart); a bomb is raw damage (bombBoss). A part at
// 0 hp is gone and no longer blocks. Every change re-adds the boss's hp (syncBoss), which is where
// phases change, plates crack open when no weak point is left, and the boss dies.

const ARMOR = 0.25;
const BOMB_BOSS_SHARE = 0.08; // of the boss's max hp, per bomb, as raw damage

// The parts that can be hit right now: none while the boss flies in or once it is dying.
export function liveParts(world) {
  const b = world.boss;
  return b && b.enter <= 0 && b.dying === null ? b.parts.filter((p) => p.hp > 0) : [];
}

// `dealt` points off the part, whatever its rule, with the hit or the part-down event. `at` is where
// it landed (default: the part's centre), for the sparks.
function damagePart(world, p, dealt, at = p) {
  if (p.hp <= 0) return;
  p.hp = Math.max(0, p.hp - dealt);
  if (p.hp < 1e-9) p.hp = 0;
  const b = world.boss;
  if (p.hp > 0) {
    emit(world, 'hit', { id: p.id, role: 'boss', part: p.id, x: at.x, y: at.y, hp: p.hp, dmg: dealt, weak: p.weak });
  } else {
    emit(world, 'partDown', { kind: b.kind, part: p.id, x: p.x, y: p.y, weak: p.weak });
    emit(world, 'explode', { x: p.x, y: p.y, size: 1 });
  }
  syncBoss(world);
}

// `dmg` through the part's rule.
export function hurtPart(world, p, dmg, at = p) {
  damagePart(world, p, dmg * (p.weak ? 1 : p.armor ? ARMOR : 0), at);
}

// A bomb takes 8 % of the boss's max hp as raw damage (the armour rule does not apply), shared
// equally by the live parts that can be damaged, weak ones first. What a part cannot take moves on
// to the next, and what is still left after the last goes back to the first that can take it, so
// the total is min(8 % of max hp, what the parts have left). A bare hull is not touched.
export function bombBoss(world) {
  const live = liveParts(world).filter((p) => p.weak || p.armor);
  const order = [...live.filter((p) => p.weak), ...live.filter((p) => !p.weak)];
  if (!order.length) return;
  const share = (world.boss.maxHp * BOMB_BOSS_SHARE) / order.length;
  const take = order.map(() => 0);
  let carry = 0;
  order.forEach((p, i) => {
    take[i] = Math.min(share + carry, p.hp);
    carry += share - take[i];
  });
  order.forEach((p, i) => {
    const more = Math.min(carry, p.hp - take[i]);
    take[i] += more;
    carry -= more;
  });
  order.forEach((p, i) => {
    if (take[i] > 0) damagePart(world, p, take[i]);
  });
}

// Where the segment (ax, ay)-(bx, by) first enters the rectangle of `p` grown by r: its fraction
// along the segment, or Infinity when it never does. (Slab method.)
function entry(ax, ay, bx, by, r, p) {
  let t0 = 0;
  let t1 = 1;
  const axes = [[ax, bx, p.x - p.w / 2 - r, p.x + p.w / 2 + r], [ay, by, p.y - p.h / 2 - r, p.y + p.h / 2 + r]];
  for (const [a, b, lo, hi] of axes) {
    const d = b - a;
    if (Math.abs(d) < 1e-9) {
      if (a < lo || a > hi) return Infinity;
    } else {
      const u = (lo - a) / d;
      const v = (hi - a) / d;
      t0 = Math.max(t0, Math.min(u, v));
      t1 = Math.min(t1, Math.max(u, v));
      if (t0 > t1) return Infinity;
    }
  }
  return t0;
}

// A trident bolt (world 15) is not spent on a part: it hurts every live part its path crossed this
// tick that it has not hurt before, the one entered first first, and flies on. Plates and bare hulls
// do not stop it; each part takes the damage by its own rule (hurtPart). The ids go in s.pierced.
function pierceParts(world, s, parts, dt) {
  const px = s.x - s.vx * dt;
  const py = s.y - s.vy * dt;
  const crossed = parts
    .map((p) => ({ p, u: p.hp > 0 && !s.pierced.includes(p.id) ? entry(px, py, s.x, s.y, s.r, p) : Infinity }))
    .filter((c) => c.u < Infinity)
    .sort((a, b) => a.u - b.u);
  for (const { p } of crossed) {
    s.pierced.push(p.id);
    hurtPart(world, p, s.dmg ?? 1, s);
  }
}

// The live part of `parts` that projectile `p` entered first along its path this tick, or null.
export function firstPart(parts, p, dt) {
  let best = null;
  let first = Infinity;
  for (const q of parts) {
    if (q.hp <= 0) continue;
    const u = entry(p.x - p.vx * dt, p.y - p.vy * dt, p.x, p.y, p.r, q);
    if (u < first) {
      best = q;
      first = u;
    }
  }
  return best;
}

// Each ship shot still flying is spent on the first live part its path crossed this tick, which
// takes the damage (a plate in front of a weak point shields it). A trident bolt runs through them all.
export function shotsVsBoss(world, dt) {
  const parts = liveParts(world);
  if (!parts.length) return;
  for (const s of world.shots) {
    if (s.life <= 0) continue;
    if (s.trident) {
      pierceParts(world, s, parts, dt);
      continue;
    }
    const best = firstPart(parts, s, dt);
    if (!best) continue;
    s.life = 0;
    hurtPart(world, best, s.dmg ?? 1, s);
  }
}
