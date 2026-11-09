import { clamp, angleTo, dist2, segSegDist2, wrapAngle } from './math.js';
import { WIDTH, HEIGHT } from './kinds.js';

// The life of one enemy bullet after it is fired, plus the laser's geometry. Bullets are the plain
// objects emitPattern returns: { pattern, x, y, vx, vy, r, life, warn?, turn? }. A homing ship shot
// (ship.js) is a bullet with `seek` instead of `turn`.

export const LASER_WARN = 0.8; // s of harmless warning line before the beam
export const LASER_BEAM = 0.6; // s the beam then burns

// Turn the velocity toward `to` by at most `rate` rad/s, keeping the speed.
function steer(b, rate, dt, to) {
  const speed = Math.hypot(b.vx, b.vy);
  const heading = Math.atan2(b.vy, b.vx);
  const diff = wrapAngle(angleTo(b, to) - heading);
  const next = heading + clamp(diff, -rate * dt, rate * dt);
  b.vx = Math.cos(next) * speed;
  b.vy = Math.sin(next) * speed;
}

// The live alien nearest to a ship shot among those ahead of it (higher on the screen), or null. The
// boss, the saucer and wrecks are not aliens here: a seeking shot only chases the formation, and not
// an alien still flying in above the top edge, which would lead it off the screen.
function seekTarget(b, aliens) {
  let best = null;
  let bestD = Infinity;
  for (const a of aliens) {
    if (a.hp <= 0 || a.y >= b.y || a.y < 0) continue;
    const d = dist2(a, b);
    if (d < bestD) {
      best = a;
      bestD = d;
    }
  }
  return best;
}

// Advance one bullet by `dt`. `world.ship` is what a homing bullet chases (`turn`); a ship shot with
// `seek` chases the nearest alien ahead of it and flies straight when there is none. A laser never
// moves: it counts its warning down to 0 and then burns until `life` runs out. Callers drop bullets
// whose `life` is <= 0.
export function stepBullet(b, dt, world) {
  b.life -= dt;
  if (b.pattern === 'laser') {
    b.warn = Math.max(0, b.warn - dt);
    return;
  }
  if (b.turn && world?.ship) steer(b, b.turn, dt, world.ship);
  if (b.seek && world?.aliens) {
    const to = seekTarget(b, world.aliens);
    if (to) steer(b, b.seek, dt, to);
  }
  b.x += b.vx * dt;
  b.y += b.vy * dt;
}

// The beam's centre line: from the emitter along its fixed aim (vx, vy) to the screen edge.
export function laserSegment(b) {
  const len = Math.hypot(b.vx, b.vy) || 1;
  const dx = b.vx / len;
  const dy = b.vy / len;
  const tx = dx > 0 ? (WIDTH - b.x) / dx : dx < 0 ? -b.x / dx : Infinity;
  const ty = dy > 0 ? (HEIGHT - b.y) / dy : dy < 0 ? -b.y / dy : Infinity;
  const reach = Math.max(0, Math.min(tx, ty));
  return { x1: b.x, y1: b.y, x2: b.x + dx * reach, y2: b.y + dy * reach };
}

// True while the beam burns and a circle of radius `rad` at `at` touches it. The beam is 2 * b.r
// wide, so the ship (centre `at`, radius 14) is hit within b.r + 14 of the centre line. A warning
// line, or an expired beam, hits nothing. `from` is where the circle was at the start of the tick
// (R68): one that crossed the beam sideways since then was in it, wherever it ended.
export function laserHits(b, at, rad, from = at) {
  if (b.warn > 0 || b.life <= 0) return false;
  const { x1, y1, x2, y2 } = laserSegment(b);
  const reach = b.r + rad;
  return segSegDist2(x1, y1, x2, y2, from.x, from.y, at.x, at.y) <= reach * reach;
}
