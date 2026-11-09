// The Craving's smoke in streams (World 17, Ash to Air; craving-figure.js paints the horns and the arms with these): a TENDRIL is
// a chain of puffs strung along a curve, fat at one end and thin at the other, the whole chain swaying sideways in a wave that
// runs along it as the churn pose goes round (once a cycle, so frame 0 and frame N are the same picture). A dark bed of core
// puffs first, then lit billows along it, so a tendril has the same lit tops and ember bellies as the masses. Bake-time only.
//   tendril(g, path, r0, r1, seed, { pose, amp, n, wave, top })
//     path: [x0, y0, cx, cy, x1, y1] (a quadratic curve) or [x0, y0, ax, ay, bx, by, x1, y1] (a cubic: enough to curl)
//     r0 and r1: the radius of the stream at its start and its end (puffs are about 2.4 r across); n puffs (9); wave the sway as a
//     share of the radius (0.3); amp the little ellipse each puff turns on (5 px); top: nothing above this y.
import { hash } from '../sprites.js';
import { lay } from './craving-puff.js';
import { TAU } from '../../core/math.js';

const at = [0, 0, 0, 0]; // scratch: x, y and the tangent at a point of the curve

function point(p, t, out) {
  const u = 1 - t;
  if (p.length === 6) {
    out[0] = u * u * p[0] + 2 * u * t * p[2] + t * t * p[4];
    out[1] = u * u * p[1] + 2 * u * t * p[3] + t * t * p[5];
    out[2] = 2 * u * (p[2] - p[0]) + 2 * t * (p[4] - p[2]);
    out[3] = 2 * u * (p[3] - p[1]) + 2 * t * (p[5] - p[3]);
  } else {
    out[0] = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6];
    out[1] = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
    out[2] = 3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]);
    out[3] = 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]);
  }
}

export function tendril(g, p, r0, r1, seed, o = {}) {
  const { pose = 0, amp = 5, n = 9, wave = 0.3, top = -1e9 } = o;
  const ph = hash(seed * 7 + 3) * TAU;
  for (const kind of ['core', 'billow']) {
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      point(p, t, at);
      const len = Math.hypot(at[2], at[3]) || 1;
      const r = r0 + (r1 - r0) * t;
      const sway = Math.sin(TAU * pose - t * 4.4 + ph) * r * wave * Math.sin(Math.PI * (0.15 + 0.85 * t));
      const s = r * (kind === 'core' ? 2.7 : 2.2) * (0.88 + 0.24 * hash(seed + i * 3));
      lay(g, kind, at[0], at[1], s, i * 2 + (kind === 'core' ? 0 : 1), seed, pose, amp, top, -(at[3] / len) * sway, (at[2] / len) * sway, r * wave);
    }
  }
}
