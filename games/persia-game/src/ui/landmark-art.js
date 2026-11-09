// A level's landmark as a small picture for the title's cards: its own backdrop's layers, baked as the
// level bakes them, over the look's sky, seen as the battle opens (the ship at the centre) and cropped
// to the frame's lower middle. CSS sets its size on the card.
//   landmarkArt(level) -> canvas, baked once per level
import { W, cached } from './sprites.js';
import { paintSky } from './sky.js';
import { buildLayers, drawLayers } from './parallax.js';
import { LOOK } from './looks/index.js';

const CROP = { x: 480, y: 480, w: 960, h: 600 }; // on the pixel grid, so the blocks stay whole

export const landmarkArt = (level) => cached(`landmark:${level.id}`, CROP.w, CROP.h, (g) => {
  g.canvas.className = 'card-art';
  g.translate(-CROP.x, -CROP.y);
  paintSky(g, LOOK);
  drawLayers(g, buildLayers(LOOK, level), W / 2, 0, 1);
});
