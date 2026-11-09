// The Tomb of Hafez at night, the parallax layer kind 'hafez' (parallax-shapes.js has the painter
// contract), painted in PIXEL-sized blocks (kit.js): in the middle the poet's open pavilion on its
// stepped platform, slender columns under a band of tile and the dome shaped like a dervish's hat
// rising to a finial, lit warm from inside round the pale tombstone (layer lights that pulse);
// behind it the long colonnade of the entrance hall; either side a garden of cypresses and orange
// trees, their fruit lit. The layer brings L.lit, L.ink, L.glow, L.lamp, L.tree, L.fruit, L.dome,
// L.rib, L.tile and L.tomb. Rows are counted from F, the garden's floor.
import { PIXEL, mix } from '../sprites.js';
import { scene } from './kit.js';

const UNDER = 16; // blocks from the floor down to the band's foot; the ground hides the lowest 14
const COLS = 5; // columns seen across the pavilion's front
const BAY = 16; // blocks from one column to the next
const TALL = 32; // the columns' height in blocks
const DOME = 44; // the dome's height in blocks, the finial above it
const SPAN = (COLS - 1) * BAY + 2; // blocks from the first column's left to the last's right

export function hafez(g, w, h, rng, L, lights) {
  const tone = {
    '#': L.color, '+': L.lit, '-': L.ink, g: L.glow, G: mix(L.lamp, L.glow, 0.4), h: mix(L.glow, L.ink, 0.55),
    t: L.tree, o: L.fruit, d: L.dome, D: L.rib, b: L.tile, T: L.tomb,
  };
  const art = scene(g, w, h, rng, L, lights, tone, UNDER);
  const { mid } = art;
  g.save();
  g.scale(PIXEL, PIXEL);
  hall(art);
  garden(art, mid);
  pavilion(art, mid);
  g.restore();
}

// The entrance hall's colonnade across the back: a plinth, columns before its dim-lit depth, the roof.
function hall({ box, post, slab, F, BW }) {
  const x0 = 24;
  const x1 = BW - 24;
  box(x0, F - 24, x1 - x0, 20, '-');
  for (let x = x0, k = 0; x < x1; x += 8, k++) {
    if (k % 3 === 1) box(x + 3, F - 20, 5, 16, 'h');
    post(x, F - 24, 3, 20);
  }
  slab(x0 - 2, F - 28, x1 - x0 + 4, 4);
  slab(x0, F - 4, x1 - x0, 4);
}

// Cypresses and orange trees in turn on each side of the platform, out to the band's edges.
function garden(art, mid) {
  const { rng, BW } = art;
  for (const s of [-1, 1]) {
    let x = mid + s * (SPAN / 2 + 22);
    for (let k = 0; x > 4 && x < BW - 4; k++) {
      if (k % 2 === 0) cypress(art, x, 36 + Math.floor(rng() * 16));
      else orange(art, x);
      x += s * (14 + Math.floor(rng() * 5));
    }
  }
}

// A cypress `tall` blocks high on the floor: a dark flame, pointed at the top and widest low down.
function cypress({ box, F }, x, tall) {
  for (let j = 0; j < tall; j++) {
    const t = j / tall;
    const half = Math.round(4.2 * Math.min(1, t * 1.6) * (1 - 0.3 * t));
    box(x - half, F - tall + j, half * 2 + 1, 1, 't');
  }
}

// An orange tree on the floor: a short trunk under a round crown dotted with lit fruit.
function orange({ box, rng, lights, L, F }, x) {
  box(x, F - 8, 2, 8, 't');
  for (let j = -7; j <= 7; j++) {
    const half = Math.round(Math.sqrt(49 - j * j) * 1.15);
    box(x - half, F - 15 + j, half * 2 + 2, 1, 't');
  }
  for (let k = 0; k < 8; k++) box(x - 6 + Math.floor(rng() * 14), F - 21 + Math.floor(rng() * 12), 1, 1, 'o');
  lights.push({ x: (x + 1) * PIXEL, y: (F - 15) * PIXEL, r: 30, color: L.fruit, ph: rng(), a: 0.2 });
}

// The pavilion: three steps up, the glowing room round the tombstone, the columns, the tiled
// entablature, and the dome.
function pavilion({ box, post, slab, lights, L, F }, mid) {
  for (let k = 0; k < 3; k++) slab(mid - SPAN / 2 - 11 + k * 3, F - 2 - k * 2, SPAN + 22 - k * 6, 2);
  const floor = F - 6;
  const top = floor - TALL;
  box(mid - SPAN / 2, top, SPAN, TALL, 'h');
  box(mid - SPAN / 2, top + 8, SPAN, TALL - 8, 'g');
  box(mid - 12, floor - 12, 24, 12, 'G');
  slab(mid - 7, floor - 5, 14, 5, 'T');
  box(mid - 8, floor - 1, 16, 1, '#');
  for (let i = 0; i < COLS; i++) {
    const x = mid - SPAN / 2 + i * BAY;
    post(x, top, 2, TALL);
    box(x - 1, top, 4, 2, '+');
    box(x - 1, floor - 2, 4, 2, '#');
    if (i < COLS - 1) lights.push({ x: (x + BAY / 2 + 1) * PIXEL, y: (floor - 10) * PIXEL, r: 44, color: L.lamp, ph: i / 3.1, a: 0.3 });
  }
  slab(mid - SPAN / 2 - 4, top - 7, SPAN + 8, 7);
  box(mid - SPAN / 2 - 3, top - 5, SPAN + 6, 2, 'b');
  dome(box, mid, top - 7);
  lights.push({ x: mid * PIXEL, y: (floor - 12) * PIXEL, r: 120, color: L.lamp, ph: 0.4, a: 0.4 });
}

// The dervish's-hat dome on row `base`: a ribbed cone swelling a little, lit warm along its foot,
// and the finial.
function dome(box, mid, base) {
  const R = SPAN / 2 + 2;
  for (let j = 0; j < DOME; j++) {
    const half = Math.max(1, Math.round(R * (1 - j / DOME) ** 0.8));
    const y = base - 1 - j;
    box(mid - half, y, half * 2, 1, j < 2 ? 'h' : 'd');
    for (const u of [-0.7, -0.35, 0, 0.35, 0.7]) box(mid + Math.round(u * half), y, 1, 1, 'D');
    box(mid - half, y, 1, 1, 'D');
  }
  box(mid, base - DOME - 6, 1, 6, '+');
  box(mid - 1, base - DOME - 3, 3, 1, '+');
}
