// The Giant Fox: the pack's fox grown to fill the sky, in the giants' pixel art (10 px phosphor
// cells): a russet face with white cheek ruffs flaring out to the sides in pointed tufts, a long
// muzzle narrowing to a black nose, lit red brows angled down over round-pupilled eyes, and two tall
// ears, black at the rim and pale inside. The ears and the russet crown between them are its plates;
// the weak points burn: the two eyes and the jaws under the nose, the foxes are spat from. The brows
// throb quicker as the fight heats up, and the tips of the ruff light amber, then red.
import { pixels, phosphor, bloom, PX, RED, AMBER, FANG, grid, litCells, eyeArt, throb, outlineWidth } from './kit.js';
import { shade } from '../sprites.js';

const coat = (S) => S.look.palette.alien.fox;
const COLS = 48;
const ROWS = 30; // the head runs from y -122 to 146; the ears' tips, at -150, are the parts'
const BROW = [92, -60]; // the brows' glow, which throbs in live()
const BROW_RED = '#9a0f1e'; // deep, so that lit on the russet coat it stays crimson
const BLACK = '#160e22'; // the black of the nose and the lips
const BELOW_EYES = 8; // where the white of the cheeks begins
const CHEEK = FANG;

// The head's half-width at each height, from the crown down to the chin: the temples, then three
// tufts of the ruff (each rising to a tip and dropping back), then the muzzle narrowing away.
const OUTLINE = [[-122, 40], [-112, 84], [-94, 110], [-70, 134], [-40, 152], [-10, 164], [5, 168], [15, 182], [25, 204], [35, 226], [45, 150], [55, 168], [65, 190], [75, 110], [85, 130], [95, 56], [110, 50], [130, 40], [146, 30]];
const halfWidth = outlineWidth(OUTLINE);

const headAt = (x, y) => Math.abs(x) <= halfWidth(y);
// The russet bridge narrows down from the eyes to the nose; the cheeks either side of it are white.
const bridge = (y) => Math.max(14, 50 - (y - BELOW_EYES) * 0.45);
const cheekAt = (x, y) => y > BELOW_EYES && Math.abs(x) > bridge(y);
const lockAt = (x, y) => Math.floor((Math.abs(x) - y) / 20) % 2 === 0; // the ruff's locks of fur, running down and out
const NOSE = [29, 39, 29, 9]; // the black nose's half-width, a row at a time from y 40, and the line down to the lip
const noseAt = (x, y) => Math.abs(x) <= (NOSE[Math.floor((y - 40) / PX)] ?? -1);
const browAt = (x, y) => {
  const ax = Math.abs(x);
  const at = -76 + (134 - ax) * 0.3; // high at the outer end, low over the inner corner
  return ax > 36 && ax < 134 && y > at - 14 && y <= at + 8;
};

function hullCell(x, y, c) {
  if (!headAt(x, y)) return null;
  if (browAt(x, y)) return [BROW_RED, true];
  if (noseAt(x, y)) return !noseAt(x, y - PX) && x <= -PX * 2 ? '#8a8aa8' : BLACK; // a glint along its top edge, left of the middle
  const ax = Math.abs(x);
  if (!headAt(x, y - PX)) return cheekAt(x, y) ? shade(CHEEK, -0.04) : shade(c, 0.2); // the moonlit rim
  if (!headAt(x, y + PX)) return cheekAt(x, y) ? shade(CHEEK, -0.5) : '#120610';
  if (cheekAt(x, y)) return shade(CHEEK, !headAt(x - PX, y) || !headAt(x + PX, y) ? -0.3 : lockAt(x, y) ? -0.22 : -0.06);
  if (y > BELOW_EYES && ax <= bridge(y) + PX) return shade(c, -0.4); // the fur's edge, where the cheeks meet the bridge
  return shade(c, ax < 16 ? 0.14 : ax < 44 ? -0.02 : -0.16);
}

function hull(b, l, S) {
  grid(b, l, COLS, ROWS, (x, y) => hullCell(x, y, coat(S)));
  for (const s of [-1, 1]) bloom(l, s * BROW[0], BROW[1], 56, RED, 0.18);
  phosphor(b, l, 0.16, 5);
}

// The tips of the ruff lit in one colour (the rage overlays): the white cells with no head to their
// outer side.
const ruff = (l, colour) => litCells(l, COLS, ROWS, (x, y) => headAt(x, y) && cheekAt(x, y) && !headAt(x + Math.sign(x) * PX, y), colour);

// Bitmaps: K the black of the rim and tip (a dark violet, so that it shows on the night), w the pale
// inside, X the russet of the root.
// An ear (drawn as the left one): a tall leaf leaning out, black at the rim and pale inside.
const EAR = ['KK....', 'KKK...', 'KKKK..', 'KKKK..', 'KKwKK.', 'KwwwK.', 'KwwwKK', 'KwwwwK', 'KwwwwK', 'KXwwXK', 'XXXXXX'];
function ear(b, l, _part, S) {
  pixels(b, l, EAR, PX, { K: '#2a1a38', w: shade(CHEEK, -0.12), X: shade(coat(S), -0.1) });
  phosphor(b, l, 0.22, 4);
}

// The crown: the russet between the ears, domed on top and dipping to a point over the nose, in
// streaks of fur running down to it.
function crown(b, l, p, S) {
  const c = coat(S);
  const top = (x) => -30 + (x / 70) ** 2 * 14;
  const bottom = (x) => 30 - Math.abs(x) * 0.5;
  const at = (x, y) => y >= top(x) && y <= bottom(x);
  grid(b, l, p.w / PX, p.h / PX, (x, y) => {
    if (!at(x, y)) return null;
    if (!at(x, y - PX)) return shade(c, 0.34);
    if (!at(x, y + PX)) return shade(c, -0.56);
    return Math.floor((Math.abs(x) + y * 0.3) / 10) % 3 === 0 ? shade(c, -0.3) : shade(c, 0.04);
  });
  phosphor(b, l, 0.22, 4);
}

// An eye (drawn as the left one): a slanted lid over a round pupil, the iris burning round it.
const EYE = ['LLLL....', 'YYLLLL..', 'YYkkYLL.', 'YgkkYYYL', '.YYYYYY.', '..yyyy..'];

// Bitmaps: C the cream of the muzzle and chin, K the black lips, w fang, D the dark throat, r a lit
// red tongue.
// The jaws under the nose: black lips, the upper fangs, the mouth open on a dark throat, the lower teeth.
const MOUTH = ['.KKKKKKKKK.', 'KwKDDDDDKwK', 'KwDDDDDDDwK', 'KKDDDrDDDKK', '.KwDDDDDwK.', '.CKwKKKwKC.', '..CCCCCCC..'];
function mouth(b, l, _part, S) {
  const w = S.pal.weak;
  pixels(b, l, MOUTH, PX, { C: shade(CHEEK, -0.06), K: BLACK, w: FANG, D: '#14050e', r: ['#d02a1a', true] });
  bloom(l, 0, 6, 44, w, 0.2);
  phosphor(b, l, 0.2, 4);
}

export default {
  pad: 50,
  margin: 40,
  crack: AMBER,
  hull,
  parts: { ear, crown, eye: eyeArt(EYE), mouth },
  rage: [null, (l) => ruff(l, AMBER), (l) => ruff(l, RED)],
  live: throb(...BROW), // the brows throb, quicker with every phase
};
