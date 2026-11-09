// The near layer of Glass Cathedral: the cathedral's floor, behind the ship and the bullets, so it is dark and low in
// contrast with its tallest things at the sides: on the left the stump of a carved arch, on the floor shards of
// stained glass in dim jewel colours with here and there a standing one, a pane that fell whole and leans on a
// block, three iron candle stands with a few small warm flames (the only lights, few, small and dim), faint pools
// of coloured light on the flags, and paving joints. The middle of the screen's foot is kept low and bare. The
// pieces are in parallax-glass-near-parts.js; the mid layer and the far one are parallax-glass.js's. See
// parallax-shapes.js for the painter contract.
import { rgba } from './sprites.js';
import { profile, waves } from './parallax-kit.js';
import { shards, pane, stand, pool, strewn } from './parallax-glass-near-parts.js';
import { stump } from './parallax-glass-near-stump.js';
import { JEWEL } from './parallax-glass-kit.js';

export const NEAR_H = 320; // the layer's height (looks/w16.js): it stands on the bottom of the frame
export const BED = 262; // the floor's mean y in the layer
export const STANDS = [[830, 98, 4], [1570, 118, 3], [2030, 84, 3]]; // the candle stands: [x in the layer, height, candles]

function glassfloor(g, w, h, rng, L, out) {
  const wave = waves(rng, 3, 0.006);
  const floor = (x) => BED + 4 * wave(x);
  g.save();
  g.fillStyle = L.color;
  stump(g, out, rng, L, 330, floor(330), 100, 190);
  g.fillStyle = L.color;
  for (const [x, hh, n] of STANDS) stand(g, out, rng, L, x, floor(x), hh, n);
  pane(g, rng, L, 1160, floor(1160) + 2, 74, 56, JEWEL.sapphire);
  g.fillStyle = L.color;
  g.fillRect(1196, floor(1196) - 18, 40, 18);
  for (const [x, n, spread, standing] of [[600, 14, 160, 2], [1020, 9, 120, 0], [1330, 12, 150, 1], [1760, 15, 190, 2], [2120, 8, 90, 1], [190, 7, 90, 0]]) shards(g, rng, L, x, floor, n, spread, standing);
  g.fillStyle = L.color; // the floor
  profile(g, w, h, floor);
  strewn(g, rng, L, w, BED + 10, h - 8, 90);
  g.fillStyle = rgba('#c8a0d8', 0.05); // paving joints
  for (let y = BED + 18; y < h; y += 15 + (y - BED) * 0.12) g.fillRect(0, y, w, 1);
  for (const [x, c, k] of [[560, JEWEL.ruby, 0.1], [1240, JEWEL.sapphire, 0.09], [1880, JEWEL.amethyst, 0.1], [930, JEWEL.amber, 0.07]]) pool(g, x, BED + 16, 300, c, k);
  g.restore();
}

export const NEAR = { glassfloor };
