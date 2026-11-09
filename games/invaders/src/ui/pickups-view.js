// Falling pickups: a dark capsule ringed in the power's tint (look.power), with its icon, a pulsing
// glow and turning dashes so it reads as "catch me" on any sky. Icons are shared by the HUD. Each
// world reskins the capsule's rim and some icons (pickup-skins.js, keyed by look.world).
import { INK, cached, glow, rgba } from './sprites.js';
import { FRAMES, ICONS, disc, ring } from './pickup-skins.js';
import { FAN } from './pickup-icons.js';
import { TAU } from '../core/math.js';

// The icon for `kind` in world `world` (0: the default set), drawn centred on (0, 0) about 30 px across.
export function drawIcon(g, kind, color, world = 0) {
  const own = ICONS[world]?.[kind];
  if (own) {
    own(g, color);
    g.lineCap = 'butt';
    g.lineJoin = 'miter';
    return;
  }
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = 4;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  if (kind === 'spread') {
    for (const a of FAN) {
      g.moveTo(0, 12);
      g.lineTo(Math.sin(a) * 26, 12 - Math.cos(a) * 26);
    }
    g.stroke();
  } else if (kind === 'laser') {
    g.fillRect(-4, -15, 8, 30);
    g.fillStyle = '#ffffff';
    g.fillRect(-1.5, -15, 3, 30);
  } else if (kind === 'rapid') {
    for (const y of [-6, 6]) {
      g.moveTo(-11, y + 6);
      g.lineTo(0, y - 5);
      g.lineTo(11, y + 6);
    }
    g.stroke();
  } else if (kind === 'shield') {
    for (let i = 0; i <= 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 2;
      g.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
    }
    g.stroke();
  } else if (kind === 'homing') { // a shot swinging round onto its mark
    g.moveTo(-11, 14);
    g.quadraticCurveTo(7, 12, 7, -4);
    g.stroke();
    g.beginPath();
    g.moveTo(7, -15);
    g.lineTo(0, -4);
    g.lineTo(14, -4);
    g.fill();
  } else if (kind === 'slow') { // an hourglass with its sand run down
    g.moveTo(-9, -14);
    g.lineTo(9, -14);
    g.lineTo(-9, 14);
    g.lineTo(9, 14);
    g.closePath();
    g.stroke();
    g.beginPath();
    g.moveTo(-6, 11);
    g.lineTo(6, 11);
    g.lineTo(0, 3);
    g.fill();
  } else if (kind === 'life') { // the HUD's little fighter, and a plus
    g.moveTo(-3, -11);
    g.lineTo(1, -1);
    g.lineTo(11, 11);
    g.lineTo(1, 10);
    g.lineTo(-3, 15);
    g.lineTo(-7, 10);
    g.lineTo(-17, 11);
    g.lineTo(-7, -1);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(11, -15);
    g.lineTo(11, -5);
    g.moveTo(6, -10);
    g.lineTo(16, -10);
    g.lineWidth = 3.5;
    g.stroke();
  } else { // bomb
    g.arc(-2, 3, 11, 0, TAU);
    g.fill();
    g.beginPath();
    g.moveTo(5, -6);
    g.quadraticCurveTo(10, -14, 15, -12);
    g.lineWidth = 3;
    g.stroke();
    g.fillStyle = '#fff6c8';
    g.fillRect(13, -16, 5, 5);
  }
  g.lineCap = 'butt';
}

function plainFrame(g, color) {
  disc(g, 24);
  ring(g, 24, color, 4);
  ring(g, 27, INK, 2);
}

const capsule = (kind, color, world) => cached(`pick${kind}${color}${world}`, 60, 60, (g) => {
  g.translate(30, 30);
  (FRAMES[world] ?? plainFrame)(g, color);
  drawIcon(g, kind, color, world);
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
    ctx.drawImage(capsule(p.kind, color, look.world), p.x - 30, y - 30);
  }
}
