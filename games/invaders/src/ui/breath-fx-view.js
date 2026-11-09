// Two particle kinds of the breath's fx (world 17, fx/react-breath.js), drawn from the breath's own sprites (breath-sprites.js):
//   'leaf'     a leaf rising from the foot of the field as the breath starts: it turns and tips over as it climbs, one of the
//              twelve leaves (the particle's `shape`), half its `size` wide, fading in its last third (fx-view.js plain pass)
//   'twinkle'  a four-point star, white or pale mint (the particle's `shape` 0 or 1), where a bullet was wiped or in the
//              rising air, shrinking as it fades (fx-view.js's additive pass, composite 'lighter' already set)
// Both only read the particle; the transform and alpha are restored (a leaf saves and restores its own).
import { breathKit } from './breath-sprites.js';

export function drawLeaf(ctx, p) {
  const age = p.max - p.life;
  const s = p.size * 2;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(age * 5 + p.shape * 0.9 + p.vx * 0.01);
  ctx.scale(0.3 + 0.7 * Math.abs(Math.cos(age * 6 + p.shape)), 1);
  ctx.drawImage(breathKit().leaves[p.shape], -s / 2, -s / 2, s, s);
  ctx.restore();
}

export function drawTwinkle(ctx, p) {
  const s = p.size * 2 * (0.4 + 0.6 * (p.life / p.max));
  ctx.drawImage(breathKit().twinkles[p.shape], p.x - s / 2, p.y - s / 2, s, s);
}
