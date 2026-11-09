// Shapes shared by the painters of Aurora Kingdom's layers (parallax-ice.js, -ice-2.js, -ice-3.js): a
// silhouette is filled in the layer colour, then its faces are lit and shaded over it, so a hundred
// pieces of ice read as faceted and not as black cut-outs. The blue the aurora lights an ice face with
// is LIT, the shadow it leaves SHADE. See parallax-shapes.js for the painter contract.
import { rgba, lin } from './sprites.js';
import { lancet } from './parallax-gothic-kit.js';

export const LIT = '#7ac4f0';
export const SHADE = '#020a18';
export const SNOW = '#e8f6ff';

const poly = (g, pts) => {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
};

// A fringe of icicles hanging from the edge y = edge(x), one about every `gap` px, `lo` to `hi` long,
// lit on their left side.
export function icicles(g, rng, x0, x1, edge, gap, lo, hi, a = 0.6) {
  for (let x = x0; x < x1; x += gap * (0.5 + rng())) {
    const len = lo + rng() * rng() * (hi - lo);
    const y = edge(x) - 1;
    const wd = 1.6 + len * 0.07;
    poly(g, [[x - wd, y], [x + wd, y], [x + 0.3, y + len]]);
    g.fillStyle = rgba('#bfe6ff', a);
    g.fill();
    poly(g, [[x - wd, y], [x, y], [x + 0.3, y + len]]);
    g.fillStyle = rgba('#ffffff', a * 0.7);
    g.fill();
  }
}

// An obelisk of ice standing on `base`, w wide and h tall, its tip leaning `lean` px: the shaft and a
// pointed top, split down the arete into a lit face and a shaded one. Fills with the current style.
export function obelisk(g, x, base, w, h, lean = 0) {
  const hw = w / 2;
  const neck = base - h * 0.74;
  const tip = [x + lean, base - h];
  const mx = x + lean * 0.4;
  const outline = [[x - hw - 2, base], [x - hw + lean * 0.3, neck], tip, [x + hw + lean * 0.3, neck], [x + hw + 2, base]];
  poly(g, outline);
  g.fill();
  g.save();
  poly(g, [outline[0], outline[1], tip, [mx, neck], [mx, base]]);
  g.fillStyle = lin(g, 0, tip[1], 0, base, [[0, rgba(LIT, 0.6)], [0.5, rgba(LIT, 0.24)], [1, rgba(LIT, 0.05)]]);
  g.fill();
  poly(g, [[mx, base], [mx, neck], tip, outline[3], outline[4]]);
  g.fillStyle = rgba(SHADE, 0.36);
  g.fill();
  g.beginPath();
  g.moveTo(...tip);
  g.lineTo(mx, base - h * 0.3);
  g.strokeStyle = rgba('#e4f6ff', 0.55);
  g.lineWidth = 1.2;
  g.stroke();
  g.restore();
  return tip;
}

// A glacier peak on `base`, hw wide each side and ht tall: the silhouette, a lit face and a shaded one
// split down a spine, snow over the top of it down to a ragged line, and couloirs scored down both
// faces. k (0 to 1) is how much of that survives the distance. Fills with the current style.
export function peak(g, rng, x, base, hw, ht, k = 1, snow = 0.42) {
  const ax = x + (rng() - 0.5) * hw * 0.2;
  const ay = base - ht;
  const slope = (dir) => Array.from({ length: 8 }, (_, i) => {
    const u = (i + 1) / 8;
    return [ax + dir * hw * u ** 0.85 + (rng() - 0.5) * hw * 0.08 * (1 - u * 0.5), ay + (base + 4 - ay) * u ** 1.3 + (rng() - 0.5) * ht * 0.07 * (1 - u)];
  });
  const left = slope(-1);
  const right = slope(1);
  const foot = [x + (rng() - 0.5) * hw * 0.3, base + 4];
  const mid = [(ax + foot[0]) / 2 + (rng() - 0.5) * hw * 0.16, (ay + foot[1]) / 2];
  const whole = [[ax, ay], ...right, ...left.toReversed()];
  poly(g, whole);
  g.fill();
  g.save();
  poly(g, whole);
  g.clip();
  poly(g, [[ax, ay], ...left, foot, mid]);
  g.fillStyle = lin(g, 0, ay, 0, base, [[0, rgba(LIT, 0.4 * k)], [0.6, rgba(LIT, 0.16 * k)], [1, rgba(LIT, 0.03 * k)]]);
  g.fill();
  g.beginPath(); // snow lies above a ragged line
  g.moveTo(ax - hw - 4, ay - 4);
  for (let i = 0; i <= 12; i++) g.lineTo(ax - hw + (hw * 2 * i) / 12, ay + ht * snow * (0.55 + rng() * 0.7) * (1 - Math.abs(i - 6) / 14));
  g.lineTo(ax + hw + 4, ay - 4);
  g.closePath();
  g.fillStyle = rgba('#b4dcf8', 0.6 * k);
  g.fill();
  poly(g, [[ax, ay], ...right, foot, mid]);
  g.fillStyle = rgba(SHADE, 0.4 * k);
  g.fill();
  g.lineCap = 'round';
  for (let i = 0; i < 6; i++) { // couloirs
    const side = i % 2 ? 1 : -1;
    const sx = ax + side * hw * (0.08 + rng() * 0.35);
    const sy = ay + ht * (0.15 + rng() * 0.3);
    g.beginPath();
    g.moveTo(sx, sy);
    g.quadraticCurveTo(sx + side * 8 + (rng() - 0.5) * 14, sy + ht * 0.25, sx + side * hw * 0.2, sy + ht * (0.35 + rng() * 0.3));
    g.strokeStyle = rgba(side < 0 ? '#06182c' : SHADE, 0.4 * k);
    g.lineWidth = 1.5 + rng() * 2;
    g.stroke();
  }
  g.restore();
}

// A lit pointed window, its sill at (x, y), with the glow it casts on the layer's lights.
export function lamp(g, out, rng, x, y, w, h, color, mode = 'steady') {
  lancet(g, x, y, w, h);
  g.fillStyle = rgba(color, 0.95);
  g.fill();
  lancet(g, x, y, w * 0.4, h * 0.8);
  g.fillStyle = rgba('#ffffff', 0.7);
  g.fill();
  g.strokeStyle = rgba('#3a2a1a', 0.7);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(x - w / 2, y - h * 0.45);
  g.lineTo(x + w / 2, y - h * 0.45);
  g.stroke();
  out.lights.push({ x, y: y - h * 0.45, r: Math.max(w, h) * 1.5, color, mode, ph: rng(), a: 0.8 });
}
