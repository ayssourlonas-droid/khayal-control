// The Squall Ray's live lightning, baked (World 18, Anvil Sky; ray-fx.js draws it): every bolt the live layer flickers is a sprite made once from the
// forked bolts of ray-bolt.js, so a frame only blits them. ARCS are the coil's: five variants each of the arc that leaps from a coil's prong to the ball on
// the wing tip above it, and of the one from the coil's toroid up to its prong (painted for the LEFT side; the right is drawn through a mirror).
// STORM are the bolts that run through the cloud: six paths over the right wing and the body (the left drawn mirrored), pale cyan and white. Each comes
// as { img, x, y }, the sprite and where its top left lies in boss coordinates. warmBolts() bakes the lot ahead of the fight. Nothing above y -156.
import { cached } from '../sprites.js';
import { PAL, PART, TOP } from './ray-kit.js';
import { fork, strike } from './ray-bolt.js';
import { ELECTRODE, PRONG } from './ray-coil.js';
import { TIP_BALL } from './ray-shape.js';

export const VARIANTS = 5;
const LIMIT = 498; // no bolt goes past this x: the hull's canvas ends at 510 and a bolt has a glow
const made = new Map();

function sprite(key, [x0, y0], [x1, y1], seed, n, amp, forks, color, w) {
  let m = made.get(key);
  if (m) return m;
  const polys = fork(seed, x0, y0, x1, y1, n, amp, forks).map((pts) => pts.map(([x, y]) => [Math.max(-LIMIT, Math.min(LIMIT, x)), Math.max(y, TOP + 8)])); // kept on the hull's canvas
  const all = polys.flat();
  const [bx, by] = [Math.floor(Math.min(...all.map((p) => p[0]))) - 8, Math.floor(Math.min(...all.map((p) => p[1]))) - 8];
  const [bw, bh] = [Math.ceil(Math.max(...all.map((p) => p[0]))) + 8 - bx, Math.ceil(Math.max(...all.map((p) => p[1]))) + 8 - by];
  const img = cached(key, bw, bh, (g) => {
    g.translate(-bx, -by);
    strike(g, polys, color, w, 1);
  });
  m = { img, x: bx, y: by };
  made.set(key, m);
  return m;
}

const prong = [PART.coilL.x + PRONG[0], PART.coilL.y + PRONG[1]]; // the left coil's prong tip and electrode in boss coordinates
const electrode = [PART.coilL.x + ELECTRODE[0], PART.coilL.y + ELECTRODE[1]];
const tip = [-TIP_BALL[0], TIP_BALL[1]];

export const tipArc = (v) => sprite('raytiparc' + v, prong, tip, 3 + v, 6, 6, 1, PAL.cyan, 1.7);
export const coilArc = (v) => sprite('raycoilarc' + v, electrode, prong, 21 + v, 6, 5, 1, PAL.volt, 1.4);

// [x0, y0, x1, y1, segments, amplitude] of the paths through the cloud of the right side.
export const STORM_PATHS = [
  [130, -92, 330, -58, 12, 9], [190, -62, 420, -12, 12, 10], [170, 24, 300, 54, 9, 8], [340, -46, 466, -48, 9, 5], [110, 60, 300, 62, 11, 8], [44, -100, 92, 60, 9, 8],
];
export const storm = (i) => {
  const [x0, y0, x1, y1, n, amp] = STORM_PATHS[i];
  return sprite('raystorm' + i, [x0, y0], [x1, y1], 40 + i, n, amp, 2, i % 2 ? PAL.volt : PAL.ice, 1.6);
};

export function warmBolts() {
  for (let v = 0; v < VARIANTS; v++) {
    tipArc(v);
    coilArc(v);
  }
  STORM_PATHS.forEach((_, i) => storm(i));
}
