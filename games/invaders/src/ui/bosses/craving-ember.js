// The Craving's embers and breath (World 17, Ash to Air; craving-fx.js draws them over the parts, additively): the flicker of the
// fire in each live eye, in the maw and in the tray (a dead part leaves no glow), the maw's BREATH (streamers of lit smoke
// sucked in toward it along spiralling paths, from the hover phase on), embers rising from the bowl and glinting on the crown's
// cigarette tips, EMBERS RAINING off the body in the last phase (small, dim, falling past the throne: quiet next to a
// magenta bullet), and thin lit wisps curling up off the arms. Everything is stateless: a position comes from an index, the motion
// record's clocks (craving-motion.js) and fixed tables made once at load; only cached sprites are drawn, none is made or built
// per frame. Nothing is drawn above y = -150 (the HUD's edge is -158); the rain may fall as far as y 260.
import { glow, star, hash } from '../sprites.js';
import { alive } from './parts.js';
import { PART } from './craving-kit.js';
import { puff } from './craving-puff.js';
import { frac } from './craving-motion.js';
import { TAU } from '../../core/math.js';

const F = (n, f) => Array.from({ length: n }, (_, i) => f(i));
const MAW = PART.maw;
const STREAMS = 7;
const RISERS = 8;
const DROPS = 8;
const GLINTS = [[-222, -22], [226, -14], [-112, 34], [118, 30]]; // embers caught inside the smoke, glinting
const ARM_WISPS = 6; // rising off the arms; two more drift sideways off the crown's ends
const WISPS = ARM_WISPS + 2;
const SPARKS = [[-128, -108], [-67, -122], [-36, -136], [0, -141], [71, -132], [128, -108]]; // the crown's lit cigarettes' embers (the ash-cap tips lie a little higher)
const STREAM = F(STREAMS, (i) => ({ a: -0.35 + (i / (STREAMS - 1)) * (Math.PI + 0.7), r: 190 + 70 * hash(i * 5 + 1), s: 0.8 + 0.5 * hash(i * 7 + 2), v: Math.floor(hash(i * 3) * 3) }));
const RISER = F(RISERS, (i) => ({ x: -280 + 560 * hash(i * 11 + 4), w: 8 + 12 * hash(i * 13 + 1), q: hash(i * 17 + 3), r: 3.5 + 3 * hash(i * 19 + 5) }));
const DROP = F(DROPS, (i) => ({ x: -300 + 600 * hash(i * 23 + 6), y: -60 + 100 * hash(i * 29 + 2), q: hash(i * 31 + 7), r: 4 + 3 * hash(i * 37 + 9), w: 6 + 10 * hash(i * 41 + 1) }));
const WISP = F(WISPS, (i) => (i < ARM_WISPS
  ? { x: (i % 2 ? 1 : -1) * (246 + 80 * hash(i * 43 + 5)), y: -8 - 32 * hash(i * 47 + 1), q: hash(i * 53 + 2), v: i % 4, dx: 0, dy: -50, of: i % 2 ? 'clawR' : 'clawL', rot: -0.5 }
  : { x: (i % 2 ? 1 : -1) * 142, y: -98, q: hash(i * 53 + 2), v: i % 4, dx: (i % 2 ? 1 : -1) * 46, dy: -4, of: 'crown', rot: -0.15 }));
function disc(ctx, color, x, y, r, a) {
  ctx.globalAlpha = a;
  ctx.drawImage(glow(color), x - r, y - r, r * 2, r * 2);
}

// The fire in the eyes (the eye that takes aim flares in the last phase), the maw (brighter as it draws breath and while it burns,
// pulsing as it fires) and the tray's bed.
export function glows(ctx, b, m, t, k) {
  for (let i = 0; i < 2; i++) {
    const p = alive(b, i ? 'eyeR' : 'eyeL');
    if (!p) continue;
    const f = 0.5 + 0.5 * Math.sin(t * 7.3 + i * 2.1) * Math.sin(t * 3.1 + i);
    const flare = i ? 0 : m.eye * Math.max(0, Math.sin(m.pulse));
    disc(ctx, '#ff7a1a', PART[i ? 'eyeR' : 'eyeL'].x, PART[i ? 'eyeR' : 'eyeL'].y, 58, k * (0.12 + 0.1 * f + 0.2 * flare) * (0.5 + 0.5 * m.ember));
    ctx.globalAlpha = k * (0.1 + 0.2 * f + 0.4 * flare);
    ctx.drawImage(star('#ffe9b8'), PART[i ? 'eyeR' : 'eyeL'].x - 24, PART[i ? 'eyeR' : 'eyeL'].y - 24, 48, 48);
  }
  if (alive(b, 'maw')) {
    const pulse = 0.5 + 0.5 * Math.sin(m.pulse);
    const heat = m.blaze * (0.55 + 0.25 * m.inhale + 0.2 * pulse * (1 - m.inhale * 0.5));
    disc(ctx, '#ff9a30', MAW.x, MAW.y, 104 + 18 * m.inhale, k * (0.14 + 0.26 * heat));
    disc(ctx, '#fff0c0', MAW.x, MAW.y, 44, k * 0.34 * heat);
    ctx.globalAlpha = k * 0.3 * m.inhale * (0.6 + 0.4 * pulse);
    ctx.drawImage(star('#ffe9b8'), MAW.x - 36, MAW.y - 36, 72, 72);
  }
  if (alive(b, 'tray')) disc(ctx, '#ff7a1a', PART.tray.x, PART.tray.y, 130, k * (0.1 + 0.16 * m.ember + 0.05 * Math.sin(t * 5.1)));
}

// Streamers of lit smoke drawn in to the maw: each runs once from far out to the mouth along a spiral, thinning as it comes.
export function breath(ctx, b, m, k) {
  if (!alive(b, 'maw') || m.inhale < 0.04) return;
  const amount = m.inhale * (0.7 + 0.3 * Math.sin(m.pulse));
  for (let i = 0; i < STREAMS; i++) {
    const s = STREAM[i];
    const u = frac(m.beat / TAU * 0.5 + i / STREAMS);
    const size = 104 + 40 * s.s;
    const d = s.r * (1 - u) ** 1.5 + 30;
    const a = s.a + (s.a < Math.PI / 2 ? 1.1 : -1.1) * (1 - u); // both sides spiral downward as they close in
    const x = MAW.x + Math.cos(a) * d * 1.15;
    const y = Math.max(-154 + size * 0.72, MAW.y + Math.sin(a) * d * 0.8);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(MAW.y - y, MAW.x - x)); // the curl's chord lies along +x with its hooked head at the right: the head leads
    ctx.globalAlpha = k * amount * Math.sin(Math.PI * u) ** 0.8;
    ctx.drawImage(puff('curlLit', size, s.v), -size / 2, -size / 2, size, size);
    ctx.restore();
  }
}

// Embers rising from the bowl, and a glint at each lit cigarette's tip.
export function embers(ctx, b, m, t, k) {
  for (let i = 0; i < RISERS; i++) {
    const e = RISER[i];
    const u = frac(m.beat / TAU * 0.2 + e.q);
    disc(ctx, '#ff8a2a', e.x + Math.sin(u * 7 + i) * e.w, 30 - u * 170, e.r, k * m.ember * 0.55 * Math.sin(Math.PI * u) ** 0.7);
  }
  if (!alive(b, 'crown')) return;
  for (let i = 0; i < SPARKS.length; i++) {
    ctx.globalAlpha = k * m.ember * 0.5 * Math.max(0, Math.sin(t * 2.3 + i * 1.9));
    ctx.drawImage(star('#ff9a40'), SPARKS[i][0] - 9, SPARKS[i][1] - 9, 18, 18);
  }
}

// Embers falling off the body in the last phase: small, dim, each drifting a little as it drops.
export function rain(ctx, m, k) {
  if (m.rain < 0.03) return;
  for (let i = 0; i < DROPS; i++) {
    const d = DROP[i];
    const u = frac(m.beat / TAU * 0.4 + d.q);
    disc(ctx, '#ff7a1a', d.x + Math.sin(u * 9 + i) * d.w, d.y + u * 300, d.r, k * m.rain * 0.5 * Math.min(1, u * 6) * (1 - u) ** 0.8);
  }
}

// Thin lit wisps curling up off the claws and drifting sideways off the crown's ends, the left ones mirrored; a destroyed part sheds none.
export function wisps(ctx, b, m, k) {
  for (let i = 0; i < WISPS; i++) {
    const w = WISP[i];
    if (!alive(b, w.of)) continue;
    const u = frac(m.beat / TAU * 0.16 + w.q);
    const sprite = puff('wispLit', 96, w.v);
    ctx.save();
    ctx.translate(w.x + w.dx * u + Math.sin(u * 5 + i) * 10, w.y + w.dy * u);
    ctx.scale(w.x < 0 ? -1 : 1, 1);
    ctx.rotate(w.rot - 0.3 * u);
    ctx.globalAlpha = k * (0.25 + 0.2 * m.ember) * Math.sin(Math.PI * u);
    ctx.drawImage(sprite, -48, -24);
    ctx.restore();
  }
}

// Embers glinting inside the smoke: a few dim twinkles, each at its own beat.
export function glints(ctx, m, t, k) {
  for (let i = 0; i < GLINTS.length; i++) {
    ctx.globalAlpha = k * m.ember * 0.7 * Math.max(0, Math.sin(t * 1.9 + i * 2.3)) ** 2;
    ctx.drawImage(star('#ffb347'), GLINTS[i][0] - 9, GLINTS[i][1] - 9, 18, 18);
  }
}

export function warmEmbers() {
  for (const c of ['#ff7a1a', '#ff8a2a', '#ff9a30', '#fff0c0']) glow(c);
  for (const c of ['#ffe9b8', '#ff9a40', '#ffb347']) star(c);
  for (let v = 0; v < 3; v++) for (const s of [104, 144]) puff('curlLit', s, v);
  for (let v = 0; v < 4; v++) puff('wispLit', 96, v);
}
