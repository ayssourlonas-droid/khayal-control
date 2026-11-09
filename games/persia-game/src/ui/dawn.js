// Dawn, the fifth kind of weather (levels.js weatherOf, ui/weather.js): low over the mountains the
// night sky the bake painted warms in flat horizontal bands, violet into rose into amber, thin at the
// top and fading up into the night; it is the bake's red glow (sky-bodies.js horizonGlow) coming to
// light. Drawn in the sky phase, before the parallax layers, so the mountains and the landmark stand
// in front of it. The first band starts just under the red moon's disc and the baked stars lie
// above it, so neither is tinted; the few twinkles lower down (ambient.js) take its colour.
// Bands, not a gradient, like the sky's own pixel blocks: each is a fillRect across the screen,
// BAND tall, a whole number of PIXEL blocks, on the sky's grid. A band's alpha rises from 0 at TOP
// to 1 at FOOT, slowly at first so the upper sky stays night; from FOOT to the bottom of the screen
// the dawn is at full strength. Its colours are constants here, as the moon's and the stars' are
// (the look is not asked).
//   drawDawn(ctx, k)   k 0..1 how far it has come in, scaling every band's alpha. weather.js also
//     passes t, the quality, reduced motion and the weather's age; dawn has no motion and no sprite,
//     so it takes none of them (the voice has named the dawn)
import { W, H, PIXEL, mix } from './sprites.js';
import { MOON } from './sky-bodies.js';

const TOP = Math.ceil((MOON.y + MOON.r) / PIXEL) * PIXEL; // 568: just under the red moon
const FOOT = 824; // where the dawn is at full strength, to the bottom
const BAND = 16; // four PIXEL blocks
const EASE = 1.6; // the ramp's curve: above 1, the night holds higher up
const STOPS = [[0, '#4a2078'], [0.5, '#e0587c'], [0.8, '#f98c5a'], [1, '#ffbc5c']]; // violet, rose, amber

// The colour u (0 up to 1) of the way from TOP to FOOT: the stops, blended between.
function colourAt(u) {
  const i = STOPS.findIndex(([at]) => at > u);
  const [a, from] = STOPS[i - 1];
  const [b, to] = STOPS[i];
  return mix(from, to, (u - a) / (b - a));
}

// [y, height, colour, alpha] top to bottom: the ramp, then the full strength under it.
const N = (FOOT - TOP) / BAND;
const BANDS = Array.from({ length: N }, (_, i) => [TOP + i * BAND, BAND, colourAt(i / N), (i / N) ** EASE]);
BANDS.push([FOOT, H - FOOT, STOPS.at(-1)[1], 1]);

export function drawDawn(ctx, k) {
  if (k <= 0) return;
  for (const [y, h, colour, alpha] of BANDS) {
    ctx.globalAlpha = k * alpha;
    ctx.fillStyle = colour;
    ctx.fillRect(0, y, W, h);
  }
  ctx.globalAlpha = 1;
}
