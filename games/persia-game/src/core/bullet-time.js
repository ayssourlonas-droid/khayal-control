import { emit } from './util.js';

// Bullet time, on every level: a near miss off cooldown slows the enemy side (their bullets, the
// aliens and the boss) to SLOW of real time for SLOW_TIME s. The ship and its shots keep full speed.
// Its state is two plain numbers on the world:
//   slow   seconds of bullet time left; 0 when off
//   cool   seconds until a near miss may start it again

const SLOW = 0.5; // the enemy side steps at this fraction of real time
export const SLOW_TIME = 2; // s it lasts
export const SLOW_COOL = 8; // s from its start until a near miss can start it again

// The time an enemy bullet, an alien or the boss moves in this tick.
export const enemyDt = (world, dt) => (world.slow > 0 ? dt * SLOW : dt);

// Did a near miss happen earlier in this very tick? (Events of this tick are the last ones.)
function nearMissNow(world) {
  const ev = world.events;
  for (let i = ev.length - 1; i >= 0 && ev[i].tick === world.tick; i--) if (ev[i].type === 'nearMiss') return true;
  return false;
}

// Once a tick, after the collisions (which report the near misses).
export function stepBulletTime(world, dt) {
  if (world.slow > 0) {
    world.slow = Math.max(0, world.slow - dt);
    if (world.slow === 0) emit(world, 'bulletTime', { on: false });
  }
  world.cool = Math.max(0, world.cool - dt);
  if (world.cool === 0 && nearMissNow(world)) {
    world.slow = SLOW_TIME;
    world.cool = SLOW_COOL;
    emit(world, 'bulletTime', { on: true, left: SLOW_TIME });
  }
}
