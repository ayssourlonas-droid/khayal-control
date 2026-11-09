// The Azadi Tower at night, the parallax layer kind 'azadi' (parallax-shapes.js has the painter
// contract), painted in PIXEL-sized blocks (kit.js): in the middle the pale tower on its splayed
// legs, the tall pointed vault between them, the split above it running up the narrowing body to the
// windowed top, floodlight pooling up the legs (layer lights that pulse); round its feet the wide
// plaza with its lamps, and behind it the low city with its windows lit. The layer brings L.lit,
// L.ink, L.glow, L.lamp, L.tower and L.towerLit. Rows are counted from F, the plaza's floor, and the
// tower's heights from the floor up.
import { PIXEL, mix } from '../sprites.js';
import { scene } from './kit.js';

const UNDER = 16; // blocks from the floor down to the band's foot; the ground hides the lowest 14
const FOOT = 64; // the tower's half-width at the floor
const NECK = 24; // its half-width where the body meets the top
const BODY = 88; // the body's height, the top above it
const OPEN = 24; // the vault's half-width at the floor
const APEX = 58; // the vault's point

// The tower's half-width, and the vault's, `y` blocks above the floor.
const halfAt = (y) => NECK + (FOOT - NECK) * (1 - y / BODY) ** 1.7;
const openAt = (y) => OPEN * Math.max(0, 1 - y / APEX) ** 0.6;

export function azadi(g, w, h, rng, L, lights) {
  const tone = {
    '#': L.color, '+': L.lit, '-': L.ink, G: L.lamp, h: mix(L.glow, L.ink, 0.55),
    c: mix(L.color, L.ink, 0.35), w: L.tower, W: L.towerLit, x: mix(L.tower, L.ink, 0.3), v: mix(L.tower, L.ink, 0.6),
  };
  const art = scene(g, w, h, rng, L, lights, tone, UNDER);
  const { mid } = art;
  g.save();
  g.scale(PIXEL, PIXEL);
  city(art);
  plaza(art, mid);
  tower(art, mid);
  g.restore();
}

// The city behind, out to the band's edges: blocks of flats, taller towers here and there, and a
// scatter of lit windows.
function city({ box, rng, F, BW }) {
  for (let x = 0; x < BW;) {
    const bw = 6 + Math.floor(rng() * 9);
    const tall = rng() < 0.12 ? 24 + Math.floor(rng() * 10) : 6 + Math.floor(rng() * 12);
    box(x, F - 3 - tall, bw, tall, 'c');
    for (let j = F - tall; j < F - 4; j += 3) {
      for (let i = x + 1; i < x + bw - 1; i += 2) if (rng() < 0.16) box(i, j, 1, 1, rng() < 0.3 ? 'G' : 'h');
    }
    x += bw + Math.floor(rng() * 3);
  }
}

// The plaza: a wide floor lit along its top, and a lamp on a post every few strides, the tower's
// feet left clear.
function plaza({ box, slab, lights, L, F, BW }, mid) {
  slab(0, F - 3, BW, 3);
  box(0, F, BW, UNDER, '-');
  for (let x = 10; x < BW - 4; x += 26) {
    if (Math.abs(x - mid) < FOOT + 6) continue;
    box(x, F - 15, 1, 12, '-');
    box(x - 1, F - 16, 3, 1, 'G');
    lights.push({ x: (x + 0.5) * PIXEL, y: (F - 16) * PIXEL, r: 26, color: L.lamp, ph: x / 37, a: 0.5 });
  }
}

// The tower, row by row from the floor: two tones either side of the middle, the facets' ribs, the
// vault cut out with its lit edge, the split above it; then the top.
function tower(art, mid) {
  const { box, lights, L, F } = art;
  for (let y = 0; y < BODY; y++) {
    const half = Math.round(halfAt(y));
    const open = Math.round(openAt(y));
    const row = F - 3 - y;
    box(mid - half, row, half, 1, 'w');
    box(mid, row, half, 1, 'x');
    for (const u of [0.45, 0.78]) {
      box(mid - Math.round(u * half), row, 1, 1, 'W');
      box(mid + Math.round(u * half) - 1, row, 1, 1, 'w');
    }
    if (open > 0) {
      art.clear(mid - open, row, open * 2, 1);
      box(mid - open - 1, row, 1, 1, 'W');
      box(mid + open, row, 1, 1, 'W');
    } else if (y >= APEX) {
      box(mid - 2, row, 4, 1, 'v');
      if ((y - APEX) % 4 < 2) box(mid - 1 + ((y >> 2) & 1), row, 1, 1, 'W');
    }
  }
  top(art, mid, F - 3 - BODY);
  for (const s of [-1, 1]) lights.push({ x: (mid + s * 44) * PIXEL, y: (F - 6) * PIXEL, r: 96, color: L.glow, ph: s * 0.3, a: 0.35 });
  lights.push({ x: mid * PIXEL, y: (F - 3 - APEX + 12) * PIXEL, r: 64, color: L.lamp, ph: 0.6, a: 0.18 });
}

// The top on row `base`: its walls with five lit arched windows, the cornice, and the low hump.
function top({ box, slab, lights, L }, mid, base) {
  const half = NECK + 2;
  box(mid - half, base - 10, half, 10, 'w');
  box(mid, base - 10, half, 10, 'x');
  for (const k of [-2, -1, 0, 1, 2]) {
    const x = mid + k * 9 - 2;
    box(x, base - 7, 4, 5, 'G');
    box(x + 1, base - 8, 2, 1, 'G');
    lights.push({ x: (x + 2) * PIXEL, y: (base - 5) * PIXEL, r: 28, color: L.lamp, ph: 0.2 + k * 0.4, a: 0.3 });
  }
  slab(mid - half - 2, base - 12, half * 2 + 4, 2, 'W');
  for (let j = 0; j < 4; j++) box(mid - 12 + j * 3, base - 13 - j, 24 - j * 6, 1, j ? 'w' : 'x');
}
