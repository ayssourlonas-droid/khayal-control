// Falling pickups: a dark capsule ringed in the power's tint (look.power), with its icon, a pulsing
// glow and turning dashes so it reads as "catch me" on any sky. Icons are shared by the HUD; the
// rim and the icons are the pickup skin (pickup-skins.js).
import { cached, glow, rgba } from './sprites.js';
import { frame, ICONS } from './pickup-skins.js';

// The icon for `kind`, drawn centred on (0, 0) about 30 px across.
export const drawIcon = (g, kind, color) => ICONS[kind](g, color);

const capsule = (kind, color) => cached(`pick${kind}${color}`, 60, 60, (g) => {
  g.translate(30, 30);
  frame(g, color);
  drawIcon(g, kind, color);
});

export function drawPickups(ctx, world, look, t) {
  for (const p of world.pickups) {
    const color = look.power[p.kind] ?? '#ffffff';
    const y = p.y + Math.sin(t * 4 + p.x) * 3;
    const pulse = 0.55 + 0.25 * Math.sin(t * 6 + p.x);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = pulse;
    ctx.drawImage(glow(color), p.x - 56, y - 56, 112, 112);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const a = t * 2.4 + (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.arc(p.x, y, 33, a, a + 0.7);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(capsule(p.kind, color), p.x - 30, y - 30);
  }
}
