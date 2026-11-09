// Enemy bullets in the look's colours: the look's own plain bullet (the cabinet's zigzag) for every
// pattern but the laser, which is in lasers-view.js. One glow + one body sprite per bullet; at half
// quality the glow is skipped.
import { glow } from './sprites.js';
import { bulletKit } from './bullet-sprites.js';

// A bullet's own animation offset: its heading and speed, which belong to the bullet (an index into
// the list does not: it shifts whenever an earlier bullet is removed, and every bullet after it would
// jump to another frame).
const phaseOf = (b) => Math.atan2(b.vy, b.vx) * 5 + Math.hypot(b.vx, b.vy) * 0.013;

// The plain bullet in each bullet style (look.bullet).
const PLAIN = {
  pixel: (ctx, K, b, t) => ctx.drawImage(K.zig[Math.floor(t * 10 + phaseOf(b)) & 1], b.x - 10, b.y - 18),
};

export function drawBullets(ctx, world, look, t, quality = 1) {
  const list = world.bullets;
  if (quality >= 1) { // glows under everything, in one additive pass
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.75;
    const g = glow(look.palette.enemy);
    for (const b of list) {
      if (b.pattern === 'laser') continue;
      const r = b.r * 2.8;
      ctx.drawImage(g, b.x - r, b.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  const plain = PLAIN[look.bullet];
  const K = bulletKit(look);
  for (const b of list) if (b.pattern !== 'laser') plain(ctx, K, b, t);
}
