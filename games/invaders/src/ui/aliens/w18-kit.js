// What World 18's painters share (w18.js .. w18-*.js): the invaders of the thunderstorm are iron, copper, canvas and
// lightning, lit from the upper left by a dusk sky. Metal is a cool blue-steel with a bright upper-left edge and a dark
// underside, copper is warm and rubbed bright where it catches the light, every join is riveted, and the only light a body
// makes itself is electric (violet-white arcs, yellow-white sparks) or the orange of a forge. Everything that glows is
// on the lights layer, so the body still reads with the lights off. Nothing is painted per frame: every shape is baked.
import { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, circle, both, neon, TAU, INK } from './kit.js';
import { hash } from '../sprites.js';
import { bez, tidy, lerp, poly } from './w16-kit.js';

export { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, circle, both, neon, TAU, INK, hash, bez, tidy, lerp, poly };

export const IRON = '#59637c'; // wrought iron, blue-grey
export const IRON_D = '#222838'; // iron in shadow
export const STEEL = '#9db0d4'; // a bright steel edge
export const COPPER = '#c47a3c';
export const COPPER_D = '#5e2f14';
export const COPPER_L = '#ffc58a';
export const PORCELAIN = '#d8deee'; // insulator ceramic
export const FORGE = '#ff8a2a'; // the glow of hot iron
export const HOT = '#ffe0a0';
export const VOLT = '#8ad0ff'; // electric blue
export const VIOLET = '#b9a0ff'; // the crackle of a coil
export const SPARK = '#fff6c0'; // a yellow-white spark

// Metal shaded across a box: bright at the upper left, c in the middle, dark at the lower right.
export const metal = (g, x0, y0, x1, y1, c) => lin(g, x0, y0, x1, y1, [[0, shade(c, 0.5)], [0.4, shade(c, 0.05)], [1, shade(c, -0.58)]]);

// Metal across x only (a cylinder lit from the left): dark edge, bright band, the colour, dark edge.
export const round = (g, x0, x1, c, dark = 0.55) => lin(g, x0, 0, x1, 0, [
  [0, shade(c, -dark)], [0.22, shade(c, 0.55)], [0.42, shade(c, 0.12)], [0.75, mix(c, '#000000', 0.25)], [1, shade(c, -dark - 0.1)],
]);

// A rivet: a dark ring, a metal dome and a glint at its upper left.
export function rivet(g, x, y, r = 1.5, c = STEEL) {
  circle(g, x, y, r + 0.9);
  g.fillStyle = INK;
  g.fill();
  circle(g, x, y, r);
  g.fillStyle = shade(c, -0.2);
  g.fill();
  circle(g, x - r * 0.3, y - r * 0.3, r * 0.5);
  g.fillStyle = rgba('#ffffff', 0.85);
  g.fill();
}

// A row of rivets along the segment (x0, y0) to (x1, y1), n of them.
export function rivets(g, x0, y0, x1, y1, n, r = 1.4, c = STEEL) {
  for (let i = 0; i < n; i++) {
    const k = n === 1 ? 0.5 : i / (n - 1);
    rivet(g, lerp(x0, x1, k), lerp(y0, y1, k), r, c);
  }
}

// A zigzag from (x0, y0) to (x1, y1): n segments, each point thrown sideways by up to amp, the same for the same seed.
export function jag(seed, x0, y0, x1, y1, n, amp) {
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const [nx, ny] = [-(y1 - y0) / len, (x1 - x0) / len];
  const pts = [[x0, y0]];
  for (let i = 1; i < n; i++) {
    const k = i / n;
    const s = (hash(seed * 53 + i * 7) - 0.5) * 2 * amp * (0.5 + Math.sin(k * Math.PI) * 0.6);
    pts.push([lerp(x0, x1, k) + nx * s, lerp(y0, y1, k) + ny * s]);
  }
  pts.push([x1, y1]);
  return pts;
}

// A bolt of lightning along pts on the lights layer: a coloured glow, then the colour, then a white core. w is the core's
// base width, a its strength.
export function bolt(l, pts, c, w = 2, a = 1) {
  path(l, pts, true);
  l.lineJoin = 'miter';
  l.lineCap = 'round';
  neon(l, c, w, a);
}

// Scratches and grime inside the current clip: n short strokes over an ellipse, light and dark alternating.
export function scuff(g, n, seed, cx, cy, rx, ry, a = 0.25, dark = '#05060c') {
  for (let i = 0; i < n; i++) {
    const t = hash(seed * 61 + i * 5) * TAU;
    const d = Math.sqrt(hash(seed * 61 + i * 5 + 1));
    const [x, y] = [cx + Math.cos(t) * d * rx, cy + Math.sin(t) * d * ry];
    const ang = hash(seed * 61 + i * 5 + 2) * 3;
    const len = 2 + hash(seed * 61 + i * 5 + 3) * 5;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    line(g, i % 2 ? rgba('#ffffff', a) : rgba(dark, a * 1.6), 0.8);
  }
}

// A soft glow: a bloom with a hot white heart, on the lights layer.
export function glare(l, x, y, r, c, a = 1) {
  bloom(l, x, y, r * 2.4, c, 0.6 * a);
  eye(l, x, y, r, c, 1.6);
}
