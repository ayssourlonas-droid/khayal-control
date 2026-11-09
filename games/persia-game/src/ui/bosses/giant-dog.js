// The Giant Dog: the pack's dog grown to fill the sky, in the giants' pixel art (10 px phosphor
// cells), a broad tan face with heavy jowls as the small dog has: a pale muzzle round the black nose,
// a dark patch over one eye, deep red brows angled down over the eyes, locks of fur on the crown, the
// brow and the cheeks; a long floppy ear hangs down at each side, its inside in shade, and the black
// nose is the third plate; the weak points burn: two round eyes and the open barking mouth, fangs
// bared, the dogs are spat from. The brows throb quicker as the fight heats up, and the locks of fur
// and the patch light amber, then red.
import { pixels, phosphor, bloom, PX, AMBER, RED, FANG, LID, grid, inside, markAt, litCells, eyeArt, throb, spine, spineAt } from './kit.js';
import { shade } from '../sprites.js';

const coat = (S) => S.look.palette.alien.dog;
const BROW_RED = '#6a0914'; // deep, so that lit on a pale coat (lit doubles it) it stays crimson and does not wash to pink
const COLS = 36;
const ROWS = 30;
const BROW = [92, -82]; // the brows' glow, which throbs in live()

// A lock of fur: a triangle w wide, flat at y0 and running h (up when negative) to a point.
const lock = (x, y, cx, y0, w, h) => {
  const t = (y - y0) / h;
  return t >= 0 && t <= 1 && Math.abs(x - cx) <= (w / 2) * (1 - t);
};

// The hull, in boss coordinates: the broad skull, the jowls under it, four locks on the crown, the
// muzzle with the bridge of the nose, the V of each brow, a patch over the right eye, the whisker
// spots and the locks of fur.
const skullAt = (x, y) => (Math.abs(x) / 168) ** 3.6 + (Math.abs(y + 10) / 118) ** 3.6 <= 1;
const crownAt = (x, y) => [-45, -15, 15, 45].some((cx) => lock(x, y, cx, -122, 34, -34));
const headAt = (x, y) => skullAt(x, y) || inside(x, y, 0, 52, 160, 96) || crownAt(x, y);
const muzzleAt = (x, y) => (Math.abs(x) / 118) ** 2.6 + (Math.abs(y - 58) / 80) ** 2.6 <= 1
  || (y > -62 && y < 0 && Math.abs(x) <= 20 + (y + 62) * 0.4);
const patchAt = (x, y) => inside(x, y, 100, -40, 66, 52);
const SPOTS = [[65, 25], [85, 15], [75, 45]]; // one cell each, either side
const SNARL = [[65, 55], [75, 60], [85, 65]]; // the lines of the lip, from the nose down to the fangs
const browAt = (x, y) => {
  const ax = Math.abs(x);
  const at = -100 + (150 - ax) * 0.35; // high at the outer end, low over the inner corner
  return ax > 44 && ax < 150 && y > at - 16 && y <= at + 8;
};
const furAt = (x, y) => {
  const ax = Math.abs(x);
  return lock(x, y, 0, -124, 60, 40) || lock(ax, y, 142, -8, 30, 46) || lock(ax, y, 138, 44, 26, 40);
};

function hullCell(x, y, c) {
  if (!headAt(x, y)) return null;
  if (browAt(x, y)) return [BROW_RED, true];
  if (!headAt(x, y - PX)) return shade(c, 0.3); // the moonlit crown
  if (!headAt(x, y + PX)) return '#120610';
  if (markAt(SPOTS, x, y)) return shade(c, -0.7);
  if (markAt(SNARL, x, y)) return shade(c, -0.45);
  if (muzzleAt(x, y)) {
    if (!muzzleAt(x, y - PX)) return shade(c, 0.5); // lit on top, shaded at the sides and below
    if (!muzzleAt(x - PX, y) || !muzzleAt(x + PX, y) || !muzzleAt(x, y + PX)) return shade(c, -0.4);
    return shade(c, y < 100 ? 0.25 : 0.1);
  }
  if (patchAt(x, y)) return shade(c, -0.55);
  if (furAt(x, y)) return shade(c, -0.45);
  return shade(c, y < -60 ? -0.15 : y < 80 ? -0.25 : -0.35);
}

function hull(b, l, S) {
  grid(b, l, COLS, ROWS, (x, y) => hullCell(x, y, coat(S)));
  for (const s of [-1, 1]) bloom(l, s * BROW[0], BROW[1], 56, RED, 0.18);
  phosphor(b, l, 0.14, 5);
}

// The patch and the locks of fur lit in one colour (the rage overlays).
const fur = (l, colour) => litCells(l, COLS, ROWS, (x, y) => headAt(x, y) && !muzzleAt(x, y) && headAt(x, y + PX)
  && (patchAt(x, y) || furAt(x, y)), colour);

// An ear (drawn as the left one): from the crown's corner it swings out and hangs down, wide in the
// middle and rounded at the tip. Its spine (in |x|, y) is a curve whose thickness swells and fades.
const SPINE = spine([182, -88], [240, -8], [200, 100], (t) => 48 * Math.sqrt(Math.sin(Math.PI * (0.1 + 0.9 * t ** 1.4))));
function earAt(ax, y) {
  const i = spineAt(SPINE, ax, y);
  return i < 0 ? null : SPINE[i];
}

function ear(b, l, p, S) {
  const c = coat(S);
  const at = (x, y) => earAt(Math.abs(p.dx) - x, p.dy + y);
  grid(b, l, p.w / PX, p.h / PX, (x, y) => {
    const s = at(x, y);
    if (!s) return null;
    if (!at(x, y - PX)) return shade(c, -0.2); // the lit rim
    if (!at(x, y + PX)) return shade(c, -0.72);
    const side = (Math.abs(p.dx) - x - s[0]) / s[2]; // -1 at the edge toward the head, 1 at the far edge
    if (side < -0.55) return shade(c, -0.8); // the inside in shade
    if (side < -0.2) return shade(c, -0.66);
    return shade(c, Math.round(side * 4) % 2 ? -0.5 : -0.44); // strands of hair
  });
  phosphor(b, l, 0.22, 4);
}

// Bitmaps: N the black of the nose, K its nostrils and groove, h its lit highlight, g the gloss
// under it; L lid, Y lit iris, y its lower half, k pupil, g glint; w tooth, D the dark throat, p tongue.
const NOSE = ['.NNNNNNNN.', 'NhhhNNNNNN', 'NhgNNNNNNN', 'NKKNNNNKKN', 'NNKKNNKKNN', '.NNNKKNNN.'];
function nose(b, l) {
  pixels(b, l, NOSE, PX, { N: '#2a1f36', K: '#030105', h: ['#f0e8ff', true], g: '#6a5a88' });
  bloom(l, -30, -14, 24, '#ffffff', 0.22);
  phosphor(b, l, 0.18, 4);
}

// An eye (drawn as the left one): round and staring under a lid that scowls down to the nose, burning.
const EYE = ['LLLLL...', 'LLYYYLL.', 'YYYkkYYL', 'YgkkkkYY', 'YYkkkkYY', '.yyYYyy.'];
const MOUTH = ['.LLLLLLLLLL.', 'LwwwwwwwwwwL', 'LwDwDwwDwDwL', 'LwDDDDDDDDwL', 'LDDDppppDDDL', 'LwDwDppDwDwL', '.LLLLLLLLLL.'];

// The mouth: open and barking, a fang at each corner of the jaw and teeth between, the tongue out
// over a dark throat.
function mouth(b, l, _part, S) {
  const w = S.pal.weak;
  pixels(b, l, MOUTH, PX, { L: LID, w: FANG, D: '#14050e', p: '#b0345e' });
  bloom(l, 0, 0, 38, w, 0.14);
  phosphor(b, l, 0.2, 4);
}

export default {
  pad: 50,
  margin: 40,
  crack: AMBER,
  hull,
  parts: { ear, nose, eye: eyeArt(EYE), mouth },
  rage: [null, (l) => fur(l, AMBER), (l) => fur(l, RED)],
  live: throb(...BROW), // the brows throb, quicker with every phase
};
