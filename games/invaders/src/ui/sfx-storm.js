// Sound patches of Anvil Sky's rules (world 18, the anvil style of sound-data.js, G sharp in a major pentatonic). World 18
// borrows world 13's broadside, so its events sound through world 13's patches in every other world and as electric arc
// guns here (a.kit.style 'anvil'; the old patch is called for any other style, so Sunset Armada sounds as it always did).
//   cannonL, cannonR  a side shot: an arc zap, a quick tone falling from a bright pitch with a sizzle of FM on it and three
//                     tiny crackles; the left on the root, the right a major third above (G sharp, C) so a volley is a dyad
//   broadsideOn       the guns opening: a charge rising through the climbing notes of the scale (with the x the ship is at),
//                     an iron anvil struck at the top of it and a low roll of thunder under its ring
//   broadsideOff      the arcs dying away: a fizzle sliding down and a soft iron tick
//   backfire          a dragged enemy bullet strikes the first alien it crosses, or a boss part (every world's kit, only world 18 emits it): a
//                     crack and a snap, then two struck-iron notes, the second three degrees up (a fifth, or a minor sixth
//                     from C), a counter-hit rung like a bell
//   squallRoar        the Squall Ray's roar: a thunderclap, a sharp crack and then a long rolling rumble on the root and fifth,
//                     peal after peal fading away                     (sfx-boss.js)
// A patch is (a, o) -> seconds (audio-kit.js). Every one of STORM is short and quiet beside the ship's shot (peaks 0.12 and under, 5 dB or
// more beneath it); the roar is a boss's, as loud as the other roars (peaks to 0.28, the crack's snap).
import { tone, hiss, fm, wobble, crush, noteHz } from './audio-kit.js';
import { ARMADA } from './sfx-armada.js';
import { clamp } from '../core/math.js';
import { WIDTH } from '../core/kinds.js';

export const BANDS = 5; // the five degrees of the scale, left to right
export const bandOf = (x) => clamp(Math.floor(((x ?? 0) / WIDTH) * BANDS), 0, BANDS - 1);

const reskin = (old, mine) => (a, o) => (a.kit.style === 'anvil' ? mine(a, o) : old(a, o));
const crackle = (a, t, f0, peak) => hiss(a, { t, type: 'bandpass', f0, q: 4, dur: 0.012, peak });

const zap = (degree) => (a) => {
  const f = noteHz(a.kit, degree, 4);
  tone(a, { f0: f * 3, f1: f * 0.8, dur: 0.09, peak: 0.11 });
  fm(a, { f0: f * 2, f1: f * 0.6, ratio: 3.3, index: 3, dur: 0.07, peak: 0.055, cut: 6000 });
  [0, 0.018, 0.04].forEach((d, i) => crackle(a, a.t + d, [3400, 4600, 2900][i], 0.08 - i * 0.02));
  return 0.16;
};

function arcOn(a, o) {
  const f = noteHz(a.kit, bandOf(o.x), 4);
  const top = a.t + 0.26; // the charge is full: the anvil strikes
  tone(a, { type: 'triangle', f0: f, f1: f * 4, attack: 0.22, dur: 0.06, peak: 0.09, cut: 5000 });
  fm(a, { f0: f * 2, f1: f * 6, ratio: 3.3, index: 2, attack: 0.22, dur: 0.06, peak: 0.03, cut: 6000 });
  [0.05, 0.12, 0.17, 0.2, 0.23].forEach((d) => crackle(a, a.t + d, 4000, 0.04));
  fm(a, { t: top, f0: noteHz(a.kit, bandOf(o.x), 5), ratio: 2.76, index: 1.5, dur: 1.1, peak: 0.1, cut: 7000 });
  tone(a, { t: top, f0: f * 0.5, dur: 0.9, peak: 0.05 });
  hiss(a, { t: top, type: 'highpass', f0: 5200, dur: 0.02, peak: 0.05 });
  const roll = a.ctx.createGain(); // the thunder: two low tones whose level rolls up and down
  roll.gain.value = 0.55;
  roll.connect(a.out);
  wobble(a, roll.gain, 8, 0.45, top, 1.1);
  const root = noteHz(a.kit, 0, 1);
  tone(a, { t: top, f0: root * 1.5, f1: root, attack: 0.05, dur: 1, peak: 0.12, dest: roll });
  tone(a, { t: top, type: 'triangle', f0: root * 3, f1: root * 2, attack: 0.05, dur: 0.9, peak: 0.05, cut: 300, dest: roll });
  return 1.5;
}

function arcOff(a) {
  const f = noteHz(a.kit, 3, 5);
  tone(a, { f0: f, f1: f * 0.25, dur: 0.28, peak: 0.07 });
  fm(a, { f0: f * 0.8, f1: f * 0.2, ratio: 3.3, index: 3, dur: 0.25, peak: 0.03, cut: 5000 });
  [0.03, 0.09, 0.17].forEach((d, i) => crackle(a, a.t + d, 3800 - i * 600, 0.05 - i * 0.014));
  fm(a, { t: a.t + 0.2, f0: noteHz(a.kit, 0, 4), ratio: 2.76, index: 0.8, dur: 0.22, peak: 0.05 });
  return 0.5;
}

function backfire(a, o) {
  const band = bandOf(o.x);
  hiss(a, { type: 'highpass', f0: 5200, f1: 2400, dur: 0.035, peak: 0.12 });
  tone(a, { type: 'triangle', f0: 2100, f1: 320, dur: 0.05, peak: 0.1 });
  fm(a, { t: a.t + 0.025, f0: noteHz(a.kit, band, 5), ratio: 2.76, index: 1.2, dur: 0.45, peak: 0.07, cut: 8000 });
  fm(a, { t: a.t + 0.1, f0: noteHz(a.kit, band + 3, 5), ratio: 2.76, index: 1.2, dur: 0.6, peak: 0.08, cut: 8000 });
  return 0.8;
}

// The Squall Ray's roar: the crack first, a burst of noise and a tick falling from a high pitch, crushed into one sharp snap (nothing
// else in any world's roar is a highpass burst from 5200 Hz); then the thunder rolls on under the rest of the roar. Low tones on the
// root and the fifth (G sharp 1, D sharp 2: nothing under the root's 52 Hz, over world 9's roar floor), noise falling away beneath
// them, their level swelling and sinking through one LFO as the peals pass, each peal further off, lower and softer than the last.
// h is the phase (0..2): a harder crack and one more peal each time.
export function squallRoar(a, h, dur) {
  const dest = crush(a, 2 + h);
  hiss(a, { type: 'highpass', f0: 5200, f1: 1800, dur: 0.05, peak: 0.2 });
  hiss(a, { type: 'bandpass', f0: 2600, f1: 700, q: 1.4, dur: 0.16, peak: 0.22 + h * 0.03, dest });
  tone(a, { type: 'triangle', f0: 2100, f1: 150, dur: 0.1, peak: 0.1, dest });
  const t = a.t + 0.06; // the rumble follows hard on the crack
  const roll = a.ctx.createGain();
  roll.gain.value = 0.6;
  roll.connect(dest);
  wobble(a, roll.gain, 5 + h * 1.5, 0.4, t, dur);
  const root = noteHz(a.kit, 0, 1);
  tone(a, { t, type: 'sawtooth', f0: root * 1.5, f1: root, attack: 0.1, dur, peak: 0.1, cut: 300, cut1: 100, q: 2, dest: roll });
  const fifth = noteHz(a.kit, 3, 1);
  tone(a, { t, type: 'triangle', f0: fifth, f1: fifth * 0.8, attack: 0.15, dur: dur * 0.9, peak: 0.1, dest: roll });
  hiss(a, { t, type: 'lowpass', f0: 520, f1: 70, attack: 0.08, dur, peak: 0.22, dest: roll });
  [0.28, 0.5, 0.7].slice(0, 1 + h).forEach((d, i) => {
    const at = a.t + dur * d;
    hiss(a, { t: at, type: 'lowpass', f0: 460 - i * 90, f1: 70, attack: 0.05, dur: dur * 0.4, peak: 0.16 - i * 0.03, dest: roll });
    tone(a, { t: at, type: 'triangle', f0: root * (1.5 - i * 0.15), f1: root, attack: 0.05, dur: dur * 0.4, peak: 0.1 - i * 0.02, dest: roll });
  });
}

export const STORM = {
  cannonL: reskin(ARMADA.cannonL, zap(0)),
  cannonR: reskin(ARMADA.cannonR, zap(2)),
  broadsideOn: reskin(ARMADA.broadsideOn, arcOn),
  broadsideOff: reskin(ARMADA.broadsideOff, arcOff),
  backfire,
};
