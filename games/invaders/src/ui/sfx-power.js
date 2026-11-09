// Sound patches of the power-ups and the smart bomb: pickups chime in the world's scale (an extra life
// climbs it), each power switches on with its own gesture (ON, by kind; world 13's wingmen sound a horn
// call, world 15's pearls a glass chime and its trident a metal ring, world 16's mirror a bowed-glass
// swell) and winds down when it ends, the laser hums while it burns, and the bomb inhales before it lands.
// A patch is (a, o) -> seconds (audio-kit.js).
import { tone, hiss, fm, wobble, noteHz, panOf } from './audio-kit.js';

export const ON = {
  spread(a) { // a fan opening
    hiss(a, { type: 'bandpass', f0: 400, f1: 3600, q: 1.2, attack: 0.08, dur: 0.28, peak: 0.12 });
    [0, 2, 4].forEach((d, i) => tone(a, { type: 'sawtooth', t: a.t + i * 0.03, f0: noteHz(a.kit, d, 5), dur: 0.35, peak: 0.035, cut: 2600, detune: (i - 1) * 9 }));
  },
  laser(a) { // a capacitor charging, then a zap
    tone(a, { type: 'sawtooth', f0: 180, f1: 1500, attack: 0.3, dur: 0.06, peak: 0.12, cut: 3200 });
    hiss(a, { t: a.t + 0.32, type: 'highpass', f0: 5000, f1: 2000, dur: 0.12, peak: 0.22 });
  },
  rapid(a) { // a motor revving up
    tone(a, { type: 'square', f0: 140, f1: 980, steps: 9, dur: 0.34, peak: 0.05, cut: 3000 });
    tone(a, { t: a.t + 0.34, f0: noteHz(a.kit, 7, 5), dur: 0.12, peak: 0.07 });
  },
  shield(a) { // a bubble swelling round the ship
    const o = tone(a, { f0: 280, f1: 760, attack: 0.12, dur: 0.38, peak: 0.12 });
    wobble(a, o.frequency, 13, 30, a.t, 0.5);
    fm(a, { t: a.t + 0.1, f0: 1180, ratio: 3.5, index: 0.7, dur: 0.5, peak: 0.04 });
  },
  homing(a) { // a seeker closing in: blips that climb and come faster, then the lock
    [0, 0.1, 0.17, 0.22].forEach((d, i) => tone(a, { type: 'square', t: a.t + d, f0: 600 + i * 260, dur: 0.04, peak: 0.05, cut: 3200 }));
    tone(a, { t: a.t + 0.27, f0: noteHz(a.kit, 4, 6), dur: 0.22, peak: 0.08 });
  },
  wingmen(a) { // a horn call: two short notes and a held one climbing the scale, the filter opening on each (a pair of horns, detuned)
    [0, 4, 7].forEach((d, i) => [-12, 12].forEach((detune) => tone(a, {
      type: 'sawtooth', t: a.t + i * 0.1, f0: noteHz(a.kit, d, 4), attack: 0.03, dur: i === 2 ? 0.3 : 0.08, peak: 0.03 + i * 0.006,
      detune, cut: 900, cut1: 3200,
    })));
  },
  pearls(a) { // three pearls rolling out: a glass chime of three notes climbing the scale, a glint over them
    [0, 2, 4].forEach((d, i) => fm(a, { t: a.t + i * 0.07, f0: noteHz(a.kit, d, 5), ratio: 3.51, index: 0.9, dur: 0.4, peak: 0.06, cut: 8000 }));
    hiss(a, { t: a.t + 0.14, type: 'highpass', f0: 8000, dur: 0.06, peak: 0.04 });
  },
  trident(a) { // a trident struck: a bright ring of metal, three prongs a root, a fifth and an octave
    hiss(a, { type: 'highpass', f0: 6500, f1: 3000, dur: 0.05, peak: 0.14 });
    [[0, 0.06], [3, 0.045], [5, 0.035]].forEach(([d, peak]) => fm(a, { f0: noteHz(a.kit, d, 5), ratio: 2.76, index: 1.4, dur: 0.62, peak, cut: 9000 }));
  },
  mirror(a) { // a glass twin appearing: three notes of the scale bowed in together, each a pair a few cents apart that beats, and a glint as it arrives
    [[0, 0.06], [2, 0.045], [4, 0.035]].forEach(([d, peak]) => [0, 5].forEach((detune) => tone(a, { f0: noteHz(a.kit, d, 5), detune, attack: 0.3, dur: 0.35, peak })));
    fm(a, { t: a.t + 0.3, f0: noteHz(a.kit, 7, 5), ratio: 2.32, index: 1, dur: 0.4, peak: 0.05, cut: 8000 });
    hiss(a, { t: a.t + 0.3, type: 'highpass', f0: 8000, dur: 0.05, peak: 0.04 });
  },
  slow(a) { // time thickening: everything swoops down
    tone(a, { type: 'sawtooth', f0: 760, f1: 110, dur: 0.5, peak: 0.1, cut: 2400, cut1: 300 });
    hiss(a, { type: 'lowpass', f0: 2600, f1: 200, dur: 0.5, peak: 0.1 });
  },
};

export const POWER = {
  pickup(a, o) {
    if (o.kind === 'bomb') {
      tone(a, { f0: 160, f1: 120, dur: 0.18, peak: 0.3 });
      fm(a, { t: a.t + 0.06, f0: noteHz(a.kit, 0, 5), ratio: 2.4, index: 1.2, dur: 0.4, peak: 0.07 });
      return 0.5;
    }
    if (o.kind === 'life') { // a 1-up: six notes climbing the scale, the last one held
      [0, 2, 4, 7, 9, 11].forEach((d, i) => tone(a, { type: 'triangle', t: a.t + i * 0.06, f0: noteHz(a.kit, d, 5), dur: i === 5 ? 0.3 : 0.1, peak: 0.15 }));
      hiss(a, { type: 'highpass', f0: 7500, t: a.t + 0.3, attack: 0.05, dur: 0.2, peak: 0.04 });
      return 0.7;
    }
    [0, 2, 4, 7].forEach((d, i) => tone(a, { type: 'triangle', t: a.t + i * 0.045, f0: noteHz(a.kit, d, 6), dur: 0.14, peak: 0.15 }));
    hiss(a, { type: 'highpass', f0: 7500, attack: 0.05, dur: 0.18, peak: 0.04 });
    return 0.4;
  },
  powerOn(a, o) {
    (ON[o.kind] ?? ON.spread)(a);
    return 0.6;
  },
  powerOff(a) {
    tone(a, { type: a.kit.wave, f0: 900, f1: 110, dur: 0.46, peak: 0.06, cut: 2200, cut1: 260 });
    hiss(a, { type: 'lowpass', f0: 1200, f1: 200, dur: 0.3, peak: 0.05 });
    return 0.5;
  },
  bomb(a) {
    hiss(a, { type: 'highpass', f0: 300, f1: 5000, attack: 0.18, dur: 0.03, peak: 0.16 }); // the inhale
    const t = a.t + 0.19;
    tone(a, { t, f0: 115, f1: 26, dur: 1.3, peak: 0.75 });
    hiss(a, { t, type: 'lowpass', f0: 9000, f1: 110, dur: 1.5, peak: 0.55 });
    hiss(a, { t, type: 'highpass', f0: 3200, dur: 0.09, peak: 0.4 });
    fm(a, { t: t + 0.02, f0: 1900, ratio: 1.5, index: 0.6, dur: 1.1, peak: 0.05 });
    return 2;
  },
  // The laser power's sustained voice: { pan(x), stop() }.
  beamHum(a) {
    const { ctx, kit } = a;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, a.t);
    g.gain.exponentialRampToValueAtTime(0.07, a.t + 0.06);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 4;
    f.frequency.value = Math.min(2600, kit.cut);
    f.connect(g).connect(a.out);
    const oscs = [[kit.wave === 'sine' ? 'triangle' : 'sawtooth', noteHz(kit, 0, 3)], ['sine', noteHz(kit, 0, 2)], ['sawtooth', noteHz(kit, 4, 3)]]
      .map(([type, hz], i) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = hz;
        o.detune.value = i * 7;
        o.connect(f);
        o.start(a.t);
        return o;
      });
    const lfo = wobble(a, f.frequency, 7, 500, a.t, 600);
    return {
      pan(x) { a.tail.pan?.setTargetAtTime(panOf(x), ctx.currentTime, 0.05); },
      stop() {
        const now = ctx.currentTime;
        g.gain.cancelScheduledValues(now);
        g.gain.setTargetAtTime(0.0001, now, 0.03);
        for (const o of [...oscs, lfo]) {
          try {
            o.stop(now + 0.2); // a second stop() only moves the first one
          } catch {
            // already ended
          }
        }
        setTimeout(() => a.tail.disconnect(), 3000);
      },
    };
  },
};
