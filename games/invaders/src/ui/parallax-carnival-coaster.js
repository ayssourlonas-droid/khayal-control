// The roller coaster on Ember Carnival's far shore: a lift hill, a drop, a camel hump, a corkscrewing loop and
// a last hill, on a trestle of cross-braced posts, its track outlined in light (a bulb every few px, the
// loop in magenta neon, halos chasing along it). One sign carries the track's path so a little train can run
// round it (flourish-11.js); a tall drop tower stands to the left of it with a ladder of bulbs up each leg.
// See parallax-shapes.js for the painter contract.
import { rgba } from './sprites.js';
import { TAU } from '../core/math.js';
import { GOLD, BULB, MAGENTA, CYAN, NIGHT, spline, trace, bulb } from './parallax-carnival-kit.js';

const [LX, LY, LR] = [1720, 176, 78]; // the loop's centre and radius, layer px
const STEP = 8; // samples between two of the hills' control points
const UP = [[1110, 268], [1190, 250], [1250, 150], [1292, 84], [1318, 68], [1346, 88], [1392, 192], [1436, 252], [1480, 262], [1522, 204], [1556, 142], [1590, 172], [1624, 238], [1656, 258]];
const DOWN = [[1792, 256], [1840, 250], [1892, 196], [1940, 158], [1990, 196], [2032, 252], [2070, 266]];

// The whole circuit as a dense path: the first hills, the loop (a circle that drifts sideways as it turns, so
// the entry and the exit pass each other), the last hills.
export const circuit = () => {
  const loop = Array.from({ length: 29 }, (_, i) => {
    const a = (i / 28) * TAU;
    return [LX + Math.sin(a) * LR + (a / TAU - 0.5) * 60, LY + LR * Math.cos(a)];
  });
  return [...spline(UP, STEP), ...loop, ...spline(DOWN, STEP)];
};

// Posts every 30 px under the track with cross bracing between neighbours, down into the hill.
function trestle(g, path) {
  const posts = [];
  for (const [x, y] of path) if (x > 1100 && (!posts.length || x - posts.at(-1)[0] >= 30) && !(x > LX - LR + 5 && x < LX + LR + 5 && y < 250)) posts.push([x, y]);
  g.strokeStyle = NIGHT;
  g.lineWidth = 2.6;
  g.beginPath();
  for (const [x, y] of posts) {
    g.moveTo(x, y + 3);
    g.lineTo(x, 296);
  }
  g.stroke();
  g.lineWidth = 1.2;
  g.beginPath();
  posts.forEach(([x, y], i) => {
    const q = posts[i + 1];
    if (!q) return;
    const [lo, hi] = [Math.min(y, q[1]), 292];
    g.moveTo(x, hi);
    g.lineTo(q[0], Math.min(hi, Math.max(lo + 14, hi - 52)));
    g.moveTo(q[0], hi);
    g.lineTo(x, Math.min(hi, Math.max(lo + 14, hi - 52)));
  });
  g.stroke();
}

export function coaster(g, out, rng, L) {
  const path = circuit();
  trestle(g, path);
  g.save();
  g.lineCap = 'round';
  g.lineJoin = 'round';
  trace(g, path);
  g.strokeStyle = L.color;
  g.lineWidth = 6;
  g.stroke();
  trace(g, path.map(([x, y]) => [x, y - 3]));
  g.strokeStyle = rgba(L.track, 0.9);
  g.lineWidth = 1.5;
  g.stroke();
  trace(g, path.slice((UP.length - 1) * STEP + 1, (UP.length - 1) * STEP + 30)); // the loop, as neon
  g.strokeStyle = rgba(MAGENTA, 0.8);
  g.lineWidth = 2;
  g.stroke();
  g.restore();
  g.fillStyle = rgba(BULB, 0.95);
  g.beginPath();
  for (let i = 0; i < path.length; i += 2) {
    g.moveTo(path[i][0] + 1.4, path[i][1] - 4);
    g.arc(path[i][0], path[i][1] - 4, 1.4, 0, TAU);
  }
  g.fill();
  for (let i = 3; i < path.length; i += 13) out.lights.push({ x: path[i][0], y: path[i][1] - 4, r: 17, color: i % 2 ? GOLD : BULB, mode: 'blink', ph: (i / path.length) * 4 % 1, a: 0.8 });
  g.fillStyle = L.color; // the station at the start of the track: a shed with a lit doorway and a pennant
  g.fillRect(1060, 252, 62, 44);
  g.beginPath();
  g.moveTo(1054, 252);
  g.lineTo(1091, 232);
  g.lineTo(1128, 252);
  g.fill();
  for (const x of [1072, 1096]) bulb(g, out, x, 270, 3.2, GOLD, 'pulse', rng());
  out.signs.push({ coaster: true, pts: path, len: path.reduce((s, p, i) => s + (i ? Math.hypot(p[0] - path[i - 1][0], p[1] - path[i - 1][1]) : 0), 0) });
}

// The drop tower at layer x: a lattice mast with a lit gondola ring part-way up and a beacon on top.
export function dropTower(g, out, rng, L, x) {
  g.fillStyle = L.color;
  g.fillRect(x - 3, 40, 6, 260);
  g.fillRect(x - 12, 40, 3, 260);
  g.fillRect(x + 9, 40, 3, 260);
  g.strokeStyle = L.color;
  g.lineWidth = 1.2;
  g.beginPath();
  for (let y = 60; y < 290; y += 22) {
    g.moveTo(x - 12, y);
    g.lineTo(x + 12, y + 22);
    g.moveTo(x + 12, y);
    g.lineTo(x - 12, y + 22);
  }
  g.stroke();
  g.fillRect(x - 26, 112, 52, 9); // the ring the seats hang from
  g.fillRect(x - 14, 36, 28, 6);
  g.beginPath();
  g.moveTo(x - 10, 36);
  g.lineTo(x, 12);
  g.lineTo(x + 10, 36);
  g.fill();
  for (let i = 0; i < 10; i++) for (const s of [-12, 12]) bulb(g, out, x + s, 56 + i * 22, 1.8, i % 2 ? MAGENTA : CYAN, i % 4 === 0 ? 'blink' : null, (1 - i / 10) % 1, 0.6);
  for (const s of [-24, -8, 8, 24]) bulb(g, out, x + s, 128, 2.6, GOLD, null);
  out.lights.push({ x, y: 18, r: 54, color: MAGENTA, mode: 'pulse', ph: 0.2, a: 0.9 });
}
