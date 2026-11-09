// Smooth dark smoke for the Craving's hands (World 17, Ash to Air; the hard parts' kit, beside craving-pkit.js), painted without the smoke
// body's sprites so that a hand reads as one bold dark shape against the churning mass behind it: a CLOUD is a dense charcoal core
// feathered to nothing at its edge, with a few soft lighter lobes in it, a cold light on its top, an ember glow under it and a
// sprinkle of embers; STREAKS are long thin ribbons of lighter and darker smoke running along a curve (a finger, the forearm), the grain
// of smoke flowing along it. Bake-time only.
import { hash } from '../sprites.js';
import { embers, rad, lin, rgba, ribbon, rng, IRON, ASH, COAL, SOOT } from './craving-pkit.js';

// A cloud of smoke over the ellipse (cx, cy, rx, ry).
export function cloud(g, cx, cy, rx, ry, seed) {
  g.save();
  g.translate(cx, cy);
  g.scale(1, ry / rx);
  g.fillStyle = rad(g, 0, 0, 0, rx, [[0, IRON[1]], [0.5, rgba(IRON[1], 0.97)], [0.78, rgba(IRON[2], 0.8)], [1, rgba(IRON[0], 0)]], 0, rx * 0.15);
  g.beginPath();
  g.arc(0, 0, rx, 0, Math.PI * 2);
  g.fill();
  for (let i = 0; i < 7; i++) { // soft lobes of lighter smoke inside it
    const a = hash(seed * 11 + i) * Math.PI * 2;
    const d = rx * (0.15 + 0.5 * hash(seed * 13 + i));
    const [x, y, r] = [Math.cos(a) * d, Math.sin(a) * d, rx * (0.28 + 0.22 * hash(seed * 17 + i))];
    g.fillStyle = rad(g, x, y, 0, r, [[0, rgba(ASH[1], 0.4)], [0.6, rgba(ASH[0], 0.2)], [1, rgba(ASH[0], 0)]]);
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = lin(g, 0, -rx, 0, rx, [[0, 'rgba(160,172,190,0.2)'], [0.4, 'rgba(160,172,190,0)'], [0.75, rgba(COAL[1], 0)], [1, rgba(COAL[2], 0.2)]]);
  g.beginPath();
  g.arc(0, 0, rx * 0.95, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.save();
  g.beginPath();
  g.ellipse(cx, cy, rx * 0.8, ry * 0.8, 0, 0, Math.PI * 2);
  g.clip();
  embers(g, rng(seed + 400), cx - rx, cy - ry, rx * 2, ry * 2, 26, 0.5);
  g.restore();
}

// n ribbons of smoke along the cubic, spread across `width`, alternately pale and dark, drawn over what is there (clip first).
export function streaksAlong(g, curve, width, n, seed) {
  for (let k = 0; k < n; k++) {
    const o = ((k + 0.5) / n - 0.5) * width * 0.9 + (hash(seed * 5 + k) - 0.5) * 3;
    const c = curve.map(([x, y], i) => {
      const [nx, ny] = i === 0 ? [curve[1][1] - y, x - curve[1][0]] : i === 3 ? [y - curve[2][1], curve[2][0] - x] : [curve[i + 1][1] - curve[i - 1][1], curve[i - 1][0] - curve[i + 1][0]];
      const len = Math.hypot(nx, ny) || 1;
      return [x + (nx / len) * o, y + (ny / len) * o];
    });
    ribbon(g, c, 2 + hash(seed * 7 + k) * 4, 1, 12, 0.8);
    g.fillStyle = k % 3 === 1 ? rgba(ASH[1], 0.3) : rgba(SOOT, 0.34);
    g.fill();
  }
}
