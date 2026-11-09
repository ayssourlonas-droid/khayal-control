// The Ferris wheel of Ember Carnival's mid layer, the still part of it: the two braced legs that carry the
// hub, the boarding platform with its bulbs and rail, a stair. The wheel itself (rim, spokes, gondolas and the
// bulbs that chase round it) turns in flourish-11.js, which finds it by the sign left here. See
// parallax-shapes.js for the painter contract.
import { rgba, lin } from './sprites.js';
import { GOLD, MAGENTA, PARTY, bulbRow } from './parallax-carnival-kit.js';
import { GROUND } from './parallax-carnival-tents.js';

export const WHEEL = { r: 170, n: 16 }; // the wheel's radius and its number of gondolas

export function ferris(g, out, rng, L, x, y) {
  g.strokeStyle = L.color;
  g.lineCap = 'butt';
  for (const s of [-1, 1]) {
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(x + s * 4, y);
    g.lineTo(x + s * 96, GROUND);
    g.moveTo(x + s * 12, y + 6);
    g.lineTo(x + s * 112, GROUND);
    g.stroke();
    g.lineWidth = 1.6; // lattice between the pair
    g.beginPath();
    for (let k = 0; k < 8; k++) {
      const [u0, u1] = [k / 8, (k + 1) / 8];
      const at = (u, o) => [x + s * (4 + 92 * u + 8 * u * o), y + (GROUND - y) * u];
      g.moveTo(...at(u0, 0));
      g.lineTo(...at(u1, 1));
      g.moveTo(...at(u0, 1));
      g.lineTo(...at(u1, 0));
    }
    g.stroke();
    g.strokeStyle = rgba(s < 0 ? MAGENTA : GOLD, 0.55); // the leg's edge in light
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(x + s * 4 - s * 3, y);
    g.lineTo(x + s * 96 - s * 3, GROUND);
    g.stroke();
    g.strokeStyle = L.color;
  }
  g.fillStyle = L.color;
  g.fillRect(x - 150, GROUND - 12, 300, 12); // the platform
  g.fillRect(x - 146, GROUND - 26, 2.6, 14);
  g.fillRect(x + 144, GROUND - 26, 2.6, 14);
  g.fillRect(x - 146, GROUND - 26, 292, 2.4);
  g.fillStyle = lin(g, 0, GROUND - 40, 0, GROUND, [[0, rgba(GOLD, 0)], [1, rgba(GOLD, 0.4)]]);
  g.fillRect(x - 150, GROUND - 40, 300, 40);
  bulbRow(g, out, x - 140, GROUND - 6, x + 140, GROUND - 6, 20, 2, PARTY, { mode: 'blink', every: 4 });
  g.fillStyle = L.color;
  out.signs.push({ wheel: true, x, y, r: WHEEL.r, n: WHEEL.n });
}
