// The player's fighter: a chrome hull with a dark outline (it reads on any sky), wing-tip lights in
// the world's accent, twin engine flames that stretch when it climbs, a fading wake behind its
// motion, a roll into every sideways move, a shield bubble, and a blink while invulnerable. World 13's
// wingmen and side guns are drawn with it (ship-armada.js), world 15's pearls (ship-deep.js) and world 16's mirror
// twin (ship-glass.js); world 18's side guns are coil emitters (ship-storm.js).
// Stateless: everything comes from the ship's position, velocity and t.
import { INK, rgba, glow, star, addGlow } from './sprites.js';
import { clamp, TAU } from '../core/math.js';
import { SHIP_SPEED } from '../core/ship.js';
import { drawEscorts, drawGunPorts } from './ship-armada.js';
import { drawPearls } from './ship-deep.js';
import { drawTwin } from './ship-glass.js';
import { drawCoilPorts } from './ship-storm.js';
import { STORM_WORLD } from './storm-bolt.js';

// `alpha` is the ship's own (0.3 while it blinks), so the flames blink with it.
function flames(ctx, s, accent, t, alpha) {
  const climb = clamp(-s.vy / SHIP_SPEED, 0, 1);
  ctx.globalCompositeOperation = 'lighter';
  for (const nx of [-9, 9]) {
    const len = 26 + climb * 26 + Math.sin(t * 43 + nx) * 5;
    ctx.globalAlpha = 0.9 * alpha;
    ctx.drawImage(glow(accent), s.x + nx - 10, s.y + 26, 20, len);
    ctx.drawImage(glow('#ffffff'), s.x + nx - 5, s.y + 26, 10, len * 0.45);
  }
  // the wake: ghosts of the engine glow where the ship just was
  const speed = Math.hypot(s.vx, s.vy);
  if (speed > 60) {
    for (let k = 1; k <= 5; k++) {
      const d = k * 0.028;
      ctx.globalAlpha = 0.22 * (1 - k / 6) * Math.min(1, speed / SHIP_SPEED) * alpha;
      ctx.drawImage(glow(accent), s.x - s.vx * d - 16, s.y + 30 - s.vy * d - 16, 32, 32);
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function hull(ctx, bank, accent) {
  const wing = (side) => 1 - 0.32 * Math.max(0, bank * side) + 0.06 * Math.max(0, -bank * side);
  const lit = clamp(-0.3 + bank * 0.5, -0.8, 0.8); // where the highlight sits across the hull
  const metal = ctx.createLinearGradient(-40, 0, 40, 0);
  metal.addColorStop(0, '#4a5468');
  metal.addColorStop(clamp(0.45 + lit * 0.3, 0.05, 0.9), '#f2f6ff');
  metal.addColorStop(1, '#6a7488');
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  for (const side of [-1, 1]) { // wings
    const k = wing(side);
    ctx.beginPath();
    ctx.moveTo(side * 6, -12);
    ctx.lineTo(side * 40 * k, 16);
    ctx.lineTo(side * 38 * k, 27);
    ctx.lineTo(side * 10, 22);
    ctx.closePath();
    ctx.fillStyle = metal;
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(side * 12, 6);
    ctx.lineTo(side * 34 * k, 21);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
  }
  ctx.beginPath(); // fuselage
  ctx.moveTo(0, -46);
  ctx.lineTo(9, -18);
  ctx.lineTo(12, 14);
  ctx.lineTo(8, 31);
  ctx.lineTo(-8, 31);
  ctx.lineTo(-12, 14);
  ctx.lineTo(-9, -18);
  ctx.closePath();
  ctx.fillStyle = metal;
  ctx.fill();
  ctx.stroke();
  const glass = ctx.createLinearGradient(0, -26, 0, -2);
  glass.addColorStop(0, '#e8fbff');
  glass.addColorStop(0.4, accent);
  glass.addColorStop(1, '#0a1428');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.ellipse(lit * 2, -13, 4.5, 11, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.fillRect(-11, 24, 22, 7); // engine block
  return [wing(-1), wing(1)];
}

function shield(ctx, s, color, t, left) {
  const fade = left < 2 && Math.floor(t * 10) % 2 ? 0.45 : 1;
  addGlow(ctx, glow(color), s.x, s.y, 74, 0.38 * fade);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = rgba(color, 0.7 * fade);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 50, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = rgba('#ffffff', 0.55 * fade);
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const a = t * 1.6 + (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 50, a, a + 0.35);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}

export function drawShip(ctx, world, look, t) {
  const s = world.ship;
  if (!s.alive || s.lives <= 0) return;
  const accent = look.palette.accent;
  const blink = s.invuln > 0 && Math.floor(t * 14) % 2 === 0;
  const alpha = blink ? 0.3 : 1;
  ctx.globalAlpha = alpha;
  addGlow(ctx, glow(accent), s.x, s.y + 4, 64, blink ? 0.12 : 0.3);
  flames(ctx, s, accent, t, alpha);
  drawEscorts(ctx, s, look, t, alpha);
  drawPearls(ctx, s, look, t, alpha);
  drawTwin(ctx, s, look, t, alpha);
  ctx.globalAlpha = alpha;
  const bank = clamp(s.vx / SHIP_SPEED, -1, 1);
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(bank * 0.1);
  ctx.scale(1 - 0.14 * Math.abs(bank), 1);
  const [wl, wr] = hull(ctx, bank, accent);
  if (s.broadside > 0) (look.world === STORM_WORLD ? drawCoilPorts(ctx, s, t, look) : drawGunPorts(ctx, s, t)); // brass ports in world 13, coil emitters in world 18
  ctx.restore();
  const tip = 0.6 + 0.4 * Math.sin(t * 6);
  addGlow(ctx, star(accent), s.x - 38 * wl, s.y + 22, 10, tip * alpha);
  addGlow(ctx, star(accent), s.x + 38 * wr, s.y + 22, 10, tip * alpha);
  ctx.globalAlpha = 1;
  if (s.power?.kind === 'shield') shield(ctx, s, look.power.shield, t, s.power.left);
}
