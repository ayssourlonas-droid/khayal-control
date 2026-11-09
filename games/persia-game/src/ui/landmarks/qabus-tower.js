// The tower itself (qabus.js), standing on the mound's flat top: a tall cylinder of pale fired brick,
// ten sharp flanges running from its foot to the roof, of which five show from the front, each a
// bright crest over a deep shadow on its right and a lit slope on the next flange's left, the outer
// pairs narrower as they turn away, their points standing out a block from the wall in turn so the
// outline is serrated; floodlit from below, so the brick is palest at the foot and dims as it
// climbs. A band of inscription under the roof, the small pointed door at the foot with a plaque
// over it, a crisp cornice, and the cone of the same brick a shade darker, lit down its left and
// shaded down its right. Painted as the near row, with `up` counted from the tower's foot. Tones: U T
// S the inscription's ground, lit to shade, u s its letters, G g h k the door's light.
import { PIXEL } from '../sprites.js';
import { BASE, key, brick, nestedArch } from './yazd-brick.js';
import { D, MOUND } from './qabus-park.js';

const HALF = 10; // the wall is 21 blocks wide, its middle flange on the centre column
const CRESTS = [-10, -7, 0, 7, 10]; // the flanges seen from the front, from the middle
const SHAFT = 66; // rows from its foot to the eave
const CONE = 28;
const CONE_HALF = 12; // the cornice overhangs the points by a block each side
const DOOR = [[3, 6, 15], [2, 6, 14], [1, 5, 12]]; // outline, frame and recess: half-width, row the arch springs from, row of its point
const BAND = 5; // an inscription's rows: a rim, three rows of letters, a rim
// Three rows of a squared script, 16 columns long and repeated: tall strokes, teeth, the line they stand on.
const SCRIPT = ['X..X...X.X..X...', 'X.XX.X.X.XX.XX.X', 'XXXXXXX.XXXXXXX.'];

// How dark column x of the wall is, from the middle: a flange's crest bright, the slope right of it
// in deep shade, the one left of the next crest lit, and the whole wall dimmer toward the sides as it turns away.
function columns(x) {
  const turn = 0.2 * (Math.abs(x) / HALF) ** 2;
  const left = CRESTS.filter((c) => c <= x).at(-1);
  if (x === left) return (x === HALF ? 0.2 : -0.45) + turn;
  const right = CRESTS.find((c) => c > x);
  return ((x - left) / (right - left) < 0.5 ? 0.55 : 0.12) + turn;
}

// A band of inscription `w` wide, centred, its first row on row `up`, going down.
function inscription({ box, row, mid }, up, w) {
  const x0 = mid - (w >> 1);
  for (let i = 0; i < w; i++) {
    const x = i - (w >> 1);
    const shade = x > w / 7;
    box(x0 + i, row(up), 1, BAND, x < -w / 7 ? 'U' : shade ? 'S' : 'T');
    SCRIPT.forEach((line, j) => line[i % 16] === 'X' && box(x0 + i, row(up - 1 - j), 1, 1, shade ? 's' : 'u'));
  }
}

// The outer flanges' points, a block outside the wall for three rows in every six.
function points({ box, row, mid }) {
  for (let up = 2; up < SHAFT - BAND; up++) {
    if (up % 6 > 2) continue;
    box(mid - HALF - 1, row(up), 1, 1, key(D, -0.1));
    box(mid + HALF + 1, row(up), 1, 1, key(D, 0.6));
  }
}

// The cornice, a lit cap over a dark underside, and the cone above it, a row of brick at a time.
function roof(art) {
  const { box, row, mid } = art;
  box(mid - CONE_HALF, row(SHAFT), CONE_HALF * 2 + 1, 1, key(D, 0.8));
  brick(art, D, mid - CONE_HALF, row(SHAFT + 1), CONE_HALF * 2 + 1, 1, (i) => -0.15 + 0.6 * (i / (CONE_HALF * 2)), 0);
  for (let t = 0; t < CONE; t++) {
    const hw = Math.round((CONE_HALF - 1) * (1 - t / CONE) ** 0.92);
    const dark = (i) => {
      const u = hw ? i / (hw * 2) : 0.5; // 0 at its left edge to 1 at its right
      return 0.16 + 0.22 * (t / CONE) + (u < 0.45 ? 0 : 0.3 + 0.3 * u) + (i === 0 ? -0.15 : 0);
    };
    brick(art, D, mid - hw, row(SHAFT + 2 + t), hw * 2 + 1, 1, dark, 1);
  }
  box(mid, row(SHAFT + CONE + 4), 1, 3, key(D, 0.6)); // the finial
}

export function tower(base) {
  const art = { ...base, row: (up) => base.row(up + MOUND.tall) };
  const { box, row, mid, lights, L } = art;
  brick(art, D, mid - HALF, row(SHAFT - 1), HALF * 2 + 1, SHAFT, (i, j) => 0.04 + 0.16 * ((SHAFT - 1 - j) / SHAFT) + columns(i - HALF), 0);
  points(art);
  box(mid - HALF - 1, row(1), HALF * 2 + 3, 2, key(D, BASE[D] + 0.1)); // the plinth
  box(mid - HALF - 1, row(1), HALF * 2 + 3, 1, key(D, BASE[D] + 0.4));
  inscription(art, SHAFT - 1, HALF * 2 + 1);
  nestedArch(art, D, mid, DOOR, (x, up, inner) => (inner ? (up < 2 ? 'G' : up < 4 ? 'g' : up < 7 ? 'h' : 'k') : 'u'));
  inscription(art, DOOR[0][2] + 6, 9);
  roof(art);
  lights.push({ x: (mid + 0.5) * PIXEL, y: row(4) * PIXEL, r: 36, color: L.lamp, ph: 1.9, a: 0.3 });
}
