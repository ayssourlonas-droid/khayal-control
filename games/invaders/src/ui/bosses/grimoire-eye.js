// The Grand Grimoire's sigil-eye (World 12, Starlit Archive; see grimoire.js): a bronze wheel with a
// dark groove in it where glowing runes turn (live, grimoire-fx.js), round a night sky of gold stars
// and, across it, a great almond eye: a gilt lid with feather lashes, parchment white, an iris of teal
// fibres. The pupil is a live extra, so it can wander. A weak point, drawn 120 x 100 for the hit box.
import { path, ink, line, lin, rad, rgba, shade, neon, bloom, gloss, both, ellipse, TAU } from './kit.js';
import { hash } from '../sprites.js';
import { GOLD, GILT, GOLD_D, gilt, stud } from './grimoire-kit.js';

export const EYE_R = 50; // the wheel's outer radius: half the part's height
export const IRIS = 19;
const LID_UP = [[-45, 2], [-20, -30], [20, -30], [45, 2]]; // the upper lid's bezier
const LID_LOW = [[45, 2], [20, 26], [-20, 26], [-45, 2]];

const almond = (g) => {
  g.beginPath();
  g.moveTo(...LID_UP[0]);
  g.bezierCurveTo(...LID_UP[1], ...LID_UP[2], ...LID_UP[3]);
  g.bezierCurveTo(...LID_LOW[1], ...LID_LOW[2], ...LID_LOW[3]);
  g.closePath();
};

// The point u along the upper lid and which way is out from it, for the lashes.
function onLid(u) {
  const [p0, p1, p2, p3] = LID_UP;
  const v = 1 - u;
  const at = (k) => v ** 3 * p0[k] + 3 * v * v * u * p1[k] + 3 * v * u * u * p2[k] + u ** 3 * p3[k];
  const dt = (k) => 3 * v * v * (p1[k] - p0[k]) + 6 * v * u * (p2[k] - p1[k]) + 3 * u * u * (p3[k] - p2[k]);
  const d = Math.hypot(dt(0), dt(1));
  return [at(0), at(1), dt(1) / d, -dt(0) / d];
}

// A feather lash: a long leaf of gold springing from the lid along its normal.
function lash(b, u, len, fan) {
  const [x, y, nx, ny] = onLid(u);
  const a = Math.atan2(ny, nx) + fan;
  const [tx, ty] = [x + Math.cos(a) * len, y + Math.sin(a) * len];
  const [px, py] = [-Math.sin(a) * len * 0.2, Math.cos(a) * len * 0.2];
  path(b, [[x - px * 0.5, y - py * 0.5], [x + Math.cos(a) * len * 0.5 + px, y + Math.sin(a) * len * 0.5 + py], [tx, ty], [x + Math.cos(a) * len * 0.5 - px * 0.6, y + Math.sin(a) * len * 0.5 - py * 0.6]]);
  ink(b, lin(b, x, y, tx, ty, [[0, GOLD_D], [0.6, GOLD], [1, GILT]]), 1.1);
}

// The wheel: bronze, a groove turned into it for the runes, studs round the rim, gilt rings.
function wheel(b, l, S) {
  const { plate } = S.pal;
  ellipse(b, 0, 0, EYE_R, EYE_R);
  ink(b, rad(b, 0, 0, 0, EYE_R, [[0.6, shade(plate, 0.15)], [1, shade(plate, -0.5)]], -14, -16), 3.2);
  ellipse(b, 0, 0, 43, 43);
  line(b, rgba('#000000', 0.5), 7); // the groove: dark, its lip lit
  ellipse(b, 0, 0, 39.6, 39.6);
  line(b, rgba(GILT, 0.35), 0.9);
  for (let i = 0; i < 24; i++) { // studs and notches round the rim
    const a = (i * TAU) / 24;
    if (i % 2) stud(b, Math.cos(a) * 47.4, Math.sin(a) * 47.4, 1.7, GILT);
    else {
      path(b, [[Math.cos(a) * 45.6, Math.sin(a) * 45.6], [Math.cos(a) * 49.4, Math.sin(a) * 49.4]], true);
      line(b, rgba('#000000', 0.5), 1.4);
    }
  }
  for (const r of [49, 36.4]) {
    ellipse(b, 0, 0, r, r);
    gilt(b, 1.3, 0.9);
  }
  for (let i = 0; i < 12; i++) { // the runes at rest in the groove, dim: they light up as they turn
    const a = (i * TAU) / 12;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    path(l, [[c * 40.5, s * 40.5], [c * 45.5, s * 45.5]], true);
    line(l, rgba(S.pal.weak, 0.28), 1.4);
  }
}

// The field inside the wheel: a night sky, gold stars scattered over it, a seven-pointed star engraved.
function field(b, l) {
  ellipse(b, 0, 0, 36, 36);
  ink(b, rad(b, 0, 0, 0, 36, [[0, '#2a2068'], [0.6, '#120c3c'], [1, '#05030f']]), 2.4);
  for (let i = 0; i < 34; i++) {
    const a = hash(i) * TAU;
    const d = Math.sqrt(hash(i + 50)) * 34;
    b.fillStyle = rgba(i % 4 ? '#ffffff' : GILT, 0.35 + hash(i + 90) * 0.55);
    b.fillRect(Math.cos(a) * d, Math.sin(a) * d, 1 + (i % 7 === 0), 1 + (i % 7 === 0));
  }
  for (const [r, w] of [[33, 1], [27, 0.7]]) {
    b.beginPath();
    for (let i = 0; i <= 7; i++) {
      const a = (i * 2 * TAU) / 7 - Math.PI / 2;
      b.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    line(b, rgba(GOLD, 0.5), w);
  }
  ellipse(l, 0, 0, 36, 36);
  l.fillStyle = rad(l, 0, 0, 14, 36, [[0, rgba('#7a6aff', 0.05)], [1, rgba('#7a6aff', 0.2)]]);
  l.fill();
}

// The eye itself: parchment white under the shade of the lid, the iris, the lids with their lashes.
function almondEye(b, l, S) {
  const { weak } = S.pal;
  almond(b);
  ink(b, rad(b, 0, 2, 0, 46, [[0, '#fff6dc'], [0.7, '#e8d6a2'], [1, '#a8884e']]), 1);
  b.save();
  almond(b);
  b.clip();
  b.fillStyle = lin(b, 0, -30, 0, 0, [[0, rgba('#1a0a00', 0.6)], [1, rgba('#1a0a00', 0)]]); // the lid's shadow
  b.fillRect(-46, -30, 92, 30);
  ellipse(b, 0, 1, IRIS, IRIS);
  b.fillStyle = rad(b, 0, 1, 2, IRIS, [[0, '#d8fff6'], [0.3, '#4af0d8'], [0.75, '#139a94'], [1, '#05403f']]);
  b.fill();
  for (let i = 0; i < 44; i++) { // the fibres of the iris
    const a = (i * TAU) / 44;
    path(b, [[Math.cos(a) * 7.5, 1 + Math.sin(a) * 7.5], [Math.cos(a) * IRIS, 1 + Math.sin(a) * IRIS]], true);
    line(b, i % 2 ? rgba('#e8fffa', 0.3) : rgba('#02302f', 0.35), 0.9);
  }
  ellipse(b, 0, 1, 8, 8);
  b.fillStyle = rgba('#021a1a', 0.5); // the well the pupil moves over
  b.fill();
  ellipse(b, 0, 1, IRIS - 0.6, IRIS - 0.6);
  line(b, rgba('#021a1a', 0.85), 2.2);
  b.restore();
  b.beginPath();
  b.moveTo(...LID_UP[0]);
  b.bezierCurveTo(...LID_UP[1], ...LID_UP[2], ...LID_UP[3]);
  line(b, GOLD_D, 8); // the upper lid, a thick gilt band
  line(b, GOLD, 5);
  line(b, rgba(GILT, 0.9), 1.6);
  b.beginPath();
  b.moveTo(...LID_LOW[0]);
  b.bezierCurveTo(...LID_LOW[1], ...LID_LOW[2], ...LID_LOW[3]);
  gilt(b, 2.6, 1);
  for (let i = 0; i < 9; i++) lash(b, 0.12 + i * 0.095, 9 + (1 - Math.abs(i - 4) / 4) * 7, (i - 4) * 0.07);
  both((s) => { // the points of the eye
    path(b, [[s * 45, 2], [s * 51, -1], [s * 46, -5]]);
    ink(b, GOLD, 1);
  });
  gloss(b, -7, -8, 4, 2.4, 0.8, -0.4); // the glint on the cornea
  almond(l);
  neon(l, GILT, 1.2, 0.4);
  ellipse(l, 0, 1, IRIS, IRIS);
  l.fillStyle = rad(l, 0, 1, 0, IRIS, [[0, rgba('#e8fffa', 0.85)], [0.45, rgba(weak, 0.7)], [1, rgba(weak, 0.2)]]);
  l.fill();
  bloom(l, 0, 1, 34, weak, 0.5);
}

export function sigilEye(b, l, p, S) {
  wheel(b, l, S);
  field(b, l);
  almondEye(b, l, S);
  both((s) => { // a gilt wing each side of the wheel, filling the part's width
    path(b, [[s * 49, -7], [s * 59, -11], [s * 58, 0], [s * 59, 11], [s * 49, 7]]);
    ink(b, lin(b, 0, -11, 0, 11, [[0, GILT], [0.5, GOLD], [1, GOLD_D]]), 1.8);
  });
  bloom(l, 0, 0, 70, S.pal.weak, 0.3);
  ellipse(l, 0, 0, EYE_R, EYE_R);
  neon(l, GOLD, 1, 0.22);
}
