// What lives on Lantern Deep's near reef (parallax-deep-reef.js), dark and low in the lower third where the
// ship and the enemy's bullets pass: anemones (a baked column and disc with stubs of tentacles; the long
// tentacles are marked as signs and swayed in flourish-deep-sway.js), tube worms in bunches (tubes baked, a
// crown marked for each that draws in now and then, a faint pulse of teal or violet among the lights), tufts
// of sea grass (signs only), sponge tubes, sea urchins and small rocks. Every light here is cool, small and
// dim. See parallax-shapes.js for the painter contract.
import { rgba, mix } from './sprites.js';
import { TAU } from '../core/math.js';
import { lump, fur, lit, dot, tint, TEAL, VIOLET, ROSE, ORCHID, STONE } from './parallax-deep-kit-2.js';

const ANEMONE_HUES = [VIOLET, ROSE, TEAL]; // the palette each anemone's index k picks (flourish-deep-sway-sprites.js TENT_COLORS)
const ANEMONE_GLOW = [VIOLET, ORCHID, TEAL]; // and the cool light it gives off, never a warm one this low
const WORM_HUES = [TEAL, VIOLET, '#7af0b8'];

// An anemone of disc radius r on the bed at (x, fy): a squat column, its disc rimmed with stubs of tentacles.
// n long tentacles are marked for the flourish to sway.
export function anemone(g, out, rng, L, x, fy, r, k) {
  const hue = ANEMONE_HUES[k];
  const [top, neck] = [fy - r * 0.9, r * 0.55];
  g.fillStyle = tint(L, hue, 0.18);
  g.beginPath();
  g.moveTo(x - r * 0.62, fy + 2);
  g.quadraticCurveTo(x - neck, fy - r * 0.45, x - r * 0.85, top);
  g.lineTo(x + r * 0.85, top);
  g.quadraticCurveTo(x + neck, fy - r * 0.45, x + r * 0.62, fy + 2);
  g.closePath();
  g.fill();
  g.strokeStyle = rgba(hue, 0.16); // the column's ribs
  g.lineWidth = 1;
  g.beginPath();
  for (let i = -2; i <= 2; i++) {
    g.moveTo(x + i * r * 0.13, fy);
    g.lineTo(x + i * r * 0.28, top + 4);
  }
  g.stroke();
  g.fillStyle = tint(L, hue, 0.3); // the oral disc and a dark mouth
  g.beginPath();
  g.ellipse(x, top, r * 0.95, r * 0.2, 0, 0, TAU);
  g.fill();
  g.fillStyle = rgba('#000000', 0.55);
  g.beginPath();
  g.ellipse(x, top, r * 0.2, r * 0.07, 0, 0, TAU);
  g.fill();
  g.save(); // stubs round the rim
  g.lineCap = 'round';
  g.lineWidth = 2.2;
  g.strokeStyle = rgba(hue, 0.5);
  g.beginPath();
  for (let i = 0; i < 16; i++) {
    const u = (i / 15 - 0.5) * 2 * r * 0.9;
    g.moveTo(x + u, top);
    g.quadraticCurveTo(x + u * 1.15, top - 8, x + u * 1.25 + (rng() - 0.5) * 4, top - 12 - rng() * 6);
  }
  g.stroke();
  g.restore();
  out.signs.push({ anemone: true, x, y: top, r, n: 5, k, ph: rng() * TAU });
  out.lights.push({ x, y: top - 4, r: r * 0.7, color: ANEMONE_GLOW[k], mode: 'pulse', ph: rng(), a: 0.2 });
}

// A bunch of n tube worms on the bed at x, spread over `spread` px: slim tubes of different heights and lean,
// each with a lit rim on one side and an open mouth; a crown is marked at every mouth. One light for the bunch.
export function worms(g, out, rng, L, x, fy, n, spread, k) {
  const hue = WORM_HUES[k];
  let high = fy;
  for (let i = 0; i < n; i++) {
    const bx = x + (n > 1 ? i / (n - 1) - 0.5 : 0) * spread + (rng() - 0.5) * 6;
    const [h, w, lean] = [42 + rng() * 38, 6.4 + rng() * 2.6, (rng() - 0.5) * 14];
    const [tx, ty] = [bx + lean, fy - h];
    g.fillStyle = tint(L, hue, 0.14);
    g.beginPath();
    g.moveTo(bx - w, fy + 2);
    g.quadraticCurveTo(bx - w * 0.9 + lean * 0.3, fy - h * 0.5, tx - w * 0.78, ty);
    g.lineTo(tx + w * 0.78, ty);
    g.quadraticCurveTo(bx + w * 0.9 + lean * 0.3, fy - h * 0.5, bx + w, fy + 2);
    g.closePath();
    g.fill();
    g.strokeStyle = rgba(hue, 0.3); // the lit rim on its left, and rings round the tube
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(bx - w * 0.9, fy);
    g.quadraticCurveTo(bx - w * 0.8 + lean * 0.3, fy - h * 0.5, tx - w * 0.7, ty + 1);
    for (let y = 8; y < h - 4; y += 9) {
      g.moveTo(bx + lean * (y / h) - w * 0.7, fy - y);
      g.lineTo(bx + lean * (y / h) + w * 0.7, fy - y);
    }
    g.stroke();
    g.fillStyle = rgba('#000000', 0.6);
    g.beginPath();
    g.ellipse(tx, ty, w * 0.78, 1.8, 0, 0, TAU);
    g.fill();
    out.signs.push({ worm: true, x: tx, y: ty + 1, s: 0.95 + rng() * 0.35, k, ph: rng() });
    high = Math.min(high, ty);
  }
  out.lights.push({ x, y: high - 4, r: 22, color: hue, mode: 'pulse', ph: rng(), a: 0.3 });
}

// A cluster of sponge tubes at x: n open-mouthed cylinders widening to the top, dusky orchid or rose.
export function sponges(g, rng, L, x, fy, n, color = ORCHID) {
  for (let i = 0; i < n; i++) {
    const bx = x + (i - (n - 1) / 2) * 15 + (rng() - 0.5) * 6;
    const [h, w] = [28 + rng() * 28, 6 + rng() * 2.4];
    g.fillStyle = tint(L, color, 0.17);
    g.beginPath();
    g.moveTo(bx - w * 0.8, fy + 2);
    g.lineTo(bx - w * 1.15, fy - h);
    g.lineTo(bx + w * 1.15, fy - h);
    g.lineTo(bx + w * 0.8, fy + 2);
    g.closePath();
    g.fill();
    g.fillStyle = rgba('#000000', 0.6); // its hollow mouth
    g.beginPath();
    g.ellipse(bx, fy - h, w * 1.1, 2.2, 0, 0, TAU);
    g.fill();
    g.strokeStyle = rgba(color, 0.22);
    g.lineWidth = 1;
    g.beginPath();
    g.ellipse(bx, fy - h, w * 1.15, 2.4, 0, Math.PI, TAU);
    g.stroke();
  }
}

// A sea urchin at (x, fy): a dark ball bristling with spines, a few tipped with violet.
export function urchin(g, rng, L, x, fy, r) {
  const cy = fy - r;
  g.save();
  g.lineCap = 'round';
  g.lineWidth = 1.2;
  g.strokeStyle = tint(L, VIOLET, 0.3);
  g.beginPath();
  for (let i = 0; i < 26; i++) {
    const a = Math.PI + (i / 25) * Math.PI + (rng() - 0.5) * 0.12;
    const l = r * (1.5 + rng() * 0.8);
    g.moveTo(x + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6);
    g.lineTo(x + Math.cos(a) * l, cy + Math.sin(a) * l);
  }
  g.stroke();
  g.restore();
  g.fillStyle = L.color;
  g.beginPath();
  g.arc(x, cy, r, 0, TAU);
  g.fill();
  lit(g, x, cy, r, r, VIOLET, 0.3);
  dot(g, x + r * 0.2, cy - r * 0.2, 0.9, VIOLET, 0.5);
}

// Sea grass: only signs, the tufts are drawn by the flourish (k picks the green or the blue). h px tall.
export function grass(out, rng, x, fy, h, k) {
  out.signs.push({ grass: true, x, y: fy + 1, h, k, ph: rng() * TAU });
}

// A small rock on the bed, furred.
export function rock(g, rng, L, x, fy, r) {
  g.fillStyle = L.color;
  lump(g, rng, x, fy - r * 0.35, r, r * 0.6, 0.25, 8);
  g.fill();
  lit(g, x, fy - r * 0.35, r, r * 0.6, L.rim, 0.2);
  fur(g, rng, x, fy - r * 0.35, r, r * 0.6, 8, 8, mix('#0a3a3a', STONE, 0.1), 0.7);
}
