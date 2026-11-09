// The Milad Tower at night, the parallax layer kind 'milad' (parallax-shapes.js has the painter
// contract), painted in PIXEL-sized blocks (kit.js): in the middle the tower, by far the tallest
// thing on screen (milad-tower.js) with floodlight pooling at its foot and the red lamps blinking on
// its mast (layer lights that pulse); round its foot the city low across the whole width with its
// windows lit, and the highway's lamps in a line in front (milad-city.js). The layer brings L.lit,
// L.ink, L.glow, L.lamp, L.tower, L.towerLit and L.red. Rows are counted from F, the street.
import { PIXEL, mix } from '../sprites.js';
import { scene } from './kit.js';
import { tower } from './milad-tower.js';
import { city, highway } from './milad-city.js';

const UNDER = 16; // blocks from the street down to the band's foot; the ground hides the lowest 14

export function milad(g, w, h, rng, L, lights) {
  const tone = {
    '#': L.color, '-': L.ink, G: L.lamp, g: mix(L.lamp, L.glow, 0.5), h: mix(L.glow, L.ink, 0.55),
    c: mix(L.color, L.ink, 0.35), C: mix(L.color, L.lit, 0.18), d: mix(L.glow, L.color, 0.6),
    w: L.tower, W: L.towerLit, f: mix(L.tower, L.towerLit, 0.3), x: mix(L.tower, L.ink, 0.3), v: mix(L.tower, L.ink, 0.6),
    R: L.red,
  };
  const art = scene(g, w, h, rng, L, lights, tone, UNDER);
  g.save();
  g.scale(PIXEL, PIXEL);
  city(art);
  tower(art);
  highway(art);
  g.restore();
}
