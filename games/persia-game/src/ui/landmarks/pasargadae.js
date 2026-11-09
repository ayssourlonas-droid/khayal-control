// The Tomb of Cyrus at night, the parallax layer kind 'pasargadae' (parallax-shapes.js has the painter
// contract), painted in PIXEL-sized blocks (kit.js): alone on a wide plain the tomb, large and
// central, six tiers of ashlar under the small gabled chamber with its low door and its tympanum,
// floodlit warm from the foot of each tier, the chamber dimmer, the roof dimmer still (layer lights
// that pulse); off to the sides what is left of the palaces (pasargadae-ruins.js). The layer brings
// L.lit, L.ink, L.glow, L.lamp and L.stone, the floodlit limestone. Rows are counted from F, the
// plain's floor; a stone's light is a level, 0 lit and warm to 1 dark and cool.
import { PIXEL, mix } from '../sprites.js';
import { scene } from './kit.js';
import { ruins } from './pasargadae-ruins.js';

const UNDER = 16; // blocks from the floor down to the band's foot; the ground hides the lowest 14
const BASE = 72; // the lowest tier's half-width
const INSET = 6; // how much narrower a side each tier above is
const TIERS = [17, 11, 11, 6, 6, 6]; // the tiers' heights, bottom to top
const HALL = 30; // the chamber's half-width
const WALL = 36; // its walls' height
const OVER = 3; // how much wider a side its cornice and roof are
const CORNICE = 2; // the cornice slab's height
const GABLE = 20; // the roof's height
const DOOR = { w: 6, h: 10 };
const RISE = TIERS.reduce((a, b) => a + b); // the tiers' height together
const SHADES = 16; // the levels the stone is cut into

const letter = (i) => String.fromCharCode(97 + i); // a level's tone key; its capital is the joint
const at = (lv) => letter(Math.round(Math.min(1, Math.max(0, lv)) * (SHADES - 1)));

export function pasargadae(g, w, h, rng, L, lights) {
  const tone = { '#': L.color, '+': L.lit, '-': L.ink };
  for (let i = 0; i < SHADES; i++) {
    const lv = i / (SHADES - 1);
    tone[letter(i)] = mix(mix(L.stone, L.lamp, 0.4 * (1 - lv)), L.ink, 0.03 + 0.55 * lv);
    tone[letter(i).toUpperCase()] = mix(tone[letter(i)], L.ink, 0.15);
  }
  tone.R = mix(L.stone, L.lamp, 0.5); // a tread's lit front edge
  tone.T = mix(tone[at(0.88)], L.ink, 0.3); // the tympanum, recessed in the roof
  [0.35, 0.45, 0.52, 0.62, 0.72].forEach((d, i) => { tone[i + 1] = mix(L.stone, L.ink, d); }); // the ruins' stone
  const art = scene(g, w, h, rng, L, lights, tone, UNDER);
  const { mid } = art;
  g.save();
  g.scale(PIXEL, PIXEL);
  art.slab(0, art.F, art.BW, UNDER);
  ruins(art, mid);
  tomb(art, mid);
  g.restore();
}

// A band of ashlar `n` rows high from `y` up, `bw` wide from x: row j is of level level(j), a joint
// closes each course of `course` rows, and vertical joints a `gap` of blocks apart (picked from
// the range once per band) are staggered by half a gap from course to course.
function ashlar({ box, rng, row }, x, bw, y, n, level, course, range, k) {
  const gap = range[0] + Math.floor(rng() * (range[1] - range[0] + 1));
  for (let j = 0; j < n; j++) {
    const c = at(level(j));
    const r = row(y + j);
    if (j % course === course - 1) {
      box(x, r, bw, 1, c.toUpperCase());
      continue;
    }
    box(x, r, bw, 1, c);
    const start = ((k + Math.floor(j / course)) % 2 ? gap >> 1 : gap) - 1;
    for (let u = x + start; u < x + bw; u += gap) box(u, r, 1, 1, c.toUpperCase());
  }
}

// The tomb on the plain: the tiers, the chamber on them, the roof, and the floodlights.
function tomb(art, mid) {
  const { box, lights, L, F, row } = art;
  let y = 0;
  TIERS.forEach((tall, t) => {
    const half = BASE - t * INSET;
    // brightest and warmest at its foot, cooler up its face, each tier a little dimmer than the last
    ashlar(art, mid - half, half * 2, y, tall - 2, (j) => t * 0.04 + (0.3 * j) / (tall - 1), 6, [10, 14], t);
    box(mid - half, row(y + tall - 2), half * 2, 1, '-'); // the shadow under the lip
    box(mid - half, row(y + tall - 1), half * 2, 1, 'R'); // the lip, lit on its front edge
    y += tall;
  });
  chamber(art, mid, y);
  roof(art, mid, y + WALL);
  for (const s of [-1, 1]) lights.push({ x: (mid + s * 60) * PIXEL, y: F * PIXEL, r: 110, color: L.glow, ph: s * 0.3, a: 0.4 });
  lights.push({ x: mid * PIXEL, y: row(RISE + DOOR.h / 2) * PIXEL, r: 40, color: L.lamp, ph: 0.6, a: 0.3 });
}

// The chamber's end wall from row `y`: ashlar in dimmer stone, the door in a recess with a lighter
// jamb under its lintel, and the shadow under the cornice.
function chamber(art, mid, y) {
  const { box, F, row } = art;
  ashlar(art, mid - HALL, HALL * 2, y, WALL - 1, (j) => 0.6 + (0.12 * j) / WALL, 8, [8, 10], 0);
  box(mid - HALL, row(y + WALL - 1), HALL * 2, 1, '-');
  const door = F - RISE - DOOR.h; // the door's top row
  box(mid - DOOR.w / 2, door, DOOR.w, DOOR.h, '-');
  box(mid - DOOR.w / 2, door, 1, DOOR.h, at(0.45));
  box(mid - DOOR.w / 2 - 2, door - 1, DOOR.w + 4, 1, at(0.4));
}

// The roof from row `y`: the cornice, a thick slab that overhangs the walls, the gable above it
// in the dimmest stone with a lit edge up both slopes and its tympanum set in.
function roof({ box, row }, mid, y) {
  box(mid - HALL - OVER, row(y), (HALL + OVER) * 2, 1, at(0.58));
  box(mid - HALL - OVER, row(y + 1), (HALL + OVER) * 2, 1, at(0.62));
  const half = (j) => (j >= GABLE ? 0 : Math.max(1, Math.round((HALL + OVER) * (1 - (j + 0.5) / GABLE))));
  for (let j = 0; j < GABLE; j++) {
    const r = row(y + CORNICE + j);
    const hj = half(j);
    const edge = Math.max(1, hj - half(j + 1));
    const inner = hj - 3;
    box(mid - hj, r, hj * 2, 1, at(0.88));
    if (j >= 3 && inner > 0) box(mid - inner, r, inner * 2, 1, 'T');
    box(mid - hj, r, edge, 1, at(0.55));
    box(mid + hj - edge, r, edge, 1, at(0.55));
  }
}
