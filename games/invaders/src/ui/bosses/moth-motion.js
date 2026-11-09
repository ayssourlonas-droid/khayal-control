// What moves on the Vesper Moth, summed frame by frame per boss (World 16, Glass Cathedral; moth-fx.js reads it): a
// WeakMap keyed by the boss holds every clock and every eased amount, so a phase change speeds things up or eases them
// without a jump, and a boss first seen in a phase (a frozen frame, a clone) is drawn as that phase has it, never
// replaying a transition.
//   motion(b, t, ph) -> { beat: the wingbeat's angle, lo, hi: the lowest and highest pose it reaches (eased), pose:
//   where the beat is now (0..1: 0 the wing at rest, 1 spread widest), rose: the rose window's light turning (rad),
//   spin: the light circling the eyespots (rad), breath: the abdomen's glow (rad), blaze: how fully the eyespots
//   blaze (0..1), fall: how much the glass scales fall (0..1), scales: their clock (s), glow: the rose window's
//   light, brighter each phase }
// The first phase beats slowly and low, the hover phase holds the wings wide open with a gentle beat and the eyespots
// blazing, the last beats fast and full and sheds scales.
import { clamp } from '../../core/math.js';

export const BEAT = [1.7, 2.3, 4.4]; // rad/s the wings beat: a beat takes 3.7, 2.7 and 1.4 s
export const LO = [0, 0.4, 0.06]; // the lowest pose of the beat
export const HI = [0.52, 0.94, 1];
export const ROSE = [0.22, 0.34, 0.6]; // rad/s the rose window's light turns
export const SPIN = [0.8, 1.5, 2.4]; // rad/s the light circles the eyespots
export const BREATH = [1.5, 2.1, 3]; // rad/s the abdomen breathes
export const BLAZE = [0.25, 1, 1];
export const FALL = [0, 0, 1];
export const GLOW = [0.5, 0.62, 0.74];

const motions = new WeakMap();
const ease = (v, to, rate, dt) => v + (to - v) * (1 - Math.exp(-dt * rate));
export const poseOf = (m) => m.lo + (m.hi - m.lo) * (0.5 - 0.5 * Math.cos(m.beat));

export function motion(b, t, ph) {
  let m = motions.get(b);
  if (!m) { // first seen: as the phase has it
    m = { t, beat: t * BEAT[ph], rate: BEAT[ph], lo: LO[ph], hi: HI[ph], rose: t * ROSE[ph], rr: ROSE[ph], spin: t * SPIN[ph], sr: SPIN[ph], breath: t * BREATH[ph], br: BREATH[ph], blaze: BLAZE[ph], fall: FALL[ph], glow: GLOW[ph], scales: t, pose: 0 };
    motions.set(b, m);
  }
  const dt = clamp(t - m.t, 0, 0.1);
  m.t = t;
  m.rate = ease(m.rate, BEAT[ph], 1.4, dt);
  m.beat += m.rate * dt;
  m.lo = ease(m.lo, LO[ph], 1.4, dt);
  m.hi = ease(m.hi, HI[ph], 1.4, dt);
  m.rr = ease(m.rr, ROSE[ph], 1.2, dt);
  m.rose += m.rr * dt;
  m.sr = ease(m.sr, SPIN[ph], 1.2, dt);
  m.spin += m.sr * dt;
  m.br = ease(m.br, BREATH[ph], 1.2, dt);
  m.breath += m.br * dt;
  m.blaze = ease(m.blaze, BLAZE[ph], 1.1, dt);
  m.fall = ease(m.fall, FALL[ph], 0.9, dt);
  m.glow = ease(m.glow, GLOW[ph], 1.1, dt);
  m.scales += dt;
  m.pose = poseOf(m);
  return m;
}
