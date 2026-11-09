// Everything Glass Cathedral's backdrop draws from a sprite it bakes on first use is baked here, once, when the level's view is
// created (warm-glass.js calls it, which createView and posters.js call): the shafts of coloured light, the patches on the
// floor and the rose window's fan, the glass doves in their four frames, the bell, the chandelier and the glows of its
// flames, the ambient motes, shards and sparks, and the low mist's soft bank. It only bakes, never draws, and is idempotent: every sprite is cached, so a
// second call (a second level, a poster) costs nothing.
import { soft } from './sprites.js';
import { warmLight } from './flourish-glass-sprites.js';
import { warmMoving } from './flourish-glass-2.js';
import { warmGlassAmbient } from './ambient-8.js';

export function warmGlassEnv(look) {
  warmLight();
  warmMoving();
  if (look?.ambient) warmGlassAmbient(look);
  if (look?.mist) soft(look.mist);
}
