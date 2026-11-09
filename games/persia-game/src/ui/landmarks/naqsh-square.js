// The square itself (naqsh.js): the two-storey arcades running across the whole width of the layer,
// a lamp in each lit arch and a small dome here and there on the roof, and in front of them the long
// pool, the lamps and the great dome standing upside down in it. Painted as the near row. `up` counts
// blocks up from the arcades' foot. Tones: k the dark of an arch, g h G the lit ones, n p w W the
// water, V X Y the dome's reflection.
import { int } from '../../core/rng.js';
import { PIXEL } from '../sprites.js';
import { BASE, PARAPET, key, brick, lamp } from './yazd-brick.js';
import { dome } from './yazd-roof.js';

const D = 2;
const BAY = 10; // blocks from one pier to the next
const GROUND = { tall: 18, open: 13, w: 8 }; // the lower floor's wall, its arches' height and width
const UPPER = { up: 20, tall: 14, open: 9, w: 6 };
const ROOF = 34; // the parapet's lowest row; it is three rows deep
const edge = (i) => (i === 0 ? -0.1 : i === BAY - 1 ? 0.22 : 0); // a pier's lit left edge and shaded right

// An opening `w` wide and `tall` high with a round head, its left edge on column x and its foot on
// row `up`; fill is a tone or fill(j, k) -> tone, j counting rows up from its foot and k down from its top.
export function opening({ box, row }, x, up, w, tall, fill) {
  const r = w / 2;
  for (let j = 0; j < tall; j++) {
    const k = tall - 1 - j;
    const width = k < r ? 2 * Math.round(Math.sqrt(r * r - (r - k - 0.5) ** 2)) : w;
    box(x + (w - width) / 2, row(up + j), width, 1, typeof fill === 'function' ? fill(j, k) : fill);
  }
}

export function arcades(art) {
  const { box, row, rng, BW } = art;
  const bays = [];
  for (let x = 0; x < BW; x += BAY) {
    const free = !art.stands.some(([from, to]) => x + BAY > from && x < to);
    const bay = { x, below: free && rng() < 0.78, above: free && rng() < 0.3 };
    bays.push(bay);
    if (bay.below) lamp(art, D, x + BAY / 2, row(GROUND.open - 3), 8, 0.85);
    if (bay.above) lamp(art, D, x + BAY / 2, row(UPPER.up + UPPER.open - 3), 5, 0.5, false);
  }
  for (const { x } of bays) {
    brick(art, D, x, row(GROUND.tall - 1), BAY, GROUND.tall, (i, j) => BASE[D] - 0.04 + 0.1 * (j / GROUND.tall) + edge(i), 1);
    brick(art, D, x, row(ROOF + 2), BAY, ROOF + 3 - UPPER.up, (i, j) => BASE[D] + 0.06 + (j < 3 ? PARAPET[j] : 0.08 * (j / UPPER.tall)) + edge(i), 1);
    box(x, row(GROUND.tall + 1), BAY, 1, key(D, BASE[D] - 0.2)); // the string course between the floors
    box(x, row(GROUND.tall), BAY, 1, key(D, BASE[D] + 0.25));
  }
  for (const { x, below, above } of bays) {
    opening(art, x + 1, 1, GROUND.w, GROUND.open, below ? (_, k) => (k < 2 ? 'h' : 'g') : 'k');
    opening(art, x + 2, UPPER.up + 1, UPPER.w, UPPER.open, above ? 'g' : 'k');
    if (below) box(x + BAY / 2 - 1, row(GROUND.open - 3), 2, 2, 'G');
  }
  for (let b = 1; b < bays.length; b += 2) {
    const { x } = bays[b];
    if (art.stands.every(([from, to]) => x + BAY / 2 < from - 6 || x + BAY / 2 > to + 6)) dome(art, D, x + BAY / 2, row(ROOF + 2) + 1, int(rng, 3, 4));
  }
  return bays;
}

// The long pool along the arcades' foot: the coping, four rows of dark water with the odd glint,
// the lit arches below each lit bay, the dome's turquoise under the mosque.
export function pool(art, bays) {
  const { box, F, BW, mid, rng, lights, L } = art;
  box(0, F, BW, 1, key(D, BASE[D] - 0.1));
  box(0, F + 1, BW, 1, 'p');
  box(0, F + 2, BW, 4, 'n');
  for (let x = 0; x < BW; x += int(rng, 4, 11)) box(x, F + 1 + 2 * int(rng, 0, 1), int(rng, 1, 3), 1, 'W');
  for (const { x, below } of bays) {
    if (!below) continue;
    box(x + BAY / 2 - 1, F + 1, 2, 1, 'G');
    box(x + BAY / 2 - 2, F + 2, 4, 1, 'g');
    box(x + BAY / 2 - 1, F + 3, 2, 1, 'h');
    box(x + BAY / 2, F + 4, 1, 1, 'h');
  }
  for (const [dy, half, tone] of [[1, 13, 'X'], [2, 18, 'V'], [3, 14, 'V'], [4, 9, 'Y']]) {
    for (let x = mid - half; x <= mid + half; x += 1 + (x + dy) % 2) box(x, F + dy, 1 + (dy % 2), 1, tone);
  }
  lights.push({ x: mid * PIXEL, y: (F + 2) * PIXEL, r: 100, color: L.turq, ph: 1.1, a: 0.25 });
}
