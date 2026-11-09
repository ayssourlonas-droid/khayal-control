// Where the lobby's arrow keys go (DOM-free). Every world is a column of reels, and the worlds stand in
// rows of PER_ROW, in order, a partly filled last row left-aligned on the same columns (lobby.css).
//   rowsOf(count) -> [[world index, ...], ...]   the rows of the grid, top to bottom
//   step([world, reel], [dx, dy], rows, reels, goal) -> [world, reel] | null   null: the bottom bar
// Left and right change world within its row and keep the reel, wrapping inside that row. Up and down
// change reel; past a column's end they carry on into the row below (its first reel) or above (its last)
// at the goal column, or on that row's last card if it is shorter. The goal column is the one the pilot
// last chose (by left, right or the pointer; lobby.js remembers it, and it defaults to the current column),
// so a short last row does not lose it: down from world 12 to world 18 and up again is world 12, not 10.
// Below the last row the keys leave for the bar (Back, Reset scores); above the first row they stay on its first reel.
export const PER_ROW = 8;

export const rowsOf = (count) =>
  Array.from({ length: Math.ceil(count / PER_ROW) }, (_, r) =>
    Array.from({ length: Math.min(PER_ROW, count - r * PER_ROW) }, (_2, c) => r * PER_ROW + c));

export function step([world, reel], [dx, dy], rows, reels, goal) {
  const r = rows.findIndex((row) => row.includes(world));
  const row = rows[r];
  const col = row.indexOf(world);
  if (dx) return [row[(col + dx + row.length) % row.length], reel];
  if (reel + dy >= 0 && reel + dy < reels) return [world, reel + dy];
  const next = rows[r + dy];
  if (!next) return dy > 0 ? null : [world, 0];
  return [next[Math.min(goal ?? col, next.length - 1)], dy > 0 ? 0 : reels - 1];
}
