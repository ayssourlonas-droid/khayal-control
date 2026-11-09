// The Lantern Leviathan's live extras (World 15, Lantern Deep; angler.js runs them): the lower jaw (angler-jaw-sprite.js)
// hanging open from the hover phase on and working a little, the lure on its swaying stalk (angler-lure.js), the
// throat swelling with light once the jaw drops and glints running along both rows of teeth, the belly's lamps
// chasing in a wave, a glint travelling over each eye, a slow ripple over each fin and light running out along its
// rays, and, in the last phase, a ring of lamps circling the head. In boss coordinates; cached sprites only, nothing
// allocated per frame (the few numbers live in module scratch). Everything opaque (the jaw, stalk, tether, filaments,
// bulb) is drawn only in the boss's own pass (`own`): the darkness pass runs again over the aliens. A destroyed part
// takes what hangs on it along: no stalk or lure without the crest, no glints or swell without the maw, no glint
// without its eye, no chase without the belly, no ripple or shimmer without its fin. Nothing rises above y -158.
import { glow, star } from '../sprites.js';
import { alive } from './parts.js';
import { clamp } from '../../core/math.js';
import { TAU, TEAL, AQUA, VIOLET, PALE, DROP, CH } from './angler-kit.js';
import { motion, lure } from './angler-lure.js';
import { LIGHTS } from './angler-belly.js';
import { rayAt } from './angler-fin.js';
import { RB, rippleFrame } from './angler-ripple.js';
import { warm as warmSprites } from './angler-sprites-2.js';
import { TEETH } from './angler-teeth.js';
import { JB, FANGS, jawBody, jawLights } from './angler-jaw-sprite.js';
import { THROAT } from './angler-maw.js';

const WAVE = [2.2, 3.1, 4.2]; // rad/s the belly's wave runs, by phase
const HUES = [TEAL, VIOLET, AQUA];
const RING = { n: 12, cx: 0, cy: -20, rx: 230, ry: 120 }; // the last phase's lamps circle the head on this ellipse
// Where the needles of the upper row end in the chamber, left to right (made once); the lower row's are FANGS.
const UPPER = TEETH.up.filter((t) => Math.abs(t.x) < CH)
  .map((t) => [t.x + Math.cos(t.a) * t.len - Math.sin(t.a) * t.bend, t.y + Math.sin(t.a) * t.len + Math.cos(t.a) * t.bend])
  .sort((a, b) => a[0] - b[0]);
const LOWER = FANGS.filter((p) => Math.abs(p[0]) < CH);
const ROWS = [UPPER, LOWER];
const SHIMMER = [2, 6, 4]; // the fin rays light runs along, the third from the second phase
const pt = [0, 0]; // scratch

// The jaw: closed it sits DROP px above the open pose the hull keeps, and from the second phase it hangs open
// (eased per boss); it works a little all the time. The body is opaque (own pass only), its lights always.
function jaw(ctx, m, k, own, ph) {
  const oy = -DROP * (1 - m.jaw) + m.chewAmp * Math.sin(m.chew);
  if (own) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(jawBody(), JB.x, JB.y + oy);
    ctx.globalCompositeOperation = 'lighter';
  }
  ctx.globalAlpha = k * (0.5 + 0.25 * m.jaw + 0.25 * (ph === 2 ? m.flare : 0));
  ctx.drawImage(jawLights(), JB.x, JB.y + oy);
  return oy;
}

// Once the jaw has dropped the throat swells with light and glints run along the rows of teeth: one along each row
// in the first phase, two in the later ones, hopping along the needles' tips, left to right.
function throat(ctx, b, m, t, k, ph, oy) {
  if (!alive(b, 'maw')) return;
  ctx.globalAlpha = k * (0.05 + 0.13 * m.jaw);
  ctx.drawImage(glow(PALE), THROAT.x - 120, THROAT.y - 46, 240, 92);
  for (let r = 0; r < 2; r++) {
    const row = ROWS[r];
    const dy = r ? oy + DROP : 0; // the lower row moves with the jaw (its tips are listed open)
    for (let j = 0; j <= (ph > 0 ? 1 : 0); j++) {
      const u = ((t * (0.22 + 0.1 * m.jaw) + j * 0.5 + r * 0.31) % 1) * (row.length - 1);
      const i = Math.floor(u);
      const a = row[i];
      const c = row[Math.min(i + 1, row.length - 1)];
      ctx.globalAlpha = k * (0.4 + 0.2 * m.jaw) * Math.sin(Math.PI * (u / (row.length - 1)));
      ctx.drawImage(star(PALE), a[0] + (c[0] - a[0]) * (u - i) - 10, a[1] + (c[1] - a[1]) * (u - i) + dy - 10, 20, 20);
    }
  }
}

// The belly's lamps: a wave runs across them, a little behind on the lower row; the lit ones swell.
function chase(ctx, b, t, k, ph) {
  if (!alive(b, 'belly')) return;
  for (let i = 0; i < LIGHTS.length; i++) {
    const p = LIGHTS[i];
    const a = Math.sin(t * WAVE[ph] - p.x * 0.045 - p.row * 0.8);
    if (a < 0.55) continue;
    const e = ((a - 0.55) / 0.45) ** 1.5;
    const r = p.r * (4.4 + 3.2 * e);
    ctx.globalAlpha = k * (0.16 + 0.5 * e);
    ctx.drawImage(glow(p.c), p.x - r, p.y - r, r * 2, r * 2);
  }
}

// A slow specular glint drifting over each live eye, the left and the right out of step.
function eyes(ctx, b, t, k) {
  for (let i = 0; i < 2; i++) {
    const p = alive(b, i ? 'eyeR' : 'eyeL');
    if (!p) continue;
    const s = i ? -1 : 1; // the right eye is the left one mirrored
    const x = p.x - b.x + s * (-9 + 6 * Math.sin(t * 0.55 + i * 2));
    const y = p.y - b.y - 9 + 3 * Math.sin(t * 0.8 + i);
    ctx.globalAlpha = k * (0.3 + 0.4 * Math.max(0, Math.sin(t * 1.1 + i * 1.7)));
    ctx.drawImage(star('#ffffff'), x - 11, y - 11, 22, 22);
  }
}

// The fins: a ripple of pale light runs out over the membrane (the right fin's is the left's mirrored), and a pulse
// leaves the knuckle along a ray and fades toward the tip (a third ray joins in from the second phase).
function fins(ctx, b, m, t, k, ph) {
  const frame = rippleFrame(m.rip);
  for (let i = 0; i < 2; i++) {
    const p = alive(b, i ? 'finR' : 'finL');
    if (!p) continue;
    const s = i ? -1 : 1;
    ctx.save();
    ctx.translate(p.x - b.x, p.y - b.y);
    ctx.scale(s, 1);
    ctx.globalAlpha = k * (0.55 + 0.1 * ph);
    ctx.drawImage(frame, RB.x, RB.y);
    ctx.restore();
    for (let j = 0; j < 2 + (ph > 0 ? 1 : 0); j++) {
      const u = (t * 0.5 + j * 0.37 + i * 0.5) % 1;
      rayAt(SHIMMER[j], 0.15 + 0.8 * u, pt);
      const r = 5 + 4 * Math.sin(Math.PI * u);
      ctx.globalAlpha = k * 0.6 * Math.sin(Math.PI * u);
      ctx.drawImage(glow(AQUA), p.x - b.x + s * pt[0] - r, p.y - b.y + pt[1] - r, r * 2, r * 2);
    }
  }
}

// The last phase: a ring of lamps circling the head on an ellipse, quieter than the lure and the weak points, nearer
// ones larger, each with a short tail behind it. Their angle is summed per boss; they come up with the phase.
function ring(ctx, m, k) {
  if (m.orbit < 0.02) return;
  for (let i = 0; i < RING.n; i++) {
    const a = m.ang + (i * TAU) / RING.n;
    const depth = 0.65 + 0.35 * Math.sin(a);
    const c = HUES[i % 3];
    const r = 10 + 6 * depth;
    ctx.globalAlpha = k * m.orbit * (0.3 + 0.28 * depth);
    ctx.drawImage(glow(c), RING.cx + Math.cos(a) * RING.rx - r, RING.cy + Math.sin(a) * RING.ry - r, r * 2, r * 2);
    if (depth < 0.45) continue; // the far side, higher up and dimmer, goes without a tail
    ctx.globalAlpha *= 0.55;
    ctx.drawImage(glow(c), RING.cx + Math.cos(a - 0.11) * RING.rx - r * 0.75, RING.cy + Math.sin(a - 0.11) * RING.ry - r * 0.75, r * 1.5, r * 1.5);
  }
}

export function fx(ctx, b, t, k, own, since) {
  const ph = clamp(b.phase, 0, 2);
  const m = motion(b, t, ph);
  const oy = jaw(ctx, m, k, own, ph);
  lure(ctx, b, m, t, k, own, ph, since);
  throat(ctx, b, m, t, k, ph, oy);
  chase(ctx, b, t, k, ph);
  eyes(ctx, b, t, k);
  fins(ctx, b, m, t, k, ph);
  ring(ctx, m, k);
  ctx.globalAlpha = 1;
}

export function warm() {
  warmSprites();
}
