// Animated extras per world, by name in look.flourish, each drawn at one depth (phase):
//   'sky' after the sky, 'far' after the far layer, 'mid' after the middle one, 'near' after all
//   layers, 'front' over the playfield, 'screen' over everything but the HUD.
// f(ctx, env, x0, top): env = { v, world, fx, t, quality }; x0/top: the layer just drawn (far/mid).
// Pure functions of t (and fx for lightning); cached sprites live in v.cache.
import { W, H, rgba, hash, glow, soft, wrap, makeCanvas, lighter, normal, lin } from './sprites.js';
import { FLOURISH2 } from './flourish-2.js';
import { FLOURISH3 } from './flourish-3.js';
import { FLOURISH4 } from './flourish-4.js';
import { FLOURISH5 } from './flourish-5.js';
import { FLOURISH6 } from './flourish-6.js';
import { FLOURISH7 } from './flourish-7.js';
import { FLOURISH8 } from './flourish-8.js';
import { FLOURISH9 } from './flourish-9.js';
import { FLOURISH10 } from './flourish-10.js';
import { FLOURISH11 } from './flourish-11.js';
import { FLOURISH12 } from './flourish-12.js';
import { FLOURISH13 } from './flourish-13.js';
import { FLOURISH_SWAY } from './flourish-deep-sway.js';
import { FLOURISH_MAELSTROM } from './flourish-maelstrom.js';
import { FLOURISH_GLASS } from './flourish-glass.js';
import { FLOURISH_SMOG } from './flourish-smog.js';
import { FLOURISH_STORM } from './flourish-storm.js';

function beam(color, len = 1000, top = 240) {
  const c = makeCanvas(top, len);
  const g = c.getContext('2d');
  g.fillStyle = lin(g, 0, len, 0, 0, [[0, rgba(color, 0.5)], [1, rgba(color, 0)]]);
  g.beginPath();
  g.moveTo(top / 2 - 8, len);
  g.lineTo(0, 0);
  g.lineTo(top, 0);
  g.lineTo(top / 2 + 8, len);
  g.fill();
  return c;
}

// Beams sweeping the smog from below the skyline.
function searchlights(ctx, { v, t }) {
  v.cache.beams ??= ['#7ff6ff', '#ff7ad8', '#ffffff'].map((c) => beam(c));
  lighter(ctx);
  v.cache.beams.forEach((b, i) => {
    ctx.save();
    ctx.translate(320 + i * 640, H - 260);
    ctx.rotate(Math.sin(t * 0.3 + i * 2.1) * 0.5);
    ctx.globalAlpha = 0.28;
    ctx.drawImage(b, -120, -1000);
    ctx.restore();
  });
  normal(ctx);
}

// Flying cars crossing at three depths: a dark body, white headlamps ahead, red tail-lights behind.
function cars(ctx, { t }, x0, top) {
  lighter(ctx);
  for (let i = 0; i < 9; i++) {
    const lane = i % 3;
    const dir = (i + lane) % 2 ? 1 : -1;
    const s = 0.5 + lane * 0.3;
    const speed = (90 + hash(i + 300) * 120) * s;
    const x = wrap(hash(i + 301) * W + dir * t * speed, -300, W + 300);
    const y = top - 60 - lane * 70 - hash(i + 302) * 60 + Math.sin(t * 0.8 + i) * 6;
    ctx.globalAlpha = 0.25 * s;
    ctx.drawImage(soft('#ff4a5a'), x - dir * 70 * s - 60 * s, y - 2, 120 * s, 4); // light trail
    ctx.globalAlpha = 0.9;
    ctx.drawImage(glow('#e8f4ff'), x + dir * 14 * s - 12 * s, y - 12 * s, 24 * s, 24 * s);
    ctx.drawImage(glow('#ff3040'), x - dir * 14 * s - 9 * s, y - 9 * s, 18 * s, 18 * s);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#07050c';
    ctx.fillRect(x - 13 * s, y - 4 * s, 26 * s, 7 * s);
    ctx.fillRect(x - 7 * s, y - 8 * s, 14 * s, 5 * s);
    lighter(ctx);
  }
  normal(ctx);
}

// Billboards on the middle skyline: abstract shapes cycling in neon, scan-flicker on top.
function holo(ctx, { v, t }, x0, top) {
  const L = v.layers[1];
  if (!L) return;
  lighter(ctx);
  L.signs.forEach((s, i) => {
    const x = x0 + s.x;
    const y = top + s.y;
    const k = Math.floor(t / 3 + s.ph * 4) % 3;
    const on = 0.55 + 0.25 * Math.sin(t * 9 + i) * Math.sin(t * 2.3 + i * 3);
    ctx.globalAlpha = on * 0.2;
    ctx.fillStyle = s.c;
    ctx.fillRect(x, y, s.w, s.h);
    ctx.globalAlpha = on * 0.75;
    ctx.fillStyle = k === 1 ? '#ffffff' : s.c;
    if (k === 0) { // rings opening from the centre
      for (let r = 1; r < 4; r++) {
        ctx.globalAlpha = on * (1 - (((t * 0.6 + r / 3) % 1)));
        ctx.drawImage(glow(s.c), x + s.w / 2 - r * 14, y + s.h / 2 - r * 14, r * 28, r * 28);
      }
    } else if (k === 1) { // bars rising and falling
      for (let b = 0; b < 6; b++) {
        const bh = s.h * (0.2 + 0.7 * Math.abs(Math.sin(t * 3 + b * 1.3 + i)));
        ctx.fillRect(x + 6 + (b * (s.w - 12)) / 6, y + s.h - bh, (s.w - 12) / 8, bh);
      }
    } else { // a slow wave
      for (let px = 0; px < s.w; px += 6) ctx.fillRect(x + px, y + s.h / 2 + Math.sin(px * 0.08 + t * 3) * s.h * 0.3, 4, 4);
    }
    ctx.globalAlpha = 0.15;
    ctx.drawImage(glow(s.c), x - 40, y - 40, s.w + 80, s.h + 80);
  });
  normal(ctx);
}

// Gas flares on the far towers: a burst of fire every few seconds.
function flares(ctx, { t }, x0, top) {
  lighter(ctx);
  for (let i = 0; i < 4; i++) {
    const x = 220 + i * 470 + hash(i + 320) * 120;
    const y = top + 40 + hash(i + 321) * 80;
    const tau = (t / (4 + i) + hash(i + 322)) % 1;
    const k = tau < 0.35 ? Math.sin((tau / 0.35) * Math.PI) : 0;
    if (k <= 0) continue;
    ctx.globalAlpha = k;
    ctx.drawImage(glow('#ff8a2a'), x - 50, y - 120 * k - 40, 100, 120);
    ctx.drawImage(glow('#ffe0a0'), x - 18, y - 60 * k - 18, 36, 50);
  }
  normal(ctx);
}

// Low mist drifting in bands, in the world's own colour.
function mist(ctx, { v, t }) {
  const sprite = soft(v.look.mist ?? '#a0a0c0');
  for (let i = 0; i < 9; i++) {
    const w = 500 + hash(i + 210) * 400;
    const x = wrap(hash(i + 211) * W + t * (10 + hash(i + 212) * 14), -w, W + w);
    ctx.globalAlpha = (v.look.mistAlpha ?? 0.14) * (1 + 0.4 * Math.sin(t * 0.4 + i));
    ctx.drawImage(sprite, x - w / 2, 760 + hash(i + 213) * 240, w, 90);
  }
  ctx.globalAlpha = 1;
}

// Shooting stars: a head with a fading tail, on a timetable.
function shooting(ctx, { t }) {
  lighter(ctx);
  for (let lane = 0; lane < 2; lane++) {
    const period = 3.1;
    const slot = Math.floor(t / period + lane * 0.5);
    if (hash(slot * 3 + lane) > 0.6) continue;
    const lt = (t / period + lane * 0.5 - slot) * period;
    if (lt > 0.9) continue;
    const x = 300 + hash(slot * 3 + lane + 1) * (W - 300) - lt * 800;
    const y = 40 + hash(slot * 3 + lane + 2) * 300 + lt * 420;
    const a = Math.min(1, lt * 6) * (1 - lt / 0.9);
    const gr = ctx.createLinearGradient(x, y, x + 180, y - 95);
    gr.addColorStop(0, rgba('#ffffff', a));
    gr.addColorStop(1, rgba('#9ab8ff', 0));
    ctx.strokeStyle = gr;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 180, y - 95);
    ctx.stroke();
    ctx.globalAlpha = a;
    ctx.drawImage(glow('#ffffff'), x - 10, y - 10, 20, 20);
    ctx.globalAlpha = 1;
  }
  normal(ctx);
}

const FLOURISH = {
  searchlights: { sky: searchlights }, cars: { far: cars, neonfar: cars }, holo: { mid: holo, neonmid: holo },
  flares: { far: flares, neonfar: flares },
  mist: { near: mist }, shooting: { sky: shooting }, ...FLOURISH2, ...FLOURISH3, ...FLOURISH4, ...FLOURISH5, ...FLOURISH6, ...FLOURISH7, ...FLOURISH8, ...FLOURISH9, ...FLOURISH10, ...FLOURISH11,
  ...FLOURISH12, ...FLOURISH13, ...FLOURISH_SWAY, ...FLOURISH_MAELSTROM,
  ...FLOURISH_GLASS, ...FLOURISH_SMOG, ...FLOURISH_STORM,
};

export function drawFlourishes(ctx, env, phase, x0 = 0, top = 0) {
  for (const name of env.v.look.flourish) {
    const f = FLOURISH[name]?.[phase];
    if (f) f(ctx, env, x0, top);
  }
}
