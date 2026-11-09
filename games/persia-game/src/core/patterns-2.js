import { segDist2 } from './math.js';
import { WIDTH, HEIGHT } from './kinds.js';

// The life of one enemy bullet after it is fired, plus the laser's geometry. Bullets are the plain
// objects emitPattern returns: { pattern, x, y, vx, vy, r, life, warn? }.

export const LASER_WARN = 0.8; // s of harmless warning line before the beam
export const LASER_BEAM = 0.6; // s the beam then burns

// Advance one bullet by `dt`. A laser never moves: it counts its warning down to 0 and then burns
// until `life` runs out. Callers drop bullets whose `life` is <= 0.
export function stepBullet(b, dt) {
  b.life -= dt;
  if (b.pattern === 'laser') {
    b.warn = Math.max(0, b.warn - dt);
    return;
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
// line, or an expired beam, hits nothing.
export function laserHits(b, at, rad) {
  if (b.warn > 0 || b.life <= 0) return false;
  const { x1, y1, x2, y2 } = laserSegment(b);
  const reach = b.r + rad;
  return segDist2(x1, y1, x2, y2, at.x, at.y) <= reach * reach;
}
