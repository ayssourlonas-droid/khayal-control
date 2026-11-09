// The garden round the Tomb of Ferdowsi (ferdowsi.js): the long pool in front of the steps, its
// coping, its water and the fountains standing in it; the paved walk that runs on from the steps'
// foot past its ends, lined with lamp posts; the lawns in front of the walk with their low hedges;
// and the cypresses and pines behind it. Rows are counted from F, the pool's far edge. Tones: m M N
// the lawn, lit to shade, t y e the trees and hedges, k the dark, g G the lamps, C the coping, P
// the walk, ~ the water, W its glints.
import { PIXEL } from '../sprites.js';
import { int } from '../../core/rng.js';
import { lamp, light } from './yazd-brick.js';
import { pine, cypress, lampPost } from './park.js';
import { FOOT } from './ferdowsi-tomb.js';

export const UNDER = 34; // blocks from the pool's far edge down to the band's foot; the ground hides the lowest 14
export const POOL = 96; // the pool's half-width, from the middle
const WALK = 3; // the walk's width in rows
const POSTS = [8, 34, 60, 86]; // the lamp posts' distances beyond the pool's end; each stands on the walk
const POST = 8; // a post's height above the walk
const SPRAY = ['..G..', '.W.W.', '..W..', '..W..', 'WWWWW']; // a fountain: its jet, the drops it throws and the ring where it falls
const FOUNTAINS = [-72, -48, -24, 0, 24, 48, 72]; // from the middle

const postX = (mid, s, dx) => mid + s * (POOL + dx);
const lantern = (F) => F + WALK - POST - 1; // the row of a post's lamp

// The lamps first, so the lawn and the hedges they light are painted in their glow.
export function lamps(art) {
  const { mid, F, lights, L } = art;
  for (const s of [-1, 1]) {
    for (const dx of POSTS) lamp(art, 1, postX(mid, s, dx), lantern(F), 18, 1);
  }
  for (const dx of FOUNTAINS) lights.push({ x: (mid + dx + 0.5) * PIXEL, y: (F + 8) * PIXEL, r: 30, color: L.lamp, ph: dx / 23, a: 0.35 });
}

// The walk, and the lawns in front of it down to the band's foot, lit round the lamps.
export function lawns(art) {
  const { box, rng, mid, F, BW } = art;
  for (const [from, to] of [[0, mid - POOL], [mid + POOL, BW]]) {
    box(from, F, to - from, WALK, 'P');
    for (let y = F + WALK; y < F + UNDER; y++) {
      for (let x = from; x < to; x++) {
        const s = light(art.lamps[1], x, y);
        const speck = rng() < 0.05;
        box(x, y, 1, 1, s > 0.45 ? 'm' : s > 0.2 ? (speck ? 'm' : 'M') : speck ? 'M' : 'N');
      }
    }
  }
}

// A low hedge, six rows high, `len` blocks long from column x, its top on row `down`.
function hedge({ box, rng }, x, down, len) {
  box(x, down, len, 6, 't');
  for (let i = 0; i < len; i++) if (rng() < 0.4) box(x + i, down + 1, 1, 1, 'y');
  box(x, down, len, 1, 'e');
}

// One between each two posts, on the lawn just in front of the walk.
export function hedges(art) {
  const { mid, F } = art;
  for (const s of [-1, 1]) {
    for (const post of POSTS.slice(0, -1)) {
      const dx = post + 4;
      hedge(art, s < 0 ? mid - POOL - dx - 20 : postX(mid, s, dx), F + WALK + 1, 20);
    }
  }
}

export function posts(art) {
  for (const s of [-1, 1]) for (const dx of POSTS) lampPost(art, postX(art.mid, s, dx), lantern(art.F), POST);
}

// Trees on both sides, standing on the walk's far edge beyond the steps.
export function trees(art) {
  const { mid, rng, BW } = art;
  for (const s of [-1, 1]) {
    for (let dx = FOOT + 10; dx < BW / 2 - 4; dx += int(rng, 9, 17)) {
      const tall = int(rng, 22, 44);
      if (rng() < 0.4) pine(art, mid + s * dx, Math.round(tall * 0.8));
      else cypress(art, mid + s * dx, tall, int(rng, 2, 3));
    }
  }
}

// The coping along the steps' foot and down the pool's ends, and the water from it down, with the
// odd glint; the reflection goes over it afterwards.
export function water({ box, rng, mid, F }) {
  box(mid - POOL, F, POOL * 2, 1, 'C');
  box(mid - POOL, F + 1, POOL * 2, UNDER - 1, '~');
  for (const x of [mid - POOL, mid + POOL - 1]) box(x, F, 1, UNDER, 'C');
  for (let y = F + 2; y < F + UNDER; y += 3) {
    for (let x = mid - POOL + int(rng, 0, 9); x < mid + POOL; x += int(rng, 11, 28)) box(x, y, int(rng, 1, 3), 1, 'W');
  }
}

// The fountains, lit specks standing on the water.
export function fountains({ stamp, mid, F }) {
  for (const dx of FOUNTAINS) stamp(SPRAY, mid + dx - 2, F + 5);
}
