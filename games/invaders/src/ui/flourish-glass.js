// Flourishes (contract in flourish.js) for Glass Cathedral's light: slanting shafts of coloured light through the high windows
// of the broken vault (glassshafts, in the sky), and patches of window light sliding slowly across the flags of the floor
// (lightpatches, in front of the layers). Both are quiet by design: the bullets and the ship stay the loudest things on
// screen, so every draw is additive and at most about a tenth strong. The sprites are flourish-glass-sprites.js; the
// things that move on the layers (doves, the bell, the rose window's fan, the chandeliers) are flourish-glass-2.js, which
// registers with these. Pure functions of t.
import { W, hash, wrap } from './sprites.js';
import { TAU } from '../core/math.js';
import { SHAFT, shaftSprite, PATCH, patchSprite } from './flourish-glass-sprites.js';
import { FLOURISH_GLASS_2 } from './flourish-glass-2.js';

export const SHAFTS = { n: 5, alpha: [0.03, 0.095], slant: 0.3, top: -40 }; // how many; the least and most alpha a shaft draws at; its lean (rad); where its head is
export const PATCHES = { n: 6, alpha: [0.04, 0.12], speed: [5, 11], rows: [1030, 1066] }; // how many; alpha; px a second sideways; the y of the row (below the ship's zone)

// Shaft i at time t: where its head is (x), how far it leans (rot, rad), how strong it is now (0..1) and how wide (scale).
// The dust in the light (ambient-8.js dustmotes) follows the same shafts.
export function shaftAt(i, t, o = {}) {
  const k = i * 7 + 900;
  o.strength = (0.5 + 0.5 * Math.sin(t * (0.07 + 0.07 * hash(k)) + hash(k + 1) * TAU)) ** 1.4;
  o.scale = 0.85 + 0.7 * hash(k + 2);
  o.x = 250 + ((i + 0.5) / SHAFTS.n) * (W - 110) + (hash(k + 3) - 0.5) * 120 + Math.sin(t * 0.05 + hash(k + 4) * TAU) * 50;
  o.rot = SHAFTS.slant + Math.sin(t * 0.08 + hash(k + 5) * TAU) * 0.035;
  return o;
}
const SHAFT_AT = {}; // scratch: glassshafts' shaft

// Five shafts, each leaning down and to the left from its window beyond the top of the frame, swaying a little in
// position and angle, swelling and fading on a beat of its own; four colours; additive.
function glassshafts(ctx, { t, quality }) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const p = SHAFT_AT;
  for (let i = 0; i < SHAFTS.n; i += quality < 1 ? 2 : 1) {
    shaftAt(i, t, p);
    ctx.save();
    ctx.translate(p.x, SHAFTS.top);
    ctx.rotate(p.rot);
    ctx.globalAlpha = SHAFTS.alpha[0] + (SHAFTS.alpha[1] - SHAFTS.alpha[0]) * p.strength;
    ctx.drawImage(shaftSprite(i), (-SHAFT.w * p.scale) / 2, 0, SHAFT.w * p.scale, SHAFT.h);
    ctx.restore();
  }
  ctx.restore();
}

// Six patches of window light on the floor, each a lancet foreshortened and sheared, sliding slowly across at its
// own pace, swelling and fading, in rose, gilt, cobalt and violet; additive, at the foot of the frame.
function lightpatches(ctx, { t, quality }) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < PATCHES.n; i += quality < 1 ? 2 : 1) {
    const k = i * 5 + 950;
    const sc = 0.8 + 0.8 * hash(k);
    const w = PATCH.w * sc;
    const x = wrap(hash(k + 1) * (W + 400) + t * (PATCHES.speed[0] + (PATCHES.speed[1] - PATCHES.speed[0]) * hash(k + 2)), -w, W + w) - w / 2;
    const swell = 0.5 + 0.5 * Math.sin(t * (0.12 + 0.1 * hash(k + 3)) + hash(k + 4) * TAU);
    ctx.globalAlpha = PATCHES.alpha[0] + (PATCHES.alpha[1] - PATCHES.alpha[0]) * swell;
    ctx.drawImage(patchSprite(i), x, PATCHES.rows[0] + (PATCHES.rows[1] - PATCHES.rows[0]) * hash(k + 5) - (PATCH.h * sc) / 2, w, PATCH.h * sc);
  }
  ctx.restore();
}

export const FLOURISH_GLASS = { glassshafts: { sky: glassshafts }, lightpatches: { near: lightpatches }, ...FLOURISH_GLASS_2 };
