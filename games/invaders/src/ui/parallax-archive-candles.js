// What stands on the gallery's balustrade and floor (parallax-archive-3.js): candles guttering in brass
// holders, braziers on the pedestals, books lying open with their pages catching the light, an inkwell
// with its quill. Each flame is a baked teardrop under a flickering layer light; each open book leaves a
// sign for the flourish that turns its page (flourish-7.js). See parallax-shapes.js for the painter contract.
import { rgba, lin, rad } from './sprites.js';
import { TAU } from '../core/math.js';
import { GOLD, NIGHT, PARCH } from './parallax-archive-kit.js';

const BRASS = ['#6a4410', '#e8b860', '#7a5018'];

// A flame: a teardrop, white at its heart, gold, then a soft orange edge.
function flame(g, x, y, s) {
  g.beginPath();
  g.moveTo(x, y - 13 * s);
  g.bezierCurveTo(x + 6 * s, y - 5 * s, x + 4 * s, y + 3 * s, x, y + 3 * s);
  g.bezierCurveTo(x - 4 * s, y + 3 * s, x - 6 * s, y - 5 * s, x, y - 13 * s);
  g.fillStyle = rad(g, x, y - 1 * s, 0, 8 * s, [[0, '#ffffff'], [0.4, '#fff0b0'], [0.75, '#ffb040'], [1, rgba('#ff7a20', 0.5)]]);
  g.fill();
}

// A candle standing on (x, y), h tall: wax lit on one side, a drip down it, a wick and its flame. A light on
// the flame, and when `halo` is set a broad one round it (one to a group: each is a big blit a frame).
export function candle(g, out, rng, L, x, y, h, s = 1, halo = false) {
  g.fillStyle = lin(g, x - 3.4, 0, x + 3.4, 0, [[0, '#7a6a48'], [0.45, '#f4e8c4'], [1, '#8a7852']]);
  g.fillRect(x - 3.4, y - h, 6.8, h);
  g.fillStyle = '#fff6d8';
  g.beginPath();
  g.ellipse(x, y - h, 3.4, 1.2, 0, 0, TAU);
  g.fill();
  g.fillStyle = rgba('#fff6d8', 0.8);
  g.fillRect(x + 0.6, y - h, 1.6, 4 + rng() * 9);
  g.fillStyle = rgba(NIGHT, 0.8);
  g.fillRect(x - 0.4, y - h - 3, 0.8, 3);
  flame(g, x, y - h - 4, s);
  out.lights.push({ x, y: y - h - 8, r: 38 * s, color: L.flame, mode: 'flicker', ph: rng(), a: 0.9 });
  if (halo) out.lights.push({ x, y: y - h - 8, r: 120 * s, color: L.flame, mode: 'flicker', ph: rng(), a: 0.2 });
}

// A brass candelabra on (x, y): a stepped foot, a stem with a knop, n arms curving up to a candle each.
export function candelabra(g, out, rng, L, x, y, n, h = 44) {
  g.fillStyle = lin(g, x - 14, 0, x + 14, 0, BRASS.map((c, i) => [i / 2, c]));
  g.fillRect(x - 14, y - 4, 28, 4);
  g.fillRect(x - 9, y - 9, 18, 5);
  g.fillRect(x - 2.4, y - h, 4.8, h - 8);
  g.beginPath();
  g.arc(x, y - h * 0.45, 4.6, 0, TAU);
  g.fill();
  g.strokeStyle = '#c8902a';
  g.lineWidth = 2.4;
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const [ax, ay] = [x + u * 22, y - h - 6 + Math.abs(u) * 5];
    g.beginPath();
    g.moveTo(x, y - h * 0.62);
    g.quadraticCurveTo(x + u * 16, y - h * 0.5, ax, ay + 8);
    g.stroke();
    g.fillStyle = BRASS[1];
    g.fillRect(ax - 4.4, ay + 6, 8.8, 3); // the cup
    candle(g, out, rng, L, ax, ay + 6, 13 + rng() * 10, 1, i === n >> 1);
  }
}

// A brazier on its pedestal's top (x, y): a bowl on a stem, a fire in it three tongues high, throwing a great
// glow.
export function brazier(g, out, rng, L, x, y) {
  g.fillStyle = L.color;
  g.beginPath();
  g.moveTo(x - 26, y - 16);
  g.quadraticCurveTo(x - 24, y + 1, x, y + 1);
  g.quadraticCurveTo(x + 24, y + 1, x + 26, y - 16);
  g.closePath();
  g.fill();
  g.fillRect(x - 5, y, 10, 6);
  g.strokeStyle = rgba('#e8b860', 0.7);
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(x - 26, y - 16);
  g.lineTo(x + 26, y - 16);
  g.stroke();
  for (const [dx, s] of [[-9, 1.5], [10, 1.7], [0, 2.4]]) flame(g, x + dx, y - 17, s);
  out.lights.push({ x, y: y - 26, r: 90, color: L.flame, mode: 'flicker', ph: rng(), a: 0.9 });
  out.lights.push({ x, y: y - 30, r: 220, color: L.flame, mode: 'pulse', ph: rng(), a: 0.2 });
}

// A book lying open on the surface at (x, y), w wide: the cover under it, the leaves of each side stacked
// and curving up to the spine, ruled with lines of script, one capital in gilt; the light of the candles on
// the nearer leaf. Leaves a sign when `turn`, for the flourish that lifts a page.
export function openBook(g, out, x, y, w, turn = false) {
  const [hw, lift] = [w / 2, w * 0.2];
  g.fillStyle = lin(g, 0, y - 4, 0, y + 3, [[0, '#8a5a1e'], [1, '#2a1608']]);
  g.fillRect(x - hw - 3, y - 3, w + 6, 4); // the boards the leaves lie on
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(x, y - 2);
    g.quadraticCurveTo(x + s * hw * 0.5, y - lift * 1.1, x + s * hw, y - lift * 0.5);
    g.lineTo(x + s * hw, y - 3);
    g.lineTo(x, y - 1);
    g.closePath();
    g.fillStyle = lin(g, x, 0, x + s * hw, 0, [[0, '#c8b27a'], [0.35, PARCH], [1, '#f6ecd0']]);
    g.fill();
    g.strokeStyle = rgba('#5a4420', 0.45); // the stack of leaves at the foredge
    g.lineWidth = 0.8;
    g.beginPath();
    for (let k = 0; k < 4; k++) {
      g.moveTo(x + s * (hw - 1), y - lift * 0.5 + k * 1.6 - 0.5);
      g.lineTo(x + s * (hw - 7), y - lift * 0.5 + k * 1.6 - 1.4);
    }
    g.stroke();
    g.strokeStyle = rgba('#3a2a10', 0.6); // the script
    g.lineWidth = 0.9;
    g.beginPath();
    for (let k = 0; k < 4; k++) {
      const yy = y - lift * (0.9 - k * 0.2) - 1;
      g.moveTo(x + s * 4, yy);
      g.lineTo(x + s * (hw * (0.8 - (k % 2) * 0.12)), yy - 0.4 * lift * 0.2);
    }
    g.stroke();
    g.fillStyle = rgba(GOLD, 0.9);
    g.fillRect(x + s * 6 - 2, y - lift * 0.95, 3, 3);
  }
  g.strokeStyle = rgba(NIGHT, 0.8);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(x, y - 2);
  g.lineTo(x, y - 0.5);
  g.stroke();
  if (turn) out.signs.push({ book: true, x, y, w });
}

// An inkwell on (x, y): a squat bottle of glossy ink with a teal sheen in it, a quill standing in it.
export function inkwell(g, x, y) {
  g.beginPath();
  g.roundRect(x - 8, y - 12, 16, 12, 4);
  g.fillStyle = '#05050f';
  g.fill();
  g.fillStyle = lin(g, x - 8, y - 12, x + 4, y, [[0, rgba('#4af0d8', 0.5)], [0.4, rgba('#4af0d8', 0)], [1, rgba('#4af0d8', 0.12)]]);
  g.fill();
  g.fillStyle = rgba('#ffffff', 0.5);
  g.fillRect(x - 6, y - 10, 2, 6);
  g.fillStyle = '#1a1a2a';
  g.fillRect(x - 4, y - 16, 8, 4);
  g.strokeStyle = PARCH; // the quill, leaning, its barbs fanning
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(x + 1, y - 15);
  g.lineTo(x + 14, y - 52);
  g.stroke();
  g.fillStyle = rgba(PARCH, 0.85);
  g.beginPath();
  g.moveTo(x + 6, y - 32);
  g.quadraticCurveTo(x + 24, y - 40, x + 16, y - 56);
  g.quadraticCurveTo(x + 18, y - 44, x + 10, y - 40);
  g.fill();
  g.strokeStyle = rgba(NIGHT, 0.6);
  g.lineWidth = 0.8;
  g.stroke();
}
