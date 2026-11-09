// The dead trees of World 17's mid layer: bare trees grown once from a seed by `grow` (a trunk that forks into limbs and twigs,
// each segment a tapering stroke) and drawn the same way in the smog and in the morning (`bare`: the branches never change,
// only the colours do). `grow` is deterministic and has no mode; the leaves that come back in the 'over' pass sit on the
// same branches (parallax-smog-mid-leaves.js `crown` reads the tips and limbs grown here), so a tree is one tree in both.
import { seeded, strokes, FLOOR } from './parallax-smog-kit.js';
import { rgba } from './sprites.js';
import { TREES } from './parallax-smog-mid-plan.js';

// A bare tree standing at (x, base), h tall and `thick` wide at the foot: { segs: [[x0, y0, x1, y1, width, depth]], tips: [[x, y, depth]] }.
export function grow(seed, x, base, h, thick = 9 + h * 0.025) {
  const r = seeded(seed);
  const segs = [];
  const tips = [];
  const branch = (bx, by, ang, len, w, depth) => {
    const [ex, ey] = [bx + Math.sin(ang) * len, by - Math.cos(ang) * len];
    segs.push([bx, by, ex, ey, w, depth]);
    if (depth >= 6 || len < 7) return tips.push([ex, ey, depth]);
    const n = depth < 2 ? 2 + (r() < 0.5 ? 1 : 0) : 2;
    for (let i = 0; i < n; i++) {
      const spread = (i - (n - 1) / 2) * (0.5 + r() * 0.35) + (r() - 0.5) * 0.3;
      branch(ex, ey, ang * 0.5 + spread, len * (0.66 + r() * 0.14), Math.max(0.9, w * 0.66), depth + 1);
    }
    if (depth >= 2 && r() < 0.5) branch(ex - (ex - bx) * 0.5, ey - (ey - by) * 0.5, ang + (r() < 0.5 ? -1 : 1) * (0.7 + r() * 0.4), len * 0.42, Math.max(0.9, w * 0.5), depth + 2); // a side twig
    return 0;
  };
  branch(x, base + 4, (r() - 0.5) * 0.14, h * 0.34, thick, 0);
  return { segs, tips, seed };
}

export function bare(g, P, t) {
  g.save();
  g.lineCap = 'round';
  for (const [x0, y0, x1, y1, w] of t.segs) {
    g.strokeStyle = P.trunk;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
  }
  g.restore();
  strokes(g, rgba(P.trunkHi, 0.5), 1, t.segs.filter((s) => s[4] > 3).map(([x0, y0, x1, y1, w]) => [x0 + w * 0.32, y0, x1 + w * 0.3, y1]));
  g.fillStyle = P.trunk; // the root flare
  g.beginPath();
  const [x0, y0, w] = [t.segs[0][0], t.segs[0][1], t.segs[0][4]];
  g.moveTo(x0 - w * 1.2, y0 + 2);
  g.quadraticCurveTo(x0 - w * 0.3, y0 - 5, x0 - w * 0.4, y0 - 12);
  g.lineTo(x0 + w * 0.4, y0 - 12);
  g.quadraticCurveTo(x0 + w * 0.3, y0 - 5, x0 + w * 1.2, y0 + 2);
  g.fill();
}

export const TREE_SHAPES = TREES.map((t) => grow(t.seed, t.x, FLOOR, t.h)); // grown once; the 'over' pass crowns the same trees
