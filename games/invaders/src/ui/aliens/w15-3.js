// World 15, Lantern Deep, the pufferfish (see w15.js): a round, speckled and barred fish, pale in the belly, with
// big forward-looking eyes, a beak that is its gun, frilled fins and a ring of spines (the fins, tail and spines
// are in w15-6.js). It swells as it fires: beat 0 it is small with short spines and a dim mouth; beat 1 it is
// blown up, the skin stretched pale, every spine out with a lit tip, the beak open on a glowing muzzle. Dived
// tail first (tail at the top) so that it looks down at the ship.
import { pectoral, tail, spines, studs } from './w15-6.js';
import { path, ink, lin, rad, rgba, shade, mix, bloom, gloss, line, circle, ellipse, spark, freckles, ABYSS, AQUA, INK, SOFT } from './w15-kit.js';

const SHAPE = [{ cy: 2, rx: 19, ry: 18 }, { cy: 1, rx: 26.5, ry: 25.5 }]; // the body on each beat
const HOT = '#f4ffb0'; // the muzzle's heat: a pale lime white, nothing amber
const BELLY = '#f4ffe0';

// One eye: a dark socket, a pale sclera, a lime iris looking down at the ship, a pupil, glints and a lid
// slanted into a scowl (raised on the swollen beat, so that it stares).
function eyeAt(b, l, x, y, r, m, f, c) {
  circle(b, x, y, r + 0.9);
  ink(b, shade(c, -0.55), 1.5);
  circle(b, x, y, r);
  b.fillStyle = rad(b, x, y, 0, r, [[0, '#ffffff'], [0.7, '#e6f6e0'], [1, '#a8c8a0']], x - r * 0.2, y - r * 0.2);
  b.fill();
  circle(b, x, y + r * 0.16, r * 0.72);
  b.fillStyle = rad(b, x, y + r * 0.16, 0, r * 0.72, [[0, '#e8ff9a'], [0.5, c], [1, shade(c, -0.6)]]);
  b.fill();
  line(b, rgba(ABYSS, 0.8), 0.9);
  circle(b, x, y + r * 0.28, r * 0.36);
  b.fillStyle = '#04120a';
  b.fill();
  b.save();
  circle(b, x, y, r);
  b.clip();
  const [lo, hi] = f ? [y - r * 0.55, y - r * 0.9] : [y - r * 0.1, y - r * 0.55]; // the lid's low end is toward the middle
  path(b, [[x - r, y - r], [x + r, y - r], [x + r, m > 0 ? hi : lo], [x - r, m > 0 ? lo : hi]]);
  b.fillStyle = lin(b, 0, y - r, 0, y, [[0, shade(c, -0.7)], [1, shade(c, -0.4)]]);
  b.fill();
  path(b, [[x - r, m > 0 ? lo : hi], [x + r, m > 0 ? hi : lo]], true);
  line(b, rgba(shade(c, 0.5), 0.55), 0.9);
  b.restore();
  ellipse(b, x - r * 0.32, y - r * 0.12, r * 0.24, r * 0.2, -0.5);
  b.fillStyle = 'rgba(255,255,255,0.95)';
  b.fill();
  circle(b, x + r * 0.28, y + r * 0.5, r * 0.1);
  b.fill();
  spark(l, x - r * 0.32, y - r * 0.12, 0.7, HOT, 0.4);
  bloom(l, x, y, r * 2.2, c, 0.12);
}

// The beak, a pair of cream plates in fleshy lips: shut on beat 0 with a dim spark between them, and on beat 1
// sprung open on a lit throat, which is the gun's muzzle.
function mouth(b, l, f, cy, ry, c) {
  const y = cy + ry * 0.55;
  ellipse(b, 0, y, 7.6, 5.6);
  b.fillStyle = rad(b, 0, y, 0, 8, [[0, shade(c, 0.5)], [1, shade(c, -0.15)]]);
  b.fill();
  line(b, SOFT, 1.5);
  const plate = (pts) => {
    path(b, pts);
    b.fillStyle = lin(b, -4, 0, 4, 0, [[0, '#fff8dc'], [0.5, '#ffffff'], [1, '#c8cca8']]);
    b.fill();
    line(b, SOFT, 1.1);
  };
  if (!f) {
    plate([[-4.2, y - 3], [4.2, y - 3], [2.8, y + 1.2], [-2.8, y + 1.2]]);
    plate([[-2.8, y + 1.2], [2.8, y + 1.2], [2, y + 4.2], [-2, y + 4.2]]);
    spark(l, 0, y + 1.2, 1.2, HOT, 0.35);
    return;
  }
  ellipse(b, 0, y + 0.4, 4.9, 4.2);
  b.fillStyle = rad(b, 0, y + 0.4, 0, 4.9, [[0, HOT], [0.45, c], [1, '#102a10']]);
  b.fill();
  line(b, SOFT, 1.2);
  plate([[-4.6, y - 5], [4.6, y - 5], [3.2, y - 1.6], [-3.2, y - 1.6]]);
  plate([[-3.2, y + 2.8], [3.2, y + 2.8], [2.3, y + 6], [-2.3, y + 6]]);
  bloom(l, 0, y + 0.6, 12, c, 0.5);
  spark(l, 0, y + 0.6, 2.2, HOT, 0.95);
}

// A pufferfish: small and calm on beat 0, blown up and firing on beat 1.
export function gunner(b, l, f, c) {
  const { cy, rx, ry } = SHAPE[f];
  const back = mix(c, '#0e3a20', 0.55);
  tail(b, f, cy, ry, c);
  spines(b, l, f, cy, rx, ry, c);
  ellipse(b, 0, cy, rx, ry);
  b.fillStyle = rad(b, 0, cy, 0, rx * 1.12, [[0, shade(c, 0.22)], [0.5, mix(c, '#2a6a30', 0.2)], [0.85, mix(c, '#14502a', 0.62)], [1, shade(c, -0.74)]], -rx * 0.3, cy - ry * 0.36);
  b.fill();
  line(b, INK, 3);
  b.save();
  ellipse(b, 0, cy, rx, ry);
  b.clip();
  freckles(b, 46, 7, 0, cy - ry * 0.25, rx * 0.95, ry * 0.75, [shade(c, -0.65), shade(c, 0.5)], 0.4, 1.15, 0.6);
  freckles(b, 9, 19, 0, cy - ry * 0.3, rx * 0.8, ry * 0.6, [back], 2.5, 5, 0.22); // soft blotches of the back
  for (let k = 0; k < 5; k++) { // dark bars across the back, curving with the belly
    const yk = cy - ry * (0.95 - k * 0.19);
    b.beginPath();
    b.moveTo(-rx * 1.1, yk);
    b.quadraticCurveTo(0, yk + ry * 0.38, rx * 1.1, yk);
    line(b, rgba(back, f ? 0.4 : 0.55), 3.4 - k * 0.3);
  }
  b.fillStyle = rad(b, 0, cy + ry * 0.98, 0, rx * 0.95, [[0, rgba(BELLY, 0.95)], [0.6, rgba(BELLY, 0.8)], [1, rgba(BELLY, 0)]]); // the pale belly
  b.fillRect(-rx - 2, cy, rx * 2 + 4, ry + 2);
  freckles(b, 14, 11, 0, cy + ry * 0.7, rx * 0.6, ry * 0.25, [shade(c, -0.35)], 0.3, 0.65, 0.45);
  studs(b, f, cy, rx, ry);
  ellipse(b, 0, cy, rx, ry); // rim light low on the right, cool from the deep's own glow
  line(b, lin(b, -rx, -ry, rx, ry, [[0, rgba(AQUA, 0)], [0.62, rgba(AQUA, 0)], [1, rgba(AQUA, 0.55)]]), 4.4);
  b.restore();
  gloss(b, -rx * 0.42, cy - ry * 0.55, rx * 0.34, ry * 0.16, f ? 0.7 : 0.55, -0.5);
  if (f) gloss(b, rx * 0.62, cy - ry * 0.1, 2, ry * 0.3, 0.28, 0.2); // the skin stretched taut
  pectoral(b, f, cy, rx, c);
  for (const m of [-1, 1]) eyeAt(b, l, m * (f ? 11.6 : 9), cy - (f ? 4 : 3), f ? 6.6 : 5.5, m, f, c);
  mouth(b, l, f, cy, ry, c);
  bloom(l, 0, cy, 34, c, 0.07 + f * 0.05);
}
