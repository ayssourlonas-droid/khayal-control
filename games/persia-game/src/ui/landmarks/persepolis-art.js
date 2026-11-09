// The small pictures persepolis.js stamps, one character per block: '#' stone, '+' moonlit stone,
// '-' stone in shadow, 'f' fire, 'y' the flame's heart, '.' nothing. Moonlight falls from the left.

const mirror = (rows) => rows.map((r) => r + [...r].reverse().join(''));

// A winged bull with a crowned, bearded man's head, in relief on a gate pier, facing left.
export const LAMASSU = [
  '..++++...............+++..',
  '..+--+.............+++++..',
  '..++++........+++++++++-..',
  '..+--+.....++++---------..',
  '.++++++...++++++++++++++..',
  '++-+++-...+------------...',
  '.+++++....+++++++++++++...',
  '.+---+...+-----------.....',
  '.+-+-+..+++++++++++.......',
  '.+-+-+.+---------.........',
  '.+-+-++++++++++++++++++...',
  '.+-+-++++++++++++++++++-..',
  '..+++++++++++++++++++++.-.',
  '...++++++++++++++++++++.-.',
  '...+-++++++++++++++++-..+.',
  '...++++-----------+++.....',
  '....++++++......++++++....',
  '....++.++.......++.++.....',
  '....++.++.......++.++.....',
  '....++.++.......++.++.....',
  '....++.++.......++.++.....',
  '...+++.+++.....+++.+++....',
];

// An Apadana column's crown, centred on its 6-block shaft: two bulls back to back with the beam's
// saddle between them, over the scrolls and the bell.
export const CAPITAL = [
  ...mirror(['.+.......', '++-......', '++++.....', '+++++....', '+-+++#...', '.+++###..', '..+######', '..+-#####', '..+.+####', '..++.####']),
  '......######......',
  '......+-##-+......',
  '......+-##-+......',
  '......+-##-+......',
  '......######......',
  '.....+######-.....',
  '......+####-......',
  '......+#-#--......',
];

// The stepped crenellation along the terrace edge and the stair parapets.
export const MERLON = ['..+..', '.+#-.', '+###-'];

// A fire bowl's flame and bowl; persepolis.js stands it on a pole.
export const FIRE = ['...y...', '..yy...', '..yfy..', '.yfffy.', '.fffff.', '+#####-', '.+###-.'];

// The relief on the stair walls: a tribute bearer and a cypress.
export const FIGURE = ['.+.', '.+.', '+++', '+++', '+++', '.+.', '+.+'];
export const CYPRESS = ['.+.', '.+.', '+++', '+++', '+++', '+++', '.-.'];
