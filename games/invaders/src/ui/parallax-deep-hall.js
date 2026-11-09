// The broken great hall of the drowned kingdom (far layer of Lantern Deep, see parallax-deep.js): a long
// stone hall on the near slope, its left half still under a steep roof, its right half open to the water
// (bare rafters, a gable wall stepping down in ruin), a row of tall pointed windows, a great doorway with a
// teal glow behind it, a colonnade along the front with some columns snapped off, a flight of steps up to
// the door, buttresses, coral along the ridge and weed over the gap.
import { rgba } from './sprites.js';
import { TEAL, GREEN, CORAL, ABYSS, poly, lamp, tint, wash, crust, weed, moss, stairs, barnacles } from './parallax-deep-kit.js';

// A tall pointed window (a lancet), centre x, its sill at y, w wide and h tall; lit with the given colour or dark.
function lancet(g, x, y, w, h, color) {
  g.beginPath();
  g.moveTo(x - w / 2, y);
  g.lineTo(x - w / 2, y - h * 0.65);
  g.quadraticCurveTo(x - w / 2, y - h * 0.9, x, y - h);
  g.quadraticCurveTo(x + w / 2, y - h * 0.9, x + w / 2, y - h * 0.65);
  g.lineTo(x + w / 2, y);
  g.closePath();
  g.fillStyle = color ? rgba(color, 0.78) : rgba(ABYSS, 0.66);
  g.fill();
}

// The hall with its left end at x and its foot on `ground(x)`.
export function hall(g, out, rng, L, x, ground) {
  const [wd, wall, gable] = [330, 74, 62];
  const [mid, y] = [x + wd * 0.55, ground(x + wd / 2) + 6];
  const top = y - wall;
  const build = (c) => { // the steep roof on the left, its gable end standing at mid, then the ruin stepping down
    poly(c, [[x, y], [x, top - 4], [x + 6, top - 24], [mid - 20, top - 30], [mid - 4, top - gable], [mid + 6, top - gable + 4], [mid + 20, top - 26], [mid + 26, top - 8],
      [mid + 44, top + 6], [mid + 52, top - 6], [x + wd - 76, top + 2], [x + wd - 60, top + 26], [x + wd - 20, top + 18], [x + wd, top + 30], [x + wd, y]]);
  };
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  wash(g, build, [x, top - gable, x + wd, y], undefined, 0.3);
  for (const bx of [x + 32, x + 118, x + 214, x + 296]) { // buttresses between the bays
    poly(g, [[bx - 3, y], [bx - 3, top + 18], [bx + 4, top + 30], [bx + 14, y]]);
    g.fill();
  }
  g.fillStyle = rgba(ABYSS, 0.4); // the rafters of the open half: ribs against the water
  for (let i = 0; i < 4; i++) {
    const rx = mid + 36 + i * 30;
    poly(g, [[rx, top + 8 + (i % 2) * 8], [rx + 9, top - 34 + i * 3], [rx + 11.5, top - 33 + i * 3], [rx + 3.5, top + 14 + (i % 2) * 8]]);
    g.fill();
  }
  for (let i = 0; i < 7; i++) { // the tall windows; two lit
    const wx = x + 18 + i * 34;
    const color = i === 2 ? L.lamp : i === 5 ? TEAL : null;
    lancet(g, wx, y - 40, 9, 28, color);
    if (color) lamp(out, wx, y - 52, 11, color, i === 2 ? 'flicker' : 'pulse', rng(), 0.34);
  }
  g.fillStyle = rgba(ABYSS, 0.34); // the arcade's recess behind the columns, and the great doorway in it
  g.fillRect(x + 2, y - 34, wd - 6, 34);
  lancet(g, x + 166, y, 24, 34, null);
  lamp(out, x + 166, y - 16, 30, TEAL, 'pulse', rng(), 0.24);
  g.fillStyle = L.color;
  stairs(g, x + 140, y + 4, 7, 4, 2.2);
  for (let i = 0; i < 8; i++) { // the colonnade, a few columns snapped
    const [cx, ch] = [x + 6 + i * 44, i === 3 || i === 6 ? 12 + rng() * 10 : 34];
    g.fillStyle = L.color;
    g.fillRect(cx, y - ch, 5, ch + 2);
    if (ch > 30) {
      g.fillRect(cx - 2, y - ch - 3, 9, 4);
    } else {
      poly(g, [[cx, y - ch], [cx + 2, y - ch - 4], [cx + 5, y - ch + 1]]);
      g.fill();
    }
    barnacles(g, rng, cx, y - ch, cx + 5, y, 2);
  }
  g.fillStyle = L.color; // fallen drums and blocks in front
  for (let i = 0; i < 9; i++) g.fillRect(x + 20 + rng() * (wd - 40), y - 3 + rng() * 6, 5 + rng() * 9, 4 + rng() * 3);
  const coral = tint(L, CORAL, 0.3);
  const green = tint(L, GREEN, 0.28);
  crust(g, rng, x + 6, mid - 20, top - 27, coral); // the ridge of the standing roof
  crust(g, rng, mid + 52, x + wd - 76, top - 4, coral); // the ruin's broken edge
  moss(g, rng, x, mid - 20, top - 3, green);
  weed(g, rng, mid + 56, top + 4, 34, 10, green, 4);
  weed(g, rng, x + 20, top - 2, 24, 6, green, 5);
  barnacles(g, rng, x, top, x + wd, y, 26);
}
