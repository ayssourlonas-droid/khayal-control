// What the Vesper Moth's painters share (World 16, Glass Cathedral; bosses/moth*.js): its colours (the boss palette's
// indigo stone, violet-grey plate and hot gold weak colour, the five jewel colours of the glass, the lead of the cames),
// a seeded stream of numbers, a spline, and the two things everything is made of: a pane of glass (a jewel-coloured
// cell brightest at its middle and darkest at the lead, with the streaks, seeds and glints of old cathedral glass) and a
// came (the lead round it, with a lit edge and solder blobs at the joints). Light comes from behind and above: the dawn
// behind the moth, so every pane glows from within and every rim on the top is lit. Bake-time only: nothing here runs
// per frame.
import { line, lin, rad, rgba, shade, path, TAU } from './kit.js';
import { circle } from '../aliens/kit.js';
import { spline } from './galleon-kit.js';
import { hash, mix } from '../sprites.js';

export { circle, spline, TAU, mix };

export const STONE = '#1c1440'; // the palette's hull: deep indigo stone
export const STONE_L = '#7a5ca8'; // the palette's plate: stone the dawn reaches
export const STONE_M = '#3e2c70';
export const WEAK = '#ffe9b0'; // the weak points' hot white-gold
export const LEAD = '#0f0a26'; // the cames
export const LEAD_L = '#7a6aa8'; // the sheen on lead
export const INK = '#080414';
export const ROSE = '#ff5fa2';
export const COBALT = '#4fa8ff';
export const AMBER = '#ffb04a';
export const VIOLET = '#a47cff';
export const GOLD = '#ffe27a';
export const GREEN = '#1f6a52'; // dark and small: the acid lime is the enemy's alone
export const JEWELS = [ROSE, COBALT, AMBER, VIOLET, GOLD];

// A seeded stream in [0, 1): the same glass every bake.
export const rng = (seed) => {
  let i = 0;
  return () => hash(seed * 7919 + i++);
};

// A smooth closed (or open) path through pts.
export function curve(g, pts, closed = true) {
  g.beginPath();
  g.moveTo(...pts[0]);
  spline(g, pts, closed);
  if (closed) g.closePath();
}

// Lead along the path `build` makes: a dark core, a pale sheen along its lit side (up and left).
export function came(g, build, w = 3.4, sheen = 0.5) {
  build();
  line(g, LEAD, w);
  g.save();
  g.translate(-w * 0.18, -w * 0.26);
  build();
  line(g, rgba(LEAD_L, sheen), Math.max(0.7, w * 0.28));
  g.restore();
}

// A blob of solder where cames meet.
export function solder(g, x, y, r = 2.1) {
  circle(g, x, y + 0.5, r + 0.9);
  g.fillStyle = INK;
  g.fill();
  circle(g, x, y, r);
  g.fillStyle = rad(g, x, y, 0, r, [[0, '#d8d0f0'], [0.55, '#7a6aa8'], [1, '#2a2050']], x - r * 0.35, y - r * 0.4);
  g.fill();
}

const dots = (g, r, box, n, draw) => {
  for (let i = 0; i < n; i++) draw(box[0] + r() * box[2], box[1] + r() * box[3], i);
};

// A pane of glass: the closed path `build` makes, filled jewel `c` and bright at its middle `m` = [x, y, radius],
// with `lum` 0..1 how much light comes through. Streaks of the glass's flow along `dir` (rad), a few seeds, a diaper of
// fine lines on some, the dark of the glass thickening at the lead and a bevelled light along the top and left edges.
// `band` = [x0, y0, x1, y1, stops] adds a broad moving sheen (the wing's flap slides it across).
export function pane(g, build, c, m, seed, lum = 0.5, dir = 0, band = null) {
  const r = rng(seed);
  const [mx, my, mr] = m;
  g.save();
  build();
  g.clip();
  g.fillStyle = rad(g, mx, my, 0, mr, [[0, shade(c, 0.16 + 0.28 * lum)], [0.4, shade(c, -0.06 + 0.08 * lum)], [0.76, shade(c, -0.36)], [1, shade(c, -0.66)]], mx - mr * 0.1, my - mr * 0.22);
  g.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
  g.fillStyle = lin(g, 0, my - mr, 0, my + mr, [[0, 'rgba(255,255,255,0.14)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,12,0.3)']]); // the dawn from above
  g.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
  const box = [mx - mr, my - mr, mr * 2, mr * 2];
  const [wx, wy] = [mx + (r() - 0.5) * mr * 1.1, my + (r() - 0.5) * mr * 1.1]; // a wisp of a second colour, as in antique glass
  g.fillStyle = rad(g, wx, wy, 0, mr * 0.85, [[0, rgba(mix(c, JEWELS[Math.floor(r() * 5)], 0.6), 0.42)], [1, rgba(c, 0)]]);
  g.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
  const [cd, sd] = [Math.cos(dir), Math.sin(dir)];
  for (let i = 0; i < 5; i++) { // the glass's flow
    const [o, len] = [(r() - 0.5) * mr * 1.4, mr * (0.45 + r() * 0.5)];
    const [x, y] = [mx - sd * o, my + cd * o];
    path(g, [[x - cd * len, y - sd * len], [x + cd * len, y + sd * len]], true);
    line(g, i % 2 ? rgba(shade(c, -0.6), 0.2) : rgba('#ffffff', 0.17), 0.8 + r() * 1.4);
  }
  if (seed % 3 === 0) { // a diaper of fine lines, the painter's work on the glass
    g.beginPath();
    for (let k = -2 * mr; k < 2 * mr; k += 7) { // lines at 45 degrees, kept inside the pane's box
      const [a0, a1] = [Math.max(-mr, -mr - k), Math.min(mr, mr - k)];
      if (a0 < a1) {
        g.moveTo(mx + a0, my + a0 + k);
        g.lineTo(mx + a1, my + a1 + k);
      }
      const [b0, b1] = [Math.max(-mr, k - mr), Math.min(mr, k + mr)];
      if (b0 < b1) {
        g.moveTo(mx + b0, my - b0 + k);
        g.lineTo(mx + b1, my - b1 + k);
      }
    }
    line(g, rgba(shade(c, -0.7), 0.2), 0.7);
  }
  dots(g, r, box, 3 + Math.floor(r() * 3), (x, y) => { // seeds: tiny bubbles in the glass
    const s = 0.8 + r() * 1.1;
    circle(g, x, y, s);
    g.fillStyle = rgba(shade(c, -0.55), 0.4);
    g.fill();
    circle(g, x - s * 0.3, y - s * 0.35, s * 0.45);
    g.fillStyle = rgba('#ffffff', 0.6);
    g.fill();
  });
  if (band) {
    g.fillStyle = lin(g, band[0], band[1], band[2], band[3], band[4]);
    g.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
  }
  build(); // the glass thickens toward the lead
  line(g, rgba(shade(c, -0.8), 0.5), 8);
  g.save();
  g.translate(1.3, 1.8);
  build(); // the bevel: a light line just inside the top and left edges
  line(g, rgba('#ffffff', 0.3), 1.1);
  g.restore();
  g.restore();
}
