// Everything Anvil Sky draws from a sprite it bakes on first use that is not the backdrop's, baked when the level's view is created
// (view.js createView) so no frame of the fight pays for one: the broadside's arc bolts and their glows (shots-storm.js) and the
// dragged bullets' orb, ring and light (bullets-dragged.js). (The aliens are baked by warmAliens; the backdrop's own sprites by
// its own files.) A poster, which draws one frame, does not call it.
import { STORM_WORLD } from './storm-bolt.js';
import { warmStormShots } from './shots-storm.js';
import { warmDragged } from './bullets-dragged.js';

export function warmStorm(look) {
  if (look.world !== STORM_WORLD) return;
  warmStormShots(look);
  warmDragged(look);
}
