// Auto quality. The game's loop hands sampleFrame the measured WORK time of every frame (core steps
// + fx + draw, performance.now() around them) and the rAF interval it ran in. Once a second (of
// intervals) both averages are judged:
//   drop to 0.5 (half the particle spawns via fx.density, no glow on the far parallax layer, no film
//     grain) when the work averages above DROP_MS, or the interval above DROP_RATIO x the display's
//     base period, capped at DROP_CAP_MS (ruling R23: a GPU-bound Pi shows in the display's pace, not
//     in the CPU work; R49: the cap keeps a 40-odd fps renderer from passing while base sits at 20);
//   restore to 1 only when the work is below RESTORE_MS AND the interval below RESTORE_RATIO x base;
//   in between hold, so a frame cost sitting near one line never flickers.
// The interval alone is no measure of the work: a 60 Hz display pins it at 16.7 ms whatever the
// frame costs. The base period (M1) is the quickest 1 s average interval seen, so a 50 Hz display
// (20 ms) is judged against its own pace and can restore. It never goes below 60 Hz's period (the
// game ticks at 60: a 144 Hz display missing frames is no reason to drop), nor above 50 Hz's, the
// slowest display mode a kiosk runs: a renderer slow from its first second cannot pass for a slow
// display, and a 30 Hz display sits at half quality (accepted cost of R23). Pure: no clock of its own.
//   q = createQuality() -> { level, avg, interval, base, sum, isum, n, span }
//   level 1 | 0.5; avg and interval: the last window's mean work and mean interval (ms); base (ms)

export const DROP_MS = 20;
export const RESTORE_MS = 14;
export const DROP_RATIO = 1.3;
export const DROP_CAP_MS = 22;
export const RESTORE_RATIO = 1.1;
export const BASE_MIN_MS = 1000 / 60;
export const BASE_MAX_MS = 20;
const WINDOW_MS = 1000;
const STALL_MS = 250; // a longer frame is a hidden tab or a pause, not the renderer: skip it

export const createQuality = () => ({ level: 1, avg: 0, interval: 0, base: BASE_MAX_MS, sum: 0, isum: 0, n: 0, span: 0 });

// ms: this frame's work; interval: the time since the last frame (defaults to ms).
export function sampleFrame(q, ms, interval = ms) {
  if (!(ms >= 0) || ms > STALL_MS || !(interval >= 0) || interval > STALL_MS) return q.level;
  q.sum += ms;
  q.isum += interval;
  q.n += 1;
  q.span += Math.max(ms, interval);
  if (q.span < WINDOW_MS) return q.level;
  q.avg = q.sum / q.n;
  q.interval = q.isum / q.n;
  q.base = Math.max(BASE_MIN_MS, Math.min(q.base, q.interval));
  if (q.avg > DROP_MS || q.interval > Math.min(DROP_CAP_MS, DROP_RATIO * q.base)) q.level = 0.5;
  else if (q.avg < RESTORE_MS && q.interval < RESTORE_RATIO * q.base) q.level = 1;
  q.sum = 0;
  q.isum = 0;
  q.n = 0;
  q.span = 0;
  return q.level;
}
