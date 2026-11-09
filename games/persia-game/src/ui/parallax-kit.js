// Shared helpers for the parallax painters: outlines and midpoint ridges.

// A filled outline from a top-edge function y(x), closed along the bottom.
export function profile(g, w, h, top, step = 4) {
  g.beginPath();
  g.moveTo(0, h);
  for (let x = 0; x <= w + step; x += step) g.lineTo(x, top(x));
  g.lineTo(w + step, h);
  g.closePath();
  g.fill();
}

// Midpoint displacement ridge, values 0..1.
function ridge(rng, n, rough) {
  const pts = Array.from({ length: n + 1 }, () => 0);
  pts[0] = rng();
  pts[n] = rng();
  for (let step = n; step > 1; step >>= 1) {
    const amp = (step / n) ** (1 - rough * 0.6);
    for (let i = step / 2; i < n; i += step) pts[i] = (pts[i - step / 2] + pts[i + step / 2]) / 2 + (rng() - 0.5) * amp;
  }
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  return pts.map((p) => (p - lo) / (hi - lo || 1));
}

// A ridge as a top-edge function: peaks reach the band's top, valleys sit at FLOOR of it.
const FLOOR = 0.05;
const SHARP = 1.3;
export function ridgeTop(rng, w, h, rough) {
  const r = ridge(rng, 64, rough);
  const seg = w / 64;
  return (x) => {
    const i = Math.min(63, Math.floor(x / seg));
    const u = x / seg - i;
    const v = r[i] + (r[i + 1] - r[i]) * u;
    return h * (1 - FLOOR - (0.95 - FLOOR) * v ** SHARP);
  };
}
