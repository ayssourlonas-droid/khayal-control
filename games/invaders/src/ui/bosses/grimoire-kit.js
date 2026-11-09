// What the Grand Grimoire's painters share (World 12, Starlit Archive; bosses/grimoire*.js): its golds and
// the parchment, a hand of script scribbled along a line, the outline of a page block, and gilt trim.
// Bake-time only: nothing here runs per frame.
import { ink, line, lin, rad, rgba, shade, ellipse, TAU } from './kit.js';
import { hash } from '../sprites.js';

export const GOLD = '#e8c062';
export const GILT = '#fbe39a'; // gold where the light catches it
export const GOLD_D = '#7a4c14'; // gold in shadow, and the dark thread under gilt
export const PARCH = '#efe0b4';
export const INK_B = '#3a2410'; // the script's ink on the parchment
export const AMBER = '#ffb23a'; // the crown's gems: warm, so teal stays the colour of what can be shot

// A bar of metal across y0..y1: lit at the top, a dark foot.
export const metal = (g, y0, y1, base = GOLD) => lin(g, 0, y0, 0, y1, [[0, shade(base, 0.55)], [0.35, base], [0.7, shade(base, -0.3)], [1, shade(base, -0.62)]]);

// Gilt along the current path: a dark thread under a gold one with a bright thread on it.
export function gilt(g, w = 2, a = 1) {
  line(g, rgba(GOLD_D, 0.9 * a), w + 1.6);
  line(g, rgba(GOLD, a), w);
  line(g, rgba(GILT, 0.85 * a), Math.max(0.6, w * 0.38));
}

// A domed stud: an ink ring, a dome lit from the upper left.
export function stud(b, x, y, r, base = GOLD) {
  ellipse(b, x, y + 0.6, r, r);
  ink(b, rad(b, x, y, 0, r, [[0, shade(base, 0.8)], [0.5, base], [1, shade(base, -0.6)]], x - r * 0.35, y - r * 0.35), 1.4);
}

// A stamped quatrefoil of gold leaf, r across.
export function fleuron(g, x, y, r) {
  for (let i = 0; i < 4; i++) {
    const a = (i * TAU) / 4;
    ellipse(g, x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, r * 0.5, r * 0.26, a);
    g.fillStyle = rgba(GOLD, 0.8);
    g.fill();
  }
  ellipse(g, x, y, r * 0.2, r * 0.2);
  g.fillStyle = GILT;
  g.fill();
}

// A spiral scroll about (x, y), r wide at its outer end and turning `dir` (1 | -1), added to the path.
export function curl(g, x, y, r, dir = 1, turns = 1.4) {
  for (let i = 0; i <= 26; i++) {
    const u = i / 26;
    const a = u * turns * TAU * dir;
    const rr = r * (1 - 0.84 * u);
    const [px, py] = [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
    if (i) g.lineTo(px, py);
    else g.moveTo(px, py);
  }
}

// The outline of a page block in its own frame, the left one (the right is its mirror): 250 x 230,
// the gutter edge at +x, the top rising to a crown and falling away to the fore-edge, the foot bowed.
export function leaf(g) {
  g.beginPath();
  g.moveTo(122, -92);
  g.bezierCurveTo(80, -100, 24, -119, -42, -117);
  g.bezierCurveTo(-88, -115, -116, -106, -127, -90);
  g.bezierCurveTo(-130, -40, -129, 40, -127, 98);
  g.bezierCurveTo(-80, 112, 50, 110, 122, 98);
  g.closePath();
}

// Where the script lies on a page, in the page's frame: a baseline and the two ends of each ruled line.
// A running head, then two blocks of text round the diagram, the drop cap holding the first three lines
// of the upper one in.
export const LINES = [-95, -76, -64, -52, -40, -28, 42, 54, 66, 78, 90].map((y, i) => ({
  y, x0: i === 0 ? -50 : i < 4 ? -62 : -100, x1: i === 0 ? 46 : 98 - (i === 5 || i === 10 ? 38 + hash(i + 40) * 40 : hash(i + 40) * 16),
}));

// A run of hand-written script along y from x0 to x1, `size` high, added to the current path: strokes
// that arch, loop, climb and dip in no language, with a gap between words.
export function script(g, x0, x1, y, size, seed) {
  g.moveTo(x0, y);
  for (let x = x0, i = 0; x < x1; i++) {
    const h = hash(seed * 97 + i);
    const dx = size * (0.45 + hash(seed * 31 + i) * 0.5);
    if (h < 0.13) {
      x += size * (1.1 + hash(seed + i) * 1.4);
      g.moveTo(Math.min(x, x1), y);
      continue;
    }
    if (h < 0.3) {
      g.lineTo(x + dx * 0.3, y - size * 1.5);
      g.lineTo(x + dx, y);
    } else if (h < 0.42) g.quadraticCurveTo(x + dx * 0.5, y + size * 1.1, x + dx, y - size * 0.1);
    else if (h < 0.55) g.bezierCurveTo(x + dx * 1.5, y - size * 1.1, x - dx * 0.3, y - size * 1.1, x + dx, y);
    else g.quadraticCurveTo(x + dx * 0.5, y - size * 0.75, x + dx, y);
    x += dx;
  }
}

// The k-th ruled line of a page as a fresh path on g (stroke it).
export function scriptPath(g, k) {
  const { y, x0, x1 } = LINES[k];
  g.beginPath();
  script(g, x0, x1, y, 3.1, k + 1);
}

// The page diagram's centre and radius: rings, a seven-pointed star, ticks round the rim.
export const SIGIL = { x: 6, y: 7, r: 25 };

export function sigil(g) {
  const { x, y, r } = SIGIL;
  g.beginPath();
  for (const k of [1, 0.82]) {
    g.moveTo(x + r * k, y);
    g.arc(x, y, r * k, 0, TAU);
  }
  for (let i = 0; i <= 7; i++) {
    const a = (i * 3 * TAU) / 7 - Math.PI / 2;
    const [px, py] = [x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78];
    if (i) g.lineTo(px, py);
    else g.moveTo(px, py);
  }
  for (let i = 0; i < 36; i++) {
    const a = (i * TAU) / 36;
    g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    g.lineTo(x + Math.cos(a) * (r + (i % 3 ? 2 : 4)), y + Math.sin(a) * (r + (i % 3 ? 2 : 4)));
  }
}

