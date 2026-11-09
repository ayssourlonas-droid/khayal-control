// The bubble of World 15's maelstrom (flourish-maelstrom.js): one glassy sprite in a few colours, baked once. The
// streams of bubbles in the whirl are this sprite, and so is the bubble a swallowed bullet turns into (bubble-view.js).
import { cached, byColor, glow, rgba } from './sprites.js';
import { TAU } from '../core/math.js';

// A bubble: a glassy ring with a faint fill and a caustic inside, a glint on the lit side and a soft glow round it.
// Its ring is 21 px across in a box of 32, so draw it BUBBLE_SCALE times the width of the bubble you want.
export const BUBBLE_BOX = 32;
export const BUBBLE_SCALE = BUBBLE_BOX / 21;
export const bubble = byColor((color) => cached('deepmael-bubble' + color, BUBBLE_BOX, BUBBLE_BOX, (g) => {
  g.translate(BUBBLE_BOX / 2, BUBBLE_BOX / 2);
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = 0.35;
  g.drawImage(glow(color), -16, -16, 32, 32);
  g.globalAlpha = 1;
  g.beginPath();
  g.arc(0, 0, 10.5, 0, TAU);
  g.fillStyle = rgba(color, 0.1);
  g.fill();
  g.lineWidth = 2.4; // thick, because it is drawn at a third of its size and less
  g.strokeStyle = rgba(color, 0.9);
  g.stroke();
  g.beginPath();
  g.arc(0, 0, 6.5, 0.4 * Math.PI, 1.1 * Math.PI);
  g.lineWidth = 1.3;
  g.strokeStyle = rgba('#ffffff', 0.35);
  g.stroke();
  g.beginPath();
  g.arc(-4, -4, 2.2, 0, TAU);
  g.fillStyle = rgba('#ffffff', 0.95);
  g.fill();
  g.beginPath();
  g.arc(3.5, 4, 0.9, 0, TAU);
  g.fillStyle = rgba(color, 0.9);
  g.fill();
}));
