// The near layer of Ember Carnival: the midway at the player's feet. Game booths stand in a row under their
// marquees (parallax-carnival-stall.js), tall lamp posts between them with a globe burning on each, and the
// ground in front dark with a warm edge where the stalls' light reaches it. Strings of bulbs hang from post
// to post and balloons ride on their strings from the booths' awnings; both are left as signs and drawn
// live, swaying, in flourish-11.js. L.bulb is the bulbs' colour. See parallax-shapes.js for the painter
// contract.
import { rgba, lin } from './sprites.js';
import { TAU } from '../core/math.js';
import { GOLD, BULB } from './parallax-carnival-kit.js';
import { NEAR, stall } from './parallax-carnival-stall.js';

const TOP = 54; // layer y of the lamp posts' tops, where the strings hang from

// A lamp post: a slim pole with a bracket and a globe lamp.
function post(g, out, rng, L, x) {
  g.fillStyle = L.color;
  g.fillRect(x - 2.4, TOP, 4.8, NEAR - TOP);
  g.fillRect(x - 6, NEAR - 10, 12, 10);
  g.beginPath();
  g.arc(x, TOP - 8, 9, 0, TAU);
  g.fill();
  g.beginPath();
  g.arc(x, TOP - 8, 6.4, 0, TAU);
  g.fillStyle = rgba(BULB, 0.98);
  g.fill();
  out.lights.push({ x, y: TOP - 8, r: 120, color: GOLD, mode: 'steady', ph: 0, a: 0.5 });
  out.lights.push({ x, y: TOP - 8, r: 44, color: BULB, mode: 'flicker', ph: rng(), a: 0.7 });
  g.fillStyle = L.color;
}

function booths(g, w, h, rng, L, out) {
  g.fillStyle = L.color;
  g.fillRect(0, NEAR, w, h - NEAR);
  g.fillStyle = lin(g, 0, NEAR, 0, NEAR + 26, [[0, rgba(GOLD, 0.3)], [1, rgba(GOLD, 0)]]);
  g.fillRect(0, NEAR, w, 26);
  const posts = [];
  let x = 150;
  for (let k = 0; x < w - 160; k++) {
    const wd = 168 + rng() * 70;
    stall(g, out, rng, L, x + wd / 2, wd, k % 4);
    x += wd + 120 + rng() * 140;
    posts.push(x - 60 - rng() * 30);
    post(g, out, rng, L, posts.at(-1));
    x += 40;
  }
  post(g, out, rng, L, 40);
  posts.unshift(40);
  posts.forEach((px, i) => {
    const qx = posts[i + 1];
    if (!qx) return;
    const n = Math.round((qx - px) / 34);
    out.signs.push({ string: true, x0: px, y0: TOP - 6, x1: qx, y1: TOP - 6, sag: 34, n, k: i });
    out.signs.push({ string: true, x0: px, y0: TOP + 30, x1: qx, y1: TOP + 30, sag: 22, n: n - 2, k: i + 40 });
  });
  g.fillStyle = L.color;
}

export const BOOTHS = { booths };
