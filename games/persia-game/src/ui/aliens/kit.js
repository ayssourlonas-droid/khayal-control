// Drawing kit for the alien painters (aliens/animals.js). Every painter draws centred on (0, 0) in
// world px into two contexts: `b`, the body (opaque, source-over, dark INK outline so it reads on
// any sky), and `l`, the lights (eyes, cores), which are drawn additively over the body. Paint-time only
// (sprites are baked once), so gradients and many strokes are fine here; nothing in this file runs
// per frame.
import { INK, rgba, shade, rad, line } from '../sprites.js';
import { TAU } from '../../core/math.js';

export { INK, rgba, shade, TAU, line };

// Path through [[x, y], ...]; closed unless open is set.
export function path(g, pts, open = false) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  if (!open) g.closePath();
}

// Additive bloom blob on the lights layer.
export function bloom(l, x, y, r, c, a = 1) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, x, y, 0, r, [[0, rgba(c, a)], [0.25, rgba(c, a * 0.5)], [0.6, rgba(c, a * 0.14)], [1, rgba(c, 0)]]);
  l.fillRect(x - r, y - r, r * 2, r * 2);
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
