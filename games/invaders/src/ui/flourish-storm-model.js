// When the lightning strikes in Anvil Sky: a pure function of time, so the sheet lightning (washes the sky and the towers), the forked bolt
// and the brightening of the flat-lit pockets (flourish-storm.js) all flash together, and a test can read the schedule. Time is cut into
// slots of SLOT s; each slot may hold one strike (more often than not), starting somewhere in its first SLOT - 1 s, so a strike never leaves
// its slot. A strike is a double flash with a long afterglow, and one in BOLT of them is a fork: it also draws a bolt from the anvil of one
// of the far towers (parallax-storm-anvil.js TOWERS) to the sea, one of BOLTS drawings. strike(t) hands back one shared object: k the light
// right now 0..1 (0 when quiet), tower which far tower, bolt which drawing (-1 when it is sheet lightning alone), dx where along the tower's
// anvil the bolt falls (-1..1), power how hard the strike is 0..1, age s since it began.
import { hash } from './sprites.js';
import { TOWERS } from './parallax-storm-anvil.js';

export const SLOT = 2.7;
export const CHANCE = 0.7; // the share of slots that hold a strike
export const BOLT = 0.55; // the share of strikes that are forks
export const BOLTS = 4;
const out = { k: 0, tower: 0, bolt: -1, dx: 0, power: 0, age: 0 };

// A strike's light at s seconds in: two flashes (0..0.1 s, 0.16..0.3 s, the second a little weaker), and an afterglow dying over about half a second.
export function flashAt(s) {
  if (s < 0) return 0;
  const a = s < 0.1 ? Math.sin((Math.PI * s) / 0.1) : 0;
  const b = s > 0.16 && s < 0.3 ? 0.7 * Math.sin((Math.PI * (s - 0.16)) / 0.14) : 0;
  return Math.max(a, b, 0.35 * Math.exp(-s * 4.5));
}

export function strike(t) {
  const i = Math.floor(t / SLOT);
  out.k = 0;
  out.bolt = -1;
  out.tower = 0;
  out.dx = 0;
  out.power = 0;
  out.age = 0;
  if (hash(i * 7 + 3) >= CHANCE) return out;
  const age = t - i * SLOT - hash(i * 7 + 4) * (SLOT - 1);
  if (age < 0 || age > 1) return out;
  out.age = age;
  out.power = 0.5 + 0.5 * hash(i * 7 + 5);
  out.tower = Math.floor(hash(i * 7 + 8) * TOWERS.length);
  out.dx = hash(i * 7 + 9) * 2 - 1;
  if (hash(i * 7 + 6) < BOLT) out.bolt = Math.floor(hash(i * 7 + 10) * BOLTS);
  out.k = flashAt(age) * out.power;
  return out;
}
