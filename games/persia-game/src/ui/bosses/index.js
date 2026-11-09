// The boss, drawn from its baked sprites (bake.js; painters in bosses/<kind>.js).
//   drawBoss(ctx, world, look, t, q?, named?)   world space, before the aliens (so minions launched
//                                            from the boss fly over it; ruling R27); named: the
//                                            species being said, which lights the boss up if it is its own
// q is the view's quality level: below 1 the phases' rage overlays (hull-sized, purely decorative
// glow) are skipped, the biggest fill a boss frame has on a Pi.
// Per frame, bottom to top: the hull and its lights (the phase's own lights cross-fading in on a
// phase change), the glow round each live weak point, the parts in their states, their lights, the
// module's live extras, a charge-up on every pending warn (parts.js). Once dying, death.js draws
// the collapse instead. Per frame only drawImage of baked canvases and cached glows.
import { bossArt } from './bake.js';
import { drawDying } from './death.js';
import { halos, partBodies, lifts, partLights, warns } from './parts.js';
import { smooth } from '../../core/math.js';
import { soft, addGlow } from '../sprites.js';
import { namedLight } from '../aliens/index.js';

const FADE = 0.9; // s a phase's own lights take to come up
const bossMemo = new WeakMap(); // boss -> { phase, prev, at }: when the phase last changed

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
function hullLights(ctx, b, B, t, q) {
  const h = B.hull;
  const ph = phaseMemo(b, t);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.88 + 0.12 * Math.sin(t * 2.1);
  ctx.drawImage(h.lights, b.x + h.x0, b.y + h.y0);
  const e = smooth((t - ph.at) / FADE);
  for (const [i, a] of [[ph.phase, e], [ph.prev, 1 - e]]) {
    const img = h.rage[i];
    if (!img || a <= 0 || q < 1) continue;
    ctx.globalAlpha = a;
    ctx.drawImage(img, b.x + h.x0, b.y + h.y0);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Everything lit above the part bodies: their lights, the module's live extras, the charge-ups.
function lights(ctx, b, B, look, t) {
  ctx.globalCompositeOperation = 'lighter';
  partLights(ctx, b, B, look, t);
  if (B.mod.live) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.globalAlpha = 1;
    B.mod.live(ctx, b, t);
    ctx.restore();
  }
  warns(ctx, b, B, look, t);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// While the boss's species is being said it lights up as its aliens do (aliens/index.js): a soft
// disc of its colour under the hull (a glow blob is spent before it clears the hull; not at half
// quality, it is a third of the frame's fill), then a white lift on the hull and parts (parts.js).
const DISC_X = 0.7; // the disc's radii, in hull-canvas widths and heights
const DISC_Y = 1.05;

function disc(ctx, b, B, look, alpha) {
  const { width: w, height: h } = B.hull.body;
  addGlow(ctx, soft(look.palette.alien[B.S.def.species]), b.x, b.y, w * DISC_X, alpha, (h * DISC_Y) / (w * DISC_X));
}

export function drawBoss(ctx, world, look, t, q = 1, named = null) {
  const b = world.boss;
  if (!b) return;
  const B = bossArt(look, b.kind);
  if (b.dying !== null) {
    drawDying(ctx, b, B, t);
    return;
  }
  const h = B.hull;
  const light = named === B.S.def.species ? namedLight(t) : null;
  if (light && q >= 1) disc(ctx, b, B, look, light.halo);
  ctx.drawImage(h.body, b.x + h.x0, b.y + h.y0);
  hullLights(ctx, b, B, t, q);
  halos(ctx, b, look.palette.boss, t);
  partBodies(ctx, b, B, look, t);
  if (light) lifts(ctx, b, B, light.lift);
  lights(ctx, b, B, look, t);
}
