import { w, lv } from './levels-2.js';

// Level data for worlds 9-13, in the shorthand explained in levels-2.js. All five are side worlds beside
// the main run: their own d (difficulty.js) puts world 9 near worlds 4-5, world 10 between worlds 3
// and 4, world 11 about world 5, world 12 at world 6's own d and world 13 a notch above it, so their
// waves are paced like those.
export const SIDE = [
  // 9 Tidal Siege: the beast's brood comes in off the sea: crabs sway along the quay, rays dive
  // out of the spray, jellyfish drift in escort. The piers (bunkers) stand on the first and third.
  [
    lv(90213, [
      w('sway', 8, 'ugg', 'aimed', 1.0),
      w('dive', 6, 'dgg', 'fan', 1.0),
      w('escort', 3, 'gcu', 'aimed', 1.05),
    ], true),
    lv(90658, [
      w('rain', 8, 'ugg', 'rain', 1.05),
      w('split', 8, 'dga', 'fan', 1.05),
      w('grid', 7, 'gag', 'aimed', 1.1),
      w('orbit', 3, 'uca', 'fan', 1.1),
    ]),
    lv(91127, [
      w('dive', 8, 'dgu', 'fan', 1.1),
      w('spiral', 6, 'uag', 'aimed', 1.1),
      w('rain', 8, 'gug', 'rain', 1.1),
      w('escort', 3, 'aca', 'fan', 1.15),
    ], true),
    lv(91584, [
      w('split', 8, 'gud', 'fan', 1.1),
      w('orbit', 6, 'gag', 'fan', 1.1),
      w('dive', 6, 'dgu', 'aimed', 1.15),
      w('escort', 3, 'uca', 'fan', 1.15),
    ]),
    lv(92046),
  ],
  // 10 Hollow Night: the night's guests come up the hill. Ghosts drift in on the wind, bats dive
  // from the belfry, jack-o'-lanterns spit embers, coffins march in step and cauldrons carry the
  // brew. A gentler night than the harbour, so single armored rows and slower waves. The headstones
  // (bunkers) stand on the first and third.
  [
    lv(100317, [
      w('sway', 8, 'ugg', 'aimed', 0.95),
      w('dive', 6, 'dgg', 'aimed', 0.95),
      w('escort', 3, 'gcu', 'aimed', 1.0),
    ], true),
    lv(100764, [
      w('spiral', 6, 'ugg', 'aimed', 1.0),
      w('grid', 8, 'gag', 'aimed', 1.0),
      w('dive', 6, 'dgg', 'aimed', 1.0),
      w('orbit', 3, 'ucg', 'fan', 1.05),
    ]),
    lv(101249, [
      w('split', 8, 'ugu', 'fan', 1.05),
      w('sway', 8, 'gag', 'aimed', 1.05),
      w('dive', 6, 'dgu', 'fan', 1.05),
      w('escort', 3, 'gcu', 'fan', 1.1),
    ], true),
    lv(101682, [
      w('spiral', 6, 'gug', 'aimed', 1.0),
      w('grid', 7, 'gag', 'aimed', 1.0),
      w('rain', 6, 'dgg', 'fan', 1.05),
      w('orbit', 3, 'gca', 'fan', 1.05),
    ]),
    lv(102158),
  ],
  // 11 Aurora Kingdom: the kingdom's guard under the polar night. Frost spirits drift in on the cold,
  // snow owls dive out of the dark, ice crystals fire the shards (the shuriken pattern, as in world 4:
  // slow, big, and cut by a shot), ice golems march and glowing narwhals carry. Paced like world 5,
  // gunner-heavy from the first level, so the shards fill the sky. The glacier blocks (bunkers) stand
  // on the second and fourth.
  [
    lv(110371, [
      w('sway', 8, 'uuag', 'shuriken', 1.15),
      w('dive', 6, 'dud', 'aimed', 1.15),
      w('split', 8, 'ugg', 'shuriken', 1.2),
      w('escort', 3, 'ucu', 'shuriken', 1.2),
    ]),
    lv(110826, [
      w('spiral', 6, 'uugd', 'shuriken', 1.2),
      w('split', 8, 'uagg', 'shuriken', 1.25),
      w('rain', 8, 'uug', 'fan', 1.25),
      w('orbit', 3, 'uca', 'shuriken', 1.25),
    ], true),
    lv(111283, [
      w('dive', 8, 'dugd', 'aimed', 1.35),
      w('orbit', 8, 'uuau', 'shuriken', 1.35),
      w('split', 8, 'uaag', 'shuriken', 1.4),
      w('rain', 8, 'ugg', 'shuriken', 1.4),
      w('escort', 3, 'aca', 'shuriken', 1.4),
    ]),
    lv(111746, [
      w('spiral', 6, 'uagu', 'shuriken', 1.3),
      w('rain', 8, 'uaug', 'shuriken', 1.3),
      w('sway', 9, 'uaag', 'shuriken', 1.35),
      w('dive', 6, 'dua', 'aimed', 1.35),
      w('orbit', 3, 'gca', 'shuriken', 1.35),
    ], true),
    lv(112209),
  ],
  // 12 Starlit Archive: the guards of the stacks. Ink wisps drift in, paper cranes dive off the
  // shelves, spellbooks snap open and fire, bronze owl bookends march and lantern moths carry. Paced
  // like world 6, whose glitch twist it shares: rain, aimed shots, spirals and rings, with the fans
  // and lasers of world 7 now and then. The stacks of tomes (bunkers) stand on the first and third.
  [
    lv(120391, [
      w('sway', 8, 'ugg', 'rain', 1.0),
      w('dive', 6, 'dgu', 'aimed', 1.05),
      w('escort', 3, 'gcu', 'spiral', 1.05),
    ], true),
    lv(120847, [
      w('split', 8, 'ugd', 'ring', 1.1),
      w('rain', 8, 'gag', 'aimed', 1.1),
      w('spiral', 6, 'dgg', 'rain', 1.15),
      w('orbit', 3, 'ucu', 'spiral', 1.15),
    ]),
    lv(121302, [
      w('dive', 8, 'dug', 'fan', 1.15),
      w('split', 8, 'gag', 'ring', 1.15),
      w('sway', 8, 'ugg', 'rain', 1.15),
      w('escort', 3, 'aca', 'spiral', 1.2),
    ], true),
    lv(121779, [
      w('spiral', 6, 'uda', 'rain', 1.2),
      w('sway', 5, 'dug', 'laser', 1.2),
      w('rain', 8, 'gdg', 'ring', 1.2),
      w('split', 8, 'gag', 'spiral', 1.25),
      w('orbit', 3, 'uca', 'aimed', 1.3),
    ]),
    lv(122236),
  ],
  // 13 Sunset Armada: the fleet at golden hour. Brass rotor drones (g) sway in, gull-winged gliders
  // (d) dive out of the sun, balloon gun-pods (u) fire their broadsides, ironclad gunboats (a) hold
  // the line and cargo zeppelins (c) carry. Paced like world 6, a notch harder: aimed shots, fans,
  // rain and rings, a laser now and then. Divers lead most waves, so the ship's side guns (the
  // twist) have something to hit. Stacked cargo crates (bunkers) stand on the second and fourth.
  [
    lv(130417, [
      w('dive', 6, 'dgg', 'aimed', 1.0),
      w('sway', 8, 'ugd', 'fan', 1.0),
      w('escort', 3, 'gcu', 'rain', 1.05),
    ]),
    lv(130884, [
      w('split', 8, 'ugd', 'aimed', 1.1),
      w('dive', 6, 'dgd', 'fan', 1.1),
      w('rain', 8, 'gag', 'rain', 1.1),
      w('orbit', 3, 'ucu', 'spiral', 1.15),
    ], true),
    lv(131333, [
      w('dive', 8, 'dug', 'fan', 1.15),
      w('sway', 8, 'dag', 'ring', 1.15),
      w('spiral', 6, 'dug', 'aimed', 1.2),
      w('escort', 3, 'aca', 'rain', 1.2),
    ]),
    lv(131796, [
      w('dive', 6, 'dud', 'fan', 1.2),
      w('split', 8, 'gag', 'rain', 1.2),
      w('sway', 5, 'dug', 'laser', 1.25),
      w('rain', 8, 'gdg', 'ring', 1.25),
      w('orbit', 3, 'uca', 'aimed', 1.3),
    ], true),
    lv(132241),
  ],
];
