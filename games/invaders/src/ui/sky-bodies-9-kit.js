// What the two skies of world 17 (Ash to Air) share: where the sun stands and a small baker of soft textures. The sun is
// upper right of centre, clear of the Craving at rest (centre (960, 320), 740 wide, so its right edge is x 1330): the dull
// coin of the smog sky and the bright sun of the clean one sit on the same spot, so the crossfade (heal-view.js) reads as
// the smog thinning away from one sun, and the sunbeams (flourish-smog-sky.js) fan from it too.
import { W, H, makeCanvas, noise2 } from './sprites.js';
import { smooth } from '../core/math.js';

export const SUN = { x: 1600, y: 300 };

// A texture baked at a fraction of its size and stretched by the caller (smoke is soft, so a 3 x stretch is free): a
// (w / step) x (h / step) canvas (the frame by default) whose pixel (i, j) is what fn(x, y, px) writes, (x, y) the position
// it stands for and px a scratch [r, g, b, a] (r, g, b 0..255, a 0..1). Where there is no real pixel buffer (a test's
// stand-in canvas) the canvas stays empty.
export function field(step, fn, w0 = W, h0 = H) {
  const [w, h] = [Math.ceil(w0 / step), Math.ceil(h0 / step)];
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  const d = img.data;
  if (!(d instanceof Uint8ClampedArray)) return c;
  const px = [0, 0, 0, 0];
  let i = 0;
  for (let j = 0; j < h; j++) {
    for (let k = 0; k < w; k++) {
      px[3] = 0;
      fn(k * step + step / 2, j * step + step / 2, px);
      d[i++] = px[0];
      d[i++] = px[1];
      d[i++] = px[2];
      d[i++] = Math.round(px[3] * 255);
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

// Smoke noise: a sum of three octaves of value noise stretched along x (cells k px wide, k / s tall), 0..1 about 0.5.
// warp (0..1 noise, wide) bends the strata so they wander. Allocates nothing.
export function strata(x, y, seed, stretch = 7, k = 1) {
  const warp = noise2(x, y * 3, 900 * k, seed + 3);
  const bank = noise2(x + warp * 420 * k, y * stretch, 560 * k, seed + 7);
  const mid = noise2(x + warp * 160 * k, y * (stretch + 2.5), 230 * k, seed + 11);
  const fine = noise2(x, y * (stretch + 5), 90 * k, seed + 13);
  return bank * 0.52 + mid * 0.3 + fine * 0.18;
}

// A smoothstep of v from the edge a (0) to the edge b (1), flat beyond both: core's smooth of how far v has come from a to b.
export const smoothstep = (a, b, v) => smooth((v - a) / (b - a));

// Lay colour (r, g, b) at alpha a over what px already holds (source-over, straight alpha), in place.
export function over(px, r, g, b, a) {
  const k = px[3] * (1 - a);
  const out = a + k;
  if (out <= 0) return;
  px[0] = (r * a + px[0] * k) / out;
  px[1] = (g * a + px[1] * k) / out;
  px[2] = (b * a + px[2] * k) / out;
  px[3] = out;
}
export { W, H };
