// Effects on the whole frame: Neon Rain's darkness (the scene dimmed, neon still burning, lightning
// lighting it all for 0.15 s), full-frame flashes, the bullet-time tint (green, or the look's own: Starlit
// Archive's warm sepia) and the glitch slices (bands of the finished frame shifted sideways: Code Rain's
// green ones, or Starlit Archive's smears of gilt ink).
import { W, H, rgba, lin } from './sprites.js';
import { flashK } from '../fx/fx.js';
import { drawLights, layerX } from './parallax.js';
import { drawFlourishes } from './flourish.js';
import { drawAlienLights } from './aliens/index.js';
import { drawBossLights } from './bosses/index.js';

const LIT = 0.15; // s a lightning flash lights the dark world fully, then it fades out
const DIM = 0.66; // how dark the dark world is, unless its look says (look.dark)
const GREEN = { shade: 'rgba(0,30,12,0.28)', glow: 'rgba(40,255,120,0.06)' }; // the tint of bullet time and the slow power, unless the look says (look.tint)

// 1 while a lightning flash is in its first 0.15 s, falling to 0 over the rest of its life.
function lightningLight(fx) {
  let k = 0;
  for (const f of fx.flashes) {
    if (f.tag !== 'lightning') continue;
    const age = f.max - f.life;
    const rest = Math.max(1e-3, f.max - LIT);
    k = Math.max(k, age <= LIT ? 1 : Math.max(0, 1 - (age - LIT) / rest));
  }
  return k;
}

// After the boss and the aliens, before bullets, ship and fx (which keep their full light). The
// neon is drawn again over the dark: the skyline's lights, the 'neonfar'/'neonmid' flourishes, the
// boss's lights (bosses/index.js drawBossLights) and the aliens' (aliens/index.js drawAlienLights).
export function drawDarkness(ctx, env) {
  const { v, world, fx, t } = env;
  if (world.level.twist !== 'darkness') return;
  const light = lightningLight(fx);
  if (light >= 1) return;
  const dim = v.look.dark ?? DIM;
  ctx.fillStyle = `rgba(3,2,10,${dim * (1 - light)})`;
  ctx.fillRect(-40, -40, W + 80, H + 80);
  const back = (1 - light) * dim / DIM; // a lighter dark has less to give back to the lights
  for (const L of v.layers) {
    if (L.lights.length && !(L.far && env.quality < 1)) drawLights(ctx, L, layerX(L, world.ship.x), t, 0.8 * back);
  }
  const [far, mid] = v.layers;
  if (light < 0.5) {
    drawFlourishes(ctx, env, 'neonfar', layerX(far, world.ship.x), far.top);
    drawFlourishes(ctx, env, 'neonmid', layerX(mid, world.ship.x), mid.top);
  }
  drawBossLights(ctx, world, v.look, t, back, env.quality); // the boss's neon, under its minions'
  drawAlienLights(ctx, world, v.look, t, back); // their neon, and the glow it throws around them
}

// Full-frame flashes (bombs, boss deaths, lightning, bullet time) and the bullet-time tint, which the
// slow power shares.
export function drawScreenFx(ctx, fx, look) {
  ctx.globalCompositeOperation = 'lighter';
  for (const f of fx.flashes) {
    if (!f.full) continue;
    const k = flashK(f);
    ctx.globalAlpha = Math.min(0.9, f.alpha * k * (f.tag === 'lightning' ? 0.3 : 1));
    ctx.fillStyle = f.color;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  if (fx.bulletTime || fx.slowPower) {
    const tint = look?.tint ?? GREEN;
    ctx.fillStyle = tint.shade;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = tint.glow;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
}

// An ink slice: a page turning across the frame. A tall strip of the frame is shifted sideways and sweeps on
// the way it was shifted as it fades, a wash of gilt over it brightest at its leading edge, where the paper
// folds, and a thin bright line there. Canvas pixels, like the slices below.
function smear(ctx, canvas, sl, k, x, y, w, h, s) {
  const dir = Math.sign(sl.dx);
  const [sx, env] = [Math.round(x + dir * (1 - k) * 260 * s), Math.min(1, k * 2.5)];
  const dx = sx + sl.dx * s;
  ctx.globalAlpha = 0.9 * env;
  ctx.drawImage(canvas, sx, y, w, h, dx, y, w, h);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = env;
  const lead = dir > 0 ? 0.85 : 0.15;
  ctx.fillStyle = lin(ctx, dx, 0, dx + w, 0, [[0, rgba(sl.color, 0)], [lead, rgba(sl.color, 0.42)], [1, rgba(sl.color, 0)]]);
  ctx.fillRect(dx, y, w, h);
  const edge = dx + w * lead;
  ctx.fillStyle = lin(ctx, edge - 5 * s, 0, edge + 5 * s, 0, [[0, rgba('#fff4d0', 0)], [0.5, rgba('#fff4d0', 0.85)], [1, rgba('#fff4d0', 0)]]);
  ctx.fillRect(edge - 5 * s, y, 10 * s, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Glitch slices: copy each band of what is already on the canvas, shifted by dx, tinted green.
// Works in canvas pixels (fit = { s, ox, oy } maps world px onto the canvas).
export function drawSlices(ctx, canvas, fit, fx) {
  if (!fx.slices.length) return;
  const m = ctx.getTransform();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const sl of fx.slices) {
    const k = sl.life / sl.max;
    const sx = Math.max(0, Math.round(fit.ox + sl.x * fit.s));
    const sy = Math.max(0, Math.round(fit.oy + sl.y * fit.s));
    const sw = Math.min(canvas.width - sx, Math.round(sl.w * fit.s));
    const sh = Math.min(canvas.height - sy, Math.max(1, Math.round(sl.h * fit.s)));
    if (sw <= 0 || sh <= 0) continue;
    if (sl.kind === 'ink') {
      smear(ctx, canvas, sl, k, sx, sy, sw, sh, fit.s);
      continue;
    }
    ctx.drawImage(canvas, sx, sy, sw, sh, sx + sl.dx * fit.s, sy, sw, sh);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.35 * k;
    ctx.fillStyle = sl.color;
    ctx.fillRect(sx + sl.dx * fit.s, sy, sw, sh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.setTransform(m);
}
