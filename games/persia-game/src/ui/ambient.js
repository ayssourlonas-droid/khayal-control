// Ambient particles (adapted from Barrage). Stateless: every particle's position is a function of
// its index and the time t, so nothing is simulated and nothing allocates per frame.
//   look.ambient = [{ kind, phase: 'sky'|'screen', alpha, n?, colors? }]
import { W, H, hash, soft, wrap, cached, rad } from './sprites.js';
import { TAU } from '../core/math.js';

// Pixel stars over the top of the sky that swell and fade, each at its own pace, grid-snapped like
// the sprites.
function twinkle(ctx, a, t) {
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < a.n; i++) {
    const k = Math.max(0, Math.sin(t * (0.8 + hash(i * 5 + 11) * 2) + hash(i * 5 + 15) * TAU)) ** 4;
    const x = hash(i * 5 + 12) * (W + 200) - 100;
    const y = hash(i * 5 + 13) * H * 0.62;
    const s = k > 0.5 ? 4 : 2;
    ctx.globalAlpha = a.alpha * (0.25 + 0.75 * k);
    ctx.fillStyle = a.colors[i % a.colors.length];
    ctx.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, s, s);
  }
}

// CRT: dark lines every 3 px and the tube's darker corners, baked once; a soft bright band rolls
// down the glass.
const tube = () => cached('crt', W, H, (g) => {
  g.fillStyle = 'rgba(0,0,0,0.42)';
  for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
  g.fillStyle = rad(g, W / 2, H / 2, H * 0.45, H * 1.05, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.6)']]);
  g.fillRect(0, 0, W, H);
});

// The overlay blends the whole 1920 x 1080 frame every frame, the dearest thing here: below full
// quality (the view's auto-quality level) it is skipped.
function scanlines(ctx, a, t, quality) {
  if (quality < 1) return;
  ctx.globalAlpha = a.alpha;
  ctx.drawImage(tube(), 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.05;
  ctx.drawImage(soft('#c8ffe8'), -200, wrap(t * 120, -300, H + 300) - 90, W + 400, 180);
}

const KINDS = { twinkle, scanlines };

// Draw the ambient entries of this phase at time t; quality is the view's auto-quality level.
export function drawAmbient(ctx, look, phase, t, quality = 1) {
  for (const a of look.ambient) {
    if (a.phase !== phase) continue;
    KINDS[a.kind](ctx, a, t, quality);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}
