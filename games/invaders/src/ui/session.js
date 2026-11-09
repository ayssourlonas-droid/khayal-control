// One level being played (or watched): the world, its effects, the fixed-step accumulator and the
// recording. DOM-free, so the tests drive it exactly as the game loop does.
//   createSession(level, seed?, { record }) -> session
//   stepSession(s, frameDt, source, onEvents?)   one real frame
//   recording(s) -> { level, seed, inputs, events, ticks, score, stars, state, tainted }
//   runOf(s) -> makeRun(...) | null   the storable run (trailer/runs.js saves the best); null for unsaved levels
// Ruling R19: slow motion is presentation only: the frame's time is scaled by fx.slow before the
// accumulator, and the core always steps a whole TICK (fewer ticks per frame), so a recording
// replays exactly. Ruling R6: every tick keeps the quantized input it ran on and its events (each
// carries `tick`). The core stops once the level is cleared or failed, so inputs.length === world.tick.
import { createWorld, stepWorld, stars } from '../core/world.js';
import { quantizeInput, makeRun, TICK } from '../core/replay.js';
import { levelById } from '../core/levels.js';
import { advance } from '../core/loop.js';
import { finished } from '../core/util.js';
import { makeRng } from '../core/rng.js';
import { createFx, stepFx } from '../fx/fx.js';
import { applyEvents } from '../fx/react.js';

const FX_SALT = 0x5eed;

// The effects' own rng for a run's seed: they never draw from world.rng.
export const fxRng = (seed) => makeRng((seed ^ FX_SALT) >>> 0);

export function createSession(level, seed = level.seed, { record = true } = {}) {
  return {
    level, seed, world: createWorld(level, seed), fx: createFx(), fxRng: fxRng(seed),
    acc: 0, record, inputs: [], events: [],
    tainted: false, // a ?debug hook changed the world: the inputs no longer replay to it
    over: 0, // real seconds since the level finished (results wait for the slow motion)
  };
}

// source(world) -> raw input for the next tick (keys, pointer, autopilot or the demo's director);
// it is quantized before the core sees it and before it is recorded. onEvents(events, input) sees
// each tick's events after fx has (sound, the demo's captions).
export function stepSession(s, frameDt, source, onEvents) {
  const { ticks, acc } = advance(s.acc, frameDt * s.fx.slow);
  s.acc = acc;
  const { world } = s;
  for (let i = 0; i < ticks && !finished(world); i++) {
    const input = quantizeInput(source ? source(world) : undefined);
    stepWorld(world, TICK, input);
    const events = world.events.splice(0);
    if (s.record) {
      s.inputs.push(input);
      for (const e of events) s.events.push(e);
    }
    applyEvents(s.fx, events, s.fxRng, world);
    onEvents?.(events, input);
  }
  stepFx(s.fx, frameDt);
  if (finished(world)) s.over += frameDt;
}

export function recording(s) {
  const { world } = s;
  return {
    level: s.level, seed: s.seed, inputs: s.inputs, events: s.events, ticks: s.inputs.length,
    score: world.score, stars: stars(world), state: world.state, tainted: s.tainted,
  };
}

// The run as storage keeps it, or null when it could not be replayed: the demo level (not in
// LEVELS), a run a debug hook changed, or one that was not recorded.
export function runOf(s) {
  if (!s.record || s.tainted || !levelById(s.level.id)) return null;
  const r = recording(s);
  return makeRun(s.level, s.seed, s.inputs, { score: r.score, stars: r.stars });
}

// Debug hooks change the world behind the recording's back.
export const taint = (s) => { s.tainted = true; };
