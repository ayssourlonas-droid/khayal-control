// World 11, Aurora Kingdom: the kingdom's guard. A frost spirit, a wisp of cold with a glowing heart
// and frost shedding from its tail, and a snow owl diving talons first, white wings spread and golden
// eyes burning; the crystal and the ice golem are in w11-2.js, the narwhal in w11-3.js. Everything that
// glows (hearts, eyes, crystal cores, the narwhal's horn) is on the lights layer. Sprites face down,
// toward the ship.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { FROST, kite } from './w11-kit.js';
import { gunner, armored } from './w11-2.js';
import { carrier } from './w11-3.js';

// A frost spirit: a teardrop of cold light with a crown of ice, two dark eyes, a heart burning white
// in its chest, ferns of frost drawn on its skin; its tail flicks side to side and sheds shards.
function grunt(b, l, f, c) {
  const s = f ? 1 : -1;
  for (let i = 0; i < 5; i++) kite(b, s * (6 - i * 2.2) + (i % 2 ? 4 : -4), 33 + i * 4.6, 4.4 - i * 0.6, 8 - i, rgba(c, 0.85 - i * 0.14), s * 0.3, 1.1);
  both((m) => { // wisps of arm, curling up on one beat and down on the other
    const up = f ? -9 : 7;
    b.beginPath();
    b.moveTo(m * 15, -2);
    b.quadraticCurveTo(m * 32, up - 2, m * 29, up + 11);
    b.quadraticCurveTo(m * 24, up + 4, m * 14, 6);
    ink(b, rgba(shade(c, 0.1), 0.78), 2.2);
  });
  b.beginPath();
  b.moveTo(s * 7, 38);
  b.bezierCurveTo(s * 2, 26, -22, 14, -20, -6);
  b.bezierCurveTo(-20, -28, 20, -28, 20, -6);
  b.bezierCurveTo(22, 14, s * 14, 26, s * 7, 38);
  b.closePath();
  ink(b, rad(b, 0, -2, 2, 34, [[0, shade(c, 0.55)], [0.35, shade(c, 0.1)], [0.7, shade(c, -0.25)], [1, shade(c, -0.6)]], -5, -12), 3);
  b.save();
  b.clip();
  b.strokeStyle = rgba('#ffffff', 0.5); // a fern of frost up the spine
  b.lineWidth = 1.1;
  b.beginPath();
  b.moveTo(s * 2, 32);
  b.lineTo(0, -16);
  for (let y = 24; y > -12; y -= 8) for (const d of [-1, 1]) {
    b.moveTo(s * 2 * (y / 30) , y);
    b.lineTo(d * 9, y - 8);
  }
  b.stroke();
  b.fillStyle = lin(b, 0, -28, 0, 38, [[0, rgba('#ffffff', 0.45)], [0.5, rgba('#ffffff', 0)], [1, rgba('#06304a', 0.4)]]);
  b.fillRect(-26, -30, 52, 70);
  b.restore();
  for (let i = -2; i <= 2; i++) { // the crown: five crystals, longer on alternate beats
    const a = i * 0.36;
    const len = 9 + (i % 2 ? f * 4 : (1 - f) * 4) + (2 - Math.abs(i)) * 2;
    kite(b, Math.sin(a) * 20, -8 - Math.cos(a) * 21, 6, len, shade(c, 0.4), a);
  }
  path(b, [[0, 1], [6, 8], [0, 16], [-6, 8]]); // the heart, a crystal showing through its skin
  b.fillStyle = rgba('#bff4ff', 0.55);
  b.fill();
  line(b, rgba('#ffffff', 0.75), 1.2);
  eye(l, 0, 8, 3.6, '#ffffff', 4.4);
  bloom(l, 0, 6, 36, FROST, 0.24 + f * 0.08);
  both((m) => { // eyes: slanted slits, burning cold under a hard brow
    path(b, [[m * 2.4, -13], [m * 12.6, -15.4], [m * 10.8, -7], [m * 4, -6.6]]);
    ink(b, '#081a30', 1.4);
    path(l, [[m * 4, -11.4], [m * 11, -13.2], [m * 9.8, -8.6], [m * 5, -8.2]]);
    l.fillStyle = '#e8ffff';
    l.fill();
    bloom(l, m * 8, -10.4, 11, '#bff4ff', 0.75);
  });
  gloss(b, -9, -20, 8, 3.6, 0.6, -0.4);
  for (const [x, y, r] of [[-16, 12, 1.1], [14, 18, 1.4], [-6, 28, 1], [s * 10, 31, 1.2]]) eye(l, x, y, r, '#ffffff', 3);
}

// A snow owl diving at the ship: broad white wings beating up and down, a barred chest, a round face
// in a pale disc with two golden eyes, ear tufts, talons spread below.
function diver(b, l, f, c) {
  const ty = f ? -20 : 12;
  const bar = '#5a6a96';
  both((s) => {
    const wrist = [s * 27, ty * 0.45 - 11];
    const tips = [[s * 47, ty], [s * 44, ty + 9], [s * 39, ty + 17], [s * 32, ty + 23], [s * 23, ty + 26]];
    b.beginPath();
    b.moveTo(s * 8, -9);
    b.lineTo(...wrist);
    b.lineTo(...tips[0]);
    for (let i = 1; i < tips.length; i++) {
      b.lineTo(tips[i - 1][0] - s * 3, tips[i - 1][1] + 5);
      b.lineTo(...tips[i]);
    }
    b.lineTo(s * 10, 15);
    b.closePath();
    ink(b, lin(b, 0, 0, s * 47, 0, [[0, '#ffffff'], [0.6, c], [1, shade(c, -0.22)]]), 2.6);
    b.save();
    b.clip();
    for (const t of tips) { // dark-tipped primaries, and the shaft of each
      path(b, [wrist, t], true);
      line(b, rgba(bar, 0.5), 1.1);
      b.beginPath();
      b.arc(t[0] - s * 2, t[1] - 1, 6.5, 0, 6.3);
      b.fillStyle = rgba(bar, 0.55);
      b.fill();
    }
    for (let i = 0; i < 3; i++) { // coverts, rows of small scallops along the arm
      b.beginPath();
      b.arc(s * (14 + i * 6), -5 + (ty / 3) * 0.4 * i - i * 2, 4.4, 0.2, Math.PI - 0.2);
      line(b, rgba(bar, 0.4), 1.1);
    }
    b.restore();
    path(b, [[s * 8, -9], wrist, tips[0]], true);
    line(b, rgba('#ffffff', 0.7), 1.4);
  });
  both((s) => { // talons: a feathered leg, then three curved claws
    path(b, [[s * 5, 16], [s * 7, 25], [s * 6, 31]], true);
    line(b, INK, 6);
    line(b, '#f4f8ff', 3.4);
    for (const d of [-3.4, 0, 3.4]) {
      b.beginPath();
      b.moveTo(s * 6 + d, 30);
      b.quadraticCurveTo(s * 6 + d * 1.6, 36, s * 6 + d * 0.6, 39);
      line(b, INK, 3);
      line(b, '#3a3a4c', 1.5);
    }
  });
  for (const d of [-1, 0, 1]) { // tail
    path(b, [[d * 4 - 3, 14], [d * 8, 28], [d * 4 + 3, 14]]);
    ink(b, shade(c, -0.15), 1.8);
  }
  ellipse(b, 0, 4, 12.5, 17);
  ink(b, rad(b, -4, -4, 1, 22, [[0, '#ffffff'], [0.6, c], [1, shade(c, -0.4)]]), 2.8);
  for (let row = 0; row < 4; row++) for (let i = -2; i <= 2; i++) { // the barred chest
    const x = i * 4.4 + (row % 2) * 2.2;
    const y = -2 + row * 5.6;
    b.beginPath();
    b.moveTo(x - 2.4, y);
    b.quadraticCurveTo(x, y + 2.6, x + 2.4, y);
    line(b, rgba(bar, 0.55), 1);
  }
  ellipse(b, 0, -13, 13, 11.5);
  ink(b, rad(b, -3, -17, 1, 18, [[0, '#ffffff'], [1, shade(c, -0.18)]]), 2.6);
  both((s) => {
    path(b, [[s * 8, -21], [s * 13, -30], [s * 15, -19]]); // ear tufts
    ink(b, shade(c, -0.1), 2);
    ellipse(b, s * 5.8, -13, 7.6, 8);
    ink(b, rad(b, s * 5.8, -13, 0, 8, [[0, '#ffffff'], [1, shade(c, -0.15)]]), 1.6);
    ellipse(b, s * 5.8, -13, 4.6, 4.6);
    ink(b, '#c8801a', 1.2);
    eye(l, s * 5.8, -13, 3.1, '#ffc83a', 4.6);
    ellipse(b, s * 5.8, -13, 1.1, 2.9);
    b.fillStyle = '#10080a';
    b.fill();
    path(b, [[s * 1.4, -19.4], [s * 11, -17]], true); // a fierce brow
    line(b, rgba('#2a3050', 0.85), 2);
  });
  path(b, [[-2.4, -10], [2.4, -10], [0, -5.4]]);
  ink(b, '#e0b040', 1.2);
  gloss(b, -5, -19, 5, 2.4, 0.5, -0.3);
  bloom(l, 0, -13, 24, '#ffc83a', 0.14);
}

export default { rate: 2, bob: 2, halo: 0.2, crack: FROST, grunt, diver, gunner, armored, carrier };
