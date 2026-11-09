// Sound patches of the boss fights and the big blasts, each landed on a moment the art stages:
// the charge-up that peaks as the attack fires, weak points that crunch against plates
// that clank and hull that swallows the hit, plates cracking open, parts torn off, a roar per
// phase (harsher each time; the fortress's trench slides open into a reactor hum), and the death:
// a scream, a groan as the hull snaps, blasts rising through the chain to the white-out.
// The boss sounds like its world: the roar and the charge take the world's style (sound-data.js).
import { tone, hiss, fm, wobble, crush, noteHz, bell } from './audio-kit.js';
import { glassRoar } from './sfx-glass.js';
import { cravingRoar } from './sfx-breath.js';
import { squallRoar } from './sfx-storm.js';

// The roar's voice per style: [oscillator wave, pitch, glide steps, waveshaper amount].
const ROAR = {
  chip: ['square', 1.4, 10, 1.5], noir: ['sawtooth', 1, 0, 2], brass: ['sawtooth', 0.9, 0, 2.5], koto: ['triangle', 1.2, 0, 2],
  hive: ['sawtooth', 1.6, 0, 3], code: ['square', 1.2, 14, 4], iron: ['sawtooth', 0.8, 0, 5], cosmic: ['sine', 0.7, 0, 1.5],
  monster: ['sawtooth', 0.62, 0, 4], gothic: ['triangle', 0.9, 0, 1.2],
  aurora: ['triangle', 1.1, 0, 1.5],
  archive: ['triangle', 0.85, 0, 3],
  armada: ['sawtooth', 0.78, 0, 2.5],
  carnival: ['square', 0.95, 0, 2],
  abyss: ['sine', 0.8, 0, 1],
};

function roar(a, h, dur, fall) {
  if (a.kit.style === 'glass') return glassRoar(a, h, dur); // the Moth: a great bell tolled over an organ cluster, no growl
  if (a.kit.style === 'breath') return cravingRoar(a, h, dur); // the Craving: a wheezing inhale, then a rasping, smoky roar
  if (a.kit.style === 'anvil') return squallRoar(a, h, dur); // the Squall Ray: a thunderclap, a sharp crack and a long rolling rumble
  const [type, p, steps, drive] = ROAR[a.kit.style] ?? ROAR.noir;
  const dest = crush(a, drive + h * 1.5);
  const f = 72 * p;
  [1, 1.5, 2.01].forEach((m, i) => tone(a, {
    type, f0: f * m * (1 + h * 0.08), f1: f * m * fall, attack: 0.08, dur, peak: 0.07 - i * 0.015, steps,
    detune: (i - 1) * (8 + h * 7), cut: 700 + h * 700, cut1: 220, q: 3, dest,
  }));
  const growl = hiss(a, { type: 'bandpass', f0: 380 + h * 200, f1: 160, q: 1.8, attack: 0.1, dur, peak: 0.2 });
  wobble(a, growl.gain, 23 + h * 9, 0.08, a.t, dur, 'square');
  if (a.kit.style === 'hive') wobble(a, tone(a, { f0: 1900, f1: 900, attack: 0.15, dur: dur * 0.6, peak: 0.04 }).frequency, 9, 140, a.t, dur);
  if (a.kit.style === 'koto') tone(a, { f0: 110, f1: 40, dur: 0.6, peak: 0.5 });
  if (a.kit.style === 'monster') { // a bellow an octave above the floor, falling and shaking, over a lung's rumble
    const bellow = tone(a, { type: 'sawtooth', f0: 150 + h * 20, f1: 62, attack: 0.15, dur: dur * 0.9, peak: 0.07, cut: 900, cut1: 250, q: 4, dest });
    wobble(a, bellow.frequency, 5, 9, a.t, dur);
    hiss(a, { type: 'lowpass', f0: 500, f1: 110, attack: 0.2, dur, peak: 0.1 });
  }
  if (a.kit.style === 'gothic') { // a great bell struck and left ringing, and a bat's shriek cutting over it
    bell(a, { index: 2.6, dur: [dur * 1.2, dur * 1.2, dur], peak: [0.16, 0.14, 0.06] });
    const t = a.t + 0.18;
    const shriek = tone(a, { type: 'sawtooth', t, f0: 2600 + h * 500, f1: 5600, attack: 0.03, dur: dur * 0.55, peak: 0.035, cut: 7000, q: 5 });
    wobble(a, shriek.frequency, 24 + h * 8, 420, t, dur * 0.55);
    hiss(a, { t, type: 'bandpass', f0: 5200, f1: 3000, q: 4, attack: 0.04, dur: dur * 0.5, peak: 0.05 });
  }
  if (a.kit.style === 'aurora') { // the glacier cracking, then the wyrm's cry: a keen that falls, with ice in its throat
    [0, 0.07, 0.19, 0.31].forEach((d, i) => hiss(a, { t: a.t + d, type: 'highpass', f0: 4200 - i * 500, f1: 1500, dur: 0.05, peak: 0.2 - i * 0.03 }));
    const creak = tone(a, { type: 'sawtooth', f0: 96, f1: 58, attack: 0.1, dur: dur * 0.8, peak: 0.08, cut: 320, q: 3 });
    wobble(a, creak.frequency, 31, 12, a.t, dur * 0.8, 'square');
    const t = a.t + 0.15;
    const cry = tone(a, { type: 'triangle', t, f0: 520 + h * 60, f1: 190, attack: 0.25, dur, peak: 0.09, cut: 2600, q: 3 });
    wobble(a, cry.frequency, 6, 14, t, dur);
    fm(a, { t, f0: 1040 + h * 120, f1: 380, ratio: 2.76, index: 1.2, attack: 0.25, dur: dur * 0.8, peak: 0.03 });
  }
  if (a.kit.style === 'archive') { // the Grimoire slams shut: a boom, the cover's leathery crack, a settling thud, then a rush of pages
    tone(a, { f0: 118, f1: 34, dur: 0.95, peak: 0.5 });
    hiss(a, { type: 'lowpass', f0: 3000, f1: 140, dur: 0.4, peak: 0.34 });
    hiss(a, { type: 'bandpass', f0: 1100, q: 1.2, dur: 0.07, peak: 0.25 });
    tone(a, { t: a.t + 0.22, f0: 92, f1: 40, dur: 0.3, peak: 0.2 });
    hiss(a, { t: a.t + 0.14, type: 'bandpass', f0: 1500, f1: 6200, q: 0.9, attack: 0.3, dur: dur * 0.4, peak: 0.1 });
    [0, 0.05, 0.09, 0.15, 0.19, 0.26, 0.3, 0.38, 0.45, 0.55].forEach((d, i) => hiss(a, {
      t: a.t + 0.2 + d, type: 'bandpass', f0: 3200 + (i % 3) * 1400, q: 1.2, dur: 0.05, peak: 0.13 - i * 0.008,
    }));
  }
  if (a.kit.style === 'armada') { // the Galleon fires a salvo, four guns rippling down the deck, and its timbers creak under the recoil
    [0, 0.15, 0.27, 0.46].forEach((d, i) => {
      tone(a, { t: a.t + d, f0: 150 - i * 12, f1: 40, dur: 0.45, peak: 0.36 - i * 0.04 });
      hiss(a, { t: a.t + d, type: 'lowpass', f0: 2600, f1: 160, dur: 0.3, peak: 0.28 - i * 0.03 });
    });
    const t = a.t + 0.1;
    const groan = tone(a, { type: 'sawtooth', t, f0: 134, f1: 76, attack: 0.2, dur: dur * 0.9, peak: 0.07, cut: 460, q: 6 });
    wobble(a, groan.frequency, 8, 12, t, dur); // the beam straining, a stick-slip shudder
    const creak = hiss(a, { t, type: 'bandpass', f0: 820, f1: 430, q: 10, attack: 0.15, dur: dur * 0.8, peak: 0.12 });
    wobble(a, creak.gain, 14, 0.07, t, dur * 0.8, 'square');
  }
  if (a.kit.style === 'abyss') { // the Leviathan's moan: a whale's call that climbs and then sags (two sweeps with a slow vibrato) over a sub swell
    const moan = (t, f0, f1, attack, len) => wobble(a, tone(a, { t, f0, f1, attack, dur: len, peak: 0.12 }).frequency, 4.5, f0 * 0.03, t, attack + len);
    moan(a.t + 0.05, 150 + h * 15, 420, dur * 0.35, dur * 0.35);
    moan(a.t + dur * 0.45, 420, 170, 0.06, dur * 0.55);
    tone(a, { f0: 52, f1: 66, attack: dur * 0.7, dur: dur * 0.4, peak: 0.22 });
    hiss(a, { type: 'lowpass', f0: 160, f1: 60, attack: dur * 0.6, dur: dur * 0.5, peak: 0.1 });
  }
  if (a.kit.style === 'carnival') { // the Carousel's band organ: a seventh chord swells in on square pipes, over a ratchet cranked ever faster
    [0, 2, 4, 6].forEach((d) => [-9, 9].forEach((detune) => tone(a, {
      type: 'square', f0: noteHz(a.kit, d, 3), detune, attack: dur * 0.6, dur: dur * 0.4, peak: 0.028, cut: 500, cut1: 2600,
    })));
    for (let t = 0, gap = 0.12, i = 0; t < dur * 0.85; t += gap, gap = Math.max(0.04, gap * 0.88), i++) {
      hiss(a, { t: a.t + t, type: 'bandpass', f0: i % 2 ? 2300 : 3100, q: 6, dur: 0.02, peak: 0.16 }); // a pawl clicking over the teeth
    }
  }
}

// A blast; k in 0..1 swells it (the death chain rises), size 2 is a big one.
function blastAt(a, k, size) {
  const peak = Math.min(0.6, 0.22 + 0.3 * k + (size > 1 ? 0.15 : 0));
  hiss(a, { type: 'lowpass', f0: 2600 + 5000 * k, f1: 110, dur: 0.45 + 0.35 * size, peak });
  tone(a, { f0: 120 - 30 * k, f1: 28, dur: 0.4 + 0.3 * size, peak: peak * 1.1 });
  if (a.kit.style === 'koto') tone(a, { f0: 150, f1: 50, dur: 0.5, peak: peak * 0.8 });
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
    if (o.dmg > 0) { // armour: a dull clank
      fm(a, { f0: 250, ratio: 2.1, index: 2.4, dur: 0.17, peak: 0.12, cut: 2200 });
      return 0.2;
    }
    tone(a, { f0: 92, f1: 55, dur: 0.1, peak: 0.12 }); // hull: the hit is swallowed
    hiss(a, { type: 'lowpass', f0: 420, dur: 0.05, peak: 0.08 });
    return 0.14;
  },
  warn(a, o) { // the charge: a whine and a flutter that climb to the moment it fires
    const w = o.warn;
    const chip = a.kit.style === 'chip' || a.kit.style === 'code';
    const whine = tone(a, {
      type: chip ? 'square' : a.kit.wave === 'sine' ? 'triangle' : 'sawtooth', f0: 170 * a.kit.pitch, f1: 1500 * a.kit.pitch,
      attack: w * 0.92, dur: 0.06, peak: 0.1, steps: chip ? 12 : 0, cut: 3600, q: 4,
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
    if (!o.open) return 1.8;
    const t = a.t + 0.4; // the trench: a hydraulic slide, a clunk and white-hot light, then the reactor
    hiss(a, { t, type: 'lowpass', f0: 180, f1: 1700, attack: 0.4, dur: 1.2, peak: 0.2 });
    tone(a, { t, type: 'sawtooth', f0: 42, f1: 66, attack: 0.3, dur: 1.3, peak: 0.1, cut: 420 });
    tone(a, { t: t + 1.6, f0: 130, f1: 40, dur: 0.32, peak: 0.45 });
    hiss(a, { t: t + 1.6, type: 'highpass', f0: 2400, dur: 0.25, peak: 0.25 });
    [55, 110, 165].forEach((f, i) => wobble(a, tone(a, { t: t + 1.7, f0: f, attack: 0.5, dur: 2.8, peak: 0.07 - i * 0.02 }).detune, 5, 12, t + 1.7, 3.3));
    return 5.2;
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
