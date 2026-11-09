// World 12, Starlit Archive, the last of the guard (see w12.js): the lantern moth that carries the
// power-ups, a brass-and-glass lantern for an abdomen with a flame burning in it, dusty wings netted
// with glowing teal veins and eyed in gold, a ball of fur for a thorax and feathered antennae.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, neon, INK } from './kit.js';
import { hash } from '../sprites.js';
import { GOLD, PAPER } from './w12-kit.js';

const BRASS = '#c8963a';

// A smooth closed shape through the control points: quadratic curves between the midpoints of the sides.
function smooth(g, pts) {
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const first = mid(pts[0], pts[1]);
  g.beginPath();
  g.moveTo(...first);
  for (let i = 1; i <= pts.length; i++) {
    const [p, q] = [pts[i % pts.length], pts[(i + 1) % pts.length]];
    const m = mid(p, q);
    g.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  }
  g.closePath();
}

// One wing, on side s: dusty, darker toward its margin, banded and dusted, veins of teal light running
// out from the root, an eye in gold with a ring of paper. `pts` outline it, `eyeAt` is where its eye sits.
function wing(b, l, s, pts, eyeAt, c, big) {
  const mirror = (list) => list.map(([x, y]) => [s * x * 0.9, y]); // the wing tips stop short of the sprite's edge
  const o = mirror(pts);
  smooth(b, o);
  ink(b, lin(b, s * 6, 0, s * 50, 0, [[0, shade(c, -0.55)], [0.7, shade(c, -0.78)], [1, shade(c, -0.86)]]), 2.8);
  b.save();
  smooth(b, o);
  b.clip();
  smooth(b, mirror(pts.map(([x, y]) => [6 + (x - 6) * 0.84, 4 + (y - 4) * 0.84]))); // a lighter band set in from the margin
  b.lineWidth = 3.4;
  b.strokeStyle = rgba(c, 0.26);
  b.stroke();
  for (let i = 0; i < 70; i++) { // the dust of its scales
    ellipse(b, s * (8 + hash(i * 3 + (big ? 0 : 400)) * 42), -38 + hash(i * 3 + 1) * 80, 0.7 + hash(i * 3 + 2), 0.7);
    b.fillStyle = rgba(i % 3 ? '#d8f4ec' : '#ffe9b0', 0.2);
    b.fill();
  }
  b.fillStyle = lin(b, 0, -30, 0, 36, [[0, rgba('#ffffff', 0.12)], [1, rgba('#000000', 0.25)]]);
  b.fillRect(s * 4, -42, s * 50, 90);
  b.restore();
  smooth(b, o); // fringe: a pale thread round the margin
  line(b, rgba(PAPER, 0.5), 1);
  const veins = o.slice(1, -1).flatMap(([x, y], i) => (i % 2 ? [] : [[x, y]]));
  l.beginPath();
  for (const [x, y] of veins) {
    l.moveTo(s * 7, o[0][1] + 3);
    l.quadraticCurveTo(s * 7 + (x - s * 7) * 0.55, (o[0][1] + y) / 2 - 7, x * 0.94 + s * 2, y * 0.94 + 1);
  }
  neon(l, c, 0.9, 0.8);
  if (eyeAt) { // the eye: a ring of paper, a ring of dark, gold, a pupil with a glint
    const [ex, ey] = [s * eyeAt[0] * 0.9, eyeAt[1]];
    for (const [r, fill] of [[7.4, PAPER], [5.6, '#1a1408'], [3.8, '#ffb040'], [1.7, '#2a1204']]) {
      ellipse(b, ex, ey, r, r);
      b.fillStyle = fill;
      b.fill();
    }
    ellipse(b, ex, ey, 7.4, 7.4);
    line(b, INK, 1.4);
    ellipse(l, ex, ey, 4.6, 4.6);
    line(l, rgba('#ffb040', 0.9), 2);
    eye(l, ex - 1.3, ey - 1.3, 0.8, '#ffffff', 2.6);
    bloom(l, ex, ey, 14, GOLD, 0.4);
  }
}

// A feathered antenna rising from the head toward s: a stalk with barbs combed off it, a spark at its tip.
function antenna(b, l, s, f, c) {
  const tipX = s * (15 + f * 2);
  b.beginPath();
  b.moveTo(s * 3, -18);
  b.quadraticCurveTo(s * 7, -31, tipX, -39);
  line(b, INK, 3.4);
  line(b, shade(PAPER, -0.1), 1.4);
  b.beginPath();
  for (let i = 1; i < 8; i++) { // barbs
    const u = i / 8;
    const x = (1 - u) * (1 - u) * s * 3 + 2 * (1 - u) * u * s * 7 + u * u * tipX;
    const y = (1 - u) * (1 - u) * -18 + 2 * (1 - u) * u * -31 + u * u * -39;
    b.moveTo(x, y);
    b.lineTo(x + 4.8 - u * 2, y - 3.4 + u);
    b.moveTo(x, y);
    b.lineTo(x - 4.8 + u * 2, y - 3.4 + u);
  }
  line(b, rgba(PAPER, 0.8), 0.9);
  eye(l, tipX, -39, 1.3, c, 3.4);
}

// A lantern moth: wings beating from raised to spread, the lantern swinging beneath, its flame leaning
// with the beat.
export function carrier(b, l, f, c) {
  const ty = f ? -6 : -36;
  const fore = [[6, -9], [22, ty * 0.5 - 14], [44, ty - 2], [51, ty + 14], [41, ty + 30], [25, ty + 36], [8, 5]];
  const hy = f ? 20 : 10;
  const hind = [[6, 2], [26, hy - 7], [39, hy + 4], [32, hy + 21], [14, hy + 17], [7, 9]];
  both((s) => wing(b, l, s, hind, null, c, false));
  both((s) => wing(b, l, s, fore, [33, ty + 15], c, true));
  both((s) => antenna(b, l, s, f, c));
  // the lantern: a cap, a globe with a cage of brass bars, a cup and a finial
  path(b, [[-5.4, 33], [5.4, 33], [3.6, 38.4], [-3.6, 38.4]]);
  ink(b, lin(b, -6, 0, 6, 0, [[0, shade(BRASS, 0.4)], [1, shade(BRASS, -0.5)]]), 2);
  ellipse(b, 0, 41, 2, 2.6);
  line(b, INK, 2.6);
  line(b, BRASS, 1.2);
  ellipse(b, 0, 22.4, 11.6, 11.6);
  ink(b, rad(b, 0, 24, 1, 13, [[0, '#ffe39a'], [0.55, '#eea83a'], [1, '#9a5a1c']]), 3);
  const flame = (g, k, a) => {
    g.beginPath();
    g.moveTo(0, 30);
    g.bezierCurveTo(-6 * k, 27, -4 * k, 20, f ? 2 : -2, 13.6 - k * 2);
    g.bezierCurveTo(4 * k, 20, 6 * k, 27, 0, 30);
    g.fillStyle = a;
    g.fill();
  };
  flame(b, 1, rgba('#ff9a2a', 0.9)); // the flame, leaning with the beat
  flame(b, 0.55, '#fff6d0');
  b.beginPath();
  b.ellipse(0, 22.4, 4.8, 11.6, 0, 0, Math.PI * 2);
  b.moveTo(0, 10.8);
  b.lineTo(0, 34);
  b.moveTo(-11.6, 22.4);
  b.lineTo(11.6, 22.4);
  line(b, rgba(BRASS, 0.9), 1.4);
  ellipse(b, 0, 22.4, 11.6, 11.6);
  line(b, INK, 1.6);
  gloss(b, -5.4, 15.4, 4.4, 2.4, 0.8, -0.6);
  path(b, [[-6.4, 6], [6.4, 6], [8.4, 12.4], [-8.4, 12.4]]); // the cap
  ink(b, lin(b, -8, 0, 8, 0, [[0, shade(BRASS, 0.5)], [0.5, BRASS], [1, shade(BRASS, -0.55)]]), 2.2);
  for (const x of [-3.6, 0, 3.6]) {
    ellipse(b, x, 9.4, 0.9, 1.2);
    b.fillStyle = INK;
    b.fill();
  }
  ellipse(b, 0, -2, 8.8, 9.6); // the thorax, fur
  ink(b, rad(b, -2, -5, 1, 12, [[0, '#f0e8d4'], [0.6, '#bcae92'], [1, '#6a604c']]), 2.6);
  b.save();
  ellipse(b, 0, -2, 8.8, 9.6);
  b.clip();
  for (let i = 0; i < 34; i++) { // tufts
    const a = hash(i) * 6.28;
    const r = 2 + hash(i + 50) * 7;
    const [x, y] = [Math.cos(a) * r, -2 + Math.sin(a) * r];
    path(b, [[x, y], [x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6 + 1]], true);
    line(b, rgba(i % 3 ? '#fff8e8' : '#4a402c', 0.5), 0.9);
  }
  b.restore();
  ellipse(b, 0, -15.6, 5.6, 5.2); // the head
  ink(b, rad(b, -1.5, -17, 0.5, 7, [[0, '#d8ccb0'], [1, '#6a604c']]), 2.2);
  both((s) => {
    ellipse(b, s * 3.2, -15.8, 2.7, 3.2);
    ink(b, '#06201c', 1.2);
    eye(l, s * 3.2, -15.8, 1.5, c, 3.6);
  });
  bloom(l, 0, 22.4, 25, GOLD, 0.5 + f * 0.1); // no wider: the sprite's edge is at 48
  bloom(l, 0, 22.4, 17, '#ffb040', 0.45);
  eye(l, f ? 1 : -1, 22, 2.2, '#fff6d0', 3);
  ellipse(l, 0, 22.4, 11.6, 11.6);
  line(l, rgba('#ffd27a', 0.6), 1.2);
  bloom(l, 0, -4, 34, c, 0.1);
}
