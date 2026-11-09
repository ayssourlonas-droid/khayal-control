// World 18, Anvil Sky: the invaders of a thunderstorm, iron, copper, canvas and lightning (palette: looks/w18.js). A storm hornet
// (amber and black, a wasp-like drone, w18-grunt.js), a lightning dart (silver-white arrow craft with an electric trail,
// w18-dart.js), a thunder turret (a copper-banded capacitor with a Tesla coil, w18-turret.js), an anvil-plated hulk (a riveted
// iron anvil on two jets, w18-anvil.js) and a cargo balloon that carries a prize (w18-balloon.js); what they share (iron, copper,
// rivets, bolts of lightning, grime) is in w18-kit.js. Every arc, eye, vent and flame is on the lights layer, so each body still
// reads with the lights off. Sprites face down, toward the ship. Nothing is painted per frame: every shape is baked once.
import { tidy } from './w18-kit.js';
import { grunt } from './w18-grunt.js';
import { dart } from './w18-dart.js';
import { gunner } from './w18-turret.js';
import { armored } from './w18-anvil.js';
import { carrier } from './w18-balloon.js';

const diver = tidy(dart);
diver.size = 120; // the dart is drawn a little smaller than its canvas, so its trail has the room

export default {
  rate: 2.6, // the arcs and the wings beat a little quicker than most worlds
  bob: 2,
  halo: 0.24,
  crack: '#ffd060', // forge-gold light inside every crack of the anvil
  grunt: tidy(grunt),
  diver,
  gunner: tidy(gunner),
  armored: tidy(armored),
  carrier: tidy(carrier),
};
