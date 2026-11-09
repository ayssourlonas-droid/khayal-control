// Difficulty belongs to the level, not to progress: world 8 is hard even when played first.
// Exports: difficulty(world, index) -> d in [0, 1]; scaled(d) -> the rules at d; FIRE_UP.

// 0 at world 1 level 1, 1 at world 8 level 5, in 39 equal steps. Worlds 9-17 (the side worlds) set
// their own d per level, so the 39 steps of the main curve stay put. They span easy to the hardest in the game:
// world 10 is a step easier than world 4, between worlds 3 and 4; world 9 is about world 4-5 hard;
// world 11 sits about world 5's level, and its top (0.60) stays under the 0.6 where armorBonus turns
// on; world 12 runs world 6's own d (25/39 to 29/39), so armorBonus applies there, as in world 6;
// world 13 runs a notch above it, because its two rules (the wingmen and the broadside) help the player;
// world 14 runs another notch above that, to pay for the bursts of its shells (the fireworks);
// world 15 runs a notch above that again, because its two powers (the pearls and the trident) help the player;
// world 16 runs a notch above that again, because its mirror twin doubles the ship's gun;
// world 17 runs the top of the scale (1.0 on its boss, as world 8's last level), because the help its breath
// sends is paid for in that d: with it, its clear rates aim at world 7's.
// world 18, the first free-flight world (R67), runs the top of the scale too, as world 17 does, and the hardest world
// of all by its waves and its boss (the user asked for it): its clear rates are under world 7's.
const OWN = {
  9: [0.40, 0.43, 0.45, 0.48, 0.50],
  10: [0.30, 0.32, 0.34, 0.36, 0.38],
  11: [0.51, 0.53, 0.56, 0.58, 0.60],
  12: [0.64, 0.66, 0.69, 0.71, 0.74],
  13: [0.66, 0.68, 0.71, 0.73, 0.76],
  14: [0.70, 0.72, 0.75, 0.77, 0.80],
  15: [0.72, 0.74, 0.77, 0.79, 0.82],
  16: [0.74, 0.77, 0.79, 0.82, 0.84],
  17: [0.86, 0.89, 0.92, 0.96, 1.0],
  18: [0.86, 0.89, 0.92, 0.96, 1.0],
};
export const difficulty = (world, index) => OWN[world]?.[index - 1] ?? ((world - 1) * 5 + index - 1) / 39;

// R54: the enemy shoots this many times more than the d curve alone says, to pay for the extra
// power-up drops (KILL_DROP in powerups.js) and keep the game no easier. 1.5 is the value that held
// the clear rate and hits a run at their old levels in the headless balance run, next to a KILL_DROP
// of 3 % (see the spec, R54). It scales the boss's attacks and its gunner minions too (fireMult).
export const FIRE_UP = 1.5;

// What d does to the rules. fireMult multiplies ROLES[role].fire; formationSpeed multiplies a
// wave's own speed; armorBonus is extra hp for armored and gunner aliens.
export const scaled = (d) => ({
  bulletSpeed: 260 + 260 * d,
  fireMult: (0.6 + 1.0 * d) * FIRE_UP,
  formationSpeed: 1 + 0.6 * d,
  armorBonus: d > 0.6 ? 1 : 0,
});
