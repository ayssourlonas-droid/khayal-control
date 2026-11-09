// The Squall Ray's Tesla coil (World 18, Anvil Sky; see ray.js): a weak part 110 x 84 hung under each wing tip, painted as the LEFT one and mirrored for the right,
// and it fills its rect, so that a shot that lands on it lands on the coil. From an iron yoke bolted to the wing's belly hangs the thing itself: a stack of three
// porcelain insulator skirts, a secondary of fine copper wire wound turn on turn (thirty turns, bright where each catches the light and dark between), and at its free end
// the toroid, a big flattened steel donut eighty-five px across with a thick tube of steel round a thin slit of a hole, the winding going down into it, which is where the
// lightning leaves it; and a curved steel prong rising from the yoke out toward the wing tip, ending in a ball (the live layer, ray-fx.js, throws arcs from the toroid to the
// ball and from the ball to the tip). The coil is upright, with a slight lean out. The lights layer (ray-coil-lit.js): the toroid's rim of cyan, a violet bloom round it,
// little arcs leaping from it, a warm gleam along the winding, the glints on the porcelain. Part coordinates (the part's centre is the origin; the outer side is -x),
// shared with the arcs in ray-fx.js (PRONG, ELECTRODE). Bake-time only.
import { PAL, path, line, rad, rgba, shade, circle, ellipse, TAU } from './ray-kit.js';
import { ink, round, STEEL } from '../aliens/w18-kit.js';
import { slab, rivetsOn } from './ray-iron.js';
import { lit } from './ray-coil-lit.js';

export const LEAN = 0.1; // rad: the coil's bottom leans out
export const TORUS = { y: 24, rx: 34, ry: 10, w: 17 }; // the donut: the centre of its tube is an ellipse rx x ry about (0, y), the tube w wide, in the coil's own (leaning) frame
const E = [-38, 30]; // the point of the toroid the arcs leave from and the ball at the end of the prong, in the same frame
const P = [-54, -40];
const at = ([x, y]) => [x * Math.cos(LEAN) - y * Math.sin(LEAN), x * Math.sin(LEAN) + y * Math.cos(LEAN)];
export const ELECTRODE = at(E); // the same two points in the part's coordinates, for the arcs of ray-fx.js
export const PRONG = at(P);

const turn = (g, y, w) => {
  path(g, [[-w, y], [0, y + 1.2], [w, y]], true);
  line(g, PAL.copperD, 2.4);
  path(g, [[-w + 2, y - 0.5], [-2, y + 0.2], [w * 0.4, y - 0.3]], true);
  line(g, rgba(PAL.copperL, 0.85), 0.9);
};

function skirt(g, y, w) { // an insulator skirt: a flattened cap of porcelain
  ellipse(g, 0, y, w, 3.6);
  ink(g, round(g, -w, w, PAL.porcelain, 0.42), 1.6);
  path(g, [[-w + 3, y - 1.4], [w * 0.2, y - 1.8]], true);
  line(g, rgba('#ffffff', 0.85), 0.9);
}

function winding(b) { // the secondary, down to the donut's middle
  b.save();
  b.beginPath();
  b.rect(-16, -19, 32, TORUS.y + 19);
  ink(b, round(b, -16, 16, PAL.copper, 0.5), 2);
  b.clip();
  for (let i = 0; i < 30; i++) turn(b, -17 + i * 1.4, 16);
  b.restore();
}

// Half of the donut, from y0 down to y1: a tube of steel along an ellipse, dark at its rim, bright along its upper side, shaded dark along its under side.
function half(b, y0, y1) {
  const { y, rx, ry, w } = TORUS;
  const tube = (dy, lw, c) => {
    b.beginPath();
    b.ellipse(0, y + dy, rx, ry, 0, 0, TAU);
    b.lineWidth = lw;
    b.strokeStyle = c;
    b.stroke();
  };
  b.save();
  b.beginPath();
  b.rect(-60, y0, 120, y1 - y0);
  b.clip();
  b.lineCap = 'round';
  tube(0, w + 3.4, '#0a0c16');
  tube(0, w, shade(STEEL, -0.5));
  tube(3, w * 0.5, rgba('#05060f', 0.55));
  tube(-2.6, w * 0.5, shade(STEEL, -0.12));
  tube(-4, w * 0.22, rgba('#ffffff', 0.85));
  b.restore();
}

function body(b) {
  const { y } = TORUS;
  slab(b, [[-36, -42], [36, -42], [42, -33], [-42, -33]], PAL.iron, { lw: 1.8, wear: 0.4, rust: 0.1, seed: 41 }); // the yoke
  rivetsOn(b, [[-30, -38], [0, -38], [30, -38]], 1.6);
  for (const [sy, w] of [[-26, 21], [-21, 17.5], [-16.5, 15]]) skirt(b, sy, w);
  half(b, -60, y); // the donut's rear half, then the winding going down into it, then its front half
  winding(b);
  half(b, y, 60);
  b.beginPath(); // the slit's lower lip catches the light
  b.ellipse(0, y + 0.8, TORUS.rx - TORUS.w / 2 + 1, 2.2, 0, 0.15, Math.PI - 0.15);
  line(b, rgba('#e8f4ff', 0.55), 1.1);
}

function prong(b) {
  const pts = [[-30, -37], [-40, -42], [-48, -43], P];
  path(b, pts, true);
  line(b, '#0a0c16', 4.4);
  line(b, shade(STEEL, -0.1), 2.6);
  path(b, pts.map(([x, y]) => [x - 0.6, y - 0.8]), true);
  line(b, rgba('#ffffff', 0.6), 0.9);
  circle(b, P[0], P[1], 4);
  ink(b, rad(b, P[0] - 1.2, P[1] - 1.2, 0, 4.4, [[0, '#ffffff'], [0.4, shade(STEEL, 0.3)], [1, shade(STEEL, -0.5)]]), 1.4);
}

export function coil(b, l) {
  b.save();
  l.save();
  for (const g of [b, l]) g.rotate(LEAN);
  body(b);
  prong(b);
  lit(l, E, P, TORUS);
  b.restore();
  l.restore();
}
