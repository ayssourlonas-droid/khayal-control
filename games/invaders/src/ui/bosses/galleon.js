// World 13, Sunset Armada: the Thunder Galleon. A dreadnought airship seen from astern, hung in the sunset: a
// deep teak hull plated in riveted brass, a stern gallery of lit windows under a rail with a boarding net,
// stores on the deck, a lit bridge standing over its middle, the mainmast carrying two tiers of patched
// canvas out to either side on yards, propeller pods on bracketed outriggers, a battery of cannon in a gun
// deck low on each flank and, in the belly, the furnace that keeps it up. The hull is galleon-hull.js (the
// deck, rigging and sails galleon-deck.js, -rig.js, -sails.js, -cloth.js; carving and weathering
// galleon-trim.js); the parts in galleon-mast.js, -bridge.js, -prop.js, -gun.js and -keel.js; the live
// extras in galleon-fx.js, -furl.js (the sails) and -fire.js, their sprites in galleon-sprites.js. Each phase
// draws more of it: in the first the sails are full and the furnace banked; the hover phase draws the sails
// up to the yards and sets the furnace roaring, flames pouring from the nozzle and light spilling over the
// plating; the orbit phase wraps it in smoke and sets both gun decks firing (art only: the divers the core
// sends are the gliders of the armada). Cyan, the world's one cool colour, is the weak points: the bridge's
// aether tube and lamps, the cannon bores and their feed, the crystal in the furnace door.
import { hullBody, hullLights, rage } from './galleon-hull.js';
import { prop } from './galleon-prop.js';
import { gun } from './galleon-gun.js';
import { bridge } from './galleon-bridge.js';
import { mast } from './galleon-mast.js';
import { keel } from './galleon-keel.js';
import { rig, yards } from './galleon-rig.js';
import { reefed, warmSails } from './galleon-sails.js';
import { fx } from './galleon-fx.js';
import { fire } from './galleon-fire.js';
import { warm } from './galleon-sprites.js';
import { stores, rail } from './galleon-deck.js';
import { trim } from './galleon-trim.js';

function hull(b, l, S) {
  rig(b);
  reefed(b);
  yards(b);
  stores(b);
  hullBody(b, l, S);
  trim(b);
  rail(b);
  hullLights(l);
}

export default {
  pad: 60,
  margins: { keel: 44 },
  crack: '#ffb54a',
  hull,
  parts: { mast, bridge, prop, gun, keel },
  rage,
  live(ctx, b, t, k, own, since) {
    fx(ctx, b, t, k, own, since);
    fire(ctx, b, t, k, own, since);
  },
  warm() {
    warmSails();
    warm();
  },
};
