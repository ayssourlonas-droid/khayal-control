// What World 12's painters share (w12.js, w12-2.js, w12-3.js): the library's gold and paper, and the
// little marks of writing every guard of the stacks carries somewhere on it: a line of script, a rune.
import { path, rgba, line, INK } from './kit.js';
import { hash } from '../sprites.js';

export const GOLD = '#ffd27a'; // gilt, candle-flame and the glow of a spell
export const GILT = '#e8b84a'; // gold leaf in the light
export const PAPER = '#f2e6c8';
export const BRONZE = '#b98a42';

export function rrect(g, x, y, w, h, r) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

// A line of handwriting along y from x0 to x1: a wavering stroke broken into words, in the frame the
// painter is in (turn the context first to write along a slant).
export function script(g, x0, x1, y, color, w = 1, seed = 0) {
  g.beginPath();
  let pen = false;
  for (let x = x0, i = 0; x < x1; x += 1.7, i++) {
    const h = hash(seed * 131 + i);
    if (h > 0.9) { // a gap between words
      pen = false;
      x += 2.4;
      continue;
    }
    const yy = y + Math.sin(i * 2.1 + seed) * 0.9 + (h - 0.5) * 1.1;
    if (pen) g.lineTo(x, yy);
    else g.moveTo(x, yy);
    pen = true;
  }
  line(g, color, w);
}

const RUNES = [
  [[0, -1], [0, 1], [0.8, -0.3], [0, 0.2]],
  [[-0.7, -1], [0.7, 0], [-0.7, 1]],
  [[-0.7, -0.9], [0.7, -0.9], [-0.7, 0.9], [0.7, 0.9]],
  [[-0.8, 0.9], [0, -1], [0.8, 0.9], [-0.5, 0.1], [0.5, 0.1]],
];

// A letter-shape of kind k, s px high at (x, y): inked on the body so it reads on any sky, burning
// gold on the lights, a for how brightly.
export function rune(b, l, x, y, s, k, color = GOLD, a = 1) {
  const pts = RUNES[k % RUNES.length].map(([px, py]) => [x + px * s * 0.7, y + py * s]);
  path(b, pts, true);
  line(b, INK, 3.4);
  path(l, pts, true);
  line(l, rgba(color, 0.9 * a), 1.6);
  path(l, pts, true);
  line(l, rgba('#ffffff', 0.7 * a), 0.7);
}

// A curling wisp: a tapering curl from its root (x, y), w wide there, bowing sideways by `bend`, to its tip.
export function wisp(g, x, y, tx, ty, w, bend = 0) {
  const mx = (x + tx) / 2 + bend;
  const my = (y + ty) / 2;
  g.beginPath();
  g.moveTo(x - w, y);
  g.quadraticCurveTo(mx - w * 0.5, my, tx, ty);
  g.quadraticCurveTo(mx + w * 0.5, my, x + w, y);
  g.closePath();
}
