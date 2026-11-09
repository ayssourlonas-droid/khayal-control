// The Lantern Leviathan's flanks (World 15, Lantern Deep; see angler.js), the hull's share: the root of each
// pectoral fin, a thick mound of muscle with the fin laid over it (angler-fin.js), and below it the gill cover, a
// raised, wrinkled lobe of flesh with its ridges and its gill slits: dark crescents with a wet lip, a faint violet
// glow deep in each where the gills show through. Painted in boss coordinates for both sides.
import { path, line, lin, rad, rgba, ellipse } from './kit.js';
import { spline } from './galleon-kit.js';
import { INK } from './angler-kit.js';
import { texture } from './angler-skin.js';

// The cover's outline, the right-hand one (x > 0): it hugs the cheek beside the jaw's corner.
const COVER = [[238, 14], [248, 44], [240, 84], [220, 110], [196, 118], [190, 90], [196, 56], [214, 28]];
// The slits, each a crescent from its upper end to its lower, bowed toward the middle of the head.
const SLITS = [[[220, 40], [212, 60], [215, 82]], [[228, 46], [221, 66], [224, 88]], [[236, 54], [230, 72], [232, 92]]];

function root(b, s) {
  const x = s * 234;
  ellipse(b, x, -28, 30, 58);
  b.fillStyle = rad(b, x - s * 10, -52, 4, 80, [[0, '#2a5270'], [0.5, '#0f2d46'], [1, '#050f1c']]);
  b.fill();
  line(b, INK, 2.6);
  for (let i = -4; i <= 4; i++) { // the muscle's grain running out to the fin
    path(b, [[x - s * 18, -26 + i * 12], [x + s * 22, -26 + i * 17]], true);
    line(b, rgba('#000812', 0.35), 1.6);
    path(b, [[x - s * 18, -25 + i * 12], [x + s * 22, -25 + i * 17]], true);
    line(b, rgba('#8ac8e0', 0.12), 0.9);
  }
}

function slit(b, l, s, [p0, c, p1]) {
  for (const [dy, col, w] of [[2.4, rgba('#b4e4f8', 0.34), 3.4], [0, rgba('#010610', 0.92), 3.6]]) {
    b.beginPath();
    b.moveTo(s * p0[0], p0[1] + dy);
    b.quadraticCurveTo(s * c[0], c[1] + dy, s * p1[0], p1[1] + dy);
    line(b, col, w);
  }
  l.beginPath();
  l.moveTo(s * p0[0], p0[1] + 2);
  l.quadraticCurveTo(s * c[0], c[1] + 2, s * p1[0], p1[1] + 2);
  line(l, rgba('#c08aff', 0.22), 1.4);
}

function cover(b, l, s) {
  const pts = COVER.map(([x, y]) => [s * x, y]);
  b.beginPath();
  b.moveTo(...pts[0]);
  spline(b, pts, true);
  b.closePath();
  b.fillStyle = lin(b, s * 250, 0, s * 190, 0, [[0, '#0a2034'], [0.5, '#17405c'], [1, '#2a5a7a']]);
  b.fill();
  line(b, INK, 3);
  b.save();
  b.clip();
  texture(b, 31 + s, [s > 0 ? 186 : -252, 10, s > 0 ? 252 : -186, 122], 0.8);
  for (let i = 0; i < 5; i++) { // wrinkles of the cover, fanning from its hinge
    path(b, [[s * 244, 24], [s * (200 + i * 4), 60 + i * 12]], true);
    line(b, rgba('#000812', 0.36), 1.7);
  }
  b.restore();
  for (const sl of SLITS) slit(b, l, s, sl);
  path(b, [[s * 214, 28], [s * 196, 56], [s * 190, 90], [s * 196, 118]], true);
  line(b, rgba('#bfeaff', 0.42), 1.6);
}

export function gills(b, l) {
  for (const s of [-1, 1]) {
    root(b, s);
    cover(b, l, s);
  }
}
