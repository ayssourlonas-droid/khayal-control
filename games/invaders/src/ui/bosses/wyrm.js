// World 11, Aurora Kingdom: the Crystal Wyrm. A serpent of translucent ice rising out of the glacier: two
// great loops of its body armoured in ice plates, a crystal in each (the weak points), a frill of ice
// fanned out behind a faceted skull with swept horns and eyes burning frost-white, a crest of crystal
// spikes, and jaws hanging open on a throat of cold light. The body and glacier are in wyrm-body.js,
// -ice.js; the parts in wyrm-head.js, -crest.js (crest and gems), -maw.js, -coil.js; the live extras
// in wyrm-fx.js. Each phase draws more of it: the hover phase lights the frill and the veins and flares
// the crest while the gems burn brighter; the orbit phase sends a blizzard of crystal shards circling
// it (art only: the divers the core sends are the snow owls). Frost curls from the maw throughout.
import { hull, rage } from './wyrm-body.js';
import { head } from './wyrm-head.js';
import { crest, gem } from './wyrm-crest.js';
import { maw } from './wyrm-maw.js';
import { coil } from './wyrm-coil.js';
import { live } from './wyrm-fx.js';

export default {
  pad: 60,
  crack: '#bff4ff',
  margins: { head: 60, crest: 46, maw: 40, gemL: 40, gemR: 40, coilL: 44, coilR: 44 },
  hull,
  parts: { crest, head, maw, gem, coil },
  rage,
  live,
};
