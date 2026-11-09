// The Lantern Leviathan's lure and the motion every live extra shares (World 15, Lantern Deep; angler-fx.js runs
// them). The stalk springs from the knob on the crown, rises over the crest, arches forward and bends down; from its
// tip a tether hangs and swings like a pendulum with the lure at its end, a big glassy bulb, white-hot at the core,
// trailing soft filaments tipped with tiny lights. The lure breathes slowly; the last phase FLARES it: brighter, a
// wider glow, long rays, a bigger breath, motes of light drifting off it. Nothing reaches above y -158 in the boss's
// coordinates (the HUD): the stalk's apex is at about -145, the lure hangs near y -84 and its widest glow is 66 px
// round it.
// Everything that animates is summed frame by frame per boss (WeakMap), so a phase change speeds it up or eases it
// without a jump:
//   motion(b, t, ph) -> { psi: the pendulum's phase, amp: its swing (eased per phase), jaw: how far the jaw has
//   dropped (0..1), chew: the jaw's chewing, flare, orbit: how far the last phase's lights have come up, ang: the
//   lights' angle, pulse: the lure's breath, rip: the fins' ripple }
// A destroyed crest takes the stalk, the lure and the motes along (alive).
import { glow, star } from '../sprites.js';
import { alive } from './parts.js';
import { clamp } from '../../core/math.js';
import { AQUA, PALE } from './angler-kit.js';
import { ROOT, TIP, L, STALK, BULB, FIL, stalk, stalkGlow, tether, bulb, filaments, filamentGlow } from './angler-sprites.js';
import { rays } from './angler-sprites-2.js';

export const OMEGA = [1.4, 1.8, 2.4]; // rad/s the pendulum turns, by phase
export const AMP = [0.12, 0.2, 0.27]; // how far it swings, rad
export const JAW = [0, 1, 1]; // the jaw hangs open from the second phase
export const FLARE = [0, 0, 1];
export const ORBIT = [0, 0, 1];
export const SWIRL = 0.55; // rad/s the ring of lights circles
const CHEW = [0.8, 1.6, 2.6]; // px the closed or open jaw works
const BREATH = [1.3, 1.6, 2.3]; // rad/s the lure breathes: slow
const RIPPLE = [0.9, 1.3, 1.9]; // rad/s the fins' ripple runs
const MOTES = 5;

const motions = new WeakMap();
const ease = (v, to, rate, dt) => v + (to - v) * (1 - Math.exp(-dt * rate));
export function motion(b, t, ph) {
  let m = motions.get(b);
  if (!m) { // first seen: everything as the phase has it, so a frozen frame never replays a transition
    m = { t, psi: t * OMEGA[ph], amp: AMP[ph], jaw: JAW[ph], chewAmp: CHEW[ph], chew: t * 1.3, flare: FLARE[ph], orbit: ORBIT[ph], ang: t * SWIRL, pr: BREATH[ph], pulse: t * BREATH[ph], rr: RIPPLE[ph], rip: t * RIPPLE[ph] };
    motions.set(b, m);
  }
  const dt = clamp(t - m.t, 0, 0.1);
  m.t = t;
  m.psi += OMEGA[ph] * dt;
  m.amp = ease(m.amp, AMP[ph], 1.6, dt);
  m.jaw = ease(m.jaw, JAW[ph], 2.6, dt);
  m.chewAmp = ease(m.chewAmp, CHEW[ph], 1.5, dt);
  m.chew += 1.3 * dt;
  m.flare = ease(m.flare, FLARE[ph], 1.4, dt);
  m.orbit = ease(m.orbit, ORBIT[ph], 1.1, dt);
  m.ang += SWIRL * dt;
  m.pr = ease(m.pr, BREATH[ph], 1.2, dt);
  m.pulse += m.pr * dt;
  m.rr = ease(m.rr, RIPPLE[ph], 1.2, dt);
  m.rip += m.rr * dt;
  return m;
}

// Where everything of the lure is this frame (one object, reused): the stalk's sway about its root, the tether's
// pivot (x, y), its angle th, the filaments' own sway th2, and the bulb's middle (lx, ly).
const P = { sway: 0, x: TIP[0], y: TIP[1], th: 0, th2: 0, lx: 0, ly: 0 };
export function lureAt(m) {
  P.sway = 0.035 * Math.sin(0.62 * m.psi + 1.2);
  const [dx, dy] = [TIP[0] - ROOT[0], TIP[1] - ROOT[1]];
  const [c, s] = [Math.cos(P.sway), Math.sin(P.sway)];
  P.x = ROOT[0] + dx * c - dy * s;
  P.y = ROOT[1] + dx * s + dy * c;
  P.th = m.amp * (Math.sin(m.psi) + 0.3 * Math.sin(2.31 * m.psi + 1.1));
  P.th2 = -0.5 * P.th + 0.1 * Math.sin(2.7 * m.psi + 0.4);
  P.lx = P.x - L * Math.sin(P.th);
  P.ly = P.y + L * Math.cos(P.th);
  return P;
}

// The opaque parts, in the boss's own pass: the stalk, the tether, the filaments and the bulb.
export function lureBody(ctx) {
  ctx.save();
  ctx.translate(ROOT[0], ROOT[1]);
  ctx.rotate(P.sway);
  ctx.translate(-ROOT[0], -ROOT[1]);
  ctx.drawImage(stalk(), STALK.x, STALK.y);
  ctx.restore();
  ctx.save();
  ctx.translate(P.x, P.y);
  ctx.rotate(P.th);
  ctx.drawImage(tether(), -6, -4);
  ctx.translate(0, L);
  ctx.save();
  ctx.rotate(P.th2);
  ctx.drawImage(filaments(), -FIL[0], -FIL[1]);
  ctx.restore();
  ctx.drawImage(bulb(), -BULB[0], -BULB[1]);
  ctx.restore();
}

// The light, every pass: a spill over the face, the wide soft glow, the inner glow and the white-hot core, a
// twinkle, the lights at the filaments' tips; flaring, rays and a shower of motes. `since` is when the phase began (a
// burst on the flare's first second).
export function lureLights(ctx, m, t, k, ph, since) {
  const { lx, ly } = P;
  const flare = m.flare;
  const pulse = 0.5 + 0.5 * Math.sin(m.pulse);
  const burst = ph === 2 ? clamp(Math.exp(-(t - since) * 2.2), 0, 1) : 0;
  ctx.save();
  ctx.translate(ROOT[0], ROOT[1]);
  ctx.rotate(P.sway);
  ctx.translate(-ROOT[0], -ROOT[1]);
  ctx.globalAlpha = k * (0.7 + 0.3 * pulse);
  ctx.drawImage(stalkGlow(), STALK.x, STALK.y);
  ctx.restore();
  ctx.globalAlpha = k * (0.1 + 0.05 * flare + 0.04 * pulse);
  ctx.drawImage(glow(AQUA), lx - 120, ly - 40, 240, 150);
  const R = Math.min(66, 54 + 4 * pulse + 5 * flare + 3 * burst);
  ctx.globalAlpha = k * (0.36 + 0.12 * pulse + 0.2 * flare);
  ctx.drawImage(glow(AQUA), lx - R, ly - R, R * 2, R * 2);
  const R2 = R * 0.62;
  ctx.globalAlpha = k * (0.3 + 0.2 * flare);
  ctx.drawImage(glow(PALE), lx - R2, ly - R2, R2 * 2, R2 * 2);
  const r3 = 13 + 2 * pulse + 3 * flare + 2 * burst;
  ctx.globalAlpha = k * (0.6 + 0.25 * pulse);
  ctx.drawImage(glow('#ffffff'), lx - r3, ly - r3, r3 * 2, r3 * 2);
  const sz = 70 + 14 * pulse + 20 * flare; // a four-point twinkle, always
  ctx.globalAlpha = k * (0.16 + 0.14 * pulse + 0.2 * flare);
  ctx.drawImage(star(PALE), lx - sz / 2, ly - sz / 2, sz, sz);
  ctx.save();
  ctx.translate(P.x, P.y);
  ctx.rotate(P.th);
  ctx.translate(0, L);
  ctx.rotate(P.th2);
  ctx.globalAlpha = k * (0.55 + 0.3 * pulse);
  ctx.drawImage(filamentGlow(), -FIL[0], -FIL[1]);
  ctx.restore();
  if (flare < 0.02) return;
  const s = 108 + 16 * pulse;
  ctx.globalAlpha = k * flare * (0.5 + 0.35 * pulse);
  ctx.drawImage(rays(0), lx - s / 2, ly - s / 2, s, s);
  ctx.globalAlpha = k * flare * (0.55 - 0.35 * pulse);
  ctx.drawImage(rays(1), lx - s / 2, ly - s / 2, s, s);
  for (let i = 0; i < MOTES; i++) { // motes spread outward and sink a little, never upward
    const u = (t * 0.42 + i / MOTES) % 1;
    const a = -0.4 + i * 0.85;
    const d = 14 + 48 * u;
    const r = 9 - 5 * u;
    ctx.globalAlpha = k * flare * Math.sin(Math.PI * u) * 0.85;
    ctx.drawImage(glow(i & 1 ? PALE : '#ffffff'), lx + Math.cos(a) * d - r, ly + Math.sin(a) * d * 0.8 + 18 * u * u - r, r * 2, r * 2);
  }
}

// Everything of the lure, for the live pass; the crest it grows from carries it away when destroyed.
export function lure(ctx, b, m, t, k, own, ph, since) {
  if (!alive(b, 'crest')) return;
  lureAt(m);
  if (own) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    lureBody(ctx);
    ctx.globalCompositeOperation = 'lighter';
  }
  lureLights(ctx, m, t, k, ph, since);
}
