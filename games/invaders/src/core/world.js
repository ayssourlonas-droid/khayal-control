import { createRng } from './rng.js';
import { scaled } from './difficulty.js';
import { createShip, stepShip } from './ship.js';
import { spawnWave, stepAliens } from './aliens.js';
import { layoutBunkers } from './bunkers.js';
import { spawnBoss, stepBoss } from './boss.js';
import { createTwist } from './twists.js';
import { stepPlay } from './world-step.js';
import { finished } from './util.js';
import { INTRO } from './kinds.js';

export { stars } from './scoring.js';

// The simulation's one object. Everything in it survives structuredClone (plain data only), which
// the replay and trailer snapshots rely on. The spec's shape (level, t, tick, ship, aliens, shots,
// bullets, pickups, bunkers, boss, wave, score, combo, hits, state, events) plus what the pure
// simulation needs: rng (a { s } state, draw with rand), scale (scaled(level.d), constant),
// intro (seconds of intro left), gap (seconds to the next wave, or null), march (the current wave's
// own state, aliens.js), nextId (the next alien id).
// `wave` counts the waves spawned so far (1 while the first is in play; 0 on a boss level, where
// `boss` holds the fight instead: boss.js). wind, slow, saucer, wrecks, well and twist carry the
// level's twist (twists.js).
// `events` is only pushed to here; main drains it after every step.

export function createWorld(level, seed = level.seed) {
  const world = {
    level, rng: createRng(seed), scale: scaled(level.d), t: 0, tick: 0,
    ship: createShip(), aliens: [], shots: [], bullets: [], pickups: [],
    bunkers: level.bunkers ? layoutBunkers() : [], boss: null,
    wave: 0, gap: null, march: null, nextId: 1, intro: INTRO,
    score: 0, combo: { mult: 1, timer: 0 }, hits: 0, tally: null, state: 'intro', events: [],
  };
  if (level.waves) spawnWave(world);
  if (level.boss) spawnBoss(world, level.boss);
  return Object.assign(world, createTwist(level, world.rng));
}

// input = { dx, dy, fire, bomb, target }; missing fields mean "not pressed". A cleared or failed
// world is finished and no longer moves.
export function stepWorld(world, dt, input = {}) {
  if (finished(world)) return;
  world.t += dt;
  world.tick += 1;
  if (world.state === 'play') {
    stepPlay(world, dt, input);
    return;
  }
  stepShip(world, dt, input);
  stepAliens(world, dt);
  stepBoss(world, dt);
  world.intro -= dt;
  if (world.intro <= 0) world.state = 'play';
}
