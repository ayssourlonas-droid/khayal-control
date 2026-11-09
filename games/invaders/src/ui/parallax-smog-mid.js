// World 17's mid layer, the older city blocks (2240 x 460, its top at screen y 620, speed 0.22): terraced blocks of brick and
// render with sash windows (some boarded, a few dimly lit), fire escapes, chimney stacks and aerials; a church with a
// spire; rooftop water towers; an empty billboard on its gantry; a bus shelter; a vacant lot with rubble; utility poles
// with wires sagging across the gaps; and dead trees. Painter smogblocks(g, w, h, rng, L, out, mode) with mode 'smog',
// 'clean' (the same city on a bright morning: the same shapes, other colours) or 'over' (what grows back: leaf crowns,
// ivy, rooftop gardens, window boxes; parallax-smog-mid-green.js). The plan (parallax-smog-mid-plan.js) is fixed data and
// every element has an rng of its own, so the three passes agree on every place whatever `rng` they were handed (it is
// not used: the city that heals must not change from level to level). The lower floors are darkened: this layer lies behind
// the player's zone. Lights: a handful of faint window glows, from the smog pass only (heal-layers.js).
import { FLOOR, fade } from './parallax-smog-kit.js';
import { midPal } from './parallax-smog-pal.js';
import { rgba } from './sprites.js';
import { BLOCKS, TOWERS, BILLBOARD, LOT, SHELTER, POLES } from './parallax-smog-mid-plan.js';
import { house } from './parallax-smog-mid-house.js';
import { church } from './parallax-smog-mid-church.js';
import { waterTower, billboard } from './parallax-smog-mid-props.js';
import { pole, wires, shelter, lot } from './parallax-smog-mid-street.js';
import { TREE_SHAPES, bare } from './parallax-smog-mid-tree.js';
import { midGreen } from './parallax-smog-mid-green.js';

export function smogblocks(g, w, h, rng, L, out, mode = 'smog') {
  const P = midPal(mode);
  if (mode === 'over') return midGreen(g, P);
  g.save();
  church(g, P, FLOOR + 70);
  fade(g, 520, FLOOR - 190, 210, 260, [[0, rgba(P.shade, 0)], [1, rgba(P.shade, P.shadeA)]]);
  lot(g, P, LOT.x0, LOT.x1, FLOOR);
  for (const b of BLOCKS) house(g, P, b, out);
  for (const t of TOWERS) waterTower(g, P, t.x, t.base, t.s);
  const bb = BILLBOARD;
  billboard(g, P, bb.x, bb.base, bb.w, bb.h, bb.up);
  shelter(g, P, SHELTER.x, FLOOR);
  for (const t of TREE_SHAPES) bare(g, P, t);
  const arms = POLES.map((p) => pole(g, P, p.x, FLOOR, p.h, p.can));
  for (let i = 0; i + 1 < arms.length; i++) wires(g, P, arms[i], arms[i + 1], 16 + (i % 2) * 6);
  g.restore();
}
