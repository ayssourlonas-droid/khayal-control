// The Craving's claw (World 17, Ash to Air; see craving.js): an armour part 150 x 200, painted as the LEFT claw (the right is its
// mirror). A HAND OF SMOKE raised to seize, a bold shape that counts at 1:1: a forearm of dense dark smoke rising from the bowl (the
// smoke kit's billows, craving-puff.js, with dark sinew streaks, its foot dissolving into the bowl behind the rim), a compact palm, and
// FOUR THICK TAPERING FINGERS and a thumb fanned out (craving-claw-finger.js: smooth bezier bodies with smoke texture inside them, a
// pale edge light), each ending in a big hooked CLAW of ash-black horn (craving-claw-talon.js) with a pale ash edge light and an ember tip,
// curling inward and DOWN as if about to close on the ship. Three small charred knuckle plates (craving-claw-plate.js) guard the roots
// of the middle fingers. All of it lies inside the part's rect (x -75..75, y -100..100). Armour: dark and hard; its lights are a few
// dull embers only. Claw coordinates (the part's centre is the origin). Bake-time only.
import { cloud } from './craving-psmoke.js';
import { finger } from './craving-claw-finger.js';
import { talon } from './craving-claw-talon.js';
import { knuckle } from './craving-claw-plate.js';
import { cubic, ribbon, rng, lin, rgba, IRON, SOOT, ASH } from './craving-pkit.js';

const ARM = [[6, 100], [4, 60], [2, 24], [2, 0]]; // the forearm's spine, from the bowl up to the wrist
const FORE = [[4, 56, 30, 28, 202], [3, 30, 29, 26, 203], [2, 6, 28, 24, 204]]; // smokeMass: cx, cy, rx, ry, seed
const PALM = [0, -18, 32, 22]; // cx, cy, rx, ry
// The fingers, outermost first: the finger's cubic and widths, then the claw's cubic and base width (it tapers to 2).
const HAND = [
  { body: [[-27, -34], [-46, -48], [-56, -58], [-55, -68]], w: [22, 12], claw: [[-55, -68], [-62, -98], [-38, -100], [-38, -60]], cw: 15, seed: 11 },
  { body: [[-9, -44], [-15, -58], [-20, -68], [-19, -76]], w: [24, 13], claw: [[-19, -76], [-22, -106], [2, -104], [2, -62]], cw: 16, seed: 12 },
  { body: [[10, -45], [14, -58], [18, -68], [20, -76]], w: [24, 13], claw: [[20, -76], [20, -106], [46, -102], [46, -60]], cw: 16, seed: 13 },
  { body: [[28, -37], [44, -46], [54, -56], [56, -64]], w: [22, 12], claw: [[56, -64], [62, -92], [72, -88], [70, -52]], cw: 14, seed: 14 },
  { body: [[-30, -8], [-50, -14], [-62, -24], [-64, -36]], w: [20, 11], claw: [[-64, -36], [-72, -58], [-54, -64], [-50, -34]], cw: 13, seed: 15 }, // the thumb
];
const KNUCKLES = [[-9, -42, 18, 14, 141], [10, -43, 18, 14, 142], [28, -35, 17, 13, 143]];

function arm(b) { // the forearm as a soft dark column under its billows, and the sinew streaks that run up it
  b.save();
  b.filter = 'blur(3px)';
  ribbon(b, ARM, 64, 52, 14, 1);
  b.fillStyle = lin(b, -20, 0, 70, 0, [[0, IRON[2]], [0.4, IRON[1]], [1, SOOT]]);
  b.fill();
  b.restore();
}

function sinews(b) { // thin dark ribbons running up the arm, a few pale ones where the light catches
  const r = rng(206);
  for (let i = 0; i < 9; i++) {
    const x = ARM[2][0] - 20 + r() * 40;
    const c = [[x + (r() - 0.5) * 8, 54], [x + (r() - 0.5) * 12, 30], [x + (r() - 0.5) * 12, 6], [x + (r() - 0.5) * 8, -10]];
    ribbon(b, c, 2 + r() * 4, 1, 12, 0.8);
    b.fillStyle = i % 4 === 3 ? rgba(ASH[3], 0.1) : rgba(SOOT, 0.4);
    b.fill();
  }
}

export function claw(b, l) {
  b.save();
  l.save();
  arm(b);
  for (const [cx, cy, rx, ry, seed] of FORE) cloud(b, cx, cy, rx * 1.1, ry * 1.1, seed);
  cloud(b, PALM[0], PALM[1], PALM[2] * 1.1, PALM[3] * 1.15, 210);
  sinews(b);
  b.save();
  b.globalCompositeOperation = 'source-atop'; // the smoke is denser and darker than the body: armour
  b.fillStyle = 'rgba(8,5,4,0.38)';
  b.fillRect(-100, -104, 200, 190);
  b.globalCompositeOperation = 'destination-out'; // the arm's foot dissolves into the bowl, behind the rim
  b.fillStyle = lin(b, 0, 36, 0, 64, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]);
  b.fillRect(-110, 36, 220, 80);
  b.restore();
  for (const f of HAND) { // smoke clings to each finger: soft clouds along it, under its smooth body
    for (let t = 0.1; t < 1; t += 0.3) {
      const [x, y] = cubic(f.body, t);
      cloud(b, x, y, f.w[0] * (0.95 - 0.3 * t), f.w[0] * (0.85 - 0.3 * t), f.seed * 7 + Math.round(t * 10));
    }
  }
  for (const f of HAND) finger(b, f.body, f.w[0], f.w[1], f.seed);
  for (const [x, y, w, h, seed] of KNUCKLES) knuckle(b, l, x, y, w, h, seed);
  for (const f of HAND) talon(b, l, f.claw, f.cw, 2);
  b.restore();
  l.restore();
}
