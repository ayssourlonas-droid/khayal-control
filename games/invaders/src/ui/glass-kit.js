// What the Glass Cathedral's drawing of the player's side shares (world 16): the twin (ship-glass.js), its bolts
// (shots-glass.js), the pickup (pickup-glass.js) and the mending's shards (shard-sprites.js). The prism: a rainbow
// that a piece of glass throws, kept pale so a twin or a bolt reads as glass and never as a bullet (the enemy's
// bullets are acid lime, and no hue here comes near it). Paint-time helpers: nothing in this file runs per frame.
import { lin, rgba } from './sprites.js';

export const GLASS_WORLD = 16;
export const PRISM = ['#ff9ac8', '#ffd890', '#bff4ff', '#9ab8ff', '#d8a8ff']; // rose, gold, ice, cobalt, violet: the dispersion
export const SPECTRUM = ['#ff6fae', '#ffc060', '#6feaff', '#7a96ff', '#c08aff']; // the same rainbow deeper, for a rim that must not wash to white
export const ICE = '#d8f4ff'; // the glass's own tint: a pale blue-white
export const LEAD = '#1a1424'; // cames and outlines

// A rainbow ramp across (x0, y0) .. (x1, y1): the prism colours in turn, at alpha a.
export function prism(g, x0, y0, x1, y1, a = 1) {
  return lin(g, x0, y0, x1, y1, PRISM.map((c, i) => [i / (PRISM.length - 1), rgba(c, a)]));
}

export function spectrum(g, x0, y0, x1, y1, a = 1) {
  return lin(g, x0, y0, x1, y1, SPECTRUM.map((c, i) => [i / (SPECTRUM.length - 1), rgba(c, a)]));
}

// Glass's fill: pale and see-through at one end, a little bluer and fainter at the other.
export const pane = (g, x0, y0, x1, y1, a = 1) => lin(g, x0, y0, x1, y1, [[0, rgba('#f4fcff', 0.62 * a)], [0.5, rgba('#bfe4ff', 0.36 * a)], [1, rgba('#a8c4ff', 0.2 * a)]]);

// A polygon through [[x, y], ...], closed, as the current path.
export function poly(g, pts) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
}
