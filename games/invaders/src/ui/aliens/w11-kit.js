// What World 11's painters share (w11.js, w11-2.js, w11-3.js): the cold blue of their cracks and seams,
// and a small kite of ice.
import { path, ink, rgba } from './kit.js';

export const FROST = '#5ad0ff'; // the cold blue of cracks and of the golem's seams

// A small kite of ice, w wide and h long, its tip down at (x, y + h / 2), turned by rot.
export function kite(g, x, y, w, h, fill, rot = 0, lw = 1.4) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  path(g, [[0, -h / 2], [w / 2, -h * 0.1], [0, h / 2], [-w / 2, -h * 0.1]]);
  ink(g, fill, lw);
  path(g, [[0, -h / 2], [-w / 2, -h * 0.1], [0, h / 2 - 1]]);
  g.fillStyle = rgba('#ffffff', 0.4);
  g.fill();
  g.restore();
}
