// Gonbad-e Qabus at night, the parallax layer kind 'qabus' (parallax-shapes.js has the painter
// contract), painted in PIXEL-sized blocks (kit.js): in the middle the tomb tower of 1006, a tall
// cylinder of pale fired brick whose ten sharp flanges run from its foot to the roof, floodlit from
// below, under a cone of the same brick, a band of inscription under the roof and a plaque over the
// small pointed door (qabus-tower.js); the green mound it stands on with the steps up to the door,
// and round the mound a park of pines and cypresses with lamps (qabus-park.js); and on the plain to
// either side the town's low tiled roofs, their windows lit (qabus-town.js). The layer brings L.lit,
// L.ink, L.glow, L.lamp, L.brick, L.tile, L.tree, L.grass and L.roof (the town's tiles); the brick
// and its lamps are Yazd's (yazd-brick.js). Rows are counted from F, the plain the park stands on.
import { PIXEL, mix } from '../sprites.js';
import { scene } from './kit.js';
import { tones } from './yazd-brick.js';
import { tower } from './qabus-tower.js';
import { lamps, mound, steps, trees, posts } from './qabus-park.js';
import { town } from './qabus-town.js';

const UNDER = 16; // blocks from the plain down to the band's foot; the ground hides the lowest 14

export function qabus(g, w, h, rng, L, lights) {
  const tone = {
    ...tones(L),
    m: mix(L.grass, L.lamp, 0.4), M: L.grass, N: mix(L.grass, L.ink, 0.55), O: mix(L.grass, L.ink, 0.82), // the lawn: lit, plain, shade, deep
    y: mix(L.tree, L.grass, 0.5), // the trees' lit green
    r: L.roof, o: mix(L.roof, L.ink, 0.45), p: mix(L.roof, L.ink, 0.75), // the town's tiles, lit to shade
    S: mix(L.tile, L.ink, 0.25), s: mix(L.tile, L.ink, 0.7), // the inscription's ground and its letters in shade
  };
  const art = scene(g, w, h, rng, L, lights, tone, UNDER);
  g.save();
  g.scale(PIXEL, PIXEL);
  art.box(0, art.F, art.BW, UNDER, 'O');
  lamps(art);
  town(art);
  trees(art, true); // the ones behind the mound
  mound(art);
  tower(art);
  steps(art);
  trees(art, false); // the ones in front of it
  posts(art);
  g.restore();
}
