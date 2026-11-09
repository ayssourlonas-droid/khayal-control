// Ambient particles per world (adapted from Barrage). Stateless: every particle's position is a
// function of its index, the time t and `drift` (px of wind drift the view accumulates), so nothing
// is simulated and nothing allocates per frame.
//   look.ambient = [{ kind, phase: 'sky'|'mid'|'front'|'screen', n, colors, size: [lo, hi], speed, alpha }]
import { W, H, hash, glow, soft, star, wrap, cached } from './sprites.js';
import { clamp, TAU } from '../core/math.js';
import { AMBIENT2 } from './ambient-2.js';
import { AMBIENT3 } from './ambient-3.js';
import { AMBIENT4 } from './ambient-4.js';
import { AMBIENT5 } from './ambient-5.js';
import { AMBIENT6 } from './ambient-6.js';
import { AMBIENT7 } from './ambient-7.js';
import { AMBIENT8 } from './ambient-8.js';
import { AMBIENT9 } from './ambient-9.js';
import { AMBIENT10 } from './ambient-10.js';

const P = {}; // one scratch particle, refilled per index: no per-frame garbage
function each(a, fn, from = 0, step = 1) {
  const [s0, s1] = a.size;
  for (let i = from; i < a.n; i += step) {
    P.i = i;
    P.h = hash(i * 5 + 11);
    P.x0 = hash(i * 5 + 12) * (W + 200) - 100;
    P.y0 = hash(i * 5 + 13) * H;
    P.size = s0 + (s1 - s0) * hash(i * 5 + 14);
    P.ph = hash(i * 5 + 15) * TAU;
    P.color = a.colors[i % a.colors.length];
    fn(P);
  }
}

const petal = (color) => cached('petal' + color, 32, 20, (g) => {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(2, 10);
  g.quadraticCurveTo(14, -2, 30, 8);
  g.lineTo(26, 10);
  g.lineTo(30, 12);
  g.quadraticCurveTo(14, 22, 2, 10);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.45)';
  g.fillRect(6, 9, 16, 2);
});

const KINDS = {
  rain(ctx, a, t, drift, wind) {
    const slant = clamp(wind / 220, -0.7, 0.7) + 0.12;
    ctx.lineWidth = 1.6;
    a.colors.forEach((c, ci) => {
      ctx.strokeStyle = c;
      ctx.globalAlpha = a.alpha;
      ctx.beginPath();
      each(a, (p) => {
        const y = wrap(p.y0 + t * a.speed * (0.8 + 0.4 * p.h), -60, H + 60);
        const x = wrap(p.x0 + y * slant + drift * 0.2, -100, W + 100);
        ctx.moveTo(x, y);
        ctx.lineTo(x - slant * p.size, y - p.size);
      }, ci, a.colors.length);
      ctx.stroke();
    });
  },
  // blown sand: long soft streaks driven by the gusts
  sand(ctx, a, t, drift) {
    each(a, (p) => {
      const x = wrap(p.x0 + t * a.speed * (0.4 + p.h) * Math.sign(drift || 1) + drift * (1 + p.h), -200, W + 200);
      const y = 260 + p.y0 * 0.76 + Math.sin(t * 1.3 + p.ph) * 14;
      ctx.globalAlpha = a.alpha * (0.5 + 0.5 * p.h);
      ctx.drawImage(soft(p.color), x - p.size * 5, y - p.size * 0.6, p.size * 10, p.size * 1.2);
    });
  },
  petals(ctx, a, t, drift) {
    each(a, (p) => {
      const y = wrap(p.y0 + t * a.speed * (0.6 + 0.6 * p.h), -30, H + 30);
      const x = wrap(p.x0 + drift + t * 22 + Math.sin(t * 1.1 + p.ph) * 50, -100, W + 100);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 1.4 + p.ph);
      ctx.scale(Math.cos(t * 2.2 + p.ph) * (p.size / 14), p.size / 14);
      ctx.globalAlpha = a.alpha;
      ctx.drawImage(petal(p.color), -16, -10);
      ctx.restore();
    });
  },
  ash(ctx, a, t, drift) {
    each(a, (p) => {
      const y = wrap(p.y0 + t * a.speed * (0.5 + p.h), 0, H);
      const x = wrap(p.x0 + Math.sin(t + p.i) * 30 + drift * 0.4, 0, W);
      ctx.globalAlpha = a.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(x, y, p.size * 1.4, p.size);
    });
  },
};

const ADDITIVE = {
  spores(ctx, a, t) {
    each(a, (p) => {
      const x = wrap(p.x0 + Math.sin(t * 0.25 + p.ph) * 80 + t * 6, -100, W + 100);
      const y = wrap(p.y0 - t * a.speed * (0.3 + p.h) + Math.sin(t * 0.7 + p.ph) * 20, -20, H + 20);
      ctx.globalAlpha = a.alpha * (0.4 + 0.6 * Math.sin(t * 1.1 + p.ph) ** 2);
      ctx.drawImage(glow(p.color), x - p.size * 2, y - p.size * 2, p.size * 4, p.size * 4);
    });
  },
  embers(ctx, a, t, drift) {
    each(a, (p) => {
      const y = wrap(p.y0 - t * a.speed * (0.5 + p.h), -20, H + 20);
      const x = wrap(p.x0 + drift * 0.5 + Math.sin(t * 2 + p.ph) * 22, -100, W + 100);
      ctx.globalAlpha = a.alpha * (0.55 + 0.45 * Math.sin(t * 9 + p.ph * 3)) * Math.min(1, y / 300);
      ctx.drawImage(glow(p.color), x - p.size * 3, y - p.size * 3, p.size * 6, p.size * 6);
    });
  },
  twinkle(ctx, a, t) {
    each(a, (p) => {
      const k = Math.max(0, Math.sin(t * (0.8 + p.h * 2) + p.ph)) ** 4;
      ctx.globalAlpha = a.alpha * (0.25 + 0.75 * k);
      const y = p.y0 * (a.maxY ?? 0.62);
      if (a.pixel) {
        ctx.fillStyle = p.color;
        const s = k > 0.5 ? 4 : 2;
        ctx.fillRect(Math.round(p.x0 / 2) * 2, Math.round(y / 2) * 2, s, s);
      } else ctx.drawImage(star(p.color), p.x0 - p.size, y - p.size, p.size * 2, p.size * 2);
    });
  },
};

// Draw the ambient entries of this phase. env = { t, drift, wind, world }.
export function drawAmbient(ctx, look, phase, env) {
  for (const a of look.ambient) {
    if (a.phase !== phase) continue;
    const fn = KINDS[a.kind] ?? ADDITIVE[a.kind] ?? AMBIENT2[a.kind] ?? AMBIENT3[a.kind] ?? AMBIENT4[a.kind] ?? AMBIENT5[a.kind] ?? AMBIENT6[a.kind] ?? AMBIENT7[a.kind] ?? AMBIENT8[a.kind] ?? AMBIENT9[a.kind] ?? AMBIENT10[a.kind];
    if (ADDITIVE[a.kind] || a.additive) ctx.globalCompositeOperation = 'lighter';
    fn(ctx, a, env.t, env.drift, env.wind, env.world, env.heal);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}
