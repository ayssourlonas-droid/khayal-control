// Level data for worlds 5-8, plus the two shorthands both level files are written in.
//
//   w(formation, cols, roles, pattern, speed)  one wave. `roles` is one letter per row, top row
//        first: g grunt, d diver, u gunner, a armored, c carrier. Every alien of a row gets that
//        row's role, so a carrier row holds `cols` carriers; carrier rows therefore live in
//        narrow waves (3 cols), which keeps the power-ups worth having. `speed` multiplies the
//        formation's pace and stacks with scaled(d).formationSpeed.
//   lv(seed, waves, bunkers)  one level. `lv(seed)` alone is the world's boss level.
const ROLE = { g: 'grunt', d: 'diver', u: 'gunner', a: 'armored', c: 'carrier' };

export const w = (formation, cols, roles, pattern, speed) =>
  ({ formation, rows: roles.length, cols, roles: [...roles].map((c) => ROLE[c]), pattern, speed });

export const lv = (seed, waves, bunkers = false) => ({ seed, bunkers, waves });

export const LATE = [
  // 5 Hive: brood waves that spiral in, orbit their eggs and rain down. Spores home in.
  [
    lv(50249, [
      w('spiral', 6, 'ugd', 'spiral', 1.0),
      w('rain', 8, 'ugg', 'aimed', 1.0),
      w('orbit', 3, 'ugc', 'homing', 1.0),
    ]),
    lv(50864, [
      w('orbit', 6, 'ggg', 'homing', 1.05),
      w('split', 8, 'dga', 'ring', 1.05),
      w('rain', 8, 'ugg', 'spiral', 1.05),
      w('escort', 3, 'aca', 'homing', 1.1),
    ]),
    lv(51437, [
      w('spiral', 8, 'gagd', 'spiral', 1.1),
      w('orbit', 8, 'gug', 'ring', 1.1),
      w('rain', 8, 'dgg', 'homing', 1.15),
      w('escort', 3, 'uca', 'ring', 1.15),
    ]),
    lv(51902, [
      w('split', 8, 'dg', 'ring', 1.15),
      w('spiral', 6, 'gaag', 'spiral', 1.2),
      w('orbit', 6, 'gag', 'homing', 1.2),
      w('rain', 10, 'ugd', 'spiral', 1.2),
      w('escort', 3, 'aca', 'homing', 1.25),
    ]),
    lv(52358),
  ],
  // 6 Code Rain: columns that fall and split, aliens that blink. The glyph rain is the bullets.
  [
    lv(60391, [
      w('rain', 8, 'ugg', 'rain', 1.0),
      w('split', 8, 'gdu', 'aimed', 1.05),
      w('rain', 3, 'gcu', 'spiral', 1.05),
    ]),
    lv(60815, [
      w('split', 8, 'ugd', 'rain', 1.1),
      w('grid', 7, 'gag', 'aimed', 1.1),
      w('rain', 8, 'dgg', 'rain', 1.15),
      w('sway', 2, 'ucu', 'spiral', 1.15),
    ], true),
    lv(61276, [
      w('rain', 10, 'ugg', 'rain', 1.2),
      w('split', 8, 'gag', 'ring', 1.2),
      w('spiral', 6, 'dua', 'aimed', 1.2),
      w('escort', 3, 'aca', 'spiral', 1.25),
    ]),
    lv(61743, [
      w('split', 8, 'dug', 'rain', 1.25),
      w('rain', 8, 'gdg', 'rain', 1.25),
      w('grid', 7, 'gag', 'ring', 1.3),
      w('spiral', 6, 'uda', 'spiral', 1.3),
      w('escort', 3, 'uca', 'aimed', 1.3),
    ]),
    lv(62190),
  ],
  // 7 Iron Dawn: armored ranks that march in lockstep, lasers and walls of fire.
  [
    lv(70528, [
      w('grid', 8, 'agg', 'aimed', 1.1),
      w('dive', 6, 'dug', 'fan', 1.15),
      w('escort', 3, 'aca', 'aimed', 1.15),
    ]),
    lv(70963, [
      w('grid', 7, 'gag', 'aimed', 1.2),
      w('sway', 6, 'agg', 'laser', 1.2),
      w('dive', 8, 'dgg', 'aimed', 1.2),
      w('escort', 3, 'uca', 'aimed', 1.25),
    ]),
    lv(71384, [
      w('grid', 8, 'agg', 'ring', 1.25),
      w('split', 10, 'ggg', 'laser', 1.25),
      w('dive', 8, 'dua', 'fan', 1.3),
      w('escort', 4, 'aca', 'aimed', 1.3),
    ], true),
    lv(71859, [
      w('grid', 7, 'agg', 'fan', 1.3),
      w('sway', 6, 'agg', 'laser', 1.3),
      w('dive', 8, 'dga', 'ring', 1.35),
      w('split', 8, 'ggd', 'aimed', 1.35),
      w('escort', 3, 'aca', 'fan', 1.4),
    ]),
    lv(72406),
  ],
  // 8 Event Horizon: everything orbits or spirals into the well. Homing shots and slow rings.
  [
    lv(80137, [
      w('orbit', 6, 'ugg', 'homing', 1.2),
      w('spiral', 6, 'dug', 'spiral', 1.2),
      w('escort', 3, 'gcu', 'ring', 1.25),
    ]),
    lv(80674, [
      w('orbit', 6, 'uag', 'homing', 1.25),
      w('split', 8, 'dgg', 'ring', 1.3),
      w('spiral', 8, 'ugd', 'spiral', 1.3),
      w('escort', 3, 'aca', 'homing', 1.3),
    ]),
    lv(81209, [
      w('rain', 10, 'ugg', 'spiral', 1.35),
      w('orbit', 6, 'gag', 'laser', 1.35),
      w('dive', 6, 'dug', 'fan', 1.35),
      w('escort', 4, 'gca', 'homing', 1.4),
    ]),
    lv(81795, [
      w('orbit', 8, 'gag', 'ring', 1.4),
      w('spiral', 8, 'ggd', 'spiral', 1.4),
      w('split', 8, 'dg', 'homing', 1.45),
      w('rain', 6, 'ugg', 'laser', 1.45),
      w('escort', 3, 'aca', 'ring', 1.5),
    ]),
    lv(82463),
  ],
];
