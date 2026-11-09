// Shapes shared by the painters of Starlit Archive's layers (parallax-archive.js, -hall.js, -2.js, -3.js).
// A silhouette is filled in the layer colour and then dressed in light: the galaxy's lilac on the right,
// shadow on the left, and fine rows of book spines over every shelf face, so a tower of stacks reads as a
// tower of books and not as a black cut-out. See parallax-shapes.js for the painter contract.
import { rgba, lin } from './sprites.js';
import { pick } from '../core/rng.js';

export const GOLD = '#ffd27a'; // lamplight
export const LILAC = '#9a90ff'; // what the galaxy lights a face with
export const NIGHT = '#02010e'; // the shadow it leaves
export const PARCH = '#efe0b4';
const SPINES = ['#3a2a7a', '#5a3a2a', '#7a5a2a', '#2a4a6a', '#6a2a3a', '#4a3a8a'];

export const poly = (g, pts) => {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
};

// Rows of book spines over the rect, clipped to the current path by the caller: a course every 7 px,
// each book 2 to 5 px wide, some leaning, a gap here and there. a is how plainly they show.
export function shelves(g, rng, x0, y0, w, h, a = 0.3) {
  for (let y = y0 + 3; y < y0 + h - 3; y += 7) {
    for (let x = x0 + rng() * 3; x < x0 + w; ) {
      const bw = 2 + rng() * 3;
      if (rng() > 0.1) {
        g.fillStyle = rgba(pick(rng, SPINES), a * (0.5 + rng() * 0.7));
        g.fillRect(x, y + rng() * 1.6, bw, 5.2 - rng() * 1.6);
      }
      x += bw + 0.4;
    }
    g.fillStyle = rgba(NIGHT, 0.5); // the board each course stands on
    g.fillRect(x0, y + 5.6, w, 1.4);
  }
}

// The shaded left and lit right of a shaft, over a path the caller has set as the clip.
export function faces(g, x0, y0, w, h, k = 1) {
  g.fillStyle = lin(g, x0, 0, x0 + w, 0, [[0, rgba(NIGHT, 0.45 * k)], [0.5, rgba(NIGHT, 0)], [0.82, rgba(LILAC, 0.08 * k)], [1, rgba(LILAC, 0.3 * k)]]);
  g.fillRect(x0, y0, w, h);
  g.fillStyle = lin(g, 0, y0, 0, y0 + h, [[0, rgba(LILAC, 0.12 * k)], [1, rgba(NIGHT, 0.3 * k)]]);
  g.fillRect(x0, y0, w, h);
}

// A pointed window, its sill at (x, y): warm glass brightest at the crown, a mullion and a transom.
// state 0 is an unlit one (a dark arch with a pale lip), 1 a lit one, 2 a lit one that also casts a glow
// on the layer's lights (spent sparingly: every light is a blit a frame).
export function casement(g, out, rng, x, y, w, h, color, mode = 'steady', state = 2) {
  const lit = state > 0;
  const arch = (k) => {
    g.beginPath();
    g.moveTo(x - w * k / 2, y);
    g.lineTo(x - w * k / 2, y - h * 0.62);
    g.quadraticCurveTo(x - w * k / 2, y - h * 0.9, x, y - h * (0.5 + 0.5 * k));
    g.quadraticCurveTo(x + w * k / 2, y - h * 0.9, x + w * k / 2, y - h * 0.62);
    g.lineTo(x + w * k / 2, y);
    g.closePath();
  };
  arch(1);
  g.fillStyle = lit ? lin(g, 0, y - h, 0, y, [[0, '#fff4cf'], [0.4, color], [1, rgba(color, 0.7)]]) : rgba(NIGHT, 0.85);
  g.fill();
  g.strokeStyle = lit ? rgba('#3a2208', 0.75) : rgba(LILAC, 0.2);
  g.lineWidth = Math.max(1, w * 0.1);
  g.beginPath();
  g.moveTo(x, y - h * 0.95);
  g.lineTo(x, y);
  g.moveTo(x - w / 2, y - h * 0.5);
  g.lineTo(x + w / 2, y - h * 0.5);
  g.stroke();
  if (state > 1) out.lights.push({ x, y: y - h * 0.45, r: Math.max(w, h) * 1.5, color, mode, ph: rng(), a: 0.8 });
}

// A little spire with crockets down its edges, its tip at (x, y - h).
export function pinnacle(g, x, y, w, h) {
  poly(g, [[x - w / 2, y], [x - w * 0.36, y - h * 0.55], [x, y - h], [x + w * 0.36, y - h * 0.55], [x + w / 2, y]]);
  g.fill();
  for (let i = 1; i < 4; i++) { // crockets: a nub on each edge
    const [u, d] = [i / 4, w * 0.5 * (1 - i / 4)];
    g.fillRect(x - d - 1.6, y - h * u * 0.85, 2.6, 2.6);
    g.fillRect(x + d - 1, y - h * u * 0.85, 2.6, 2.6);
  }
  g.beginPath();
  g.arc(x, y - h - 2, 1.8, 0, 6.3);
  g.fill();
}

// A spiral stair round the front of a tower: its outer edge as a run of treads, seen at the turn and
// edge-on in between, with a lit rim on the nearer ones. Tower x0..x1, climbing from y0 (low) to y1.
export function stairs(g, x0, x1, y0, y1, turns) {
  const [cx, hw] = [(x0 + x1) / 2, (x1 - x0) / 2];
  const n = Math.round(turns * 14);
  for (let i = 0; i < n; i++) {
    const a = (i / 14) * Math.PI * 2;
    const y = y0 + ((y1 - y0) * i) / n;
    if (Math.sin(a) < 0) continue; // the far side is behind the tower
    const x = cx + Math.cos(a) * hw;
    g.fillStyle = rgba(NIGHT, 0.55);
    g.fillRect(x - 5, y, 10, 3.6);
    g.fillStyle = rgba('#d8ccff', 0.4);
    g.fillRect(x - 5, y, 10, 1);
  }
}

// A flying arch from tower to tower: a deck with a rail and three arches under it, stroked so the
// sky shows through them.
export function span(g, xa, xb, y, rise = 30) {
  g.fillRect(xa, y, xb - xa, 5);
  g.fillRect(xa, y - 5, xb - xa, 1.4);
  const n = Math.max(2, Math.round((xb - xa) / 34));
  g.lineWidth = 3.4;
  g.strokeStyle = g.fillStyle;
  for (let i = 0; i < n; i++) {
    const [a, b] = [xa + ((xb - xa) * i) / n, xa + ((xb - xa) * (i + 1)) / n];
    g.beginPath();
    g.moveTo(a, y + 5 + rise);
    g.quadraticCurveTo((a + b) / 2, y - rise * 0.4, b, y + 5 + rise);
    g.stroke();
    g.fillRect(b - 2, y, 4, rise + 8);
  }
}

// A flying buttress from the wall at (x, y) out to a pier s (-1 or 1) of it: a stroked arch dropping to the
// pier's pinnacled head, the pier going down to the ground.
export function buttress(g, x, y, s, ground, run = 44, drop = 64) {
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(x + s * run * 0.7, y - 8, x + s * run, y + drop);
  g.lineWidth = 5;
  g.strokeStyle = g.fillStyle;
  g.stroke();
  g.fillRect(x + s * run - 4.5, y + drop, 9, ground - y - drop);
  pinnacle(g, x + s * run, y + drop, 9, 26);
}
