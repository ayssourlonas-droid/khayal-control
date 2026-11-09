// Bakes world 17's parallax layers (heal-view.js crossfades them): per layer a smog canvas, a clean twin and, if the look asks
// (layer.over), a green overlay of trees, lawns and flowers on a transparent ground. The painters (parallax-smog.js, kinds
// in look.layers[i].kind) are called as paint(g, w, h, rng, L, out, mode), mode 'smog' | 'clean' | 'over', each time with a
// fresh rng of the same seed: the smog and clean passes must draw one silhouette (use the rng the same way in every mode;
// only colours and extra detail differ), and 'over' draws only what grows back. Lights and signs are collected from the smog
// pass alone. The haze that fades a layer's top toward the horizon and the thin lit rim along its top edge are the generic
// layers' (finishLayer, parallax.js), in each mode's own colours: look.haze / look.hazeClean, L.rim / L.rimClean.
// Nine big canvases a look, so they are baked once and shared: the world's painters take no rng (their plans are fixed data),
// so the bake depends on the look alone, not on the level's seed, and every view of it (the title backdrop, play, the trailer,
// the posters) draws the same read-only canvases. Each view gets layer records of its own, which hold its heal state and,
// made on demand, its mix canvas (heal-view.js). A painter that did use its rng would have to be keyed by the seed as well.
import { W, H, makeCanvas } from './sprites.js';
import { makeRng } from '../core/rng.js';
import { MARGIN, finishLayer } from './parallax.js';
import { SMOG } from './parallax-smog.js';

const LAYER_W = W + MARGIN * 2;

function bake(look, L, i, seed, mode, w, h, out) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  g.fillStyle = mode === 'clean' ? L.colorClean : L.color;
  SMOG[L.kind](g, w, h, makeRng(seed * 101 + i * 7), L, out, mode);
  if (mode !== 'over') finishLayer(c, w, h, L, out, look, mode);
  return c;
}

let baked = null; // the last look's layers: { look, layers }, a slot of one

function bakeLayers(look, seed) {
  if (baked?.look !== look) {
    const layers = look.layers.map((L, i) => {
      const out = { lights: [], signs: [] };
      const canvas = bake(look, L, i, seed, 'smog', LAYER_W, L.height, out);
      const clean = bake(look, L, i, seed, 'clean', LAYER_W, L.height, { lights: [], signs: [] });
      const over = L.over ? bake(look, L, i, seed, 'over', LAYER_W, L.height, { lights: [], signs: [] }) : null;
      return { canvas, clean, over, top: H - L.height, speed: L.speed, lights: out.lights, signs: out.signs, far: i === 0 };
    });
    baked = { look, layers };
  }
  return baked.layers;
}

export const buildHealLayers = (look, seed, heal) => bakeLayers(look, seed).map((B) => ({ ...B, heal }));
