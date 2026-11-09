// The pickup capsule's rim in Anvil Sky (pickup-skins.js FRAMES[18]): a Tesla ring round the dark middle. A ring of copper coil
// wire, wound with fine windings and outlined in ink, with eight steel electrodes set on it, each with a short bright prong, and
// between every two neighbouring prongs a small arc of the power's colour jumping across with a white thread, so the capsule
// crackles; a thin line of the power's colour runs round the inside of the coil, so the power still reads at a glance. Baked once
// into the 60 x 60 sprite (pickups-view.js), centred on the origin, nothing past a radius of about 29. ICONS18 is the icon of
// world 18's own power, the side guns (R67).
import { INK, rgba, lin, rad } from './sprites.js';
import { arcPath } from './storm-bolt.js';
import { TAU } from '../core/math.js';

const STUDS = 8;
const TIP = 27.4; // radius the prongs end at
const [COIL, COIL_W] = [23.3, 4.4];

export function tesla(g, color) {
  g.fillStyle = 'rgba(8,10,20,0.88)';
  g.beginPath();
  g.arc(0, 0, 21, 0, TAU);
  g.fill();
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.lineWidth = COIL_W + 3;
  g.strokeStyle = INK;
  g.beginPath();
  g.arc(0, 0, COIL, 0, TAU);
  g.stroke();
  g.lineWidth = COIL_W;
  g.strokeStyle = lin(g, -24, -24, 24, 24, [[0, '#ffd8a0'], [0.45, '#c9783c'], [1, '#5a2c12']]);
  g.stroke();
  g.lineWidth = 0.9; // the windings, fine ticks across the wire
  g.strokeStyle = rgba('#2a1206', 0.75);
  g.beginPath();
  for (let i = 0; i < 44; i++) {
    const a = (i * TAU) / 44;
    g.moveTo(Math.cos(a) * (COIL - COIL_W / 2 + 0.3), Math.sin(a) * (COIL - COIL_W / 2 + 0.3));
    g.lineTo(Math.cos(a) * (COIL + COIL_W / 2 - 0.3), Math.sin(a) * (COIL + COIL_W / 2 - 0.3));
  }
  g.stroke();
  g.lineWidth = 1.3; // the power's own line inside the coil
  g.strokeStyle = rgba(color, 0.95);
  g.beginPath();
  g.arc(0, 0, 20.4, 0, TAU);
  g.stroke();
  const at = (i, r) => {
    const a = ((i + 0.5) * TAU) / STUDS - Math.PI / 2;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };
  for (let i = 0; i < STUDS; i++) { // the electrodes: a steel knob and a prong running out of it
    const [kx, ky] = at(i, 25);
    const [tx, ty] = at(i, TIP);
    g.lineWidth = 3.4;
    g.strokeStyle = INK;
    g.beginPath();
    g.moveTo(kx, ky);
    g.lineTo(tx, ty);
    g.stroke();
    g.lineWidth = 1.6;
    g.strokeStyle = '#e4ecff';
    g.stroke();
    g.beginPath();
    g.arc(kx, ky, 3.7, 0, TAU);
    g.fillStyle = INK;
    g.fill();
    g.beginPath();
    g.arc(kx, ky, 2.7, 0, TAU);
    g.fillStyle = rad(g, kx, ky, 0, 2.7, [[0, '#ffffff'], [0.5, '#b8c4e0'], [1, '#5a6684']], kx - 0.8, ky - 0.8);
    g.fill();
  }
  for (let i = 0; i < STUDS; i++) { // and an arc jumping from each prong to the next
    const [x0, y0] = at(i, TIP);
    const [x1, y1] = at(i + 1, TIP);
    for (const [w, style] of [[3.6, rgba(color, 0.4)], [1.7, color], [0.8, '#ffffff']]) {
      g.beginPath();
      arcPath(g, x0, y0, x1, y1, 5, 1.9, i * 5 + 2);
      g.lineWidth = w;
      g.strokeStyle = style;
      g.stroke();
    }
  }
}

// The side guns (R67): a slim hull with a jagged arc leaping out of each flank. Plain paths, the HUD draws icons every frame.
export const ICONS18 = {
  sideguns(g, color) {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, -13);
    g.lineTo(5, 11);
    g.lineTo(-5, 11);
    g.closePath();
    g.fill();
    g.strokeStyle = color;
    g.lineWidth = 3;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    for (const d of [-1, 1]) {
      g.moveTo(d * 6, 2);
      g.lineTo(d * 10, -4);
      g.lineTo(d * 12, 5);
      g.lineTo(d * 16, -1);
    }
    g.stroke();
  },
};
