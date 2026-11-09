// How the Craving's hard painted parts melt into its smoke (World 17, Ash to Air; the hard parts' kit, beside craving-pkit.js): a fringe of soft
// dark clouds (craving-psmoke.js) laid round an ellipse or along a line, so a plate or a ring ends in smoke and not in a hard line, and a
// feather that erases the edge of what is painted so it fades into the smoke behind it. The clouds are smooth, not the body's bubbly
// puffs: they soften an edge without adding noise. Bake-time only.
import { hash } from '../sprites.js';
import { lin, rad, TAU } from './craving-pkit.js';
import { cloud } from './craving-psmoke.js';

// Clouds of smoke of about `size` px laid round an ellipse: n of them at its rim.
export function fringe(g, cx, cy, rx, ry, n, size, seed, from = 0) {
  for (let i = 0; i < n; i++) {
    const a = from + (i / n) * TAU + (hash(seed + i) - 0.5) * 0.5;
    const r = size * (0.34 + 0.12 * hash(seed * 3 + i));
    cloud(g, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, r, r * 0.85, seed + i);
  }
}

// Dissolve an edge: erase what is already painted across the rect [rx, ry, rw, rh] with a ramp that is nothing at (x0, y0) and
// `a` strong at (x1, y1) (and beyond), so a hard plate fades into the smoke behind it.
export function feather(g, x0, y0, x1, y1, a, rx, ry, rw, rh) {
  g.save();
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = lin(g, x0, y0, x1, y1, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${a})`]]);
  g.fillRect(rx, ry, rw, rh);
  g.restore();
}

// The same round an ellipse: nothing inside radius r0, `a` strong from r1 out (an ellipse rx : ry wide, centred on (cx, cy)).
export function featherE(g, cx, cy, rx, ry, r0, r1, a) {
  g.save();
  g.globalCompositeOperation = 'destination-out';
  g.translate(cx, cy);
  g.scale(1, ry / rx);
  g.fillStyle = rad(g, 0, 0, r0, r1, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${a})`]], 0, 0);
  g.fillRect(-rx * 2, -rx * 2, rx * 4, rx * 4);
  g.restore();
}
