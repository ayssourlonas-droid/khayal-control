// More flourishes (contract in flourish.js): Aurora Kingdom's. The aurora itself (aurora.js), its light
// shimmering in the black water, the lighthouse beam sweeping the haze, and the snow squall that
// crosses now and then.
import { W, H, rgba, hash, glow, soft, wrap, cached, lin, lighter, normal } from './sprites.js';
import { layerX } from './parallax.js';
import { drawAurora } from './aurora.js';
import { lightAt } from './aurora-model.js';

function aurora(ctx, { t, quality }) {
  drawAurora(ctx, t, quality);
}

// The near layer's sign of this kind (its water, its lantern), found once.
const sign = (v, key) => (v.cache[key] ??= v.layers[2]?.signs.find((s) => s[key]) ?? null);

// The water the aurora burns in: under each stretch of sky a soft streak of its light standing on the
// black water, broken into dashes that shorten with depth and tremble with the ripples. The layer's
// sign marks the water.
const TINTS = ['#58ffb0', '#8a6aff'];

function glint(ctx, { v, t, quality, world }) {
  const water = sign(v, 'water');
  if (!water) return;
  const L = v.layers[2];
  const y0 = L.top + water.y;
  const step = quality < 1 ? 96 : 48;
  lighter(ctx);
  for (let i = 0, x = 24; x < W; i++, x += step) {
    const l = lightAt(x, t);
    if (l < 0.12) continue;
    const sprite = glow(TINTS[Math.sin(x * 0.0031 + t * 0.05) > 0.2 ? 1 : 0]);
    ctx.globalAlpha = 0.5 * l * (0.7 + 0.3 * Math.sin(t * 1.7 + i * 2.9));
    ctx.drawImage(sprite, x - step * 0.45, y0 + 2, step * 0.9, 70 + 110 * l);
    for (let r = 0; r < 3; r++) {
      const wd = (step * 1.7 - r * 22) * (0.8 + 0.2 * Math.sin(t * 1.9 + i * 2.3 + r));
      ctx.globalAlpha = Math.min(1, 1.1 * l) * (1 - r * 0.22) * (0.65 + 0.35 * Math.sin(t * 2.6 + i * 1.7 + r * 2.1));
      ctx.drawImage(sprite, x + Math.sin(t * 0.8 + i + r * 1.3) * 10 - wd / 2, y0 + 10 + r * 30 + Math.sin(t * 1.1 + i * 3 + r) * 4, wd, 9);
    }
  }
  const lamp = sign(v, 'lamp'); // the lantern's gold laid on the water at its foot
  if (lamp) {
    const lx = layerX(L, world.ship?.x ?? W / 2) + lamp.x;
    for (let r = 0; r < 5; r++) {
      ctx.globalAlpha = 0.34 * (1 - r * 0.17) * (0.75 + 0.25 * Math.sin(t * 3.1 + r * 1.9));
      ctx.drawImage(glow('#ffd98a'), lx + Math.sin(t * 0.9 + r * 2) * 5 - (46 - r * 6), y0 + 20 + r * 20, 92 - r * 12, 8);
    }
  }
  normal(ctx);
}

// A beam lying along its axis, from the lantern out, in three nested wedges.
const wedge = () => cached('lightWedge', 1500, 220, (g, w, h) => {
  for (const [spread, a] of [[1, 0.2], [0.55, 0.3], [0.2, 0.5]]) {
    g.fillStyle = lin(g, 0, 0, w, 0, [[0, rgba('#fff4cf', a)], [0.35, rgba('#ffe9a8', a * 0.4)], [1, rgba('#cfe8ff', 0)]]);
    g.beginPath();
    g.moveTo(0, h / 2 - 3 * spread);
    g.lineTo(w, h / 2 - (h / 2) * spread);
    g.lineTo(w, h / 2 + (h / 2) * spread);
    g.lineTo(0, h / 2 + 3 * spread);
    g.fill();
  }
});

// The lantern turns once in 11 s with two beams back to back. A beam seen edge-on is long and thin; one
// swinging at the viewer shortens, widens and flares; one swinging away fades into the haze.
function lighthouse(ctx, { v, t, world }) {
  const lamp = sign(v, 'lamp');
  if (!lamp) return;
  const L = v.layers[2];
  const x = layerX(L, world.ship?.x ?? W / 2) + lamp.x;
  const y = L.top + lamp.y;
  lighter(ctx);
  let flare = 0;
  for (let i = 0; i < 2; i++) {
    const phi = t * 0.57 + i * Math.PI;
    const dx = Math.cos(phi);
    const toward = Math.sin(phi); // 1 straight at the viewer, -1 straight away
    flare = Math.max(flare, toward);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dx < 0 ? -1 : 1, 1);
    ctx.rotate(-0.07 * (1 - Math.abs(dx)) - 0.03);
    ctx.scale(Math.max(0.04, Math.abs(dx)), 1 + 1.8 * Math.max(0, toward));
    ctx.globalAlpha = 0.9 * (0.3 + 0.7 * ((toward + 1) / 2) ** 1.5);
    ctx.drawImage(wedge(), 0, -110);
    ctx.restore();
  }
  ctx.globalAlpha = 0.9;
  ctx.drawImage(glow('#fff0c0'), x - 26, y - 26, 52, 52);
  const f = Math.max(0, flare) ** 3;
  ctx.globalAlpha = 0.6 * f;
  ctx.drawImage(glow('#ffe9a8'), x - 180 * f - 40, y - 120 * f - 40, 360 * f + 80, 240 * f + 80);
  normal(ctx);
}

// A squall: now and then a wall of wind-driven snow sweeps across the whole view, a pale veil with
// slanting streaks racing through it. Never thick enough to hide a bullet.
const SQUALL = 53; // s between one chance of a squall and the next
const LEN = 9; // s one takes to cross

function squall(ctx, { t, quality }) {
  const slot = Math.floor(t / SQUALL);
  const lt = t - slot * SQUALL - 6 - hash(slot * 3) * 20;
  if (lt < 0 || lt > LEN || hash(slot * 3 + 1) > 0.75) return;
  const u = lt / LEN;
  const dir = hash(slot * 3 + 2) < 0.5 ? 1 : -1;
  const env = Math.sin(Math.PI * u) ** 1.4;
  const front = dir > 0 ? -500 + u * (W + 1000) : W + 500 - u * (W + 1000);
  ctx.globalAlpha = 0.2 * env;
  ctx.drawImage(soft('#c4dcf4'), front - 800, 40, 1600, H - 40);
  ctx.globalAlpha = 0.26 * env;
  ctx.drawImage(soft('#e8f4ff'), front - 360, 200, 720, 760);
  ctx.strokeStyle = '#eef8ff';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.4 * env;
  ctx.beginPath();
  for (let i = 0, n = quality < 1 ? 36 : 84; i < n; i++) {
    const x = front + (hash(i * 3 + slot) - 0.5) * 1300 + Math.sin(t * 3 + i) * 12;
    const y = wrap(hash(i * 3 + 1) * H + t * (500 + hash(i * 3 + 2) * 400), -40, H + 40);
    ctx.moveTo(x, y);
    ctx.lineTo(x - dir * (22 + hash(i + 5) * 26), y - 8);
  }
  ctx.stroke();
  ctx.lineCap = 'butt';
  normal(ctx);
}

export const FLOURISH5 = { aurora: { sky: aurora }, auroraglint: { near: glint }, lighthouse: { near: lighthouse }, squall: { front: squall } };
