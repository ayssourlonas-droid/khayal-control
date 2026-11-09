// The hits of Ash to Air's dance beat (sound-data.js STYLES.breath, one letter a step, a step a sixteenth of a beat):
// four on the floor under a clear morning. A hit is (a, t, n) -> void (music-drums.js).
//   K  the kick on a beat: a round thump that drops, with a click on top
//   C  the kick under a clap, on beats two and four: three hands a hair apart, then the room
//   O  an open hat on the off-beat, the bass plucking the chord's root under it
// All three play dry, past the world's echo (a.dry), so each hit lands once; the piano and the choir keep it.
import { tone, hiss, noteHz } from './audio-kit.js';

const dry = (a) => ({ ...a, out: a.dry ?? a.out });

function kick(a, t) {
  tone(a, { t, f0: 160, f1: 46, dur: 0.2, peak: 0.3 });
  hiss(a, { t, type: 'lowpass', f0: 2400, dur: 0.012, peak: 0.05 });
}

export const BREATH_HITS = {
  K: (a, t) => kick(dry(a), t),
  C: (w, t) => {
    const a = dry(w);
    kick(a, t);
    for (const d of [0, 0.011, 0.022]) hiss(a, { t: t + d, type: 'bandpass', f0: 1400, q: 1.2, dur: 0.012, peak: 0.12 });
    hiss(a, { t: t + 0.03, type: 'bandpass', f0: 1200, q: 0.9, dur: 0.14, peak: 0.09 });
  },
  O: (w, t, n) => {
    const a = dry(w);
    hiss(a, { t, type: 'highpass', f0: 7500, dur: 0.14, peak: 0.05 });
    const f = noteHz(a.kit, n.shift, 2);
    tone(a, { t, f0: f, dur: 0.18, peak: 0.1 });
    tone(a, { t, type: 'sawtooth', f0: f, dur: 0.14, peak: 0.06, cut: 1600, cut1: 240 });
  },
};
