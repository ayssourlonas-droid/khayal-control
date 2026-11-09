// The Giant Mouse: a grey mouse head grown to fill the sky, in the giant cat's pixel art (10 px
// phosphor cells), so it reads as one of the pack grown huge. A round head with puffed cheeks under
// lit red brows; a great round ear at each side, pink inside; the snout plate with its pink nose;
// the weak points burn underneath: two beady eyes and the buck-toothed mouth the mice pour out of.
// The brows throb quicker as the fight heats up, and the whiskers light amber, then red.
import { pixels, phosphor, bloom, PX, RED, AMBER, PINK, FANG, LID, grid, inside, whiskers, throb, eyeArt } from './kit.js';
import { shade } from '../sprites.js';

const fur = (S) => S.look.palette.alien.mouse;

// The hull, in boss coordinates: the round head, the cheeks, the V of each brow, the whisker pads
// either side of the snout, and the chin under the mouth.
const headAt = (x, y) => inside(x, y, 0, 0, 196, 100) || inside(Math.abs(x), y, 140, 46, 76, 56) || inside(x, y, 0, 96, 84, 46);
const browAt = (x, y) => {
  const ax = Math.abs(x);
  const at = -54 + (150 - ax) * 0.3; // high at the outer end, low over the inner corner
  return ax > 44 && ax < 150 && y > at - 12 && y <= at + 4;
};
const padAt = (x, y) => inside(Math.abs(x), y, 78, 66, 46, 30);

function hullCell(x, y, c) {
  if (!headAt(x, y)) return null;
  if (browAt(x, y)) return [RED, true];
  if (!headAt(x, y - PX)) return shade(c, 0.35); // the moonlit rim of the fur
  if (!headAt(x, y + PX)) return '#120610';
  if (padAt(x, y)) return shade(c, 0.22);
  return y < -30 ? shade(c, -0.05) : y < 50 ? shade(c, -0.18) : shade(c, -0.3);
}

// Whiskers fanning out from the pads past the cheeks (from x 96).
const WHISKERS = [[58, 330, 30], [68, 340, 74], [78, 320, 118]];

function hull(b, l, S) {
  grid(b, l, 42, 26, (x, y) => hullCell(x, y, fur(S)));
  for (const s of [-1, 1]) bloom(l, s * 96, -26, 64, RED, 0.25);
  whiskers(l, 96, WHISKERS, '#ffffff', 0.45, 2);
  phosphor(b, l, 0.16, 5);
}

// An ear (drawn as the left one): a great round disc, rimmed in fur, pink inside and lit at its heart.
function ear(b, l, _part, S) {
  const c = fur(S);
  const at = (x, y) => inside(x, y, 0, 0, 76, 66);
  grid(b, l, 17, 15, (x, y) => {
    if (!at(x, y)) return null;
    if (inside(x, y, 6, 6, 48, 42)) return inside(x, y, 6, 6, 26, 22) ? [PINK, true] : '#b83a6a';
    if (!at(x, y - PX)) return shade(c, 0.4);
    if (!at(x, y + PX)) return shade(c, -0.5);
    return y > 20 ? shade(c, -0.2) : c;
  });
  phosphor(b, l, 0.22, 4);
}

// The snout plate: an armoured bridge between the eyes, tapering to a big pink nose.
function snout(b, l, _part, S) {
  const c = fur(S);
  const at = (x, y) => Math.abs(x) <= 54 - (y + 30) * 0.35 && y >= -30 && y <= 30;
  grid(b, l, 11, 7, (x, y) => {
    if (inside(x, y, 0, 18, 26, 14)) return y < 14 ? ['#ffb0c8', true] : [PINK, true];
    if (!at(x, y)) return null;
    if (!at(x, y - PX)) return shade(c, 0.4);
    if (!at(x, y + PX)) return shade(c, -0.5);
    return shade(c, -0.1);
  });
  phosphor(b, l, 0.2, 4);
}

// Bitmaps: L lid, Y lit iris, y its lower half, k pupil, g glint, w tooth, R the lit red of an open
// mouth, G its burning throat, p tongue.
// An eye (drawn as the left one): round and beady under a heavy scowling lid, burning.
const EYE = ['LLLL.....', 'YYYLLLL..', 'YYYYYYYL.', 'YgYkkYYYL', 'YYkkkkYYY', '.yYkkYYy.', '..yyyyy..'];
const MOUTH = ['LLLLLLLLL', 'LRwwLwwRL', 'LRwwLwwRL', 'LGwwLwwGL', 'LGGGGGGGL', '.LGpppGL.', '..LLLLL..'];

// The mouth: two great buck teeth over a burning throat.
function mouth(b, l, _part, S) {
  const w = S.pal.weak;
  pixels(b, l, MOUTH, PX, { L: LID, w: FANG, R: ['#b0301a', true], G: [w, true], p: [PINK, true] });
  bloom(l, 0, 10, 50, w, 0.4);
  phosphor(b, l, 0.25, 4);
}

export default {
  pad: 50,
  margin: 40,
  crack: AMBER,
  hull,
  parts: { ear, snout, eye: eyeArt(EYE), mouth },
  rage: [null, (l) => whiskers(l, 96, WHISKERS, AMBER, 0.9, 3), (l) => whiskers(l, 96, WHISKERS, RED, 1, 4)],
  live: throb(96, -26), // the brows throb, quicker with every phase
};
