// The cut in Aurora Kingdom (world 11), where the shuriken twist's shots are shards of ice: a ship's shot
// that touches one shatters it like glass, a white flash, a ring and a burst of tumbling slivers and
// glitter in place of the steel sparks every other world sees. Pure: randomness comes from `rng`.
import { addFlash, addRing } from './fx.js';
import { addParticle } from './particles.js';
import { between, pick } from '../core/rng.js';
import { TAU } from '../core/math.js';
import { count, sparks } from './emit.js';

export const ICE_WORLD = 11;
const GLASS = ['#ffffff', '#bff4ff', '#8ad0ff', '#d8ecff'];

function shatter(fx, ev, rng) {
  addFlash(fx, { x: ev.x, y: ev.y, r: 52, alpha: 0.9, life: 0.1, tag: 'cut', color: '#bff4ff' });
  addRing(fx, { x: ev.x, y: ev.y, r0: 6, maxR: 66, width: 2, color: '#bff4ff', life: 0.26 });
  for (let i = 0, m = count(fx, 14); i < m; i++) {
    const a = rng() * TAU;
    const v = between(rng, 120, 460);
    addParticle(fx, {
      x: ev.x, y: ev.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: between(rng, 0.5, 1),
      size: between(rng, 3, 7), grow: -2.4, color: pick(rng, GLASS), kind: 'shard', gravity: 420, drag: 0.8,
    });
  }
  sparks(fx, rng, ev.x, ev.y, 6, 380, ['#ffffff', '#bff4ff']);
}

// The reaction to a cut: the world's steel one everywhere, glass in world 11.
export const cutFor = (steel) => (fx, ev, rng, world) => (world?.level?.world === ICE_WORLD ? shatter(fx, ev, rng) : steel(fx, ev, rng, world));
