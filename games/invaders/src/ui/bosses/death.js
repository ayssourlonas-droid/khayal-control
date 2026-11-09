// The boss's destruction chain, drawn: the hull shudders and burns, its parts tear off one by one and
// tumble away, then it snaps in two down the middle, the halves sagging apart over a molten seam,
// and the wreck burns white-hot before the final blast (fx draws the blasts, debris and white-out).
//   collapse(b, t)  the pose, a pure function of the boss (kind, parts, dying) and the clock t (jitter)
//   drawDying(ctx, b, B, t, light, bodies)  B = bossArt(...); bodies false draws the lights only
//                                           (Neon Rain's darkness pass), at strength light
import { hash, glow, soft } from '../sprites.js';
import { CHAIN } from '../../core/boss-phase.js';
import { wreck } from './cracks.js';
import { hullFlash } from './bake.js';
import { clamp, smooth } from '../../core/math.js';

const seedOf = (kind) => [...kind].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 9973, 7);

// Tear-off order: parts on the centre line first (they straddle the break), the rest shuffled.
function order(b, seed) {
  const idx = b.parts.map((p, i) => i);
  const key = (i) => (b.parts[i].dx === 0 ? 0 : 1) + hash(seed + i * 7);
  return idx.toSorted((i, j) => key(i) - key(j));
}

export function collapse(b, t) {
  const k = clamp(1 - b.dying / CHAIN, 0, 1);
  const seed = seedOf(b.kind);
  const split = smooth((k - 0.3) / 0.6);
  const halves = [-1, 1].map((s) => ({ s, dx: s * 46 * split, dy: 120 * split * split, rot: s * 0.2 * split }));
  const parts = b.parts.map(() => null);
  const n = b.parts.length;
  order(b, seed).forEach((i, rank) => {
    const at = 0.05 + (0.75 * (rank + 0.5)) / n;
    if (k < at) return;
    const p = b.parts[i];
    const s = (k - at) * CHAIN;
    const dir = Math.sign(p.dx) || (hash(seed + i * 3) < 0.5 ? -1 : 1);
    const v = 70 + 130 * hash(seed + i * 11);
    parts[i] = { dx: dir * v * s, dy: -150 * s + 450 * s * s, rot: dir * (0.8 + 1.6 * hash(seed + i * 5)) * s, a: Math.max(0, 1 - s / 1.8) };
  });
  const shake = (3 + 7 * k) * (1 - split * 0.5);
  return {
    k, split, halves, parts, white: smooth((k - 0.7) / 0.26),
    jx: Math.sin(t * 53) * shake, jy: Math.cos(t * 47) * shake * 0.6,
  };
}

// The jagged break line down the middle of the hull, top to bottom (boss coordinates).
function seam(S, seed) {
  const pts = [];
  for (let i = 0; i <= 8; i++) pts.push([(hash(seed + i * 13) - 0.5) * 34, -S.H / 2 + (S.H * i) / 8]);
  return pts;
}

function clipHalf(ctx, s, S, pts) {
  ctx.beginPath();
  ctx.moveTo(s * S.W, -S.H);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.lineTo(s * S.W, S.H);
  ctx.closePath();
  ctx.clip();
}

const place = (ctx, b, P, h, pivot) => {
  ctx.translate(b.x + P.jx + h.dx, b.y + P.jy + h.dy + pivot);
  ctx.rotate(h.rot);
  ctx.translate(0, -pivot);
};

function partImg(ctx, set, x, y, img) {
  ctx.drawImage(img, x - set.w / 2 - set.m, y - set.h / 2 - set.m);
}

// Fires across one half, more of them as the chain goes on; flickering cached glows.
function fires(ctx, S, s, k, t, seed, a) {
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) {
    if (k < (i / 14) * 0.7) break;
    const x = s * (8 + hash(seed + i * 19) * (S.def.size.w / 2 - 20));
    const y = (hash(seed + i * 23) - 0.5) * S.def.size.h * 0.75;
    const f = 0.55 + 0.45 * Math.sin(t * (13 + i) + i * 2.1);
    const r = 34 + 40 * hash(seed + i * 29);
    ctx.globalAlpha = a * f;
    ctx.drawImage(glow(i % 3 ? '#ff6a1a' : '#ffd060'), x - r, y - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
}

export function drawDying(ctx, b, B, t, light = 1, bodies = true) {
  const P = collapse(b, t);
  if (P.k >= 0.985) return;
  const fade = 1 - smooth((P.k - 0.93) / 0.055);
  const { hull, S, parts } = B;
  const seed = seedOf(b.kind);
  const pts = seam(S, seed);
  const pivot = -S.def.size.h / 2;
  P.halves.forEach((h) => {
    ctx.save();
    place(ctx, b, P, h, pivot);
    ctx.save();
    clipHalf(ctx, h.s, S, pts);
    ctx.globalAlpha = fade;
    if (bodies) ctx.drawImage(hull.body, hull.x0, hull.y0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = fade * light * (1 - 0.7 * P.k) * (0.7 + 0.3 * Math.sin(t * 31));
    ctx.drawImage(hull.lights, hull.x0, hull.y0);
    ctx.globalAlpha = fade * Math.max(P.white, 0.12 * P.k);
    ctx.drawImage(hullFlash(B), hull.x0, hull.y0);
    ctx.restore();
    ctx.globalAlpha = fade;
    b.parts.forEach((p, i) => {
      if (P.parts[i] || Math.sign(p.dx) !== h.s || !bodies) return;
      const set = parts[p.id];
      partImg(ctx, set, p.dx, p.dy, wreck(set, p.open));
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = fade * P.white;
      partImg(ctx, set, p.dx, p.dy, set.flash);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = fade;
    });
    fires(ctx, S, h.s, P.k, t, seed + h.s, fade * light);
    ctx.restore();
  });
  const mid = P.halves[1].dy;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = fade * light * Math.min(1, P.split * 1.6);
  const sw = 50 + 160 * P.split;
  ctx.drawImage(glow('#ffb04a'), b.x + P.jx - sw / 2, b.y + P.jy + mid - S.def.size.h * 0.7, sw, S.def.size.h * 1.4);
  ctx.globalAlpha = fade * light * P.split * 0.8;
  ctx.drawImage(soft('#fff2d0'), b.x + P.jx - sw / 6, b.y + P.jy + mid - S.def.size.h * 0.5, sw / 3, S.def.size.h);
  ctx.globalCompositeOperation = 'source-over';
  if (bodies) {
    b.parts.forEach((p, i) => {
      if (!P.parts[i] && p.dx !== 0) return; // it rides its half
      const f = P.parts[i] ?? { dx: P.jx, dy: P.jy + mid, rot: 0, a: 1 }; // centre parts tear off first
      if (f.a <= 0) return;
      const set = parts[p.id];
      ctx.save();
      ctx.translate(b.x + p.dx + f.dx, b.y + p.dy + f.dy);
      ctx.rotate(f.rot);
      ctx.globalAlpha = f.a * fade;
      partImg(ctx, set, 0, 0, wreck(set, p.open));
      ctx.restore();
    });
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
