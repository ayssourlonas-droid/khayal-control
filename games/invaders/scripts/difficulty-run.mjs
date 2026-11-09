// One measured flight of one level, for scripts/difficulty.mjs: the autopilot with real lives, or one
// of its weaker variants. The variants live here, not in src/core/autopilot.js, and never touch the
// world's rng: they change what the pilot sees and how its hand moves, nothing in the simulation.
//   delay  the pilot acts on the world as it stood `delay` ticks ago: its answer is queued and
//          applied that many ticks late (the autopilot is a pure function of the world, so this is
//          exactly the same as feeding it an old world)
//   sight  enemy bullets farther than this from the ship are invisible to it (lasers, with their
//          long telegraph, always stay in view), so it dodges late and bombs late
//   hand   the pointer travels at most this many px/s toward where the pilot wants it. Sight alone
//          barely weakens the autopilot (it still dodges in time from 90 px), so the near-sighted
//          variant also has a slow hand.
import { isMainThread, parentPort } from 'node:worker_threads';
import { createWorld, stepWorld, stars, INTRO } from '../src/core/world.js';
import { levelById } from '../src/core/levels.js';
import { autopilot } from '../src/core/autopilot.js';
import { TICK } from '../src/core/kinds.js';
import { IDLE } from '../src/core/input-codec.js';
import { finished } from '../src/core/util.js';

export const VARIANTS = [
  { name: 'base', delay: 0, sight: Infinity, hand: Infinity },
  { name: 'late4', delay: 4, sight: Infinity, hand: Infinity },
  { name: 'late8', delay: 8, sight: Infinity, hand: Infinity },
  { name: 'late12', delay: 12, sight: Infinity, hand: Infinity },
  { name: 'near', delay: 0, sight: 120, hand: 420 },
];

const LIMIT = 300; // simulated seconds before a run counts as stuck

// What the pilot sees: the world, or a shallow copy without the bullets it cannot see yet.
function view(world, sight) {
  if (sight === Infinity) return world;
  const { x, y } = world.ship;
  const bullets = world.bullets.filter((b) => b.pattern === 'laser' || (b.x - x) ** 2 + (b.y - y) ** 2 <= sight * sight);
  return { ...world, bullets };
}

// Move the hand (the pointer) at most `speed` px/s toward the input's target; the input then points
// where the hand is.
function reach(input, hand, speed) {
  if (speed === Infinity || !input.target) return input;
  const dx = input.target.x - hand.x;
  const dy = input.target.y - hand.y;
  const k = Math.min(1, (speed * TICK) / (Math.hypot(dx, dy) || 1));
  hand.x += dx * k;
  hand.y += dy * k;
  return { ...input, target: { x: Math.round(hand.x), y: Math.round(hand.y) } };
}

// Fly `id` with `variant` from `seed`. Returns the run's numbers:
//   result 'clear' | 'fail' | 'stuck', t (s), lost (lives), hits (lives + shield hits), stars, score,
//   bps (enemy bullets fired per second of play), fight (s from the end of the boss's fly-in to its
//   death, boss levels only; null if it never died)
export function measure(id, variant, seed) {
  const world = createWorld(levelById(id), seed);
  const queue = [];
  const hand = { x: world.ship.x, y: world.ship.y };
  const seen = new WeakSet();
  let fired = 0;
  let lost = 0;
  let shield = 0;
  let fightFrom = null;
  let fight = null;
  while (!finished(world) && world.t < LIMIT) {
    queue.push(reach(autopilot(view(world, variant.sight)), hand, variant.hand));
    stepWorld(world, TICK, queue.length > variant.delay ? queue.shift() : IDLE);
    for (const b of world.bullets) {
      if (seen.has(b)) continue;
      seen.add(b);
      fired++;
    }
    for (const e of world.events) {
      if (e.type === 'shipHit') lost++;
      else if (e.type === 'shieldHit') shield++;
      else if (e.type === 'bossDeath') fight = world.t - fightFrom;
    }
    world.events.length = 0;
    if (world.boss && fightFrom === null && world.boss.enter <= 0) fightFrom = world.t;
  }
  const result = world.state === 'cleared' ? 'clear' : world.state === 'failed' ? 'fail' : 'stuck';
  const play = Math.max(TICK, world.t - INTRO);
  return { result, t: world.t, lost, hits: lost + shield, stars: stars(world), score: world.score, bps: fired / play, fight };
}

// As a worker thread (scripts/difficulty.mjs runs a pool of them): measure each job it is sent.
if (!isMainThread) parentPort.on('message', ({ k, id, v, seed }) => parentPort.postMessage({ k, r: measure(id, VARIANTS[v], seed) }));
