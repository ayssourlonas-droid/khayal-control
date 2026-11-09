// Particle recipes shared by the reaction files. Every count goes through `count`, so the quality
// scaler can thin all of them at once with fx.density. Pure: randomness comes from `rng`.
import { addParticle } from './particles.js';
import { between, pick } from '../core/rng.js';
import { TAU } from '../core/math.js';

export const FIRE = ['#fff6c8', '#ffd24a', '#ff9a2e', '#ff6a1a'];
const SMOKE = ['#3a3a3f', '#55555c', '#6e6e76'];
export const METAL = ['#8d96a8', '#5b6478', '#c8d0e0'];

// Each power's colour in the fx reactions. Fixed here; the capsule, HUD and shield bubble the screens draw
// take theirs from look.power.
const POWER_COLORS = { spread: '#ffd24a', laser: '#ff4fd8', rapid: '#6ad6ff', shield: '#5cf0ff', bomb: '#ff8a3a' };
export const powerColor = (kind) => POWER_COLORS[kind] ?? '#ffffff';

export const count = (fx, k) => Math.max(1, Math.round(k * fx.density));

// k sparks flying out in every direction from (x, y), at up to `speed` px/s.
export function sparks(fx, rng, x, y, k, speed, colors = FIRE) {
  for (let i = 0, m = count(fx, k); i < m; i++) {
    const a = rng() * TAU;
    const v = between(rng, speed * 0.3, speed);
    addParticle(fx, {
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: between(rng, 0.25, 0.7),
      size: between(rng, 1.5, 3.2), grow: -2.5, color: pick(rng, colors), kind: 'spark',
      gravity: 120, drag: 2, additive: true,
    });
  }
}

// k puffs of smoke that grow and drift, scattered over `spread` px.
export function smoke(fx, rng, x, y, k, spread, size) {
  for (let i = 0, m = count(fx, k); i < m; i++) {
    addParticle(fx, {
      x: x + between(rng, -spread, spread), y: y + between(rng, -spread, spread),
      vx: between(rng, -40, 40), vy: between(rng, -40, 20), life: between(rng, 0.8, 1.5),
      size, grow: size * 1.2, color: pick(rng, SMOKE), kind: 'smoke', drag: 1.2,
    });
  }
}

// k solid shards that tumble out and fall.
export function debris(fx, rng, x, y, k, colors, speed) {
  for (let i = 0, m = count(fx, k); i < m; i++) {
    const a = rng() * TAU;
    const v = between(rng, speed * 0.3, speed);
    addParticle(fx, {
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.2, life: between(rng, 0.7, 1.4),
      size: between(rng, 2, 5), grow: -1, color: pick(rng, colors), kind: 'debris',
      gravity: 260, drag: 0.5,
    });
  }
}
