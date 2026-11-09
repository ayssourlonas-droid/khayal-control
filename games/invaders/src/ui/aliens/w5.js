// World 5, Hive: wet biomechanical things from the cavern. Glossy chitin in ribbed segments, thin
// jointed legs, membranes; their bioluminescence (eyes, acid sacs, spore pods) is the lights layer.
// Heads point down at the player; legs and wings beat between the two frames.
import { path, sym, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both } from './kit.js';

const ACID = '#c8ff3a';
const OOZE = '#0c1610'; // the outline is the cavern's own dark green, not a cold ink

// Glossy chitin: a pale sheen up-left, the colour, near black at the rim.
const chitin = (g, c, x, y, r) => rad(g, x, y, 0, r, [[0, shade(c, 0.45)], [0.5, c], [1, shade(c, -0.7)]], x - r * 0.3, y - r * 0.5);

function ribs(b, x, y, rx, ry, ys) {
  for (const dy of ys) {
    b.beginPath();
    b.ellipse(x, y + dy, rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)), 3, 0, 0, Math.PI);
    line(b, rgba('#000000', 0.45), 1.4);
  }
}

// A thin leg in two joints from (x, y), knee out sideways, foot further out.
function leg(b, x, y, kx, ky, fx, fy, c) {
  path(b, [[x, y], [kx, ky], [fx, fy]], true);
  line(b, OOZE, 4);
  path(b, [[x, y], [kx, ky], [fx, fy]], true);
  line(b, shade(c, -0.2), 2);
}

// A crawler: plated abdomen behind, small head with mandibles in front, six legs that step.
function grunt(b, l, f, c) {
  // three legs a side: [hip y, knee x, foot y]; alternate legs step between the frames. The feet
  // stay inside x +-28 (+-30 with the ooze), no wider than the hit circle and a little.
  both((s) => [[-12, 15, -24], [-2, 22, -2], [8, 20, 18]].forEach(([y, kx, fy], i) => {
    const step = (i + f) % 2 ? 4 : -2;
    leg(b, 0, y, s * kx, y - 4 + step * 0.5, s * (kx + 5), fy + step, c);
  }));
  ellipse(b, 0, -9, 15, 15);
  ink(b, chitin(b, c, 0, -9, 15), 2.6);
  ribs(b, 0, -9, 15, 15, [-8, -2, 4, 10]);
  ellipse(b, 0, 10, 8, 7);
  ink(b, chitin(b, shade(c, -0.15), 0, 10, 8), 2.4);
  both((s) => {
    path(b, [[s * 4, 15], [s * 7, 22], [s * 2, 24]], true);
    line(b, OOZE, 3.2);
  });
  gloss(b, -5, -16, 5, 3, 0.6, -0.4);
  both((s) => eye(l, s * 3.5, 11, 1.4, ACID, 3));
}

// A swarmer: a long segmented tail curling up, two pairs of membrane wings, a stinger.
function diver(b, l, f, c) {
  const up = f ? -8 : 3;
  both((s) => {
    for (const [wx, wy, a] of [[31, -12 + up, 0.6], [26, 5 + up * 0.6, 0.45]]) {
      path(b, [[s * 4, -3], [s * wx, wy], [s * (wx - 7), wy + 8], [s * 5, 5]]);
      b.fillStyle = rgba(shade(c, 0.4), a);
      b.fill();
      line(b, rgba(OOZE, 0.9), 1.8);
      path(b, [[s * 5, 0], [s * (wx - 4), wy + 3]], true);
      line(b, rgba(OOZE, 0.5), 1);
    }
  });
  for (let i = 0; i < 5; i++) {
    ellipse(b, 0, -9 - i * 5.5, 7 - i * 0.9, 4.2);
    ink(b, chitin(b, c, 0, -9 - i * 5.5, 7), 2.2);
  }
  path(b, [[0, -33], [0, -40]], true);
  line(b, OOZE, 3.4);
  ellipse(b, 0, 2, 9, 10);
  ink(b, chitin(b, c, 0, 2, 10), 2.6);
  ellipse(b, 0, 18, 7.5, 9);
  ink(b, chitin(b, shade(c, -0.25), 0, 18, 9), 2.6);
  both((s) => {
    path(b, [[s * 4, 24], [s * 8, 30], [s * 4, 33]], true);
    line(b, OOZE, 2.6);
  });
  gloss(b, -2, 14, 2.8, 4.5, 0.7);
  both((s) => eye(l, s * 3.2, 23, 1.5, ACID, 3));
  bloom(l, 0, -38, 6, ACID, 0.6);
}

// A spitter: a translucent sac full of acid on top, a ribbed collar, a dripping tube of a mouth.
function gunner(b, l, f, c) {
  both((s) => leg(b, s * 8, 2, s * 22, 4, s * 18, 16 + f * 2, c));
  path(b, sym([[0, 8], [4, 8], [3, 24], [0, 24]]));
  ink(b, lin(b, -4, 0, 4, 0, [[0, shade(c, -0.6)], [0.4, shade(c, 0.2)], [1, shade(c, -0.6)]]), 2.4);
  for (const y of [12, 16, 20]) {
    path(b, [[-3.5, y], [3.5, y]], true);
    line(b, rgba('#000000', 0.5), 1.2);
  }
  ellipse(b, 0, 4, 12, 6);
  ink(b, chitin(b, shade(c, -0.3), 0, 4, 12), 2.4);
  ellipse(b, 0, -12, 17, 16);
  ink(b, rad(b, 0, -12, 0, 17, [[0, rgba(ACID, 0.95)], [0.6, rgba(shade(c, -0.1), 0.95)], [1, shade(c, -0.6)]]), 2.6);
  for (const x of [-9, -3, 3, 9]) {
    path(b, [[x * 0.4, -27], [x, -12], [x * 0.7, 1]], true);
    line(b, rgba('#0a1a06', 0.5), 1.2);
  }
  gloss(b, -6, -20, 5, 3.4, 0.75, -0.5);
  bloom(l, 0, -12, 22, ACID, 0.45 + f * 0.15);
  eye(l, 0, 26 + f * 3, 1.8, ACID, 2.6);
}

// Heavy chitin: a broad shell of overlapping plates with a serrated rim, three eyes underneath.
function armored(b, l, f, c) {
  both((s) => leg(b, s * 18, 10, s * 28, 14, s * 24, 24 - f * 3, c));
  const shell = [];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    const r = i % 2 ? 31 : 27;
    shell.push([Math.cos(a) * r, 10 + Math.sin(a) * r * 1.05]);
  }
  path(b, [...shell, [27, 16], [-27, 16]]);
  ink(b, chitin(b, c, 0, 0, 32), 3.2);
  for (const r of [22, 15, 8]) {
    b.beginPath();
    b.ellipse(0, 10, r, r * 1.05, 0, Math.PI, 0);
    line(b, rgba('#000000', 0.45), 1.6);
    b.beginPath();
    b.ellipse(0, 9, r, r * 1.05, 0, Math.PI * 1.15, Math.PI * 1.45);
    line(b, rgba('#ffffff', 0.3), 1.2);
  }
  path(b, sym([[0, 10], [14, 10], [10, 20], [0, 22]]));
  ink(b, chitin(b, shade(c, -0.3), 0, 14, 12), 2.4);
  gloss(b, -10, -10, 7, 3.4, 0.55, -0.5);
  for (const x of [-5, 0, 5]) eye(l, x, 15 + (x ? 0 : 2), 1.3, ACID, 2.6);
}

// A spore pod: a veined translucent sac glowing from inside, a curled shape asleep in it.
function carrier(b, l, f, c) {
  for (const x of [-7, 0, 7]) {
    const tip = [[x * 0.6, 18], [x + (f ? 2 : -2), 25], [x * 1.1 + (f ? -1 : 1), 32]];
    path(b, tip, true);
    line(b, OOZE, 3.4);
    path(b, tip, true);
    line(b, shade(c, -0.5), 1.6);
  }
  ellipse(b, 0, -2, 18, 22);
  ink(b, rad(b, 0, 0, 0, 22, [[0, shade(c, 0.5)], [0.55, rgba(c, 0.9)], [1, shade(c, -0.55)]]), 3);
  b.fillStyle = rgba('#1a2a06', 0.5); // the thing asleep inside: a head and a curled tail
  ellipse(b, -2, -6, 5.5, 4.5);
  b.fill();
  b.beginPath();
  b.arc(1, 0, 6, -0.9, Math.PI * 1.1);
  line(b, rgba('#1a2a06', 0.5), 3.4);
  for (const x of [-12, -5, 6, 13]) {
    path(b, [[x * 0.5, -23], [x, -6], [x * 0.8, 12], [x * 0.3, 19]], true);
    line(b, rgba('#2a4a0a', 0.55), 1.3);
  }
  gloss(b, -6, -13, 4, 7, 0.6, 0.3);
  bloom(l, 0, -2, 34, c, 0.5 + f * 0.15);
}

export default { rate: 2.2, bob: 2, halo: 0.16, crack: ACID, grunt, diver, gunner, armored, carrier };
