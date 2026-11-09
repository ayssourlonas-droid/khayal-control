import { TICK } from './kinds.js';

// The fixed-step accumulator of the game loop. Each frame adds the time it covers (already scaled
// by presentation slow motion: the caller passes frameDt * fx.slow, ruling R19) and steps the core
// that many whole ticks of TICK, never a scaled dt, so the same inputs always play out the same.
//   advance(acc, dt) -> { ticks, acc }
// At most MAX_STEPS ticks a frame: after a hitch the game slows for that frame rather than
// spiralling. Whole ticks past the cap are dropped (no backlog to race through later); the
// fraction of a tick left over is always kept for the next frame.

export const MAX_STEPS = 5;
const EPS = 1e-6; // of a tick: three ticks' worth summed in floats lands a hair short, still three

export function advance(acc, dt) {
  const total = acc + (dt > 0 ? dt : 0);
  const due = Math.floor(total / TICK + EPS);
  return { ticks: Math.min(due, MAX_STEPS), acc: Math.max(0, total - due * TICK) };
}
