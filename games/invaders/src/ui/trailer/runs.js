// The best run per level, as Cinema keeps it. DOM-free (storage is passed in).
//   saveBestRun(store, outcome) -> 'saved' | 'unsaved' (storage refused: full or blocked) | 'skip'
//     only a cleared level played for real (not the demo) and untainted (outcome.run is null when a
//     ?debug hook touched it), and only when the level has no playable saved run (none, corrupted,
//     old or another level's) or this run scores more than the saved one. The gate is the saved run,
//     not the level's best score (R33): a best set by a tainted run, before trailers existed or by a
//     save the quota refused has no run behind it and must not block every later run.
//     A run whose encoded inputs pass MAX_RUN_CHARS is never stored (M9): the Pi's games share one
//     origin's ~5 MB of localStorage, so it is skipped (the best score is kept, as always).
//     A refusal never throws and never touches the best score; storage keeps the run in memory, so
//     this session can still watch it.
//   cinemaReels(store) -> [{ level, run }]   every level with a playable saved run, in level order;
//     a corrupted, cut-off, old-version or mislabelled run is skipped (decodeRun says null).
import { LEVELS } from '../../core/levels.js';
import { decodeRun } from '../../core/replay.js';

export const MAX_RUN_CHARS = 96 * 1024; // about 9 minutes of a pointer moving on every tick

const savedRun = (store, id) => {
  const run = decodeRun(store.bestRun(id));
  return run && run.level === id ? run : null;
};

export function saveBestRun(store, o) {
  if (!o.run || o.mode !== 'play' || !o.cleared || o.run.inputs.length > MAX_RUN_CHARS) return 'skip';
  const id = o.level.id;
  const cur = savedRun(store, id);
  if (cur && o.score <= cur.score) return 'skip';
  return store.setBestRun(id, o.run) ? 'saved' : 'unsaved';
}

export function cinemaReels(store) {
  const out = [];
  for (const level of LEVELS) {
    const run = savedRun(store, level.id);
    if (run) out.push({ level, run });
  }
  return out;
}
