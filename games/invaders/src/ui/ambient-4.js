// Ambient kinds of Starlit Archive (same contract as ambient.js): pages from the stacks drifting on the
// air, turning over as they go. flourish-6.js borrows the page for its gust.
import { W, H, hash, wrap, cached, byColor, lin, rgba } from './sprites.js';
import { TAU } from '../core/math.js';

// A loose page, 32 x 40: foxed parchment, a dark edge, ruled lines of script with a gilt capital, and the
// lower corner curling up toward the reader.
export const pageSprite = byColor((color) => cached('page' + color, 32, 40, (g) => {
  g.beginPath();
  g.moveTo(3, 3);
  g.quadraticCurveTo(16, 1, 29, 2);
  g.lineTo(30, 30);
  g.lineTo(24, 38);
  g.lineTo(3, 37);
  g.closePath();
  g.fillStyle = lin(g, 3, 3, 29, 38, [[0, '#ffffff'], [0.25, color], [1, '#a08850']]);
  g.fill();
  g.fillStyle = rgba('#8a6a2a', 0.18); // foxing
  for (const [x, y, r] of [[9, 28, 3.2], [24, 10, 2.4], [14, 8, 1.6]]) {
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  }
  g.strokeStyle = rgba('#3a2a10', 0.5);
  g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    g.moveTo(6 + (i ? 0 : 6), 9 + i * 4.4);
    g.lineTo(26 - (i % 3) * 3, 9 + i * 4.4);
  }
  g.stroke();
  g.fillStyle = '#c8902a';
  g.fillRect(6, 7.4, 4.6, 4.6);
  g.beginPath(); // the curl
  g.moveTo(24, 38);
  g.lineTo(30, 30);
  g.lineTo(21, 31);
  g.closePath();
  g.fillStyle = rgba('#fff6d8', 0.9);
  g.fill();
  g.strokeStyle = rgba('#2a1c08', 0.7);
  g.beginPath();
  g.moveTo(3, 3);
  g.quadraticCurveTo(16, 1, 29, 2);
  g.lineTo(30, 30);
  g.lineTo(24, 38);
  g.lineTo(3, 37);
  g.closePath();
  g.stroke();
}));

// Pages falling and drifting on the wind, each turning to its own beat: a face, then edge-on, then the back
// of it, dimmer.
function pages(ctx, a, t, drift) {
  const [s0, s1] = a.size;
  for (let i = 0; i < a.n; i++) {
    const h = hash(i * 5 + 11);
    const size = s0 + (s1 - s0) * hash(i * 5 + 14);
    const y = wrap(hash(i * 5 + 13) * H + t * a.speed * (0.55 + 0.7 * h), -40, H + 40);
    const x = wrap(hash(i * 5 + 12) * (W + 200) - 100 + drift * (0.5 + 0.4 * h) + t * 16 + Math.sin(t * 0.7 + h * TAU) * 60, -100, W + 100);
    const flip = Math.cos(t * (0.9 + h * 1.4) + h * 9);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.8 + h * 7) * 0.7 + h * 2);
    ctx.scale((size / 28) * flip, size / 28);
    ctx.globalAlpha = a.alpha * (flip > 0 ? 1 : 0.6) * (0.4 + 0.6 * Math.abs(flip) ** 0.5);
    ctx.drawImage(pageSprite(a.colors[i % a.colors.length]), -16, -20);
    ctx.restore();
  }
}

export const AMBIENT4 = { pages };
