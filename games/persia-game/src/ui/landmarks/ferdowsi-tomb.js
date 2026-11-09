// The tomb itself (ferdowsi.js), a broad cube of white stone on a wide, low flight of steps, seen
// front on: a tall column stands at each corner (the two at the back are hidden behind the front
// two) under a double-headed bull capital and a deep stepped cornice; on the wall between them a
// pair of shorter engaged columns, three panels of verse and, high over them, the winged figure.
// It is floodlit from below, so the stone is palest at the steps and cools as it climbs. Rows are
// counted from F, the pool's far edge at the platform's foot. Tones: the stone ramp of stoneTones
// (brick()'s numbered keys), '+' '#' '-' the bulls' and the figure's stone, lit to shade, k the verse.
import { PIXEL, mix } from '../sprites.js';
import { int } from '../../core/rng.js';
import { SHADES, key, brick, lamp } from './yazd-brick.js';
import { CAPITAL } from './persepolis-art.js';
import { WINGED } from './ferdowsi-art.js';

const D = 0; // the depth brick() paints the stone at: the tomb is one row, so one ramp
export const FOOT = 67; // the lowest step's half-width
const STEPS = 6; // each two rows, a riser under a lit tread, and four blocks narrower a side than the one below
const STAIR = 2 * STEPS; // the platform's height
const HALF = 40; // the cube's half-width, out to its corner columns
const COLUMN = 6; // a corner column's width
const SHAFT = 42; // a corner column's height
const WALL = STAIR + SHAFT + CAPITAL.length; // up to the foot of the cornice
const CORNICE = [[47, 1, 0.8], [47, 2, 0.55], [50, 2, 0.45], [53, 2, 0.3]]; // half-width, rows, darkness
const ENGAGED = { at: 15, w: 4, tall: 30 }; // the pair on the wall: distance from the middle, width, height
const ARCHITRAVE = STAIR + ENGAGED.tall; // the course the engaged columns carry, four rows
const CORNERS = [-HALF, HALF - COLUMN]; // each corner column's first block from the middle
const PAIR = [-ENGAGED.at - ENGAGED.w, ENGAGED.at]; // and each engaged column's
// Every column as its first block from the middle, its width and its top.
const COLUMNS = [...CORNERS.map((x) => [x, COLUMN, WALL]), ...PAIR.map((x) => [x, ENGAGED.w, ARCHITRAVE])];
const FLOODS = [-30, -12, 12, 30]; // from the middle: the lamps at the platform's top that light the stone

// The stone's tones: a ramp of white warmed by the floodlights at its lit end and cooling to the
// shade's grey, then C the pool's coping, P the walk and the three the carvings are cut in.
export function stoneTones(L) {
  const tone = {};
  for (let i = 0; i < SHADES; i++) {
    const lv = i / (SHADES - 1);
    tone[key(D, lv)] = mix(mix(L.stone, L.lamp, 0.22 * (1 - lv) ** 2), L.shade, 0.75 * lv);
  }
  for (const [c, dark] of [['+', 0.12], ['#', 0.3], ['-', 0.62], ['C', 0.1], ['P', 0.88]]) tone[c] = tone[key(D, dark)];
  return tone;
}

// How dark the wall is `up` rows above the foot: palest low, as it is floodlit from below.
const dim = (up) => 0.1 + 0.52 * ((up - STAIR) / (WALL - STAIR));

export function floods(art) {
  const { mid, row, lights, L } = art;
  for (const dx of FLOODS) {
    lamp(art, D, mid + dx, row(STAIR), 44, 0.55, false);
    lights.push({ x: (mid + dx + 0.5) * PIXEL, y: row(STAIR) * PIXEL, r: 84, color: L.lamp, ph: dx / 19, a: 0.18 });
  }
}

// A fluted shaft `w` wide from row `from` up to row `to`, lit down its left and shaded down its right.
function shaft(art, x, w, from, to) {
  brick(art, D, x, art.row(to - 1), w, to - from, (i, j) => dim(to - 1 - j) + (i === 0 ? -0.1 : i === w - 1 ? 0.4 : i % 2 ? 0 : 0.15), 0);
}

// A panel of verse `pw` wide from column x, framed in shade, in it rows of dark marks, each a run
// of short strokes.
function verse(art, x, pw, from, to) {
  const { box, row, rng } = art;
  box(x - 1, row(to), pw + 2, to - from + 2, key(D, 0.55));
  brick(art, D, x, row(to - 1), pw, to - from, (i, j) => dim(to - 1 - j) - 0.05, 0);
  for (let up = to - 3; up > from + 1; up -= 3) {
    for (let c = x + 1; c < x + pw - 1; c += int(rng, 2, 4) + 1) box(c, row(up), Math.min(int(rng, 1, 3), x + pw - 1 - c), 1, 'k');
  }
}

function steps(art) {
  const { mid, row } = art;
  for (let j = 0; j < STEPS; j++) {
    const half = FOOT - 4 * j;
    brick(art, D, mid - half, row(2 * j), half * 2, 1, () => 0.42, 0);
    brick(art, D, mid - half, row(2 * j + 1), half * 2, 1, () => -0.05, 0);
  }
}

// The front wall between the corner columns, in the shade of the cornice and of the columns: its
// engaged columns under their small capitals and the panels between them, the architrave they
// carry and the winged figure high over it.
function face(art) {
  const { mid, box, row } = art;
  const wall = HALF * 2;
  const hug = (i, up) => COLUMNS.some(([x, cw, top]) => up < top && (i === x - 1 || i === x + cw)); // beside a column, where it casts its shade
  const dark = (i, j) => dim(WALL - 1 - j) + 0.08 + (hug(i - HALF, WALL - 1 - j) ? 0.3 : 0) + (j < 3 ? 0.2 : 0); // the cornice's shade over its top rows
  brick(art, D, mid - HALF, row(WALL - 1), wall, WALL - STAIR, dark, 0);
  for (const dx of PAIR) {
    const x = mid + dx;
    shaft(art, x, ENGAGED.w, STAIR, ARCHITRAVE - 2);
    box(x - 1, row(ARCHITRAVE - 1), ENGAGED.w + 2, 1, key(D, 0.05));
    box(x - 1, row(ARCHITRAVE - 2), ENGAGED.w + 2, 1, key(D, 0.5));
    verse(art, dx < 0 ? mid - 32 : mid + 21, 11, STAIR + 5, ARCHITRAVE - 5);
  }
  verse(art, mid - 11, 22, STAIR + 5, ARCHITRAVE - 5);
  const bw = wall - COLUMN * 2;
  box(mid - bw / 2, row(ARCHITRAVE + 3), bw, 4, key(D, 0.3));
  box(mid - bw / 2, row(ARCHITRAVE + 3), bw, 1, key(D, 0));
  box(mid - bw / 2, row(ARCHITRAVE), bw, 1, key(D, 0.7));
  art.stamp(WINGED, mid - (WINGED[0].length >> 1), row(ARCHITRAVE + 22));
}

// The two corner columns that face us, each under its double-headed bull capital.
function corners(art) {
  const { mid, row, stamp } = art;
  for (const dx of CORNERS) {
    shaft(art, mid + dx, COLUMN, STAIR, STAIR + SHAFT);
    stamp(CAPITAL, mid + dx - 6, row(WALL - 1));
  }
}

// The cornice: each course overhangs the one under it by more, the lowest in shadow and the rest
// lit along their top.
function cornice(art) {
  const { mid, box, row } = art;
  let up = WALL;
  for (const [half, rows, dark] of CORNICE) {
    box(mid - half, row(up + rows - 1), half * 2, rows, key(D, dark));
    if (rows > 1) box(mid - half, row(up + rows - 1), half * 2, 1, key(D, dark - 0.3));
    up += rows;
  }
}

export function tomb(art) {
  steps(art);
  face(art);
  corners(art);
  cornice(art);
}
