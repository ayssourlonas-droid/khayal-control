// The Squall Ray's lightning (World 18, Anvil Sky; ray-glow.js, ray-heart.js, ray-maw.js, ray-rage.js and the live arcs of ray-fx-bolts.js are drawn
// with it): fork() is one branching bolt as a list of polylines, the main stroke from one point to another thrown sideways by a hash of the seed
// (the same seed is always the same bolt: nothing needs dice) and a few shorter forks that leave it at a slant and die out; strike() lays them on a
// lights context in a colour with a white core, the main stroke at width w and the forks thinner. Bake-time only (the live bolts are baked sprites).
import { jag, bolt } from '../aliens/w18-kit.js';
import { hash } from './ray-kit.js';

// A bolt from (x0, y0) to (x1, y1) in n segments, thrown by up to amp px, with `forks` forks: [main, fork, fork, ...], each [[x, y], ...].
export function fork(seed, x0, y0, x1, y1, n, amp, forks = 2) {
  const main = jag(seed, x0, y0, x1, y1, n, amp);
  const out = [main];
  const [dx, dy] = [x1 - x0, y1 - y0];
  for (let i = 0; i < forks; i++) {
    const at = main[Math.max(1, Math.min(n - 1, Math.round(n * (0.25 + 0.5 * hash(seed * 11 + i * 3 + 1)))))];
    const side = hash(seed * 13 + i * 5 + 2) < 0.5 ? -1 : 1;
    const [c, s] = [Math.cos(0.6 * side), Math.sin(0.6 * side)];
    const k = 0.25 + 0.2 * hash(seed * 17 + i * 7 + 3);
    out.push(jag(seed * 7 + i + 5, at[0], at[1], at[0] + (dx * c - dy * s) * k, at[1] + (dx * s + dy * c) * k, Math.max(2, Math.round(n * 0.4)), amp * 0.6));
  }
  return out;
}

// Lay a fork() result on l: the main stroke at width w, the forks at 0.6 w and a little dimmer.
export function strike(l, polys, color, w = 1.4, a = 1) {
  l.save(); // bolt() leaves round caps and mitred joins behind
  polys.forEach((pts, i) => bolt(l, pts, color, i ? w * 0.6 : w, i ? a * 0.8 : a));
  l.restore();
}
