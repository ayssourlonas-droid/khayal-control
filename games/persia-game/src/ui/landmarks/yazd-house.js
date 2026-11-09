// The houses of Yazd's three rows (yazd.js), flat-roofed, side by side along a row, each with a
// parapet, and on its roof a windcatcher or a dome; the near row has lit doors and lanterns at the
// street, the middle one lit windows, the far one a few lit specks. layout() fixes a row's houses
// and lights its lamps; paintRow() paints them, so a lamp lights its neighbours too.
import { int } from '../../core/rng.js';
import { BASE, PARAPET, brick, lamp } from './yazd-brick.js';
import { KINDS, SIDE, widthOf, badgir, dome, stair } from './yazd-roof.js';

const GARDEN = 68; // the near row leaves this half-width round the middle clear

// The houses of depth d along the row, left to right, as
// { x, w, top, wind?: { x, kind, tall }, dome?: { x, r }, door?, wins: [[x, y, lit]] }.
export function layout(art, d, cfg) {
  const { rng, F, BW, mid, mosque } = art;
  const houses = [];
  let last = 0;
  let bare = 0; // the houses in a row without a windcatcher
  for (let x = -int(rng, 0, 8); x < BW;) {
    const w = int(rng, ...cfg.w);
    const a = int(rng, ...cfg.high);
    const b = int(rng, ...cfg.high);
    let high = Math.abs(a - last) > Math.abs(b - last) ? a : b;
    const cx = x + w / 2;
    const crowd = d < 2 && Math.abs(cx - mosque) < 30; // keep the portal's sides clear
    if (d === 1 && crowd) high = Math.min(high, 20);
    if (d === 2 && Math.abs(cx - mid) < GARDEN + w / 2) {
      x += w + int(rng, ...cfg.gap);
      continue;
    }
    last = high;
    const h = { x, w, top: F - high, high, tint: (rng() - 0.5) * 0.18, wins: [] };
    houses.push(h);
    if (!crowd && (bare >= 2 || rng() < cfg.wind)) {
      const kind = KINDS[int(rng, d === 2 ? 1 : 0, 3)];
      const bw = widthOf(kind) + SIDE;
      if (w >= bw + 4) h.wind = { x: int(rng, x + 1, x + w - bw - 3), kind, tall: int(rng, ...cfg.tall) };
    }
    bare = h.wind ? 0 : bare + 1;
    if (!crowd && rng() < cfg.dome) {
      const r = int(rng, 4, 6);
      const free = h.wind ? [[x + 1, h.wind.x - 1], [h.wind.x + widthOf(h.wind.kind) + SIDE + 2, x + w - 1]] : [[x + 1, x + w - 1]];
      const room = free.find(([from, to]) => to - from >= r * 2 + 2);
      if (room) h.dome = { x: Math.round((room[0] + room[1]) / 2), r };
    }
    if (!h.wind && !h.dome && w > 9 && rng() < 0.5) h.stair = int(rng, x + 1, x + w - 8);
    fit(art, d, h);
    x += w + int(rng, ...cfg.gap);
  }
  return houses;
}

// The lamps, doors and windows of house h.
function fit(art, d, h) {
  const { rng, F } = art;
  const { x, w, top } = h;
  if (d === 0) {
    if (rng() < 0.4) h.wins.push([int(rng, x + 2, x + w - 3), top + 5, true]);
    return;
  }
  for (let wx = int(rng, x + 2, x + 4); wx < x + w - 3 && h.high >= 16; wx += int(rng, 5, 8)) {
    const lit = rng() < 0.45;
    h.wins.push([wx, top + 4, lit]);
    if (lit) lamp(art, d, wx + 1, top + 5, 6, 0.4, false);
  }
  if (d < 2 || w < 10) return;
  h.door = int(rng, x + 2, x + w - 7);
  h.shut = rng() < 0.3; // a shut door, a lantern over it
  lamp(art, 2, h.door + 2, h.shut ? F - 10 : F - 5, h.shut ? 9 : 12, 0.9);
  const side = h.door + 7 < x + w - 2 ? h.door + 7 : h.door - 4;
  if (side > x + 1 && rng() < 0.5) {
    h.lantern = side;
    lamp(art, 2, side, F - 11, 8, 0.6, false);
  }
}

export function paintRow(art, d, houses) {
  const { box, F } = art;
  for (const h of houses) house(art, d, h);
  if (d === 2) for (const h of houses) if (h.door !== undefined && !h.shut) {
    box(h.door - 3, F, 10, 1, 'h'); // the light spilling on the street
    box(h.door - 1, F, 6, 1, 'g');
  }
}

function house(art, d, h) {
  const { box, F } = art;
  const { x, w, top, high } = h;
  if (h.wind) badgir(art, d, h.wind.x, top + 2, h.wind.kind, h.wind.tall);
  if (h.dome) dome(art, d, h.dome.x, top + 1, h.dome.r);
  if (h.stair !== undefined) stair(art, d, h.stair, top + 2);
  brick(art, d, x, top, w, high, (i, j) => {
    let v = BASE[d] + h.tint + (j < 3 ? PARAPET[j] : 0.15 * (j / high));
    v += i === 0 ? -0.12 : i === w - 1 ? 0.3 : 0;
    if (d < 2 && (j === 7 || j === 8)) v += j === 7 ? -0.18 : 0.2; // a string course
    if (d > 0 && j === 1 && i % 2) v += 0.3; // the parapet's openwork
    if (d < 2) v += 0.35 * Math.max(0, 1 - (high - j) / 12); // the gloom of the lanes
    return v;
  }, Math.min(2, d * 2));
  for (const [wx, wy, lit] of h.wins) {
    if (d === 0) box(wx, wy, 1, 1, 'G');
    else if (lit) {
      box(wx, wy, 2, 3, 'g');
      box(wx, wy, 2, 1, 'h');
      box(wx, wy + 2, 2, 1, 'G');
    } else box(wx, wy, 2, 3, '-');
  }
  if (h.lantern) {
    box(h.lantern, F - 12, 1, 1, '-');
    box(h.lantern, F - 11, 1, 2, 'G');
  }
  if (h.door !== undefined) {
    box(h.door - 1, F - 8, 6, 8, '-');
    box(h.door, F - 7, 4, 7, h.shut ? 'k' : 'g');
    box(h.door, F - 7, 1, 1, '-');
    box(h.door + 3, F - 7, 1, 1, '-');
    if (h.shut) {
      box(h.door + 2, F - 11, 1, 2, 'G');
      return;
    }
    box(h.door, F - 6, 4, 2, 'h');
    box(h.door + 1, F - 3, 2, 3, 'G');
  }
}
