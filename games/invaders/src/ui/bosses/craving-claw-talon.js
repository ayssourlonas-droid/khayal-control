// One claw of the Craving's hand (World 17, Ash to Air; see craving-claw.js): a big hook of ash-black horn set on a finger's end. A tapered ribbon along a cubic that rises from the knuckle, arcs over and curls back down toward the palm, thick at the root and
// thin at the point: dark charcoal across its body with a cold grey edge along its upper side, rings of ridges across it like a claw's
// growth lines, an ember-orange tip (the last tenth glowing, a small bloom on the lights) and a soft smoky root where it grows out of the
// plate. Claw coordinates (the part's centre is the origin; painted as the LEFT claw). Bake-time only.
import { cubic, heat, line, lin, path, rgba, ribbon, SOOT, IRON, ASH, COAL } from './craving-pkit.js';

export function talon(b, l, curve, w0, w1) {
  const { mid, left } = ribbon(b, curve, w0, w1, 22, 0.85);
  b.fillStyle = lin(b, curve[0][0], curve[0][1], curve[3][0], curve[3][1], [[0, IRON[3]], [0.5, IRON[2]], [1, IRON[1]]]);
  b.fill();
  b.save();
  ribbon(b, curve, w0, w1, 22, 0.85);
  b.clip();
  const [x0, y0, x3, y3] = [Math.min(...mid.map((p) => p[0])) - 14, Math.min(...mid.map((p) => p[1])) - 14, Math.max(...mid.map((p) => p[0])) + 14, Math.max(...mid.map((p) => p[1])) + 14];
  b.fillStyle = lin(b, x0, y0, x3, y0, [[0, 'rgba(160,170,190,0.2)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.4)']]);
  b.fillRect(x0, y0, x3 - x0, y3 - y0);
  for (let t = 0.12; t < 0.9; t += 0.095) { // growth rings across the horn
    const [x, y, tx, ty] = cubic(curve, t);
    const hw = ((w0 + (w1 - w0) * t) / 2) * 0.95;
    path(b, [[x + ty * hw, y - tx * hw], [x + tx * 2.5, y + ty * 2.5], [x - ty * hw, y + tx * hw]], true);
    line(b, rgba(SOOT, 0.4), 1);
  }
  b.restore();
  ribbon(b, curve, w0, w1, 22, 0.85);
  line(b, rgba(SOOT, 0.9), 1.8);
  path(b, left.slice(1, 18), true); // the pale ash edge light along the outer, upper edge: a clear rim on the dark horn
  line(b, rgba(ASH[4], 0.8), 2);
  path(b, left.slice(3, 15), true);
  line(b, rgba('#ffffff', 0.35), 0.9);
  const [x, y, tx, ty] = cubic(curve, 0.05); // a pale band where the claw is set on the finger
  path(b, [[x + ty * w0 * 0.5, y - tx * w0 * 0.5], [x - ty * w0 * 0.5, y + tx * w0 * 0.5]], true);
  line(b, rgba(ASH[3], 0.5), 2.4);
  const tip = mid.slice(-4); // the ember tip: dull, a coal red and orange
  for (const [k, w, c, a] of [[0, 3.8, COAL[1], 0.9], [1, 2.6, COAL[2], 0.95], [2, 1.4, COAL[3], 1]]) {
    path(b, tip.slice(k, 4), true);
    line(b, rgba(c, a), w);
  }
  const [px, py] = mid.at(-1);
  heat(l, px, py, 12, COAL[3], 0.32);
  heat(l, px, py, 5, COAL[5], 0.3);
}
