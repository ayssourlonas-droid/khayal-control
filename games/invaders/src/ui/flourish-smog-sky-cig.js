// The giant cigarettes of world 17, tall (flourish `cigarettes`, phase 'far': drawn over the far layer, which has painted only the
// stump of each, under the mid layer). Each of the six in CIGS (parallax-smog-far-cig.js) stands on its stump, smoking, and has
// its own healing: while the city is thick with smog it burns (an ash cone on a glowing band, a dim ember that flickers like a coal,
// a plume of smoke rising and leaning away from the middle of the frame, where the Craving is); at its own `out` the ember dies and
// the smoke thins; at `out` + 28 % of the way to `gone` it begins to crumble (the ash slumps, hairline cracks run down the paper,
// the top snaps off and the break descends in chunks and dust until nothing but the stump the layer painted is left) and at
// `gone` it costs nothing. Everything is a function of t and of the healing h = env.v.heal.h (0 without one); nothing is
// simulated. Because h stands still between waves, the falling chunks and dust loop on t while the cigarette is crumbling,
// so a crumbling cigarette is never frozen in mid-air, and only the cut height follows h. The paper is baked in two palettes
// (smog, clean) and crossfaded by alpha with the smog (the layer's stump does the same). At most ~40 images a frame.
import { smooth, clamp } from '../core/math.js';
import { W } from './sprites.js';
import { stage, healOf } from './heal.js';
import { CIGS, STUMP_H } from './parallax-smog-far-cig.js';
import { GROUND } from './parallax-smog-far-kit.js';
import { M, CAP, SNAP, colSprite, litSprite, coldSprite, snapSprite, crackSprite, chunkSprite } from './flourish-smog-sky-cig-sprites.js';
import { emberSprite, dustSprite, puffSprite, ribbonSprite } from './flourish-smog-sky-cig-smoke.js';

export const CRUMBLE_AT = 0.28; // how far from `out` to `gone` the crumbling starts
export const PLUME = { period: 9, lean: 58, puffs: 1 }; // s a puff takes, px a puff leans at the top, puffs a plume (besides its two ribbons)
const [RIBBON_W, RIBBON_H] = [150, 480]; // the ribbon sprite's size (flourish-smog-sky-cig-smoke.js)
const BASE_Y = 380 + GROUND; // screen y of the ground: the layer's top plus GROUND
const MODES = ['smog', 'clean'];

// What a cigarette is doing at healing h, one scratch object the next call overwrites: ember and plume 0..1 (burning), lit 0..1 (the
// lit sprite's share while the ember dies away), p the crumbling 0..1 (0 before it starts), alive false once there is nothing to draw.
const ST = { ember: 0, plume: 0, lit: 0, p: 0, alive: true };
export function cigStage(c, h) {
  const cs = c.out + (c.gone - c.out) * CRUMBLE_AT;
  ST.alive = h < c.gone;
  ST.ember = 1 - smooth((h - (c.out - 0.05)) / 0.045);
  ST.plume = 1 - smooth((h - (c.out - 0.06)) / 0.1);
  ST.lit = 1 - smooth((h - (c.out - 0.03)) / 0.03);
  ST.p = clamp((h - cs) / (c.gone - cs), 0, 1);
  return ST;
}

// The height of the break (screen y of the baseline of the snapped top) once the crumbling is q (0 at the top of the column .. 1 down on the stump).
export const CUT_END = STUMP_H - (SNAP.base - SNAP.top); // how high above the ground the cut ends: where the layer's stump has its break
const cutY = (yc, q) => yc + (BASE_Y - CUT_END - yc) * (q * q * (1.6 - 0.6 * q));

// The paper's passes, farthest first: the clean one at full alpha, the smog one over it at `a`. Within a tenth of either end the
// other palette is not drawn at all (the paper is whole, one image where there would be two): passFirst .. passLast count down.
const passFirst = (a) => (a >= 0.9 ? 0 : 1);
const passLast = (a) => (a > 0.1 ? 0 : 1);
const passAlpha = (pass, a) => (pass === 0 && a < 0.9 ? a : 1);

// The plume of cigarette i, rising from (ox, oy): two ribbons of smoke out of step and crossfaded (so the column writhes), leaning away
// from the middle of the frame (dir -1 mirrors them), and puffs that billow off its top, growing and fading as they climb.
function plume(ctx, i, ox, oy, t, k, dir, quality) {
  const morph = 0.5 + 0.5 * Math.sin(t * 0.55 + i * 1.9);
  for (let r = 0; r < 2; r++) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(dir < 0 ? -1 : 1, 1);
    ctx.rotate(Math.sin(t * 0.21 + i * 1.7) * 0.03);
    ctx.globalAlpha = k * (r ? morph : 1 - morph * 0.55) * 0.9;
    ctx.drawImage(ribbonSprite(r), -RIBBON_W * 0.4, -RIBBON_H + 10);
    ctx.restore();
    if (quality < 1) break;
  }
  const n = quality < 1 ? 0 : PLUME.puffs;
  for (let j = 0; j < n; j++) {
    const u = (t / PLUME.period + j / n + ((i * 0.37) % 1)) % 1;
    const x = ox + dir * (30 + PLUME.lean * u ** 1.3) + Math.sin(u * 5 + i * 1.7 + t * 0.2) * 14 * u;
    const y = oy - 300 - u * 160;
    const s = 0.9 + u * 1.5;
    ctx.globalAlpha = 0.62 * k * smooth(u / 0.2) * (1 - u) ** 1.0;
    ctx.drawImage(puffSprite((i + j) % 3), x - 80 * s, y - 80 * s, 160 * s, 160 * s);
  }
}

// The cigarette's paper in its two palettes at the crumbling height: a crop of the column up to the cut, the cap or the snap on it.
function crumble(ctx, c, i, sx, yc, st, a, t) {
  const q = clamp((st.p - 0.14) / 0.86, 0, 1);
  const yb = cutY(yc, q);
  const keep = BASE_Y - yb;
  const [capA, snapA] = [1 - smooth((st.p - 0.1) / 0.1), smooth((st.p - 0.12) / 0.08)];
  for (let pass = passFirst(a); pass >= passLast(a); pass--) {
    const m = MODES[pass];
    ctx.globalAlpha = passAlpha(pass, a);
    const col = colSprite(i, m);
    ctx.drawImage(col, 0, Math.max(0, col.height - keep), col.width, Math.min(col.height, keep), sx - M, BASE_Y - Math.min(col.height, keep), col.width, Math.min(col.height, keep));
    if (capA > 0.01) {
      const lean = smooth(st.p / 0.12);
      ctx.save();
      ctx.translate(sx + c.w / 2, yb);
      ctx.rotate(lean * 0.16);
      ctx.scale(1, 1 - lean * 0.4);
      ctx.globalAlpha = passAlpha(pass, a) * capA;
      ctx.drawImage(coldSprite(i, m), -(c.w + M * 2) / 2, -CAP);
      ctx.restore();
    }
    if (snapA > 0.01) {
      ctx.globalAlpha = passAlpha(pass, a) * snapA;
      ctx.drawImage(snapSprite(i, m), sx - M, yb - SNAP.base);
    }
  }
  const crack = smooth(st.p / 0.12) * (1 - snapA);
  if (crack > 0.02) {
    ctx.globalAlpha = crack;
    ctx.drawImage(crackSprite(i), sx - M, yc);
  }
  const rain = smooth((st.p - 0.1) / 0.1) * (1 - smooth((st.p - 0.9) / 0.1)); // chunks and dust, looping on t while it crumbles
  if (rain <= 0.01) return;
  const mode = a > 0.5 ? 'smog' : 'clean';
  const [n, u] = [Math.floor(t / 1.9 + i * 0.29), (t / 1.9 + i * 0.29) % 1]; // which chunk this is, and how far it has fallen
  ctx.globalAlpha = rain * (1 - smooth((u - 0.6) / 0.4));
  ctx.save();
  ctx.translate(sx + c.w * (0.2 + 0.6 * ((n * 0.37 + i * 0.17) % 1)), yb - 20 + 0.5 * 900 * (u * 1.5) ** 2);
  ctx.rotate(u * 3.1 * (i % 2 ? -1 : 1));
  ctx.drawImage(chunkSprite((i + n) % 4, mode), -23, -20);
  ctx.restore();
  const d = (t / 3.1 + i * 0.41) % 1;
  ctx.globalAlpha = rain * 0.8 * Math.sin(d * Math.PI);
  ctx.drawImage(dustSprite(), sx + c.w / 2 - 48 * (1 + d), yb - 40 - 40 * d, 96 * (1 + d), 96 * (1 + d));
}

// Cigarette i at healing h (a: the smog's share of the palettes, see passFirst), its axis at screen x ax.
function one(ctx, i, h, a, t, quality, x0) {
  const c = CIGS[i];
  const st = cigStage(c, h);
  const sx = x0 + c.x - c.w / 2;
  if (!st.alive || sx > W + 220 || sx + c.w < -220) return;
  const yc = BASE_Y - c.h; // the flat top of the column
  if (st.p > 0) {
    crumble(ctx, c, i, sx, yc, st, a, t);
    return;
  }
  for (let pass = passFirst(a); pass >= passLast(a); pass--) { // the paper: cold underneath, the lit one over it while the ember dies
    const m = MODES[pass];
    if (st.lit < 0.999) {
      ctx.globalAlpha = passAlpha(pass, a);
      ctx.drawImage(colSprite(i, m), sx - M, yc);
      ctx.drawImage(coldSprite(i, m), sx - M, yc - CAP);
    }
    if (st.lit > 0.001) {
      ctx.globalAlpha = passAlpha(pass, a) * st.lit;
      ctx.drawImage(litSprite(i, m), sx - M, yc - CAP);
    }
  }
  if (st.ember > 0.001) {
    const flick = 0.5 + 0.28 * Math.sin(t * 7.3 + i * 2) * Math.sin(t * 3.1 + i) + 0.12 * Math.sin(t * 17 + i * 5);
    const ew = Math.min(c.w * 1.9, 108);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.55 * flick * st.ember;
    ctx.drawImage(emberSprite(), sx + c.w / 2 - ew / 2, yc - 6 - ew * 0.25, ew, ew * 0.5);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (st.plume > 0.01) plume(ctx, i, sx + c.w / 2, yc - CAP + 24, t, st.plume, c.x < 1120 ? -1 : 1, quality);
}

function cigarettes(ctx, { v, t, quality }, x0) {
  const h = healOf(v);
  const a = 1 - stage(h, 'smog');
  ctx.save();
  for (let i = 0; i < CIGS.length; i++) one(ctx, i, h, a, t, quality, x0);
  ctx.restore();
}

export const FLOURISH_CIGS = { cigarettes: { far: cigarettes } };
