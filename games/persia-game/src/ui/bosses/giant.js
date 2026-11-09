// The Giant: an angry cat head the size of the sky, in the animals' own pixel art at boss scale
// (10 px phosphor cells, twice theirs), so it reads as one of the pack grown huge. A plum head with
// tabby cheeks and a pink nose; the brow plate carries the ears and the tabby M; a striped paw
// reaches out at each side, claws bared; the weak points burn underneath: two slit eyes and the
// snarling mouth. Lit red brows throb over the eyes, quicker as the fight heats up, and the whiskers
// and stripes light amber, then red.
import { pixels, phosphor, bloom, PX, RED, AMBER, PINK, FANG, LID, grid, inside, litCells, whiskers, throb, eyeArt } from './kit.js';
import { shade } from '../sprites.js';

const side = (px, py, ax, ay, bx, by) => (px - bx) * (ay - by) - (ax - bx) * (py - by);
function inTri(x, y, [a, b, c]) {
  const d = [side(x, y, ...a, ...b), side(x, y, ...b, ...c), side(x, y, ...c, ...a)];
  return !(d.some((v) => v < 0) && d.some((v) => v > 0));
}

// The hull, in boss coordinates: the head, puffed cheeks, the V of each brow, the nose, the
// whisker pads either side of the mouth, three tabby stripes down each cheek.
const headAt = (x, y) => inside(x, y, 0, 18, 205, 102) || inside(Math.abs(x), y, 178, 78, 62, 40);
const browAt = (x, y) => {
  const ax = Math.abs(x);
  const at = -12 + (180 - ax) * 0.24; // high at the outer end, low over the inner corner
  return ax > 62 && ax < 182 && y > at - 12 && y <= at + 4;
};
const noseAt = (x, y) => inTri(x, y, [[-22, 14], [22, 14], [0, 36]]);
const padAt = (x, y) => inside(Math.abs(x), y, 52, 82, 50, 30);
const stripeAt = (x, y) => Math.abs(x) > 158 && y > 46 && Math.floor((Math.abs(x) * 0.7 + y) / 22) % 2 === 0;

function hullCell(x, y, pal) {
  if (!headAt(x, y)) return null;
  if (browAt(x, y)) return [RED, true];
  if (noseAt(x, y)) return y < 22 ? '#ffb0c8' : '#ff7aa8';
  if (!headAt(x, y - PX)) return shade(pal.plate, -0.3); // the moonlit rim of the fur
  if (!headAt(x, y + PX)) return '#120610';
  if (stripeAt(x, y)) return shade(pal.plate, -0.4);
  if (padAt(x, y)) return shade(pal.hull, 0.32);
  return y < 0 ? shade(pal.hull, 0.18) : y < 60 ? pal.hull : shade(pal.hull, -0.12);
}

const COLS = 48;
const ROWS = 26;

// Whiskers fanning out over the paws' shadow (from x 128).
const WHISKERS = [[88, 320, 70], [98, 326, 102], [108, 308, 132]];

// Every stripe cell lit in one colour (the rage overlays).
const stripes = (l, colour) => litCells(l, COLS, ROWS, (x, y) => headAt(x, y) && stripeAt(x, y) && headAt(x, y + PX), colour);

function hull(b, l, S) {
  grid(b, l, COLS, ROWS, (x, y) => hullCell(x, y, S.pal));
  for (const s of [-1, 1]) bloom(l, s * 122, 4, 70, RED, 0.25);
  whiskers(l, 128, WHISKERS, '#ffffff', 0.45, 2);
  phosphor(b, l, 0.16, 5);
}

// The brow plate: an armoured crown in a scowl, domed on top and dipping to a point over the nose,
// with the tabby M; an ear at each end, pink inside, its tip just clear of the HUD at rest.
const EAR = [[60, -20], [176, -20], [158, -84]];
const INNER_EAR = [[92, -28], [160, -28], [150, -70]];
const M = [[0, 56], [-30, 40], [30, 40], [-60, 26], [60, 26], [-90, 14], [90, 14]]; // x, length down
function brow(b, l, _part, S) {
  const p = S.pal.plate;
  const top = (x) => -40 + (x / 130) ** 2 * 30;
  const plateAt = (x, y) => Math.abs(x) <= 130 && y >= top(x) && y <= 40 - Math.abs(x) * 0.28;
  const at = (x, y) => plateAt(x, y) || inTri(Math.abs(x), y, EAR);
  grid(b, l, 37, 20, (x, y) => {
    if (!at(x, y)) return null;
    if (inTri(Math.abs(x), y, INNER_EAR)) return y < -56 ? [PINK, true] : '#b83a6a';
    if (!at(x, y - PX)) return shade(p, 0.4);
    if (!at(x, y + PX)) return shade(p, -0.5);
    if (plateAt(x, y) && M.some(([sx, len]) => Math.abs(x - sx) < PX / 2 && y < top(x) + len)) return shade(p, -0.55);
    return y > 10 ? shade(p, -0.2) : p;
  });
  phosphor(b, l, 0.22, 4);
}

// A paw (drawn as the left one), reaching out from under the cheek: a striped forearm, the paw,
// three toes with pink beans, and claws out.
const TOES = [-20, 0, 20];
function paw(b, l, _part, S) {
  const p = S.pal.plate;
  const toeAt = (x, y) => TOES.some((ty) => inside(x, y, -78, ty, 13, 9));
  const armAt = (x, y) => x > -40 && x < 82 && Math.abs(y + 2) <= 24 - Math.max(0, x - 30) * 0.25;
  const at = (x, y) => armAt(x, y) || inside(x, y, -40, 0, 40, 34) || toeAt(x, y);
  grid(b, l, 21, 9, (x, y) => {
    if (x === -100 && TOES.includes(y)) return FANG;
    if (!at(x, y)) return null;
    if (toeAt(x, y) && x === -80) return '#ff9ab8';
    if (!at(x, y - PX)) return shade(p, 0.4);
    if (!at(x, y + PX)) return shade(p, -0.5);
    if (x > -10 && Math.floor((x + 10) / 20) % 2 === 1) return shade(p, -0.45);
    return y > 10 ? shade(p, -0.2) : p;
  });
  phosphor(b, l, 0.2, 4);
}

// Bitmaps: L lid and lip, Y lit iris, y its lower half, k slit pupil, g glint, w fang, R the lit
// red of an open mouth, G its burning throat, p tongue.
// An eye (drawn as the left one): slanted angry under a heavy lid, burning round a slit pupil.
const EYE = ['LL.......', 'YYLLL....', 'YYYYkLLL.', 'YgYYkYYYL', '.yYYkYYy.', '..yykyy..'];
const MOUTH = ['.LLL.LLL.', 'LwRRLRRwL', 'LwRRRRRwL', 'LRRGGGRRL', 'LRwGGGwRL', '.LRpppRL.', '..LLLLL..'];

// The mouth: wide open in a snarl under a cat's split lip, four fangs, burning in the throat.
function mouth(b, l, _part, S) {
  const w = S.pal.weak;
  pixels(b, l, MOUTH, PX, { L: LID, w: FANG, R: ['#b0301a', true], G: [w, true], p: [PINK, true] });
  bloom(l, 0, 6, 50, w, 0.4);
  phosphor(b, l, 0.25, 4);
}

export default {
  pad: 50,
  margin: 40,
  margins: { brow: 64 }, // the ears stand above the plate
  crack: AMBER,
  hull,
  parts: { brow, paw, eye: eyeArt(EYE), mouth },
  rage: [
    null,
    (l) => {
      whiskers(l, 128, WHISKERS, AMBER, 0.9, 3);
      stripes(l, AMBER);
    },
    (l) => {
      whiskers(l, 128, WHISKERS, RED, 1, 4);
      stripes(l, RED);
    },
  ],
  live: throb(122, 4), // the brows throb, quicker with every phase
};
