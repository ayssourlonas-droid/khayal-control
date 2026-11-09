// Painting kit for the boss painters (bosses/<kind>.js), on top of the alien kit (aliens/kit.js):
// the same body/lights split, plus procedural pixel art at boss scale and what the giants share.
// Bake-time only, but for throb (a painter's live()). A painter draws centred on (0, 0) in world px:
// the hull in boss coordinates, a part in its own (its rect is w x h around the origin and its art
// must cover it, since the rect is the hit box).
import { pixels, path, line, bloom, phosphor } from '../aliens/kit.js';
import { glow, rgba, shade } from '../sprites.js';

export { TAU, path, bloom, phosphor, line, pixels } from '../aliens/kit.js';

export const PX = 10; // a giant's pixel: twice an animal's
export const RED = '#ff2a3a';
export const AMBER = '#ffb03a';
export const PINK = '#ff5a8a';
export const FANG = '#fff8e8';
const PUPIL = '#0a0612';
export const LID = '#1a0a20';

// Pixel art from a function: at(i, j) -> null | colour | [colour, lit], over cols x rows cells of
// px, centred (the alien kit's bevelled phosphor cells).
function pixelArt(b, l, cols, rows, px, at) {
  const keys = new Map();
  const map = {};
  const lines = [];
  for (let j = 0; j < rows; j++) {
    let row = '';
    for (let i = 0; i < cols; i++) {
      const v = at(i, j);
      if (!v) {
        row += '.';
        continue;
      }
      const id = Array.isArray(v) ? v.join('|') : v;
      if (!keys.has(id)) {
        const ch = String.fromCharCode(65 + keys.size + (keys.size > 25 ? 6 : 0));
        keys.set(id, ch);
        map[ch] = v;
      }
      row += keys.get(id);
    }
    lines.push(row);
  }
  pixels(b, l, lines, px, map);
}

const cell = (i, n) => (i - n / 2 + 0.5) * PX; // a cell's centre, from the grid's centre
// Pixel art over cols x rows cells of PX, at(x, y) taking each cell's centre in px.
export const grid = (b, l, cols, rows, at) => pixelArt(b, l, cols, rows, PX, (i, j) => at(cell(i, cols), cell(j, rows)));
export const inside = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
// The half-width at height y of a head outlined by `outline`, [y, half-width] pairs from the top
// down, the widths eased between them: -1 above or below it.
export const outlineWidth = (outline) => (y) => {
  const i = outline.findIndex(([oy]) => oy >= y);
  if (i < 0 || y < outline[0][0]) return -1;
  if (i === 0) return outline[0][1];
  const [y0, w0] = outline[i - 1];
  const [y1, w1] = outline[i];
  return w0 + ((w1 - w0) * (y - y0)) / (y1 - y0);
};
// Whether (x, y) is one of `cells`, each [x, y] a cell centre mirrored either side of the middle.
export const markAt = (cells, x, y) => cells.some(([sx, sy]) => Math.abs(Math.abs(x) - sx) < 5 && Math.abs(y - sy) < 5);

// Every cell of a cols x rows grid that pick(x, y) keeps, lit in one colour: a rage overlay's
// stripes or gills.
export function litCells(l, cols, rows, pick, colour) {
  l.globalCompositeOperation = 'lighter';
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = cell(i, cols);
      const y = cell(j, rows);
      if (!pick(x, y)) continue;
      l.fillStyle = rgba(colour, 0.7);
      l.fillRect(x - PX / 2, y - PX / 2, PX, PX);
      bloom(l, x, y, PX * 2, colour, 0.35);
    }
  }
}

// A fan from a root (a fish's fin, a bird's wing or crest): ribs radiating out to a scalloped, lit
// rim. r(a) is the rim's reach at angle a (radians from straight out), ribs every RIB.
const RIB = 0.36;
export function fan(b, l, cols, rows, root, spread, r, c) {
  grid(b, l, cols, rows, (x, y) => {
    const dx = x - root[0];
    const dy = y - root[1];
    const a = Math.atan2(dy, -dx); // 0 points out, away from the root
    const d = Math.hypot(dx, dy);
    const rim = r(a);
    if (Math.abs(a - spread[0]) > spread[1] || d > rim) return null;
    if (d > rim - PX) return [shade(c, 0.5), true]; // the lit rim
    const onRib = Math.abs(a / RIB - Math.round(a / RIB)) < 0.3;
    return onRib ? shade(c, -0.55) : shade(c, 0.45 - d / 300);
  });
  phosphor(b, l, 0.22, 4);
}

// The spine of a horn or an ear: SAMPLES points along the quadratic Bézier from p0 by way of p1 to p2,
// each [x, y, r], r(t) the thickness at t (0 to 1 along it).
const SAMPLES = 41;
export const spine = ([x0, y0], [x1, y1], [x2, y2], r) => Array.from({ length: SAMPLES }, (_, i) => {
  const t = i / (SAMPLES - 1);
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2, r(t)];
});

// The index of the sample of `s` that (x, y) lies deepest in (r less its distance from the sample), or
// -1 off the spine.
export function spineAt(s, x, y) {
  let at = -1;
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const room = s[i][2] - Math.hypot(x - s[i][0], y - s[i][1]);
    if (room > best) [best, at] = [room, i];
  }
  return at;
}

// A giant's eye painter from its bitmap (L lid, Y lit iris, y its lower half, k pupil, g glint),
// the iris burning in the palette's weak colour.
export const eyeArt = (rows) => (b, l, _part, S) => {
  const w = S.pal.weak;
  pixels(b, l, rows, PX, { L: LID, Y: [w, true], y: [shade(w, -0.3), true], k: PUPIL, g: ['#ffffff', true] });
  bloom(l, 0, 0, 44, w, 0.35);
  phosphor(b, l, 0.25, 4);
};

// Whiskers from (±x0, y0) out to (±x1, y1), one per [y0, x1, y1] spoke, mirrored; lights only.
export function whiskers(l, x0, spokes, colour, a, w) {
  for (const s of [-1, 1]) {
    for (const [y0, x1, y1] of spokes) {
      path(l, [[s * x0, y0], [s * x1, y1]], true);
      line(l, rgba(colour, a), w);
    }
  }
}

// A giant's live(): its lit brows at (±x, y) throb, quicker with every phase.
export const throb = (x, y) => (ctx, b, t) => {
  ctx.globalAlpha = 0.15 + 0.3 * (0.5 + 0.5 * Math.sin(t * (4 + b.phase * 3)));
  for (const s of [-1, 1]) ctx.drawImage(glow(RED), s * x - 80, y - 32, 160, 64);
  ctx.globalAlpha = 1;
};
