// The broadside twist in Sunset Armada (world 13), told as a ship of the line's: every side shot is a gun going
// off, a hot flash at the barrel and a plume of powder smoke flung out along it, cream where the sun catches
// it and violet in its shade; and the guns opening (a pickup caught) is a burst at both flanks, a ring and
// a rush of smoke, with BROADSIDE written over the ship. The core only emits these in world 13, so there is
// no world to branch on there; the wingmen's muzzle flashes ride on the ship's own `fire` (fireFor), which
// is world 13's alone. Pure: randomness comes from `rng`.
import { addFlash, addRing, addPopup } from './fx.js';
import { addParticle } from './particles.js';
import { between, pick } from '../core/rng.js';
import { count, sparks } from './emit.js';
import { escortsOf, MUZZLE } from '../core/ship.js';

export const ARMADA_WORLD = 13;
const PORT = 22; // px: where the side guns sit (GUN_DX in core/ship.js)
const SMOKE = ['#f4e4d0', '#dcc4c8', '#b8a4c4', '#9a88b0'];
const POWDER = ['#fff0c0', '#ffc860', '#ff9a3a'];
const BRASS = '#ffc860';

// A plume of k puffs off a barrel at (x, y) flung out along dir (-1 left, 1 right), slowing and rising.
function plume(fx, rng, x, y, dir, k, speed) {
  for (let i = 0, m = count(fx, k); i < m; i++) {
    addParticle(fx, {
      x: x + dir * between(rng, 6, 16), y: y + between(rng, -6, 6), vx: dir * between(rng, speed * 0.3, speed), vy: between(rng, -60, 10),
      life: between(rng, 0.6, 1.1), size: between(rng, 8, 13), grow: 16, color: pick(rng, SMOKE), kind: 'smoke', drag: 2.4, gravity: -22,
    });
  }
}

// One gun going off.
function sideShot(fx, ev, rng) {
  const dir = ev.dir ?? 1;
  addFlash(fx, { x: ev.x + dir * 12, y: ev.y, r: 46, color: '#ffb054', alpha: 0.95, life: 0.09, tag: 'muzzle' });
  plume(fx, rng, ev.x, ev.y, dir, 3, 240);
  sparks(fx, rng, ev.x + dir * 12, ev.y, 3, 360, POWDER);
}

// The guns opening: a flash, a ring and a rush of smoke at each flank, and the word over the ship. They
// closing: a wisp of smoke from each barrel as it is run in.
function broadside(fx, ev, rng) {
  for (const dir of [-1, 1]) {
    const x = ev.x + dir * PORT;
    if (ev.on) {
      addFlash(fx, { x: x + dir * 10, y: ev.y, r: 70, color: '#ffb054', life: 0.16, tag: 'muzzle' });
      addRing(fx, { x: x + dir * 10, y: ev.y, maxR: 84, width: 3, color: BRASS, life: 0.35 });
      plume(fx, rng, x, ev.y, dir, 6, 320);
      sparks(fx, rng, x + dir * 10, ev.y, 6, 420, POWDER);
    } else {
      plume(fx, rng, x, ev.y, dir, 2, 90);
    }
  }
  if (ev.on) addPopup(fx, { x: ev.x, y: ev.y - 120, text: 'BROADSIDE', color: BRASS, scale: 1.1, life: 1.1 });
}

export const ARMADA = { sideShot, broadside };

// The ship's volley with the wingmen's: the ship's own flash everywhere, and in world 13 one at the muzzle of
// each escort that flies beside it.
export const fireFor = (fire) => (fx, ev, rng, world) => {
  fire(fx, ev, rng, world);
  if (ev.side !== 'ship' || world?.level?.world !== ARMADA_WORLD) return;
  for (const e of escortsOf(world.ship)) addFlash(fx, { x: e.x, y: e.y - MUZZLE, r: 22, color: '#ffe8a0', life: 0.05, tag: 'muzzle' });
};
