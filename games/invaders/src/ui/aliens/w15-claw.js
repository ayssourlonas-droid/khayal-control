// World 15, Lantern Deep, the hermit crab's limbs (see w15-4.js): two heavy knobbed claws on armoured arms,
// one held high and wide open and the other lowered across the body and shut, and trading places on the
// next beat; and three jointed walking legs on each side that step in two groups, a tripod at a time.
import { path, ink, lin, rad, rgba, shade, line, ellipse, circle, INK } from './w15-kit-2.js';
import { barnacles } from './w15-kit-2.js';

// Where the arm meets a claw: the bottom of its palm, 9 px below the palm's centre in the claw's own frame.
const wrist = ([x, y], turn) => [x - Math.sin(turn) * 9, y + Math.cos(turn) * 9];

// One finger of a claw, pointing up from the hinge at the origin and curving in at the tip, its inner edge
// toothed; turned `ang` outward from shut. Drawn for the right-hand side; a mirror gives the left.
function finger(b, c, ang) {
  b.save();
  b.rotate(ang);
  b.beginPath();
  b.moveTo(10.6, 3);
  b.bezierCurveTo(15, -8, 11.4, -20, 2.6, -27);
  b.lineTo(3.4, -21.4);
  b.lineTo(5.4, -19.8);
  b.lineTo(4, -16.4);
  b.lineTo(5.8, -14.4);
  b.lineTo(4.2, -11);
  b.lineTo(5.2, -8);
  b.lineTo(2.2, -4.5);
  b.lineTo(0, 3);
  b.closePath();
  ink(b, lin(b, 0, 0, 14, 0, [[0, shade(c, -0.2)], [0.4, shade(c, 0.38)], [1, shade(c, -0.4)]]), 2.4);
  b.beginPath(); // a groove along the finger
  b.moveTo(8.4, 0);
  b.bezierCurveTo(12, -9, 8.8, -18, 4, -24);
  line(b, rgba(shade(c, -0.7), 0.55), 0.9);
  b.beginPath();
  b.moveTo(11.6, -3);
  b.bezierCurveTo(13.4, -10, 10.4, -18, 5.8, -23);
  line(b, rgba('#ffffff', 0.3), 0.8);
  b.restore();
}

// A claw with its palm at (x, y), pointing up, turned by `turn`, its fingers `open` radians apart each way:
// two fingers, then a big knobbed palm with ridges, tubercles and a colony of barnacles.
function claw(b, x, y, turn, open, c, seed) {
  b.save();
  b.translate(x, y);
  b.rotate(turn);
  b.save();
  b.scale(-1, 1);
  finger(b, c, open);
  b.restore();
  finger(b, c, open);
  ellipse(b, 0, 4, 11, 9.4);
  ink(b, rad(b, 0, 4, 2, 15, [[0, shade(c, 0.5)], [0.45, c], [1, shade(c, -0.6)]], -3.5, -0.5), 2.8);
  b.save();
  ellipse(b, 0, 4, 11, 9.4);
  b.clip();
  for (const [r, a0, a1] of [[8.2, 0.3, 2.85], [5.6, 0.5, 2.65], [10.4, 0.1, 3.0]]) { // growth ridges
    b.beginPath();
    b.ellipse(0, 4, r, r * 0.84, 0, a0, a1);
    line(b, rgba(shade(c, -0.7), 0.4), 0.9);
  }
  for (let i = 0; i < 6; i++) { // tubercles along the knuckle
    circle(b, -7.6 + i * 3, -3.4 + Math.abs(i - 2.5) * 0.7, 1.15);
    b.fillStyle = shade(c, 0.5);
    b.fill();
  }
  b.restore();
  barnacles(b, 3.6, 6.6, 1.8, 3, seed, 2.8);
  b.restore();
}

// An armoured arm from the shoulder s through the elbow e to the wrist w: a ringed tube, a knobbed elbow
// with three spines, a barnacle on the forearm.
function arm(b, s, e, w, c, seed) {
  b.beginPath();
  b.moveTo(...s);
  b.lineTo(...e);
  b.lineTo(...w);
  line(b, INK, 11);
  line(b, shade(c, -0.12), 8);
  b.beginPath();
  b.moveTo(s[0] - 0.8, s[1] - 1.8);
  b.lineTo(e[0] - 0.8, e[1] - 1.8);
  b.lineTo(w[0] - 0.8, w[1] - 1.2);
  line(b, rgba('#ffffff', 0.28), 1.4);
  for (const [a, k] of [[s, 0.35], [s, 0.7], [e, 0.4], [e, 0.75]]) { // armour rings
    const to = a === s ? e : w;
    const [x, y] = [a[0] + (to[0] - a[0]) * k, a[1] + (to[1] - a[1]) * k];
    const [dx, dy] = [to[1] - a[1], -(to[0] - a[0])];
    const n = 4.2 / Math.hypot(dx, dy);
    path(b, [[x - dx * n, y - dy * n], [x + dx * n, y + dy * n]], true);
    line(b, rgba(shade(c, -0.7), 0.55), 1);
  }
  circle(b, e[0], e[1], 5.2);
  ink(b, rad(b, e[0], e[1], 0.5, 6, [[0, shade(c, 0.5)], [0.5, c], [1, shade(c, -0.6)]], e[0] - 1.6, e[1] - 1.8), 2);
  const side = Math.sign(e[0]);
  for (const a of [-0.9, -0.2, 0.5]) {
    const [px, py] = [e[0] + Math.cos(a) * side * 5, e[1] + Math.sin(a) * 5];
    const [qx, qy] = [e[0] + Math.cos(a) * side * 8.4, e[1] + Math.sin(a) * 8.4];
    path(b, [[px - 1.4, py - 1.4], [qx, qy], [px + 1.4, py + 1.4]]);
    ink(b, shade(c, 0.35), 1);
  }
  barnacles(b, (e[0] + w[0]) / 2, (e[1] + w[1]) / 2, 1.5, 2, seed + 7, 1.4);
}

// Both claws for beat f: the left held high and open on beat 0, the right on beat 1; the other lowered, shut.
export function claws(b, f, c) {
  for (const m of [-1, 1]) {
    const high = (m < 0) === !f;
    const S = [m * 22, 14];
    if (high) {
      const P = [m * 27, -6];
      const turn = m * 0.06;
      arm(b, S, [m * 34, 11], wrist(P, turn), c, 3);
      claw(b, P[0], P[1], turn, 0.38, c, 4);
    } else {
      const P = [m * 27, 6];
      const turn = -m * 0.25;
      arm(b, S, [m * 34, 20], wrist(P, turn), c, 5);
      claw(b, P[0], P[1], turn, 0.07, c, 6);
    }
  }
}

// Three legs a side: out and up to a knee, down to a pointed foot, the group on the beat lifted.
export function legs(b, f, c) {
  for (const m of [-1, 1]) {
    for (let i = 2; i >= 0; i--) {
      const up = (i + (m < 0 ? 0 : 1)) % 2 === f ? 0 : 1;
      const base = [m * (11 + i * 7.5), 23 - i * 1.4];
      const knee = [m * (21 + i * 8.2), 27.2 - i * 1.8 - up * 3.2];
      const foot = [m * (25 + i * 7.4), 40.5 - i * 3.6 - up * 4.6];
      const col = shade(c, -0.22 - i * 0.05);
      b.beginPath();
      b.moveTo(...base);
      b.lineTo(...knee);
      line(b, INK, 5.8);
      b.beginPath();
      b.moveTo(...knee);
      b.lineTo(...foot);
      line(b, INK, 4.4);
      b.beginPath();
      b.moveTo(...base);
      b.lineTo(...knee);
      line(b, col, 3.8);
      b.beginPath();
      b.moveTo(...knee);
      b.lineTo(...foot);
      line(b, col, 2.5);
      b.beginPath();
      b.moveTo(base[0], base[1] - 1);
      b.lineTo(knee[0], knee[1] - 1);
      line(b, rgba('#ffffff', 0.3), 0.8);
      circle(b, knee[0], knee[1], 2.3); // the knee
      ink(b, shade(c, 0.1), 1.2);
      path(b, [[foot[0] - 1.4, foot[1] - 2.4], [foot[0] + m * 0.4, foot[1] + 2.6], [foot[0] + 1.4, foot[1] - 2.4]]);
      ink(b, shade(c, -0.55), 1);
    }
  }
}

