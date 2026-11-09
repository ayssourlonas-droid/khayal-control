// The nave wall of Glass Cathedral (far layer, see parallax-glass.js): a run of bays between tall piers, each
// pier topped with a pinnacle and leaning on a lower pier through a flying buttress. A whole bay has its
// clerestory (a pair of stained lancets under one arch, a round window above), a triforium of small arches and
// an aisle window; a half-fallen bay keeps a ragged wall and a broken window; an open bay has lost its wall,
// and only the arch's rib and the window's stone bars stand against the dawn. Each bay is `BAY` wide.
import { rgba } from './sprites.js';
import { TAU } from '../core/math.js';
import { pick } from '../core/rng.js';
import { trace, toward, rimLight, wash, courses, pinnacle, archTop, lancetPath, ragged, tint, ivy, LEAD, DAWN, IVY } from './parallax-glass-kit.js';
import { glaze, pairWindow } from './parallax-glass-window.js';

export const BAY = 124;
const PIER = 26;
const WALL = 300; // a whole bay's wall top above the ground
const SILL = 152; // the clerestory's sill

// A pier at x (centre): a buttress stepped in three weatherings from a broad foot to the shaft, a cornice, a pinnacle with
// a gablet either side, and courses of ashlar.
function pier(g, L, x, base, rng, top) {
  const hw = PIER / 2;
  const build = (c, ox = 0, oy = 0) => trace(c, [[x - hw - 11, base], [x - hw - 11, base - 40], [x - hw - 5, base - 46], [x - hw - 5, base - 96], [x - hw, base - 102], [x - hw, top], [x - hw - 3, top - 8],
    [x + hw + 3, top - 8], [x + hw, top], [x + hw, base - 102], [x + hw + 5, base - 96], [x + hw + 5, base - 46], [x + hw + 11, base - 40], [x + hw + 11, base]], ox, oy);
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  rimLight(g, build, toward(x), 2.2, DAWN, 0.75);
  pinnacle(g, x, top - 8, 14, 52);
  for (const s of [-1, 1]) pinnacle(g, x + s * (hw + 1), top - 6, 7, 24);
  courses(g, rng, x - hw, top, x + hw, base, 0.14, 10, build);
}

// A wall between two piers, the bay's left pier edge at x0: top is the wall's top y, ragged where it has fallen.
function wall(g, rng, L, x0, base, top, ragAmp) {
  const [a, b] = [x0 + PIER / 2 - 1, x0 + BAY - PIER / 2 + 1];
  const pts = [[a, base], [a, top], ...ragged(rng, a, b, top, ragAmp, 8), [b, base]];
  const build = (c, ox = 0, oy = 0) => trace(c, pts, ox, oy);
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  rimLight(g, build, toward(x0), 2, DAWN, 0.55);
  wash(g, build, [a, top - 6, b, base - 100]);
  courses(g, rng, a, top, b, base, 0.14, 10, build);
  ivy(g, rng, a + 6, b - 6, top + 3, ragAmp > 10 ? 2 : 4, tint(L, IVY, 0.5), 30);
}

// The triforium and the aisle's low window, dim, under the clerestory.
function lower(g, out, rng, L, cx, base, lit) {
  g.fillStyle = rgba(LEAD, 0.5);
  for (let i = -1; i <= 1; i++) {
    lancetPath(g, cx + i * 24, base - 112, 9, 30, 1.2);
    g.fill();
  }
  if (lit) glaze(g, out, rng, L, cx, base - 18, 9, 66, { a: 0.22, kind: 'lozenge' });
  else {
    g.fillStyle = rgba(LEAD, 0.55);
    lancetPath(g, cx, base - 18, 9, 66, 1.2);
    g.fill();
  }
}

// The rib of an arch that stands alone after its wall is gone, with the window's bars hanging in it.
function openBay(g, L, cx, hw, spring) {
  g.save();
  g.strokeStyle = L.color;
  g.lineWidth = 8;
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(cx - hw, spring + 30);
  g.lineTo(cx - hw, spring);
  const rise = archTop(g, cx, spring, hw, 1.1);
  g.stroke();
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(cx, spring - rise + 4);
  g.lineTo(cx, spring + 70);
  g.moveTo(cx - hw * 0.5, spring + 10);
  g.lineTo(cx - hw * 0.5, spring + 70);
  g.moveTo(cx + hw * 0.5, spring + 10);
  g.lineTo(cx + hw * 0.5, spring + 70);
  g.stroke();
  g.beginPath();
  g.arc(cx, spring - rise * 0.42, hw * 0.28, 0, TAU);
  g.stroke();
  g.restore();
}

// n bays from x0 rightward: state[i] is 'whole', 'half' or 'open'; piers stand between them (n + 1 of them).
export function nave(g, out, rng, L, x0, base, state) {
  state.forEach((s, i) => {
    const bx = x0 + i * BAY;
    const cx = bx + BAY / 2;
    const top = base - WALL;
    if (s === 'open') {
      openBay(g, L, cx, 44, base - SILL - 50);
      lower(g, out, rng, L, cx, base, false);
      return;
    }
    wall(g, rng, L, bx, base, s === 'whole' ? top : base - 196, s === 'whole' ? 6 : 24);
    if (s === 'whole') pairWindow(g, out, rng, L, cx, base - SILL, 42, 134);
    else glaze(g, out, rng, L, cx, base - SILL + 4, 18, 90, { broken: 0.3, kind: pick(rng, ['lozenge', 'medallion']) });
    lower(g, out, rng, L, cx, base, s === 'whole' ? rng() < 0.7 : false);
  });
  for (let i = 0; i <= state.length; i++) {
    const [l, r] = [state[i - 1], state[i]];
    pier(g, L, x0 + i * BAY, base, rng, base - (l === 'open' && r === 'open' ? WALL - 90 : WALL + 8 - (l === 'half' || r === 'half' ? 40 : 0)));
  }
}
