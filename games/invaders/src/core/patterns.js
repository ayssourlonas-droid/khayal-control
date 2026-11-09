import { rand } from './rng.js';
import { angleTo, TAU } from './math.js';
import { LASER_WARN, LASER_BEAM } from './patterns-2.js';

export { stepBullet, laserSegment, laserHits, LASER_WARN, LASER_BEAM } from './patterns-2.js';

// The enemy bullet library. emitPattern(pattern, from, target, p, rng) returns fresh bullets
//   { pattern, x, y, vx, vy, r, life, warn?, turn? }
// fired from `from` (an alien) with `target` (the ship) as the aim. p = { speed, count?, spread? }:
// speed in px/s (scaled(d).bulletSpeed), count the number of bullets, spread the fan's total width
// in radians or the rain's width in px. `rng` is the core { s } state (world.rng); only the
// patterns that scatter draw from it. Every bullet has a bright core and a dark rim, r is both.

const LIFE = 6; // s; long enough to cross the screen at the slowest speed, short enough to be culled
const HOMING_TURN = Math.PI / 3; // 60 degrees a second
const HOMING_LIFE = 4;
const LASER_R = 9; // half of the 18 px beam

function shot(pattern, from, angle, speed, r, life) {
  return { pattern, x: from.x, y: from.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r, life };
}

const countOf = (p, fallback) => Math.max(1, Math.floor(p.count ?? fallback));
const each = (n, make) => Array.from({ length: n }, (_, i) => make(i));

const EMIT = {
  aimed: (from, target, p) => [shot('aimed', from, angleTo(from, target), p.speed, 8, LIFE)],

  // count bullets across `spread` radians, centred on the aim; one bullet is just an aimed shot.
  fan: (from, target, p) => {
    const n = countOf(p, 5);
    const spread = p.spread ?? 0.8;
    const aim = angleTo(from, target);
    return each(n, (i) => shot('fan', from, n > 1 ? aim + (i / (n - 1) - 0.5) * spread : aim, p.speed, 8, LIFE));
  },

  // count bullets evenly round the circle, the whole ring turned by a random fraction of one gap.
  ring: (from, target, p, rng) => {
    const n = countOf(p, 12);
    const base = rand(rng) * (TAU / n);
    return each(n, (i) => shot('ring', from, base + (i * TAU) / n, p.speed, 8, LIFE));
  },

  // One burst whose angle and speed both climb along the list, so it winds outward like a pinwheel.
  spiral: (from, target, p, rng) => {
    const n = countOf(p, 14);
    const base = rand(rng) * TAU;
    return each(n, (i) =>
      shot('spiral', from, base + (i * TAU) / n, p.speed * (0.55 + (0.45 * i) / Math.max(n - 1, 1)), 8, LIFE));
  },

  // Straight down from a scatter of x around the emitter, each at a slightly different speed.
  rain: (from, target, p, rng) => {
    const spread = p.spread ?? 360;
    return each(countOf(p, 5), () => {
      const x = from.x + (rand(rng) - 0.5) * spread;
      return { pattern: 'rain', x, y: from.y, vx: 0, vy: p.speed * (0.85 + 0.3 * rand(rng)), r: 7, life: LIFE };
    });
  },

  // A warning line that does not move: vx, vy hold the unit aim, fixed now. See laserHits.
  laser: (from, target) => {
    const aim = angleTo(from, target);
    return [{
      pattern: 'laser', x: from.x, y: from.y, vx: Math.cos(aim), vy: Math.sin(aim),
      r: LASER_R, life: LASER_WARN + LASER_BEAM, warn: LASER_WARN,
    }];
  },

  // Slow, and turns toward the ship at up to 60 degrees a second (stepBullet) for 4 s.
  homing: (from, target, p) => {
    const b = shot('homing', from, angleTo(from, target), p.speed * 0.7, 10, HOMING_LIFE);
    b.turn = HOMING_TURN;
    return [b];
  },

  // One big slow star: 0.6x speed, radius 18, so long a life that it can cross the whole screen.
  shuriken: (from, target, p) => [shot('shuriken', from, angleTo(from, target), p.speed * 0.6, 18, 10)],
};

export function emitPattern(pattern, from, target, p, rng) {
  const emit = EMIT[pattern];
  if (!emit) throw new Error(`unknown pattern: ${pattern}`);
  return emit(from, target, p, rng);
}
