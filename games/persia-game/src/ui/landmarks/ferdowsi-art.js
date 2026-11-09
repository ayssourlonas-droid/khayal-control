// The small picture ferdowsi-tomb.js stamps, one character per block: the winged figure carved high
// on the tomb's front, 41 blocks across. Each row is its left half, written from the edge it reaches
// to the middle and padded out to 20 blocks, and the middle block; the right half mirrors it.
// '+' lit stone, '#' stone, '-' stone in shadow, '.' nothing.

const HALF = 20;
const mirror = (rows) => rows.map(([edge, mid]) => {
  const left = edge.padStart(HALF, '.');
  return left + mid + [...left].reverse().join('');
});

export const WINGED = mirror([
  ['+', '+'], // the head, the neck and the arms
  ['+#', '+'],
  ['#', '+'],
  ['+#', '+'],
  ['+'.repeat(16) + '#+', '+'], // the wings, three tiers, longest on top, and the ring about its waist
  ['+' + '#'.repeat(15) + '-++', '+'],
  ['+'.repeat(12) + '.+--', '-'],
  ['#'.repeat(11) + '.+--', '-'],
  ['+'.repeat(9) + '.+--', '-'],
  ['#'.repeat(8) + '.###', '#'],
  ['+-..+#', '+'], // the tail, and the two ends that fall to either side of it
  ['+#...-+', '#'],
  ['+#...#.', '+'],
  ['-....#', '#'],
  ['-', '#'],
]);
