// Difficulty, measured: every level flown by the autopilot with real lives, and by its weaker variants
// (scripts/difficulty-run.mjs), from several seeds, on a pool of worker threads. Prints one row per
// level and the checks the tuning aims at.
//
//   node scripts/difficulty.mjs [--seeds 8] [--only w1-1,w8-5] [--out file.txt]
//
// A cell is "clears/runs lives" for one variant: how many of its runs cleared the level, and the mean
// lives lost (3 on a failed run). pain is the mean of lives lost + 1 per failure over the runs of
// the weaker variants (all but base; 0 = never touched, 4 = always dead). The base columns are the
// autopilot's own run from the level's seed: seconds, stars, score. bps is enemy bullets fired per
// second of play (all runs), fight the mean seconds the base autopilot took from the boss's arrival
// to its death. Seed k of a level is level.seed + 7919 k, so seed 0 is the one the game plays.
// The checks at the end (spikes, step backs, 1-1, world 8) are the targets of the tuning.
import { Worker } from 'node:worker_threads';
import { writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { LEVELS } from '../src/core/levels.js';
import { VARIANTS } from './difficulty-run.mjs';

const WEAK = ['late4', 'late8', 'late12', 'near']; // the weaker players: what pain, and the curve, are judged on
const MID = ['late8', 'near']; // the middle two of them: must still clear world 8's last levels
const WEAKEST = 'late12'; // must clear 1-1 losing at most one life
const MARGIN = 0.5; // pain a level may exceed a later one by before it counts as a spike

function options(argv) {
  const o = { seeds: 8, only: null, out: null };
  for (let i = 0; i < argv.length; i += 2) {
    if (argv[i] === '--seeds') o.seeds = Number(argv[i + 1]);
    else if (argv[i] === '--only') o.only = argv[i + 1].split(',');
    else if (argv[i] === '--out') o.out = argv[i + 1];
    else throw new Error(`unknown option ${argv[i]}`);
  }
  return o;
}

// Run every job on a pool of workers; resolves to the results in job order.
function runAll(jobs) {
  const out = [];
  const size = Math.min(jobs.length, Math.max(1, availableParallelism() - 2));
  let next = 0;
  let done = 0;
  return new Promise((resolve, reject) => {
    for (let n = 0; n < size; n++) {
      const worker = new Worker(new URL('./difficulty-run.mjs', import.meta.url));
      const feed = () => (next < jobs.length ? worker.postMessage({ k: next, ...jobs[next++] }) : worker.terminate());
      worker.on('message', ({ k, r }) => {
        out[k] = r;
        if (++done === jobs.length) resolve(out);
        feed();
      });
      worker.on('error', reject);
      feed();
    }
  });
}

const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : NaN);
const pad = (s, n) => String(s).padStart(n);
const runsOf = (row, names) => names.flatMap((name) => row.runs[VARIANTS.findIndex((v) => v.name === name)]);
const pain = (runs) => mean(runs.map((r) => r.lost + (r.result === 'clear' ? 0 : 1)));

function rowText(row) {
  const cells = row.runs.map((runs) => {
    const clears = runs.filter((r) => r.result === 'clear').length;
    return pad(`${clears}/${runs.length} ${mean(runs.map((r) => r.lost)).toFixed(1)}`, 9);
  });
  const b = row.runs[0][0];
  const fights = row.runs[0].map((r) => r.fight).filter((f) => f !== null);
  const all = row.runs.flat();
  return [
    row.level.id.padEnd(5), row.level.d.toFixed(2), ...cells, pad(row.pain.toFixed(2), 5),
    pad(`${b.result === 'clear' ? '' : b.result + ' '}${b.t.toFixed(0)}s`, 9), pad(`${b.stars}*`, 3), pad(b.score, 7),
    pad(mean(all.map((r) => r.bps)).toFixed(1), 5), pad(fights.length ? mean(fights).toFixed(1) : '', 5),
  ].join(' ');
}

// The targets of the tuning, each line one that is missed.
function checks(rows) {
  const out = [];
  const at = (w, i) => rows.find((r) => r.level.world === w && r.level.index === i);
  for (const row of rows) {
    const { world: w, index: i } = row.level;
    for (const j of [i + 1, i + 2]) {
      const later = at(w, j);
      if (later && row.pain > later.pain + MARGIN) out.push(`spike: ${row.level.id} pain ${row.pain.toFixed(2)} > ${later.level.id} ${later.pain.toFixed(2)}`);
    }
    const prev = i === 1 && at(w - 1, 5);
    if (prev && row.pain > prev.pain + MARGIN) out.push(`step back: ${row.level.id} pain ${row.pain.toFixed(2)} > ${prev.level.id} ${prev.pain.toFixed(2)}`);
  }
  const first = at(1, 1);
  if (first) {
    const runs = runsOf(first, [WEAKEST]);
    if (runs.some((r) => r.result !== 'clear' || r.lost > 1)) out.push(`w1-1: ${WEAKEST} loses ${runs.map((r) => r.lost)}`);
  }
  for (const i of [3, 4, 5]) {
    const row = at(8, i);
    const runs = row ? runsOf(row, MID) : [];
    const clears = runs.filter((r) => r.result === 'clear').length;
    if (row && clears * 2 < runs.length) out.push(`${row.level.id}: mid variants clear ${clears}/${runs.length}`);
  }
  return out.length ? out : ['all targets met'];
}

const opts = options(process.argv.slice(2));
const levels = LEVELS.filter((l) => !opts.only || opts.only.includes(l.id));
const seedsOf = (level) => Array.from({ length: opts.seeds }, (_, k) => (level.seed + k * 7919) >>> 0);
const jobs = levels.flatMap((l) => VARIANTS.flatMap((_, v) => seedsOf(l).map((seed) => ({ id: l.id, v, seed }))));
const results = await runAll(jobs);
const rows = levels.map((level) => {
  const runs = VARIANTS.map((_, v) => results.filter((r, k) => jobs[k].id === level.id && jobs[k].v === v));
  const row = { level, runs };
  row.pain = pain(runsOf(row, WEAK));
  return row;
});
const head = ['level', '   d', ...VARIANTS.map((v) => pad(v.name, 9)), ' pain', '   base t', ' **', '  score', '  bps', 'fight'].join(' ');
const text = [
  `difficulty: ${levels.length} levels x ${VARIANTS.length} variants x ${opts.seeds} seeds; weak = ${WEAK.join(', ')}`,
  head, ...rows.map(rowText), '', ...checks(rows), '',
].join('\n');
process.stdout.write(text);
if (opts.out) writeFileSync(opts.out, text);
