// One white cumulus for the clean sky of world 17 (sky-bodies-9-clean.js places them), baked as a sprite from a lit height
// field: the cloud is a few domes of different size standing on a flat base, roughened with three octaves of noise, and each
// pixel is shaded by how much the surface falls toward the sun (a bright, warm-white sunward face, a blue-grey shadow on the
// far side and in the creases between the domes) and by its height above the base (a blue-grey underside). The sprite is `w` x `h`
// of cloud plus 24 px of margin on every side, so the soft rim is never cut off.
import { cached, noise2, hash } from './sprites.js';
import { clamp } from '../core/math.js';
import { field, over, smoothstep } from './sky-bodies-9-kit.js';

export const CLOUD_PAD = 24;
const SHADOW = [104, 130, 184]; // the cloud's far side and creases
const MID = [212, 225, 243];
const LIT = [255, 250, 238]; // its sunward face
const RIM = [255, 230, 168]; // a warm gold where the sun grazes its edge
const STEP = 1;

// The cloud's height field at (u, v): u -1..1 across it, v 0 at the base .. 1 at its tallest, plus noise from (x, y): > 0 inside.
function dome(domes, u, v, x, y, s) {
  let top = 0;
  for (let i = 0; i < domes.length; i++) {
    const [c, r, a] = domes[i];
    const k = (u - c) / r;
    if (k > -1 && k < 1) top = Math.max(top, Math.sqrt(1 - k * k) * a);
  }
  return top - v + 0.2 * (noise2(x, y, 34, s) - 0.5) + 0.12 * (noise2(x, y, 15, s + 5) - 0.5) + 0.06 * (noise2(x, y, 7, s + 9) - 0.5);
}

// A cloud w x h whose sun is on the side `dir` (1 right, -1 left), seed s, cached under `name`.
export const cumulus = (w, h, s, dir, name) => cached(`smogskyCloud${name}`, w + CLOUD_PAD * 2, h + CLOUD_PAD * 2, (g) => {
  const n = Math.max(3, Math.round(w / 120));
  const domes = [];
  for (let i = 0; i < n; i++) { // the domes: tall in the middle, small at the ends
    const c = ((i + 0.5) / n) * 2 - 1 + (hash(s + i) - 0.5) * 0.2;
    const r = Math.min((1 / n) * (1.1 + 0.9 * hash(s + 20 + i)), 1 - Math.abs(c)); // never past the cloud's ends
    domes.push([c, Math.max(r, 0.12), (1 - Math.abs(c) ** 1.6 * 0.55) * (0.62 + 0.38 * hash(s + 40 + i))]);
  }
  const [lx, ly] = [0.7 * dir, -0.5];
  const ds = 0.085;
  const tex = field(STEP, (X, Y, px) => {
    const [x, y] = [X - CLOUD_PAD, Y - CLOUD_PAD];
    const [u, v] = [(x / w) * 2 - 1, 1 - y / h];
    const d = dome(domes, u, v, x, y, s);
    const a = smoothstep(-0.015, 0.05, d) * smoothstep(-0.02, 0.05, v + 0.03 * (noise2(x, 0, 12, s) - 0.5));
    if (a <= 0) return;
    const d2 = dome(domes, u + lx * ds * 0.6, v - ly * ds, x + lx * ds * w * 0.3, y + ly * ds * h * 0.5, s);
    let b = clamp(0.55 + (d - d2) * 3.4 + 0.18 * (v - 0.35) * (1 - Math.abs(u) * 0.3), 0, 1); // lit by what falls toward the sun
    b *= 0.5 + 0.5 * smoothstep(0, 0.42, v + 0.1); // the underside
    const [r0, g0, b0] = b < 0.55 ? SHADOW : MID;
    const [r1, g1, b1] = b < 0.55 ? MID : LIT;
    const k = b < 0.55 ? b / 0.55 : (b - 0.55) / 0.45;
    px[0] = r0 + (r1 - r0) * k;
    px[1] = g0 + (g1 - g0) * k;
    px[2] = b0 + (b1 - b0) * k;
    px[3] = a;
    if (d < 0.1 && d2 < d) over(px, RIM[0], RIM[1], RIM[2], 0.5 * (1 - d / 0.1) * smoothstep(0.25, 0.6, v) * a); // the gold rim
  }, w + CLOUD_PAD * 2, h + CLOUD_PAD * 2);
  g.drawImage(tex, 0, 0, w + CLOUD_PAD * 2, h + CLOUD_PAD * 2);
});
