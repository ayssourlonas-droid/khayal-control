// The Crystal Wyrm's head (World 11, Aurora Kingdom; see wyrm.js): a skull cut from ice like a gem, a
// mesh of facets lit from the upper left, two swept-back horns, a heavy brow over eyes that burn
// frost-white, a muzzle with slit nostrils and two long fangs, a jewel in the forehead. Painted at the
// part's centre, 140 x 100 for the hit box, the horns and cheek spikes overhanging it (a wide margin).
import { path, ink, line, lin, rad, rgba, shade, eye, bloom, neon, both } from './kit.js';
import { mix, hash } from '../sprites.js';

export const EYE = '#e8ffff'; // the eyes, the gems, the breath: frost
const POINTS = [[0, -48], [30, -44], [56, -30], [68, -8], [60, 18], [46, 34], [26, 42], [14, 50], [0, 46], [0, -22], [28, -24], [46, -6], [0, 6], [30, 6], [16, 28], [44, 14]];
const TRIS = [[0, 1, 9], [1, 10, 9], [1, 2, 10], [2, 11, 10], [2, 3, 11], [9, 10, 12], [10, 13, 12], [10, 11, 13], [11, 3, 15], [11, 15, 13], [3, 4, 15], [4, 5, 15], [13, 15, 14], [15, 5, 6], [15, 6, 14], [12, 13, 14], [12, 14, 8], [14, 6, 7], [14, 7, 8]];

// The skull: every facet of the right half and its mirror, each its own shade, the light from the upper left.
function skull(b, base) {
  both((s) => TRIS.forEach((t, i) => {
    const pts = t.map((k) => [POINTS[k][0] * s, POINTS[k][1]]);
    const [cx, cy] = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
    const k = 0.14 - 0.0035 * cx - 0.003 * cy + (hash(i * 3 + (s > 0 ? 1 : 0)) - 0.5) * 0.3;
    path(b, pts);
    b.fillStyle = shade(base, k);
    b.fill();
    line(b, rgba('#06304a', 0.5), 1);
  }));
  both((s) => { // the lit rim along the brow and the cheek
    path(b, [[0, -48], [30 * s, -44], [56 * s, -30], [68 * s, -8], [60 * s, 18]], true);
    line(b, rgba('#ffffff', s < 0 ? 0.55 : 0.25), 1.6);
  });
  path(b, [...POINTS.slice(0, 9).map(([x, y]) => [x, y]), ...POINTS.slice(0, 9).toReversed().map(([x, y]) => [-x, y])]);
  line(b, '#0a0c16', 3.4);
}

// A horn: a blade of crystal swept back and out from the temple, its ridge lit.
function horn(b, s, base, [x0, y0, tx, ty, bend]) {
  b.beginPath();
  b.moveTo(s * x0, y0);
  b.bezierCurveTo(s * (x0 + bend), y0 - 14, s * (tx - bend * 0.6), ty + 30, s * tx, ty);
  b.bezierCurveTo(s * (tx - bend * 1.2), ty + 26, s * (x0 - 4), y0 - 26, s * (x0 - 8), y0 - 20);
  b.closePath();
  ink(b, lin(b, 0, ty, 0, y0, [[0, shade(base, 0.55)], [1, shade(base, -0.2)]]), 2.6);
  path(b, [[s * x0, y0], [s * (x0 + bend * 0.5), y0 - 28], [s * tx, ty]], true);
  line(b, rgba('#ffffff', 0.5), 1.2);
}

export function head(b, l, p, S) {
  const { plate } = S.pal;
  const base = mix(plate, '#2a62b8', 0.42);
  both((s) => {
    horn(b, s, base, [46, -12, 106, -90, 28]);
    horn(b, s, base, [58, 8, 98, -6, 20]);
  });
  skull(b, base);
  both((s) => { // heavy brows, and a socket under each, dark
    path(b, [[s * 12, -22], [s * 48, -34], [s * 66, -14], [s * 52, -17], [s * 20, -9]]);
    ink(b, lin(b, 0, -34, 0, -9, [[0, shade(base, 0.2)], [1, shade(base, -0.5)]]), 2.4);
    path(b, [[s * 15, -14], [s * 44, -24], [s * 44, -6], [s * 24, -1]]);
    ink(b, '#06182c', 1.6);
    for (const [x, y] of [[26, -29], [38, -31], [50, -28]]) { // icicles hung from the brow
      path(b, [[s * (x - 2.4), y + 4], [s * (x + 2.4), y + 4], [s * x, y + 15]]);
      ink(b, '#d8f2ff', 1);
    }
    path(b, [[s * 12, 30], [s * 11, 24], [s * 23, 25]]); // nostril: a slit with frost leaking from it
    ink(b, '#06182c', 1.2);
    path(b, [[s * 22, 44], [s * 28, 46], [s * 36, 70], [s * 23, 50]]); // a long fang each side
    ink(b, '#e8f8ff', 1.6);
    path(b, [[s * 57, 4], [s * 78, 12], [s * 62, 26]]); // a spike at the jaw's corner
    ink(b, shade(base, 0.25), 1.8);
    eye(l, s * 31, -12, 4.6, EYE, 4.8);
    path(l, [[s * 17, -9], [s * 44, -17], [s * 40, -8], [s * 23, -4]]);
    l.fillStyle = rgba(EYE, 0.75);
    l.fill();
    path(l, [[s * 12, -22], [s * 48, -34]], true);
    neon(l, '#5ad0ff', 0.7, 0.3);
    bloom(l, s * 14, 27, 12, EYE, 0.3);
  });
  path(b, [[0, -42], [7, -33], [0, -23], [-7, -33]]); // the forehead jewel
  ink(b, rad(b, -2, -36, 0, 10, [[0, '#ffffff'], [0.5, '#8ae0ff'], [1, '#2a78c8']]), 2);
  eye(l, 0, -33, 3.2, EYE, 5);
  bloom(l, 0, -6, 64, '#5ad0ff', 0.08);
}
