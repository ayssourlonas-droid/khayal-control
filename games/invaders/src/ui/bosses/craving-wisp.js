// The Craving's thin smoke (World 17, Ash to Air; craving-puff.js caches these): ribbons made, like its billows, of soft dots, a
// few hundred of them strewn along a path that is worked out by turning a heading step by step, so that the line bends the way
// smoke does, each dot thrown a little to either side of the line (more where the ribbon is fat), so the edge is ragged and the
// thin ends dissolve. A WISP is a long lazy S, a CURL a stroke that tightens into a hook at its head (the head is at the upper
// right of its canvas, the tail at the lower left), both fitted to their canvas with a margin so nothing is cut off, thickest a
// little past the tail and thinning to nothing at both ends. DARK ones are charcoal greys with a lit upper edge, for painting
// into the body; PALE ones are ash grey, for drawing over the dark parts and the sky; LIT ones are ember-warm with a white-gold thread along the middle, for drawing additively over it (the maw's
// inhaled breath, the smoke curling off the arms).
import { hash } from '../sprites.js';
import { dot, HOT, WARM0, COOL0 } from './craving-blob.js';
import { TAU } from '../../core/math.js';

const STEPS = 60;
const LIT = [WARM0 + 3, WARM0 + 4, HOT, HOT + 1]; // the lit ones' colours, from the edge in: ember, orange, gold, white-hot
const pts = new Float32Array((STEPS + 1) * 2); // scratch: the path's points, bake time only

// The path: `bend(u)` is the heading's turn rate at u in 0..1; points land in pts, scaled to fill w x h less a margin m.
function trace(w, h, m, start, bend, stretch = false) {
  let [x, y, a] = [0, 0, start];
  const raw = [[0, 0]];
  for (let i = 1; i <= STEPS; i++) {
    a += bend(i / STEPS) / STEPS;
    x += Math.cos(a);
    y += Math.sin(a);
    raw.push([x, y]);
  }
  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const kx = (w - 2 * m) / Math.max(1e-6, x1 - x0);
  const ky = stretch ? (h - 2 * m) / Math.max(1e-6, y1 - y0) : kx;
  const k = Math.min(kx, (h - 2 * m) / Math.max(1e-6, y1 - y0));
  const [sx, sy] = stretch ? [kx, ky] : [k, k]; // a wisp is stretched to fill its 2 : 1 canvas, a curl keeps its shape
  raw.forEach(([px, py], i) => {
    pts[i * 2] = (w - (x1 - x0) * sx) / 2 + (px - x0) * sx;
    pts[i * 2 + 1] = (h - (y1 - y0) * sy) / 2 + (py - y0) * sy;
  });
}

// Strew the dots along the path: n of them, each at a place along it, thrown aside by up to its local half width.
function ribbon(g, lit, thick, seed) {
  g.save();
  const n = 190;
  for (let i = 0; i < n; i++) {
    const u = (i + hash(seed + i * 3)) / n;
    const f = Math.sin(Math.PI * Math.min(1, u * 1.06)) ** 0.8 * (1 - 0.4 * u);
    const j = u * STEPS;
    const [k, e] = [Math.min(STEPS - 1, Math.floor(j)), j - Math.floor(j)];
    const [x, y] = [pts[k * 2] + (pts[k * 2 + 2] - pts[k * 2]) * e, pts[k * 2 + 1] + (pts[k * 2 + 3] - pts[k * 2 + 1]) * e];
    const side = (hash(seed + i * 7 + 1) - 0.5) * 2;
    const [dx, dy] = [pts[k * 2 + 3] - pts[k * 2 + 1], -(pts[k * 2 + 2] - pts[k * 2])]; // the normal
    const len = Math.hypot(dx, dy) || 1;
    const r = Math.max(1.4, thick * f * (0.35 + 0.55 * hash(seed + i * 11 + 2)));
    const [px, py] = [x + (dx / len) * side * thick * f * 0.9, y + (dy / len) * side * thick * f * 0.9];
    const core = 1 - Math.abs(side);
    let idx = lit === 2 ? COOL0 + 4 + (core > 0.5) + (core > 0.85) : lit ? LIT[(core > 0.35) + (core > 0.7) + (core > 0.9)] : COOL0 + 2;
    if (!lit && side < -0.3) idx = COOL0 + 4; // the upper edge catches the light
    g.globalAlpha = (lit === 2 ? 0.55 : lit ? 0.27 : 0.4) * (0.45 + 0.9 * hash(seed + i * 13 + 4)) * (0.4 + 0.6 * f);
    g.drawImage(dot(idx), px - r, py - r, r * 2, r * 2);
  }
  g.restore();
}

// v picks the lean and the wobble. wisp: a lazy S; curl: a stroke tightening into a hook.
export function paintWisp(g, w, h, v, lit) {
  const [ph, am] = [hash(v * 31 + 5) * TAU, 1.2 + hash(v * 17 + 3) * 1.4];
  const thick = h * (0.1 + 0.03 * hash(v + 9));
  trace(w, h, thick * 2 + 3, -0.25 + hash(v * 7) * 0.5, (u) => am * 5 * Math.sin(TAU * (0.8 + 0.5 * hash(v * 13 + 1)) * u + ph), true);
  ribbon(g, lit, thick, v * 17 + (lit ? 101 : 3));
}

export function paintCurl(g, w, h, v, lit) {
  const k = 24 + hash(v * 19 + 2) * 10;
  const thick = w * (0.085 + 0.025 * hash(v * 3 + 8));
  trace(w, h, thick * 2 + 3, -0.35 - 0.5 * hash(v * 5 + 1), (u) => -1.2 + k * u * u * u + 3 * Math.sin(TAU * u * (0.6 + 0.3 * hash(v * 3 + 7))));
  ribbon(g, lit, thick, v * 23 + (lit ? 211 : 5));
}
