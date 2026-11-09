// What the storm's sky body (sky-bodies-10.js) and the parts that stand on it share (parallax-storm*.js, flourish-storm*.js): where the
// low sun burns, where its slit of clear sky lies under the cloud deck, the storm's colours, and the cloud noise. The sun is low and
// right of centre, in a slit between the deck above and the sea of cloud below; the far towers (parallax-storm-anvil.js) and the mid
// pillars leave a gap at its x so it shows through.
import { noise2 } from './sprites.js';
import { smooth } from '../core/math.js';

export const SUN = { x: 1390, y: 780 };
export const SLIT = { y0: 700, y1: 770, y2: 856, y3: 930 }; // the slit of clear sky: opens between y0 and y1, closes between y2 and y3
export const CLOUD = {
  shadow: [6, 9, 22], mid: [20, 30, 62], lit: [54, 68, 122], glow: [140, 156, 255], warm: [244, 136, 60], teal: [14, 62, 80],
};
export const smoothstep = (a, b, v) => smooth((v - a) / (b - a));

// Cloud density, 0..1: three octaves of billow noise (|2n - 1| of value noise: rounded lumps with sharp creases between them) a few hundred
// px across, finer ones on them, the domain bent by a slow warp so the lumps are not on a grid.
const billow = (x, y, cell, seed) => Math.abs(noise2(x, y, cell, seed) * 2 - 1);
export function density(x, y, seed = 3) {
  const warp = noise2(x * 0.9, y * 1.3, 520, seed + 40);
  const X = x + warp * 320;
  const Y = (y + warp * 90) * 1.3;
  return 0.3 + billow(X, Y, 340, seed) * 0.4 + billow(X, Y, 160, seed + 1) * 0.22 + billow(X, Y, 84, seed + 2) * 0.08;
}

// How open the sky is at (x, y): 1 in the slit's core near the sun, 0 above it and in the sea below. The slit's top edge is the deck's
// ragged underside (pouches hanging from it), its bottom the sea's, so `y` is bent by noise before the ramp.
export function slit(x, y) {
  const near = Math.exp(-(((x - SUN.x) / 760) ** 2));
  const top = y + 70 * (noise2(x, 0, 240, 7) - 0.5) + 36 * (noise2(x, y, 70, 8) - 0.5);
  const bottom = y + 30 * (noise2(x, 0, 150, 9) - 0.5);
  return smoothstep(SLIT.y0, SLIT.y1, top) * (1 - smoothstep(SLIT.y2, SLIT.y3, bottom)) * (0.3 + 0.7 * near);
}
