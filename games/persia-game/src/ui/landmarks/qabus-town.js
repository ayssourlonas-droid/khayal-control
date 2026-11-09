// The town on the plain either side of the park (qabus.js): two rows of low houses, the far one
// faded toward the haze, each a plain brick wall with its windows, some of them lit, under a hipped
// roof that overhangs it by a block, as the roofs of Golestan are. Painted behind the park. `up`
// counts blocks up from the plain. Tones: r o p the roof, lit to shade, g k a lit and a dark window.
import { int } from '../../core/rng.js';
import { BASE, brick } from './yazd-brick.js';

const ROWS = [
  { d: 0, w: [8, 14], wall: [8, 10], roof: [3, 5], gap: [0, 2], roofs: ['o', 'p', 'p'] },
  { d: 1, w: [9, 16], wall: [3, 5], roof: [3, 5], gap: [1, 4], roofs: ['r', 'o', 'p'] },
];

// A house `w` wide with its left wall on column x: the wall `wall` rows high, windows two blocks
// tall every fourth column, the roof `tall` rows rising to a ridge.
function house(art, { d, roofs }, x, w, wall, tall) {
  const { box, row, rng } = art;
  brick(art, d, x, row(wall - 1), w, wall, (i) => BASE[d] + (i === 0 ? -0.1 : i === w - 1 ? 0.2 : 0), 1);
  for (let wx = x + 2; wx < x + w - 1; wx += 4) box(wx, row(wall - 2), 1, 2, rng() < 0.55 ? 'g' : 'k');
  for (let k = 0; k < tall; k++) {
    const inset = Math.round((k * (w / 2 - 1)) / tall);
    const rw = w + 2 - 2 * inset;
    box(x - 1 + inset, row(wall + k), rw, 1, k % 2 ? roofs[1] : roofs[0]);
    box(x - 1 + inset, row(wall + k), 1, 1, roofs[0]);
    box(x - 2 + inset + rw, row(wall + k), 1, 1, roofs[2]);
  }
}

export function town(art) {
  const { rng, BW } = art;
  for (const cfg of ROWS) {
    for (let x = int(rng, 0, 6); x < BW; ) {
      const w = int(rng, ...cfg.w);
      house(art, cfg, x, w, int(rng, ...cfg.wall), int(rng, ...cfg.roof));
      x += w + int(rng, ...cfg.gap);
    }
  }
}
