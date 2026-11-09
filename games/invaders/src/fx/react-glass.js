// The mirror twin and the mending of the Glass Cathedral (world 16), told as glass. The twin: each time the ship fires
// while the mirror power runs (a 'fire' of power 'mirror') the twin's muzzle, at x = WIDTH - ev.x (the ship mirrored
// across the field's centre line; core/ship.js twinOf), gets a pale prismatic flash and a few sparks of the rainbow;
// the power starting rings out of the twin in ice and rose with a scatter of falling glass, and ending crumbles it
// into a few falling shards. The mending (world 7's reassemble, drawn as glass): an armored alien that dies shatters,
// a rose-gold flash, a prismatic ring and a spray of glass glints, its pieces hanging on as the wreck (ui/mending-view.js);
// the wreck standing up is one ring of kind 'mend' that flies the pieces together in a flash of coloured light;
// a wreck shot down is one ring of kind 'scatter' that flings them out glinting (ui/mending-fx-view.js draws both
// from their age, so no particle is spent on them and the cap is never touched; see fx.js). Each wrapper calls
// the world's usual reaction first (or in its place), so every other world sees exactly what it always saw.
// Pure: randomness comes from `rng`, nothing is drawn, `world` is only read.
import { addFlash, addRing } from './fx.js';
import { addParticle } from './particles.js';
import { count, sparks } from './emit.js';
import { between, pick } from '../core/rng.js';
import { WIDTH } from '../core/kinds.js';
import { WRECK_TIME } from '../core/twists-2.js';
import { TAU } from '../core/math.js';
import { WORLD } from './react-world.js';
import { DEEP } from './react-deep.js';

export const GLASS_WORLD = 16;
export const MEND_LIFE = 0.45; // s the stand-up's pieces take to fly together
export const SCATTER_LIFE = 0.9; // s a shot-down wreck's pieces take to fly apart and fall
const RAINBOW = ['#ffffff', '#ff9ac8', '#ffd890', '#bff4ff', '#9ab8ff', '#d8a8ff'];
const JEWELS = ['#ff5fa2', '#4fa8ff', '#ffb04a', '#a47cff', '#ffe27a', '#d8f4ff'];

const inGlass = (world) => world?.level?.world === GLASS_WORLD;
// The wreck's seed (ui/mending-view.js seedOf): from the slot it hangs in, or from where it fell.
const seedOf = (slot, x, y) => (slot ? slot.row * 31 + slot.col * 7 + 3 : Math.round(x * 0.37 + y * 0.11));

// Glass dust of the jewel colours flung out from (x, y): k shards turning as they fall.
function shards(fx, rng, x, y, k, speed, up = 0) {
  for (let i = 0, m = count(fx, k); i < m; i++) {
    const a = rng() * TAU;
    const v = between(rng, speed * 0.3, speed);
    addParticle(fx, {
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - up, life: between(rng, 0.6, 1.1), size: between(rng, 2.4, 4.4), grow: -1.4,
      color: pick(rng, JEWELS), kind: 'shard', gravity: 380, drag: 0.8,
    });
  }
}

// The twin's muzzle: a pale flash and two sparks of the rainbow, beside the ship's own.
export const mirrorFireFor = (fire) => (fx, ev, rng, world) => {
  fire(fx, ev, rng, world);
  if (ev.side !== 'ship' || ev.power !== 'mirror' || !inGlass(world)) return;
  const x = WIDTH - ev.x;
  addFlash(fx, { x, y: ev.y, r: 36, color: '#bfe8ff', alpha: 0.9, life: 0.07, tag: 'muzzle' });
  sparks(fx, rng, x, ev.y, 2, 230, RAINBOW);
};

// The mirror power starting or ending: the twin is where it is whether or not the power still runs.
export const mirrorPowerFor = (power) => (fx, ev, rng, world) => {
  power(fx, ev, rng, world);
  if (ev.kind !== 'mirror' || !inGlass(world) || !world.ship) return;
  const [x, y] = [WIDTH - world.ship.x, world.ship.y];
  if (ev.on) {
    addRing(fx, { x, y, maxR: 150, color: '#bfe8ff', life: 0.5 });
    addRing(fx, { x, y, r0: 20, maxR: 96, width: 2, color: '#ff9ac8', life: 0.65 });
    addFlash(fx, { x, y, r: 80, color: '#d8f4ff', alpha: 0.8, life: 0.22, tag: 'muzzle' });
    shards(fx, rng, x, y, 7, 260, 40);
  } else {
    shards(fx, rng, x, y, 5, 130);
    addRing(fx, { x, y, r0: 12, maxR: 60, width: 2, color: '#bfe8ff', life: 0.3 });
  }
};

// An armored alien shattering: a flash, a prismatic ring and a spray of glints; its pieces are the wreck.
export const shatterFor = (wreck) => (fx, ev, rng, world) => {
  if (!inGlass(world)) {
    wreck(fx, ev, rng, world);
    return;
  }
  addFlash(fx, { x: ev.x, y: ev.y, r: 100, color: '#ffd0e8', alpha: 0.9, life: 0.16, tag: 'blast' });
  addRing(fx, { x: ev.x, y: ev.y, r0: 8, maxR: 110, width: 2.5, color: '#bff4ff', life: 0.4 });
  addRing(fx, { x: ev.x, y: ev.y, r0: 4, maxR: 70, width: 1.5, color: '#ffd890', life: 0.3 });
  sparks(fx, rng, ev.x, ev.y, 9, 340, RAINBOW);
  shards(fx, rng, ev.x, ev.y, 5, 260, 60);
};

// The stand-up: the pieces fly together (a 'mend' ring) from where the wreck hung, which its slot says.
export const mendFor = (reassemble) => (fx, ev, rng, world) => {
  if (!inGlass(world)) {
    reassemble(fx, ev, rng, world);
    return;
  }
  const slot = world.aliens?.find((a) => a.id === ev.id)?.slot;
  addRing(fx, { kind: 'mend', x: ev.x, y: ev.y, r0: 0, maxR: 1, width: 1, color: '#ffe9b0', seed: seedOf(slot, ev.x, ev.y), life: MEND_LIFE });
};

// A wreck shot down: a quick white flash and a 'scatter' ring that flings the pieces out, glinting, from where they
// hung: the event's slot gives the cloud's seed and its time left the cloud's age (mending-view.js drawMending).
export const scatterFor = (wreckDown) => (fx, ev, rng, world) => {
  if (!inGlass(world)) {
    wreckDown(fx, ev, rng, world);
    return;
  }
  addRing(fx, { kind: 'scatter', x: ev.x, y: ev.y, r0: 0, maxR: 1, width: 1, color: '#d8f4ff', seed: seedOf(ev.row == null ? null : ev, ev.x, ev.y), age: ev.left == null ? 0.9 : WRECK_TIME - ev.left, life: SCATTER_LIFE });
  addRing(fx, { x: ev.x, y: ev.y, r0: 6, maxR: 90, width: 2, color: '#ffffff', life: 0.25 });
  sparks(fx, rng, ev.x, ev.y, 6, 360, RAINBOW);
};

export const GLASS = {
  fire: mirrorFireFor(DEEP.fire), power: mirrorPowerFor(WORLD.power), wreck: shatterFor(WORLD.wreck),
  reassemble: mendFor(WORLD.reassemble), wreckDown: scatterFor(WORLD.wreckDown),
};
