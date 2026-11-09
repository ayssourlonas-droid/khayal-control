import { SPECIES } from './kinds.js';

// The shorthands the boss definitions are written in. A definition is plain data:
//   { kind, name, species, y, size: { w, h }, parts, phases, maxHp, bottom }
//   species the animal it is a giant of (SPECIES), named when it arrives
//   part  = { id, dx, dy, w, h, hp, weak }  (dx, dy: centre offset from the boss's centre)
//     weak  takes full damage; a part that is not weak is armor and takes 25 %
//   phase = { until, move, attacks, rate?, minions? }
//     until   the hp fraction at which this phase ends (the last is 0)
//     move    a boss move (boss-move.js MOVES); rate scales the pace (default 1)
//     attacks [{ pattern, every, from, p }]: every `every` s (shorter on harder levels) the part
//             `from` warns, then fires `pattern` with p = { count?, spread?, speed? } (speed is a
//             multiplier on the level's bullet speed)
//     minions [{ species, role, count, every, from }]: aliens launched from a part, flying at the
//             ship, each fighting as its species' role
//   y is the boss's resting centre; bottom the lowest edge of any part below that centre.

const part = (weak) => (id, dx, dy, w, h, hp) => ({ id, dx, dy, w, h, hp, weak });

export const weak = part(true);
export const armor = part(false);

export const atk = (pattern, every, from, p = {}) => ({ pattern, every, from, p });
export const minion = (species, count, every, from) => ({ species, role: SPECIES[species], count, every, from });
export const phase = (until, move, attacks, extra = {}) => ({ until, move, attacks, ...extra });

// The three-phase fight the face-on giants share (fish to fox): `mouth` is the part that fires and
// sends out `species`; a rabbit leaves `rabbitFrom` in every phase.
export const faceFight = (species, mouth, rabbitFrom) => [
  phase(0.65, 'sway', [
    atk('aimed', 2, mouth, { speed: 0.9 }),
    atk('fan', 4.4, 'eyeL', { count: 3, spread: 0.5 }),
    atk('fan', 4.4, 'eyeR', { count: 3, spread: 0.5 }),
  ], { minions: [minion(species, 1, 10, mouth), minion('rabbit', 1, 12, rabbitFrom)] }),
  phase(0.3, 'sway', [
    atk('fan', 3, mouth, { count: 5, spread: 0.8 }),
    atk('aimed', 2.4, 'eyeL'),
    atk('aimed', 2.4, 'eyeR'),
  ], { rate: 1.3, minions: [minion(species, 2, 9, mouth), minion('rabbit', 1, 12, rabbitFrom)] }),
  phase(0, 'charge', [
    atk('ring', 4.2, mouth, { count: 14, speed: 0.85 }),
    atk('fan', 3, 'eyeL', { count: 5, spread: 0.8 }),
    atk('fan', 3, 'eyeR', { count: 5, spread: 0.8 }),
    atk('laser', 8, mouth),
  ], { rate: 1.5, minions: [minion(species, 2, 8, mouth), minion('rabbit', 1, 12, rabbitFrom)] }),
];

export function boss(kind, name, species, y, size, parts, phases) {
  const maxHp = parts.reduce((n, p) => n + p.hp, 0);
  const bottom = Math.max(...parts.map((p) => p.dy + p.h / 2));
  return { kind, name, species, y, size, parts, phases, maxHp, bottom };
}
