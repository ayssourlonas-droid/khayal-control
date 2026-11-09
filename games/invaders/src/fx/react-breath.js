// World 17's breath (Ash to Air), told as help sent: a front of fresh air rises from the foot of the field and every enemy bullet it
// passes is wiped (core/twists-3.js; ui/breath-view.js draws the front and its craft). Two events:
//   breath { y0, y1, dur }   the craft launch: a soft mint-white bloom along the foot of the field (five wide flashes) and a few
//                            leaves and sparkles rising out of it (at most 20 particles, ten of each, thinned by the quality scaler)
//   cleanse { x, y }         a bullet wiped: a tiny white-mint flash where it was (r 14-20, about a tenth of a second), a four-point
//                            twinkle and two sparks in white, pale mint and sky blue, drifting up like air. Never bullet-like: cool
//                            and pale, nothing magenta.
// A breath can wipe a hundred bullets in under a second, and the particle pool is 600 and each fx list 64, so the sparkles come out
// of a budget on the fx itself: it holds BURST sparkles and refills at RATE a second of fx.time, so a flood of events in one tick
// sparkles BURST of them and a long sweep sparkles evenly, about the pace the bullets fall. The leaf and twinkle particle kinds are
// drawn by ui/breath-fx-view.js. Pure: randomness comes from `rng`, nothing is drawn, `world` is not read.
import { addFlash, BREATH_BURST } from './fx.js';
import { addParticle } from './particles.js';
import { count } from './emit.js';
import { between, pick } from '../core/rng.js';
import { WIDTH, HEIGHT } from '../core/kinds.js';
import { TAU } from '../core/math.js';

export const BURST = BREATH_BURST; // wiped bullets that may sparkle at once
export const RATE = 80; // more sparkles a second the budget gives
const COOL = ['#ffffff', '#cffff0', '#8fd8ff']; // white, pale mint and sky blue
const FLASH = ['#e8fff4', '#ffffff', '#d6f4ff'];
const FOOT = 40; // px above the field's foot the bloom sits at
const LEAVES = 12; // ui/breath-leaf.js: four shapes in three greens

// One more sparkle if the budget allows (it is on the fx, made by createFx and full until the first sparkle).
function spend(fx) {
  const b = fx.breathBudget;
  b.n = Math.min(BURST, b.n + Math.max(0, fx.time - b.t) * RATE);
  b.t = fx.time;
  if (b.n < 1) return false;
  b.n -= 1;
  return true;
}

function twinkle(fx, rng, x, y, size, life) {
  const shape = rng() < 0.5 ? 0 : 1;
  addParticle(fx, { x, y, vx: 0, vy: -70, life, size, kind: 'twinkle', shape, color: COOL[shape], additive: true });
}

function breath(fx, ev, rng) {
  const y = (ev.y0 ?? HEIGHT) - FOOT;
  for (let i = 0; i < 5; i++) addFlash(fx, { x: 192 + i * 384, y, r: 250, color: '#9ff2d4', alpha: 0.45, life: 0.28, ramp: 0.2, tag: 'breath' });
  for (let i = 0, n = count(fx, 10); i < n; i++) {
    addParticle(fx, {
      x: between(rng, 80, WIDTH - 80), y: y + between(rng, -30, 30), vx: between(rng, -70, 70), vy: between(rng, -520, -300), life: between(rng, 0.9, 1.4),
      size: between(rng, 9, 16), kind: 'leaf', shape: Math.floor(rng() * LEAVES), color: '#4fcd68', drag: 1.1, gravity: -20,
    });
  }
  for (let i = 0, n = count(fx, 10); i < n; i++) twinkle(fx, rng, between(rng, 60, WIDTH - 60), y + between(rng, -40, 30), between(rng, 8, 14), between(rng, 0.5, 0.9));
}

function cleanse(fx, ev, rng) {
  if (!spend(fx)) return;
  addFlash(fx, { x: ev.x, y: ev.y, r: between(rng, 14, 20), color: pick(rng, FLASH), alpha: 0.9, life: between(rng, 0.1, 0.14), tag: 'cleanse' });
  twinkle(fx, rng, ev.x, ev.y, between(rng, 9, 13), 0.3);
  for (let i = 0, n = count(fx, 2); i < n; i++) {
    const a = rng() * TAU;
    const v = between(rng, 60, 200);
    addParticle(fx, {
      x: ev.x, y: ev.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 90, life: between(rng, 0.25, 0.5), size: between(rng, 1.4, 2.4), grow: -2.5,
      color: pick(rng, COOL), kind: 'spark', gravity: -50, drag: 2.5, additive: true,
    });
  }
}

export const BREATH = { breath, cleanse };
