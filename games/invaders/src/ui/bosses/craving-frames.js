// The frames of the Craving's churn (World 17, Ash to Air; craving-fx.js draws them under the parts, craving-hull.js gives the
// hull the same smoke): the whole smoke figure and its spill over the rim (craving-paint.js) painted at POSES poses of the churn,
// k / POSES for frame k, so that the pose wraps (frame POSES is frame 0). The hull gets the figure alone (bodyOn: it lies behind
// the throne's rim) at pose 0 on a scratch canvas.
import { makeCanvas } from '../sprites.js';
import { paintBody, FB } from './craving-paint.js';

export const POSES = 8;
const frames = [];
let scratch = null;

function paint(c, pose, layer = 'all') {
  const g = c.getContext('2d');
  g.clearRect(0, 0, FB.w, FB.h);
  paintBody(g, pose, layer);
  return c;
}

// The figure at `pose`, drawn onto g (the hull's frozen frame; the scratch canvas is kept for the next call).
export function bodyOn(g, pose = 0) {
  g.drawImage(paint((scratch ??= makeCanvas(FB.w, FB.h)), pose, 'body'), FB.x, FB.y);
}

export const frame = (k) => (frames[k] ??= paint(makeCanvas(FB.w, FB.h), k / POSES));

export function warmFrames() {
  for (let k = 0; k < POSES; k++) frame(k);
}
