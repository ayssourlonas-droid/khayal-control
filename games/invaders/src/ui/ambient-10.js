// Ambient kinds of Anvil Sky (same contract as ambient.js): stormrain, wind-slanted streaks of rain in three depths (a.phase: fine
// and faint in the sky behind the clouds, longer in the middle, long and fast in front of the field), one stroke a colour, nothing
// allocated; and staticglints, the small cold sparks that flare on the wind now and then and fade (St. Elmo's fire), additive,
// drawn from the cached glow and star sprites. Both are dim on purpose: the bullets, the aliens and the ship are the loudest things on
// screen. Every position is a function of the index, the time and the wind's drift, so nothing is simulated.
import { W, H, hash, wrap, glow, star } from './sprites.js';
import { clamp, TAU } from '../core/math.js';

const SALT = { sky: 0, mid: 3001, front: 7001, screen: 11001 }; // one kind in two phases must not repeat its pattern
export const RAIN = { width: { sky: 1, mid: 1.5, front: 2.4 }, slant: 0.34, gale: 220 }; // line width a phase draws; the fall's lean; px/s of wind that bends it by 1

// Rain: streak i of colour c is on every colours.length-th index from c; its length is the entry's size, its fall the entry's speed.
function stormrain(ctx, a, t, drift, wind) {
  const [s0, s1] = a.size;
  const salt = SALT[a.phase] ?? 0;
  const slant = clamp(wind / RAIN.gale, -0.6, 0.6) + RAIN.slant;
  ctx.lineWidth = RAIN.width[a.phase] ?? 1.5;
  ctx.lineCap = 'round';
  ctx.globalAlpha = a.alpha;
  const reach = H * (a.maxY ?? 1);
  for (let c = 0; c < a.colors.length; c++) {
    ctx.strokeStyle = a.colors[c];
    ctx.beginPath();
    for (let i = c; i < a.n; i += a.colors.length) {
      const k = i * 5 + salt;
      const len = s0 + (s1 - s0) * hash(k + 4);
      const y = wrap(hash(k + 3) * (reach + 240) + t * a.speed * (0.8 + 0.4 * hash(k + 1)), -120, reach + 120);
      const x = wrap(hash(k + 2) * (W + 400) + y * slant + drift * 0.25, -200, W + 200);
      ctx.moveTo(x, y);
      ctx.lineTo(x - slant * len, y - len);
    }
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
}

// Sparks: each sits where the wind put it and flares in a cycle of its own: a long dark stretch, then a short bright one that dies away, a
// four-point glint at the peak of the bigger ones. It drifts a little, so a spark is never twice in one place.
function staticglints(ctx, a, t, drift) {
  const [s0, s1] = a.size;
  const salt = SALT[a.phase] ?? 0;
  const reach = H * (a.maxY ?? 0.9);
  for (let i = 0; i < a.n; i++) {
    const k = i * 5 + salt;
    const rate = 0.5 + 0.9 * hash(k + 4);
    const cycle = t * rate + hash(k + 3) * 40;
    const flare = Math.max(0, Math.sin((cycle % 40) * TAU / 4 - 1)) ** 10 * (Math.floor(cycle / 4) % 3 === 0 ? 0 : 1); // some cycles it skips
    if (flare < 0.04) continue;
    const size = s0 + (s1 - s0) * hash(k + 2);
    const x = wrap(hash(k + 1) * (W + 200) - t * 14 + drift * 0.4, -100, W + 100);
    const y = hash(k) * reach + Math.sin(t * 0.7 + hash(k + 5) * TAU) * 10;
    const color = a.colors[i % a.colors.length];
    ctx.globalAlpha = a.alpha * flare;
    ctx.drawImage(glow(color), x - size * 4, y - size * 4, size * 8, size * 8);
    if (size > 3.4 && flare > 0.5) ctx.drawImage(star(color), x - size * 2.6, y - size * 2.6, size * 5.2, size * 5.2);
  }
}

export const AMBIENT10 = { stormrain, staticglints };
