// Ice for the Crystal Wyrm (bosses/wyrm*.js): a tube of translucent ice for its body and the glacier
// it rises from. Bake-time only (kit.js has the rest of what a boss painter needs).
import { path, ink, line, lin, rgba, shade, neon, bloom, TAU } from './kit.js';
import { INK, hash, noise2 } from '../sprites.js';

export const GREEN = '#7dffc0'; // the aurora's colours, on the wyrm's veins and its frill
export const VIOLET = '#a07aff';
export const SNOW = '#eef8ff';
const WALL = '#1c5a98';
const DEEP = '#0e3a6c';

// Points round an ellipse, or along a quadratic curve, for a tube to follow.
export const ringPts = (cx, cy, rx, ry, n = 96) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos((i / n) * TAU) * rx, cy + Math.sin((i / n) * TAU) * ry]);
export const curvePts = ([x0, y0], [cx, cy], [x1, y1], n = 32) => Array.from({ length: n + 1 }, (_, i) => {
  const u = i / n;
  return [(1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y1];
});

const trace = (pts) => (g) => path(g, pts, true);

// Scales over a tube: rows of small crescents laid along it, each overlapping the one before, the edge
// of each lit and the shadow under it dark.
function scales(b, pts, w) {
  let last = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    if (Math.hypot(px - last[0], py - last[1]) < 7.5) continue;
    last = pts[i];
    const ang = Math.atan2(pts[i + 1][1] - pts[i - 1][1], pts[i + 1][0] - pts[i - 1][0]);
    const [tx, ty] = [Math.cos(ang), Math.sin(ang)];
    for (const r of [-1, 0, 1]) {
      const [cx, cy] = [px - ty * r * w * 0.27 + tx * (r % 2 ? 3.7 : 0), py + tx * r * w * 0.27 + ty * (r % 2 ? 3.7 : 0)];
      for (const [dy, color, lw] of [[1, rgba('#06304a', 0.4), 1.5], [0, rgba('#ffffff', 0.32), 1]]) {
        b.beginPath();
        b.arc(cx, cy + dy, w * 0.15, ang + Math.PI / 2, ang + (3 * Math.PI) / 2);
        b.strokeStyle = color;
        b.lineWidth = lw;
        b.stroke();
      }
    }
  }
}

// A tube of ice along pts, w wide: an INK wall, deep blue, a lighter core lit from the upper left, the
// backbone faintly showing through, and scales over all of it.
export function tube(b, pts, w, y0 = -200, y1 = 200) {
  b.lineCap = 'round';
  b.lineJoin = 'round';
  const pass = (lw, style, dash = [], dx = 0, dy = 0) => {
    b.save();
    b.translate(dx, dy);
    path(b, pts, true);
    b.setLineDash(dash);
    b.lineWidth = lw;
    b.strokeStyle = style;
    b.stroke();
    b.restore();
  };
  pass(w + 7, INK);
  pass(w + 1, WALL);
  pass(w - 7, lin(b, 0, y0, 0, y1, [[0, '#5aa4e0'], [1, '#2a68a8']]));
  pass(w - 16, rgba('#8ac8f0', 0.6), [], -2.5, -3);
  pass(w - 28, rgba('#ffffff', 0.2), [], -4, -5);
  pass(w - 26, rgba(DEEP, 0.35), [3, 9]);
  scales(b, pts, w - 8);
}

// The tube's veins of light: a neon line along its middle.
export function vein(l, pts, color, w, a) {
  trace(pts)(l);
  neon(l, color, w, a);
}

// The glacier's top edge at x: a rolling surface with a mound at the middle for the wyrm to rise from.
// Mirror-symmetric, like the wyrm, so the right coil (the left one mirrored) sinks into it just as the left does.
export const surface = (x) => {
  const ax = Math.abs(x);
  return 90 + 9 * Math.sin(ax * 0.021) + 6 * Math.sin(ax * 0.057 + 1) - 22 * Math.exp(-((ax / 120) ** 2)) + (noise2(ax, 0, 9, 4) - 0.5) * 7 + 46 * (ax / 352) ** 3;
};
// ...and its underside, ragged with ice.
const under = (x) => 152 + 14 * Math.abs(Math.sin(x * 0.029)) + 7 * Math.sin(x * 0.11 + 2) - 58 * (Math.abs(x) / 352) ** 3;

// The glacier: a block of blue ice with a snow-capped, rolling top and a ragged underside hung with
// icicles, the wyrm's coils sunk in it. Strata, bubbles and blue crevasses in the face; the cracks glow.
export function glacier(b, l) {
  const X = 352;
  b.beginPath();
  for (let x = -X; x <= X; x += 4) b.lineTo(x, surface(x));
  for (let x = X; x >= -X; x -= 4) b.lineTo(x, under(x));
  b.closePath();
  ink(b, lin(b, 0, 70, 0, 170, [[0, '#b8e0ff'], [0.25, '#6ab0e8'], [0.7, '#2a68a8'], [1, '#0e2a50']]), 3.4);
  b.save();
  b.clip();
  for (let x = -X; x < X; ) { // columns of ice, some lit and some in shade
    const cw = 14 + hash(x) * 26;
    b.fillStyle = hash(x + 3) < 0.5 ? rgba('#ffffff', 0.04 + hash(x + 1) * 0.12) : rgba('#02101e', 0.1 + hash(x + 2) * 0.2);
    b.fillRect(x, 70, cw, 110);
    x += cw;
  }
  b.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) { // old snowfall in bands
    b.strokeStyle = rgba(i % 2 ? '#ffffff' : '#02101e', 0.14);
    b.beginPath();
    for (let x = -X; x <= X; x += 12) b.lineTo(x, 104 + i * 10 + Math.sin(x * 0.03 + i) * 4);
    b.stroke();
  }
  for (let i = 0; i < 26; i++) { // crevasses, with a cold light in them
    let x = -X + hash(i * 5) * 2 * X;
    let y = surface(x) + 4;
    const pts = [[x, y]];
    for (let k = 0; k < 4; k++) pts.push([(x += (hash(i * 7 + k) - 0.5) * 16), (y += 9 + hash(i * 9 + k) * 18)]);
    path(b, pts, true);
    line(b, rgba('#031a3a', 0.8), 3);
    path(b, pts.map(([px, py]) => [px + 2, py]), true);
    line(b, rgba('#bff4ff', 0.35), 1);
    path(l, pts, true);
    neon(l, '#5ad0ff', 0.8, 0.28);
  }
  for (let i = 0; i < 40; i++) { // bubbles frozen in
    b.beginPath();
    b.arc(-X + hash(i * 3) * 2 * X, 108 + hash(i * 3 + 1) * 50, 0.8 + hash(i * 3 + 2) * 1.6, 0, TAU);
    b.fillStyle = rgba('#e8f8ff', 0.35);
    b.fill();
  }
  b.restore();
  for (let i = 0; i < 18; i++) { // crystals sprouting from the ice along the top
    const x = -X + 14 + hash(i * 11) * (2 * X - 28);
    if (Math.abs(x) < 70) continue;
    const [w, h, y] = [5 + hash(i * 11 + 1) * 8, 12 + hash(i * 11 + 2) * 20, surface(x) + 3];
    path(b, [[x - w, y], [x - w * 0.4 + (hash(i) - 0.5) * 6, y - h], [x + w * 0.5, y - h * 0.8], [x + w, y]]);
    ink(b, lin(b, 0, y - h, 0, y, [[0, '#f0fbff'], [1, '#6ab0e8']]), 1.4);
  }
  for (let x = -X + 6; x < X - 10; x += 12 + hash(x) * 22) { // snow along the top, and drips of it over the edge
    const y = surface(x);
    b.beginPath();
    b.moveTo(x - 7, y + 1);
    b.quadraticCurveTo(x - 4, y - 8 - hash(x + 1) * 7, x + 7, y + 1);
    b.fillStyle = SNOW;
    b.fill();
    if (hash(x + 2) < 0.4) {
      b.beginPath();
      b.ellipse(x, y + 7 + hash(x + 3) * 8, 2.4, 4.6, 0, 0, TAU);
      b.fillStyle = rgba(SNOW, 0.9);
      b.fill();
    }
  }
  b.beginPath();
  for (let x = -X; x <= X; x += 4) b.lineTo(x, surface(x) + 1);
  line(b, rgba('#ffffff', 0.85), 2.4);
  for (let x = -X + 10; x < X - 10; x += 9 + hash(x) * 14) { // icicles under it
    const y = under(x) - 2;
    const len = 5 + hash(x + 5) ** 2 * 24;
    path(b, [[x - 3, y], [x + 3, y], [x + 0.4, y + len]]);
    ink(b, rgba(shade('#9fd8f0', 0.2), 0.95), 1.3);
  }
  bloom(l, 0, 130, 280, '#5ad0ff', 0.08);
}
