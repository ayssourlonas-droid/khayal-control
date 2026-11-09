// World 13, Sunset Armada: the fleet of the golden hour, built of brass, hemp and patched canvas. A rotor
// drone, the first of them, is here; the gull-winged glider is in w13-2.js (its gull, scarf and pilot in
// w13-8.js), the balloon gun-pod in w13-3.js (its envelope in w13-9.js), the ironclad gunboat in w13-4.js
// (its balloons and smokestack in w13-5.js) and the cargo zeppelin in w13-6.js (its fins and engines in
// w13-7.js); what they share is in w13-kit.js. Anything that burns (lamps, fuses, furnaces, muzzle flash,
// glints) is on the lights layer. Sprites face down, toward the ship.
import { diver } from './w13-2.js';
import { gunner } from './w13-3.js';
import { armored } from './w13-4.js';
import { carrier } from './w13-6.js';
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, TAU, INK } from './kit.js';
import { BRASS, HOT, AETHER, RED, brass, brassV, rope, rivet, blade, glint, sunlit, sun, halo } from './w13-kit.js';

// The rotor: three blades whirling over a faint disc of blur. The blades whose tips swing away from us
// (sin < 0) go behind the mast and hub, the rest in front; the beats turn them by about a third of the way.
function rotor(b, l, f, c, front) {
  const [cy, rx, ry] = [-31, 39.5, 6.2];
  if (!front) {
    ellipse(b, 0, cy, rx + 1, ry + 1);
    b.fillStyle = rgba(shade(c, 0.5), 0.15);
    b.fill();
    line(b, rgba(INK, 0.3), 0.8);
  }
  for (let k = 0; k < 3; k++) {
    const a = (f ? 0.95 : 0.2) + (k * TAU) / 3;
    if ((Math.sin(a) >= 0) !== front) continue;
    const [tx, ty] = [Math.cos(a) * rx, cy + Math.sin(a) * ry];
    blade(b, 0, cy, tx, ty, 2.5, c);
    glint(l, tx, ty, 2.4 + (k === 0 ? 0.9 : 0), '#fff6d0', 0.8);
  }
}

// A small side propeller on a motor can: a disc of blur and two blades that stand upright on one beat
// and lean on the other.
function sideProp(b, l, f, m, c) {
  path(b, [[m * 18, 3], [m * 30, 2.4], [m * 30, 9.6], [m * 18, 9]]);
  ink(b, brassV(b, 2, 10), 2);
  ellipse(b, m * 31.4, 6, 2.6, 5.4);
  ink(b, shade(BRASS, -0.45), 1.8);
  ellipse(b, m * 35.4, 6, 8, 8);
  b.fillStyle = rgba(shade(c, 0.5), 0.14);
  b.fill();
  line(b, rgba(INK, 0.3), 0.8);
  const a = f ? 0.62 : 1.5708;
  for (const k of [0, 1]) {
    const [dx, dy] = [Math.cos(a + k * Math.PI) * 8, Math.sin(a + k * Math.PI) * 8];
    blade(b, m * 35.4, 6, m * 35.4 + dx, 6 + dy, 1.7, c);
  }
  ellipse(b, m * 35.4, 6, 2.2, 2.2);
  ink(b, brass(b, m * 33.4, m * 37.4), 1.4);
  glint(l, m * 35.4 + Math.cos(a) * 8, 6 + Math.sin(a) * 8, 1.9, '#fff6d0', 0.7);
}

// A brass rotor drone: a riveted pod of plates with an equator belt, a glass eye-lamp under an angry
// brow lid whose pupil looks left on one beat and right on the other, a three-bladed rotor on a stayed
// mast, a small propeller out on each side, springy legs and a round bomb with a lit fuse in its bay.
function grunt(b, l, f, c) {
  const [dark, mid] = [shade(c, -0.6), shade(c, -0.3)];
  const s = f ? 1 : -1;
  rotor(b, l, f, c, false);
  both((m) => { // legs: a bent strut, a clamp at the knee, a foot pad
    path(b, [[m * 11, 13], [m * 12.6, 23], [m * 17, 30.5]], true);
    line(b, INK, 5);
    line(b, mid, 2.4);
    rivet(b, m * 12.6, 23, 1.6);
    ellipse(b, m * 17.6, 32, 6, 2.3);
    ink(b, brassV(b, 30, 34), 1.7);
  });
  both((m) => sideProp(b, l, f, m, c));
  ellipse(b, 0, 29.5, 6.2, 6.8); // the bomb, in its bay
  ink(b, rad(b, 0, 29.5, 1, 9, [[0, '#9aa6bc'], [0.5, '#4a5468'], [1, '#161a28']], -2, 27), 2);
  path(b, [[-2.4, 22.6], [2.4, 22.6], [2.8, 25], [-2.8, 25]]);
  ink(b, brassV(b, 22, 25), 1.4);
  b.beginPath();
  b.arc(0, 29.5, 6.2, 0.3, Math.PI - 0.3);
  line(b, rgba(BRASS, 0.85), 1.2);
  gloss(b, -2.4, 27.4, 2.2, 1.4, 0.7);
  path(b, [[-2.2, -14], [2.2, -14], [1.7, -31], [-1.7, -31]]); // the mast
  ink(b, brass(b, -2.5, 2.5), 1.9);
  both((m) => rope(b, m * 0.8, -28, m * 15, -10, m * 1.5, -1));
  ellipse(b, 0, 2, 22, 18); // the pod
  ink(b, rad(b, 0, 2, 3, 27, [[0, shade(c, 0.42)], [0.42, c], [1, dark]], -8, -8), 3);
  b.save();
  ellipse(b, 0, 2, 22, 18);
  b.clip();
  sunlit(b, 4, 20, 0.45);
  b.fillStyle = lin(b, 0, 7, 0, 14, [[0, mid], [0.5, shade(BRASS, 0.2)], [1, shade(BRASS, -0.55)]]); // the belt
  b.fillRect(-23, 7.5, 46, 6.5);
  path(b, [[-23, 7.6], [23, 7.6]], true);
  line(b, rgba('#ffffff', 0.5), 0.9);
  both((m) => {
    b.beginPath(); // a seam of plates down each side of the pod
    b.moveTo(m * 5, -17);
    b.quadraticCurveTo(m * 15, 2, m * 5, 21);
    line(b, rgba('#000000', 0.45), 1.3);
    b.translate(m * 1, 0);
    b.beginPath();
    b.moveTo(m * 5, -17);
    b.quadraticCurveTo(m * 15, 2, m * 5, 21);
    line(b, rgba('#ffffff', 0.25), 0.8);
    b.translate(-m * 1, 0);
    for (const t of [0.14, 0.3, 0.44, 0.88]) {
      const u = 1 - t;
      rivet(b, u * u * m * 5 + 2 * u * t * m * 10 + t * t * m * 5, u * u * -17 + 2 * u * t * 2 + t * t * 21, 1.1, c);
    }
  });
  for (let x = -18; x <= 18; x += 6) if (Math.abs(x) > 9.5) rivet(b, x, 10.8, 1, BRASS);
  for (const [x, y, w] of [[-14, -6, 4], [12, -10, 3], [-6, -13, 5]]) { // scuffs and wear on the plates
    b.beginPath();
    b.moveTo(x, y);
    b.lineTo(x + w, y + 1);
    line(b, rgba(dark, 0.5), 1);
  }
  sun(b, 15, -3.4, 3.3, RED); // the fleet's mark
  b.restore();
  gloss(b, -11, -8.4, 7, 2.8, 0.42, -0.55);
  ellipse(b, 0, -14.4, 7, 2.6); // the mast's collar
  ink(b, brass(b, -7, 7), 1.7);
  ellipse(b, 0, 3.5, 10.6, 10.6); // the eye-lamp: a bezel of bolts round a dark ring and a glass iris
  ink(b, rad(b, 0, 3.5, 5, 12, [[0, shade(BRASS, 0.5)], [1, shade(BRASS, -0.5)]], -3, 0), 2.6);
  for (let i = 0; i < 8; i++) rivet(b, Math.cos((i * TAU) / 8 + 0.4) * 8.9, 3.5 + Math.sin((i * TAU) / 8 + 0.4) * 8.9, 0.85, BRASS);
  ellipse(b, 0, 3.5, 7.4, 7.4);
  ink(b, '#082a3a', 1.4);
  ellipse(b, 0, 3.5, 6.4, 6.4);
  b.fillStyle = rad(b, 0, 3.5, 0, 6.6, [[0, '#d8fbff'], [0.5, '#38b4d4'], [1, '#0a3c58']]);
  b.fill();
  ellipse(b, s * 1.5, 5.4, 1.7, 3.4);
  b.fillStyle = '#031018';
  b.fill();
  b.save();
  ellipse(b, 0, 3.5, 6.4, 6.4);
  b.clip();
  path(b, [[-8, -5], [8, -5], [8, -0.8], [0, 2.8], [-8, -0.8]]); // the lid, frowning inward
  ink(b, lin(b, 0, -5, 0, 2.8, [[0, shade(BRASS, 0.3)], [1, shade(BRASS, -0.6)]]), 1.6);
  b.restore();
  gloss(b, 2.8, 7.4, 2.2, 1.1, 0.7);
  l.save(); // the glass burns below the lid
  ellipse(l, 0, 3.5, 6.4, 6.4);
  l.clip();
  path(l, [[-8, 12], [-8, -0.8], [0, 2.8], [8, -0.8], [8, 12]]);
  l.clip();
  bloom(l, 0, 5.5, 9, AETHER, 0.7);
  l.restore();
  ellipse(l, 0, 3.5, 6.9, 6.9);
  line(l, rgba(AETHER, 0.8), 1.2);
  halo(l, 0, 3.5, 10.4, 18, AETHER, 0.22);
  eye(l, -2.4, 5.6, 0.9, '#ffffff', 3);
  ellipse(b, 0, -31, 3.8, 3.2); // the rotor's hub
  ink(b, rad(b, 0, -31, 0.5, 4, [[0, '#fff0c0'], [0.5, BRASS], [1, shade(BRASS, -0.6)]], -1, -32), 1.7);
  rotor(b, l, f, c, true);
  for (const [x1, y1, x2, y2] of [[-8, 18.6, -2.6, 22.4], [8, 18.6, 2.6, 22.4]]) { // the bay's doors, ajar
    path(b, [[x1, y1], [x2, y2], [x2 + (x2 > 0 ? 3 : -3), y2 + 2.6]]);
    ink(b, shade(BRASS, -0.2), 1.2);
  }
  b.beginPath(); // the fuse, and its spark
  b.moveTo(0.6, 22.4);
  b.quadraticCurveTo(3.8, 21, 5.4, 18.8);
  line(b, INK, 2.6);
  line(b, '#c8a070', 1.1);
  glint(l, 5.6, 18.4, f ? 3.6 : 2.4, '#fff0c0', 1);
  bloom(l, 5.6, 18.4, f ? 8 : 6, HOT, 0.8);
  bloom(l, 0, 2, 38, c, 0.1 + f * 0.04);
}

export default { rate: 2, bob: 2, halo: 0.22, crack: '#ffb54a', grunt, diver, gunner, armored, carrier };
