// ?debug only (never in normal play): hooks for checking the game by hand.
//   ?debug&level=2  the game boots straight into that level (1 by default with &boss)
//   ?debug&boss     the game boots straight into the level with its giant already up
//   ?debug&auto     the autopilot flies every level played (r.pilot, router.js)
// installDebug(r) -> the level to boot into, or null
import { LEVELS } from '../core/levels.js';
import { autopilot } from '../core/autopilot.js';

export function installDebug(r) {
  const q = new URLSearchParams(location.search);
  if (!q.has('debug')) return null;
  if (q.has('auto')) r.pilot = autopilot;
  const level = LEVELS[Number(q.get('level')) - 1];
  if (q.has('boss')) return { ...(level ?? LEVELS[0]), waves: null }; // a level without waves starts with its boss
  return level ?? null;
}
