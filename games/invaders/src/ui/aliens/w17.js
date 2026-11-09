// World 17, Ash to Air: the invaders are the habit itself, painted grimy and menacing. A lit cigarette (ember orange, w17-grunt.js),
// a flicked butt tumbling with a comet of smoke (pale amber, w17-butt.js), a tobacco pipe that puffs (brown-amber,
// w17-pipe.js), a fat armoured cigar (cigar brown, w17-cigar.js) and a plain cardboard pack that carries a pickup (cream,
// w17-pack.js); what they share (paper, cork, ash, char, coal, eyes, smoke) is in w17-kit.js. Every coal, eye and ember is on
// the lights layer. Nothing is printed, branded or lettered. Sprites face down, toward the ship.
import { tidy } from './w17-kit.js';
import { grunt } from './w17-grunt.js';
import { diver } from './w17-butt.js';
import { gunner } from './w17-pipe.js';
import { armored } from './w17-cigar.js';
import { carrier } from './w17-pack.js';

export default {
  rate: 2.2, // the embers flicker a touch quicker than most worlds
  bob: 2,
  halo: 0.26,
  crack: '#ffb060', // an ember glows inside every crack
  grunt: tidy(grunt),
  diver: tidy(diver),
  gunner: tidy(gunner),
  armored: tidy(armored),
  carrier: tidy(carrier),
};
