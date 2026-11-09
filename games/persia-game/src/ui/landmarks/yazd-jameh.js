// The Jameh Mosque of Yazd, behind the roofs a little right of the middle (yazd.js): its tall flat
// portal with the pointed arch cut into it, three arches nested in one another, their tiles dimly
// turquoise and lit from inside; the great tiled dome beside it, and on the portal's two top
// corners the twin slim minarets, banded with tile, each with its balcony, its lantern and a lamp.
// Painted as the middle row, so the houses in front of it hide its foot. `up` counts blocks up from
// the street.
import { PIXEL } from '../sprites.js';
import { BASE, key, brick, light, lamp, nestedArch, field, minaret } from './yazd-brick.js';

const D = 1;
const PORTAL = { half: 18, tall: 58 }; // the frame's half-width, its height
const ARCHES = [[11, 22, 56], [9, 24, 52], [6, 27, 46]]; // outline, tile band, recess: half-width, where it starts to close, its point
const TOWER = { at: 13, wide: 5, tall: 96, balcony: 80, shaft: 28, rings: [60, 76] }; // each minaret: from the middle, its width, height and balcony, the shaft under that, its bands
const DOME = { at: -36, r: 13, from: 30 }; // the great dome: from the middle, radius, the row its drum starts on

export function jameh(art, cx) {
  const { box, row } = art;
  lamp(art, D, cx, row(36), 16, 0.9, false);
  art.lights.push({ x: (cx + 0.5) * PIXEL, y: row(36) * PIXEL, r: 56, color: art.L.lamp, ph: 0.9, a: 0.25 });
  dome(art, cx + DOME.at);
  brick(art, D, cx - PORTAL.half, row(PORTAL.tall - 1), PORTAL.half * 2, PORTAL.tall, (i, j) => {
    const edge = i < 2 ? -0.15 : i > PORTAL.half * 2 - 3 ? 0.25 : 0;
    return BASE[D] + 0.05 + edge + (j === 0 ? -0.3 : j === 2 ? 0.25 : 0);
  }, 2);
  nestedArch(art, D, cx, ARCHES, (x, up, inner) => (inner ? (light(art.lamps[D], x, row(up)) > 0.4 ? 'T' : 'u') : field(art, D, x, up)));
  for (const s of [-1, 1]) minaret(art, D, cx + s * TOWER.at, TOWER);
}

// The great dome with its centre on column x: a tiled drum, the bulb above it ribbed and lit down its
// left, a finial.
function dome(art, x) {
  const { box, row } = art;
  const { r, from } = DOME;
  box(x - r + 2, row(from + 5), r * 2 - 3, 6, 'u');
  for (let c = x - r + 3; c < x + r - 2; c += 3) box(c, row(from + 4), 1, 4, 'T');
  for (let up = 0; up < r; up++) {
    const hw = Math.round(r * Math.sqrt(1 - (up / r) ** 2)) - 1;
    for (let c = x - hw; c <= x + hw; c++) {
      const lit = (c - x + hw) / (hw * 2 + 1);
      box(c, row(from + 6 + up), 1, 1, lit < 0.25 ? 'U' : lit < 0.7 ? 'T' : 'u');
    }
  }
  box(x, row(from + 6 + r + 2), 1, 3, key(D, BASE[D] - 0.3));
}
