// World 11, Aurora Kingdom, more of the guard (see w11.js): the floating ice crystal that looses the
// shards and the ice golem of packed ice and stone, whose cracks (cracks.js) run blue as it is hurt.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { FROST, kite } from './w11-kit.js';

const ICE = '#8cc8f0';

// A cut crystal on its point: a pointed gem of six facets lit from the upper left round a paler table,
// the glow of its heart showing through, three shards orbiting it. On the second beat its lower tip
// gathers a shard to fire.
export function gunner(b, l, f, c) {
  const [T, UL, UR, LL, LR, B, C] = [[0, -36], [-21, -12], [21, -12], [-15, 14], [15, 14], [0, 36], [0, -6]];
  const orbit = (g, front) => [0.3, 2.4, 4.5].forEach((a0, i) => {
    const a = a0 + f * 0.75;
    if ((Math.sin(a) > 0) === front) kite(g, Math.cos(a) * 33, Math.sin(a) * 21 - 2, 5.4, 11, shade(c, 0.3), a + 1.2, 1.2);
  });
  orbit(b, false);
  kite(b, -22, -14, 9, 24, shade(c, 0.1), -0.7, 2); // a cluster: two young crystals grown from its shoulders
  kite(b, 23, -9, 8, 20, shade(c, -0.1), 0.65, 2);
  path(b, [T, UL, LL, B, LR, UR]);
  ink(b, shade(c, -0.5), 3.6);
  const facets = [[[T, UL, C], 0.6], [[T, UR, C], 0.28], [[UL, LL, C], 0.12], [[UR, LR, C], -0.22], [[LL, B, C], -0.36], [[LR, B, C], -0.58]];
  for (const [pts, k] of facets) {
    path(b, pts);
    b.fillStyle = lin(b, pts[0][0], pts[0][1], C[0], C[1], [[0, shade(c, k + 0.22)], [1, shade(c, k - 0.2)]]);
    b.fill();
    line(b, rgba(INK, 0.5), 1.1);
  }
  path(b, [[-8, -15], [8, -15], [10, 1], [0, 13], [-10, 1]]); // the table
  b.fillStyle = rgba('#ffffff', 0.16);
  b.fill();
  line(b, rgba('#ffffff', 0.55), 1.2);
  path(b, [T, UL, LL, B], true); // the lit edge
  line(b, rgba('#ffffff', 0.5), 1.4);
  gloss(b, -8, -18, 4, 9, 0.55, 0.5);
  path(l, [[-8, -15], [8, -15], [10, 1], [0, 13], [-10, 1]]); // the heart's light shining through the table
  l.fillStyle = rad(l, 0, -2, 0, 17, [[0, rgba('#ffffff', 0.5)], [0.5, rgba(c, 0.5)], [1, rgba(c, 0)]]);
  l.fill();
  for (const [pts] of facets) {
    path(l, pts);
    line(l, rgba(shade(c, 0.5), 0.35), 1);
  }
  bloom(l, 0, -2, 36, c, 0.45);
  eye(l, -9, -19, 1.7, '#ffffff', 3.8);
  if (f) { // a shard gathering on the lower tip
    kite(b, 0, 42, 8, 16, shade(c, 0.5), 0, 1.6);
    eye(l, 0, 40, 2.6, '#ffffff', 4.4);
  } else eye(l, 0, 33, 1.5, '#ffffff', 3.2);
  orbit(b, true);
}

// An ice golem: a block torso of packed ice, strata and bubbles frozen in it, a rune of cold light in
// its chest; stone pauldrons under snow, thick arms ending in fists, a heavy brow over two glowing
// slits, and a beard of icicles. It swings its fists, one beat then the other.
export function armored(b, l, f, c) {
  const rock = shade(c, -0.25);
  const block = (pts, k = 0) => {
    path(b, pts);
    ink(b, lin(b, 0, pts[0][1], 0, pts[2][1], [[0, shade(ICE, 0.5 + k)], [0.5, shade(ICE, k)], [1, shade('#3a78b4', k)]]), 2.8);
  };
  both((s) => { // legs, feet
    block([[s * 4, 14], [s * 17, 14], [s * 18, 31], [s * 3, 31]], -0.1);
    path(b, [[s * 2, 30], [s * 22, 30], [s * 24, 35], [s * 2, 35]]);
    ink(b, rock, 2.2);
  });
  both((s) => { // arms: an upper arm, a fist with icicles for knuckles
    const dy = (s > 0 ? f : 1 - f) * -5;
    block([[s * 22, -8], [s * 34, -6], [s * 36, 14 + dy], [s * 24, 14 + dy]], -0.05);
    path(b, [[s * 22, 12 + dy], [s * 38, 12 + dy], [s * 40, 26 + dy], [s * 28, 30 + dy], [s * 20, 26 + dy]]);
    ink(b, lin(b, 0, 12, 0, 30, [[0, shade(c, 0.1)], [1, shade(c, -0.55)]]), 2.6);
    for (const d of [-1, 1, 3]) {
      path(b, [[s * (24 + d * 3.4), 28 + dy], [s * (26 + d * 3.4), 36 + dy], [s * (28 + d * 3.4), 28 + dy]]);
      ink(b, '#cfeaff', 1.2);
    }
  });
  block([[-18, -12], [18, -12], [26, 2], [18, 18], [-18, 18], [-26, 2]]); // the torso
  b.save();
  b.clip();
  b.strokeStyle = rgba('#1c5a98', 0.4); // strata
  b.lineWidth = 1.4;
  for (const y of [-6, 4, 12]) {
    b.beginPath();
    b.moveTo(-26, y);
    b.quadraticCurveTo(0, y + 4, 26, y - 2);
    b.stroke();
  }
  for (const [x, y, r] of [[-14, 6, 1.4], [15, -2, 1.1], [-8, 13, 1], [17, 12, 1.6], [-19, -4, 1.2]]) {
    ellipse(b, x, y, r, r);
    b.fillStyle = rgba('#ffffff', 0.5);
    b.fill();
  }
  b.fillStyle = lin(b, -26, 0, 26, 0, [[0, rgba('#ffffff', 0.25)], [0.4, rgba('#ffffff', 0)], [1, rgba('#06304a', 0.4)]]);
  b.fillRect(-28, -14, 56, 34);
  b.restore();
  path(b, [[0, -4], [7, 5], [0, 14], [-7, 5]]); // the chest's rune: a diamond of cold light
  ink(b, '#0c2a4a', 1.8);
  path(l, [[0, -3], [6, 5], [0, 13], [-6, 5]]);
  l.fillStyle = rad(l, 0, 5, 0, 9, [[0, '#ffffff'], [0.5, rgba(FROST, 0.9)], [1, rgba(FROST, 0.4)]]);
  l.fill();
  bloom(l, 0, 5, 26, FROST, 0.4 + f * 0.12);
  both((s) => { // pauldrons of rough stone, snow on top, a spike of ice
    path(b, [[s * 17, -16], [s * 30, -18], [s * 37, -8], [s * 33, 2], [s * 20, 0], [s * 15, -8]]);
    ink(b, lin(b, 0, -18, 0, 2, [[0, shade(c, 0.2)], [1, shade(c, -0.5)]]), 2.8);
    for (const [x, y] of [[26, -10], [31, -4], [21, -4]]) {
      ellipse(b, s * x, y, 1.2, 0.9);
      b.fillStyle = rgba('#000000', 0.4);
      b.fill();
    }
    path(b, [[s * 17, -16], [s * 30, -18], [s * 35, -11], [s * 27, -12], [s * 22, -14]]);
    b.fillStyle = '#eef8ff';
    b.fill();
    kite(b, s * 29, -22, 7, 13, '#cfeaff', s * 0.3);
  });
  path(b, [[-12, -34], [12, -34], [14, -17], [-14, -17]]); // the head
  ink(b, lin(b, 0, -34, 0, -17, [[0, shade(ICE, 0.55)], [1, shade(ICE, -0.1)]]), 2.8);
  path(b, [[-15, -26], [15, -26], [14, -20], [-14, -20]]); // the brow, stone
  ink(b, rock, 2.2);
  both((s) => {
    path(b, [[s * 3, -24.4], [s * 11, -24.4], [s * 10, -21.6], [s * 3, -21.6]]);
    ink(b, '#06182c', 1.2);
    path(l, [[s * 3.6, -24], [s * 10, -24], [s * 9.4, -22], [s * 3.6, -22]]);
    l.fillStyle = '#e8ffff';
    l.fill();
    bloom(l, s * 7, -23, 12, FROST, 0.7);
  });
  path(b, [[-12, -34], [12, -34], [10, -37], [3, -36], [-4, -38], [-10, -36]]); // snow on its crown
  b.fillStyle = '#eef8ff';
  b.fill();
  for (let i = -3; i <= 3; i++) { // the beard: icicles down from the chin
    const len = 7 + (3 - Math.abs(i)) * 2.4;
    path(b, [[i * 3.6 - 1.6, -18], [i * 3.6 + 1.6, -18], [i * 3.6, -18 + len]]);
    ink(b, '#e8f6ff', 1.1);
  }
  gloss(b, -7, -31, 6, 2.6, 0.5, -0.2);
}
