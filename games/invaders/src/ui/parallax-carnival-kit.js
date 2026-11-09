// Shapes and colours shared by the painters of Ember Carnival's layers (parallax-carnival.js and the files it
// registers: -coaster, -lake, -mid, -wheel, -tents, -booths). A silhouette is filled in the layer colour and
// dressed in light: the fair burns below and the bursts burn above, so every shape is lit from beneath in warm
// gold and rimmed with magenta on top. See parallax-shapes.js for the painter contract.
import { rgba, lin, rad } from './sprites.js';
import { TAU } from '../core/math.js';
export { poly, flag, rope } from './parallax-armada-kit.js';

export const GOLD = '#ffc86a'; // a lamp, a bulb's halo
export const BULB = '#ffe9a0'; // the glass of a bulb
export const MAGENTA = '#ff3fa0';
export const MINT = '#4be08a';
export const VIOLET = '#a77bff';
export const CYAN = '#5cf0ff';
export const CORAL = '#ff6a3a';
export const NIGHT = '#0a0524'; // the shadow it leaves
export const PARTY = [MAGENTA, GOLD, MINT, VIOLET, CYAN]; // the colours bulbs, stripes and balloons come in

// The warm light of the fair on the underside of a shape: `build(g, ox, oy)` adds its outline to the path; the
// shape is then lit by a gradient from nothing at y0 to colour at alpha a at y1.
export function uplight(g, build, y0, y1, color = GOLD, a = 0.4) {
  g.save();
  g.beginPath();
  build(g, 0, 0);
  g.clip();
  g.fillStyle = lin(g, 0, y0, 0, y1, [[0, rgba(color, 0)], [1, rgba(color, a)]]);
  g.fillRect(-9000, y0, 18000, y1 - y0 + 9000);
  g.restore();
}

// One bulb at (x, y), r px: a bright glass with a dark ring. Given a mode it also puts a halo on the layer's
// lights ('blink' runs a chase if the phases are staggered; see parallax.js MODES).
export function bulb(g, out, x, y, r, color = BULB, mode = null, ph = 0, a = 0.75) {
  g.beginPath();
  g.arc(x, y, r + 0.9, 0, TAU);
  g.fillStyle = rgba(NIGHT, 0.85);
  g.fill();
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fillStyle = rad(g, x, y, 0, r, [[0, '#ffffff'], [0.55, color], [1, rgba(color, 0.9)]]);
  g.fill();
  if (mode) out.lights.push({ x, y, r: r * 4.6, color, mode, ph, a });
}

// n bulbs from (x0, y0) to (x1, y1) along a sagging line, their colours cycling through `colors`, a halo on
// every `every`th (chasing along the row when the mode is 'blink').
export function bulbRow(g, out, x0, y0, x1, y1, n, r, colors, { sag = 0, mode = 'blink', every = 1, ph = 0 } = {}) {
  for (let i = 0; i < n; i++) {
    const u = n > 1 ? i / (n - 1) : 0.5;
    const [x, y] = [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 4 * u * (1 - u)];
    bulb(g, out, x, y, r, colors[i % colors.length], i % every === 0 ? mode : null, (ph + i / n) % 1);
  }
}

// A smooth path through the points (a Catmull-Rom spline), sampled `n` steps between each pair: [[x, y], ...].
export function spline(pts, n = 10) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)]];
    for (let k = 0; k < n; k++) {
      const [t, t2] = [k / n, (k / n) ** 2];
      const t3 = t2 * (k / n);
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (p2[d] - p0[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  out.push(pts.at(-1));
  return out;
}

// A stroked polyline through [[x, y], ...].
export function trace(g, pts) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
}

// Where the far shore meets the lake (layer y of the far layer): the lake's painter and the flourishes that
// reflect the bursts in it share it.
export const SHORE = 300;
