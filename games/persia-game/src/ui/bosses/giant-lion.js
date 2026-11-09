// The Giant Lion: the pack's lion grown to fill the sky, in the giants' pixel art (10 px phosphor
// cells): a golden face in a great dark mane that flares out to a point all the way round, lit red
// brows angled down over the eyes, a broad dark nose over a paler muzzle with its whisker spots; a
// round ear at each top corner of the mane and the crown of the mane between them are its plates; the
// weak points burn: two staring eyes with slit pupils and the roaring jaws, fangs bared, the lions
// are spat from. The brows throb quicker as the fight heats up, and the strands of the mane light
// amber, then red.
import { pixels, phosphor, bloom, PX, TAU, RED, AMBER, FANG, LID, grid, inside, markAt, litCells, eyeArt, throb } from './kit.js';
import { shade } from '../sprites.js';

const coat = (S) => S.look.palette.alien.lion;
const MANE = '#8a3e18';
const COLS = 64;
const ROWS = 32;
const BROW = [92, -52]; // the brows' glow, which throbs in live()
const BROW_RED = '#8a0a18'; // deep, so that lit on the gold coat it stays crimson and does not wash to pink
const TUFTS = 14; // the points of the mane's edge, one at the top and the bottom
const STRANDS = 72; // the strands of the mane, running out from the face (a multiple of 3)

// The mane: a wide oval round (0, MANE_Y) whose edge is a zigzag of TUFTS points.
const MANE_Y = 6;
const MANE_RX = 270;
const MANE_RY = 150;
const reach = (x, y) => Math.hypot(x / MANE_RX, (y - MANE_Y) / MANE_RY); // 1 at the mane's oval
function maneAt(x, y) {
  const f = ((Math.atan2((y - MANE_Y) / MANE_RY, x / MANE_RX) - Math.PI / 2) * TUFTS) / TAU + 0.5;
  return reach(x, y) <= 1 - 0.19 * Math.abs(2 * (f - Math.floor(f)) - 1);
}
const strandAt = (x, y) => ((Math.floor((Math.atan2(y - MANE_Y, x) * STRANDS) / TAU) % 3) + 3) % 3; // 0 to 2, repeating
const TONES = [-0.12, -0.34, -0.52]; // a strand's shade, by its place in the repeat; the rage lights every first strand

// The face, in boss coordinates: a rounded oval inside the mane, the broad nose, the muzzle under it
// with its whisker spots, the bridge between the eyes, the shadow round each eye and the V of each brow.
const faceAt = (x, y) => (Math.abs(x) / 150) ** 2.4 + (Math.abs(y - 12) / 108) ** 2.4 <= 1;
const noseAt = (x, y) => y >= 10 && y < 46 && Math.abs(x) <= 48 - (y - 10) * 0.6;
const muzzleAt = (x, y) => (Math.abs(x) / 112) ** 2.4 + (Math.abs(y - 78) / 52) ** 2.4 <= 1;
const SPOTS = [[85, 62], [100, 76], [85, 90]]; // one cell each, either side
const socketAt = (x, y) => Math.abs(Math.abs(x) - 92) <= 50 && Math.abs(y + 10) <= 40;
const browAt = (x, y) => {
  const ax = Math.abs(x);
  const at = -72 + (150 - ax) * 0.34; // high at the outer end, low over the inner corner
  return ax > 30 && ax < 150 && y > at - 14 && y <= at + 8;
};

function noseCell(x, y) {
  if (y < 20) return Math.abs(x + 20) < 12 ? ['#f0b0b8', true] : '#7a2a3c'; // the glint on its top
  if (y > 26 && Math.abs(Math.abs(x) - 16) < 6) return '#1a0610'; // the nostrils
  return y > 36 ? '#4a1424' : '#6a2234';
}

// The mane round the face, but for the top, where the crown plate stands.
const outerManeAt = (x, y) => maneAt(x, y) && !faceAt(x, y) && !(Math.abs(x) < 75 && y < -95);

function hullCell(x, y, c) {
  if (!faceAt(x, y)) {
    if (!outerManeAt(x, y)) return null;
    if (y < MANE_Y && !maneAt(x, y - PX)) return shade(MANE, 0.3); // the moonlit crest of the mane
    if (!maneAt(x, y + PX)) return '#120610';
    if (faceAt(x - PX, y) || faceAt(x + PX, y) || faceAt(x, y - PX) || faceAt(x, y + PX)) return shade(MANE, -0.75);
    return shade(MANE, TONES[strandAt(x, y)] + 0.5 * (reach(x, y) - 0.7)); // lighter out to the tips
  }
  if (browAt(x, y)) return [BROW_RED, true];
  if (!faceAt(x, y - PX)) return shade(c, 0.3); // the moonlit brow
  if (!faceAt(x, y + PX)) return '#120610';
  if (noseAt(x, y)) return noseCell(x, y);
  if (markAt(SPOTS, x, y)) return shade(c, -0.7);
  if (socketAt(x, y)) return shade(c, -0.38);
  if (muzzleAt(x, y)) return shade(c, !muzzleAt(x, y + PX) ? -0.15 : 0.38);
  if (Math.abs(x) <= 18 && y < 12) return shade(c, 0.22); // the bridge
  return shade(c, Math.abs(x) > 100 ? -0.28 : y < -40 ? 0 : -0.12);
}

function hull(b, l, S) {
  grid(b, l, COLS, ROWS, (x, y) => hullCell(x, y, coat(S)));
  for (const s of [-1, 1]) bloom(l, s * BROW[0], BROW[1], 56, RED, 0.18);
  phosphor(b, l, 0.16, 5);
}

// The strands of the mane lit in one colour (the rage overlays).
const mane = (l, colour) => litCells(l, COLS, ROWS, (x, y) => outerManeAt(x, y) && maneAt(x, y + PX) && strandAt(x, y) === 0, colour);

// An ear (drawn as the left one): round, its rim lit by the moon, its hollow in shade toward the face.
function ear(b, l, p, S) {
  const c = coat(S);
  const round = (x, y) => inside(x, y, 0, 0, 40, 40);
  grid(b, l, p.w / PX, p.h / PX, (x, y) => {
    if (!round(x, y)) return null;
    if (inside(x, y, 7, 7, 17, 19)) return '#7a3220';
    if (!round(x, y - PX)) return shade(c, 0.35);
    if (!round(x, y + PX)) return shade(c, -0.55);
    return shade(c, -0.2);
  });
  phosphor(b, l, 0.22, 4);
}

// Bitmaps: T the lit tip of a lock of hair, H hair, D a darker strand.
// The crown: a swept tuft of mane over the brow, wide at its root and running up to three points.
const CROWN = ['...T...T...T...', '..THT.THT.THT..', '.HHDHHHDHHHDHH.', 'HHDHHDHHHDHHDHH', 'HDHHHDHHHDHHHDH'];
function crown(b, l) {
  pixels(b, l, CROWN, PX, { T: shade(MANE, 0.45), H: shade(MANE, 0.12), D: shade(MANE, -0.35) });
  phosphor(b, l, 0.22, 4);
}

// An eye (drawn as the left one): staring under a lid that scowls down to the nose, the pupil a slit.
const EYE = ['LLLLLL..', 'LLYYYYLL', 'YYYkkYYY', 'YgYkkYYY', '.YYkkYY.', '..yyyy..'];

// Bitmaps: L lip, w fang, D the dark throat, p tongue.
// The jaws: open and roaring, a fang at each corner and teeth between, the tongue over a dark throat.
const MOUTH = ['.LLLLLLLLLLLL.', 'LwwDwwwwwwDwwL', 'LwDDDDDDDDDDwL', 'LDDDDppppDDDDL', 'LDDDDppppDDDDL', 'LwDDDDppDDDDwL', 'LwwDwDDDDwDwwL', '.LLLLLLLLLLLL.'];
function mouth(b, l, _part, S) {
  const w = S.pal.weak;
  pixels(b, l, MOUTH, PX, { L: LID, w: FANG, D: '#14050e', p: '#b0345e' });
  bloom(l, 0, 0, 50, w, 0.2);
  phosphor(b, l, 0.2, 4);
}

export default {
  pad: 50,
  margin: 40,
  crack: AMBER,
  hull,
  parts: { ear, crown, eye: eyeArt(EYE), mouth },
  rage: [null, (l) => mane(l, AMBER), (l) => mane(l, RED)],
  live: throb(...BROW), // the brows throb, quicker with every phase
};
