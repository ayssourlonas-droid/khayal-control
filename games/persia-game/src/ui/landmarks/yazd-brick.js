// The mud brick Yazd is built of (yazd.js and its parts): a tone ramp for each depth of the city,
// the lamps that light the walls round them, a wall of brick laid in courses, a parapet's shading,
// a portal's nested pointed arches and tiled field, and the minarets on its corners. A brick tone is a number, depth * SHADES + level: depth 0
// is the far row, faded toward the haze, 1 the middle, 2 the near; level 0 is lit warm by a lamp,
// SHADES - 1 deep shade. A caller asks for a darkness 0..1 and `key` picks the level. The other
// tones are letters: '-' ink, G lamp, g glow, h dim glow, k vent slot, K its back wall, w pool
// line, W its glint, n the pool's depth, t cypress, e its lit edge, T tile, U lit tile, u dark tile.
import { PIXEL, mix } from '../sprites.js';
import { clamp } from '../../core/math.js';

export const SHADES = 16;
const MIST = [0.5, 0.25, 0]; // how far each depth fades toward the haze
export const BASE = [0.6, 0.54, 0.48]; // how dark a plain wall is, by depth

export const key = (d, dark) => d * SHADES + Math.round(clamp(dark, 0, 1) * (SHADES - 1));

export const hazeOf = (L) => mix(L.lit, L.color, 0.5); // the colour the far rows fade toward

export const PARAPET = [-0.3, 0, 0.28]; // a parapet's lit top, its face, and the shadow it throws

// The half-width at row `up` of a pointed arch `half` wide, closing from `spring` to its point at `apex`.
export function archHalf([half, spring, apex], up) {
  if (up <= spring) return half;
  const s = ((up - spring) * Math.sqrt(3) * half) / (apex - spring);
  return Math.max(0, Math.round(Math.sqrt(4 * half * half - s * s) - half));
}

// A portal's nested pointed arches, `arches` [outline, tile band, recess], on column cx at depth d,
// from the street up: the outline in shade, then each block of the band in the tone
// tone(x, up, inner) gives it, `inner` when the block lies in the recess.
export function nestedArch(art, d, cx, arches, tone) {
  const { box, row } = art;
  for (let up = 0; up <= arches[0][2]; up++) {
    const [outline, band, recess] = arches.map((a) => archHalf(a, up));
    if (up < arches[0][2]) box(cx - outline - 1, row(up), outline * 2 + 3, 1, key(d, BASE[d] - 0.3));
    for (let x = cx - band; x <= cx + band; x++) {
      box(x, row(up), 1, 1, tone(x, up, Math.abs(x - cx) <= recess && up <= arches[2][2]));
    }
  }
}

export function tones(L) {
  const haze = hazeOf(L);
  const tone = {
    '-': L.ink, G: L.lamp, g: L.glow, h: mix(L.glow, L.ink, 0.55),
    k: mix(L.ink, L.brick, 0.05), K: mix(L.ink, L.brick, 0.2),
    ...(L.pool && { w: L.pool, W: mix(L.pool, '#ffffff', 0.55), n: mix(L.pool, L.ink, 0.72) }),
    t: L.tree, e: mix(L.tree, L.lamp, 0.25),
    T: L.tile, U: mix(L.tile, L.lamp, 0.45), u: mix(L.tile, L.ink, 0.55),
  };
  for (let d = 0; d < 3; d++) {
    for (let i = 0; i < SHADES; i++) {
      const lv = i / (SHADES - 1);
      const c = mix(mix(L.brick, L.lamp, 0.55 * (1 - lv) ** 2), L.ink, 0.04 + 0.7 * lv);
      tone[d * SHADES + i] = mix(c, haze, MIST[d]);
    }
  }
  return tone;
}

// How strongly the `lamps` (of one depth) light block (x, y): 0 none to 1; they fall off squarely
// and reach further along a wall than up it.
export function light(lamps, x, y) {
  let s = 0;
  for (const m of lamps) {
    const dx = (x - m.x) * 0.7;
    const dy = y - m.y;
    if (Math.abs(dx) >= m.r || Math.abs(dy) >= m.r) continue; // outside its square, so out of reach
    const t = 1 - Math.hypot(dx, dy) / m.r;
    if (t > 0) s += m.k * t * t;
  }
  return Math.min(1, s);
}

// A lamp of depth d at block (x, y): it lights the walls within r blocks (k its strength) and, if
// `halo`, pulses a glow over the picture.
export function lamp({ lamps, lights, L }, d, x, y, r, k, halo = true) {
  lamps[d].push({ x, y, r, k });
  if (halo) lights.push({ x: (x + 0.5) * PIXEL, y: (y + 0.5) * PIXEL, r: r * PIXEL * 1.4, color: L.lamp, ph: x / 37, a: 0.15 + 0.4 * k });
}

// A wall `bw` x `bh` blocks from (x, top), depth d: block (i, j) of it has darkness dark(i, j) less
// the lamplight on it, and a speckle. fine: 0 plain, 1 with the bed joints between the courses (a
// course is two rows), 2 with the head joints in the brick as well, staggered by course.
export function brick(art, d, x, top, bw, bh, dark, fine = 0) {
  const { box, rng } = art;
  const lamps = art.lamps[d];
  for (let j = 0; j < bh; j++) {
    const y = top + j;
    let from = 0;
    let run = null;
    for (let i = 0; i <= bw; i++) {
      let k = null;
      if (i < bw) {
        let v = dark(i, j) - 0.55 * light(lamps, x + i, y);
        if (fine && y % 2) v += 0.14;
        else if (fine > 1 && (x + i + 2 * ((y >> 1) % 2)) % 4 === 0) v += 0.14;
        if (rng() < 0.12) v += (rng() - 0.5) * 0.2;
        k = key(d, v);
      }
      if (k !== run) {
        if (run !== null) box(x + from, y, i - from, 1, run);
        from = i;
        run = k;
      }
    }
  }
}

// A tile of a portal's field (depth d) at block x, row `up`: the diagonal check, lit near a lamp.
export function field(art, d, x, up) {
  const check = (x + up) % 2 === 0;
  return light(art.lamps[d], x, art.row(up)) > 0.3 ? (check ? 'U' : 'T') : check ? 'T' : 'u';
}

// A minaret of depth d centred on column mx: its shaft `shaft` blocks high under the balcony, tile
// bands every 8 rows from rings[0] to below rings[1], the balcony and its railing, the upper shaft,
// the lantern capped in tile, a finial and a lamp. `tall` and `balcony` are rows, counted as `up`.
export function minaret(art, d, mx, { wide, tall, balcony, shaft, rings }) {
  const { box, row } = art;
  const x = mx - (wide >> 1);
  brick(art, d, x, row(balcony - 1), wide, shaft, (i) => BASE[d] - 0.05 + (i === 0 ? -0.2 : i === wide - 1 ? 0.3 : 0), 1);
  for (let up = rings[0]; up < rings[1]; up += 8) {
    box(x + 1, row(up + 1), wide - 2, 2, 'T');
    box(x + 1, row(up + 1), wide - 2, 1, 'U');
  }
  box(mx - 4, row(balcony), 9, 1, key(d, BASE[d] + 0.3)); // the balcony, lit on top, shadowed under
  box(mx - 4, row(balcony + 1), 9, 1, key(d, BASE[d] - 0.25));
  for (let i = 0; i < 9; i += 2) box(mx - 4 + i, row(balcony + 2), 1, 2, 'k'); // its railing
  brick(art, d, mx - 1, row(tall - 4), 3, tall - balcony - 6, (i) => BASE[d] - 0.1 + (i === 2 ? 0.3 : 0), 1);
  box(mx - 2, row(tall - 3), 5, 2, 'T'); // the lantern, capped in tile
  box(mx - 2, row(tall - 3), 5, 1, 'U');
  box(mx, row(tall + 1), 1, 3, key(d, BASE[d] - 0.3));
  box(mx, row(balcony + 2), 1, 2, 'G');
  lamp(art, d, mx, row(balcony + 2), 7, 0.7);
}
