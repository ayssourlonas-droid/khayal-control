// World 18's flourishes (registry), all pure functions of t drawn from cached sprites (flourish-storm-sprites.js), so a quiet frame costs a few
// draws and a flash a few more; the lightning's schedule is flourish-storm-model.js (strike), shared by all of them:
//   stormsheet (sky, far, mid, front)  sheet lightning: a strike washes the sky round the struck far tower (sky), lights the tower from inside
//                                      (far), the pillars before it (mid) and, faintly, the whole frame (front, over the field); nothing in a quiet sky
//   stormbolts (far)                   the forked bolt of the strikes that fork: from the struck anvil's belly to the sea, jagged, branching, flickering
//   stormcurtains (far, mid)           slanted curtains of rain sweeping slowly across, one behind the pillars and two in front of them
//   stormsun (sky)                     four shafts of orange light fanning up from the sun under the deck, swaying and breathing, and the sun's glow
//   stormgusts (near)                  wind-torn rags of dark cloud streaking fast across the field's backdrop (behind the aliens, so the
//                                      bullets stay clear)
import { W, H, hash, wrap, glow, rgba, lighter, normal } from './sprites.js';
import { clamp } from '../core/math.js';
import { SUN } from './sky-bodies-10-kit.js';
import { TOWERS, SEA } from './parallax-storm-anvil.js';
import { strike } from './flourish-storm-model.js';
import { BOLT, CURTAIN, BEAM, SCUD, boltSprite, curtainSprite, beamSprite, scudSprite } from './flourish-storm-sprites.js';

const FAR_TOP = H - 700; // the far layer's top in the frame
const SKY_X0 = -160; // the far layer's left edge when the ship is at the middle (parallax.js MARGIN)

function sheetSky(ctx, env) {
  const s = strike(env.t);
  if (s.k < 0.02) return;
  const T = TOWERS[s.tower];
  lighter(ctx);
  ctx.globalAlpha = clamp(s.k * 0.75, 0, 1);
  ctx.drawImage(glow('#b4c0ff'), T.x + SKY_X0 - 780, FAR_TOP + T.top - 330, 1560, 700);
  ctx.globalAlpha = s.k * 0.2;
  ctx.drawImage(glow('#8c9cff'), -300, -240, W + 600, H + 480);
  normal(ctx);
}

function sheetFar(ctx, env, x0) {
  const s = strike(env.t);
  if (s.k < 0.02) return;
  lighter(ctx);
  TOWERS.forEach((T, i) => {
    ctx.globalAlpha = s.k * (i === s.tower ? 0.8 : 0.14);
    const [w, h] = [(T.wl + T.wr) * 1.3, 520];
    ctx.drawImage(glow('#cdd6ff'), x0 + T.x - w / 2, FAR_TOP + T.top + T.thick - h * 0.45, w, h); // the whole tower lit from inside
  });
  normal(ctx);
}

function sheetMid(ctx, env) {
  const s = strike(env.t);
  if (s.k < 0.02) return;
  lighter(ctx);
  ctx.globalAlpha = s.k * 0.2;
  ctx.drawImage(glow('#8c9cff'), TOWERS[s.tower].x + SKY_X0 - 800, 560, 1600, 520);
  normal(ctx);
}

function sheetFront(ctx, env) {
  const s = strike(env.t);
  if (s.k < 0.02) return;
  lighter(ctx);
  ctx.fillStyle = rgba('#9aa8ff', s.k * 0.07);
  ctx.fillRect(0, 0, W, H);
  normal(ctx);
}

// The bolt of a forking strike: it shows through the two flashes and the afterglow, then goes out.
const boltAt = (age) => (age < 0.1 ? 1 : age < 0.16 ? 0.3 : age < 0.3 ? 0.9 : Math.max(0, 1 - (age - 0.3) / 0.3) * 0.5);

function bolts(ctx, env, x0) {
  const s = strike(env.t);
  if (s.bolt < 0 || s.age > 0.62) return;
  const k = boltAt(s.age) * s.power * (0.85 + 0.15 * Math.sin(s.age * 140));
  if (k < 0.03) return;
  const T = TOWERS[s.tower];
  const [bx, y0] = [x0 + T.x + s.dx * T.wc * 1.2, FAR_TOP + T.top + T.thick * 0.3];
  const len = FAR_TOP + SEA + 50 - y0; // from inside the anvil to the sea and a little into it
  const sc = len / BOLT.h;
  lighter(ctx);
  ctx.globalAlpha = clamp(k, 0, 1);
  ctx.drawImage(boltSprite(s.bolt), bx - (BOLT.w / 2) * sc, y0, BOLT.w * sc, len);
  ctx.globalAlpha = clamp(k * 0.6, 0, 1);
  ctx.drawImage(glow('#e8f0ff'), bx - 130, y0 + len - 110, 260, 220); // where it lands
  ctx.drawImage(glow('#b4c0ff'), bx - 170, y0 - 80, 340, 200); // and where it leaves the cloud
  normal(ctx);
}

// Curtains: n of them sweeping right at `speed` px/s, leaning, breathing, `scale` times the sprite's size.
function curtains(ctx, env, n, speed, alpha, scale, salt, y) {
  const t = env.t;
  for (let i = 0; i < (env.quality < 1 ? 1 : n); i++) {
    const x = wrap(hash(i + salt) * (W + 900) + t * speed, -450, W + 450);
    ctx.save();
    ctx.translate(x, y + hash(i + salt + 9) * 60);
    ctx.rotate(-0.17);
    ctx.globalAlpha = alpha * (0.65 + 0.35 * Math.sin(t * 0.23 + i * 2.1 + salt));
    ctx.drawImage(curtainSprite(), (-CURTAIN.w * scale) / 2, -CURTAIN.h * scale * 0.25, CURTAIN.w * scale, CURTAIN.h * scale);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function sun(ctx, env) {
  const t = env.t;
  lighter(ctx);
  for (let i = 0; i < 4; i += env.quality < 1 ? 2 : 1) {
    const a = Math.PI + (i - 1.5) * 0.5 + Math.sin(t * (0.09 + 0.03 * i) + i * 2.3) * 0.05; // fanning up from the sun, ahead of the clouds
    ctx.save();
    ctx.translate(SUN.x, SUN.y);
    ctx.rotate(a);
    ctx.globalAlpha = 0.24 * (0.55 + 0.45 * Math.sin(t * (0.16 + 0.05 * hash(i + 720)) + hash(i + 721) * 6.28));
    const w = BEAM.w * (0.9 + 0.6 * hash(i + 722));
    ctx.drawImage(beamSprite(), -w / 2, 0, w, BEAM.h);
    ctx.restore();
  }
  ctx.globalAlpha = 0.16 * (0.75 + 0.25 * Math.sin(t * 0.4));
  ctx.drawImage(glow('#ff8a3a'), SUN.x - 280, SUN.y - 170, 560, 340);
  normal(ctx);
}

function gusts(ctx, env) {
  const t = env.t;
  for (let i = 0; i < (env.quality < 1 ? 2 : 4); i++) {
    const sp = SCUD.w * (1.2 + 0.5 * hash(i + 760));
    const x = wrap(hash(i + 761) * (W + sp) + t * (120 + 110 * hash(i + 762)), -sp, W + 100);
    ctx.globalAlpha = 0.1 + 0.09 * hash(i + 763);
    ctx.drawImage(scudSprite(i % SCUD.count), x, 380 + hash(i + 764) * 560 + Math.sin(t * 0.3 + i) * 14, sp, SCUD.h * (sp / SCUD.w));
  }
  ctx.globalAlpha = 1;
}

export const FLOURISH_STORM = {
  stormsheet: { sky: sheetSky, far: sheetFar, mid: sheetMid, front: sheetFront },
  stormbolts: { far: bolts },
  stormcurtains: { far: (ctx, env) => curtains(ctx, env, 1, 14, 0.34, 1.0, 410, 360), mid: (ctx, env) => curtains(ctx, env, 2, 27, 0.42, 1.2, 450, 500) },
  stormsun: { sky: sun },
  stormgusts: { near: gusts },
};
