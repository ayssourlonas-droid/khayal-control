import { approach, clamp, segDist2, stepScale } from './math.js';
import { emit } from './util.js';
import { EPS, MID_X, WIDTH } from './kinds.js';

// The player's ship: movement, the gun (and how spread, rapid, homing, the wingmen, the mirror twin, the
// broadside and the trident change it), and what a hit does. The pearls (world 15) guard the ship but leave
// the gun alone: pearls.js.

export const SHIP_R = 14; // hit radius
export const SHIP_SPEED = 720; // px/s: the keys' top speed, and what the drawing banks against (the pointer has none, R68)
export const ZONE = { x0: 40, x1: 1880, y0: 620, y1: 1040 };
// A free level (R67, world 18) lets the ship fly up to just under the HUD.
export const FREE_ZONE = { ...ZONE, y0: 150 }; // the ship's nose stays under the HUD panels
export const zoneOf = (level) => (level?.free ? FREE_ZONE : ZONE);
export const LIVES = 3;
export const INVULN = 1.5; // s of blinking after a hit
// s between base shots (R70): 0.18 / 1.25, a shot every 9 ticks, 6.7 a second, 1.22 x the 11 ticks the old 0.18 s
// came to. The gun fires on a tick, so 1.25 x itself cannot be had; 8 ticks would be 1.375 x, and 9 is the nearer.
export const COOLDOWN = 0.144;
export const SHOT_SPEED = 1400;
export const HOMING_SPEED = 1000; // px/s: a homing shot is slower, so it has time to turn
export const RAPID_SPEED = 1.5 * SHOT_SPEED; // px/s: a rapid shot flies 1.5 x as fast as the base one (R70)
export const HOMING_TURN = Math.PI; // rad/s: how hard it steers toward the nearest alien ahead (stepBullet)
export const RAPID_COOLDOWN = 0.07; // s between shots under the rapid power
export const MUZZLE = 22; // px above the ship's centre where shots (and the beam) start
const SPREAD = [-20, -10, 0, 10, 20]; // degrees off straight up, under the spread power
export const ESCORT_DX = 80; // px: the two wingmen fly this far to either side of the ship (world 13)
const ESCORT_EDGE = 30; // px: the closest an escort flies to either side of the field
const GUN_DX = 22; // px: the side guns sit this far to either side of the ship's centre (broadside)

export const ACCEL = 7200; // px/s^2: the keys take the ship from rest to full speed in 0.1 s, the same to stop (a short ease)

// fromX / fromY are where the ship's move this tick began (moveShip): the collisions sweep from there to
// where it is, so a ship that crosses the field in one tick cannot slip through what lay between (R68).
// pointed is whether the pointer moved the ship last (moveShip): its vx, vy are then only for the drawing,
// and the keys start from rest.
// reserve is the power a newer pickup displaced (powerups.js); bombHeld / bombPressed turn the bomb
// key into an edge (stepShip); beam is whether the laser burns; broadside is the seconds the side guns
// have left (world 13's twist, powerups.js), 0 when they are shut. bombsUsed and powersUsed count the bombs
// fired and the power-ups caught this level, for the clear's bomb bonus and medal (scoring.js awardClear).
export const createShip = () => ({
  x: MID_X, y: 1000, fromX: MID_X, fromY: 1000, vx: 0, vy: 0, pointed: false, lives: LIVES, invuln: 0, power: null, reserve: null,
  bombs: 1, cooldown: 0, alive: true, beam: false, bombHeld: false, bombPressed: false, broadside: 0,
  bombsUsed: 0, powersUsed: 0,
});

// The pointer target, held inside the zone `z`.
const goal = (t, z) => t && { x: clamp(t.x, z.x0, z.x1), y: clamp(t.y, z.y0, z.y1) };

// Where the ship's move this tick began: createShip sets it, and moveShip sets it again every tick, before
// the collisions and the pickups read it. pathDist2 is the squared distance from the point `p` to the path
// the ship flew this tick, from there to where it is (R68: what the path crossed, the ship touched).
export const fromOf = (s) => ({ x: s.fromX, y: s.fromY });
export const pathDist2 = (s, p) => segDist2(s.fromX, s.fromY, s.x, s.y, p.x, p.y);

// The wingmen power's two escorts, left then right: level with the ship, ESCORT_DX to either side and
// held inside the field. [] when the power is not running (or the ship is gone). The drawing and
// shoot both read this, so an escort fires from where it is seen.
export function escortsOf(ship) {
  if (ship.power?.kind !== 'wingmen' || !ship.alive) return [];
  return [-1, 1].map((k) => ({ x: clamp(ship.x + k * ESCORT_DX, ESCORT_EDGE, WIDTH - ESCORT_EDGE), y: ship.y }));
}

// The mirror power's twin (world 16), as a list like escortsOf's: the ship reflected across the field's
// centre line, at its height. The zone is symmetric about that line, so the twin always flies inside it.
// [] when the power is not running (or the ship is gone). The twin is only a place to fire from and to
// draw: nothing hits it and it collects nothing, so no collision code reads it.
export function twinOf(ship) {
  if (ship.power?.kind !== 'mirror' || !ship.alive) return [];
  return [{ x: WIDTH - ship.x, y: ship.y }];
}

// How fast the gun's shot flies under `power` (a power kind or null): what shoot fires and what aim.js leads by.
export const shotSpeed = (power) => (power === 'homing' ? HOMING_SPEED : power === 'rapid' ? RAPID_SPEED : SHOT_SPEED);

// A ship shot: r 5, 1.5 s of life, 1 damage.
const bolt = (x, y, vx, vy) => ({ pattern: 'shot', x, y, vx, vy, r: 5, life: 1.5, dmg: 1 });

// The trident power's shot (world 15): the same bolt, r 7, marked `trident` for the drawing. It runs
// through every alien and boss part in its path and hurts each once (collide.js, boss-hit.js); the ids
// it has hurt are kept in `pierced`, an array so the shot clones and hashes plainly. Bunkers still stop it.
export const TRIDENT_R = 7;
const trident = (x, y, vx, vy) => ({ ...bolt(x, y, vx, vy), r: TRIDENT_R, trident: true, pierced: [] });

// One trigger pull: a single shot, or the spread's five. Rapid shortens the wait and its shot flies faster. A homing shot
// is the single shot, slower, with `seek`: stepBullet steers it toward the nearest alien ahead. The
// trident's is the single shot as a trident bolt, at the base rate. Under
// the wingmen each escort fires a copy of the straight shot from its own place (the power is the
// running one, so the ship's own shot is that straight one); under the mirror the twin fires one
// straight shot, marked `mirror` for the drawing. While the broadside is open (world 13)
// the volley also sends one shot straight out of each side, level with the ship; 'sideShot' says
// where, for the sound and the flash.
function shoot(world) {
  const s = world.ship;
  const power = s.power?.kind ?? null;
  s.cooldown = power === 'rapid' ? RAPID_COOLDOWN : COOLDOWN;
  const at = { x: s.x, y: s.y - MUZZLE };
  const speed = shotSpeed(power);
  for (const deg of power === 'spread' ? SPREAD : [0]) {
    const a = (deg * Math.PI) / 180;
    const shot = (power === 'trident' ? trident : bolt)(at.x, at.y, Math.sin(a) * speed, -Math.cos(a) * speed);
    if (power === 'homing') shot.seek = HOMING_TURN;
    world.shots.push(shot);
  }
  for (const e of escortsOf(s)) world.shots.push(bolt(e.x, e.y - MUZZLE, 0, -speed));
  for (const t of twinOf(s)) world.shots.push({ ...bolt(t.x, t.y - MUZZLE, 0, -speed), mirror: true });
  if (s.broadside > 0) sideGuns(world);
  emit(world, 'fire', { side: 'ship', x: at.x, y: at.y, power });
}

// The broadside's pair: one shot straight out of each side, level with the ship.
function sideGuns(world) {
  const s = world.ship;
  for (const dir of [-1, 1]) {
    const x = s.x + dir * GUN_DX;
    world.shots.push({ ...bolt(x, s.y, dir * SHOT_SPEED, 0), broadside: dir });
    emit(world, 'sideShot', { x, y: s.y, dir });
  }
}

// Move the ship `s` and clamp it to the zone `z` (zoneOf its level). The pointer is the ship (R68, the same
// in every world): a pointer target puts the ship on its goal in this very tick, with no easing, no speed
// limit and no pull. vx, vy still say how fast it went, for the drawing's bank and wake, but never more than
// SHIP_SPEED, so a flick across the field does not throw a wake thousands of px long. That velocity is
// display only: when the pointer lets go (a pause, a blur, a key taking over) the ship stops where it is,
// and the keys ease on from rest, never from the pointer's speed, so nothing drifts. The keys move it at up
// to SHIP_SPEED, eased by ACCEL, a diagonal no faster than straight. Either way fromX / fromY keep where the
// move began.
function moveShip(s, dt, input, z) {
  s.fromX = s.x;
  s.fromY = s.y;
  const g = goal(input.target, z);
  if (g) {
    const ex = g.x - s.x;
    const ey = g.y - s.y;
    const k = stepScale(ex, ey, SHIP_SPEED * dt);
    Object.assign(s, { x: g.x, y: g.y, vx: (ex / dt) * k, vy: (ey / dt) * k, pointed: true });
    return;
  }
  if (s.pointed) Object.assign(s, { vx: 0, vy: 0, pointed: false });
  const dx = input.dx || 0;
  const dy = input.dy || 0;
  const k = SHIP_SPEED / (Math.hypot(dx, dy) || 1);
  s.vx = approach(s.vx, dx * k, ACCEL * dt);
  s.vy = approach(s.vy, dy * k, ACCEL * dt);
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  if (s.x < z.x0 || s.x > z.x1) {
    s.x = clamp(s.x, z.x0, z.x1);
    s.vx = 0;
  }
  if (s.y < z.y0 || s.y > z.y1) {
    s.y = clamp(s.y, z.y0, z.y1);
    s.vy = 0;
  }
}

// Count the timers down, move, and shoot while fire is held (the laser power has a beam instead,
// weapons.js, but an open broadside still fires its side guns at the base rate beside the beam). The
// ship moves during the intro too, but only shoots in play. bombPressed is true on
// the one tick the bomb key goes down, intro included, so a key held since before play is not a
// fresh press.
export function stepShip(world, dt, input) {
  const s = world.ship;
  s.cooldown = Math.max(0, s.cooldown - dt);
  s.invuln = Math.max(0, s.invuln - dt);
  s.bombPressed = Boolean(input.bomb) && !s.bombHeld;
  s.bombHeld = Boolean(input.bomb);
  moveShip(s, dt, input, zoneOf(world.level));
  if (world.state !== 'play' || !input.fire || s.cooldown > EPS) return;
  if (s.power?.kind !== 'laser') shoot(world);
  else if (s.broadside > 0) {
    s.cooldown = COOLDOWN;
    sideGuns(world);
  }
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
