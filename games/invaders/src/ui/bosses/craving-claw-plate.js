// The armour of the Craving's claw (World 17, Ash to Air; see craving-claw.js): charred plates over the smoke, hard and dark. A KNUCKLE is a
// rounded plate at the root of each finger, a cold grey edge on its top, soot in its hollows, a crack with a dull ember in it and a
// pitted face. There is no wrist guard: the arm is smoke. Claw coordinates (the part's centre is the origin). Bake-time only.
import { crack, crackPts, grain, heat, line, lin, path, rgba, rng, streaks, SOOT, IRON, ASH, COAL } from './craving-pkit.js';

// A plate: the closed path `outline` filled top-lit, with grain, soot, a lit upper edge and a dark outline.
function plate(b, outline, x0, y0, x1, y1, r) {
  outline();
  b.fillStyle = lin(b, 0, y0, 0, y1, [[0, IRON[5]], [0.25, IRON[3]], [0.7, IRON[1]], [1, SOOT]]);
  b.fill();
  b.save();
  outline();
  b.clip();
  b.fillStyle = lin(b, x0, 0, x1, 0, [[0, 'rgba(160,170,190,0.14)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.45)']]);
  b.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
  grain(b, x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4, 1.4);
  streaks(b, r, x0, x1, y0, y1, 5, SOOT, 0.45, 0.9);
  b.restore();
  outline();
  line(b, SOOT, 2.2);
}

export function knuckle(b, l, x, y, w, h, seed) {
  const r = rng(seed);
  const outline = () => {
    b.beginPath();
    b.roundRect(x - w / 2, y - h / 2, w, h, [h * 0.5, h * 0.5, 4, 4]);
  };
  plate(b, outline, x - w / 2, y - h / 2, x + w / 2, y + h / 2, r);
  path(b, [[x - w * 0.38, y - h * 0.34], [x, y - h * 0.46], [x + w * 0.38, y - h * 0.34]], true);
  line(b, rgba(ASH[3], 0.55), 1.3);
  crack(b, l, crackPts(r, x + (r() - 0.5) * w * 0.3, y - h * 0.2, 1.57, 2, h * 0.22), 1.3, COAL[3], 0.35);
  heat(l, x, y + h * 0.3, 12, COAL[1], 0.18);
}
