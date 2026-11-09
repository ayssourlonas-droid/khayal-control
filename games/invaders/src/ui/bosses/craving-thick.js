// The Craving's second, fatter layer of smoke (World 17, Ash to Air; craving-fx.js fades it in over the body in the hover phase, when
// the smoke thickens and the giant rears): big lit billows heaped on the outline of the figure, on the hood's flanks, over
// the shoulders and the arms, so that the whole mass swells wherever the first layer was thin. Painted, like the body, at THICK_POSES
// poses of the churn (k / THICK_POSES, wrapping), into canvases of the body's box, and cut away over the ashtray's mouth the same way.
import { makeCanvas } from '../sprites.js';
import { lay } from './craving-puff.js';
import { FB, cutMouth, edges } from './craving-paint.js';
import { TOP } from './craving-figure.js';

export const THICK_POSES = 4;
// [x, y, size], top down; the cool ones above y -10 are the lay's own choice. The notch between the head's dome and the hands stays open.
const FAT = [
  [-60, -100, 144], [60, -100, 144], [-130, -74, 144], [130, -74, 144], [-270, -50, 200], [270, -50, 200], [-120, -6, 200], [120, -6, 200],
  [-280, 10, 200], [280, 10, 200], [-210, 30, 280], [210, 30, 280], [0, 20, 200], [-250, 66, 200], [250, 66, 200],
];
const frames = [];

export function paintThick(g, pose) {
  g.save();
  g.translate(-FB.x, -FB.y);
  g.beginPath();
  g.rect(FB.x, TOP, FB.w, FB.y + FB.h - TOP);
  g.clip();
  FAT.forEach(([x, y, size], i) => lay(g, y < -10 ? 'cool' : 'billow', x, y, size, i, 70, pose, 13, TOP));
  g.restore();
  g.save();
  g.translate(-FB.x, -FB.y);
  cutMouth(g);
  edges(g);
  g.restore();
}

export function thickFrame(k) {
  if (!frames[k]) {
    const c = makeCanvas(FB.w, FB.h);
    paintThick(c.getContext('2d'), k / THICK_POSES);
    frames[k] = c;
  }
  return frames[k];
}

export function warmThick() {
  for (let k = 0; k < THICK_POSES; k++) thickFrame(k);
}
