// Rain, the weather of a level that has it (levels.js weatherOf, ui/weather.js): thin slanting streaks
// over the backdrop and under everything that fights, so nothing that matters is hidden. Stateless
// like ambient.js: every streak's place is a function of its index and the time t.
//   drawRain(ctx, k, t, quality, reduced)   k 0..1 how far it has faded in; fewer, slower streaks under
//     reduced motion; half as many at half quality, never none, since the voice has named the rain
import { W, H, hash, wrap } from './sprites.js';

const SLANT = 0.22; // px across per px down: the wind
const COLOUR = 'rgba(176, 190, 255, 0.28)';

export function drawRain(ctx, k, t, quality, reduced) {
  if (k <= 0) return;
  const n = Math.round((reduced ? 50 : 120) * quality);
  const pace = reduced ? 0.45 : 1;
  ctx.globalAlpha = k;
  ctx.strokeStyle = COLOUR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const len = 26 + hash(i * 3 + 1) * 22;
    const y = wrap(hash(i * 3 + 2) * H + t * (1100 + hash(i * 3 + 3) * 500) * pace, -len, H);
    const x = wrap(hash(i * 3 + 4) * W - y * SLANT, 0, W);
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * SLANT, y + len);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}
