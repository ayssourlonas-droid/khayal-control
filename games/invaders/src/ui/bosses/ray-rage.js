// The Squall Ray's rage layers (World 18, Anvil Sky; ray.js hands them to the boss cache): extra hull lights that fade in with a phase, art only (the core
// sends the attacks). Hull-sized, additive, drawn under the parts (the system skips them below quality 1), origin at the boss's centre. The HOVER phase
// makes the heart and the coils blaze: the storm heart floods the back with violet, each coil's toroid and prong burn cyan-white, the maw takes light. The ORBIT
// phase sends lightning crawling over the whole body: all of that stronger, the cloud of the wings and the torso lit violet from inside, and a net of forked bolts
// from the heart out to the wing tips, the belly, the lobes and the spine, and from each coil to the tip above it. White is kept to the bolts' own cores: the
// blooms are violet and cyan. Nothing above y -156 (the HUD's edge is -158). Bake-time only.
import { PAL, PART, TOP, bloom } from './ray-kit.js';
import { fork, strike } from './ray-bolt.js';
import { TIP_BALL } from './ray-shape.js';
import { ELECTRODE, PRONG } from './ray-coil.js';

const TOPY = TOP + 2;
const HEART = [PART.heart.x, PART.heart.y];
const coilAt = (s, [x, y]) => [s * (PART.coilR.x - x), PART.coilR.y + y]; // a point of the coil painter's frame (painted as the left, mirrored for the right) in boss coordinates

function blaze(g, k) {
  bloom(g, HEART[0], HEART[1], 150, PAL.violet, 0.3 * k);
  bloom(g, HEART[0], HEART[1], 80, PAL.cyan, 0.22 * k);
  bloom(g, PART.maw.x, PART.maw.y, 110, PAL.violet, 0.22 * k);
  for (const s of [-1, 1]) {
    const [ex, ey] = coilAt(s, ELECTRODE);
    const [px, py] = coilAt(s, PRONG);
    bloom(g, ex, ey, 70, PAL.cyan, 0.3 * k);
    bloom(g, px, py, 56, PAL.violet, 0.26 * k);
    bloom(g, s * 480, TIP_BALL[1], 40, PAL.cyan, 0.26 * k);
  }
}

// The net: [x, y] ends of the bolts that leave the heart, for the right side (the left is mirrored); each lies inside the cloud.
const ENDS = [[480, -48], [420, -30], [300, 60], [160, 96], [250, -96], [120, 170], [380, 0], [60, -112]];

function crawl(g, k) {
  g.save();
  ENDS.forEach(([x, y], i) => {
    for (const s of [-1, 1]) {
      const polys = fork(i * 9 + (s > 0 ? 1 : 2), HEART[0] + s * 18, HEART[1], s * x, Math.max(y, TOPY), 12, 15, 3).map((pts) => pts.map(([px, py]) => [px, Math.max(py, TOPY)]));
      strike(g, polys, i % 3 === 0 ? PAL.white : i % 3 === 1 ? PAL.cyan : PAL.violet, 2, 0.8 * k);
    }
  });
  for (const s of [-1, 1]) {
    const [px, py] = coilAt(s, PRONG);
    strike(g, fork(70 + s, px, py, s * TIP_BALL[0], TIP_BALL[1], 5, 6, 1), PAL.cyan, 2, 0.9 * k);
  }
  g.restore();
}

export const rage = [
  null,
  (g) => blaze(g, 1),
  (g) => {
    blaze(g, 1.5);
    for (const s of [-1, 1]) {
      bloom(g, s * 250, -30, 130, PAL.violet, 0.3);
      bloom(g, s * 380, 10, 90, PAL.cyan, 0.25);
    }
    bloom(g, 0, 40, 160, PAL.violet, 0.2);
    crawl(g, 1);
  },
];
