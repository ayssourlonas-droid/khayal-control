// What moves on the Craving, summed frame by frame per boss (World 17, Ash to Air; craving-fx.js reads it): a WeakMap keyed by the
// boss holds every clock and every eased amount, so a phase change speeds the smoke up or thickens it without a jump, and a boss
// first seen in a phase (a frozen dev frame, a clone) is drawn as that phase has it, never replaying a transition.
//   motion(b, t, ph) -> { churn: the churn's clock in cycles (its fraction is the pose of the smoke frames), rate: cycles a
//   second now, thick: how much of the second, fatter layer of smoke shows (0..1), heave: the whole mass's swell (0..1) and
//   beat: its clock (rad), inhale: how hard the maw draws breath (0..1), pulse: a clock for the pulsing (rad), ember: how
//   bright the embers are, rain: how much they fall, blaze: how fully the maw burns (0..1), eye: the extra glow of the eye that
//   takes aim (0..1) }
// sway: the smoke churns slowly (a cycle takes 9 s), thin, the embers dim, the maw banked. hover: it rears: a cycle in 5 s, the smoke
// thick, the maw draws breath (inhale 1) and burns, since it now fires its laser from here on. orbit: it thrashes: a cycle in
// 2.4 s, the whole mass heaving, the embers raining, the maw burning with the breath pulsing as it fires, the eye flaring.
import { clamp } from '../../core/math.js';

export const RATE = [0.11, 0.2, 0.42]; // churn cycles a second
export const THICK = [0, 1, 0.8];
export const HEAVE = [0, 0, 1];
export const INHALE = [0.1, 1, 0.5];
export const EMBER = [0.35, 0.7, 1];
export const RAIN = [0, 0, 1];
export const BLAZE = [0.3, 1, 1];
export const EYE = [0, 0.2, 1];

const motions = new WeakMap();
const ease = (v, to, rate, dt) => v + (to - v) * (1 - Math.exp(-dt * rate));
export const frac = (v) => v - Math.floor(v); // where a clock is in its cycle, 0..1

export function motion(b, t, ph) {
  let m = motions.get(b);
  if (!m) { // first seen: as the phase has it
    m = { t, churn: t * RATE[ph], rate: RATE[ph], thick: THICK[ph], heave: HEAVE[ph], beat: t * 2.6, inhale: INHALE[ph], pulse: t * 5, ember: EMBER[ph], rain: RAIN[ph], blaze: BLAZE[ph], eye: EYE[ph] };
    motions.set(b, m);
  }
  if (t === m.t) return m; // the frame's second call (behind, then fx): no time has passed, so nothing would move
  const dt = clamp(t - m.t, 0, 0.1);
  m.t = t;
  m.rate = ease(m.rate, RATE[ph], 1.2, dt);
  m.churn += m.rate * dt;
  m.thick = ease(m.thick, THICK[ph], 0.9, dt);
  m.heave = ease(m.heave, HEAVE[ph], 1.1, dt);
  m.beat += (2.2 + 1.4 * m.heave) * dt;
  m.inhale = ease(m.inhale, INHALE[ph], 1.2, dt);
  m.pulse += (3.4 + 2.2 * m.heave) * dt;
  m.ember = ease(m.ember, EMBER[ph], 0.9, dt);
  m.rain = ease(m.rain, RAIN[ph], 0.8, dt);
  m.blaze = ease(m.blaze, BLAZE[ph], 1.2, dt);
  m.eye = ease(m.eye, EYE[ph], 1.2, dt);
  return m;
}
