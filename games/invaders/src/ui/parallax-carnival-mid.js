// The mid layer of Ember Carnival: the midway itself. The Ferris wheel stands in the middle of it, big tops
// and a helter-skelter round it, bunting strung between them, lit windows and lamps, and a crowd of dark
// little figures along the promenade, some holding balloons. L.lamp is the windows' colour, L.bulb the
// bulbs'. The wheel turns and the pennants fly in the flourishes (flourish-11.js, flourish-9.js flags). See
// parallax-shapes.js for the painter contract.
import { rgba, lin } from './sprites.js';
import { TAU } from '../core/math.js';
import { PARTY, GOLD, NIGHT, rope, uplight } from './parallax-carnival-kit.js';
import { GROUND, bigtop, helter } from './parallax-carnival-tents.js';
import { ferris } from './parallax-carnival-wheel.js';

// Bunting strung between (x0, y0) and (x1, y1): a sagging line with a pennant on it every few px.
function bunting(g, rng, x0, y0, x1, y1) {
  const sag = 10 + Math.abs(x1 - x0) * 0.06;
  rope(g, x0, y0, x1, y1, sag, rgba(NIGHT, 0.85), 1);
  const n = Math.max(3, Math.round(Math.abs(x1 - x0) / 11));
  for (let i = 1; i < n; i++) {
    const u = i / n;
    const [px, py] = [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 2 * u * (1 - u)];
    g.beginPath();
    g.moveTo(px - 3.4, py);
    g.lineTo(px + 3.4, py);
    g.lineTo(px, py + 8);
    g.closePath();
    g.fillStyle = rgba(PARTY[Math.floor(rng() * 5)], 0.95);
    g.fill();
  }
}

// A figure on the promenade at x, h tall: a head, a body that flares to the feet, sometimes a balloon on a string.
function figure(g, rng, L, x, h) {
  g.fillStyle = L.color;
  g.beginPath();
  g.arc(x, GROUND - h, h * 0.16, 0, TAU);
  g.moveTo(x - h * 0.13, GROUND - h * 0.8);
  g.lineTo(x + h * 0.13, GROUND - h * 0.8);
  g.lineTo(x + h * 0.2, GROUND);
  g.lineTo(x - h * 0.2, GROUND);
  g.fill();
  if (rng() < 0.3) {
    const [bx, by] = [x + (rng() - 0.5) * 12, GROUND - h - 26 - rng() * 14];
    g.strokeStyle = rgba(NIGHT, 0.9);
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(x + h * 0.1, GROUND - h * 0.7);
    g.lineTo(bx, by + 7);
    g.stroke();
    g.beginPath();
    g.ellipse(bx, by, 5, 6.4, 0, 0, TAU);
    g.fillStyle = rgba(PARTY[Math.floor(rng() * 5)], 0.95);
    g.fill();
    g.fillStyle = L.color;
  }
}

function midway(g, w, h, rng, L, out) {
  g.fillStyle = L.color;
  bigtop(g, out, rng, L, 300, 210, 100);
  bigtop(g, out, rng, L, 1280, 360, 170);
  bigtop(g, out, rng, L, 1790, 280, 130);
  bigtop(g, out, rng, L, 2130, 200, 96);
  helter(g, out, rng, L, 1010, 250);
  ferris(g, out, rng, L, 700, 205);
  bunting(g, rng, 1010, GROUND - 244, 1280, GROUND - 216);
  bunting(g, rng, 1280, GROUND - 216, 1790, GROUND - 176);
  g.fillStyle = L.color; // the ground, lit along its edge by the bulbs of the stalls, and a strip of dark below it
  g.fillRect(0, GROUND, w, h - GROUND);
  g.fillStyle = lin(g, 0, GROUND, 0, GROUND + 30, [[0, rgba(GOLD, 0.34)], [1, rgba(GOLD, 0)]]);
  g.fillRect(0, GROUND, w, 30);
  for (let x = 30; x < w - 20; x += 14 + rng() * 40) if (rng() < 0.8) figure(g, rng, L, x, 20 + rng() * 9);
  uplight(g, (c) => c.rect(0, GROUND - 6, w, 6), GROUND - 6, GROUND, GOLD, 0.4);
  for (let i = 0; i < 12; i++) { // lamps and windows scattered over the tents' walls and the ground
    out.lights.push({ x: 60 + rng() * (w - 120), y: GROUND - 6 - rng() * 30, r: 26 + rng() * 14, color: PARTY[i % 5], mode: i % 3 ? 'pulse' : 'flicker', ph: rng(), a: 0.26 });
  }
  g.fillStyle = L.color;
}

export const MID = { midway };
