// Beams: the enemy laser (a harmless dashed warning line that brightens over its 0.8 s, then the
// burning beam along the same line, laserSegment from the core), the ship's own laser power, and
// the ship's shots (bright streaks along their flight, batched into a few strokes).
import { rgba, glow, star } from './sprites.js';
import { strip } from './bullet-sprites.js';
import { laserSegment, LASER_WARN } from '../core/patterns.js';
import { MUZZLE } from '../core/ship.js';

function warning(ctx, b, s, color, t) {
  const k = 1 - b.warn / LASER_WARN;
  ctx.setLineDash([18, 14]);
  ctx.lineDashOffset = -t * 160;
  ctx.strokeStyle = rgba(color, 0.3 + 0.55 * k * (0.75 + 0.25 * Math.sin(t * 40)));
  ctx.lineWidth = 2 + k * 2;
  ctx.beginPath();
  ctx.moveTo(s.x1, s.y1);
  ctx.lineTo(s.x2, s.y2);
  ctx.stroke();
  ctx.setLineDash([]);
  const r = 10 + 34 * k;
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(glow(color), s.x1 - r, s.y1 - r, r * 2, r * 2);
  ctx.globalCompositeOperation = 'source-over';
}

function beam(ctx, b, s, color, rim, t) {
  const fade = Math.min(1, b.life / 0.12);
  const wob = Math.sin(t * 60) * 2;
  const line = (w, style) => {
    ctx.lineWidth = w;
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
  };
  ctx.lineCap = 'round';
  line(26 + wob, rgba(rim, 0.6 * fade));
  ctx.globalCompositeOperation = 'lighter';
  line(54 + wob * 2, rgba(color, 0.2 * fade));
  line(18 + wob, rgba(color, 0.85 * fade));
  line(6, rgba('#ffffff', 0.95 * fade));
  ctx.globalAlpha = fade;
  ctx.drawImage(glow(color), s.x1 - 54, s.y1 - 54, 108, 108);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'butt';
}

export function drawLasers(ctx, world, look, t) {
  const { enemy, enemyRim } = look.palette;
  for (const b of world.bullets) {
    if (b.pattern !== 'laser' || b.life <= 0) continue;
    const s = laserSegment(b);
    if (b.warn > 0) warning(ctx, b, s, enemy, t);
    else beam(ctx, b, s, enemy, enemyRim, t);
  }
}

// The ship's laser power: a column from the muzzle to the top of the frame while it burns.
export function drawBeam(ctx, world, look, t) {
  const s = world.ship;
  if (!s.beam || !s.alive) return;
  const color = look.palette.beam;
  const top = s.y - MUZZLE;
  const w = 30 + Math.sin(t * 50) * 3;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.35;
  ctx.drawImage(strip(color), s.x - w * 1.6, 0, w * 3.2, top);
  ctx.globalAlpha = 1;
  ctx.drawImage(strip(color), s.x - w / 2, 0, w, top);
  ctx.drawImage(glow(color), s.x - 40, top - 40, 80, 80);
  ctx.drawImage(star('#ffffff'), s.x - 22, top - 22, 44, 44);
  ctx.globalCompositeOperation = 'source-over';
}

// Ship shots: a soft coloured streak, a white core, a glow at the head.
export function drawShots(ctx, world, look) {
  const shots = world.shots;
  if (!shots.length) return;
  const color = look.palette.shot;
  const path = (len) => {
    ctx.beginPath();
    for (const p of shots) {
      const v = Math.hypot(p.vx, p.vy) || 1;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - (p.vx / v) * len, p.y - (p.vy / v) * len);
    }
  };
  ctx.lineCap = 'round';
  path(27); // a dark under-stroke keeps the streak readable on a bright sky
  ctx.strokeStyle = 'rgba(10,12,22,0.55)';
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  path(34);
  ctx.strokeStyle = rgba(color, 0.35);
  ctx.lineWidth = 12;
  ctx.stroke();
  path(26);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  const g = glow(color);
  for (const p of shots) ctx.drawImage(g, p.x - 14, p.y - 14, 28, 28);
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'butt';
}
