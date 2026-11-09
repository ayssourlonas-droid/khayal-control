// The trailer's edit, DOM-free: which stretches of the run become clips, where the blooper starts,
// and the running order of clips, title cards and the final card.
//   cutClips(events, ticks) -> [{ start, end, peak, kind }]   at most 4, in order, never overlapping
//   blooperSpan(events, ticks) -> { start, hit } | null        the last 1.2 s before the fatal hit
//   timeline(clips, cards) -> [{ type: 'clip', ...clip } | { type: 'card', lines, secs } | { type: 'final', secs }]
// The highlight picker (core/highlights.js) chooses the moments; each clip is trimmed to about three
// seconds round its peak (the boss kill keeps its whole destruction chain), and a run with fewer than
// four moments is filled from other good events: a boss phase, a part torn off, a bomb, a kill.
import { pickHighlights, overlaps } from '../../core/highlights.js';
import { clamp } from '../../core/math.js';

export const CLIP_TICKS = 160; // 2.7 s of play; the slow motion on the peak makes it about 3.2 s
export const BOSS_TICKS = 300;
export const BLOOPER_TICKS = 72; // 1.2 s before the fatal hit: about 4 s at 0.3x (R32)
export const FINAL_SECS = 3.2;
const MAX_CLIPS = 4;
const PEAK_AT = 0.55; // where the peak sits in a trimmed clip (late: the build-up, then the hit)

// Events that make a fair shot when the picker found fewer than four moments, by weight.
const FILL = { bossPhase: 5, partDown: 4, bossExpose: 4, waveClear: 3, bomb: 3, power: 2, shipHit: 2, pickup: 1, kill: 1 };

function trim(w) {
  const len = Math.min(w.end - w.start, w.kind === 'bossDeath' ? BOSS_TICKS : CLIP_TICKS);
  const start = clamp(Math.round(w.peak - PEAK_AT * len), w.start, w.end - len);
  return { start, end: start + len, peak: w.peak, kind: w.kind };
}

const around = (peak, kind, ticks) => {
  const len = Math.min(ticks, CLIP_TICKS);
  const start = clamp(Math.round(peak - len / 2), 0, ticks - len);
  return { start, end: start + len, peak: clamp(peak, start, start + len), kind };
};

export function cutClips(events, ticks) {
  if (ticks <= 0) return [];
  const clips = pickHighlights(events, ticks).map(trim);
  const extra = events
    .filter((e) => FILL[e.type] && e.tick >= 0 && e.tick <= ticks && (e.type !== 'power' || e.on))
    .map((e) => ({ e, weight: FILL[e.type] + (e.type === 'kill' ? (e.mult ?? 1) / 4 : 0) }))
    .toSorted((a, b) => b.weight - a.weight || a.e.tick - b.e.tick);
  for (const { e } of extra) {
    if (clips.length >= MAX_CLIPS) break;
    const c = around(e.tick, e.type, ticks);
    if (!overlaps(clips, c)) clips.push(c);
  }
  if (!clips.length) clips.push(around(ticks - Math.round(Math.min(ticks, CLIP_TICKS) / 2), 'finale', ticks));
  return clips.toSorted((a, b) => a.start - b.start);
}

export function blooperSpan(events, ticks) {
  const fatal = events.findLast((e) => e.type === 'shipHit' && e.lives <= 0) ?? events.findLast((e) => e.type === 'failed');
  if (!fatal || fatal.tick > ticks) return null;
  return { start: Math.max(0, fatal.tick - BLOOPER_TICKS), hit: fatal.tick };
}

// How long a card holds: long enough to read, never long enough to stall the cut.
export const cardSecs = (lines) => clamp(1.15 + 0.008 * lines.join(' ').length, 1.2, 1.6);

// Four clips open cold on the first clip; a shorter trailer opens on its first card instead.
export function timeline(clips, cards) {
  const segs = [];
  let next = 0;
  const card = () => {
    if (next < cards.length) segs.push({ type: 'card', lines: cards[next], secs: cardSecs(cards[next++]) });
  };
  if (clips.length < MAX_CLIPS) card();
  clips.forEach((c, i) => {
    if (i > 0) card();
    segs.push({ type: 'clip', ...c });
  });
  segs.push({ type: 'final', secs: FINAL_SECS });
  return segs;
}
