// World 14, Ember Carnival: the invaders are clockwork toys from the prize booths, pressed tin and enamel,
// gilt paper and ribbon, every one stuffed with powder. A tin wind-up drone, the first of them, is here;
// the firework rocket is in w14-2.js, the jack-in-the-box turret in w14-3.js (its head and crank in
// w14-7.js), the tin drummer in w14-4.js (its drum and arms in w14-8.js) and the balloon carrier in w14-5.js
// (its balloons and gift box in w14-9.js); the drone's wings and boots are in w14-6.js and what they all
// share in w14-kit.js. Anything that glows or burns (eyes, bulbs, fuses, sparks, the lantern) is on the
// lights layer. Sprites face down, toward the ship. `shellAt` is where a fuse plug can sprout from each toy,
// for the shells of the fireworks twist (shell-view.js): the fuse then rises about 26 px above the point.
import { diver } from './w14-2.js';
import { gunner } from './w14-3.js';
import { armored } from './w14-4.js';
import { carrier } from './w14-5.js';
import { wing, boot } from './w14-6.js';
import { path, ink, lin, rad, rgba, shade, bloom, eye, gloss, line, ellipse } from './w14-kit.js';
import { TIN, CREAM, RED, NAVY, HOT, rivet, star5, key, glint, halo, silverH, tinV } from './w14-kit.js';

// A tin wind-up drone: a pressed enamel pod in two halves joined by tabs, a printed belt of stars, one
// big glass eye, a pair of tin wings that beat (up on one beat, down on the other), boots that step and a
// winding key on its back that turns a notch with every beat.
function grunt(b, l, f, c) {
  const [dark, mid] = [shade(c, -0.6), shade(c, -0.3)];
  const s = f ? 1 : -1;
  wing(b, 1, 15, 1, f ? 0.36 : -0.42, c);
  wing(b, -1, -15, 1, f ? 0.36 : -0.42, c);
  boot(b, -10, f ? 28 : 23, c);
  boot(b, 10, f ? 23 : 28, c);
  key(b, 11, -9.5, f ? 0.95 : 0.3, 1);
  ellipse(b, 0, 3, 20, 17.4); // the pod
  ink(b, rad(b, 0, 3, 3, 27, [[0, shade(c, 0.5)], [0.42, c], [1, dark]], -7, -7), 3);
  b.save();
  ellipse(b, 0, 3, 20, 17.4);
  b.clip();
  b.fillStyle = lin(b, 0, 9, 0, 17, [[0, mid], [0.12, CREAM], [0.8, shade(CREAM, -0.2)], [1, shade(CREAM, -0.6)]]); // the printed belt
  b.fillRect(-21, 9, 42, 8);
  for (let x = -16; x <= 16; x += 8) star5(b, x, 13, 2.5, x % 16 ? RED : NAVY);
  path(b, [[-21, 9], [21, 9]], true);
  line(b, rgba(NAVY, 0.55), 1);
  for (const [r, a0, a1, col] of [[17, 3.5, 5.9, 0.28], [13.6, 3.5, 5.9, 0.2], [17, 0.35, 2.7, -0.3]]) { // pressed ridges
    b.beginPath();
    b.ellipse(0, 3, r * 1.07, r, 0, a0, a1);
    line(b, rgba(col > 0 ? '#ffffff' : '#000000', Math.abs(col)), 1);
  }
  for (const m of [-1, 1]) star5(b, m * 12.6, -4.6, 2.2, rgba(CREAM, 0.85)); // printed stars up on the shoulders
  path(b, [[0, -15], [0, 8]], true); // the seam of the two halves
  line(b, rgba('#000000', 0.45), 1.2);
  path(b, [[1, -15], [1, 8]], true);
  line(b, rgba('#ffffff', 0.3), 0.8);
  for (const y of [-11, -4, 3]) { // the tabs that hold them together
    path(b, [[-2.6, y], [2.6, y], [2.6, y + 2], [-2.6, y + 2]]);
    ink(b, silverH(b, -2.6, 2.6), 0.9);
  }
  b.restore();
  gloss(b, -10, -6, 7.4, 2.8, 0.5, -0.55);
  for (const m of [-1, 1]) { // shoulder lamps, one blinking on each beat
    ellipse(b, m * 13.4, 13.4, 3, 3);
    ink(b, rad(b, m * 13.4, 13.4, 0.3, 3, [[0, '#ffffff'], [0.6, HOT], [1, shade(HOT, -0.5)]]), 1.2);
  }
  ellipse(b, 0, 3.6, 11.4, 11.4); // the eye: a tin bezel bolted round a glass iris
  ink(b, lin(b, -10, -8, 10, 12, [[0, '#ffffff'], [0.4, TIN], [1, shade(TIN, -0.6)]]), 2.4);
  for (let i = 0; i < 8; i++) rivet(b, Math.cos(i * 0.785 + 0.4) * 9.6, 3.6 + Math.sin(i * 0.785 + 0.4) * 9.6, 0.8, TIN);
  ellipse(b, 0, 3.6, 7.8, 7.8);
  ink(b, rad(b, 0, 3.6, 0, 8, [[0, '#e8fff0'], [0.5, shade(c, 0.1)], [1, shade(c, -0.7)]], -2, 1), 1.4);
  ellipse(b, s * 1.8, 4.6, 3.1, 3.6); // the pupil looks to one side and then the other
  b.fillStyle = '#04120a';
  b.fill();
  gloss(b, -2.6, 0.4, 3, 1.5, 0.8, -0.5);
  b.save();
  ellipse(b, 0, 3.6, 7.8, 7.8);
  b.clip();
  path(b, [[-9, -5], [9, -5], [9, 0.4], [0, 2.4], [-9, 0.4]]); // a tin lid frowning over it
  ink(b, tinV(b, -5, 2.4, TIN), 1.3);
  b.restore();
  eye(l, s * 1.8, 4.6, 3, c, 3.4);
  halo(l, 0, 3.6, 7.4, 17, c, 0.35);
  for (const m of [-1, 1]) bloom(l, m * 13.4, 13.4, m === s ? 9 : 5, HOT, m === s ? 0.95 : 0.35);
  eye(l, s * 13.4, 13.4, 1.6, HOT, 2);
  glint(l, f ? 16 : 12, f ? -23 : -25, 3, '#fff6d0', 0.9);
  bloom(l, 0, 3, 38, c, 0.1 + f * 0.04);
}

export const shellAt = { grunt: [-9, -12], diver: [0, -32], gunner: [0, -37], armored: [0, -41], carrier: [0, -43] };

export default { rate: 2, bob: 2, halo: 0.22, crack: '#e8eef6', shellAt, grunt, diver, gunner, armored, carrier };
