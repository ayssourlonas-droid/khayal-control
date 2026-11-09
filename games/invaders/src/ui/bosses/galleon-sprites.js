// Sprites the Thunder Galleon's live extras draw (World 13, Sunset Armada; galleon-fx.js, galleon-fire.js),
// each painted once on first use and kept: the propeller's four blades and the disc they blur into, a
// pennant in eight waves, a lantern, the captain's silhouette and a flame in four flickers.
import { rgba, shade, cached, hash, lin, rad, glow, soft, star } from '../sprites.js';
import { path, ink, line, TAU } from './kit.js';
import { BRASS_L, RED, RED_D, CREAM, FIRE, WARM, circle, stud } from './galleon-kit.js';
import { lantern } from './galleon-glass.js';

const once = (make) => { // asked for every frame: no key built and no painter made once it exists
  let sprite = null;
  return () => (sprite ??= make());
};

export const BLADE_R = 40; // the blades' reach; the sprite is 100 square, the hub at its middle

// Four blades on a hub: paddles of brass, twisted a little, lit along their leading edge.
export const blades = once(() => cached('galBlades', 100, 100, (g) => {
  g.translate(50, 50);
  for (let i = 0; i < 4; i++) {
    g.save();
    g.rotate((i * TAU) / 4);
    g.beginPath();
    g.moveTo(7, -4.5);
    g.bezierCurveTo(18, -9, 30, -10.5, 38, -7);
    g.quadraticCurveTo(42, -3, 39.5, 2.5);
    g.bezierCurveTo(30, 5, 18, 5.5, 7, 4.5);
    g.closePath();
    ink(g, lin(g, 0, -10, 0, 6, [[0, '#fbe29a'], [0.5, '#c8902a'], [1, '#6a3e10']]), 1.8);
    path(g, [[11, -6.2], [30, -8.6], [37, -6]], true);
    line(g, rgba('#ffffff', 0.6), 0.9);
    path(g, [[12, 2.6], [34, 0.6]], true);
    line(g, rgba('#2a1406', 0.45), 1);
    g.restore();
  }
  circle(g, 0, 0, 9.5);
  ink(g, rad(g, -2, -3, 0, 10, [[0, '#fff0b8'], [0.5, '#c8902a'], [1, '#5c3410']]), 1.8);
  for (let i = 0; i < 4; i++) stud(g, Math.cos((i * TAU) / 4 + 0.78) * 6, Math.sin((i * TAU) / 4 + 0.78) * 6, 1.3);
  circle(g, 0, 0, 2.6);
  ink(g, '#2a1608', 1);
}));

// The disc the blades sweep when they turn fast: a pale haze of brass, thicker toward the rim.
export const sweep = once(() => cached('galSweep', 100, 100, (g) => {
  g.fillStyle = rad(g, 50, 50, 8, 41, [[0, rgba('#e8b860', 0)], [0.5, rgba('#e8b860', 0.5)], [0.9, rgba('#f6d890', 0.7)], [1, rgba('#f6d890', 0)]]);
  g.fillRect(0, 0, 100, 100);
}));

// The pressure gauge's needle, 16 x 8, pivoting on its hub at (6, 4): red, a short tail behind the pivot.
export const needle = once(() => cached('galNeedle', 16, 8, (g) => {
  path(g, [[3.4, 4], [12.4, 4]], true);
  line(g, '#c82a1a', 1.2);
  circle(g, 6, 4, 1.5);
  g.fillStyle = '#1a1018';
  g.fill();
}));

// A ship's wheel seen from behind against a lit window, 26 x 26: a dark ring, eight spokes with handles.
export const wheel = once(() => cached('galWheel', 26, 26, (g) => {
  g.translate(13, 13);
  circle(g, 0, 0, 8.4);
  line(g, '#26120a', 2.4);
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8;
    path(g, [[0, 0], [Math.cos(a) * 11.4, Math.sin(a) * 11.4]], true);
    line(g, '#26120a', 1.7);
    circle(g, Math.cos(a) * 11.6, Math.sin(a) * 11.6, 1.5);
    g.fillStyle = '#26120a';
    g.fill();
  }
  circle(g, 0, 0, 2.6);
  g.fill();
}));

// A swallow-tailed pennant 52 x 24 flying to the right from its staff at the left, in wave n of eight:
// red with a cream stripe and a thin ink edge.
export const PENNANT = [52, 24];
const waves = [];
export const pennant = (n) => (waves[n & 7] ??= cached('galPennant' + (n & 7), 52, 24, (g) => {
  const ph = ((n & 7) * TAU) / 8;
  const mid = (x) => 12 + (0.4 + x * 0.1) * Math.sin(ph - x * 0.23);
  const half = (x) => 7 - x * 0.045;
  const top = [];
  const bot = [];
  for (let x = 2; x <= 48; x += 4) {
    top.push([x, mid(x) - half(x)]);
    bot.unshift([x, mid(x) + half(x)]);
  }
  path(g, [...top, [50, mid(50) - half(50) + 1], [41, mid(41)], [50, mid(50) + half(50) - 1], ...bot]);
  ink(g, lin(g, 0, 0, 0, 24, [[0, shade(RED, 0.12)], [1, RED_D]]), 1.4);
  g.beginPath();
  for (let x = 4; x <= 40; x += 3) g[x === 4 ? 'moveTo' : 'lineTo'](x, mid(x));
  line(g, CREAM, 2.4);
}));

// A lantern for the rail, the nest and the crew: 16 x 28, hung from its top.
export const lamp = once(() => cached('galLamp', 16, 28, (g) => lantern(g, g, 8, 1, 1)));

// The captain at the bridge's window: a tricorn, a cloak, a spyglass under his arm. 16 x 34.
export const captain = once(() => cached('galCaptain', 16, 34, (g) => {
  g.translate(8, 0);
  path(g, [[-7, 6], [-3, 0.5], [3, 0.5], [7, 6], [4, 4.6], [-4, 4.6]]); // hat
  ink(g, '#0e0814', 1);
  circle(g, 0, 10, 3.6);
  ink(g, '#1c1020', 0.8);
  path(g, [[-3, 13], [3, 13], [7, 34], [-7, 34]]); // cloak
  ink(g, lin(g, -7, 0, 7, 0, [[0, '#1a0e1e'], [0.7, '#0e0814'], [1, '#2a1428']]), 0.8);
  path(g, [[3, 20], [8, 16]], true); // the spyglass
  line(g, '#0e0814', 3);
  line(g, BRASS_L, 1.3);
  path(g, [[-3.8, 8.4], [-3.4, 12]], true);
  line(g, rgba(WARM, 0.8), 0.8);
}));

// A flame pointing down, 44 x 72, in flicker n of four: red-orange round, yellow inside, a white heart,
// fading toward its tip. Drawn plain over the sky: added to a bright sunset it would only burn white.
const flames = [];
export const flame = (n) => (flames[n & 3] ??= cached('galFlame' + (n & 3), 44, 72, (g) => {
  const wob = (k) => (hash((n & 3) * 11 + k) - 0.5) * 7;
  for (const [s, c, a] of [[1, '#ff5a14', 0.95], [0.78, FIRE, 0.95], [0.55, '#ffc040', 0.95], [0.3, '#fffbe0', 0.95]]) {
    g.beginPath();
    g.moveTo(22 - 14 * s, 3);
    g.bezierCurveTo(22 - 15 * s, 26, 22 - 6 * s + wob(1), 44 * s + 10, 22 + wob(2) * s, 3 + 66 * s);
    g.bezierCurveTo(22 + 6 * s + wob(3), 44 * s + 10, 22 + 15 * s, 26, 22 + 14 * s, 3);
    g.closePath();
    g.fillStyle = rad(g, 22, 4, 2, 66 * s, [[0, rgba(shade(c, 0.2), a)], [0.7, rgba(c, a * 0.8)], [1, rgba(c, 0)]]);
    g.fill();
  }
}));

// A billow of gun smoke, 120 x 70, one of three: lumpy, dark underneath, lit gold-pink along its top. Opaque
// at its heart, feathered at its edge.
const clouds = [];
export const billow = (n) => (clouds[n % 3] ??= cached('galBillow' + (n % 3), 120, 70, (g) => {
  const lumps = [[30, 44, 21], [52, 40, 25], [77, 43, 23], [95, 47, 17], [44, 27, 17], [67, 25, 19], [83, 31, 13]];
  for (const [i, [x, y, r]] of lumps.entries()) {
    const [cx, cy] = [x + (hash(n * 7 + i) - 0.5) * 8, y + (hash(n * 5 + i) - 0.5) * 6];
    g.fillStyle = rad(g, cx, cy, r * 0.1, r, [[0, '#f4d0ac'], [0.35, '#b49288'], [0.72, '#6e5a62'], [1, 'rgba(78,62,70,0)']], cx - r * 0.3, cy - r * 0.45);
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
}));

// Everything the live extras draw, painted now (warmBoss calls this): the sprites above and the glows,
// stars and soft discs they take from the shared caches.
export function warm() {
  for (const make of [blades, sweep, lamp, captain, needle, wheel]) make();
  for (const c of [WARM, FIRE, '#4de3ff', '#ff9a3a', '#ff9a5a']) glow(c);
  for (const c of ['#fff0c0', '#fff6d0', '#ffd070']) star(c);
  for (const c of ['#fff1e4', '#c8aab0', '#ffb05a', '#ffc880', '#ff9a2a']) soft(c);
  for (let n = 0; n < 3; n++) billow(n);
  for (let n = 0; n < 8; n++) pennant(n);
  for (let n = 0; n < 4; n++) flame(n);
}

