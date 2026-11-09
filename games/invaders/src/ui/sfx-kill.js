// An alien's death as a drum hit, in step with the gun's techno pattern (sfx-shot.js): a short pop of
// air, a hit by role (grunts tick, divers snap, gunners thump a gritty tom, armored clank, carriers
// sparkle up the world's scale) and a short stab in the world's own wave on a note of its scale, so a
// kill in Ronin Moon still sounds like Ronin Moon. A combo climbs that scale a step a kill, and from x4
// an open hat rides on top. Nothing glides far: the long slides were what made the old deaths scream.
// A patch: (a, o) -> seconds.
import { tone, hiss, fm, crush, noteHz } from './audio-kit.js';
import { COMBO_MAX, COMBO_HOT } from '../core/scoring.js';

// The hit by role; k is the world's pitch.
const HIT = {
  grunt: (a, k) => {
    hiss(a, { type: 'bandpass', f0: 1800 * k, q: 2, dur: 0.04, peak: 0.16 });
    tone(a, { f0: 620 * k, f1: 500 * k, dur: 0.03, peak: 0.08 });
  },
  diver: (a, k) => {
    hiss(a, { type: 'bandpass', f0: 3000 * k, q: 1.5, dur: 0.05, peak: 0.16 });
    tone(a, { type: 'triangle', f0: 940 * k, f1: 760 * k, dur: 0.03, peak: 0.07 });
  },
  gunner: (a, k) => tone(a, { f0: 175 * k, f1: 130 * k, dur: 0.14, peak: 0.24, dest: crush(a, 3) }),
  armored: (a, k) => fm(a, { f0: 420 * k, f1: 380 * k, ratio: 2.76, index: 2.5, dur: 0.18, peak: 0.1, cut: 5000 }),
  carrier: (a) => hiss(a, { type: 'highpass', f0: 6000, dur: 0.05, peak: 0.1 }),
};
// Where each role's stab sits: [degree of the world's scale, octave].
const STAB = { grunt: [0, 5], diver: [4, 5], gunner: [2, 4], armored: [0, 4], carrier: [2, 5] };

export function kill(a, o) {
  const { kit } = a;
  const role = HIT[o.role] ? o.role : 'grunt';
  const step = Math.min(COMBO_MAX, o.mult ?? 1) - 1;
  hiss(a, { type: 'lowpass', f0: 5000, f1: 700, dur: 0.08, peak: kit.style === 'hive' ? 0.12 : 0.18 });
  HIT[role](a, kit.pitch);
  const [degree, octave] = STAB[role];
  tone(a, { type: kit.wave, f0: noteHz(kit, degree + step, octave), dur: 0.06, peak: 0.05, cut: kit.cut });
  if (step >= COMBO_HOT - 1) hiss(a, { type: 'highpass', f0: 7000, dur: 0.08, peak: 0.06 });
  if (role === 'carrier') {
    [4, 7, 9, 11].forEach((d, i) => tone(a, { t: a.t + 0.04 + i * 0.045, f0: noteHz(kit, d, 6), dur: 0.16, peak: 0.07 }));
  }
  return role === 'carrier' ? 0.36 : 0.22;
}
