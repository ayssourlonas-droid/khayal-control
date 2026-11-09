import { HEIGHT, HUD_BOTTOM, EPS } from './kinds.js';
import { enemyDt } from './twists-2.js';
import { emit, finished } from './util.js';

// World 17's breath (R65), a twist of its own and the only one that helps the player. A front of
// fresh air rises from the bottom of the field to the HUD's edge and wipes every enemy bullet it
// passes over; nothing else is touched (aliens, the boss, the ship, pickups and the ship's shots).
// The first breath starts HELP_FIRST s into play and every HELP_EVERY s after that, in a wave level
// and a boss fight alike. State, on world.twist (plain data, made for this world alone):
//   timer  seconds until the next breath starts
//   rise   seconds since the front left the bottom, or null while no breath is rising
// Events: 'breath' { y0, y1, dur } as one starts, 'cleanse' { x, y } for each bullet wiped, where
// the bullet was. A beam (the laser pattern) is not a bullet the air can stop and passes through.

export const HELP_FIRST = 14; // s of play until the first breath
export const HELP_EVERY = 24; // s from the start of one breath to the start of the next
export const BREATH_TIME = 0.8; // s for the front to rise
const FROM = HEIGHT; // the front's height when it starts
const TO = HUD_BOTTOM; // and when it is spent

export const breathState = () => ({ timer: HELP_FIRST, rise: null });

const frontAt = (rise) => FROM + (TO - FROM) * Math.min(1, rise / BREATH_TIME);

// The front's height now, y down, or null when no breath is rising. The drawing reads this, so the
// air is seen where it clears. A finished level stops stepping, so a rise it ended on is never spent:
// it has no front either, or the air would hang on behind the results.
export function breathFront(world) {
  const rise = world.twist.rise;
  return rise === null || rise === undefined || finished(world) ? null : frontAt(rise);
}

// A bullet is passed over this tick if it was at or above the old front when the tick began and is at
// or below the new one when it ends: whatever its own pace, it cannot slip by between the two. One
// fired this tick behind the front (below the old front) is not passed over. Its start is where its
// last step began, `slow` s ago (enemyDt: bullet time shortens that step).
function cleanse(world, slow, y0, y1) {
  for (const b of world.bullets) {
    if (b.life <= 0 || b.pattern === 'laser') continue;
    if (b.y - b.vy * slow > y0 || b.y < y1) continue;
    b.life = 0;
    b.near = true; // settled: a wipe is not a dodge, even inside the near band (R37)
    emit(world, 'cleanse', { x: b.x, y: b.y });
  }
}

export function breath(world, dt) {
  const t = world.twist;
  if (t.rise !== null) {
    const y0 = frontAt(t.rise);
    t.rise += dt;
    const spent = t.rise >= BREATH_TIME - EPS;
    cleanse(world, enemyDt(world, dt), y0, spent ? TO : frontAt(t.rise));
    if (spent) t.rise = null;
  }
  t.timer -= dt;
  if (t.timer <= EPS && t.rise === null) {
    t.rise = 0;
    t.timer += HELP_EVERY;
    emit(world, 'breath', { y0: FROM, y1: TO, dur: BREATH_TIME });
  }
}
