// What is left of Cyrus's palaces on the plain either side of his tomb (pasargadae.js): lone columns,
// five blocks wide, lit down the left and shadowed down the right with a groove between, on a square
// base under a square capital, one of them broken off with a ragged top; and low wall remains of
// dim stone with lit tops. The tone map brings '1' to '5', the stone from lit to deep shade.
const SHAFT = '13245'; // the shaft's blocks across: lit, groove, face, shade, deep
const CAP = ['1111114', '2222224'];
const FOOT = ['1111114', '2222225', '2222225'];
const JAG = [3, 0, 2, 1, 3]; // how far below the tallest each block of a broken shaft ends
const COLUMNS = [[-196, 36], [-146, 22], [170, 36]]; // x from the middle (the shaft's centre), height in blocks
const WALLS = [[-236, 12], [-178, 14], [-112, 12], [100, 14], [196, 14]]; // x from the middle (the left end), length

export function ruins(art, mid) {
  for (const [x, tall] of COLUMNS) column(art, mid + x - 3, tall);
  for (const [x, len] of WALLS) remains(art, mid + x, len);
}

// A column `tall` blocks high on the floor whose left is at x; under 30 it is broken: no capital,
// a ragged top and a chunk of it fallen at its foot.
function column({ box, stamp, F }, x, tall) {
  const broken = tall < 30;
  const shaft = tall - FOOT.length - (broken ? 0 : CAP.length);
  stamp(FOOT, x, F - FOOT.length);
  for (let i = 0; i < SHAFT.length; i++) {
    const h = shaft - (broken ? JAG[i] : 0);
    box(x + 1 + i, F - FOOT.length - h, 1, h, SHAFT[i]);
  }
  if (broken) {
    box(x + 8, F - 2, 3, 2, '2');
    box(x + 8, F - 2, 3, 1, '1');
  } else {
    stamp(CAP, x, F - FOOT.length - shaft - CAP.length);
  }
}

// A wall remain `len` blocks long from x, 3 to 5 blocks tall, a block lower or higher every few blocks.
function remains({ box, rng, F }, x, len) {
  for (let i = 0, h = 4; i < len; h = Math.min(5, Math.max(3, h + Math.floor(rng() * 3) - 1))) {
    const w = Math.min(3 + Math.floor(rng() * 3), len - i);
    box(x + i, F - h, w, h, '3');
    box(x + i, F - h, w, 1, '1');
    i += w;
  }
}
