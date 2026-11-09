// The pilot's rank (R66): a ladder climbed by medals, one per level cleared without catching a power-up
// (scoring.js awardClear sets tally.medal; the UI keeps the best of each level). It starts at the
// bottom and every rung needs more medals than the last; the top needs every level's medal.
//   RANKS             the ladder, lowest first: { name, at } (at = medals needed)
//   rankOf(medals)    -> { name, index, next }   next: the rung above { name, at }, or null at the top

export const RANKS = [
  { name: 'Rookie', at: 0 },
  { name: 'Cadet', at: 1 },
  { name: 'Pilot', at: 3 },
  { name: 'Flight Lead', at: 6 },
  { name: 'Ace', at: 10 },
  { name: 'Squadron Ace', at: 18 },
  { name: 'Wing Leader', at: 30 },
  { name: 'Air Marshal', at: 50 },
  { name: 'Legend', at: 90 },
];

export function rankOf(medals) {
  let index = 0;
  while (index + 1 < RANKS.length && medals >= RANKS[index + 1].at) index += 1;
  return { name: RANKS[index].name, index, next: RANKS[index + 1] ?? null };
}
