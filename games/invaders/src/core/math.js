// Small numeric helpers shared by core, fx and ui. Points are plain `{ x, y }` objects.
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const TAU = Math.PI * 2;

// Smoothstep (flat at both ends) and a cubic ease-out, both of a 0..1 progress, clamped.
export const smooth = (x) => {
  const v = clamp(x, 0, 1);
  return v * v * (3 - 2 * v);
};
export const easeOut = (x) => 1 - (1 - clamp(x, 0, 1)) ** 3;

// An angle folded into -PI..PI.
export const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Move `v` toward `target` by at most `step` without overshooting.
export const approach = (v, target, step) =>
  v < target ? Math.min(v + step, target) : Math.max(v - step, target);

// The share of the step (dx, dy) that a move of at most `reach` px covers: 1 when the whole step is in
// reach, else the fraction that is, so the step times it is never longer than `reach`. A step of no length
// is divided by 1, not 0 (times it, it is still no step).
export const stepScale = (dx, dy, reach) => Math.min(1, reach / (Math.hypot(dx, dy) || 1));

// Squared distance between two points (compare against r * r, no sqrt).
export const dist2 = (a, b) => (b.x - a.x) ** 2 + (b.y - a.y) ** 2;

// Angle in radians from `a` to `b`; 0 is +x, and +y points down the screen.
export const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

// Squared distance from the point (px, py) to the segment (ax, ay)-(bx, by).
export function segDist2(ax, ay, bx, by, px, py) {
  const ex = bx - ax;
  const ey = by - ay;
  const len2 = ex * ex + ey * ey;
  const u = len2 ? clamp(((px - ax) * ex + (py - ay) * ey) / len2, 0, 1) : 0;
  return (ax + ex * u - px) ** 2 + (ay + ey * u - py) ** 2;
}

// Squared distance from `at` to the path `p` flew in the last `dt` (from where its velocity says it was).
export const sweepDist2 = (p, dt, at) => segDist2(p.x - p.vx * dt, p.y - p.vy * dt, p.x, p.y, at.x, at.y);

// Like sweepDist2, but `at` moved too: it went from `from` to where it is while `p` flew its path, both
// at a steady pace. What counts is the gap between them, which is itself a straight path, so this is the
// distance from `at` to `p` at their closest in that time (R68: the ship may cross far in one tick).
// Without `from`, `at` stood still and this is sweepDist2.
export const sweepRel2 = (p, dt, at, from = at) =>
  segDist2(p.x - p.vx * dt - from.x, p.y - p.vy * dt - from.y, p.x - at.x, p.y - at.y, 0, 0);

const side = (ax, ay, bx, by, px, py) => Math.sign((bx - ax) * (py - ay) - (by - ay) * (px - ax));

// Squared distance between the segments (ax, ay)-(bx, by) and (cx, cy)-(dx, dy): 0 when they cross,
// else the least of the four endpoint-to-segment distances. A segment of no length is a point.
export function segSegDist2(ax, ay, bx, by, cx, cy, dx, dy) {
  const crossing = side(ax, ay, bx, by, cx, cy) * side(ax, ay, bx, by, dx, dy) < 0
    && side(cx, cy, dx, dy, ax, ay) * side(cx, cy, dx, dy, bx, by) < 0;
  if (crossing) return 0;
  return Math.min(segDist2(ax, ay, bx, by, cx, cy), segDist2(ax, ay, bx, by, dx, dy),
    segDist2(cx, cy, dx, dy, ax, ay), segDist2(cx, cy, dx, dy, bx, by));
}

// Squared distance from the segment (ax, ay)-(bx, by) to the box of width w and height h centred on
// (cx, cy): 0 when it touches or crosses it. A segment that starts inside the box is 0. One that starts
// outside reaches the box only across an edge, so its distance is the least of its distances to the four.
export function segBoxDist2(ax, ay, bx, by, cx, cy, w, h) {
  if (Math.abs(ax - cx) <= w / 2 && Math.abs(ay - cy) <= h / 2) return 0;
  const [x0, x1, y0, y1] = [cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2];
  return Math.min(segSegDist2(ax, ay, bx, by, x0, y0, x1, y0), segSegDist2(ax, ay, bx, by, x1, y0, x1, y1),
    segSegDist2(ax, ay, bx, by, x1, y1, x0, y1), segSegDist2(ax, ay, bx, by, x0, y1, x0, y0));
}
