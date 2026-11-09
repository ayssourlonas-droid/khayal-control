// The pickup capsule's rim in Starlit Archive (pickup-skins.js FRAMES[12]): a wreath of gold leaf round the
// dark middle, twelve laurel leaves laid tangent to the ring, each overlapping the next, tinted by the
// power's colour, veined in gold and edged in ink; a thin gilt ring inside them and a bead of gold between
// each pair of leaf tips outside.
import { INK, rgba, shade, lin } from './sprites.js';
import { TAU } from '../core/math.js';

const GILT = '#f4d27a';
const LEAVES = 12;

// One laurel leaf, 20 px long and 10 across, lying along +x about the origin: lit above its midrib,
// shaded below, a gold rib and three pairs of veins.
function leaf(g, color) {
  g.beginPath();
  g.moveTo(-10, 0);
  g.quadraticCurveTo(-2, -6.4, 10, 0);
  g.quadraticCurveTo(-2, 6.4, -10, 0);
  g.closePath();
  g.fillStyle = lin(g, 0, -5, 0, 5, [[0, shade(color, 0.6)], [0.5, color], [1, shade(color, -0.55)]]);
  g.fill();
  g.lineWidth = 1.2;
  g.strokeStyle = INK;
  g.stroke();
  g.strokeStyle = rgba(GILT, 0.95);
  g.lineWidth = 0.8;
  g.beginPath();
  g.moveTo(-8, 0);
  g.lineTo(8, 0);
  for (const x of [-4.5, -0.5, 3.5]) {
    g.moveTo(x, 0);
    g.lineTo(x + 2.6, -3);
    g.moveTo(x, 0);
    g.lineTo(x + 2.6, 3);
  }
  g.stroke();
}

export function gilt(g, color) {
  g.fillStyle = 'rgba(8,10,20,0.88)';
  g.beginPath();
  g.arc(0, 0, 21, 0, TAU);
  g.fill();
  g.lineWidth = 3.6;
  g.strokeStyle = INK;
  g.beginPath();
  g.arc(0, 0, 19.2, 0, TAU);
  g.stroke();
  for (let i = 0; i < LEAVES; i++) { // the wreath: each leaf's foot tucked under the one before it
    g.save();
    g.rotate((i * TAU) / LEAVES);
    g.translate(0, -23.6);
    g.rotate(-0.3);
    leaf(g, i % 2 ? shade(color, 0.12) : color);
    g.restore();
  }
  g.fillStyle = rgba(GILT, 0.95); // the beads
  for (let i = 0; i < LEAVES; i++) {
    const a = ((i + 0.5) * TAU) / LEAVES;
    g.beginPath();
    g.arc(Math.cos(a) * 28.8, Math.sin(a) * 28.8, 1.2, 0, TAU);
    g.fill();
  }
  g.lineWidth = 1.5;
  g.strokeStyle = rgba(GILT, 0.95);
  g.beginPath();
  g.arc(0, 0, 19.2, 0, TAU);
  g.stroke();
  g.lineWidth = 1;
  g.strokeStyle = rgba('#ffffff', 0.5);
  g.beginPath();
  g.arc(0, 0, 17.6, 3.5, 5);
  g.stroke();
}
