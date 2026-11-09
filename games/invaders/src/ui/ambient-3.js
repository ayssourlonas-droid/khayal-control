// Ambient kinds of Aurora Kingdom (same contract as ambient.js): the snow, in layers, from specks far
// off to tumbling crystals close to the glass.
import { W, H, hash, soft, wrap, cached, rgba } from './sprites.js';
import { TAU } from '../core/math.js';

// Snow falling and swaying, leaning into the wind: specks (squares) when small, soft discs when not.
function snow(ctx, a, t, drift) {
  const [s0, s1] = a.size;
  for (let i = 0; i < a.n; i++) {
    const h = hash(i * 5 + 11);
    const size = s0 + (s1 - s0) * hash(i * 5 + 14);
    const y = wrap(hash(i * 5 + 13) * H + t * a.speed * (0.55 + 0.7 * h), -20, H + 20);
    const x = wrap(hash(i * 5 + 12) * (W + 200) - 100 + drift * (0.3 + 0.4 * h) + Math.sin(t * 0.6 + h * TAU) * (14 + size * 5), -100, W + 100);
    const color = a.colors[i % a.colors.length];
    ctx.globalAlpha = a.alpha * (0.6 + 0.4 * hash(i * 5 + 15));
    if (size < 3) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, size);
    } else ctx.drawImage(soft(color), x - size, y - size, size * 2, size * 2);
  }
}

// A six-armed snowflake, 64 px: each arm forked twice, a soft heart.
const crystal = (color) => cached('snowflake' + color, 64, 64, (g) => {
  g.translate(32, 32);
  g.lineCap = 'round';
  g.strokeStyle = color;
  g.lineWidth = 2.6;
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    g.save();
    g.rotate((i * TAU) / 6);
    g.moveTo(0, 0);
    g.lineTo(0, -28);
    for (const [y, len] of [[-10, 9], [-19, 6]]) {
      g.moveTo(0, y);
      g.lineTo(-len * 0.8, y - len * 0.7);
      g.moveTo(0, y);
      g.lineTo(len * 0.8, y - len * 0.7);
    }
    g.restore();
  }
  g.stroke();
  g.fillStyle = rgba(color, 0.5);
  g.beginPath();
  g.arc(0, 0, 5, 0, TAU);
  g.fill();
});

// Big flakes close to the viewer: turning as they fall, tumbling edge-on now and then.
function flakes(ctx, a, t, drift) {
  const [s0, s1] = a.size;
  for (let i = 0; i < a.n; i++) {
    const h = hash(i * 5 + 11);
    const size = s0 + (s1 - s0) * hash(i * 5 + 14);
    const y = wrap(hash(i * 5 + 13) * H + t * a.speed * (0.6 + 0.6 * h), -40, H + 40);
    const x = wrap(hash(i * 5 + 12) * (W + 200) - 100 + drift * 0.8 + Math.sin(t * 0.9 + h * TAU) * 46, -100, W + 100);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * (0.4 + h * 0.5) * (i % 2 ? 1 : -1) + h * TAU);
    ctx.scale((size / 64) * (0.35 + 0.65 * Math.abs(Math.cos(t * 0.8 + h * 9))), size / 64);
    ctx.globalAlpha = a.alpha;
    ctx.drawImage(crystal(a.colors[i % a.colors.length]), -32, -32);
    ctx.restore();
  }
}

export const AMBIENT3 = { snow, flakes };
