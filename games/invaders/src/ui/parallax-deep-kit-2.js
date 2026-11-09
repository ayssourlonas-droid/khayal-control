// Shared by the painters of Lantern Deep's mid layer (parallax-deep-mid.js and its -kelp, -ship, -ruins and
// -growth files) and of its near reef (parallax-deep-reef.js, -reef-arch.js, -reef-life.js). Everything is a
// dark silhouette in the layer colour, dressed in cool light: parallax.js rims the tops in teal, and what lives
// down here makes its own light, so the lights are small teal and violet points. The lanterns' gold is kept
// for the reef's gate and one cabin window. The sway flourish (flourish-deep-sway.js) draws what moves. See
// parallax-shapes.js for the painter contract.
import { rgba, mix } from './sprites.js';
import { TAU } from '../core/math.js';
export { poly } from './parallax-armada-kit.js';

export const TEAL = '#3de8d0';
export const VIOLET = '#b27cff';
export const ORCHID = '#d08aff';
export const GOLD = '#ffd27a'; // a lantern's glass
export const ROSE = '#ff6f9c';
export const STONE = '#6fb8b0'; // the cool tint of carved joints and planks, always drawn at a low alpha

// The layer colour lifted a little toward `color` (k 0..1): dark growth, dusky coral, wet wood.
export const tint = (L, color, k) => mix(L.color, color, k);

// Add the arc (cx, cy, r) from angle a0 to a1 (a1 < a0 runs it the other way) to the current path as short straight
// steps: the same to the eye as a canvas arc, but its extent is the arc's own, which a test can read.
export function arcSteps(g, cx, cy, r, a0, a1, step = 0.05) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / step));
  for (let i = 0; i <= n; i++) g.lineTo(cx + Math.cos(a0 + ((a1 - a0) * i) / n) * r, cy + Math.sin(a0 + ((a1 - a0) * i) / n) * r);
}

// A lumpy rock: a closed smooth path round (x, y), radii (rx, ry), each of its n points pushed in or out by
// up to `rough` of the radius.
export function lump(g, rng, x, y, rx, ry, rough = 0.22, n = 9) {
  const p = Array.from({ length: n }, (_, i) => {
    const [a, k] = [(i / n) * TAU, 1 + (rng() - 0.5) * 2 * rough];
    return [x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k];
  });
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  g.beginPath();
  g.moveTo(...mid(p[n - 1], p[0]));
  for (let i = 0; i < n; i++) g.quadraticCurveTo(p[i][0], p[i][1], ...mid(p[i], p[(i + 1) % n]));
  g.closePath();
}

export function dot(g, x, y, r, color, a = 0.8) {
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fillStyle = rgba(color, a);
  g.fill();
}

// A point of living light: a pinprick in the silhouette and a small halo among the layer's lights.
export function spark(g, out, rng, x, y, color, r = 12, a = 0.3, mode = 'pulse') {
  dot(g, x, y, 1.3, color, 0.85);
  out.lights.push({ x, y, r, color, mode, ph: rng(), a });
}

// Growth: n hair-fine strands standing out of the ellipse (cx, cy, rx, ry) between two angles (the upper half
// by default), `len` px long, leaning with the surface.
export function fur(g, rng, cx, cy, rx, ry, n, len, color, a = 0.7, a0 = Math.PI * 1.05, a1 = Math.PI * 1.95) {
  g.save();
  g.lineCap = 'round';
  g.lineWidth = 1.1;
  g.strokeStyle = rgba(color, a);
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const t = a0 + rng() * (a1 - a0);
    const [px, py, l] = [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry, len * (0.5 + rng())];
    g.moveTo(px, py);
    g.quadraticCurveTo(px + Math.cos(t) * l * 0.5 + (rng() - 0.5) * 4, py + Math.sin(t) * l * 0.5, px + Math.cos(t) * l * 0.8 + (rng() - 0.5) * 8, py + Math.sin(t) * l);
  }
  g.stroke();
  g.restore();
}

// The lit edge of a rock or a stone: an arc of the ellipse, the side the pale light from above falls on.
export function lit(g, cx, cy, rx, ry, color, a = 0.22, a0 = Math.PI * 1.1, a1 = Math.PI * 1.6) {
  g.save();
  g.lineWidth = 1.6;
  g.strokeStyle = rgba(color, a);
  g.beginPath();
  g.ellipse(cx, cy, rx * 0.97, ry * 0.97, 0, a0, a1);
  g.stroke();
  g.restore();
}

// A sea fan of size s standing at (x, y): a stalk, a net of ribs and cross-links in a half-disc, a glow among
// the layer's lights.
export function seaFan(g, out, rng, x, y, s, color) {
  const [fy, n, span] = [y - s * 0.35, 11, 2.2];
  const rib = (i) => -Math.PI / 2 + (i / n - 0.5) * span;
  g.save();
  g.lineCap = 'round';
  g.strokeStyle = rgba(color, 0.7);
  g.lineWidth = 1.8;
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x, fy);
  g.stroke();
  g.fillStyle = rgba(color, 0.13);
  g.beginPath();
  g.moveTo(x, fy);
  for (let i = 0; i <= n; i++) g.lineTo(x + Math.cos(rib(i)) * s * 0.72, fy + Math.sin(rib(i)) * s * 0.72);
  g.closePath();
  g.fill();
  g.lineWidth = 0.9;
  g.beginPath();
  for (let i = 0; i <= n; i++) {
    g.moveTo(x, fy);
    g.lineTo(x + Math.cos(rib(i)) * s * 0.72, fy + Math.sin(rib(i)) * s * 0.72);
  }
  for (const r of [0.34, 0.54, 0.72]) {
    g.moveTo(x + Math.cos(rib(0)) * s * r, fy + Math.sin(rib(0)) * s * r);
    g.arc(x, fy, s * r, rib(0), rib(n));
  }
  g.stroke();
  g.restore();
  out.lights.push({ x, y: fy - s * 0.25, r: s * 0.85, color, mode: 'pulse', ph: rng(), a: 0.24 });
}

// A branching coral growing from (x, y) in direction `ang`: each branch forks two or three times. Draws in
// `color` at alpha a.
export function coralTree(g, rng, x, y, ang, len, color, a = 0.7, depth = 3) {
  g.save();
  g.lineCap = 'round';
  g.strokeStyle = rgba(color, a);
  const grow = (px, py, an, l, d, w) => {
    const [nx, ny] = [px + Math.cos(an) * l, py + Math.sin(an) * l];
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(px, py);
    g.lineTo(nx, ny);
    g.stroke();
    if (d <= 0) return;
    const k = rng() < 0.4 ? 3 : 2;
    for (let i = 0; i < k; i++) grow(nx, ny, an + (i - (k - 1) / 2) * (0.55 + rng() * 0.3), l * (0.64 + rng() * 0.14), d - 1, Math.max(0.8, w * 0.7));
  };
  grow(x, y, ang, len, depth, 3);
  g.restore();
}

// Barnacles: n tiny pale cones along the line (x0, y0)-(x1, y1), each with a dark foot.
export function crust(g, rng, x0, y0, x1, y1, n, a = 0.3) {
  for (let i = 0; i < n; i++) {
    const [u, r] = [rng(), 1 + rng() * 1.1];
    const [x, y] = [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + (rng() - 0.5) * 5];
    dot(g, x, y + 0.6, r + 0.7, '#000000', 0.45);
    dot(g, x, y, r, STONE, a);
  }
}

// A lit window or porthole: a dark ring, a pane in `color` a little brighter at the top, a halo among the layer's
// lights. (x, y) in layer px.
export function pane(g, out, rng, x, y, r, color, mode = 'pulse', a = 0.42) {
  dot(g, x, y, r + 1.4, '#000000', 0.55);
  dot(g, x, y, r, color, 0.9);
  dot(g, x, y - r * 0.25, r * 0.55, mix(color, '#ffffff', 0.5), 0.4);
  out.lights.push({ x, y, r: r * 5.6, color, mode, ph: rng(), a });
}
