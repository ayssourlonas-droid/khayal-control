// The Squall Ray's spine (World 18, Anvil Sky; see ray.js): an armour part 120 x 68 on the ridge of its back, where the storm's iron crowns it: an ANVIL,
// the world's own sign, seen from the side (a long pointed horn to the left, a flat face with its hardy hole, the stepped heel to the right, a narrow
// waist and a broad foot), bolted down on a riveted plinth that is wider than it. Weathered blue-grey iron lit cold from above, worn bright along the
// face (the banks of cloud heaped at each end of the plinth are the hull's, ray-seat.js). The lights layer is the seams: thin cold-cyan light leaking under the face and along the
// plinth's top, and a bloom at the waist. Part coordinates (the part's centre is the origin; the top is boss y -150, so nothing here is above y -31).
// Bake-time only.
import { PAL, rgba, line, path, bloom } from './ray-kit.js';
import { rivet, rivets, neon } from '../aliens/w18-kit.js';
import { slab } from './ray-iron.js';

const ANVIL = [
  [-60, -16], [-46, -27], [-36, -30], [38, -30], [58, -30], [60, -21], [48, -17], [36, -13], [26, -7], [25, 10], [38, 15], [44, 24], [-44, 24], [-38, 15], [-25, 10], [-26, -7], [-40, -12],
];
const PLINTH = [[-58, 24], [58, 24], [61, 34], [-61, 34]];

function iron(b) {
  slab(b, PLINTH, PAL.iron, { seed: 3, wear: 0.4 });
  rivets(b, -52, 29, 52, 29, 7, 2);
  slab(b, ANVIL, PAL.plate, { seed: 5, wear: 0.55 });
  b.save();
  path(b, ANVIL);
  b.clip();
  path(b, [[-30, -22], [44, -22]], true); // the face's edge
  line(b, rgba('#000000', 0.28), 1.4);
  b.fillStyle = rgba('#05070f', 0.85); // the hardy hole
  b.fillRect(22, -30, 9, 8);
  path(b, [[22, -22], [31, -22]], true);
  line(b, rgba('#aabbdd', 0.5), 1);
  b.restore();
  for (const [x, y] of [[-30, 19], [30, 19]]) rivet(b, x, y, 2.4, '#c8d6f0');
  path(b, [[-26, -3], [-26, 9]], true); // the waist's welds
  line(b, rgba('#000000', 0.4), 1.6);
  path(b, [[25, -3], [25, 9]], true);
  line(b, rgba('#000000', 0.4), 1.6);
}

function seams(l) {
  l.save();
  for (const [x0, x1, y, w] of [[-52, 52, 24, 1.3], [-24, 36, -14, 1.1]]) {
    path(l, [[x0, y], [x1, y]], true);
    neon(l, PAL.cyan, w, 0.55);
  }
  bloom(l, 0, 6, 46, PAL.cyan, 0.16);
  l.restore();
}

export function spine(b, l) {
  b.save();
  l.save();
  iron(b);
  seams(l);
  b.restore();
  l.restore();
}
