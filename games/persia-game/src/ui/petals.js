// Petals, the weather of a level that has them (levels.js weatherOf, ui/weather.js): small rose petals
// drifting down over the backdrop and under everything that fights, so nothing that matters is hidden.
// Each is one soft oval that sways across its lane and tumbles as it falls, its width opening and
// closing as it turns edge-on and face-on; nearer (bigger) petals fall a little faster. Stateless like
// rain.js: every petal's place is a function of its index and the time t. Batched: one fill per tone.
//   drawPetals(ctx, k, t, quality, reduced)   k 0..1 how far it has faded in; fewer, slower petals under
//     reduced motion; half as many at half quality, never none, since the voice has named the petals
import { W, H, hash, wrap } from './sprites.js';

const TONES = ['#f9b2c7', '#f48db0', '#fdd5e1', '#ffffff']; // rose, deeper rose, blush, white
const ALPHA = 0.7;
const EDGE = 14; // px past the frame a petal wraps at, so it leaves and enters unseen

export function drawPetals(ctx, k, t, quality, reduced) {
  if (k <= 0) return;
  const n = Math.round((reduced ? 30 : 70) * quality);
  const clock = t * (reduced ? 0.45 : 1);
  ctx.globalAlpha = k * ALPHA;
  TONES.forEach((tone, c) => {
    ctx.fillStyle = tone;
    ctx.beginPath();
    for (let i = c; i < n; i += TONES.length) {
      const h = i * 8;
      const size = 0.7 + hash(h + 1) * 0.6;
      const y = wrap(hash(h + 2) * (H + 2 * EDGE) + clock * (46 + 44 * size), -EDGE, H + EDGE);
      const sway = Math.sin(clock * (0.5 + hash(h + 3) * 0.6) + hash(h + 4) * 6.3) * (24 + hash(h + 5) * 40);
      const turn = clock * (1.1 + hash(h + 6) * 1.3) + hash(h + 7) * 6.3;
      const long = 7.5 * size;
      const wide = long * (0.35 + 0.5 * Math.abs(Math.cos(turn)));
      const x = hash(h) * W + sway;
      const tilt = Math.sin(turn * 0.7) * 0.9 + 0.5;
      ctx.moveTo(x + long * Math.cos(tilt), y + long * Math.sin(tilt)); // the oval's start, so ovals never join
      ctx.ellipse(x, y, long, wide, tilt, 0, Math.PI * 2);
    }
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}
