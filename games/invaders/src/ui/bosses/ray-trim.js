// The trim of The Squall Ray's edges (World 18, Anvil Sky; ray-hull.js paints it over the cloud): a row of iron studs along each wing's leading edge, from the head
// out to the tip and smaller and smaller, each with a small cold light in it (cyan and violet by turns, like the running lights of an aircraft), which draw the convex
// arc of the leading edge to the eye; and two iron bands round each cephalic lobe, riveted, as the bracers of a paddle. They are not parts (nothing hits them); they
// are the ray's finish. The right side is painted; the left is its mirror. Hull coordinates. Bake-time only.
import { PAL, bloom } from './ray-kit.js';
import { rivet, glare } from '../aliens/w18-kit.js';
import { LEAD, HORN, edgeY } from './ray-shape.js';
import { slab, rivetsOn } from './ray-iron.js';

const STUDS = 17;

function studs(b, l) {
  for (let i = 0; i < STUDS; i++) {
    const t = i / (STUDS - 1);
    const x = 128 + 330 * t ** 0.9;
    const [y, r] = [edgeY(LEAD, x) - 4 - 3 * (1 - t), 3.4 - 1.6 * t];
    rivet(b, x, y, r, PAL.steel);
    const c = i % 2 ? PAL.violet : PAL.cyan;
    bloom(l, x, y, 9 + 4 * (1 - t), c, 0.4);
    glare(l, x, y, 1.2 + 0.6 * (1 - t), c, 0.8);
  }
}

// A band across the lobe at t (0..1 along its ribbon): a thin riveted plate square to the ribbon, a little wider than it.
function band(b, t, s) {
  const f = t * (HORN.pts.length - 1);
  const k = Math.min(HORN.pts.length - 2, Math.floor(f));
  const [p, q] = [HORN.pts[k], HORN.pts[k + 1]];
  const [cx, cy] = [p[0] + (q[0] - p[0]) * (f - k), p[1] + (q[1] - p[1]) * (f - k)];
  const [dx, dy] = [q[0] - p[0], q[1] - p[1]];
  const len = Math.hypot(dx, dy);
  const [ux, uy] = [dx / len, dy / len];
  const w = HORN.r0 + (HORN.r1 - HORN.r0) * t + 1;
  const [nx, ny] = [-uy * w, ux * w];
  const h = 4.5;
  const pts = [[cx + nx - ux * h, cy + ny - uy * h], [cx + nx + ux * h, cy + ny + uy * h], [cx - nx + ux * h, cy - ny + uy * h], [cx - nx - ux * h, cy - ny - uy * h]];
  slab(b, s > 0 ? pts.toReversed() : pts, PAL.iron, { lw: 1.6, wear: 0.4, rust: 0, seed: Math.round(cx + cy) }); // clockwise on screen, which the mirror turns round
  rivetsOn(b, [[cx + nx * 0.7, cy + ny * 0.7], [cx - nx * 0.7, cy - ny * 0.7]], 1.3);
}

export function trim(b, l) {
  for (const s of [-1, 1]) {
    for (const g of [b, l]) {
      g.save();
      g.scale(s, 1);
    }
    studs(b, l);
    for (const t of [0.34, 0.66]) band(b, t, s);
    for (const g of [b, l]) g.restore();
  }
}
