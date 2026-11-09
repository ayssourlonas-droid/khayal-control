import { TAU, dist2, sweepDist2 } from './math.js';
import { ALIEN_R, EPS } from './kinds.js';
import { hurtAlien } from './aliens.js';
import { powerTime } from './powerups.js';
import { emit } from './util.js';

// World 15's pearls power (R63, dropped in that world alone): three pearls circle the ship for the
// power's time. They are a guard, not a gun (the ship keeps firing its base shot): a pearl wipes any
// enemy bullet it touches, and hurts any alien it touches.
//   pearlsOf(ship)   the pearls' places, [] while the power is not running or the ship is gone. The
//                    drawing and stepPearls both read this, so a pearl blocks where it is seen. Their
//                    angle is a function of the power's time left alone, so it is exact and replays.
//   stepPearls(world, dt, slow)   one tick, called from collide() after cover and before the ship's own
//                    bullet test. `slow` is how long the enemy bullets moved this tick.
// Events (x, y is where the effect shows, `pearl` which of the three, 0..2, in pearlsOf order):
//   pearlBlock { x, y, pearl }   a bullet was wiped; x, y is the pearl's centre
//   pearlHit { x, y, pearl }     an alien took 1 damage; x, y is the alien's centre
// An alien that has taken a pearl hit carries `pearlCool` (seconds until a pearl can hurt it again);
// no other alien has the field.

export const PEARL_COUNT = 3;
export const PEARL_ORBIT = 78; // px from the ship's centre to a pearl's
export const PEARL_R = 13; // a pearl's radius
export const PEARL_TURN = 1.2; // s for the ring to turn once (clockwise on the screen)
export const PEARL_COOL = 0.25; // s an alien is spared after a pearl hit (15 ticks: over on the 15th, kinds.js EPS)

export function pearlsOf(ship) {
  if (ship.power?.kind !== 'pearls' || !ship.alive) return [];
  const spin = ((powerTime('pearls') - ship.power.left) / PEARL_TURN) * TAU - Math.PI / 2; // starts at the top
  return Array.from({ length: PEARL_COUNT }, (_, i) => {
    const a = spin + (i * TAU) / PEARL_COUNT;
    return { x: ship.x + Math.cos(a) * PEARL_ORBIT, y: ship.y + Math.sin(a) * PEARL_ORBIT };
  });
}

// Every bullet whose path this tick came within its radius + PEARL_R of a pearl is spent, settled
// silently like a bomb's wipe (b.near, R37: a block is not a dodge). A beam is not a bullet a pearl can
// stop: the laser pattern passes through.
function block(world, pearls, slow) {
  for (const b of world.bullets) {
    if (b.life <= 0 || b.pattern === 'laser') continue;
    const reach = (b.r + PEARL_R) ** 2;
    const i = pearls.findIndex((p) => sweepDist2(b, slow, p) <= reach);
    if (i < 0) continue;
    b.life = 0;
    b.near = true;
    emit(world, 'pearlBlock', { x: pearls[i].x, y: pearls[i].y, pearl: i });
  }
}

// A pearl on an alien (centres within ALIEN_R + PEARL_R) hurts it by 1, once, then spares it PEARL_COOL.
function bite(world, pearls) {
  const reach = (ALIEN_R + PEARL_R) ** 2;
  for (const a of world.aliens) {
    if (a.hp <= 0 || a.pearlCool > EPS) continue;
    const i = pearls.findIndex((p) => dist2(a, p) <= reach);
    if (i < 0) continue;
    a.pearlCool = PEARL_COOL;
    emit(world, 'pearlHit', { x: a.x, y: a.y, pearl: i });
    hurtAlien(world, a, 1);
  }
}

export function stepPearls(world, dt, slow = dt) {
  for (const a of world.aliens) if (a.pearlCool > 0) a.pearlCool = Math.max(0, a.pearlCool - dt);
  const pearls = pearlsOf(world.ship);
  if (!pearls.length) return;
  block(world, pearls, slow);
  bite(world, pearls);
}
