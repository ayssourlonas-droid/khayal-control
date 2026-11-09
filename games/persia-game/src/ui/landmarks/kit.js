// The block painting every landmark shares. The painter scales `g` by PIXEL first, so a block is one
// unit, and each call fills whole blocks in one tone of `tone` (a char -> colour map, '#' the stone).
//   blocks(g, tone) -> { box, post, slab, stamp, clear }
//   box(x, y, w, h, c = '#')   a rect of blocks in tone c
//   post(x, y, w, h)           stone lit down its left edge and shadowed ('+', '-') down its right
//   slab(x, y, w, h, c = '#')  a rect lit along its top
//   stamp(rows, x, y, flip?)   a picture of string rows, one char a block, '.' left empty
//   clear(x, y, w, h)          blocks cut back to nothing
//   scene(g, w, h, rng, L, lights, tone, under) -> art   a w x h layer's blocks with what its painter
//        shares: F the row `under` blocks above the band's foot, BW the width in blocks, mid its middle
//        column, row(up) the row of the block `up` blocks above F, and lamps, one list per depth
//   reflect(g, x, w, F, depth)   what stands above row F in the columns x..x+w (px) mirrored below it
import { PIXEL } from '../sprites.js';

export function blocks(g, tone) {
  const box = (x, y, bw, bh, c = '#') => {
    g.fillStyle = tone[c];
    g.fillRect(x, y, bw, bh);
  };
  const post = (x, y, pw, ph) => {
    box(x, y, pw, ph);
    box(x, y, 1, ph, '+');
    box(x + pw - 1, y, 1, ph, '-');
  };
  const slab = (x, y, sw, sh, c = '#') => {
    box(x, y, sw, sh, c);
    box(x, y, sw, 1, '+');
  };
  const stamp = (rows, x, y, flip = false) => rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = row[flip ? row.length - 1 - i : i];
      if (c !== '.') box(x + i, y + j, 1, 1, c);
    }
  });
  const clear = (x, y, cw, ch) => g.clearRect(x, y, cw, ch);
  return { box, post, slab, stamp, clear };
}

export function scene(g, w, h, rng, L, lights, tone, under) {
  const art = { ...blocks(g, tone), rng, lights, L, F: h / PIXEL - under, BW: w / PIXEL, lamps: [[], [], []] };
  art.mid = Math.round(art.BW / 2);
  art.row = (up) => art.F - 1 - up;
  return art;
}

// Everything above row F in the px columns x to x + w mirrored below it, row by row, down `depth`
// blocks: every third row is left to the water and every other pair is shifted a block, so it
// ripples; it dims with depth. Paint it after the water and with `g` unscaled, since it works in px.
export function reflect(g, x, w, F, depth) {
  for (let k = 1; k < depth && F - k > 0; k++) {
    if (k % 3 === 0) continue;
    g.globalAlpha = 0.45 * (1 - k / depth);
    g.drawImage(g.canvas, x, (F - k) * PIXEL, w, PIXEL, x + (k % 4 < 2 ? 0 : PIXEL), (F + k) * PIXEL, w, PIXEL);
  }
  g.globalAlpha = 1;
}
