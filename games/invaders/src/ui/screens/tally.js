// The text of the results card's tally (DOM-free): how the score came about, from the world's tally
// { time, par, speed, bombBonus, lifeBonus, ... } (core/scoring.js awardClear).
//   tallyLines(tally) -> ['Time 0:48 · par 1:20 · ×1.40', 'Bombs unused 2 × 2,000 +4,000', 'Lives 3 × 3,000 +9,000']
//     the bonus lines only when that bonus was earned
import { fmt, clock } from '../format.js';
import { BOMB_POINTS, LIFE_POINTS } from '../../core/scoring.js';

// "Bombs unused 2 × 2,000 +4,000"; the count is left out if the bonus is not a whole number of units.
function bonusLine(cap, bonus, unit) {
  const n = bonus / unit;
  return `${cap} ${Number.isInteger(n) ? `${n} × ${fmt(unit)} ` : ''}+${fmt(bonus)}`;
}

export function tallyLines(t) {
  const lines = [`Time ${clock(t.time)} · par ${clock(t.par)} · ×${t.speed.toFixed(2)}`];
  if (t.bombBonus > 0) lines.push(bonusLine('Bombs unused', t.bombBonus, BOMB_POINTS));
  if (t.lifeBonus > 0) lines.push(bonusLine('Lives', t.lifeBonus, LIFE_POINTS));
  return lines;
}
