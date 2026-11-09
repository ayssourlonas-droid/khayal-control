// Each world's sound, from its look's music entry { mood, root, scale, bpm } (looks/w1..w18.js).
// Pure data and maths, shared by the sound effects (one flavour per world) and the music loop.
//   kitFor(music) -> { style, root, scale, bpm, wave, cut, wet, pitch }
//     style  which signature the patches use: chip noir brass koto hive code iron cosmic monster gothic aurora archive armada carnival abyss glass breath anvil
//     root   semitone of the root above C; scale: semitone steps of the scale
//     wave   the oscillator most of the world's tones use; cut: their lowpass ceiling (Hz);
//     wet    how much reverb (0..1); pitch: a multiplier on the patches' base pitches
//   STYLES[style].music: the loop's voices (music.js)
//     vol: the loop's level, trimmed so every world's loop measures about -36 dBFS RMS offline
//     drone: { wave, oct, cut, fifth, gain? (0.05) }   lead: { wave, oct, cut, cut1?, hold?, attack?, glide?, bow?, len (of a step), gain, fm? }
//     (cut1: the lead's filter opens from cut to cut1 over each note, a brass swell; hold: steps a note keeps its
//     level before it dies away over len, an organ's note rather than a plucked one; attack: steps it takes to
//     swell in; glide: it slides toward the next note of the tune as it sounds, a whale's call; bow: cents a twin voice
//     sits off the note, so the pair beats, with a thin octave over both: bowed glass)
//     (fm: { ratio, index } makes the lead an FM tone that strikes at once and rings len steps: a bell on an
//     inharmonic ratio, a plucked string on a whole one)
//     div: steps per beat, seq: scale degrees per step (null rests), drum: per-step hit letters
//     (k kick, t taiko, h hat, s snare-ish noise, b a low tolling bell, p a soft timpani, c a choir chord
//     swelling in, j sleigh bells, f a soft frame drum, z a pizzicato bass on the chord's root, then its octave,
//     m a music-box bell on the step's note, v strings bowing a chord in, r a snare roll into the next step,
//     o a short string note of the chord (root, fifth, third, fifth), u a tuba note on the chord's root and a hat's
//     tick (its fifth on every second bar of six steps), y the same under a cymbal crash, a the band organ's chord
//     stabbed, g a glockenspiel on the chord's fifth (its octave on the second bar), l and d a slow heart's lub and
//     dub, w a harp pluck climbing and falling through the chord, n a low pad swelling in, q a choir bowing a chord in
//     over a low root, x a tubular bell (the chord's root high in the first bar of a pair, its fifth low in the second),
//     K a kick on the beat, C the kick under a clap, O an open hat with the bass plucking the chord's root under it,
//     H a heavy kick with the chord's root plucked under it, A an anvil struck on the backbeat, T a low thunder tom, P an open pad,
//     . rest), bars: how many bars before the seq shifts. Their patches are in music-drums.js (K C O in music-breath.js, H A T P in music-anvil.js).
export const NOTES = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

export const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  in: [0, 1, 5, 7, 8], // the Japanese in scale
  harmonic: [0, 2, 3, 5, 7, 8, 11], // harmonic minor: the minor with its leading tone
  major: [0, 2, 4, 5, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10], // the major with a flat seventh: a fairground's tunes
  pentatonic: [0, 3, 5, 7, 10], // the minor pentatonic: five notes with no semitone, so nothing played on it clashes
  melodic: [0, 2, 3, 5, 7, 9, 11], // the melodic minor going up: a minor key with the sixth and seventh raised, a dawn over ruins
  bright: [0, 2, 4, 7, 9], // the major pentatonic: five open notes with no semitone, a storm's heroic tunes
};

// A tune from its notes: [step, degree] pairs over `steps` steps, every other step a rest.
const tune = (steps, notes) => Array.from({ length: steps }, (_, i) => notes.find(([at]) => at === i)?.[1] ?? null);

export const STYLES = {
  chip: {
    mood: 'chiptune march', wave: 'square', cut: 9000, wet: 0.1, pitch: 1,
    music: { vol: 1, drone: { wave: 'triangle', oct: 2, cut: 900, fifth: false }, lead: { wave: 'square', oct: 5, cut: 4200, len: 0.45, gain: 0.07 },
      div: 2, seq: [0, 2, 4, 7, 4, 2, 0, 4, 1, 3, 5, 8, 5, 3, 1, 5], drum: 'k.h.k.h.k.h.kkh.' },
  },
  noir: {
    mood: 'noir synth pads', wave: 'sawtooth', cut: 2600, wet: 0.4, pitch: 0.9,
    music: { vol: 1, drone: { wave: 'sawtooth', oct: 2, cut: 380, fifth: true }, lead: { wave: 'sawtooth', oct: 4, cut: 1500, len: 1.6, gain: 0.06 },
      div: 1, seq: [0, null, 2, null, 4, null, 1, null], drum: 'k...s...' },
  },
  brass: {
    mood: 'desert brass', wave: 'sawtooth', cut: 3600, wet: 0.22, pitch: 1,
    music: { vol: 0.8, drone: { wave: 'sawtooth', oct: 2, cut: 500, fifth: true }, lead: { wave: 'sawtooth', oct: 4, cut: 2200, len: 0.7, gain: 0.06 },
      div: 2, seq: [0, null, 4, 3, 4, null, 2, 1, 0, null, 4, 6, 7, null, 4, null], drum: 't...t.t.t...t.tt' },
  },
  koto: {
    mood: 'koto and taiko', wave: 'triangle', cut: 5200, wet: 0.32, pitch: 1.05,
    music: { vol: 0.6, drone: { wave: 'sine', oct: 2, cut: 600, fifth: true }, lead: { wave: 'triangle', oct: 5, cut: 5000, len: 0.35, gain: 0.08 },
      div: 2, seq: [0, 2, 4, null, 3, 2, 1, null, 0, 1, 2, 4, 5, null, null, null], drum: 't.......t..t....' },
  },
  hive: {
    mood: 'dread drones', wave: 'sine', cut: 1700, wet: 0.5, pitch: 0.75,
    music: { vol: 1.3, drone: { wave: 'sawtooth', oct: 1, cut: 220, fifth: false }, lead: { wave: 'sine', oct: 5, cut: 2000, len: 2.2, gain: 0.05 },
      div: 1, seq: [0, null, null, 1, null, null, null, 4, null, null, 3, null, null, null, null, null], drum: 'k...............' },
  },
  code: {
    mood: 'minimal techno', wave: 'square', cut: 6500, wet: 0.16, pitch: 1.1,
    music: { vol: 0.7, drone: { wave: 'square', oct: 2, cut: 300, fifth: false }, lead: { wave: 'square', oct: 5, cut: 2400, len: 0.3, gain: 0.05 },
      div: 4, seq: [0, null, 0, 7, null, 3, null, 0, 5, null, 0, 7, null, 3, 2, null], drum: 'k.h.k.h.k.h.k.hh' },
  },
  iron: {
    mood: 'industrial pulse', wave: 'sawtooth', cut: 3000, wet: 0.24, pitch: 0.85,
    music: { vol: 0.6, drone: { wave: 'square', oct: 1, cut: 260, fifth: true }, lead: { wave: 'square', oct: 3, cut: 900, len: 0.4, gain: 0.07 },
      div: 4, seq: [0, 0, null, 0, 4, null, 0, null, 0, 0, null, 0, 3, null, 1, null], drum: 'k..sk.s.k..sk.ss' },
  },
  cosmic: {
    mood: 'organ swell', wave: 'sine', cut: 4200, wet: 0.6, pitch: 0.95,
    music: { vol: 0.6, drone: { wave: 'sine', oct: 2, cut: 1200, fifth: true }, lead: { wave: 'sine', oct: 5, cut: 3000, len: 3.2, gain: 0.07 },
      div: 0.5, seq: [0, 2, 4, 6, 4, 2, 7, 4], drum: '........' },
  },
  monster: {
    mood: 'monster', wave: 'sawtooth', cut: 2000, wet: 0.3, pitch: 0.8,
    music: { vol: 0.8, drone: { wave: 'sawtooth', oct: 1, cut: 240, fifth: true }, lead: { wave: 'sawtooth', oct: 3, cut: 1300, len: 0.8, gain: 0.07 },
      div: 2, seq: [0, null, null, 0, null, null, 1, null, 0, null, null, 0, null, 3, 4, null], drum: 't...t.t.t...t.tt' },
  },
  gothic: { // an organ held under a harpsichord's plucked arpeggios, a bell tolling on every bar, timpani underneath
    mood: 'gothic', wave: 'triangle', cut: 3400, wet: 0.55, pitch: 0.9,
    music: { vol: 0.62, drone: { wave: 'square', oct: 2, cut: 760, fifth: true }, lead: { wave: 'sawtooth', oct: 4, cut: 2800, len: 0.55, gain: 0.05 },
      div: 2, seq: [0, 2, 4, 7, 4, 2, 4, 2, 0, 2, 4, 6, 7, 6, 4, null], drum: 'b...p...b...p.p.' },
  },
  aurora: { // celesta bells over a choir swelling in on every bar, a soft low drum and sleigh bells shimmering
    mood: 'aurora', wave: 'triangle', cut: 6200, wet: 0.62, pitch: 1.05,
    music: { vol: 0.92, drone: { wave: 'triangle', oct: 2, cut: 900, fifth: true },
      lead: { wave: 'sine', oct: 5, cut: 6500, len: 4, gain: 0.07, fm: { ratio: 3.51, index: 1.1 } },
      div: 2, seq: [4, null, 6, null, 7, 6, 4, null, 3, null, 4, null, 2, 3, 0, null], drum: 'pc..j...pc...j..' },
  },
  archive: { // harp arpeggios and music-box bells over strings bowing in on each bar, a plucked bass and a soft frame drum
    mood: 'archive', wave: 'triangle', cut: 5200, wet: 0.5, pitch: 1.02,
    music: { vol: 0.93, drone: { wave: 'sawtooth', oct: 2, cut: 560, fifth: true, gain: 0.03 },
      lead: { wave: 'sine', oct: 4, cut: 7000, len: 3, gain: 0.09, fm: { ratio: 3, index: 3.2 } },
      div: 2, seq: [0, 2, 4, 7, 9, 7, 4, 2, 3, 5, 7, 10, 7, 5, 3, null], drum: 'fvzmz.f.fvz.zmf.' },
  },
  armada: { // a brass fanfare over a snare march that rolls into every bar, strings chopping off the beat and timpani on the downbeats
    mood: 'armada', wave: 'sawtooth', cut: 4200, wet: 0.36, pitch: 1.04,
    music: { vol: 1.5, drone: { wave: 'sawtooth', oct: 2, cut: 520, fifth: true, gain: 0.03 },
      lead: { wave: 'sawtooth', oct: 4, cut: 1000, cut1: 3600, len: 1.3, gain: 0.06 },
      div: 2, seq: [0, null, 0, 2, 4, null, 2, 4, 7, null, 4, null, 2, 4, 5, null], drum: 'posososrposososr' },
  },
  // A calliope waltz (two bars of three beats, a step an eighth note): an organ's held notes over a tuba on the
  // downbeat, the band organ's chords and a snare on beats two and three, a glockenspiel, a cymbal crash on the
  // first downbeat of the pair and a snare roll out of the second bar.
  carnival: {
    mood: 'carnival', wave: 'square', cut: 4600, wet: 0.3, pitch: 1.06,
    music: { vol: 1.07, drone: { wave: 'square', oct: 2, cut: 480, fifth: true, gain: 0.012 },
      lead: { wave: 'square', oct: 4, cut: 3400, hold: 0.55, len: 0.4, gain: 0.05 },
      div: 2, seq: [7, null, 4, 5, 4, 2, 4, null, 5, 6, 4, null], drum: 'ygasasugasar' },
  },
  // Two bars of four slow beats (a step a sixteenth, 54 bpm): a whale's call, four long sine notes that swell in and
  // slide toward the next, over low pads swelling in, a harp plucking the chord, and a giant's heart beating (a lub and
  // a dub) on the first and third beats. The echo is the deep.
  abyss: {
    mood: 'abyss', wave: 'triangle', cut: 4800, wet: 0.58, pitch: 0.96,
    music: { vol: 0.935, drone: { wave: 'sine', oct: 2, cut: 600, fifth: true, gain: 0.012 },
      lead: { wave: 'sine', oct: 4, attack: 4, glide: true, len: 9, gain: 0.15 },
      div: 4, seq: [0, null, null, null, null, null, null, null, null, null, 2, null, null, null, null, null,
        3, null, null, null, null, null, null, null, null, null, 1, null, null, null, null, null],
      drum: 'ldn.w.w.ldw.w.w.ldn.w...ldw.w.w.' },
  },
  // 6/8, four bars to a pass (a step an eighth note, 63 dotted-quarter beats a minute): a glass harmonica bowing a hymn-like
  // line (fifth, third, root, second, third, fifth, octave held), each note swelling in, held and dying away, over a choir
  // bowing in on every second bar, tubular bells ringing a high root and a low fifth, and a soft frame drum on the second bar.
  glass: {
    mood: 'glass', wave: 'sine', cut: 6000, wet: 0.64, pitch: 1.07,
    music: { vol: 0.67, drone: { wave: 'sine', oct: 2, cut: 700, fifth: true, gain: 0.012 },
      lead: { wave: 'sine', oct: 4, cut: 4200, attack: 2, hold: 2.5, len: 3, gain: 0.06, bow: 3 },
      div: 3, seq: [4, null, null, 2, null, null, 0, null, null, 1, null, null, 2, null, null, 4, null, null, 7, null, null, null, null, null],
      drum: 'q..x..f..f.xq..x..f..f.x' },
  },
  // 4/4 at 122 bpm, four bars of sixteenth-note steps to a pass: a clear morning you can dance to. A soft electric piano
  // (an FM tone on a whole ratio, struck and ringing out) sings a tune that rises to the octave and settles home, over
  // four on the floor: a kick on every beat, a clap on two and four, an open hat with the bass plucking the root on every
  // off-beat and a closed hat's tick after each, and a choir bowing in every second bar. The chords go home for four
  // passes, then C minor, then A flat, and back.
  breath: {
    mood: 'breath', wave: 'triangle', cut: 5200, wet: 0.4, pitch: 1.06,
    music: { vol: 0.761, drone: { wave: 'triangle', oct: 2, cut: 500, fifth: true, gain: 0.012 },
      lead: { wave: 'sine', oct: 4, cut: 3200, len: 8, gain: 0.1, fm: { ratio: 1, index: 1.2 } },
      div: 4, seq: [0, null, null, null, 2, null, 4, null, 7, null, null, null, 6, null, 4, null,
        4, null, 5, null, 4, null, null, null, 2, null, null, null, 1, null, null, null,
        2, null, null, null, 4, null, 5, null, 7, null, null, null, 6, null, 7, null,
        4, null, null, null, 1, null, 2, null, 0, null, null, null, null, null, null, null],
      drum: 'KqOhC.OhK.OhC.OhK.OhC.OhK.OhC.OhKqOhC.OhK.OhC.OhK.OhC.OhK.OhC.Oh' },
  },
  // 4/4 at 108 bpm, four bars of sixteenth-note steps to a pass: a dogfight in a thunderstorm at dusk. Struck iron (an FM tone on an
  // iron bar's ratio, striking at once and ringing out, through a dotted-eighth echo) sings a heroic tune that climbs to the octave
  // and settles home, with rests; under it a heavy half-time beat kept off the echo: a kick with the bass on the downbeat and the
  // "and of 3", an anvil struck on two and four, a low thunder tom in the fills, and an open pad swelling in every second bar. The
  // chords go home for two passes, then up an octave, then to the fifth, and back.
  anvil: {
    mood: 'anvil', wave: 'triangle', cut: 5000, wet: 0.34, pitch: 0.97,
    music: { vol: 0.856, drone: { wave: 'triangle', oct: 2, cut: 480, fifth: true, gain: 0.012 },
      lead: { wave: 'sine', oct: 3, cut: 4200, len: 6, gain: 0.14, fm: { ratio: 2.76, index: 1.1 } },
      div: 4, seq: tune(64, [[0, 0], [3, 2], [6, 3], [10, 4], [12, 3], [16, 5], [22, 4], [24, 3], [28, 2], [32, 2], [35, 3], [38, 4], [40, 5], [44, 7],
        [48, 6], [52, 5], [56, 3], [58, 2], [60, 0]]),
      drum: 'HP..A.....H.A...' + 'H...A.H...H.A..T' + 'HP..A.H...H.A...' + 'H...A.....TTA.TT' },
  },
};

const BY_MOOD = Object.fromEntries(Object.entries(STYLES).map(([style, s]) => [s.mood, style]));

export function kitFor(music = {}) {
  const style = BY_MOOD[music.mood] ?? 'chip';
  const s = STYLES[style];
  return {
    style, root: NOTES[music.root] ?? 4, scale: SCALES[music.scale] ?? SCALES.minor, bpm: music.bpm || 100,
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
