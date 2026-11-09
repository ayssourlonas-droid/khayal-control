// Sound patches of Sunset Armada's two rules (world 13, the armada style of sound-data.js). The broadside
// rings a ship's bell as the side guns open, thumps a cannon out of each side with every volley (the left a
// third lower than the right, so a volley is a dyad in G major) and knocks its ports shut when the time is
// up; the wingmen's escorts add a light rattle to the ship's own shot (their horn call on catching the
// power is in sfx-power.js). Only world 13's events ask for these. A patch is (a, o) -> seconds (audio-kit.js).
import { tone, hiss, fm, noteHz } from './audio-kit.js';
import { clamp } from '../core/math.js';
import { WIDTH } from '../core/kinds.js';

// The bell is struck twice, as a ship's bell is, on the degree of the scale (G to F sharp, seven bands) that
// climbs with the x the ship is at when the guns open: a run of catches plays a little run of notes.
function bell(a, o) {
  const band = clamp(Math.floor(((o.x ?? 0) / WIDTH) * 7), 0, 6);
  const f = noteHz(a.kit, band, 5);
  [[0, 0.1], [0.17, 0.07]].forEach(([d, peak]) => {
    fm(a, { t: a.t + d, f0: f, ratio: 2.41, index: 1.5, dur: 0.9, peak, cut: 6000 });
    hiss(a, { t: a.t + d, type: 'highpass', f0: 4200, dur: 0.025, peak: 0.05 }); // the clapper
  });
  return 1.2;
}

// A side shot: a cannon's thump, low, punchy and short. The body drops from f * 1.8 to f * 0.75 under a
// blast of noise; f is the root of the scale on the left and its third on the right.
const cannon = (degree) => (a) => {
  const f = noteHz(a.kit, degree, 2);
  tone(a, { f0: f * 1.8, f1: f * 0.75, dur: 0.14, peak: 0.2 });
  hiss(a, { type: 'lowpass', f0: 1800, f1: 200, dur: 0.12, peak: 0.13 });
  return 0.2;
};

export const ARMADA = {
  broadsideOn: bell,
  broadsideOff(a) { // the ports shut: two timbers knocking
    [0, 0.09].forEach((d, i) => tone(a, { type: 'triangle', t: a.t + d, f0: 190 - i * 30, f1: 110 - i * 20, dur: 0.07, peak: 0.1 - i * 0.03 }));
    return 0.25;
  },
  cannonL: cannon(0),
  cannonR: cannon(2),
  escortShot(a) { // two small guns chattering beside the ship's own: a few thin ticks, higher than any drum hit
    [0, 0.021, 0.045].forEach((d, i) => hiss(a, { t: a.t + d, type: 'bandpass', f0: [3900, 3100, 4600][i], q: 5, dur: 0.02, peak: 0.3 - i * 0.07 }));
    return 0.1;
  },
};
