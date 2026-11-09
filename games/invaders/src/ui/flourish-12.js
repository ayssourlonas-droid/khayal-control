// More flourishes (contract in flourish.js): Lantern Deep's sky. Pale shafts of light slant down from a surface
// nobody can see, swaying slowly and swelling and fading out of step with one another, gone long before the
// player's zone (shafts); and now and then a whale glides across the water far off, a long dark shape with a few
// dim lights down its flank and flukes that beat, there so faintly it reads as very distant (leviathan). The
// whale's crossing is a function of t alone: which crossing it is, which row, which way and how fast are a hash
// of the crossing's number, so a crossing is always the same. The sprites are flourish-deep-sprites.js; the
// school, the jellyfish and the caustics are flourish-13.js.
import { W, hash } from './sprites.js';
import { TAU } from '../core/math.js';
import { SHAFT, shaftSprite, WHALE, whaleFrame } from './flourish-deep-sprites.js';

export const SHAFTS = { n: 6, alpha: [0.025, 0.1], slant: 0.2, top: -30 }; // how many; the least and most alpha a shaft draws at; its lean (rad) and where its head is
export const WHALE_RUN = { period: 80, first: 12, speed: [44, 58], scale: [0.85, 1.15], rows: [130, 440], alpha: 0.36, beat: 4.2 }; // s between crossings, s before the first, px/s, size, y of the row, alpha, s a tail beat takes

// Six shafts, alternately broad and narrow, each starting off to the left of the frame and leaning down to the
// right. Each sways a little in position and angle and swells and fades on a beat of its own; additive.
function shafts(ctx, { t, quality }) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < SHAFTS.n; i += quality < 1 ? 2 : 1) {
    const h = (n) => hash(i * 7 + 400 + n);
    const strength = (0.5 + 0.5 * Math.sin(t * (0.06 + 0.07 * h(0)) + h(1) * TAU)) ** 1.5;
    const sc = (0.8 + 0.7 * h(2)) * (i % 2 ? 0.8 : 1);
    ctx.save();
    ctx.translate(((i + 0.5) / SHAFTS.n) * (W + 500) - 380 + (h(3) - 0.5) * 140 + Math.sin(t * 0.05 + h(4) * TAU) * 60, SHAFTS.top);
    ctx.rotate(-SHAFTS.slant + Math.sin(t * 0.08 + h(5) * TAU) * 0.04);
    ctx.globalAlpha = SHAFTS.alpha[0] + (SHAFTS.alpha[1] - SHAFTS.alpha[0]) * strength;
    ctx.drawImage(shaftSprite(i % 2), (-SHAFT.w * sc) / 2, 0, SHAFT.w * sc, SHAFT.h);
    ctx.restore();
  }
  ctx.restore();
}

// Crossing number n's whale at time t, or null between crossings: { slot, dir, x, y, scale, speed, alpha, age }.
// x is where its middle is: it starts with its whole sprite beyond one edge and ends beyond the other.
export function whaleAt(t) {
  const slot = Math.floor((t - WHALE_RUN.first) / WHALE_RUN.period);
  if (slot < 0) return null;
  const age = t - WHALE_RUN.first - slot * WHALE_RUN.period;
  const h = (n) => hash(slot * 11 + 600 + n);
  const [dir, scale] = [h(0) < 0.5 ? -1 : 1, WHALE_RUN.scale[0] + (WHALE_RUN.scale[1] - WHALE_RUN.scale[0]) * h(1)];
  const speed = WHALE_RUN.speed[0] + (WHALE_RUN.speed[1] - WHALE_RUN.speed[0]) * h(2);
  const half = (WHALE.w * scale) / 2;
  const dur = (W + 2 * half) / speed;
  if (age > dur) return null;
  const row = WHALE_RUN.rows[0] + (WHALE_RUN.rows[1] - WHALE_RUN.rows[0]) * h(3);
  const x = dir > 0 ? -half + age * speed : W + half - age * speed;
  const y = row + (h(4) - 0.5) * 80 * (age / dur) + Math.sin(age * 0.17 + h(5) * TAU) * 22; // a gentle climb or dive, and a slow swell
  return { slot, dir, x, y, scale, speed, alpha: WHALE_RUN.alpha * (0.8 + 0.2 * h(6)), age, dur };
}

// The whale: two neighbouring frames of its body wave cross-faded, so the tail beats smoothly; mirrored when it
// swims to the left. It is dark on dark water, drawn normally at a low alpha.
function leviathan(ctx, { t }) {
  const w = whaleAt(t);
  if (!w) return;
  const phase = ((w.age / WHALE_RUN.beat) % 1) * WHALE.frames;
  const [f0, k] = [Math.floor(phase), phase - Math.floor(phase)];
  ctx.save();
  ctx.translate(w.x, w.y);
  ctx.scale(w.dir * w.scale, w.scale);
  ctx.globalAlpha = w.alpha * (1 - k);
  ctx.drawImage(whaleFrame(f0 % WHALE.frames), -WHALE.w / 2, -WHALE.h / 2);
  ctx.globalAlpha = w.alpha * k;
  ctx.drawImage(whaleFrame((f0 + 1) % WHALE.frames), -WHALE.w / 2, -WHALE.h / 2);
  ctx.restore();
}

// Paint the sprites these draw, so none is baked mid-fight.
export function warmDeepSky() {
  [0, 1].forEach(shaftSprite);
  for (let k = 0; k < WHALE.frames; k++) whaleFrame(k);
}

export const FLOURISH12 = { shafts: { sky: shafts }, leviathan: { sky: leviathan } };
