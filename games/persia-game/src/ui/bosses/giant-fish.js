// The Giant Fish: the pack's fish grown to fill the sky, in the giants' pixel art (10 px phosphor
// cells): a scaled face, wide at the eyes and tapering to its puckered lips, dark on the back and
// pale below, gill arcs at its cheeks and lit red brows; a ribbed crest of fin on top and a
// pectoral fin fanned out at each side; the weak points burn underneath: two round eyes and the
// pink pouting mouth the fish are spat from. The brows throb quicker as the fight heats up, and the
// gills light amber, then red.
import { pixels, phosphor, bloom, PX, RED, AMBER, PINK, grid, inside, litCells, throb, eyeArt, fan } from './kit.js';
import { shade } from '../sprites.js';

const scale = (S) => S.look.palette.alien.fish;
const COLS = 46;
const ROWS = 28;

// The hull, in boss coordinates: the face (an oval over a taper to the lips), the V of each brow,
// the gill arcs, and a row of scales on the back.
const headAt = (x, y) => inside(x, y, 0, -16, 224, 100) || (y > 0 && y < 128 && Math.abs(x) < 190 - y * 0.95);
const browAt = (x, y) => {
  const ax = Math.abs(x);
  const at = -70 + (170 - ax) * 0.28; // high at the outer end, low over the inner corner
  return ax > 56 && ax < 170 && y > at - 12 && y <= at + 4;
};
const gillAt = (x, y) => {
  const d = Math.hypot(Math.abs(x) - 110, y + 4);
  return y > -60 && y < 70 && (Math.abs(d - 74) < 6 || Math.abs(d - 96) < 6) && Math.abs(x) > 150;
};
// One scale is a 4 x 3 cell cup; the rows sit offset by half a scale.
function scaleEdge(x, y) {
  const v = Math.floor((y + 300) / 30);
  const u = Math.floor((x + 400 + (v % 2) * 20) / 10) % 4;
  const w = Math.floor((y + 300) / 10) % 3;
  return (w === 2 && (u === 1 || u === 2)) || (w === 1 && (u === 0 || u === 3));
}

function hullCell(x, y, c) {
  if (!headAt(x, y)) return null;
  if (browAt(x, y)) return [RED, true];
  if (!headAt(x, y - PX)) return shade(c, 0.35); // the moonlit rim of the scales
  if (!headAt(x, y + PX)) return '#120610';
  if (gillAt(x, y)) return shade(c, -0.6);
  if (y < 0) return shade(c, scaleEdge(x, y) ? -0.5 : -0.3); // the scaled back
  return shade(c, y < 60 ? -0.1 : 0.12); // the pale belly
}

function hull(b, l, S) {
  grid(b, l, COLS, ROWS, (x, y) => hullCell(x, y, scale(S)));
  for (const s of [-1, 1]) bloom(l, s * 110, -48, 64, RED, 0.25);
  phosphor(b, l, 0.16, 5);
}

// Every gill cell lit in one colour (the rage overlays).
const gills = (l, colour) => litCells(l, COLS, ROWS, (x, y) => headAt(x, y) && gillAt(x, y), colour);

// A pectoral fin (drawn as the left one): fanned out from its root at the cheek.
function fin(b, l, _part, S) {
  fan(b, l, 15, 14, [66, -6], [0.12, 0.72], (a) => 124 - 10 * Math.abs(Math.sin(a * 6.5)), scale(S));
}

// The crest: the dorsal fin, fanned up from the top of the head.
function crest(b, l, _part, S) {
  fan(b, l, 23, 10, [0, 35], [-Math.PI / 2, 1.1], (a) => 84 - 12 * Math.abs(Math.sin(a * 6)), scale(S));
}

// Bitmaps: L lid, Y lit iris, y its lower half, k pupil, g glint, P lit pink lip, p its shadow,
// R the lit red of the open mouth, G its burning throat.
// An eye (drawn as the left one): round and staring under a heavy scowling lid, burning.
const EYE = ['LLLLL...', 'LLYYYLL.', '.YYkkYYL', 'YgkkkkYY', 'YYkkkkYY', '.yYkkYy.'];
const MOUTH = ['...pppppp...', '.ppPPPPPPpp.', 'pPPRRRRRRPPp', 'pPRGGGGGGRPp', 'pPPRRRRRRPPp', '.ppPPPPPPpp.', '...pppppp...'];

// The mouth: puckered pink lips round a burning throat, as the pack's fish pout.
function mouth(b, l, _part, S) {
  const w = S.pal.weak;
  pixels(b, l, MOUTH, PX, { P: [PINK, true], p: '#b83a6a', R: ['#b0301a', true], G: [w, true] });
  bloom(l, 0, 0, 56, w, 0.4);
  phosphor(b, l, 0.25, 4);
}

export default {
  pad: 50,
  margin: 40,
  crack: AMBER,
  hull,
  parts: { crest, fin, eye: eyeArt(EYE), mouth },
  rage: [null, (l) => gills(l, AMBER), (l) => gills(l, RED)],
  live: throb(110, -48), // the brows throb, quicker with every phase
};
