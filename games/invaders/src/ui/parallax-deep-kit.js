// Shapes and colours shared by the painters of the drowned kingdom, the far layer of Lantern Deep
// (parallax-deep.js and the files it draws with: -ridge, -towers, -hall, -span, -palace, -nave, -whale).
// Everything stands in the layer colour, washed from above by the faint light of the surface, and is
// dressed the way the sea dresses stone: coral crusts on the ledges, weed hanging from the galleries,
// moss, barnacles. Windows are small and dim: this is far away, and nothing here may outshine a bullet.
// See parallax-shapes.js for the painter contract.
import { rgba, mix, lin } from './sprites.js';
import { TAU } from '../core/math.js';
export { poly } from './parallax-armada-kit.js';

export const TEAL = '#3de8d0';
export const AQUA = '#5af0ff';
export const VIOLET = '#b27cff';
export const CORAL = '#ff6f9c';
export const GREEN = '#4fd68a';
export const PALE = '#9af4ff';
export const SURFACE = '#2a7a96'; // the surface's light lying on a roof
export const ABYSS = '#010812'; // the shadow in a window or an arch

const GOLD_ODDS = 0.74; // of the lit windows, the share that burn gold (the rest, teal)
const MODES = ['steady', 'steady', 'pulse', 'flicker'];

// A light on the layer (drawn every frame over the baked art, see parallax.js drawLights).
export const lamp = (out, x, y, r, color, mode, ph, a) => out.lights.push({ x, y, r, color, mode, ph, a });

// A colour drawn k of the way from the layer's to c: coral, moss and growth are the layer colour, tinted.
export const tint = (L, c, k) => mix(L.color, c, k);

// A small arched window, x its centre, y the springing of its arch, w x h. odds is the chance it is lit; a lit
// pane is warm gold (or, now and then, teal) with a small halo on the layer's lights.
export function win(g, out, rng, L, x, y, w, h, odds = 0.06) {
  const hw = w / 2;
  const lit = rng() < odds;
  g.beginPath();
  g.moveTo(x - hw, y + h);
  g.lineTo(x - hw, y);
  g.arc(x, y, hw, Math.PI, 0);
  g.lineTo(x + hw, y + h);
  g.closePath();
  if (!lit) {
    g.fillStyle = rgba(ABYSS, 0.62);
    g.fill();
    return;
  }
  const gold = rng() < GOLD_ODDS;
  const color = gold ? L.lamp : TEAL;
  g.fillStyle = rgba(color, 0.78);
  g.fill();
  if (rng() < 0.9) lamp(out, x, y + h * 0.4, 6 + w * 1.2, color, MODES[Math.floor(rng() * MODES.length)], rng(), gold ? 0.4 : 0.34);
}

// Rows of windows between y0 and y1 every `pitch` px, on `xs` (offsets from x).
export function windows(g, out, rng, L, x, xs, y0, y1, pitch, w, h, odds) {
  for (let y = y0; y < y1; y += pitch) for (const dx of xs) win(g, out, rng, L, x + dx, y, w, h, odds);
}

// The faint light from above on the upper part of a shape: build(g) adds the outline, box is [x0, y0, x1, y1],
// washed by a gradient from alpha a at the top of the box to nothing at its foot.
export function wash(g, build, box, color = SURFACE, a = 0.3) {
  const [x0, y0, x1, y1] = box;
  g.save();
  g.beginPath();
  build(g);
  g.clip();
  g.fillStyle = lin(g, 0, y0, 0, y1, [[0, rgba(color, a)], [1, rgba(color, 0)]]);
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.restore();
}

// A row of merlons standing on y.
export function crenels(g, x0, x1, y, step, w, h) {
  for (let x = x0; x + w <= x1 + 0.1; x += step) g.fillRect(x, y - h, w, h);
}

// Coral growing along a ledge at y from x0 to x1: lumps, and now and then a fan of twigs.
export function crust(g, rng, x0, x1, y, color) {
  g.save();
  g.fillStyle = color;
  g.strokeStyle = color;
  g.lineWidth = 1.1;
  g.lineCap = 'round';
  for (let x = x0; x < x1; x += 2.5 + rng() * 4) {
    const r = 1.1 + rng() * 2.2;
    g.beginPath();
    g.arc(x, y - r * 0.5, r, 0, TAU);
    g.fill();
    if (rng() < 0.16) {
      g.beginPath();
      for (const k of [-1, 0, 1]) {
        g.moveTo(x, y - 1);
        g.lineTo(x + k * (2 + rng() * 2), y - 5 - rng() * 5);
      }
      g.stroke();
    }
  }
  g.restore();
}

// n strands of weed hanging from (x, y), len px long, swaying a little, at alpha 0.6 (fine strands read as
// haze at this distance, and their rim of light would be loud at full strength).
export function weed(g, rng, x, y, len, n, color, spread = 3) {
  g.save();
  g.strokeStyle = color;
  g.globalAlpha = 0.6;
  g.lineWidth = 1.1;
  g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const [sx, l] = [x + i * spread + (rng() - 0.5) * 2, len * (0.5 + rng() * 0.6)];
    const sway = (rng() - 0.5) * 9;
    g.moveTo(sx, y);
    g.quadraticCurveTo(sx + sway, y + l * 0.55, sx + sway * 0.3 + (rng() - 0.5) * 5, y + l);
  }
  g.stroke();
  g.restore();
}

// Moss on a ledge at y: a dark lip along it and short drooping tufts.
export function moss(g, rng, x0, x1, y, color) {
  g.fillStyle = color;
  g.fillRect(x0, y - 1, x1 - x0, 2);
  for (let x = x0 + 1; x < x1 - 1; x += 2 + rng() * 3.5) g.fillRect(x, y + 1, 1.3, 2 + rng() * 5);
}

// n barnacles scattered in a box: pale specks.
export function barnacles(g, rng, x0, y0, x1, y1, n) {
  g.fillStyle = rgba(PALE, 0.22);
  for (let i = 0; i < n; i++) g.fillRect(x0 + rng() * (x1 - x0), y0 + rng() * (y1 - y0), 1.4, 1.2);
}

// A flight of n steps climbing from (x, y) toward the right (dx > 0) or the left, each dx wide and dy high,
// its treads edged pale.
export function stairs(g, x, y, n, dx, dy) {
  g.beginPath();
  g.moveTo(x, y);
  for (let i = 0; i < n; i++) {
    g.lineTo(x + i * dx, y - (i + 1) * dy);
    g.lineTo(x + (i + 1) * dx, y - (i + 1) * dy);
  }
  g.lineTo(x + n * dx, y);
  g.closePath();
  g.fill();
  g.save();
  g.strokeStyle = rgba(PALE, 0.2);
  g.lineWidth = 0.8;
  g.beginPath();
  for (let i = 0; i < n; i++) {
    g.moveTo(x + i * dx, y - (i + 1) * dy);
    g.lineTo(x + (i + 1) * dx, y - (i + 1) * dy);
  }
  g.stroke();
  g.restore();
}
