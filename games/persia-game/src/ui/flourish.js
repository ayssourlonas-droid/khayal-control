// Animated extras, by name in look.flourish, drawn over the sky (before the parallax layers). Pure
// functions of the time t.
import { W, rgba, hash, glow, lighter, normal } from './sprites.js';

// The shooting star's slope: the tail runs `run` right and `rise` up from the head, which moves
// `fall` px/s left and down along it. stars.js draws a shower of the same.
export const SHOOT = { run: 180, rise: 95, fall: [800, 420] };

// Shooting stars: a head with a fading tail, on a timetable.
function shooting(ctx, t) {
  lighter(ctx);
  for (let lane = 0; lane < 2; lane++) {
    const period = 3.1;
    const slot = Math.floor(t / period + lane * 0.5);
    if (hash(slot * 3 + lane) > 0.6) continue;
    const lt = (t / period + lane * 0.5 - slot) * period;
    if (lt > 0.9) continue;
    const x = 300 + hash(slot * 3 + lane + 1) * (W - 300) - lt * SHOOT.fall[0];
    const y = 40 + hash(slot * 3 + lane + 2) * 300 + lt * SHOOT.fall[1];
    const a = Math.min(1, lt * 6) * (1 - lt / 0.9);
    const gr = ctx.createLinearGradient(x, y, x + SHOOT.run, y - SHOOT.rise);
    gr.addColorStop(0, rgba('#ffffff', a));
    gr.addColorStop(1, rgba('#9ab8ff', 0));
    ctx.strokeStyle = gr;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + SHOOT.run, y - SHOOT.rise);
    ctx.stroke();
    ctx.globalAlpha = a;
    ctx.drawImage(glow('#ffffff'), x - 10, y - 10, 20, 20);
    ctx.globalAlpha = 1;
  }
  normal(ctx);
}

const FLOURISH = { shooting };

export function drawFlourishes(ctx, look, t) {
  for (const name of look.flourish) FLOURISH[name](ctx, t);
}
