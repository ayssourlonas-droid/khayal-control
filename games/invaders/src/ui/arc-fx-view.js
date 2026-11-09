// The electric arcs of world 18's fx (fx/react-storm.js adds them, fx-view.js hands them here). An arc is ONE ring of kind
// 'arc' that draws itself from its age, so no particle is spent: n jagged bolts leave (x, y) in a fan (ang +- spread), reaching
// r.r px as the ring eases out to maxR, each a halo, a line of its colour and a white thread, re-kinked about twenty-four times
// a second so they crackle, and fading as the ring ends. A bolt's own length and direction are a hash of the seed. Straight
// paths only; no shadow blur, no allocation.
import { hash } from './sprites.js';
import { arcPath } from './storm-bolt.js';

const KINKS = 24; // new shapes a second

export function drawArc(ctx, r) {
  const u = 1 - r.life / r.max;
  const fade = 1 - u;
  const step = Math.floor(u * r.max * KINKS);
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < r.n; i++) {
    const a = r.ang + (hash(r.seed * 7 + i * 13) * 2 - 1) * r.spread;
    const len = Math.max(4, r.r) * (0.55 + 0.45 * hash(r.seed + i * 5));
    ctx.beginPath();
    arcPath(ctx, r.x, r.y, r.x + Math.cos(a) * len, r.y + Math.sin(a) * len, 5, len * 0.13, r.seed * 31 + i * 17 + step * 3);
    ctx.strokeStyle = r.color;
    ctx.globalAlpha = 0.3 * fade;
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.globalAlpha = 0.95 * fade;
    ctx.lineWidth = 3.4;
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = fade;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
