import { posAt, bossShifts } from './predict.js';
import { liveParts } from './boss-hit.js';
import { isSwooping } from './aliens.js';
import { SHOT_SPEED, MUZZLE, ZONE, FOLLOW } from './ship.js';
import { clamp } from './math.js';
import { TICK } from './kinds.js';

// Where the ship should stand to shoot: the point under the nearest thing it can hit, aimed where
// that thing will be when the shot gets there. Targets: aliens and the boss's weak parts (plates
// when none is weak), each led by its own movement (predict.js).

export const HOME_Y = 960; // the row the ship fights from
const LAG = 1 / FOLLOW; // s: the ship follows a pointer target with this time constant, so aim that far further ahead
const BIAS = { plate: 200, boss: -50, diver: -200 }; // px added to the distance when ranking

// Where `t` will be when a shot fired now reaches it (the flight time depends on where it is then).
function lead(world, t, muzzle) {
  let p = posAt(world, t, LAG);
  for (let i = 0; i < 2; i++) p = posAt(world, t, Math.max(0, muzzle - p.y) / SHOT_SPEED + LAG);
  return p;
}

// Aliens (minions and divers included), each at the point a shot will find it.
function alienTargets(world, muzzle) {
  const out = [];
  for (const t of world.aliens) {
    if (t.hp <= 0) continue;
    const p = lead(world, t, muzzle);
    if (p.y < 20 || p.y > muzzle - 20) continue;
    out.push({ x: p.x, y: p.y, bias: isSwooping(t) ? BIAS.diver : 0 });
  }
  return out;
}

// Columns across the middle of a part (12 px in from each edge, so that a boss moving a little
// differently than foreseen still gets hit) from which a shot reaches it first: none of the other
// live parts is lower and in the way.
function openColumns(parts, p) {
  const out = [];
  for (let i = 0; i <= 8; i++) {
    const x = p.x + ((i / 4 - 1) * Math.max(0, p.w - 24)) / 2;
    const shielded = parts.some((q) => q !== p && Math.abs(x - q.x) <= q.w / 2 + 5 && q.y + q.h / 2 > p.y + p.h / 2);
    if (!shielded) out.push(x);
  }
  return out;
}

// The weak parts a shot can reach, or the plates when none is weak.
function bossTargets(world, muzzle) {
  const parts = liveParts(world);
  if (!parts.length) return [];
  const open = new Map(parts.map((p) => [p, openColumns(parts, p)]));
  const reachable = (p) => open.get(p).length > 0;
  const weak = parts.filter((p) => p.weak && reachable(p));
  const pool = weak.length ? weak : parts.filter(reachable);
  const shifts = bossShifts(world, 45);
  const out = [];
  for (const p of pool) {
    const bottom = p.y + p.h / 2;
    let s = shifts[0];
    for (let i = 0; i < 2; i++) {
      const ticks = Math.round((Math.max(0, muzzle - bottom - s.dy) / SHOT_SPEED + LAG) / TICK);
      s = shifts[clamp(ticks, 0, shifts.length - 1)];
    }
    const ship = world.ship.x - s.dx;
    const x = open.get(p).reduce((a, b) => (Math.abs(b - ship) < Math.abs(a - ship) ? b : a));
    out.push({ x: x + s.dx, y: bottom + s.dy, bias: weak.length ? BIAS.boss : BIAS.plate });
  }
  return out;
}

// The aim point { x, y } for the ship, or null when there is nothing to shoot at: the nearest
// target, its distance weighed by its bias.
export function chooseAim(world) {
  const { ship } = world;
  const muzzle = ship.y - MUZZLE;
  const all = [...alienTargets(world, muzzle), ...bossTargets(world, muzzle)];
  const dist = (c) => Math.abs(c.x - ship.x) + c.bias;
  let best = null;
  for (const c of all) if (!best || dist(c) < dist(best)) best = c;
  return best && { x: clamp(best.x, ZONE.x0, ZONE.x1), y: HOME_Y };
}
