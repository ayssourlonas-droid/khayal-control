// The Squall Ray's tail (World 18, Anvil Sky; ray-hull.js paints it over the cloud, after the layers have faded at the HUD's line, so that it is not faded with
// them): a ray has a whip of a tail and this one arches out from behind the anvil over the right shoulder, as a scorpion's does, to end above the wing. It is
// a spine of iron plates (ray-shape.js TAIL is its centre line), thirteen of them, wide at the root and thin at the tip, each lying over the next one toward the
// tip, ending in a steel barb; on the lights layer a thin cyan line runs down its length and a point of light burns at the barb. Only one tail: the ray is
// not symmetrical here, and it keeps the right shoulder's top from being a bare edge. Nothing here is above y -156. Hull coordinates. Bake-time only.
import { PAL, path } from './ray-kit.js';
import { glare, neon } from '../aliens/w18-kit.js';
import { TAIL } from './ray-shape.js';
import { slab } from './ray-iron.js';

const N = 13;

// The point d px along the centre line and the angle of the line there.
function along(d, len) {
  let i = 1;
  while (i < TAIL.length - 1 && len[i] < d) i++;
  const [a, b] = [TAIL[i - 1], TAIL[i]];
  const u = (d - len[i - 1]) / (len[i] - len[i - 1] || 1);
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, Math.atan2(b[1] - a[1], b[0] - a[0])];
}

export function tail(b, l) {
  const len = TAIL.reduce((acc, p, i) => [...acc, i ? acc[i - 1] + Math.hypot(p[0] - TAIL[i - 1][0], p[1] - TAIL[i - 1][1]) : 0], []);
  const total = len.at(-1);
  for (let i = N - 1; i >= 0; i--) { // from the tip back, so that each plate lies over the one beyond it
    const u = (i + 0.5) / N;
    const [x, y, th] = along(total * u * 0.94, len);
    const [a, w] = [12 - 5.5 * u, 10.5 - 8.7 * u ** 0.9];
    const [c, s] = [Math.cos(th), Math.sin(th)];
    const pts = [[-a, -w], [a * 0.8, -w * 0.9], [a, 0], [a * 0.8, w * 0.9], [-a, w]].map(([px, py]) => [x + px * c - py * s, y + px * s + py * c]);
    slab(b, pts, i % 2 ? PAL.iron : PAL.plate, { seed: 80 + i, wear: 0.3, rust: 0, lw: 1.6 });
  }
  const [bx, by, bth] = along(total * 0.94, len); // the barb at the end
  const [c, s] = [Math.cos(bth), Math.sin(bth)];
  const barb = [[-2, -3], [18, 0], [-2, 3]].map(([px, py]) => [bx + px * c - py * s, by + px * s + py * c]);
  slab(b, barb, PAL.steel, { seed: 99, wear: 0.5, rust: 0, lw: 1.3 });
  const tip = barb[1];
  path(l, TAIL.filter((_, i) => i % 2 === 0), true);
  neon(l, PAL.cyan, 0.8, 0.3);
  glare(l, tip[0], tip[1], 2.4, PAL.white, 1);
}
