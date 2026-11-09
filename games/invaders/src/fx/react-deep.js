// The two powers of Lantern Deep (world 15), told as the deep's: the pearls and the trident. A bullet a pearl wipes
// (the core's 'pearlBlock', x, y at the pearl) flares the pearl in a pearly flash, a thin ring and a few specks of
// nacre; an alien a pearl bites ('pearlHit', at the alien) gets a rose-and-aqua spark. The trident's shot leaves the
// ship with an aqua flash at the muzzle (a 'fire' of power 'trident'), and every alien it strikes while the power
// runs, one at each alien it runs through, gets an aqua streak of sparks on top of the usual ones: on a 'hit' if the
// alien lives, on its 'kill' if it dies. The bubble that spirals into the maelstrom is react-maelstrom.js; the drawing
// of the pearls and the bolt is ui/ship-deep.js and shots-deep.js. Each wrapper (tridentFor, hitFor, killFor) calls
// the world's usual reaction first, so every other world sees exactly what it always saw. Pure: randomness comes from `rng`, nothing is drawn, `world` is only read.
import { addFlash, addRing } from './fx.js';
import { sparks } from './emit.js';
import { FIGHT } from './react-fight.js';
import { WORLD } from './react-world.js';
import { absorbFor } from './react-maelstrom.js';

export const DEEP_WORLD = 15;
const NACRE = ['#ffffff', '#ffd8f0', '#e6cdf4', '#bff4ff'];
const ROSE = ['#ffffff', '#ff8ad0', '#ffd8f0', '#5af0ff'];
const AQUA = ['#ffffff', '#5af0ff', '#bff4ff', '#9affc8'];

const inDeep = (world) => world?.level?.world === DEEP_WORLD;
const tridentRuns = (world) => inDeep(world) && world.ship?.power?.kind === 'trident';

// A bullet wiped by a pearl: the pearl flares.
function pearlBlock(fx, ev, rng) {
  addFlash(fx, { x: ev.x, y: ev.y, r: 46, color: '#ffd8f0', alpha: 0.95, life: 0.14, tag: 'pearl' });
  addRing(fx, { x: ev.x, y: ev.y, r0: 8, maxR: 46, width: 2, color: '#bff4ff', life: 0.22 });
  sparks(fx, rng, ev.x, ev.y, 3, 240, NACRE);
}

// An alien bitten by a pearl: a spark on it.
function pearlHit(fx, ev, rng) {
  addFlash(fx, { x: ev.x, y: ev.y, r: 42, color: '#bff4ff', alpha: 0.9, life: 0.09, tag: 'hit' });
  addRing(fx, { x: ev.x, y: ev.y, r0: 6, maxR: 54, width: 2, color: '#ff8ad0', life: 0.2 });
  sparks(fx, rng, ev.x, ev.y, 7, 300, ROSE);
}

// The trident's shot leaving the ship: the usual reaction, then an aqua flash at the muzzle.
export const tridentFor = (fire) => (fx, ev, rng, world) => {
  fire(fx, ev, rng, world);
  if (ev.side !== 'ship' || ev.power !== 'trident') return;
  addFlash(fx, { x: ev.x, y: ev.y, r: 40, color: '#5af0ff', alpha: 0.9, life: 0.07, tag: 'muzzle' });
  sparks(fx, rng, ev.x, ev.y, 2, 220, AQUA);
};

// The aqua streak a bolt leaves where it struck.
function streak(fx, ev, rng) {
  addFlash(fx, { x: ev.x, y: ev.y, r: 34, color: '#5af0ff', alpha: 0.9, life: 0.08, tag: 'hit' });
  sparks(fx, rng, ev.x, ev.y, 4, 330, AQUA);
}

// A hit or a kill while the trident runs: the usual reaction, then the streak, so a bolt leaves its mark at each
// alien it passes, whether it lives or dies. A hit that did nothing (dmg 0) leaves none.
export const hitFor = (hit) => (fx, ev, rng, world) => {
  hit(fx, ev, rng, world);
  if (tridentRuns(world) && ev.dmg > 0) streak(fx, ev, rng);
};
export const killFor = (kill) => (fx, ev, rng, world) => {
  kill(fx, ev, rng, world);
  if (tridentRuns(world)) streak(fx, ev, rng);
};

export const DEEP = {
  pearlBlock, pearlHit, fire: tridentFor(FIGHT.fire), hit: hitFor(FIGHT.hit), kill: killFor(FIGHT.kill),
  absorb: absorbFor(WORLD.absorb),
};
