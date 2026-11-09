// Sound patches of the stingers and the menus. The stingers play in the world's scale and its lead
// voice (chip square, noir saw, koto pluck and taiko, cosmic organ, aurora bells, archive violin, armada
// horns, carnival steam whistle, abyss theremin, glass harmonica, breath flute...), so a clear in Ronin Moon
// sounds like Ronin Moon. Menu sounds are short, soft and in key. A patch is (a, o) -> seconds.
import { tone, hiss, fm, wobble, noteHz } from './audio-kit.js';

// The world's lead voice for melodic stingers: tone options for a note of `dur` seconds.
const LEAD = {
  chip: { type: 'square', cut: 5000, peak: 0.06 },
  noir: { type: 'sawtooth', cut: 2400, peak: 0.07 },
  brass: { type: 'sawtooth', cut: 3000, peak: 0.07, attack: 0.03 },
  koto: { type: 'triangle', cut: 6000, peak: 0.13 },
  hive: { type: 'sine', peak: 0.12, attack: 0.05 },
  code: { type: 'square', cut: 3200, peak: 0.075 },
  iron: { type: 'sawtooth', cut: 2400, peak: 0.1 },
  cosmic: { type: 'sine', peak: 0.12, attack: 0.08 },
  monster: { type: 'sawtooth', cut: 1700, peak: 0.08, attack: 0.04 },
  gothic: { type: 'sawtooth', cut: 2300, peak: 0.065, attack: 0.05 },
  aurora: { type: 'sine', peak: 0.09 },
  archive: { type: 'sawtooth', cut: 3300, peak: 0.08, attack: 0.07 },
  armada: { type: 'sawtooth', cut: 900, cut1: 3400, peak: 0.07, attack: 0.05 }, // a horn: the filter opens as the note swells
  carnival: { type: 'sine', peak: 0.11, attack: 0.03 }, // a steam whistle: a pure note, a breath on it and an octave ringing over
  abyss: { type: 'sine', peak: 0.1, attack: 0.07 }, // a theremin: a pure note a hand makes waver, with a glassy ring over it
  glass: { type: 'sine', peak: 0.09, attack: 0.06 }, // a glass harmonica: a pure note bowed in, a twin beating against it
  breath: { type: 'triangle', peak: 0.1, attack: 0.025 }, // a clear flute: a bright, clean note with its octave and a high partner over it
};

function note(a, degree, octave, t, dur, peak = 1) {
  const v = LEAD[a.kit.style] ?? LEAD.noir;
  const f = noteHz(a.kit, degree, octave);
  const lead = tone(a, { ...v, t, f0: f, dur, peak: v.peak * peak });
  if (a.kit.style === 'cosmic' || a.kit.style === 'gothic') tone(a, { ...v, t, f0: f * 2, dur, peak: v.peak * peak * 0.35 }); // the organ's octave
  if (a.kit.style === 'aurora') fm(a, { t, f0: f * 2, ratio: 3.51, index: 1.1, dur, peak: v.peak * peak * 0.4 }); // the bell's glassy ring, an octave up
  if (a.kit.style === 'archive') { // a solo violin: the bow rasps in, then the note shakes with a vibrato that blooms late
    hiss(a, { t, type: 'bandpass', f0: f * 6, q: 1.5, attack: 0.02, dur: 0.07, peak: 0.02 * peak });
    wobble(a, lead.frequency, 5.4, f * 0.011, t + dur * 0.3, dur * 0.7);
  }
  if (a.kit.style === 'carnival') { // the steam shivers: a breathy hiss, a quick vibrato and the octave over a whistle's tone
    hiss(a, { t, type: 'bandpass', f0: f * 2, q: 3, attack: 0.03, dur, peak: 0.03 * peak });
    wobble(a, lead.frequency, 6.5, f * 0.008, t + dur * 0.3, dur * 0.7);
    tone(a, { ...v, t, f0: f * 2, dur, peak: v.peak * peak * 0.25 });
  }
  if (a.kit.style === 'abyss') { // the hand shakes the note (5.8 Hz, wider than a violin's) and the glass rings an octave up
    wobble(a, lead.frequency, 5.8, f * 0.012, t + dur * 0.2, dur * 0.8);
    fm(a, { t, f0: f * 2, ratio: 3.51, index: 0.9, dur, peak: v.peak * peak * 0.3 });
  }
  if (a.kit.style === 'glass') { // the bow: a twin a few cents off beats against the note, and a thin octave sounds over both
    tone(a, { ...v, t, f0: f, dur, peak: v.peak * peak * 0.8, detune: 5 });
    tone(a, { ...v, t, f0: f * 2, dur, peak: v.peak * peak * 0.12 });
  }
  if (a.kit.style === 'breath') { // the hope in it: an octave and a twelfth ringing over the note, pure, no beating and no shake
    tone(a, { type: 'sine', t, f0: f * 2, dur, peak: v.peak * peak * 0.3 });
    tone(a, { type: 'sine', t, f0: f * 3, dur: dur * 0.8, peak: v.peak * peak * 0.08 });
  }
  if (['noir', 'brass', 'monster', 'armada'].includes(a.kit.style)) tone(a, { ...v, t, f0: f, dur, peak: v.peak * peak * 0.7, detune: 12 });
}

export const UI = {
  waveClear(a) { // time slows: a downward swoop, then two notes up
    hiss(a, { type: 'bandpass', f0: 2400, f1: 300, q: 1.2, dur: 0.6, peak: 0.12 });
    note(a, 4, 5, a.t + 0.12, 0.35, 0.8);
    note(a, 7, 5, a.t + 0.24, 0.6, 0.8);
    return 1;
  },
  cleared(a) { // the fanfare: a run up the scale and a held chord over the root
    const t = a.t;
    [0, 2, 4, 7].forEach((d, i) => note(a, d, 4, t + i * 0.11, 0.22));
    [7, 9, 11].forEach((d) => note(a, d, 4, t + 0.46, 1.5, 0.8));
    tone(a, { t: t + 0.46, f0: noteHz(a.kit, 0, 2), attack: 0.02, dur: 1.6, peak: 0.25 });
    if (a.kit.style === 'koto') [0, 0.46].forEach((d) => tone(a, { t: t + d, f0: 140, f1: 48, dur: 0.45, peak: 0.22 }));
    hiss(a, { t: t + 0.46, type: 'highpass', f0: 7000, attack: 0.05, dur: 0.8, peak: 0.03 });
    return 2.4;
  },
  failed(a) { // a slow fall to the root, and a low drone left hanging
    [4, 2, 1, 0].forEach((d, i) => note(a, d, 4, a.t + i * 0.24, 0.4, 0.9));
    tone(a, { type: 'sawtooth', t: a.t + 0.9, f0: noteHz(a.kit, 0, 2), f1: noteHz(a.kit, 0, 2) * 0.97, attack: 0.1, dur: 1.6, peak: 0.08, cut: 500 });
    return 2.8;
  },
  move(a) {
    tone(a, { f0: noteHz(a.kit, 4, 6), dur: 0.05, peak: 0.035 });
    hiss(a, { type: 'highpass', f0: 6500, dur: 0.015, peak: 0.02 });
    return 0.08;
  },
  select(a) {
    [0, 4].forEach((d, i) => tone(a, { type: 'triangle', t: a.t + i * 0.07, f0: noteHz(a.kit, d, 5), dur: 0.16, peak: 0.12 }));
    hiss(a, { type: 'highpass', f0: 6000, attack: 0.02, dur: 0.12, peak: 0.03 });
    return 0.3;
  },
  back(a) {
    tone(a, { type: 'triangle', f0: noteHz(a.kit, 4, 5), f1: noteHz(a.kit, 0, 5), dur: 0.12, peak: 0.08 });
    return 0.15;
  },
  pause(a) {
    tone(a, { f0: 320, f1: 140, dur: 0.22, peak: 0.12, cut: 900 });
    hiss(a, { type: 'lowpass', f0: 700, dur: 0.1, peak: 0.05 });
    return 0.25;
  },
  start(a) { // a level begins: a rising whoosh into the root
    hiss(a, { type: 'bandpass', f0: 250, f1: 4200, q: 1.1, attack: 0.55, dur: 0.15, peak: 0.13 });
    note(a, 0, 4, a.t + 0.55, 0.7, 0.9);
    tone(a, { t: a.t + 0.55, f0: noteHz(a.kit, 0, 2), dur: 0.6, peak: 0.25 });
    return 1.3;
  },
  star(a, o) { // each star stamps a little higher
    const n = o.n ?? 1;
    tone(a, { f0: 140, f1: 60, dur: 0.15, peak: 0.3 });
    fm(a, { f0: noteHz(a.kit, 2 + n * 2, 5), ratio: 3.5, index: 0.9, dur: 0.7, peak: 0.08 });
    return 0.75;
  },
  best(a) { // a new record: a sparkle up the scale
    [0, 2, 4, 7, 9, 11].forEach((d, i) => tone(a, { t: a.t + i * 0.05, f0: noteHz(a.kit, d, 6), dur: 0.2, peak: 0.05 }));
    return 0.6;
  },
  count(a) {
    tone(a, { type: 'square', f0: 2200, dur: 0.012, peak: 0.012, cut: 4000 });
    return 0.03;
  },
};
