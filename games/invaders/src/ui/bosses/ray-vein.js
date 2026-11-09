// The lightning The Squall Ray's cloud keeps in it, baked on the hull's lights layer (World 18, Anvil Sky; ray-hull.js): VEINS, a few thick forked bolts
// with a falloff of light round them (violet and cyan, a white core) through the parts of the wings and the head that no iron covers, so that the live
// arcs (ray-fx.js) are what flickers over them and the still picture is not a net of scratches; RAIN, faint streaks hanging from the pouches under the wings.
// Nothing is drawn above TOP. Bake-time only.
import { PAL, TOP, hash, rgba, lin } from './ray-kit.js';
import { POUCHES } from './ray-shape.js';
import { fork, strike } from './ray-bolt.js';

// Veins: [seed, x0, y0, x1, y1, segments, amplitude, alpha, width, forks, colour] for the right side; the left is mirrored.
const VEINS = [
  [1, 112, 66, 448, 14, 12, 15, 0.85, 2.6, 3, PAL.violet],
  [2, 330, -76, 462, -50, 7, 8, 0.8, 2.2, 2, PAL.cyan],
  [4, 160, 100, 280, 82, 8, 8, 0.7, 1.9, 1, PAL.cyan],
];

export function veins(l) {
  l.save();
  for (const s of [-1, 1]) {
    for (const [seed, x0, y0, x1, y1, n, amp, a, w, forks, c] of VEINS) {
      const polys = fork(seed, x0, y0, x1, y1, n, amp, forks).map((pts) => pts.map(([x, y]) => [s * x, Math.max(y, TOP + 2)]));
      strike(l, polys, c, w, a);
    }
  }
  l.restore();
}

// Rain hanging from the pouches under the wings: a faint slanted streak or two from each, fading out.
export function rain(l) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.lineCap = 'round';
  l.lineWidth = 1.3;
  for (const s of [-1, 1]) {
    POUCHES.forEach(([px, py, pr], i) => {
      for (let k = 0; k < 2; k++) {
        const [x0, y0] = [s * (px + (hash(i * 7 + k * 3 + 1) - 0.5) * pr), py + pr * 0.75];
        const len = 28 + 50 * hash(i * 5 + k * 11 + 2);
        const [x1, y1] = [x0 - s * 0.12 * len, y0 + len];
        l.strokeStyle = lin(l, x0, y0, x1, y1, [[0, rgba(PAL.ice, 0.3)], [1, rgba(PAL.ice, 0)]]);
        l.beginPath();
        l.moveTo(x0, y0);
        l.lineTo(x1, y1);
        l.stroke();
      }
    });
  }
  l.restore();
}
