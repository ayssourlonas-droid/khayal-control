import { posAt, bossShifts } from './predict.js';
import { liveParts } from './boss-hit.js';
import { loose } from './damage.js';
import { isSwooping } from './aliens.js';
import { shotSpeed, MUZZLE, ZONE } from './ship.js';
import { clamp } from './math.js';
import { TICK } from './kinds.js';

// Where the ship should stand to shoot: the point under the nearest thing it can hit, aimed where
// that thing will be when the shot gets there. Targets: aliens, the bonus saucer, wrecks, and the
// boss's weak parts (plates when none is weak), each led by its own movement (predict.js).

export const HOME_Y = 960; // the row the ship fights from
const TOLERANCE = 16; // px either side of an alien's centre the shot may be moved to get through a gap
const OFFSETS = [0, -8, 8, -16, 16];
const BIAS = { saucer: 150, plate: 200, boss: -50, diver: -200 }; // px added to the distance when ranking

// Is any mask pixel within a shot's width (5 px, and one to spare) of the column x solid?
function solidColumn(b, x) {
  const lo = Math.max(0, Math.floor(x - b.x - 6.5));
  const hi = Math.min(b.w - 1, Math.floor(x - b.x + 5.5));
  for (let ix = lo; ix <= hi; ix++) {
    for (let iy = 0; iy < b.h; iy++) if (b.mask[iy * b.w + ix]) return true;
  }
  return false;
}

// Would a shot climbing the column x stop before reaching height y: in a bunker, or in the well?
function obstructed(world, x, y) {
  for (const b of world.bunkers) {
    if (y < b.y + b.h && x > b.x - 7 && x < b.x + b.w + 7 && solidColumn(b, x)) return true;
  }
  const well = world.well;
  return Boolean(well) && y < well.y + 30 && Math.abs(x - well.x) < 55;
}

// Where `t` will be when a shot fired now reaches it (the flight time depends on where it is then).
function lead(world, t, muzzle) {
  let p = posAt(world, t, 0);
  for (let i = 0; i < 2; i++) p = posAt(world, t, Math.max(0, muzzle - p.y) / shotSpeed(world.ship.power?.kind));
  return p;
}

// Aliens (minions and divers included), the saucer and wrecks, each at the point a shot will find it.
function looseTargets(world, muzzle) {
  const out = [];
  for (const t of loose(world)) {
    if (t.hp <= 0) continue;
    const p = lead(world, t, muzzle);
    if (p.y < 20 || p.y > muzzle - 20) continue;
    out.push({ x: p.x, y: p.y, bias: t.saucer ? BIAS.saucer : isSwooping(t) ? BIAS.diver : 0, tol: TOLERANCE });
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

// The weak parts a shot can reach, or the plates when none is weak (a bare hull takes nothing).
function bossTargets(world, muzzle) {
  const parts = liveParts(world);
  if (!parts.length) return [];
  const open = new Map(parts.filter((p) => p.weak || p.armor).map((p) => [p, openColumns(parts, p)]));
  const reachable = (p) => open.get(p).length > 0;
  const weak = parts.filter((p) => p.weak && reachable(p));
  const pool = weak.length ? weak : parts.filter((p) => p.armor && reachable(p));
  const shifts = bossShifts(world, 45);
  const out = [];
  for (const p of pool) {
    const bottom = p.y + p.h / 2;
    let s = shifts[0];
    for (let i = 0; i < 2; i++) {
      const ticks = Math.round(Math.max(0, muzzle - bottom - s.dy) / shotSpeed(world.ship.power?.kind) / TICK);
      s = shifts[clamp(ticks, 0, shifts.length - 1)];
    }
    const ship = world.ship.x - s.dx;
    const x = open.get(p).reduce((a, b) => (Math.abs(b - ship) < Math.abs(a - ship) ? b : a));
    out.push({ x: x + s.dx, y: bottom + s.dy, bias: weak.length ? BIAS.boss : BIAS.plate, tol: 0 });
  }
  return out;
}

// The aim point { x, y } for the ship, or null when there is nothing to shoot at. Nearest target
// first; one a bunker or the well would stop is passed over (or reached through a gap by moving the
// shot a few pixels) unless everything is covered, in which case the nearest is chipped at.
export function chooseAim(world) {
  const { ship } = world;
  const muzzle = ship.y - MUZZLE;
  const all = [...looseTargets(world, muzzle), ...bossTargets(world, muzzle)];
  const dist = (c) => Math.abs(c.x - ship.x) + c.bias;
  all.sort((a, b) => dist(a) - dist(b));
  for (const c of all) {
    const o = OFFSETS.find((d) => Math.abs(d) <= c.tol && !obstructed(world, c.x + d, c.y));
    if (o !== undefined) return { x: clamp(c.x + o, ZONE.x0, ZONE.x1), y: HOME_Y };
  }
  return all.length ? { x: clamp(all[0].x, ZONE.x0, ZONE.x1), y: HOME_Y } : null;
}
