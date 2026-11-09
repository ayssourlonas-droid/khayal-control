// Shapes and colours shared by the painters of Glass Cathedral's three layers (parallax-glass.js and the files it
// draws with: -window, -rose, -front, -nave, -ruin for the far one; -mid and -mid-parts; -near, -near-parts and
// -near-stump; -detail, which this file re-exports: courses of ashlar, pinnacles, ivy).
// Everything stands in the layer colour, a pale stone gone to shadow because the dawn is behind it, and is dressed in
// the dawn's light: a rim of rose-gold along the edges that face the sun, and jewel-coloured glass where the
// windows still hold it. Glass is the only bright thing here, and it is dim at this distance: nothing in the
// backdrop may outshine a bullet. See parallax-shapes.js for the painter contract.
import { rgba, mix, lin } from './sprites.js';
import { TAU } from '../core/math.js';
export { poly } from './parallax-armada-kit.js';

// Add the closed polygon pts, moved by (ox, oy), to the current path (no beginPath: rimLight builds on a path of its own).
export function trace(c, pts, ox = 0, oy = 0) {
  pts.forEach(([x, y], i) => (i ? c.lineTo(x + ox, y + oy) : c.moveTo(x + ox, y + oy)));
  c.closePath();
}

// The jewel colours of the glass: deep, so a lit window is a colour and not a white patch.
export const JEWEL = {
  ruby: '#d83a68', rose: '#f0709c', sapphire: '#3a78e0', cobalt: '#2a52c0', amber: '#f0a030',
  amethyst: '#8c5ee8', violet: '#6a3ab8', emerald: '#1c9e86', gilt: '#ffd470',
};
// The window sets: every window draws from one, so a window has a mood of its own.
export const SETS = [
  ['ruby', 'gilt', 'sapphire'], ['sapphire', 'rose', 'gilt'], ['amethyst', 'amber', 'ruby'],
  ['emerald', 'gilt', 'sapphire'], ['amber', 'ruby', 'violet'], ['cobalt', 'amethyst', 'gilt'],
].map((s) => s.map((k) => JEWEL[k]));
export const LEAD = '#0a0618'; // the cames between panes
export const IVY = '#1f6a58'; // a deep green-teal: the ivy on the ledges (never the bullets' lime)
export const DAWN = '#ff9a8c'; // the dawn's light on an edge facing the sun
export const SUN_X = 1330; // where the sun stands in layer px: behind the west front

// A light on the layer (drawn every frame over the baked art, see parallax.js drawLights).
export const lamp = (out, x, y, r, color, mode, ph, a) => out.lights.push({ x, y, r, color, mode, ph, a });
// 1 if the sun is to the right of x, -1 if to the left: the way a shape's lit flank faces.
export const toward = (x) => (SUN_X >= x ? 1 : -1);
// The layer colour lifted k of the way to c.
export const tint = (L, c, k) => mix(L.color, c, k);

// Add the arc (cx, cy, r) from a0 to a1 to the current path as short straight steps: the same to the eye as a
// canvas arc, but its extent is the arc's own, which a test can read.
export function arcSteps(g, cx, cy, r, a0, a1, step = 0.07) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / step));
  for (let i = 0; i <= n; i++) g.lineTo(cx + Math.cos(a0 + ((a1 - a0) * i) / n) * r, cy + Math.sin(a0 + ((a1 - a0) * i) / n) * r);
}

// The pointed head of an arch, added from the left spring (x - hw, ys) over the apex to the right spring: two arcs of
// radius 2 * hw * k struck from the opposite springings (k 1 is the equilateral arch, more is a lancet). Returns the
// rise (spring to apex). The current point must be the left spring.
export function archTop(g, x, ys, hw, k = 1.15) {
  const r = 2 * hw * k;
  const rise = Math.sqrt(Math.max(0, r * r - (r - hw) ** 2));
  const a = Math.atan2(-rise, hw - r);
  arcSteps(g, x - hw + r, ys, r, Math.PI, a + TAU);
  arcSteps(g, x + hw - r, ys, r, Math.atan2(-rise, r - hw), 0);
  return rise;
}

// A rib of a vault springing from (x, ys) toward `dir` (1 right, -1 left): the first `frac` of the arch of half-span hw
// that would span it, added to the current path from the springing. Returns the angle swept.
export function ribArc(g, x, ys, hw, dir, frac, k = 0.62) {
  const r = 2 * hw * k;
  const sweep = Math.atan2(-riseOf(hw, k), hw - r) + TAU - Math.PI;
  if (dir > 0) arcSteps(g, x + r, ys, r, Math.PI, Math.PI + sweep * frac);
  else arcSteps(g, x - r, ys, r, 0, -sweep * frac);
  return sweep * frac;
}

// A pointed arch as a closed path: sides from the foot yb up to the springing ys, hw half the span.
export function archPath(g, x, yb, hw, ys, k = 1.15) {
  g.beginPath();
  g.moveTo(x - hw, yb);
  g.lineTo(x - hw, ys);
  archTop(g, x, ys, hw, k);
  g.lineTo(x + hw, yb);
  g.closePath();
}

// How high a pointed arch of half-span hw rises above its springing.
export const riseOf = (hw, k = 1.15) => Math.sqrt(Math.max(0, (2 * hw * k) ** 2 - (2 * hw * k - hw) ** 2));

// A lancet of the given total height h standing on y: its outline as a closed path, hw half the width.
export function lancetPath(g, x, y, hw, h, k = 1.15) {
  archPath(g, x, y, hw, y - h + riseOf(hw, k), k);
}

// A ragged top edge from x0 to x1 about y: points [x, y] stepping a few px each, never more than amp from y.
export function ragged(rng, x0, x1, y, amp, step = 9) {
  const pts = [];
  let v = 0;
  for (let x = x0; x < x1; x += step * (0.5 + rng())) {
    v = Math.max(-amp, Math.min(amp, v + (rng() - 0.5) * amp * 1.4));
    pts.push([x, y + v]);
  }
  pts.push([x1, y + (rng() - 0.5) * amp]);
  return pts;
}

// The dawn's light along the edge of a shape that faces the sun: inside the shape (just filled in `fill`, the layer colour by
// default the current fill), the rim colour, then the shape again moved d px away from the sun in the layer colour, so only
// a strip along the lit edge is left. build(g, ox, oy) adds the outline, moved by (ox, oy), to the current path.
export function rimLight(g, build, dir, d = 2.4, color = DAWN, a = 0.8, fill = g.fillStyle) {
  g.save();
  g.beginPath();
  build(g, 0, 0);
  g.clip();
  g.fillStyle = rgba(color, a);
  g.fill();
  g.fillStyle = fill;
  g.beginPath();
  build(g, -dir * d, d * 0.35);
  g.fill();
  g.restore();
}

// The pale light of the dawn sky lying on the upper part of a shape: build(g) adds the outline, box is [x0, y0, x1, y1].
export function wash(g, build, box, color = '#c8a0d8', a = 0.18) {
  const [x0, y0, x1, y1] = box;
  g.save();
  g.beginPath();
  build(g);
  g.clip();
  g.fillStyle = lin(g, 0, y0, 0, y1, [[0, rgba(color, a)], [1, rgba(color, 0)]]);
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.restore();
}

// The decoration that is not shape: courses of ashlar, pinnacles, ivy (parallax-glass-detail.js).
export { courses, pinnacle, ivy } from './parallax-glass-detail.js';
