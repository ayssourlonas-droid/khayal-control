// The reveals of the trailer's title cards: how each world's words arrive on the screen. A CRT
// powering on, a neon tube stuttering alight, a slow push with a flare crossing it, an ink wipe
// under a red moon, a breath in the dark, a terminal typing, a steel slam, a drift at the edge of
// time. Each is (ctx, art, style, t, out, y0, secs): art from draw.js bakeCard, t seconds in, out
// the fade-out factor, y0 the art's top. The light sprites they share are cached once.
//   REVEAL[style.reveal](...)      bloom(color): a soft radial light sprite
import { W, H, byColor, cached, hash, lin, radial } from '../sprites.js';
import { clamp, smooth, easeOut } from '../../core/math.js';

const CLEAR = 'rgba(0,0,0,0)';
const MOON = '#b3151d';
export const bloom = byColor((c) => cached('bloom' + c, 256, 256, radial([[0, c], [1, CLEAR]])));
const paintMoon = radial([[0, MOON], [0.62, MOON], [1, CLEAR]]);
const moon = () => cached('moon', 256, 256, paintMoon);
const streak = byColor((c) => cached('streak' + c, 512, 16, (g) => {
  g.fillStyle = lin(g, 0, 0, 512, 0, [[0, CLEAR], [0.5, c], [1, CLEAR]]);
  g.fillRect(0, 6, 512, 4);
}));

// Draw the art at y0, scaled about the frame's centre, at alpha a.
function put(ctx, art, y0, a, sx = 1, sy = sx, dx = 0) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(W / 2 + dx, y0 + art.h / 2);
  ctx.scale(sx, sy);
  ctx.drawImage(art.canvas, -W / 2, -art.h / 2);
  ctx.restore();
}

export const REVEAL = {
  crt(ctx, art, s, t, out, y0) {
    const k = clamp(t / 0.16, 0, 1);
    put(ctx, art, y0, out, 1 + 0.04 * (1 - k), Math.max(0.02, easeOut(k)));
    if (k < 1) {
      ctx.globalAlpha = 1 - k;
      ctx.fillStyle = '#e6fff8';
      ctx.fillRect(0, H / 2 - 2, W, 4);
    }
  },
  flicker(ctx, art, s, t, out, y0) {
    const f = Math.floor(t * 40);
    const lit = t > 0.55 || hash(f * 3 + 7) < 0.25 + t * 1.3;
    put(ctx, art, y0, out * (lit ? 0.93 + 0.07 * hash(f) : 0.08));
  },
  push(ctx, art, s, t, out, y0, secs) {
    put(ctx, art, y0, smooth(t / 0.35) * out, 1 + 0.06 * (t / secs));
    const k = clamp((t - 0.15) / 0.9, 0, 1);
    if (k > 0 && k < 1) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.7 * Math.sin(Math.PI * k) * out;
      ctx.drawImage(streak(s.glow), -600 + k * (W + 1200) - 700, H / 2 - 40, 1400, 80);
      ctx.globalCompositeOperation = 'source-over';
    }
  },
  wipe(ctx, art, s, t, out, y0) {
    ctx.globalAlpha = 0.9 * smooth(t / 0.7) * out;
    ctx.drawImage(moon(), W / 2 - 330, y0 + art.h / 2 - 330, 660, 660); // behind the words
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y0, W * easeOut(t / 0.55), art.h);
    ctx.clip();
    put(ctx, art, y0, out);
    ctx.restore();
  },
  breathe(ctx, art, s, t, out, y0) {
    const a = smooth(t / 0.8) * out;
    ctx.globalCompositeOperation = 'lighter';
    put(ctx, art, y0 - 6, 0.22 * a * hash(Math.floor(t * 12)), 1, 1, 5);
    ctx.globalCompositeOperation = 'source-over';
    put(ctx, art, y0 - 10 * (1 - smooth(t)), a);
  },
  type(ctx, art, s, t, out, y0) { // 48 characters a second, a beat at each line's end, a block cursor
    let left = Math.floor(t * 48);
    const typed = art.rows.reduce((n, r) => n + r.text.length + 3, 0) <= left;
    if (typed) put(ctx, art, y0, out); // all typed: the whole art, its glow uncut
    let at = null;
    ctx.globalAlpha = out;
    for (const r of art.rows) {
      const n = clamp(left, 0, r.text.length);
      const cw = r.x0 + r.prefix[n];
      if (n > 0 && !typed) ctx.drawImage(art.canvas, 0, r.top, cw, r.h, 0, y0 + r.top, cw, r.h);
      at = { x: cw + 6, y: y0 + r.y };
      if (left <= r.text.length) break;
      left -= r.text.length + 3;
    }
    if (at && Math.floor(t * 4) % 2 === 0) {
      ctx.fillStyle = s.glow;
      ctx.fillRect(at.x, at.y - art.size * 0.42, art.size * 0.5, art.size * 0.84);
    }
  },
  slam(ctx, art, s, t, out, y0) {
    const k = clamp(t / 0.14, 0, 1);
    const shake = t > 0.14 && t < 0.42 ? (hash(Math.floor(t * 60)) - 0.5) * 18 * (1 - (t - 0.14) / 0.28) : 0;
    put(ctx, art, y0 + shake * 0.5, Math.min(1, t / 0.06) * out, 1 + 0.4 * (1 - easeOut(k)), 1 + 0.4 * (1 - easeOut(k)), shake);
    if (t > 0.14 && t < 0.32) {
      ctx.globalAlpha = 0.2 * (1 - (t - 0.14) / 0.18);
      ctx.fillStyle = '#fff4ea';
      ctx.fillRect(0, 0, W, H);
    }
  },
  drift(ctx, art, s, t, out, y0, secs) {
    const a = smooth(t / 0.6) * out;
    const sc = 1.08 - 0.08 * easeOut(t / secs);
    ctx.globalCompositeOperation = 'lighter';
    put(ctx, art, y0, 0.12 * a, sc * 1.008);
    ctx.globalCompositeOperation = 'source-over';
    put(ctx, art, y0, a, sc);
  },
};
