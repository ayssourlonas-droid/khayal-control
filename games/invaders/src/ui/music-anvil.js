// The hits of Anvil Sky's beat (sound-data.js STYLES.anvil, one letter a step, a step a sixteenth of a beat): a heavy, half-time
// rock beat under struck iron, kept off the echo (a.dry) so each hit lands once. A hit is (a, t, n) -> void (music-drums.js);
// n.shift is the progression's shift of the tune in scale degrees, and a shift of a whole octave (5 in a five-note scale) is
// taken as no shift at all (shift % 5), so the beat stays low while the lead lifts.
//   H  a heavy kick with the chord's root plucked under it on the bar's first beat and its "and of 3" (the fifth on the
//      latter): a round thump that drops, a click, and a clean bass note
//   A  an anvil struck on the backbeat: a thud of the hammer, a high ring (an iron bar's partners, 2.76 times the note)
//      that rings out about half a second, a thin glint over it and a tick; the root on beat two, the fifth on beat four
//   T  a low thunder tom, round and short with no noise wash, falling in pitch through a fill
//   P  an open pad swelling in just after the downbeat of every second bar: the chord's root, fifth and octave, each two
//      detuned triangle voices; the one voice here that goes through the echo
import { tone, hiss, fm, noteHz } from './audio-kit.js';

const dry = (a) => ({ ...a, out: a.dry ?? a.out });
const chordDeg = (n) => n.shift % 5; // the chord's root in the beat's own register
const TOM = { 10: 1.62, 11: 1.45, 14: 1.3, 15: 1.12 }; // a fill's toms, each lower than the last (a step in its bar)

function heavy(w, t, n) {
  const a = dry(w);
  tone(a, { t, f0: 135, f1: 42, dur: 0.24, peak: 0.3 });
  hiss(a, { t, type: 'lowpass', f0: 2000, dur: 0.012, peak: 0.05 });
  const f = noteHz(a.kit, chordDeg(n) + (n.step % 16 === 10 ? 3 : 0), 2);
  tone(a, { t, f0: f, dur: 0.3, peak: 0.1 });
  tone(a, { t, type: 'triangle', f0: f, dur: 0.2, peak: 0.07, cut: 1400, cut1: 260 });
}

function anvil(w, t, n) {
  const a = dry(w);
  const f = noteHz(a.kit, chordDeg(n) + (n.step % 16 === 12 ? 3 : 0), 5);
  tone(a, { t, f0: 240, f1: 130, dur: 0.07, peak: 0.1 });
  fm(a, { t, f0: f, ratio: 2.76, index: 1.2, dur: 0.5, peak: 0.1, cut: 7000 });
  tone(a, { t, f0: f * 5.4, dur: 0.16, peak: 0.022 });
  hiss(a, { t, type: 'highpass', f0: 5200, dur: 0.012, peak: 0.04 });
}

function tom(w, t, n) {
  const a = dry(w);
  const f = noteHz(a.kit, chordDeg(n), 2) * (TOM[n.step % 16] ?? 1.3);
  tone(a, { t, f0: f * 1.5, f1: f, dur: 0.32, peak: 0.2 });
  hiss(a, { t, type: 'lowpass', f0: 500, dur: 0.02, peak: 0.04 });
}

function pad(w, t, n) { // not dry: the pad is the one thing here that rings through the echo
  for (const d of [0, 3, 5]) {
    for (const detune of [-6, 7]) tone(w, { type: 'triangle', t, f0: noteHz(w.kit, n.shift + d, 3), detune, attack: 1.2, dur: 2.6, peak: 0.03, cut: 800 });
  }
}

export const ANVIL_HITS = { H: heavy, A: anvil, T: tom, P: pad };
