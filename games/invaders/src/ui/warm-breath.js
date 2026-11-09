// Everything world 17 draws from a sprite it bakes on first use, baked when the level's view is created (view.js createView) so no
// frame of the fight pays for one: the backdrop's (ambient-9.js, flourish-smog-ground.js, flourish-smog-sky.js) and the breath's craft
// and band (breath-sprites.js). The aliens and the Craving are baked by warmAliens and warmBoss. A poster calls it in an idle slice of
// its own (screens/posters.js).
import { HEAL_WORLD } from './heal.js';
import { warmSmogAmbient } from './ambient-9.js';
import { warmGroundFx } from './flourish-smog-ground.js';
import { warmSkyFx } from './flourish-smog-sky.js';
import { warmBreathFx } from './breath-sprites.js';

export function warmBreath(look) {
  if (look.world !== HEAL_WORLD) return;
  warmSmogAmbient(look);
  warmGroundFx();
  warmSkyFx();
  warmBreathFx();
}
