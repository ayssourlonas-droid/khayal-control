// The Squall Ray's storm heart (World 18, Anvil Sky; see ray.js): a weak part 150 x 96 in the middle of its back. A RIFT torn through the cloud (ray-shape.js RIFT, a
// ragged opening 130 x 62; the hull paints its rolled lips of cloud, ray-seat.js) held shut by iron staples (riveted straps clamped across the lip);
// behind it a dark hollow, and in the hollow the heart: a defined orb of electric violet and cyan fifty px across, its colour deepest at the rim and a small white core,
// with swirl streaks wound into it and rings round it that the live layer (ray-fx.js) sets pulsing. The body layer holds the hollow, the orb, its swirl and the staples; the
// lights layer is the heart itself: a violet bloom and a smaller cyan one, the concentric rings, the swirl, the rim of the rift burning along its edge, a few thin bolts
// leaping from the orb to the lips, and a small white core (the one white on it: nothing else is let to blaze). Part coordinates (the part's centre is the origin).
// Bake-time only.
import { PAL, rng, path, line, rad, rgba, bloom, circle, TAU } from './ray-kit.js';
import { ink, glare, neon } from '../aliens/w18-kit.js';
import { RIFT } from './ray-shape.js';
import { fork, strike } from './ray-bolt.js';
import { slab, rivetsOn } from './ray-iron.js';

export const ORB = 26; // the orb's radius

function hollow(b) {
  path(b, RIFT);
  b.fillStyle = rad(b, 0, 0, 0, 64, [[0, '#3a1c8a'], [0.3, '#170c4a'], [0.65, '#080a2a'], [1, '#04061a']]);
  b.fill();
}

// One arm of the swirl: a spiral from out at angle a0 in toward the core, as a polyline.
const arm = (a0, r0 = ORB - 3, r1 = 5) => Array.from({ length: 14 }, (_, i) => {
  const t = i / 13;
  const [a, r] = [a0 + 2.4 * t, r0 + (r1 - r0) * t];
  return [Math.cos(a) * r, Math.sin(a) * r];
});

function orb(b) {
  for (const [r, a] of [[ORB + 15, 0.5], [ORB + 7, 0.6]]) { // the rings of the hollow, dark on the body
    circle(b, 0, 0, r);
    b.lineWidth = 2;
    b.strokeStyle = rgba('#02030f', a);
    b.stroke();
  }
  circle(b, 0, 0, ORB);
  ink(b, rad(b, -6, -7, 1, ORB + 2, [[0, '#e8fcff'], [0.14, '#7af4ff'], [0.4, '#5a6cff'], [0.72, '#4524c4'], [1, '#170a60']]), 2.4);
  b.save();
  circle(b, 0, 0, ORB - 1);
  b.clip();
  for (let k = 0; k < 4; k++) {
    path(b, arm((k * TAU) / 4), true);
    line(b, rgba('#06041e', 0.45), 4.4);
    path(b, arm((k * TAU) / 4), true);
    line(b, rgba('#bff8ff', 0.6), 1.8);
  }
  b.restore();
}

function staples(b) {
  for (const [x, y, w, h, tilt] of [[-62, -2, 14, 34, 0.15], [62, 2, 14, 34, -0.15], [-28, -29, 12, 20, 0.1], [30, 28, 12, 20, 0.1]]) {
    b.save();
    b.translate(x, y);
    b.rotate(tilt);
    slab(b, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], PAL.iron, { lw: 1.8, wear: 0.4, rust: 0.1, seed: Math.round(x + 9) });
    rivetsOn(b, [[0, -h / 2 + 4], [0, h / 2 - 4]], 1.7);
    b.restore();
  }
}

function lights(l) {
  const r = rng(27);
  bloom(l, 0, 0, 60, PAL.violet, 0.3);
  bloom(l, 0, 0, 36, PAL.cyan, 0.3);
  for (const [rr, c, a, w] of [[ORB + 7, PAL.cyan, 0.55, 1.4], [ORB + 15, PAL.violet, 0.4, 1.2], [ORB + 24, PAL.violet, 0.22, 1]]) { // the rings that pulse
    circle(l, 0, 0, rr);
    neon(l, c, w, a);
  }
  l.beginPath(); // the swirl, all four arms as one stroke
  for (let k = 0; k < 4; k++) arm((k * TAU) / 4).forEach(([x, y], i) => (i ? l.lineTo(x, y) : l.moveTo(x, y)));
  neon(l, PAL.cyan, 1, 0.45);
  path(l, RIFT);
  neon(l, PAL.violet, 1, 0.4);
  for (let i = 0; i < 5; i++) { // thin bolts from the orb out to the lips
    const a = (i / 5) * TAU + 0.3 + 0.3 * r();
    const end = RIFT[Math.round(((((a / TAU) % 1) + 1) % 1) * RIFT.length) % RIFT.length];
    const [ex, ey] = [end[0] * (0.5 + 0.2 * r()), end[1] * (0.5 + 0.2 * r())];
    strike(l, fork(i * 3 + 1, Math.cos(a) * ORB, Math.sin(a) * ORB, ex, ey, 6, 6, 1), i % 2 ? PAL.cyan : PAL.violet, 1.2, 0.8);
  }
  glare(l, 0, 0, 6, PAL.white, 1);
}

export function heart(b, l) {
  b.save();
  l.save();
  hollow(b);
  orb(b);
  staples(b);
  lights(l);
  b.restore();
  l.restore();
}
