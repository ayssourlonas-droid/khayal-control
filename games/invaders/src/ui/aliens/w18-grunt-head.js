// The storm hornet's face (w18-grunt.js): a dark plate under an amber brow, two faceted compound eyes lit from within beneath
// slanting brow plates, amber cheeks, mandibles, the emitter barrel with a spark at its tip and the antennae with an electric
// bead each. Lights: the eyes, the spark and its bolt, the beads.
import { path, ink, lin, rad, rgba, shade, bloom, eye, line, ellipse, circle, both, INK, IRON, IRON_D, SPARK, FORGE, HOT, VOLT, rivets, glare, bolt, jag, metal } from './w18-kit.js';

const BLACK = '#1d1824';

export function head(b, l, f, c) {
  b.beginPath(); // the face plate
  b.moveTo(-9, 9);
  b.bezierCurveTo(-14, 14, -12, 22, -6.5, 28);
  b.lineTo(6.5, 28);
  b.bezierCurveTo(12, 22, 14, 14, 9, 9);
  b.closePath();
  ink(b, lin(b, -12, 9, 12, 28, [[0, '#4c4560'], [0.5, BLACK], [1, '#07060b']]), 2.8);
  b.beginPath(); // the brow ridge of amber armour above it
  b.moveTo(-9, 9.6);
  b.quadraticCurveTo(0, 13.5, 9, 9.6);
  b.lineTo(8, 13);
  b.quadraticCurveTo(0, 16.6, -8, 13);
  b.closePath();
  ink(b, lin(b, -9, 9, 9, 15, [[0, shade(c, 0.4)], [1, shade(c, -0.4)]]), 1.8);
  both((s) => {
    const [ex, ey] = [s * 8.3, 19];
    ellipse(b, ex, ey, 5.8, 7.8, s * -0.25); // the compound eye: dark red-brown glass with a faceted grid
    ink(b, rad(b, ex - s * 1.6, ey - 2.4, 0, 9, [[0, '#a8431c'], [0.55, '#4a1608'], [1, '#150608']]), 2.2);
    b.save();
    ellipse(b, ex, ey, 5.8, 7.8, s * -0.25);
    b.clip();
    for (let r = -2; r <= 3; r++) {
      for (let q = -2; q <= 2; q++) {
        circle(b, ex + q * 2.5 + (r & 1) * 1.25, ey + r * 2.9, 1.15);
        b.strokeStyle = rgba('#000000', 0.4);
        b.lineWidth = 0.7;
        b.stroke();
      }
    }
    b.restore();
    b.beginPath(); // the angry brow slanting down toward the middle
    b.moveTo(s * 13.8, 10.6);
    b.lineTo(s * 3.2, 17.6);
    b.lineTo(s * 3.6, 14.2);
    b.lineTo(s * 12.2, 8.4);
    b.closePath();
    ink(b, metal(b, 0, 8, 14, 18, IRON_D), 1.6);
    const [lx, ly] = [ex + s * 0.4, ey + 2.2];
    eye(l, lx, ly, 2, '#ffc23a', 3);
    bloom(l, lx, ly, 8.5, FORGE, f ? 0.3 : 0.46);
  });
  both((s) => { // amber cheek plates under the eyes
    path(b, [[s * 7.2, 25], [s * 11.2, 21.6], [s * 10.4, 27.4], [s * 6.8, 28.6]]);
    ink(b, lin(b, s * 7, 22, s * 11, 28, [[0, shade(c, 0.3)], [1, shade(c, -0.5)]]), 1.6);
  });
  both((s) => { // mandibles
    path(b, [[s * 3.4, 26], [s * 6, 32], [s * 3.4, 34.4], [s * 2, 28]]);
    ink(b, metal(b, 0, 26, 6, 34, IRON), 1.6);
  });
}

// The emitter barrel, its flare and the spark at its tip, and the antennae.
export function emitter(b, l, f) {
  b.beginPath();
  b.moveTo(-2.4, 26);
  b.lineTo(-3.4, 34);
  b.lineTo(3.4, 34);
  b.lineTo(2.4, 26);
  b.closePath();
  ink(b, lin(b, -3, 0, 3, 0, [[0, '#6a7694'], [0.4, '#c9d6f4'], [1, '#2c3348']]), 1.8);
  ellipse(b, 0, 34, 3.8, 1.6);
  ink(b, '#04050a', 1.4);
  rivets(b, -1.6, 29, 1.6, 29, 2, 0.7);
  const tip = f ? 1.6 : 2.6; // the spark swells and shrinks with the beat
  glare(l, 0, 35.4, tip, SPARK, 1);
  if (!f) bolt(l, jag(4, 0, 35, 5, 43, 3, 2.6), VOLT, 1, 0.9);
  else bolt(l, jag(9, 0, 35, -5, 42, 3, 2.6), VOLT, 1, 0.9);
  both((s) => {
    const sway = f ? 1.6 : 0;
    const pts = [[s * 5, 24], [s * (13 + sway), 32], [s * (21 + sway), 33 + sway]];
    path(b, pts, true);
    line(b, INK, 2.6);
    line(b, '#52455f', 1.3);
    circle(b, pts[2][0], pts[2][1], 1.5);
    b.fillStyle = HOT;
    b.fill();
    glare(l, pts[2][0], pts[2][1], f ? 1.2 : 0.8, VOLT, 0.8); // an electric bead on each antenna
  });
}

