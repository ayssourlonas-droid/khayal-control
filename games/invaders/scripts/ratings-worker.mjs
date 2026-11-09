// One slice of scripts/ratings.mjs's measurement, run in a worker thread: a level at one reaction lag, over
// seeds 1..seeds, replies how many of those flights cleared it. The flight: a mortal ship, the autopilot's
// input applied `lag` ticks after it was computed (NEUTRAL, the gun held, until the first one arrives), at most
// 240 s of play a flight. Since R68 the autopilot's target is one hand-step from the ship, so
// a delayed target would walk the ship only that far in `lag` ticks: a delayed input is then the destination
// decided `lag` ticks ago, walked to by the hand (hand.js, HAND px/s) from where the ship is now (trees before
// R68 have no destination or hand: the input is used as it is). The scores therefore assume that hand speed.
// Every flight is a pure function of (level, seed, lag), so the answers do not depend on which worker ran
// which slice or in what order.
import { parentPort, workerData } from 'node:worker_threads';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const load = (f) => import(pathToFileURL(resolve(workerData.root, 'src/core', f)).href);
const [{ createWorld, stepWorld }, { levelById }, { autopilot, destination }, { finished }, { TICK }, { IDLE }] = await Promise.all(
  ['world.js', 'levels.js', 'autopilot.js', 'util.js', 'kinds.js', 'input-codec.js'].map(load),
);
const hand = await load('hand.js').catch(() => null);

const NEUTRAL = { ...IDLE, fire: true };
const LIMIT = 240; // s of play before a flight counts as lost

// The input of this tick, with the destination it was decided on (planned once: the dodge is the costly part).
const plan = (w) => {
  if (!destination) return autopilot(w);
  const dest = destination(w);
  return { ...autopilot(w, dest), dest };
};
// A destination is R68's, as hand.js is, so a tree that plans one has the hand to walk it.
const walked = (cur, w) => (cur.dest ? { ...cur, target: hand.handTarget(w.ship, cur.dest, TICK) } : cur);

function cleared(level, seed, lag) {
  const w = createWorld(level, seed);
  const q = Array.from({ length: lag }, () => NEUTRAL);
  while (!finished(w) && w.t < LIMIT) {
    q.push(plan(w));
    stepWorld(w, TICK, walked(q.shift(), w));
    w.events.length = 0;
  }
  return w.state === 'cleared';
}

parentPort.on('message', ({ id, levelId, lag, seeds }) => {
  const level = levelById(levelId);
  let clears = 0;
  for (let seed = 1; seed <= seeds; seed++) if (cleared(level, seed, lag)) clears++;
  parentPort.postMessage({ id, levelId, lag, clears });
});
