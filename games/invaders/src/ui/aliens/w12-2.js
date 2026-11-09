// World 12, Starlit Archive, more of the guard (see w12.js): the spellbook that floats at the ship and
// snaps open to fire. Shut here, thrown open in w12-book.js; the bronze owl bookend that stands in front
// of its own upright plate is in w12-4.js.
import { path, ink, lin, rgba, shade, eye, bloom, gloss, line, ellipse } from './kit.js';
import { hash } from '../sprites.js';
import { GOLD, GILT, PAPER, BRONZE, rrect } from './w12-kit.js';
import { flung } from './w12-book.js';

// A bronze cap on a corner of the book, its right angle at (x, y) and the legs running (dx, dy) ways.
function cap(g, x, y, dx, dy) {
  path(g, [[x, y], [x + dx * 13, y], [x + dx * 3, y + dy * 3], [x, y + dy * 13]]);
  ink(g, lin(g, x, y, x + dx * 12, y + dy * 12, [[0, shade(BRONZE, 0.55)], [0.5, BRONZE], [1, shade(BRONZE, -0.5)]]), 1.8);
  path(g, [[x + dx * 2.4, y + dy * 2.4], [x + dx * 9, y + dy * 2.4]], true);
  line(g, rgba('#ffffff', 0.55), 1);
}

// The book shut: worn red leather with a gilt frame and a watching eye tooled on its cover, a spine
// banded in gold, bronze corner caps and a clasp, the page block showing at the right and the foot, a
// ribbon hanging from it. A seam of light shows between the boards: it is about to open.
function shut(b, l, hide) {
  for (const g of [b, l]) {
    g.save();
    g.rotate(-0.05);
  }
  path(b, [[-18, -24], [27, -24], [27, 33], [-18, 33]]); // the page block behind the cover
  ink(b, PAPER, 2.6);
  b.save();
  b.clip();
  for (let i = 0; i < 10; i++) { // leaves, edge on
    path(b, [[24 + i * 0.4, -24], [24 + i * 0.4, 33]], true);
    line(b, rgba('#6a4a2a', 0.3), 0.8);
    path(b, [[-18, 29.6 + i * 0.4], [27, 29.6 + i * 0.4]], true);
    line(b, rgba('#6a4a2a', 0.3), 0.8);
  }
  b.restore();
  path(b, [[8, 33], [4, 34], [3, 47], [8, 43.4], [13, 47], [12, 34]]); // the ribbon
  ink(b, '#d4a23a', 1.8);
  path(b, [[8, 36], [8, 43]], true);
  line(b, rgba('#7a5a14', 0.6), 1);
  rrect(b, -23, -29, 46, 58, 3.5);
  ink(b, lin(b, -23, -29, 23, 29, [[0, shade(hide, 0.35)], [0.45, hide], [1, shade(hide, -0.55)]]), 3);
  b.save();
  b.clip();
  for (let i = 0; i < 46; i++) { // the grain of the hide, and where it is rubbed pale
    const [x, y] = [-22 + hash(i * 3) * 44, -28 + hash(i * 3 + 1) * 56];
    path(b, [[x, y], [x + 3 + hash(i) * 3, y + 1.2 * (hash(i + 9) - 0.5)]], true);
    line(b, rgba(hash(i * 5) > 0.7 ? '#ffd9a0' : '#000000', hash(i * 5) > 0.7 ? 0.16 : 0.2), 1);
  }
  b.fillStyle = rgba('#000000', 0.34); // the spine's side, in shade, banded in gold
  b.fillRect(-23, -29, 6, 58);
  b.fillStyle = rgba('#ffffff', 0.12);
  b.fillRect(-17, -29, 1, 58);
  for (const y of [-21, -2, 17]) {
    b.fillStyle = GILT;
    b.fillRect(-23, y, 6, 2);
  }
  b.restore();
  rrect(b, -18, -24, 38, 48, 2);
  line(b, GILT, 1.4);
  rrect(b, -16, -22, 34, 44, 1.5);
  line(b, rgba(GILT, 0.5), 0.8);
  for (const [x, y, dx, dy] of [[-23, -29, 1, 1], [23, -29, -1, 1], [-23, 29, 1, -1], [23, 29, -1, -1]]) cap(b, x, y, dx, dy);
  ellipse(b, 1, -1, 11, 11); // the sigil: a ring of rays round a watching eye
  line(b, GILT, 1.6);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    path(b, [[1 + Math.cos(a) * 12.4, -1 + Math.sin(a) * 12.4], [1 + Math.cos(a) * 15.4, -1 + Math.sin(a) * 15.4]], true);
    line(b, GILT, 1.2);
  }
  b.beginPath();
  b.moveTo(-8, -1);
  b.quadraticCurveTo(1, -10, 10, -1);
  b.quadraticCurveTo(1, 8, -8, -1);
  ink(b, '#1a0e20', 1.4);
  ellipse(b, 1, -1, 3.4, 3.4);
  b.fillStyle = GILT;
  b.fill();
  rrect(b, 14, -5, 15, 10, 1.5); // the clasp across the fore-edge
  ink(b, lin(b, 0, -5, 0, 5, [[0, shade(BRONZE, 0.5)], [1, shade(BRONZE, -0.5)]]), 1.8);
  ellipse(b, 19, 0, 3.4, 3.4);
  ink(b, shade(BRONZE, 0.2), 1.4);
  gloss(b, -10, -22, 9, 3.6, 0.4, -0.35);
  path(l, [[-18, 33.6], [27, 33.6]], true); // light between the boards and the leaves
  line(l, rgba(GOLD, 0.8), 1.6);
  path(l, [[27.6, -24], [27.6, 33]], true);
  line(l, rgba(GOLD, 0.55), 1.2);
  eye(l, 1, -1, 2.6, GOLD, 4.6);
  rrect(l, -18, -24, 38, 48, 2);
  line(l, rgba(GOLD, 0.35), 1.2);
  bloom(l, 1, -1, 30, GOLD, 0.22);
  for (const g of [b, l]) g.restore();
}

// A floating spellbook: shut on one beat, thrown open with a bolt of ink and gold at its foot on the other.
export function gunner(b, l, f, c) {
  const hide = shade(c, -0.3);
  if (f) flung(b, l, hide);
  else shut(b, l, hide);
}
