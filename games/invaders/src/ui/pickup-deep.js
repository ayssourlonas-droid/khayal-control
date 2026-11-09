// The pickup capsule's rim in Lantern Deep (pickup-skins.js FRAMES[15]): a ring of scallop shells round the dark
// middle, eight of them, long and short by turns, each a ribbed fan with a scalloped lip, tinted by the power's
// colour (dark at the hinge, bright along the lip, ribbed in ink and in light); a pearl sits in the gap between
// each pair, and a thin ring of silver pearl runs inside the hinges. Also the pickup icons of the deep's two powers
// (ICONS15: the pearls and the trident, plain paths, which the HUD's power ring draws every frame too).
import { INK, rgba, shade, rad } from './sprites.js';
import { TAU } from '../core/math.js';

const SHELLS = 8;
const [LONG, SHORT] = [11, 8.6]; // px: a shell's length from its hinge to the lip, long and short
const HINGE = 17.2; // radius the hinges sit at
const [PEARL_AT, PEARL_R] = [23.6, 2.5]; // the pearl between each pair
const [LOBES, HALF] = [5, 0.84]; // a shell's lobes along the lip, and half its opening angle in radians
const PEARL = '#ffd8f0';
const SILVER = '#e4f2ff';
const SHADOW = 'rgba(10,20,40,0.5)';

// One shell with its hinge at the origin, opening along -y: a wedge closed by a scalloped lip, each lobe a bulge.
function shell(g, len, color) {
  const a0 = -Math.PI / 2 - HALF;
  const da = (2 * HALF) / LOBES;
  const at = (i, r) => [Math.cos(a0 + i * da) * len * r, Math.sin(a0 + i * da) * len * r];
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(...at(0, 0.88));
  for (let i = 0; i < LOBES; i++) g.quadraticCurveTo(...at(i + 0.5, 1.12), ...at(i + 1, 0.88));
  g.closePath();
  g.fillStyle = rad(g, 0, 0, 0.5, len * 1.05, [[0, shade(color, -0.3)], [0.45, shade(color, 0.08)], [1, shade(color, 0.5)]]);
  g.fill();
  g.lineWidth = 1.3;
  g.strokeStyle = INK;
  g.stroke();
  g.lineWidth = 0.8;
  g.beginPath();
  for (let i = 1; i < LOBES; i++) { // a dark rib into every notch of the lip
    g.moveTo(...at(i, 0.22));
    g.lineTo(...at(i, 0.86));
  }
  g.strokeStyle = rgba(INK, 0.42);
  g.stroke();
  g.beginPath();
  for (let i = 0; i < LOBES; i++) { // a light one up the middle of every lobe
    g.moveTo(...at(i + 0.5, 0.3));
    g.lineTo(...at(i + 0.5, 0.92));
  }
  g.strokeStyle = rgba('#ffffff', 0.5);
  g.stroke();
}

function pearl(g, x, y, r) {
  g.beginPath();
  g.arc(x, y, r + 0.7, 0, TAU);
  g.fillStyle = INK;
  g.fill();
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fillStyle = rad(g, x, y, 0.2, r, [[0, '#ffffff'], [0.5, PEARL], [1, '#b8a0d0']], x - r * 0.35, y - r * 0.4);
  g.fill();
}

export function shells(g, color) {
  g.save();
  g.fillStyle = 'rgba(8,10,20,0.88)';
  g.beginPath();
  g.arc(0, 0, 21, 0, TAU);
  g.fill();
  for (let i = 0; i < SHELLS; i++) {
    const a = (i * TAU) / SHELLS - Math.PI / 2;
    g.save();
    g.rotate(a + Math.PI / 2);
    g.translate(0, -HINGE);
    shell(g, i % 2 ? SHORT : LONG, i % 2 ? shade(color, 0.12) : color);
    g.restore();
  }
  for (let i = 0; i < SHELLS; i++) {
    const a = ((i + 0.5) * TAU) / SHELLS - Math.PI / 2;
    pearl(g, Math.cos(a) * PEARL_AT, Math.sin(a) * PEARL_AT, PEARL_R);
  }
  g.lineWidth = 3.4; // the ring of silver pearl over the hinges
  g.strokeStyle = INK;
  g.beginPath();
  g.arc(0, 0, 19.2, 0, TAU);
  g.stroke();
  g.lineWidth = 1.5;
  g.strokeStyle = SILVER;
  g.stroke();
  g.restore();
}

// A spearhead with a notched base, its tip at (x, top).
const head = (g, x, top) => {
  g.moveTo(x, top);
  g.lineTo(x + 3.2, top + 6.6);
  g.lineTo(x, top + 4.8);
  g.lineTo(x - 3.2, top + 6.6);
  g.closePath();
};

const [ORBIT, BEAD] = [10.6, 4.3]; // the pearls icon: the ring's radius and a pearl's

export const ICONS15 = {
  // Three pearls round a ring, each trailing a short comet tail behind it (the way they turn).
  pearls(g, color) {
    g.save();
    g.lineCap = 'round';
    g.strokeStyle = color;
    g.lineWidth = 1.6;
    g.globalAlpha = 0.35;
    g.beginPath();
    g.arc(0, 0, ORBIT, 0, TAU);
    g.stroke();
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * TAU) / 3;
      const [x, y] = [Math.cos(a) * ORBIT, Math.sin(a) * ORBIT];
      g.strokeStyle = color;
      g.lineWidth = 5;
      g.globalAlpha = 0.34;
      g.beginPath();
      g.arc(0, 0, ORBIT, a - 0.95, a - 0.2);
      g.stroke();
      g.lineWidth = 2.6;
      g.globalAlpha = 0.75;
      g.beginPath();
      g.arc(0, 0, ORBIT, a - 0.62, a - 0.1);
      g.stroke();
      g.globalAlpha = 1;
      g.fillStyle = color;
      g.beginPath();
      g.arc(x, y, BEAD, 0, TAU);
      g.fill();
      g.strokeStyle = SHADOW; // the shaded underside
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(x, y, BEAD - 0.9, 0.3, 1.7);
      g.stroke();
      g.fillStyle = '#ffffff'; // and the glint
      g.beginPath();
      g.arc(x - 1.4, y - 1.5, 1.3, 0, TAU);
      g.fill();
    }
    g.restore();
  },
  // A trident standing upright: three barbed tines on a U of crossbar, a collar, a long shaft with a knob.
  trident(g, color) {
    g.save();
    g.fillStyle = color;
    g.strokeStyle = color;
    g.lineWidth = 2.6;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(0, 13);
    g.lineTo(0, -10.7);
    g.moveTo(-8.8, -7.7);
    g.lineTo(-8.8, -3);
    g.quadraticCurveTo(-8.8, 2.5, 0, 2.5);
    g.quadraticCurveTo(8.8, 2.5, 8.8, -3);
    g.lineTo(8.8, -7.7);
    g.stroke();
    g.beginPath();
    head(g, 0, -15.5);
    head(g, -8.8, -12.5);
    head(g, 8.8, -12.5);
    g.fill();
    g.fillRect(-3.4, 5, 6.8, 2.2);
    g.beginPath();
    g.arc(0, 13, 1.9, 0, TAU);
    g.fill();
    g.restore();
  },
};
