// The giant whale's skeleton lying across the slope (far layer of Lantern Deep, see parallax-deep.js): the
// animal lay down on its belly and the sea has had it since. The long spine runs up from the tail on the sea
// floor over the ribcage, a hall of nine tall ribs curving down into the sediment, and down again along the
// neck to the skull, which lies open-jawed at the right with its teeth, its blowhole and a socket where an eye
// was: three small lights burn there, teal and violet (a sign marks the socket for the live art). Bone is L.bone
// with a pale edge along the top, crusted with coral, barnacled, weed trailing from the jaw.
import { rgba } from './sprites.js';
import { TAU } from '../core/math.js';
import { TEAL, VIOLET, PALE, CORAL, GREEN, ABYSS, lamp, tint, crust, weed, barnacles } from './parallax-deep-kit.js';
import { spline } from './parallax-carnival-kit.js';

// Bones are polygons, filled twice: once pale and 1.6 px higher, then in the bone colour, which leaves a pale edge on top.
function boneFill(g, L, polys) {
  for (const [dy, c] of [[-1.6, rgba(PALE, 0.5)], [0, L.bone]]) {
    g.fillStyle = c;
    g.beginPath();
    for (const pts of polys) {
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + dy) : g.moveTo(x, y + dy)));
      g.closePath();
    }
    g.fill();
  }
}

// A tapering strip along a path: w0 wide at the start, w1 at the end.
function strip(pts, w0, w1) {
  const [l, r] = [[], []];
  pts.forEach(([x, y], i) => {
    const [a, b] = [pts[Math.max(0, i - 1)], pts[Math.min(pts.length - 1, i + 1)]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const [nx, ny] = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
    const hw = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
    l.push([x + nx * hw, y + ny * hw]);
    r.push([x - nx * hw, y - ny * hw]);
  });
  return [...l, ...r.toReversed()];
}

const ellipse = (x, y, rx, ry, rot) => Array.from({ length: 10 }, (_, k) => [x + Math.cos((k * TAU) / 10) * rx * Math.cos(rot) - Math.sin((k * TAU) / 10) * ry * Math.sin(rot), y + Math.cos((k * TAU) / 10) * rx * Math.sin(rot) + Math.sin((k * TAU) / 10) * ry * Math.cos(rot)]);

// The skull, facing right, resting on the floor with its lower jaw open. (x, y) is its back at floor level, s its scale.
function skull(g, out, rng, L, x, y, s) {
  const P = (list) => list.map(([a, b]) => [x + a * s, y + b * s]);
  const upper = P([[0, -10], [-10, -52], [18, -96], [90, -102], [150, -84], [232, -54], [318, -34], [316, -24], [236, -36], [150, -44], [100, -28], [40, -14]]);
  const jaw = P([[30, -12], [62, 6], [186, 34], [284, 32], [288, 25], [196, 23], [86, -8]]);
  const teeth = [];
  for (let k = 0; k < 11; k++) { // teeth up the lower jaw
    const t = 118 + k * 14;
    const [ux, uy] = [t, 17 + ((t - 118) / 170) * 8];
    teeth.push(P([[ux, uy], [ux + 3.2, uy - 9], [ux + 6.4, uy - 0.5]]));
    if (k > 3) teeth.push(P([[ux + 20, -39 + k * 0.4], [ux + 22.6, -29], [ux + 25.2, -39 + k * 0.4]]));
  }
  boneFill(g, L, [upper, jaw, ...teeth]);
  g.fillStyle = rgba(ABYSS, 0.9); // the socket, the blowhole and the cracks
  g.beginPath();
  g.arc(x + 82 * s, y - 62 * s, 13 * s, 0, TAU);
  g.moveTo(x + 150 * s, y - 84 * s);
  g.ellipse(x + 142 * s, y - 84 * s, 8 * s, 2.6 * s, -0.2, 0, TAU);
  g.fill();
  g.save();
  g.strokeStyle = rgba(ABYSS, 0.5);
  g.lineWidth = 1.1;
  g.beginPath();
  g.moveTo(x + 40 * s, y - 92 * s);
  g.lineTo(x + 56 * s, y - 70 * s);
  g.lineTo(x + 50 * s, y - 52 * s);
  g.moveTo(x + 200 * s, y - 52 * s);
  g.lineTo(x + 214 * s, y - 42 * s);
  g.stroke();
  g.restore();
  const [ex, ey] = [x + 82 * s, y - 62 * s]; // the lights in the socket
  lamp(out, ex - 3, ey + 2, 9, TEAL, 'pulse', 0.1, 0.55);
  lamp(out, ex + 4, ey - 3, 7, VIOLET, 'flicker', 0.5, 0.5);
  lamp(out, ex, ey, 20, TEAL, 'steady', 0, 0.16);
  out.signs.push({ skull: true, x: ex, y: ey, r: 13 * s });
  crust(g, rng, x + 20 * s, x + 130 * s, y - 100 * s, tint(L, CORAL, 0.34));
  barnacles(g, rng, x + 40 * s, y - 74 * s, x + 160 * s, y - 50 * s, 18);
  weed(g, rng, x + 190 * s, y + 20 * s, 34, 12, tint(L, GREEN, 0.3), 6);
}

// How high the spine stands above the floor, at 0 (the tail tip) to 1 (the skull): [u, px].
const SPINE = [[0, 8], [0.2, 30], [0.4, 100], [0.55, 172], [0.7, 192], [0.82, 168], [0.93, 104], [1, 60]];

// The skeleton from the tail tip at x0 to the skull's back at x1, lying on ground(x).
export function whale(g, out, rng, L, x0, x1, ground) {
  const at = (u) => x0 + u * (x1 - x0);
  const spine = spline(SPINE.map(([u, hgt]) => [at(u), ground(at(u)) - hgt]), 14);
  const polys = [strip(spine, 7, 14)];
  const growth = []; // where coral and barnacles settle: on the vertebrae
  let acc = 0; // vertebrae along the spine, bigger and closer toward the ribs
  spine.forEach(([x, y], i) => {
    if (!i) return;
    const [px, py] = spine[i - 1];
    acc += Math.hypot(x - px, y - py);
    const size = 3.5 + 9 * Math.sin(Math.min(1, ((x - x0) / (x1 - x0)) * 1.15) * Math.PI * 0.9) ** 0.8;
    if (acc < size * 1.5) return;
    acc = 0;
    polys.push(ellipse(x, y, size * 0.8, size, Math.atan2(y - py, x - px)));
    polys.push([[x - 1.3, y - size * 0.8], [x, y - size * 1.7], [x + 1.3, y - size * 0.8]]); // the neural spine
    growth.push([x, y, size]);
  });
  for (let k = 0; k < 9; k++) { // nine ribs, from the spine down into the floor, bowed forward
    const [sx, sy] = spine[Math.round((0.4 + (0.38 * k) / 8) * (spine.length - 1))];
    const gx = sx - 6 + (k % 3) * 3;
    const fall = ground(gx) + 10 - sy;
    const pts = Array.from({ length: 13 }, (_, j) => {
      const t = j / 12;
      return [sx + (gx - sx) * t + Math.sin(t * Math.PI) * (26 + fall * 0.12), sy + fall * t ** 0.92];
    });
    polys.push(strip(k === 5 ? pts.slice(0, 8) : pts, 8 - (k % 2), 2.4)); // one rib is snapped
  }
  boneFill(g, L, polys);
  const coral = tint(L, CORAL, 0.34);
  growth.forEach(([x, y, size], i) => {
    if (i % 3 === 0) crust(g, rng, x - 5, x + 5, y - size * 1.1, coral);
    if (i % 2 === 0) barnacles(g, rng, x - size * 0.6, y - size * 0.5, x + size * 0.6, y + size * 0.5, 2);
  });
  skull(g, out, rng, L, x1, ground(x1 + 130) - 30, 1.15);
}
