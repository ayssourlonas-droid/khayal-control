// The hits of the music loops' drum line (sound-data.js STYLES[style].music.drum, one letter a step),
// and the voices that ride on it. A hit is (a, t, n) -> void: n = { deg, shift, step } is the lead's note
// of that step (deg, shifted by the progression, null on a rest), the progression's shift of it and the
// loop's step count, for the hits that follow the tune (the music box, the bass).
import { tone, hiss, fm, noteHz, bell } from './audio-kit.js';
import { BREATH_HITS } from './music-breath.js';
import { ANVIL_HITS } from './music-anvil.js';

// The waltz's bars are six steps; the second of each pair of bars sounds the chord's fifth where the first sounds its root.
const oddBar = (n) => Math.floor(n.step / 6) % 2;

// A tuba note: a round body and a blat that closes, and a hat's tick.
function oom(a, t, n) {
  const f = noteHz(a.kit, n.shift + (oddBar(n) ? 4 : 0), 2);
  tone(a, { t, f0: f, f1: f * 0.98, dur: 0.22, peak: 0.21 });
  tone(a, { t, type: 'sawtooth', f0: f, dur: 0.15, peak: 0.08, cut: 900, cut1: 300 });
  hiss(a, { t, type: 'highpass', f0: 8000, dur: 0.04, peak: 0.03 });
}

// The harp's arpeggio: chord degrees (root, fourth, fifth, octave...), one for every second step, seven long against
// the loop's eight so it phases a little each bar and never plays the same figure twice running.
const HARP = [0, 2, 3, 5, 3, 2, 1];

export const DRUM = {
  k: (a, t) => tone(a, { t, f0: 150, f1: 44, dur: 0.18, peak: 0.26 }),
  t: (a, t) => {
    tone(a, { t, f0: 115, f1: 48, dur: 0.42, peak: 0.3 });
    hiss(a, { t, type: 'lowpass', f0: 500, dur: 0.08, peak: 0.08 });
  },
  h: (a, t) => hiss(a, { t, type: 'highpass', f0: 8000, dur: 0.03, peak: 0.03 }),
  s: (a, t) => {
    hiss(a, { t, type: 'bandpass', f0: 1700, q: 0.8, dur: 0.12, peak: 0.08 });
    tone(a, { t, f0: 210, f1: 150, dur: 0.05, peak: 0.05 });
  },
  b: (a, t) => { // a low bell struck on the root, and the clapper's tick
    bell(a, { t, index: 1.8, dur: [2.2, 2.6, 1.4], peak: [0.1, 0.1, 0.035] });
    hiss(a, { t, type: 'highpass', f0: 3600, dur: 0.03, peak: 0.03 });
  },
  p: (a, t) => { // a soft timpani: a round thump that sags a fifth
    const f = noteHz(a.kit, 0, 2);
    tone(a, { t, f0: f * 1.5, f1: f, dur: 0.55, peak: 0.16 });
    hiss(a, { t, type: 'lowpass', f0: 320, dur: 0.07, peak: 0.05 });
  },
  c: (a, t) => { // a choir swelling in: a chord over the root (third, fifth, ninth), each note two detuned sawtooth voices
    for (const d of [2, 4, 8]) {
      for (const detune of [-6, 7]) tone(a, { type: 'sawtooth', t, f0: noteHz(a.kit, d, 3), detune, attack: 1.1, dur: 2.2, peak: 0.022, cut: 1000 });
    }
  },
  j: (a, t) => { // sleigh bells: bright rattles tumbling over each other, and a thin ring that hangs
    [0, 0.03, 0.055, 0.1, 0.13].forEach((d, i) => hiss(a, { t: t + d, type: 'bandpass', f0: [7200, 5600, 8400, 6400, 7800][i], q: 6, dur: 0.1, peak: 0.03 }));
    fm(a, { t, f0: 3300, ratio: 2.76, index: 1.2, dur: 0.6, peak: 0.02 });
  },
  f: (a, t) => { // a soft frame drum: a round thump on the skin, the palm's slap on top
    tone(a, { t, f0: 132, f1: 84, dur: 0.3, peak: 0.18 });
    hiss(a, { t, type: 'bandpass', f0: 1500, q: 0.9, dur: 0.06, peak: 0.07 });
  },
  z: (a, t, n) => { // a plucked bass on the chord's root, then its octave: a round body and a string snapping off the lowpass
    const f = noteHz(a.kit, n.shift + (n.step % 4 === 2 ? 0 : 7), 2);
    tone(a, { t, f0: f, f1: f * 0.99, dur: 0.3, peak: 0.13 });
    tone(a, { t, type: 'sawtooth', f0: f, dur: 0.22, peak: 0.08, cut: 1900, cut1: 240 });
  },
  m: (a, t, n) => { // a music box: a thin bell on the step's own note, an octave over the harp, ringing out
    if (n.deg != null) fm(a, { t, f0: noteHz(a.kit, n.deg, 5), ratio: 4.2, index: 1.8, dur: 1.1, peak: 0.045, cut: 7000 });
  },
  r: (a, t) => { // a snare roll into the bar: six taps crowding together and swelling
    [0, 0.04, 0.077, 0.111, 0.142, 0.17].forEach((d, i) => hiss(a, { t: t + d, type: 'bandpass', f0: 1900, q: 0.9, dur: 0.045, peak: 0.03 + i * 0.008 }));
  },
  o: (a, t, n) => { // a string chopped short: the chord's root, fifth, third, fifth in turn, two detuned sawtooth voices
    const d = n.shift + [0, 4, 2, 4][(n.step >> 1) % 4];
    for (const detune of [-9, 10]) tone(a, { type: 'sawtooth', t, f0: noteHz(a.kit, d, 3), detune, attack: 0.012, dur: 0.1, peak: 0.03, cut: 2200, cut1: 700 });
  },
  u: oom, // a tuba on the chord's root (its fifth on every second bar)
  y: (a, t, n) => { // the same under a cymbal crash: a long hiss that shimmers on and dies away
    oom(a, t, n);
    hiss(a, { t, type: 'highpass', f0: 6500, f1: 3800, dur: 0.5, peak: 0.06 });
  },
  a: (a, t, n) => { // the band organ's chord, stabbed (root, third and fifth, short square voices) with the snare tapping under it
    for (const d of [0, 2, 4]) tone(a, { type: 'square', t, f0: noteHz(a.kit, n.shift + d, 3), attack: 0.008, dur: 0.1, peak: 0.1, cut: 2400 });
    hiss(a, { t, type: 'bandpass', f0: 2000, q: 0.9, dur: 0.07, peak: 0.12 });
    tone(a, { t, f0: 220, f1: 150, dur: 0.04, peak: 0.07 });
  },
  g: (a, t, n) => { // a glockenspiel tinkling the chord's fifth, and its octave on the next bar
    fm(a, { t, f0: noteHz(a.kit, n.shift + (oddBar(n) ? 7 : 4), 5), ratio: 3.51, index: 1.3, dur: 0.45, peak: 0.1, cut: 8000 });
  },
  l: (a, t) => { // a giant's heart: the lub, a deep thump on the root that sags away
    const f = noteHz(a.kit, 0, 2);
    tone(a, { t, f0: f * 1.2, f1: f * 0.5, dur: 0.26, peak: 0.26 });
    hiss(a, { t, type: 'lowpass', f0: 280, dur: 0.06, peak: 0.07 });
  },
  d: (a, t) => { // ...and the dub, lighter and a little higher
    const f = noteHz(a.kit, 0, 2);
    tone(a, { t, f0: f * 1.45, f1: f * 0.6, dur: 0.18, peak: 0.15 });
  },
  w: (a, t, n) => { // a harp plucked on the chord, a whole-number FM partner making it a string, ringing long in the deep
    const d = n.shift + HARP[(n.step >> 1) % HARP.length];
    fm(a, { t, f0: noteHz(a.kit, d, 4), ratio: 3, index: 2.4, dur: 1.5, peak: 0.075, cut: 6000 });
  },
  n: (a, t, n) => { // a low pad swelling in: the chord's root, fourth and fifth, each two detuned voices
    for (const d of [0, 2, 3]) {
      for (const detune of [-7, 8]) tone(a, { type: 'triangle', t, f0: noteHz(a.kit, n.shift + d, 3), detune, attack: 1.2, dur: 2.6, peak: 0.03, cut: 700 });
    }
  },
  q: (a, t, n) => { // a choir bowing in over two bars: the chord's root, third, fifth and octave, each two detuned sawtooth voices through a vowel's resonance, and the root low under them
    for (const d of [0, 2, 4, 7]) {
      for (const detune of [-7, 8]) tone(a, { type: 'sawtooth', t, f0: noteHz(a.kit, n.shift + d, 3), detune, attack: 1, hold: 1.2, dur: 1.4, peak: 0.024, cut: 900, cut1: 1500, q: 3 });
    }
    tone(a, { type: 'triangle', t, f0: noteHz(a.kit, n.shift, 2), attack: 1, hold: 1.2, dur: 1.4, peak: 0.07, cut: 500 });
  },
  x: (a, t, n) => { // a tubular bell: a struck tube (a free bar's partners, 2.76 times the note) ringing long, the chord's root high in the first bar of a pair and its fifth low in the second, and the mallet's tick
    const high = n.step % 12 < 6;
    fm(a, { t, f0: noteHz(a.kit, n.shift + (high ? 0 : 4), high ? 4 : 3), ratio: 2.76, index: 1.5, dur: 2.4, peak: 0.09, cut: 7000 });
    hiss(a, { t, type: 'highpass', f0: 5000, dur: 0.02, peak: 0.03 });
  },
  v: (a, t) => { // strings bowing a chord in: root, third, fifth and octave, each two detuned sawtooth voices, the bow opening the filter
    for (const d of [0, 2, 4, 7]) {
      for (const detune of [-8, 9]) tone(a, { type: 'sawtooth', t, f0: noteHz(a.kit, d, 3), detune, attack: 0.9, dur: 1.7, peak: 0.035, cut: 600, cut1: 2200 });
    }
  },
  ...BREATH_HITS, // K C O: four on the floor, claps and open hats with the bass (Ash to Air)
  ...ANVIL_HITS, // H A T P: a heavy kick with the bass, an anvil struck on the backbeat, a thunder tom, a pad (Anvil Sky)
};
