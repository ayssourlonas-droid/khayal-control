// The alien sprite cache. The painters (animals.js) are run once per species, scale and frame into
// offscreen canvases: a body, its lights (drawn additively), a white hit-flash silhouette and the
// body's damage (cracks.js). Per frame the game only blits these.
//   SPECIES_LIST                        every species (kinds.js SPECIES)
//   PARADE_SCALE                        the scale the parade draws the animals at (screens/parade.js)
//   speciesSprites(look, species, scale = 1)
//                                       { body: [f0, f1], lights: [f0, f1], flash: [f0, f1], size,
//                                       scale } (draw a canvas at size x size world px; scale > 1
//                                       bakes it bigger, at that resolution, and has no flash: only
//                                       play draws a hit)
//   warmAliens(look)                    bake the whole set, damage included, and the parade's bigger
//                                       one (call when a level's view is built): nothing is baked on
//                                       a hit, mid-fight, or on the parade's first frame
//   portrait(look, species, scale)      one canvas: frame 0's body with its lights added on top,
//                                       as drawn in play (the word moment's face); not kept here
// A painter is (b, l, frame, colour): it draws centred on (0, 0) in world px into the body context
// b and the lights context l (see kit.js), colour = look.palette.alien[species].
import { makeCanvas, white, lighter } from '../sprites.js';
import { SPECIES } from '../../core/kinds.js';
import { CRACKABLE, cracked } from './cracks.js';
import { PAINTERS } from './animals.js';

const SIZE = 96; // px, a sprite canvas's edge at scale 1; the alien's centre is its centre
export const SPECIES_LIST = Object.keys(SPECIES);
export const PARADE_SCALE = 2; // the animals at twice their size in play

// scale -> { [species]: set }: nested, not one string key, so the per-frame lookup builds nothing.
const shelves = new Map();

function canvasAt(size, scale) {
  const c = makeCanvas(size, size);
  const g = c.getContext('2d');
  g.translate(size / 2, size / 2);
  g.scale(scale, scale);
  return [c, g];
}

// seed picks the crack pattern; cracks holds the damage canvases cracks.js bakes.
function bakeSet(paint, color, seed, scale) {
  const size = SIZE * scale;
  const body = [];
  const lights = [];
  for (const f of [0, 1]) {
    const [bc, bg] = canvasAt(size, scale);
    const [lc, lg] = canvasAt(size, scale);
    paint(bg, lg, f, color);
    body.push(bc);
    lights.push(lc);
  }
  return { body, lights, flash: scale === 1 ? body.map(white) : null, size, scale, seed, cracks: {} };
}

export function speciesSprites(look, species, scale = 1) {
  let shelf = shelves.get(scale);
  if (!shelf) shelves.set(scale, (shelf = {}));
  return (shelf[species] ??= bakeSet(PAINTERS[species], look.palette.alien[species], SPECIES_LIST.indexOf(species) + 1, scale));
}

export function portrait(look, species, scale) {
  const size = SIZE * scale;
  const [c, g] = canvasAt(size, scale);
  const [lc, lg] = canvasAt(size, scale);
  PAINTERS[species](g, lg, 0, look.palette.alien[species]);
  g.resetTransform();
  lighter(g);
  g.drawImage(lc, 0, 0);
  return c;
}

export function warmAliens(look) {
  for (const species of SPECIES_LIST) {
    speciesSprites(look, species, PARADE_SCALE);
    const set = speciesSprites(look, species);
    if (!CRACKABLE.includes(SPECIES[species])) continue;
    for (const f of [0, 1]) for (const stage of [1, 2]) cracked(set, f, stage);
  }
}
