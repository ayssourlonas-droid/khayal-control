// The Craving's smoke kit (World 17, Ash to Air; bosses/craving*.js): every puff of its body and everything that curls off it
// is a cached sprite, baked once, and the churning body is made by painting them (smokeMass, lay) into pose frames.
//   puff(kind, size, v?)  the cached sprite for a kind at the nearest size of its set, variant v (wrapped). Kinds:
//     'billow'   a lit billow: a cauliflower of 15-20 soft bumps (craving-blob.js bump) heaped top to bottom, each with a pale crest and an
//                ember belly, a charcoal body, with grain; sizes 48..280 (the bumps are kept inside the canvas, so the body of the
//                sprite is about 0.4 of its size round the middle), 3-6 variants by size
//     'cool'     a billow with only a faint ember glow below (for the upper body, far from the embers)
//     'core'     the same cluster dark and rimless with a softer edge: fills the inside of a mass
//     'wisp' / 'wispPale' / 'wispLit'   a lazy ribbon, 2 : 1 (width x half as tall), charcoal / ash grey / ember-warm for additive drawing; sizes 64..208
//     'curl' / 'curlLit'   a stroke tightening to a hooked head, square; its chord lies along +x with the head at the right; 48..144
//   puffMax(kind, max, v?)  the biggest sprite of the kind no bigger than max, or null
//   lay(g, kind, x, y, s, i, seed, pose, amp, top?, dx?, dy?, slack?)  one puff of a mass: at (x, y) (dx, dy aside), turning round its
//     own small ellipse of amp px, leaning, rolling and flipped by its own hash; near `top` it stands upright, is cropped a little
//     or shrinks, so that no sprite box crosses it; which sprite it is does not depend on the pose
//   smokeMass(g, cx, cy, rx, ry, seed, opts)   paint a mass of smoke over the ellipse (cx, cy, rx, ry) onto g: a bed of core
//     puffs, then billows round its skin and a few inside, from the top down. Everything comes from `seed` (hash), so the same
//     call paints the same smoke. opts: pose (0..1, the churn: every puff goes once round its own small ellipse while the pose goes
//     from 0 to 1, so pose 0 and 1 are the same picture and frames of one mass crossfade), amp (px of that ellipse, 7), core / skin
//     (densities, 1; skin 0 gives only the bed, anything above it at least five billows on the skin), size (scale of the puffs, 1), top (nothing is drawn above this y), warmY (billows
//     above this y are the 'cool' ones)
// Sprite keys 'cravs...'. A sprite is baked on first use; warmPuffs() bakes the whole set ahead of the fight.
import { cached, hash } from '../sprites.js';
import { bump, grain, warmDots } from './craving-blob.js';
import { TAU } from '../../core/math.js';
import { paintWisp, paintCurl } from './craving-wisp.js';

const BIG = [48, 72, 104, 144, 200, 280];
const MID = [64, 96, 144, 208];
const SMALL = [48, 72, 104, 144];

// One cluster: a cauliflower of bumps (craving-blob.js): a big one in the middle, a ring of fat ones round it and a ring of small ones on
// the rim, laid out from v, painted top to bottom so that each lower bump lays its pale crest over the dark belly of the one above.
function cluster(g, s, v, rim, glow, tone) {
  const list = [[0.5 * s + (hash(v * 5) - 0.5) * 0.08 * s, 0.5 * s, (0.24 + 0.05 * hash(v * 3)) * s]];
  const n = 6 + (v % 3);
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.6 * hash(v * 41 + i)) / n) * TAU + v;
    const d = 0.14 + 0.14 * hash(v * 23 + i);
    list.push([0.5 * s + Math.cos(a) * d * s, 0.5 * s + Math.sin(a) * d * 0.95 * s, s * (0.12 + 0.14 * hash(v * 13 + i))]);
  }
  for (let i = 0; i < n + 4; i++) {
    const a = ((i + 0.5 * hash(v * 29 + i)) / (n + 4)) * TAU + 0.5 * v;
    const d = 0.3 + 0.07 * hash(v * 19 + i);
    list.push([0.5 * s + Math.cos(a) * d * s, 0.5 * s + Math.sin(a) * d * 0.95 * s, s * (0.06 + 0.08 * hash(v * 17 + i))]);
  }
  list.sort((p, q) => p[1] - q[1]);
  const c = s / 2;
  const k = Math.min(1, (c - 2) / Math.max(...list.map(([x, y, r]) => Math.hypot(x - c, y - c) + 1.07 * r))); // keep every bump (drawn 7% larger than its radius) inside the canvas
  list.forEach(([x, y, r], i) => bump(g, c + (x - c) * k, c + (y - c) * k, r * k, v * 97 + i * 13 + s, rim, glow, tone));
}

const KINDS = {
  billow: { sizes: BIG, vars: [6, 6, 6, 5, 4, 3], h: (w) => w, paint: (g, w, h, v) => { cluster(g, w, v, 1, 0.8, 1); grain(g, w / 2, w / 2, w * 0.36, 6 + (w >> 4), v * 61 + w); } },
  cool: { sizes: BIG, vars: [6, 6, 6, 5, 4, 3], h: (w) => w, paint: (g, w, h, v) => { cluster(g, w, v + 2, 1, 0.2, 1); grain(g, w / 2, w / 2, w * 0.36, 6 + (w >> 4), v * 61 + w + 9); } },
  core: { sizes: BIG, vars: [4, 4, 4, 3, 3, 2], h: (w) => w, paint: (g, w, h, v) => cluster(g, w, v + 5, 0, 0.1, 0.55) },
  wisp: { sizes: MID, vars: [4, 4, 4, 3], h: (w) => w >> 1, paint: (g, w, h, v) => paintWisp(g, w, h, v, false) },
  wispPale: { sizes: MID, vars: [4, 4, 4, 3], h: (w) => w >> 1, paint: (g, w, h, v) => paintWisp(g, w, h, v, 2) },
  wispLit: { sizes: MID, vars: [4, 4, 4, 3], h: (w) => w >> 1, paint: (g, w, h, v) => paintWisp(g, w, h, v, true) },
  curl: { sizes: SMALL, vars: [3, 3, 3, 3], h: (w) => w, paint: (g, w, h, v) => paintCurl(g, w, h, v, false) },
  curlLit: { sizes: SMALL, vars: [3, 3, 3, 3], h: (w) => w, paint: (g, w, h, v) => paintCurl(g, w, h, v, true) },
};
for (const k of Object.values(KINDS)) k.made = k.sizes.map((_, i) => Array(k.vars[i]).fill(null));

export const kindSizes = (kind) => KINDS[kind].sizes;
export const snapIndex = (sizes, size) => {
  let best = 0;
  for (let i = 1; i < sizes.length; i++) if (Math.abs(sizes[i] - size) < Math.abs(sizes[best] - size)) best = i;
  return best;
};

export function puff(kind, size, v = 0) {
  const K = KINDS[kind];
  const i = snapIndex(K.sizes, size);
  const j = ((v % K.vars[i]) + K.vars[i]) % K.vars[i];
  return (K.made[i][j] ??= cached(`cravs${kind}${K.sizes[i]}_${j}`, K.sizes[i], K.h(K.sizes[i]), (g, w, h) => K.paint(g, w, h, j)));
}

// The largest sprite of a kind that is no bigger than `max` (null when even the smallest is).
export function puffMax(kind, max, v = 0) {
  const sizes = KINDS[kind].sizes;
  let best = -1;
  for (let i = 0; i < sizes.length; i++) if (sizes[i] <= max) best = i;
  return best < 0 ? null : puff(kind, sizes[best], v);
}

export function warmPuffs() {
  warmDots();
  for (const [kind, K] of Object.entries(KINDS)) K.sizes.forEach((s, i) => { for (let j = 0; j < K.vars[i]; j++) puff(kind, s, j); });
}

// One puff (kind, size s, number i of a mass seeded `seed`) at (x, y) (and dx, dy aside, which may carry it up by `slack`) moved round its own small ellipse (amp px) by `pose`, shrunk
// to fit under `top`, leaning and flipped by its own hash. smokeMass and the tendrils (craving-smoke.js) paint with it.
export function lay(g, kind, x, y, s, i, seed, pose, amp, top = -1e9, dx = 0, dy = 0, slack = 0) {
  const ph = hash(seed * 131 + i * 7) + pose;
  const a = amp * (0.45 + 0.55 * hash(seed * 17 + i * 3));
  const [px, py] = [x + dx + Math.cos(TAU * ph) * a, y + dy + Math.sin(TAU * ph) * a * 0.7];
  const room = y - amp - slack - top; // the room it keeps at its highest (slack: how far dx, dy may carry it), so which sprite it is does not depend on the pose
  let sprite = puff(kind, s, i + seed); // a puff leans only where its tilted box (0.72 s from the middle) clears `top`; near it, it stands
  const w = sprite.width; // upright, its top margin may be cropped (up to 0.06 s of mostly empty edge), or it is shrunk
  if (room < 0.44 * w) sprite = puffMax(kind, room * 2.1, i + seed);
  if (!sprite) return;
  const [sw, sh] = [sprite.width, sprite.height];
  const crop = Math.max(0, sh / 2 - (py - top));
  g.save();
  g.translate(px, py);
  if (room > 0.72 * sw) g.rotate((hash(seed * 29 + i * 5) - 0.5) * 0.44 + Math.min(0.5, amp * 0.06) * Math.sin(TAU * ph + 1.3)); // and rolls as it turns
  g.scale(hash(seed * 37 + i * 11) < 0.5 ? -1 : 1, 1);
  if (crop > 0) g.drawImage(sprite, 0, crop, sw, sh - crop, -sw / 2, -sh / 2 + crop, sw, sh - crop);
  else g.drawImage(sprite, -sw / 2, -sh / 2);
  g.restore();
}

const list = []; // scratch for the billows of one mass, bake time only

export function smokeMass(g, cx, cy, rx, ry, seed, opts = {}) {
  const { pose = 0, amp = 7, core = 1, skin = 1, size = 1, top = -1e9, warmY = -1e9 } = opts;
  const m = Math.min(rx, ry);
  const nc = Math.max(2, Math.round(core * 3.2 * (rx * ry) / (m * m)));
  for (let i = 0; i < nc; i++) {
    const a = i * 2.39996 + seed * 0.7;
    const d = Math.sqrt((i + 0.5) / nc) * 0.72;
    lay(g, 'core', cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 1.3 * m * size * (0.85 + 0.3 * hash(seed + i * 9)), i, seed, pose, amp * 0.4, top);
  }
  const ns = skin > 0 ? Math.max(5, Math.round(skin * (TAU * Math.sqrt((rx * rx + ry * ry) / 2)) / (0.55 * m))) : 0; // at least five on the skin, or none
  list.length = 0;
  for (let i = 0; i < ns * 1.5; i++) {
    const edge = i < ns;
    const a = edge ? ((i + hash(seed * 3 + i)) / ns) * TAU : hash(seed * 5 + i) * TAU;
    const d = edge ? 0.66 + 0.3 * hash(seed * 7 + i) : 0.1 + 0.45 * hash(seed * 7 + i);
    const s = m * size * (edge ? 0.62 + 0.5 * hash(seed * 11 + i) : 0.5 + 0.5 * hash(seed * 11 + i));
    list.push([cy + Math.sin(a) * ry * d, cx + Math.cos(a) * rx * d, s, i]);
  }
  list.sort((p, q) => p[0] - q[0]);
  for (const [y, x, s, i] of list) lay(g, y < warmY ? 'cool' : 'billow', x, y, s, i, seed, pose, amp, top);
}
