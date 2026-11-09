// Sound patches of the boss fights and the big blasts, each landed on a moment the art stages:
// the charge-up that peaks as the attack fires, weak points that crunch against plates
// that clank, plates cracking open, parts torn off, a roar per phase (harsher each time), and the
// death: a scream, a groan as the hull snaps, blasts rising through the chain to the white-out.
// The roar takes the style's voice (sound-data.js).
import { tone, hiss, fm, wobble, crush, noteHz } from './audio-kit.js';

// The roar's voice per style: [oscillator wave, pitch, glide steps, waveshaper amount].
const ROAR = {
  brass: ['sawtooth', 0.9, 0, 2.5],
};

function roar(a, h, dur, fall) {
  const [type, p, steps, drive] = ROAR[a.kit.style];
  const dest = crush(a, drive + h * 1.5);
  const f = 72 * p;
  [1, 1.5, 2.01].forEach((m, i) => tone(a, {
    type, f0: f * m * (1 + h * 0.08), f1: f * m * fall, attack: 0.08, dur, peak: 0.07 - i * 0.015, steps,
    detune: (i - 1) * (8 + h * 7), cut: 700 + h * 700, cut1: 220, q: 3, dest,
  }));
  const growl = hiss(a, { type: 'bandpass', f0: 380 + h * 200, f1: 160, q: 1.8, attack: 0.1, dur, peak: 0.2 });
  wobble(a, growl.gain, 23 + h * 9, 0.08, a.t, dur, 'square');
}

// A blast; k in 0..1 swells it (the death chain rises), size 2 is a big one.
function blastAt(a, k, size) {
  const peak = Math.min(0.6, 0.22 + 0.3 * k + (size > 1 ? 0.15 : 0));
  hiss(a, { type: 'lowpass', f0: 2600 + 5000 * k, f1: 110, dur: 0.45 + 0.35 * size, peak });
  tone(a, { f0: 120 - 30 * k, f1: 28, dur: 0.4 + 0.3 * size, peak: peak * 1.1 });
  return 0.9 + 0.35 * size;
}

export const BOSS = {
  bossHit(a, o) {
    if (o.weak) { // a weak point: a bright crunch
      const d = crush(a, 4);
      hiss(a, { type: 'highpass', f0: 2800, f1: 1300, dur: 0.07, peak: 0.12, dest: d });
      tone(a, { type: a.kit.wave, f0: 760, f1: 190, dur: 0.09, peak: 0.065, cut: 5000, dest: d });
      return 0.15;
    }
    fm(a, { f0: 250, ratio: 2.1, index: 2.4, dur: 0.17, peak: 0.12, cut: 2200 }); // armour: a dull clank
    return 0.2;
  },
  warn(a, o) { // the charge: a whine and a flutter that climb to the moment it fires
    const w = o.warn;
    const whine = tone(a, {
      type: 'sawtooth', f0: 170 * a.kit.pitch, f1: 1500 * a.kit.pitch,
      attack: w * 0.92, dur: 0.06, peak: 0.1, cut: 3600, q: 4,
    });
    const flutter = wobble(a, whine.detune, 6, 30, a.t, w);
    flutter.frequency.setValueAtTime(6, a.t);
    flutter.frequency.exponentialRampToValueAtTime(42, a.t + w);
    hiss(a, { type: 'bandpass', f0: 600, f1: 5200, q: 3, attack: w * 0.9, dur: 0.05, peak: 0.1 });
    return w + 0.12;
  },
  expose(a) { // plates crack, then the fissures sizzle
    hiss(a, { type: 'highpass', f0: 3200, dur: 0.05, peak: 0.36 });
    tone(a, { f0: 150, f1: 48, dur: 0.24, peak: 0.36 });
    const sz = hiss(a, { t: a.t + 0.05, type: 'bandpass', f0: 4600, f1: 3000, q: 1.4, dur: 0.6, peak: 0.12 });
    wobble(a, sz.gain, 37, 0.07, a.t + 0.05, 0.6, 'square');
    return 0.8;
  },
  partDown(a) { // metal tearing
    fm(a, { type: 'sawtooth', f0: 430, f1: 105, ratio: Math.SQRT2, index: 4, dur: 0.5, peak: 0.07, cut: 3400 });
    hiss(a, { type: 'lowpass', f0: 6200, f1: 200, dur: 0.6, peak: 0.36 });
    tone(a, { f0: 84, f1: 34, dur: 0.5, peak: 0.36 });
    return 0.8;
  },
  phase(a, o) {
    const h = Math.min(2, o.phase ?? 1);
    roar(a, h, 1.2 + 0.2 * h, 0.7);
    [0, 1, 2, 3].slice(0, 2 + h).forEach((i) => tone(a, {
      type: 'square', t: a.t + 0.1 + i * 0.22, f0: i % 2 ? 640 : 860, dur: 0.18, peak: 0.03, cut: 2400,
    }));
    return 1.8;
  },
  bossDeath(a) { // the scream, then the hull groans as it snaps
    roar(a, 2, 2, 0.45);
    const t = a.t + 0.9;
    wobble(a, tone(a, { t, type: 'sawtooth', f0: 62, f1: 30, attack: 0.3, dur: 1.6, peak: 0.16, cut: 340 }).frequency, 3, 4, t, 1.9);
    fm(a, { t, f0: 96, f1: 58, ratio: 0.51, index: 3, attack: 0.2, dur: 1.7, peak: 0.05, cut: 900 });
    return 3;
  },
  boom: (a, o) => blastAt(a, o.k ?? 0, o.size ?? 1),
  blast(a) { // the last great one under the white-out
    tone(a, { f0: 72, f1: 18, dur: 2.8, peak: 0.75 });
    hiss(a, { type: 'lowpass', f0: 9500, f1: 80, dur: 3.2, peak: 0.6 });
    const crackle = hiss(a, { type: 'highpass', f0: 2200, f1: 600, attack: 0.05, dur: 1.8, peak: 0.2 });
    wobble(a, crackle.gain, 21, 0.15, a.t, 1.8, 'square');
    hiss(a, { type: 'bandpass', f0: 6200, q: 0.7, attack: 0.02, dur: 1.6, peak: 0.12 });
    tone(a, { t: a.t + 0.35, f0: noteHz(a.kit, 0, 2), dur: 2.6, peak: 0.12, attack: 0.4 });
    return 3.6;
  },
};
