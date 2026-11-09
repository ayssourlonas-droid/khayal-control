// The brow and socket of the Craving's eye (World 17, Ash to Air; see craving-eye.js), painted as the LEFT eye (the inner corner, at
// +x, lower than the outer: an angry slant): the dark socket the eye burns in (soot fading out into the head), a heavy brow ridge of
// charred ash slanting down toward the nose, cold light along its top and a crack in it with an ember, grain and soot, the shadow it
// throws over the top of the eye, a crust of ash under the lower lid, and two thin curls of smoke rising from the socket's outer
// corner. Eye coordinates (the part's centre is the origin). Bake-time only.
import { fringe, feather } from './craving-pkit-edge.js';
import { blobPath, crack, embers, grain, line, lin, rad, rgba, ribbon, rng, streaks, path, circle, SOOT, IRON, ASH, COAL } from './craving-pkit.js';

export const OUTER = [-50, -5]; // the eye's corners and the lids' control points
export const INNER = [47, 15];
export const UP = [-2, -30];
export const DOWN = [4, 33];

export const almond = (g) => {
  g.beginPath();
  g.moveTo(...OUTER);
  g.quadraticCurveTo(...UP, ...INNER);
  g.quadraticCurveTo(...DOWN, ...OUTER);
  g.closePath();
};

export function socket(b) { // the dark the eye sits in, fading out into the head
  fringe(b, 2, 3, 46, 25, 6, 48, 19);
  circle(b, 2, 3, 62);
  b.fillStyle = rad(b, 2, 3, 20, 62, [[0, rgba(SOOT, 0.95)], [0.55, rgba(SOOT, 0.7)], [1, rgba(SOOT, 0)]]);
  b.fill();
}

export function brow(b, l) {
  const r = rng(43);
  const ridge = [[-58, -22], [-44, -34], [-14, -33], [20, -22], [54, -3], [58, 12], [44, 10], [16, -8], [-14, -16], [-42, -14], [-56, -10]];
  blobPath(b, ridge);
  b.fillStyle = lin(b, 0, -36, 0, 8, [[0, IRON[4]], [0.3, IRON[2]], [0.8, IRON[1]], [1, SOOT]]);
  b.fill();
  b.save();
  blobPath(b, ridge);
  b.clip();
  grain(b, -62, -40, 124, 56, 1.3);
  embers(b, r, -62, -40, 124, 56, 50, 0.5);
  streaks(b, r, -56, 56, -36, 8, 12, SOOT, 0.4, 0.9);
  for (let i = 0; i < 8; i++) { // ridges of crust running along it
    const x = -50 + r() * 100;
    path(b, [[x, -30 + x * 0.2 + r() * 6], [x + 14 + r() * 10, -26 + x * 0.2 + 3 + r() * 8]], true);
    line(b, rgba(i % 2 ? SOOT : ASH[2], 0.35), 1.2);
  }
  b.restore();
  path(b, [[-56, -22], [-44, -33], [-14, -32], [20, -21], [52, -3]], true);
  line(b, rgba(ASH[3], 0.55), 1.4); // the cold light along its top
  blobPath(b, ridge);
  line(b, SOOT, 2.2);
  crack(b, l, [[-6, -31], [0, -24], [-4, -18], [3, -12]], 1.8, COAL[3], 0.5); // a crack with an ember in it
  crack(b, l, [[30, -17], [34, -11], [31, -5]], 1.4, COAL[3], 0.45);
  feather(b, 0, -30, 0, -42, 0.5, -80, -70, 160, 50); // the ridge's top and its outer end dissolve into the smoke
  feather(b, -50, 0, -66, 0, 0.55, -90, -70, 60, 90);
}

export function shadow(b) { // the brow's shadow over the top of the eyeball
  b.save();
  almond(b);
  b.clip();
  b.fillStyle = lin(b, 0, -26, 0, 10, [[0, 'rgba(6,2,1,0.75)'], [1, 'rgba(6,2,1,0)']]);
  b.fillRect(-56, -30, 112, 44);
  b.restore();
  almond(b);
  line(b, rgba(SOOT, 0.9), 3);
}

export function cheek(b) { // a crust of ash under the lower lid
  const rb = ribbon(b, [[-44, 4], [-20, 30], [20, 36], [50, 20]], 3, 9, 14, 0.6);
  b.fillStyle = lin(b, 0, 14, 0, 42, [[0, IRON[3]], [1, IRON[1]]]);
  b.fill();
  path(b, rb.left, true);
  line(b, rgba(ASH[3], 0.4), 1);
  line(b, rgba(SOOT, 0.8), 1.4);
}

export function curls(b) { // thin smoke from the socket's outer corner
  for (const [c, w] of [[[[-48, -16], [-68, -28], [-52, -42], [-68, -54]], 9], [[[-40, -22], [-50, -38], [-34, -48], [-44, -58]], 7]]) {
    ribbon(b, c, w, 1, 14, 0.8);
    b.fillStyle = rgba('#8a7a6c', 0.2);
    b.fill();
  }
}
