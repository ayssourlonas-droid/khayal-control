// The Grand Carousel's hanging lantern (World 14, Ember Carnival; see carousel.js): a weak part 90 x 104 for
// the hit box, drawn once as the left one and mirrored for the right. A scrolled bracket on the floor's rim
// carries a chain, and on the chain a gilt-framed lantern: a pagoda roof with a bulb at each eave, three
// panes of pale glass round an aether flame burning cyan, a footing and an acorn pendant with a tassel.
import { path, ink, line, lin, rad, rgba, ellipse, bloom, eye } from './kit.js';
import { GILT, GILT_L, GILT_D, GILT_DD, CYAN, INK, giltX, giltV, stud, bulb, volute, tassel, circle } from './carousel-kit.js';

export const FLAME = [0, 10]; // the aether flame's centre in the part's frame

// The bracket on the rim: a shield plate with a scroll to each side and a ring, then three links of chain.
function bracket(b) {
  path(b, [[-15, -52], [15, -52], [13, -38], [0, -31], [-13, -38]]);
  ink(b, giltV(b, -52, -31), 2.2);
  volute(b, -12, -43, 7, -1, GILT_L, 2.8);
  volute(b, 12, -43, 7, 1, GILT_L, 2.8);
  stud(b, 0, -45, 2.4);
  for (let i = 0; i < 3; i++) {
    ellipse(b, 0, -29.5 + i * 7.4, i % 2 ? 2 : 3.2, 4);
    line(b, INK, 3.6);
    line(b, i % 2 ? GILT_D : GILT, 2);
  }
}

// The roof: a flared cap with an upturned eave, a bulb at each corner, a finial on the ridge.
function roof(b, l) {
  path(b, [[-6, -12], [6, -12], [10, -17], [-10, -17]]);
  ink(b, giltX(b, -10, 10), 1.6);
  b.beginPath();
  b.moveTo(-31, -2);
  b.quadraticCurveTo(-20, -4, -10, -12);
  b.lineTo(10, -12);
  b.quadraticCurveTo(20, -4, 31, -2);
  b.quadraticCurveTo(26, 2, 21, 3);
  b.lineTo(-21, 3);
  b.quadraticCurveTo(-26, 2, -31, -2);
  b.closePath();
  ink(b, giltV(b, -12, 3), 2.4);
  b.beginPath();
  b.moveTo(-20, 0);
  b.lineTo(20, 0);
  line(b, rgba(GILT_DD, 0.7), 1.2);
  b.beginPath();
  b.moveTo(-26, -2);
  b.quadraticCurveTo(-16, -5, -8, -11);
  line(b, rgba('#ffffff', 0.45), 1);
  circle(b, 0, -20, 3.4);
  ink(b, rad(b, 0, -20, 0, 3.4, [[0, '#fff'], [0.5, GILT_L], [1, GILT_D]], -1, -21), 1.4);
  for (const x of [-27, 27]) bulb(b, l, x, 3.6, 2.5, '#ffe9a0', 0.6);
  eye(l, 0, -20, 1.6, '#fff0b0', 4);
}

// The cage: three panes of pale glass (the middle one square-on, the others turned away), gilt posts between,
// the aether flame in the middle of it.
function cage(b, l) {
  const [x0, x1, y0, y1] = [-22, 22, 3, 31];
  b.beginPath();
  b.rect(x0, y0, x1 - x0, y1 - y0);
  b.fillStyle = lin(b, x0, 0, x1, 0, [[0, '#7ad8e8'], [0.5, '#d8fbff'], [1, '#5ac0d8']]);
  b.fill();
  line(b, INK, 2.4);
  b.fillStyle = rad(b, FLAME[0], FLAME[1], 0, 20, [[0, '#ffffff'], [0.3, CYAN], [1, rgba('#0a5a78', 0.7)]]);
  b.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (const [px, w] of [[-22, 4.4], [-8, 3.2], [8, 3.2], [22, 4.4]]) { // posts
    b.fillStyle = giltX(b, px - w / 2, px + w / 2);
    b.fillRect(px - w / 2, y0, w, y1 - y0);
    b.beginPath();
    b.rect(px - w / 2, y0, w, y1 - y0);
    line(b, INK, 1.1);
  }
  b.beginPath(); // a glint across the glass
  b.moveTo(-17, y0 + 4);
  b.lineTo(-11, y0 + 4);
  b.lineTo(-15, y1 - 5);
  b.lineTo(-19, y1 - 5);
  b.closePath();
  b.fillStyle = rgba('#ffffff', 0.4);
  b.fill();
  circle(b, FLAME[0], FLAME[1] + 1, 7.6); // the flame: a dark ring, a white-hot heart
  ink(b, rad(b, FLAME[0], FLAME[1] + 1, 0, 7.6, [[0, '#ffffff'], [0.45, '#b8ffff'], [1, CYAN]]), 1.4);
  circle(l, FLAME[0], FLAME[1] + 1, 7.6);
  l.fillStyle = rgba(CYAN, 0.85);
  l.fill();
  eye(l, FLAME[0], FLAME[1] + 1, 4.6, '#e8ffff', 4.4);
  bloom(l, FLAME[0], FLAME[1], 46, CYAN, 0.4);
  for (const px of [-8, 8]) {
    l.beginPath();
    l.moveTo(px, y0);
    l.lineTo(px, y1);
    line(l, rgba(CYAN, 0.35), 1);
  }
}

// The footing and the pendant: a gilt dish under the glass, an acorn, a tassel.
function foot(b) {
  b.beginPath();
  b.moveTo(-24, 31);
  b.lineTo(24, 31);
  b.quadraticCurveTo(20, 38, 8, 39);
  b.lineTo(-8, 39);
  b.quadraticCurveTo(-20, 38, -24, 31);
  b.closePath();
  ink(b, giltV(b, 31, 39), 2);
  for (const x of [-16, 0, 16]) stud(b, x, 34, 1.5);
  ellipse(b, 0, 43, 5.4, 4.6);
  ink(b, rad(b, 0, 43, 0, 5.4, [[0, '#fff'], [0.4, GILT_L], [1, GILT_D]], -1.6, 41.5), 1.5);
  tassel(b, 0, 46, 9, GILT);
}

export function lamp(b, l) {
  bracket(b);
  cage(b, l);
  roof(b, l);
  foot(b);
}
