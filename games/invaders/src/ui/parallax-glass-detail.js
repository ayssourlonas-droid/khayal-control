// The small decoration of Glass Cathedral's stonework (parallax-glass-kit.js re-exports it): courses of ashlar drawn faintly over a
// wall, pinnacles with crockets, and ivy hanging from a ledge. Plain strokes and fills in the current style, one path
// each, no state left behind.
import { rgba } from './sprites.js';
import { TAU } from '../core/math.js';

// Courses of ashlar in a box: faint lines every `step` px with staggered joints, all one stroke, clipped to the outline
// that `build(g)` adds to the path when it is given (so they stay on the wall and out of the sky).
export function courses(g, rng, x0, y0, x1, y1, a = 0.16, step = 9, build = null) {
  g.save();
  if (build) {
    g.beginPath();
    build(g, 0, 0);
    g.clip();
  }
  g.strokeStyle = rgba('#000000', a);
  g.lineWidth = 0.9;
  g.beginPath();
  for (let y = y0 + step; y < y1; y += step) {
    g.moveTo(x0, y);
    g.lineTo(x1, y);
    for (let x = x0 + rng() * 14; x < x1; x += 12 + rng() * 14) {
      g.moveTo(x, y);
      g.lineTo(x, y - step);
    }
  }
  g.stroke();
  g.restore();
}

// A pinnacle: a slim shaft with a crocketed spire, foot at (x, y), w wide, h tall in all; the crockets are small nubs up both edges
// of the spire. Filled in the current fill.
export function pinnacle(g, x, y, w, h) {
  const [hw, shaft] = [w / 2, h * 0.38];
  g.beginPath();
  g.moveTo(x - hw, y);
  g.lineTo(x - hw, y - shaft);
  g.lineTo(x - hw * 1.25, y - shaft);
  g.lineTo(x - hw * 0.12, y - h);
  g.lineTo(x + hw * 0.12, y - h);
  g.lineTo(x + hw * 1.25, y - shaft);
  g.lineTo(x + hw, y - shaft);
  g.lineTo(x + hw, y);
  g.closePath();
  g.fill();
  if (h < 36) return;
  g.beginPath();
  for (const s of [-1, 1]) {
    for (let k = 1; k <= 4; k++) {
      const u = k / 5.4;
      const [px, py] = [x + s * (hw * 1.25 - hw * 1.13 * u), y - shaft - (h - shaft) * u];
      g.moveTo(px, py + 1.6);
      g.lineTo(px + s * (2.6 - u), py - 0.6);
      g.lineTo(px, py - 2.2);
    }
  }
  g.fill();
}

// Ivy hanging from a ledge at y between x0 and x1: n strands, each a wavering line `len` px or less with small leaves along it, in
// colour c (the layer colour lifted toward a deep green-teal, dark: the ivy is a texture, not a feature).
export function ivy(g, rng, x0, x1, y, n, c, len = 36) {
  g.save();
  g.strokeStyle = c;
  g.fillStyle = c;
  g.lineWidth = 1.1;
  g.lineCap = 'round';
  const leaves = [];
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const [sx, l, sway] = [x0 + rng() * (x1 - x0), len * (0.4 + rng() * 0.9), (rng() - 0.5) * 9];
    g.moveTo(sx, y);
    for (let k = 1; k <= 4; k++) {
      const [px, py] = [sx + sway * Math.sin(k * 1.3 + i), y + (l * k) / 4];
      g.lineTo(px, py);
      leaves.push([px, py, rng() * 3]);
    }
  }
  g.stroke();
  g.beginPath();
  for (const [px, py, rot] of leaves) {
    g.moveTo(px + 4.1, py);
    g.ellipse(px + 1.7, py, 2.5, 1.5, rot, 0, TAU);
  }
  g.fill();
  g.restore();
}
