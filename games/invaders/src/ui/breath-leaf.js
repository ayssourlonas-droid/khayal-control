// The leaves of the breath (world 17, Ash to Air): the fresh green that rides in the front of air and rises from the foot of
// the field when it starts, also the wings and emblem of the little craft (breath-craft.js). A leaf is one of four shapes
// (an ovate pointed one, a slender willow, a broad round one and a bent, curling one) in one of three greens (lime, fresh
// and deep), painted once as a 40 px sprite: a gradient across the blade from a light side to a shaded one, a soft sheen,
// a midrib with five pairs of pale side veins, a short stem and a thin dark-green rim so it reads on the bright sky as well
// as in the smog. `leafPath` is the outline helper both files use. Nothing here runs per frame; the sprites are cached
// under the key prefix `breathLeaf`, and the leaf's middle is at 20, 20 of its canvas.
import { cached, lin, rad, rgba, shade } from './sprites.js';

export const LEAF_SHAPES = 4;
export const LEAF_TONES = ['#b7ea4e', '#4fcd68', '#259d58']; // lime, fresh, deep
export const LEAF_PX = 40;
export const RIM = '#1c5c38';

// [length, half-width, where the belly is (0..1 of the way), how far the tip bends sideways]
const SHAPES = [[27, 10, 0.42, 0], [31, 5.6, 0.5, 0], [23, 11.5, 0.5, 0], [27, 9, 0.4, 7]];

// A leaf's closed outline as the current path, from its stem (ax, ay) to its tip (tx, ty): half a blade `wid` px wide on each
// side of the axis, widest `belly` of the way along, pointed at the tip.
export function leafPath(g, ax, ay, tx, ty, wid, belly = 0.42) {
  const [dx, dy] = [tx - ax, ty - ay];
  const len = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / len, dy / len];
  const [nx, ny] = [-uy, ux];
  const at = (s, w) => [ax + ux * len * s + nx * wid * w, ay + uy * len * s + ny * wid * w];
  g.beginPath();
  g.moveTo(ax, ay);
  let [c1, c2] = [at(belly * 0.45, 1.3), at(belly + 0.32, 0.95)];
  g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], tx, ty);
  [c1, c2] = [at(belly + 0.32, -0.95), at(belly * 0.45, -1.3)];
  g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], ax, ay);
  g.closePath();
}

// The side veins of a blade: five pairs running from the midrib toward the margin, pale.
export function veins(g, ax, ay, tx, ty, wid, color = rgba('#ffffff', 0.42)) {
  const [dx, dy] = [tx - ax, ty - ay];
  const len = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / len, dy / len];
  g.lineWidth = 0.8;
  g.strokeStyle = color;
  g.beginPath();
  for (let k = 1; k <= 5; k++) {
    const s = 0.14 + k * 0.14;
    const w = wid * 0.82 * Math.sin(Math.PI * Math.min(1, s * 1.05)) ** 0.8;
    for (const side of [-1, 1]) {
      g.moveTo(ax + ux * len * s, ay + uy * len * s);
      g.lineTo(ax + ux * len * (s + 0.12) - uy * w * side, ay + uy * len * (s + 0.12) + ux * w * side);
    }
  }
  g.stroke();
}

function paint(g, shape, tone) {
  const [len, wid, belly, bend] = SHAPES[shape];
  const c = LEAF_TONES[tone];
  const [ax, ay, tx, ty] = [20, 20 + len / 2 - 2, 20 + bend, 20 - len / 2];
  const [bx, by, bw, bh] = [Math.min(ax, tx) - wid - 2, ty - 2, Math.abs(tx - ax) + wid * 2 + 4, ay - ty + 4]; // the blade's box
  g.save();
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.strokeStyle = RIM;
  g.lineWidth = 1.6;
  g.beginPath(); // the stem
  g.moveTo(ax, ay + 3);
  g.lineTo(ax, ay);
  g.stroke();
  leafPath(g, ax, ay, tx, ty, wid, belly);
  g.fillStyle = lin(g, ax - wid, 0, ax + wid, 0, [[0, shade(c, 0.5)], [0.45, c], [1, shade(c, -0.32)]]);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = rad(g, ax - wid * 0.4, ay - len * 0.62, 0, len * 0.6, [[0, rgba('#ffffff', 0.55)], [1, rgba('#ffffff', 0)]]);
  g.fillRect(bx, by, bw, bh);
  g.fillStyle = lin(g, 0, ay, 0, ty, [[0, rgba('#0b3a1c', 0.3)], [0.5, rgba('#0b3a1c', 0)]]); // the base is a little deeper
  g.fillRect(bx, by, bw, bh);
  veins(g, ax, ay, tx, ty, wid);
  g.strokeStyle = rgba(shade(c, 0.7), 0.9); // the midrib
  g.lineWidth = 1.1;
  g.beginPath();
  g.moveTo(ax, ay);
  g.quadraticCurveTo(ax + bend * 0.15, (ay + ty) / 2, tx - bend * 0.12, ty + 2);
  g.stroke();
  g.restore();
  leafPath(g, ax, ay, tx, ty, wid, belly);
  g.strokeStyle = rgba(RIM, 0.9);
  g.lineWidth = 1.3;
  g.stroke();
  g.restore();
}

export const leafSprite = (shape, tone) => cached(`breathLeaf${shape}-${tone}`, LEAF_PX, LEAF_PX, (g) => paint(g, shape, tone));

// Every leaf, shape-major: index = shape * 3 + tone.
export const bakeLeaves = () => Array.from({ length: LEAF_SHAPES * LEAF_TONES.length }, (_, i) => leafSprite(Math.floor(i / LEAF_TONES.length), i % LEAF_TONES.length));
