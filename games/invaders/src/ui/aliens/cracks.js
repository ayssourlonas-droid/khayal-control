// An alien's damage, baked from its sprite set (bake.js) once, at load (warmAliens), never mid-fight:
//   cracked(set, frame, stage)      the body with cracks, stage 1 | 2: a dark split with a lit lower
//                                   lip, and the world's hot line inside it (set.crackColor) if any
//   crackLights(set, frame, stage)  the same cracks as a faint glow in the alien's own colour (or the
//                                   crack colour), inside the body's outline: drawn with the lights in
//                                   Neon Rain's darkness pass, so a hurt alien still shows it there
//   CRACKABLE                       the roles that can be hurt and live (more than 1 hp)
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

// A canvas the size of the body, its context at the sprite's centre in world px.
function blank(set, frame) {
  const src = set.body[frame];
  const c = makeCanvas(src.width, src.height);
  const g = c.getContext('2d');
  return [c, g, src];
}
const centre = (g, set, src) => {
  g.translate(src.width / 2, src.height / 2);
  g.scale(set.scale, set.scale);
};

export function cracked(set, frame, stage) {
  const key = frame * 3 + stage;
  if (set.cracks[key]) return set.cracks[key];
  const [c, g, src] = blank(set, frame);
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  centre(g, set, src);
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
    if (set.crackColor) {
      path(g, pts, true);
      g.lineWidth = 1;
      g.strokeStyle = set.crackColor;
      g.stroke();
    }
  }
  set.cracks[key] = c;
  return c;
}

export function crackLights(set, frame, stage) {
  const key = frame * 3 + stage;
  if (set.crackGlow[key]) return set.crackGlow[key];
  const [c, g, src] = blank(set, frame);
  const glowColor = set.crackColor ?? set.color;
  g.save();
  centre(g, set, src);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  for (const pts of crackPaths(set.seed, stage)) {
    for (const [w, color, a] of [[6, glowColor, 0.25], [2.4, glowColor, 0.75], [1, '#ffffff', 0.55]]) {
      path(g, pts, true);
      g.lineWidth = w;
      g.strokeStyle = rgba(color, a);
      g.stroke();
    }
  }
  g.restore();
  g.globalCompositeOperation = 'destination-in'; // only inside the body's outline
  g.drawImage(src, 0, 0);
  set.crackGlow[key] = c;
  return c;
}
