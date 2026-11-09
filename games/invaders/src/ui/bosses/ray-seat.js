// The cloud where The Squall Ray's parts meet its body (World 18, Anvil Sky; ray-hull.js paints it on the cloud, before the hull's edge is hardened and
// lit): the rolled lips of the heart's rift, the lips of the mouth, the banks heaped at the ends of the anvil's plinth. They belong to the hull and not to
// the parts, so that a part's own picture is its iron and its hollow alone: its cracks and its charring (cracks.js paints both over what the part's canvas
// holds) then lie on the iron and not on the cloud, and a destroyed part is a dead mouth in live lips, not a puff of smoke. Boss coordinates.
import { PART, TOP } from './ray-kit.js';
import { RIFT, MOUTH, polyDepth } from './ray-shape.js';
import { lip, ring, blob } from './ray-lip.js';

export function seats(g) {
  const at = (id, paint) => {
    g.save();
    g.translate(PART[id].x, PART[id].y);
    paint();
    g.restore();
  };
  at('heart', () => lip(g, ring((x, y) => polyDepth(RIFT, x, y), 14, 2), [-84, -48, 168, 96], 23, { n: 30, edge: 260 }));
  at('maw', () => lip(g, ring((x, y) => polyDepth(MOUTH, x, y), 17, 2), [-98, -44, 196, 92], 33, { n: 40, edge: 330 }));
  at('spine', () => {
    for (const s of [-1, 1]) lip(g, blob(s * 58, 28, 16, 11), [s * 58 - 20, 14, 40, 30], 12 + s, { top: TOP - PART.spine.y, n: 14, edge: 70 });
  });
}
