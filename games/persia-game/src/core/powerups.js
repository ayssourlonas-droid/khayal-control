import { clamp, dist2 } from './math.js';
import { rand, randPick } from './rng.js';
import { POWERS, HEIGHT } from './kinds.js';
import { SHIP_R, ZONE } from './ship.js';
import { emit, prune } from './util.js';
import { awardPickup } from './scoring.js';

// What carriers drop, and what the ship does with it.
//   pickup = { kind, x, y, vy, r }  kind is one of POWERS or 'bomb' (makePickup).
//   ship.power = null | { kind, left }  one at a time; a new pickup replaces it and restarts `left`.
// The effects live where they act: the gun in ship.js (spread, rapid), the shield in hitShip, the
// beam and the bomb in weapons.js. Every pickup collected scores (awardPickup), and the clear sweeps up
// the ones still falling (sweepPickups).

export const POWER_TIME = 10; // s
export const BOMB_MAX = 3;
const PICKUP_R = 22;
const FALL = 160; // px/s
const BOMB_SHARE = 0.2; // of drops: a bomb instead of a power

// A pickup at (x, y), falling.
export const makePickup = (kind, x, y) => ({ kind, x, y, vy: FALL, r: PICKUP_R });

// A carrier died at `from`: 20 % a bomb, 80 % one of the four powers.
export function dropPickup(world, from) {
  const bomb = rand(world.rng) < BOMB_SHARE;
  const kind = bomb ? 'bomb' : randPick(world.rng, POWERS);
  world.pickups.push(makePickup(kind, clamp(from.x, ZONE.x0, ZONE.x1), from.y));
}

function collect(world, p) {
  const ship = world.ship;
  emit(world, 'pickup', awardPickup(world, p));
  if (p.kind === 'bomb') {
    ship.bombs = Math.min(BOMB_MAX, ship.bombs + 1);
  } else {
    ship.power = { kind: p.kind, left: POWER_TIME };
    emit(world, 'power', { kind: p.kind, on: true });
  }
}

// Pickups fall, the ship takes the ones it touches, and the ones below the floor are dropped.
export function stepPickups(world, dt) {
  const ship = world.ship;
  const reach = (PICKUP_R + SHIP_R) ** 2;
  prune(world.pickups, (p) => {
    p.y += p.vy * dt;
    if (ship.alive && dist2(p, ship) <= reach) {
      collect(world, p);
      return false;
    }
    return p.y - p.r < HEIGHT;
  });
}

// The level is cleared: every pickup still in the air is the ship's, in drop order. Its points count
// (before the clear is announced), its power or bomb comes too late to use. Each `sweep` says which of
// the run it is (`nth`, 0 first) so that the sound and the ship's glow can build up along it.
export function sweepPickups(world) {
  world.pickups.forEach((p, nth) => emit(world, 'sweep', { ...awardPickup(world, p), nth }));
  world.pickups.length = 0;
}

export function tickPower(world, dt) {
  const ship = world.ship;
  if (!ship.power) return;
  ship.power.left -= dt;
  if (ship.power.left > 0) return;
  emit(world, 'power', { kind: ship.power.kind, on: false });
  ship.power = null;
}
