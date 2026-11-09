// Measures each world's difficulty score (src/core/ratings.js), shown on its card in Level Select:
//   score = 1 + 9 x (setting + fail) / 2, to one decimal, where
//   setting = the mean d of the world's five levels (difficulty.js), what the game itself says, and
//   fail    = 1 - the world's clear rate, the clear rate being the mean over its five levels of the lagged
//             autopilot's clears at lags 8, 10, 12, 14, 16 and 18 ticks x seeds 1-20 (120 flights a level).
// Six lags, not one: a boss level's seeds share their first 11-15 s, so one lag's 20 seeds are really a few
// openings. The flights are in scripts/ratings-worker.mjs; this file deals the slices (a level at a lag,
// 20 seeds) out to one worker thread a core, so all the worlds take minutes. Since R68 the pointer is the ship,
// so the clear rates depend on how fast a hand carries it: the lagged pilot walks to where it decided to be at
// HAND (src/core/hand.js, 1800 px/s), and the scores assume that speed. They move with it, so they are relative
// to that model of a hand, not measured from human play.
//
//   node scripts/ratings.mjs [--root <repo>] [--write]
//
// --root  measures the src/core of that tree (default: this repo), e.g. a worktree of an older commit.
// --write rewrites src/core/ratings.js of THIS repo with the measured scores. Run it again whenever a world
//         is added or retuned, or the ship, the autopilot or a rule changes how often it fails.
import { writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';

const LAGS = [8, 10, 12, 14, 16, 18]; // ticks of reaction lag, the range from a quick pilot to a slow one
const SEEDS = 20;

const scoreOf = (setting, clearRate) => Number((1 + (9 * (setting + 1 - clearRate)) / 2).toFixed(1));

// Run every task on a pool of workers, a task at a time each; resolves to the replies in task order.
function deal(tasks, root) {
  const size = Math.min(availableParallelism(), tasks.length);
  const file = new URL('./ratings-worker.mjs', import.meta.url);
  const replies = new Array(tasks.length);
  let next = 0, done = 0;
  return new Promise((ok, fail) => {
    for (let i = 0; i < size; i++) {
      const worker = new Worker(file, { workerData: { root } });
      const feed = () => {
        if (next < tasks.length) worker.postMessage({ id: next, ...tasks[next++] });
        else worker.terminate();
      };
      worker.on('message', (r) => {
        replies[r.id] = r;
        if (process.stderr.isTTY) process.stderr.write(`\r${++done}/${tasks.length} slices`);
        else done++;
        if (done === tasks.length) ok(replies);
        feed();
      });
      worker.on('error', fail);
      feed();
    }
  });
}

function table(rows) {
  const line = (r) => `${String(r.world).padStart(5)}  ${r.name.padEnd(18)} ${r.clear.padStart(7)}  ${r.setting.padStart(7)}  ${r.score.padStart(5)}  ${r.levels}`;
  return [line({ world: 'world', name: 'name', clear: 'clear %', setting: 'setting', score: 'score', levels: 'clear % by level' }), ...rows.map(line)].join('\n');
}

// `hand` is the measured tree's HAND (hand.js), the hand speed the scores assume.
function write(scores, hand) {
  writeFileSync(new URL('../src/core/ratings.js', import.meta.url), `// Each world's difficulty as a score out of 10, shown on its card in Level Select: half the world's own setting
// (the mean d of its five levels, difficulty.js) and half how often the lagged autopilot fails it (${LAGS.length} reaction lags
// x ${SEEDS} seeds per level, the way boss levels have to be measured: their seeds share an opening), as
// 1 + 9 x (d + fail) / 2, to one decimal. The lagged autopilot walks to where it decided to be at HAND (hand.js,
// ${hand} px/s since R68), so the scores are relative to that model of a hand and move with it. Written by
// scripts/ratings.mjs; run it again when a world is added or retuned, as pars are.
export const RATINGS = [${scores.join(', ')}];
`);
}

async function main() {
  const args = process.argv.slice(2);
  const at = args.indexOf('--root');
  const root = resolve(at >= 0 ? args[at + 1] : fileURLToPath(new URL('..', import.meta.url)));
  const load = (f) => import(pathToFileURL(resolve(root, 'src/core', f)).href);
  const { LEVELS, WORLDS } = await load('levels.js');
  const tasks = LEVELS.flatMap((l) => LAGS.map((lag) => ({ levelId: l.id, lag, seeds: SEEDS })));
  const started = Date.now();
  const clears = Object.fromEntries(LEVELS.map((l) => [l.id, 0]));
  for (const r of await deal(tasks, root)) clears[r.levelId] += r.clears;

  const flights = LAGS.length * SEEDS; // a level's flights
  const rows = WORLDS.map((wd) => {
    const levels = LEVELS.filter((l) => l.world === wd.id);
    const rate = levels.reduce((s, l) => s + clears[l.id], 0) / (levels.length * flights);
    const setting = levels.reduce((s, l) => s + l.d, 0) / levels.length;
    return { world: wd.id, name: wd.name, rate, setting, levels: levels.map((l) => Math.round((100 * clears[l.id]) / flights)).join(' ') };
  });
  const out = rows.map((r) => ({ ...r, clear: (100 * r.rate).toFixed(1), setting: r.setting.toFixed(3), score: scoreOf(r.setting, r.rate).toFixed(1) }));
  if (process.stderr.isTTY) process.stderr.write('\n');
  console.log(table(out));
  console.log(`${LEVELS.length} levels x ${LAGS.length} lags x ${SEEDS} seeds in ${Math.round((Date.now() - started) / 1000)} s on ${availableParallelism()} cores`);
  if (args.includes('--write')) {
    write(out.map((r) => r.score), (await load('hand.js')).HAND);
    console.log(`wrote ${out.length} scores to src/core/ratings.js`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
