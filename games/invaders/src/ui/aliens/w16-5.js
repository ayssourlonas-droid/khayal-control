// World 16, Glass Cathedral, the carrier (see w16.js): a gilded reliquary on little glass wings, the pickup
// bearer (and the saucer): a small house-shaped shrine of gold (w16-shrine.js) with jewels and a window that
// blazes, carried on two pairs of butterfly wings of leaded glass that beat (raised on beat 0, lowered on beat
// 1). It is a touch larger than the others and the only gold one; no lime anywhere (its emerald is teal).
// Lights: the window, the gems, the glass shining through the wings and a gold glow round the whole.
import { bez, lerp2, bloom } from './w16-kit.js';
import { lattice } from './w16-wing.js';
import { shrine } from './w16-shrine.js';

const PANES = ['#ff6fa8', '#cfe2ff', '#4f86ff', '#ffc040', '#cfe2ff', '#b070ff']; // rose, clear, sapphire, amber, clear, amethyst
const TIPS = [[[40, -28], [34, 9]], [[42, -9], [34, 30]]]; // [beat][upper, lower]: where each lobe ends

// One lobe on side m from its two roots (a on the leading edge, b on the trailing) out to its tip.
function lobe(b, l, m, a, bb, tip, up, seed) {
  const flip = (pts) => pts.map(([x, y]) => [m * x, y]);
  const edge = (P, d) => bez(P, lerp2(P, tip, 0.3).map((v, i) => v + (i ? d : 0)), lerp2(P, tip, 0.72).map((v, i) => v + (i ? d * 0.7 : 0)), tip, 18);
  lattice(b, l, flip(edge(a, -up)), flip(edge(bb, up * 0.6)), 2, 3, (i, j) => PANES[(i + j * 3 + seed) % 6], 0.16, '#ffe27a');
}

export function carrier(b, l, f, c) {
  bloom(l, 0, 0, 40, c, 0.14 + f * 0.05);
  for (const m of [-1, 1]) {
    lobe(b, l, m, [19, -15], [19, 3], TIPS[f][0], 9, 0); // upper wing
    lobe(b, l, m, [19, 7], [19, 19], TIPS[f][1], 6, 2); // lower wing
  }
  for (const g of [b, l]) {
    g.save();
    g.translate(0, 3);
    g.scale(1.1, 1.1);
    g.translate(0, -3);
  }
  shrine(b, l, f, c);
  b.restore();
  l.restore();
}
