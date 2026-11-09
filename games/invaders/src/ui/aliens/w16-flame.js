// World 16, Glass Cathedral, the gunner's flame (see w16-3.js): a candle wisp, a teardrop of fire with a face.
// On beat 0 it burns small and gold with a calm little mouth; on beat 1 it has flared, as if it had fired:
// taller, wider, whiter, the mouth open wide, tongues of fire licking up, embers flying, and a hot bloom
// on the lights layer. The flame is drawn between the lantern's back glass and its front sheen, so the glass
// is lit by it. Lights: the bloom, the white-hot core, the eyes' glint.
import { bez, path, rad, rgba, mix, ellipse, bloom, spark, hash, circle, line, TAU } from './w16-kit.js';

const Y0 = 13; // the flame's base, in the lantern

// The flame's outline: a teardrop from its base round the belly up to a tip that leans a little.
function outline(h, w, lean) {
  const tip = [lean, Y0 - h];
  const right = bez([0, Y0 + 2], [w * 0.62, Y0 + 2], [w * 0.74, Y0 - h * 0.4], tip, 10);
  const left = bez(tip, [-w * 0.74, Y0 - h * 0.4], [-w * 0.62, Y0 + 2], [0, Y0 + 2], 10);
  return [...right, ...left];
}

// The wisp on beat f, in the lantern's colour c: the glow behind, the flame, the face, the tongues, the embers.
export function flame(b, l, f, c) {
  const [h, w] = f ? [34, 21] : [26, 15];
  if (f) {
    for (const [dx, hh] of [[-8.6, 14], [9, 17]]) { // tongues licking up beside the flame
      path(b, outline(hh, 7, dx * 0.5).map(([x, y]) => [x + dx, y + 1]));
      b.fillStyle = rgba(mix(c, '#ffffff', 0.35), 0.9);
      b.fill();
    }
  }
  path(b, outline(h, w, f ? 2.4 : 1));
  b.fillStyle = rad(b, 0, Y0 - h * 0.28, 0, h * 0.62, [[0, '#fffef4'], [0.32, '#fff0b0'], [0.7, mix(c, '#ffd25a', 0.4)], [1, mix(c, '#c4400a', 0.55)]]);
  b.fill();
  line(b, rgba('#b04a08', 0.8), 1.2);
  const fy = Y0 - h * 0.44; // the face, high in the flame, over its bright base
  for (const m of [-1, 1]) {
    ellipse(b, m * 4.6, fy - 1, 1.9, 2.8, m * 0.28);
    b.fillStyle = '#6a2a06';
    b.fill();
    circle(b, m * 4.6 - 0.5, fy - 2.4, 0.8);
    b.fillStyle = '#fff6d8';
    b.fill();
  }
  if (f) ellipse(b, 0, fy + 6, 3.2, 3.8);
  else ellipse(b, 0, fy + 5.4, 2, 1.4);
  b.fillStyle = '#6a2a06';
  b.fill();
  bloom(l, 0, Y0 - h * 0.3, h * (f ? 1.05 : 0.95), c, f ? 0.5 : 0.34);
  spark(l, 0, Y0 - 1.5, f ? 3.2 : 2.4, '#fff6dc', f ? 0.9 : 0.7);
  if (!f) return;
  for (let i = 0; i < 3; i++) { // embers rising off the flare
    const a = hash(i * 7 + 3) * TAU;
    spark(l, 3 + Math.abs(Math.cos(a)) * 6 * (i % 2 ? 1 : -1), Y0 - h + 7 - hash(i * 7 + 4) * 9, 0.6 + hash(i * 7 + 5) * 0.4, '#ffe09a', 0.7);
  }
}
