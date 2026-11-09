// Effects on the whole frame: full-frame flashes and the bullet-time tint.
import { W, H } from './sprites.js';
import { flashK } from '../fx/fx.js';

// Full-frame flashes (bombs, boss deaths, bullet time) and the bullet-time tint.
export function drawScreenFx(ctx, fx) {
  ctx.globalCompositeOperation = 'lighter';
  for (const f of fx.flashes) {
    if (!f.full) continue;
    ctx.globalAlpha = Math.min(0.9, f.alpha * flashK(f));
    ctx.fillStyle = f.color;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  if (fx.bulletTime) {
    ctx.fillStyle = 'rgba(0,30,12,0.28)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(40,255,120,0.06)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
}
