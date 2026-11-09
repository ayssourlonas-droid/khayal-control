import { TWISTS, BOSSES } from './kinds.js';
import { difficulty } from './difficulty.js';
import { w, lv, LATE } from './levels-2.js';
import { SIDE } from './levels-3.js';
import { SIDE2, STORM } from './levels-4.js';

// Level data, plain and serialisable. Each level, in order, is
//   { id: 'w<world>-<index>', world, index, seed, d, twist, bunkers,
//     waves: [{ formation, rows, cols, roles: [role per row], pattern, speed }] }
// for index 1-4, and the same without `waves` but with `boss` for index 5. `seed` is the fixed seed
// of the level's world rng, `d` its difficulty (difficulty.js), `twist` its world's rule.
// The wave shorthand `w` and its role letters are explained in levels-2.js.

const NAMES = ['Arcade Origin', 'Neon Rain', 'Twin Suns', 'Ronin Moon',
  'Hive', 'Code Rain', 'Iron Dawn', 'Event Horizon', 'Tidal Siege', 'Hollow Night', 'Aurora Kingdom',
  'Starlit Archive', 'Sunset Armada', 'Ember Carnival', 'Lantern Deep', 'Glass Cathedral', 'Ash to Air', 'Anvil Sky'];
export const FREE_FROM = 18; // R67: every world from this one on flies free (ship.js zoneOf, collide.js); 1-17 keep the bottom strip

export const WORLDS = NAMES.map((name, i) => ({ id: i + 1, name, twist: TWISTS[i], boss: BOSSES[i], free: i + 1 >= FREE_FROM }));

// A level's world name, and its place in the world: 'Reel 3', or the boss level's 'Finale'.
export const worldName = (level) => WORLDS[level.world - 1]?.name ?? '';
export const reelName = (level) => (level.boss ? 'Finale' : `Reel ${level.index}`);

const EARLY = [
  // 1 Arcade Origin: the classic march with plain shots, then fans and rings. Bunkers throughout.
  [
    lv(10417, [
      w('grid', 8, 'ggg', 'aimed', 0.85),
      w('sway', 6, 'ggd', 'aimed', 0.9),
      w('grid', 3, 'ggc', 'aimed', 0.9),
    ], true),
    lv(10852, [
      w('grid', 8, 'uggg', 'aimed', 0.9),
      w('dive', 6, 'dg', 'aimed', 0.95),
      w('sway', 7, 'ugg', 'fan', 0.95),
      w('sway', 2, 'gcg', 'aimed', 1.0),
    ], true),
    lv(11329, [
      w('split', 6, 'ug', 'fan', 1.0),
      w('grid', 8, 'uggg', 'aimed', 1.0),
      w('dive', 8, 'dgu', 'fan', 1.05),
      w('escort', 3, 'aca', 'aimed', 1.05),
    ], true),
    lv(11766, [
      w('grid', 8, 'uugg', 'fan', 1.05),
      w('spiral', 6, 'gdu', 'fan', 1.1),
      w('sway', 8, 'gag', 'ring', 1.1),
      w('escort', 3, 'uca', 'fan', 1.15),
      w('grid', 10, 'uugg', 'aimed', 1.2),
    ], true),
    lv(12203),
  ],
  // 2 Neon Rain: traffic that dives, columns that fall like rain, homing drones in the dark.
  [
    lv(20531, [
      w('rain', 6, 'ggg', 'rain', 0.9),
      w('sway', 5, 'ugd', 'aimed', 0.95),
      w('rain', 3, 'gcu', 'rain', 0.95),
    ]),
    lv(20978, [
      w('dive', 6, 'dgg', 'aimed', 1.0),
      w('rain', 8, 'ugg', 'rain', 1.0),
      w('spiral', 6, 'gug', 'homing', 0.95),
      w('sway', 2, 'ucg', 'fan', 1.0),
    ]),
    lv(21404, [
      w('rain', 10, 'gug', 'rain', 1.05),
      w('split', 8, 'dga', 'homing', 1.05),
      w('dive', 6, 'duu', 'aimed', 1.1),
      w('escort', 3, 'aca', 'fan', 1.05),
    ], true),
    lv(21893, [
      w('rain', 8, 'ugdg', 'rain', 1.1),
      w('spiral', 6, 'uag', 'homing', 1.1),
      w('dive', 6, 'dga', 'aimed', 1.15),
      w('rain', 8, 'ggg', 'rain', 1.15),
      w('orbit', 3, 'uca', 'homing', 1.15),
    ]),
    lv(22247),
  ],
  // 3 Twin Suns: squadrons that dive in from the flanks and fan their fire. Gusts shove it all.
  [
    lv(30619, [
      w('dive', 6, 'dgg', 'fan', 1.0),
      w('grid', 8, 'ugg', 'aimed', 1.0),
      w('dive', 3, 'dcd', 'fan', 1.0),
    ]),
    lv(30284, [
      w('dive', 6, 'dgg', 'fan', 1.05),
      w('split', 8, 'ugu', 'aimed', 1.05),
      w('grid', 6, 'ga', 'fan', 1.05),
      w('escort', 3, 'ucu', 'fan', 1.1),
    ], true),
    lv(31057, [
      w('dive', 10, 'dud', 'fan', 1.1),
      w('sway', 6, 'gag', 'laser', 1.05),
      w('split', 8, 'gug', 'aimed', 1.1),
      w('escort', 4, 'aca', 'aimed', 1.1),
    ]),
    lv(31512, [
      w('dive', 6, 'dggd', 'fan', 1.15),
      w('grid', 6, 'gag', 'fan', 1.15),
      w('spiral', 6, 'gda', 'laser', 1.15),
      w('escort', 3, 'aca', 'fan', 1.2),
      w('split', 10, 'uag', 'aimed', 1.2),
    ], true),
    lv(32061),
  ],
  // 4 Ronin Moon: every shot is a slow, large shuriken, so the waves differ in how they move.
  [
    lv(40173, [
      w('sway', 8, 'uug', 'shuriken', 0.95),
      w('split', 8, 'uu', 'shuriken', 1.0),
      w('orbit', 3, 'ucu', 'shuriken', 1.0),
    ]),
    lv(40726, [
      w('dive', 6, 'dgu', 'shuriken', 1.0),
      w('spiral', 8, 'uug', 'shuriken', 1.0),
      w('sway', 10, 'uug', 'shuriken', 1.0),
      w('escort', 3, 'aca', 'shuriken', 1.05),
    ]),
    lv(41391, [
      w('orbit', 8, 'uag', 'shuriken', 1.05),
      w('split', 10, 'uug', 'shuriken', 1.05),
      w('dive', 8, 'dgu', 'shuriken', 1.1),
      w('escort', 3, 'uca', 'shuriken', 1.1),
    ]),
    lv(41848, [
      w('spiral', 6, 'uagu', 'shuriken', 1.1),
      w('orbit', 8, 'uau', 'shuriken', 1.15),
      w('sway', 9, 'uagu', 'shuriken', 1.15),
      w('dive', 6, 'dua', 'shuriken', 1.2),
      w('escort', 3, 'aca', 'shuriken', 1.2),
    ]),
    lv(42305),
  ],
];

// One level from its spec. A spec without waves is the world's boss level.
function level(world, index, { seed, bunkers, waves }) {
  const home = WORLDS[world - 1];
  const base = {
    id: `w${world}-${index}`, world, index, seed, d: difficulty(world, index), twist: home.twist, bunkers,
    ...(home.free && { free: true }),
  };
  return waves ? { ...base, waves } : { ...base, boss: home.boss };
}

export const LEVELS = [...EARLY, ...LATE, ...SIDE, ...SIDE2, ...STORM].flatMap((specs, wi) =>
  specs.map((spec, ii) => level(wi + 1, ii + 1, spec)));

// World 1 at d = 0 for "Watch, then try": a 6x3 grunt grid, then one swaying trio around a carrier.
// No bunkers, so the autopilot's shots are never blocked while the captions are teaching.
export const DEMO_LEVEL = {
  id: 'demo', world: 1, index: 1, seed: 7, d: 0, twist: WORLDS[0].twist, bunkers: false,
  waves: [
    w('grid', 6, 'ggg', 'aimed', 0.8),
    w('sway', 1, 'gcg', 'aimed', 0.8),
  ],
};

export const levelById = (id) => LEVELS.find((l) => l.id === id);
