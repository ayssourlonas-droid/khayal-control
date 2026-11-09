// The open's film sounds (screens/open.js), in the world's key: the "braam" (a huge low brass chord:
// detuned saws through a soft clip, a filter that blooms open and slowly shuts, a sub under it), the
// riser into the title and the title's impact.
import { tone, hiss, fm, crush, noteHz } from './audio-kit.js';

export const FILM = {
  braam(a) {
    const t = a.t;
    const f = noteHz(a.kit, 0, 2);
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
};
