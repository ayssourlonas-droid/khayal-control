// World 14, Ember Carnival, the balloon carrier (see w14.js): a bunch of prize balloons in the fair's colours
// carrying a gift box on a brass ring, and under the box the paper lantern whose glow is the power-up. The
// bunch sways from one beat to the next, the strings and the box with it. The balloons, box and lantern are
// in w14-9.js.
import { bloom, line, ellipse, INK } from './w14-kit.js';
import { GILT, rivet, giltH, ink } from './w14-kit.js';
import { balloon, gift, lantern } from './w14-9.js';

// [x, y, rx, ry, colour, sway]: back to front; the first is the carrier's own violet, on top.
const BUNCH = [
  [0, -30.5, 11.6, 13.4, null, 0.5], [-16.8, -25, 9.8, 12, '#ff3fa0', 1], [16.8, -25, 9.8, 12, '#ffc233', -1],
  [-9.4, -14.5, 8.8, 10.8, '#4be08a', -0.7], [9.4, -14.5, 8.8, 10.8, '#4de3ff', 0.7],
];

// A balloon-borne gift: the strings meet at the ring, the box and the lantern swing under it.
export function carrier(b, l, f, c) {
  const s = f ? 1 : -1;
  const swing = s * 0.07;
  const at = BUNCH.map(([x, y, rx, ry, col, k]) => [x + s * k * 1.7, y + (k > 0 ? (f ? -0.8 : 0.8) : f ? 0.8 : -0.8), rx, ry, col ?? c, k]);
  for (const [x, y, rx, ry] of at) { // the strings, from every knot to the ring
    b.beginPath();
    b.moveTo(x, y + ry + 3);
    b.quadraticCurveTo((x + s * 1) / 2, (y + ry + 3 + 4) / 2 + 3, s * 0.4, 4);
    line(b, INK, 2.6);
    line(b, '#f4e8d0', 1);
  }
  for (const i of [0, 1, 2, 3, 4]) balloon(b, ...at[i].slice(0, 5), s * at[i][5] * 0.05);
  ellipse(b, s * 0.4, 4, 2.6, 2.6); // the ring
  ink(b, giltH(b, -2.6, 2.6), 1.3);
  rivet(b, s * 0.4, 4, 0.7, GILT);
  gift(b, c, swing);
  lantern(b, l, f, swing);
  bloom(l, 0, -12, 36, c, 0.1 + f * 0.03);
  for (const [x, y, rx, ry, col] of at) bloom(l, x - rx * 0.3, y - ry * 0.3, 7, col, 0.18);
}
