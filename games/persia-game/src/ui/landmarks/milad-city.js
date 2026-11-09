// Tehran round the Milad Tower's foot (milad.js): two rows of blocks of flats across the whole
// width, the far one higher, paler and dimmer, the near one lower and better lit, with now and then
// a taller tower carrying a red lamp; and in front of both the highway, a deck with its lamps on
// posts in a line and the lights of the cars on it. Rows are counted from F, the street.
import { PIXEL } from '../sprites.js';
import { int } from '../../core/rng.js';

// Each row of the city: its wall and dim window tones, the chance of a lit window, the widths of its
// blocks, the heights of the low ones and the tall ones, the chance of a tall one, and its foot.
const ROWS = [
  { wall: 'C', dim: 'd', chance: 0.14, w: [8, 16], low: [14, 30], tall: [36, 54], towers: 0.12, foot: 4 },
  { wall: 'c', dim: 'h', chance: 0.32, w: [6, 12], low: [6, 17], tall: [22, 32], towers: 0.07, foot: 0 },
];
const DECK = 2; // the highway's top row, in blocks above the street
const LAMPS = 15; // blocks between the highway's lamps
const CLEAR = 28; // how near the middle a lamp may stand: the tower's base keeps its front clear

export function city(art) {
  for (const cfg of ROWS) cityRow(art, cfg);
}

// One row of the city out to the band's edges, flats with a lit window here and there, a red lamp
// on a tower's roof.
function cityRow({ box, rng, lights, L, F, BW }, cfg) {
  for (let x = 0; x < BW;) {
    const bw = int(rng, ...cfg.w);
    const tower = rng() < cfg.towers;
    const tall = tower ? int(rng, ...cfg.tall) : int(rng, ...cfg.low);
    const top = F - cfg.foot - tall;
    box(x, top, bw, F - top, cfg.wall);
    for (let j = top + 2; j < F - cfg.foot - 1; j += 2) {
      for (let i = x + 1; i < x + bw - 1; i += 2) if (rng() < cfg.chance) box(i, j, 1, 1, rng() < 0.35 ? 'G' : cfg.dim);
    }
    if (tower) {
      box(x + (bw >> 1), top - 2, 1, 2, cfg.wall);
      box(x + (bw >> 1), top - 3, 1, 1, 'R');
      lights.push({ x: (x + (bw >> 1) + 0.5) * PIXEL, y: (top - 2.5) * PIXEL, r: 16, color: L.red, ph: rng() * 3, a: 0.45 });
    }
    x += bw + int(rng, 0, 2);
  }
}

// The highway across the whole width: the deck, its edge, the cars' lights on it, and a lamp on a
// post every few strides, none in front of the tower's base.
export function highway({ box, rng, lights, L, F, BW, mid }) {
  const top = F - DECK;
  box(0, top, BW, 20, '-');
  box(0, top, BW, 1, 'x');
  for (let x = 2; x < BW - 2; x += int(rng, 4, 9)) box(x, top + 1, 2, 1, rng() < 0.5 ? 'G' : 'R');
  for (let x = 7; x < BW - 4; x += LAMPS) {
    if (Math.abs(x - mid) < CLEAR) continue;
    box(x, top - 9, 1, 9, '-');
    box(x - 1, top - 10, 3, 1, 'G');
    lights.push({ x: (x + 0.5) * PIXEL, y: (top - 10) * PIXEL, r: 26, color: L.lamp, ph: x / 37, a: 0.5 });
  }
}
