// The sprites of Sunset Armada's moving things (flourish-9.js draws them), each painted once: a streak of
// water, the rainbow in a great fall's spray, a windmill's sails and a mooring balloon.
import { cached, byColor, lin, rgba } from './sprites.js';
import { TAU } from '../core/math.js';

// One bright streak of water, 6 x 44, brightest in the middle.
export const streak = () => cached('armadaStreak', 6, 44, (g, w, h) => {
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, 'rgba(255,248,230,0)'], [0.5, 'rgba(255,248,230,0.95)'], [1, 'rgba(255,248,230,0)']]);
  g.fillRect(1, 0, w - 2, h);
});

// A rainbow in the spray: five bands of an arc, 150 x 80, faint.
export const rainbow = () => cached('armadaBow', 150, 80, (g) => {
  ['#ff7a8a', '#ffb870', '#fff09a', '#9af0b0', '#8ab8ff'].forEach((c, i) => {
    g.beginPath();
    g.arc(75, 78, 70 - i * 4.4, Math.PI, TAU);
    g.strokeStyle = rgba(c, 0.5);
    g.lineWidth = 4.6;
    g.stroke();
  });
});

// A windmill's sails: four spars with lattice frames, cream canvas on the outer half of each, 200 px across.
export const sails = () => cached('armadaSails', 200, 200, (g) => {
  g.translate(100, 100);
  for (let k = 0; k < 4; k++) {
    g.rotate(Math.PI / 2);
    g.fillStyle = '#2a1a1c';
    g.fillRect(-2, -98, 4, 98);
    g.fillStyle = rgba('#f0d6a8', 0.9);
    g.fillRect(2, -94, 22, 62);
    g.strokeStyle = rgba('#120a30', 0.7);
    g.lineWidth = 1;
    g.strokeRect(2, -94, 22, 62);
    g.beginPath();
    for (let y = -94; y < -32; y += 8) {
      g.moveTo(2, y);
      g.lineTo(24, y);
    }
    g.moveTo(13, -94);
    g.lineTo(13, -32);
    g.stroke();
    g.fillStyle = rgba('#ffc86a', 0.5); // the sun through the canvas
    g.fillRect(2, -94, 4, 62);
  }
  g.fillStyle = '#c8902a';
  g.beginPath();
  g.arc(0, 0, 6, 0, TAU);
  g.fill();
});

// A mooring balloon, 80 x 118: a stitched envelope shading from rose to violet with a gold rim on the sunward
// side, a net over it, two stripes, a little basket under it, ready to carry a lantern.
export const balloonSprite = byColor((k) => cached('moor' + k, 80, 118, (g) => {
  g.beginPath();
  g.ellipse(40, 40, 28, 36, 0, 0, TAU);
  g.fillStyle = lin(g, 12, 20, 68, 70, [[0, '#ffd8b0'], [0.45, k ? '#e090a0' : '#f0b098'], [1, '#6a4a92']]);
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = rgba('#120a30', 0.3);
  g.lineWidth = 1;
  for (let i = -3; i <= 3; i++) {
    g.beginPath();
    g.moveTo(40, 4);
    g.quadraticCurveTo(40 + i * 16, 40, 40, 76);
    g.stroke();
  }
  g.fillStyle = rgba(k ? '#fff0c8' : '#c8664a', 0.55);
  g.fillRect(0, 30, 80, 6);
  g.fillRect(0, 48, 80, 4);
  g.restore();
  g.beginPath();
  g.ellipse(40, 40, 28, 36, 0, 0, TAU);
  g.strokeStyle = rgba('#120a30', 0.85);
  g.lineWidth = 1.6;
  g.stroke();
  g.beginPath();
  g.ellipse(40, 40, 28, 36, 0, 3.7, 5.2);
  g.strokeStyle = rgba('#ffd890', 0.95);
  g.lineWidth = 2.4;
  g.stroke();
  g.strokeStyle = rgba('#120a30', 0.8);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(24, 70);
  g.lineTo(34, 94);
  g.moveTo(56, 70);
  g.lineTo(46, 94);
  g.stroke();
  g.fillStyle = '#2a1a1c';
  g.fillRect(32, 94, 16, 11);
  g.fillStyle = rgba('#c8902a', 0.9);
  g.fillRect(32, 94, 16, 2);
}));
