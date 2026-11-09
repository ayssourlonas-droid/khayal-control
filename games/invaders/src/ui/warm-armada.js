// Everything Sunset Armada draws from a sprite it bakes on first use, baked when the level's view is created
// (view.js createView) so that no frame of the fight pays for one: the far ship and the shafts of light, the
// water, the sails and the balloons, the escorts, the cannon ball, the gulls and the wisps. A poster, which
// draws one frame, does not call it.
import { warmSky } from './flourish-8.js';
import { warmMotion } from './flourish-9.js';
import { warmAmbient } from './ambient-5.js';
import { warmShip } from './ship-armada.js';
import { warmBalls } from './shots-armada.js';

export function warmArmada(look) {
  if (look.world !== 13) return;
  warmSky();
  warmMotion();
  warmAmbient(look);
  warmShip(look);
  warmBalls();
}
