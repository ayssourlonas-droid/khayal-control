// The Lantern Leviathan's crest (World 15, Lantern Deep; see angler.js): an armour part 180 x 92 for the hit box,
// the ragged dorsal spines standing on the forehead like a torn crown. Two fans of spines of different heights, the
// left not the right's twin: curved, scarred, some broken off, each pale at its edge and dark at its flank, with a
// thin web of translucent skin stretched between neighbours, torn along its rim and holed. Their
// roots sit in a lumpy swell of flesh that fades into the head. The middle is left bare: the knob of the lure's
// stalk is at the part's (-4, -7). Only a few tips glow. Nothing rises above y -41 in the part's own frame (boss y
// -155, under the HUD); the part is margined 40 px for the spines that reach past its edge.
import { path, line, lin, rgba, bloom } from './kit.js';
import { rng, lumpy, INK, AQUA, circle } from './angler-kit.js';

// The spines of the right-hand fan: root x, root y, tip x, tip y, width at the root, bend (px of curve).
const RIGHT = [[24, 30, 30, -20, 7.6, -3], [35, 31, 48, -37, 8.6, -4], [48, 33, 68, -36, 8.2, -5], [60, 36, 86, -24, 7.4, -5], [72, 40, 101, -8, 6.4, -4], [82, 44, 108, 14, 5, -3]];
const jitter = (list, seed) => {
  const r = rng(seed);
  return list.map(([rx, ry, tx, ty, w, bend], i) => [rx + (r() - 0.5) * 5, ry, tx + (r() - 0.5) * 12, ty + r() * 10 + (i % 3 === 1 ? 5 : 0), w * (0.85 + 0.3 * r()), bend * (0.6 + r())]);
};
const FANS = [jitter(RIGHT, 12).map(([rx, ry, tx, ty, w, bend], i) => [-rx, ry, -tx, ty, w, -bend, i === 2 || i === 4]), RIGHT.map((s, i) => [...s, i === 3 || i === 5])]; // [left, right]; the last: broken off

const at = (s, u) => [s[0] + (s[2] - s[0]) * u, s[1] + (s[3] - s[1]) * u];

// The web between two neighbouring spines: translucent, a ragged trailing rim, a hole or two, a few veins.
function web(b, s0, s1, seed) {
  const r = rng(seed);
  const [a, c] = [at(s0, 0.1), at(s1, 0.1)];
  const [t0, t1] = [at(s0, 0.78), at(s1, 0.78)];
  const rim = [t0];
  for (let i = 1; i < 6; i++) { // a torn rim: notches of different depths
    const u = i / 6;
    rim.push([t0[0] + (t1[0] - t0[0]) * u, t0[1] + (t1[1] - t0[1]) * u + (i % 2 ? 4 + r() * 9 : -1 + r() * 3)]);
  }
  rim.push(t1);
  path(b, [a, ...rim, c]);
  b.fillStyle = lin(b, 0, -40, 0, 34, [[0, rgba('#6a5ac8', 0.5)], [0.5, rgba('#2a3490', 0.55)], [1, rgba('#0a1040', 0.7)]]);
  b.fill();
  line(b, rgba(INK, 0.75), 1);
  for (let i = 1; i <= 3; i++) { // veins, root to rim
    const u = i / 4;
    path(b, [[a[0] + (c[0] - a[0]) * u, a[1] + (c[1] - a[1]) * u], rim[i + 1]], true);
    line(b, rgba('#bfe6ff', 0.34), 0.9);
  }
  b.save();
  b.globalCompositeOperation = 'destination-out'; // a hole where something once bit it
  circle(b, (a[0] + t1[0]) / 2 + 2, (a[1] + t0[1]) / 2 + 3, 2.8 + r() * 2.2);
  b.fill();
  b.restore();
}

// One spine: a curved needle, pale along its edge and dark along its flank, scarred, perhaps barbed, a pale point, or
// broken off short with a jagged end.
function spine(b, l, s, glow) {
  const [x0, y0, x1, y1, w, bend, broken] = s;
  const len = Math.hypot(x1 - x0, y1 - y0) * (broken ? 0.62 : 1);
  b.save();
  b.translate(x0, y0);
  b.rotate(Math.atan2(y1 - y0, x1 - x0));
  b.scale(1, Math.sign(x1 - x0) || 1); // the left fan leans the other way
  b.beginPath();
  b.moveTo(0, -w / 2);
  b.quadraticCurveTo(len * 0.42, -w * 0.16 + bend * 0.3, len, broken ? bend * 0.2 - w * 0.18 : bend);
  if (broken) { // the stump's jagged end
    b.lineTo(len - 2, bend * 0.2 + w * 0.05);
    b.lineTo(len + 1, bend * 0.2 + w * 0.12);
    b.lineTo(len - 3, bend * 0.2 + w * 0.2);
  }
  b.quadraticCurveTo(len * 0.42, w * 0.22 + bend * 0.3, 0, w / 2);
  b.closePath();
  b.fillStyle = lin(b, 0, -w / 2, 0, w / 2, [[0, '#b4dcee'], [0.35, '#4a86ac'], [1, '#0e2a46']]);
  b.fill();
  line(b, INK, 1.3);
  for (const u of [0.22, 0.46]) { // scars across it
    path(b, [[len * u, -w * 0.3 * (1 - u)], [len * u + 2, w * 0.4 * (1 - u)]], true);
    line(b, rgba('#000812', 0.5), 1.1);
  }
  b.restore();
  if (!glow || broken) return;
  const [tx, ty] = [x0 + (x1 - x0) * 0.995, y0 + (y1 - y0) * 0.995];
  bloom(l, tx, ty, 7, AQUA, 0.45);
  circle(l, tx, ty, 1.4);
  l.fillStyle = rgba('#e8ffff', 0.9);
  l.fill();
}

// The swell the roots stand in: lumpy, lit on top, fading into the head below.
function ridge(b) {
  lumpy(b, 0, 38, 108, 6, 22, 1, 0.3);
  b.fillStyle = lin(b, 0, 14, 0, 50, [[0, '#2f5a78'], [0.5, '#143650'], [1, rgba('#0a2036', 0)]]);
  b.fill();
}

export function crest(b, l) {
  ridge(b);
  FANS.forEach((fan, side) => {
    for (let i = 0; i < fan.length - 1; i++) web(b, fan[i], fan[i + 1], 3 + side * 9 + i);
  });
  FANS.forEach((fan) => [...fan].reverse().forEach((s, i) => spine(b, l, s, i % 2 === 1)));
}
