// Saved progress, adapted from Barrage: best score, best stars and the medal per level, the best run per level
// (trailer/runs.js stores and reads it), the mute switch and whether the demo was seen. Every localStorage
// touch is wrapped: private windows, kiosks and blocked storage play on without saving. Whatever is
// written also lands in memory, so a session without storage still remembers its own results.
//   keys  invaders.best        { [levelId]: { score, stars, medal } }   medal: cleared without a power-up, once
//         invaders.run.<id>    a run as makeRun builds it (JSON)
//         invaders.muted       '1' | '0'      invaders.demoSeen  '1'
// resetBest() forgets every best score, star count and medal and keeps the saved runs, mute and demoSeen.
// medalCount(best) is how many levels hold their medal: the pilot's rank is read from it (core/ranks.js).
// createStorage(getBackend) takes a function returning the backend (the getter itself may throw);
// `store` is the game's instance over globalThis.localStorage.
import { isRecord, isCount, validScore } from '../core/util.js';
import { MAX_STARS } from '../core/scoring.js';

export const PREFIX = 'invaders.';
const NONE = Object.freeze({ score: 0, stars: 0, medal: false });

const validStars = (v) => isCount(v, MAX_STARS);

export const medalCount = (best) => Object.values(best).filter((b) => b.medal).length;

// The saved best map with every malformed entry dropped. An entry saved before medals, or with
// anything but true for its medal, holds no medal.
function cleanBest(raw) {
  const out = {};
  if (!isRecord(raw)) return out;
  for (const [id, e] of Object.entries(raw)) {
    if (isRecord(e) && validScore(e.score) && validStars(e.stars)) out[id] = { score: e.score, stars: e.stars, medal: e.medal === true };
  }
  return out;
}

export function createStorage(getBackend = () => globalThis.localStorage) {
  const memory = new Map(); // key (without the prefix) -> string written this session

  function read(key) {
    if (memory.has(key)) return memory.get(key);
    try {
      return getBackend()?.getItem(PREFIX + key) ?? null;
    } catch {
      return null; // unreadable: as if nothing were saved
    }
  }

  // true when the backend took it
  function write(key, value) {
    memory.set(key, value);
    try {
      const back = getBackend();
      if (!back) return false;
      back.setItem(PREFIX + key, value);
      return true;
    } catch {
      return false; // full or blocked: the in-memory copy holds for this session
    }
  }

  function readJSON(key) {
    const raw = read(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null; // corrupted
    }
  }

  const allBest = () => cleanBest(readJSON('best'));
  const best = (id) => ({ ...(allBest()[id] ?? NONE) });

  // A finished level: keep the higher score and the higher stars, each on its own, and the medal once earned.
  function recordResult(id, { score, stars, medal }) {
    const all = allBest();
    const prev = all[id] ?? NONE;
    const s = validScore(score) ? score : 0;
    const st = validStars(stars) ? stars : 0;
    const kept = { score: Math.max(prev.score, s), stars: Math.max(prev.stars, st), medal: prev.medal || medal === true };
    all[id] = kept;
    write('best', JSON.stringify(all));
    return { best: kept, newBest: s > prev.score };
  }

  // Forget every best: the key goes and memory reads as empty, so a backend that refuses the removal
  // still shows nothing this session. true when the backend took it.
  function resetBest() {
    memory.set('best', '{}');
    try {
      const back = getBackend();
      if (!back) return false;
      back.removeItem(PREFIX + 'best');
      return true;
    } catch {
      return false;
    }
  }

  return {
    allBest,
    best,
    recordResult,
    resetBest,
    bestRun: (id) => {
      const run = readJSON(`run.${id}`);
      return isRecord(run) ? run : null;
    },
    setBestRun: (id, run) => write(`run.${id}`, JSON.stringify(run)),
    muted: () => read('muted') === '1',
    setMuted: (on) => write('muted', on ? '1' : '0'),
    demoSeen: () => read('demoSeen') === '1',
    setDemoSeen: () => write('demoSeen', '1'),
  };
}

export const store = createStorage();
