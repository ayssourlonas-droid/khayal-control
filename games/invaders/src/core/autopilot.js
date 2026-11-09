import { chooseAim, HOME_Y } from './aim.js';
import { steer } from './dodge.js';
import { handTarget } from './hand.js';
import { ZONE } from './ship.js';
import { clamp, dist2 } from './math.js';
import { MID_X, TICK } from './kinds.js';
import { IDLE } from './input-codec.js';
import { finished } from './util.js';

// The autopilot: drives the title-screen backdrop and the "watch, then try" demo, and is how the
// tests prove that every level can be finished. It plays the way a person with a mouse would:
// always firing, the pointer on the spot it wants to be. The pointer is the ship (R68), so it moves
// like a hand: each tick's target is no farther from the ship than a hand carries it in a tick (hand.js).
//   - stand under the nearest thing it can hit, led by where that will be (aim.js)
//   - fly out of the way of bullets, beams and divers (dodge.js)
//   - collect a power-up that is about to fall past
//   - drop a bomb when six bullets are within 160 px, or when the last life is on the line in a
//     boss fight
// It reads the world and nothing else: no rng, no memory between calls, so the same world always
// gets the same answer and a replay (which does not run it) cannot drift.

const BOMB_CROWD = 6; // bullets within BOMB_RADIUS that call for a bomb
const BOMB_RADIUS = 160;
const GRACE = 0.4; // s: a power-up is chased once it would pass the ship's row this soon after the ship could be under it
// px/s: the pace "could be under it" is judged at, slower than the hand (hand.js HAND), so the autopilot sets
// off for a pickup earlier than its quick hand needs to, on purpose. It is the pace the pins, the pars and
// the ratings were taken with (the keys' top speed, ship.js SHIP_SPEED, at the time), so it stays put if the
// keys' speed ever changes.
const PICKUP_PACE = 720;

// A power-up that will fall past the ship's row about when the ship could get under it, at PICKUP_PACE;
// once it is level with the ship it is followed down until it is gone.
function pickupSpot(world) {
  const s = world.ship;
  let best = null;
  let soonest = Infinity;
  for (const p of world.pickups) {
    const fall = Math.max(0, (s.y - p.y) / p.vy);
    if (p.y > ZONE.y1 + p.r || fall >= Math.abs(p.x - s.x) / PICKUP_PACE + GRACE || fall >= soonest) continue;
    best = p;
    soonest = fall;
  }
  return best && { x: best.x, y: clamp(best.y, HOME_Y, ZONE.y1) };
}

function shouldBomb(world) {
  const s = world.ship;
  if (!s.alive || s.bombs <= 0 || s.bombHeld) return false;
  let crowd = 0;
  for (const b of world.bullets) {
    if (b.life > 0 && b.pattern !== 'laser' && dist2(s, b) <= BOMB_RADIUS ** 2) crowd++;
  }
  const boss = world.boss;
  return crowd >= BOMB_CROWD || (s.lives === 1 && Boolean(boss) && boss.enter <= 0 && boss.dying === null);
}

// Where the autopilot would put the ship if the hand were quick enough: the spot it wants (a power-up
// about to pass, else under what it can hit, else home), moved aside from what would hit it. Not a pointer
// target: autopilot() takes the hand's first step toward it. Also what a lagged player stands for
// (scripts/ratings-worker.mjs): the spot decided then, which the hand then walks to from wherever the ship is.
export function destination(world) {
  const want = pickupSpot(world) ?? chooseAim(world) ?? { x: MID_X, y: HOME_Y };
  return steer(world, want);
}

// `dest` is destination(world) when the caller already has it (the lagged player plans it once a tick).
export function autopilot(world, dest) {
  if (finished(world)) return { ...IDLE };
  return { dx: 0, dy: 0, fire: true, bomb: shouldBomb(world), target: handTarget(world.ship, dest ?? destination(world), TICK) };
}
