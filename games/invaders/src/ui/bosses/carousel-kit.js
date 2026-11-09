// What the Grand Carousel's painters share (World 14, Ember Carnival; bosses/carousel*.js): its gilding, the
// stripes of the canopy, marquee bulbs, carved scrolls, mirrors, tassels and the brass barley-twist of the
// poles. What glows is cyan (the world's one cool colour) on the weak points and warm bulb-white everywhere
// else. Bake-time only: nothing here runs per frame.
import { line, lin, rad, rgba, shade, ellipse, eye, bloom } from './kit.js';
import { circle } from '../aliens/kit.js';
import { TAU } from '../../core/math.js';

export { circle, TAU };

export const GILT_L = '#fff2b8'; // gilt where a bulb or the moon catches it
export const GILT = '#e8b23a'; // the boss palette's plate
export const GILT_D = '#8a5a14';
export const GILT_DD = '#3a2008';
export const STRIPE = '#d8306a'; // the canopy's magenta
export const STRIPE_D = '#7a1238';
export const CREAM = '#f6ead2';
export const CREAM_D = '#c4a888';
export const CYAN = '#5cf0ff';
export const BULB = '#ffe9a0';
export const INK = '#0a0c16';

// Gilt down y (bright on top, a deep foot) or across x (a bright band left of centre).
export const giltV = (g, y0, y1, c = GILT) => lin(g, 0, y0, 0, y1, [[0, shade(c, 0.6)], [0.3, shade(c, 0.28)], [0.55, c], [0.82, shade(c, -0.38)], [1, shade(c, -0.66)]]);
export const giltX = (g, x0, x1, c = GILT) => lin(g, x0, 0, x1, 0, [[0, shade(c, -0.55)], [0.26, shade(c, 0.62)], [0.44, shade(c, 0.2)], [0.74, c], [1, shade(c, -0.62)]]);

// A domed rivet or stud: a dark ring, a dome lit from the upper left.
export function stud(g, x, y, r = 2, c = GILT_L) {
  circle(g, x, y + 0.7, r + 0.5);
  g.fillStyle = rgba('#000000', 0.55);
  g.fill();
  circle(g, x, y, r);
  g.fillStyle = rad(g, x, y, 0, r, [[0, shade(c, 0.7)], [0.55, c], [1, shade(c, -0.5)]], x - r * 0.35, y - r * 0.35);
  g.fill();
}

// A marquee bulb: a brass socket and a glass dome in `c` on the body, its light on the lights layer at
// strength `a` (the live chase brightens it further; the baked light is its resting glow).
export function bulb(b, l, x, y, r = 3.2, c = BULB, a = 0.7) {
  circle(b, x, y + 0.6, r + 1.6);
  b.fillStyle = INK;
  b.fill();
  circle(b, x, y, r + 0.9);
  b.fillStyle = giltX(b, x - r, x + r, GILT_D);
  b.fill();
  circle(b, x, y, r);
  b.fillStyle = rad(b, x, y, 0, r, [[0, '#ffffff'], [0.45, shade(c, 0.55)], [1, c]], x - r * 0.3, y - r * 0.3);
  b.fill();
  if (l) {
    eye(l, x, y, r * 0.7, c, 2.6);
    bloom(l, x, y, r * 4.2, c, 0.2 * a);
  }
}

// A row of n bulbs between two points (the centre ones of an arc if `sag` bends it down).
export function bulbRow(b, l, x0, y0, x1, y1, n, r = 3, c = BULB, sag = 0) {
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0.5 : i / (n - 1);
    bulb(b, l, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 4 * u * (1 - u), r, c);
  }
}

// A volute, the curl of a carved scroll: a log spiral from (x, y) turning in toward its eye, `dir` 1 curling
// clockwise from the stem and -1 the other way, r its first radius. Ink under, deep gilt, bright gilt over.
export function volute(g, x, y, r, dir = 1, c = GILT, w = 3.6) {
  const pts = [];
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * TAU * 1.55;
    const k = Math.exp(-0.5 * a);
    pts.push([x + dir * Math.sin(a) * r * k, y - Math.cos(a) * r * k]);
  }
  for (const [lw, col] of [[w + 2.2, INK], [w, shade(c, -0.45)], [w * 0.55, shade(c, 0.35)]]) {
    g.beginPath();
    pts.forEach(([px, py], i) => g[i ? 'lineTo' : 'moveTo'](px, py));
    line(g, col, lw);
  }
  circle(g, pts.at(-1)[0], pts.at(-1)[1], w * 0.62);
  g.fillStyle = shade(c, 0.5);
  g.fill();
}

// A run of S-scrolls along a band from x0 to x1 at y, alternating their curl, `s` px between the eyes: the
// carved work of the rounding board and the frames.
export function scrollRow(g, x0, x1, y, s = 22, r = 8, c = GILT) {
  const n = Math.max(1, Math.floor((x1 - x0) / s));
  for (let i = 0; i < n; i++) {
    const x = x0 + (i + 0.5) * ((x1 - x0) / n);
    volute(g, x, y + (i % 2 ? -r * 0.4 : r * 0.4), r, i % 2 ? 1 : -1, c, 2.6);
  }
}

// A mirror in a gilt frame: x, y its top left. The glass reflects plum and magenta, with two pale diagonal
// glints; the frame is rounded, studded at its corners.
export function mirror(b, l, x, y, w, h, tilt = 0.5) {
  b.beginPath();
  b.roundRect(x - 3, y - 3, w + 6, h + 6, 4);
  b.fillStyle = INK;
  b.fill();
  b.beginPath();
  b.roundRect(x - 2, y - 2, w + 4, h + 4, 3);
  b.fillStyle = giltV(b, y, y + h);
  b.fill();
  b.save();
  b.beginPath();
  b.roundRect(x + 2, y + 2, w - 4, h - 4, 2);
  b.clip();
  b.fillStyle = lin(b, x, y, x + w, y + h, [[0, '#6a4a9a'], [0.5, '#2a1450'], [1, '#8a2a70']]);
  b.fillRect(x, y, w, h);
  for (const [u, k, a] of [[0.28, 0.12, 0.5], [0.58, 0.05, 0.3]]) {
    b.beginPath();
    b.moveTo(x + w * u + h * tilt, y);
    b.lineTo(x + w * (u + k) + h * tilt, y);
    b.lineTo(x + w * (u + k), y + h);
    b.lineTo(x + w * u, y + h);
    b.fillStyle = rgba('#ffffff', a * 0.5);
    b.fill();
  }
  b.restore();
  b.beginPath();
  b.roundRect(x + 2, y + 2, w - 4, h - 4, 2);
  line(b, rgba('#000000', 0.6), 1.2);
  for (const [px, py] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) stud(b, px, py, 1.7);
  if (l) {
    l.beginPath();
    l.moveTo(x + w * 0.28 + h * tilt, y + 3);
    l.lineTo(x + w * 0.28, y + h - 3);
    line(l, rgba('#e8d8ff', 0.28), 1.4);
  }
}

// A brass barley-twist pole from (x, y0) down to y1, w wide: a round shaft with a diagonal rope of twist along
// it, a bright band down its left, collars at both ends.
export function twist(g, x, y0, y1, w = 7, c = GILT) {
  g.beginPath();
  g.rect(x - w / 2 - 1.2, y0, w + 2.4, y1 - y0);
  g.fillStyle = INK;
  g.fill();
  g.fillStyle = giltX(g, x - w / 2, x + w / 2, c);
  g.fillRect(x - w / 2, y0, w, y1 - y0);
  g.save();
  g.beginPath();
  g.rect(x - w / 2, y0, w, y1 - y0);
  g.clip();
  g.beginPath();
  for (let y = y0 - w; y < y1; y += 5.5) {
    g.moveTo(x - w / 2 - 1, y + w * 0.8);
    g.lineTo(x + w / 2 + 1, y);
  }
  line(g, rgba(GILT_DD, 0.55), 1.3);
  g.beginPath();
  for (let y = y0 - w; y < y1; y += 5.5) {
    g.moveTo(x - w / 2 - 1, y + w * 0.8 + 1.5);
    g.lineTo(x + w / 2 + 1, y + 1.5);
  }
  line(g, rgba('#ffffff', 0.22), 0.9);
  g.restore();
  for (const y of [y0, y1]) {
    ellipse(g, x, y, w * 0.78, 2.6);
    g.fillStyle = giltX(g, x - w, x + w, c);
    g.fill();
    line(g, INK, 1.3);
  }
}

// A gold tassel hanging from (x, y): a cord, a ball, a skirt of threads swinging out to `len`.
export function tassel(g, x, y, len = 14, c = GILT) {
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x, y + len * 0.3);
  line(g, INK, 2.8);
  line(g, shade(c, 0.1), 1.2);
  circle(g, x, y + len * 0.42, len * 0.2);
  g.fillStyle = rad(g, x, y + len * 0.42, 0, len * 0.2, [[0, shade(c, 0.7)], [1, shade(c, -0.4)]], x - 1, y + len * 0.36);
  g.fill();
  line(g, INK, 1.2);
  g.beginPath();
  for (let i = -3; i <= 3; i++) {
    g.moveTo(x + i * 0.4, y + len * 0.6);
    g.lineTo(x + i * 1.9, y + len);
  }
  line(g, INK, 2.2);
  line(g, shade(c, 0.2), 0.9);
}
