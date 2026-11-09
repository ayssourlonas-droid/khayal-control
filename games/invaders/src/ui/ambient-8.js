// Ambient kinds of Glass Cathedral (same contract as ambient.js): dust motes hanging in the slanting shafts of coloured light
// (dustmotes: each mote belongs to one of the five shafts of flourish-glass.js, drifts up in it, and glows as the shaft does);
// glints of drifting glass (glassglints: tiny jewel-coloured shards falling and turning, each catching the light for a
// moment now and then); and sparks rising from the candle stands of the near layer (candlesparks: warm, small, dim, gone
// in a second). All of it is dim on purpose: the bullets, the pickups and the ship are the loudest things on screen, so no
// mote is a bright dot, no glint is a star at full strength, and nothing here is the bullets' acid lime or anything near
// it: the colours are gold, rose, cobalt and violet. What is big and slow is in flourish-glass.js and -2.js.
import { W, H, hash, wrap, cached, glow, soft, star, rgba, mix, lin } from './sprites.js';
import { TAU, clamp } from '../core/math.js';
import { SHAFTS, shaftAt } from './flourish-glass.js';
import { STANDS, BED, NEAR_H } from './parallax-glass-near.js';

const SALT = { sky: 0, mid: 4001, front: 9001, screen: 13001 }; // so one kind in two phases does not repeat its pattern
export const MOTE = { scale: 3.2, rise: 0.8, lean: 0.14 }; // a mote is `scale` times its size across; how fast it climbs, of the entry's speed; how far a shaft's width grows per px of its length
export const SHARD = { box: 20, spin: 0.9, fall: 1 }; // sprite size; rad/s a shard turns at most; the share of the entry's speed it falls at
export const SPARK = { life: 2.6, rise: 64, sway: 7 }; // s a spark lives; px it climbs; px it wanders

// A shard of glass, 20 x 20: a lopsided triangle of jewel glass, brighter toward one corner, a thin lead edge and a pale line
// of light along its longest side.
export const shard = (color) => cached('glassfxShard' + color, SHARD.box, SHARD.box, (g, w) => {
  g.beginPath();
  g.moveTo(2.5, w - 4);
  g.lineTo(w * 0.62, 2.2);
  g.lineTo(w - 2.5, w * 0.7);
  g.closePath();
  g.fillStyle = lin(g, 2, w, w, 2, [[0, rgba(mix(color, '#000000', 0.45), 0.8)], [1, rgba(mix(color, '#ffffff', 0.25), 0.95)]]);
  g.fill();
  g.strokeStyle = 'rgba(12,6,28,0.6)';
  g.lineWidth = 1;
  g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.55)';
  g.lineWidth = 0.9;
  g.beginPath();
  g.moveTo(4, w - 5.4);
  g.lineTo(w * 0.6, 3.6);
  g.stroke();
});

// Motes in the shafts: mote i is in shaft i % 5, at a place along it and a distance across it (within its width there), climbing
// slowly and wrapping at the foot of the shaft's reach; brighter when the shaft is strong, with a twinkle of its own.
const SHAFTS_AT = Array.from({ length: SHAFTS.n }, () => ({})); // scratch: the shafts at this frame's t
function dustmotes(ctx, a, t) {
  const [s0, s1] = a.size;
  const salt = SALT[a.phase] ?? 0;
  const reach = H * (a.maxY ?? 0.7);
  const p = SHAFTS_AT;
  for (let i = 0; i < SHAFTS.n; i++) shaftAt(i, t, p[i]);
  ctx.save();
  for (let i = 0; i < a.n; i++) {
    const k = i * 5 + salt;
    const sh = p[i % SHAFTS.n];
    const size = (s0 + (s1 - s0) * hash(k + 14)) * MOTE.scale;
    const y = wrap(hash(k + 13) * reach - t * a.speed * MOTE.rise * (0.6 + 0.8 * hash(k + 11)), -30, reach);
    const along = (y + 40) / Math.cos(sh.rot);
    const across = (hash(k + 12) - 0.5) * 2 * (28 * sh.scale + along * MOTE.lean * sh.scale) + Math.sin(t * 0.5 + hash(k + 15) * TAU) * 6;
    const x = sh.x - Math.sin(sh.rot) * along + Math.cos(sh.rot) * across;
    const tw = 0.5 + 0.5 * Math.sin(t * (0.7 + 1.3 * hash(k + 16)) + hash(k + 15) * TAU);
    ctx.globalAlpha = a.alpha * (0.3 + 0.7 * sh.strength) * (0.4 + 0.6 * tw) * clamp(Math.min(y + 30, reach - y) / 80, 0, 1);
    ctx.drawImage(soft(a.colors[i % a.colors.length]), x - size / 2, y - size / 2, size, size);
  }
  ctx.restore();
}

// Shards falling slowly, turning end over end at their own rates, swaying, each catching the light now and then: a small
// four-point glint at its middle for a moment. Fading in at the top of the frame and out at the foot.
function glassglints(ctx, a, t, drift) {
  const [s0, s1] = a.size;
  const salt = SALT[a.phase] ?? 0;
  ctx.save();
  for (let i = 0; i < a.n; i++) {
    const k = i * 5 + salt;
    const h = hash(k + 11);
    const ph = hash(k + 15) * TAU;
    const size = s0 + (s1 - s0) * hash(k + 14);
    const y = wrap(hash(k + 13) * (H + 80) + t * a.speed * SHARD.fall * (0.6 + 0.8 * h), -40, H + 40);
    const x = wrap(hash(k + 12) * (W + 200) - 100 + drift * 0.3 + Math.sin(t * 0.4 + ph) * 26, -100, W + 100);
    const fade = clamp(Math.min(y + 40, H + 40 - y) / 90, 0, 1);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * SHARD.spin * (h - 0.5) * 2 + ph);
    ctx.scale(Math.cos(t * 0.8 * (0.5 + h) + ph) * 0.7 + 0.3, 1);
    ctx.globalAlpha = a.alpha * fade * (0.6 + 0.4 * Math.sin(t + ph));
    ctx.drawImage(shard(a.colors[i % a.colors.length]), -size / 2, -size / 2, size, size);
    ctx.restore();
    const catch_ = Math.max(0, Math.sin(t * (0.6 + 0.5 * h) + ph * 3)) ** 24;
    if (catch_ > 0.04) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a.alpha * 0.9 * catch_ * fade;
      ctx.drawImage(star('#d8e4ff'), x - size * 0.9, y - size * 0.9, size * 1.8, size * 1.8);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  ctx.restore();
}

// Sparks rising from the candle stands: spark i belongs to stand i % 3, lives SPARK.life seconds (offset by its own phase), climbs
// SPARK.rise px over it, wandering a little, flickering and fading as it goes; additive and warm. The stands' places come
// from the near layer (parallax-glass-near.js) and follow it as the ship moves.
function candlesparks(ctx, a, t, drift, wind, world) {
  const [s0, s1] = a.size;
  const salt = SALT[a.phase] ?? 0;
  const shift = -((world?.ship?.x ?? W / 2) - W / 2) * 0.55 * 0.15;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < a.n; i++) {
    const k = i * 5 + salt;
    const [sx, sh] = STANDS[i % STANDS.length];
    const u = (t / SPARK.life + hash(k + 15)) % 1;
    const size = (s0 + (s1 - s0) * hash(k + 14)) * 3.4;
    const x = sx - 160 + shift + (hash(k + 12) - 0.5) * 22 + Math.sin(t * 2 + hash(k + 13) * TAU) * SPARK.sway * u;
    const y = H - NEAR_H + BED - sh - 24 - u * SPARK.rise * (0.6 + 0.8 * hash(k + 11));
    ctx.globalAlpha = a.alpha * (1 - u) ** 1.5 * (0.6 + 0.4 * Math.sin(t * 13 + i * 3.7));
    ctx.drawImage(glow(a.colors[i % a.colors.length]), x - size / 2, y - size / 2, size, size);
  }
  ctx.restore();
}

// Paint the sprites a look's entries draw, so none is baked mid-fight (the coordinator calls it).
export function warmGlassAmbient(look) {
  for (const a of look.ambient) {
    const make = { dustmotes: soft, glassglints: shard, candlesparks: glow }[a.kind];
    if (make) a.colors.forEach((c) => make(c));
    if (a.kind === 'glassglints') star('#d8e4ff');
  }
}

export const AMBIENT8 = { dustmotes, glassglints, candlesparks };
