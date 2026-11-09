// The ship's gun as a techno drum machine: every shot (one trigger pull, however many bullets) plays
// one drum hit at once, and successive shots step through a pattern, so held fire (a constant rate)
// is a steady beat. A patch: (a, o) -> seconds it rings (audio-kit.js).
//   nextHit(st, now, power)   the letter the next shot plays, stepping st = { step, at }; pure
//   shot(a, o)                the patch: power-ups tune it (spread lower, rapid higher and softer)
import { tone, hiss, noteHz } from './audio-kit.js';

// k kick, c kick + clap, o open hat + stab, t closed hat. A base shot is an 8th note, the clap on 2 and
// 4, and a rapid shot a 16th, so the gun's cooldowns (ship.js COOLDOWN, RAPID_COOLDOWN) set the tempo.
const PATTERN = { base: 'kocokoco', rapid: 'ktotctotktotctot' };
// s of silence after which the pattern starts over, so every burst opens on a kick; over the gap between
// base shots in slow motion (0.3x, real seconds), so a slowed beat keeps its pattern (sfx-shot.test.js
// checks it against the gun's own rate).
const RESTART = 0.7;

const state = { step: 0, at: -Infinity };

export function nextHit(st, now, power) {
  if (now - st.at > RESTART) st.step = 0;
  const pat = PATTERN[power === 'rapid' ? 'rapid' : 'base'];
  const hit = pat[st.step % pat.length];
  st.step += 1;
  st.at = now;
  return hit;
}

// Drum voices (a, t, k): k scales the pitch.
// The kick's body sits under what laptop speakers play, so a bright click carries it.
const kick = (a, t, k) => {
  tone(a, { t, f0: 190 * k, f1: 50 * k, dur: 0.16, peak: 0.4 });
  hiss(a, { t, type: 'bandpass', f0: 2600, q: 1.5, dur: 0.018, peak: 0.22 });
};
const DRUM = {
  k: kick,
  c: (a, t, k) => { // kick + a two-burst clap
    kick(a, t, k);
    hiss(a, { t, type: 'bandpass', f0: 1400 * k, q: 1.2, dur: 0.12, peak: 0.26 });
    hiss(a, { t: t + 0.011, type: 'bandpass', f0: 1400 * k, q: 1.2, dur: 0.03, peak: 0.16 });
  },
  o: (a, t) => { // open hat + a stab in the world's own voice
    hiss(a, { t, type: 'highpass', f0: 6500, dur: 0.09, peak: 0.12 });
    tone(a, { t, type: a.kit.wave, f0: noteHz(a.kit, 0, 4), dur: 0.07, peak: 0.08, cut: Math.min(a.kit.cut, 2400) });
  },
  t: (a, t) => hiss(a, { t, type: 'highpass', f0: 7000, dur: 0.03, peak: 0.1 }),
};

export function shot(a, o) {
  const p = o.power;
  if (p === 'rapid') a.out.gain.value *= 0.62;
  const k = a.kit.pitch * (p === 'spread' ? 0.84 : p === 'rapid' ? 1.19 : 1);
  DRUM[nextHit(state, a.t, p)](a, a.t, k);
  return 0.25;
}
