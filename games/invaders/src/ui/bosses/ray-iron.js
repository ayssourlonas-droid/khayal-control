// The Squall Ray's iron (World 18, Anvil Sky; ray-spine.js, ray-wing*.js, ray-heart.js, ray-maw.js, ray-coil.js): the plates its armour is made
// of, in the world's own blue-grey wrought iron (aliens/w18-kit.js). slab() lays one plate along a closed polygon: top-lit iron across its box,
// a dark outline, a bright bevel along the edges that face the light (the upper left), a dark lip along those that face away, flecks of worn
// metal along the lit edges, scratches, and a streak of rust. rivetsOn() sets rivets at points. Bake-time only.
import { PAL, rng, path, line, lin, rgba } from './ray-kit.js';
import { ink, metal, rivet, scuff } from '../aliens/w18-kit.js';

const LIGHT = [-0.5, -0.86]; // toward the light: up and a little left

// The polygon's edges as [x0, y0, x1, y1, lit]: lit > 0 where the edge faces the light (the polygon runs clockwise on screen).
function edges(pts) {
  return pts.map(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    return [x0, y0, x1, y1, ((y1 - y0) * LIGHT[0] - (x1 - x0) * LIGHT[1]) / len];
  });
}

export function slab(g, pts, c = PAL.plate, o = {}) {
  const { lw = 2.2, wear = 0.35, seed = 1, rust = 0.25 } = o;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  g.save();
  path(g, pts);
  ink(g, metal(g, x0, y0, x1, y1, c), lw);
  path(g, pts);
  g.clip();
  const r = rng(seed * 31 + 5);
  for (const [ax, ay, bx, by, lit] of edges(pts)) {
    if (Math.hypot(bx - ax, by - ay) < 3) continue;
    path(g, [[ax, ay], [bx, by]], true);
    line(g, lit > 0.15 ? rgba('#e6f0ff', 0.5 * lit) : rgba('#000000', 0.35 * -lit + 0.1), lit > 0.15 ? 2.4 : 3);
    if (lit > 0.3 && wear > 0) { // worn bright flecks along a lit edge
      const n = Math.round(Math.hypot(bx - ax, by - ay) / 6);
      for (let i = 0; i < n; i++) {
        const u = r();
        g.fillStyle = rgba('#f2f8ff', wear * (0.3 + 0.7 * r()));
        g.fillRect(ax + (bx - ax) * u + 1, ay + (by - ay) * u + 1, 1 + 1.6 * r(), 1);
      }
    }
  }
  if (rust > 0) { // a streak of rust running down from an edge
    for (let i = 0; i < 2; i++) {
      const x = x0 + (x1 - x0) * (0.15 + 0.7 * r());
      const y = y0 + (y1 - y0) * 0.1;
      g.fillStyle = lin(g, 0, y, 0, y1, [[0, rgba(PAL.rust, 0)], [0.3, rgba(PAL.rust, rust * (0.5 + r()))], [1, rgba(PAL.rust, 0)]]);
      g.fillRect(x, y, 1.5 + 2.5 * r(), y1 - y);
    }
  }
  scuff(g, Math.round((x1 - x0) / 9), seed, (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2, 0.22);
  g.restore();
}

// Rivets at each of the points.
export function rivetsOn(g, pts, r = 1.6, c = '#c8d6f0') {
  for (const [x, y] of pts) rivet(g, x, y, r, c);
}
