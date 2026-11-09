// How the healing of world 17 reaches the screen (heal.js holds h): the sky and every parallax layer exist twice, baked once
// each as a smog and as a clean morning, and the view crossfades them by alpha; nothing is re-baked from the painters while h moves.
//   drawHealSky(ctx, sky, heal)     the clean sky (heal.sky) under the smog sky at alpha 1 - stage(h, 'smog')
//   drawHealLayer(ctx, L, x0)       a layer: its clean twin, the smog layer over it at that alpha (the two twins share one
//                                   silhouette, painted from the same seed, so no sky shows through between), then its
//                                   green overlay (trees, lawns, flowers; L.over) at stage(h, 'green')
//   lightsK(L)                      how strongly a layer's window lights show: they fade as the smog does (1 for a layer with no heal)
// A crossfade is three big blits where a plain layer is one, and h is between 0 and 1 for nearly all of the world's play, so the
// blend is composed into a canvas of its own (a mix) and a frame draws that: one blit, like any other world. A mix is re-composed
// only when the amounts it holds change by a step (1/64 of a share, too small to see), and at most one is re-composed a frame
// (heal.work), so the sky and the three layers take their turns and no frame pays for more than one crossfade. At h 0 the smog
// layer is drawn as it is. healSkies(look, level) bakes the two skies. L.heal is the view's heal state; parallax.js calls the
// layer functions for a layer that carries one.
import { stage } from './heal.js';
import { buildSky } from './sky.js';
import { W, H, makeCanvas } from './sprites.js';

export const STEPS = 64;
const steps = (v) => Math.round(v * STEPS);

// Compose one mix: the clean twin whole, the smog twin over it at smog share a, the green overlay (or null) at share g.
export function compose(g, w, h, clean, smog, over, a, green) {
  g.clearRect(0, 0, w, h);
  g.globalAlpha = 1;
  g.drawImage(clean, 0, 0);
  if (a > 0.001) {
    g.globalAlpha = a;
    g.drawImage(smog, 0, 0);
  }
  if (over && green > 0.001) {
    g.globalAlpha = green;
    g.drawImage(over, 0, 0);
  }
  g.globalAlpha = 1;
}

// The mix for these amounts: the one already composed if it holds them, a new composition if this frame has not paid for one yet
// (or there is none at all), else the stale one for a frame more.
function mixFor(owner, heal, w, h, key, parts, a, green) {
  let m = owner.mix;
  if (m && m.key === key) return m.canvas;
  if (m && heal.work >= 1) return m.canvas;
  m ??= owner.mix = { canvas: makeCanvas(w, h), key: -1 };
  compose(m.canvas.getContext('2d'), w, h, parts[0], parts[1], parts[2], a, green);
  m.key = key;
  heal.work += 1;
  return m.canvas;
}

const SKY = [null, null, null];
export function drawHealSky(ctx, sky, heal) {
  const a = 1 - stage(heal.h, 'smog');
  const qa = steps(a);
  if (qa >= STEPS) {
    ctx.drawImage(sky, 0, 0);
    return;
  }
  SKY[0] = heal.sky;
  SKY[1] = sky;
  ctx.drawImage(mixFor(heal, heal, W, H, qa, SKY, qa / STEPS, 0), 0, 0);
}

const LAYER = [null, null, null];
export function drawHealLayer(ctx, L, x0) {
  const { heal } = L;
  const a = 1 - stage(heal.h, 'smog');
  const green = L.over ? stage(heal.h, 'green') : 0;
  const [qa, qg] = [steps(a), steps(green)];
  if (qa >= STEPS && qg === 0) {
    ctx.drawImage(L.canvas, x0, L.top);
    return;
  }
  LAYER[0] = L.clean;
  LAYER[1] = L.canvas;
  LAYER[2] = L.over;
  ctx.drawImage(mixFor(L, heal, L.canvas.width, L.canvas.height, qa * (STEPS + 1) + qg, LAYER, qa / STEPS, qg / STEPS), x0, L.top);
}

export const lightsK = (L) => (L.heal ? 1 - 0.75 * stage(L.heal.h, 'smog') : 1);

// The clean morning's sky: the same builder as the smog sky (sky.js) on the look's cleanSky gradient and cleanBody.
const buildCleanSky = (look, level) => buildSky({ ...look, sky: look.cleanSky, body: look.cleanBody }, level);

// The look's two skies { smog, clean }, baked once and shared by every view of it (the title backdrop, play, the trailer, the
// posters): the sky bodies take neither the level nor a seed, and a view only reads these canvases. A slot of one.
let skies = null;
export function healSkies(look, level) {
  if (skies?.look !== look) skies = { look, smog: buildSky(look, level), clean: buildCleanSky(look, level) };
  return skies;
}
