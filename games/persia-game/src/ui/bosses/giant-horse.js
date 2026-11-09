// The Giant Horse: the pack's horse grown to fill the sky, in the giants' pixel art (10 px phosphor
// cells): a long narrow brown face with a pale blaze down the bridge of the nose, its eyes out at the
// sides of it under deep red brows angled down, a dark muzzle, and a dark mane hanging in locks round
// the upper face; the two pointed ears and the tuft of forelock between them are its plates; the weak
// points burn: two staring eyes and the muzzle, its nostrils flared over the open mouth, the horses
// are spat from. The brows throb quicker as the fight heats up, and the strands of the mane light
// amber, then red.
import { pixels, phosphor, bloom, PX, RED, AMBER, FANG, LID, grid, litCells, eyeArt, throb, outlineWidth } from './kit.js';
import { shade } from '../sprites.js';

const coat = (S) => S.look.palette.alien.horse;
const COLS = 48;
const ROWS = 30;
const BROW = [92, -57]; // the brows' glow, which throbs in live()
const BROW_RED = '#9a0f1e'; // deep, so that lit on the brown coat it stays crimson

// The head's half-width at each height, from the poll down to the chin.
const OUTLINE = [[-92, 40], [-84, 66], [-60, 76], [-10, 80], [30, 74], [62, 66], [100, 60], [134, 56], [142, 40]];
const halfWidth = outlineWidth(OUTLINE);

// The hull, in boss coordinates: the head, the blaze, the muzzle under it, the V of each brow, and the
// mane behind the head: a mass round the upper face, hanging in locks, each to its own point.
const LOCK = 40;
const LOCKS = [100, 112, 90, 72, 52]; // how far down each lock hangs, by its column of LOCK px
const headAt = (x, y) => Math.abs(x) <= halfWidth(y);
const cheekAt = (x, y) => y > 10 && y < 62 && Math.abs(Math.abs(x) - (64 - (y - 10) * 0.2)) < 5; // the ridge down the cheek
const blazeAt = (x, y) => y > -60 && y < 60 && Math.abs(x) <= 20;
const browAt = (x, y) => {
  const ax = Math.abs(x);
  const at = -78 + (138 - ax) * 0.36; // high at the outer end, low over the inner corner
  return ax > 40 && ax < 138 && y > at - 14 && y <= at + 8;
};
function maneAt(x, y) {
  const ax = Math.abs(x);
  const k = Math.floor(ax / LOCK);
  if (y < -90 || k >= LOCKS.length || ax > 110 + (y + 90) * 0.9) return false;
  return y <= LOCKS[k] - 26 * Math.abs(2 * ((ax % LOCK) / LOCK) - 1);
}
const strandAt = (x, y) => Math.floor((Math.abs(x) + y * 0.25) / 10) % 3 === 0;

function hullCell(x, y, c) {
  if (browAt(x, y) && (headAt(x, y) || maneAt(x, y))) return [BROW_RED, true];
  if (!headAt(x, y)) {
    if (!maneAt(x, y)) return null;
    if (!maneAt(x, y - PX)) return shade(c, -0.3); // the lit crest of the mane
    return strandAt(x, y) ? shade(c, -0.62) : shade(c, -0.8);
  }
  if (!headAt(x, y - PX)) return shade(c, 0.3); // the moonlit poll
  if (!headAt(x, y + PX)) return '#120610';
  const ax = Math.abs(x);
  if (y >= 60) return shade(c, !headAt(x - PX, y) || !headAt(x + PX, y) ? -0.65 : -0.5); // the muzzle
  if (blazeAt(x, y)) return shade(c, ax > 10 ? 0.4 : 0.62);
  if (cheekAt(x, y)) return shade(c, -0.42);
  return shade(c, ax < 30 ? 0.08 : ax < 56 ? -0.12 : -0.3); // the planes of the face, shaded to the cheeks
}

function hull(b, l, S) {
  grid(b, l, COLS, ROWS, (x, y) => hullCell(x, y, coat(S)));
  for (const s of [-1, 1]) bloom(l, s * BROW[0], BROW[1], 56, RED, 0.18);
  phosphor(b, l, 0.16, 5);
}

// The strands of the mane lit in one colour (the rage overlays).
const mane = (l, colour) => litCells(l, COLS, ROWS, (x, y) => maneAt(x, y) && !headAt(x, y) && strandAt(x, y), colour);

// An ear (drawn as the left one): a leaf standing up from the poll, leaning out, its inside in shade.
// earAt(x, y) is [distance from its spine, its half-width there, how far down it, 0 to 1], or null.
const earAt = (x, y) => {
  const t = (y + 35) / 70;
  return t >= 0 && t <= 1 ? [Math.abs(x + 8 * (1 - t)), 6 + 24 * t ** 0.8, t] : null;
};
function ear(b, l, p, S) {
  const c = coat(S);
  grid(b, l, p.w / PX, p.h / PX, (x, y) => {
    const e = earAt(x, y);
    if (!e || e[0] > e[1]) return null;
    if (e[0] < e[1] * 0.5 && e[2] > 0.3) return shade(c, -0.72); // the inside
    const out = earAt(x - PX, y);
    return !out || out[0] > out[1] ? shade(c, 0.25) : shade(c, -0.25);
  });
  phosphor(b, l, 0.22, 4);
}

// Bitmaps: T the lit tip of a lock of hair, H hair, D a darker strand.
// The forelock: a tuft of mane over the brow, wide at the crown and hanging to a ragged point.
const FORELOCK = ['.H.TH.', 'HHTHHH', 'HTHHDH', '.HHDHH', '.HDHH.', '..HHD.', '...H..'];
function forelock(b, l, _part, S) {
  const c = coat(S);
  pixels(b, l, FORELOCK, PX, { T: shade(c, -0.3), H: shade(c, -0.55), D: shade(c, -0.75) });
  phosphor(b, l, 0.22, 4);
}

// An eye (drawn as the left one): round and staring under a lid that scowls down to the nose, burning.
const EYE = ['LLLLLL..', 'LLYYYYLL', 'YYkkkkYY', 'YgkkkkkY', '.YYkkkYY', '..yyyyy.'];

// Bitmaps: N the muzzle, n its lit top, K a nostril and r its burning inside; L lip, w tooth, D the dark throat.
// The muzzle: the nostrils flared wide over an open mouth, the teeth bared, the throat dark.
const MOUTH = ['nnnnnnnnnnnn', 'NNKKKNNKKKNN', 'KKrKKNNKKrKK', 'NKKKNNNNKKKN', '.LLLLLLLLLL.', 'LwwwwwwwwwwL', 'LwDwDwwDwDwL', '.LLLLLLLLLL.'];
function mouth(b, l, _part, S) {
  const w = S.pal.weak;
  pixels(b, l, MOUTH, PX, { N: shade(coat(S), -0.5), n: shade(coat(S), -0.3), K: '#050205', r: ['#d02a1a', true], L: LID, w: FANG, D: '#14050e' });
  bloom(l, 0, 14, 44, w, 0.2);
  phosphor(b, l, 0.2, 4);
}

export default {
  pad: 50,
  margin: 40,
  crack: AMBER,
  hull,
  parts: { ear, forelock, eye: eyeArt(EYE), mouth },
  rage: [null, (l) => mane(l, AMBER), (l) => mane(l, RED)],
  live: throb(...BROW), // the brows throb, quicker with every phase
};
