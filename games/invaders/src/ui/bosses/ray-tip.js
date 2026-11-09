// The sharpened tips of The Squall Ray's wings (World 18, Anvil Sky; ray-hull.js paints them over the cloud): there is no blade on a wing's end, the end of the
// cloud itself is the point (ray-mass.js: the discs shrink toward it and a row of small ones runs along the tip's ribbon, ray-shape.js TIP). What is laid here is
// only its light: a thin line of ice along the ribbon's upper edge, so that the point is drawn out to the last pixel, and a lit point at its very end where the arcs of the
// coils land (the live layer, ray-fx.js, throws them from each coil's prong to it). The right tip is painted; the left is its mirror. Bake-time only.
import { PAL, bloom, path, line, rgba } from './ray-kit.js';
import { glare } from '../aliens/w18-kit.js';
import { TIP, TIP_BALL } from './ray-shape.js';

export function tips(b, l) {
  for (const s of [-1, 1]) {
    for (const g of [b, l]) {
      g.save();
      g.scale(s, 1);
    }
    const edge = TIP.pts.map(([x, y], i) => [x, y - TIP.r0 * (1 - i / (TIP.pts.length - 1)) * 0.8]);
    path(l, edge, true);
    line(l, rgba(PAL.ice, 0.6), 1.2);
    glare(l, TIP_BALL[0], TIP_BALL[1], 2.8, PAL.white, 1);
    bloom(l, TIP_BALL[0], TIP_BALL[1], 14, PAL.cyan, 0.55);
    for (const g of [b, l]) g.restore();
  }
}
