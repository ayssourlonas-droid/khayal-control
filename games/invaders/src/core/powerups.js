import { clamp } from './math.js';
import { rand, randPick } from './rng.js';
import { powersFor, HEIGHT, SIDE_GUNS } from './kinds.js';
import { SHIP_R, ZONE, pathDist2 } from './ship.js';
import { emit, prune } from './util.js';
import { awardPickup } from './scoring.js';

// What the dead drop (every carrier, and a killDrop(d) share of the other aliens), and what the ship
// does with it. Exports: makePickup, dropPickup, dropOnKill, stepPickups, sweepPickups, tickPower,
// powerTime, POWER_TIME, BROADSIDE_TIME, KILL_DROP, LATE_DROP, killDrop.
//   pickup = { kind, x, y, vy, r }  kind is one of POWERS (world 13 also 'wingmen', world 15 also 'pearls'
//     and 'trident', world 16 also 'mirror', world 18 also 'sideguns'), 'bomb' or 'life' (makePickup).
//   ship.power = null | { kind, left }  the one running. A new power starts at its full time and the
//     one it displaces, with its time left, waits in ship.reserve = null | { kind, left } (R53): a
//     newer displacement overwrites the reserve, and the reserve does not tick while it waits.
//     When the running power ends the reserve takes over (tickPower). Nothing carries between levels.
//   ship.broadside = seconds the side guns have left (world 13's twist, R61): any pickup caught there,
//     a power, a bomb or a life, sets it to BROADSIDE_TIME (another catch sets it back to that), and
//     tickPower counts it down. While it is above 0 every volley also fires out of both sides (shoot).
//     In world 18 (R67) only the 'sideguns' power opens them, in the same way; it costs the medal like
//     any power but leaves ship.power and the reserve alone, so it runs beside whatever power is on.
// The effects live where they act: the gun in ship.js (spread, rapid, homing, wingmen, mirror, broadside, trident),
// the pearls in pearls.js (called by collide.js), the shield in hitShip, the beam and the bomb in
// weapons.js, slow in enemyDt (twists-2.js). Every pickup
// collected scores (awardPickup), and the clear sweeps up the ones still falling (sweepPickups).

export const POWER_TIME = 10; // s
const TIMES = { slow: 6 }; // s: the powers that do not last POWER_TIME (the pearls, the trident and the mirror do)
export const powerTime = (kind) => TIMES[kind] ?? POWER_TIME;
export const BROADSIDE_TIME = 6; // s the side guns stay open after a catch (world 13)
const PICKUP_R = 22;
const FALL = 160; // px/s
const BOMB_SHARE = 0.2; // of drops: a bomb instead of a power
const LIFE_SHARE = 0.05; // of drops: an extra life (lives and bombs have no cap, R66)
// R54: power-ups came only from carriers, about one a run. Any other formation alien now drops one
// too, with this chance per kill (one rand), through the same split. Heavier enemy fire (FIRE_UP in
// difficulty.js) pays for it. The pair was tuned on the headless balance run (all 40 levels, the
// autopilot at reaction lags of 10 and 15 ticks): about twice the pickups caught a run, and the
// clear rate and hits a run within noise of before.
export const KILL_DROP = 0.03;
// R56: the late worlds shoot hardest (scaled(d).fireMult), so their aliens drop more: the chance
// climbs with the square of the level's difficulty, leaving the early worlds about as they were,
// from KILL_DROP at d 0 to 12 % at d 1.
export const LATE_DROP = 0.09;
export const killDrop = (d) => KILL_DROP + LATE_DROP * d * d;

// A pickup at (x, y), falling.
export const makePickup = (kind, x, y) => ({ kind, x, y, vy: FALL, r: PICKUP_R });

// A pickup falls from `from`: 20 % a bomb, 5 % a life, the rest one of the six powers (seven in world
// 13, which adds the wingmen, eight in world 15, which adds the pearls and the trident, seven in world
// 16, which adds the mirror: powersFor).
export function dropPickup(world, from) {
  const r = rand(world.rng);
  const kind = r < BOMB_SHARE ? 'bomb' : r < BOMB_SHARE + LIFE_SHARE ? 'life' : randPick(world.rng, powersFor(world.level));
  world.pickups.push(makePickup(kind, clamp(from.x, ZONE.x0, ZONE.x1), from.y));
}

// A hit alien has just died at `a`: a carrier always drops, any other formation alien with chance
// killDrop(d) (R54, R56). Boss minions never roll: their carriers drop as before and the rest do not.
// The saucer is a carrier. The roll is one draw on world.rng, taken for every such kill, drop or not.
export function dropOnKill(world, a) {
  if (a.role === 'carrier' || (!a.minion && rand(world.rng) < killDrop(world.level.d))) dropPickup(world, a);
}

// World 13's twist and world 18's power: a catch opens the side guns, or keeps them open for a full BROADSIDE_TIME more.
// 'broadside' says so for the sound and the fx, and again with on false when the time runs out.
function openBroadside(world) {
  const ship = world.ship;
  ship.broadside = BROADSIDE_TIME;
  emit(world, 'broadside', { on: true, left: BROADSIDE_TIME, x: ship.x, y: ship.y });
}

function collect(world, p) {
  const ship = world.ship;
  emit(world, 'pickup', awardPickup(world, p));
  if (world.level.twist === 'broadside') openBroadside(world);
  if (p.kind === 'bomb') {
    ship.bombs += 1;
  } else if (p.kind === 'life') {
    ship.lives += 1;
  } else if (p.kind === SIDE_GUNS) {
    ship.powersUsed += 1; // a power all the same (R67): no medal for this level
    openBroadside(world);
  } else {
    ship.powersUsed += 1; // a power caught: no medal for this level (R66)
    if (ship.power) ship.reserve = ship.power; // waiting, not over: no event for it
    ship.power = { kind: p.kind, left: powerTime(p.kind) };
    emit(world, 'power', { kind: p.kind, on: true });
  }
}

// Pickups fall, the ship takes the ones it touches, and the ones below the floor are dropped. The ship
// takes whatever its path crossed this tick (R68), so a flick over a pickup catches it.
export function stepPickups(world, dt) {
  const ship = world.ship;
  const reach = (PICKUP_R + SHIP_R) ** 2;
  prune(world.pickups, (p) => {
    p.y += p.vy * dt;
    if (ship.alive && pathDist2(ship, p) <= reach) {
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

// The side guns and the running power count down; when the power ends, the reserve (if any) takes over
// at the time it had left. The guns run before a catch can reset them (stepPickups follows), so a
// catch leaves them a full BROADSIDE_TIME.
export function tickPower(world, dt) {
  const ship = world.ship;
  if (ship.broadside > 0) {
    ship.broadside = Math.max(0, ship.broadside - dt);
    if (ship.broadside === 0) emit(world, 'broadside', { on: false, left: 0, x: ship.x, y: ship.y });
  }
  if (!ship.power) return;
  ship.power.left -= dt;
  if (ship.power.left > 0) return;
  emit(world, 'power', { kind: ship.power.kind, on: false });
  ship.power = ship.reserve;
  ship.reserve = null;
  if (ship.power) emit(world, 'power', { kind: ship.power.kind, on: true });
}
