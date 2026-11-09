// The breath of world 17 (core/twists-3.js), drawn: help sent. Every 24 s a front of fresh air rises from the foot of the field to
// the HUD's edge in 0.8 s and wipes the enemy's bullets it passes; breathFront(world) is its height now (null when none is
// rising), so the air is seen exactly where it clears. Two calls from view.js, both returning at once without a healing city
// (v.heal null: every other world) or without a front:
//   drawBreath(ctx, v, world, t)      after the shots, under the ship: the band of blue-white air with the brilliant edge that
//                                     wipes (a billowing crest, wind streaks, leaves tumbling and sparkles twinkling in it,
//                                     seen through at about half strength so the aliens and bullets stay readable) and, ahead
//                                     of its edge, nine little craft in a bowed line, the middle ones a touch ahead, each
//                                     bobbing on its own, the engines flickering. It fades in over the first 120 px of the
//                                     rise and out over the last 150.
//   drawBreathWake(ctx, v, world, t)  in the backdrop pass: "the smog it crosses parts for a moment": a pale veil of clean air
//                                     below the front (bright just under it, gone 600 px down), which fades away over
//                                     WAKE_FADE s once the front is spent, so the smog closes again. Its memory is v.cache.
// Everything is a cached sprite blitted (about 50 drawImage calls a frame at full quality); every leaf and twinkle is a pure
// function of how far up the front is, so nothing is stored per frame and nothing allocated; half quality drops the wind streaks
// and every other leaf and twinkle. The sprites are breath-sprites.js's.
import { breathFront } from '../core/twists-3.js';
import { WIDTH, HEIGHT, HUD_BOTTOM } from '../core/kinds.js';
import { smooth, TAU } from '../core/math.js';
import { hash } from './sprites.js';
import { breathKit } from './breath-sprites.js';
import { AIR_W, AIR_Y0, LIGHT_Y0 } from './breath-air.js';
import { FLOW_W, WAKE_H } from './breath-flow.js';
import { CRAFT_W, CRAFT_H, ORIGIN } from './breath-craft.js';
import { LEAF_SHAPES, LEAF_TONES } from './breath-leaf.js';

export const WAKE_FADE = 0.8; // s the veil takes to go once the front is spent
const IN = 120; // px of rise to fade in over
const OUT = 150; // and to fade out over
const SPAN = HEIGHT - HUD_BOTTOM;
const CRAFTS = 9;
const FIRST_X = 110; // the first craft's x, then every DX
const DX = 212;
const LEAF_VARIANTS = LEAF_SHAPES * LEAF_TONES.length; // the leaf sprites: every shape in every tone

// How much of the front shows when its edge is at y: 0 at the foot, 1 in the middle, 0 again at the HUD's edge.
export const envelope = (y) => smooth((HEIGHT - y) / IN) * smooth((y - HUD_BOTTOM) / OUT);

const row = (n, make) => Array.from({ length: n }, (_, i) => make(i, (j) => hash(i * 41 + j * 7 + 901)));
const LEAVES = row(16, (i, r) => ({
  x0: ((i + r(1) * 0.8) / 16) * WIDTH, off: -26 + r(2) * 150, slide: 10 + r(3) * 190, drift: (r(4) - 0.35) * 260, spin: (r(5) - 0.5) * 14,
  rot0: r(6) * TAU, flip: 4 + r(7) * 6, ph: r(8) * TAU, size: 20 + r(9) * 16, spr: Math.floor(r(10) * LEAF_VARIANTS),
}));
const TWINKLES = row(12, (i, r) => ({
  x0: ((i + r(1) * 0.8) / 12) * WIDTH, off: -16 + r(2) * 170, slide: 20 + r(3) * 90, drift: (r(4) - 0.5) * 120, ph: r(5) * TAU, size: 24 + r(6) * 18, mint: r(7) > 0.5 ? 1 : 0,
}));

function leaves(ctx, k, front, p, a, step) {
  ctx.globalAlpha = a;
  for (let i = 0; i < LEAVES.length; i += step) {
    const L = LEAVES[i];
    ctx.save();
    ctx.translate(L.x0 + L.drift * p + Math.sin(p * 7 + L.ph) * 16, front + L.off + L.slide * p);
    ctx.rotate(L.rot0 + L.spin * p);
    ctx.scale(0.25 + 0.75 * Math.abs(Math.cos(L.ph + p * L.flip)), 1);
    ctx.drawImage(k.leaves[L.spr], -L.size / 2, -L.size / 2, L.size, L.size);
    ctx.restore();
  }
}

function twinkles(ctx, k, front, p, a, t, step) {
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < TWINKLES.length; i += step) {
    const T = TWINKLES[i];
    const w = Math.sin(t * 15 + T.ph);
    if (w < -0.4) continue;
    const s = T.size * (0.75 + 0.25 * w);
    ctx.globalAlpha = a * Math.min(1, 0.55 + 0.5 * w);
    ctx.drawImage(k.twinkles[T.mint], T.x0 + T.drift * p - s / 2, front + T.off + T.slide * p - s / 2, s, s);
  }
  ctx.globalCompositeOperation = 'source-over';
}

function craft(ctx, k, front, t, a) {
  ctx.globalAlpha = a;
  for (let pass = 0; pass < 2; pass++) { // the bodies, then their lights
    if (pass) ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < CRAFTS; i++) {
      const d = (i - 4) / 4;
      const bow = 1 - d * d;
      const sc = 0.94 + 0.12 * bow;
      const x = FIRST_X + i * DX + Math.sin(t * 3.1 + i * 1.7) * 4;
      const y = front - 28 - 22 * bow + Math.sin(t * 9 + i * 1.3) * 4;
      const f = (Math.floor(t * 14) + i) & 1;
      ctx.drawImage((pass ? k.lights : k.body)[f], x - ORIGIN[0] * sc, y - ORIGIN[1] * sc, CRAFT_W * sc, CRAFT_H * sc);
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}

export function drawBreath(ctx, v, world, t) {
  if (!v.heal) return;
  const front = breathFront(world);
  if (front === null) return;
  const a = envelope(front);
  if (a <= 0.01) return;
  const k = breathKit();
  const p = (HEIGHT - front) / SPAN; // how far up it has come, 0..1
  const half = (v.quality?.level ?? 1) < 1;
  const step = half ? 2 : 1;
  const air = a * (1 - 0.3 * smooth(v.heal.h)); // against a bright sky the air is thinner, or the aliens in it wash out
  ctx.save();
  ctx.globalAlpha = air;
  const off = (t * 150) % AIR_W; // the air and its edge slide together: the billows and the line agree
  for (let x = off - AIR_W; x < WIDTH; x += AIR_W) ctx.drawImage(k.air, x, front - AIR_Y0);
  if (!half) {
    const fo = (t * 520) % FLOW_W;
    for (let x = fo - FLOW_W; x < WIDTH; x += FLOW_W) ctx.drawImage(k.flow, x, front + 4);
  }
  leaves(ctx, k, front, p, a, step);
  ctx.globalAlpha = air * 0.95;
  ctx.globalCompositeOperation = 'lighter';
  for (let x = off - AIR_W; x < WIDTH; x += AIR_W) ctx.drawImage(k.light, x, front - LIGHT_Y0);
  ctx.globalCompositeOperation = 'source-over';
  twinkles(ctx, k, front, p, a, t, step);
  craft(ctx, k, front, t, a);
  ctx.restore();
}

export function drawBreathWake(ctx, v, world, t) {
  if (!v.heal) return;
  const m = v.cache.breathWake ?? (v.cache.breathWake = { y: HEIGHT, a: 0, t });
  const dt = Math.min(0.1, Math.max(0, t - m.t));
  m.t = t;
  const front = breathFront(world);
  if (front !== null) {
    m.y = front;
    m.a = smooth((HEIGHT - front) / IN);
  } else if (m.a > 0) m.a = Math.max(0, m.a - dt / WAKE_FADE);
  if (m.a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha = m.a;
  ctx.drawImage(breathKit().wake, 0, m.y, WIDTH, WAKE_H);
  ctx.restore();
}
