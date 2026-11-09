// The Giant Camel: the pack's camel grown to fill the sky, in the giants' pixel art (10 px phosphor
// cells): a long khaki face that is broad across the brow and narrows to a soft, drooping muzzle,
// lit red brows angled down over heavy drowsy lids, and what no other giant has, the dome of the
// hump rising behind the head between the ears. The two small ears high at the sides and the shaggy
// tuft on the crown are its plates; the weak points burn: two half-shut eyes and the muzzle, its
// nostrils over the split upper lip and the open mouth, the camels are spat from. The brows throb
// quicker as the fight heats up, and the strands of the hump's hair light amber, then red.
import { pixels, phosphor, bloom, PX, RED, AMBER, FANG, LID, grid, inside, litCells, eyeArt, throb, outlineWidth } from './kit.js';
import { shade } from '../sprites.js';

const coat = (S) => S.look.palette.alien.camel;
const COLS = 48;
const ROWS = 34; // the hump's top row is the grid's, at y -170, as low as the HUD allows (R28)
const BROW = [92, -52]; // the brows' glow, which throbs in live()
const BROW_RED = '#9a0f1e'; // deep, so that lit on the khaki coat it stays crimson
const HAIR = '#5a3a22'; // the tuft's dark brown

// The head's half-width at each height, from the crown down to the chin.
const OUTLINE = [[-92, 30], [-88, 60], [-80, 84], [-66, 106], [-46, 122], [-20, 130], [14, 126], [34, 88], [52, 52], [64, 46], [78, 48], [96, 50], [122, 50], [136, 48], [142, 36]];
const halfWidth = outlineWidth(OUTLINE);

// The hump: the top half of an ellipse standing up behind the head between the ears (the head hides
// its lower half), its edge ragged where the hair hangs.
const HUMP_TOP = -(ROWS * PX) / 2;
const HUMP_BASE = -75; // where it is widest
const HUMP_TALL = HUMP_BASE - HUMP_TOP;
const HUMP_HALF = 90;
const humpHalf = (y) => {
  const t = (HUMP_BASE - y) / HUMP_TALL;
  const shaggy = y > HUMP_TOP + 3 * PX && Math.floor((y - HUMP_TOP) / PX) % 3 === 1 ? PX : 0;
  return HUMP_HALF * Math.sqrt(1 - t * t) - shaggy;
};
const humpAt = (x, y) => y >= HUMP_TOP && y <= HUMP_BASE && Math.abs(x) <= humpHalf(y);

const headAt = (x, y) => Math.abs(x) <= halfWidth(y);
const socketAt = (x, y) => Math.abs(Math.abs(x) - 92) <= 46 && y > -44 && y < 24;
const browAt = (x, y) => {
  const ax = Math.abs(x);
  const at = -64 + (134 - ax) * 0.3; // high at the outer end, low over the inner corner
  return ax > 36 && ax < 134 && y > at - 14 && y <= at + 8;
};
const strandAt = (x, y) => Math.floor((Math.abs(x) - y * 0.6) / 10) % 4 === 0; // the hump's hair, in streaks running down and out

function hullCell(x, y, c) {
  if (!headAt(x, y)) {
    if (!humpAt(x, y)) return null;
    if (!humpAt(x, y - PX)) return shade(c, 0.1); // the moonlit crest of the hump
    if (!humpAt(x - PX, y) || !humpAt(x + PX, y)) return shade(c, -0.66);
    if (inside(x, y, -20, -135, 38, 22)) return shade(c, strandAt(x, y) ? -0.2 : -0.04); // the moon on its shoulder
    return shade(c, (strandAt(x, y) ? -0.52 : -0.34) - 0.16 * ((y - HUMP_TOP) / HUMP_TALL)); // darker toward the head
  }
  if (browAt(x, y)) return [BROW_RED, true];
  if (!headAt(x, y - PX)) return shade(c, 0.2); // the moonlit crown
  if (!headAt(x, y + PX)) return '#120610';
  const ax = Math.abs(x);
  if (y >= 60) return shade(c, !headAt(x - PX, y) || !headAt(x + PX, y) ? -0.62 : -0.4); // the muzzle
  if (socketAt(x, y)) return shade(c, -0.42);
  if (y > 24 && Math.abs(ax - (70 - (y - 24) * 0.45)) < 5) return shade(c, -0.4); // the crease down the cheek
  return shade(c, ax < 16 ? 0.14 : ax < 44 ? -0.02 : -0.18 - Math.min(0.2, (ax - 44) * 0.004)); // the long bridge, shaded to the cheeks
}

function hull(b, l, S) {
  grid(b, l, COLS, ROWS, (x, y) => hullCell(x, y, coat(S)));
  for (const s of [-1, 1]) bloom(l, s * BROW[0], BROW[1], 56, RED, 0.18);
  phosphor(b, l, 0.16, 5);
}

// The hump's hair lit in one colour (the rage overlays).
const hair = (l, colour) => litCells(l, COLS, ROWS, (x, y) => humpAt(x, y) && !headAt(x, y) && strandAt(x, y) && humpAt(x, y + PX), colour);

// An ear (drawn as the left one): small and rounded, leaning out from the crown, its inside in shade.
function ear(b, l, p, S) {
  const c = coat(S);
  const leaf = (x, y) => inside(x - 0.2 * y, y, 0, 0, 30, 31);
  grid(b, l, p.w / PX, p.h / PX, (x, y) => {
    if (!leaf(x, y)) return null;
    if (inside(x - 0.2 * y, y, 3, 8, 12, 18)) return shade(c, -0.7);
    if (!leaf(x, y - PX) || !leaf(x - PX, y)) return shade(c, 0.28);
    return !leaf(x, y + PX) ? shade(c, -0.55) : shade(c, -0.18);
  });
  phosphor(b, l, 0.22, 4);
}

// Bitmaps: T the lit tip of a lock of hair, H hair, D a darker strand.
// The tuft: shaggy hair on the crown, wide at its root and hanging in ragged locks.
const TUFT = ['...T..T...', '..THTTHT..', '.THHDHHHT.', 'THHDHHDHHT', 'HHDHHHHDHH', 'H.HDH.HDH.'];
function tuft(b, l) {
  pixels(b, l, TUFT, PX, { T: shade(HAIR, 0.45), H: HAIR, D: shade(HAIR, -0.45) });
  phosphor(b, l, 0.22, 4);
}

// An eye (drawn as the left one): half shut under a heavy lid, the iris a burning slit above a baggy lower lid.
const EYE = ['LLLLLLLL', 'LLLLLLLL', 'LYYkkYYL', 'YYYkkYYY', '.YYYYYY.', '..LLLL..'];

// Bitmaps: n the lit top of the muzzle, N the muzzle, K a nostril or the split of the lip, l a lobe of the
// upper lip; L lip, w tooth, D the dark throat, d the hanging lower lip.
// The muzzle: the nostrils over the upper lip's two soft lobes and the split between them, the mouth
// open under it, the lower lip drooping.
const MOUTH = ['..nnnnnnn..', '.NNKKNKKNN.', 'NNKKNNNKKNN', 'NNNNNKNNNNN', 'NllllKllllN', '.LLLLLLLLL.', 'LwwDwKwDwwL', '..ddddddd..'];
function mouth(b, l, _part, S) {
  const w = S.pal.weak;
  const c = coat(S);
  pixels(b, l, MOUTH, PX, { n: shade(c, -0.18), N: shade(c, -0.42), K: '#050205', l: shade(c, -0.58), L: LID, w: FANG, D: '#14050e', d: shade(c, -0.3) });
  bloom(l, 0, 8, 46, w, 0.2);
  phosphor(b, l, 0.2, 4);
}

export default {
  pad: 50,
  margin: 40,
  crack: AMBER,
  hull,
  parts: { ear, tuft, eye: eyeArt(EYE), mouth },
  rage: [null, (l) => hair(l, AMBER), (l) => hair(l, RED)],
  live: throb(...BROW), // the brows throb, quicker with every phase
};
