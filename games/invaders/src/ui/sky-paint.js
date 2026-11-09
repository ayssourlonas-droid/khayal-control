// Painting helpers shared by the sky bodies and the flourishes (adapted from Barrage).
import { W, H, mix, rgba, shade, hash, glow, soft, addGlow, lin, rad } from './sprites.js';
import { clamp, TAU } from '../core/math.js';

// Soft blobs `[x, y, r, colour, alpha, squash?]` laid over the sky: nebulae, smog, smoke banks.
export function blobs(g, list) {
  for (const [x, y, r, c, a, sy = 1] of list) {
    g.globalAlpha = a;
    g.drawImage(soft(c), x - r, y - r * sy, r * 2, r * 2 * sy);
  }
  g.globalAlpha = 1;
}

// A scatter of stars over the top `maxY` px; bright ones get a glow. pixel: square, grid-snapped.
export function stars(g, n, seed, maxY, bright = 1, pixel = false, avoid = null) {
  const tints = ['#ffffff', '#cfe0ff', '#ffe8d0', '#e0d0ff'];
  for (let i = 0; i < n; i++) {
    let x = hash(seed + i * 3) * W;
    let y = hash(seed + i * 3 + 1) ** 1.3 * maxY;
    if (avoid && Math.hypot(x - avoid.x, y - avoid.y) < avoid.r) continue;
    const m = hash(seed + i * 3 + 2);
    const a = (0.25 + 0.75 * m) * bright * (1 - (y / maxY) * 0.5);
    g.fillStyle = rgba(tints[i % 4], clamp(a, 0, 1));
    let s = m > 0.93 ? 2.5 : m > 0.6 ? 1.6 : 1.1;
    if (pixel) {
      s = m > 0.9 ? 4 : 2;
      x = Math.round(x / 2) * 2;
      y = Math.round(y / 2) * 2;
    }
    g.fillRect(x, y, s, s);
    if (m > 0.965) addGlow(g, glow(tints[i % 4]), x, y, pixel ? 10 : 9, 0.55 * bright);
  }
}

// A sun: wide additive halo, then a solid disc with a hot centre.
export function sun(g, x, y, r, color, halo, haloScale = 7, haloAlpha = 0.9) {
  addGlow(g, glow(halo), x, y, r * haloScale, haloAlpha);
  addGlow(g, glow(color), x, y, r * 2.2, 0.9);
  g.fillStyle = rad(g, x, y, 0, r, [[0, '#ffffff'], [0.6, shade(color, 0.5)], [1, color]]);
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
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

// Glow along the bottom of the frame, as a city or a fire lights the low sky.
export function horizonGlow(g, color, a, y0 = H * 0.55) {
  g.fillStyle = lin(g, 0, y0, 0, H, [[0, rgba(color, 0)], [1, rgba(color, a)]]);
  g.fillRect(0, y0, W, H - y0);
}
