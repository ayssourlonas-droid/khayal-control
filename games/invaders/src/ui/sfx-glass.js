// Sound patches of Glass Cathedral's rules (world 16, the glass style of sound-data.js). Everything here rings as
// glass on the world's scale (B melodic minor), and where it happens on the screen sets the note: seven bands from
// the left to the right, so a row of them plays a little run of notes.
//   mirrorShot   the glass twin fires with the ship: a thin ping a hair after the ship's shot, at the twin's x
//   shatter      a wreck falls (world 7's reassemble twist, drawn as glass): a crack, a stone chip's thud, the pane ringing
//                and shards raining down            (sfx-world.js wreck)
//   mend         a wreck stands up: its shards draw together as a reversed shimmer, swelling and cut off, then a clink
//                (sfx-world.js reassemble)
//   tinkle       a wreck shot down: shards scattering and glinting           (sfx-world.js wreckDown)
//   glassRoar    the Vesper Moth's roar: a great bell tolled twice over an organ cluster swelling in   (sfx-boss.js)
// A patch is (a, o) -> seconds (audio-kit.js). The glass rings with an FM partner at 2.32 times its pitch, a wine glass's.
import { tone, hiss, fm, noteHz } from './audio-kit.js';
import { clamp } from '../core/math.js';
import { WIDTH } from '../core/kinds.js';

const BANDS = 7;

// The scale degree (0..6) of a sound at world x; left of the screen is the lowest.
export const glassBand = (x) => clamp(Math.floor(((x ?? 0) / WIDTH) * BANDS), 0, BANDS - 1);

// The shards fly together in this long (fx react-glass.js MEND_LIFE), and meet on the clink.
export const MEND = 0.45;

const RAIN = [3, 5, 2, 4, 6]; // degrees over the pane's note the shards fall through
const SCATTER = [[0, 4], [0.03, 2], [0.07, 5], [0.12, 1], [0.19, 3], [0.28, 0], [0.4, 2]]; // when (the shards fly apart and fall, slower and slower), and which degree over the note

export const GLASS = {
  mirrorShot(a, o) { // the twin fires: a thin ping on a note of the scale and a tick of glass, softer than any drum hit of the ship's shot
    const t = a.t + 0.02;
    fm(a, { t, f0: noteHz(a.kit, glassBand(o.x), 5), ratio: 2.32, index: 0.7, dur: 0.18, peak: 0.075, cut: 8000 });
    hiss(a, { t, type: 'highpass', f0: 7500, dur: 0.012, peak: 0.04 });
    return 0.25;
  },
};

export function shatter(a, o) {
  const band = glassBand(o.x);
  hiss(a, { type: 'highpass', f0: 8000, f1: 3600, dur: 0.07, peak: 0.2 });
  tone(a, { f0: 190, f1: 80, dur: 0.1, peak: 0.14 });
  fm(a, { t: a.t + 0.01, f0: noteHz(a.kit, band, 5), ratio: 2.32, index: 1.4, dur: 0.5, peak: 0.09, cut: 8000 });
  RAIN.forEach((d, i) => {
    const f = noteHz(a.kit, band + d, 5);
    tone(a, { t: a.t + 0.04 + i * 0.035, f0: f, f1: f * 0.985, dur: 0.07, peak: 0.04 - i * 0.005 });
  });
  return 0.7;
}

export function mend(a, o) {
  const band = glassBand(o.x);
  hiss(a, { type: 'bandpass', f0: 1800, f1: 9000, q: 1.2, attack: MEND, dur: 0.02, peak: 0.1 }); // reversed: it swells and stops dead
  [0, 2, 4].forEach((d, i) => {
    const f = noteHz(a.kit, band + d, 5);
    [0, 9].forEach((detune) => tone(a, { t: a.t + i * 0.05, f0: f * 0.8, f1: f, attack: MEND - i * 0.05, dur: 0.02, peak: 0.045, detune }));
  });
  const t = a.t + MEND;
  fm(a, { t, f0: noteHz(a.kit, band + 7, 5), ratio: 2.76, index: 2, dur: 0.45, peak: 0.12, cut: 9000 });
  hiss(a, { t, type: 'highpass', f0: 6500, dur: 0.02, peak: 0.14 });
  hiss(a, { t: t + 0.035, type: 'highpass', f0: 8000, dur: 0.015, peak: 0.06 });
  return MEND + 0.55;
}

export function tinkle(a, o) {
  const band = glassBand(o.x);
  hiss(a, { type: 'highpass', f0: 9000, dur: 0.03, peak: 0.08 });
  SCATTER.forEach(([when, d], i) => {
    const f = noteHz(a.kit, band + d, 5);
    tone(a, { t: a.t + when, f0: f, f1: f * 0.985, dur: 0.1, peak: 0.1 - i * 0.012 });
  });
  return 0.65;
}

// The Moth's roar: the hum is the bell's octave under its note (62 Hz), the pedal under the organ too, both above the
// monster's roar of world 9, the lowest of all. h is the phase (0..2): a louder cluster of more notes each time.
export function glassRoar(a, h, dur) {
  const f = noteHz(a.kit, 0, 2);
  [[0, 1.2, 1], [0.4, 0.8, 0.7]].forEach(([when, ring, k]) => { // two tolls, the second softer and shorter
    const t = a.t + dur * when;
    const len = dur * ring;
    fm(a, { t, f0: f, ratio: 2.41, index: 2.2, dur: len, peak: 0.2 * k, cut: 2600 });
    tone(a, { t, f0: f * 0.5, dur: len, peak: 0.16 * k });
    tone(a, { t, f0: f * 1.19, dur: len * 0.8, peak: 0.07 * k });
    hiss(a, { t, type: 'highpass', f0: 3600, dur: 0.04, peak: 0.08 * k }); // the clapper
  });
  [0, 1, 2, 3, 4].slice(0, 3 + h).forEach((d) => [-6, 7].forEach((detune) => tone(a, {
    type: 'sawtooth', f0: noteHz(a.kit, d, 3), detune, attack: dur * 0.7, dur: dur * 0.5, peak: 0.022, cut: 500, cut1: 2400, q: 1.5,
  })));
  tone(a, { f0: noteHz(a.kit, 0, 1), attack: dur * 0.6, dur: dur * 0.5, peak: 0.16 });
}
