// What World 16's painters share (w16.js .. w16-5.js): the cathedral's creatures are glass, lead and stone lit by
// dawn. A pane of jewel glass has a pale heart, a saturated edge, a bright streak and a lead came round it, and
// on the lights layer the colour shining through; a came is dark lead with a dull sheen on its upper-left side;
// carved stone is pale, grained and rimmed with the dawn's warm light from the upper left. Nothing here is lime
// (acid lime is the enemy's bullets' alone) and nothing is painted per frame: every shape is baked at load.
import { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, circle, both, TAU, INK } from './kit.js';
import { hash } from '../sprites.js';

export { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, circle, both, TAU, INK, hash };

export const LEAD = '#171121'; // lead came and every outline: a violet-black, readable on any sky
export const SHEEN = '#a094b4'; // the dull gleam along a came
export const STONE = '#c9bdd6'; // pale carved stone
export const SLATE = '#5a4d70'; // stone in shadow
export const DAWN = '#ffd9c4'; // the warm rim light the dawn leaves on every top-left edge
export const RUBY = '#f0386a';
export const SAPPHIRE = '#3f7dff';
export const AMBER = '#ffb43a';
export const AMETHYST = '#a65cff';
export const EMERALD = '#22c9a4'; // teal-leaning: well away from the bullets' lime
export const CLEAR = '#e6f1ff';
export const GOLD = '#ffd96a';

// Points along a cubic bezier, n + 1 of them.
export function bez(p0, p1, p2, p3, n = 14) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([0, 1].map((a) => u * u * u * p0[a] + 3 * u * u * t * p1[a] + 3 * u * t * t * p2[a] + t * t * t * p3[a]));
  }
  return out;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const lerp2 = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];

// A tracer for pts: trace(g) lays the closed polygon on any context (a pane is traced on the body and on the lights).
export const poly = (pts) => (g) => path(g, pts);

// An annular sector of a ring about (cx, cy), r0 to r1, from angle a0 to a1.
export function sector(g, cx, cy, r0, r1, a0, a1) {
  g.beginPath();
  g.arc(cx, cy, r1, a0, a1);
  g.arc(cx, cy, r0, a1, a0, true);
  g.closePath();
}

// A lead came along the current path: dark lead w wide with a dull sheen along its upper-left side.
export function came(g, w = 1.8) {
  line(g, LEAD, w);
  if (w < 1.4) return;
  g.save();
  g.translate(-w * 0.16, -w * 0.2);
  line(g, rgba(SHEEN, 0.5), w * 0.26);
  g.restore();
}

// A short bright specular streak (a window's glint) from (x0, y0) to (x1, y1).
export function streak(g, x0, y0, x1, y1, w = 1, a = 0.6) {
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  line(g, rgba('#ffffff', a), w);
}

// A four-point star on any context: a white glint (on the body it is paint, on the lights it is light).
export function star4(g, x, y, r, c = '#ffffff', a = 1) {
  const k = r * 0.17;
  g.save();
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x + k, y - k, x + r, y);
  g.quadraticCurveTo(x + k, y + k, x, y + r);
  g.quadraticCurveTo(x - k, y + k, x - r, y);
  g.quadraticCurveTo(x - k, y - k, x, y - r);
  g.fillStyle = rgba(c, a);
  g.fill();
  g.restore();
}

// A spark on the lights layer: a soft bloom, a hot disc and a four-point star, a (0..1) scaling all three.
export function spark(l, x, y, r, c, a = 1) {
  bloom(l, x, y, r * 3.4, c, 0.7 * a);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, x, y, 0, r, [[0, '#ffffff'], [0.5, shade(c, 0.5)], [1, rgba(c, 0.8)]]);
  l.beginPath();
  l.arc(x, y, r, 0, TAU);
  l.fill();
  star4(l, x, y, r * 2.4, '#ffffff', 0.7 * a);
  l.restore();
}

// A pane of jewel glass: the traced shape (a function of a context) filled across its box (centre cx, cy,
// radius r) from a pale upper-left to a saturated, darker lower-right, a lighter heart, a streak of
// specular light, then lead round it; on the lights the colour shining through at strength lit.
export function pane(b, l, trace, c, [cx, cy, r], lit = 0.14, w = 1.7) {
  trace(b);
  b.fillStyle = lin(b, cx - r * 0.8, cy - r * 0.9, cx + r * 0.8, cy + r * 0.9, [[0, shade(c, 0.24)], [0.45, c], [1, mix(c, '#160a30', 0.55)]]);
  b.fill();
  b.save();
  trace(b);
  b.clip();
  b.fillStyle = rad(b, cx - r * 0.1, cy - r * 0.1, 0, r * 0.75, [[0, rgba(shade(c, 0.6), 0.42)], [1, rgba(c, 0)]]);
  b.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);
  if (r > 2.2) streak(b, cx - r * 0.6, cy - r * 0.1, cx - r * 0.1, cy - r * 0.6, Math.min(1.1, r * 0.2), 0.55);
  b.restore();
  trace(b);
  came(b, w);
  if (!l || !lit) return;
  l.save();
  l.globalCompositeOperation = 'lighter';
  trace(l);
  l.fillStyle = rgba(c, lit);
  l.fill();
  l.restore();
}

// Carved stone across a box: pale at the upper left, c in the middle, dark at the lower right.
export const stoneFill = (g, x0, y0, x1, y1, c = STONE) => lin(g, x0, y0, x1, y1, [[0, shade(c, 0.3)], [0.45, c], [1, mix(c, SLATE, 0.85)]]);

// Grain over an ellipse (cx, cy, rx, ry): n specks, light and dark alternating, a (0..1) strong. Clip first.
export function grain(g, n, seed, cx, cy, rx, ry, a = 0.3) {
  for (let i = 0; i < n; i++) {
    const t = hash(seed * 131 + i * 3) * TAU;
    const d = Math.sqrt(hash(seed * 131 + i * 3 + 1));
    const r = 0.35 + hash(seed * 131 + i * 3 + 2) * 0.7;
    circle(g, cx + Math.cos(t) * d * rx, cy + Math.sin(t) * d * ry, r);
    g.fillStyle = i % 2 ? rgba('#ffffff', a) : rgba(LEAD, a * 1.3);
    g.fill();
  }
}

// A painter that gives back every piece of both contexts' state (lineCap, widths, colours, alpha, blend mode).
export const tidy = (paint) => (b, l, f, c) => {
  b.save();
  l.save();
  paint(b, l, f, c);
  l.restore();
  b.restore();
};
