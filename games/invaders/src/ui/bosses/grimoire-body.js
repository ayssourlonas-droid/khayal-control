// The Grand Grimoire's body (World 12, Starlit Archive; see grimoire.js): the cover boards, the fanned
// leaves standing out behind each page block, the spine between the two spreads with its raised bands,
// and the bronze medallion the sigil-eye sits in. The pages, eye, crown, quills and clasp are the
// parts (grimoire-pages.js, -eye.js, -crown.js, -quill.js, -clasp.js). The later phases light the
// script brighter (the ghost leaves fanning wider are live, grimoire-fx.js).
import { path, ink, line, lin, rad, rgba, shade, neon, bloom, both, ellipse } from './kit.js';
import { mix } from '../sprites.js';
import { TAU } from '../../core/math.js';
import { cover } from './grimoire-cover.js';
import { GOLD, GILT, PARCH, leaf, gilt, stud } from './grimoire-kit.js';

export const PAGE_AT = [205, -20]; // where each page block sits (the right one; the left is its mirror)
export const MEDAL = { x: 0, y: -30, r: 68 };

// Leaves fanned out behind a page block, the outermost first: [dx, dy, tilt, scale, shade]. Each is a little
// larger than the block, shifted up and out and tipped outward about its lower outer corner, so a rim of
// them shows above and beside it, the outermost no higher than y -156 (the HUD ends at 96, the boss rests
// at 260).
export const FAN = [[-7, -5, -0.042, 1.04, -0.34], [-4.6, -3.4, -0.028, 1.028, -0.24], [-2.3, -1.7, -0.014, 1.014, -0.14]];

// Run draw(s) in the frame of the page block on side s: its centre the origin, its gutter edge toward +x.
export function inPage(g, s, draw) {
  g.save();
  g.translate(s * PAGE_AT[0], PAGE_AT[1]);
  g.scale(-s, 1);
  draw();
  g.restore();
}

function fans(b) {
  both((s) => inPage(b, s, () => FAN.forEach(([dx, dy, tilt, k, dim]) => {
    b.save();
    b.translate(dx - 127, dy + 98);
    b.rotate(tilt);
    b.scale(k, k);
    b.translate(127, -98);
    leaf(b);
    ink(b, lin(b, 125, 0, -125, 0, [[0, '#7a5a30'], [0.3, shade(PARCH, dim)], [1, shade(PARCH, dim + 0.12)]]), 2.4);
    leaf(b);
    line(b, rgba(GOLD, 0.7 + dim * 0.5), 1); // the gilt of the page edges
    b.restore();
  })));
}

// Two silk bookmarks hanging out under the spine either side of the clasp: indigo, a gilt thread down
// each edge, the tails cut in a swallow-tail.
function ribbons(b) {
  both((s) => {
    b.save();
    b.scale(s, 1);
    b.beginPath();
    b.moveTo(43, 112);
    b.bezierCurveTo(42, 134, 46, 146, 44, 164);
    b.lineTo(50, 156);
    b.lineTo(56, 165);
    b.bezierCurveTo(55, 146, 58, 132, 56, 112);
    b.closePath();
    ink(b, lin(b, 43, 0, 57, 0, [[0, '#14125a'], [0.45, '#3a3ab0'], [1, '#16145e']]), 2.2);
    b.beginPath();
    b.moveTo(46.4, 118);
    b.bezierCurveTo(45.6, 134, 49, 146, 47, 160);
    b.moveTo(53.6, 118);
    b.bezierCurveTo(54, 134, 56, 146, 54.6, 160);
    line(b, rgba(GOLD, 0.75), 0.8);
    b.restore();
  });
}

// The spine: a rounded bar of leather between the spreads, gadroons stamped down it, raised bands
// across it in gilt, a bronze anchor for the clasp's strap.
function spine(b, S) {
  const base = mix(S.pal.hull, S.pal.plate, 0.22);
  b.beginPath();
  b.moveTo(-86, -128);
  b.quadraticCurveTo(0, -142, 86, -128);
  b.lineTo(86, 124);
  b.quadraticCurveTo(0, 140, -86, 124);
  b.closePath();
  ink(b, lin(b, -86, 0, 86, 0, [[0, shade(base, -0.55)], [0.22, shade(base, 0.05)], [0.5, shade(base, 0.38)], [0.78, shade(base, 0.05)], [1, shade(base, -0.55)]]), 3.6);
  b.save();
  b.clip();
  for (let y = -130; y < 130; y += 5) for (let x = -80; x < 82; x += 8) { // gadroons: little lens-shaped stamps
    ellipse(b, x + (y % 10 ? 4 : 0), y, 2.6, 1.4);
    b.fillStyle = rgba('#000000', 0.2);
    b.fill();
  }
  for (const y of [-120, -108, 52, 70, 90, 108, 124]) { // raised bands
    b.beginPath();
    b.moveTo(-88, y);
    b.quadraticCurveTo(0, y + 5, 88, y);
    b.lineWidth = 6;
    b.strokeStyle = rgba('#000000', 0.45);
    b.stroke();
    gilt(b, 2.6, 1);
  }
  b.restore();
  ellipse(b, 0, 34, 15, 11); // the strap's anchor
  ink(b, lin(b, 0, 23, 0, 45, [[0, shade(S.pal.plate, 0.6)], [1, shade(S.pal.plate, -0.5)]]), 2.6);
  stud(b, 0, 34, 4.5, GILT);
}

// The medallion behind the eye: a bronze disc with a sunburst engraved in it, a scalloped rim, gilt rings.
function medallion(b, l, S) {
  const { x, y, r } = MEDAL;
  const { plate } = S.pal;
  b.beginPath();
  for (let i = 0; i < 28; i++) { // the scalloped rim
    const a0 = (i * TAU) / 28;
    b.arc(x + Math.cos(a0 + 0.11) * r * 0.98, y + Math.sin(a0 + 0.11) * r * 0.98, 4.4, 0, TAU);
    b.moveTo(x + Math.cos(a0 + 0.22) * r * 0.98, y + Math.sin(a0 + 0.22) * r * 0.98);
  }
  b.fillStyle = shade(plate, -0.4);
  b.fill();
  ellipse(b, x, y, r - 2, r - 2);
  ink(b, rad(b, x, y, 0, r, [[0, shade(plate, 0.75)], [0.6, shade(plate, 0.3)], [1, shade(plate, -0.15)]], x - 20, y - 24), 3);
  for (let i = 0; i < 36; i++) { // rays, light and dark in turn
    const a = (i * TAU) / 36;
    path(b, [[x + Math.cos(a) * 36, y + Math.sin(a) * 36], [x + Math.cos(a + 0.087) * (r - 5), y + Math.sin(a + 0.087) * (r - 5)], [x + Math.cos(a + 0.174) * 36, y + Math.sin(a + 0.174) * 36]]);
    b.fillStyle = rgba(i % 2 ? '#000000' : GILT, i % 2 ? 0.4 : 0.5);
    b.fill();
  }
  for (const rr of [r - 6, 54.5]) {
    ellipse(b, x, y, rr, rr);
    gilt(b, 1.8, 0.95);
  }
  for (let i = 0; i < 12; i++) { // studs where the rim meets the rays
    const a = (i * TAU) / 12 + 0.26;
    stud(b, x + Math.cos(a) * (r - 6), y + Math.sin(a) * (r - 6), 2.5, GILT);
  }
  ellipse(l, x, y, r - 6, r - 6);
  neon(l, GOLD, 1, 0.3);
}

export function body(b, l, S) {
  both((s) => {
    b.save();
    b.scale(s, 1);
    cover(b, S);
    b.restore();
  });
  fans(b);
  ribbons(b);
  spine(b, S);
  medallion(b, l, S);
  bloom(l, 0, -20, 320, GOLD, 0.07);
  bloom(l, 0, -30, 90, '#fff0c0', 0.06);
}

// The phases' lights over the hull: a glow behind the spread (the script itself burns brighter in the
// live extras, grimoire-fx.js, since the pages' bodies cover the hull here).
export const rage = [null, (l) => {
  bloom(l, 0, -20, 300, GOLD, 0.03);
}, (l, S) => {
  bloom(l, 0, -20, 330, GOLD, 0.05);
  bloom(l, MEDAL.x, MEDAL.y, 120, S.pal.weak, 0.1);
}];
