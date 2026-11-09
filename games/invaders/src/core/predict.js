import { entryPosition, diveCurve } from './formations.js';
import { ENTER_TIME, DIVE_TIME, waveSpec, slotAt } from './aliens.js';
import { carrierY, minionSpeed, minionX } from './boss-attack.js';
import { bossDef } from './bosses-data.js';
import { stepMove } from './boss-move.js';
import { TICK } from './kinds.js';

// Where things will be, read off the world without changing it or drawing from its rng: the
// formations, the entry, the swoop and the boss's movement are pure functions of the clocks the
// world already holds, so the autopilot can look `tau` seconds ahead exactly (while a wave or a
// boss phase lasts) instead of guessing from a velocity.

// An alien of a wave: flying in, holding its slot, or swooping.
function waveAlien(world, a, tau) {
  const spec = waveSpec(world);
  const m = world.march;
  if (!spec || !m) return a;
  if (a.mode === 'enter') {
    const age = m.age + tau;
    return age < ENTER_TIME ? entryPosition(spec.formation, a.slot, age / ENTER_TIME) : slotAt(world, a.slot, age - ENTER_TIME);
  }
  const home = slotAt(world, a.slot, tau);
  if (a.mode === 'hold' || !a.dive) return home;
  const u = (a.t + tau) / DIVE_TIME;
  return u >= 1 ? home : diveCurve({ x: a.dive.fx, y: a.dive.fy }, { x: a.dive.ax, y: a.dive.ay }, u, home);
}

// A minion of a boss, flown with boss-attack.js's own flight, integrated here in 1/30 s steps.
function minion(world, a, tau) {
  if (a.role === 'carrier') return { x: a.x + a.vx * tau, y: carrierY(a.t + tau) };
  let x = a.x;
  for (let t = 0; t < tau; t += 1 / 30) {
    const h = Math.min(1 / 30, tau - t);
    x = minionX(x, world.ship.x, a.t + t + h, a.id, h);
  }
  return { x, y: a.y + minionSpeed(world.level.d) * tau };
}

// The position of an alien, the saucer or a wreck `tau` seconds from now ({ x, y }).
export function posAt(world, t, tau) {
  if (t.saucer) return { x: t.x + t.vx * tau, y: t.y };
  if (t.wreck) return (t.hold && slotAt(world, t.slot, tau)) || t;
  if (t.minion) return minion(world, t, tau);
  return (t.slot && waveAlien(world, t, tau)) || t;
}

// How far the boss (and so each of its parts) will have moved after k ticks, k = 0..n: [{ dx, dy }].
// It steps a copy of the boss's movement with the real function, so the glide and the phase's
// style are exact; a phase change inside the span is not foreseen.
export function bossShifts(world, n) {
  const b = world.boss;
  const def = bossDef(b.kind);
  const sim = { x: b.x, y: b.y, clock: b.clock, phase: b.phase, enter: b.enter };
  const out = [{ dx: 0, dy: 0 }];
  for (let k = 1; k <= n; k++) {
    sim.enter = Math.max(0, sim.enter - TICK);
    stepMove(sim, def, TICK, world.ship);
    out.push({ dx: sim.x - b.x, dy: sim.y - b.y });
  }
  return out;
}
