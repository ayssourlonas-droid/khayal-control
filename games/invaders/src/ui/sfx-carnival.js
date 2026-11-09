// Sound patch of Ember Carnival's rule (world 14, the carnival style of sound-data.js): a firework shell
// going off. A crack and a boom, a glassy ping on a note of the world's scale and a short crackle of sparks
// falling. The ping is higher the further right the shell bursts (seven bands, one for each note of B flat
// mixolydian) and one note higher for each link of the chain that set it off, up to an octave, so a chain
// plays a rising run and a long one holds at the top. Only world 14's burst event asks for it. A patch is
// (a, o) -> seconds (audio-kit.js).
import { tone, hiss, fm, noteHz } from './audio-kit.js';
import { clamp } from '../core/math.js';
import { WIDTH } from '../core/kinds.js';

const BANDS = 7;
export const CHAIN_STEPS = 7; // links that raise the pitch; a longer chain stays at the top

// The scale degree of a burst at world x, `depth` links down the chain (the first shell is depth 0).
export const burstDegree = (x, depth) =>
  clamp(Math.floor(((x ?? 0) / WIDTH) * BANDS), 0, BANDS - 1) + clamp(Math.floor(depth || 0), 0, CHAIN_STEPS);

const SPARKS = [[0.07, 6200], [0.11, 4800], [0.16, 7400], [0.2, 5400], [0.27, 6800]]; // [when, Hz]: the crackle

export const CARNIVAL = {
  burst(a, o) {
    hiss(a, { type: 'highpass', f0: 5200, dur: 0.035, peak: 0.1 }); // the shell's crack
    hiss(a, { type: 'lowpass', f0: 2400, f1: 180, dur: 0.16, peak: 0.08 }); // the boom behind it
    tone(a, { f0: 190, f1: 55, dur: 0.15, peak: 0.12 });
    fm(a, { f0: noteHz(a.kit, burstDegree(o.x, o.depth), 4), ratio: 3.51, index: 1.4, dur: 0.5, peak: 0.055, cut: 7000 });
    SPARKS.forEach(([d, f], i) => hiss(a, { t: a.t + d, type: 'bandpass', f0: f, q: 6, dur: 0.018, peak: 0.07 - i * 0.01 }));
    return 0.6;
  },
};
