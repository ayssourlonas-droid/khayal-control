// The Thunder Galleon's mainmast (World 13, Sunset Armada; see galleon.js): the top of the mast standing over the
// bridge's roof, the two yards crossing it (the hull carries them on out to either side, galleon-rig.js),
// a crow's nest with a watchman's hat showing over its rim, brass bands on the pole and a lit globe on
// the truck for the pennant staff. The pennant, the nest's lantern and the glints are live
// (galleon-fx.js). An armour plate, 90 x 92 for the hit box; the marks below are where the live extras
// hang: TRUCK for the pennant and NEST_LAMP for the lantern, in the part's frame.
import { path, ink, line, lin, rad, rgba, shade, bloom, eye, ellipse } from './kit.js';
import {
  BRASS_L, BRASS_D, TEAK_L, IRON, WARM, roundX, planks, stud, studRow, rope, circle,
} from './galleon-kit.js';

export const TRUCK = [0, -40]; // the staff the pennant flies from
export const NEST_LAMP = [-27, -7]; // where the lantern hangs from
export const YARD_Y = [-28, 22]; // the two yards in this frame (the hull's are the same height)

// A yard across the part: a spar tapering outward, lashed to the pole by a parrel of brass and rope.
function yard(b, y, th) {
  path(b, [[-46, y - th * 0.4], [-8, y - th / 2], [8, y - th / 2], [46, y - th * 0.4], [46, y + th * 0.4], [8, y + th / 2], [-8, y + th / 2], [-46, y + th * 0.4]]);
  ink(b, lin(b, 0, y - th / 2, 0, y + th / 2, [[0, shade(TEAK_L, 0.4)], [0.5, TEAK_L], [1, shade(TEAK_L, -0.6)]]), 2);
  path(b, [[-44, y - th * 0.18], [44, y - th * 0.18]], true);
  line(b, rgba('#ffffff', 0.22), 0.9);
}

function parrel(b, y) {
  b.beginPath();
  b.roundRect(-9, y - 6.5, 18, 13, 3);
  ink(b, lin(b, 0, y - 6, 0, y + 6, [[0, BRASS_L], [1, BRASS_D]]), 1.8);
  for (let i = -1; i <= 1; i++) {
    path(b, [[i * 4 - 1, y - 5], [i * 4 + 1, y + 5]], true);
    line(b, rgba('#e8c48a', 0.9), 1.5);
  }
}

// The pole: darker teak than the yards, thicker toward the bridge, with a brass band at each joint.
function pole(b) {
  path(b, [[-5, -36], [5, -36], [7, 46], [-7, 46]]);
  ink(b, roundX(b, -7, 7, TEAK_L), 2.2);
  for (const y of [-33, -16, 14, 38]) {
    b.beginPath();
    b.roundRect(-7.4, y - 2.4, 14.8, 4.8, 1.6);
    ink(b, lin(b, 0, y - 2.4, 0, y + 2.4, [[0, BRASS_L], [1, BRASS_D]]), 1.2);
  }
}

// The crow's nest: a barrel of staves wider at the lip, two brass hoops, a ring of rail, its back half
// inside dark, and a watchman looking out of it.
function nest(b, plate) {
  ellipse(b, 0, -11, 24, 5);
  ink(b, '#14080a', 2);
  path(b, [[-24, -11], [-17.5, 11], [17.5, 11], [24, -11]]);
  b.save();
  b.clip();
  planks(b, -26, -12, 26, 12, '#4a2c16', 17, 6);
  b.fillStyle = lin(b, -24, 0, 24, 0, [[0, rgba('#000000', 0.5)], [0.3, rgba('#ffffff', 0.12)], [1, rgba('#000000', 0.55)]]);
  b.fillRect(-26, -12, 52, 24);
  b.restore();
  path(b, [[-24, -11], [-17.5, 11], [17.5, 11], [24, -11]]);
  line(b, '#0a0c16', 2.4);
  ellipse(b, 0, 11, 17.5, 4);
  line(b, '#0a0c16', 2);
  for (const [y, w] of [[-3, 21], [4, 19]]) { // hoops
    b.beginPath();
    b.roundRect(-w, y - 2, w * 2, 4, 1.4);
    ink(b, lin(b, 0, y - 2, 0, y + 2, [[0, shade(plate, 0.5)], [1, shade(plate, -0.5)]]), 1.2);
    studRow(b, -w + 4, y, w - 4, y, 5, 1.1);
  }
  b.beginPath();
  b.ellipse(0, -11, 24, 5, 0, 0, Math.PI);
  line(b, '#0a0c16', 4.6);
  line(b, BRASS_L, 2.6);
  line(b, rgba('#ffffff', 0.5), 0.8);
}

// The watchman: a hat and a face looking left, a red scarf, the rest hidden in the barrel.
function watchman(b) {
  b.save();
  b.translate(7, -17);
  ellipse(b, 0, 2, 4.4, 5);
  ink(b, rad(b, -1, 1, 0, 5, [[0, '#f0c090'], [1, '#a8683a']]), 1.4);
  path(b, [[-6.4, -0.6], [-4, -6.4], [4.4, -6.4], [6.8, -0.6]]); // a tricorn
  ink(b, '#2a1420', 1.4);
  path(b, [[-7, -0.8], [0, -3], [7.4, -0.8]], true);
  line(b, '#14080a', 2.4);
  path(b, [[-4.6, 6], [4.8, 6], [6, 10], [-6, 10]]);
  ink(b, '#b8402e', 1.2);
  b.restore();
}

export function mast(b, l, p, S) {
  const { plate } = S.pal;
  pole(b);
  yard(b, YARD_Y[0], 7);
  parrel(b, YARD_Y[0]);
  yard(b, YARD_Y[1], 8);
  parrel(b, YARD_Y[1]);
  nest(b, plate);
  watchman(b);
  rope(b, [[-16, 10], [-43, 22]], 1.6); // the shrouds: ropes from the nest's foot out to the lower yard
  rope(b, [[16, 10], [43, 22]], 1.6);
  rope(b, [[-4, -33], [-44, -28]], 1.4, 3); // the lift from the truck to the upper yard
  rope(b, [[4, -33], [44, -28]], 1.4, 3);
  circle(b, TRUCK[0], TRUCK[1] + 3, 4.6); // the truck: a lit globe on a brass cup
  ink(b, rad(b, 0, -37, 0, 5, [[0, '#fff6c8'], [0.5, '#ffcf6a'], [1, '#c8801c']]), 1.4);
  path(b, [[-5, -34.4], [5, -34.4], [3.4, -31], [-3.4, -31]]);
  ink(b, lin(b, 0, -34, 0, -30, [[0, BRASS_L], [1, BRASS_D]]), 1.2);
  b.beginPath(); // the hook the nest's lantern hangs from
  b.arc(NEST_LAMP[0], NEST_LAMP[1] - 1, 2, 0, Math.PI * 2);
  line(b, IRON, 1.6);
  stud(b, 0, -33, 1.2, BRASS_L);
  eye(l, TRUCK[0], TRUCK[1] + 3, 2.6, WARM, 4);
  bloom(l, 0, -2, 54, WARM, 0.07);
}
