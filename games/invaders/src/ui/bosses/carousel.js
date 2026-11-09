// World 14, Ember Carnival: the Grand Carousel. A flying fairground carousel, all gilt and mirrors, seen from a
// little above: a striped canopy of twenty-four gores that turns, its valance and a rim of marquee bulbs that
// chase round it, a gilt cupola with a pennant on top, a bowl of plum and gilt under the floor with a turning
// drum in it, and between them a band organ with its pipes, a sunburst medallion, drum and cymbal at its
// heart. A carved horse on a brass pole stands out on each flank, and a lantern burning cyan hangs low at each
// side. The hull is carousel-hull.js (the canopy carousel-canopy.js, its valance -valance.js, the floor and
// bowl -floor.js, the hollow and column -column.js); the parts are in carousel-crown.js, -organ.js (and
// -organ-front.js), -pole.js (the horse is -horse.js), -lamp.js and -drum.js; the live extras are
// carousel-fx.js with their sprites in carousel-sprites.js. Each phase lights more of it: in the first the
// canopy turns slowly and the bulbs run; the hover phase turns it faster, the pipes breathe steam and the
// bulbs run twice as fast; the orbit phase wraps it all in colour and runs the lights flat out (art only: the
// divers the core sends are the toys of the carnival). Cyan, the world's one cool colour, is the weak points:
// the organ's pipe mouths, keys and lens, the lanterns' flames, the drum's core.
import { hull, rage } from './carousel-hull.js';
import { crown } from './carousel-crown.js';
import { horse } from './carousel-pole.js';
import { organ } from './carousel-organ.js';
import { lamp } from './carousel-lamp.js';
import { drum } from './carousel-drum.js';
import { fx } from './carousel-fx.js';
import { warm } from './carousel-sprites.js';

export default {
  pad: 60,
  crack: '#ffb54a',
  hull,
  parts: { crown, organ, horse, lamp, drum },
  rage,
  live: fx,
  warm,
};
