// Everything the Glass Cathedral draws from a sprite it bakes on first use, baked when the level's view is created
// (view.js createView) so that no frame of the fight pays for one: the backdrop's light, glass, doves and bell
// (warm-glass-env.js), the mirror twin and its sheen, the twin's glass bolts, the mending's shards and the glints
// of the mending's stand-up. (The moth's own sprites are bosses/moth*.js, baked by warmBoss.) A poster calls it in an
// idle slice of its own (screens/posters.js), before the slice that draws its one frame.
import { warmGlassEnv } from './warm-glass-env.js';
import { warmTwin } from './ship-glass.js';
import { warmGlassShots } from './shots-glass.js';
import { warmShards, GLASSES } from './shard-sprites.js';
import { glow, star } from './sprites.js';
import { GLASS_WORLD, PRISM } from './glass-kit.js';

export function warmGlass(look) {
  if (look.world !== GLASS_WORLD) return;
  warmGlassEnv(look);
  warmTwin();
  warmGlassShots();
  warmShards();
  for (const c of ['#a47cff', '#ffe9b0', '#ffffff', '#d8f4ff', ...PRISM, ...GLASSES]) glow(c);
  star('#ffffff');
}
