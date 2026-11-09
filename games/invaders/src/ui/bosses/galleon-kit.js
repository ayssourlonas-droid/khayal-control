// What the Thunder Galleon's painters share (World 13, Sunset Armada; bosses/galleon*.js): its woods, brass
// and canvas, a spline for the hull's curves, planking with butt joints and grain, rope that is laid up in
// strands, domed rivets and a ring of brass. What glows or is lettered is galleon-glass.js. Bake-time only:
// nothing here runs per frame.
import { line, lin, rad, rgba, shade, ellipse } from './kit.js';
import { circle } from '../aliens/kit.js';
import { hash } from '../sprites.js';

export { circle };

export const BRASS_L = '#f8dc8c'; // brass where the sun catches it
export const BRASS_D = '#5c3410'; // brass in shadow
export const TEAK_L = '#7c4c26';
export const TEAK_D = '#1c0e06';
export const IRON = '#302c3a';
export const IRON_L = '#6e6a80';
export const CANVAS = '#ecd8a6';
export const CANVAS_D = '#b8905a';
export const RED = '#bc3f2e';
export const RED_D = '#762220';
export const CREAM = '#f8eac4';
export const ROPE = '#dcba7c';
export const ROPE_D = '#5a3a1c';
export const WARM = '#ffcf6a'; // lamp and window light
export const FIRE = '#ff8a2a';
const INK_ROPE = '#1a0e06';

// The rail's height at x: it sweeps up toward the ends of the ship.
export const sheer = (x) => -24 - 8 * (x / 232) ** 2;

// A vertical run of metal: lit at the top, a dark foot.
export const metalV = (g, y0, y1, c) => lin(g, 0, y0, 0, y1, [[0, shade(c, 0.5)], [0.4, c], [0.75, shade(c, -0.3)], [1, shade(c, -0.6)]]);

// A rounded bar or pole across x: dark edge, a bright band left of centre, the colour, a dark edge.
export const roundX = (g, x0, x1, c) => lin(g, x0, 0, x1, 0, [[0, shade(c, -0.55)], [0.28, shade(c, 0.55)], [0.45, shade(c, 0.15)], [0.75, c], [1, shade(c, -0.6)]]);

// A Catmull-Rom spline through pts, continuing the current path (which stands at pts[0]).
export function spline(g, pts, closed = false) {
  const n = pts.length;
  const at = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
}

// A fresh path along that spline.
export function curve(g, pts, closed = true) {
  g.beginPath();
  g.moveTo(...pts[0]);
  spline(g, pts, closed);
  if (closed) g.closePath();
}

// Planks over the box x0..x1, y0..y1 (clip first): seams every `step` px with a lit lip, butt joints
// staggered row to row, grain flecks and the odd knot. `c` is the wood.
export function planks(g, x0, y0, x1, y1, c, seed = 1, step = 9) {
  g.fillStyle = lin(g, 0, y0, 0, y1, [[0, shade(c, 0.12)], [0.5, c], [1, shade(c, -0.3)]]);
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
  let row = 0;
  for (let y = y0; y < y1; y += step, row++) {
    g.fillStyle = rgba(hash(seed + row) < 0.5 ? '#ffffff' : '#000000', 0.05 + hash(seed * 3 + row) * 0.05);
    g.fillRect(x0, y, x1 - x0, step);
    g.beginPath();
    g.moveTo(x0, y + 0.5);
    g.lineTo(x1, y + 0.5);
    line(g, rgba(TEAK_D, 0.8), 1.3);
    g.beginPath();
    g.moveTo(x0, y + 1.9);
    g.lineTo(x1, y + 1.9);
    line(g, rgba('#ffffff', 0.12), 0.8);
    for (let x = x0 + hash(seed + row * 7) * 70; x < x1; x += 46 + hash(seed + row * 11 + x) * 50) { // butt joints
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x, y + step);
      line(g, rgba(TEAK_D, 0.7), 1.1);
    }
    for (let k = 0; k < (x1 - x0) / 26; k++) { // grain
      const gx = x0 + hash(seed * 5 + row * 13 + k) * (x1 - x0);
      g.beginPath();
      g.moveTo(gx, y + 3 + hash(row + k) * (step - 5));
      g.lineTo(gx + 8 + hash(k + seed) * 18, y + 3 + hash(row + k * 3) * (step - 5));
      line(g, rgba(TEAK_D, 0.22), 0.8);
    }
    if (hash(seed * 9 + row) < 0.18) { // a knot
      const kx = x0 + hash(seed + row * 17) * (x1 - x0);
      ellipse(g, kx, y + step / 2, 2.6, 1.7);
      g.fillStyle = rgba(TEAK_D, 0.55);
      g.fill();
    }
  }
}

// A domed rivet or stud: a dark ring, a dome lit from the upper left.
export function stud(g, x, y, r = 2.2, c = BRASS_L) {
  circle(g, x, y + 0.7, r + 0.5);
  g.fillStyle = rgba('#000000', 0.55);
  g.fill();
  circle(g, x, y, r);
  g.fillStyle = rad(g, x, y, 0, r, [[0, shade(c, 0.7)], [0.55, c], [1, shade(c, -0.5)]], x - r * 0.35, y - r * 0.35);
  g.fill();
}

export function studRow(g, x0, y0, x1, y1, n, r = 2.2, c = BRASS_L) {
  for (let i = 0; i < n; i++) stud(g, x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y0 + ((y1 - y0) * i) / Math.max(1, n - 1), r, c);
}

// A rope along pts (a polyline) or, given `sag`, hung between two points: dark under, light over, a
// dashed dark twist across it. Returns nothing; the path is left as it was drawn.
export function rope(g, pts, w = 2.4, sag = 0) {
  g.beginPath();
  g.moveTo(...pts[0]);
  if (sag) {
    const [a, b] = [pts[0], pts[pts.length - 1]];
    g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag, ...b);
  } else for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]);
  line(g, rgba('#0a0604', 0.7), w + 1.6);
  line(g, ROPE, w);
  line(g, rgba('#ffffff', 0.3), Math.max(0.5, w * 0.3));
  g.setLineDash([1.1, 2.1]);
  line(g, rgba(ROPE_D, 0.75), w * 0.9);
  g.setLineDash([]);
}

// A ring of brass round (x, y): a dark seat, the brass, a bright top.
export function ring(g, x, y, r, w = 3) {
  circle(g, x, y, r);
  line(g, rgba('#000000', 0.6), w + 1.6);
  line(g, BRASS_D, w);
  circle(g, x, y - 0.4, r);
  line(g, BRASS_L, Math.max(0.8, w * 0.55));
}
