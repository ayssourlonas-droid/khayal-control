// The Grand Grimoire's cover (World 12, Starlit Archive; see grimoire.js): the two boards the pages lie
// open upon, old leather worn pale at the edges and tooled with a gilt border and stamped fleurons, a
// row of studs along the foot, a bronze binding down each outer edge and a gilt corner piece on each
// outer corner. Painted for the right-hand board in boss coordinates and mirrored by the caller. Nothing
// rises above y -157: the boss rests at 260 and the HUD ends at 96.
import { path, ink, line, lin, rgba, shade } from './kit.js';
import { mix, hash } from '../sprites.js';
import { GOLD, GILT, gilt, stud, fleuron, curl } from './grimoire-kit.js';

export const CORNER_Y = -153; // where the top corner pieces' points sit, and the plate reaches CORNER_LIP above
export const CORNER_LIP = 3;
export const BINDING = [[332, -154], [348, -153], [350, 119], [334, 118]]; // the bronze strip down the outer edge

// The board's outline: the spine edge, the top, the outer edge and the foot.
export function board(g) {
  g.beginPath();
  g.moveTo(30, -142);
  g.bezierCurveTo(120, -150, 250, -155, 344, -155);
  g.lineTo(347, 118);
  g.bezierCurveTo(250, 126, 120, 132, 30, 138);
  g.closePath();
}

// A gilt corner piece, its point at the origin and the board lying toward +x and +y: an L of bronze
// with a rounded elbow, a scroll engraved in it, rivets along both arms.
function corner(b, S) {
  const { plate } = S.pal;
  b.beginPath();
  b.moveTo(-3, -3);
  b.lineTo(62, -3);
  b.quadraticCurveTo(68, 5, 60, 14);
  b.lineTo(30, 14);
  b.bezierCurveTo(20, 14, 14, 20, 14, 30);
  b.lineTo(14, 60);
  b.quadraticCurveTo(5, 68, -3, 62);
  b.closePath();
  ink(b, lin(b, 0, 0, 40, 40, [[0, shade(plate, 0.6)], [0.5, plate], [1, shade(plate, -0.5)]]), 3);
  b.save();
  b.clip();
  b.beginPath();
  curl(b, 6, 6, 9, 1, 1.6);
  b.lineWidth = 3;
  b.strokeStyle = rgba('#000000', 0.5);
  b.stroke();
  gilt(b, 1.4, 0.9);
  b.beginPath();
  b.moveTo(-3, 5);
  b.lineTo(54, 5);
  b.moveTo(5, -3);
  b.lineTo(5, 54);
  line(b, rgba(GILT, 0.5), 1);
  b.restore();
  for (const [x, y] of [[26, 4], [44, 4], [4, 26], [4, 44]]) stud(b, x, y, 2.3, GOLD);
}

// The leather: lit from the top, shadowed by the gutter, scuffed and grained, its edges worn pale.
function leather(b, S) {
  const base = mix(S.pal.hull, S.pal.plate, 0.3);
  board(b);
  ink(b, lin(b, 0, -160, 0, 138, [[0, shade(base, 0.32)], [0.5, base], [1, shade(base, -0.45)]]), 3.6);
  b.save();
  b.clip();
  b.fillStyle = lin(b, 30, 0, 140, 0, [[0, rgba('#000000', 0.55)], [1, rgba('#000000', 0)]]);
  b.fillRect(30, -170, 110, 320);
  for (let i = 0; i < 320; i++) {
    b.fillStyle = rgba(hash(i * 3 + 2) > 0.5 ? '#ffffff' : '#000000', 0.04 + hash(i + 900) * 0.09);
    b.fillRect(40 + hash(i * 3) * 310, -158 + hash(i * 3 + 1) * 292, 1 + hash(i + 400) * 5, 1 + hash(i + 401) * 1.4);
  }
  board(b);
  b.lineWidth = 8;
  b.strokeStyle = rgba(GILT, 0.16);
  b.stroke();
  b.restore();
}

// The tooling: a gilt border set in from the edge, fleurons stamped along the foot.
function tooling(b) {
  b.save();
  b.translate(190, -10);
  b.scale(0.94, 0.9);
  b.translate(-190, 10);
  board(b);
  gilt(b, 1.6, 0.9);
  b.scale(0.975, 0.97);
  board(b);
  line(b, rgba(GOLD, 0.45), 0.9);
  b.restore();
  for (let x = 118; x < 330; x += 25) {
    fleuron(b, x, 114 + (x - 118) * -0.022, 8);
    if (x % 50 < 25) stud(b, x + 12.5, 118 + (x - 118) * -0.026 + 6, 2.6, GOLD);
  }
  b.beginPath(); // a vine of gilt running along the foot between the stamps
  for (let x = 104; x <= 334; x += 4) b.lineTo(x, 121 - (x - 104) * 0.03 + Math.sin(x * 0.17) * 2.4);
  line(b, rgba(GOLD, 0.6), 1);
}

// The bronze binding down the outer edge, riveted, with a gilt line along its inner side.
function binding(b, S) {
  const { plate } = S.pal;
  path(b, BINDING);
  ink(b, lin(b, 332, 0, 350, 0, [[0, shade(plate, 0.4)], [0.5, plate], [1, shade(plate, -0.55)]]), 2.6);
  b.beginPath();
  b.moveTo(334.5, -150);
  b.lineTo(336.5, 115);
  gilt(b, 1.2, 0.7);
  for (let y = -140; y < 110; y += 31) stud(b, 342, y + (y + 140) * 0.012, 2.4, GILT);
}

export function cover(b, S) {
  leather(b, S);
  tooling(b);
  binding(b, S);
  for (const [y, k] of [[CORNER_Y, 1], [118, -1]]) { // the corner pieces, the foot's flipped
    b.save();
    b.translate(347, y);
    b.scale(-1, k);
    corner(b, S);
    b.restore();
  }
}
