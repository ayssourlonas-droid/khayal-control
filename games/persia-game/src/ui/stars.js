// Falling stars, the weather of a level that has them (levels.js weatherOf, ui/weather.js): a shower
// of the shooting stars flourish.js draws, same slope and length and the same white head, many at
// once across the upper sky. Drawn in the sky phase, before the parallax layers, so the mountains
// and the landmark cover them and they set behind these instead of crossing in front of what fights.
// Stateless like rain.js: every star's place is a function of its lane and the time t. Batched: all the
// tails are one path (a thin tapering wedge each, so no per-star gradient) and the heads are the
// cached glow sprite.
//   drawStars(ctx, k, t, quality, reduced)   k 0..1 how far it has faded in; fewer, slower stars under
//     reduced motion; half as many lanes at half quality, never none, since the voice has named them
import { W, hash, glow, lighter, normal } from './sprites.js';
import { SHOOT } from './flourish.js';

const LIFE = 1.1; // s a star lasts
const WEDGE = [1.05, 2]; // half the tail's width at the head, across its direction
const FILL = 'rgba(205, 222, 255, 0.6)';

export function drawStars(ctx, k, t, quality, reduced) {
  if (k <= 0) return;
  const lanes = Math.round((reduced ? 6 : 14) * quality);
  const clock = t * (reduced ? 0.45 : 1);
  lighter(ctx); // additive: the order of tails and heads does not matter
  ctx.beginPath();
  for (let lane = 0; lane < lanes; lane++) {
    const period = 1.1 + hash(lane * 2) * 0.6;
    const beat = clock / period + hash(lane * 2 + 1);
    const slot = Math.floor(beat);
    const seed = (slot * 32 + lane) * 4;
    const age = (beat - slot) * period;
    if (age > LIFE || hash(seed) < 0.1) continue; // a lane rests some beats
    const x = 300 + hash(seed + 1) * (W - 300) - age * SHOOT.fall[0];
    const y = 40 + hash(seed + 2) * 480 + age * SHOOT.fall[1];
    const grow = Math.min(1, age * 6);
    const fade = 1 - age / LIFE;
    const tail = grow * Math.min(1, fade * 2); // full length until half its life, then it shortens
    ctx.moveTo(x + WEDGE[0], y + WEDGE[1]);
    ctx.lineTo(x + SHOOT.run * tail, y - SHOOT.rise * tail);
    ctx.lineTo(x - WEDGE[0], y - WEDGE[1]);
    ctx.globalAlpha = k * grow * fade;
    ctx.drawImage(glow('#ffffff'), x - 14, y - 14, 28, 28);
  }
  ctx.globalAlpha = k;
  ctx.fillStyle = FILL;
  ctx.fill();
  normal(ctx);
}
