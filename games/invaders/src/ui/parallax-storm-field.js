// The cloud painter of Anvil Sky's three parallax layers (parallax-storm*.js): a cloud is a SHAPE, a function (x, y) -> px inside its edge
// (> 0 inside, < 0 outside, about 1 per px), and it is painted as a pile of soft discs the way a painter builds a thundercloud: a dark mass of
// big discs inside the shape, a ragged crowd of small ones along its edge (the cauliflower outline), a lighter tone laid toward the light on
// the discs that stand near the surface, a rim of cold lilac (the lightning's) on the surfaces that face the light and the sun's orange
// where they are low, and pockets of pale light glowing inside. Whether a disc faces the light is read from the shape (its depth at the disc
// against its depth a radius toward the light). Everything is soft, so nothing looks cut out, and everything keeps to the cloud's alpha
// ('source-atop'), so no light spills past the edge.
import { soft, mix } from './sprites.js';
import { clamp } from '../core/math.js';

export const unit = (x, y) => [x / Math.hypot(x, y), y / Math.hypot(x, y)];

// o: { color (the cloud's own dark), mid (a lighter tone of it), cold (the rim), warm (the sun's), glow (the pockets'), light [lx, ly] (unit, toward the light),
//   warmAt (x, y) -> 0..1 how much of the rim is warm, n (discs inside), edge (discs along the edge), rMax (the biggest disc), rEdge (the biggest edge disc),
//   squash (x, y) -> [sx, sy] (a disc's stretch; an anvil's fibres are wide and flat), lit (rim strength 0..1), pockets (count), pocketA (their strength) }.
export function paintCloud(g, rng, shape, box, o) {
  const [bx, by, bw, bh] = box;
  const [lx, ly] = o.light;
  const discs = [];
  const pick = (hi) => { // a random point of the box whose depth is between 0 and hi
    for (let i = 0; i < 40; i++) {
      const [x, y] = [bx + rng() * bw, by + rng() * bh];
      const s = shape(x, y);
      if (s > 0 && s <= hi) return [x, y, s];
    }
    return null;
  };
  const lay = (color, x, y, r, a, k = [1, 1]) => {
    g.globalAlpha = a;
    g.drawImage(soft(color), x - r * k[0], y - r * k[1], r * 2 * k[0], r * 2 * k[1]);
  };
  const add = (p, r, a, color) => {
    const k = o.squash?.(p[0], p[1]) ?? [1, 1];
    lay(color, p[0], p[1], r, a, k);
    discs.push([p[0], p[1], r, p[2], k]);
  };
  for (let i = 0; i < o.n; i++) { // the dark mass: the deeper a disc, the bigger
    const p = pick(1e9);
    if (p) add(p, clamp(14 + p[2] * 0.5, 16, o.rMax) * (0.7 + 0.6 * rng()), 0.5 + 0.3 * rng(), o.color);
  }
  for (let i = 0; i < o.edge; i++) { // the edge: small discs of the cloud's tone, so the outline is lumps
    const p = pick(20);
    if (p) add(p, 9 + rng() * o.rEdge, 0.62 + 0.3 * rng(), o.color);
  }
  g.globalCompositeOperation = 'source-atop';
  for (const [x, y, r, s, k] of discs) { // a lighter tone toward the light, then the rim of cold or warm light where the disc faces it
    const facing = clamp((s - shape(x + lx * r, y + ly * r)) / r, 0, 1);
    if (facing < 0.12) continue;
    lay(o.mid, x + lx * r * 0.4, y + ly * r * 0.4, r * 0.7, 0.34 * facing, k);
    const w = o.warmAt ? o.warmAt(x, y) : 0;
    lay(mix(o.cold, o.warm ?? '#ff9a50', w), x + lx * r * 0.62, y + ly * r * 0.62, r * 0.5, o.lit * facing * (0.5 + 0.5 * w), k);
  }
  for (let i = 0; i < (o.pockets ?? 0); i++) { // pale light glowing inside
    const p = pick(1e9);
    if (p && p[2] > 24) lay(o.glow, p[0], p[1], 40 + p[2] * 0.4 + rng() * 30, o.pocketA * (0.5 + 0.5 * rng()), [1.2, 0.8]);
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
}
