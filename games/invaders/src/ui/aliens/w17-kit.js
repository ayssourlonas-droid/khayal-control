// What World 17's painters share (w17.js .. w17-pack.js; the light and smoke are w17-fx.js): the habit itself, painted grimy and ugly. Paper is a warm
// cream that goes to nicotine yellow and soot near the fire, filter cork is tan and pitted, ash is a cold grey that
// crumbles in chunks, char is black, and the only warmth anywhere is the ember: every glow (coal, eye, seam, spark)
// lives on the lights layer, so the body still reads with the lights off. Light comes from the upper left and leaves
// a warm rim there; the ember underlights whatever hangs above it. Nothing here is printed, branded or lettered, and
// nothing is painted per frame: every shape is baked once at load.
import { path, ink, lin, rad, rgba, shade, mix, bloom, line, ellipse, circle, TAU, INK } from './kit.js';
import { hash } from '../sprites.js';
import { lerp } from '../../core/math.js';
import { bez, tidy } from './w16-kit.js'; // the cubic points and the state-restoring painter are the same as World 16's

export { path, ink, lin, rad, rgba, shade, mix, bloom, line, ellipse, circle, TAU, INK, hash, lerp, bez, tidy };

export const PAPER = '#eee4cc'; // cigarette paper, warm white
export const PAPER_D = '#9e9078'; // paper in shadow
export const TAN = '#c99654'; // filter cork
export const TAN_D = '#6f4a26';
export const ASH = '#a29b93'; // ash
export const ASH_D = '#4f4944';
export const ASH_L = '#dcd6cc';
export const CHAR = '#1b1410'; // burnt black
export const SOOT = '#2a221d';
export const EMBER = '#ff7a30';
export const HOT = '#ffe6b0'; // white-hot centre of a coal
export const RIM = '#ffd9a8'; // the warm light on every upper-left edge

// A tiny ember spark on the lights layer: a soft bloom of radius br and strength ba, and over it a white-hot disc of radius r and
// strength a, added on top ('lighter').
export function ember(l, x, y, br, ba, r, a) {
  bloom(l, x, y, br, EMBER, ba);
  l.save();
  l.globalCompositeOperation = 'lighter';
  circle(l, x, y, r);
  l.fillStyle = rgba(HOT, a);
  l.fill();
  l.restore();
}

// A tube down the y axis: x = cx(y), half-width hw(y), from y0 to y1 in n steps; the closed outline, left side first.
export function tubePts(cx, hw, y0, y1, n = 16) {
  const L = [];
  const R = [];
  for (let i = 0; i <= n; i++) {
    const y = lerp(y0, y1, i / n);
    L.push([cx(y) - hw(y), y]);
    R.push([cx(y) + hw(y), y]);
  }
  return [...L, ...R.reverse()];
}

// Cylinder shading across x: a dark edge, a lit band left of centre, the colour, a dark edge on the right.
export const cyl = (g, x0, x1, c, dark = 0.58) => lin(g, x0, 0, x1, 0, [
  [0, shade(c, -dark)], [0.2, shade(c, 0.5)], [0.4, shade(c, 0.14)], [0.72, mix(c, '#000000', 0.22)], [1, shade(c, -dark - 0.08)],
]);

// A short bright glint streak (the gleam of a paper edge, a coat of varnish).
export function glint(g, x0, y0, x1, y1, w = 1.2, a = 0.6, c = '#ffffff') {
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  line(g, rgba(c, a), w);
}

// Soot and grime inside the current clip: n specks and smudges over an ellipse, dark and pale ones, a (0..1) strong.
export function grime(g, n, seed, cx, cy, rx, ry, a = 0.3, tone = SOOT) {
  for (let i = 0; i < n; i++) {
    const t = hash(seed * 211 + i * 4) * TAU;
    const d = Math.sqrt(hash(seed * 211 + i * 4 + 1));
    const r = 0.4 + hash(seed * 211 + i * 4 + 2) * 1.5;
    ellipse(g, cx + Math.cos(t) * d * rx, cy + Math.sin(t) * d * ry, r * (1 + hash(seed + i) * 0.8), r, hash(seed * 3 + i) * 3);
    g.fillStyle = i % 3 ? rgba(tone, a) : rgba('#fff3d6', a * 0.55);
    g.fill();
  }
}

// Lengthwise streaks (paper fibres, leaf veins, stains) between y0 and y1 across x0..x1 inside the current clip.
export function streaks(g, n, seed, x0, x1, y0, y1, c, a = 0.2, w = 0.8) {
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, hash(seed * 17 + i * 3));
    const ya = lerp(y0, y1, hash(seed * 17 + i * 3 + 1) * 0.5);
    const yb = ya + (y1 - y0) * (0.25 + hash(seed * 17 + i * 3 + 2) * 0.55);
    g.beginPath();
    g.moveTo(x, ya);
    g.lineTo(x + (hash(seed + i * 9) - 0.5) * 1.6, Math.min(yb, y1));
    line(g, rgba(c, a), w);
  }
}

// A tube along the centreline pts (half-widths hw, one per point) painted as stacked round strokes, segment by segment
// so the width can taper. Each layer is [colour, extra width, share of the full width, dx, dy]: an outline, the body,
// then narrower lit strokes shifted toward the light.
export function rod(g, pts, hw, layers) {
  for (const [c, extra, k, dx, dy] of layers) {
    for (let i = 0; i < pts.length - 1; i++) {
      g.beginPath();
      g.moveTo(pts[i][0] + dx, pts[i][1] + dy);
      g.lineTo(pts[i + 1][0] + dx, pts[i + 1][1] + dy);
      line(g, c, hw[i] * 2 * k + extra);
    }
  }
}

// A band of metal round a tube: at pt, turned to the tube's heading ang, len along it and half-width wide, brass
// (or any metal c) lit along its length, with an outline and a glint. Painted on the body.
export function band(g, pt, ang, len, wide, c) {
  g.save();
  g.translate(pt[0], pt[1]);
  g.rotate(ang);
  g.beginPath();
  g.rect(-len / 2, -wide, len, wide * 2);
  g.fillStyle = lin(g, -len / 2, 0, len / 2, 0, [[0, shade(c, -0.55)], [0.3, shade(c, 0.55)], [0.55, c], [1, shade(c, -0.6)]]);
  g.fill();
  line(g, INK, 1.8);
  g.beginPath();
  g.moveTo(-len * 0.16, -wide + 0.8);
  g.lineTo(-len * 0.16, wide - 0.8);
  line(g, rgba('#fff6d0', 0.7), 0.9);
  g.restore();
}

// Run draw on both contexts turned by ang about (x, y) and scaled by k: a diving body is drawn upright and then tilted.
export function turned(b, l, ang, x, y, draw, k = 1) {
  for (const g of [b, l]) {
    g.save();
    g.translate(x, y);
    g.rotate(ang);
    g.scale(k, k);
  }
  draw();
  l.restore();
  b.restore();
}

// Take the light away where a shape stands in front of it: erase the traced shape from the lights layer (a coal glows
// out of the gaps in the ash, not through it).
export function blocked(l, trace) {
  l.save();
  l.globalCompositeOperation = 'destination-out';
  trace(l);
  l.fillStyle = '#000000';
  l.fill();
  l.restore();
}
