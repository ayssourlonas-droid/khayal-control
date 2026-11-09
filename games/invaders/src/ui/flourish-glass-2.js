// More flourishes (contract in flourish.js) for Glass Cathedral, the ones that move on its layers: a flock of glass doves
// crossing the sky over the roofline now and then, beating their wings (glassdoves, far); the bell in the left tower's
// belfry, tolled every so often and swinging as it dies down (belfry, far); the great rose window's light turning slowly,
// two fans of coloured light, one turning each way (rosefan, far); and the two chandeliers hung from the ribs of the mid
// layer, swaying and flickering (chandeliers, mid). The belfry, the rose and the chandeliers are found through the signs
// the layers left (parallax-glass.js, parallax-glass-mid.js). All of it is dim, a function of t alone, and cached
// sprites (flourish-glass-sprites.js and -2.js).
import { W, hash, glow } from './sprites.js';
import { TAU, smooth } from '../core/math.js';
import { fanSprite, FAN } from './flourish-glass-sprites.js';
import { DOVE, WINGBEAT, doveFrame, BELL, bellSprite, CHANDELIER, chandelierSprite, FLAMES } from './flourish-glass-sprites-2.js';

const signs = (v, layer, key) => (v.cache[key + layer] ??= v.layers[layer]?.signs.filter((s) => s[key]) ?? []);

export const DOVES = { n: 4, period: 44, first: 7, speed: [62, 86], rows: [370, 500], gap: 54, alpha: 0.44, beat: 0.7 }; // birds; s between flocks; s before the first; px/s; the flock's y; px between birds; alpha; s a wingbeat takes
export const TOLL = { period: 19, ring: 8, swing: 0.5, omega: 2.4 }; // s between tollings; s a tolling lasts; the swing (rad) at its start; rad/s
export const FANS = { alpha: [0.1, 0.13], turn: 0.045 }; // the rose window's fans: alpha, rad/s of the first (the second turns the other way, slower)
export const BELL_SCALE = 0.62; // the bell is drawn this much of its sprite's size: the belfry's openings are narrow
export const SWAY = { amp: 0.045, speed: 0.85, flame: 0.32 }; // a chandelier's swing (rad), its rad/s, a flame's glow alpha

// The flock of crossing number n at time t, or null between crossings: { slot, dir, age, dur, y, speed }.
export function flockAt(t) {
  const slot = Math.floor((t - DOVES.first) / DOVES.period);
  if (slot < 0) return null;
  const age = t - DOVES.first - slot * DOVES.period;
  const k = slot * 13 + 1100;
  const speed = DOVES.speed[0] + (DOVES.speed[1] - DOVES.speed[0]) * hash(k + 1);
  const dur = (W + 200 + DOVES.n * DOVES.gap) / speed;
  if (age > dur) return null;
  return { slot, dir: hash(k) < 0.5 ? -1 : 1, age, dur, speed, y: DOVES.rows[0] + (DOVES.rows[1] - DOVES.rows[0]) * hash(k + 2) };
}

// Four glass doves in a loose line, each a moment behind the one before and a little higher or lower, wings beating on a slightly
// different beat; mirrored when they fly left. One drawImage a bird.
function glassdoves(ctx, { t, quality }) {
  const f = flockAt(t);
  if (!f) return;
  ctx.save();
  ctx.globalAlpha = DOVES.alpha;
  for (let j = 0; j < DOVES.n; j += quality < 1 ? 2 : 1) {
    const lead = f.dir > 0 ? -100 + f.age * f.speed : W + 100 - f.age * f.speed;
    const x = lead - f.dir * j * DOVES.gap;
    if (x < -60 || x > W + 60) continue;
    const y = f.y + Math.sin(f.age * 0.9 + j * 1.3) * 16 + j * 11 - 14;
    const frame = WINGBEAT[Math.floor((((f.age + j * 0.11) / DOVES.beat) % 1) * WINGBEAT.length)];
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(f.dir, 1);
    ctx.drawImage(doveFrame(frame), -DOVE.w / 2, -DOVE.h / 2);
    ctx.restore();
  }
  ctx.restore();
}

// How far the bell is swung at t (rad), how much of a tolling is left (1 .. 0) and how far into it we are (u, seconds): rung with a
// push, it dies down over TOLL.ring seconds. One scratch object, which the next call overwrites.
const SWING = { angle: 0, left: 0, u: 0 };
export function bellAt(t, ph = 0) {
  const u = (((t + ph * TOLL.period) % TOLL.period) + TOLL.period) % TOLL.period;
  SWING.u = u;
  SWING.left = u > TOLL.ring ? 0 : Math.exp(-u * 0.42) * smooth(u / 0.35);
  SWING.angle = u > TOLL.ring ? 0.012 * Math.sin(t * 0.7) : TOLL.swing * SWING.left * Math.sin(u * TOLL.omega);
  return SWING;
}

// The belfry's bell: hung from its yoke in the left opening of the tower, swinging as the tolling dies down; a gilt glint at its lip
// when it reaches the end of a swing and the clapper strikes.
function belfry(ctx, { v, t }, x0, top) {
  const s = signs(v, 0, 'bell')[0];
  if (!s) return;
  const { angle, left, u } = bellAt(t, s.x * 0.0003);
  ctx.save();
  ctx.translate(x0 + s.x, top + s.y);
  ctx.rotate(angle);
  ctx.scale(BELL_SCALE, BELL_SCALE);
  ctx.globalAlpha = 0.92;
  ctx.drawImage(bellSprite(), -BELL.w / 2, -BELL.yoke);
  ctx.restore();
  const strike = Math.abs(Math.sin(u * TOLL.omega)) ** 14 * left;
  if (strike > 0.05) {
    const reach = (BELL.lip - BELL.yoke) * BELL_SCALE;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.4 * strike;
    ctx.drawImage(glow('#ffd890'), x0 + s.x - 10 - Math.sin(angle) * reach, top + s.y + Math.cos(angle) * reach - 10, 20, 20);
    ctx.restore();
  }
}

// The rose window's light: two fans of coloured light centred on the window, the larger turning slowly one way, a smaller one
// the other, additive, breathing a little.
function rosefan(ctx, { v, t, quality }, x0, top) {
  const s = signs(v, 0, 'rose')[0];
  if (!s) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(x0 + s.x, top + s.y);
  for (const [k, turn, a] of [[1, FANS.turn, FANS.alpha[1]], [0.68, -FANS.turn * 0.7, FANS.alpha[0]]]) {
    if (k < 1 && quality < 1) break;
    ctx.save();
    ctx.rotate(t * turn);
    ctx.scale(k, k);
    ctx.globalAlpha = a * (0.8 + 0.2 * Math.sin(t * 0.35 + k * 4));
    ctx.drawImage(fanSprite(), -FAN.size / 2, -FAN.size / 2);
    ctx.restore();
  }
  ctx.restore();
}

// Chandeliers hung from the crowns of the mid layer's ribs: each on its chain, swinging about the hook a few degrees and
// flickering its six small flames.
function chandeliers(ctx, { v, t, quality }, x0, top) {
  const list = signs(v, 1, 'chandelier');
  if (!list.length) return;
  ctx.save();
  ctx.strokeStyle = '#08040f';
  ctx.lineWidth = 1.5;
  for (const s of list) {
    const x = x0 + s.x;
    if (x < -120 || x > W + 120) continue;
    ctx.save();
    ctx.translate(x, top + s.y);
    ctx.rotate(SWAY.amp * Math.sin(t * SWAY.speed + s.ph * TAU) + 0.02 * Math.sin(t * 1.9 + s.ph * 5));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, s.len);
    ctx.stroke();
    ctx.drawImage(chandelierSprite(), -CHANDELIER.w / 2, s.len - 4);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < FLAMES.length; i += quality < 1 ? 2 : 1) {
      ctx.globalAlpha = SWAY.flame * (0.62 + 0.38 * Math.sin(t * 11 + i * 2.3 + s.ph * 9) * Math.sin(t * 3.1 + i));
      ctx.drawImage(glow('#ffb070'), FLAMES[i][0] - CHANDELIER.w / 2 - 9, s.len - 4 + FLAMES[i][1] - 9, 18, 18);
    }
    ctx.restore();
  }
  ctx.restore();
}

// Paint the sprites (and the glows) these draw, so none is baked mid-fight.
export function warmMoving() {
  for (let f = 0; f < DOVE.frames; f++) doveFrame(f);
  bellSprite();
  chandelierSprite();
  glow('#ffd890');
  glow('#ffb070');
}

export const FLOURISH_GLASS_2 = { glassdoves: { far: glassdoves }, belfry: { far: belfry }, rosefan: { far: rosefan }, chandeliers: { mid: chandeliers } };
