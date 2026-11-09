// The Vesper Moth's feathered antennae (World 16, Glass Cathedral; moth-crown.js paints them, moth-fx.js twinkles their
// tips): a pair of bipectinate antennae, a lead shaft that rises from the crown, arches outward like a lyre and curls
// down at its end, with a row of fine glass barbs on both sides of it, longest at the swell and shortening to the tip,
// each barb tipped with a bead. The right one here, in the crown's own coordinates (origin at the part's centre); the
// crown mirrors it for the left. Nothing rises above y -43 here, which is -155 from the boss's centre: under the HUD.
import { line, rgba, shade, lin } from './kit.js';
import { circle, rng, LEAD, LEAD_L, ROSE, VIOLET, COBALT, GOLD, GREEN } from './moth-kit.js';

export const SHAFT = [[10, -12], [18, -23], [38, -31], [66, -31], [90, -23], [103, -9], [105, 8]];
export const TIP = SHAFT[SHAFT.length - 1];
const N = 30; // barbs on each side
const TOP = -42; // no barb is drawn higher

// A point on the shaft (a Catmull-Rom through SHAFT), u 0..1, and its direction, written to `out` as [x, y, tx, ty]
// (a fresh array when none is given: the live glint passes its own scratch, so nothing is allocated per frame).
export function at(u, out = [0, 0, 0, 0]) {
  const n = SHAFT.length - 1;
  const s = Math.min(n - 1e-6, Math.max(0, u * n));
  const i = Math.floor(s);
  const f = s - i;
  const [p0, p1, p2, p3] = [SHAFT[Math.max(0, i - 1)], SHAFT[i], SHAFT[Math.min(n, i + 1)], SHAFT[Math.min(n, i + 2)]];
  for (let c = 0; c < 2; c++) {
    const [a, b, d, e] = [p0[c], p1[c], p2[c], p3[c]];
    out[c] = 0.5 * (2 * b + (d - a) * f + (2 * a - 5 * b + 4 * d - e) * f * f + (3 * b - a - 3 * d + e) * f ** 3);
    out[c + 2] = 0.5 * (d - a + 2 * (2 * a - 5 * b + 4 * d - e) * f + 3 * (3 * b - a - 3 * d + e) * f * f);
  }
  const m = Math.hypot(out[2], out[3]) || 1;
  out[2] /= m;
  out[3] /= m;
  return out;
}

const BEADS = [ROSE, VIOLET, COBALT, GOLD, GREEN];

export function antenna(b) {
  const r = rng(404);
  for (let side = -1; side <= 1; side += 2) { // the barbs, behind the shaft
    for (let i = 1; i <= N; i++) {
      const u = 0.1 + (0.9 * i) / N;
      const [x, y, tx, ty] = at(u);
      const len = (4 + 11 * Math.sin(Math.PI * Math.min(1, u * 0.95) ** 0.8)) * (0.85 + r() * 0.3);
      const [nx, ny] = [-ty * side, tx * side];
      const [ex, ey] = [x + nx * len + tx * len * 0.55, Math.max(TOP, y + ny * len + ty * len * 0.55)];
      b.beginPath();
      b.moveTo(x, y);
      b.quadraticCurveTo(x + nx * len * 0.7, Math.max(TOP, y + ny * len * 0.7), ex, ey);
      line(b, rgba(LEAD, 0.9), 2.3);
      line(b, rgba(shade(i % 3 ? ROSE : VIOLET, 0.5), 0.95), 1.1);
      circle(b, ex, ey, 1.2);
      b.fillStyle = shade(BEADS[i % 5], 0.35);
      b.fill();
    }
  }
  const stroke = (w0, w1, col) => { // the shaft, thick at the root and fine at the tip, in segments
    for (let s = 0; s < 20; s++) {
      const [[x0, y0], [x1, y1]] = [at(s / 20), at((s + 1) / 20)];
      b.beginPath();
      b.moveTo(x0, y0);
      b.lineTo(x1, y1);
      line(b, col, w0 + (w1 - w0) * (s / 19));
    }
  };
  stroke(5.2, 2.4, LEAD);
  stroke(2.2, 0.9, rgba(LEAD_L, 0.75));
  circle(b, ...TIP, 3);
  b.fillStyle = LEAD;
  b.fill();
  circle(b, TIP[0], TIP[1], 2);
  b.fillStyle = lin(b, TIP[0] - 2, TIP[1] - 2, TIP[0] + 2, TIP[1] + 2, [[0, '#ffffff'], [1, GOLD]]);
  b.fill();
}
