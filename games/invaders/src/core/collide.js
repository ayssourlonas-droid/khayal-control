import { segDist2, sweepRel2 } from './math.js';
import { ALIEN_R, NEAR_MISS } from './kinds.js';
import { laserHits } from './patterns.js';
import { SHIP_R, hitShip, fromOf, pathDist2 } from './ship.js';
import { hurtAlien, isSwooping, firstAlien } from './aliens.js';
import { shotsVsBoss } from './boss-hit.js';
import { stepPearls } from './pearls.js';
import { sweepBunkers } from './bunkers.js';
import { awardKill } from './scoring.js';
import { lightFuse } from './fireworks.js';
import { emit } from './util.js';
import { cutShuriken } from './twists.js';
import { collideFree } from './free.js';

// Who hits whom. Projectiles are tested along the path they flew this tick (from where their
// velocity says they were to where they are), so a fast shot cannot tunnel through anything.

// A trident bolt (world 15) is not spent on an alien: it hurts every alien its path crossed this tick
// that it has not hurt before, nearest to where the path started first, and flies on. The ids it has
// hurt are kept in s.pierced, so a bolt that stays on an alien for several ticks hurts it once.
function pierceAliens(world, s, dt) {
  const px = s.x - s.vx * dt;
  const py = s.y - s.vy * dt;
  const reach = (ALIEN_R + s.r) ** 2;
  const far = (a) => (a.x - px) ** 2 + (a.y - py) ** 2;
  const crossed = world.aliens.filter((a) => a.hp > 0 && !s.pierced.includes(a.id) && segDist2(px, py, s.x, s.y, a.x, a.y) <= reach);
  for (const a of crossed.sort((p, q) => far(p) - far(q))) {
    s.pierced.push(a.id);
    hurtAlien(world, a, s.dmg ?? 1);
  }
}

// Each shot is spent on the alien it meets first.
function shotsVsAliens(world, dt) {
  for (const s of world.shots) {
    if (s.life <= 0) continue;
    if (s.trident) {
      pierceAliens(world, s, dt);
      continue;
    }
    const best = firstAlien(world, s, dt);
    if (!best) continue;
    s.life = 0;
    hurtAlien(world, best, s.dmg ?? 1);
  }
}

// Whatever is still flying (ship shots, enemy bullets) is spent on the first bunker it reaches along
// its path, which loses a chunk there. Enemy lasers are skipped: a beam burns through cover.
function vsBunkers(world, list, dt) {
  if (!world.bunkers.length) return;
  for (const p of list) {
    if (p.life <= 0 || p.pattern === 'laser') continue;
    const at = sweepBunkers(world.bunkers, p, dt);
    if (!at) continue;
    p.life = 0;
    emit(world, 'bunker', at);
  }
}

// A diver that reaches the ship costs a life and is lost with no score. A blinking ship is passed.
// A shell (world 14) that rams still lights its fuse, like a shell dying any other way. In a free level
// (R67) the ship can fly into the formation, so any alien it touches rams it. The ship is tested along
// the path it flew this tick (R68), so one that crossed an alien in a single move rammed it.
function rams(world) {
  const reach = (ALIEN_R + SHIP_R) ** 2;
  const free = world.level.free;
  for (const a of world.aliens) {
    if (a.hp <= 0 || !(free || isSwooping(a))) continue;
    if (pathDist2(world.ship, a) <= reach && hitShip(world, 'ram')) {
      a.hp = 0;
      awardKill(world, a, false);
      if (a.shell) lightFuse(world, a);
    }
  }
}

// b.near is a bullet's closest approach while it is in the ship's near band, and true once settled.
// A bullet that leaves the band without touching the ship, or runs out of life or hits cover inside
// it, was a near miss: report it now. A wipe (a bomb, a boss's death, a Ronin Moon cut) is not a
// dodge: it settles the bullet silently (ruling R37).
function nearMissed(world, b) {
  if (typeof b.near !== 'number') return;
  emit(world, 'nearMiss', { x: b.x, y: b.y, dist: b.near });
  b.near = true;
}

// Bullets hit within their radius + 14 and are spent. A bullet that comes close without touching
// is a nearMiss (nearMissed), so a bullet that goes on to hit is never one. A beam is tested by
// laserHits (the warning line harms nothing) and never counts. A bullet that touches a blinking ship
// is spent without harm, so a slow one lingering on the ship cannot take a second life the moment
// the blinking ends. The ship moves too (R68: the pointer can carry it far in one tick), so a bullet is
// tested against the gap between the two paths (sweepRel2) and a beam against the ship's whole path. A
// bullet hits or near-misses by where the two were at their closest during the tick, both moving steadily:
// one that lay on the ship's line at the start but was gone from it before the ship got there is not hit.
function bulletsVsShip(world, dt) {
  const ship = world.ship;
  if (!ship.alive) return;
  const from = fromOf(ship);
  for (const b of world.bullets) {
    if (b.life <= 0) {
      nearMissed(world, b); // ran out, or stopped by cover, inside the band
      continue;
    }
    if (b.pattern === 'laser') {
      if (laserHits(b, ship, SHIP_R, from)) hitShip(world, 'laser');
      continue;
    }
    const hit = b.r + SHIP_R;
    const d2 = sweepRel2(b, dt, ship, from);
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
// Cover comes before the ship, so a bullet that crosses a bunker on its way down never lands, and
// so does a cut (Ronin Moon), so a star cut on the ship's own tick never lands either. The pearls
// (world 15) guard the ship from there too: they wipe the bullets that got past the cover, before the
// ship's own test.
// `slow` is how long the enemy bullets moved this tick (less than dt in bullet time).
export function collide(world, dt, slow = dt) {
  shotsVsAliens(world, dt);
  shotsVsBoss(world, dt);
  vsBunkers(world, world.shots, dt);
  rams(world);
  vsBunkers(world, world.bullets, slow);
  if (world.level.free) collideFree(world, slow);
  if (world.level.twist === 'shuriken') cutShuriken(world, dt);
  stepPearls(world, dt, slow);
  bulletsVsShip(world, slow);
}
