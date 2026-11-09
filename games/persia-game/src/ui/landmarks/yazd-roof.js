// What stands on Yazd's roofs (yazd-house.js): the square windcatcher, the stair-house, and the low dome.
import { BASE, key, brick } from './yazd-brick.js';

export const KINDS = [[2, 1], [3, 1], [2, 2], [3, 2]]; // a windcatcher's slots: how many, how wide
export const widthOf = ([n, sw]) => n * (sw + 1) + 1; // across its front face, a pier between and beside the slots
export const SIDE = 2; // the blocks of shaded side face beside it

// A windcatcher of `kind`, its feet on row `base`, `tall` rows high, its left edge at x: the shaft, a
// ledge, the vent section with its tall dark slots (the ledge and cap overhang a block each side),
// the flat cap; the side face beside it is in shade. `up` counts rows from the feet.
export function badgir(art, d, x, base, kind, tall) {
  const { box } = art;
  const [n, sw] = kind;
  const bw = widthOf(kind);
  const wide = bw + SIDE + 2; // the ledge and the cap
  const vent = Math.max(6, Math.round(tall * 0.55));
  const shaft = Math.max(1, tall - vent - 4);
  const row = (up) => base - 1 - up;
  const face = (fx, fw, off) => brick(art, d, fx, row(tall - 1), fw, tall, (i, j) => {
    const up = tall - 1 - j;
    return BASE[d] - 0.1 + off + 0.2 * (up / tall) - (i === 0 ? 0.12 : 0);
  }, d);
  face(x, bw, 0);
  face(x + bw, SIDE, 0.3);
  box(x - 1, row(shaft + 1), wide, 1, key(d, BASE[d] - 0.25)); // the ledge, lit on top and shadowed under
  box(x - 1, row(shaft), wide, 1, key(d, BASE[d] + 0.3));
  box(x, row(shaft + vent + 1), bw + SIDE, 1, key(d, BASE[d] + 0.35)); // the cap's shadow on the vents
  box(x - 1, row(shaft + vent + 2), wide, 1, key(d, BASE[d] + 0.3)); // the cap
  box(x - 1, row(shaft + vent + 3), wide, 1, key(d, BASE[d] - 0.28));
  const slot = vent - 3;
  const top = row(shaft + vent - 1);
  for (let k = 0; k < n; k++) {
    const sx = x + 1 + k * (sw + 1);
    box(sx, top, sw, slot, 'k');
    if (sw > 1) box(sx + sw - 1, top, 1, slot, 'K');
    if (d === 2) box(sx, top + slot - 1, sw, 1, 'h');
  }
  box(x + bw, top, 1, slot, 'k');
}

// A stair-house, the small box that holds the stairs up to a roof: 6 wide, its feet on row `base`.
export function stair(art, d, x, base) {
  const { box } = art;
  brick(art, d, x, base - 4, 6, 4, (i, j) => BASE[d] + (j === 0 ? -0.3 : 0) + (i === 5 ? 0.25 : 0), d);
  box(x + 1, base - 3, 2, 3, '-');
}

// A dome of half-width r on a drum, its base on row `base`, centred on column cx: lit down its left,
// dark down its right, ringed by its courses, with a finial.
export function dome(art, d, cx, base, r) {
  const { box } = art;
  const hgt = Math.ceil(r * 0.85);
  box(cx - r, base - 1, r * 2 + 1, 1, key(d, BASE[d] + 0.25));
  for (let k = 0; k < hgt; k++) {
    const hw = Math.max(1, Math.round(r * Math.sqrt(1 - (k / hgt) ** 2)));
    brick(art, d, cx - hw, base - 2 - k, hw * 2 + 1, 1, (i) => BASE[d] - 0.3 + (0.6 * i) / (hw * 2) + (i === 0 ? -0.12 : 0), 1);
  }
  box(cx, base - 2 - hgt, 1, r > 4 ? 2 : 1, key(d, BASE[d] - 0.3));
}
