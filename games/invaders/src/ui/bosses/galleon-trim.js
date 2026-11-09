// The Thunder Galleon's trim (World 13, Sunset Armada; galleon.js draws it over the hull): the carving and the
// weathering that make the plating look lived in. An anchor hung from a chain under the belt on each
// flank, scratches across the plates and streaks of verdigris
// running down from the belt. Bake-time only.
import { path, ink, line, lin, rgba, ellipse } from './kit.js';
import { hash } from '../sprites.js';
import { BRASS_L, IRON, IRON_L } from './galleon-kit.js';
import { hullPath } from './galleon-hull.js';

// An anchor 20 wide and 30 tall hanging from the belt at x by a short chain: a ring, a stock across the
// top of the shank, two curved arms with a fluke on each.
function anchor(b, x, y) {
  for (let i = 0; i < 3; i++) {
    ellipse(b, x, y + 2 + i * 3.4, 1.8, 2.2);
    line(b, '#05030a', 2.4);
    line(b, IRON_L, 1.2);
  }
  const k = y + 10;
  b.beginPath();
  b.moveTo(x, k);
  b.lineTo(x, k + 22);
  b.moveTo(x - 7, k + 4);
  b.lineTo(x + 7, k + 4);
  b.moveTo(x - 9, k + 15);
  b.quadraticCurveTo(x - 7, k + 24, x, k + 23);
  b.quadraticCurveTo(x + 7, k + 24, x + 9, k + 15);
  line(b, '#05030a', 4.6);
  line(b, IRON, 3);
  line(b, rgba(IRON_L, 0.9), 1);
  for (const s of [-1, 1]) {
    path(b, [[x + s * 9, k + 15], [x + s * 5.4, k + 15.4], [x + s * 8, k + 19.6]]);
    ink(b, IRON, 1);
  }
  ellipse(b, x, k - 0.4, 2.8, 2.8);
  line(b, '#05030a', 2.6);
  line(b, BRASS_L, 1.2);
}

// Verdigris streaking down from the belt and scratches across the plates, clipped to the hull.
function weathering(b) {
  b.save();
  hullPath(b);
  b.clip();
  for (let i = 0; i < 26; i++) {
    const x = (hash(i * 3 + 700) - 0.5) * 440;
    const y = 30 + hash(i * 7 + 71) * 10;
    const len = 12 + hash(i + 55) * 26;
    b.fillStyle = lin(b, 0, y, 0, y + len, [[0, rgba('#3aa888', 0.3)], [1, rgba('#3aa888', 0)]]);
    b.fillRect(x, y, 1.8 + hash(i + 9) * 2, len);
  }
  for (let i = 0; i < 24; i++) {
    const x = (hash(i * 5 + 300) - 0.5) * 440;
    const y = 40 + hash(i * 11 + 17) * 100;
    path(b, [[x, y], [x + 8 + hash(i) * 14, y - 3 + hash(i + 3) * 6]], true);
    line(b, rgba('#fff0c0', 0.16), 0.9);
  }
  b.restore();
}

export function trim(b) {
  weathering(b);
  for (const s of [-1, 1]) {
    anchor(b, s * 120, 25);
  }
}
