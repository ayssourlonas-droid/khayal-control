// Things standing on the pavement of World 17's near layer, each on its own foot line `base`: a bench (cast-iron ends with
// scrolled arms, three seat slats and a slatted back), a bollard (an iron post with a rounded top and a pale band), a
// lamp-post stump (a fluted foot and a shaft snapped off in a jagged break, the lamp arm hanging by its cable), a wire
// litter bin with paper heaped above its rim, and a tree pit (an iron frame round the earth, a stake, a young bare tree: the
// 'over' pass puts its leaves on). Dark, low and calm: dust (the ash) lies on every top in the smog (`dust`), the iron
// has a thin light edge. The palette gives every colour.
import { box, poly, strokes, speckle } from './parallax-smog-kit.js';
import { rgba } from './sprites.js';
import { grow, bare } from './parallax-smog-mid-tree.js';
import { BENCH, BOLLARDS, STUMP, BIN, PIT } from './parallax-smog-near-plan.js';

export const SAPLING = grow(41, PIT.x, PIT.base - 6, 70, 3.6);

function bench(g, P, r) {
  const [x0, b] = [BENCH.x - 52, BENCH.base];
  for (const lx of [x0 + 6, x0 + 92]) { // cast ends
    strokes(g, P.iron, 3.4, [[lx, b - 22, lx - 1, b - 2], [lx - 5, b, lx + 7, b], [lx + 1, b - 44, lx, b - 22]]);
    g.save();
    g.strokeStyle = P.iron;
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(lx + 1, b - 30);
    g.quadraticCurveTo(lx + 13, b - 31, lx + 12, b - 22);
    g.stroke();
    g.restore();
  }
  for (let k = 0; k < 3; k++) { // the back
    box(g, P.wood, x0 + 2, b - 43 + k * 7, 96, 5);
    box(g, P.woodHi, x0 + 2, b - 43 + k * 7, 96, 1, 0.55);
  }
  box(g, P.wood, x0, b - 24, 100, 4.4); // the seat
  box(g, P.woodHi, x0, b - 24, 100, 1.1, 0.55);
  box(g, P.joint, x0, b - 19.6, 100, 1.6, 0.55);
  box(g, P.ash, x0 + 3, b - 25, 94, 1.6, P.ashA * 0.8);
  speckle(g, r, x0, b - 44, 100, 24, 40, [P.joint, P.edge], 0.3, 1.6);
}

function bollard(g, P, x, b) {
  box(g, P.iron, x - 6.5, b - 30, 13, 30);
  g.beginPath();
  g.arc(x, b - 30, 6.5, Math.PI, 0);
  g.fillStyle = P.iron;
  g.fill();
  box(g, P.ironHi, x + 3, b - 30, 1.2, 30, 0.6);
  box(g, P.plinthHi, x - 6.5, b - 20, 13, 3.4, 0.45);
  box(g, P.iron, x - 9, b - 5, 18, 5);
  box(g, P.ash, x - 6, b - 37, 12, 1.4, P.ashA * 0.8);
}

function stump(g, P, r) {
  const [x, b, h] = [STUMP.x, STUMP.base, STUMP.h];
  poly(g, [[x - 11, b], [x - 9, b - 26], [x - 5, b - 30], [x - 4, b - h + 8], [x - 2, b - h - 6], [x + 1, b - h + 4], [x + 3, b - h - 10], [x + 4.4, b - h + 6], [x + 5, b - 30], [x + 9, b - 26], [x + 11, b]]);
  g.fillStyle = P.iron;
  g.fill();
  box(g, P.ironHi, x + 3, b - h + 8, 1.3, h - 36, 0.5);
  box(g, P.ironHi, x + 7, b - 26, 1.4, 26, 0.45);
  box(g, P.plinthHi, x - 12, b - 8, 24, 3, 0.7);
  box(g, P.plinthHi, x - 7, b - 32, 14, 3, 0.7);
  g.save(); // the arm hangs by its cable
  g.strokeStyle = P.iron;
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(x + 2, b - h + 6);
  g.quadraticCurveTo(x + 26, b - h + 4, x + 24, b - h + 26);
  g.stroke();
  g.restore();
  box(g, P.iron, x + 19, b - h + 24, 11, 6);
  speckle(g, r, x - 9, b - h, 18, h, 30, [P.joint, P.edge], 0.3, 1.6);
}

function bin(g, P, r) {
  const [x, b] = [BIN.x, BIN.base];
  box(g, P.bin, x - 13, b - 34, 26, 34);
  const mesh = [];
  for (let k = 0; k < 6; k++) mesh.push([x - 13 + k * 5.4, b - 34, x - 13 + k * 5.4, b]);
  for (let k = 0; k < 5; k++) mesh.push([x - 13, b - 30 + k * 7, x + 13, b - 30 + k * 7]);
  strokes(g, rgba(P.joint, 0.7), 0.9, mesh);
  box(g, P.iron, x - 15, b - 37, 30, 4);
  box(g, P.ironHi, x - 15, b - 37, 30, 1, 0.55);
  box(g, P.iron, x - 14, b - 2, 28, 3);
  for (let k = 0; k < 4; k++) {
    poly(g, [[x - 11 + k * 6, b - 37], [x - 9 + k * 6, b - 42 - r() * 4], [x - 5 + k * 6, b - 38]]);
    g.fillStyle = rgba(P.paper, P.litterA * 0.55);
    g.fill();
  }
}

function pit(g, P) {
  const [x, b] = [PIT.x, PIT.base];
  box(g, P.iron, x - 24, b - 6, 48, 6);
  box(g, P.soil, x - 21, b - 7, 42, 3);
  box(g, P.ironHi, x - 24, b - 6, 48, 1, 0.5);
  strokes(g, P.wood, 2.2, [[x + 9, b - 4, x + 9, b - 70]]); // the stake
  bare(g, P, SAPLING);
  strokes(g, P.iron, 1.2, [[x + 3, b - 36, x + 9, b - 38]]); // its tie
}

export function props(g, P, r) {
  g.save();
  bench(g, P, r);
  for (const b of BOLLARDS) bollard(g, P, b.x, b.base);
  stump(g, P, r);
  bin(g, P, r);
  pit(g, P);
  g.restore();
}
