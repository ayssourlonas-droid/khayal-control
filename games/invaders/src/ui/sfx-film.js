// Sound patches of the trailer and the blooper, in the world's key: the "braam" under each title
// card (a huge low brass chord: detuned saws through a soft clip, a filter that blooms open and
// slowly shuts, a sub under it), the riser into the title, the title's impact, the film leader's
// projector ticks and its beep, a whoosh into a clip, the tape rewind and the clapperboard.
import { tone, hiss, fm, crush, noteHz } from './audio-kit.js';

const BRAAM_DEG = [0, -2, 2]; // each card a different chord root, so three in a row build

export const FILM = {
  braam(a, o = {}) {
    const t = a.t;
    const f = noteHz(a.kit, BRAAM_DEG[(o.n ?? 0) % BRAAM_DEG.length], 2);
    const grit = crush(a, 2.4);
    for (const [mul, det] of [[1, -11], [1, 9], [2, 5], [1.5, -4]]) { // root, octave and fifth: a power chord
      tone(a, { type: 'sawtooth', t, f0: f * mul, f1: f * mul * 0.985, detune: det, attack: 0.07, dur: 2.3, peak: 0.07, cut: 320, cut1: 110, q: 1.6, dest: grit });
    }
    tone(a, { type: 'sawtooth', t, f0: f, attack: 0.03, dur: 0.8, peak: 0.12, cut: 2200, cut1: 180, dest: grit }); // the bloom
    tone(a, { t, f0: f / 2, attack: 0.05, dur: 2.6, peak: 0.34 }); // sub
    hiss(a, { t, type: 'lowpass', f0: 1100, f1: 90, attack: 0.008, dur: 0.9, peak: 0.13 });
    return 2.8;
  },
  riser(a) {
    const t = a.t;
    const up = 1.3;
    hiss(a, { t, type: 'bandpass', f0: 280, f1: 7500, q: 2.4, attack: up, dur: 0.08, peak: 0.17 });
    tone(a, { type: 'sawtooth', t, f0: noteHz(a.kit, 0, 3), f1: noteHz(a.kit, 0, 5), attack: up, dur: 0.06, peak: 0.05, cut: 400, cut1: 5200 });
    tone(a, { t, f0: 60, f1: 150, attack: up, dur: 0.05, peak: 0.14 });
    return up + 0.2;
  },
  impact(a) { // the title lands: a braam, a boom, a cymbal wash and a bell shimmer over it
    FILM.braam(a);
    tone(a, { t: a.t, f0: 130, f1: 30, dur: 1.5, peak: 0.5 });
    hiss(a, { t: a.t, type: 'highpass', f0: 3200, f1: 9000, attack: 0.01, dur: 1.8, peak: 0.06 });
    fm(a, { t: a.t + 0.04, f0: noteHz(a.kit, 0, 6), ratio: 3.01, index: 1.3, dur: 2.6, peak: 0.05 });
    return 3;
  },
  tick(a) { // the projector's claw pulling a frame
    hiss(a, { type: 'highpass', f0: 4200, attack: 0.001, dur: 0.014, peak: 0.06 });
    tone(a, { type: 'square', f0: 95, dur: 0.02, peak: 0.025, cut: 900 });
    return 0.05;
  },
  pop(a) { // the leader's beep before the picture
    tone(a, { f0: 1000, attack: 0.002, dur: 0.07, peak: 0.1 });
    return 0.1;
  },
  whoosh(a) {
    hiss(a, { type: 'bandpass', f0: 380, f1: 3600, q: 1.3, attack: 0.16, dur: 0.12, peak: 0.08 });
    return 0.3;
  },
  rewind(a) { // a tape spooled back: a falling, stuttering whine over hiss
    hiss(a, { type: 'bandpass', f0: 6000, f1: 700, q: 1.5, attack: 0.02, dur: 0.6, peak: 0.12 });
    tone(a, { type: 'sawtooth', f0: 1100, f1: 150, attack: 0.01, dur: 0.6, peak: 0.04, cut: 2600, steps: 14 });
    return 0.7;
  },
  clap(a) { // the clapperboard: a sharp crack, the wood's knock and a thump of the stick
    hiss(a, { type: 'highpass', f0: 1600, attack: 0.001, dur: 0.07, peak: 0.55 });
    hiss(a, { type: 'bandpass', f0: 950, q: 3, attack: 0.001, dur: 0.12, peak: 0.25 });
    tone(a, { type: 'triangle', f0: 640, f1: 380, attack: 0.001, dur: 0.06, peak: 0.3 });
    tone(a, { f0: 170, f1: 70, attack: 0.002, dur: 0.12, peak: 0.25 });
    return 0.3;
  },
};
