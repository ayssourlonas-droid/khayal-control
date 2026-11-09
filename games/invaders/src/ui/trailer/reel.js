// The trailer's projector, DOM-free. Replays re-simulate from the start: one fast-forward pass over
// the run, in slices so the screen keeps moving, keeps a structuredClone of the world on a grid of
// ticks; once the pass has every event, `pick` names the clip starts and each is reached from the
// grid point before it (at most one grid step). A clip is that snapshot stepped on through the
// run's own inputs, whole TICKs as the game loop does, so the game state is exactly the run's;
// its effects have an rng of their own, so they may differ from the original run.
//   fastForward(level, seed, inputs, pick, { budget, now }) -> generator
//     yields progress 0..1 after each slice (about `budget` ms of work); returns
//     { events, snaps: Map(tick -> world), ticks }      pick(events, ticks) -> [tick, ...]
//   drain(generator) -> its return value, run to the end at once
//   startClip(world, inputs, { start, end, peak }, { seed, speed, peakSlow }) -> clip
//   stepClip(clip, realDt, onEvents?)   onEvents(events, world) per tick (sound)
//   clipDone(clip)   past its end, and past HOLD seconds of aftermath when the run ended in it
import { createWorld, stepWorld } from '../../core/world.js';
import { TICK } from '../../core/kinds.js';
import { finished } from '../../core/util.js';
import { advance } from '../../core/loop.js';
import { makeRng } from '../../core/rng.js';
import { createFx, stepFx, startSlowMo } from '../../fx/fx.js';
import { applyEvents } from '../../fx/react.js';

export const HOLD = 0.9; // real s on the last blast of a clip that ends the run
const PEAK_SLOW = 0.75; // real s of slow motion from a clip peak
const CHECK = 32; // ticks between looks at the clock
const GRID = 120; // ticks between kept worlds (more for very long runs: at most about 60 kept)
const FX_SALT = 0x7a11e5;

const clock = () => performance.now();

export function* fastForward(level, seed, inputs, pick, { budget = 6, now = clock } = {}) {
  const every = Math.max(GRID, Math.ceil(inputs.length / 60));
  const grid = new Map();
  const events = [];
  const world = createWorld(level, seed);
  let t0 = now();
  for (let i = 0; ; i++) {
    if (world.tick % every === 0 && !grid.has(world.tick)) grid.set(world.tick, structuredClone(world));
    if (i >= inputs.length) break;
    stepWorld(world, TICK, inputs[i]);
    for (const e of world.events.splice(0)) events.push(e);
    if (i % CHECK === CHECK - 1 && now() - t0 >= budget) {
      yield (0.9 * (i + 1)) / inputs.length;
      t0 = now();
    }
  }
  const want = [...new Set(pick(events, inputs.length))].filter((t) => t >= 0 && t <= world.tick).toSorted((a, b) => a - b);
  const snaps = new Map();
  for (const [k, tick] of want.entries()) {
    const base = grid.get(Math.floor(tick / every) * every);
    if (!base) continue;
    const w = structuredClone(base);
    while (w.tick < tick && !finished(w)) {
      stepWorld(w, TICK, inputs[w.tick]);
      w.events.length = 0;
    }
    snaps.set(tick, w);
    if (now() - t0 >= budget) {
      yield 0.9 + (0.1 * (k + 1)) / want.length;
      t0 = now();
    }
  }
  return { events, snaps, ticks: inputs.length };
}

export function drain(gen) {
  let step = gen.next();
  while (!step.done) step = gen.next();
  return step.value;
}

export function startClip(world, inputs, clip, { seed = 0, speed = 1, peakSlow = PEAK_SLOW } = {}) {
  return {
    world, inputs, start: clip.start, end: clip.end, peak: clip.peak, kind: clip.kind,
    fx: createFx(), rng: makeRng(((seed ^ FX_SALT) + clip.start) >>> 0),
    acc: 0, speed, peakSlow, peaked: false, t: 0, after: 0,
  };
}

const over = (c) => c.world.tick >= c.end || finished(c.world);

export function stepClip(c, dt, onEvents) {
  const d = dt * c.speed;
  const { ticks, acc } = advance(c.acc, d * c.fx.slow);
  c.acc = acc;
  const w = c.world;
  for (let i = 0; i < ticks && !over(c) && w.tick < c.inputs.length; i++) {
    stepWorld(w, TICK, c.inputs[w.tick]);
    const events = w.events.splice(0);
    applyEvents(c.fx, events, c.rng, w);
    onEvents?.(events, w);
    if (!c.peaked && w.tick >= c.peak) {
      c.peaked = true;
      if (c.peakSlow > 0) startSlowMo(c.fx, c.peakSlow);
    }
  }
  stepFx(c.fx, d);
  c.t += dt;
  if (over(c)) c.after += dt;
}

export const clipDone = (c) => over(c) && c.after >= (finished(c.world) ? HOLD : 0);
