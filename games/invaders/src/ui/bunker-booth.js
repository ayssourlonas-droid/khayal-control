// Ember Carnival's bunker skin (bunker-skins.js, 'booth'): a fairground stall. A rail of bulbs across the top,
// each a gold glass in a dark socket, a gold trim under it, then the stall's boards painted in stripes of red
// and cream, ten px wide, a dark joint between each pair and a nail in each, the wood grain showing through;
// a scalloped valance hangs from the trim with its stripes reversed; at the foot a counter, a gold edge over
// a dark panel studded with cream rivets. Pure per-pixel, like every skin: skin(x, y, w, h, P) -> [rgb, k].
import { hash2 } from './sprites.js';

const grain = (x, y, a) => (hash2(x >> 1, y >> 1) - 0.5) * a;
const BOARD = 10; // px: one board's width, and one bulb's pitch
const RAIL = 9; // px: the rail of bulbs
const TRIM = 12; // px: the top of the boards
const SCALLOP = 5.4; // px: the valance's scallop radius

function rail(x, y, P) {
  const d = Math.hypot((x % BOARD) - (BOARD - 1) / 2, y - 5);
  if (d < 1.6) return [P.light, 0.6]; // the hot heart of the glass
  if (d < 3.2) return [P.accent, 0.35 - d * 0.06]; // the glass
  if (d < 4.2) return [P.dark, 0];
  return [P.dark, -0.08 + grain(x, y, 0.1)];
}

function counter(x, y, h, P) {
  const r = y - (h - 12);
  if (r < 2) return [P.accent, 0.12 - r * 0.1]; // the gold edge
  if (r < 4) return [P.dark, 0];
  if (r === 6 && x % 10 === 5) return [P.light, 0.3]; // a rivet
  return [P.dark, -0.1 + grain(x, y, 0.12)];
}

export function booth(x, y, w, h, P) {
  if (y < RAIL) return rail(x, y, P);
  if (y < TRIM) return [P.accent, 0.18 - (y - RAIL) * 0.12 + grain(x, y, 0.08)];
  if (y >= h - 12) return counter(x, y, h, P);
  const [board, rx] = [Math.floor(x / BOARD), x % BOARD];
  if (rx === 0) return [P.dark, 0]; // the joint between boards
  const red = board % 2 === 0;
  const k = 0.22 - 0.5 * ((y - TRIM) / (h - TRIM)) + grain(x, y, 0.16) + (rx === 1 ? 0.12 : rx === BOARD - 1 ? -0.14 : 0);
  const dc = Math.hypot(rx - BOARD / 2, y - TRIM);
  if (y >= TRIM && dc < SCALLOP + 0.9 && dc > SCALLOP - 0.1) return [P.dark, 0.1]; // the valance's edge
  if (dc < SCALLOP) return [red ? P.light : P.fill, k + 0.14]; // the scallop, in the board's other colour
  if (rx === 5 && (y - TRIM) % 12 === 9) return [P.dark, 0.32]; // a nail
  if ((y + board * 3) % 14 === 7) return [P.dark, 0.18]; // a seam in the plank
  return [red ? P.fill : P.light, red ? k : k - 0.1];
}
