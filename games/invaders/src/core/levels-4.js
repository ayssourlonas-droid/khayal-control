import { w, lv } from './levels-2.js';

// Level data for worlds 14-17, in the shorthand explained in levels-2.js (levels-3.js is full). All four
// are side worlds beside the main run, like worlds 9-13: their own d (difficulty.js) puts world 14 a notch
// above world 13, world 15 a notch above world 14 and world 16 a notch above world 15. World 17 is the
// hardest world of all, with the hardest d, and its levels are written for that.
export const SIDE2 = [
  // 14 Ember Carnival: clockwork prizes from the booths, stuffed with powder. Tin drones (g) march
  // in dense blocks, firework rockets (d) dive out of the smoke, jack-in-the-box turrets (u) fire
  // from their springs, tin drummers (a) hold the line and balloon bunches (c) carry. The blocks are
  // three and four rows deep and close set, so a shell that goes up (the twist) has neighbours to
  // set off. Paced like world 6, a notch harder: aimed shots, fans, rain and rings, a laser now and
  // then. Striped booths (bunkers) stand on the second and fourth.
  [
    lv(140417, [
      w('grid', 8, 'ugg', 'aimed', 1.0),
      w('sway', 8, 'gdgg', 'fan', 1.0),
      w('escort', 3, 'gcu', 'rain', 1.05),
    ]),
    lv(140884, [
      w('split', 8, 'ugdg', 'aimed', 1.1),
      w('grid', 9, 'gag', 'fan', 1.1),
      w('rain', 8, 'gdgg', 'rain', 1.1),
      w('orbit', 3, 'ucu', 'spiral', 1.15),
    ], true),
    lv(141333, [
      w('spiral', 8, 'gudg', 'fan', 1.1),
      w('grid', 10, 'gagg', 'ring', 1.1),
      w('sway', 8, 'gdgg', 'aimed', 1.15),
      w('escort', 3, 'aca', 'rain', 1.2),
    ]),
    lv(141796, [
      w('split', 8, 'gagd', 'fan', 1.2),
      w('grid', 8, 'gagg', 'rain', 1.15),
      w('sway', 5, 'dug', 'laser', 1.25),
      w('rain', 10, 'gdgg', 'ring', 1.25),
      w('orbit', 3, 'uca', 'aimed', 1.3),
    ], true),
    lv(142241),
  ],
  // 15 Lantern Deep: the sea under a sunken kingdom, where everything makes its own light. Lantern
  // jellyfish (g) drift in deep columns, darting squid (d) shoot out of the dark, pufferfish (u) puff
  // and fire, hermit crabs in diving helmets (a) hold the line and sea turtles with lanterns (c) carry.
  // Paced like world 6, a notch harder than world 14: aimed shots, fans, rain and rings, a laser now
  // and then. Squid lead most waves, which the pearls meet as they come in, and the columns are four
  // and five rows deep, which the trident runs through. Reef-stone bunkers stand on the second and
  // fourth.
  [
    lv(150417, [
      w('dive', 6, 'dgdg', 'aimed', 1.0),
      w('sway', 8, 'gdgg', 'fan', 1.0),
      w('escort', 3, 'gcu', 'rain', 1.05),
    ]),
    lv(150884, [
      w('rain', 8, 'gdgg', 'aimed', 1.1),
      w('dive', 6, 'dugd', 'fan', 1.1),
      w('split', 8, 'ugdg', 'rain', 1.1),
      w('orbit', 3, 'ucu', 'spiral', 1.15),
    ], true),
    lv(151333, [
      w('grid', 8, 'gdgag', 'fan', 1.05),
      w('dive', 8, 'dgdg', 'aimed', 1.1),
      w('spiral', 6, 'dugd', 'aimed', 1.15),
      w('escort', 3, 'aca', 'rain', 1.2),
    ]),
    lv(151796, [
      w('rain', 8, 'dgag', 'fan', 1.2),
      w('dive', 6, 'dgdg', 'rain', 1.2),
      w('split', 8, 'gdag', 'fan', 1.2),
      w('orbit', 3, 'uca', 'aimed', 1.3),
    ], true),
    lv(152241),
  ],
  // 16 Glass Cathedral: a half-ruined nave under a dawn sky, where everything is glass, lead and stone.
  // Stained-glass beetles (g) sway in wide rows, glass swallows (d) dart down from the vault, candle
  // wisps in lanterns (u) fire, stone gargoyles with glass wings (a) hold the line and gilded reliquaries
  // (c) carry. Paced like world 6, a notch harder than world 15: aimed shots, fans, rain and spirals.
  // Every level has a row of gargoyles, because a gargoyle that falls stands up again unless it is shot
  // while it hangs shattered (the twist). The rows are few, because the mending makes each one costly
  // at this d, and every level has a wave eight wide, where the mirror twin covers the far flank.
  // Stained-glass panels (bunkers) stand on the second and fourth.
  [
    lv(160417, [
      w('dive', 6, 'dgdg', 'aimed', 1.0),
      w('sway', 8, 'gdgg', 'fan', 1.0),
      w('escort', 3, 'gca', 'rain', 1.05),
    ]),
    lv(160884, [
      w('rain', 8, 'gdgg', 'aimed', 1.1),
      w('dive', 6, 'dugd', 'fan', 1.1),
      w('split', 8, 'gagd', 'rain', 1.1),
      w('orbit', 3, 'aca', 'spiral', 1.15),
    ], true),
    lv(161333, [
      w('grid', 8, 'gdgag', 'fan', 1.0),
      w('sway', 8, 'dgdg', 'aimed', 1.05),
      w('spiral', 6, 'dugd', 'aimed', 1.15),
      w('escort', 3, 'aca', 'rain', 1.2),
    ]),
    lv(161796, [
      w('rain', 8, 'dgag', 'fan', 1.2),
      w('sway', 6, 'dgdg', 'rain', 1.2),
      w('split', 8, 'gdg', 'fan', 1.2),
      w('orbit', 3, 'uca', 'aimed', 1.3),
    ], true),
    lv(162241),
  ],
  // 17 Ash to Air: a city choked by smoke, the habit itself against you. Lit cigarettes (g) march in
  // wide rows, flicked butts (d) dive trailing smoke, tobacco pipes (u) puff and fire, fat cigars (a)
  // hold the line and plain packs (c) carry. The hardest world, with its help as hard as world 7: fast
  // waves, many gunner rows, fans, rings and aimed shots, and a laser now and then. The breath (the
  // twist) sweeps the bullets away every 24 s, so the fire is heavy and the waves are quick. Armored rows are
  // few, one to a wave and only on some, because the cigars are costly at this d and re-forming is
  // world 7's, not this world's. Clean-air filters (bunkers) stand on the second and fourth.
  [
    lv(170391, [
      w('grid', 8, 'uggd', 'aimed', 1.15),
      w('dive', 6, 'dug', 'fan', 1.2),
      w('sway', 6, 'ugug', 'fan', 1.2),
      w('escort', 3, 'gcu', 'ring', 1.25),
    ]),
    lv(170862, [
      w('sway', 8, 'ugdg', 'fan', 1.2),
      w('split', 8, 'udgu', 'aimed', 1.25),
      w('rain', 6, 'gag', 'laser', 1.25),
      w('escort', 3, 'uca', 'ring', 1.3),
    ], true),
    lv(171347, [
      w('spiral', 8, 'ugug', 'ring', 1.25),
      w('grid', 8, 'ugd', 'fan', 1.3),
      w('dive', 8, 'dgu', 'aimed', 1.3),
      w('escort', 4, 'gca', 'fan', 1.35),
    ]),
    lv(171814, [
      w('orbit', 6, 'ugu', 'ring', 1.3),
      w('rain', 8, 'dgu', 'fan', 1.35),
      w('sway', 6, 'gag', 'laser', 1.35),
      w('split', 8, 'dug', 'aimed', 1.4),
      w('escort', 3, 'uca', 'fan', 1.4),
    ], true),
    lv(172259),
  ],
];

// 18 Anvil Sky, the first free-flight world (R67): a dogfight inside a thunderstorm. Storm hornets (g)
// swarm, lightning darts (d) dive, thunder turrets (u) fire, anvil-plated hulks (a) hold the line and
// cargo balloons (c) carry. Most waves fire homing bullets, the ones the ship can drag into the aliens,
// and the formations leave room to fly in among them; a fan, an aimed or a ring wave now and then makes
// the ship dodge instead of lure. Carriers come in every level, for the side guns (world 18's power). No
// bunkers: the whole sky is the ship's. The finale is the Squall Ray.
export const STORM = [
  [
    lv(180417, [
      w('sway', 4, 'ucg', 'homing', 0.9),
      w('orbit', 6, 'gug', 'homing', 0.95),
      w('split', 4, 'ucd', 'homing', 1.0),
      w('grid', 8, 'ugag', 'homing', 1.0),
    ]),
    lv(180863, [
      w('rain', 6, 'gdu', 'homing', 1.0),
      w('escort', 4, 'gcu', 'homing', 1.0),
      w('spiral', 8, 'ugu', 'homing', 1.05),
      w('sway', 6, 'uau', 'fan', 1.05),
    ]),
    lv(181294, [
      w('dive', 8, 'dugu', 'homing', 1.05),
      w('orbit', 6, 'ucu', 'homing', 1.1),
      w('grid', 8, 'udag', 'aimed', 1.1),
      w('split', 8, 'gugu', 'fan', 1.1),
    ]),
    lv(181738, [
      w('spiral', 8, 'gugu', 'homing', 1.1),
      w('rain', 8, 'dua', 'ring', 1.15),
      w('escort', 4, 'ucu', 'homing', 1.15),
      w('sway', 8, 'uadu', 'homing', 1.15),
      w('orbit', 6, 'ugug', 'fan', 1.2),
    ]),
    lv(182191),
  ],
];
