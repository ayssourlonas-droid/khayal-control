// Everything Ember Carnival draws from a sprite it bakes on first use, baked when the level's view is created
// (view.js createView) so that no frame of the fight pays for one: the bursts of the firework shows, the
// bulbs and the searchlights' beams, the wheel, its gondolas, the coaster's cars and the party balloons, the
// confetti and the lanterns, the smoke wisps, then the shells' fuses (shell-view.js) and the burst of a shell
// going off (burst-view.js). A poster, which draws one frame, does not call it.
import { warmBlooms } from './flourish-carnival-sprites.js';
import { warmMotion } from './flourish-11.js';
import { warmConfetti } from './ambient-6.js';
import { warmAmbient } from './ambient-5.js';
import { warmShells } from './shell-view.js';
import { warmBurst } from './burst-view.js';

export const CARNIVAL_WORLD = 14;

export function warmCarnival(look) {
  if (look.world !== CARNIVAL_WORLD) return;
  warmBlooms();
  warmMotion();
  warmConfetti(look);
  warmAmbient(look);
  warmShells(look);
  warmBurst();
}
