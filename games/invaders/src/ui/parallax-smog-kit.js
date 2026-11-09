// Small helpers shared by World 17's mid and near layers (parallax-smog-mid*.js, parallax-smog-near*.js): a seeded rng per
// element (so a thing's looks never depend on what was drawn before it, and the smog, clean and 'over' passes agree on
// it), gradient strips, speckle grain, brick and paving tiles painted once per colour, a lit edge, soot streaks, a sagging
// wire. Every painter takes a palette P (parallax-smog-pal.js) and only COLOURS differ between the modes: no rng call
// ever sits behind a mode test, so the three passes draw one silhouette. Plain fills and strokes; each helper puts back
// what it changed.
import { rgba, mix, lin, cached, hash } from './sprites.js';
import { makeRng } from '../core/rng.js';

export { hash };
export const seeded = (seed) => makeRng((seed * 2654435761) >>> 0);
export const FLOOR = 336; // the mid layer's street level (layer px): the blocks stand on it, the near layer hides what is below

export const lamp = (out, x, y, r, color, mode, ph, a) => out.lights.push({ x, y, r, color, mode, ph, a });

// A closed polygon path from [[x, y], ...].
export function poly(g, pts) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
}

// A vertical (or, with `side`, horizontal) colour fade laid over a box: stops are [at, colour].
export function fade(g, x, y, w, h, stops, side = false) {
  g.fillStyle = side ? lin(g, x, 0, x + w, 0, stops) : lin(g, 0, y, 0, y + h, stops);
  g.fillRect(x, y, w, h);
}

export function box(g, c, x, y, w, h, a = 1) {
  g.fillStyle = a < 1 ? rgba(c, a) : c;
  g.fillRect(x, y, w, h);
}

// n specks of grain in a box, 1-2 px, colours from the list at alpha a: the texture of plaster, soot and weathering.
export function speckle(g, r, x, y, w, h, n, colors, a, size = 1.6) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = rgba(colors[Math.floor(r() * colors.length)], a * (0.4 + r() * 0.6));
    const s = size * (0.5 + r());
    g.fillRect(x + r() * w, y + r() * h, s, s * (0.6 + r() * 0.8));
  }
}

// Brick laid in running bond, 12 x 5 px a brick, one 48 x 20 tile per wall colour, every brick a touch lighter or darker and
// a mortar joint dimmed from the wall's colour. Returns the tile canvas (a fill pattern: g.createPattern(tile, 'repeat')).
export const brickTile = (wall) => cached('smogmidBrick' + wall, 48, 20, (g) => {
  g.fillStyle = mix(wall, '#000000', 0.34);
  g.fillRect(0, 0, 48, 20);
  const r = seeded(wall.charCodeAt(1) * 31 + wall.charCodeAt(4));
  for (let row = 0; row < 4; row++) {
    for (let k = 0; k < 5; k++) {
      const x = k * 12 - (row % 2 ? 6 : 0);
      g.fillStyle = mix(wall, r() < 0.5 ? '#000000' : '#ffffff', 0.04 + r() * 0.13);
      g.fillRect(x + 0.5, row * 5 + 0.5, 11, 4);
      g.fillStyle = rgba('#ffffff', 0.07); // the lit top of each brick
      g.fillRect(x + 0.5, row * 5 + 0.5, 11, 1);
    }
  }
});

// Fill a box with brick of this wall colour.
export function bricks(g, wall, x, y, w, h) {
  g.save();
  g.translate(x, y);
  g.fillStyle = g.createPattern(brickTile(wall), 'repeat');
  g.fillRect(0, 0, w, h);
  g.restore();
}

// The wall's light: darker toward the left (a neighbour's shadow), a lit edge down the right side and along the top, both in the
// palette's edge colour. The box is the wall.
export function wallLight(g, P, x, y, w, h) {
  fade(g, x, y, w, h, [[0, rgba(P.shade, 0.3)], [0.22, rgba(P.shade, 0)], [0.8, rgba(P.edge, 0)], [1, rgba(P.edge, P.edgeA * 0.5)]], true);
  box(g, P.edge, x + w - 1.6, y, 1.6, h, P.edgeA * 0.8);
  box(g, P.edge, x, y, w, 1.4, P.edgeA * 0.6);
}

// Streaks of soot (or, once the rain has washed it, nothing much) running down a wall from y0: n thin dark runs.
export function streaks(g, r, x, y0, w, len, n, color, a) {
  for (let i = 0; i < n; i++) {
    const [sx, l, sw] = [x + r() * w, len * (0.3 + r() * 0.7), 1 + r() * 3];
    fade(g, sx, y0, sw, l, [[0, rgba(color, a)], [0.7, rgba(color, a * 0.5)], [1, rgba(color, 0)]]);
  }
}

// A wire sagging between (x0, y0) and (x1, y1): a quadratic curve dipping `sag` px below the chord, w px thick.
export function wire(g, c, x0, y0, x1, y1, sag, w = 1.2) {
  g.save();
  g.strokeStyle = c;
  g.lineWidth = w;
  g.beginPath();
  g.moveTo(x0, y0);
  g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag * 2, x1, y1);
  g.stroke();
  g.restore();
}

// A stroked line list: pairs [x0, y0, x1, y1] in one path, w px thick in colour c.
export function strokes(g, c, w, segs) {
  g.save();
  g.strokeStyle = c;
  g.lineWidth = w;
  g.beginPath();
  for (const [x0, y0, x1, y1] of segs) {
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
  }
  g.stroke();
  g.restore();
}
