// A zigzag fire escape for World 17's tall blocks, and the drainpipe. The escape is a stack of iron balconies (a thin deck, a top
// rail with balusters every 5 px, a toe rail) joined by flights of steps that run back and forth, a drop ladder hanging from
// the lowest, drawn in iron with a thin light edge on the side facing the sun. It stands across `n` window bays at `x`,
// one balcony a floor (pitch `pitch`, the first deck at `y0`). A drainpipe is a slim iron pipe with brackets down the side of
// a wall.
import { box, strokes } from './parallax-smog-kit.js';
import { rgba } from './sprites.js';

export function escape(g, P, x, w, y0, pitch, floors) {
  const [iron, lit] = [P.iron, rgba(P.edge, P.edgeA * 0.8)];
  const segs = [];
  for (let k = 0; k < floors; k++) {
    const y = y0 + k * pitch;
    box(g, iron, x - 2, y, w + 4, 2.4); // deck
    box(g, P.dust, x - 2, y - 0.4, w + 4, 0.9, P.dustA);
    segs.push([x, y - 13, x + w, y - 13]); // top rail
    segs.push([x, y - 5, x + w, y - 5]); // toe rail
    for (let bx = x; bx <= x + w + 0.1; bx += 5) segs.push([bx, y - 13, bx, y]);
    if (k < floors - 1) {
      const dir = k % 2 ? -1 : 1;
      const [xa, xb] = dir > 0 ? [x + 4, x + w - 6] : [x + w - 4, x + 6];
      for (const o of [0, 5]) segs.push([xa + o * dir * 0.3, y + 2, xb + o * dir * 0.3, y + pitch - 2 + o * 0.2]);
      const steps = 9;
      for (let i = 1; i < steps; i++) {
        const u = i / steps;
        segs.push([xa + (xb - xa) * u - 2, y + 2 + (pitch - 4) * u, xa + (xb - xa) * u + 2, y + 2 + (pitch - 4) * u]);
      }
    }
  }
  const last = y0 + (floors - 1) * pitch;
  segs.push([x + 6, last + 2, x + 6, last + 26], [x + 12, last + 2, x + 12, last + 26]);
  for (let i = 0; i < 4; i++) segs.push([x + 6, last + 6 + i * 6, x + 12, last + 6 + i * 6]);
  strokes(g, iron, 1.1, segs);
  strokes(g, lit, 0.8, [[x, y0 - 13.8, x + w, y0 - 13.8]]);
}

export function drainpipe(g, P, x, y0, y1) {
  box(g, P.iron, x, y0, 3, y1 - y0);
  box(g, P.edge, x + 2.2, y0, 0.8, y1 - y0, P.edgeA * 0.7);
  for (let y = y0 + 14; y < y1; y += 38) box(g, P.trim, x - 1, y, 5, 2.2, 0.8);
}
