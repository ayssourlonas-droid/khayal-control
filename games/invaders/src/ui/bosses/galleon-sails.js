// The Thunder Galleon's sails (World 13, Sunset Armada; see galleon.js): a topsail and a course hung from each
// side of the mainmast's two yards, patched canvas stitched in cloths with a red band along the foot, red
// and cream mends, a reef band with its points, bolt ropes round the edges, clew lines, grommets, a hole
// worn through, and on each course the ship's red thunderbolt, on each topsail a rayed sun. A sail is one
// cached sprite. Sails are opaque, so they are drawn live in the boss's own pass (galleon-furl.js),
// billowing and then reefing up to the yard, where they stay baked into the hull (reefed() draws that state).
import { path, ink, line, lin, rgba, shade } from './kit.js';
import { hash, cached } from '../sprites.js';
import { CANVAS, CREAM, RED_D, ROPE, ROPE_D, BRASS_L, rope, circle } from './galleon-kit.js';
import { TIERS, IN } from './galleon-rig.js';
import { patch, bolt, sun, cloths } from './galleon-cloth.js';

export const REEF = 0.4; // how much of its height a reefed sail keeps
const PAD = 14;

// Where sail (tier i, side s) sits: its sprite's top left and size.
function box(i, s) {
  const t = TIERS[i];
  const outer = t.foot + 6;
  return { ox: s < 0 ? -outer : IN - 6, oy: t.yard + 1, w: outer - IN + 6, h: t.h + PAD, t, s };
}

const quad = ([x0, y0], [cx, cy], [x1, y1], n = 8) => Array.from({ length: n + 1 }, (_, i) => {
  const u = i / n;
  return [(1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y1];
});

// The cloth's outline: the head along the yard, the leech bowed out, the foot roached up. Returns the
// two curved edges as points, for the ropes.
function outline(g, { t, s }) {
  const y = t.yard + 3;
  const [a, b, c, d] = [[s * IN, y], [s * (t.top - 2), y], [s * t.foot, y + t.h], [s * IN, y + t.h - 2]];
  const leech = [b, [s * (t.top + (t.foot - t.top) * 0.8 + 3), y + t.h * 0.5], c];
  const foot = [c, [s * (IN + (t.foot - IN) / 2), y + t.h - 9], d];
  g.beginPath();
  g.moveTo(...a);
  g.lineTo(...b);
  g.quadraticCurveTo(...leech[1], ...c);
  g.quadraticCurveTo(...foot[1], ...d);
  g.closePath();
  return { leech: quad(...leech), foot: quad(...foot) };
}

function paintSail(g, b, i) {
  const { t, s } = b;
  const y = t.yard + 3;
  const seed = i * 17 + (s > 0 ? 53 : 0);
  g.translate(-b.ox, -b.oy);
  const edges = outline(g, b);
  g.fillStyle = lin(g, s * IN, 0, s * t.foot, 0, [[0, shade(CANVAS, -0.4)], [0.25, shade(CANVAS, 0.04)], [0.55, shade(CANVAS, 0.16)], [0.85, CANVAS], [1, shade(CANVAS, -0.34)]]);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, 0, y, 0, y + t.h, [[0, rgba('#4a2a6a', 0.4)], [0.3, rgba('#4a2a6a', 0)], [0.7, rgba('#ff9a50', 0)], [1, rgba('#ff8a40', 0.3)]]);
  g.fillRect(-260, y, 520, t.h);
  cloths(g, t, s, y);
  for (let k = 0; k < 9; k++) { // mends, most of them red
    const u = 0.1 + hash(seed + k * 3) * 0.78;
    const v = 0.2 + hash(seed + k * 5) * 0.6;
    patch(g, s * (IN + (t.top + (t.foot - t.top) * v - IN) * u), y + t.h * v, 12 + hash(seed + k) * 15, 9 + hash(seed + k * 2) * 9, (hash(seed + k * 7) - 0.5) * 0.18, k % 4);
  }
  if (t.bolt) bolt(g, s * 126, y + t.h * 0.5, 1.2);
  else sun(g, s * 96, y + t.h * 0.5, 8);
  const band = [...edges.foot, ...edges.foot.toReversed().map(([x, yy]) => [x, yy - 7])]; // the red band along the foot
  path(g, band);
  g.fillStyle = rgba(RED_D, 0.92);
  g.fill();
  g.setLineDash([2.4, 2]);
  path(g, edges.foot.map(([x, yy]) => [x, yy - 3.5]), true);
  line(g, rgba(CREAM, 0.7), 0.8);
  g.setLineDash([]);
  g.fillStyle = rgba('#7a4a20', 0.32); // the reef band, its stitching and the points hanging from it
  g.fillRect(-260, y, 520, 7);
  g.setLineDash([2.4, 2]);
  path(g, [[-260, y + 6], [260, y + 6]], true);
  line(g, rgba('#fff0c0', 0.6), 0.8);
  g.setLineDash([]);
  g.fillStyle = lin(g, s * 40, 0, s * 130, 0, [[0, rgba('#ffffff', 0)], [0.5, rgba('#ffffff', 0.16)], [1, rgba('#ffffff', 0)]]);
  g.fillRect(-260, y, 520, t.h);
  g.restore();
  g.save(); // a hole worn through the cloth
  g.globalCompositeOperation = 'destination-out';
  g.beginPath();
  g.ellipse(s * (t.top - 40), y + t.h * 0.6, 3.6, 5, 0.4, 0, 6.3);
  g.fill();
  g.restore();
  outline(g, b);
  line(g, '#0a0c16', 2.6);
  for (const pts of [edges.leech, edges.foot]) rope(g, pts, 1.7);
  for (const [x, yy] of [[s * IN, y + 1], [s * (t.top - 2), y + 1], [s * t.foot, y + t.h], [s * IN, y + t.h - 2]]) {
    circle(g, x, yy, 2.4);
    ink(g, BRASS_L, 1.1);
  }
  rope(g, [[s * t.foot, y + t.h], [s * (t.top - 22), y + 2]], 1.2, 3); // the clew line
  for (let x = IN + 8; x < t.top - 6; x += 12) { // reef points
    path(g, [[s * x, y + 7], [s * x + 0.6, y + 13]], true);
    line(g, ROPE_D, 1.6);
    line(g, ROPE, 0.9);
  }
}

// The four sails by number n: tier n >> 1, side -1 for an even n (the left) and 1 for an odd one.
export const BOXES = TIERS.flatMap((t, i) => [-1, 1].map((side) => box(i, side)));

const sails = [];
export const sailSprite = (n) => (sails[n] ??= cached('galSail' + n, BOXES[n].w, BOXES[n].h, (g) => paintSail(g, BOXES[n], n >> 1)));

// The folds of a reefed sail: wrinkles across it and lashings round it, drawn at the reefed size.
const folded = [];
export const folds = (n) => (folded[n] ??= cached('galFold' + n, BOXES[n].w, Math.ceil(BOXES[n].h * REEF), (g, w, h) => {
  for (let k = 0; k < 4; k++) {
    g.beginPath();
    g.moveTo(0, 4 + k * 4.4);
    for (let x = 0; x <= w; x += 10) g.lineTo(x, 4 + k * 4.4 + Math.sin(x * 0.17 + k * 1.7) * 1.6);
    line(g, rgba('#3a1c0c', 0.34), 1.3);
    g.translate(0, 1.2);
    line(g, rgba('#fff0c8', 0.22), 0.8);
    g.translate(0, -1.2);
  }
  for (let x = 24 + hash(n + 5) * 8; x < w - 6; x += 26) {
    g.beginPath();
    g.roundRect(x - 2, 0, 4, h - 2, 1.4);
    ink(g, ROPE, 0.9);
    path(g, [[x - 2, 3], [x + 2, 7], [x - 2, 11], [x + 2, 15]], true);
    line(g, ROPE_D, 0.8);
  }
}));

// The reefed state, drawn into the hull: each sail squashed up under its yard, its folds over it.
export function reefed(b) {
  BOXES.forEach(({ ox, oy, w, h }, n) => {
    b.drawImage(sailSprite(n), ox, oy, w, h * REEF);
    b.drawImage(folds(n), ox, oy, w, h * REEF);
  });
}

export function warmSails() {
  BOXES.forEach((_, n) => {
    sailSprite(n);
    folds(n);
  });
}
