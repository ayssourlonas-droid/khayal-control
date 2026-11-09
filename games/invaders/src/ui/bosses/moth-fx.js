// The Vesper Moth's live extras (World 16, Glass Cathedral; moth.js runs them): the slow wingbeat (moth-wing-live.js: each
// living forewing drawn from the baked frames of moth-frames.js over the part's static body, with its damage layer, its
// flash, its light and the glints on its glass), the rose window's light turning, the light circling each eyespot
// (blazing from the hover phase), the abdomen breathing between its bands, a glint running up each antenna and
// twinkling at its tip, a glint over each eye, and in the last phase the glass scales shaking loose (moth-scales.js). In boss coordinates; cached sprites only, nothing allocated per frame (the few numbers live in
// module scratch). The wings' bodies are opaque and so are drawn only in the boss's own pass (`own`): the darkness pass
// runs again over the aliens, lights only. A destroyed part takes what hangs on it along: a destroyed wing gives no
// frame and sheds no scale, no rose light without the heart, no ring light without its eyespot, no breathing without
// the abdomen, no glints without the crown. A wing the boss has cracked open (`cracked`) is split and hangs still: the
// part's own art shows. Nothing is drawn above y -158.
import { glow, star } from '../sprites.js';
import { alive } from './parts.js';
import { clamp } from '../../core/math.js';
import { TAU, WEAK, GOLD, ROSE, VIOLET, COBALT } from './moth-kit.js';
import { motion } from './moth-motion.js';
import { warmFrames } from './moth-frames.js';
import { RS, SS, SL, ROSE_FRAMES, SPIN_FRAMES, roseFrame, spinFrame, slitGlow, warmLight } from './moth-light.js';
import { SLITS } from './moth-tail.js';
import { TIP, at } from './moth-antenna.js';
import { wings, GLINT } from './moth-wing-live.js';
import { EYES } from './moth-crown.js';
import { scales, warmScales } from './moth-scales.js';

const FLARE = '#fff2c0'; // the eyespots' lenses flaring
const pt = [0, 0, 0, 0]; // scratch

// The rose window's light, one of its frames for the angle it has turned to, and a breath at the hub.
function rose(ctx, b, m, k) {
  const p = alive(b, 'heart');
  if (!p) return;
  const [x, y] = [p.x - b.x, p.y - b.y];
  const f = Math.floor(((((m.rose / (TAU / 8)) % 1) + 1) % 1) * ROSE_FRAMES);
  ctx.globalAlpha = k * m.glow;
  ctx.drawImage(roseFrame(f), x - RS / 2, y - RS / 2);
  ctx.globalAlpha = k * (0.3 + 0.25 * Math.sin(m.breath));
  ctx.drawImage(star('#fff6d8'), x - 15, y - 15, 30, 30);
}

// The light circling each eyespot's rings (the right eyespot's mirrored, so it circles the other way) and its blaze.
function spots(ctx, b, m, t, k) {
  for (let i = 0; i < 2; i++) {
    const p = alive(b, i ? 'spotR' : 'spotL');
    if (!p) continue;
    const [x, y] = [p.x - b.x, p.y - b.y];
    const f = Math.floor(((((m.spin / (TAU / 3)) % 1) + 1) % 1) * SPIN_FRAMES);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(i ? -1 : 1, 1);
    ctx.globalAlpha = k * (0.35 + 0.5 * m.blaze);
    ctx.drawImage(spinFrame(f), -SS.w / 2, -SS.h / 2);
    ctx.restore();
    const r = 66 + 12 * Math.sin(t * 2.1 + i * 1.9);
    ctx.globalAlpha = k * m.blaze * (0.14 + 0.1 * Math.sin(t * 2.1 + i * 1.9));
    ctx.drawImage(glow(WEAK), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = k * m.blaze * (0.25 + 0.3 * Math.max(0, Math.sin(t * 1.7 + i * 2.4)));
    ctx.drawImage(star(FLARE), x - 30, y - 30, 60, 60); // the lens flares
  }
}

// The abdomen breathes: a wave of light runs down the slits, faster as the phases go.
function breathe(ctx, b, m, k) {
  const p = alive(b, 'tail');
  if (!p) return;
  const [x, y] = [p.x - b.x, p.y - b.y];
  for (let j = 0; j < SLITS.length; j++) {
    const a = Math.max(0, Math.sin(m.breath - j * 0.85)) ** 1.5;
    ctx.globalAlpha = k * (0.2 + 0.7 * a);
    ctx.drawImage(slitGlow(j), x - SL.w / 2, y + SLITS[j] - SL.h / 2);
  }
}

// A glint running up each antenna's feathers and twinkling at its tip, a slow glint over each eye.
function crown(ctx, b, t, k) {
  const p = alive(b, 'crown');
  if (!p) return;
  const [x, y] = [p.x - b.x, p.y - b.y];
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1;
    const u = (t * 0.42 + i * 0.37) % 1;
    at(0.1 + 0.9 * u, pt);
    ctx.globalAlpha = k * 0.7 * Math.sin(Math.PI * u);
    ctx.drawImage(glow('#ffe9f6'), x + s * pt[0] - 7, y + pt[1] - 7, 14, 14);
    ctx.globalAlpha = k * (0.3 + 0.5 * Math.max(0, Math.sin(t * 2.6 + i * 2.1)));
    ctx.drawImage(star(GOLD), x + s * TIP[0] - 10, y + TIP[1] - 10, 20, 20);
    const e = EYES[i];
    ctx.globalAlpha = k * (0.25 + 0.4 * Math.max(0, Math.sin(t * 1.1 + i * 1.7)));
    ctx.drawImage(star('#ffffff'), x + e[0] - s * 7 + 3 * Math.sin(t * 0.55 + i) - 11, y + e[1] - 12 + 3 * Math.sin(t * 0.8 + i) - 11, 22, 22);
  }
}

export function fx(ctx, b, t, k, own) {
  const ph = clamp(b.phase, 0, 2);
  const m = motion(b, t, ph);
  wings(ctx, b, m, t, k, own);
  rose(ctx, b, m, k);
  spots(ctx, b, m, t, k);
  breathe(ctx, b, m, k);
  crown(ctx, b, t, k);
  scales(ctx, b, m.fall, m.scales, k);
  ctx.globalAlpha = 1;
}

export function warm() {
  warmFrames();
  warmLight();
  warmScales();
  for (const c of ['#fff6d8', '#ffffff', GOLD, GLINT, FLARE]) star(c);
  for (const c of [WEAK, '#ffe9f6', ROSE, VIOLET, COBALT]) glow(c);
}
