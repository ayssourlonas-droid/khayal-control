// More ambient kinds: falling glyph code (Code Rain), starlight bent round the well (Event
// Horizon) and CRT scanlines over the whole frame (Arcade Origin). Same contract as ambient.js.
import { W, H, hash, glow, soft, wrap, cached, rad } from './sprites.js';
import { glyphAtlas, drawGlyph } from './glyphs.js';
import { WELL } from '../core/kinds.js';
import { TAU } from '../core/math.js';

// Columns of glyphs falling, a white-hot head and a fading tail; the marks flip as they fall.
function glyphs(ctx, a, t) {
  const body = glyphAtlas(a.colors[0]);
  const head = glyphAtlas(a.colors[1]);
  const [s0, s1] = a.size;
  for (let i = 0; i < a.n; i++) {
    const s = Math.round(s0 + (s1 - s0) * hash(i * 7 + 5));
    const x = Math.round((hash(i * 7 + 1) * W) / 24) * 24;
    const len = 8 + Math.floor(hash(i * 7 + 3) * 14);
    const span = H + len * s + 200;
    const y0 = wrap(hash(i * 7 + 4) * span + t * a.speed * (0.6 + hash(i * 7 + 2) * 0.8), 0, span) - len * s;
    for (let k = 0; k < len; k++) {
      const y = y0 - k * s;
      if (y < -s || y > H) continue;
      const flip = Math.floor(t * (1.5 + hash(i * 31 + k) * 5));
      ctx.globalAlpha = a.alpha * (1 - k / len) ** 1.4;
      drawGlyph(ctx, k ? body : head, Math.floor(hash(i * 131 + k * 7 + flip) * 48), x, y, s);
    }
    ctx.globalAlpha = a.alpha * 0.5;
    ctx.drawImage(glow(a.colors[1]), x - s * 0.6, y0 - s * 0.4, s * 2, s * 2);
  }
}

// Stars caught near the hole, smeared into arcs that tighten into a ring as they get closer.
function lensed(ctx, a, t, drift, wind, world) {
  const c = world?.well ?? WELL;
  ctx.lineCap = 'round';
  for (let i = 0; i < a.n; i++) {
    const h = hash(i * 11 + 1);
    const rr = 90 + h ** 1.7 * 440;
    const ang = hash(i * 11 + 2) * TAU + t * a.speed * (100 / rr) ** 1.5;
    const span = Math.min(2.4, 0.9 * (125 / rr) ** 2.2 + 0.02);
    ctx.strokeStyle = a.colors[i % a.colors.length];
    ctx.lineWidth = a.size[0] + (a.size[1] - a.size[0]) * hash(i * 11 + 3);
    ctx.globalAlpha = a.alpha * (0.35 + 0.65 * hash(i * 11 + 4)) * (0.75 + 0.25 * Math.sin(t * 2 + i));
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, rr, rr * 0.9, 0, ang, ang + span);
    ctx.stroke();
  }
  ctx.lineCap = 'butt'; // the default again: later strokes (the HUD's power ring) must not inherit it
}

// CRT: dark lines every 3 px and the tube's darker corners, baked once; a soft bright band rolls
// down the glass.
const tube = () => cached('crt', W, H, (g) => {
  g.fillStyle = 'rgba(0,0,0,0.42)';
  for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
  g.fillStyle = rad(g, W / 2, H / 2, H * 0.45, H * 1.05, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.6)']]);
  g.fillRect(0, 0, W, H);
});

function scanlines(ctx, a, t) {
  ctx.globalAlpha = a.alpha;
  ctx.drawImage(tube(), 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.05;
  ctx.drawImage(soft('#c8ffe8'), -200, wrap(t * 120, -300, H + 300) - 90, W + 400, 180);
}

export const AMBIENT2 = { glyphs, lensed, scanlines };
