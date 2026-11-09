// One older block of World 17's mid layer, drawn from its plan entry b = { x, w, top, roof, wall, brick, seed, stacks, aerial, dish,
// vents, panel, esc, pipe, tall, arch }: a wall of brick (laid course by course) or render with a grain, the silhouette of its roof type
// (parallax-smog-mid-roof.js), rows of sash windows (parallax-smog-mid-window.js; some dark, some boarded, a few lit), a
// cornice, a drainpipe, an iron fire escape, chimney stacks, cowl vents and an aerial on the roof, streaks of soot under the
// sills (the palette's `soot`: nearly nothing in the morning), and now and then a blank painted panel on the wall. Every random
// choice comes from the block's own rng, drawn the same way in every mode, so the smog and the clean pass draw one block; only
// P's colours differ. The foot of the block lies in shadow over its windows too, so the player's zone behind it stays calm.
// `bays(b)` gives the window places and `escapeAt(b)` the fire escape's (also for the 'over' pass).
import { FLOOR, seeded, hash, box, fade, speckle, bricks, wallLight, streaks, lamp } from './parallax-smog-kit.js';
import { rgba } from './sprites.js';
import { outline, roofY, dress, stack, aerial, dish, vent } from './parallax-smog-mid-roof.js';
import { sash, GLASS, BLIND, BROKEN, BOARDED } from './parallax-smog-mid-window.js';
import { escape, drainpipe } from './parallax-smog-mid-escape.js';

export const WIN = { w: 15, h: 24, tall: 30, pitch: 46, gap: 34 }; // a window (a tall block's is `tall`), the rows' pitch and the columns' pitch

// The windows of a block: [{ x, y, row, col, cols }] top-left corners, rows from the roof down to the street.
export function bays(b) {
  const cols = Math.max(2, Math.floor((b.w - 14) / WIN.gap));
  const sp = (b.w - 20) / cols;
  const out = [];
  const h = b.tall ? WIN.tall : WIN.h;
  for (let row = 0, y = b.top + 18; y + h < FLOOR - 14; row++, y += WIN.pitch) {
    for (let col = 0; col < cols; col++) out.push({ x: b.x + 10 + sp * (col + 0.5) - WIN.w / 2, y, h, row, col, cols });
  }
  return out;
}

// Where a block's fire escape stands: { x, w, y0 (its first deck), floors }.
export function escapeAt(b) {
  const list = bays(b);
  const w = b.esc * WIN.gap - 4;
  return { x: b.x + b.w - 12 - w, w, y0: list[0].y + list[0].h + 3, floors: Math.max(2, list[list.length - 1].row) };
}

export const wallColor = (P, b) => (b.brick ? P.brickWalls[b.wall % P.brickWalls.length] : P.walls[b.wall % P.walls.length]);

// A blank painted panel on a wall, in a frame: nothing on it but two quiet bands (the faded ground of an old sign, with no letters).
function wallPanel(g, P, x, y, w, h) {
  box(g, P.iron, x - 2, y - 2, w + 4, h + 4, 0.9);
  box(g, P.panel, x, y, w, h);
  box(g, P.panelB, x, y + h * 0.3, w, h * 0.16, 0.3);
  box(g, P.panelB, x, y + h * 0.62, w, h * 0.08, 0.22);
  fade(g, x, y, w, h, [[0, rgba(P.soot, P.sootA * 0.5)], [1, rgba(P.soot, 0)]]);
  box(g, P.edge, x + w - 1, y, 1, h, P.edgeA * 0.6);
}

function windows(g, P, b, out, r) {
  const list = bays(b);
  const rows = list.length ? list[list.length - 1].row : 0;
  const door = Math.floor(r() * 3);
  for (const [i, w] of list.entries()) {
    const [d1, d2, d3] = [r(), r(), r()];
    const kind = d2 < 0.1 ? BOARDED : d2 < 0.17 ? BROKEN : d2 < 0.34 ? BLIND : GLASS;
    const low = w.row >= rows;
    if (low && w.col === door) {
      box(g, P.shade, w.x - 3, w.y + 6, WIN.w + 6, 40, 0.5);
      box(g, P.boardDark, w.x - 1, w.y + 8, WIN.w + 2, 40);
      box(g, P.trim, w.x - 3, w.y + 5, WIN.w + 6, 2.6);
      continue;
    }
    const lit = d1 < 0.1 && !low && kind !== BOARDED;
    sash(g, P, w.x, w.y, WIN.w, w.h, kind, lit, b.arch);
    if (lit && d3 < 0.7) lamp(out, w.x + WIN.w / 2, w.y + w.h / 2, 17, P.lit, d3 < 0.35 ? 'pulse' : 'steady', hash(b.seed * 31 + i), 0.075);
    if (d3 > 0.55) fade(g, w.x - 1, w.y + w.h + 4, WIN.w + 2, 18 + d3 * 22, [[0, rgba(P.soot, P.sootA * 0.8)], [1, rgba(P.soot, 0)]]);
  }
}

export function house(g, P, b, out) {
  const r = seeded(b.seed);
  const wall = wallColor(P, b);
  const [x0, yb] = [b.x, FLOOR + 70];
  g.save();
  outline(g, b, yb);
  g.fillStyle = wall;
  g.fill();
  g.clip();
  if (b.brick) bricks(g, wall, x0, b.top - b.w, b.w, yb - b.top + b.w);
  else speckle(g, r, x0, b.top - 20, b.w, yb - b.top + 20, Math.floor(b.w * 3), [P.shade, P.edge, P.dust], 0.16);
  wallLight(g, P, x0, b.top - b.w * 0.4, b.w, yb - b.top + b.w * 0.4);
  streaks(g, r, x0, b.top + 4, b.w, 130, Math.floor(b.w / 28), P.soot, P.sootA);
  g.restore();
  windows(g, P, b, out, r);
  if (b.panel) wallPanel(g, P, x0 + b.panel[0], b.top + b.panel[1], b.panel[2], b.panel[3]);
  dress(g, P, b, wall, r);
  if (b.pipe) drainpipe(g, P, b.pipe > 0 ? x0 + b.w - 9 : x0 + 6, b.top + 6, FLOOR);
  if (b.esc) {
    const e = escapeAt(b);
    escape(g, P, e.x, e.w, e.y0, WIN.pitch, e.floors);
  }
  g.save(); // the foot of the block lies in shadow, over its windows and its fire escape too: the player's zone behind it stays calm
  outline(g, b, yb);
  g.clip();
  fade(g, x0, FLOOR - 190, b.w, 260, [[0, rgba(P.shade, 0)], [0.5, rgba(P.shade, P.shadeA * 0.4)], [0.82, rgba(P.shade, P.shadeA * 0.9)], [1, rgba(P.shade, P.shadeA)]]);
  g.restore();
  for (const [rx, h] of b.stacks ?? []) stack(g, P, wall, x0 + b.w * rx - 7, roofY(b, x0 + b.w * rx) + 5, 14, h, r);
  for (const rx of b.vents ?? []) vent(g, P, x0 + b.w * rx, roofY(b, x0 + b.w * rx) + 2);
  if (b.aerial != null) aerial(g, P, x0 + b.w * b.aerial, roofY(b, x0 + b.w * b.aerial) + 2, 30);
  if (b.dish) dish(g, P, x0 + b.w * b.dish, b.top + 30);
}
