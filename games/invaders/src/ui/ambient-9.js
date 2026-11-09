// Ambient kinds of World 17, Ash to Air (same contract as ambient.js, plus the healing h in 0..1 as a seventh argument, heal.js):
//   ashfall      flakes of ash falling like grey snow, slowly, drifting with the wind and tumbling (three small shapes in the
//                entry's greys). They thin as the city heals: the first ceil(n x (1 - stage(h, 'ash'))) flakes are drawn and
//                the last one fades, so it dwindles to nothing by h 0.75. Alpha stays at the entry's, at most about 0.34.
//   smokewisps   wide faint ribbons of smoke curling slowly across the middle distance (three curls, sheared and mirrored),
//                fewer and fainter as stage(h, 'wisps') rises.
//   pollen       soft additive motes of pollen and seed fluff drifting up and sideways in the morning light; none until
//                stage(h, 'life') begins, then more; pale warm white-gold, tiny, at most 0.4.
// Stateless: a particle's place is a function of its index, t, `drift` and h; nothing is simulated and nothing is
// allocated per frame. All of it is dim, soft and small on purpose: the bullets are hot magenta and small, and nothing here is
// bright, round or magenta. The sprites are ambient-9-sprites.js (warmSmogAmbient bakes them ahead of the fight).
import { W, H, hash, wrap, glow } from './sprites.js';
import { TAU, clamp } from '../core/math.js';
import { stage } from './heal.js';
import { flake, ribbon, seed, FLAKE, RIBBON, SEED } from './ambient-9-sprites.js';

const SALT = { sky: 0, mid: 4001, front: 9001, screen: 13001 }; // so one kind in two phases does not repeat its pattern
export const MAX = 60; // draw calls an entry makes at most
export const ASH = { scale: 4.4, sway: 30, spin: 1.1 }; // a flake's box is `scale` times its size; px it wanders; rad/s it turns at most
export const WISP = { drift: 0.5, bob: 16 }; // share of the entry's drift a wisp follows; px it bobs
export const POLLEN = { scale: 4.6, rise: 0.9, seedEvery: 6 }; // a mote's glow is `scale` times its size; its climb, of the speed; every n-th is a seed

const SHAPE_OF = [0, 0, 2, 0, 1, 0, 2, 0, 0, 1]; // which flake shape the i-th is: mostly specks, now and then a sliver or a curl

// How many of `n` particles are drawn when `left` of them remain (a share 0..1), and how strongly the last one: the count, then the last one's fade.
const count = (n, left) => Math.ceil(Math.min(n, MAX) * left - 1e-6);
const lastFade = (n, left, i, c) => (i === c - 1 ? Math.min(1, Math.min(n, MAX) * left - (c - 1)) : 1);

function ashfall(ctx, a, t, drift, wind, world, h = 0) {
  const left = 1 - stage(h, 'ash');
  const c = count(a.n, left);
  if (c <= 0) return;
  const s0 = a.size[0];
  const s1 = a.size[1];
  const salt = SALT[a.phase] ?? 0;
  ctx.save();
  for (let i = 0; i < c; i++) {
    const k = i * 5 + salt;
    const q = hash(k + 11);
    const ph = hash(k + 15) * TAU;
    const size = (s0 + (s1 - s0) * hash(k + 14)) * ASH.scale;
    const y = wrap(hash(k + 13) * (H + 120) + t * a.speed * (0.55 + 0.7 * q), -60, H + 60);
    const x = wrap(hash(k + 12) * (W + 300) - 150 + drift * (0.25 + 0.4 * q) + Math.sin(t * 0.45 * (0.6 + q) + ph) * ASH.sway, -150, W + 150);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * ASH.spin * (q - 0.5) * 2 + ph);
    ctx.scale(0.4 + 0.6 * Math.abs(Math.cos(t * 0.7 * (0.5 + q) + ph)), 1);
    ctx.globalAlpha = a.alpha * (0.5 + 0.5 * q) * clamp(Math.min(y + 60, H + 60 - y) / 120, 0, 1) * lastFade(a.n, left, i, c);
    ctx.drawImage(flake(SHAPE_OF[i % SHAPE_OF.length], a.colors[i % a.colors.length]), -size / 2, -size / 2, size, size);
    ctx.restore();
  }
  ctx.restore();
}

function smokewisps(ctx, a, t, drift, wind, world, h = 0) {
  const left = 1 - stage(h, 'wisps');
  const c = count(a.n, left);
  if (c <= 0) return;
  const s0 = a.size[0];
  const s1 = a.size[1];
  const salt = SALT[a.phase] ?? 0;
  ctx.save();
  for (let i = 0; i < c; i++) {
    const k = i * 5 + salt;
    const q = hash(k + 11);
    const ph = hash(k + 15) * TAU;
    const w = s0 + (s1 - s0) * hash(k + 14);
    const x = wrap(hash(k + 12) * (W + w * 2) - w + t * a.speed * (0.5 + q) + drift * WISP.drift, -w, W + w);
    const y = hash(k + 13) * H * a.maxY + Math.sin(t * 0.13 + ph) * WISP.bob;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale((hash(k + 16) < 0.5 ? -1 : 1) * (1 + 0.07 * Math.sin(t * 0.21 + ph)), 1);
    ctx.globalAlpha = a.alpha * (0.62 + 0.38 * Math.sin(t * 0.17 + ph * 2)) * lastFade(a.n, left, i, c);
    ctx.drawImage(ribbon(i % RIBBON.variants, a.colors[i % a.colors.length]), -w / 2, (-w * RIBBON.h) / RIBBON.w / 2, w, (w * RIBBON.h) / RIBBON.w);
    ctx.restore();
  }
  ctx.restore();
}

function pollen(ctx, a, t, drift, wind, world, h = 0) {
  const s = stage(h, 'life');
  if (s <= 0.001) return;
  const c = count(a.n, s); // the share that has come, where ashfall's `left` is the share still falling
  const s0 = a.size[0];
  const s1 = a.size[1];
  const salt = SALT[a.phase] ?? 0;
  const reach = H * (a.maxY ?? 0.86);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < c; i++) {
    const k = i * 5 + salt;
    const q = hash(k + 11);
    const ph = hash(k + 15) * TAU;
    const size = (s0 + (s1 - s0) * hash(k + 14)) * POLLEN.scale;
    const y = wrap(hash(k + 13) * reach - t * a.speed * POLLEN.rise * (0.4 + 0.8 * q), -30, reach);
    const x = wrap(hash(k + 12) * (W + 200) - 100 + drift * 0.25 + t * a.speed * 0.3 * q + Math.sin(t * 0.6 * (0.6 + q) + ph) * 26, -100, W + 100);
    const tw = 0.5 + 0.5 * Math.sin(t * (0.8 + 1.4 * q) + ph);
    ctx.globalAlpha = a.alpha * (0.35 + 0.65 * tw) * clamp(Math.min(y + 30, reach - y) / 90, 0, 1) * lastFade(a.n, s, i, c);
    if (i % POLLEN.seedEvery === 0) { // a seed of fluff, in ordinary blending (additive on a blue sky turns it white)
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha *= 0.8;
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t * 0.5 + ph) * 0.6);
      ctx.drawImage(seed(a.colors[i % a.colors.length]), -SEED.box * 0.55, -SEED.box * 0.55, SEED.box * 1.1, SEED.box * 1.1);
      ctx.restore();
    } else {
      ctx.drawImage(glow(a.colors[i % a.colors.length]), x - size / 2, y - size / 2, size, size);
    }
  }
  ctx.restore();
}

// Paint the sprites a look's entries draw, so none is baked mid-fight (warm-breath.js calls it).
export function warmSmogAmbient(look) {
  for (const a of look.ambient) {
    for (const c of a.colors) {
      if (a.kind === 'ashfall') for (let k = 0; k < FLAKE.shapes; k++) flake(k, c);
      if (a.kind === 'smokewisps') for (let v = 0; v < RIBBON.variants; v++) ribbon(v, c);
      if (a.kind === 'pollen') {
        glow(c);
        seed(c);
      }
    }
  }
}

export const AMBIENT9 = { ashfall, smokewisps, pollen };
