// Dowlat Abad's windcatcher in its garden (yazd.js), the middle of the picture: the octagonal tower,
// by far the tallest thing in the city, seen from one face so that its front face is lit and the two
// faces turning away from it are in shade; three tall dark slots in each face of its vent section,
// rings round the shaft, a stepped roof and a lantern; at its foot the low garden wall with a lit
// gate and a lantern on every pilaster, cypresses behind the wall, and the pool's pale line at the
// wall's foot. `up` counts blocks up from the floor, and row(up) is that block's row.
import { PIXEL } from '../sprites.js';
import { int } from '../../core/rng.js';
import { BASE, key, brick, lamp } from './yazd-brick.js';

const D = 2; // painted as the near row
// The three faces: x from the middle, width, extra darkness, and the darkness of its left and right
// edges (where the faces meet one catches the light and the other loses it).
const FACES = [[-12, 7, 0.36, [0, 0.25]], [-5, 10, -0.02, [-0.22, 0.12]], [5, 7, 0.55, [0.2, 0]]];
const SHAFT = 96; // the shaft's height, under the cap ring
const RINGS = [34, 58];
const SLOTS = [64, 92]; // the vent slots' lowest and highest rows
const STEPS = [11, 9, 7, 5, 3]; // the roof's half-widths, bottom to top
const WALL = { half: 64, from: 2, tall: 7 }; // the garden wall: its half-length, its lowest row, its height
const COPING = [-0.3, 0.24]; // the wall's lit top and the shadow under it
const PILASTERS = [14, 30, 46, 62]; // their distance from the middle, each side
const TREES = [-60, -50, -39, -27, 26, 38, 50, 61]; // cypresses, from the middle

export function dowlat(art) {
  const { mid, rng, F } = art;
  const wallTop = F - WALL.from - WALL.tall;
  for (const s of [-1, 1]) {
    lamp(art, D, mid + s * 10, F - 11, 30, 0.55); // the floodlights at the tower's foot
    for (const p of PILASTERS) lamp(art, D, mid + s * p, wallTop - 7, 14, 0.85);
  }
  lamp(art, D, mid, F - 79, 14, 0.5);
  for (const t of TREES) cypress(art, mid + t, int(rng, 22, 33));
  shaft(art);
  roof(art);
  garden(art, wallTop);
}

const dark = (up) => BASE[D] - 0.36 + 0.28 * (up / SHAFT); // the front face, lighter at its foot

// The three faces of the shaft from the floor to the cap ring: brick, the rings, the vent slots.
function shaft(art) {
  const { mid, box, row } = art;
  const n = SLOTS[1] - SLOTS[0] + 1;
  FACES.forEach(([fx, fw, off, edge], f) => {
    const x = mid + fx;
    brick(art, D, x, row(SHAFT - 1), fw, SHAFT, (i, j) => dark(SHAFT - 1 - j) + off + (i === 0 ? edge[0] : i === fw - 1 ? edge[1] : 0), 2);
    const sw = fw > 7 ? 2 : 1;
    for (let sx = x + 1; sx + sw <= x + fw; sx += sw + 1) {
      box(sx, row(SLOTS[1]), sw, n, 'k');
      if (sw > 1) box(sx + 1, row(SLOTS[1]), 1, n, 'K');
      box(sx, row(SLOTS[0]), sw, 1, 'h');
    }
    for (const up of [...RINGS, SHAFT]) {
      const grow = up === SHAFT ? 2 : 1;
      const from = f === 0 ? x - grow : x;
      const to = f === 2 ? x + fw + grow : x + fw;
      box(from, row(up + 1), to - from, 1, key(D, dark(up) + off - 0.3));
      box(from, row(up), to - from, 1, key(D, dark(up) + off + 0.3));
    }
  });
}

// The stepped roof above the cap ring, in three facets like the shaft's three faces, with the
// lantern and spike.
function roof({ mid, box, row, lights, L }) {
  const tone = dark(SHAFT) + 0.1;
  STEPS.forEach((half, k) => {
    const r = row(SHAFT + 2 + k);
    const side = Math.round((half * 2 + 1) * 0.29);
    box(mid - half, r, side, 1, key(D, tone + 0.18));
    box(mid - half + side, r, half * 2 + 1 - side * 2, 1, key(D, tone - (k ? 0.1 : 0.28)));
    box(mid + half + 1 - side, r, side, 1, key(D, tone + 0.4));
  });
  const top = row(SHAFT + 2 + STEPS.length);
  box(mid - 1, top - 2, 2, 3, key(D, tone + 0.05));
  box(mid, top - 6, 1, 4, key(D, tone - 0.25));
  box(mid, top - 2, 1, 1, 'G');
  lights.push({ x: (mid + 0.5) * PIXEL, y: (top - 2) * PIXEL, r: 34, color: L.lamp, ph: 1.7, a: 0.4 });
}

// A cypress `tall` blocks high from the floor: a dark flame, lit a little on its left.
function cypress({ box, row }, x, tall) {
  for (let up = 0; up < tall; up++) {
    const half = Math.round(1.6 + 2.6 * Math.sin(Math.PI * (up / tall) ** 0.75));
    box(x - half, row(up), half * 2, 1, 't');
    box(x - half, row(up), 1, 1, 'e');
  }
}

// The garden wall with its pilasters and lanterns, the gate, and the pool at its foot.
function garden(art, top) {
  const { box, mid, rng, F } = art;
  const { half, from, tall } = WALL;
  brick(art, D, mid - half, top, half * 2, tall, (i, j) => BASE[D] - 0.04 + (j < 2 ? COPING[j] : 0.1 * (j / tall)), 2);
  for (const s of [-1, 1]) {
    for (const p of PILASTERS) {
      const px = mid + s * p;
      brick(art, D, px - 1, top - 4, 3, tall + 4, (i, j) => BASE[D] - 0.1 + (j === 0 ? -0.3 : 0) + (i === 2 ? 0.2 : 0), 2);
      box(px - 2, top - 5, 5, 1, key(D, BASE[D] - 0.2));
      box(px - 1, top - 8, 3, 3, 'g');
      box(px, top - 8, 1, 3, 'G');
      box(px - 1, F, 3, 1, 'g'); // the lantern's reflection
    }
  }
  box(mid - 5, top - 1, 10, tall + 1, '-'); // the gate: a lit arch in the wall
  box(mid - 4, top, 8, tall, 'g');
  box(mid - 4, top, 1, 1, '-');
  box(mid + 3, top, 1, 1, '-');
  box(mid - 3, top + 2, 6, tall - 2, 'G');
  box(mid - 6, top - 2, 12, 1, key(D, BASE[D] - 0.25));
  box(mid - half, F - from, half * 2, 1, key(D, BASE[D] - 0.1)); // the pool's coping
  const pool = half - 8;
  box(mid - pool, F - 1, pool * 2, 1, 'w');
  box(mid - pool, F, pool * 2, 1, 'n');
  box(mid - 3, F - 1, 6, 1, 'G'); // the gate's reflection
  for (let x = mid - pool; x < mid + pool; x += int(rng, 3, 8)) box(x, F - 1, int(rng, 1, 3), 1, 'W');
}
