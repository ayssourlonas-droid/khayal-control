// World 10, Hollow Night, the last of the guests (see w10.js): the witch's cauldron, brew bubbling green
// over a fire.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { FIRE } from './w10-2.js';

// A witch's cauldron: a round black pot on three legs with a lip and ring handles, soot on its belly,
// a ladle in it; the brew glows green in its mouth with bubbles popping, vapour rising; flames lick up
// the underside (the lights), moving between frames.
export function carrier(b, l, f, c) {
  both((s) => {
    path(b, [[s * 19, 18], [s * 11, 19], [s * 8, 33], [s * 17, 33]]);
    ink(b, lin(b, 0, 18, 0, 33, [[0, '#2c2c36'], [1, '#0a0a10']]), 2.4);
    ellipse(b, s * 29, -1, 5.4, 8); // the ring handle
    line(b, INK, 5);
    line(b, '#5a5a6c', 2.4);
    path(b, [[s * 24, -4], [s * 28, -6], [s * 28, 2], [s * 24, 3]]);
    ink(b, '#2a2a34', 1.6);
  });
  b.beginPath();
  b.moveTo(-26, -10);
  b.bezierCurveTo(-35, 6, -22, 27, 0, 28);
  b.bezierCurveTo(22, 27, 35, 6, 26, -10);
  b.closePath();
  ink(b, rad(b, -10, -2, 1, 40, [[0, '#6a6a80'], [0.35, '#30303c'], [1, '#0a0a10']]), 3);
  b.save();
  b.clip();
  for (let i = 0; i < 22; i++) { // hammered pits and rust
    const x = ((i * 53) % 50) - 25;
    const y = -8 + ((i * 29) % 34);
    ellipse(b, x, y, 1.3, 0.9);
    b.fillStyle = i % 3 ? rgba('#000000', 0.4) : rgba('#7a3a1a', 0.35);
    b.fill();
  }
  b.fillStyle = lin(b, 0, 12, 0, 29, [[0, rgba('#000000', 0)], [1, rgba('#000000', 0.7)]]); // soot over the fire
  b.fillRect(-30, 12, 60, 18);
  b.beginPath();
  b.moveTo(-27, 5);
  b.quadraticCurveTo(0, 12, 27, 5);
  line(b, '#14141c', 3.4); // the seam band
  b.restore();
  for (let x = -22; x <= 22; x += 7.3) { // its rivets
    const y = 5.6 + (x / 26) ** 2 * 5;
    ellipse(b, x, y, 1.5, 1.5);
    b.fillStyle = '#9a9ab0';
    b.fill();
  }
  gloss(b, -17, 2, 4, 11, 0.4, 0.5);
  b.beginPath(); // the ladle's handle, lying against the rim
  b.moveTo(3, -10);
  b.lineTo(17, -31);
  line(b, INK, 5.6);
  line(b, '#8a5a2a', 3);
  ellipse(b, 0, -10, 29, 8);
  ink(b, lin(b, 0, -18, 0, -2, [[0, '#7a7a90'], [0.5, '#34343e'], [1, '#15151c']]), 3);
  ellipse(b, 0, -10.5, 24, 5.4);
  ink(b, rad(b, 0, -10, 0, 26, [[0, shade(c, -0.15)], [1, shade(c, -0.8)]]), 1.6);
  b.beginPath(); // the inner wall's lit lip
  b.ellipse(0, -10.5, 24, 5.4, 0, Math.PI * 1.1, Math.PI * 1.9);
  line(b, rgba('#ffffff', 0.4), 1.2);
  const bubbles = f ? [[-4, -11.5, 2.8], [11, -9.6, 3.2], [-14, -9.6, 1.9], [17, -12, 1.4]] : [[-11, -11.5, 3], [6, -9.5, 2.3], [14, -11.6, 1.7], [-1, -12.4, 1.3]];
  ellipse(l, 0, -10.5, 23, 5);
  l.fillStyle = rad(l, 0, -10.5, 0, 24, [[0, rgba('#e8ffd0', 0.95)], [0.45, rgba(c, 0.85)], [1, rgba(shade(c, -0.4), 0.5)]]);
  l.fill();
  for (const [x, y, r] of bubbles) { // bubbles on the surface, rings with a lit lip
    ellipse(l, x, y, r, r * 0.8);
    line(l, rgba('#f4ffe8', 0.9), 1);
    l.fillStyle = rgba('#ffffff', 0.35);
    l.fill();
  }
  for (const [x, y, r] of f ? [[-7, -22, 2.2], [7, -31, 1.6], [12, -19, 1.2]] : [[-3, -25, 2], [4, -19, 1.4], [-10, -32, 1.2]]) eye(l, x, y, r, c, 3.2); // bubbles thrown clear
  for (const [x, y, k] of f ? [[-9, -30, 1], [9, -24, 0.8]] : [[8, -33, 1], [-8, -24, 0.8]]) bloom(l, x, y, 9 * k + 4, c, 0.32); // vapour
  bloom(l, 0, -11, 42, c, 0.5);
  for (const [i, x] of [-13, -6, 0, 6, 13].entries()) { // flames licking up the belly between the legs
    const h = 11 + (((i + f) % 2) ? 8 : 2) + (i === 2 ? 5 : 0);
    for (const [k, col, a] of [[1, '#ff6a14', 0.7], [0.7, FIRE, 0.85], [0.4, '#fff4b0', 0.9]]) {
      l.save();
      l.globalCompositeOperation = 'lighter';
      l.beginPath();
      l.moveTo(x - 4.4 * k, 29);
      l.quadraticCurveTo(x - 3 * k, 29 - h * 0.5 * k, x + (f ? 1.4 : -1.4) * k, 29 - h * k);
      l.quadraticCurveTo(x + 3.4 * k, 29 - h * 0.45 * k, x + 4.4 * k, 29);
      l.closePath();
      l.fillStyle = rgba(col, a);
      l.fill();
      l.restore();
    }
  }
  bloom(l, 0, 30, 30, '#ff7a14', 0.45);
}
