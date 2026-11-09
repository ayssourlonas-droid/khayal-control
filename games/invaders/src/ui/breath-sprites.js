// Every sprite the breath draws (world 17), baked once and handed out as one kit so the per-frame code never builds a cache
// key: the leaves (breath-leaf.js), the craft's two frames of body and light (breath-craft.js), the band of air, its edge
// light, the wind streaks and the wake's veil (breath-air.js, breath-flow.js) and the twinkles. breathKit() bakes on first
// use and returns the same object after; warmBreathFx() is the same call made ahead of the fight (warm-breath.js, when the
// level's view is created), plus the glows the wiped bullets' sparkles and the start's bloom are drawn with (fx-view.js).
import { glow } from './sprites.js';
import { bakeLeaves } from './breath-leaf.js';
import { craftBody, craftLights } from './breath-craft.js';
import { airTile, lightTile, twinkle } from './breath-air.js';
import { flowTile, wakeSprite } from './breath-flow.js';

let KIT = null;

export const BREATH_GLOWS = ['#e8fff4', '#ffffff', '#d6f4ff', '#9ff2d4']; // the flashes of fx/react-breath.js: a wiped bullet's three whites and the launch's mint

export function breathKit() {
  if (KIT) return KIT;
  KIT = {
    leaves: bakeLeaves(), twinkles: [twinkle(false), twinkle(true)], body: [craftBody(0), craftBody(1)], lights: [craftLights(0), craftLights(1)],
    air: airTile(), light: lightTile(), flow: flowTile(), wake: wakeSprite(),
  };
  return KIT;
}

export function warmBreathFx() {
  breathKit();
  for (const c of BREATH_GLOWS) glow(c);
}
