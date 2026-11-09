// The Vesper Moth's hull (World 16, Glass Cathedral; see moth.js): everything the parts stand in front of, from the back
// forward: the dawn behind the moth (soft halos of rose and violet round the wings, which show beyond their edges),
// the two hindwings (moth-hind.js, the right one the left mirrored) round the eyespots, the thorax of carved stone fur
// the heart is set in (moth-thorax.js), and the coloured light the forewings throw on the glass and stone under them
// (rose, amber and cobalt patches, as the light of a window falls on a floor). The forewings, head, heart, eyespots and
// abdomen are parts and are painted over it. Boss coordinates; nothing above y -158.
import { bloom } from './kit.js';
import { ROSE, AMBER, COBALT, VIOLET } from './moth-kit.js';
import { hind } from './moth-hind.js';
import { thorax } from './moth-thorax.js';

function dawn(l) {
  for (const s of [-1, 1]) {
    bloom(l, s * 270, -20, 130, VIOLET, 0.16); // behind the forewings: the halo that shows beyond their edges
    bloom(l, s * 190, -30, 110, ROSE, 0.12);
    bloom(l, s * 215, 100, 120, ROSE, 0.1); // and behind the hindwings
    bloom(l, s * 110, 36, 56, AMBER, 0.16); // the forewings' light on what lies under them
    bloom(l, s * 170, 36, 64, ROSE, 0.15);
    bloom(l, s * 235, 34, 66, COBALT, 0.14);
  }
  bloom(l, 0, 10, 140, ROSE, 0.1);
}

export function hull(b, l) {
  dawn(l);
  for (const s of [-1, 1]) {
    for (const g of [b, l]) {
      g.save();
      g.scale(s, 1);
    }
    hind(b, l);
    b.restore();
    l.restore();
  }
  thorax(b, l);
}
