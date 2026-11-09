// The Lantern Leviathan's hull (World 15, Lantern Deep; see angler.js): everything the parts stand in front of, from
// the back forward: the tags of skin on the head's edge and the head's skin (angler-body.js), the pale throat, the
// flanks with the fin roots and gill covers (-gills.js), the dark of the mouth and the upper lip with the needles
// hanging from it (-jaw.js), the swollen sockets and the crown's knob on the dome (-face.js), the lower jaw as the
// hull keeps it (the live one, angler-jaw-sprite.js, lies over it) and the barbels, the scatter of photophores and the
// rim light (-lights.js, which also holds the rage layers). Mostly dark on purpose: the light is spent where it
// matters, the throat, the eyes, the belly, the lure.
import { bloom } from './kit.js';
import { PALE, TEAL } from './angler-kit.js';
import { body, bumps, frills } from './angler-body.js';
import { gills } from './angler-gills.js';
import { throat, cavity, lip, jawBase, fangsHull, barbels } from './angler-jaw.js';
import { face } from './angler-face.js';
import { lamps, rim, rage } from './angler-lights.js';

export { rage };

export function hull(b, l) {
  frills(b);
  bumps(b);
  body(b);
  throat(b);
  gills(b, l);
  cavity(b);
  lip(b);
  fangsHull(b, l);
  face(b);
  jawBase(b);
  barbels(b, l);
  lamps(b, l);
  rim(l);
  for (const s of [-1, 1]) bloom(l, s * 150, 4, 52, PALE, 0.07); // the throat's light reaching along the slot
  bloom(l, 0, 118, 84, TEAL, 0.06); // and the belly's, on the pale throat
}
