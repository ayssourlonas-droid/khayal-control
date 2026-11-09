// Bunkers drawn from their pixel masks, so every carve shows: each bunker is baked into its own
// small canvas (lit rim on top and left edges, shadow on the others, the world's texture inside)
// and re-baked only when its count of solid pixels changes (carving only ever removes pixels).
// Colours: look.bunker { fill, light, dark, edge, accent?, skin } (skin: bunker-skins.js).
import { makeCanvas, rgb, glow } from './sprites.js';
import { SKINS } from './bunker-skins.js';
import { createBunker } from '../core/bunkers.js';

const baked = new WeakMap(); // bunker -> { canvas, count, look }
const whole = new Map(); // w * 1000 + h -> the solid pixels of a bunker of that size before any carve

// The share of the bunker shot away so far, 0 to 1: the skin of a world that soils as it wears reads it as P.worn.
function wornShare(b, count) {
  const key = b.w * 1000 + b.h;
  if (!whole.has(key)) whole.set(key, createBunker(0, 0, b.w, b.h).solid);
  return Math.max(0, 1 - count / whole.get(key));
}

function bake(b, look, count, canvas) {
  const { w, h, mask } = b;
  const g = canvas.getContext('2d');
  const img = g.createImageData(w, h);
  const P = { worn: wornShare(b, count) };
  for (const k of ['fill', 'light', 'dark', 'edge', 'accent']) P[k] = rgb(look.bunker[k] ?? look.bunker.light);
  const { light, dark, edge } = P;
  const skin = SKINS[look.bunker.skin] ?? SKINS.plain;
  const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x] === 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      let [c, k] = skin(x, y, w, h, P);
      if (!at(x, y - 1) || !at(x - 1, y)) [c, k] = [edge, 0];
      else if (!at(x, y - 2) || !at(x - 2, y)) [c, k] = [light, 0];
      else if (!at(x, y + 1) || !at(x + 1, y) || !at(x, y + 2)) [c, k] = [dark, 0];
      const i = (y * w + x) * 4;
      const toward = k >= 0 ? light : dark;
      const a = Math.abs(k);
      img.data[i] = c[0] + (toward[0] - c[0]) * a;
      img.data[i + 1] = c[1] + (toward[1] - c[1]) * a;
      img.data[i + 2] = c[2] + (toward[2] - c[2]) * a;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  baked.set(b, { canvas, count, look });
  return canvas;
}

export function drawBunkers(ctx, world, look) {
  for (const b of world.bunkers) {
    const count = b.solid;
    if (!count) continue;
    const e = baked.get(b);
    const canvas = e && e.count === count && e.look === look ? e.canvas : bake(b, look, count, e?.canvas ?? makeCanvas(b.w, b.h));
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.18 * (count / (b.w * b.h * 0.8));
    ctx.drawImage(glow(look.bunker.edge), b.x - 30, b.y - 40, b.w + 60, b.h + 80);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(canvas, b.x, b.y);
  }
}
