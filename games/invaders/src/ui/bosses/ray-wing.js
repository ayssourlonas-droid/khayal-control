// The Squall Ray's wing armour (World 18, Anvil Sky; see ray.js): an armour part 290 x 150, painted as the LEFT wing and mirrored for the right. Over the wing's
// cloud lies lamellar armour (ray-lame.js): four rows of small overlapping curved plates of blue-grey iron that follow the wing from the shoulder to the tip and sag with
// its trailing edge, each plate smaller than the one before and lying over it, and at the root a dull bolted pauldron that holds the rows down (no glowing hub, so that the
// wing has no second pair of eyes). A plate is iron lit cold from above, with a bright bevel along its free end, a rivet and a soft shadow where it lies over the next;
// the lights layer is the storm leaking between the plates, a seam of cold light along every free end, and a spark or two leaping across the joints. Part coordinates,
// as ray-lame.js says. Bake-time only.
import { PAL, rng, path, line, rgba } from './ray-kit.js';
import { rivet, neon } from '../aliens/w18-kit.js';
import { slab, rivetsOn } from './ray-iron.js';
import { fork, strike } from './ray-bolt.js';
import { plates, SHOULDER, to } from './ray-lame.js';

const flip = (pts) => pts.map(to).reverse(); // mirrored, a polygon runs the other way round: put it clockwise again for slab()

function frame(b, all) {
  const r = rng(9);
  all.forEach(({ pts, free, mid }, i) => {
    path(b, free.map(to).map(([x, y]) => [x - 2.5, y + 0.5]), true); // the shadow the plate throws on the one beyond it
    line(b, rgba('#02030c', 0.4), 5);
    slab(b, flip(pts), i % 3 ? PAL.iron : PAL.plate, { seed: i + 1, wear: 0.25 + 0.2 * r(), rust: 0.08 * r(), lw: 1.8 });
    path(b, free.map(to).map(([x, y]) => [x + 1.8, y]), true); // the bevel, just inside the free end
    line(b, rgba('#e6f0ff', 0.5), 1.2);
    rivetsOn(b, [to([mid[0] - 6, mid[1]])], 1.3);
  });
  slab(b, flip(SHOULDER), PAL.iron, { seed: 70, wear: 0.4, rust: 0.2, lw: 2.2 }); // the pauldron
  path(b, SHOULDER.map(to).slice(1, 6), true);
  line(b, rgba('#e6f0ff', 0.4), 1.4);
  for (const [x, y] of [[134, -88], [143, -58], [143, -28], [136, 4], [126, -70], [126, -22]]) rivet(b, ...to([x, y]), 2.4, '#c8d6f0');
}

function seams(l, all) {
  const r = rng(11);
  for (const { free } of all) {
    path(l, free.map(to), true);
    neon(l, PAL.cyan, 0.9, 0.28 + 0.2 * r());
  }
  const joints = all.flatMap((a, i) => (all[i + 1] && Math.hypot(a.mid[0] - all[i + 1].mid[0], a.mid[1] - all[i + 1].mid[1]) < 44 ? [[a, all[i + 1]]] : [])); // neighbours in a row
  for (let i = 0; i < 4; i++) { // a spark leaping a joint
    const [p, q] = joints[Math.floor((joints.length * (i + 0.5)) / 4)].map((a) => to(a.mid));
    strike(l, fork(i + 3, p[0], p[1], q[0], q[1], 4, 4, 1), PAL.white, 1, 0.7);
  }
}

export function wing(b, l) {
  const all = plates();
  b.save();
  l.save();
  frame(b, all);
  seams(l, all);
  b.restore();
  l.restore();
}
