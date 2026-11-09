// World 14, Ember Carnival, the carrier's balloons, gift box and lantern (see w14-5.js): glossy prize balloons
// knotted and strung to a brass ring, a gift box in dotted paper with a gilt ribbon and bow swinging under
// them, and below it the paper lantern that carries the power-up and burns on every beat.
import { path, ink, lin, rad, rgba, shade, bloom, eye, gloss, line, ellipse, INK } from './w14-kit.js';
import { CREAM, RED, NAVY, GILT, HOT, giltH, giltV, glint, halo } from './w14-kit.js';

const LOAD = 0.8; // the gift and the lantern hang at this scale under the bunch

// One glossy balloon at (x, y), rx by ry, in colour col: a lit rubber skin, a rim of light underneath, a
// tied knot and a hot highlight.
export function balloon(b, x, y, rx, ry, col, tilt = 0) {
  b.save();
  b.translate(x, y);
  b.rotate(tilt);
  path(b, [[0, ry - 0.4], [-2.8, ry + 3.2], [2.8, ry + 3.2]]); // the knot
  ink(b, shade(col, -0.35), 1.5);
  ellipse(b, 0, 0, rx, ry);
  ink(b, rad(b, 0, 0, 1, Math.max(rx, ry) * 1.2, [[0, shade(col, 0.6)], [0.4, col], [1, shade(col, -0.6)]], -rx * 0.38, -ry * 0.4), 2.4);
  b.beginPath();
  b.ellipse(0, 0, rx - 1.4, ry - 1.4, 0, 0.35, 1.2);
  line(b, rgba(shade(col, 0.7), 0.55), 1.6);
  gloss(b, -rx * 0.42, -ry * 0.46, rx * 0.34, ry * 0.2, 0.85, -0.7);
  b.restore();
}

// The gift box hanging from the ring at (0, 3), swung by `swing`: dotted paper, a gilt ribbon cross and a bow.
export function gift(b, c, swing) {
  b.save();
  b.translate(0, 4);
  b.rotate(swing);
  b.scale(LOAD, LOAD);
  path(b, [[-12.4, 7], [12.4, 7], [12.4, 24], [-12.4, 24]]);
  ink(b, lin(b, -12.4, 0, 12.4, 0, [[0, shade(c, -0.1)], [0.3, shade(c, 0.45)], [0.6, c], [1, shade(c, -0.6)]]), 2.6);
  b.save();
  path(b, [[-12.4, 7], [12.4, 7], [12.4, 24], [-12.4, 24]]);
  b.clip();
  for (let i = 0; i < 9; i++) { // polka dots
    ellipse(b, -9.4 + (i % 3) * 8.8 + (Math.floor(i / 3) % 2) * 2.4, 11 + Math.floor(i / 3) * 5.8, 1.2, 1.2);
    b.fillStyle = rgba(CREAM, 0.85);
    b.fill();
  }
  b.fillStyle = lin(b, 0, 7, 0, 24, [[0, rgba('#ffffff', 0.18)], [1, rgba('#000000', 0.34)]]);
  b.fillRect(-13, 6, 26, 19);
  b.fillStyle = giltV(b, 7, 24); // the ribbon's two bands
  b.fillRect(-2.6, 6, 5.2, 19);
  b.fillRect(-13, 13.4, 26, 4.4);
  path(b, [[-2.6, 7], [-2.6, 24], [2.6, 7], [2.6, 24]], true);
  line(b, rgba(NAVY, 0.4), 0.7);
  b.restore();
  for (const m of [-1, 1]) { // the bow's two loops, each with its tail
    path(b, [[0, 7], [m * 4, 0.6], [m * 11, 1.4], [m * 10.6, 7.6], [m * 4, 8.8]]);
    ink(b, giltH(b, -11, 11), 1.8);
    path(b, [[m * 3.4, 3.6], [m * 8.4, 3.6]], true);
    line(b, rgba(NAVY, 0.4), 0.8);
  }
  ellipse(b, 0, 6.6, 2.8, 2.6);
  ink(b, rad(b, 0, 6.6, 0.3, 3, [[0, '#fff3c8'], [0.6, GILT], [1, shade(GILT, -0.6)]], -0.8, 5.8), 1.4);
  gloss(b, -7, 12, 3.4, 1.2, 0.4, -0.3);
  b.restore();
}

// The paper lantern under the box on a cord: ribbed red-and-gold paper round a flame, caps top and bottom, a
// tassel. The flame is hot on both beats and leans with the beat.
export function lantern(b, l, f, swing) {
  for (const g of [b, l]) {
    g.save();
    g.translate(0, 4);
    g.rotate(swing);
    g.scale(LOAD, LOAD);
  }
  path(b, [[0, 24], [0, 30]], true);
  line(b, INK, 2.8);
  line(b, GILT, 1.1);
  path(b, [[-4.4, 33], [4.4, 33], [3, 30], [-3, 30]]);
  ink(b, giltH(b, -4.4, 4.4), 1.4);
  ellipse(b, 0, 38.4, 8.8, 7.6);
  ink(b, rad(b, 0, 38.4, 1, 10, [[0, '#fff3c8'], [0.45, '#ffb04a'], [1, '#b8301c']], -1, 37), 2.2);
  b.save();
  ellipse(b, 0, 38.4, 8.8, 7.6);
  b.clip();
  for (const k of [-6, -2.4, 2.4, 6]) { // the ribs
    b.beginPath();
    b.moveTo(k * 0.6, 30);
    b.quadraticCurveTo(k * 1.8, 38.4, k * 0.6, 46.4);
    line(b, rgba('#5a1208', 0.55), 0.9);
  }
  b.restore();
  const flame = (k, col) => {
    b.beginPath();
    b.moveTo(-2.6 * k, 42);
    b.bezierCurveTo(-3.8 * k, 38.8, -1.6 * k, 36.4, (f ? 1.5 : -1.5) * k, 35.2 + (f ? 0 : 0.8));
    b.bezierCurveTo(2.6 * k, 37.6, 3.6 * k, 40, 2.6 * k, 42);
    b.closePath();
    b.fillStyle = col;
    b.fill();
  };
  flame(1, rgba('#ff8a2a', 0.95));
  flame(0.55, '#fff6d0');
  path(b, [[-3, 45.4], [3, 45.4], [2.2, 47], [-2.2, 47]]);
  ink(b, giltH(b, -3, 3), 1.2);
  for (const k of [-1.2, 0, 1.2]) { // the tassel
    path(b, [[k, 47], [k * 1.6 + (f ? 0.6 : -0.6), 50]], true);
    line(b, k ? GILT : RED, 1.1);
  }
  eye(l, 0, 38.8, 3, HOT, 3);
  bloom(l, 0, 38.4, 13, HOT, 0.6);
  halo(l, 0, 38.4, 7, 14, '#ffd27a', 0.4);
  glint(l, 0, 38.4, 4, '#fff6d0', 0.95);
  b.restore();
  l.restore();
}
