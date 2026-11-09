// The Tomb of Ferdowsi at night, the parallax layer kind 'ferdowsi' (parallax-shapes.js has the
// painter contract), painted in PIXEL-sized blocks (kit.js): in the middle the tomb at Tus, a broad
// cube of white stone on a wide, low flight of steps, a column at each corner under a double-headed
// bull capital and a deep stepped cornice, the winged figure high on its front, floodlit from below
// (ferdowsi-tomb.js); in front of the steps the long pool, mirroring it, with its fountains, between
// lawns and low hedges with lamp posts on the paths, and trees beyond (ferdowsi-garden.js). The layer
// brings L.ink, L.glow, L.lamp, L.stone (the white), L.shade (its grey in shade), L.tree, L.grass and
// L.water. Rows are counted from F, the pool's far edge at the platform's foot.
import { PIXEL, mix } from '../sprites.js';
import { scene, reflect } from './kit.js';
import { tomb, floods, stoneTones } from './ferdowsi-tomb.js';
import { UNDER, POOL, lamps, lawns, hedges, posts, trees, water, fountains } from './ferdowsi-garden.js';

export function ferdowsi(g, w, h, rng, L, lights) {
  const tone = {
    ...stoneTones(L),
    k: L.ink, g: L.glow, G: L.lamp,
    m: mix(L.grass, L.lamp, 0.4), M: L.grass, N: mix(L.grass, L.ink, 0.55), // the lawn: lit, plain, shade
    t: L.tree, e: mix(L.tree, L.lamp, 0.25), y: mix(L.tree, L.grass, 0.5), // the trees and hedges: dark, lit edge, lit
    '~': L.water, W: mix(L.water, '#ffffff', 0.4), // the pool and its glints
  };
  const art = scene(g, w, h, rng, L, lights, tone, UNDER);
  g.save();
  g.scale(PIXEL, PIXEL);
  floods(art);
  lamps(art);
  trees(art);
  lawns(art);
  hedges(art);
  tomb(art);
  posts(art);
  water(art);
  g.restore();
  reflect(g, (art.mid - POOL) * PIXEL, POOL * 2 * PIXEL, art.F, UNDER);
  g.save();
  g.scale(PIXEL, PIXEL);
  fountains(art);
  g.restore();
}
