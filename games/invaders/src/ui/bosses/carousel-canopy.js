// The Grand Carousel's canopy (World 14, Ember Carnival; see carousel.js): a shallow dome of twenty-four gores
// in magenta and cream, seen from a little above, so its eave (the lower rim) is an arc that dips at the
// front. It turns: the gores are painted in FRAMES positions across one pair of stripes, baked once, and the
// live pass shows the one the clock asks for (carousel-fx.js); the hull has frame 0 baked into it. The
// moulding, valance and bulbs that hang from the eave are carousel-valance.js. In boss coordinates.
import { cached } from '../sprites.js';
import { lin, rgba, shade } from './kit.js';
import { TAU } from '../../core/math.js';
import { STRIPE, STRIPE_D, CREAM, CREAM_D, GILT, GILT_L, INK } from './carousel-kit.js';

export const R = 340; // the eave's radius
export const APEX = -128; // y of the dome's top, under the crown
export const FRAMES = 24; // positions across one pair of gores
const GORES = 24;
const STEP = TAU / GORES;
export const PX = 352; // where the boss's origin sits in a frame (x), and in y
export const PY = 134;
export const SIZE = [PX * 2, 78];

// The eave at x: -80 at the ends, dipping 14 px at the front centre (the near side of the rim is lower).
export const eaveY = (x) => -80 + 14 * Math.sqrt(Math.max(0, 1 - (x / R) ** 2));
// The dome's outline at x.
export const topY = (x) => APEX + 48 * (Math.abs(x) / R) ** 1.25;

// A gore's edge at angle a (0 faces us): points from the apex out to the eave, drawn as a dome.
function edge(a, n = 7) {
  const x = R * Math.sin(a);
  const ey = eaveY(x);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    pts.push([PX + x * s, PY + APEX + (ey - APEX) * s ** 1.25]);
  }
  return pts;
}

function gore(g, a0, a1, c, k) {
  const e0 = edge(a0);
  const e1 = edge(a1);
  g.beginPath();
  e0.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y));
  for (let i = 1; i < 5; i++) {
    const a = a0 + ((a1 - a0) * i) / 5;
    g.lineTo(PX + R * Math.sin(a), PY + eaveY(R * Math.sin(a)));
  }
  e1.toReversed().forEach(([x, y]) => g.lineTo(x, y));
  g.closePath();
  g.fillStyle = lin(g, 0, PY + APEX, 0, PY - 60, [[0, shade(c, -0.45)], [0.35, shade(c, -0.1)], [0.8, c], [1, shade(c, 0.22)]]);
  g.fill();
  g.beginPath(); // the seam: a dark groove and a gilt cord beside it
  e1.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y));
  g.lineWidth = 2.4;
  g.strokeStyle = rgba(k ? STRIPE_D : CREAM_D, 0.9);
  g.stroke();
  g.lineWidth = 1;
  g.strokeStyle = rgba(GILT, 0.85);
  g.stroke();
}

// A painter for frame i of the canopy: the gores turned i / FRAMES of a pair, shaded across so the ends of the
// dome fall away into shadow and a band of light lies left of its middle, outlined in ink.
export const paintFrame = (i) => (g, w, h) => {
  const turn = ((i % FRAMES) / FRAMES) * 2 * STEP;
  for (let k = 0; k < GORES; k++) {
    let a0 = turn + k * STEP;
    a0 = ((((a0 + Math.PI) % TAU) + TAU) % TAU) - Math.PI; // -pi..pi
    const a1 = a0 + STEP;
    const [lo, hi] = [Math.max(a0, -Math.PI / 2), Math.min(a1, Math.PI / 2)];
    if (hi <= lo) continue;
    gore(g, lo, hi, k % 2 ? CREAM : STRIPE, k % 2);
  }
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = lin(g, PX - R, 0, PX + R, 0, [[0, rgba('#10002a', 0.62)], [0.2, rgba('#10002a', 0.18)], [0.34, rgba('#ffffff', 0.16)], [0.5, rgba('#10002a', 0)], [0.8, rgba('#10002a', 0.2)], [1, rgba('#10002a', 0.66)]]);
  g.fillRect(0, 0, w, h);
  g.fillStyle = lin(g, 0, PY + APEX, 0, PY - 50, [[0, rgba('#10002a', 0.4)], [1, rgba('#10002a', 0)]]);
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  const [left, right] = [edge(-Math.PI / 2), edge(Math.PI / 2)];
  g.beginPath();
  left.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y));
  for (let i = 1; i < 12; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 12;
    g.lineTo(PX + R * Math.sin(a), PY + eaveY(R * Math.sin(a)));
  }
  right.toReversed().forEach(([x, y]) => g.lineTo(x, y));
  g.lineJoin = 'round';
  g.lineWidth = 2.8;
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath(); // moonlight along the upper left of the dome
  left.slice(2).forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x + 1.4, y + 1.6));
  g.lineWidth = 1.2;
  g.strokeStyle = rgba(GILT_L, 0.7);
  g.stroke();
};

// Frame 0, whole, for the hull to carry (the live frames are cut round the parts that stand over them:
// carousel-sprites.js).
export const putCanopy = (ctx) => ctx.drawImage(cached('carCanopy0', SIZE[0], SIZE[1], paintFrame(0)), -PX, -PY);
