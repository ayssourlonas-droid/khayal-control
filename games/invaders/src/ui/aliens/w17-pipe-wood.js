// World 17, Ash to Air, the gunner's burl wood (w17-pipe.js): the swirling grain and the bird's-eye knots of a briar
// bowl, painted inside the bowl's clip. Two whorls of broken growth rings, a scatter of knots (a dark pit in a pale
// ring), and fine pores along the grain. BRASS is the colour of the bands.
import { ellipse, rgba, line, hash } from './w17-kit.js';

export const BRASS = '#d9a441';

const WHORLS = [[-16, -2, 0.3], [4, 6, -0.4]]; // centre and slant of each whorl of growth rings

export function woodGrain(g) {
  WHORLS.forEach(([cx, cy, rot], w) => {
    for (let k = 1; k <= 8; k++) { // broken rings: each an arc of an ellipse, never closed
      const a0 = hash(w * 40 + k) * 6.28;
      g.beginPath();
      g.ellipse(cx, cy, k * 3.3, k * 2.4, rot, a0, a0 + 2.2 + hash(w * 40 + k + 9) * 2.6);
      line(g, k % 2 ? rgba('#1a0a04', 0.55) : rgba('#d08a52', 0.22), k % 2 ? 0.9 : 0.8);
    }
  });
  for (let i = 0; i < 22; i++) { // bird's-eye knots
    const x = -26 + hash(300 + i * 3) * 40;
    const y = -14 + hash(301 + i * 3) * 34;
    const r = 0.6 + hash(302 + i * 3) * 0.8;
    ellipse(g, x, y, r * 1.7, r * 1.15, 0.4);
    g.fillStyle = rgba('#d89a5c', 0.2);
    g.fill();
    ellipse(g, x, y, r, r * 0.7, 0.4);
    g.fillStyle = rgba('#1a0a04', 0.85);
    g.fill();
  }
  for (let i = 0; i < 22; i++) { // pores along the grain
    const x = -27 + hash(500 + i * 2) * 42;
    const y = -14 + hash(501 + i * 2) * 36;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 2.4 + hash(i) * 2, y - 0.8);
    line(g, rgba('#0a0503', 0.4), 0.6);
  }
}
