// World 15, Lantern Deep: the Lantern Leviathan, a colossal anglerfish of the lightless deep, seen from the front and
// a little above, its great mouth gaping. A heavy, lumpy head of mottled blue-black skin, warty, naked and wet, with
// photophores scattered over it; two big milky eyes in swollen rings of flesh; an underslung jaw that juts out under
// the mouth, its long glassy needles, uneven and unlike each other, reaching up past the upper lip while the upper
// ones hang from it; a dark gullet with the throat burning far back; ragged dorsal spines on the crest; gill covers
// with their slits; big translucent ribbed pectoral fins; a pale pouch of a throat hung with lamps; and over the
// forehead the stalk that is the beast's signature: it grows from a knob on the crown, arches forward and down, and
// dangles a big glowing lure between the eyes.
// The hull is angler-hull.js (the skin -body.js and -skin.js, the flanks -gills.js, the mouth -jaw.js and the jaw as
// the hull keeps it, -face.js, the lamps and the rage layers -lights.js; the shared geometry and colours are
// angler-kit.js); the parts are angler-crest.js, angler-maw.js (with the upper teeth of angler-teeth.js) and, painted
// as the left ones and mirrored for the right, angler-fin.js (geometry -fin-rays.js) and angler-eye.js, with
// angler-belly.js (the row of lights). The live extras are angler-fx.js: the lower jaw (angler-jaw-sprite.js; it hangs
// open from the hover phase), the lure (angler-lure.js, its sprites -sprites.js and -sprites-2.js), the fins' ripple
// (angler-ripple.js) and the glints and chases. Each phase lights more of it: the hover phase opens the jaw, lights the
// teeth and heats the throat, the orbit phase burns every lamp, wraps the head in violet and teal currents and flares
// the lure (the rage layers; art only: the divers the core sends launch from the fins). The pale cyan of the weak
// points is the throat, the eyes and the belly's lights; everything else is dark, so that they and the lure read at once.
import { hull, rage } from './angler-hull.js';
import { crest } from './angler-crest.js';
import { maw } from './angler-maw.js';
import { fin } from './angler-fin.js';
import { eye } from './angler-eye.js';
import { belly } from './angler-belly.js';
import { fx, warm } from './angler-fx.js';

export default {
  pad: 60,
  crack: '#bff4ff',
  hull,
  parts: { crest, maw, fin, eye, belly },
  margins: { maw: 44, crest: 40, finL: 64, finR: 64 },
  rage,
  live: fx,
  warm,
};
