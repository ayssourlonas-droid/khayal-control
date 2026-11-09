// What The Squall Ray's painters share (World 18, Anvil Sky; bosses/ray*.js): its colours, its geometry (the parts' rects read from the
// core's data, so the art follows the hit boxes) and a few small tools. Coordinates are boss-local: the origin is the boss's centre, x
// right, y down; the hull canvas is the boss's size (900 x 300) plus a pad of 80 each side (ray.js); nothing may be drawn above y = TOP (the
// HUD's edge). The ray is thundercloud and iron: a cloud is deep indigo (darker and bluer than the sky's own slate thunderheads, so that the ray
// stands out of them) lit cold from above and from below at its edges, and lit violet and cyan from within where lightning lives; the iron is weathered
// blue-grey (the world's own metal, aliens/w18-kit.js, with a little of the cloud's violet in it, so that it belongs to it), the coils are copper, and every weak point glows the ray's own colours, electric violet and cyan.
//   PAL    CLOUD deepest shadow .. lit crest, the lightning's colours, the iron and the copper
//   PART   { [id]: { x, y, w, h } } the parts' rects (centre and size) from bossDef('ray')
//   rng(seed)  a seeded stream in [0, 1): the same ray every bake
//   bloom(l, x, y, r, c, a)  a bloom on the lights layer whose radius is held under TOP, so that it fades out before the HUD's line instead of being cut
//   feather(g)  fade whatever lies within FEATHER px of TOP out to nothing at it (destination-out), on a hull layer whose origin is the boss's centre
// Bake-time only: nothing here runs per frame.
import { bossDef } from '../../core/bosses-data.js';
import { hash } from '../sprites.js';
import { path, line, lin, rad, rgba, shade, ellipse, TAU } from './kit.js';
import { circle } from '../aliens/kit.js';
import { IRON_D, STEEL, COPPER, COPPER_D, COPPER_L, PORCELAIN } from '../aliens/w18-kit.js';

export { hash, path, line, lin, rad, rgba, shade, circle, ellipse, TAU };

export const TOP = -158; // no art above this y, the spine's top included
export const FEATHER = 26; // the px under TOP over which a glow fades out
export const PAL = {
  hull: '#1a1846', // the cloud's dark mass: indigo (the look's own hull colour, looks/w18.js palette.boss, is the slate of the sky's thunderheads)
  cloud: ['#06071a', '#0f0e30', '#1b1a4a', '#2c2b78', '#4847a8', '#7a79d6'], // deepest shadow .. lit edge of a billow
  ice: '#c6ecff', cyan: '#5cf0ff', volt: '#8ad0ff', violet: '#a98bff', electric: '#7a4dff', yellow: '#ffe14a', white: '#f2fbff',
  iron: '#5a5f88', ironD: IRON_D, steel: STEEL, plate: '#7a80b0', copper: COPPER, copperD: COPPER_D, copperL: COPPER_L, porcelain: PORCELAIN,
  rust: '#6b4a3a',
};

export const PART = Object.fromEntries(bossDef('ray').parts.map((p) => [p.id, { x: p.dx, y: p.dy, w: p.w, h: p.h }]));

export const rng = (seed) => {
  let i = 0;
  return () => hash(seed * 7919 + i++);
};

export function bloom(l, x, y, r0, c, a) {
  const r = Math.min(r0, y - TOP); // a bloom that would reach the HUD's line is made smaller, so that it has faded out before it
  if (r <= 1) return;
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, x, y, 0, r, [[0, rgba(c, a)], [0.25, rgba(c, a * 0.5)], [0.6, rgba(c, a * 0.14)], [1, rgba(c, 0)]]);
  l.fillRect(x - r, y - r, r * 2, r * 2);
  l.restore();
}

export function feather(g, w = 1100) {
  g.save();
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = lin(g, 0, TOP, 0, TOP + FEATHER, [[0, 'rgba(0,0,0,1)'], [1, 'rgba(0,0,0,0)']]);
  g.fillRect(-w / 2, TOP, w, FEATHER);
  g.restore();
}
