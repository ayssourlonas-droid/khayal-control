// The shape of Aurora Kingdom's aurora: three curtains of light, each a ribbon hanging from a bright hem.
// Everything here is a pure function of x and t. aurora.js draws it as slices; the cliffs' rims, the
// castle's spires and the water ask lightAt how bright the sky is overhead.
// A curtain's hem is a sum of travelling waves, so folds run along it; its height, its brightness and
// the patches of the sky it fills are waves too. Every wave has a period of its own, from half a
// minute to several, and a swell on yet another period, so the shapes drift for minutes without
// meeting themselves again.
//   wave = [amp, k (rad/px), speed (rad/s), phase, swell (rad/s), swell phase]
//   warp = [amp px, k, speed, phase]: where the rays bunch and spread along the strip, so pleats travel
import { clamp, smooth } from '../core/math.js';

export const CURTAINS = [
  { // the main one: a green core, a violet crown, a magenta hem
    y: 400, h: 330, strength: 1, rho: 1, drift: 6, u0: 0,
    bend: [[92, 0.0017, 0.07, 0.3, 0.021, 0.5], [44, 0.0042, -0.14, 1.9, 0.034, 2.1], [17, 0.0095, 0.26, 4.0, 0.047, 4.4], [6, 0.02, -0.4, 2.2, 0.053, 1.1]],
    tall: [[0.4, 0.0021, 0.07, 1.1, 0.018, 0.9], [0.1, 0.0053, -0.15, 3.3, 0.027, 2.7]],
    patch: [0.0013, 0.6, -0.036], fold: [0.0058, 0.4, 0.3], warp: [70, 0.0049, 0.22, 1], surge: 0.7,
  },
  { // a teal one behind it, higher, running the other way
    y: 260, h: 235, strength: 1, rho: 1.21, drift: -9, u0: 211,
    bend: [[70, 0.0021, -0.06, 2.4, 0.026, 1.4], [33, 0.0059, 0.16, 0.7, 0.039, 3.6], [13, 0.0121, -0.29, 5.1, 0.052, 0.2]],
    tall: [[0.3, 0.0017, -0.06, 4.0, 0.022, 3.1], [0.08, 0.0061, 0.17, 0.4, 0.031, 1.8]],
    patch: [0.0017, 2.9, 0.029], fold: [0.0047, 2.2, -0.22], warp: [60, 0.0037, -0.17, 2], surge: 2.6,
  },
  { // a faint violet and magenta veil, low and wide
    y: 500, h: 190, strength: 0.6, rho: 0.83, drift: 4, u0: 407,
    bend: [[30, 0.0023, 0.08, 4.6, 0.019, 3.3], [14, 0.0074, -0.16, 2.2, 0.043, 5.0]],
    tall: [[0.22, 0.0025, 0.05, 2.2, 0.024, 0.3]],
    patch: [0.0011, 4.1, 0.041], fold: [0.0066, 5.0, 0.26], warp: [50, 0.0058, 0.2, 0.2], surge: 4.7,
  },
];

// How far the strip is slid along itself at x: its slope is how tightly the rays are bunched there.
export const warp = (c, x, t) => {
  const [a, k, s, p] = CURTAINS[c].warp;
  return a * Math.sin(k * x + p - s * t);
};

const swell = (w, t) => 0.75 + 0.25 * Math.sin(t * w[4] + w[5]);
const wave = (w, x, t) => w[0] * swell(w, t) * Math.sin(w[1] * x + w[3] - w[2] * t);

// Curtain c at screen x and time t, written into `out` (nothing is allocated): out.y the hem's y, out.h
// the curtain's height above it, out.b its brightness, 0 to about 1.3.
export function sample(c, x, t, out) {
  const k = CURTAINS[c];
  let y = k.y;
  for (const w of k.bend) y += wave(w, x, t);
  let h = 1;
  for (const w of k.tall) h += wave(w, x, t);
  const [pk, pp, ps] = k.patch;
  const patch = 0.62 * (0.5 + 0.5 * Math.sin(pk * x + pp + ps * t)) + 0.38 * (0.5 + 0.5 * Math.sin(pk * 2.3 * x - pp + ps * 0.6 * t));
  const [fk, fp, fs] = k.fold;
  const f = 0.5 + 0.5 * Math.sin(fk * x + fp - fs * t);
  const surge = 0.82 + 0.18 * Math.sin(t * 0.061 + k.surge) * Math.sin(t * 0.037 + k.surge * 1.3) + 0.3 * Math.max(0, Math.sin(t * 0.021 + k.surge)) ** 4;
  out.y = y;
  out.h = k.h * h;
  out.b = k.strength * (0.06 + 0.94 * smooth((patch - 0.18) / 0.6)) * (0.42 + 0.58 * f * f) * surge;
  return out;
}

const scratch = { y: 0, h: 0, b: 0 };

// How much of the aurora's light is over screen x at time t, 0 to 1: what the things it lights follow.
export function lightAt(x, t) {
  let sum = 0;
  for (let c = 0; c < CURTAINS.length; c++) sum += sample(c, x, t, scratch).b;
  return clamp(sum / 1.5, 0, 1);
}
