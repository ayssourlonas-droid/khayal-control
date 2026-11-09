// The pickup capsule's rim in the Glass Cathedral (pickup-skins.js FRAMES[16]): a gothic quatrefoil of gold tracery
// round the dark middle, four lobes at the compass points each set with a jewel of glass in the power's colour (a
// bright heart, a shaded rim, a lead line round it and a glint), a pointed gold finial between each pair of lobes
// with a bead on its tip, a slim gold ring inside the lobes and a thread of the power's colour inside that, so the
// capsule still reads in the power's tint. Also the mirror power's icon (ICONS16: a ship and its glass reflection
// with the mirror's edge between them; plain paths, which the HUD's power ring draws every frame too).
import { INK, rgba, shade, rad, lin } from './sprites.js';
import { TAU } from '../core/math.js';

const [LOBE_AT, LOBE_R] = [18.6, 9.4]; // how far out a lobe's centre sits, and its radius
const GOLD = '#e8b84a';
const GOLD_DARK = '#7a5418';

// One lobe of the tracery at angle `a`: the gold setting, the jewel in it.
function lobe(g, a, color) {
  const [x, y] = [Math.cos(a) * LOBE_AT, Math.sin(a) * LOBE_AT];
  g.beginPath();
  g.arc(x, y, LOBE_R, 0, TAU);
  g.fillStyle = lin(g, x - 7, y - 8, x + 7, y + 8, [[0, '#fff0b8'], [0.45, GOLD], [1, GOLD_DARK]]);
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath();
  g.arc(x, y, 6.6, 0, TAU);
  g.fillStyle = rad(g, x, y, 0.5, 7, [[0, shade(color, 0.7)], [0.45, color], [1, shade(color, -0.55)]], x - 2, y - 2.4);
  g.fill();
  g.lineWidth = 1.2;
  g.strokeStyle = rgba(INK, 0.9);
  g.stroke();
  g.lineWidth = 0.7; // a facet cut across the glass
  g.strokeStyle = rgba('#ffffff', 0.5);
  g.beginPath();
  g.moveTo(x - 4.2, y + 2);
  g.lineTo(x + 4.2, y - 2);
  g.stroke();
  g.fillStyle = rgba('#ffffff', 0.95);
  g.beginPath();
  g.ellipse(x - 2.2, y - 2.6, 1.7, 1, -0.6, 0, TAU);
  g.fill();
}

// A pointed finial between two lobes at angle `a`: a gold kite with a bead on its tip.
function finial(g, a) {
  g.save();
  g.rotate(a + Math.PI / 2);
  g.beginPath();
  g.moveTo(0, -27.4);
  g.lineTo(3.2, -21.4);
  g.lineTo(0, -16.8);
  g.lineTo(-3.2, -21.4);
  g.closePath();
  g.fillStyle = lin(g, -3, -26, 3, -20, [[0, '#fff0b8'], [1, GOLD_DARK]]);
  g.fill();
  g.lineWidth = 1.2;
  g.lineJoin = 'round';
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath();
  g.arc(0, -27.6, 1.6, 0, TAU);
  g.fillStyle = '#fff6d0';
  g.fill();
  g.stroke();
  g.restore();
}

export function quatrefoil(g, color) {
  g.save();
  for (let k = 0; k < 4; k++) finial(g, (k * TAU) / 4 + TAU / 8 - Math.PI / 2);
  for (let k = 0; k < 4; k++) lobe(g, (k * TAU) / 4 - Math.PI / 2, color);
  g.fillStyle = 'rgba(8,10,20,0.94)'; // the dark middle, over the inner halves of the lobes
  g.beginPath();
  g.arc(0, 0, 18.6, 0, TAU);
  g.fill();
  g.lineWidth = 3;
  g.strokeStyle = INK;
  g.stroke();
  g.lineWidth = 1.5;
  g.strokeStyle = GOLD;
  g.stroke();
  g.lineWidth = 1.3; // the thread of the power's colour inside the gold
  g.strokeStyle = rgba(color, 0.9);
  g.beginPath();
  g.arc(0, 0, 16.6, 0, TAU);
  g.stroke();
  g.restore();
}

// A little fighter, nose up, about 16 px tall, centred on (x, y).
function fighter(g, x, y) {
  g.moveTo(x, y - 8);
  g.lineTo(x + 2.4, y - 2);
  g.lineTo(x + 8, y + 5);
  g.lineTo(x + 2.2, y + 4);
  g.lineTo(x + 1.6, y + 8);
  g.lineTo(x - 1.6, y + 8);
  g.lineTo(x - 2.2, y + 4);
  g.lineTo(x - 8, y + 5);
  g.lineTo(x - 2.4, y - 2);
  g.closePath();
}

export const ICONS16 = {
  // The ship, solid, on the left; its reflection, drawn in outline, on the right; between them the mirror's edge,
  // a dashed line with a spark of light on it.
  mirror(g, color) {
    g.save();
    g.fillStyle = color;
    g.beginPath();
    fighter(g, -10, 1);
    g.fill();
    g.lineWidth = 1.7;
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.strokeStyle = color;
    g.globalAlpha = 0.85;
    g.beginPath();
    fighter(g, 10, 1);
    g.stroke();
    g.globalAlpha = 1;
    g.lineWidth = 1.5;
    g.setLineDash([2.6, 2.6]);
    g.beginPath();
    g.moveTo(0, -13);
    g.lineTo(0, 13);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(0, -4);
    g.lineTo(2, 0);
    g.lineTo(0, 4);
    g.lineTo(-2, 0);
    g.closePath();
    g.fill();
    g.restore();
  },
};
