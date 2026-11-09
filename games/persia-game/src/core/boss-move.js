import { clamp, lerp } from './math.js';
import { WIDTH, MID_X } from './kinds.js';

// How a boss moves. Each style is a smooth function of the boss's own clock (which a phase's
// `rate` speeds up), and the boss follows its goal at a bounded speed, so a change of phase glides
// instead of jumping. Nothing here touches the player: a boss is shot at, never rammed.

export const ENTER = 2; // s the boss takes to fly in, during which it cannot be hurt
const DROP = 340; // px above its resting place it starts
const FOLLOW = 6; // 1/s: how hard the boss pulls toward its goal
const CAP = 420; // px/s: the fastest it moves
const LUNGE = 7; // s between the lunges of the 'charge' style
const ARENA_FLOOR = 585; // y no part may go below, so every part stays in range of the ship's shots

// Every boss move there is, by name: where it puts the boss's centre at `clock` s. `range` is how
// far from the middle it may roam; `ship` is what a lunge goes after.
export const MOVES = {
  sway: (def, clock, range) => ({ x: MID_X + 0.85 * range * Math.sin(0.42 * clock), y: def.y + 14 * Math.sin(1.3 * clock) }),
  charge: (def, clock, range, ship) => {
    const c = (clock % LUNGE) / LUNGE;
    const bump = c > 0.55 && c < 0.85 ? Math.sin((Math.PI * (c - 0.55)) / 0.3) ** 2 : 0;
    const sway = MID_X + 0.7 * range * Math.sin(0.34 * clock);
    const dip = Math.min(130, ARENA_FLOOR - def.y - def.bottom);
    return { x: lerp(sway, ship.x, 0.7 * bump), y: def.y + dip * bump + 10 * Math.sin(1.3 * clock) };
  },
};

// Where the boss starts, before its first step.
export const startAt = (def) => ({ x: MID_X, y: def.y - DROP });

// One step: the boss's clock runs, and it flies in until `b.enter` is spent, then glides after its goal.
export function stepMove(b, def, dt, ship) {
  const phase = def.phases[b.phase];
  b.clock += dt * (phase.rate ?? 1);
  const g = MOVES[phase.move](def, b.clock, (WIDTH - def.size.w) / 2 - 60, ship);
  const reach = CAP * dt;
  const half = def.size.w / 2 + 20;
  b.x = clamp(b.x + clamp((g.x - b.x) * (1 - Math.exp(-FOLLOW * dt)), -reach, reach), half, WIDTH - half);
  if (b.enter > 0) b.y = g.y - DROP * (b.enter / ENTER) ** 2;
  else b.y += clamp((g.y - b.y) * (1 - Math.exp(-FOLLOW * dt)), -reach, reach);
}
