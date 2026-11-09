// World 13, Sunset Armada, the ironclad gunboat's upper works (see w13-4.js): the small canvas balloons
// that lift it, its smokestack, and the smoke the stack puffs, which drifts up and thins on the beat.
import { path, ink, lin, rad, rgba, shade, bloom, gloss, line, ellipse } from './kit.js';
import { HOT, RED, CANVAS, brass, brassV, rivet, patch, puff, glint } from './w13-kit.js';

// A small lift balloon at (x, y), tilted by `tilt`: cream canvas with seams, a coral band and a patch,
// a brass cap and a mouth ring, roped to the deck below it.
export function balloon(b, l, x, y, tilt, m) {
  b.save();
  b.translate(x, y);
  b.rotate(tilt);
  const shape = () => {
    b.beginPath();
    b.moveTo(0, -12);
    b.bezierCurveTo(7, -12, 10.4, -6, 10.4, -1);
    b.bezierCurveTo(10.4, 6, 4.4, 10, 2.6, 12);
    b.lineTo(-2.6, 12);
    b.bezierCurveTo(-4.4, 10, -10.4, 6, -10.4, -1);
    b.bezierCurveTo(-10.4, -6, -7, -12, 0, -12);
    b.closePath();
  };
  shape();
  ink(b, rad(b, 0, -1, 1, 15, [[0, '#fff6d8'], [0.5, CANVAS], [1, shade(CANVAS, -0.5)]], -3.4 * m, -6), 2.4);
  b.save();
  shape();
  b.clip();
  for (const k of [-1, 0, 1]) {
    b.beginPath();
    b.moveTo(0, -12);
    b.quadraticCurveTo(k * 11, -1, k * 1.3, 12);
    line(b, rgba('#5a3418', 0.45), 0.9);
  }
  b.beginPath(); // the coral band
  b.moveTo(-12, -4);
  b.quadraticCurveTo(0, 0, 12, -4);
  b.lineTo(12, 0.4);
  b.quadraticCurveTo(0, 4.4, -12, 0.4);
  b.closePath();
  b.fillStyle = RED;
  b.fill();
  patch(b, 3.6 * m, 6, 4.2, 3.6, 0.4, shade(CANVAS, -0.22));
  b.fillStyle = lin(b, 0, 2, 0, 13, [[0, rgba('#ff9a3a', 0)], [1, rgba('#ff9a3a', 0.45)]]);
  b.fillRect(-12, 2, 24, 11);
  b.restore();
  gloss(b, -3.8, -6.6, 3.4, 2, 0.6, -0.6);
  ellipse(b, 0, -12.2, 2.5, 1.1); // the cap
  ink(b, brass(b, -2.5, 2.5), 1.2);
  ellipse(b, 0, 12.2, 3.4, 1.3); // the mouth ring
  ink(b, brass(b, -3.4, 3.4), 1.2);
  b.restore();
  bloom(l, x, y - 1, 11, '#ffd27a', 0.16); // the sun through the cloth
}

// The smokestack at x = 0 from the casemate's roof (y = -14) up to its mouth (y = -31): a tapering iron tube
// with brass bands and rivets, a flared brass rim, and an ember glowing in the mouth.
export function stack(b, l, f, c) {
  path(b, [[-6.4, -13], [6.4, -13], [5.2, -31], [-5.2, -31]]);
  ink(b, lin(b, -6, 0, 6, 0, [[0, shade(c, 0.4)], [0.4, c], [1, shade(c, -0.6)]]), 2.2);
  for (const [y, h] of [[-22.4, 2.6], [-28, 2]]) {
    const hw = 5.9 - (y + 13) * -0.07;
    path(b, [[-hw, y], [hw, y], [hw, y + h], [-hw, y + h]]);
    ink(b, brassV(b, y, y + h), 1.3);
  }
  for (const y of [-17, -25.6]) { // rivets down the seam, and a soot streak
    rivet(b, -3, y, 0.9, c);
    rivet(b, 3, y, 0.9, c);
  }
  path(b, [[-5.4, -28], [-5.4, -14.6]], true);
  line(b, rgba('#ffffff', 0.35), 1);
  ellipse(b, 0, -31.4, 7.4, 2.7); // the rim
  ink(b, brass(b, -7.4, 7.4), 1.6);
  ellipse(b, 0, -31.6, 5, 1.6);
  b.fillStyle = '#070810';
  b.fill();
  bloom(l, 0, -31.6, f ? 7.5 : 5.5, HOT, f ? 0.9 : 0.6);
  glint(l, f ? 1.2 : -1.2, -31.8, f ? 2.4 : 1.6, '#fff0c0', 0.9);
}

// The smoke over the stack: a fat puff that has just left it and a small one higher; each beat it has
// climbed, spread to one side and a fresh small puff has begun.
export function smoke(b, f) {
  if (f) {
    puff(b, 3.6, -38.8, 4.6);
    puff(b, -2.6, -43.4, 2.9);
  } else {
    puff(b, 0.6, -36.6, 3.3);
    puff(b, -2.4, -41.8, 4.1);
  }
}
