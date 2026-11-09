// Sound patches of the power-ups and the smart bomb: pickups chime in the look's scale, each power
// switches on with its own gesture and winds down when it ends, the laser hums while it burns, and
// the bomb inhales before it lands. A patch is (a, o) -> seconds (audio-kit.js).
import { tone, hiss, fm, wobble, noteHz, panOf } from './audio-kit.js';

const ON = {
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
};

export const POWER = {
  pickup(a, o) {
    if (o.kind === 'bomb') {
      tone(a, { f0: 160, f1: 120, dur: 0.18, peak: 0.3 });
      fm(a, { t: a.t + 0.06, f0: noteHz(a.kit, 0, 5), ratio: 2.4, index: 1.2, dur: 0.4, peak: 0.07 });
      return 0.5;
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
    const oscs = [['sawtooth', noteHz(kit, 0, 3)], ['sine', noteHz(kit, 0, 2)], ['sawtooth', noteHz(kit, 4, 3)]]
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
