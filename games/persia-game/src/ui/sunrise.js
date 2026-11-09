// Sunrise, the sixth kind of weather (levels.js weatherOf, ui/weather.js): level 8's dawn warming the
// sky low over the mountains (dawn.js), and over it the sun, a small disc of pixel blocks that climbs
// out from behind the far mountains until about half of it shows, then stays. Drawn in the sky phase,
// before the parallax layers, so the mountains and the landmark stand in front of it and hide what is
// still below them. The moon and the baked stars lie above the dawn and stay as they were.
// The sun is drawn live, row by row, as fillRects: a block is BLOCK px (two PIXELs) and every rect is
// on the 8 px grid, so it climbs a whole block at a time. A near-white core in a pale gold, a gold
// rim, and a few faint rings of the same gold round it at low alpha. It stands opposite the moon,
// mirrored about the screen's middle, right of the landmark (the layer's centre). Its colours and
// place are constants here, as the moon's and dawn's are (the look is not asked); where it stands once
// risen is set against level 9's far ridge.
//   drawSunrise(ctx, k, t, quality, reduced, age)   k 0..1 how far the weather has faded in, scaling
//     every alpha; age the seconds since the weather began (weather.js), the climb's clock. Under
//     reduced motion the sun stands at its height from the start; t and the quality change nothing
//     (the voice has named the sun)
import { W, PIXEL } from './sprites.js';
import { MOON } from './sky-bodies.js';
import { drawDawn } from './dawn.js';
import { smooth } from '../core/math.js';

const BLOCK = 2 * PIXEL; // 8
const R = 13; // the disc's radius in blocks: 104 px, about half the moon's
const RISE = 60; // s from just under the ridge to half the disc above it
const SUN = { x: W - MOON.x, y: 928 }; // its centre once risen: opposite the moon, half of it over level 9's far ridge
const TONES = ['#ffbd3d', '#ffe27a', '#fffbe6']; // gold rim, pale gold, near-white core
const RINGS = [[R + 6, 0.035], [R + 4, 0.05], [R + 2, 0.07]]; // radius in blocks, alpha

// A disc of radius R blocks about the origin as spans [dx, dy, w] in px, a row of blocks at a time, one
// list per tone: toneAt(d) is the tone of a cell whose centre is d blocks out, -1 for none, and the
// cells of one tone side by side in a row make one span.
function spans(toneAt, count, r = R) {
  const out = Array.from({ length: count }, () => []);
  for (let j = -r; j < r; j++) {
    let run = -1;
    let start = 0;
    for (let i = -r; i <= r; i++) {
      const tone = i < r ? toneAt(Math.hypot(i + 0.5, j + 0.5)) : -1;
      if (tone === run) continue;
      if (run >= 0) out[run].push([start * BLOCK, j * BLOCK, (i - start) * BLOCK]);
      [run, start] = [tone, i];
    }
  }
  return out;
}

// What is drawn, bottom to top: [colour, alpha, spans]; the rings, then the rim, the pale gold and the core.
const LAYERS = [
  ...RINGS.map(([r, alpha]) => [TONES[0], alpha, spans((d) => (d <= r ? 0 : -1), 1, r)[0]]),
  ...spans((d) => (d > R ? -1 : d > R - 1.5 ? 0 : d > R - 3.5 ? 1 : 2), TONES.length).map((rects, i) => [TONES[i], 1, rects]),
];

export function drawSunrise(ctx, k, _t, _quality, reduced, age) {
  if (k <= 0) return;
  drawDawn(ctx, k);
  const below = reduced ? 0 : Math.round((1 - smooth(age / RISE)) * (R + 1)); // blocks under its height
  for (const [colour, alpha, rects] of LAYERS) {
    ctx.globalAlpha = k * alpha;
    ctx.fillStyle = colour;
    for (const [dx, dy, w] of rects) ctx.fillRect(SUN.x + dx, SUN.y + below * BLOCK + dy, w, BLOCK);
  }
  ctx.globalAlpha = 1;
}
