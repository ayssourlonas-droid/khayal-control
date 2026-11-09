// Shapes and colours shared by the painters of Sunset Armada's layers (parallax-armada.js, -isle.js,
// -ships.js, -mid.js, -clouds.js). A silhouette is filled in the layer colour and then dressed in light: the
// sun is low and far, so every shape is backlit, dark with a rim of gold on the side facing it. See
// parallax-shapes.js for the painter contract.
import { rgba } from './sprites.js';
import { SUN } from './cloud-kit.js';

export const SUN_X = SUN.x + 160; // the sun's x in layer px: a layer is drawn 160 px left of the frame (parallax.js)
export const GOLD = '#ffc86a'; // sunlight on an edge
export const EMBER = '#ff9a4a'; // a lamp, a forge, the low light on the undersides
export const ROSE = '#e8788c';
export const NIGHT = '#120a30'; // the shadow it leaves
export const BRASS = '#c8902a';
export const CANVAS = '#f0d6a8';

export const poly = (g, pts) => {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
};

// 1 if the sun is to the right of x, -1 if to the left: the way a shape's lit flank faces.
export const toward = (x) => (SUN_X >= x ? 1 : -1);

// A thin rim of light along the edge of a shape that faces `dir` (1 right, -1 left): the shape, less itself
// moved d px away from the light. `build(g, ox, oy)` adds the shape's outline to the current path, moved by
// (ox, oy).
export function rimLight(g, build, dir, d = 2.6, color = GOLD, a = 0.85) {
  g.save();
  g.beginPath();
  build(g, 0, 0);
  g.clip();
  g.beginPath();
  g.rect(-9000, -9000, 18000, 18000);
  build(g, -dir * d, d * 0.35);
  g.fillStyle = rgba(color, a);
  g.fill('evenodd');
  g.restore();
}

// A rope from (x0, y0) to (x1, y1) hanging in a sag of `sag` px.
export function rope(g, x0, y0, x1, y1, sag, color, w = 1.2) {
  g.beginPath();
  g.moveTo(x0, y0);
  g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag, x1, y1);
  g.strokeStyle = color;
  g.lineWidth = w;
  g.stroke();
}

// A flag flying from (x, y) in the layer: only its sign is left here, the flag itself ripples in
// flourish-9.js. dir is the way it streams (1 right, -1 left), len and h its size.
export const flag = (out, x, y, len, h, dir, color) => out.signs.push({ flag: true, x, y, len, h, dir, color });

// A lit window or porthole: a glowing pane in `color`, brightest at the top, a frame round it. The pane's
// light goes to the layer's lights when `lit` is given a mode.
export function pane(g, out, rng, x, y, r, color, mode = null) {
  g.beginPath();
  g.arc(x, y, r, 0, 6.3);
  g.fillStyle = rgba('#fff4cf', 0.95);
  g.fill();
  g.beginPath();
  g.arc(x, y + r * 0.2, r * 0.85, 0.1, 3.05);
  g.fillStyle = rgba(color, 0.9);
  g.fill();
  g.beginPath();
  g.arc(x, y, r + 0.9, 0, 6.3);
  g.strokeStyle = rgba(NIGHT, 0.8);
  g.lineWidth = 1.1;
  g.stroke();
  if (mode) out.lights.push({ x, y, r: r * 3.6, color, mode, ph: rng(), a: 0.75 });
}
