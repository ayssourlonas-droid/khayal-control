// The Craving's teeth (World 17, Ash to Air; see craving-maw.js): jagged fangs of hardened ash and coal round the furnace of its
// mouth, a long ragged row hanging from the upper lip and a shorter, stubbier row standing on the lower. Each is a crooked triangle
// with a chipped tip, dark charcoal with a grey lit edge on its outer side; on the lights layer the edge that faces the furnace burns
// orange, so the teeth stand black against the glow. Maw coordinates (the part's centre is the origin). Bake-time only.
import { line, lin, rgba, path, rng, grain, SOOT, IRON, ASH, COAL } from './craving-pkit.js';

// One fang: base from (x - w/2, y) to (x + w/2, y), its tip `len` px along dir (1 hangs down, -1 stands up), leaning `lean`.
function fang(b, l, x, y, w, len, dir, lean) {
  const tip = [x + lean, y + dir * len];
  const [xl, xr] = [x - w / 2, x + w / 2];
  const pts = [[xl, y - dir * 4], [x - w * 0.5 + lean * 0.6, y + dir * len * 0.55], tip, [x + w * 0.1 + lean * 0.3, y + dir * len * 0.62], [xr, y - dir * 4]];
  const outline = () => {
    b.beginPath();
    b.moveTo(...pts[0]);
    b.quadraticCurveTo(...pts[1], ...pts[2]);
    b.quadraticCurveTo(...pts[3], ...pts[4]);
    b.closePath();
  };
  b.save();
  outline();
  b.fillStyle = lin(b, x - w / 2, 0, x + w / 2, 0, [[0, IRON[4]], [0.3, IRON[3]], [0.7, IRON[1]], [1, SOOT]]);
  b.fill();
  b.clip();
  b.fillStyle = lin(b, 0, y, 0, y + dir * len, [[0, 'rgba(12,6,4,0.55)'], [0.5, 'rgba(12,6,4,0)'], [1, 'rgba(255,90,20,0.34)']]);
  b.fillRect(x - w, Math.min(y, y + dir * len) - 4, w * 2, len + 8);
  grain(b, x - w, Math.min(y, y + dir * len) - 4, w * 2, len + 8, 0.9);
  b.restore();
  outline();
  line(b, SOOT, 1.8);
  path(b, [[x - w * 0.34, y + dir * len * 0.12], [x - w * 0.32, y + dir * len * 0.55]], true);
  line(b, rgba(ASH[3], 0.55), 1);
  // the furnace-facing edge burns on the lights layer
  l.save();
  l.globalCompositeOperation = 'lighter';
  path(l, [[x + w * 0.46, y + dir * len * 0.1], [x + w * 0.4, y + dir * len * 0.5], [tip[0] - 0.5, tip[1] - dir * 1.5]], true);
  line(l, rgba(COAL[3], 0.28), 4);
  path(l, [[x + w * 0.46, y + dir * len * 0.1], [x + w * 0.4, y + dir * len * 0.5], [tip[0] - 0.5, tip[1] - dir * 1.5]], true);
  line(l, rgba(COAL[4], 0.8), 1.2);
  l.restore();
}

// Both rows. `top(x)` and `bot(x)` give the opening's upper and lower edge at x.
export function teeth(b, l, top, bot, seed = 5) {
  const r = rng(seed);
  const up = [[-38, 17, 24], [-25, 20, 34], [-12, 17, 28], [1, 21, 36], [14, 17, 30], [27, 20, 26], [39, 16, 20]];
  for (const [x, w, len] of up) fang(b, l, x, top(x), w, len + r() * 5, 1, (r() - 0.5) * 6 - x * 0.06);
  const dn = [[-33, 15, 15], [-17, 16, 20], [0, 15, 16], [17, 16, 21], [33, 14, 14]];
  for (const [x, w, len] of dn) fang(b, l, x, bot(x), w, len + r() * 4, -1, (r() - 0.5) * 5 - x * 0.05);
}
