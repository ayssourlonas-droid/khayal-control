// The brass orrery on the mid layer's greatest island: a stepped pedestal with a turned column and a gear
// at its foot, a sun burning at the top of its axis, and four rings hung on brackets round it. Here is
// only the frame, painted once; the planets that circle on the rings turn in flourish-7.js, which finds
// the sun in the layer's signs. RINGS are the rings' ellipses, shared with it.
import { rgba, lin, rad } from './sprites.js';
import { TAU } from '../core/math.js';
import { GOLD, NIGHT } from './parallax-archive-kit.js';

const BRASS = '#c8902a';
export const RINGS = [
  { rx: 40, ry: 11, tilt: 0.16, speed: 1.1, color: '#ffe9b0', r: 5 },
  { rx: 68, ry: 18, tilt: -0.1, speed: 0.7, color: '#ffb450', r: 6.2 },
  { rx: 98, ry: 27, tilt: 0.07, speed: 0.46, color: '#4af0d8', r: 7.4 },
  { rx: 130, ry: 36, tilt: -0.05, speed: 0.3, color: '#f2dca0', r: 8.6 },
];
export const ORRERY_H = 150; // from the island's surface up to the sun

const ellipse = (g, x, y, rx, ry, tilt = 0) => {
  g.beginPath();
  g.ellipse(x, y, rx, ry, tilt, 0, TAU);
};

// A cogwheel lying on the pedestal, seen from the side.
function gear(g, x, y, r, teeth) {
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * TAU;
    g.fillRect(x + Math.cos(a) * r - 2.4, y + Math.sin(a) * r * 0.34 - 2, 4.8, 4);
  }
  ellipse(g, x, y, r, r * 0.34);
  g.fill();
}

export function orrery(g, out, rng, L, x, top) {
  const sy = top - ORRERY_H;
  g.fillStyle = L.color;
  for (let i = 0; i < 4; i++) g.fillRect(x - 46 + i * 7, top - 8 - i * 7, 92 - i * 14, 8); // the stepped foot
  gear(g, x - 52, top - 14, 22, 12);
  gear(g, x + 50, top - 12, 15, 9);
  g.fillRect(x - 6, sy, 12, ORRERY_H - 34); // the column, turned
  for (const [y, w] of [[top - 40, 22], [top - 70, 16], [top - 104, 20], [sy + 14, 14]]) g.fillRect(x - w / 2, y, w, 7);
  g.strokeStyle = rgba(BRASS, 0.8);
  g.lineWidth = 1.2;
  g.beginPath();
  for (const y of [top - 40, top - 70, top - 104]) {
    g.moveTo(x - 9, y + 1);
    g.lineTo(x + 9, y + 1);
  }
  g.stroke();
  for (const [i, ring] of RINGS.entries()) { // the rings, each on a bracket from the axis
    g.save();
    g.translate(x, sy);
    g.rotate(ring.tilt);
    for (const [w, c] of [[4.4, L.color], [1.8, rgba(i % 2 ? '#e8b860' : BRASS, 0.95)]]) {
      ellipse(g, 0, 0, ring.rx, ring.ry);
      g.lineWidth = w;
      g.strokeStyle = c;
      g.stroke();
    }
    g.beginPath();
    g.moveTo(-ring.rx, 0);
    g.lineTo(-6, 0);
    g.strokeStyle = L.color;
    g.lineWidth = 2.6;
    g.stroke();
    g.restore();
  }
  ellipse(g, x, sy, 30, 76); // the armillary: a ring set on edge round the axis
  g.lineWidth = 3.4;
  g.strokeStyle = L.color;
  g.stroke();
  g.lineWidth = 1.2;
  g.strokeStyle = rgba(GOLD, 0.8);
  g.stroke();
  g.beginPath();
  g.arc(x, sy, 11.5, 0, TAU); // the sun, gilt and glowing
  g.fillStyle = rad(g, x - 3, sy - 3, 0, 13, [[0, '#ffffff'], [0.4, '#ffe9a0'], [1, '#e89a2a']]);
  g.fill();
  g.strokeStyle = rgba(NIGHT, 0.8);
  g.lineWidth = 1.2;
  g.stroke();
  g.fillStyle = lin(g, x - 6, 0, x + 6, 0, [[0, rgba('#ffffff', 0.3)], [0.4, rgba('#ffffff', 0)], [1, rgba(NIGHT, 0.45)]]);
  g.fillRect(x - 6, sy + 8, 12, ORRERY_H - 44);
  g.fillStyle = L.color;
  out.lights.push({ x, y: sy, r: 90, color: '#ffe9b0', mode: 'pulse', ph: 0.1, a: 0.7 });
  out.lights.push({ x, y: sy, r: 230, color: GOLD, mode: 'steady', ph: 0, a: 0.16 });
  out.signs.push({ orrery: true, x, y: sy });
}
