// Parallax silhouettes (adapted from Barrage): each layer is a band standing on the bottom of the
// frame, baked once per level, and shifted sideways against the ship's x so the world has depth as
// the ship flies, pixelated (sprites.js). A layer may carry lights (fire, the ground line's glow) that
// pulse on top.
//   buildLayers(look, level): the level's list in look.landmarks, on the level's seed
//   layers[i] = { kind, color, height (a multiple of PIXEL), speed 0 far .. 1 near, roughness?,
//                 rim?, haze?, and the tones its painter reads (a landmark's lit, ink, fire...) }
import { W, H, PIXEL, makeCanvas, rgba, shade, glow, lin, pixelate } from './sprites.js';
import { makeRng } from '../core/rng.js';
import { paintLayer } from './parallax-shapes.js';

const MARGIN = 160; // spare width each side, so a shift never shows an edge
const SHIFT = 0.15; // px of layer shift per px of ship offset, at speed 1

export function buildLayers(look, level) {
  const seed = level.seed ?? 1;
  return look.landmarks[level.landmark].map((L, i) => {
    const w = W + MARGIN * 2;
    const h = L.height;
    const c = makeCanvas(w, h);
    const g = c.getContext('2d');
    const lights = [];
    paintLayer(g, w, h, makeRng(seed * 101 + i * 7), L, lights);
    for (const p of lights) p.sprite = glow(p.color);
    // atmospheric haze: far layers fade toward the horizon colour at their tops
    const hazeAmt = L.haze ?? Math.max(0.06, 0.4 - L.speed * 0.7);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = lin(g, 0, 0, 0, h, [[0, rgba(look.haze, hazeAmt)], [0.7, rgba(look.haze, hazeAmt * 0.2)], [1, rgba(look.haze, 0)]]);
    g.fillRect(0, 0, w, h);
    // a thin lit rim along every top edge gives the silhouettes definition
    const rim = makeCanvas(w, h);
    const r = rim.getContext('2d');
    r.drawImage(c, 0, 0);
    r.globalCompositeOperation = 'source-in';
    r.fillStyle = L.rim ?? shade(L.color, 0.28);
    r.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-over';
    g.drawImage(rim, 0, -PIXEL);
    g.globalCompositeOperation = 'source-over';
    return { canvas: pixelate(c), top: H - h, speed: L.speed, lights, far: i === 0 };
  });
}

// Layer L's left edge for this ship x.
const layerX = (L, shipX) => -MARGIN - (shipX - W / 2) * L.speed * SHIFT;

function drawLights(ctx, L, x0, t) {
  ctx.globalCompositeOperation = 'lighter';
  for (const p of L.lights) {
    const x = x0 + p.x;
    if (x + p.r < 0 || x - p.r > W) continue; // the layer is wider than the frame
    ctx.globalAlpha = (0.55 + 0.45 * Math.sin(t * 2.2 + p.ph * 6)) * p.a;
    ctx.drawImage(p.sprite, x - p.r, L.top + p.y - p.r, p.r * 2, p.r * 2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Draw every layer, far to near. quality < 1 drops the far layer's glow.
export function drawLayers(ctx, layers, shipX, t, quality) {
  for (const L of layers) {
    const x0 = layerX(L, shipX);
    ctx.drawImage(L.canvas, x0, L.top);
    if (L.lights.length && !(L.far && quality < 1)) drawLights(ctx, L, x0, t);
  }
}
