// The Thunder Galleon's deck (World 13, Sunset Armada; see galleon.js): what stands on the deck behind the
// rail, the stores a ship carries (barrels with iron hoops, banded crates, sacks, coils of rope), and the
// rail itself, a brass-capped bar on turned posts with a boarding net slung under it. Drawn either side
// of the bridge; the lanterns that swing from the rail posts are live (galleon-fx.js), HANGERS are
// where they hang from.
import { path, ink, line, lin, rad, rgba, shade, ellipse } from './kit.js';
import { hash } from '../sprites.js';
import { BRASS_L, BRASS_D, TEAK_L, IRON_L, ROPE, ROPE_D, CANVAS, RED, sheer, roundX, metalV, stud, circle } from './galleon-kit.js';

const RAIL = 12; // the rail's height over the hull's top edge
export const HANGERS = [-177, -125, 125, 177].map((x) => [x, sheer(x) - RAIL + 2]);

// A barrel: staves bulging a little, two iron hoops, a lid.
function barrel(b, x, y, w, h) {
  b.beginPath();
  b.moveTo(x - w / 2, y);
  b.quadraticCurveTo(x - w / 2 - 2, y - h / 2, x - w / 2 + 0.5, y - h);
  b.lineTo(x + w / 2 - 0.5, y - h);
  b.quadraticCurveTo(x + w / 2 + 2, y - h / 2, x + w / 2, y);
  b.closePath();
  ink(b, roundX(b, x - w / 2 - 2, x + w / 2 + 2, '#8a5a2e'), 1.6);
  for (let i = 1; i < 4; i++) {
    path(b, [[x - w / 2 + (w * i) / 4, y], [x - w / 2 + (w * i) / 4, y - h]], true);
    line(b, rgba('#000000', 0.3), 0.8);
  }
  for (const k of [0.25, 0.72]) {
    b.beginPath();
    b.moveTo(x - w / 2 - 1, y - h * k);
    b.lineTo(x + w / 2 + 1, y - h * k);
    line(b, '#07040a', 3);
    line(b, IRON_L, 1.6);
  }
  ellipse(b, x, y - h, w / 2 - 0.5, 2.2);
  ink(b, '#b88a52', 1.2);
}

// A crate: a box of planks with a cross-brace and studs.
function crate(b, x, y, w, h) {
  b.beginPath();
  b.rect(x - w / 2, y - h, w, h);
  ink(b, lin(b, 0, y - h, 0, y, [[0, '#a8743a'], [1, '#5c3a1c']]), 1.6);
  path(b, [[x - w / 2, y - h], [x + w / 2, y], [x + w / 2, y - 2], [x - w / 2 + 2, y - h]]);
  path(b, [[x - w / 2 + 1, y - h + 1], [x + w / 2 - 1, y - 1]], true);
  line(b, rgba('#2a160a', 0.7), 2);
  path(b, [[x - w / 2 + 1, y - 1], [x + w / 2 - 1, y - h + 1]], true);
  line(b, rgba('#2a160a', 0.7), 2);
  for (const [sx, sy] of [[x - w / 2 + 2.2, y - h + 2.2], [x + w / 2 - 2.2, y - h + 2.2], [x - w / 2 + 2.2, y - 2.2], [x + w / 2 - 2.2, y - 2.2]]) stud(b, sx, sy, 1.1, IRON_L);
}

// A sack, tied at the neck, one with a red mark on it.
function sack(b, x, y, w, h) {
  b.beginPath();
  b.moveTo(x - w / 2, y);
  b.bezierCurveTo(x - w / 2 - 3, y - h * 0.5, x - 2, y - h * 0.7, x - 1.6, y - h);
  b.lineTo(x + 1.6, y - h);
  b.bezierCurveTo(x + 2, y - h * 0.7, x + w / 2 + 3, y - h * 0.5, x + w / 2, y);
  b.closePath();
  ink(b, rad(b, x - 2, y - h * 0.6, 1, w, [[0, shade(CANVAS, 0.2)], [1, shade(CANVAS, -0.35)]]), 1.5);
  path(b, [[x - 3, y - h * 0.8], [x + 3, y - h * 0.8]], true);
  line(b, ROPE_D, 1.6);
  if (hash(x) < 0.5) { // a red mark stencilled on it
    circle(b, x + 0.5, y - h * 0.38, 2.4);
    ink(b, RED, 0.8);
  }
}

// A coil of rope lying flat: rings of rope, seen at a slant.
function coil(b, x, y, r) {
  circle(b, x, y - 1, r + 1.4);
  b.fillStyle = rgba('#000000', 0.25);
  b.fill();
  for (let i = 0; i < 3; i++) {
    ellipse(b, x, y - 3 - i * 2.2, r - i * 0.8, (r - i * 0.8) * 0.42);
    line(b, '#0a0604', 3.4);
    line(b, ROPE, 2.2);
    b.setLineDash([1, 2]);
    line(b, ROPE_D, 1.6);
    b.setLineDash([]);
  }
}

// x, kind, width, height and how far up it stands (a crate stacked on another).
const STORES = [
  [-218, 'crate', 15, 14], [-200, 'barrel', 12, 17], [-184, 'barrel', 11, 14], [-166, 'sack', 13, 13], [-150, 'coil', 9],
  [-132, 'barrel', 12, 16], [-112, 'crate', 16, 12], [-112, 'crate', 11, 9, 12], [-96, 'sack', 12, 12],
  [218, 'barrel', 12, 16], [202, 'barrel', 11, 13], [186, 'sack', 13, 14], [170, 'crate', 15, 13], [152, 'coil', 9],
  [136, 'barrel', 12, 17], [120, 'sack', 12, 12], [104, 'crate', 14, 12], [92, 'barrel', 10, 13],
];
const KINDS = { barrel, crate, sack, coil };

export function stores(b) {
  for (const [x, kind, w, h, lift = 0] of STORES) KINDS[kind](b, x, sheer(x) + 3 - lift, w, h);
}

// The rail on turned posts, the net under it, a deck lantern's hook on four of them.
export function rail(b) {
  for (const s of [-1, 1]) {
    b.save();
    b.scale(s, 1);
    for (let x = 88; x < 216; x += 9) { // the net
      for (const d of [1, -1]) {
        b.beginPath();
        b.moveTo(x, sheer(x) - RAIL + 3 + (d > 0 ? 0 : 7));
        b.lineTo(x + 9, sheer(x + 9) - RAIL + 3 + (d > 0 ? 7 : 0));
        line(b, rgba(ROPE, 0.55), 0.9);
      }
    }
    for (let x = 86; x <= 216; x += 13) {
      const top = sheer(x) - RAIL;
      b.fillStyle = roundX(b, x - 1.8, x + 1.8, BRASS_D);
      b.fillRect(x - 1.8, top, 3.6, RAIL + 2);
      circle(b, x, top - 0.6, 2.7);
      ink(b, rad(b, x - 0.8, top - 1.4, 0, 2.7, [[0, '#fff4c0'], [0.5, BRASS_L], [1, BRASS_D]]), 1.1);
    }
    b.beginPath();
    for (let x = 84; x <= 218; x += 6) b[x === 84 ? 'moveTo' : 'lineTo'](x, sheer(x) - RAIL + 2);
    line(b, '#0a0c16', 4.8);
    line(b, TEAK_L, 3.2);
    line(b, rgba(BRASS_L, 0.7), 1);
    b.restore();
  }
  for (const [x, y] of HANGERS) {
    path(b, [[x - 2.6, y - 1], [x + 2.6, y - 1], [x + 1.6, y + 3], [x - 1.6, y + 3]]);
    ink(b, metalV(b, y - 1, y + 3, BRASS_L), 1);
  }
}
