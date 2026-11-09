// Sound patches of Ash to Air's rules (world 17, the breath style of sound-data.js): the help that comes and the
// Craving it comes against. Everything here is on the world's scale (E flat major), where a chord of the
// first, third and fifth degrees is a bright major one.
//   breath   a wave of fresh air starts rising (the breath twist): a deep inhale, a sub climbing from the root toward the fifth under it, swelling
//            into a bright major chord as the front tops out and ringing on: relief          (sounds.js 'breath')
//   cleanse  the wave wipes an enemy bullet: a tiny bright tick, higher the further right the bullet was, one note of
//            a major run that cannot clash with the chord; thinned hard by audio.js GAP        (sounds.js 'cleanse')
//   cravingRoar  the Craving's roar: a monstrous wheezing inhale, then a rasping, smoky roar    (sfx-boss.js)
// A patch is (a, o) -> seconds (audio-kit.js).
import { tone, hiss, fm, wobble, crush, noteHz } from './audio-kit.js';
import { clamp } from '../core/math.js';
import { WIDTH } from '../core/kinds.js';

export const RISE = 0.8; // how long the front takes to rise, when the event does not say (core twists BREATH_TIME)
const CHORD = [[0, 0.07], [2, 0.06], [4, 0.05], [7, 0.05], [9, 0.035]]; // [degree, peak]: root, third, fifth, octave, third
export const BANDS = 7;
export const RUN = [0, 1, 2, 4, 7, 8, 9]; // the bright degrees, a major pentatonic run (no sixth, no ache), one for each band

// The band (0..6) of a sound at world x; left of the screen is the lowest.
export const cleanseBand = (x) => clamp(Math.floor(((x ?? 0) / WIDTH) * BANDS), 0, BANDS - 1);

export const BREATH = {
  breath(a, o) {
    const rise = o.dur ?? RISE;
    const top = a.t + rise * 0.9; // the front tops out: the chord is full and the inhale is over
    hiss(a, { type: 'bandpass', f0: 220, f1: 2600, q: 0.8, attack: rise * 0.9, dur: 0.12, peak: 0.16 });
    hiss(a, { type: 'lowpass', f0: 300, f1: 1100, attack: rise * 0.9, dur: 0.2, peak: 0.1 });
    const root = noteHz(a.kit, 0, 2);
    tone(a, { f0: root, f1: root * 1.5, attack: rise * 0.9, dur: 0.5, peak: 0.16 }); // the chest filling: a sub that climbs toward the third as it peaks
    CHORD.forEach(([d, peak], i) => { // the chord swells in over the last two thirds of the inhale, a hair apart, and is full as the front tops out
      tone(a, { type: 'triangle', t: a.t + rise * 0.3 + i * 0.02, f0: noteHz(a.kit, d, 4), attack: rise * 0.6 - i * 0.02, dur: 1.1, peak });
    });
    fm(a, { t: top, f0: noteHz(a.kit, 2, 6), ratio: 3, index: 1, dur: 1, peak: 0.045, cut: 9000 }); // a shimmer over it: the third, two octaves up
    hiss(a, { t: top, type: 'highpass', f0: 7000, attack: 0.02, dur: 0.3, peak: 0.04 });
    return rise * 0.9 + 1.3;
  },
  cleanse(a, o) { // a tiny chirp up into a note, an octave glint over it and a puff of air
    const f = noteHz(a.kit, RUN[cleanseBand(o.x)], 5);
    tone(a, { f0: f * 0.85, f1: f, dur: 0.1, peak: 0.07 });
    tone(a, { f0: f * 2, dur: 0.05, peak: 0.018 });
    hiss(a, { type: 'bandpass', f0: 6500, q: 2, dur: 0.02, peak: 0.03 });
    return 0.15;
  },
};

// A gain a square wave shudders between its full level and 1 - depth, `rate` times a second, for dur from t, into the
// sound's out: noise sent through it is roughened, a throat's rasp, and keeps its own envelope.
function shudder(a, rate, depth, t, dur) {
  const g = a.ctx.createGain();
  g.gain.value = 1 - depth / 2;
  g.connect(a.out);
  wobble(a, g.gain, rate, depth / 2, t, dur, 'square');
  return g;
}

// The Craving's roar: it draws a monstrous wheezing breath (a rattling rush of air rising through a narrow throat, a thin
// whistle fluttering on top of it, a sub swelling in under) and lets it out as a rasp: three sawtooth voices crushed and
// falling, a roughened rush of smoke, a lung's sag and embers crackling as it ends. Nothing goes under 56 Hz, above
// world 9's roar floor. h is the phase (0..2); the rasp is harsher each time.
export function cravingRoar(a, h, dur) {
  const draw = dur * 0.38; // the wheeze
  const t = a.t + draw * 0.95; // the roar breaks out as the breath tops out
  const out = dur - draw;
  hiss(a, { type: 'bandpass', f0: 500, f1: 2800, q: 2.2, attack: draw * 0.9, dur: draw * 0.12, peak: 0.17, dest: shudder(a, 19, 0.5, a.t, draw) }); // phlegm rattling in it
  const whistle = tone(a, { f0: 780, f1: 1250, attack: draw * 0.9, dur: draw * 0.1, peak: 0.05 });
  wobble(a, whistle.frequency, 11, 40, a.t, draw);
  tone(a, { f0: 58, f1: 70, attack: draw * 0.9, dur: draw * 0.15, peak: 0.14 });
  hiss(a, { type: 'lowpass', f0: 300, f1: 120, attack: draw * 0.9, dur: draw * 0.12, peak: 0.12 });
  const dest = crush(a, 3 + h * 1.2);
  [1, 1.5, 2.01].forEach((m, i) => tone(a, {
    type: 'sawtooth', t, f0: (96 + h * 10) * m, f1: 66 * m, attack: 0.06, dur: out, peak: 0.055 - i * 0.012,
    detune: (i - 1) * (6 + h * 5), cut: 1500, cut1: 380, q: 2, dest,
  }));
  hiss(a, { t, type: 'bandpass', f0: 1400, f1: 500, q: 1.2, attack: 0.05, dur: out, peak: 0.16, dest: shudder(a, 27 + h * 9, 0.7, t, out) }); // the rasp
  hiss(a, { t, type: 'lowpass', f0: 700, f1: 120, attack: 0.08, dur: out, peak: 0.1 });
  [0.12, 0.2, 0.34, 0.41, 0.57, 0.7].slice(0, 4 + h).forEach((d, i) => hiss(a, { // embers crackling
    t: t + out * d, type: 'highpass', f0: 3500, dur: 0.015, peak: 0.08 - i * 0.008,
  }));
}
