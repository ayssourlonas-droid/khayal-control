// The game's sound, from its look's music entry { mood, root, scale, bpm } (looks/persia.js).
// Pure data and maths, shared by the sound effects and the music loop.
//   kitFor(music) -> { style, root, scale, bpm, wave, cut, wet, pitch }
//     style  which signature the patches use: brass
//     root   semitone of the root above C; scale: semitone steps of the scale
//     wave   the oscillator most of the tones use; cut: their lowpass ceiling (Hz);
//     wet    how much reverb (0..1); pitch: a multiplier on the patches' base pitches
//   STYLES[style].music: the loop's voices (music.js)
//     vol: the loop's level, trimmed so the loop measures about -36 dBFS RMS offline
//     drone: { wave, oct, cut, fifth }   lead: { wave, oct, cut, len (of a step), gain }
//     div: steps per beat, seq: scale degrees per step (null rests), drum: per-step hit letters
//     (t taiko, . rest), bars: how many bars before the seq shifts
export const NOTES = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

export const SCALES = {
  homayoun: [0, 1, 4, 5, 7, 8, 10],
};

export const STYLES = {
  brass: {
    mood: 'desert brass', wave: 'sawtooth', cut: 3600, wet: 0.22, pitch: 1,
    music: { vol: 0.8, drone: { wave: 'sawtooth', oct: 2, cut: 500, fifth: true }, lead: { wave: 'sawtooth', oct: 4, cut: 2200, len: 0.7, gain: 0.06 },
      div: 2, seq: [0, null, 4, 3, 4, null, 2, 1, 0, null, 4, 6, 7, null, 4, null], drum: 't...t.t.t...t.tt' },
  },
};

const BY_MOOD = Object.fromEntries(Object.entries(STYLES).map(([style, s]) => [s.mood, style]));

export function kitFor(music = {}) {
  const style = BY_MOOD[music.mood] ?? 'brass';
  const s = STYLES[style];
  return {
    style, root: NOTES[music.root] ?? 4, scale: SCALES[music.scale] ?? SCALES.homayoun, bpm: music.bpm || 100,
    wave: s.wave, cut: s.cut, wet: s.wet, pitch: s.pitch,
  };
}

// The MIDI note of a scale degree (0 = the root) in an octave (4 = the octave from middle C).
export function degreeMidi(kit, degree, octave) {
  const n = kit.scale.length;
  const oct = Math.floor(degree / n);
  return 12 * (octave + 1 + oct) + kit.root + kit.scale[((degree % n) + n) % n];
}

export const midiHz = (m) => 440 * 2 ** ((m - 69) / 12);
