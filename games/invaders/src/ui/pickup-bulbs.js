// The pickup capsule's rim in Ember Carnival (pickup-skins.js FRAMES[14]): a marquee sign's ring of bulbs round
// the dark middle. A brass ring ringed in ink, and sixteen bulbs set on it, alternately in the power's colour and
// warm white, each in a dark socket with a bright glass and a glint, so the capsule looks lit from within.
import { INK, rgba, shade, rad } from './sprites.js';
import { TAU } from '../core/math.js';

const BRASS = '#e8b84a';
const BULBS = 16;
const [RING, BULB_R] = [23.5, 3.7];

// One bulb at (x, y): an ink socket, a glass shading from white-hot in the middle to its colour at the edge, a glint.
function bulb(g, x, y, color) {
  g.beginPath();
  g.arc(x, y, BULB_R + 1.3, 0, TAU);
  g.fillStyle = INK;
  g.fill();
  g.beginPath();
  g.arc(x, y, BULB_R, 0, TAU);
  g.fillStyle = rad(g, x, y, 0.4, BULB_R, [[0, '#ffffff'], [0.5, shade(color, 0.3)], [1, color]], x - 1, y - 1);
  g.fill();
  g.beginPath();
  g.arc(x - 1.2, y - 1.3, 0.9, 0, TAU);
  g.fillStyle = rgba('#ffffff', 0.9);
  g.fill();
}

export function bulbs(g, color) {
  g.fillStyle = 'rgba(8,10,20,0.88)';
  g.beginPath();
  g.arc(0, 0, 21, 0, TAU);
  g.fill();
  for (const [w, c] of [[6.4, INK], [4, BRASS], [1.2, rgba('#fff0b8', 0.8)]]) { // the ring the bulbs sit on
    g.lineWidth = w;
    g.strokeStyle = c;
    g.beginPath();
    g.arc(0, 0, RING - 1.4 + (w === 1.2 ? 0.8 : 0), 0, TAU);
    g.stroke();
  }
  for (let i = 0; i < BULBS; i++) {
    const a = (i * TAU) / BULBS - Math.PI / 2;
    bulb(g, Math.cos(a) * RING, Math.sin(a) * RING, i % 2 ? '#ffe9a0' : color);
  }
}
