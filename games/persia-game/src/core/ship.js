import { approach, clamp } from './math.js';
import { emit } from './util.js';
import { MID_X } from './kinds.js';

// The player's ship: movement, the gun (and how spread and rapid change it), and what a hit does.

export const SHIP_R = 14; // hit radius
export const SHIP_SPEED = 720; // px/s
export const ZONE = { x0: 40, x1: 1880, y0: 620, y1: 1040 };
export const LIVES = 3;
export const INVULN = 1.5; // s of blinking after a hit
const COOLDOWN = 0.18; // s between base shots
export const SHOT_SPEED = 1400;
const RAPID_COOLDOWN = 0.07; // s between shots under the rapid power
export const MUZZLE = 22; // px above the ship's centre where shots (and the beam) start
const SPREAD = [-20, -10, 0, 10, 20]; // degrees off straight up, under the spread power

const ACCEL = 7200; // px/s^2: from rest to full speed in 0.1 s, the same to stop (a short ease)
export const FOLLOW = 12; // 1/s: how hard a pointer target pulls; speed is FOLLOW * distance, capped at max

// bombHeld / bombPressed turn the bomb key into an edge (stepShip); beam is whether the laser burns.
export const createShip = () => ({
  x: MID_X, y: 1000, vx: 0, vy: 0, lives: LIVES, invuln: 0, power: null, bombs: 1, cooldown: 0, alive: true,
  beam: false, bombHeld: false, bombPressed: false,
});

const SNAP = 0.5; // px: closer than this to a pointer target, the ship stops dead on it

// The pointer target, held inside the zone.
const goal = (t) => t && { x: clamp(t.x, ZONE.x0, ZONE.x1), y: clamp(t.y, ZONE.y0, ZONE.y1) };

// The velocity the ship eases toward: the keys, normalised so a diagonal is no faster, or the pull
// of the pointer goal.
function wanted(ship, input, g) {
  if (g) {
    const ex = g.x - ship.x;
    const ey = g.y - ship.y;
    const d = Math.hypot(ex, ey);
    const k = Math.min(SHIP_SPEED, d * FOLLOW) / d;
    return [ex * k, ey * k];
  }
  const dx = input.dx || 0;
  const dy = input.dy || 0;
  const k = SHIP_SPEED / (Math.hypot(dx, dy) || 1);
  return [dx * k, dy * k];
}

// One trigger pull: a single shot, or the spread's five. Rapid only shortens the wait.
function shoot(world) {
  const s = world.ship;
  const power = s.power?.kind ?? null;
  s.cooldown = power === 'rapid' ? RAPID_COOLDOWN : COOLDOWN;
  const at = { x: s.x, y: s.y - MUZZLE };
  for (const deg of power === 'spread' ? SPREAD : [0]) {
    const a = (deg * Math.PI) / 180;
    const vx = Math.sin(a) * SHOT_SPEED;
    world.shots.push({ pattern: 'shot', x: at.x, y: at.y, vx, vy: -Math.cos(a) * SHOT_SPEED, r: 5, life: 1.5, dmg: 1 });
  }
  emit(world, 'fire', { side: 'ship', x: at.x, y: at.y, power });
}

// Ease, move and clamp to the zone: `s` is anything with { x, y, vx, vy } (the autopilot flies a copy).
export function moveShip(s, dt, input) {
  const g = goal(input.target);
  if (g && Math.hypot(g.x - s.x, g.y - s.y) < SNAP) {
    Object.assign(s, { x: g.x, y: g.y, vx: 0, vy: 0 });
    return;
  }
  const [wx, wy] = wanted(s, input, g);
  s.vx = approach(s.vx, wx, ACCEL * dt);
  s.vy = approach(s.vy, wy, ACCEL * dt);
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  if (s.x < ZONE.x0 || s.x > ZONE.x1) {
    s.x = clamp(s.x, ZONE.x0, ZONE.x1);
    s.vx = 0;
  }
  if (s.y < ZONE.y0 || s.y > ZONE.y1) {
    s.y = clamp(s.y, ZONE.y0, ZONE.y1);
    s.vy = 0;
  }
}

// Count the timers down, move, and shoot while fire is held (the laser power has a beam instead,
// weapons.js). The ship moves during the intro too, but only shoots in play. bombPressed is true on
// the one tick the bomb key goes down, intro included, so a key held since before play is not a
// fresh press.
export function stepShip(world, dt, input) {
  const s = world.ship;
  s.cooldown = Math.max(0, s.cooldown - dt);
  s.invuln = Math.max(0, s.invuln - dt);
  s.bombPressed = Boolean(input.bomb) && !s.bombHeld;
  s.bombHeld = Boolean(input.bomb);
  moveShip(s, dt, input);
  if (world.state === 'play' && input.fire && s.cooldown <= 0 && s.power?.kind !== 'laser') shoot(world);
}

// A bullet, a beam or a ram reached the ship. True when it was spent, i.e. the hit landed; a
// blinking ship cannot be touched and a dead one has nothing left to lose, so those pass through.
// The shield soaks up every hit while it lasts: nothing is lost, nothing is counted, no blink.
export function hitShip(world, source) {
  const s = world.ship;
  if (!s.alive || s.invuln > 0) return false;
  if (s.power?.kind === 'shield') {
    emit(world, 'shieldHit', { x: s.x, y: s.y, source });
    return true;
  }
  s.lives -= 1;
  s.invuln = INVULN;
  world.hits += 1;
  emit(world, 'shipHit', { x: s.x, y: s.y, lives: s.lives, source });
  if (s.lives <= 0) {
    s.alive = false;
    emit(world, 'explode', { x: s.x, y: s.y, size: 2 });
  }
  return true;
}
