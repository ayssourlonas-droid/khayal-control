// The eighteen bosses, drawn from their baked sprites (bake.js; painters in bosses/<kind>.js).
//   drawBoss(ctx, world, look, t, q?)        world space, after the bunkers, before the aliens (so
//                                            minions launched from the boss fly over it; ruling R27)
//   drawBossLights(ctx, world, look, t, k, q?)  only the lights, at strength k: Neon Rain's darkness pass
// q is the view's quality level: below 1 the phases' rage overlays (hull-sized, purely decorative
// glow) are skipped, the biggest fill a boss frame has on a Pi.
//   partStage(p)                             0 | 1 | 2, how cracked a part is drawn (parts.js)
// Per frame, bottom to top: the hull, a module's live body behind its parts (mod.behind, own pass only), the hull's lights (the phase's own lights cross-fading in on a
// phase change), the glow round each live weak point, the parts in their states, their lights, the
// module's live extras, a charge-up on every pending warn (parts.js). Once dying, death.js draws
// the collapse instead. Per frame only drawImage of baked canvases and cached glows.
import { bossArt } from './bake.js';
import { drawDying } from './death.js';
import { halos, partBodies, partLights, warns } from './parts.js';
import { smooth } from '../../core/math.js';

export { partStage } from './parts.js';

const FADE = 0.9; // s a phase's own lights take to come up
const bossMemo = new WeakMap(); // boss -> { phase, prev, at }: when the phase last changed

// A module's live body behind its parts (mod.behind(ctx, b, t), boss coordinates, opaque art allowed: only the boss's
// own pass runs this, never the darkness pass).
function behind(ctx, b, B, t) {
  if (!B.mod.behind) return;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.globalAlpha = 1;
  B.mod.behind(ctx, b, t);
  ctx.restore();
}

function phaseMemo(b, t) {
  let m = bossMemo.get(b);
  if (!m) {
    m = { phase: b.phase, prev: -1, at: -1e9 }; // first seen: no fade (frozen frames, clones)
    bossMemo.set(b, m);
  }
  if (b.phase !== m.phase) [m.prev, m.phase, m.at] = [m.phase, b.phase, t];
  return m;
}

// The hull's lights and its phase's own lights, under the parts (not at half quality: q < 1).
function hullLights(ctx, b, B, t, k, q) {
  const h = B.hull;
  const ph = phaseMemo(b, t);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = k * (0.88 + 0.12 * Math.sin(t * 2.1));
  ctx.drawImage(h.lights, b.x + h.x0, b.y + h.y0);
  const e = smooth((t - ph.at) / FADE);
  for (const [i, a] of [[ph.phase, e], [ph.prev, 1 - e]]) {
    const img = h.rage[i];
    if (!img || a <= 0 || q < 1) continue;
    ctx.globalAlpha = k * a;
    ctx.drawImage(img, b.x + h.x0, b.y + h.y0);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Everything lit above the part bodies: their lights, the module's live extras, the charge-ups.
// `own`: the boss's own pass, not the darkness pass drawn again over the aliens.
function lights(ctx, b, B, look, t, k, own) {
  ctx.globalCompositeOperation = 'lighter';
  partLights(ctx, b, B, look, t, k);
  if (B.mod.live) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.globalAlpha = 1;
    B.mod.live(ctx, b, t, k, own, phaseMemo(b, t).at);
    ctx.restore();
  }
  warns(ctx, b, B, look, t, k);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

export function drawBoss(ctx, world, look, t, q = 1) {
  const b = world.boss;
  if (!b) return;
  const B = bossArt(look, b.kind);
  if (b.dying !== null) {
    drawDying(ctx, b, B, t);
    return;
  }
  const h = B.hull;
  ctx.drawImage(h.body, b.x + h.x0, b.y + h.y0);
  behind(ctx, b, B, t); // a module's live body behind the parts (the Craving's churning smoke)
  hullLights(ctx, b, B, t, 1, q);
  halos(ctx, b, look.palette.boss, t, 1);
  partBodies(ctx, b, B, look, t);
  lights(ctx, b, B, look, t, 1, true);
}

export function drawBossLights(ctx, world, look, t, k, q = 1) {
  const b = world.boss;
  if (!b) return;
  const B = bossArt(look, b.kind);
  if (b.dying !== null) {
    drawDying(ctx, b, B, t, k, false);
    return;
  }
  hullLights(ctx, b, B, t, k, q);
  halos(ctx, b, look.palette.boss, t, k);
  lights(ctx, b, B, look, t, k, false);
}
