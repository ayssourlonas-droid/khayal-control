// The Giant Bird: the pack's bird grown to fill the sky, in the giants' pixel art (10 px phosphor
// cells): a round head over a puffed breast, dark on the crown and pale below, the breast laid with
// rows of feathers, and lit red brows; a crest of head feathers fanned up on top and a wing spread at
// each side; the weak points burn: two round eyes and the open hooked beak the birds are spat from.
// The brows throb quicker as the fight heats up, and the breast's feathers light amber, then red.
import { pixels, phosphor, bloom, PX, RED, AMBER, grid, inside, litCells, throb, eyeArt, fan } from './kit.js';
import { shade } from '../sprites.js';

const plume = (S) => S.look.palette.alien.bird;
const COLS = 36;
const ROWS = 30;
const BROW = [85, -58]; // the brows' glow, which throbs in live()

// The hull, in boss coordinates: the head, the breast below it, the V of each brow, and the edges of
// the breast's feathers, in rows of chevrons.
const headAt = (x, y) => inside(x, y, 0, -40, 150, 105) || inside(x, y, 0, 60, 175, 85);
const browAt = (x, y) => {
  const ax = Math.abs(x);
  const at = -72 + (130 - ax) * 0.3; // high at the outer end, low over the inner corner
  return ax > 36 && ax < 130 && y > at - 12 && y <= at + 4;
};
const featherAt = (x, y) => y > 20 && (y - 20 + Math.abs(x) * 0.4) % 30 < 10;

function hullCell(x, y, c) {
  if (!headAt(x, y)) return null;
  if (browAt(x, y)) return [RED, true];
  if (!headAt(x, y - PX)) return shade(c, 0.35); // the moonlit rim of the crown
  if (!headAt(x, y + PX)) return '#120610';
  if (y > 20) return shade(c, featherAt(x, y) ? -0.4 : 0.1); // the feathered breast
  return shade(c, y < -80 ? -0.45 : -0.25); // the dark crown
}

function hull(b, l, S) {
  grid(b, l, COLS, ROWS, (x, y) => hullCell(x, y, plume(S)));
  for (const s of [-1, 1]) bloom(l, s * BROW[0], BROW[1], 60, RED, 0.25);
  phosphor(b, l, 0.16, 5);
}

// The breast's feather edges lit in one colour (the rage overlays).
const feathers = (l, colour) => litCells(l, COLS, ROWS, (x, y) => headAt(x, y) && featherAt(x, y), colour);

// A wing (drawn as the left one): feathers fanned out from the shoulder, the long ones raised.
function wing(b, l, _part, S) {
  fan(b, l, 24, 24, [95, 10], [-0.1, 0.8], (a) => 170 - 30 * Math.max(0, a) - 16 * Math.abs(Math.sin(a * 8)), plume(S));
}

// The crest: the head feathers, fanned up from the crown in spikes.
function crest(b, l, _part, S) {
  fan(b, l, 20, 11, [0, 40], [-Math.PI / 2, 0.85], (a) => 90 - 26 * Math.abs(Math.sin(a * 5)), plume(S));
}

// Bitmaps: L lid, Y lit iris, y its lower half, k pupil, g glint; B the lit horn of the beak, b its
// shadow, R the lit red of the open beak, G its burning throat.
// An eye (drawn as the left one): round and staring under a scowling lid, burning.
const EYE = ['LLLLLLL.', '.LYYYYLL', 'YYkkkYYL', 'YgkkkkYY', 'YYkkkkYY', '.yyYYyy.'];
const BEAK = ['BBBBBBBBB', 'BBBBBBBBB', 'bBBBBBBBb', '.bRRRRRb.', '.bRGGGRb.', '..RGGGR..', '..bRGRb..', '...bBb...', '....b....'];

// The beak: a hooked horn of a beak, open on a burning throat.
function beak(b, l, _part, S) {
  const w = S.pal.weak;
  pixels(b, l, BEAK, PX, { B: [AMBER, true], b: shade(AMBER, -0.45), R: ['#b0301a', true], G: [w, true] });
  bloom(l, 0, 10, 56, w, 0.4);
  phosphor(b, l, 0.25, 4);
}

export default {
  pad: 50,
  margin: 40,
  crack: AMBER,
  hull,
  parts: { crest, wing, eye: eyeArt(EYE), beak },
  rage: [null, (l) => feathers(l, AMBER), (l) => feathers(l, RED)],
  live: throb(...BROW), // the brows throb, quicker with every phase
};
