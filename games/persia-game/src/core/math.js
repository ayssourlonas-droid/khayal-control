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


// Move `v` toward `target` by at most `step` without overshooting.
export const approach = (v, target, step) =>
  v < target ? Math.min(v + step, target) : Math.max(v - step, target);

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
