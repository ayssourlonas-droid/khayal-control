import { hurtAlien } from './aliens.js';
import { ALIEN_R, WIDTH, HEIGHT, EPS } from './kinds.js';
import { liveParts, hurtPart, bombBoss } from './boss-hit.js';
import { hurtWreck } from './twists-2.js';

// The one place that knows what can be damaged. The bomb and the laser go through these helpers
// and nothing else, so a new kind of target means widening them here.
//   loose(world)          every target but the boss's parts: aliens, the saucer, wrecks
//   targets(world)        every live target, in a fixed order: aliens, the saucer, wrecks, the boss's parts
//   inColumn(t, x, half)  does the target touch the vertical strip x +- half (and is it on screen)
//   bombAll(world)        what one bomb does: 3 to everything loose on screen, and 8 % of the boss's
//                         max hp as raw damage, shared by its damageable parts (boss-hit.js)
//   drip(world, t, amount) damage that arrives continuously, paid out in whole points
//   burstAt(world, x, y, depth)  what a shell's burst does (world 14, fireworks): 1 damage to every
//                         target within BURST_R of (x, y), and the depth its chain goes on at
// Both hurt through one private hurt(world, t, dmg): the kill and the hit event; a boss part applies
// its own rule (weak 100 %, armor 25 %, bare hull 0), a wreck just breaks.

const BOMB_DAMAGE = 3;
export const BURST_R = 160; // px: how far a shell's burst reaches

// The bonus saucer is an alien in all but its list.
export const loose = (world) => (world.saucer ? [...world.aliens, world.saucer, ...world.wrecks] : [...world.aliens, ...world.wrecks]);

export const targets = (world) => [...loose(world), ...liveParts(world)];
function hurt(world, t, dmg) {
  if (t.part) hurtPart(world, t, dmg);
  else if (t.wreck) hurtWreck(world, t, dmg);
  else hurtAlien(world, t, dmg);
}
export const inColumn = (t, x, half) =>
  t.y >= 0 && Math.abs(t.x - x) <= half + (t.part ? t.w / 2 : ALIEN_R);
const onScreen = (t) => t.x >= 0 && t.x <= WIDTH && t.y >= 0 && t.y <= HEIGHT;

export function bombAll(world) {
  for (const t of loose(world)) if (onScreen(t)) hurt(world, t, BOMB_DAMAGE);
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

// Is the target within BURST_R of (x, y)? An alien is measured from its centre, a boss part from the
// nearest point of its box (zero inside it), so a big part is hurt by a burst that only brushes it.
function inReach(t, x, y) {
  const dx = Math.max(Math.abs(t.x - x) - (t.part ? t.w / 2 : 0), 0);
  const dy = Math.max(Math.abs(t.y - y) - (t.part ? t.h / 2 : 0), 0);
  return dx * dx + dy * dy <= BURST_R ** 2;
}

// A shell goes off at (x, y), `depth` links into its chain: every target in reach takes 1 damage
// through hurt(), so a boss part keeps its own rule (weak 100 %, armor 25 %, bare hull 0). Ship,
// bunkers and bullets are not targets. The depth of the chain rides on the fuses themselves: a shell
// this burst kills lights its fuse inside hurtAlien at depth 0, and every fuse lit while the burst's
// damage is dealt is then set one link deeper than the burst, so no state is kept between bursts.
export function burstAt(world, x, y, depth) {
  const fuses = world.twist.fuses;
  const lit = fuses.length;
  for (const t of targets(world)) if (inReach(t, x, y)) hurt(world, t, 1);
  for (let i = lit; i < fuses.length; i++) fuses[i].depth = depth + 1;
}
