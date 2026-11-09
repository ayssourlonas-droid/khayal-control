// Persepolis at night, the parallax layer kind 'persepolis' (parallax-shapes.js has the painter
// contract), painted in PIXEL-sized blocks: the Gate of All Nations with its winged bulls, the
// Apadana's columns (whole under their double bulls, or broken), the double stairway with tribute
// bearers climbing its walls, the Tachara's door frames and the stumps of the hundred-column hall,
// all on the terrace with its crenellated edge, and fire bowls whose glows pulse. The pictures and
// their tones are persepolis-art.js; the layer brings L.lit, L.ink, L.fire and L.flame. Positions
// are blocks on the 560-block band (the frame plus parallax.js's margins), the frame's middle at 280.
import { PIXEL, mix } from '../sprites.js';
import { blocks } from './kit.js';
import { LAMASSU, CAPITAL, MERLON, FIRE, FIGURE, CYPRESS } from './persepolis-art.js';

export function persepolis(g, w, h, rng, L, lights) {
  const tone = { '#': L.color, '+': L.lit, '-': L.ink, '=': mix(L.color, L.ink, 0.45), f: L.fire, y: L.flame };
  // T: the terrace top, 35 blocks above the band's foot, so the ground layer's floor hides its lowest 14.
  const art = { ...blocks(g, tone), rng, T: h / PIXEL - 35, BW: w / PIXEL, H: h / PIXEL };
  g.save();
  g.scale(PIXEL, PIXEL);
  gate(art);
  apadana(art);
  tachara(art);
  stumps(art);
  terrace(art);
  stairway(art);
  for (const x of [42, 131, 267, 288, 357, 452]) fire(art, x, lights, L.fire);
  g.restore();
}

// Shaft of a column 6 blocks wide from `top` down to the terrace, fluted, lit on its left; a broken
// one loses a ragged bite off its top.
function shaft({ box, post, clear, rng, T }, x, top, broken) {
  const n = T - top;
  post(x, top, 6, n);
  box(x + 2, top, 1, n, '-');
  box(x + 4, top, 1, n, '-');
  if (!broken) return;
  for (let c = 0; c < 6; c++) clear(x + c, top, 1, Math.floor(rng() * 4));
}

// Two piers, a winged bull on each facing out and an inscription high up, a column between them.
function gate(a) {
  const { box, post, stamp, clear, T } = a;
  for (const [x, flip] of [[54, false], [100, true]]) {
    box(x - 1, T - 64, 26, 2);
    post(x, T - 62, 24, 62);
    stamp(LAMASSU, flip ? x + 1 : x - 3, T - 25, flip);
    inscription(a, x + 5, T - 56, 14, 6);
  }
  clear(114, T - 64, 11, 3);
  clear(118, T - 61, 7, 2);
  shaft(a, 86, T - 54, false);
  box(84, T - 56, 10, 2);
}

// A panel of cuneiform: rows of wedges cut in moonlit stone.
function inscription({ box, rng }, x, y, w, h) {
  box(x, y, w, h, '+');
  for (let r = 1; r < h - 1; r++) for (let c = 1; c < w - 1; c++) if (rng() < 0.55) box(x + c, y + r, 1, 1, '-');
}

// The Apadana: ten columns in a row, heights in blocks above the terrace; `true` crowns a whole one.
const COLUMNS = [[58, true], [34], [66], [14], [60, true], [46], [70], [24], [56, true], [40]];
function apadana(a) {
  COLUMNS.forEach(([n, crowned], i) => {
    const x = 136 + 22 * i;
    shaft(a, x, a.T - n, !crowned);
    if (crowned) a.stamp(CAPITAL, x - 6, a.T - n - CAPITAL.length);
  });
}

// The Tachara: a raised floor and three door frames under cavetto lintels, the middle one's lost.
function tachara({ box, post, slab, stamp, T }) {
  const floor = T - 6;
  slab(364, floor, 88, 6);
  [368, 397, 426].forEach((x, i) => {
    for (const jx of [x, x + 18]) {
      const top = i === 1 && jx === x ? T - 28 : T - 36;
      post(jx, top, 4, floor - top);
      stamp(FIGURE, jx + 1, T - 22);
    }
    if (i === 1) return;
    box(x - 1, T - 42, 24, 1, '+');
    box(x - 1, T - 41, 24, 1);
    box(x, T - 40, 22, 1, '-');
    box(x, T - 39, 22, 3);
  });
}

// The hundred-column hall: a field of stumps, and one column standing broken.
function stumps(a) {
  for (let i = 0; i < 7; i++) shaft(a, 462 + 13 * i, a.T - (i === 3 ? 30 : 4 + Math.floor(a.rng() * 9)), true);
}

const C = 281; // the stair landing's middle

// The terrace wall: dressed stone in courses, its top lit, merlons along its edge but over the landing.
function terrace({ box, slab, stamp, T, BW, H }) {
  slab(0, T, BW, H - T, '=');
  for (let y = T + 4, k = 0; y < H; y += 4, k++) {
    box(0, y, BW, 1, '-');
    for (let x = (k % 2) * 6; x < BW; x += 12) box(x, y + 1, 1, 3, '-');
  }
  for (let x = 0; x < BW; x += 6) if (x + 5 <= C - 9 || x >= C + 9) stamp(MERLON, x, T - 3);
}

// The double stairway: two flights of 21 steps (2 blocks deep, 1 high) up to an 18-block landing,
// merlons climbing their parapets, bearers and a cypress on their walls, an inscription between them.
const RELIEF = [[9, FIGURE], [12, FIGURE], [15, FIGURE], [18, CYPRESS]]; // [step, picture]
function stairway(a) {
  const { slab, stamp, T, H } = a;
  const n = 21;
  const G = T + n; // the flights' foot, at the ground layer's floor
  const x0 = C - 9 - 2 * n; // the left flight's foot
  for (const right of [false, true]) {
    const at = (x, wd) => (right ? 2 * C - wd - x : x); // the right flight mirrors the left
    for (let i = 0; i < n; i++) {
      slab(at(x0 + 2 * i, 2), G - 1 - i, 2, H);
      if (i % 3 === 0 && i < n - 2) stamp(MERLON, at(x0 + 2 * i, 5), G - 4 - i);
    }
    for (const [i, pic] of RELIEF) stamp(pic, at(x0 + 2 * i, 3), G + 1 - i);
  }
  slab(C - 9, T, 18, H);
  inscription(a, C - 6, T + 3, 12, 7);
}

// A fire bowl on a pole standing on the terrace at block x, its glow a pulsing layer light.
function fire({ box, stamp, T }, x, lights, color) {
  const top = T - 15;
  stamp(FIRE, x, top);
  box(x + 3, top + 7, 1, 7);
  box(x + 2, T - 1, 3, 1);
  lights.push({ x: (x + 3.5) * PIXEL, y: (top + 3) * PIXEL, r: 90, color, ph: x / 97, a: 0.6 });
}
