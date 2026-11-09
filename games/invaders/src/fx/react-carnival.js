// The fireworks twist in Ember Carnival (world 14), told as a night sky's: a shell that goes off (the core's
// 'burst' event, one per shell, one link deeper down a chain) is a chrysanthemum of sparks in its own colour
// opening to the burst's reach, a white flash, a puff of smoke and a rain of sparks and embers falling and
// fading. The colour is picked from the shell's role and its depth in the chain, so a chain of bursts goes
// off in a run of colours; a link deeper flashes harder and shakes the frame more, but throws fewer sparks, so
// the longest chain stays inside the particle cap. The core only emits 'burst' in world 14. Pure:
// randomness comes from `rng`; the bloom is a ring of kind 'bloom' that fx-view.js draws from a baked
// sprite (burst-view.js).
import { addFlash, addRing } from './fx.js';
import { addShake } from './camera.js';
import { addParticle } from './particles.js';
import { count } from './emit.js';
import { between, pick } from '../core/rng.js';
import { TAU } from '../core/math.js';
import { BURST_R } from '../core/damage.js';

// The burst colours: [the colour, its pale tip]. A grunt's burst opens in the first, a diver's in the second,
// and so on (the look's alien colours, w14.js); every link of a chain moves one colour on.
export const HUES = [
  ['#4be08a', '#a8ffc8'], ['#ff3fa0', '#ff9ad0'], ['#ffc233', '#ffe08a'], ['#ff6a3a', '#ffb090'], ['#a77bff', '#cdb4ff'], ['#4de3ff', '#a0f0ff'],
];
const ROLE_AT = { grunt: 0, diver: 1, gunner: 2, armored: 3, carrier: 4 };
export const hueOf = (kind, depth = 0) => HUES[((ROLE_AT[kind] ?? 0) + Math.max(0, depth | 0)) % HUES.length];
export const burstColor = (kind, depth = 0) => hueOf(kind, depth)[0];

export const BLOOM_LIFE = 0.85; // s the chrysanthemum hangs
const DEEP = 6; // links past which a chain no longer gets brighter or louder
const SMOKE = ['#6a4a8a', '#8a6aa0', '#4a3470'];

const links = (ev) => Math.max(0, ev.depth | 0);

// The ring of sparks leaving the shell, evenly spread with a little scatter, slowing as they go (drag) so
// they come to rest about the burst's reach (speed / drag) and then fall: every spark is a streak the
// renderer draws along its velocity.
function ring(fx, rng, ev, hue, depth) {
  const n = Math.max(10, 30 - depth * 3);
  const m = count(fx, n);
  for (let i = 0; i < m; i++) {
    const a = ((i + between(rng, -0.3, 0.3)) / m) * TAU;
    const v = between(rng, 300, 380);
    addParticle(fx, {
      x: ev.x, y: ev.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: between(rng, 0.9, 1.5),
      size: between(rng, 2, 3.2), grow: -0.9, color: i % 3 === 2 ? '#ffffff' : hue[i % 2], kind: 'spark',
      gravity: 300, drag: 2.2, additive: true,
    });
  }
}

// Embers: slow glowing specks that drift down after the sparks, the pale tip's colour.
function embers(fx, rng, ev, hue, depth) {
  for (let i = 0, m = count(fx, Math.max(4, 14 - depth)); i < m; i++) {
    const a = rng() * TAU;
    const v = between(rng, 60, 190);
    addParticle(fx, {
      x: ev.x, y: ev.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, life: between(rng, 1.2, 2),
      size: between(rng, 2.4, 3.6), grow: -0.8, color: pick(rng, [hue[1], hue[0], '#fff6d8']), kind: 'ember',
      gravity: 90, drag: 1.4, additive: true,
    });
  }
}

// A puff of powder smoke where the shell was, drifting up and widening.
function puff(fx, rng, ev) {
  for (let i = 0, m = count(fx, 3); i < m; i++) {
    addParticle(fx, {
      x: ev.x + between(rng, -22, 22), y: ev.y + between(rng, -22, 22), vx: between(rng, -34, 34), vy: between(rng, -50, -10),
      life: between(rng, 1.4, 2), size: between(rng, 14, 20), grow: 22, color: pick(rng, SMOKE), kind: 'smoke', drag: 1.1, gravity: -14,
    });
  }
}

// One shell going off.
function burst(fx, ev, rng) {
  const depth = links(ev);
  const hue = hueOf(ev.kind, depth);
  const k = Math.min(depth, DEEP);
  addRing(fx, { x: ev.x, y: ev.y, r0: 10, maxR: BURST_R, kind: 'bloom', color: hue[0], life: BLOOM_LIFE });
  addRing(fx, { x: ev.x, y: ev.y, maxR: BURST_R * 1.15, width: 3, color: hue[1], life: 0.28 });
  addFlash(fx, { x: ev.x, y: ev.y, r: 64 + 12 * k, color: '#ffffff', alpha: Math.min(1, 0.7 + 0.08 * k), life: 0.12, tag: 'burst' });
  addFlash(fx, { x: ev.x, y: ev.y, r: 120 + 14 * k, color: hue[0], alpha: 0.8, life: 0.4, tag: 'burst' });
  if (depth >= 2) addFlash(fx, { full: true, color: hue[0], alpha: Math.min(0.1, 0.02 * depth), life: 0.2, tag: 'burst' }); // faint and tinted: a chain pops every 0.12 s, so no strobe
  addShake(fx, 2 + 1.2 * k);
  ring(fx, rng, ev, hue, depth);
  embers(fx, rng, ev, hue, depth);
  puff(fx, rng, ev);
}

export const CARNIVAL = { burst };
