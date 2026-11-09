// Everything Lantern Deep draws from a sprite it bakes on first use, baked when the level's view is created
// (view.js createView) so that no frame of the fight pays for one: the shafts of light, the whale, the school and
// the jellyfish, the caustics, the swaying kelp and reef, the maelstrom's arms and bubbles, the ambient flecks,
// minnows and bubbles, and the two powers (the pearls round the ship, the trident's bolt). A poster calls it in an
// idle slice of its own (screens/posters.js), before the slice that draws its one frame.
import { warmDeepSky } from './flourish-12.js';
import { warmDeepFlourish } from './flourish-13.js';
import { warmDeepAmbient } from './ambient-7.js';
import { warmSway } from './flourish-deep-sway.js';
import { warmMaelstrom } from './flourish-maelstrom.js';
import { warmPearls } from './ship-deep.js';
import { warmTrident } from './shots-deep.js';

export const DEEP_WORLD = 15;

export function warmDeep(look) {
  if (look.world !== DEEP_WORLD) return;
  warmDeepSky();
  warmDeepFlourish();
  warmDeepAmbient(look);
  warmSway();
  warmMaelstrom();
  warmPearls();
  warmTrident();
}
