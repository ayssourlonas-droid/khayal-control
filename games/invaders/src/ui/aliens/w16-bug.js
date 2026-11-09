// World 16, Glass Cathedral, the rest of the beetle (see w16.js, its shell is w16-rose.js): two translucent
// wing-cases of lavender glass peeking out from behind the shell (they lie closed on beat 0 and flare open on
// beat 1), six stubby legs of lead that walk in two tripods (the left front, right middle and left rear on one
// beat, the others on the next), a small head of pale carved stone with two glass eyes, a forehead jewel and a
// pair of pincers, and two antennae that sway and end in glass beads.
import { pane, stoneFill, grain, star4, spark, circle, ellipse, ink, rad, rgba, mix, line, eye, LEAD, SHEEN, GOLD, AMBER, RUBY } from './w16-kit.js';

const LAV = '#d8c4ff';

// Wing-cases: each a long lens leaning outward behind the shell, with lead veins fanning from its root.
export function cases(b, l, f) {
  for (const m of [-1, 1]) {
    const [x, y, rot] = [m * (19 + f * 2.5), -26 - f * 1, m * (0.95 + f * 0.3)];
    const trace = (g) => ellipse(g, x, y, 7.6, 12.6, rot);
    pane(b, l, trace, LAV, [x, y, 10], 0.12, 1.9);
    b.save();
    trace(b);
    b.clip();
    b.translate(x, y);
    b.rotate(rot);
    for (const k of [-1, 0, 1]) { // veins from the root (the bottom) to the tip
      b.beginPath();
      b.moveTo(k * 1.5, 11);
      b.quadraticCurveTo(k * 6, 1, k * 3, -12);
      line(b, rgba(LEAD, 0.55), 0.9);
    }
    b.restore();
  }
}

const ROWS = [[7, 0.62], [-5, 0.08], [-17, -0.5]]; // where a leg leaves the shell, and its outward angle (down is positive)

// Legs: two segments of lead, thick at the root, a claw at the tip; side m, row r, tripod by the beat.
export function legs(b, f) {
  for (const m of [-1, 1]) {
    ROWS.forEach(([y, a0], r) => {
      const swing = (r + (m > 0 ? 1 : 0) + f) % 2 ? 0.34 : -0.22;
      const a1 = a0 + swing;
      const a2 = a1 + 0.95;
      const p1 = [m * (17 + Math.cos(a1) * 9), y + Math.sin(a1) * 9];
      const p2 = [p1[0] + m * Math.cos(a2) * 8, p1[1] + Math.sin(a2) * 8];
      for (const [w, col] of [[6.6, LEAD], [4.4, '#4a3d62'], [1.2, rgba(SHEEN, 0.7)]]) {
        b.beginPath();
        b.moveTo(m * 17, y);
        b.lineTo(p1[0], p1[1]);
        b.lineTo(p2[0], p2[1]);
        line(b, col, w);
      }
      circle(b, p1[0], p1[1], 2.5);
      b.fillStyle = '#7a6c96';
      b.fill();
    });
  }
}

// The head: pale stone, brow jewel, pincers and two glass eyes (hot on the lights).
export function head(b, l, f) {
  for (const m of [-1, 1]) { // pincers first, under the head
    b.beginPath();
    b.moveTo(m * 6, 32);
    b.quadraticCurveTo(m * 8, 39, m * 2.2, 41);
    line(b, LEAD, 4.8);
    line(b, '#7a6c96', 2.6);
  }
  b.beginPath();
  b.moveTo(-9.8, 15);
  b.bezierCurveTo(-13.4, 26, -8.4, 35.6, 0, 36);
  b.bezierCurveTo(8.4, 35.6, 13.4, 26, 9.8, 15);
  b.closePath();
  ink(b, stoneFill(b, -11, 15, 11, 36), 2.6);
  b.save();
  b.clip();
  grain(b, 30, 21, 0, 26, 10, 9, 0.28);
  b.restore();
  b.beginPath();
  b.moveTo(-8.6, 20.6);
  b.quadraticCurveTo(0, 25.4, 8.6, 20.6);
  line(b, rgba(LEAD, 0.6), 1.1);
  circle(b, 0, 23.2, 1.5);
  b.fillStyle = rad(b, 0, 23.2, 0, 1.6, [[0, '#ffd8e8'], [1, RUBY]]);
  b.fill();
  for (const m of [-1, 1]) {
    const [x, y] = [m * 5.6, 28.2];
    circle(b, x, y, 3.5);
    ink(b, rad(b, x, y, 0.2, 3.7, [[0, '#ffffff'], [0.4, AMBER], [1, mix(AMBER, '#5a1a00', 0.6)]], x - 0.9, y - 1), 1.5);
    star4(b, x - 1, y - 1.1, 2, '#ffffff', 0.85);
    eye(l, x, y, 1.6, GOLD, 2.4 + f * 0.8);
  }
}

// Antennae: from the head's front, out and down, a bead of glass at each tip; they sway between the beats.
export function antennae(b, l, f) {
  for (const m of [-1, 1]) {
    const tip = [m * (14 + f * 4.5), 39.5 + f * 0.8];
    b.beginPath();
    b.moveTo(m * 5.6, 33);
    b.quadraticCurveTo(m * (10 + f * 2), 38 - f, tip[0], tip[1]);
    line(b, LEAD, 3.3);
    line(b, '#7a6c96', 1.5);
    circle(b, tip[0], tip[1], 2.3);
    ink(b, rad(b, tip[0], tip[1], 0.2, 2.5, [[0, '#ffffff'], [0.4, GOLD], [1, mix(GOLD, '#7a2a00', 0.5)]], tip[0] - 0.7, tip[1] - 0.8), 1.2);
    spark(l, tip[0], tip[1], 1.2, GOLD, 0.7);
  }
}
