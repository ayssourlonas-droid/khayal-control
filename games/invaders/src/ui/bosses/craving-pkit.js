// What the Craving's throne and parts share (World 17, Ash to Air; the hard half: craving-hull.js, craving-throne*.js, craving-crown*.js,
// craving-maw*.js, craving-eye*.js, craving-claw*.js, craving-tray*.js, craving-rage.js): the dead matter's colours (cast iron-black
// ceramic, grey ash, paper, coal and ember), a seeded stream of numbers, smooth closed curves, tapered ribbons along a cubic (talons,
// tendrils), a cached grain tile ('cravpgrain'), crack lines that wander (dark with a lit lip, glowing on the lights layer), blooms for
// the lights layer (round, squashed flat, a ring with a dark middle, and one that stops at the HUD's line), streaks of soot, scattered
// embers, and a fringe of the smoke body's own billows (craving-puff.js) that melts a painted part into the smoke round it. Light
// comes from two places: a cold grey rim from the smog above and the warm underlight of the embers in the bowl. Bake-time only:
// nothing here runs per frame.
import { cached, hash, mix } from '../sprites.js';
import { path, line, lin, rad, rgba, shade, TAU } from './kit.js';
import { circle, ellipse } from '../aliens/kit.js';
import { PAL, PART, TOP } from './craving-kit.js';
import { lerp } from '../../core/math.js';

export { PAL, PART, TOP, TAU, path, line, lin, rad, rgba, shade, mix, circle, ellipse };

export const IRON = ['#080605', '#15100e', '#241c19', '#352b27', '#4c3f38', '#6e5f55', '#9a8a7c']; // cast ash-black, shadow .. cold rim
export const SOOT = '#0b0807';
export const ASH = ['#3a322e', '#5e544d', '#867a70', '#b0a498', '#d6cdc0']; // heaped ash, dark .. pale
export const COAL = ['#2a0c06', '#7a1d0a', '#d2400f', '#ff7a1a', '#ffb347', '#ffe9b8']; // dead coal .. white-hot
export const RUST = '#6b3a22';

// A seeded stream in [0, 1): the same throne every bake.
export const rng = (seed) => {
  let i = 0;
  return () => hash(seed * 7919 + i++);
};

// A smooth closed (or open) blob through pts: quadratic curves through the midpoints, the points as controls.
export function blobPath(g, pts, closed = true) {
  const n = pts.length;
  g.beginPath();
  if (!closed) {
    g.moveTo(...pts[0]);
    for (let i = 1; i < n - 1; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
    g.lineTo(...pts[n - 1]);
    return;
  }
  g.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const [p, q] = [pts[i], pts[(i + 1) % n]];
    g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  g.closePath();
}

// The point on the cubic [p0, c1, c2, p3] at t, and its direction.
export function cubic([p0, c1, c2, p3], t) {
  const u = 1 - t;
  const x = u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0];
  const y = u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1];
  const dx = 3 * u * u * (c1[0] - p0[0]) + 6 * u * t * (c2[0] - c1[0]) + 3 * t * t * (p3[0] - c2[0]);
  const dy = 3 * u * u * (c1[1] - p0[1]) + 6 * u * t * (c2[1] - c1[1]) + 3 * t * t * (p3[1] - c2[1]);
  const d = Math.hypot(dx, dy) || 1;
  return [x, y, dx / d, dy / d];
}

// A tapered ribbon along the cubic, w0 wide at the start and w1 at the end (power `pw` shapes the taper): the path is built
// (not filled); returns { mid, left, right } sample points for the decoration that follows the edge.
export function ribbon(g, curve, w0, w1, steps = 16, pw = 1) {
  const [mid, left, right] = [[], [], []];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y, tx, ty] = cubic(curve, t);
    const w = lerp(w0, w1, t ** pw) / 2;
    mid.push([x, y]);
    left.push([x + ty * w, y - tx * w]);
    right.push([x - ty * w, y + tx * w]);
  }
  g.beginPath();
  g.moveTo(...left[0]);
  for (const p of left) g.lineTo(...p);
  for (const p of right.toReversed()) g.lineTo(...p);
  g.closePath();
  return { mid, left, right };
}

const tile = () => cached('cravpgrain', 96, 96, (g) => {
  const r = rng(77);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = r() < 0.28 ? `rgba(255,236,210,${0.03 + r() * 0.06})` : `rgba(0,0,0,${0.1 + r() * 0.2})`;
    g.fillRect(Math.floor(r() * 96), Math.floor(r() * 96), r() < 0.8 ? 1 : 2, r() < 0.8 ? 1 : 2);
  }
});

// Grain over the box (inside whatever is clipped): pits and specks, the cast surface's roughness.
export function grain(g, x, y, w, h, a = 1) {
  g.save();
  g.globalAlpha *= a;
  g.fillStyle = g.createPattern(tile(), 'repeat');
  g.fillRect(x, y, w, h);
  g.restore();
}

// A crack that wanders from (x, y) heading `a`: n segments of about `step` px; returns the points.
export function crackPts(r, x, y, a, n, step) {
  const pts = [[x, y]];
  for (let i = 0; i < n; i++) {
    a += (r() - 0.5) * 1.3;
    x += Math.cos(a) * step * (0.6 + r() * 0.8);
    y += Math.sin(a) * step * (0.6 + r() * 0.8);
    pts.push([x, y]);
  }
  return pts;
}

// A crack drawn dark with a pale lip below it; the same points glow on the lights layer when `l` is given.
export function crack(b, l, pts, w = 2, glowC = null, a = 0.7) {
  path(b, pts, true);
  line(b, rgba('#ffffff', 0.16), w + 1.2);
  b.translate(0, -0.8);
  path(b, pts, true);
  line(b, SOOT, w);
  b.translate(0, 0.8);
  if (l && glowC) {
    l.save();
    l.globalCompositeOperation = 'lighter';
    path(l, pts, true);
    line(l, rgba(glowC, a * 0.28), w * 3.4);
    path(l, pts, true);
    line(l, rgba(glowC, a), Math.max(0.8, w * 0.5));
    l.restore();
  }
}

// A bloom on the lights layer that never reaches above `yMin` (the HUD's line): the rectangle is cut there.
export function heat(l, x, y, r, c, a, yMin = -1e9) {
  const y0 = Math.max(y - r, yMin);
  if (y0 >= y + r) return;
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, x, y, 0, r, [[0, rgba(c, a)], [0.25, rgba(c, a * 0.5)], [0.6, rgba(c, a * 0.14)], [1, rgba(c, 0)]]);
  l.fillRect(x - r, y0, r * 2, y + r - y0);
  l.restore();
}

// Vertical streaks of soot or rust down a box (clip first): n thin drips of colour c, fading toward their ends.
export function streaks(g, r, x0, x1, y0, y1, n, c, a = 0.3, len = 0.6) {
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, r());
    const ya = y0 + r() * (y1 - y0) * (1 - len * 0.6);
    const h = Math.min((y1 - y0) * len * (0.3 + r() * 0.7), y1 - ya);
    g.fillStyle = lin(g, 0, ya, 0, ya + h, [[0, rgba(c, 0)], [0.25, rgba(c, a)], [1, rgba(c, 0)]]);
    g.fillRect(x - 0.6 - r() * 1.6, ya, 1.2 + r() * 3, h);
  }
}

// A ring of light round (x, y): nothing inside rIn, full at rPeak, gone at rOut (so a dark pupil stays dark in the middle).
export function ring(l, x, y, rIn, rPeak, rOut, c, a) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, x, y, 0, rOut, [[0, rgba(c, 0)], [rIn / rOut, rgba(c, 0)], [rPeak / rOut, rgba(c, a)], [1, rgba(c, 0)]]);
  l.fillRect(x - rOut, y - rOut, rOut * 2, rOut * 2);
  l.restore();
}

// A bloom squashed into an ellipse rx wide and ry tall: a wide flat glow that still ends inside a small canvas.
export function heatE(l, x, y, rx, ry, c, a) {
  l.save();
  l.translate(x, y);
  l.scale(1, ry / rx);
  heat(l, 0, 0, rx, c, a);
  l.restore();
}

// Tiny embers scattered over a charred surface (clip first): n specks of 0.8..1.8 px, orange to deep red, mostly dim.
export function embers(g, r, x0, y0, w, h, n, a = 0.5) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = rgba(r() < 0.3 ? COAL[3] : COAL[2], a * (0.35 + r() * 0.65));
    const d = 0.8 + r() * 1;
    g.fillRect(x0 + r() * w, y0 + r() * h, d, d);
  }
}
