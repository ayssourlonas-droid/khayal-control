// World 3, Twin Suns: wedge fighters of an occupying fleet, nose down at the player. Pale painted
// metal lit cold from the sky above and warm from the two setting suns below (a hot lower rim),
// panel lines, dark canopies with a glint, engines burning at the tail.
import { path, sym, ink, lin, rgba, shade, neon, eye, bloom, gloss, line, circle, ellipse, both, TAU } from './kit.js';

const SUN = '#ffb070';
const FLAME = '#ff9a4a';

// Painted metal: cool sky light on top, the colour, a warm bounce from the suns at the bottom.
const paint = (g, c, top, bot) => lin(g, 0, top, 0, bot, [
  [0, shade(c, 0.45)], [0.35, c], [0.8, shade(c, -0.35)], [1, shade(SUN, -0.35)],
]);

function rimBelow(b, pts) {
  path(b, pts, true);
  line(b, rgba(SUN, 0.75), 1.6);
}

function panels(b, segs, a = 0.35) {
  for (const s of segs) {
    path(b, s, true);
    line(b, rgba('#000000', a), 1.2);
  }
}

function canopy(b, x, y, rx, ry) {
  ellipse(b, x, y, rx, ry);
  ink(b, lin(b, 0, y - ry, 0, y + ry, [[0, '#0a0e18'], [0.6, '#24364a'], [1, '#0a0e18']]), 2);
  gloss(b, x - rx * 0.3, y - ry * 0.4, rx * 0.5, ry * 0.3, 0.7);
}

function engine(l, x, y, f, r = 3.2) {
  eye(l, x, y, r, FLAME, 2.6);
  bloom(l, x, y - 6 - f * 3, r * 3.5, FLAME, 0.35);
}

// A small delta, nose down, notched tail, two engines.
function grunt(b, l, f, c) {
  const body = sym([[0, 26], [9, 6], [23, -15], [17, -19], [6, -12], [0, -14]]);
  path(b, body);
  ink(b, paint(b, c, -19, 26));
  path(b, sym([[0, 22], [4, 4], [4, -12], [0, -13]]));
  b.fillStyle = rgba('#000000', 0.18);
  b.fill();
  panels(b, [[[-9, 6], [-14, -9]], [[9, 6], [14, -9]], [[-4, -2], [4, -2]]]);
  rimBelow(b, [[-23, -15], [-9, 6], [0, 26], [9, 6], [23, -15]]);
  canopy(b, 0, -4, 3.6, 6);
  both((s) => engine(l, s * 17, -18, f));
}

// A needle with forward-swept wings: long, thin and fast.
function diver(b, l, f, c) {
  const sweep = f ? 2 : 0;
  both((s) => {
    path(b, [[s * 3, -6], [s * 26, 12 + sweep], [s * 27, 7 + sweep], [s * 9, -16]]);
    ink(b, paint(b, c, -16, 14), 2.5);
    path(b, [[s * 16, 3 + sweep], [s * 25, 10 + sweep]], true);
    line(b, rgba('#ffffff', 0.7), 2);
  });
  path(b, sym([[0, 32], [4, 18], [5, -16], [3, -28], [0, -28]]));
  ink(b, paint(b, '#e8dccc', -28, 32), 2.5);
  path(b, sym([[0, 28], [2, 18], [2, 8]]));
  b.fillStyle = shade(c, -0.1);
  b.fill();
  canopy(b, 0, -6, 2.6, 6);
  rimBelow(b, [[-26, 12 + sweep], [-3, -6]]);
  rimBelow(b, [[26, 12 + sweep], [3, -6]]);
  engine(l, 0, -28, f, 3.6);
}

// A trident gunship: a swept crossbar wing whose tips carry two long cannons beside the nose.
function gunner(b, l, f, c) {
  both((s) => {
    path(b, [[s * 24, 30], [s * 24, 20]], true);
    line(b, '#141820', 3.4);
    b.beginPath();
    b.roundRect(s * 24 - 4, -8, 8, 29, 3);
    ink(b, paint(b, c, -8, 21), 2.5);
    rimBelow(b, [[s * 24 - 3, 20], [s * 24 + 3, 20]]);
    eye(l, s * 24, 30, f ? 2.2 : 1.3, '#ffe0a0', 2.4);
  });
  path(b, sym([[0, -13], [17, -10], [28, -4], [27, 1], [15, -1], [0, 0]]));
  ink(b, paint(b, c, -13, 1));
  path(b, sym([[0, 26], [5, 16], [6, -14], [3, -24], [0, -24]]));
  ink(b, paint(b, shade(c, 0.15), -24, 26));
  panels(b, [[[-15, -9], [-15, -1]], [[15, -9], [15, -1]], [[-4, 8], [4, 8]]]);
  rimBelow(b, [[-27, 1], [-15, -1], [0, 0], [15, -1], [27, 1]]);
  rimBelow(b, [[-5, 16], [0, 26], [5, 16]]);
  canopy(b, 0, -9, 3.2, 6);
  engine(l, 0, -24, f, 3.2);
  both((s) => engine(l, s * 24, -9, f, 2));
}

// A heavy arrowhead: broad and plated, a raised spine, two armoured engine blocks at its tail.
function armored(b, l, f, c) {
  both((s) => {
    b.beginPath();
    b.roundRect(s * 15 - 6, -29, 12, 13, 3);
    ink(b, paint(b, shade(c, -0.15), -29, -16), 2.5);
    engine(l, s * 15, -29, f, 2.6);
  });
  const hull = sym([[0, 27], [12, 14], [28, -2], [27, -11], [18, -19], [8, -23], [0, -23]]);
  path(b, hull);
  ink(b, paint(b, c, -23, 27), 3.2);
  path(b, sym([[0, 24], [6, 14], [7, -18], [0, -20]]));
  b.fillStyle = paint(b, shade(c, 0.2), -20, 24);
  b.fill();
  line(b, rgba('#000000', 0.4), 1.2);
  panels(b, [[[-12, 14], [-19, -2], [-27, -6]], [[12, 14], [19, -2], [27, -6]], [[-19, -2], [-11, -16]],
    [[19, -2], [11, -16]], [[-6, -6], [6, -6]]], 0.4);
  rimBelow(b, [[-28, -2], [-12, 14], [0, 27], [12, 14], [28, -2]]);
  b.fillStyle = '#0b1018';
  b.fillRect(-5, 6, 10, 3);
  path(l, [[-4, 7.5], [4, 7.5]], true);
  neon(l, '#8ad8ff', 1.4, f ? 1 : 0.6);
}

// A round cargo hauler: a ringed disc with turning vanes and a hot gold core.
function carrier(b, l, f, c) {
  circle(b, 0, 0, 24);
  ink(b, paint(b, c, -24, 24), 3);
  circle(b, 0, 0, 16);
  b.fillStyle = shade(c, -0.45);
  b.fill();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + f * 0.26;
    path(b, [[Math.cos(a) * 9, Math.sin(a) * 9], [Math.cos(a) * 21, Math.sin(a) * 21]], true);
    line(b, rgba('#000000', 0.5), 3);
  }
  rimBelow(b, [[-21, 11], [-11, 21], [0, 24], [11, 21], [21, 11]]);
  circle(b, 0, 0, 8);
  ink(b, '#2a1a06', 2);
  eye(l, 0, 0, 6, c, 3.4);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + Math.PI / 6;
    eye(l, Math.cos(a) * 20.5, Math.sin(a) * 20.5, 1.2, (i + f) % 2 ? '#ffffff' : c, 2);
  }
}

export default { rate: 2, halo: 0.12, grunt, diver, gunner, armored, carrier };
