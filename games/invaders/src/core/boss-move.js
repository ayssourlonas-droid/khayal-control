import { clamp, lerp } from './math.js';
import { WIDTH, MID_X } from './kinds.js';

// How a boss moves. Each style is a smooth function of the boss's own clock (which a phase's
// `rate` speeds up), and the boss follows its goal at a bounded speed, so a change of phase glides
// instead of jumping. Nothing here touches the player: a boss is shot at, never rammed (in a free level, R67, touching a
// live part costs the ship a life: free.js).

export const ENTER = 2; // s the boss takes to fly in, during which it cannot be hurt
const DROP = 340; // px above its resting place it starts
const FOLLOW = 6; // 1/s: how hard the boss pulls toward its goal
const CAP = 420; // px/s: the fastest it moves
const LUNGE = 7; // s between the lunges of the 'charge' style
const ARENA_FLOOR = 585; // y no part may go below, so every part stays in range of the ship's shots

// Where the style says the boss's centre should be at `clock` s. `ship` is what a lunge goes after.
function goal(def, move, clock, ship) {
  const range = (WIDTH - def.size.w) / 2 - 60; // how far from the middle it may roam
  switch (move) {
    case 'hover':
      return { x: MID_X + 0.3 * range * Math.sin(0.25 * clock), y: def.y + 20 * Math.sin(0.9 * clock) };
    case 'orbit':
      return { x: MID_X + 0.85 * range * Math.sin(0.34 * clock), y: def.y + 55 * Math.cos(0.68 * clock) };
    case 'charge': {
      const c = (clock % LUNGE) / LUNGE;
      const bump = c > 0.55 && c < 0.85 ? Math.sin((Math.PI * (c - 0.55)) / 0.3) ** 2 : 0;
      const sway = MID_X + 0.7 * range * Math.sin(0.34 * clock);
      const dip = Math.min(130, ARENA_FLOOR - def.y - def.bottom);
      return { x: lerp(sway, ship.x, 0.7 * bump), y: def.y + dip * bump + 10 * Math.sin(1.3 * clock) };
    }
    default: // 'sway'
      return { x: MID_X + 0.85 * range * Math.sin(0.42 * clock), y: def.y + 14 * Math.sin(1.3 * clock) };
  }
}

// Where the boss starts, before its first step.
export const startAt = (def) => ({ x: MID_X, y: def.y - DROP });

// One step: the boss's clock runs, and it flies in until `b.enter` is spent, then glides after its goal.
export function stepMove(b, def, dt, ship) {
  const phase = def.phases[b.phase];
  b.clock += dt * (phase.rate ?? 1);
  const g = goal(def, phase.move, b.clock, ship);
  const reach = CAP * dt;
  const half = def.size.w / 2 + 20;
  b.x = clamp(b.x + clamp((g.x - b.x) * (1 - Math.exp(-FOLLOW * dt)), -reach, reach), half, WIDTH - half);
  if (b.enter > 0) b.y = g.y - DROP * (b.enter / ENTER) ** 2;
  else b.y += clamp((g.y - b.y) * (1 - Math.exp(-FOLLOW * dt)), -reach, reach);
}
