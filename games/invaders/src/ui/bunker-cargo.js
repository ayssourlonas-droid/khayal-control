// Sunset Armada's bunker skin (bunker-skins.js, 'cargo'): a stack of deck cargo lashed down. A course of
// canvas sandbags on top, lit on their crowns and tied at one end, stitched across the belly, a cargo net
// of rope drawn over them; below, two courses of wooden crates of different widths, each in a frame with
// brass corner brackets, planked inside, some braced with a cross, some strapped with rope, some stencilled
// with a mark. The gaps between are dark. Pure per-pixel, like every skin: skin(x, y, w, h, P) -> [rgb, k].
import { hash2 } from './sprites.js';

const grain = (x, y, a) => (hash2(x >> 1, y >> 1) - 0.5) * a;
const BAGS = 17; // px: the sandbag course
const COURSES = [[BAGS, 22], [BAGS + 22, 21]]; // the crates' courses: [top, height]

// The segments of a course across 240 px, built once: { x, w, kind, mark } (kind: 0 planked, 1 braced, 2
// strapped; a bag's tone in `kind` too: 0 canvas, 1 sunburnt, 2 canvas).
const SEGS = [[26, 36], [24, 42], [26, 44]].map(([lo, span], c) => {
  const out = [];
  for (let x = -Math.floor(hash2(c, 5) * 20), j = 0; x < 240; j++) {
    const w = lo + Math.floor(hash2(c * 31 + j, 7) * (span - lo));
    out.push({ x, w, kind: Math.floor(hash2(c * 31 + j, 9) * 3), mark: hash2(c * 31 + j, 13) > 0.5 });
    x += w;
  }
  return out;
});

const seg = (c, x) => SEGS[c].find((s) => x < s.x + s.w);

// The net over the sandbags: a diamond of rope, knotted where the strands cross.
function net(x, y) {
  const [a, b] = [(x + y) % 14, (x - y + 280) % 14];
  if (a === 0 && b === 0) return [1, 0.1]; // a knot, in the light colour
  if (a === 0 || b === 0) return [0, 0.16];
  return null;
}

function sandbag(x, y, P) {
  const s = seg(0, x);
  const [rx, ry] = [x - s.x, y];
  if (rx === 0 || rx === s.w - 1) return [P.dark, 0]; // the seam between two bags
  const ropes = net(x, y);
  if (ropes) return ropes[0] ? [P.light, ropes[1]] : [P.dark, ropes[1]];
  const edge = Math.min(rx, s.w - 1 - rx);
  const k = 0.4 - 0.9 * (ry / BAGS) - (edge < 4 ? 0.3 - edge * 0.07 : 0) + grain(x, y, 0.14);
  if (rx >= s.w - 6 && rx <= s.w - 5) return [P.fill, -0.28 + k * 0.3]; // the tie at the neck
  if (ry === 9 && rx % 4 < 2 && rx > 3 && rx < s.w - 7) return [P.dark, 0.18]; // stitching across the belly
  return s.kind === 1 ? [P.light, k - 0.32] : [P.accent, k];
}

function crate(x, y, c, P) {
  const [top, h] = COURSES[c];
  const s = seg(c + 1, x);
  const [rx, ry] = [x - s.x, y - top];
  if (rx === 0 || ry === 0 || rx === s.w - 1) return [P.dark, 0]; // the gap between crates
  const frame = rx < 3 || rx >= s.w - 3 || ry < 3 || ry >= h - 3;
  if (frame) {
    const corner = (rx < 6 || rx >= s.w - 6) && (ry < 6 || ry >= h - 6);
    if (corner) return (rx + ry) % 5 === 0 ? [P.dark, 0.3] : [P.light, 0.16 - 0.3 * (ry / h)]; // a brass bracket, a nail in it
    return [P.fill, 0.22 - 0.3 * (ry / h) + grain(x, y, 0.16)];
  }
  const [ix, iy] = [rx - 3, ry - 3];
  if (s.mark && Math.abs(rx - s.w / 2) < 5 && Math.abs(ry - h / 2) < 3) return hash2(rx, ry) > 0.45 ? [P.accent, 0.04] : [P.dark, 0.26]; // a stencilled mark
  if (s.kind === 1 && Math.abs(iy * (s.w - 6) - ix * (h - 6)) < (s.w - 6) * 1.1) return [P.light, 0.04]; // the brace
  if (s.kind === 1 && Math.abs((h - 7 - iy) * (s.w - 6) - ix * (h - 6)) < (s.w - 6) * 1.1) return [P.light, 0.04];
  if (s.kind === 2 && (ix % Math.floor(s.w / 2) < 2)) return [P.accent, -0.12 + grain(x, y, 0.1)]; // a rope strap
  if (iy % 5 === 4) return [P.dark, 0.16]; // the joint between planks
  return [P.fill, 0.18 * (1 - ry / h) - 0.06 + grain(x, y, 0.22) + (hash2(x >> 3, iy) - 0.5) * 0.12];
}

export function cargo(x, y, w, h, P) {
  if (y < BAGS) return sandbag(x, y, P);
  return crate(x, y, y < COURSES[1][0] ? 0 : 1, P);
}
