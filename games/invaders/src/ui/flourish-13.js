// More flourishes (contract in flourish.js): Lantern Deep's water. A school of fish wheels across the middle
// distance, every fish on the same looping path a moment behind the one before, the school drawing in and
// flashing silver as it turns (school); jellyfish drift up through the dark at different depths and sizes,
// their bells pulsing, faint violet and teal (jellydrift); and a net of caustic light ripples over the upper
// two thirds of the frame, two layers sliding past each other at different speeds (caustics). All of it is
// dim and quiet: the pearls, the bullets and the maelstrom must stay the loudest things on screen. Every one
// is a function of t, so a crossing is always the same. The sprites are flourish-deep-sprites-2.js and -3.js;
// the shafts and the whale are flourish-12.js.
import { W, H, hash, glow, wrap } from './sprites.js';
import { TAU, clamp, smooth, wrapAngle } from '../core/math.js';
import { FISH, fishSprite, JELLY, JELLY_COLORS, PULSE_FRAMES, jellyFrame } from './flourish-deep-sprites-2.js';
import { CAUSTIC, causticTile } from './flourish-deep-sprites-3.js';
import { warmDeepSky } from './flourish-12.js';

export const SCHOOL = { n: 36, period: 30, first: 4, cross: 22, lag: 1.4, spread: 34, size: [0.75, 1.2], alpha: [0.34, 0.55] }; // fish; s between schools; s before the first; s a crossing takes; s the last fish trails the first by; px the school is wide; fish size; the dim and the flash alpha
export const JELLY_ALPHA = [0.16, 0.3]; // the farthest (smallest) and the nearest (largest) jellyfish
export const HALO_ALPHA = 0.09;
export const CAUSTICS = { alpha: [0.07, 0.055], speed: [14, -9] }; // per layer: alpha, and px a second sideways
const JELLIES = [[0.1, 1.25, 15, 0, 3.4], [0.3, 0.7, 22, 1, 2.6], [0.52, 1, 18, 0, 3], [0.74, 0.62, 25, 1, 2.4], [0.9, 1.15, 16, 1, 3.2]]; // [middle of the width, size, px rising a second, colour, s a pulse takes]
const PULSE = [1, 2, 2, 3, 3, 4, 4, 0, 0, 0]; // the frames of one pulse: closing fast, opening slowly, at rest

const [A, B, P] = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]; // scratch points: the path is walked a few dozen times a frame

// Where the head of crossing `slot`'s path is, s seconds in: straight across the frame at an even pace, with a
// wide sway on top that is bigger than the pace at its worst, so the path turns back and loops. The sway is
// nil at both ends, so the school comes from beyond one edge and leaves beyond the other.
function route(slot, s, o) {
  const h = (n) => hash(slot * 17 + 700 + n);
  const u = s / SCHOOL.cross;
  const x = -240 + (W + 480) * u + 150 * Math.sin(0.9 * s + h(0) * TAU) * Math.sin(Math.PI * u);
  o.x = h(3) < 0.5 ? x : W - x;
  o.y = 260 + 190 * h(2) + 110 * Math.sin(0.55 * s + h(1) * TAU) + 40 * Math.sin(1.3 * s + h(4) * TAU);
}

// The way the path points s seconds in, and how hard it is turning (0 to 1) there.
function heading(slot, s) {
  route(slot, s - 0.05, A);
  route(slot, s + 0.05, B);
  return Math.atan2(B.y - A.y, B.x - A.x);
}
const turning = (slot, s) => smooth(Math.abs(wrapAngle(heading(slot, s + 0.3) - heading(slot, s - 0.3))) / 1.3);

// Thirty-six fish: fish j is where the head was a little while ago (a lag of its own), off to one side by an
// amount of its own. The school draws in when the path turns and loosens on the straight; as it turns, a wave of
// silver flashes runs through it. No more than one drawImage a fish.
function school(ctx, { t, quality }) {
  const slot = Math.floor((t - SCHOOL.first) / SCHOOL.period);
  const s = t - SCHOOL.first - slot * SCHOOL.period;
  if (slot < 0 || s > SCHOOL.cross + SCHOOL.lag) return;
  const turn = turning(slot, Math.min(s, SCHOOL.cross));
  const spread = SCHOOL.spread * (1 - 0.55 * turn);
  ctx.save();
  for (let j = 0; j < SCHOOL.n; j += quality < 1 ? 2 : 1) {
    const sj = s - SCHOOL.lag * (1 - 0.3 * turn) * hash(j * 3 + 710) ** 0.8;
    if (sj < 0 || sj > SCHOOL.cross) continue;
    route(slot, sj, P);
    const a = heading(slot, sj);
    const off = (hash(j * 3 + 711) - 0.5) * 2 * spread + Math.sin(t * 3 + j * 1.7) * 1.5;
    const [x, y] = [P.x - Math.sin(a) * off, P.y + Math.cos(a) * off];
    const k = SCHOOL.size[0] + (SCHOOL.size[1] - SCHOOL.size[0]) * hash(j * 3 + 713);
    const reach = (k * (FISH.w * Math.abs(Math.cos(a)) + FISH.h * Math.abs(Math.sin(a)))) / 2 + 2; // how far the fish lies to either side of its middle
    if (x + reach < 0 || x - reach > W) continue; // wholly off the frame
    const flash = turn * Math.max(0, Math.sin(t * 5 - hash(j * 3 + 712) * 9 + j * 0.6));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.sin(t * 9 + j * 2.1) * 0.1);
    ctx.scale(k, Math.cos(a) < 0 ? -k : k); // a fish swimming left is not upside down
    ctx.globalAlpha = SCHOOL.alpha[0] + (SCHOOL.alpha[1] - SCHOOL.alpha[0]) * flash;
    ctx.drawImage(fishSprite(flash > 0.5), -FISH.w / 2, -FISH.h / 2);
    ctx.restore();
  }
  ctx.restore();
}

// Jellyfish rising at their own pace, swaying, bells pulsing on a beat of their own (the sprite's frame is
// chosen from the beat, and the whole rises a little with each squeeze). Big ones are nearer and brighter.
// They fade in as they come up past the foot of the frame, so the player's zone stays clear, and out over the top.
function jellydrift(ctx, { t }) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  JELLIES.forEach(([xs, size, rise, ci, period], i) => {
    const ph = hash(i + 740);
    const y = wrap(ph * (H + 420) - t * rise, -320, H + 100);
    const fade = clamp((880 - y) / 320, 0, 1) * clamp((y + 320) / 120, 0, 1);
    if (fade < 0.004) return;
    const p = (t / period + ph) % 1;
    const x = W * xs + Math.sin(t * 0.27 * (0.8 + ph) + ph * TAU) * 46 * size + y * 0.04;
    const yb = y - Math.sin(p * TAU) * 4 * size;
    const top = yb - JELLY.by * size;
    if (top > H || top + JELLY.h * size < 0) return; // wholly off the frame
    ctx.globalAlpha = (JELLY_ALPHA[0] + (JELLY_ALPHA[1] - JELLY_ALPHA[0]) * clamp((size - 0.6) / 0.65, 0, 1)) * fade;
    ctx.drawImage(jellyFrame(ci, PULSE[Math.floor(p * PULSE.length)]), x - JELLY.bx * size, yb - JELLY.by * size, JELLY.w * size, JELLY.h * size);
    if (yb + 82 * size < 0) return; // the bell is gone off the top: only tentacles are left, no halo
    ctx.globalAlpha = HALO_ALPHA * fade;
    ctx.drawImage(glow(JELLY_COLORS[ci]), x - 70 * size, yb - 58 * size, 140 * size, 140 * size);
  });
  ctx.restore();
}

// The caustics: two layers of the same kind of web (different webs), tiled across the frame, the first sliding
// right and the second left and breathing a little wider and narrower, so the lines cross and part and
// the net seems to ripple. Both are baked to fade out above the player's zone; additive.
function caustics(ctx, { t }) {
  const [tw, th] = [CAUSTIC.w * CAUSTIC.up, CAUSTIC.h * CAUSTIC.up];
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 2; k++) {
    const w = k ? tw * (1 + 0.025 * Math.sin(t * 0.4)) : tw;
    const y = -(2.5 + 2.5 * Math.sin(t * 0.3 + k * 2)); // only ever upward: the top edge stays covered
    ctx.globalAlpha = CAUSTICS.alpha[k] * (0.85 + 0.15 * Math.sin(t * 0.9 + k * 1.7));
    const tile = causticTile(k);
    for (let x = -wrap(t * CAUSTICS.speed[k] + k * 200, 0, w); x < W; x += w) ctx.drawImage(tile, x, y, w, th);
  }
  ctx.restore();
}

// Paint every sprite the deep's flourishes draw (flourish-12.js's too), so none is baked mid-fight.
export function warmDeepFlourish() {
  warmDeepSky();
  [false, true].forEach((silver) => fishSprite(silver));
  JELLY_COLORS.forEach((color, ci) => {
    glow(color);
    for (let f = 0; f < PULSE_FRAMES; f++) jellyFrame(ci, f);
  });
  [0, 1].forEach((k) => causticTile(k));
}

export const FLOURISH13 = { school: { mid: school }, jellydrift: { mid: jellydrift }, caustics: { near: caustics } };
