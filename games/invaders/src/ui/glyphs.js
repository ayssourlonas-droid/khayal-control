// Procedural glyphs for the Code Rain world: angular marks made of a few strokes on a small
// lattice, half of them mirrored. Original shapes (no real script), cached as one atlas per colour.
import { cached, hash } from './sprites.js';
import { clamp } from '../core/math.js';

const GLYPHS = 48;
const CW = 24; // atlas cell, px
const CH = 30;
// lattice points: 3 columns x 4 rows inside the cell
const PX = [5, 12, 19];
const PY = [5, 12, 19, 26];

function strokes(i) {
  const out = [];
  const n = 3 + Math.floor(hash(i * 13 + 1) * 3);
  for (let k = 0; k < n; k++) {
    const h = (j) => hash(i * 131 + k * 17 + j);
    const c0 = Math.floor(h(1) * 3);
    const r0 = Math.floor(h(2) * 4);
    const dir = Math.floor(h(3) * 4); // right, down, down-right, down-left
    const c1 = clamp(c0 + [1, 0, 1, -1][dir], 0, 2);
    const r1 = Math.min(3, r0 + [0, 1 + Math.floor(h(4) * 2), 1, 1][dir]);
    out.push([PX[c0], PY[r0], PX[c1], PY[r1]]);
  }
  return out;
}

// One row of GLYPHS cells, stroked in `color`.
export const glyphAtlas = (color) => cached('glyphs' + color, CW * GLYPHS, CH, (g) => {
  g.strokeStyle = color;
  g.lineWidth = 2.6;
  g.lineCap = 'square';
  for (let i = 0; i < GLYPHS; i++) {
    const flip = hash(i * 7 + 3) < 0.5;
    g.beginPath();
    for (const [x0, y0, x1, y1] of strokes(i)) {
      const fx = (x) => i * CW + (flip ? CW - x : x);
      g.moveTo(fx(x0), y0);
      g.lineTo(fx(x1), y1);
    }
    g.stroke();
  }
});

// Glyph i of an atlas, `size` px tall, top-left at (x, y).
export function drawGlyph(ctx, atlas, i, x, y, size) {
  const k = ((i % GLYPHS) + GLYPHS) % GLYPHS;
  ctx.drawImage(atlas, k * CW, 0, CW, CH, x, y, (size * CW) / CH, size);
}
