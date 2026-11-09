// Painting helpers for the sky body (adapted from Barrage).
import { W, H, mix, rgba, hash, glow, soft, addGlow, lin, rad } from './sprites.js';
import { clamp, TAU } from '../core/math.js';

// A scatter of stars over the top `maxY` px; bright ones get a glow.
export function stars(g, n, seed, maxY, bright = 1) {
  const tints = ['#ffffff', '#cfe0ff', '#ffe8d0', '#e0d0ff'];
  for (let i = 0; i < n; i++) {
    const x = hash(seed + i * 3) * W;
    const y = hash(seed + i * 3 + 1) ** 1.3 * maxY;
    const m = hash(seed + i * 3 + 2);
    const a = (0.25 + 0.75 * m) * bright * (1 - (y / maxY) * 0.5);
    g.fillStyle = rgba(tints[i % 4], clamp(a, 0, 1));
    const s = m > 0.93 ? 2.5 : m > 0.6 ? 1.6 : 1.1;
    g.fillRect(x, y, s, s);
    if (m > 0.965) addGlow(g, glow(tints[i % 4]), x, y, 9, 0.55 * bright);
  }
}

// A body lit from the upper left: radial gradient from `lit` to `dark`, plus darker mottles.
export function moon(g, x, y, r, lit, dark, mottle, seed = 1) {
  g.fillStyle = rad(g, x, y, r * 0.1, r, [[0, lit], [0.7, mix(lit, dark, 0.55)], [1, dark]], x - r * 0.35, y - r * 0.35);
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
  g.save();
  g.clip();
  for (let i = 0; i < 16; i++) {
    const a = hash(seed + i * 5) * TAU;
    const d = Math.sqrt(hash(seed + i * 5 + 1)) * r * 0.85;
    const s = r * (0.08 + hash(seed + i * 5 + 2) * 0.22);
    g.globalAlpha = 0.18 + hash(seed + i * 5 + 3) * 0.25;
    g.drawImage(soft(mottle), x + Math.cos(a) * d - s, y + Math.sin(a) * d - s, s * 2, s * 2);
  }
  g.restore();
  g.globalAlpha = 1;
}

// A tapered ink brush stroke from (x, y), `len` long, `w` thick at its belly, slightly wavy.
export function brush(g, x, y, len, w, color, seed) {
  const n = 24;
  const top = [];
  const bot = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const px = x + u * len;
    const wob = Math.sin(u * 7 + seed) * w * 0.25 + (hash(seed * 31 + i) - 0.5) * w * 0.3;
    const th = w * Math.sin(Math.PI * u ** 0.8) * (0.7 + 0.3 * hash(seed + i));
    top.push([px, y + wob - th / 2]);
    bot.push([px, y + wob + th / 2]);
  }
  g.fillStyle = color;
  g.beginPath();
  for (const [px, py] of top) g.lineTo(px, py);
  for (const [px, py] of bot.toReversed()) g.lineTo(px, py);
  g.fill();
}

// Glow along the bottom of the frame from y0 down, as the moon lights the low sky.
export function horizonGlow(g, color, a, y0) {
  g.fillStyle = lin(g, 0, y0, 0, H, [[0, rgba(color, 0)], [1, rgba(color, a)]]);
  g.fillRect(0, y0, W, H - y0);
}
