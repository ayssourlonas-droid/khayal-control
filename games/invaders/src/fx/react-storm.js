// World 18's electrical effects (Anvil Sky), told as lightning. Two borrowed ones, the broadside's side shots and the guns opening
// and closing, which react-armada.js tells as cannon fire in world 13; the wrappers below tell them as arcs in world 18 and call
// the usual reaction anywhere else (the core emits both events in both worlds now, so the world has to be asked): a side shot is a
// blue-white muzzle flash, a thin ring, a fan of jagged arcs and a few sparks; the guns opening is a flash, a ring, a bigger fan
// and a rush of sparks at each flank with ARC GUNS written over the ship, and shutting a few fading sparks. And one of its own,
// `backfire` (core/free.js, R67: an enemy homing bullet the ship has dragged round into the first alien it crosses, or else a boss part):
// an ELECTRIC BURST ON THE ALIEN OR PART, a white flash, two rings, five arcs thrown every way, a spray of sparks in cyan and yellow and a short BACKFIRE under it (a kill's score rises over it).
// An arc is ONE ring of kind 'arc' that draws itself from its age (ui/arc-fx-view.js, from its seed, so no particle is spent and the
// cap is never touched): { x, y, r (its length now, easing out to maxR), n bolts, ang and spread (the fan), seed, color }.
// Pure: randomness comes from `rng`, nothing is drawn, `world` is only read.
import { addFlash, addRing, addPopup } from './fx.js';
import { sparks } from './emit.js';
import { ARMADA } from './react-armada.js';

export const STORM_WORLD = 18;
const CYAN = '#5cf0ff'; // the ship's accent in this world (looks/w18.js)
const ICE = '#bfeaff';
const SPARK = ['#ffffff', ICE, CYAN, '#fff2a8'];
const PORT = 22; // px: where the side guns sit (GUN_DX in core/ship.js)

const inStorm = (world) => world?.level?.world === STORM_WORLD;

// n jagged arcs leaving (x, y) up to `reach` px, spread over `ang` +- `spread` radians.
function arcs(fx, rng, x, y, n, reach, ang, spread, life) {
  addRing(fx, { kind: 'arc', x, y, r0: 0, maxR: reach, n, ang, spread, seed: Math.floor(rng() * 1e6), color: CYAN, width: 1, life });
}

const facing = (dir) => (dir < 0 ? Math.PI : 0);

const sideShotFor = (usual) => (fx, ev, rng, world) => {
  if (!inStorm(world)) {
    usual(fx, ev, rng, world);
    return;
  }
  const dir = ev.dir ?? 1;
  const x = ev.x + dir * 10;
  addFlash(fx, { x: ev.x + dir * 12, y: ev.y, r: 40, color: ICE, alpha: 0.95, life: 0.08, tag: 'muzzle' });
  addRing(fx, { x, y: ev.y, r0: 4, maxR: 36, width: 2, color: CYAN, life: 0.2 });
  arcs(fx, rng, x, ev.y, 2, 40, facing(dir), 0.8, 0.16);
  sparks(fx, rng, x, ev.y, 3, 380, SPARK);
};

const broadsideFor = (usual) => (fx, ev, rng, world) => {
  if (!inStorm(world)) {
    usual(fx, ev, rng, world);
    return;
  }
  for (const dir of [-1, 1]) {
    const x = ev.x + dir * (PORT + 10);
    if (ev.on) {
      addFlash(fx, { x, y: ev.y, r: 70, color: ICE, life: 0.16, tag: 'muzzle' });
      addRing(fx, { x, y: ev.y, maxR: 86, width: 3, color: CYAN, life: 0.35 });
      arcs(fx, rng, x, ev.y, 4, 72, facing(dir), 1.3, 0.3);
      sparks(fx, rng, x, ev.y, 7, 440, SPARK);
    } else {
      sparks(fx, rng, ev.x + dir * PORT, ev.y, 3, 150, SPARK);
    }
  }
  if (ev.on) addPopup(fx, { x: ev.x, y: ev.y - 120, text: 'ARC GUNS', color: CYAN, scale: 1.1, life: 1.1 });
};

// An enemy bullet turned on its own side: it hit an alien, or a boss part (role 'boss'), at (ev.x, ev.y).
function backfire(fx, ev, rng) {
  addFlash(fx, { x: ev.x, y: ev.y, r: 90, color: ICE, alpha: 0.95, life: 0.14, tag: 'blast' });
  addRing(fx, { x: ev.x, y: ev.y, r0: 6, maxR: 84, width: 2.5, color: CYAN, life: 0.32 });
  addRing(fx, { x: ev.x, y: ev.y, r0: 4, maxR: 52, width: 1.5, color: '#fff2a8', life: 0.22 });
  arcs(fx, rng, ev.x, ev.y, 5, 76, 0, Math.PI, 0.3);
  sparks(fx, rng, ev.x, ev.y, 8, 400, SPARK);
  addPopup(fx, { x: ev.x, y: ev.y + 52, text: 'BACKFIRE', color: CYAN, scale: 0.8, life: 0.8, vy: 30 }); // under the hit: a kill's score rises over it
}

export const STORM = { sideShot: sideShotFor(ARMADA.sideShot), broadside: broadsideFor(ARMADA.broadside), backfire };
