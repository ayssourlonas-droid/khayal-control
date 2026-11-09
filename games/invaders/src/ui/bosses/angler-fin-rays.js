// The geometry of the Lantern Leviathan's pectoral fin (World 15, Lantern Deep; angler-fin.js paints it,
// angler-ripple.js ripples it, angler-fx.js runs light along the rays): the knuckle, the nine rays each a quadratic
// from the knuckle to its tip, bowed outward, and the trailing edge between each pair of tips, a scallop that is
// ragged on the torn wedges. All in the part's frame, as painted (the left fin; the right is its mirror). The fan is
// big: it reaches out about 100 px and down about 100, past the part's box, so the part is margined for it.
import { path } from './kit.js';
import { hash } from '../sprites.js';

export const WRIST = [4, 8]; // the knuckle, in the part's frame (the head's flank is about x 20)
const LENS = [60, 84, 100, 110, 114, 110, 100, 86, 70]; // how far each ray reaches from the knuckle
const PHI = [0.15, -1.65]; // the fan's first and last ray: up the fan is positive, -pi/2 is straight down
const MID = (PHI[0] + PHI[1]) / 2;
export const N = LENS.length;
const TORN = new Set([1, 4, 6]); // the wedges whose trailing edge is ragged
const JOINTS = 7;

// Each ray, from its start on the knuckle to its tip, a quadratic bowed outward; rayAt(i, u, out) is the point at u.
export const RAYS = LENS.map((len, i) => {
  const phi = PHI[0] + ((PHI[1] - PHI[0]) * i) / (N - 1);
  const d = [-Math.cos(phi), -Math.sin(phi)];
  const p0 = [WRIST[0] + d[0] * 9, WRIST[1] + d[1] * 9];
  const p1 = [WRIST[0] + d[0] * len, WRIST[1] + d[1] * len];
  const bow = (7 * (phi - MID)) / (PHI[0] - MID);
  return { phi, side: Math.sign(phi - MID), d, p0, p1, c: [(p0[0] + p1[0]) / 2 + Math.sin(phi) * bow, (p0[1] + p1[1]) / 2 - Math.cos(phi) * bow] };
});
export function rayAt(i, u, out = [0, 0]) {
  const { p0, c, p1 } = RAYS[i];
  const v = 1 - u;
  out[0] = v * v * p0[0] + 2 * v * u * c[0] + u * u * p1[0];
  out[1] = v * v * p0[1] + 2 * v * u * c[1] + u * u * p1[1];
  return out;
}
export const rayPts = (i) => Array.from({ length: JOINTS + 1 }, (_, s) => rayAt(i, s / JOINTS));

// The trailing edge from tip i to tip i + 1: a scallop curving in toward the knuckle, ragged where torn.
export const EDGES = Array.from({ length: N - 1 }, (_, i) => Array.from({ length: 7 }, (_, k) => {
  const s = k / 6;
  const [a, b] = [RAYS[i].p1, RAYS[i + 1].p1];
  let pull = 0.15 * 4 * s * (1 - s);
  if (TORN.has(i) && k > 0 && k < 6) pull += (hash(i * 17 + k) - 0.15) * (k % 2 ? 0.26 : 0.1);
  const [x, y] = [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
  return [x + (WRIST[0] - x) * pull, y + (WRIST[1] - y) * pull];
}));
export const wedge = (g, i) => path(g, [...rayPts(i), ...EDGES[i].slice(1), ...rayPts(i + 1).reverse()]);
export const trail = (g, i) => path(g, EDGES[i], true);
