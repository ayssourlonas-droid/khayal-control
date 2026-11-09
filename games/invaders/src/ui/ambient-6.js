// Ambient kinds of Ember Carnival (same contract as ambient.js): confetti tumbling through the lit air, a
// scrap at a time, each flipping over so it flashes as it turns; and sky lanterns, paper lamps let go from the
// fair that climb slowly through the smoke, swaying, each a warm glow behind its ribbed paper. The embers,
// the smoke wisps and the stars are the older kinds (ambient.js, ambient-5.js).
import { W, H, hash, wrap, cached, byColor, glow, rgba, shade, lin, rad } from './sprites.js';
import { TAU } from '../core/math.js';

// A scrap of confetti, 14 x 10: a paper rectangle, light along the top edge and shaded along the bottom.
export const scrap = byColor((color) => cached('carnScrap' + color, 14, 10, (g) => {
  g.fillStyle = color;
  g.fillRect(1, 1, 12, 8);
  g.fillStyle = 'rgba(255,255,255,0.45)';
  g.fillRect(1, 1, 12, 3);
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(1, 7, 12, 2);
}));

// Scraps drifting down at their own pace, swaying, turning end over end; the flip makes each one thin and
// dim edge-on and bright when it faces us.
function confetti(ctx, a, t, drift) {
  const [s0, s1] = a.size;
  for (let i = 0; i < a.n; i++) {
    const h = hash(i * 5 + 11);
    const ph = hash(i * 5 + 15) * TAU;
    const size = s0 + (s1 - s0) * hash(i * 5 + 14);
    const y = wrap(hash(i * 5 + 13) * H + t * a.speed * (0.6 + 0.8 * h), -20, H + 20);
    const x = wrap(hash(i * 5 + 12) * (W + 200) - 100 + drift * 0.4 + Math.sin(t * 0.9 + ph) * 40 + y * 0.04, -100, W + 100);
    const flip = Math.cos(t * (3 + h * 4) + ph);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * (0.8 + h) + ph);
    ctx.scale(size / 12, (size / 12) * flip);
    ctx.globalAlpha = a.alpha * (0.5 + 0.5 * Math.abs(flip));
    ctx.drawImage(scrap(a.colors[i % a.colors.length]), -7, -5);
    ctx.restore();
  }
}

export const LANTERN = { w: 40, h: 56 };
// A sky lantern, 40 x 56: a paper envelope swelling from a narrow top to a belly and in again to the rim,
// glowing hottest low down where the flame is, ribbed, edged in ink, with a dark ring round its mouth.
export const lantern = byColor((color) => cached('carnLantern' + color, LANTERN.w, LANTERN.h, (g) => {
  g.beginPath();
  g.moveTo(14, 4);
  g.quadraticCurveTo(2, 10, 3, 30);
  g.quadraticCurveTo(4, 44, 12, 48);
  g.lineTo(28, 48);
  g.quadraticCurveTo(36, 44, 37, 30);
  g.quadraticCurveTo(38, 10, 26, 4);
  g.closePath();
  g.fillStyle = rad(g, 20, 40, 1, 30, [[0, '#fff6c8'], [0.35, shade(color, 0.35)], [1, shade(color, -0.45)]]);
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = rgba('#3a1000', 0.4);
  g.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    g.beginPath();
    g.moveTo(20, 4);
    g.quadraticCurveTo(20 + i * 12, 26, 20 + i * 5, 48);
    g.stroke();
  }
  g.restore();
  g.lineWidth = 1.4;
  g.strokeStyle = rgba('#2a0a00', 0.85);
  g.stroke();
  g.fillStyle = lin(g, 0, 47, 0, 53, [[0, '#4a2810'], [1, '#1c0c04']]);
  g.fillRect(11, 47, 18, 5);
  g.fillStyle = rgba('#fff0b0', 0.9);
  g.fillRect(17, 46, 6, 2.4);
}));

// Lanterns climbing, a few at a time, each at its own height and pace, swaying and breathing as the flame
// gutters; they fade in at the foot of the frame and out at the top.
function lanterns(ctx, a, t) {
  const [s0, s1] = a.size;
  for (let i = 0; i < a.n; i++) {
    const h = hash(i * 5 + 11);
    const ph = hash(i * 5 + 15) * TAU;
    const w = s0 + (s1 - s0) * hash(i * 5 + 14);
    const y = wrap(hash(i * 5 + 13) * (H + 200) - t * a.speed * (0.6 + h * 0.8), -100, H + 100);
    const x = wrap(hash(i * 5 + 12) * W + Math.sin(t * 0.35 + ph) * 36 + (H - y) * 0.06, -60, W + 60);
    const fade = Math.min(1, (H + 80 - y) / 160, (y + 80) / 200);
    const lit = 0.75 + 0.25 * Math.sin(t * 7 + ph * 3) * Math.sin(t * 3.1 + ph);
    const color = a.colors[i % a.colors.length];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.5 + ph) * 0.07);
    ctx.globalAlpha = a.alpha * fade;
    ctx.drawImage(lantern(color), -w / 2, -w * 0.7, w, w * 1.4);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.5 * fade * lit;
    ctx.drawImage(glow(color), -w * 2, -w * 1.7, w * 4, w * 4);
    ctx.restore();
  }
}

// Paint the sprites a look's entries draw, so none is baked mid-fight (warm-carnival.js).
export function warmConfetti(look) {
  for (const a of look.ambient) {
    if (a.kind === 'confetti') a.colors.forEach((c) => scrap(c));
    if (a.kind === 'lanterns') a.colors.forEach((c) => lantern(c));
  }
}

export const AMBIENT6 = { confetti, lanterns };
