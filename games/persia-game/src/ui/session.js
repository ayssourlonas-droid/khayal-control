// One level being played: the world, its effects and the fixed-step accumulator. DOM-free, so the
// tests drive it exactly as the game loop does.
//   createSession(level, seed?) -> session
//   stepSession(s, frameDt, source, onEvents?)   one real frame
// Ruling R19: slow motion is presentation only: the frame's time is scaled by fx.slow before the
// accumulator, and the core always steps a whole TICK (fewer ticks per frame). The core stops once
// the level is cleared or failed.
import { createWorld, stepWorld } from '../core/world.js';
import { quantizeInput } from '../core/input-codec.js';
import { TICK } from '../core/kinds.js';
import { advance } from '../core/loop.js';
import { finished } from '../core/util.js';
import { makeRng } from '../core/rng.js';
import { createFx, stepFx } from '../fx/fx.js';
import { applyEvents } from '../fx/react.js';

const FX_SALT = 0x5eed;

// The effects' own rng for a run's seed: they never draw from world.rng.
const fxRng = (seed) => makeRng((seed ^ FX_SALT) >>> 0);

export function createSession(level, seed = level.seed) {
  return {
    world: createWorld(level, seed), fx: createFx(), fxRng: fxRng(seed), acc: 0,
    over: 0, // real seconds since the level finished (results wait for the slow motion)
  };
}

// source(world) -> raw input for the next tick (keys, pointer or autopilot); it is quantized before
// the core sees it. onEvents(events, input) sees each tick's events after fx has (sound).
export function stepSession(s, frameDt, source, onEvents) {
  const { ticks, acc } = advance(s.acc, frameDt * s.fx.slow);
  s.acc = acc;
  const { world } = s;
  for (let i = 0; i < ticks && !finished(world); i++) {
    const input = quantizeInput(source ? source(world) : undefined);
    stepWorld(world, TICK, input);
    const events = world.events.splice(0);
    applyEvents(s.fx, events, s.fxRng, world);
    onEvents?.(events, input);
  }
  stepFx(s.fx, frameDt);
  if (finished(world)) s.over += frameDt;
}
