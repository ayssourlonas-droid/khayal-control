// The Giant Cow: the pack's cow grown to fill the sky, in the giants' pixel art (10 px phosphor
// cells), a white-hided bull-headed face as the small cow's: a broad forehead tapering to a pink
// muzzle that fills the lower third, two dark patches on the hide, ears out under the horns and lit
// red brows; a curved horn at each side and the curl of hair between them are its plates; the weak
// points burn: two staring eyes and the wide mouth under the muzzle the cows are spat from. The brows
// throb quicker as the fight heats up, a glint runs round the nose ring, and the patches light amber,
// then red.
import { pixels, phosphor, bloom, PX, RED, AMBER, PINK, FANG, LID, grid, inside, litCells, eyeArt, throb, spine, spineAt } from './kit.js';
import { shade, glow } from '../sprites.js';

const hide = (S) => S.look.palette.alien.cow;
const HORN = '#e6d3a3';
const FLESH = '#ffb0c4';
const COLS = 54;
const ROWS = 30;
const BROW = [92, -69]; // the brows' glow, which throbs in live()
const BROW_RED = '#b50f1f'; // deep, so that lit on white hide it stays red and does not wash to pink
const RING = [0, 50]; // the nose ring's centre, lit in the hull, and its radius
const RING_R = 23;

// The hull, in boss coordinates: the broad forehead over a narrower jaw, the muzzle in the lower
// third, an ear out at each side under the horn, the V of each brow, two patches and the nose ring.
const headAt = (x, y) => (Math.abs(x) / 172) ** 3 + (Math.abs(y + 30) / 100) ** 3 <= 1 || inside(x, y, 0, 50, 118, 94);
const muzzleAt = (x, y) => inside(x, y, 0, 74, 100, 66);
const nostrilAt = (x, y) => inside(Math.abs(x), y, 38, 30, 17, 11); // 3 x 2 cells each, either side of the ring's top
const ringAt = (x, y) => Math.abs(Math.hypot(x - RING[0], y - RING[1]) - RING_R) <= 5;
const browAt = (x, y) => {
  const ax = Math.abs(x);
  const at = -90 + (142 - ax) * 0.42; // high at the outer end, low over the inner corner
  return ax > 36 && ax < 142 && y > at - 14 && y <= at + 6;
};
const patchAt = (x, y) => inside(x, y, -104, -18, 58, 44) || inside(x, y, -128, -56, 30, 24)
  || inside(x, y, 112, 34, 34, 30) || inside(x, y, 96, 56, 26, 22);
// An ear: a leaf pointing out and down, with its pink inside.
const leaf = (x, y, rx, ry) => {
  const dx = Math.abs(x) - 205;
  const dy = y - 2;
  return ((dx * 0.98 + dy * 0.2) / rx) ** 2 + ((dy * 0.98 - dx * 0.2) / ry) ** 2 <= 1;
};
const earAt = (x, y) => leaf(x, y, 62, 26);

function hullCell(x, y, c) {
  if (browAt(x, y) && headAt(x, y)) return [BROW_RED, true];
  if (earAt(x, y) && !headAt(x, y)) return leaf(x, y, 44, 15) ? shade(FLESH, -0.15) : shade(c, -0.3);
  if (!headAt(x, y)) return null;
  if (ringAt(x, y)) return [AMBER, true];
  if (nostrilAt(x, y)) return y < 30 ? '#6a2442' : '#3e1230'; // deep pink-brown, darker below
  if (!headAt(x, y - PX)) return '#ffffff'; // the moonlit crown
  if (!headAt(x, y + PX)) return '#120610';
  if (muzzleAt(x, y)) return !muzzleAt(x, y + PX) ? shade(FLESH, -0.4) : shade(FLESH, y < 40 ? 0.15 : -0.1);
  if (patchAt(x, y)) return '#2a1a34';
  return shade(c, y < -40 ? -0.1 : -0.2);
}

function hull(b, l, S) {
  grid(b, l, COLS, ROWS, (x, y) => hullCell(x, y, hide(S)));
  for (const s of [-1, 1]) bloom(l, s * BROW[0], BROW[1], 50, RED, 0.18);
  phosphor(b, l, 0.16, 5);
}

// The patches lit in one colour (the rage overlays).
const patches = (l, colour) => litCells(l, COLS, ROWS, (x, y) => headAt(x, y) && patchAt(x, y) && !muzzleAt(x, y), colour);

// A horn (drawn as the left one): its spine runs from the cheek out, up and in to a tip, a curve
// (SPINE) that is 28 thick at the cheek and 6 at the tip, thick for long. hornAt(x, y) is how far
// along it (0 to 1) a cell sits, or -1 off the horn.
const SPINE = spine([72, 28], [-108, 58], [-44, -62], (t) => 6 + 22 * (1 - t) ** 0.6);
const RIDGES = [0.07, 0.15, 0.23];
function hornAt(x, y) {
  const i = spineAt(SPINE, x, y);
  return i < 0 ? -1 : i / (SPINE.length - 1);
}

// Out from the cheek, up and round to a dark tip: a smooth light-to-dark curve, a ring ridge or
// three near the cheek only.
function horn(b, l) {
  grid(b, l, 15, 14, (x, y) => {
    const t = hornAt(x, y);
    if (t < 0) return null;
    if (hornAt(x, y - PX) < 0) return shade(HORN, 0.45 - t * 0.5); // the lit rim, fading to the tip
    if (hornAt(x, y + PX) < 0) return shade(HORN, -0.55);
    if (RIDGES.some((r) => Math.abs(t - r) < 0.025)) return shade(HORN, -0.3 - t);
    return shade(HORN, Math.max(0.2 - Math.round(t * 10) * 0.075, -0.8)); // eleven even steps, darkest at the tip
  });
  phosphor(b, l, 0.22, 4);
}

// Bitmaps: T the lit tip of a lock of hair, H hair, h its shadowed root, D a darker strand.
// The curl: a shaggy forelock of tan hair between the horns, taller than it is wide, ragged at the top.
const FORELOCK = ['..TT...', '.THHT.T', 'THHDHTH', 'THDHHDH', 'HHDHHDH', 'hHDHDHh', '.hHDHh.', '..hDh..'];
const HAIR = '#d8a868';
function curl(b, l) {
  pixels(b, l, FORELOCK, PX, { T: shade(HAIR, 0.5), H: HAIR, h: shade(HAIR, -0.2), D: shade(HAIR, -0.55) });
  phosphor(b, l, 0.22, 4);
}

// L lid, Y lit iris, y its lower half, k the cow's flat pupil, g glint; w tooth, R the lit
// red of the open mouth, G its burning throat, p tongue.
// An eye (drawn as the left one): staring, the pupil a wide bar, burning.
const EYE = ['LLLLLLL.', 'LLYYYYLL', 'YkkkkkkY', 'YgkkkkkY', 'YYkkkkYY', '.yyYYyy.'];
const MOUTH = ['.LLLLLLLLLL.', 'LRwwLwwLwwRL', 'LRGGGGGGGGRL', 'LGGGGGGGGGGL', 'LGGppppppGGL', '.LLLLLLLLLL.'];

// The mouth: wide and open under the muzzle, blunt teeth along the top, the throat burning.
function mouth(b, l, _part, S) {
  const w = S.pal.weak;
  pixels(b, l, MOUTH, PX, { L: LID, w: FANG, R: ['#b0301a', true], G: [w, true], p: [PINK, true] });
  bloom(l, 0, 6, 62, w, 0.4);
  phosphor(b, l, 0.25, 4);
}

// The brows throb as the other giants'; a glint runs round the nose ring, swinging side to side.
const brows = throb(...BROW);
function live(ctx, b, t) {
  brows(ctx, b, t);
  const a = 1.2 * Math.sin(t * 2.4);
  ctx.globalAlpha = 0.7;
  ctx.drawImage(glow(AMBER), RING[0] + RING_R * Math.sin(a) - 26, RING[1] + RING_R * Math.cos(a) - 26, 52, 52);
  ctx.globalAlpha = 1;
}

export default {
  pad: 50,
  margin: 40,
  crack: AMBER,
  hull,
  parts: { horn, curl, eye: eyeArt(EYE), mouth },
  rage: [null, (l) => patches(l, AMBER), (l) => patches(l, RED)],
  live,
};
