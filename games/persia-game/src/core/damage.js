import { hurtAlien } from './aliens.js';
import { ALIEN_R, WIDTH, HEIGHT } from './kinds.js';
import { liveParts, hurtPart, bombBoss } from './boss-hit.js';

// The one place that knows what can be damaged. The bomb and the laser go through these helpers
// and nothing else, so a new kind of target means widening them here.
//   targets(world)        every live target, in a fixed order: aliens, then the boss's parts
//   inColumn(t, x, half)  does the target touch the vertical strip x +- half (and is it on screen)
//   bombAll(world)        what one bomb does: 3 to every alien on screen, and 8 % of the boss's
//                         max hp as raw damage, shared by its damageable parts (boss-hit.js)
//   drip(world, t, amount) damage that arrives continuously, paid out in whole points
// Both hurt through one private hurt(world, t, dmg): the kill and the hit event; a boss part applies
// its own rule (weak 100 %, armor 25 %).

const BOMB_DAMAGE = 3;
const EPS = 1e-9; // 8 / 60 added fifteen times is 2 only up to rounding

export const targets = (world) => [...world.aliens, ...liveParts(world)];
function hurt(world, t, dmg) {
  if (t.part) hurtPart(world, t, dmg);
  else hurtAlien(world, t, dmg);
}
export const inColumn = (t, x, half) =>
  t.y >= 0 && Math.abs(t.x - x) <= half + (t.part ? t.w / 2 : ALIEN_R);
const onScreen = (t) => t.x >= 0 && t.x <= WIDTH && t.y >= 0 && t.y <= HEIGHT;

export function bombAll(world) {
  for (const a of world.aliens) if (onScreen(a)) hurt(world, a, BOMB_DAMAGE);
  bombBoss(world);
}

// Fractional damage collects on the target (t.burn) and lands one point at a time, so hp stays a
// whole number and a beam does not send a hit event every tick. (An armour plate turns each point
// into a quarter.)
export function drip(world, t, amount) {
  t.burn = (t.burn ?? 0) + amount;
  while (t.burn >= 1 - EPS && t.hp > 0) {
    t.burn -= 1;
    hurt(world, t, 1);
  }
}
