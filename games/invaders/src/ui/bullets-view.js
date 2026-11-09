// Enemy bullets by pattern, in the world's colours: round orbs (or the world's own style: blaster
// bolts, the cabinet's zigzags), drops for rain, pulsing seekers for homing, spinning throwing
// stars, acid; a homing bullet the ship has dragged round (world 18) is drawn as the ship's own (bullets-dragged.js). Lasers are in lasers-view.js. One glow + one body sprite per bullet; at half quality
// the glow is skipped.
import { glow } from './sprites.js';
import { bulletKit } from './bullet-sprites.js';
import { drawDragged } from './bullets-dragged.js';

// A bullet's own animation offset: its heading and speed, which belong to the bullet (an index into
// the list does not: it shifts whenever an earlier bullet is removed, and every star after it would
// snap to a new angle). It drifts smoothly when a homing bullet turns.
const phaseOf = (b) => Math.atan2(b.vy, b.vx) * 5 + Math.hypot(b.vx, b.vy) * 0.013;

// A sprite turned by `angle` round (x, y), `w` px wide; the transform is `m` again afterwards, so the
// bullets drawn after it in plain coordinates land where they are.
function rotated(ctx, m, x, y, angle, sprite, w = sprite.width) {
  const h = (sprite.height * w) / sprite.width;
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
  ctx.setTransform(m);
}
const heading = (vx, vy) => Math.atan2(vy, vx) + Math.PI / 2;

export function drawBullets(ctx, world, look, t, quality = 1) {
  const { enemy } = look.palette;
  const list = world.bullets;
  if (quality >= 1) { // glows under everything, in one additive pass
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.75;
    const g = glow(enemy);
    const mine = glow(look.palette.accent); // a dragged bullet (world 18) glows in the ship's colour
    for (const b of list) {
      if (b.pattern === 'laser') continue;
      const r = b.r * (b.pattern === 'shuriken' ? 2.2 : b.dragged ? 3.4 : 2.8);
      ctx.drawImage(b.pattern === 'acid' ? glow('#b8ff3a') : b.dragged ? mine : g, b.x - r, b.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  const m = ctx.getTransform();
  const style = look.bullet;
  const K = bulletKit(look);
  for (const b of list) {
    const p = b.pattern;
    if (p === 'laser') continue;
    if (p === 'shuriken') rotated(ctx, m, b.x, b.y, t * 9 + phaseOf(b), K.star, 48 * (b.r / 18));
    else if (p === 'rain') rotated(ctx, m, b.x, b.y, heading(b.vx, b.vy), K.drop);
    else if (p === 'acid') rotated(ctx, m, b.x, b.y, heading(b.vx, b.vy || 1), K.acid);
    else if (b.dragged) drawDragged(ctx, m, b, look, t, phaseOf(b), quality); // the ship's now (world 18, bullets-dragged.js)
    else if (p === 'homing') {
      const pulse = 1 + 0.18 * Math.sin(t * 12 + phaseOf(b));
      const s = K.seeker;
      ctx.drawImage(s, b.x - s.width / 2 * pulse, b.y - s.height / 2 * pulse, s.width * pulse, s.height * pulse);
    } else if (style === 'bolt') rotated(ctx, m, b.x, b.y, heading(b.vx, b.vy), K.bolt);
    else if (style === 'pixel') ctx.drawImage(K.zig[Math.floor(t * 10 + phaseOf(b)) & 1], b.x - 10, b.y - 18);
    else ctx.drawImage(K.ball, b.x - K.ball.width / 2, b.y - K.ball.height / 2);
  }
}
