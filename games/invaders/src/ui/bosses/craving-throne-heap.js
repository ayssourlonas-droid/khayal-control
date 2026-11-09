// The overflow of the Craving's throne (World 17, Ash to Air; assembled by craving-hull.js): the ashtray is too full. At each side of the
// glowing tray a heap of grey ash and snubbed butts is piled on the front of the rim and over its lip (the live smoke is drawn over the hull down to the
// mouth's edge, so what is to be seen lies below it, and the rests are cut in front of it): a lumpy mound of cold ash, paler on top, shadowed
// toward the rim, butts stuck in it at every angle (some standing on end, some half buried, some tumbled down onto the
// lip), a few cold coals; a dull ember here and there on the lights layer. This is what says "ashtray" at a glance. Boss coordinates;
// the heaps lie in x 146..296 and y 34..92 on both sides. Bake-time only.
import { blobPath, grain, heat, lin, rad, rgba, rng, ellipse, SOOT, ASH, COAL } from './craving-pkit.js';
import { stub } from './craving-throne-bowl.js';

function mound(b, s, r) {
  const pts = [[s * 144, 64], [s * 148, 48], [s * 158, 36], [s * 172, 29], [s * 188, 33], [s * 204, 39], [s * 220, 46], [s * 224, 60], [s * 214, 76], [s * 188, 82], [s * 160, 80]];
  blobPath(b, pts);
  b.fillStyle = lin(b, 0, 32, 0, 90, [[0, ASH[3]], [0.35, ASH[2]], [0.75, ASH[0]], [1, SOOT]]);
  b.fill();
  b.save();
  blobPath(b, pts);
  b.clip();
  for (let i = 0; i < 26; i++) { // lumps of ash on its surface
    const x = s * (148 + r() * 72);
    const y = 38 + r() * 46;
    const [rx, ry] = [7 + r() * 12, 4 + r() * 6];
    ellipse(b, x, y, rx, ry, 0);
    b.fillStyle = rad(b, x, y, 1, rx, [[0, rgba(ASH[3], 0.8)], [0.7, rgba(ASH[1], 0.6)], [1, rgba(ASH[0], 0)]], x - rx * 0.3, y - ry * 0.5);
    b.fill();
  }
  b.fillStyle = lin(b, 0, 56, 0, 92, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(6,4,3,0.7)']]);
  b.fillRect(s * 130, 40, s * 180, 54);
  grain(b, Math.min(s * 130, s * 310), 30, 180, 64, 1.3);
  b.restore();
}

export function heap(b, l) {
  for (const s of [-1, 1]) {
    const r = rng(121 + s);
    mound(b, s, r);
    for (let i = 0; i < 22; i++) { // butts: standing, half buried, tumbled
      const x = s * (150 + r() * 60);
      const y = 40 + r() * 38;
      stub(b, l, x, y, i % 3 === 0 ? -1.9 + (r() - 0.5) * 0.9 : (r() - 0.5) * 3, 12 + r() * 16, r);
    }
    for (let i = 0; i < 5; i++) { // coals, cold and nearly black, one or two with a glow in them
      const [x, y, rr] = [s * (158 + r() * 56), 38 + r() * 30, 4 + r() * 4];
      ellipse(b, x, y, rr, rr * 0.7, r());
      b.fillStyle = i % 2 ? '#2a1a14' : '#4a2216';
      b.fill();
      if (i % 2 === 0) heat(l, x, y, rr * 2.2, COAL[2], 0.3);
    }
    heat(l, s * 184, 58, 44, COAL[1], 0.12);
  }
}
