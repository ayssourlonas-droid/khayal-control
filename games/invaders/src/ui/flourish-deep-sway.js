// Flourishes (contract in flourish.js) for what sways on Lantern Deep's mid and near layers, each found through
// the signs its layer left (parallax-deep-mid-kelp.js, parallax-deep-reef-life.js). 'kelpsway' draws the kelp
// forest's hero strands, each a chain of three baked segments rotated one on the other, with a wave running
// through the forest and a slow current leaning it. 'reefsway' draws the reef's anemones (tentacles fanning
// and swaying), the tufts of sea grass (sheared at the top), and the tube worms' crowns, which now and then
// draw into their tubes and come out again. Sprites in flourish-deep-sway-sprites.js. All of it is a pure
// function of t.
import { W, hash } from './sprites.js';
import { layerX } from './parallax.js';
import { smooth } from '../core/math.js';
import { SEG, TENT, TUFT, CROWN, kelpSegs, tentacle, tuft, crown, warmSprites } from './flourish-deep-sway-sprites.js';

const signs = (v, layer, key) => (v.cache[key + layer] ??= v.layers[layer]?.signs.filter((s) => s[key]) ?? []);

// The kelp's motion: a wave of angular speed SPEED running through the stand at TRAVEL rad a px, each segment
// swinging AMP rad more than the one below, the whole stand leaning LEAN rad with the slow current.
export const KELP = { speed: 1.05, travel: 0.0055, amp: 0.07, lean: 0.05, reach: 150 };

// A strand's angles, foot to tip: each segment's turn relative to the one below it.
export function kelpAngles(s, t) {
  const lean = Math.sin(t * 0.31 + s.x * 0.0017) * KELP.lean;
  return [0, 1, 2].map((i) => (i ? 0 : lean) + KELP.amp * (0.7 + 0.45 * i) * Math.sin(t * KELP.speed - s.x * KELP.travel + s.ph * 0.3 + i * 0.9));
}

// Hero strands of kelp swaying: each is three segments hung one above the other (about 3 images a strand).
function kelpsway(ctx, { v, t }, x0, top) {
  const list = signs(v, 1, 'kelp');
  if (!list.length) return;
  ctx.save();
  for (const s of list) {
    const x = x0 + s.x;
    if (x < -KELP.reach || x > W + KELP.reach) continue;
    const segs = kelpSegs(s.k);
    const angles = kelpAngles(s, t);
    ctx.save();
    ctx.translate(x, top + s.y);
    ctx.scale(s.h / (SEG.n * SEG.h), s.h / (SEG.n * SEG.h));
    for (let i = 0; i < SEG.n; i++) {
      ctx.rotate(angles[i]);
      ctx.drawImage(segs[i], -SEG.px, -SEG.py);
      ctx.translate(0, -(SEG.h - SEG.overlap));
    }
    ctx.restore();
  }
  ctx.restore();
}

// How far a tube worm's crown is open at t, 1 open .. 0.2 drawn in: a worm has a cycle of its own, in which it
// pulls in fast, waits, and comes out slowly.
export function wormOpen(t, s) {
  const period = 9 + s.ph * 9;
  const u = (((t + s.ph * period * 3.7) % period) + period) % period;
  if (u < 0.35) return 1 - 0.8 * smooth(u / 0.35);
  if (u < 1.3) return 0.2;
  if (u < 2.9) return 0.2 + 0.8 * smooth((u - 1.3) / 1.6);
  return 1;
}

// Anemones: each tentacle fans out from the disc at its own angle and sways about it.
function anemones(ctx, v, t, x0, top) {
  for (const s of signs(v, 2, 'anemone')) {
    const x = x0 + s.x;
    if (x < -120 || x > W + 120) continue;
    const img = tentacle(s.k);
    const sc = s.r / 22;
    for (let i = 0; i < s.n; i++) {
      const u = s.n > 1 ? i / (s.n - 1) - 0.5 : 0;
      ctx.save();
      ctx.translate(x + u * s.r * 1.4, top + s.y);
      ctx.rotate(u * 1.7 + Math.sin(t * 1.25 + s.ph + i * 0.9) * 0.13 + Math.sin(t * 0.5 + s.x * 0.003) * 0.05);
      ctx.scale(sc * (0.88 + 0.24 * hash(s.k * 7 + i)), sc * (0.88 + 0.24 * hash(s.k * 7 + i + 40)));
      ctx.drawImage(img, -TENT.px, -TENT.py);
      ctx.restore();
    }
  }
}

// Sea grass: a tuft is one image sheared sideways, so its foot stays put and its tips swing.
function grass(ctx, v, t, x0, top) {
  for (const s of signs(v, 2, 'grass')) {
    const x = x0 + s.x;
    if (x < -90 || x > W + 90) continue;
    const sc = s.h / 70;
    ctx.save();
    ctx.translate(x, top + s.y);
    ctx.transform(1, 0, Math.sin(t * 1.1 + s.ph + s.x * 0.004) * 0.2 + Math.sin(t * 0.37 + s.x * 0.002) * 0.08, 1, 0, 0);
    ctx.scale(sc, sc);
    ctx.drawImage(tuft(s.k), -TUFT.px, -TUFT.py);
    ctx.restore();
  }
}

// Tube worms' crowns, open and fanned, drawn in (squashed and faint) now and then.
function worms(ctx, v, t, x0, top) {
  for (const s of signs(v, 2, 'worm')) {
    const x = x0 + s.x;
    if (x < -80 || x > W + 80) continue;
    const open = wormOpen(t, s);
    ctx.save();
    ctx.translate(x, top + s.y);
    ctx.globalAlpha = 0.3 + 0.7 * open;
    ctx.scale(s.s * (0.55 + 0.45 * open), s.s * open);
    ctx.drawImage(crown(s.k), -CROWN.px, -CROWN.py);
    ctx.restore();
  }
}

// The reef sways: anemones, sea grass and tube worms (about 40 images at most).
function reefsway(ctx, { v, t, world }) {
  const layer = v.layers[2];
  if (!layer) return;
  const x0 = layerX(layer, world?.ship?.x ?? W / 2);
  ctx.save();
  anemones(ctx, v, t, x0, layer.top);
  grass(ctx, v, t, x0, layer.top);
  worms(ctx, v, t, x0, layer.top);
  ctx.restore();
}

// Paint the sprites these draw, so none is baked mid-fight (the view calls it as the level's view is built).
export const warmSway = warmSprites;

export const FLOURISH_SWAY = { kelpsway: { mid: kelpsway }, reefsway: { near: reefsway } };
