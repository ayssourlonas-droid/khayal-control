// The Craving's crown (World 17, Ash to Air; see craving.js): an armour part 280 x 80, nine half-smoked cigarettes standing like
// spikes in a fan across the brow, set in a notched ring-band of grey ash-clay (craving-crown-band.js, the cigarettes
// craving-pcig.js). The middle one is the tallest and its tip reaches the part's top (boss y -158, the HUD's edge: nothing is
// drawn above); the rest lean outward up to 38 degrees and shorten toward the ends. Four kinds: lit, snapped, a fat stub and one
// stood on its head to show its filter. Armour: dark and hard apart from the paper; its only lights are small dull embers.
import { cig } from './craving-pcig.js';
import { band, socketBack, socketFront, topAt } from './craving-crown-band.js';

const W = 17;
const WB = 13;
export const SPIKES = [ // x along the band, length, kind, seed
  [-112, 35, 'lit', 1], [-84, 47, 'snap', 2], [-56, 41, 'lit', 3], [-28, 53, 'stub', 4], [0, 57, 'lit', 5],
  [28, 45, 'filter', 6], [56, 52, 'lit', 7], [84, 41, 'snap', 8], [112, 36, 'lit', 9],
];
export const BACK = [[-98, 30], [-70, 40], [-42, 34], [-14, 46], [14, 44], [42, 36], [70, 39], [98, 28]]; // the burnt-out ones behind: x, length

const lean = (x) => (x / 140) * 0.98; // the fan: each leans out in proportion to its place

function stand(b, l, x, draw) { // run `draw` standing at x on the band, leaning with the fan, on both contexts
  for (const g of [b, l]) {
    g.save();
    g.translate(x, topAt(x) + 0.6);
    g.rotate(lean(x));
  }
  draw();
  b.restore();
  l.restore();
}

export function crown(b, l, p) {
  const top = -p.h / 2 + 2.6; // nothing above the HUD's line, with a little to spare
  b.save();
  b.beginPath();
  b.rect(-p.w / 2 - 20, top, p.w + 40, p.h + 24);
  b.clip();
  band(b);
  const order = SPIKES.map((s, i) => i).sort((i, j) => Math.abs(SPIKES[j][0]) - Math.abs(SPIKES[i][0]));
  for (const [x] of BACK) socketBack(b, x, WB);
  BACK.forEach(([x, L], i) => {
    stand(b, l, x, () => cig(b, l, { L, w: WB, kind: 'char', seed: 400 + i * 7 }));
    socketFront(b, x, WB);
  });
  for (const i of order) socketBack(b, SPIKES[i][0], W);
  for (const i of order) {
    const [x, L, kind, seed] = SPIKES[i];
    stand(b, l, x, () => cig(b, l, { L, w: W, kind, seed: seed * 13, glow: i % 2 ? 0.24 : 0.3 }));
    socketFront(b, x, W);
  }
  b.restore();
}
