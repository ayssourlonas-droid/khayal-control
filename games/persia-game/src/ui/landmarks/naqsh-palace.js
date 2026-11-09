// Ali Qapu on the square's west side (naqsh.js), left of the mosque: the palace's tall brick block
// with its great arched door and rows of windows, over it the porch, open to the square and lit warm
// from inside, its flat roof carried on slim wooden columns, and above that roof a smaller storey
// under a second flat roof. Painted as the near row, in line with the arcades. `up` counts blocks up
// from the street. Tones: g h G the lit rooms, k K the wood and the dark.
import { PIXEL } from '../sprites.js';
import { BASE, key, brick, lamp } from './yazd-brick.js';
import { opening } from './naqsh-square.js';

const D = 2;
export const PALACE = { at: -88, half: 22 }; // from the middle: the block's centre, its half-width
const BLOCK = 50; // the block's height; the porch stands on it
const PORCH = { tall: 18, half: 19 }; // its height, the opening's half-width
const ROOF = [-0.3, 0.1, 0.4]; // a flat roof's lit top, its face and the shadow under it
const UPPER = { half: 14, tall: 13 }; // the storey over the porch roof
const COLUMNS = 9; // across the porch, 4 blocks apart
const WINDOWS = [-16, -8, 8, 16]; // each floor's, from the middle
const FLOORS = [26, 38]; // the row each floor of windows starts on

// A flat roof `half` out from column cx on row `up`, the lowest of its three rows.
function roof({ box, row }, cx, up, half) {
  ROOF.forEach((dark, j) => box(cx - half, row(up + 2 - j), half * 2 + 1, 1, key(D, BASE[D] + dark)));
}

export function palace(art) {
  const { box, row, lights, rng, L } = art;
  const cx = art.palace;
  const wins = FLOORS.flatMap((up) => WINDOWS.map((dx) => ({ x: cx + dx, up, lit: rng() < 0.6 })));
  for (const w of wins) if (w.lit) lamp(art, D, w.x, row(w.up + 3), 6, 0.4, false);
  lamp(art, D, cx, row(8), 18, 0.8);
  brick(art, D, cx - PALACE.half, row(BLOCK - 1), PALACE.half * 2 + 1, BLOCK, (i, j) => {
    const course = j === BLOCK - 25 ? 0.2 : 0;
    return BASE[D] + 0.12 * (j / BLOCK) + course + (i === 0 ? -0.12 : i === PALACE.half * 2 ? 0.3 : 0);
  }, 1);
  opening(art, cx - 7, 0, 14, 30, (j, k) => (k < 3 ? 'k' : j < 2 ? 'h' : j < 24 ? 'g' : 'h')); // the great door
  box(cx - 1, row(14), 2, 3, 'G');
  for (const w of wins) opening(art, w.x - 2, w.up, 4, 7, w.lit ? 'g' : 'k');
  porch(art, cx);
  roof(art, cx, BLOCK + PORCH.tall, PORCH.half + 5);
  const top = BLOCK + PORCH.tall + 3; // the upper storey's foot
  brick(art, D, cx - UPPER.half, row(top + UPPER.tall - 1), UPPER.half * 2 + 1, UPPER.tall, (i) => BASE[D] + 0.05 + (i === 0 ? -0.12 : i === UPPER.half * 2 ? 0.3 : 0), 1);
  for (const dx of [-8, 0, 8]) opening(art, cx + dx - 2, top + 3, 4, 7, 'g');
  roof(art, cx, top + UPPER.tall, UPPER.half + 2);
  const y = (up) => row(up) * PIXEL;
  lights.push({ x: (cx + 0.5) * PIXEL, y: y(BLOCK + 9), r: 90, color: L.lamp, ph: 0.6, a: 0.35 });
  lights.push({ x: (cx + 0.5) * PIXEL, y: y(top + 6), r: 44, color: L.lamp, ph: 2.9, a: 0.3 });
}

// The porch on top of the block: two thin walls, the lit room between with a lamp hung from its ceiling
// and the slim columns before it.
function porch(art, cx) {
  const { box, row } = art;
  const { tall, half } = PORCH;
  const top = BLOCK + tall - 1;
  for (const x of [cx - PALACE.half, cx + half + 1]) brick(art, D, x, row(top), PALACE.half - half, tall, (i) => BASE[D] + (i === 0 ? -0.1 : 0.2), 1);
  box(cx - half, row(top), half * 2 + 1, tall, 'g');
  box(cx - half, row(top), half * 2 + 1, 2, 'h');
  box(cx - half, row(BLOCK), half * 2 + 1, 1, 'h');
  for (const dx of [-12, 0, 12]) box(cx + dx, row(top - 2), 1, 2, 'G');
  for (let k = 0; k < COLUMNS; k++) box(cx + (k - (COLUMNS >> 1)) * 4, row(top - 1), 1, tall - 1, 'k');
}
