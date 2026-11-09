import { posAt } from './predict.js';
import { laserSegment } from './patterns.js';
import { SHIP_R, ZONE, moveShip } from './ship.js';
import { isSwooping } from './aliens.js';
import { ALIEN_R } from './kinds.js';
import { segDist2, clamp } from './math.js';

// Staying alive. Everything that can hurt the ship is followed for N samples DT apart: bullets in
// a straight line, divers along their swoop, a laser as a fixed segment that burns from `warn` to
// the end of its life. Then a few places the ship could fly to are tried, each flown with the
// ship's own movement (moveShip, so its ease and its speed are exactly right) from where it is and
// how fast it is going, and the cheapest wins: a predicted hit costs far more than any detour.

const N = 24;
const DT = 2 / 60; // s between samples: two ticks
const SPAN = 480; // px: threats that cannot come within this (plus their size) of the ship are not followed
const MARGIN = 10; // px of room on top of the hit radii
const HIT = 1000; // what a predicted hit costs, in px of wandering; a dead-centre one costs 40 % more
const BEAM = 1500; // what a laser costs: it cannot be shot away, so it counts for more
const STEP_X = 36; // px between the places tried, either side of the ship
const STEPS = 10; // how many steps either way
const ROWS = [0, -90, 50]; // the rows tried, as offsets from the row it wants: its own, higher (more time), lower
const PULL_X = 0.5; // what a px of sideways detour from the wanted spot costs (a hit costs HIT)
const PULL_Y = 0.3; // and a px of vertical detour

const sampled = (r, at) => {
  const xs = new Float64Array(N);
  const ys = new Float64Array(N);
  for (let k = 0; k < N; k++) {
    const p = at((k + 1) * DT);
    xs[k] = p.x;
    ys[k] = p.y;
  }
  return { r2: r * r, xs, ys };
};

function threatsOf(world) {
  const s = world.ship;
  const bodies = [];
  const beams = [];
  const span = N * DT;
  for (const b of world.bullets) {
    if (b.life <= 0) continue;
    if (b.pattern === 'laser') {
      beams.push({ seg: laserSegment(b), warn: b.warn, life: b.life, reach: b.r + SHIP_R + MARGIN });
      continue;
    }
    const r = b.r + SHIP_R + MARGIN;
    if (segDist2(b.x, b.y, b.x + b.vx * span, b.y + b.vy * span, s.x, s.y) > (SPAN + r) ** 2) continue;
    bodies.push(sampled(r, (t) => ({ x: b.x + b.vx * t, y: b.y + b.vy * t })));
  }
  for (const a of world.aliens) {
    if (a.hp > 0 && isSwooping(a)) {
      bodies.push(sampled(ALIEN_R + SHIP_R + MARGIN, (t) => posAt(world, a, t)));
    }
  }
  return { bodies, beams };
}

// Fly a copy of the ship toward `to` for N samples with the real movement, writing where it is at
// each sample.
function fly(ship, to, path) {
  const copy = { x: ship.x, y: ship.y, vx: ship.vx, vy: ship.vy };
  const input = { target: to };
  for (let k = 0; k < N; k++) {
    moveShip(copy, DT, input);
    path.xs[k] = copy.x;
    path.ys[k] = copy.y;
  }
}

// What flying `path` would cost in hits, counting from sample `from` on (before that the ship is
// blinking or shielded and nothing lands).
function hazard(path, threats, from) {
  let h = 0;
  for (const t of threats.bodies) {
    let best = Infinity;
    for (let k = from; k < N; k++) best = Math.min(best, (path.xs[k] - t.xs[k]) ** 2 + (path.ys[k] - t.ys[k]) ** 2);
    if (best < t.r2) h += HIT * (1.4 - 0.4 * Math.sqrt(best / t.r2));
  }
  for (const b of threats.beams) {
    for (let k = from; k < N; k++) {
      const t = (k + 1) * DT;
      if (t < b.warn - DT || t > b.life + DT) continue;
      if (segDist2(b.seg.x1, b.seg.y1, b.seg.x2, b.seg.y2, path.xs[k], path.ys[k]) < b.reach ** 2) {
        h += BEAM;
        break;
      }
    }
  }
  return h;
}

// Where to fly to: `want` if that is safe, else the cheapest place near it.
export function steer(world, want) {
  const s = world.ship;
  const immune = Math.max(s.invuln, s.power?.kind === 'shield' ? s.power.left : 0);
  const from = Math.min(N, Math.ceil(immune / DT));
  if (from >= N) return want;
  const threats = threatsOf(world);
  if (!threats.bodies.length && !threats.beams.length) return want;
  const path = { xs: new Float64Array(N), ys: new Float64Array(N) };
  // what flying to c costs: its hazard h plus the detour from `want` (h = 0: the detour alone)
  const costOf = (c, h = 0) => h + PULL_X * Math.abs(c.x - want.x) + PULL_Y * Math.abs(c.y - want.y);
  const price = (c) => {
    fly(s, c, path);
    const h = hazard(path, threats, from);
    return { h, cost: costOf(c, h) };
  };
  const first = price(want);
  if (first.h === 0) return want;
  let best = want;
  let bestCost = first.cost;
  const rows = ROWS.map((d) => clamp(want.y + d, ZONE.y0, ZONE.y1));
  const tries = [{ x: s.x, y: s.y }];
  for (let k = -STEPS; k <= STEPS; k++) for (const y of rows) tries.push({ x: clamp(s.x + STEP_X * k, ZONE.x0, ZONE.x1), y });
  for (const c of tries) {
    // a hazard only adds, so a detour that alone reaches bestCost cannot win: skip the flight
    if (costOf(c) >= bestCost) continue;
    const v = price(c);
    if (v.cost < bestCost) {
      best = c;
      bestCost = v.cost;
    }
  }
  return best;
}
