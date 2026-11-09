// The broadside's shots in Sunset Armada (lasers-view.js hands them here): iron cannon balls flying out of the
// ship's flanks, each trailing a short plume of powder smoke with a hot streak in it. A ball is dark with a
// thin gold rim and a glint, so it reads on the bright sunset sky and on the violet at the top of it. Shots
// of the escorts and of the ship's front guns are the ship's own streaks.
import { INK, cached, rad, rgba, glow, soft } from './sprites.js';
import { TAU } from '../core/math.js';

// The ball, 32 x 32: an iron sphere lit from above and the front, a gold ring round it, a white glint.
const ball = () => cached('armadaBall', 32, 32, (g) => {
  g.beginPath();
  g.arc(16, 16, 12, 0, TAU);
  g.fillStyle = INK;
  g.fill();
  g.beginPath();
  g.arc(16, 16, 10, 0, TAU);
  g.fillStyle = rad(g, 16, 16, 0, 11, [[0, '#9aa0bc'], [0.45, '#4a4e68'], [1, '#12121e']], 12, 11);
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = rgba('#ffc86a', 0.95);
  g.beginPath();
  g.arc(16, 16, 10.6, 0, TAU);
  g.stroke();
  g.fillStyle = rgba('#ffffff', 0.9);
  g.beginPath();
  g.ellipse(12, 11.6, 2.8, 1.8, -0.6, 0, TAU);
  g.fill();
});

export const warmBalls = ball; // paint the ball, so it is not baked at the first broadside (warm-armada.js)

const PUFFS = 6;
const GAP = 15; // px between one puff of the trail and the next

// Every side shot as a ball with its plume, flying along x (p.broadside is -1 or 1): the smoke first, in
// the dusky violet-grey of powder smoke at dusk, shrinking toward the tail; then the hot streak; then the
// ball over them.
export function drawBalls(ctx, shots, t) {
  const b = ball();
  for (const p of shots) {
    if (!p.broadside) continue;
    const dir = p.broadside;
    for (let k = PUFFS; k >= 1; k--) {
      const r = 9 + k * 1.6 + Math.sin(t * 9 + p.y * 0.1 + k) * 0.8;
      ctx.globalAlpha = 0.85 * (1 - k * (1 / (PUFFS + 1)));
      ctx.drawImage(soft('#3a2a54'), p.x - dir * k * GAP - r, p.y - r - k * 0.6, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.8;
    for (let k = 1; k <= 3; k++) {
      const r = 11 - k * 2.2;
      ctx.drawImage(glow('#ff9a3a'), p.x - dir * k * 8 - r, p.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(b, p.x - 14, p.y - 14, 28, 28);
  }
  ctx.globalAlpha = 1;
}
