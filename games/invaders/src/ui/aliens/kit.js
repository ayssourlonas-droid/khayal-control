// Drawing kit for the alien painters (aliens/w1.js .. w12.js). Every painter draws centred on (0, 0)
// in world px into two contexts: `b`, the body (opaque, source-over, dark INK outline so it reads on
// any sky), and `l`, the lights (eyes, neon, cores), which are drawn additively over the body and are
// all that survives Neon Rain's darkness. Paint-time only (sprites are baked once), so gradients and
// many strokes are fine here; nothing in this file runs per frame.
import { INK, rgba, shade, mix, lin, rad, line } from '../sprites.js';
import { TAU } from '../../core/math.js';

export { INK, rgba, shade, mix, TAU, lin, rad, line };

// Path through [[x, y], ...]; closed unless open is set.
export function path(g, pts, open = false) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  if (!open) g.closePath();
}

// A left-right symmetric outline from its right half (x >= 0, listed top to bottom).
export const sym = (half) => [...half, ...half.toReversed().map(([x, y]) => [-x, y])];

// Two mirrored copies of whatever draw(side) paints, side = -1 then 1.
export function both(draw) {
  draw(-1);
  draw(1);
}

// Fill the current path, then outline it in INK.
export function ink(g, fill, lw = 3) {
  g.fillStyle = fill;
  g.fill();
  line(g, INK, lw);
}

// Polished metal across x: dark edge, a bright band left of centre, the colour, a dark edge.
export const chrome = (g, c, x0, x1) => lin(g, x0, 0, x1, 0, [
  [0, shade(c, -0.6)], [0.3, shade(c, 0.75)], [0.42, shade(c, 0.2)], [0.7, c], [1, shade(c, -0.65)],
]);

// Glossy highlight: a soft white ellipse.
export function gloss(g, x, y, rx, ry, a = 0.55, rot = 0) {
  g.fillStyle = rad(g, 0, 0, 0, 1, [[0, rgba('#ffffff', a)], [1, rgba('#ffffff', 0)]]);
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.scale(rx, ry);
  g.beginPath();
  g.arc(0, 0, 1, 0, TAU);
  g.fill();
  g.restore();
}

// Additive bloom blob on the lights layer.
export function bloom(l, x, y, r, c, a = 1) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, x, y, 0, r, [[0, rgba(c, a)], [0.25, rgba(c, a * 0.5)], [0.6, rgba(c, a * 0.14)], [1, rgba(c, 0)]]);
  l.fillRect(x - r, y - r, r * 2, r * 2);
  l.restore();
}

// A glowing eye or lamp: bloom, a coloured disc and a white-hot centre.
export function eye(l, x, y, r, c, halo = 4) {
  bloom(l, x, y, r * halo, c, 0.8);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, x, y, 0, r, [[0, '#ffffff'], [0.45, shade(c, 0.6)], [1, rgba(c, 0.9)]]);
  l.beginPath();
  l.arc(x, y, r, 0, TAU);
  l.fill();
  l.restore();
}

// A neon tube along the current path of `l` (set it first): soft wide passes, the colour, a white core.
export function neon(l, c, w = 3, a = 1) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.lineCap = 'round';
  l.lineJoin = 'round';
  for (const [k, al] of [[5, 0.07], [3.2, 0.12], [2, 0.3]]) {
    l.lineWidth = w * k;
    l.strokeStyle = rgba(c, al * a);
    l.stroke();
  }
  l.lineWidth = w;
  l.strokeStyle = rgba(shade(c, 0.25), a);
  l.stroke();
  l.lineWidth = Math.max(1, w * 0.35);
  l.strokeStyle = rgba('#ffffff', 0.85 * a);
  l.stroke();
  l.restore();
}

// Phosphor afterglow: a blurred copy of the whole body added to the lights at strength a.
export function phosphor(b, l, a = 0.5, r = 4) {
  const k = Math.abs(b.getTransform().a); // a mirrored boss part has a = -1
  l.save();
  l.setTransform(1, 0, 0, 1, 0, 0);
  l.globalCompositeOperation = 'lighter';
  l.globalAlpha = a;
  l.filter = `blur(${r * k}px)`;
  l.drawImage(b.canvas, 0, 0);
  l.restore();
}

export function circle(g, x, y, r) {
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
}

export function ellipse(g, x, y, rx, ry, rot = 0) {
  g.beginPath();
  g.ellipse(x, y, rx, ry, rot, 0, TAU);
}

// Pixel art: rows of characters, `px` per cell, centred. map: char -> colour (or [colour, light]);
// '.' and ' ' are empty. Each cell is bevelled (light top-left, dark bottom-right) like a lit
// phosphor dot; a cell whose entry has `light` also goes onto the lights layer.
export function pixels(b, l, rows, px, map) {
  const w = rows[0].length;
  const x0 = (-w * px) / 2;
  const y0 = (-rows.length * px) / 2;
  const solid = (x, y) => y >= 0 && y < rows.length && x >= 0 && x < w && map[rows[y][x]];
  b.fillStyle = INK;
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (map[ch]) b.fillRect(x0 + x * px - 2, y0 + y * px - 2, px + 4, px + 4);
  }));
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    const m = map[ch];
    if (!m) return;
    const [c, light] = Array.isArray(m) ? m : [m, false];
    const X = x0 + x * px;
    const Y = y0 + y * px;
    b.fillStyle = c;
    b.fillRect(X, Y, px, px);
    b.fillStyle = rgba('#ffffff', solid(x, y - 1) ? 0.12 : 0.45);
    b.fillRect(X, Y, px, px * 0.3);
    b.fillStyle = rgba('#000000', solid(x, y + 1) ? 0.1 : 0.35);
    b.fillRect(X, Y + px * 0.7, px, px * 0.3);
    if (light) {
      l.globalCompositeOperation = 'lighter';
      l.fillStyle = c;
      l.fillRect(X, Y, px, px);
      bloom(l, X + px / 2, Y + px / 2, px * 1.8, c, 0.3);
    }
  }));
}
