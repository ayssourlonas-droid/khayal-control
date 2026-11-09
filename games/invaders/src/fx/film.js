// The trailer's film look: letterbox bars, grain, vignette and colour grade, each a strength the
// renderer draws. One progress value `k` (0 off .. 1 fully on) moves at a fixed rate toward the
// target and every strength is a smoothstep of it, so the look eases in and out and can turn
// round half-way. Nothing here draws; the world is only read for its level.
//   letterbox 0..1   fraction of the full bar height
//   vignette, grade, grain   0..1 strengths at the film's full look
//   tint     the world's grade colour      seed  grain seed (level seed)
//   frame    grain frame counter, 24 per second while the look is on or fading
import { approach, smooth } from '../core/math.js';

const DURATION = 0.8; // seconds from off to fully on
const FPS = 24;
const LOOK = { vignette: 0.7, grade: 0.55, grain: 0.35 };

// One grade colour per world, in world order.
const TINTS = ['#3affc8', '#ff4fd8', '#ffb347', '#d94a4a', '#9ad67a', '#33ff66', '#ff6a3a', '#8fb8ff', '#22b0a6', '#a35cff', '#b8f4ff', '#ffe08a', '#f7aaa0', '#d466ee', '#0b6e7c', '#a8509c', '#a8924a', '#7a8cff'];

export function createFilm(world) {
  const level = world?.level ?? {};
  return {
    k: 0, t: 0, frame: 0, letterbox: 0, vignette: 0, grade: 0, grain: 0,
    tint: TINTS[((level.world ?? 1) - 1) % TINTS.length],
    seed: (level.seed ?? 0) >>> 0,
  };
}

export function stepFilm(film, dt, on) {
  film.k = approach(film.k, on ? 1 : 0, dt / DURATION);
  const e = smooth(film.k);
  film.letterbox = e;
  film.vignette = LOOK.vignette * e;
  film.grade = LOOK.grade * e;
  film.grain = LOOK.grain * e;
  if (film.k > 0) {
    film.t += dt;
    film.frame = Math.floor(film.t * FPS);
  }
}
