// What World 15's painters share (w15.js .. w15-7.js): the creatures of the Lantern Deep are soft-bodied and
// make their own light, so the kit is gradients, tapering strands (tentacles, arms, fin rays), glass-bead
// photophores, speckle and the small sparks that go on the lights layer. Everything is painted once, at load.
// Amber is the enemy's bullets' colour: nothing here glows amber (the squid's gold ring is body paint only).
import { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, circle, both, TAU, INK } from './kit.js';
import { hash } from '../sprites.js';

export { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, circle, both, TAU, INK, hash };

export const PALE = '#9af4ff'; // living light, the lightest
export const AQUA = '#5af0ff';
export const ABYSS = '#06182a'; // the water at depth, the darkest body tone
export const GOLD = '#ffd27a'; // lantern gold: body paint only (an iris, a rim), never a light
export const ROSE = '#ff6f9c';
export const SOFT = '#0b1638'; // the outline of soft parts (tentacles, arms, frills): deep indigo, lighter than ink
export const VIOLET = '#b27cff';

// Points along a cubic bezier, n + 1 of them.
export function bez(p0, p1, p2, p3, n = 16) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    out.push([0, 1].map((a) => k[0] * p0[a] + k[1] * p1[a] + k[2] * p2[a] + k[3] * p3[a]));
  }
  return out;
}

// The outline of a ribbon along pts, w0 wide at the start and w1 at the end. frill ruffles both edges (in
// antiphase, so it snakes), `freq` radians per sample, so a frilled arm looks like a ruff of gauze.
export function ribbon(pts, w0, w1, frill = 0, freq = 1.3, phase = 0) {
  const n = pts.length;
  const left = [];
  const right = [];
  pts.forEach(([x, y], i) => {
    const [ax, ay] = pts[Math.max(i - 1, 0)];
    const [bx, by] = pts[Math.min(i + 1, n - 1)];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const [nx, ny] = [-(by - ay) / len, (bx - ax) / len];
    const half = ((w0 + (w1 - w0) * (i / (n - 1))) / 2) * (i === n - 1 ? 0.5 : 1);
    const wl = half * (1 + frill * Math.sin(i * freq + phase));
    const wr = half * (1 + frill * Math.sin(i * freq + phase + Math.PI));
    left.push([x + nx * wl, y + ny * wl]);
    right.push([x - nx * wr, y - ny * wr]);
  });
  return [...left, ...right.reverse()];
}

// A tapering strand, filled and outlined in ink; rib is an optional pale line along its middle.
export function strand(g, pts, w0, w1, fill, lw = 2, rib = null, frill = 0, freq = 1.3, phase = 0, edge = INK) {
  path(g, ribbon(pts, w0, w1, frill, freq, phase));
  g.fillStyle = fill;
  g.fill();
  line(g, edge, lw);
  if (rib) {
    path(g, pts, true);
    line(g, rib, 0.8);
  }
}

// A thin thread (a tentacle seen at a distance): ink under, colour over, a pale glint on one side.
export function thread(g, pts, w, c, glint = 0.5) {
  path(g, pts, true);
  line(g, SOFT, w + 1.7);
  line(g, c, w);
  path(g, pts.map(([x, y]) => [x - w * 0.22, y]), true);
  line(g, rgba('#ffffff', glint), Math.max(0.5, w * 0.3));
}

// A spark on the lights layer: a soft bloom and a small hot disc, a (0..1) scaling both.
export function spark(l, x, y, r, c, a = 1) {
  bloom(l, x, y, r * 3.4, c, 0.75 * a);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.globalAlpha = a;
  l.fillStyle = rad(l, x, y, 0, r, [[0, '#ffffff'], [0.5, shade(c, 0.5)], [1, rgba(c, 0.8)]]);
  l.beginPath();
  l.arc(x, y, r, 0, TAU);
  l.fill();
  l.restore();
}

// A glass bead set in the skin (a photophore): on the body a clear bead with a dark ring, and, if lit, its
// spark on the lights layer. Unlit beads are drawn dim and dull.
export function bead(b, l, x, y, r, c, lit = 1) {
  circle(b, x, y, r);
  ink(b, rad(b, x, y, 0.1, r * 1.25, [[0, lit ? '#ffffff' : shade(c, 0.35)], [0.5, lit ? shade(c, 0.45) : shade(c, -0.2)], [1, shade(c, -0.5)]], x - r * 0.3, y - r * 0.35), Math.min(1.1, r * 0.7));
  if (lit) spark(l, x, y, r * 0.55, c, lit);
}

// Freckles scattered over an ellipse (cx, cy, rx, ry), n of them, radius rmin..rmax, colours cycled; seed
// picks the pattern (hash, never dice). Clip first if they must stay inside a shape.
export function freckles(g, n, seed, cx, cy, rx, ry, cols, rmin, rmax, a = 1) {
  for (let i = 0; i < n; i++) {
    const t = hash(seed * 131 + i * 3) * TAU;
    const d = Math.sqrt(hash(seed * 131 + i * 3 + 1));
    const r = rmin + hash(seed * 131 + i * 3 + 2) * (rmax - rmin);
    circle(g, cx + Math.cos(t) * d * rx, cy + Math.sin(t) * d * ry, r);
    g.fillStyle = rgba(cols[i % cols.length], a);
    g.fill();
  }
}

// A cone-shaped spike from (x, y) outward at angle a, len long, w wide at the root: a spine, dark-edged.
export function spike(g, x, y, a, len, w, fill, lw = 1.5) {
  const [cx, cy, nx, ny] = [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a)];
  path(g, [[x + nx * w, y + ny * w], [x + cx * len, y + cy * len], [x - nx * w, y - ny * w]]);
  ink(g, fill, lw);
}

// A clubbed or round-ended soft tip: a small ellipse tilted along the strand, with a gloss.
export function knob(g, x, y, rx, ry, rot, fill) {
  ellipse(g, x, y, rx, ry, rot);
  ink(g, fill, 1.6);
  gloss(g, x - rx * 0.3, y - ry * 0.3, rx * 0.5, ry * 0.4, 0.55, rot);
}
