// What World 13's painters share (w13.js .. w13-6.js): the fleet's brass, hemp and patched canvas, and the
// small things every airship of the Sunset Armada carries somewhere on it: a rivet, a rope, a seam of
// stitches, a propeller blade, a puff of smoke, a glint of sun on metal.
import { path, ink, lin, rad, rgba, shade, bloom, line, ellipse, INK } from './kit.js';

export const BRASS = '#c8902a';
export const GOLD = '#ffd27a'; // sun on metal, lamplight
export const HOT = '#ffb54a'; // anything that burns: furnace, fuse, muzzle flash
export const AETHER = '#4de3ff'; // the world's one cool colour: the aether lamps
export const ROPE = '#d6b47c';
export const CANVAS = '#f1d596';
export const RED = '#d4553a';

// Polished brass across x (a bright band left of centre) or down y (bright on top).
export const brass = (g, x0, x1) => lin(g, x0, 0, x1, 0, [[0, shade(BRASS, -0.35)], [0.3, shade(BRASS, 0.6)], [0.62, BRASS], [1, shade(BRASS, -0.55)]]);
export const brassV = (g, y0, y1) => lin(g, 0, y0, 0, y1, [[0, shade(BRASS, 0.55)], [0.45, BRASS], [1, shade(BRASS, -0.55)]]);

// A smooth closed shape through the control points: quadratic curves between the midpoints of the sides.
export function smooth(g, pts) {
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  g.beginPath();
  g.moveTo(...mid(pts[0], pts[1]));
  for (let i = 1; i <= pts.length; i++) {
    const [p, q] = [pts[i % pts.length], pts[(i + 1) % pts.length]];
    g.quadraticCurveTo(p[0], p[1], ...mid(p, q));
  }
  g.closePath();
}

// A hemp rope from (x0, y0) to (x1, y1), sagging by (sx, sy) at its middle: dark underlay, tan strand.
export function rope(g, x0, y0, x1, y1, sx = 0, sy = 0, w = 1.2) {
  g.beginPath();
  g.moveTo(x0, y0);
  g.quadraticCurveTo((x0 + x1) / 2 + sx, (y0 + y1) / 2 + sy, x1, y1);
  line(g, INK, w + 1.7);
  line(g, ROPE, w);
}

// A domed rivet head with a glint.
export function rivet(g, x, y, r = 1.4, c = BRASS) {
  ellipse(g, x, y, r, r);
  ink(g, shade(c, 0.12), 0.9);
  ellipse(g, x - r * 0.3, y - r * 0.35, r * 0.38, r * 0.38);
  g.fillStyle = rgba('#ffffff', 0.8);
  g.fill();
}

// A seam of stitches from (x0, y0) to (x1, y1): the seam itself and a tick across it every `step` px.
export function stitches(g, x0, y0, x1, y1, c = '#5a3418', step = 3.2, len = 1.7) {
  const d = Math.hypot(x1 - x0, y1 - y0) || 1;
  const [ux, uy] = [(x1 - x0) / d, (y1 - y0) / d];
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  line(g, rgba(c, 0.7), 0.8);
  g.beginPath();
  for (let t = step / 2; t < d; t += step) {
    const [x, y] = [x0 + ux * t, y0 + uy * t];
    g.moveTo(x - uy * len, y + ux * len);
    g.lineTo(x + uy * len, y - ux * len);
  }
  line(g, c, 0.9);
}

// A patch of canvas sewn on: w x h, turned by rot, a stitched border inside its edge.
export function patch(g, x, y, w, h, rot, c, thread = '#5a3418') {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.beginPath();
  g.rect(-w / 2, -h / 2, w, h);
  g.fillStyle = c;
  g.fill();
  line(g, rgba('#000000', 0.5), 1);
  g.beginPath();
  g.rect(-w / 2 + 1.4, -h / 2 + 1.4, w - 2.8, h - 2.8);
  g.setLineDash([1.5, 1.3]);
  line(g, thread, 0.8);
  g.setLineDash([]);
  g.restore();
}

// One propeller blade from the hub toward (tx, ty): a tapering paddle w wide at the root, gold at the tip.
export function blade(g, hx, hy, tx, ty, w, c) {
  const len = Math.hypot(tx - hx, ty - hy) || 1;
  const [nx, ny] = [(-(ty - hy) / len) * w, ((tx - hx) / len) * w];
  const at = (u, k) => [hx + (tx - hx) * u + nx * k, hy + (ty - hy) * u + ny * k];
  path(g, [at(0, 0.8), at(1, 0.55), at(1, -0.55), at(0, -0.8)]);
  ink(g, lin(g, hx, hy, tx, ty, [[0, shade(c, -0.35)], [0.6, shade(c, 0.4)], [1, shade(c, 0.1)]]), 1.9);
  path(g, [at(0.74, 0.6), at(0.97, 0.55), at(0.97, -0.55), at(0.74, -0.6)]);
  g.fillStyle = HOT;
  g.fill();
}

// A puff of smoke: three lobes outlined as one, lilac on top and warm where the low sun reaches it.
export function puff(g, x, y, r) {
  const lobes = [[0, 0, r], [-r * 0.78, r * 0.22, r * 0.62], [r * 0.8, r * 0.18, r * 0.7]];
  for (const [dx, dy, k] of lobes) {
    ellipse(g, x + dx, y + dy, k + 1.5, k + 1.5);
    g.fillStyle = INK;
    g.fill();
  }
  for (const [dx, dy, k] of lobes) {
    ellipse(g, x + dx, y + dy, k, k);
    g.fillStyle = rad(g, x + dx, y + dy, 0, k * 1.3, [[0, '#fff1e6'], [0.5, '#c9b4d2'], [1, '#d08a78']], x + dx - k * 0.35, y + dy - k * 0.4);
    g.fill();
  }
}

// Sun from below: warm bounce light fading in over the clipped shape between y0 and y1.
export function sunlit(g, y0, y1, a = 0.4, c = '#ff9a3a') {
  g.fillStyle = lin(g, 0, y0, 0, y1, [[0, rgba(c, 0)], [1, rgba(c, a)]]);
  g.fillRect(-48, y0, 96, y1 - y0);
}

// The fleet's mark, a small sun: a ring, eight rays and a dot, r px across, painted in colour c.
export function sun(g, x, y, r, c) {
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    g.moveTo(x + Math.cos(a) * r * 0.66, y + Math.sin(a) * r * 0.66);
    g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  g.moveTo(x + r * 0.5, y);
  g.arc(x, y, r * 0.5, 0, Math.PI * 2);
  line(g, c, Math.max(0.9, r * 0.2));
  ellipse(g, x, y, r * 0.24, r * 0.24);
  g.fillStyle = c;
  g.fill();
}

// A ring of light on the lights layer: nothing inside r0, the colour at r0, fading out by r1.
export function halo(l, x, y, r0, r1, c, a = 0.5) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, x, y, 0, r1, [[0, rgba(c, 0)], [r0 / r1, rgba(c, a)], [1, rgba(c, 0)]]);
  l.fillRect(x - r1, y - r1, r1 * 2, r1 * 2);
  l.restore();
}

// A glint on the lights layer: a four-point star in a small bloom.
export function glint(l, x, y, r, c = '#fff6d0', a = 1) {
  bloom(l, x, y, r * 1.8, GOLD, 0.45 * a);
  const k = r * 0.16;
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  l.moveTo(x, y - r);
  l.quadraticCurveTo(x + k, y - k, x + r, y);
  l.quadraticCurveTo(x + k, y + k, x, y + r);
  l.quadraticCurveTo(x - k, y + k, x - r, y);
  l.quadraticCurveTo(x - k, y - k, x, y - r);
  l.fillStyle = rgba(c, a);
  l.fill();
  l.restore();
}
