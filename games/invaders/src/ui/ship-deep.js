// What Lantern Deep adds to the player's ship (ship-view.js draws it): the pearls, three of them circling the ship
// for the power's 10 s, each glowing, with a short comet tail of pearly light behind it along its orbit. They are
// drawn exactly where the core says they are (core/pearls.js pearlsOf, the same places the blocking is done at),
// at the size the core blocks with (PEARL_R), and fade in as the power starts and out as it ends (blinking in its
// last two seconds, as the shield and the wingmen do). `alpha` is the ship's own (it blinks while invulnerable) and
// goes down to every part of a pearl: its halo, its tail, its body and its glint. A blocked bullet flares the
// pearl and a hit sparks the alien: those are fx (fx/react-deep.js).
import { INK, rgba, cached, rad, lin, glow, star } from './sprites.js';
import { clamp, TAU } from '../core/math.js';
import { pearlsOf, PEARL_R } from '../core/pearls.js';
import { powerTime } from '../core/powerups.js';

const COME = 0.35; // s the pearls take to fade in when the power starts, and out at its end
const TRAIL = 9; // ghosts in a pearl's tail
const STEP = 0.11; // rad of the orbit between one ghost and the next
const R = 20; // px, the baked pearl's radius in its 64 px sprite
const PINK = '#ffd8f0';
const AQUA = '#5af0ff';

// The pearl, 64 x 64 and 20 px in radius: a soft sphere lit from the upper left, white in the middle going to
// lavender and then to a blue shade at the rim, bands of rose, aqua and mint swimming over it (the oil-slick
// sheen of nacre), a dark rim of water round it so it holds against a pale shaft, and two highlights.
const pearl = () => cached('deepPearl', 64, 64, (g) => {
  g.beginPath();
  g.arc(32, 32, R + 1.6, 0, TAU);
  g.fillStyle = rgba(INK, 0.5);
  g.fill();
  g.beginPath();
  g.arc(32, 32, R, 0, TAU);
  g.fillStyle = rad(g, 32, 32, 0, R * 1.2, [[0, '#ffffff'], [0.3, '#fff2fa'], [0.6, '#e6cdf4'], [0.86, '#a8b8e8'], [1, '#6a86c0']], 25, 24);
  g.fill();
  g.save();
  g.clip();
  g.lineWidth = 5;
  for (const [c, a0, a1, r, al] of [[AQUA, 0.1, 1.6, 15, 0.5], ['#ff8ad0', 1.9, 3.1, 14, 0.38], ['#b8ffd8', 3.5, 4.5, 16, 0.32], ['#b8a0ff', 4.8, 5.8, 13, 0.3]]) {
    g.strokeStyle = rgba(c, al);
    g.beginPath();
    g.arc(32, 32, r, a0, a1);
    g.stroke();
  }
  g.fillStyle = lin(g, 20, 14, 44, 52, [[0, rgba('#ffffff', 0.5)], [0.5, rgba('#ffffff', 0)], [1, rgba('#2a3a7a', 0.35)]]);
  g.fillRect(0, 0, 64, 64);
  g.restore();
  g.lineWidth = 1.2;
  g.strokeStyle = rgba('#9ae8ff', 0.7);
  g.beginPath();
  g.arc(32, 32, R - 0.4, 0, TAU);
  g.stroke();
  g.fillStyle = rgba('#ffffff', 0.95);
  g.beginPath();
  g.ellipse(24.6, 22.6, 5.6, 3.4, -0.7, 0, TAU);
  g.fill();
  g.fillStyle = rgba(AQUA, 0.8);
  g.beginPath();
  g.ellipse(40.6, 41.4, 2.6, 1.6, -0.7, 0, TAU);
  g.fill();
});

// Paint the pearl and its two glows now, so none is baked at the first pickup (warm-deep.js).
export function warmPearls() {
  pearl();
  glow(PINK);
  glow(AQUA);
  glow('#bff4ff');
  star('#ffffff');
}

// How far the pearls have come (0 when the power starts or ends, 1 in between) and their blink in the last 2 s.
function appear(left, t) {
  const k = Math.min(clamp((powerTime('pearls') - left) / COME, 0, 1), clamp(left / COME, 0, 1));
  const eased = k * k * (3 - 2 * k);
  return left < 2 && Math.floor(t * 10) % 2 ? eased * 0.45 : eased;
}

// A pearl's tail: ghosts of its glow back along the orbit it came from, shrinking and thinning, rose near the pearl
// and aqua farther back. The ship's own place is the orbit's centre.
function tail(ctx, s, p, a) {
  const [dx, dy] = [p.x - s.x, p.y - s.y];
  const r = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);
  for (let j = TRAIL; j >= 1; j--) {
    const f = 1 - j / (TRAIL + 1);
    const at = ang - j * STEP;
    const size = 4 + PEARL_R * 1.15 * f;
    ctx.globalAlpha = 0.9 * f ** 1.2 * a;
    ctx.drawImage(glow(j > 3 ? AQUA : PINK), s.x + Math.cos(at) * r - size, s.y + Math.sin(at) * r - size, size * 2, size * 2);
  }
}

export function drawPearls(ctx, s, look, t, alpha) {
  const list = pearlsOf(s);
  if (!list.length) return;
  const a = alpha * appear(s.power.left, t);
  if (a <= 0.01) return;
  const body = pearl();
  const size = (64 * PEARL_R) / R;
  ctx.save();
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    ctx.globalCompositeOperation = 'lighter';
    tail(ctx, s, p, a);
    ctx.globalAlpha = 0.68 * a;
    ctx.drawImage(glow(PINK), p.x - PEARL_R * 2.3, p.y - PEARL_R * 2.3, PEARL_R * 4.6, PEARL_R * 4.6);
    ctx.globalAlpha = 0.26 * a;
    ctx.drawImage(glow(AQUA), p.x - PEARL_R * 3.2, p.y - PEARL_R * 3.2, PEARL_R * 6.4, PEARL_R * 6.4);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = a;
    ctx.drawImage(body, p.x - size / 2, p.y - size / 2, size, size);
    ctx.globalCompositeOperation = 'lighter';
    const glint = 0.55 + 0.45 * Math.sin(t * 5 + i * 2.1); // a sparkle that wanders across the nacre
    ctx.globalAlpha = 0.8 * glint * a;
    const [gx, gy] = [p.x - 4.5 + Math.cos(t * 1.7 + i) * 3, p.y - 5 + Math.sin(t * 1.7 + i) * 2];
    ctx.drawImage(star('#ffffff'), gx - 7, gy - 7, 14, 14);
  }
  ctx.restore();
}
