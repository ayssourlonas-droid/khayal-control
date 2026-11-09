// The Squall Ray (World 18, Anvil Sky): a colossal manta of thundercloud gliding head first down the storm, lit from within, armoured in iron and
// armed with lightning, the boss of the first world where the ship flies free. Seen from above (ray-shape.js): two broad wings of deep indigo cloud swept
// back to pointed tips, their trailing edges sagging in an S and their leading edges bulging toward the player, a torso between them, a head with a pair of
// rolled paddles (the manta's cephalic lobes) projecting forward either side of a wide flat mouth, small eyes on the flanks of the head, a whip of a tail curling
// out from behind the anvil, and under the wings pouches of cloud with rain hanging from them. The hull is the cloud (ray-mass.js, painted the way the
// storm's own towers are, parallax-storm-field.js, but darker, bluer and crisper than they are; ray-seat.js for the cloud where the parts meet it; ray-hull.js,
// with ray-glow.js for the cloud's dark halo and for it lit from within: a rim of cold light all the way round it, pockets of violet and cyan; ray-vein.js for
// veins of lightning and rain; ray-tip.js for the lit points of the wing tips, ray-eye.js for the eyes). The armour is iron (ray-iron.js: riveted plates in the
// world's own blue-grey): ray-spine.js (an anvil on a plinth, the crown of its back) and ray-wing.js (a row of overlapping curved lames, ray-lame.js, from a bolted
// pauldron at the shoulder to the tip, over each wing, painted as the left one and mirrored). The weak points are what is lit, in the ray's own colours, electric
// violet and cyan: ray-heart.js (a rift torn in its back, stapled with iron, with the storm heart in it, an orb ringed by rings that pulse), ray-maw.js (the
// mouth: a flat slot between two iron jaw plates, a hollow lit cyan) and ray-coil.js (a Tesla coil of wound copper with a big toroid at its free end hung under
// each wing tip, painted as the left one and mirrored, ray-coil-lit.js its light). Every bolt is ray-bolt.js. The rage layers are ray-rage.js: the hover
// phase makes the heart and the coils blaze, the orbit phase sends lightning crawling over the whole body. The live extras are ray-fx.js (arcs between the
// coils and the wing tips, the heart's beat, bolts through the cloud, wisps; the baked bolts are ray-fx-bolts.js). The colours and the part rects are ray-kit.js.
// Nothing is drawn above y -158, the HUD's edge.
import { hull } from './ray-hull.js';
import { spine } from './ray-spine.js';
import { heart } from './ray-heart.js';
import { wing } from './ray-wing.js';
import { coil } from './ray-coil.js';
import { maw } from './ray-maw.js';
import { rage } from './ray-rage.js';
import { fx, warm } from './ray-fx.js';

export default {
  pad: 80, // the wing tips, their halo and the arcs reach to x 500: a wider canvas than the other bosses' so that no glow is cut off at its edge
  padY: 130, // the head's lobes, their billows and their shadow reach y 265: at 80 the canvas ended at 230 and cut them in a faint flat line
  crack: '#c8f6ff', // the hot core of a fissure: white-cyan, the colour of the lightning (a warm yellow turned olive on the dark iron at low alpha)
  hull,
  parts: { spine, heart, wing, coil, maw },
  rage,
  margins: { spine: 36, heart: 40, wingL: 80, wingR: 80, coilL: 50, coilR: 50, maw: 48 },
  live: fx,
  warm,
};
