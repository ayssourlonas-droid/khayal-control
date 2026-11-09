// Sound patches of bullet time: on a near miss time thickens and everything swoops down, then it
// snaps back. A patch is (a, o) -> seconds (audio-kit.js).
import { tone, hiss } from './audio-kit.js';

export const WORLD = {
  bulletOn(a) { // time thickens: everything swoops down
    tone(a, { type: 'sawtooth', f0: 440, f1: 82, dur: 0.95, peak: 0.12, cut: 2200, cut1: 260 });
    hiss(a, { type: 'lowpass', f0: 2400, f1: 180, dur: 0.95, peak: 0.14 });
    hiss(a, { type: 'highpass', f0: 3000, f1: 8000, attack: 0.35, dur: 0.1, peak: 0.06 });
    return 1.1;
  },
  bulletOff(a) {
    tone(a, { type: 'sawtooth', f0: 82, f1: 440, dur: 0.5, peak: 0.08, cut: 300, cut1: 2400 });
    return 0.6;
  },
};
