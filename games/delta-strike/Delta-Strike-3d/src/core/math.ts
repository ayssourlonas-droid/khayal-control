export interface Vec3 {
  x: number;
  y: number;
  z: number;
}
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const damp = (a: number, b: number, k: number, dt: number) =>
  a + (b - a) * (1 - Math.exp(-k * dt));
export const distance = (a: Vec3, b: Vec3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
export function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function direction(yaw: number, pitch: number): Vec3 {
  return {
    x: Math.sin(yaw) * Math.cos(pitch),
    y: Math.sin(pitch),
    z: -Math.cos(yaw) * Math.cos(pitch),
  };
}
/** Slab intersection over the whole travelled segment; returns earliest time of impact. */
export function segmentBox(from: Vec3, to: Vec3, center: Vec3, half: Vec3): number | null {
  let lo = 0,
    hi = 1;
  for (const axis of ['x', 'y', 'z'] as const) {
    const start = from[axis] - center[axis],
      delta = to[axis] - from[axis];
    if (Math.abs(delta) < 1e-9) {
      if (Math.abs(start) > half[axis]) return null;
      continue;
    }
    let a = (-half[axis] - start) / delta,
      b = (half[axis] - start) / delta;
    if (a > b) [a, b] = [b, a];
    lo = Math.max(lo, a);
    hi = Math.min(hi, b);
    if (lo > hi) return null;
  }
  return lo;
}
