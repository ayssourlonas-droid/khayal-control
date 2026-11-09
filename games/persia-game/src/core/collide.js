import { dist2, segDist2, sweepDist2 } from './math.js';
import { ALIEN_R, NEAR_MISS } from './kinds.js';
import { laserHits } from './patterns.js';
import { SHIP_R, hitShip } from './ship.js';
import { hurtAlien, isSwooping } from './aliens.js';
import { shotsVsBoss } from './boss-hit.js';
import { awardKill } from './scoring.js';
import { emit } from './util.js';

// Who hits whom. Projectiles are tested along the path they flew this tick (from where their
// velocity says they were to where they are), so a fast shot cannot tunnel through anything.

// Each shot is spent on the alien it meets first, the nearest to where it started this tick.
function shotsVsAliens(world, dt) {
  for (const s of world.shots) {
    if (s.life <= 0) continue;
    const px = s.x - s.vx * dt;
    const py = s.y - s.vy * dt;
    const reach = (ALIEN_R + s.r) ** 2;
    let best = null;
    let bestD = Infinity;
    for (const a of world.aliens) {
      if (a.hp <= 0 || segDist2(px, py, s.x, s.y, a.x, a.y) > reach) continue;
      const d = (a.x - px) ** 2 + (a.y - py) ** 2;
      if (d < bestD) {
        best = a;
        bestD = d;
      }
    }
    if (!best) continue;
    s.life = 0;
    hurtAlien(world, best, s.dmg ?? 1);
  }
}

// A diver that reaches the ship costs a life and is lost with no score. A blinking ship is passed.
function rams(world) {
  const reach = (ALIEN_R + SHIP_R) ** 2;
  for (const a of world.aliens) {
    if (a.hp <= 0 || !isSwooping(a)) continue;
    if (dist2(a, world.ship) <= reach && hitShip(world, 'ram')) {
      a.hp = 0;
      awardKill(world, a, false);
    }
  }
}

// b.near is a bullet's closest approach while it is in the ship's near band, and true once settled.
// A bullet that leaves the band without touching the ship, or runs out of life inside it, was a
// near miss: report it now. A wipe (a bomb, a boss's death) is not a dodge: it settles the bullet
// silently (ruling R37).
function nearMissed(world, b) {
  if (typeof b.near !== 'number') return;
  emit(world, 'nearMiss', { x: b.x, y: b.y, dist: b.near });
  b.near = true;
}

// Bullets hit within their radius + 14 and are spent. A bullet that comes close without touching
// is a nearMiss (nearMissed), so a bullet that goes on to hit is never one. A beam is tested by
// laserHits (the warning line harms nothing) and never counts. A bullet that touches a blinking ship
// is spent without harm, so a slow one lingering on the ship cannot take a second life the moment
// the blinking ends.
function bulletsVsShip(world, dt) {
  const ship = world.ship;
  if (!ship.alive) return;
  for (const b of world.bullets) {
    if (b.life <= 0) {
      nearMissed(world, b); // ran out inside the band
      continue;
    }
    if (b.pattern === 'laser') {
      if (laserHits(b, ship, SHIP_R)) hitShip(world, 'laser');
      continue;
    }
    const hit = b.r + SHIP_R;
    const d2 = sweepDist2(b, dt, ship);
    if (d2 <= hit * hit) {
      hitShip(world, b.pattern);
      b.life = 0;
      b.near = true;
    } else if (b.near !== true) {
      if (d2 <= Math.max(NEAR_MISS, hit + 6) ** 2) b.near = Math.min(b.near ?? Infinity, Math.sqrt(d2));
      else nearMissed(world, b);
    }
  }
}

// The dead (shots with life 0, aliens with hp 0, bullets with life 0) are pruned by the caller.
// `slow` is how long the enemy bullets moved this tick (less than dt in bullet time).
export function collide(world, dt, slow = dt) {
  shotsVsAliens(world, dt);
  shotsVsBoss(world, dt);
  rams(world);
  bulletsVsShip(world, slow);
}
