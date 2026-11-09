// World 16, Glass Cathedral: the invaders are made of glass, lead and stone, lit by dawn through coloured
// windows. A stained-glass beetle is here, the first of them (rose): its shell a tiny rose window of jewel
// panes in lead cames (w16-rose.js), with lavender wing-cases, lead legs, a stone head with glass eyes and
// swaying antennae (w16-bug.js). The glass swallow (cobalt) is in w16-2.js, the candle wisp in its gothic
// lantern (amber) in w16-3.js, the stone gargoyle with stained-glass wings (violet) in w16-4.js and the
// gilded reliquary on glass wings (gilt) in w16-5.js; what they share is in w16-kit.js. Whatever shines
// through glass, every jewel and every eye is on the lights layer. Sprites face down, toward the ship.
import { tidy } from './w16-kit.js';
import { rose } from './w16-rose.js';
import { cases, legs, head, antennae } from './w16-bug.js';
import { diver } from './w16-2.js';
import { gunner } from './w16-3.js';
import { armored } from './w16-4.js';
import { carrier } from './w16-5.js';

// A stained-glass beetle: wing-cases and legs behind, then the head, the antennae and the rose-window shell.
function grunt(b, l, f, c) {
  cases(b, l, f);
  legs(b, f);
  antennae(b, l, f);
  head(b, l, f);
  rose(b, l, f, c);
}

export default {
  rate: 2.4, // a touch quicker than most: the wings beat
  bob: 2.5,
  halo: 0.24,
  crack: '#ffe6a8',
  grunt: tidy(grunt),
  diver: tidy(diver),
  gunner: tidy(gunner),
  armored: tidy(armored),
  carrier: tidy(carrier),
};
