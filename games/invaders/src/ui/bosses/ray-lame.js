// The lames of The Squall Ray's wing armour (World 18, Anvil Sky; ray-wing.js paints them): small overlapping curved plates of iron, laid the way lamellar armour
// is, in rows that follow the wing from the shoulder to the tip and curve with it (each row a copy of the wing's trailing edge, a little further down, so that
// the rows sag with it), the plates big at the shoulder and smaller and smaller toward the tip, each lying over the next one outward so that what shows of one
// is its free end, the one that points at the tip. Four rows lie under the trailing edge; a plate that would reach past the wing's belly is left out, so that
// the rows shorten where the wing narrows. plates() gives them outermost first, the lowest row first (so that what is painted later lies over what is painted
// before it) as { pts, free, mid }: the polygon, the polyline of its free end, and its centre; SHOULDER is the pauldron that holds the rows down at the root.
// All in boss coordinates of the right wing; to() turns such a point into the armour part's own coordinates (the part is painted as the left wing: its centre is
// the origin, x +135 the shoulder and -135 the tip, boss coordinates of the right wing being (255 - x, y - 7)).
import { PART } from './ray-kit.js';
import { WING, TRAIL, LEAD, edgeY, polyDepth } from './ray-shape.js';
import { clamp } from '../../core/math.js';

export const ROWS = 4;
export const to = ([x, y]) => [PART.wingR.x - x, y - PART.wingL.y];
export const SHOULDER = [[120, -102], [138, -104], [152, -78], [158, -44], [156, -8], [146, 18], [130, 22], [120, -6], [116, -44], [116, -80]];

const U = (x) => clamp((x - 124) / 290, 0, 1);
const pitch = (x) => (0.64 * (edgeY(LEAD, x) - edgeY(TRAIL, x) - 12)) / ROWS; // the rows fill the same share of the wing's width all the way out: they narrow with it
const len = (x) => 66 - 34 * U(x);
const yc = (r, x) => edgeY(TRAIL, x) + 12 + pitch(x) * (r + 0.5);

function plate(r, x) {
  const [a, b] = [len(x) / 2, (pitch(x) + 5) / 2];
  const y = yc(r, x);
  const th = Math.atan2(yc(r, x + 3) - yc(r, x - 3), 6);
  const [c, s] = [Math.cos(th), Math.sin(th)];
  const at = ([px, py]) => [x + px * c - py * s, y + px * s + py * c];
  const pts = [[-a, -b], [a - b, -b], [a - 0.55 * b, -0.86 * b], [a - 0.12 * b, -0.5 * b], [a, 0], [a - 0.12 * b, 0.5 * b], [a - 0.55 * b, 0.86 * b], [a - b, b], [-a, b]].map(at);
  return { pts, free: pts.slice(1, 8), mid: [x, y], b };
}

export function plates() {
  const out = [];
  for (let r = ROWS - 1; r >= 0; r--) {
    for (let x = 448 - 14 * r; x > 150; x -= 0.7 * len(x)) {
      const p = plate(r, x);
      if (polyDepth(WING, p.mid[0], p.mid[1] + p.b) > 4) out.push(p);
    }
  }
  return out;
}
