// World 17's bunker skin (bunker-skins.js, 'filter'): a wall of clean-air filter cassettes, the kind an air purifier slides
// into its case. Five cassettes side by side (one to 32 px), each a pale moulded frame with a rounded window cut in it,
// a green keyline round the window, a shadow lip under the frame's top and left, and in the window the filter media itself:
// white-and-mint pleats, six px crease to crease (a dark crease, a lit face rising to a bright ridge, a shaded face falling
// back), a fine wire mesh over them (a wire every five rows, a nub where it crosses a crease) and a grain of fibre. Across the
// head runs a stripe of fresh green over a grip slot in every cassette; along the foot a row of little green-teal indicator
// squares (the last of four dim), and a green clip crosses every seam half way down. Fresh, it is clean and white. As the wall
// is carved (P.worn, 0 to 1: the share of the bunker shot away, from bunkers-view.js) it greys with soot: first in the creases,
// where dirt settles, then across the faces, ash-grey and brown-grey in smudges, with black streaks running down the folds once
// it is well worn; the frame greys a little less than the media, and the green trim, the clips and the indicator marks never do.
// Pure per-pixel, like every skin: skin(x, y, w, h, P) -> [rgb, k]; the rim over every carve (bunkers-view.js) is not this file's.
import { hash2, noise2 } from './sprites.js';

const PITCH = 6; // px, crease to crease
const PLEAT = [-0.5, 0.2, 0.34, 0.52, 0.0, -0.24]; // the blend of each px across a pleat: crease, lit face, ridge, shaded face
const RAD = 4; // the window's corner radius
const ASH = [124, 116, 106];
const BROWN = [92, 78, 64];
const BLACK = [30, 27, 25];
const LED = [70, 228, 178];
const LED_DIM = [38, 108, 90];
const grain = (x, y, a) => (hash2(x >> 1, y >> 1) - 0.5) * a;
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const ramp = (v, lo, hi) => Math.min(1, Math.max(0, (v - lo) / (hi - lo)));

// The colour of the media, derived from P (made fresh for each bake): worked out once per bake, then one identity check a pixel.
let paletteP = null;
let mediaTone = null;
const toneOf = (P) => {
  if (P !== paletteP) [paletteP, mediaTone] = [P, mixc(P.fill, P.accent, 0.4)];
  return mediaTone;
};

// The wall's layout: how many cassettes, their cell edges, how tall the head and the foot, where the window is.
const layoutCache = new Map();
function layout(w, h) {
  const key = w * 1000 + h;
  let L = layoutCache.get(key);
  if (L) return L;
  const n = Math.max(2, Math.round(w / 32));
  const edge = Array.from({ length: n + 1 }, (_, i) => Math.round((i * w) / n));
  const [head, foot] = [Math.max(8, Math.round(h * 0.2)), Math.max(7, Math.round(h * 0.14))];
  const win = Array.from({ length: n }, (_, i) => ({ x0: edge[i] + (i === 0 ? 4 : 3), x1: edge[i + 1] - (i === n - 1 ? 4 : 3), y0: head, y1: h - foot }));
  layoutCache.set(key, (L = { w, h, n, edge, head, foot, win, noise: null }));
  return L;
}

// The noise the soot and the smudges read depends only on a pixel's place, not on the wear or the mask, so a re-bake after a carve
// need not work it out again: each bunker size keeps one table a noise (Float64Array, not Float32, so that the output stays byte for
// byte), filled the first time a pixel asks (-1: not yet) and read from then on.
const NOISES = [
  (x, y) => noise2(x, y, 20, 3), // BLOTCH: the soot's big blotches
  (x, y) => noise2(x * 1.8, y * 0.16, 9, 5), // DRIP: the soot's long streaks down the folds
  (x, y) => noise2(x, y, 11, 8), // SMUDGE: ash against brown
  (x, y) => noise2(x * 2.4, y * 0.12, 8, 9), // STREAK: where the black runs
];
const [BLOTCH, DRIP, SMUDGE, STREAK] = [0, 1, 2, 3];
function noiseAt(L, which, x, y) {
  if (x < 0 || x >= L.w) return NOISES[which](x, y); // off the bunker: no row to share a table slot with
  const table = (L.noise ??= NOISES.map(() => new Float64Array(L.w * L.h).fill(-1)))[which];
  const i = y * L.w + x;
  return table[i] >= 0 ? table[i] : (table[i] = NOISES[which](x, y));
}

// The green clip that holds two cassettes together, half way down every seam (4 px wide, 4 tall, lit on top), or null.
const clipAt = (x, y, h, L) => {
  const dy = y - Math.floor(h / 2) + 2;
  if (dy < 0 || dy > 3) return null;
  for (let i = 1; i < L.n; i++) if (x >= L.edge[i] - 2 && x <= L.edge[i] + 1) return dy === 0 ? 0.35 : dy === 3 ? -0.3 : 0;
  return null;
};
const cellOf = (x, L) => Math.min(L.n - 1, Math.floor((x * L.n) / L.w));
const seamAt = (x, L) => {
  for (let i = 1; i < L.n; i++) if (x === L.edge[i]) return true;
  return false;
};

// How far inside the window's rounded outline the point is (negative outside it).
function depth(px, py, r) {
  const [hx, hy] = [(r.x1 - r.x0) / 2, (r.y1 - r.y0) / 2];
  const [qx, qy] = [Math.abs(px - r.x0 - hx) - (hx - RAD), Math.abs(py - r.y0 - hy) - (hy - RAD)];
  return RAD - (Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0));
}

// The soot at a pixel, 0 to 1. `fold` is 1 in a crease, where dirt gathers first; `frame` greys less.
function soot(L, x, y, worn, fold, frame) {
  if (worn <= 0) return 0;
  const v = 0.55 * noiseAt(L, BLOTCH, x, y) + 0.45 * noiseAt(L, DRIP, x, y) + 0.12 * (y / L.h) + 0.2 * fold;
  return ramp(v, 1.05 - 1.2 * worn, 1.35 - 1.2 * worn) * (frame ? 0.55 : 0.88);
}

// A pixel's final [rgb, k]: the base colour and blend, dirtied by `s` (a smudge of ash or brown, black in the streaks).
function dirty(L, c, k, s, x, y, worn) {
  if (s <= 0) return [c, k];
  const smudge = mixc(ASH, BROWN, noiseAt(L, SMUDGE, x, y));
  let out = mixc(c, smudge, s);
  const streak = noiseAt(L, STREAK, x, y);
  if (worn > 0.22 && streak > 0.74) out = mixc(out, BLACK, ramp(streak, 0.74, 0.86) * Math.min(1, (worn - 0.22) * 2.5) * 0.8 * s);
  return [out, k * (1 - 0.55 * s)];
}

// The head: a lit lip, a stripe of green, its shadow, a band of frame with a grip slot cut in every cassette.
function head(x, y, L, P) {
  if (y < 3) return [P.light, 0.2];
  if (y === 3) return [P.fill, 0.14 + grain(x, y, 0.06)];
  if (y >= 4 && y <= 6) return [P.edge, [0.4, 0.06, -0.12][y - 4]];
  if (y === 7) return [P.dark, -0.4];
  const i = cellOf(x, L);
  const [mid, half] = [(L.edge[i] + L.edge[i + 1]) / 2, 7];
  if (y >= 8 && y <= 10 && Math.abs(x + 0.5 - mid) < half - (y === 8 ? 1 : 0)) return y === 10 ? [P.light, 0.3] : [P.dark, -0.3 - (y === 9 ? 0.1 : 0)];
  return [P.fill, y === 11 ? -0.2 : 0.08 + grain(x, y, 0.08)];
}

// The foot: the shadow under the window, a lit lip, the frame with its row of indicator squares, a base moulding.
function foot(x, y, h, L, P) {
  const r = y - (h - L.foot);
  if (r === 0) return [P.dark, -0.4];
  if (r === 1) return [P.light, 0.3];
  const i = cellOf(x, L);
  const dx = x + 0.5 - (L.edge[i] + L.edge[i + 1]) / 2 + 9; // four squares, 6 px apart, centred in the cassette
  const [cell, at] = [Math.floor(dx / 6), dx % 6];
  if (r >= 3 && r <= 4 && cell >= 0 && cell < 4 && at >= 1 && at < 4) return r === 3 ? [cell < 3 ? LED : LED_DIM, 0.12] : [cell < 3 ? LED : LED_DIM, -0.2];
  if (r === 5) return [P.fill, -0.14];
  return [P.fill, 0.1 + grain(x, y, 0.08) + (r === L.foot - 3 ? 0.14 : 0)];
}

// The side of a window: its gap, then the frame's lit face on the left of a window and its shaded face on the right.
function side(x, y, r, d, L, P) {
  if (d > -1) return [P.dark, -0.42];
  const left = x + 0.5 < (r.x0 + r.x1) / 2;
  if (left) return [P.fill, 0.34 + grain(x, y, 0.06)];
  return [P.fill, -0.12 + grain(x, y, 0.06)];
}

// The media inside the window: pleats, mesh, fibre; the top and left inner edges shadowed by the frame.
function media(x, y, L, r, d, worn, P) {
  const tone = toneOf(P);
  if (d < 1) return [P.edge, y < r.y0 + 2 || x < r.x0 + 2 ? 0.12 : -0.05];
  const [px, py] = [x + 0.5, y + 0.5];
  const topLeft = px < (r.x0 + r.x1) / 2 || py < (r.y0 + r.y1) / 2;
  if (d < 2) return topLeft ? [tone, -0.62] : [tone, 0.3]; // the frame's shadow on the top and left, its lit lip on the others
  const u = (((x - r.x0 - 2) % PITCH) + PITCH) % PITCH;
  const fy = (y - r.y0) / (r.y1 - r.y0);
  let k = PLEAT[u] + 0.16 * (1 - fy) - 0.1 * fy * fy + grain(x, y, 0.07) + (hash2(x, y) > 0.985 ? 0.2 : 0);
  if (d < 3 && topLeft) k -= 0.12; // the shadow fades off the lip
  if ((y - r.y0) % 5 === 0) k = u === 0 ? -0.62 : k - 0.2 + (u === 3 ? 0.16 : 0); // the mesh: a wire, a nub on the crease
  const s = soot(L, x, y, worn, u === 0 || u === 5 ? 1 : 0, false);
  return dirty(L, tone, k, s, x, y, worn);
}

export function filterWall(x, y, w, h, P) {
  const L = layout(w, h);
  const worn = P.worn ?? 0;
  let out;
  if (y < L.head) out = head(x, y, L, P);
  else if (y >= h - L.foot) out = foot(x, y, h, L, P);
  else {
    const r = L.win[cellOf(x, L)];
    const d = depth(x + 0.5, y + 0.5, r);
    if (d > 0) return media(x, y, L, r, d, worn, P);
    out = side(x, y, r, d, L, P);
  }
  if (y >= 8 && seamAt(x, L)) out = [P.dark, -0.3];
  const clip = y >= L.head && y < h - L.foot ? clipAt(x, y, h, L) : null;
  if (clip !== null) return [P.edge, clip];
  if (out[0] === P.fill || out[0] === P.dark) return dirty(L, out[0], out[1], soot(L, x, y, worn, 0, true), x, y, worn);
  return out;
}
