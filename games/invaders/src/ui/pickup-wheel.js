// The pickup capsule's rim in Sunset Armada (pickup-skins.js FRAMES[13]): a ship's wheel round the dark
// middle. A brass rim ringed in ink, eight spokes running from it toward the hub (which is the icon), and
// eight turned handles standing out past the rim, each with a brass ferrule and a round knob, tinted by the
// power's colour. Also the wingmen's icon (ICONS[13], plain paths, which the HUD draws every frame too).
import { INK, rgba, shade, lin } from './sprites.js';
import { TAU } from '../core/math.js';

const BRASS = '#e8b84a';
const HANDLES = 8;

// One handle standing out along -y from the rim: a turned grip tapering to a knob, a ferrule where it
// meets the rim, lit on the left.
function handle(g, color) {
  g.beginPath();
  g.moveTo(-2.1, -22.8);
  g.lineTo(-1.5, -26.4);
  g.lineTo(-2.4, -28.4);
  g.arc(0, -29, 2.6, Math.PI, 0);
  g.lineTo(2.4, -28.4);
  g.lineTo(1.5, -26.4);
  g.lineTo(2.1, -22.8);
  g.closePath();
  g.fillStyle = lin(g, -2.6, 0, 2.6, 0, [[0, shade(color, 0.55)], [0.5, color], [1, shade(color, -0.5)]]);
  g.fill();
  g.lineWidth = 1.2;
  g.strokeStyle = INK;
  g.stroke();
  g.fillStyle = BRASS;
  g.fillRect(-2.5, -24.6, 5, 1.8);
}

export function wheel(g, color) {
  g.fillStyle = 'rgba(8,10,20,0.88)';
  g.beginPath();
  g.arc(0, 0, 21, 0, TAU);
  g.fill();
  for (let i = 0; i < HANDLES; i++) { // spokes, each carried on past the rim as a handle
    g.save();
    g.rotate((i * TAU) / HANDLES);
    g.fillStyle = INK;
    g.fillRect(-2.4, -22.6, 4.8, 9);
    g.fillStyle = shade(BRASS, -0.2);
    g.fillRect(-1.2, -22, 2.4, 8);
    handle(g, color);
    g.restore();
  }
  for (const [r, w, c] of [[21.4, 6.2, INK], [21.4, 3.8, BRASS], [19.6, 1.2, rgba('#fff0b8', 0.9)]]) { // the rim, ringed in ink
    g.lineWidth = w;
    g.strokeStyle = c;
    g.beginPath();
    g.arc(0, 0, r, 0, TAU);
    g.stroke();
  }
  g.fillStyle = rgba('#ffffff', 0.7); // a rivet between each pair of handles, and the glint on the rim
  for (let i = 0; i < HANDLES; i++) {
    const a = ((i + 0.5) * TAU) / HANDLES;
    g.beginPath();
    g.arc(Math.cos(a) * 21.4, Math.sin(a) * 21.4, 0.9, 0, TAU);
    g.fill();
  }
  g.lineWidth = 1;
  g.strokeStyle = rgba('#ffffff', 0.6);
  g.beginPath();
  g.arc(0, 0, 22.4, 3.6, 4.7);
  g.stroke();
}

// Three small fighters in a V, nose up: the ship between its two wingmen.
const plane = (g, x, y, s) => {
  g.beginPath();
  g.moveTo(x, y - 8 * s);
  g.lineTo(x + 2 * s, y - 2 * s);
  g.lineTo(x + 8 * s, y + 3 * s);
  g.lineTo(x + 2 * s, y + 3 * s);
  g.lineTo(x + 1.6 * s, y + 7 * s);
  g.lineTo(x - 1.6 * s, y + 7 * s);
  g.lineTo(x - 2 * s, y + 3 * s);
  g.lineTo(x - 8 * s, y + 3 * s);
  g.lineTo(x - 2 * s, y - 2 * s);
  g.closePath();
  g.fill();
};

export const ICONS13 = {
  wingmen(g, color) {
    g.fillStyle = color;
    plane(g, -12, 6, 0.9);
    plane(g, 12, 6, 0.9);
    plane(g, 0, -4, 1.3);
    g.fillStyle = '#ffffff';
    g.fillRect(-1.4, -12, 2.8, 5);
  },
};
