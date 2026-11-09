// Gothic shapes shared by the painters of Hollow Night's castle and dead wood (parallax-gothic.js and
// -2.js): pointed windows that glow, roofs and parapets.
import { rgba } from './sprites.js';
import { pick } from '../core/rng.js';

const MODES = ['steady', 'flicker', 'pulse', 'flicker'];

// A pointed (lancet) arch with its sill at (x, y), w wide and h tall.
export function lancet(g, x, y, w, h) {
  g.beginPath();
  g.moveTo(x - w / 2, y);
  g.lineTo(x - w / 2, y - h * 0.6);
  g.quadraticCurveTo(x - w / 2, y - h * 0.9, x, y - h);
  g.quadraticCurveTo(x + w / 2, y - h * 0.9, x + w / 2, y - h * 0.6);
  g.lineTo(x + w / 2, y);
  g.closePath();
}

// A lit window: the pane, a dark mullion and transom, and a glow on the layer's lights.
export function pane(g, out, rng, x, y, w, h, color, mode = null) {
  const { a, b, c, d, e, f } = g.getTransform(); // the light goes on the layer, in whatever frame the pane is drawn
  const [lx, ly] = [x, y - h * 0.45];
  g.save();
  lancet(g, x, y, w, h);
  g.fillStyle = rgba(color, 0.92);
  g.fill();
  g.strokeStyle = rgba('#0a0412', 0.85);
  g.lineWidth = Math.max(1, w * 0.14);
  g.beginPath();
  g.moveTo(x, y - h);
  g.lineTo(x, y);
  g.moveTo(x - w / 2, y - h * 0.5);
  g.lineTo(x + w / 2, y - h * 0.5);
  g.stroke();
  g.restore();
  out.lights.push({ x: a * lx + c * ly + e, y: b * lx + d * ly + f, r: Math.max(w, h) * 1.3, color, mode: mode ?? pick(rng, MODES), ph: rng(), a: 0.9 });
}

// A cone of roof with sagging sides, flared eaves and a finial: the tip is at (x, y - h).
export function spire(g, x, y, w, h, flare = 7) {
  g.beginPath();
  g.moveTo(x - w / 2 - flare, y + 2);
  g.quadraticCurveTo(x - w * 0.5, y - h * 0.12, x - w * 0.16, y - h * 0.5);
  g.quadraticCurveTo(x - w * 0.05, y - h * 0.82, x, y - h);
  g.quadraticCurveTo(x + w * 0.05, y - h * 0.82, x + w * 0.16, y - h * 0.5);
  g.quadraticCurveTo(x + w * 0.5, y - h * 0.12, x + w / 2 + flare, y + 2);
  g.closePath();
  g.fill();
  g.fillRect(x - 1, y - h - 16, 2, 18); // the finial: a rod, a ball and a tip
  g.beginPath();
  g.arc(x, y - h - 10, 3.2, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.moveTo(x - 1.6, y - h - 12);
  g.lineTo(x, y - h - 24);
  g.lineTo(x + 1.6, y - h - 12);
  g.fill();
}

// Merlons along a parapet at y, from x0 to x1.
export function merlons(g, x0, x1, y, mh = 11, step = 13) {
  for (let x = x0; x < x1 - step * 0.5; x += step * 1.7) g.fillRect(x, y - mh, step, mh);
}
