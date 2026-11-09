// What grows back on world 17's far layer (the 'over' pass of smogcity, drawn on a transparent canvas and faded in by
// stage(h, 'green') in heal-view.js): a tree-lined avenue along the terrace, a hedge on its coping, gardens of leafy crowns on
// the flat roofs and the setbacks of the towers, ivy hanging down some of their sides, and moss, ivy and a leafy bush at the foot of
// every giant cigarette stump. Crowns are clusters of round lobes in three greens, shaded underneath and lit from the sun's side (up
// and right), a little dusted with the morning haze because they are far away. Nothing here is a small bright dot: the
// bullets are hot magenta and these are leaves. Every place comes from the plan (parallax-smog-far-plan.js) and a hash, so the pass
// agrees with the other two.
import { rgba, mix, hash } from './sprites.js';
import { TAU } from '../core/math.js';
import { GROUND } from './parallax-smog-far-kit.js';
import { PLAN } from './parallax-smog-far-plan.js';
import { CIGS, STUMP_H } from './parallax-smog-far-cig.js';

const HAZE = '#cfe6f2';
const hz = (c, k = 0.14) => mix(c, HAZE, k);
const G = { dark: hz('#1f6a38'), mid: hz('#3f9e44'), light: hz('#76c85a'), hi: hz('#b4e476'), trunk: hz('#5a4634'), flower: '#fff6d0' };

// A crown of leaves, its foot at (x, y) and radius r: lobes in three layers, the dark one under, the lit one over and up-right.
export function crown(g, x, y, r, s, lit = 1) {
  const cy = y - r * 0.72;
  const lobes = [];
  for (let k = 0; k < 7; k++) lobes.push([x + (hash(s + k) - 0.5) * r * 1.2, cy + (hash(s + 20 + k) - 0.5) * r * 0.7, r * (0.42 + 0.22 * hash(s + 40 + k))]);
  for (const [col, dx, dy, sc] of [[G.dark, -0.06, 0.16, 1], [G.mid, 0, 0, 0.9], [G.light, 0.14, -0.14, 0.62 * lit]]) {
    g.fillStyle = col;
    g.beginPath();
    for (const [lx, ly, lr] of lobes) {
      g.moveTo(lx + r * dx + lr * sc, ly + r * dy);
      g.arc(lx + r * dx, ly + r * dy, lr * sc, 0, TAU);
    }
    g.fill();
  }
  g.fillStyle = rgba(G.hi, 0.8 * lit);
  g.beginPath();
  for (let k = 0; k < 4; k++) {
    const [lx, ly, lr] = lobes[k];
    g.moveTo(lx + r * 0.2 + lr * 0.3, ly - r * 0.2);
    g.arc(lx + r * 0.2, ly - r * 0.2, lr * 0.3, 0, TAU);
  }
  g.fill();
}

// A tree: a slim trunk, a crown on it.
function tree(g, x, y, h, r, s) {
  g.fillStyle = G.trunk;
  g.fillRect(x - 1.4, y - h, 2.8, h);
  crown(g, x, y - h + r * 1.1, r, s);
}

// Where a plan building's roof is, as [x0, x1, y] spans for a garden: its flat roofs and setbacks.
function roofs(b) {
  if (b.k === 'block') return [[b.x + 3, b.x + b.w - 3, b.top + (b.s % 2 ? 12 : 0) - 2]];
  if (b.k === 'slab') return [[b.x + 1, b.x + b.w * 0.16, b.top + 24 + (b.s % 4) * 3], [b.x + b.w * 0.84, b.x + b.w - 1, b.top + 24 + (b.s % 4) * 3]];
  if (b.k === 'dome') return [[b.x + 4, b.x + b.w * 0.24, b.top + 96], [b.x + b.w * 0.76, b.x + b.w - 4, b.top + 96]];
  return [];
}

// Ivy hanging from a roof edge: a wavy strand with leaves down it.
function ivy(g, x, y, len, s) {
  g.strokeStyle = G.dark;
  g.lineWidth = 1.2;
  g.beginPath();
  for (let i = 0; i <= len; i += 3) g.lineTo(x + Math.sin(i * 0.2 + s) * 2, y + i);
  g.stroke();
  for (let i = 4; i < len; i += 5) {
    g.fillStyle = hash(s + i) < 0.5 ? G.mid : G.light;
    g.beginPath();
    g.ellipse(x + Math.sin(i * 0.2 + s) * 2 + (hash(s + i * 3) - 0.5) * 6, y + i, 3.1, 2.2, hash(s + i) * 3, 0, TAU);
    g.fill();
  }
}

// A cigarette stump overgrown: moss on its shaded side, ivy climbing the left, a leafy bush at its foot.
function overgrown(g, c) {
  const [x0, yb] = [c.x - c.w / 2, GROUND];
  g.fillStyle = rgba(G.dark, 0.7);
  g.fillRect(x0, yb - 26, c.w * 0.3, 26); // moss
  for (let i = 0; i < 9; i++) ivy(g, x0 + 2 + hash(c.seed + i) * c.w * 0.6, yb - STUMP_H * (0.45 + 0.5 * hash(c.seed + 30 + i)), 18 + hash(c.seed + 50 + i) * 30, c.seed + i);
  crown(g, x0 + c.w * 0.1, yb + 4, 26 + c.w * 0.18, c.seed * 3, 1);
  crown(g, x0 + c.w * 0.82, yb + 6, 20 + c.w * 0.12, c.seed * 5 + 1, 1);
}

export function overFar(g, w) {
  for (let x = 12; x < w; x += 46 + hash(x) * 22) tree(g, x, GROUND + 2, 30 + hash(x + 1) * 20, 14 + hash(x + 2) * 8, Math.floor(x)); // the avenue
  for (const b of PLAN) {
    const spans = roofs(b);
    for (let i = 0; i < spans.length; i++) {
      const [x0, x1, y] = spans[i];
      const narrow = x1 - x0 < 24; // a shoulder of a slab: a few small crowns that stay on it
      for (let x = x0 + (narrow ? 3 : 5); x < x1 - (narrow ? 1 : 2); x += narrow ? 6 : 8 + hash(b.s * 7 + i) * 4) crown(g, x, y + 1, (narrow ? 3 : 5) + hash(b.s * 11 + x) * (narrow ? 1.5 : 4), b.s * 13 + Math.floor(x));
    }
    if (b.t > 0 && b.s % 3 === 1 && spans.length && b.k !== 'dome') ivy(g, b.x + 3, spans[0][2] + 2, 36 + (b.s % 4) * 10, b.s); // hung from a roof edge
  }
  g.fillStyle = G.mid; // the hedge on the coping
  for (let x = -10; x < w; x += 9) crown(g, x, GROUND + 4, 6 + hash(x * 3) * 3, Math.floor(x) + 400);
  for (const c of CIGS) overgrown(g, c);
}
