// Sound patches of the eight world twists: Neon Rain's thunder, Twin Suns' gusts, Ronin Moon's
// shuriken cut (an ice shard shattering, in Aurora Kingdom), Hive's acid, Code Rain's teleport glitch and
// bullet-time swell (a page fluttering and a harp note, and a string chord held, in Starlit Archive), Iron
// Dawn's wrecks that reassemble (glass that shatters, mends and tinkles, in Glass Cathedral), Event Horizon's
// well swallowing bullets (a glassy bloop, in Lantern Deep's maelstrom), and Arcade Origin's warbling saucer.
// A patch is (a, o) -> seconds (audio-kit.js); a.tail is a stereo panner when the sound has an x.
import { tone, hiss, fm, wobble, crush, noteHz } from './audio-kit.js';
import { bloop } from './sfx-deep.js';
import { shatter as glassShatter, mend, tinkle } from './sfx-glass.js';
import { WIDTH } from '../core/kinds.js';

// Sweep the sound's panner from one side to the other over `secs`.
function sweep(a, from, to, secs) {
  const p = a.tail.pan;
  if (!p) return;
  p.setValueAtTime(from, a.t);
  p.linearRampToValueAtTime(to, a.t + secs);
}

// Aurora Kingdom's shards are ice: a glassy crack, splinters tinkling down and a little chime on a
// note of the scale that climbs with the x the shard broke at (five bands across the screen).
function shatter(a, o) {
  hiss(a, { type: 'highpass', f0: 7000, f1: 3200, dur: 0.06, peak: 0.2 });
  [5200, 6900, 4300].forEach((f, i) => tone(a, { t: a.t + 0.02 + i * 0.03, f0: f, f1: f * 0.94, dur: 0.08, peak: 0.035 - i * 0.007 }));
  const degree = [2, 4, 6, 7, 9][Math.min(4, Math.max(0, Math.floor((o.x ?? 0) / 384)))];
  fm(a, { t: a.t + 0.04, f0: noteHz(a.kit, degree, 5), ratio: 3.51, index: 0.8, dur: 0.5, peak: 0.06 });
  return 0.6;
}

// Starlit Archive's alien blinks as a page turns: a flutter of paper, and a harp note on the scale of the
// landing x, climbing from the left of the screen to the right (seven bands, D F A B D F A in D dorian: two octaves).
const HARP = [0, 2, 4, 5, 7, 9, 11];
function pageBlink(a, o) {
  [0, 0.028, 0.06, 0.085, 0.13].forEach((d, i) => hiss(a, {
    t: a.t + d, type: 'bandpass', f0: [5200, 3600, 6400, 4300, 5600][i], q: 1.4, dur: 0.035, peak: 0.14 - i * 0.017,
  }));
  const band = Math.min(HARP.length - 1, Math.max(0, Math.floor(((o.x ?? 0) / WIDTH) * HARP.length)));
  fm(a, { t: a.t + 0.04, f0: noteHz(a.kit, HARP[band], 4), ratio: 3, index: 3.2, dur: 0.75, peak: 0.115, cut: 6500 });
  return 0.85;
}

// ...and bullet time (2 s) is strings held: a chord of the scale (root, fifth, octave and the third over it, a
// low root under them) bowed in and held until time returns, when the same chord falls away. Each note is
// two detuned sawtooth voices.
const STRINGS = [0, 4, 7, 9];
function chord(a, o) {
  STRINGS.forEach((d) => [-7, 8].forEach((detune) => tone(a, { ...o, type: 'sawtooth', f0: noteHz(a.kit, d, 3), detune, q: 1 })));
  tone(a, { ...o, f0: noteHz(a.kit, 0, 2), peak: o.peak * 2, cut: undefined });
}

export const WORLD = {
  thunder(a, o) {
    const s = o.strength ?? 0.8;
    hiss(a, { type: 'highpass', f0: 1800, f1: 700, dur: 0.1, peak: 0.36 * s });
    const r = hiss(a, { type: 'lowpass', f0: 900, f1: 70, attack: 0.05, dur: 2.3, peak: 0.5 * s });
    wobble(a, r.gain, 6.5, 0.12 * s, a.t, 2.3, 'square');
    hiss(a, { t: a.t + 0.4, type: 'lowpass', f0: 420, f1: 60, attack: 0.2, dur: 1.6, peak: 0.3 * s });
    return 2.8;
  },
  gust(a, o) {
    const dir = Math.sign(o.wind) || 1;
    sweep(a, -0.7 * dir, 0.7 * dir, 1.7);
    const w = hiss(a, { type: 'bandpass', f0: 280, f1: 1300, q: 1.3, attack: 0.65, dur: 1.05, peak: 0.5 });
    wobble(a, w.gain, 3.1, 0.05, a.t, 1.7);
    hiss(a, { type: 'highpass', f0: 5200, attack: 0.5, dur: 0.9, peak: 0.08 }); // the sand hiss on top
    return 1.9;
  },
  cut(a, o) { // a shot slices a shuriken: a steel shing (an ice shard shatters)
    if (a.kit.style === 'aurora') return shatter(a, o);
    fm(a, { f0: 3100, ratio: 1.41, index: 0.8, dur: 0.38, peak: 0.07 });
    hiss(a, { type: 'highpass', f0: 6400, f1: 2800, dur: 0.06, peak: 0.14 });
    return 0.42;
  },
  acid(a) { // a drip, then the sizzle where it lands
    tone(a, { f0: 1500, f1: 480, dur: 0.08, peak: 0.07 });
    const s = hiss(a, { t: a.t + 0.06, type: 'highpass', f0: 3600, f1: 2400, attack: 0.03, dur: 0.5, peak: 0.1 });
    wobble(a, s.gain, 41, 0.05, a.t + 0.06, 0.55, 'square');
    return 0.65;
  },
  teleport(a, o) { // a digital glitch out, and back in a beat later (a page flutters, a harp note)
    if (a.kit.style === 'archive') return pageBlink(a, o);
    const d = crush(a, 6);
    tone(a, { type: 'square', f0: 2100, f1: 260, steps: 9, dur: 0.11, peak: 0.03, dest: d });
    hiss(a, { type: 'highpass', f0: 5200, dur: 0.04, peak: 0.05 });
    tone(a, { type: 'square', t: a.t + 0.1, f0: 300, f1: 1900, steps: 7, dur: 0.08, peak: 0.025, dest: d });
    return 0.25;
  },
  bulletOn(a) { // time thickens: everything swoops down (the strings swell in)
    if (a.kit.style === 'archive') {
      chord(a, { attack: 0.8, hold: 1.2, dur: 0.4, peak: 0.015, cut: 500, cut1: 2400 });
      return 2.5;
    }
    tone(a, { type: 'sawtooth', f0: 440, f1: 82, dur: 0.95, peak: 0.12, cut: 2200, cut1: 260 });
    hiss(a, { type: 'lowpass', f0: 2400, f1: 180, dur: 0.95, peak: 0.14 });
    hiss(a, { type: 'highpass', f0: 3000, f1: 8000, attack: 0.35, dur: 0.1, peak: 0.06 });
    return 1.1;
  },
  bulletOff(a) { // (the strings fall away)
    if (a.kit.style === 'archive') {
      chord(a, { attack: 0.04, dur: 1.1, peak: 0.015, cut: 2400, cut1: 400 });
      return 1.4;
    }
    tone(a, { type: 'sawtooth', f0: 82, f1: 440, dur: 0.5, peak: 0.08, cut: 300, cut1: 2400 });
    return 0.6;
  },
  wreck(a, o) { // a machine knocked flat, still twitching (a pane of glass shatters)
    if (a.kit.style === 'glass') return glassShatter(a, o);
    tone(a, { f0: 170, f1: 58, dur: 0.22, peak: 0.26 });
    hiss(a, { type: 'lowpass', f0: 3200, f1: 280, dur: 0.32, peak: 0.2 });
    fm(a, { t: a.t + 0.1, f0: 820, ratio: 2.7, index: 2, dur: 0.12, peak: 0.04 });
    return 0.45;
  },
  wreckDown(a, o) { // (the shards scatter, tinkling)
    if (a.kit.style === 'glass') return tinkle(a, o);
    hiss(a, { type: 'lowpass', f0: 5000, f1: 250, dur: 0.4, peak: 0.32 });
    fm(a, { f0: 380, f1: 120, ratio: 1.41, index: 3.2, dur: 0.32, peak: 0.08, cut: 3200 });
    return 0.5;
  },
  reassemble(a, o) { // a ratchet winding faster, a servo whine, a clunk (a reversed shimmer rising to a clink)
    if (a.kit.style === 'glass') return mend(a, o);
    let t = a.t;
    for (let i = 0; i < 9; i++) {
      hiss(a, { t, type: 'highpass', f0: 2600 + i * 200, dur: 0.014, peak: 0.16 });
      t += 0.11 * 0.8 ** i;
    }
    tone(a, { type: 'sawtooth', f0: 190, f1: 760, attack: 0.5, dur: 0.12, peak: 0.05, cut: 1600 });
    tone(a, { t: t + 0.04, f0: 140, f1: 52, dur: 0.2, peak: 0.34 });
    return t - a.t + 0.3;
  },
  absorb(a, o) { // the well swallows a bullet: a dark falling thoom (the maelstrom blips)
    if (a.kit.style === 'abyss') return bloop(a, o);
    tone(a, { f0: 330, f1: 26, dur: 0.75, peak: 0.11 });
    hiss(a, { type: 'lowpass', f0: 700, f1: 50, dur: 0.6, peak: 0.06 });
    return 0.9;
  },
  saucer(a, o) { // the bonus saucer's warble, flying across
    const dir = o.dir ?? 1;
    sweep(a, -0.8 * dir, 0.8 * dir, 3.2);
    const w = tone(a, { type: 'triangle', f0: 540, attack: 0.4, dur: 2.9, peak: 0.11 });
    wobble(a, w.frequency, 7, 130, a.t, 3.3);
    const s = tone(a, { type: 'square', f0: 1080, attack: 0.4, dur: 2.9, peak: 0.025, cut: 2400 });
    wobble(a, s.frequency, 7, 260, a.t, 3.3);
    return 3.4;
  },
};
