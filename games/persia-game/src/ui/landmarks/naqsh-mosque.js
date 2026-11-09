// The Shah Mosque on Naqsh-e Jahan (naqsh.js), in the middle: the tall tiled portal with its pointed
// arch cut into a rectangular frame, a honeycomb of lit niches in the arch and a lit door at its
// foot, stacked blind niches either side; on the portal's two top corners the slim twin minarets,
// banded with tile, each with its balcony, its lantern and a lamp; and behind it all the great
// dome (naqsh-dome.js). Painted as the middle row, a little misted. `up` counts blocks up from the
// street. Tones: T U u tile, k K recess, g h G the door and lamps; the brick is Yazd's (yazd-brick.js).
import { PIXEL } from '../sprites.js';
import { BASE, key, lamp, archHalf, nestedArch, field, minaret } from './yazd-brick.js';
import { dome } from './naqsh-dome.js';

const D = 1;
export const PORTAL = { half: 31, tall: 60 }; // the frame's half-width, its height
const ARCHES = [[20, 34, 57], [18, 35, 54], [14, 36, 50]]; // outline, tile band, recess: half-width, where it starts to close, its point
const DOOR = [6, 14, 22];
const NICHES = [6, 20, 34]; // the blind niches either side: the row each one starts on
const TOWER = { at: 28, wide: 5, tall: 104, balcony: 90, shaft: 30, rings: [63, 87] }; // each minaret: from the middle, its width, height and balcony, the shaft under that, its bands

export function mosque(art) {
  const { lights, row, L } = art;
  const cx = art.mid;
  lamp(art, D, cx, row(26), 20, 0.9, false);
  lights.push({ x: (cx + 0.5) * PIXEL, y: row(26) * PIXEL, r: 110, color: L.lamp, ph: 0.9, a: 0.22 });
  dome(art, cx);
  portal(art, cx);
  for (const s of [-1, 1]) minaret(art, D, cx + s * TOWER.at, TOWER);
}

function portal(art, cx) {
  const { box, row } = art;
  const { half, tall } = PORTAL;
  for (let up = 0; up < tall; up++) {
    const frieze = up >= tall - 4;
    for (let x = cx - half; x <= cx + half; x++) {
      const edge = Math.abs(x - cx) >= half - 1;
      box(x, row(up), 1, 1, edge || up === tall - 5 ? 'u' : frieze ? (x % 2 ? 'U' : 'T') : field(art, D, x, up));
    }
  }
  box(cx - half - 1, row(tall), half * 2 + 3, 1, key(D, BASE[D] + 0.3)); // the cornice, lit on top and shadowed under
  box(cx - half - 1, row(tall - 1), half * 2 + 3, 1, key(D, BASE[D] - 0.25));
  for (const x of [cx - 26, cx + 23]) for (const up of NICHES) niche(art, x, up);
  nestedArch(art, D, cx, ARCHES, (x, up, inner) => (inner ? honeycomb(x - cx, up) : field(art, D, x, up)));
  for (let up = 0; up <= DOOR[2]; up++) {
    const hw = archHalf(DOOR, up);
    box(cx - hw, row(up), hw * 2 + 1, 1, up > DOOR[2] - 3 ? 'h' : 'g');
  }
  box(cx, row(DOOR[2] - 5), 1, 3, 'G');
}

// The dark arch's vault, a honeycomb of niches: some glint, some are lit from below.
function honeycomb(dx, up) {
  if (up < 24) return 'k';
  const cell = (dx + 2 * (up >> 1) + 80) % 4;
  return up % 2 === 0 && cell === 0 ? 'h' : cell === 2 && up % 2 ? 'K' : 'k';
}

// A blind niche 4 wide, 10 high, its foot on row `up`, its left edge on column x.
function niche({ box, row }, x, up) {
  box(x, row(up + 9), 4, 10, 'u');
  box(x + 1, row(up + 8), 2, 8, 'k');
  box(x + 1, row(up + 1), 2, 1, 'h');
}
