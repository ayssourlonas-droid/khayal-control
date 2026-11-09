// The mid layer of Sunset Armada: the fleet at anchor and under way. Brass-and-canvas airships (the sailers
// of parallax-armada-ships.js and the balloon ships of -ships-2.js) hang in the glare with their sails lit
// from behind, portholes burning and propellers turning (flourish-9.js), and below them small floating
// rocks carry windmills, cottages and bunting; one ship is moored to a rock by a line, a crane hoists
// a crate from another. L.lamp is the windows' colour, L.sail the canvas's. See parallax-shapes.js for the
// painter contract.
import { rgba } from './sprites.js';
import { pick } from '../core/rng.js';
import { GOLD, EMBER, NIGHT, BRASS, poly, toward, rimLight, rope, pane } from './parallax-armada-kit.js';
import { isle } from './parallax-armada-isle.js';
import { sailer } from './parallax-armada-ships.js';
import { blimp } from './parallax-armada-ships-2.js';

export const SAILS = 4; // blades on a windmill

// A windmill on the turf at (x, y): a tapering tower banded in stone, a door, a lit window, a cap, its
// sails' hub; the sails themselves turn in flourish-9.js (a sign marks the hub).
function windmill(g, out, rng, L, x, y, h, dir) {
  const build = (c, ox = 0, oy = 0) => {
    c.moveTo(x - h * 0.2 + ox, y + oy);
    c.lineTo(x - h * 0.13 + ox, y - h + oy);
    c.lineTo(x + h * 0.13 + ox, y - h + oy);
    c.lineTo(x + h * 0.2 + ox, y + oy);
    c.closePath();
  };
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  poly(g, [[x - h * 0.17, y - h], [x, y - h * 1.22], [x + h * 0.17, y - h]]); // the cap
  g.fill();
  g.strokeStyle = rgba(NIGHT, 0.5);
  g.lineWidth = 1;
  for (let k = 1; k < 5; k++) { // courses of stone
    g.beginPath();
    g.moveTo(x - h * (0.2 - 0.07 * (k / 5)), y - h * (k / 5));
    g.lineTo(x + h * (0.2 - 0.07 * (k / 5)), y - h * (k / 5));
    g.stroke();
  }
  rimLight(g, build, dir, 3, GOLD, 0.9);
  g.fillStyle = rgba(NIGHT, 0.7);
  g.fillRect(x - 3.5, y - 12, 7, 12);
  pane(g, out, rng, x, y - h * 0.6, 3, L.lamp, 'pulse');
  g.fillStyle = BRASS;
  g.beginPath();
  g.arc(x, y - h * 1.0, 3.4, 0, 6.3);
  g.fill();
  out.signs.push({ mill: true, x, y: y - h, r: h * 0.95, dir });
  g.fillStyle = L.color;
}

// Bunting strung between two points: a sagging line with a pennant on it every few px, red and cream.
function bunting(g, rng, x0, y0, x1, y1) {
  const sag = 8 + Math.abs(x1 - x0) * 0.06;
  rope(g, x0, y0, x1, y1, sag, rgba(NIGHT, 0.8), 1);
  const n = Math.max(3, Math.round(Math.abs(x1 - x0) / 10));
  for (let i = 1; i < n; i++) {
    const u = i / n;
    const [px, py] = [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 2 * u * (1 - u)];
    poly(g, [[px - 3, py], [px + 3, py], [px, py + 7]]);
    g.fillStyle = rgba(pick(rng, ['#e8788c', '#f4e4c0', '#ffc86a', '#c8664a']), 0.95);
    g.fill();
  }
}

// A crane on the rock at (x, y) with a crate swinging from its hook, and a stack of barrels.
function crane(g, out, rng, L, x, y, dir) {
  g.fillStyle = L.color;
  g.fillRect(x - 2, y - 52, 4, 52);
  g.fillRect(x - 2, y - 54, 34 * dir, 3);
  rope(g, x, y - 52, x + 30 * dir, y - 52, 0, rgba(NIGHT, 0.8), 1);
  rope(g, x + 30 * dir, y - 52, x + 30 * dir, y - 24, 0, rgba(NIGHT, 0.9), 1.1);
  g.fillRect(x + 30 * dir - 7, y - 24, 14, 12);
  g.fillStyle = rgba(BRASS, 0.9);
  g.fillRect(x + 30 * dir - 7, y - 24, 14, 1.6);
  g.fillStyle = L.color;
  for (let i = 0; i < 3; i++) { // barrels
    g.beginPath();
    g.ellipse(x - 14 * dir + i * 8 * -dir, y - 6, 5, 6, 0, 0, 6.3);
    g.fill();
  }
  out.lights.push({ x: x + 2 * dir, y: y - 50, r: 18, color: EMBER, mode: 'flicker', ph: rng(), a: 0.8 });
}

function airships(g, w, h, rng, L, out) {
  const plan = ['rock', 'sail', 'blimp', 'rock', 'sail', 'rock', 'blimp', 'sail', 'rock'];
  let x = 150;
  let windmills = 0;
  for (const kind of plan) {
    const dir = rng() < 0.5 ? 1 : -1;
    let wd = kind === 'blimp' ? (250 + rng() * 60) * 1.15 : (270 + rng() * 60) * 1.25;
    if (kind === 'sail') sailer(g, out, rng, L, x + wd * 0.45, 235 + rng() * 40, wd / 1.25, dir, { masts: rng() < 0.4 ? 3 : 2 });
    else if (kind === 'blimp') blimp(g, out, rng, L, x + wd * 0.45, 235 + rng() * 40, wd / 1.15, dir);
    else {
      const [iw, top] = [170 + rng() * 90, 150 + rng() * 40];
      const cx = x + iw / 2;
      wd = iw;
      isle(g, out, rng, L, cx, top, iw, 90 + rng() * 40, { houses: 1, trees: 3, fall: rng() < 0.5 ? 70 : 0 });
      const d = toward(cx);
      if (windmills++ % 2 === 0) windmill(g, out, rng, L, cx - d * iw * 0.18, top - 6, 64 + rng() * 26, d);
      else crane(g, out, rng, L, cx - d * iw * 0.3, top - 5, d);
      bunting(g, rng, cx + d * iw * 0.1, top - 22, cx + d * iw * 0.42, top - 4);
    }
    x += wd + 40 + rng() * 90;
    if (x > w - 160) break;
  }
  g.fillStyle = L.color;
}

export const MID = { airships };
