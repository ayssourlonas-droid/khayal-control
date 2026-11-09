import { MUZZLE } from './ship.js';
import { targets, inColumn, bombAll, drip } from './damage.js';
import { emit } from './util.js';

// The two weapons that are not shots: the laser power's beam and the smart bomb.

const BEAM_W = 26; // px wide
const BEAM_DPS = 8; // damage a second to every target in the column

// The beam runs from the muzzle to the top of the screen while the laser power is active and fire
// is held. It pierces: every target in the column burns. ship.beam says whether it is on this tick
// (the drawing reads it).
export function stepBeam(world, dt, input) {
  const s = world.ship;
  const on = s.alive && s.power?.kind === 'laser' && Boolean(input.fire);
  if (on && !s.beam) emit(world, 'fire', { side: 'ship', x: s.x, y: s.y - MUZZLE, power: 'laser' });
  s.beam = on;
  if (!on) return;
  const top = s.y - MUZZLE;
  const half = BEAM_W / 2;
  for (const t of targets(world)) {
    if (t.y < top && inColumn(t, s.x, half)) drip(world, t, BEAM_DPS * dt);
  }
}

// A fresh press of the bomb key (ship.bombPressed, set in stepShip) spends one bomb: every enemy
// bullet and beam goes, and everything on screen takes the bomb (damage.js bombAll).
export function stepBomb(world) {
  const s = world.ship;
  if (!s.alive || !s.bombPressed || s.bombs <= 0) return;
  s.bombs -= 1;
  const cleared = world.bullets.length;
  world.bullets.length = 0; // a wipe, not a dodge: no near miss (R37)
  emit(world, 'bomb', { x: s.x, y: s.y, cleared, left: s.bombs });
  bombAll(world);
}
