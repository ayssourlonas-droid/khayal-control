// Ambient kinds of Sunset Armada (same contract as ambient.js): long wisps of cloud drifting across the sky
// and in front of the field, and gulls riding the air, gliding for a while and then beating their wings. The
// flocks that cross the glare (flourish-8.js) borrow the gull.
import { W, H, hash, wrap, cached, byColor, soft } from './sprites.js';
import { TAU } from '../core/math.js';

// One gull in flight, facing right, 56 x 34, in the wing colour `color`: long narrow wings bent at the
// wrist with dark tips, a small body and a hooked bill, a thin gold edge on the leading edge where the sun
// catches it; frames 0-2 are wings up, level and down. gullSet(color)[frame].
export const gullSet = byColor((color) => [0, 1, 2].map((frame) => cached('gull' + color + frame, 56, 34, (g) => {
  const [wy, ty] = [[9, 3], [13, 15], [20, 30]][frame]; // the wrist and the tip of each wing
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(28, 17);
    g.lineTo(28 + s * 13, wy);
    g.lineTo(28 + s * 26, ty);
    g.quadraticCurveTo(28 + s * 14, wy + 7, 28, 21);
    g.closePath();
    g.fillStyle = color;
    g.fill();
    g.beginPath(); // the black tip
    g.moveTo(28 + s * 19, (wy + ty) * 0.5);
    g.lineTo(28 + s * 26, ty);
    g.lineTo(28 + s * 18, (wy + ty) * 0.5 + 6);
    g.closePath();
    g.fillStyle = '#2a1a48';
    g.fill();
    g.strokeStyle = 'rgba(255,196,100,0.9)';
    g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(28, 17);
    g.lineTo(28 + s * 13, wy);
    g.lineTo(28 + s * 26, ty);
    g.stroke();
  }
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(28, 19, 6.4, 2.8, 0, 0, TAU);
  g.fill();
  g.beginPath();
  g.moveTo(33, 18);
  g.lineTo(40, 18.8);
  g.lineTo(33, 20.4);
  g.fill();
  g.fillStyle = '#e8a050';
  g.fillRect(38, 18.3, 2.4, 1.3);
  g.fillStyle = '#2a1a48';
  g.fillRect(31.6, 17.6, 1.4, 1.4);
})));

// A wisp, 256 x 40: a few soft blots laid in a row, long and thin, with a brighter thread through the middle.
const wisp = byColor((color) => cached('wisp' + color, 256, 40, (g) => {
  for (const [x, y, w, h, a] of [[128, 20, 256, 30, 0.55], [80, 22, 150, 22, 0.7], [180, 18, 130, 20, 0.7], [128, 20, 200, 8, 0.9]]) {
    g.globalAlpha = a;
    g.drawImage(soft(color), x - w * 0.5, y - h * 0.5, w, h);
  }
  g.globalAlpha = 1;
}));

// Wisps of cloud, each at its own height and pace, streaming slowly left; they fade in and out at the frame's
// edges. a.minY and a.maxY (shares of the frame's height, 0 and 1 by default) bound where they float.
function wisps(ctx, a, t, drift) {
  const [s0, s1] = a.size;
  const [lo, hi] = [a.minY ?? 0, a.maxY ?? 1];
  for (let i = 0; i < a.n; i++) {
    const h = hash(i * 5 + 11);
    const size = s0 + (s1 - s0) * hash(i * 5 + 14);
    const x = wrap(hash(i * 5 + 12) * (W + 400) - t * a.speed * (0.5 + h) + drift * 0.3, -size, W + size);
    const y = H * (lo + (hi - lo) * hash(i * 5 + 13)) + Math.sin(t * 0.2 + h * TAU) * 10;
    ctx.globalAlpha = a.alpha * Math.min(1, (x + size) / 300, (W + size - x) / 300);
    ctx.drawImage(wisp(a.colors[i % a.colors.length]), x - size * 0.5, y - size * 0.1, size, size * 0.2);
  }
}

const BEAT = [0, 1, 2, 1]; // the wings, up, level, down, level

// Gulls crossing at their own heights, some left and some right, a few seconds of gliding on level wings and
// then a few of wingbeats, rising and sinking a little as they go.
function gulls(ctx, a, t) {
  const [s0, s1] = a.size;
  for (let i = 0; i < a.n; i++) {
    const h = hash(i * 5 + 11);
    const size = s0 + (s1 - s0) * hash(i * 5 + 14);
    const dir = h < 0.5 ? 1 : -1;
    const x = wrap(hash(i * 5 + 12) * (W + 300) + dir * t * a.speed * (0.7 + h * 0.6), -120, W + 120);
    const y = H * (0.32 + 0.5 * hash(i * 5 + 13)) + Math.sin(t * 0.6 + h * 9) * 18;
    const glide = (t * 0.17 + h * 7) % 1 < 0.62;
    const sprite = gullSet(a.colors[i % a.colors.length])[glide ? 1 : BEAT[Math.floor(t * 3.6 + h * 9) & 3]];
    ctx.save();
    ctx.translate(x, y);
    ctx.scale((dir * size) * (1 / 28), size * (1 / 28));
    ctx.rotate(Math.sin(t * 0.9 + h * 5) * 0.06);
    ctx.globalAlpha = a.alpha;
    ctx.drawImage(sprite, -28, -17);
    ctx.restore();
  }
}

// Paint the sprites a look's entries draw, so none is baked mid-fight (warm-armada.js).
export function warmAmbient(look) {
  for (const a of look.ambient) {
    if (a.kind === 'gulls') a.colors.forEach((c) => gullSet(c));
    if (a.kind === 'wisps') a.colors.forEach((c) => wisp(c));
  }
}

export const AMBIENT5 = { wisps, gulls };
