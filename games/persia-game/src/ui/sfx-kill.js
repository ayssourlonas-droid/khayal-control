// An alien's death: a pop of air and a body pitched by role (grunts pop high, armored crash low,
// carriers sparkle up the scale), the combo lifting it a semitone a step, and one layer in the
// style's own voice. A patch: (a, o) -> seconds.
import { tone, hiss, fm, crush, semis, noteHz } from './audio-kit.js';

const BODY = { grunt: [720, 110, 0.12], diver: [1150, 170, 0.14], gunner: [400, 60, 0.18], armored: [260, 50, 0.26], carrier: [880, 140, 0.15] };

// The style's layer: f0 is the role's body pitch.
const FLAVOUR = {
  brass: (a, f0) => fm(a, { f0: f0 * 2, f1: f0 * 0.5, ratio: 1.5, index: 1.2, dur: 0.18, peak: 0.05 }),
};

export function kill(a, o) {
  const { kit } = a;
  const k = kit.pitch * semis(Math.min(7, (o.mult ?? 1) - 1));
  const [f0, f1, dur] = BODY[o.role] ?? BODY.grunt;
  hiss(a, { type: 'lowpass', f0: 6500, f1: 280, dur: 0.22, peak: 0.24 });
  if (o.role === 'armored') fm(a, { f0: 310 * k, f1: 90 * k, ratio: 1.41, index: 3, dur: 0.32, peak: 0.1, cut: 4000 });
  tone(a, { type: 'triangle', f0: f0 * k, f1: f1 * k, dur, peak: 0.14, dest: o.role === 'gunner' ? crush(a, 3) : a.out, cut: kit.cut });
  FLAVOUR[kit.style](a, f0 * k);
  if (o.role === 'carrier') {
    [4, 7, 9, 11].forEach((d, i) => tone(a, { t: a.t + 0.04 + i * 0.045, f0: noteHz(kit, d, 6), dur: 0.16, peak: 0.07 }));
  }
  return 0.42;
}
