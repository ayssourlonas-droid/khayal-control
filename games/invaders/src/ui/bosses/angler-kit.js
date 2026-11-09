// What the Lantern Leviathan's painters share (World 15, Lantern Deep; bosses/angler*.js): its colours, the
// geometry of the head and of the mouth (the hull, the maw, the jaw and the crest all read it from here, so the
// throat, the lips and the sockets meet), a seeded scatter, a photophore (a living lamp set in the skin) and a
// gradient or two for the skin. Bake-time only: nothing here runs per frame.
import { lin, rgba, shade, bloom, TAU } from './kit.js';
import { circle } from '../aliens/kit.js';
import { spline } from './galleon-kit.js';
import { hash } from '../sprites.js';

export { circle, TAU };

export const SKIN = '#07182a'; // the boss palette's hull: blue-black skin
export const SKIN_L = '#2a4a6a'; // the palette's plate: skin where the surface light reaches it
export const FLESH = '#1d3d5c'; // the soft, lumpy flesh of the lips and lids
export const GLOOM = '#02060e'; // the mouth's dark, the sockets
export const TEAL = '#3de8d0';
export const VIOLET = '#b27cff';
export const AQUA = '#5af0ff';
export const PALE = '#9af4ff'; // the weak points' cyan
export const IVORY = '#dff0ee'; // a fang
export const IVORY_D = '#4f7480';
export const INK = '#040a14';

// A seeded stream of numbers in [0, 1): the same seed gives the same skin every bake.
export const rng = (seed) => {
  let i = 0;
  return () => hash(seed * 7919 + i++);
};

// The head, seen from the front and a little above: a lumpy dome that swells into the cheeks and narrows into the
// throat. The right half from the crown down; the left is its mirror, a few px off, so the two are not twins.
const RIGHT = [[0, -137], [40, -137], [78, -134], [108, -131], [128, -124], [154, -120], [178, -106], [206, -90], [222, -66], [243, -44], [248, -12], [254, 18], [244, 48], [222, 76], [188, 96], [148, 106], [108, 114], [60, 120], [0, 124]];
const LEFT = RIGHT.slice(1, -1).map(([x, y], i) => [-x + (hash(i * 13 + 2) - 0.5) * 9, y + (hash(i * 7 + 5) - 0.5) * 8]);
export const HALF = RIGHT;
export const HEAD = [...RIGHT, ...LEFT.toReversed()];
export const HEAD_BOX = { x0: -256, x1: 256, y0: -137, y1: 124 };

export function headPath(g) {
  g.beginPath();
  g.moveTo(...HEAD[0]);
  spline(g, HEAD, true);
  g.closePath();
}

// The eye sockets (eyeL, eyeR stand in them): their centre and the radius of the fleshy rim.
export const SOCKET = { x: 155, y: -45, r: 50 };
// The base of the lure's stalk, a swollen knob of flesh on the crown (boss coordinates).
export const STALK = { x: -4, y: -121 };

// The mouth. The lower jaw (angler-jaw-sprite.js) juts out under it and rises in front of its floor, so what shows
// is a lens: the upper lip arches over it and the jaw's lip (rim, the jaw closed) carries the long needles up past
// the upper lip. Both lips meet at the corners, CORNER out. The maw part paints the chamber at the middle (|x| < CH).
export const CH = 118;
export const CORNER = 204;
export const DROP = 18; // how far the jaw hangs open from closed, in the hover and orbit phases
const k = (x) => Math.min(1, Math.abs(x) / CORNER);
export const upper = (x) => -62 + 56 * k(x) ** 2;
export const rim = (x) => 22 - 28 * k(x) ** 2;
export const lower = (x) => rim(x) + DROP; // the jaw's lip as the hull has it, open

// The mouth's outline from x0 to x1: along the upper lip and back along the jaw's lip, the jaw open.
export function mouthPath(g, x0 = -CORNER, x1 = CORNER, step = 4) {
  g.beginPath();
  g.moveTo(x0, upper(x0));
  for (let x = x0 + step; x < x1; x += step) g.lineTo(x, upper(x));
  g.lineTo(x1, upper(x1));
  g.lineTo(x1, lower(x1));
  for (let x = x1 - step; x > x0; x -= step) g.lineTo(x, lower(x));
  g.lineTo(x0, lower(x0));
  g.closePath();
}

// A lumpy ring of flesh: the path of a swelling about (x, y), radius r (rx and ry scale it), its edge wavering by
// about 8%, a different way for each seed.
export function lumpy(g, x, y, r, seed, n = 18, rx = 1, ry = 0.96) {
  const j = rng(seed);
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU;
    const rr = r * (1 + 0.09 * Math.sin(a * 3 + seed) + 0.06 * (j() - 0.5) * 2);
    return [x + Math.cos(a) * rr * rx, y + Math.sin(a) * rr * ry];
  });
  g.beginPath();
  g.moveTo(...pts[0]);
  spline(g, pts, true);
  g.closePath();
}

// Skin down y: a faintly lit back, a deep underside.
export const skinV = (g, y0, y1) => lin(g, 0, y0, 0, y1, [[0, '#0f2e48'], [0.3, '#0a2238'], [0.65, SKIN], [1, '#02070f']]);

// A photophore: a pit in the skin with a pale lens (body) and its light (lights). `a` is how bright it burns.
export function photophore(b, l, x, y, r, c = TEAL, a = 0.7) {
  circle(b, x, y + 0.5, r + 1.1);
  b.fillStyle = rgba('#000308', 0.7);
  b.fill();
  circle(b, x, y, r);
  b.fillStyle = rgba(shade(c, -0.35), 0.85);
  b.fill();
  if (!l) return;
  bloom(l, x, y, r * 3.6, c, 0.32 * a);
  l.save();
  l.globalCompositeOperation = 'lighter';
  circle(l, x, y, r * 0.8);
  l.fillStyle = rgba(shade(c, 0.5), a);
  l.fill();
  l.restore();
}

// A fine curved needle for the teeth and the barbels: base at (0, 0), pointing along +x, `len` long, `w` wide at the
// root, its tip bent `bend` px sideways. Sets the path; the caller fills and strokes it.
export function needlePath(g, len, w, bend) {
  g.beginPath();
  g.moveTo(0, -w / 2);
  g.quadraticCurveTo(len * 0.55, -w * 0.38 + bend * 0.35, len, bend);
  g.quadraticCurveTo(len * 0.5, w * 0.5 + bend * 0.45, 0, w / 2);
  g.closePath();
}
