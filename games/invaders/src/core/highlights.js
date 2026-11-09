import { clamp } from './math.js';

// The trailer's editor: scores the moments of a run from its event log and cuts the best clips.
// A moment is { peak, weight, kind }: the tick it peaks on and how much it is worth.
//   bossDeath 10 · last alien of the level 6 · multi-kill 5 (3 kills in 30 ticks) · bomb 4 ·
//   nearMiss 3 · combo peak 2 x the multiplier reached
// A clip is a window of 180-300 ticks around a peak (longer for a heavier moment); at most four,
// none overlapping, in the order they happened. A boss kill is always kept, and its clip runs to the
// level's clear when that is in reach (clipOf).

const WEIGHT = { bossDeath: 10, lastAlien: 6, multiKill: 5, bomb: 4, nearMiss: 3 };
const MULTI_KILLS = 3;
const MULTI_SPAN = 30; // ticks
const MIN_LEN = 180;
const MAX_LEN = 300;
const MAX_CLIPS = 4;

// Kills in a burst: MULTI_KILLS or more kills within MULTI_SPAN ticks of each other, found by
// sliding the window along the kills: a burst that is too short to count is passed one kill at a
// time (the next kills may still start one), and a burst that counts is taken whole before the
// search goes on after it. Its peak is the middle kill.
function multiKills(kills) {
  const out = [];
  for (let i = 0; i < kills.length;) {
    let j = i;
    while (j + 1 < kills.length && kills[j + 1].tick - kills[i].tick <= MULTI_SPAN) j++;
    if (j - i + 1 < MULTI_KILLS) {
      i++;
      continue;
    }
    out.push({ peak: kills[i + Math.floor((j - i) / 2)].tick, weight: WEIGHT.multiKill, kind: 'multiKill' });
    i = j + 1;
  }
  return out;
}

// A combo starts on a kill with multiplier 1 and peaks on the first kill that reaches its highest
// multiplier; one that never got past 1 is not a combo.
function comboPeaks(kills) {
  const out = [];
  let top = null;
  const close = () => {
    if (top && top.mult >= 2) out.push({ peak: top.tick, weight: 2 * top.mult, kind: 'combo' });
  };
  for (const k of kills) {
    if (k.mult === 1 || !top) {
      close();
      top = k;
    } else if (k.mult > top.mult) top = k;
  }
  close();
  return out;
}

function moments(events) {
  const kills = events.filter((e) => e.type === 'kill' && e.scored);
  const out = [...multiKills(kills), ...comboPeaks(kills)];
  for (const e of events) {
    if (e.type === 'bossDeath') {
      const clear = events.find((c) => c.type === 'cleared' && c.tick >= e.tick);
      out.push({ peak: e.tick, weight: WEIGHT.bossDeath, kind: 'bossDeath', cleared: clear?.tick });
    } else if (e.type === 'waveClear' && e.last) out.push({ peak: e.tick, weight: WEIGHT.lastAlien, kind: 'lastAlien' });
    else if (e.type === 'bomb') out.push({ peak: e.tick, weight: WEIGHT.bomb, kind: 'bomb' });
    else if (e.type === 'nearMiss') out.push({ peak: e.tick, weight: WEIGHT.nearMiss, kind: 'nearMiss' });
  }
  return out;
}

// The clip around a moment: heavier means longer, and the boss kill leaves room for its
// destruction chain (3 s = 180 ticks) after the peak. A slow power running at the kill stretches the chain
// (enemy time slows with it), so when the level's clear (m.cleared, the chain's end) lies past the clip but
// the clip can still reach it with the peak inside, the clip is moved on to end on it. Always inside [0, total].
function clipOf(m, total) {
  const len = Math.min(total, clamp(MIN_LEN + 12 * m.weight, MIN_LEN, MAX_LEN));
  const lead = m.kind === 'bossDeath' ? 0.25 : 0.4;
  let start = clamp(Math.round(m.peak - lead * len), 0, total - len);
  if (m.cleared > start + len && m.cleared - len <= m.peak) start = m.cleared - len;
  return { start, end: start + len, peak: m.peak, kind: m.kind };
}

const boss = (m) => (m.kind === 'bossDeath' ? 1 : 0);

// Does clip c overlap any clip of `clips` (each { start, end }, end exclusive)?
export const overlaps = (clips, c) => clips.some((o) => c.start < o.end && o.start < c.end);

export function pickHighlights(events, totalTicks) {
  const seen = events.filter((e) => e.tick >= 0 && e.tick <= totalTicks).sort((a, b) => a.tick - b.tick);
  if (totalTicks <= 0) return [];
  const ranked = moments(seen).sort((a, b) => boss(b) - boss(a) || b.weight - a.weight || a.peak - b.peak);
  const chosen = [];
  for (const m of ranked) {
    const clip = clipOf(m, totalTicks);
    if (chosen.length < MAX_CLIPS && !overlaps(chosen, clip)) chosen.push(clip);
  }
  return chosen.sort((a, b) => a.start - b.start);
}
