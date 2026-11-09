import { chooseAim, HOME_Y } from './aim.js';
import { steer } from './dodge.js';
import { SHIP_SPEED, ZONE } from './ship.js';
import { clamp, dist2 } from './math.js';
import { MID_X } from './kinds.js';
import { IDLE } from './input-codec.js';
import { finished } from './util.js';

// The autopilot: drives the title-screen backdrop and ?debug&auto, and is how the tests prove
// that every level can be finished. It plays the way a person with a mouse would:
// always firing, the pointer on the spot it wants to be.
//   - stand under the nearest thing it can hit, led by where that will be (aim.js)
//   - fly out of the way of bullets, beams and divers (dodge.js)
//   - collect a power-up that is about to fall past
//   - drop a bomb when six bullets are within 160 px, or when the last life is on the line in a
//     boss fight
// It reads the world and nothing else: no rng, no memory between calls, so the same world always
// gets the same answer.

const BOMB_CROWD = 6; // bullets within BOMB_RADIUS that call for a bomb
const BOMB_RADIUS = 160;
const GRACE = 0.4; // s: a power-up is chased once it would pass the ship's row this soon after the ship could be under it

// A power-up that will fall past the ship's row about when the ship could get under it; once it is
// level with the ship it is followed down until it is gone.
function pickupSpot(world) {
  const s = world.ship;
  let best = null;
  let soonest = Infinity;
  for (const p of world.pickups) {
    const fall = Math.max(0, (s.y - p.y) / p.vy);
    if (p.y > ZONE.y1 + p.r || fall >= Math.abs(p.x - s.x) / SHIP_SPEED + GRACE || fall >= soonest) continue;
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

export function autopilot(world) {
  if (finished(world)) return { ...IDLE };
  const want = pickupSpot(world) ?? chooseAim(world) ?? { x: MID_X, y: HOME_Y };
  const to = steer(world, want);
  return { dx: 0, dy: 0, fire: true, bomb: shouldBomb(world), target: { x: Math.round(to.x), y: Math.round(to.y) } };
}
