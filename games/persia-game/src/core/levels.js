// Level data, plain and serialisable:
//   { id, name, place, seed, d, boss, landmark, first, persian, weather?,
//     waves: [{ formation, cols, species: [id per row, top row first], pattern, speed }] }
// The waves fly in order, then the boss. `seed` is the fixed seed of the level's world rng, `d` its
// difficulty (difficulty.js), `name` what the screens call it, `place` where it is (the title's card
// names it), `landmark` its backdrop (looks/).
// A world counts its waves across its levels: `first` is the number of the level's first wave, set
// below from the levels played before it.
// `persian` names the parts the level shows in Persian digits ('wave': the wave count, 'score': the
// score, 'combo': the combo, 'level': its own number wherever play names it, 'boss': its giant's name
// as the species' word, 'waveWord': the wave line's label, the pack's word in place of 'WAVE', the
// line then read right to left, 'scoreWord': the score's label, the pack's word in place of 'SCORE',
// 'bombsWord': the bombs panel's label, the pack's word in place of 'BOMBS', 'livesWord': the lives
// panel's, in place of 'LIVES', 'comboWord': the combo meter's, in place of 'COMBO').
// `weather`, when a level has it, is { kind, from }: `kind` names the weather ('rain', 'stars',
// 'petals', 'moon', 'dawn', 'sunrise', 'rainbow'; ui/weather.js draws each kind and the pack words it) and
// `from` is the number within the level of the wave it begins with; it lasts to the end, the
// giant's fight included.
// LEVEL is level 1; LEVELS every level in the order they are played.
//
//   w(formation, cols, rows, pattern, speed)  one wave. `rows` is one species letter per row, top
//        row first, from LETTER below (d dog, c cat, ...). Every alien of a row is
//        that row's animal and fights as its role (SPECIES, in makeSlots), so a rabbit row holds
//        `cols` carriers; rabbit rows therefore live in narrow waves (3 cols), which keeps the
//        power-ups worth having.
//        `speed` multiplies the formation's pace and stacks with scaled(d).formationSpeed.
import { bossDef } from './bosses-data.js';

const LETTER = { d: 'dog', c: 'cat', b: 'bird', f: 'fish', h: 'horse', o: 'cow', r: 'rabbit', m: 'mouse', l: 'lion', a: 'camel', x: 'fox' };

const w = (formation, cols, rows, pattern, speed) =>
  ({ formation, cols, species: [...rows].map((c) => LETTER[c]), pattern, speed });

export const LEVEL = {
  id: 'level-1', name: 'Level 1', place: 'Persepolis', seed: 10417, d: 0.1, boss: 'giant', landmark: 'persepolis', persian: [],
  waves: [
    w('grid', 10, 'ddd', 'aimed', 0.9), // 1: a pack of dogs marches in
    w('escort', 3, 'oro', 'aimed', 0.95), // 2: cows guard the rabbits: the first power-ups
    w('dive', 8, 'bcc', 'fan', 1.0), // 3: birds and cats swoop
    w('sway', 8, 'hhf', 'fan', 1.05), // 4: horses and fish, all gunners
    w('spiral', 10, 'ccdd', 'ring', 1.15), // 5: forty cats and dogs
  ],
};

const LEVEL_2 = {
  id: 'level-2', name: 'Level 2', place: 'Si-o-se-pol', seed: 20833, d: 0.2, boss: 'giant-mouse', landmark: 'siosepol',
  persian: ['wave'],
  waves: [
    w('grid', 10, 'dmm', 'aimed', 1.0), // 6: mice behind a row of dogs
    w('escort', 3, 'oro', 'aimed', 1.0), // 7: cows guard the rabbits: the power-ups
    w('dive', 8, 'bmm', 'fan', 1.05), // 8: birds and mice swoop
    w('sway', 8, 'hhff', 'fan', 1.1), // 9: the gunners
    w('spiral', 10, 'ccmm', 'ring', 1.2), // 10: forty cats and mice
  ],
};

const LEVEL_3 = {
  id: 'level-3', name: 'Level 3', place: 'Tomb of Hafez', seed: 31249, d: 0.3, boss: 'giant-fish', landmark: 'hafez',
  persian: ['wave', 'score'],
  waves: [
    w('dive', 10, 'bff', 'fan', 1.05), // 11: birds and fish swoop
    w('escort', 3, 'orro', 'aimed', 1.05), // 12: cows guard two rows of rabbits: twice the power-ups
    w('grid', 10, 'ddmm', 'aimed', 1.1), // 13: dogs over mice
    w('sway', 8, 'hhff', 'fan', 1.15), // 14: the gunners
    w('spiral', 10, 'ffcc', 'ring', 1.25), // 15: forty fish and cats
  ],
};

const LEVEL_4 = {
  id: 'level-4', name: 'Level 4', place: 'Azadi Tower', seed: 41659, d: 0.35, boss: 'giant-bird', landmark: 'azadi',
  persian: ['wave', 'score', 'combo', 'level'], weather: { kind: 'rain', from: 3 },
  waves: [
    w('sway', 8, 'bbh', 'fan', 1.1), // 16: birds over a row of horses
    w('escort', 3, 'orro', 'aimed', 1.1), // 17: cows guard two rows of rabbits
    w('dive', 10, 'bbcc', 'fan', 1.15), // 18: birds and cats swoop, and the rain begins
    w('grid', 10, 'ddmm', 'aimed', 1.2), // 19: dogs over mice
    w('spiral', 10, 'bbff', 'ring', 1.3), // 20: forty birds and fish
  ],
};

const LEVEL_5 = {
  id: 'level-5', name: 'Level 5', place: 'Tomb of Cyrus', seed: 52391, d: 0.4, boss: 'giant-cow', landmark: 'pasargadae',
  persian: ['wave', 'score', 'combo', 'level', 'boss'], weather: { kind: 'stars', from: 3 },
  waves: [
    w('grid', 10, 'odd', 'aimed', 1.15), // 21: a row of cows over the dogs
    w('escort', 3, 'orro', 'aimed', 1.15), // 22: cows guard two rows of rabbits
    w('dive', 10, 'obbb', 'fan', 1.2), // 23: a row of cows and the birds swoop, and the stars begin
    w('sway', 8, 'hhff', 'fan', 1.25), // 24: the gunners
    w('spiral', 10, 'ccmm', 'ring', 1.35), // 25: forty cats and mice
  ],
};

const LEVEL_6 = {
  id: 'level-6', name: 'Level 6', place: 'Yazd', seed: 61847, d: 0.45, boss: 'giant-dog', landmark: 'yazd',
  persian: ['wave', 'score', 'combo', 'level', 'boss', 'waveWord'], weather: { kind: 'petals', from: 3 },
  waves: [
    w('grid', 10, 'ddcc', 'aimed', 1.2), // 26: dogs over cats
    w('escort', 3, 'orro', 'aimed', 1.2), // 27: cows guard two rows of rabbits
    w('dive', 10, 'ddbb', 'fan', 1.25), // 28: dogs and birds swoop, and the petals begin
    w('sway', 8, 'hhff', 'fan', 1.3), // 29: the gunners
    w('spiral', 10, 'ddmm', 'ring', 1.4), // 30: forty dogs and mice
  ],
};

const LEVEL_7 = {
  id: 'level-7', name: 'Level 7', place: 'Milad Tower', seed: 72269, d: 0.45, boss: 'giant-horse', landmark: 'milad',
  persian: ['wave', 'score', 'combo', 'level', 'boss', 'waveWord', 'scoreWord'], weather: { kind: 'moon', from: 3 },
  waves: [
    w('grid', 6, 'hhdd', 'aimed', 1.2), // 31: horses over dogs
    w('escort', 3, 'orro', 'aimed', 1.2), // 32: cows guard two rows of rabbits
    w('dive', 10, 'bbmm', 'fan', 1.25), // 33: birds and mice swoop, and the moon turns white
    w('sway', 6, 'hhf', 'fan', 1.3), // 34: two rows of horses over the fish: the gunners
    w('spiral', 10, 'ccdd', 'ring', 1.4), // 35: forty cats and dogs
  ],
};

const LEVEL_8 = {
  id: 'level-8', name: 'Level 8', place: 'Naqsh-e Jahan', seed: 83311, d: 0.45, boss: 'giant-lion', landmark: 'naqsh',
  persian: ['wave', 'score', 'combo', 'level', 'boss', 'waveWord', 'scoreWord', 'bombsWord'], weather: { kind: 'dawn', from: 3 },
  waves: [
    w('grid', 6, 'llcc', 'aimed', 1.2), // 36: lions over cats
    w('escort', 3, 'orro', 'aimed', 1.2), // 37: cows guard two rows of rabbits
    w('dive', 10, 'bbmm', 'fan', 1.25), // 38: birds and mice swoop, and dawn begins
    w('sway', 6, 'hhf', 'fan', 1.3), // 39: two rows of horses over the fish: the gunners
    w('spiral', 10, 'lldd', 'ring', 1.4), // 40: forty lions and dogs
  ],
};

const LEVEL_9 = {
  id: 'level-9', name: 'Level 9', place: 'Gonbad-e Qabus', seed: 94127, d: 0.45, boss: 'giant-camel', landmark: 'qabus',
  persian: ['wave', 'score', 'combo', 'level', 'boss', 'waveWord', 'scoreWord', 'bombsWord', 'livesWord'], weather: { kind: 'sunrise', from: 3 },
  waves: [
    w('grid', 6, 'aacc', 'aimed', 1.2), // 41: camels over cats
    w('escort', 3, 'orro', 'aimed', 1.2), // 42: cows guard two rows of rabbits
    w('dive', 10, 'bbmm', 'fan', 1.25), // 43: birds and mice swoop, and the sun begins to rise
    w('sway', 6, 'llf', 'fan', 1.3), // 44: two rows of lions over the fish: the gunners
    w('spiral', 10, 'ccdd', 'ring', 1.4), // 45: forty cats and dogs
  ],
};

const LEVEL_10 = {
  id: 'level-10', name: 'Level 10', place: 'Tomb of Ferdowsi', seed: 104173, d: 0.45, boss: 'giant-fox', landmark: 'ferdowsi',
  persian: ['wave', 'score', 'combo', 'level', 'boss', 'waveWord', 'scoreWord', 'bombsWord', 'livesWord', 'comboWord'],
  weather: { kind: 'rainbow', from: 3 },
  waves: [
    w('grid', 6, 'xxaa', 'aimed', 1.2), // 46: foxes over camels
    w('escort', 3, 'orro', 'aimed', 1.2), // 47: cows guard two rows of rabbits
    w('dive', 10, 'bbmm', 'fan', 1.25), // 48: birds and mice swoop, and the rainbow comes
    w('sway', 6, 'llh', 'fan', 1.3), // 49: two rows of lions over the horses: the gunners
    w('spiral', 10, 'ccdd', 'ring', 1.4), // 50: forty cats and dogs
  ],
};

export const LEVELS = [LEVEL, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10];
let count = 0;
for (const level of LEVELS) {
  level.first = count + 1;
  count += level.waves.length;
}

// The level played after `level`, or null after the last one (or for a level not in LEVELS).
export function nextLevel(level) {
  const i = LEVELS.indexOf(level);
  return i < 0 ? null : LEVELS[i + 1] ?? null;
}

// The kind of weather on the world, or null: its level has weather, and the weather's wave or the
// giant has come.
export function weatherOf(world) {
  const { weather } = world.level;
  return weather && (world.boss !== null || world.wave >= weather.from) ? weather.kind : null;
}

// The world's number of a level's wave (1 is its first).
export const waveNumber = (level, wave) => level.first + wave - 1;

// The animals a level brings, in the order they first appear: its waves' species, then its boss's.
export function levelSpecies(level) {
  const ids = (level.waves ?? []).flatMap((x) => x.species);
  return [...new Set([...ids, bossDef(level.boss).species])];
}
