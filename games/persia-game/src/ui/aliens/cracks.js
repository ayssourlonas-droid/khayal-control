// An alien's damage, baked from its sprite set (bake.js) once, at load (warmAliens), never mid-fight:
//   cracked(set, frame, stage)      the body with cracks, stage 1 | 2: a dark split with a lit lower
//                                   lip
//   CRACKABLE                       the roles that can be hurt and live (more than 1 hp); a species
//                                   cracks when its role (kinds.js SPECIES) is one of them
import { makeCanvas, hash } from '../sprites.js';
import { ROLES } from '../../core/kinds.js';
import { INK, rgba, path, TAU } from './kit.js';

export const CRACKABLE = Object.keys(ROLES).filter((role) => ROLES[role].hp > 1);

// Jagged cracks from a few seeded points near the centre.
function crackPaths(seed, stage) {
  const out = [];
  for (let k = 0; k < stage * 2; k++) {
    const h = (j) => hash(seed * 977 + k * 131 + j);
    let a = h(1) * TAU;
    let x = Math.cos(a) * 6 * h(2);
    let y = Math.sin(a) * 6 * h(2) - 2;
    const pts = [[x, y]];
    for (let s = 0; s < 4; s++) {
      a += (h(10 + s) - 0.5) * 1.6;
      const len = 5 + h(20 + s) * 5;
      x += Math.cos(a) * len;
      y += Math.sin(a) * len;
      pts.push([x, y]);
    }
    out.push(pts);
  }
  return out;
}

export function cracked(set, frame, stage) {
  const key = frame * 3 + stage;
  if (set.cracks[key]) return set.cracks[key];
  const src = set.body[frame];
  const c = makeCanvas(src.width, src.height);
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.translate(src.width / 2, src.height / 2);
  for (const pts of crackPaths(set.seed, stage)) {
    for (const [dx, dy, c2, w] of [[0.9, 1.1, rgba('#ffffff', 0.4), 1.2], [0, 0, INK, 2.6]]) {
      g.save();
      g.translate(dx, dy);
      path(g, pts, true);
      g.lineWidth = w;
      g.strokeStyle = c2;
      g.lineJoin = 'miter';
      g.stroke();
      g.restore();
    }
  }
  set.cracks[key] = c;
  return c;
}
