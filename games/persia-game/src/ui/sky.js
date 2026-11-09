// The sky: the look's gradient plus its baked body (sky-bodies.js), one pixelated 1920 x 1080 canvas.
import { W, H, makeCanvas, lin, pixelate } from './sprites.js';
import { BODIES } from './sky-bodies.js';

// The look's sky gradient over the whole frame, for the battle's sky and the title's cards.
export function paintSky(g, look) {
  g.fillStyle = lin(g, 0, 0, 0, H, look.sky);
  g.fillRect(0, 0, W, H);
}

export function buildSky(look) {
  const c = makeCanvas(W, H);
  const g = c.getContext('2d');
  paintSky(g, look);
  BODIES[look.body](g);
  return pixelate(c);
}
