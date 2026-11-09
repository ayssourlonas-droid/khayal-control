// The alien sprite cache. Each world's painters (w1.js .. w18.js) are run once per role and frame into
// offscreen canvases: a body, its lights (drawn additively), a white hit-flash silhouette and the
// body's damage (cracks.js). Per frame the game only blits these.
//   art(look)                         the world's module with defaults filled in: rate (frames/s),
//                                     sync (whole formation in step), bob (px), halo (alpha), crack
//   roleSprites(look, role, scale?)   { body: [f0, f1], lights: [f0, f1], flash: [f0, f1], size, scale }
//                                     (draw a canvas at size x size world px; scale > 1 is for the sheet)
//   extraSprites(look, name, scale?)  the same shape for 'saucer' or 'wreck', or null if the world
//                                     has no such painter
//   warmAliens(look)                  bake a world's whole set, damage included (call when a level's
//                                     view is built): nothing is baked on a hit, mid-fight
// A painter is (b, l, frame, colour): it draws centred on (0, 0) in world px into the body context
// b and the lights context l (see kit.js), colour = look.palette.alien[role] (the carrier's for
// extras). painter.size overrides the canvas edge (SIZE).
import { makeCanvas, white } from '../sprites.js';
import { CRACKABLE, cracked, crackLights } from './cracks.js';
import w1 from './w1.js';
import w2 from './w2.js';
import w3 from './w3.js';
import w4 from './w4.js';
import w5 from './w5.js';
import w6 from './w6.js';
import w7 from './w7.js';
import w8 from './w8.js';
import w9 from './w9.js';
import w10 from './w10.js';
import w11 from './w11.js';
import w12 from './w12.js';
import w13 from './w13.js';
import w14 from './w14.js';
import w15 from './w15.js';
import w16 from './w16.js';
import w17 from './w17.js';
import w18 from './w18.js';

const SIZE = 96; // px, a sprite canvas's edge at scale 1; the alien's centre is its centre
export const ROLE_LIST = ['grunt', 'diver', 'gunner', 'armored', 'carrier'];
const ART = [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15, w16, w17, w18];
const DEFAULTS = { rate: 2, sync: false, bob: 0, halo: 0.25, crack: null };

const sets = new Map(); // world -> scale -> { [role or extra name]: set } (shelf, below)
const arts = new Map();

export function art(look) {
  let a = arts.get(look.world);
  if (!a) {
    a = { ...DEFAULTS, ...(ART[look.world - 1] ?? ART[0]) };
    arts.set(look.world, a);
  }
  return a;
}

function canvasAt(size, scale) {
  const c = makeCanvas(size * scale, size * scale);
  const g = c.getContext('2d');
  g.translate((size * scale) / 2, (size * scale) / 2);
  g.scale(scale, scale);
  return [c, g];
}

// seed picks the crack pattern; crackColor is the world's hot line inside a crack (or null).
// cracks and crackGlow hold the damage canvases cracks.js bakes.
function bakeSet(paint, color, scale, seed, crackColor, flash) {
  const size = paint.size ?? SIZE;
  const body = [];
  const lights = [];
  for (const f of [0, 1]) {
    const [bc, bg] = canvasAt(size, scale);
    const [lc, lg] = canvasAt(size, scale);
    paint(bg, lg, f, color);
    body.push(bc);
    lights.push(lc);
  }
  return { body, lights, flash: flash ? body.map(white) : null, size, scale, seed, color, crackColor, cracks: {}, crackGlow: {} };
}

// A world's baked sets at one scale. Nested maps, not one string key: the drawing asks for every
// alien every frame, so a hit must build no key and work out no recipe.
function shelf(look, scale) {
  let byScale = sets.get(look.world);
  if (!byScale) sets.set(look.world, (byScale = new Map()));
  let s = byScale.get(scale);
  if (!s) byScale.set(scale, (s = {}));
  return s;
}

export function roleSprites(look, role, scale = 1) {
  const s = shelf(look, scale);
  return (s[role] ??= bakeSet(art(look)[role], look.palette.alien[role], scale, ROLE_LIST.indexOf(role) + 1, art(look).crack, true));
}

export function extraSprites(look, name, scale = 1) {
  const paint = art(look)[name];
  return paint ? (shelf(look, scale)[name] ??= bakeSet(paint, look.palette.alien.carrier, scale, 9, art(look).crack, false)) : null;
}

export function warmAliens(look) {
  for (const role of ROLE_LIST) roleSprites(look, role);
  extraSprites(look, 'saucer');
  extraSprites(look, 'wreck');
  for (const role of CRACKABLE) {
    const set = roleSprites(look, role);
    for (const f of [0, 1]) {
      for (const stage of [1, 2]) {
        cracked(set, f, stage);
        crackLights(set, f, stage);
      }
    }
  }
}
