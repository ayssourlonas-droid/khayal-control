// The geometry of the Vesper Moth's forewing (World 16, Glass Cathedral; see moth.js), in the LEFT wing part's own
// coordinates (origin at the part's centre, the root on the right, the apex up on the left; the right wing is this
// mirrored). A moth's forewing is a fan: veins spring from a short base at the root (its middle HUB) to the margin, and
// rings of cames cross them. The cames of each ring are not circles but a chain of pointed arches (the cusps of gothic
// tracery), so every pane is a lancet with a pointed head and a pointed notch in its foot, and the rows overlap like
// the scales of a wing: 20 panes, with a plate of carved stone under them at the root. Everything is computed once here:
// vein and ring points, arches, cell paths, the outline. The flap scales and tips the whole wing about HUB
// (moth-wing.js); the geometry here is the wing at rest.

export const HUB = [132, 18]; // the middle of the base: the flap turns and swells the wing about it
export const BASE = [[142, -4], [124, 40]]; // where the root meets the thorax, costa to inner margin
export const NV = 6; // veins; cells run between neighbours, 5 sectors
export const ROWS = 4; // rows of panes between the root stone and the margin
export const F = [0, 0.26, 0.46, 0.66, 0.84, 1]; // where along a vein each ring of cames crosses
export const MARGIN = [[-122, -58], [-130, -30], [-127, 6], [-110, 38], [-82, 62], [-44, 74]];
export const BOWS = [14, 5, 1, -1, -4, -9]; // how much each vein bows (the costa up, the inner margin down)

const lerp = (a, b, t) => a + (b - a) * t;
export const ROOTS = Array.from({ length: NV }, (_, i) => [lerp(BASE[0][0], BASE[1][0], i / (NV - 1)), lerp(BASE[0][1], BASE[1][1], i / (NV - 1))]);
const T = (t, a, c, p) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * p[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * p[1]];

// Vein i's control point: the middle of its chord pushed sideways by its bow.
export function ctrl(i) {
  const [p, a] = [MARGIN[i], ROOTS[i]];
  const [dx, dy] = [p[0] - a[0], p[1] - a[1]];
  const d = Math.hypot(dx, dy);
  return [(a[0] + p[0]) / 2 - (dy / d) * BOWS[i], (a[1] + p[1]) / 2 + (dx / d) * BOWS[i]];
}
export const veinAt = (i, f) => T(f, ROOTS[i], ctrl(i), MARGIN[i]);

// Vein i from f0 to f1 as a path (a quadratic through its two ends and its middle: exact for a quadratic).
export function veinPath(g, i, f0 = 0, f1 = 1) {
  const [q0, q1, m] = [veinAt(i, f0), veinAt(i, f1), veinAt(i, (f0 + f1) / 2)];
  g.moveTo(...q0);
  g.quadraticCurveTo(2 * m[0] - (q0[0] + q1[0]) / 2, 2 * m[1] - (q0[1] + q1[1]) / 2, ...q1);
}

// RING[k][i]: where ring k (F[k]) crosses vein i. The direction a vein runs outward there.
export const RING = F.map((f) => MARGIN.map((_, i) => veinAt(i, f)));
const run = (i, k) => {
  const [a, b] = [veinAt(i, Math.max(0, F[k] - 0.03)), veinAt(i, Math.min(1, F[k] + 0.03))];
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
};

// The arch of ring k between veins i and i + 1: its apex, pointing outward along the veins, and its two sides, which
// spring upright from the cusps and meet in a point. Rows near the root have lower arches than the margin's.
export const ARCHES = RING.map((ring, k) => Array.from({ length: NV - 1 }, (_, i) => {
  const [p, q] = [ring[i], ring[i + 1]];
  const [a, c] = [run(i, k), run(i + 1, k)];
  const d = Math.hypot(a[0] + c[0], a[1] + c[1]);
  const n = [(a[0] + c[0]) / d, (a[1] + c[1]) / d];
  const h = Math.min(15, Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.48);
  const [sx, sy] = [q[0] - p[0], q[1] - p[1]];
  const up = (b, s) => [b[0] + s * sx * 0.03 + n[0] * h * 0.45, b[1] + s * sy * 0.03 + n[1] * h * 0.45];
  return { p, q, n, h, apex: [(p[0] + q[0]) / 2 + n[0] * h, (p[1] + q[1]) / 2 + n[1] * h], c1: up(p, 1), c2: up(q, -1) };
}));
export function archTo(g, k, i, back = false) {
  const a = ARCHES[k][i];
  if (back) {
    g.quadraticCurveTo(a.c2[0], a.c2[1], ...a.apex);
    g.quadraticCurveTo(a.c1[0], a.c1[1], ...a.p);
  } else {
    g.quadraticCurveTo(a.c1[0], a.c1[1], ...a.apex);
    g.quadraticCurveTo(a.c2[0], a.c2[1], ...a.q);
  }
}
// Ring k as one chain of arches.
export function chain(g, k) {
  g.moveTo(...RING[k][0]);
  for (let i = 0; i < NV - 1; i++) archTo(g, k, i);
}

// The pane of sector i (between veins i and i + 1), row r (0, the stone of the root, then 1..ROWS): up vein i, over the
// arch of the next ring, down vein i + 1, home over the notch of its own ring.
export function cellPath(g, i, r) {
  g.beginPath();
  g.moveTo(...RING[r][i]);
  g.lineTo(...RING[r + 1][i]);
  archTo(g, r + 1, i);
  g.lineTo(...RING[r][i + 1]);
  if (r) archTo(g, r, i, true); // row 0, the root plate, stands on the straight base
  g.closePath();
}

// A pane's middle and how far its light reaches.
export function cellMid(i, r) {
  const a = ARCHES[r + 1][i];
  const pts = [RING[r][i], RING[r + 1][i], RING[r][i + 1], RING[r + 1][i + 1], a.apex];
  const [x, y] = [pts.reduce((s, p) => s + p[0], 0) / 5, pts.reduce((s, p) => s + p[1], 0) / 5];
  return [x, y, Math.max(...pts.map((p) => Math.hypot(p[0] - x, p[1] - y)))];
}

// The root stone: the plate from the base to the first ring, whose arches it keeps.
export function rootPath(g) {
  g.beginPath();
  g.moveTo(...ROOTS[0]);
  g.lineTo(...RING[1][0]);
  for (let i = 0; i < NV - 1; i++) archTo(g, 1, i);
  g.lineTo(...ROOTS[NV - 1]);
  g.closePath();
}

// The whole wing's outline: out along the costa, round the cusps of the margin, home along the inner margin and across
// the base.
export function outline(g) {
  g.beginPath();
  veinPath(g, 0);
  for (let i = 0; i < NV - 1; i++) archTo(g, ROWS + 1, i);
  g.quadraticCurveTo(...ctrl(NV - 1), ...ROOTS[NV - 1]);
  g.closePath();
}
