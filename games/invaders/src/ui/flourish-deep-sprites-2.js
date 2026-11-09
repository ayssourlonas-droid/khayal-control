// The sprites of Lantern Deep's mid-water flourishes (flourish-13.js draws them), each painted once: a small
// fish of the school, in dim blue and in flashing silver; and a jellyfish in five frames of its pulse, in violet
// and in teal, its bell a veil of light with a bright rim, canals and a glow in the middle, frilly
// oral arms under it and long thin tentacles trailing away to nothing. The whale and the shafts are in
// flourish-deep-sprites.js, the caustics in flourish-deep-sprites-3.js.
import { cached, lin, rad, rgba, shade, hash } from './sprites.js';
import { TAU } from '../core/math.js';

export const FISH = { w: 24, h: 12 };

// A fish facing right, 24 x 12: a forked tail, a body shading from a dark back to a pale belly, a pale stripe
// along the flank and a dark eye. `silver` is the flash a school gives when it turns.
export const fishSprite = (silver) => cached('deepfxFish' + (silver ? 'Silver' : 'Blue'), FISH.w, FISH.h, (g) => {
  const [back, belly, stripe] = silver ? ['#9cc4dc', '#f2fbff', '#ffffff'] : ['#3f7fa6', '#9ad0e8', '#d8f4ff'];
  g.fillStyle = back;
  g.beginPath();
  g.moveTo(6, 6);
  g.lineTo(0.5, 1.8);
  g.lineTo(2.4, 6);
  g.lineTo(0.5, 10.2);
  g.closePath();
  g.fill();
  g.fillStyle = lin(g, 0, 2.4, 0, 9.6, [[0, back], [1, belly]]);
  g.beginPath();
  g.ellipse(14, 6, 9, 3.6, 0, 0, TAU);
  g.fill();
  g.strokeStyle = rgba(stripe, 0.85);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(9, 6.3);
  g.lineTo(20, 6.3);
  g.stroke();
  g.fillStyle = '#06121c';
  g.fillRect(19.6, 4.6, 1.2, 1.2);
});

export const JELLY = { w: 128, h: 256, bx: 64, by: 26 }; // the box, and where the bell's apex hangs in it
export const JELLY_COLORS = ['#b27cff', '#3de8d0'];
export const PULSE_FRAMES = 5;
const SHAPES = [[38, 26], [33, 29], [27, 34], [32, 30], [41, 24]]; // [half width, height] of the bell: relaxed, closing, shut, opening, flared

// A ribbon hanging from (x0, y0) for `len` px, swinging from side to side by `amp` more the farther down it goes.
function hang(g, x0, y0, len, amp, phase) {
  g.beginPath();
  g.moveTo(x0, y0);
  for (let y = 8; y <= len; y += 8) g.lineTo(x0 + Math.sin(y * 0.045 + phase) * (2 + y * amp), y0 + y);
  g.stroke();
}

function paintJelly(g, color, f) {
  const { bx, by } = JELLY;
  const [rx, ry] = SHAPES[f];
  const rim = by + ry;
  const pale = shade(color, 0.55);
  g.lineJoin = 'round';
  g.lineWidth = 1.1;
  g.strokeStyle = lin(g, 0, rim, 0, rim + 190, [[0, rgba(color, 0.6)], [1, rgba(color, 0)]]); // the tentacles
  for (let i = 0; i < 9; i++) hang(g, bx + (i - 4) * rx * 0.2, rim - 2, 150 + 40 * hash(i + 810), 0.075, i * 1.3 - f * 1.25);
  g.lineWidth = 3; // the oral arms, thicker and frillier
  g.strokeStyle = lin(g, 0, rim, 0, rim + 80, [[0, rgba(pale, 0.65)], [1, rgba(color, 0)]]);
  for (let i = 0; i < 4; i++) hang(g, bx + (i - 1.5) * 9, rim - 2, 80, 0.06, i * 2 - f * 1.6 + 0.8);
  g.beginPath(); // the bell: a dome with a scalloped edge
  g.ellipse(bx, rim, rx, ry, 0, Math.PI, TAU);
  for (let j = 0; j < 7; j++) g.quadraticCurveTo(bx + rx - ((j + 0.5) * 2 * rx) / 7, rim + 8, bx + rx - ((j + 1) * 2 * rx) / 7, rim);
  g.closePath();
  g.fillStyle = rad(g, bx, rim - ry * 0.2, 0, rx * 1.15, [[0, rgba(color, 0.08)], [0.6, rgba(color, 0.26)], [1, rgba(pale, 0.55)]]);
  g.fill();
  g.strokeStyle = rgba(pale, 0.75);
  g.lineWidth = 1.3;
  g.stroke();
  g.strokeStyle = rgba(pale, 0.24); // canals from the apex to the edge
  g.lineWidth = 1;
  for (let k = -3; k <= 3; k++) {
    g.beginPath();
    g.moveTo(bx, by + 1);
    g.quadraticCurveTo(bx + k * rx * 0.42, by + ry * 0.4, bx + k * rx * 0.3, rim);
    g.stroke();
  }
  g.fillStyle = rad(g, bx, rim - ry * 0.5, 0, rx * 0.4, [[0, rgba(pale, 0.55)], [1, rgba(color, 0)]]); // a soft glow in the middle of the bell
  g.beginPath();
  g.ellipse(bx, rim - ry * 0.5, rx * 0.4, ry * 0.32, 0, 0, TAU);
  g.fill();
}

export const jellyFrame = (colorIndex, f) => cached(`deepfxJelly${colorIndex}.${f}`, JELLY.w, JELLY.h, (g) => paintJelly(g, JELLY_COLORS[colorIndex], f));
