// Parallax silhouettes (adapted from Barrage): each layer is a band standing on the bottom of the
// frame, baked once per level, and shifted sideways against the ship's x so the world has depth as
// the ship flies. A layer may carry lights (windows, signs, fires, eyes) that animate on top.
//   look.layers[i] = { kind, color, height, speed 0 far .. 1 near, roughness, rim?, haze? }
import { W, H, makeCanvas, rgba, shade, glow, lin } from './sprites.js';
import { makeRng } from '../core/rng.js';
import { paintLayer } from './parallax-shapes.js';
import { lightAt } from './aurora-model.js';
import { drawHealLayer, lightsK } from './heal-view.js';

export const MARGIN = 160; // spare width each side, so a shift never shows an edge
const SHIFT = 0.15; // px of layer shift per px of ship offset, at speed 1

// The tail of a baked layer, over everything painted on c so far: the lights get their glow sprites; the atmospheric haze fades
// far layers toward the horizon colour at their tops; a thin lit rim along every top edge gives the silhouettes definition.
// mode 'clean' (world 17's twin, heal-layers.js) takes the look's and layer's clean haze, rim and colour in place of the smog ones;
// its lights are thrown away, so they get no sprites.
export function finishLayer(c, w, h, L, out, look, mode = 'smog') {
  const clean = mode === 'clean';
  if (!clean) for (const p of out.lights) p.sprite = glow(p.color);
  const amt = L.haze ?? Math.max(0.06, 0.4 - L.speed * 0.7);
  const [haze, hazeAmt] = clean ? [look.hazeClean, L.hazeClean ?? amt] : [look.haze, amt];
  const g = c.getContext('2d');
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, rgba(haze, hazeAmt)], [0.7, rgba(haze, hazeAmt * 0.2)], [1, rgba(haze, 0)]]);
  g.fillRect(0, 0, w, h);
  const rim = makeCanvas(w, h);
  const r = rim.getContext('2d');
  r.drawImage(c, 0, 0);
  r.globalCompositeOperation = 'source-in';
  r.fillStyle = (clean ? L.rimClean : L.rim) ?? shade(clean ? L.colorClean : L.color, 0.28);
  r.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-over';
  g.drawImage(rim, 0, -2);
  g.globalCompositeOperation = 'source-over';
}

export function buildLayers(look, seed) {
  return look.layers.map((L, i) => {
    const w = W + MARGIN * 2;
    const h = L.height;
    const c = makeCanvas(w, h);
    const out = { lights: [], signs: [] };
    paintLayer(c.getContext('2d'), w, h, makeRng(seed * 101 + i * 7), L, out);
    finishLayer(c, w, h, L, out, look);
    return { canvas: c, top: H - h, speed: L.speed, lights: out.lights, signs: out.signs, far: i === 0 };
  });
}

// Layer i's left edge for this ship x.
export const layerX = (L, shipX) => -MARGIN - (shipX - W / 2) * L.speed * SHIFT;

const MODES = {
  steady: () => 1,
  pulse: (t, p) => 0.55 + 0.45 * Math.sin(t * 2.2 + p.ph * 6),
  blink: (t, p) => ((t * 0.8 + p.ph) % 1 < 0.18 ? 1 : 0.08),
  flicker: (t, p) => 0.6 + 0.25 * Math.sin(t * 13 + p.ph * 40) + 0.15 * Math.sin(t * 31 + p.ph * 9),
  aurora: (t, p) => 0.12 + 0.88 * lightAt(p.x - MARGIN, t), // follows the aurora overhead (Aurora Kingdom)
};

export function drawLights(ctx, L, x0, t, alpha = 1) {
  ctx.globalCompositeOperation = 'lighter';
  for (const p of L.lights) {
    const x = x0 + p.x;
    if (x + p.r < 0 || x - p.r > W) continue; // the layer is wider than the frame
    ctx.globalAlpha = Math.max(0, MODES[p.mode](t, p)) * (p.a ?? 1) * alpha;
    ctx.drawImage(p.sprite, x - p.r, L.top + p.y - p.r, p.r * 2, p.r * 2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Draw every layer, far to near. quality < 1 drops the far layer's glow. between(i, x0, top) runs
// after layer i (flourishes that live at that depth).
export function drawLayers(ctx, layers, shipX, t, quality, between) {
  layers.forEach((L, i) => {
    const x0 = layerX(L, shipX);
    if (L.heal) drawHealLayer(ctx, L, x0); // world 17: the smog and clean twins crossfaded by the healing (heal-view.js)
    else ctx.drawImage(L.canvas, x0, L.top);
    if (L.lights.length && !(L.far && quality < 1)) drawLights(ctx, L, x0, t, lightsK(L));
    if (between) between(i, x0, L.top);
  });
}
