// What grows back on World 17's mid layer, drawn alone on a transparent canvas (the 'over' pass; heal-layers.js fades it in by
// stage(h, 'green')): leaf crowns on the bare trees, ivy up the brick and the church tower, window boxes with a few small
// flowers, pots and trailing shrubs on the fire escapes, rooftop gardens (planters with shrubs and a potted tree along the
// flat roofs), a green over the vacant lot's rubble and its torn wall, and a post with a kite reel at each of the roof places
// the kites are tied to. Every place comes from the plan (parallax-smog-mid-plan.js) and the palette is the clean one; the
// flowers are muted (cream, soft yellow, pale blue) and tiny.
import { FLOOR, seeded, hash, box, fade } from './parallax-smog-kit.js';
import { rgba } from './sprites.js';
import { BLOCKS, LOT, KITE_POSTS } from './parallax-smog-mid-plan.js';
import { TREE_SHAPES } from './parallax-smog-mid-tree.js';
import { bays, WIN, escapeAt } from './parallax-smog-mid-house.js';
import { CHURCH } from './parallax-smog-mid-church.js';
import { crown, shrub, ivyPatch, flowers, blob, LEAF } from './parallax-smog-mid-leaves.js';

function windowBoxes(g, P, r, b) {
  for (const [i, w] of bays(b).entries()) {
    if (hash(b.seed * 17 + i) > 0.38 || w.y + w.h > FLOOR - 40) continue;
    const [x, y] = [w.x - 1.5, w.y + w.h + 2.6];
    shrub(g, r, x + 1, y + 1, WIN.w + 1, 8);
    flowers(g, r, x, y - 7, WIN.w + 3, 7, 4);
    box(g, P.wood, x - 1, y, WIN.w + 5, 5);
    box(g, P.woodHi, x - 1, y, WIN.w + 5, 1, 0.7);
  }
}

function escapePlants(g, P, r, b) { // pots and a trailing shrub on each deck of the fire escape
  const e = escapeAt(b);
  for (let k = 0; k < e.floors; k++) {
    const y = e.y0 + k * WIN.pitch;
    for (let x = e.x + 3; x < e.x + e.w - 8; x += 17 + r() * 8) {
      shrub(g, r, x, y - 1, 12, 9 + r() * 7);
      box(g, P.wood, x - 1, y - 5, 12, 4);
    }
    flowers(g, r, e.x + 2, y - 13, e.w - 6, 8, 3);
  }
}

function roofGarden(g, P, r, b, from, to) {
  const y = b.top - 4;
  for (let x = from; x < to; x += 23 + r() * 8) {
    box(g, P.stone, x - 1, y - 5, 19, 6);
    box(g, P.edge, x - 1, y - 5, 19, 1, 0.7);
    shrub(g, r, x, y - 4, 19, 12 + r() * 12);
    if (r() < 0.5) flowers(g, r, x, y - 18, 19, 8, 3);
  }
  const tx = from + (to - from) * 0.55; // a potted tree
  box(g, P.wood, tx - 1.5, y - 30, 3, 26);
  blob(g, r, tx, y - 38, 14, LEAF.mid, 0.95);
  blob(g, r, tx + 3, y - 42, 9, LEAF.lit, 0.9);
}

function lotGreen(g, P, r) {
  const [x0, x1] = [LOT.x0, LOT.x1];
  ivyPatch(g, r, x0 + 4, FLOOR - 150, 34, 140);
  ivyPatch(g, r, x0 + 48, FLOOR - 110, 22, 100);
  for (let x = x0 + 72; x < x1 - 12; x += 16 + r() * 8) shrub(g, r, x, FLOOR - 12, 22, 20 + r() * 20);
  flowers(g, r, x0 + 72, FLOOR - 44, x1 - x0 - 86, 34, 22);
}

export function midGreen(g, P) {
  const r = seeded(808);
  g.save();
  for (const b of BLOCKS) {
    if (b.brick) {
      ivyPatch(g, r, b.x + (b.seed % 2 ? 0 : b.w - 22), b.top + 40, 22, FLOOR - b.top - 40);
      ivyPatch(g, r, b.x + b.w * 0.4, b.top + 110, 36, FLOOR - b.top - 110);
    }
    if (b.roof === 'flat') roofGarden(g, P, r, b, b.x + 6, b.x + b.w - 24);
    windowBoxes(g, P, r, b);
    if (b.esc) escapePlants(g, P, r, b);
  }
  ivyPatch(g, r, CHURCH.x + CHURCH.nave, CHURCH.belfry + 100, 16, 150);
  ivyPatch(g, r, CHURCH.x + 4, CHURCH.top + 20, 36, 140);
  ivyPatch(g, r, CHURCH.x + 100, CHURCH.top + 60, 40, 100);
  lotGreen(g, P, r);
  for (const [x, y] of KITE_POSTS) { // the post and its reel
    box(g, P.wood, x - 1.2, y - 15, 2.4, 15);
    g.fillStyle = rgba(P.panelB, 0.95);
    g.fillRect(x - 4, y - 12, 8, 3);
    box(g, P.iron, x - 4, y - 13, 8, 1);
  }
  for (const t of TREE_SHAPES) crown(g, t);
  g.globalCompositeOperation = 'source-atop'; // the lower floors' shade lies over the green too: calm behind the player's zone
  fade(g, 0, FLOOR - 150, 2240, 190, [[0, rgba(P.shade, 0)], [1, rgba(P.shade, P.shadeA * 0.9)]]);
  g.restore();
}
