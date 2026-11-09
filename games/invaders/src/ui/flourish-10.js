// More flourishes (contract in flourish.js): Ember Carnival's sky. Four launchers each send up a rocket every
// few seconds on a rising trail of sparks (rockets), which bursts into a chrysanthemum, a willow or a ring in
// one of five colours, flashing white, spreading, its sparks falling and fading and the lake reflecting it
// (fireworks); two searchlights sweep the smoke (sweep). All of it is a function of t: which shot, where and in
// what colour is a hash of the launcher's slot, so a launcher's n-th shot is always the same. The sprites are
// flourish-carnival-sprites.js. What moves on the layers (the coaster, the wheel, the strings and the
// balloons) is in flourish-11.js.
import { hash, glow, soft, lighter, normal } from './sprites.js';
import { TAU } from '../core/math.js';
import { HUES, KINDS, BLOOM, bloom, beamSprite, BEAM, BEAM_COLORS } from './flourish-carnival-sprites.js';
import { SHORE } from './parallax-carnival-kit.js';

const LANES = [[5.7, 0.4], [6.9, 2.1], [8.3, 4], [11.1, 7]]; // [seconds between shots, offset]
export const RISE = 1.1; // s a rocket climbs
export const LIFE = 3.6; // s a burst lasts
export const LANE_COUNT = LANES.length;
const LAUNCH_Y = 700; // where a rocket leaves the shore, behind the hills

// Launcher `lane` at time t: null between shots, else { age, rise, x, y, kind, hue, size, x0 }. age is seconds since
// the burst (negative while the rocket climbs; rise 0 to 1 is the climb), (x, y) the burst, x0 where it lifted off.
export function show(lane, t) {
  const [period, off] = LANES[lane];
  const T = t + off;
  const slot = Math.floor(T / period);
  const lt = T - slot * period;
  if (lt > RISE + LIFE) return null;
  const h = (n) => hash(slot * 31 + lane * 7 + n);
  return {
    slot, age: lt - RISE, rise: Math.min(1, lt / RISE), x: 170 + lane * 405 + h(1) * 405, y: 110 + h(2) * 230,
    kind: KINDS[Math.floor(h(3) * KINDS.length)], hue: HUES[Math.floor(h(4) * HUES.length)], size: 0.6 + h(5) * 0.35, x0: 170 + lane * 405 + h(6) * 405,
  };
}

// How bright a burst is u s after it went off: in at once, full for a while, then fading out.
const fade = (u) => Math.min(1, u / 0.1) * (u < 1.2 ? 1 : Math.max(0, 1 - (u - 1.2) / (LIFE - 1.2)));

// The bursts: a white flash, the halo it throws on the smoke, the sprite spreading out fast and then slowly, and
// sparks that leave it and fall.
function fireworks(ctx, { t, quality }) {
  lighter(ctx);
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const s = show(lane, t);
    if (!s || s.age < 0) continue;
    const [u, f] = [s.age, fade(s.age)];
    const sc = s.size * (0.18 + 0.82 * (1 - (1 - Math.min(1, u / 0.55)) ** 3)) * (1 + 0.05 * u);
    const [cx, cy] = [s.x, s.y + (s.kind === 'willow' ? u * u * 6 : u * 9)];
    ctx.globalAlpha = 0.24 * f;
    ctx.drawImage(glow(s.hue), cx - 380 * sc, cy - 380 * sc, 760 * sc, 760 * sc);
    ctx.globalAlpha = f * 0.7;
    ctx.drawImage(bloom(s.kind, s.hue), cx - BLOOM.cx * sc, cy - BLOOM.cy * sc, BLOOM.w * sc, BLOOM.h * sc);
    if (u < 0.16) {
      ctx.globalAlpha = 1 - u / 0.16;
      ctx.drawImage(glow('#ffffff'), cx - 190 * s.size, cy - 190 * s.size, 380 * s.size, 380 * s.size);
    }
    for (let k = 0, n = quality < 1 ? 9 : 20; k < n; k++) { // sparks that fly out and fall
      const [a, life] = [hash(s.slot * 13 + lane * 5 + k * 3) * TAU, 1.5 + hash(s.slot * 13 + k * 3 + 1) * 1.7];
      if (u > life) continue;
      const r = ((70 + 150 * hash(s.slot * 13 + k * 3 + 2)) * s.size * (1 - Math.exp(-2.4 * u))) / 2.4;
      ctx.globalAlpha = (1 - u / life) * (0.45 + 0.4 * Math.sin(u * 28 + k * 2.1));
      ctx.drawImage(glow(k % 3 ? s.hue : '#fff4d8'), cx + Math.cos(a) * r - 4.5, cy + Math.sin(a) * r + 95 * u * u - 4.5, 9, 9);
    }
  }
  normal(ctx);
}

// Rockets on the climb: a bright head slowing as it rises, a tail of sparks behind it thinning and falling.
function rockets(ctx, { t }) {
  lighter(ctx);
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const s = show(lane, t);
    if (!s || s.age >= 0) continue;
    const at = (e) => {
      const p = 1 - (1 - Math.max(0, e)) ** 2;
      return [s.x0 + (s.x - s.x0) * p + Math.sin(e * 9 + lane) * 4, LAUNCH_Y + (s.y - LAUNCH_Y) * p];
    };
    for (let j = 15; j >= 1; j--) {
      const [x, y] = at(s.rise - j * 0.028);
      ctx.globalAlpha = (1 - j / 16) ** 1.5 * 0.8;
      const r = 9 - j * 0.4;
      ctx.drawImage(glow(j % 4 ? '#ffd890' : '#ff9a4a'), x + (hash(s.slot + j) - 0.5) * j - r, y + j * 1.4 - r, r * 2, r * 2);
    }
    const [hx, hy] = at(s.rise);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(glow(s.hue), hx - 17, hy - 17, 34, 34);
    ctx.globalAlpha = 1;
    ctx.drawImage(glow('#ffffff'), hx - 9, hy - 9, 18, 18);
  }
  normal(ctx);
}

const LIGHTS = [[300, BEAM_COLORS[0], 0.23, 0], [1650, BEAM_COLORS[1], 0.19, 2]]; // [shore x, colour, swing rate, phase]
// Two searchlights on the shore, one warm and one cool, swinging slowly across the smoke and each other.
function sweep(ctx, { t, quality }) {
  lighter(ctx);
  for (const [bx, color, speed, ph] of LIGHTS.slice(0, quality < 1 ? 1 : 2)) {
    ctx.save();
    ctx.translate(bx, LAUNCH_Y);
    ctx.rotate(Math.sin(t * speed + ph) * 0.75);
    ctx.globalAlpha = 0.17 + 0.04 * Math.sin(t * 1.7 + ph);
    ctx.drawImage(beamSprite(color), -BEAM.w * 0.9, -BEAM.h, BEAM.w * 1.8, BEAM.h);
    ctx.restore();
  }
  normal(ctx);
}

// The bursts in the lake, after the far layer: a soft pool of the burst's colour under it and a few dashes of
// it shimmering in the dark water.
function reflect(ctx, { t }, x0, top) {
  lighter(ctx);
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const s = show(lane, t);
    if (!s || s.age < 0) continue;
    const f = fade(s.age);
    ctx.globalAlpha = 0.34 * f;
    ctx.drawImage(soft(s.hue), s.x - 150 * s.size, top + SHORE + 8, 300 * s.size, 40);
    for (let k = 0; k < 9; k++) {
      const w = (50 - k * 3.4) * s.size;
      ctx.globalAlpha = f * 0.55 * (0.5 + 0.5 * Math.sin(t * 6 + k * 1.7 + s.slot));
      ctx.drawImage(soft(k % 2 ? s.hue : '#fff4d8'), s.x + (hash(s.slot * 9 + k) - 0.5) * 120 * s.size - w / 2, top + SHORE + 14 + k * 15, w, 3.2);
    }
  }
  normal(ctx);
}

export const FLOURISH10 = { fireworks: { sky: fireworks, far: reflect }, rockets: { sky: rockets }, sweep: { sky: sweep } };
