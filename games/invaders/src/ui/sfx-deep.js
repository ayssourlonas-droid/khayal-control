// Sound patches of Lantern Deep's rules (world 15, the abyss style of sound-data.js). A pearl wiping a bullet
// ticks like glass and a pearl striking an alien plucks a string, both on a note of the world's scale that
// climbs from the left of the screen to the right (seven bands), so a ring of pearls at work plays a run of
// notes that cannot clash; the trident's shot adds a watery zip to the ship's own shot; and the maelstrom
// drinks a bullet with a glassy bloop (bloop, played by sfx-world.js's absorb). Only world 15's events ask
// for these. A patch is (a, o) -> seconds (audio-kit.js).
import { tone, hiss, fm, wobble, noteHz } from './audio-kit.js';
import { clamp } from '../core/math.js';
import { WIDTH, WELL } from '../core/kinds.js';

const BANDS = 7;

// The scale degree (0..6) of a sound at world x; left of the screen is the lowest.
export const deepBand = (x) => clamp(Math.floor(((x ?? 0) / WIDTH) * BANDS), 0, BANDS - 1);

// The well swallows what comes within 40 px of its centre, so a bullet is drunk somewhere between 56 px left and
// 56 px right of it (a step of its flight included): the bands are 16 px wide, and a bullet falling in from the
// left sounds lower than one from the right.
export const WELL_SPAN = 56;
export const wellBand = (x) => clamp(Math.floor(((x ?? WELL.x) - WELL.x + WELL_SPAN) / ((2 * WELL_SPAN) / BANDS)), 0, BANDS - 1);

// The maelstrom swallows a bullet: a bubble rising into a note of the scale, a glassy ring after it and a pop.
export function bloop(a, o) {
  const f = noteHz(a.kit, wellBand(o.x), 4);
  tone(a, { f0: f * 0.6, f1: f, dur: 0.12, peak: 0.09 });
  fm(a, { t: a.t + 0.06, f0: f * 2, ratio: 3.51, index: 0.8, dur: 0.4, peak: 0.04, cut: 6000 });
  hiss(a, { t: a.t + 0.12, type: 'highpass', f0: 5200, dur: 0.02, peak: 0.05 });
  return 0.55;
}

export const DEEP = {
  pearlBlock(a, o) { // a pearl wipes a bullet: a soft tick of glass (a short, inharmonic ring) with a hair of noise
    fm(a, { f0: noteHz(a.kit, deepBand(o.x), 5), ratio: 3.51, index: 0.7, dur: 0.16, peak: 0.08, cut: 7000 });
    hiss(a, { type: 'highpass', f0: 7500, dur: 0.012, peak: 0.05 });
    return 0.22;
  },
  pearlHit(a, o) { // a pearl strikes an alien: a light pluck, an octave under the tick (a whole-number partner: a string)
    fm(a, { f0: noteHz(a.kit, deepBand(o.x), 4), ratio: 3, index: 2, dur: 0.24, peak: 0.1, cut: 5000 });
    hiss(a, { type: 'bandpass', f0: 2600, q: 2, dur: 0.02, peak: 0.06 });
    return 0.3;
  },
  tridentZip(a) { // the trident's shot: a sweep of water, and a chirp an octave up with bubbles in it
    hiss(a, { type: 'bandpass', f0: 500, f1: 3400, q: 3, dur: 0.12, peak: 0.13 });
    const f = noteHz(a.kit, 0, 5);
    wobble(a, tone(a, { f0: f, f1: f * 2, dur: 0.12, peak: 0.07 }).frequency, 34, 70, a.t, 0.12);
    return 0.2;
  },
};
