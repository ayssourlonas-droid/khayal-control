// The lights of The Squall Ray's Tesla coil (World 18, Anvil Sky; ray-coil.js lays them on the part's lights layer, in the coil's own leaning frame): the toroid's
// rim of cyan with a violet bloom round it, the blaze at the point the arcs leave from and at the ball on the prong, a static arc between the two, little forked arcs
// leaping from the donut into the air, a warm gleam along the winding and glints on the porcelain. Bake-time only.
import { PAL, rng, rad, rgba, bloom, ellipse } from './ray-kit.js';
import { glare, neon } from '../aliens/w18-kit.js';
import { fork, strike } from './ray-bolt.js';

export function lit(l, E, P, { y, rx, ry, w }) {
  const r = rng(43);
  bloom(l, 0, y, 62, PAL.electric, 0.3);
  bloom(l, 0, y, 38, PAL.cyan, 0.2);
  ellipse(l, 0, y, rx + w / 2 - 1, ry + w / 2 - 1); // the donut's rim
  neon(l, PAL.cyan, 1.1, 0.4);
  ellipse(l, 0, y + 0.5, rx - w / 2, 2.4);
  neon(l, PAL.violet, 1, 0.5);
  glare(l, E[0], E[1], 4.5, PAL.white, 1);
  bloom(l, E[0], E[1], 26, PAL.cyan, 0.4);
  glare(l, P[0], P[1], 3.6, PAL.white, 1);
  bloom(l, P[0], P[1], 22, PAL.cyan, 0.4);
  l.save();
  l.beginPath();
  l.rect(-16, -19, 32, 40);
  l.clip();
  l.fillStyle = rad(l, 0, 0, 0, 26, [[0, rgba(PAL.copperL, 0.22)], [1, rgba(PAL.copperL, 0)]]);
  l.fillRect(-17, -19, 34, 44);
  l.restore();
  strike(l, fork(5, E[0] - 2, E[1] - 3, P[0] + 2, P[1] + 3, 6, 6, 1), PAL.violet, 1.2, 0.8);
  for (const [seed, x0, y0, x1, y1] of [[7, -42, y + 3, -62, y + 16], [8, 6, y + ry + w / 2 - 2, 14, y + 34], [9, 42, y + 2, 64, y + 12]]) {
    strike(l, fork(seed, x0, y0, x1, y1, 4, 4, 1), seed % 2 ? PAL.cyan : PAL.violet, 1.1, 0.75);
  }
  for (let i = 0; i < 3; i++) glare(l, -12 + 12 * i * (r() + 0.4), -26 + 5 * i, 1.5, PAL.white, 0.7);
}
