// World 12, Starlit Archive, the bronze owl bookend (see w12.js): a seated owl cast in bronze on a base
// slab with a flange at each end, in front of the upright plate that holds the books. It cracks (cracks.js)
// with gold showing in the splits as it is hurt.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { rrect } from './w12-kit.js';

// A bronze owl bookend: a seated owl cast in bronze on a base slab with a flange at each end, in front
// of the upright plate that holds the books. Feathers in scales, a face of two ringed discs with amber
// eyes under a heavy brow, ear tufts, a hooked beak, toes gripping the slab; riveted, green with age
// where the damp has crept. The head tilts from one beat to the other and the eyes flare.
export function armored(b, l, f, c) {
  const [dark, lite, aged, amber] = [shade(c, -0.55), shade(c, 0.5), '#5aa88a', '#ffb02e'];
  const metal = (g, x0, y0, x1, y1) => lin(g, x0, y0, x1, y1, [[0, shade(c, 0.5)], [0.4, c], [1, shade(c, -0.6)]]);
  const plate = (g) => {
    g.beginPath();
    g.moveTo(-27, 36);
    g.lineTo(-27, -12);
    g.quadraticCurveTo(-27, -42, 0, -44);
    g.quadraticCurveTo(27, -42, 27, -12);
    g.lineTo(27, 36);
    g.closePath();
  };
  plate(b); // the upright plate behind
  ink(b, lin(b, -27, 0, 27, 0, [[0, shade(c, -0.22)], [0.5, shade(c, -0.5)], [1, shade(c, -0.72)]]), 3);
  b.save();
  plate(b);
  b.clip();
  b.strokeStyle = rgba(lite, 0.3);
  b.lineWidth = 1.2;
  b.strokeRect(-22, -38, 44, 74);
  for (const [x, y, w] of [[-14, -36, 9], [16, -30, 6], [-22, 2, 8], [20, 14, 10]]) { // verdigris creeping down from the rivets
    b.fillStyle = lin(b, 0, y, 0, y + 26, [[0, rgba(aged, 0.45)], [1, rgba(aged, 0)]]);
    b.fillRect(x - w / 2, y, w, 26);
  }
  b.restore();
  for (const [x, y] of [[-21, -33], [21, -33], [-21, 28], [21, 28]]) { // rivets
    ellipse(b, x, y, 2.2, 2.2);
    ink(b, shade(c, 0.1), 1.2);
    ellipse(b, x - 0.6, y - 0.7, 0.7, 0.7);
    b.fillStyle = rgba('#ffffff', 0.7);
    b.fill();
  }
  both((s) => { // wings folded at the sides, a row of long feathers down each
    b.beginPath();
    b.moveTo(s * 12, -10);
    b.bezierCurveTo(s * 25, -6, s * 26, 18, s * 16, 31);
    b.lineTo(s * 12, 33);
    b.bezierCurveTo(s * 9, 18, s * 8, 2, s * 12, -10);
    ink(b, lin(b, s * 8, 0, s * 26, 0, [[0, shade(c, -0.1)], [1, shade(c, -0.55)]]), 2.4);
    for (let i = 0; i < 4; i++) {
      path(b, [[s * (11 + i * 1.2), -4 + i * 5], [s * (22 - i * 1.4), 10 + i * 6]], true);
      line(b, rgba(dark, 0.7), 1.1);
    }
  });
  ellipse(b, 0, 7, 17.4, 25); // the breast
  ink(b, rad(b, -6, -6, 2, 34, [[0, shade(c, 0.45)], [0.45, c], [1, shade(c, -0.6)]]), 3);
  b.save();
  ellipse(b, 0, 7, 17.4, 25);
  b.clip();
  for (let row = 0; row < 6; row++) for (let x = -17 + (row % 2) * 3.6; x < 18; x += 7.2) { // scales, each lit along its upper rim
    b.beginPath();
    b.arc(x, -8 + row * 6.2, 3.7, 0.15, Math.PI - 0.15);
    line(b, rgba(dark, 0.7), 1.1);
    b.beginPath();
    b.arc(x, -9.2 + row * 6.2, 3.7, Math.PI + 0.3, Math.PI * 2 - 0.3);
    line(b, rgba(lite, 0.4), 0.9);
  }
  b.restore();
  b.save(); // the head, turning a little each beat about the neck
  l.save();
  for (const g of [b, l]) {
    g.translate(0, -12);
    g.rotate(f ? 0.05 : -0.05);
    g.translate(0, 12);
  }
  both((s) => {
    path(b, [[s * 8, -36], [s * 18, -45 + (s > 0 ? f * 2 : (1 - f) * 2)], [s * 17, -29]]); // ear tufts, tips inside the sprite as the head tilts
    ink(b, shade(c, -0.25), 2.2);
  });
  b.beginPath();
  b.moveTo(-19, -22);
  b.bezierCurveTo(-21, -40, -10, -42, 0, -40);
  b.bezierCurveTo(10, -42, 21, -40, 19, -22);
  b.bezierCurveTo(14, -14, -14, -14, -19, -22);
  ink(b, metal(b, -19, -42, 19, -14), 3);
  both((s) => {
    ellipse(b, s * 9, -27, 9.2, 9.2); // the facial disc
    ink(b, rad(b, s * 7, -29, 1, 12, [[0, shade(c, 0.4)], [1, shade(c, -0.35)]]), 1.8);
    ellipse(b, s * 9, -27, 6.6, 6.6);
    ink(b, '#2a1608', 1.4);
    ellipse(b, s * 9, -27, 5, 5); // the eye
    ink(b, rad(b, s * 8, -28, 0.5, 5.4, [[0, '#fff2c0'], [0.45, amber], [1, '#b8600c']]), 1);
    ellipse(b, s * 9, -26.6, 1.3, 3.4);
    b.fillStyle = '#1a0a02';
    b.fill();
    path(b, [[s * 1.6, -32.4], [s * 15, -36.6]], true); // the brow, a ridge frowning inward
    line(b, INK, 3);
    line(b, rgba(lite, 0.6), 1.1);
    eye(l, s * 7.6, -29, 1, '#ffffff', 2.4);
    bloom(l, s * 9, -27, 17, amber, 0.5 + f * 0.25);
    ellipse(l, s * 9, -27, 5, 5);
    line(l, rgba(amber, 0.8), 1.2);
  });
  path(b, [[-3.6, -22], [3.6, -22], [0, -13.4]]); // the hooked beak
  ink(b, shade(c, 0.1), 1.8);
  path(b, [[0, -22], [3.6, -22], [0, -13.4]]);
  b.fillStyle = rgba('#000000', 0.3);
  b.fill();
  gloss(b, -8, -37, 8, 2.8, 0.55, -0.15);
  b.restore();
  l.restore();
  for (const x of [-1, 1]) { // toes gripping the slab, claws over its lip
    for (const dx of [-5.6, 0, 5.6]) {
      rrect(b, x * 12 + dx - 2, 28, 4, 10, 1.6);
      ink(b, shade(c, -0.1), 1.4);
      path(b, [[x * 12 + dx - 1.8, 37], [x * 12 + dx + 1.8, 37], [x * 12 + dx, 41.4]]);
      ink(b, dark, 1.2);
    }
  }
  path(b, [[-33, 34], [-29, 32], [29, 32], [33, 34], [33, 44], [-33, 44]]); // the base slab, its top lit and its face in shade
  ink(b, lin(b, 0, 32, 0, 44, [[0, shade(c, 0.5)], [0.3, c], [1, shade(c, -0.65)]]), 3);
  path(b, [[-33, 36], [33, 36]], true);
  line(b, rgba('#000000', 0.4), 1.2);
  both((s) => {
    path(b, [[s * 33, 34], [s * 41, 28], [s * 41, 44], [s * 33, 44]]); // the flange that takes the books
    ink(b, lin(b, 0, 28, 0, 44, [[0, shade(c, 0.3)], [1, shade(c, -0.6)]]), 2.4);
    ellipse(b, s * 20, 40, 1.6, 1.6);
    b.fillStyle = rgba('#ffffff', 0.5);
    b.fill();
  });
  for (const [x, w] of [[-10, 14], [12, 9]]) { // damp on the slab's face
    b.fillStyle = rgba(aged, 0.34);
    b.fillRect(x, 37, w, 6);
  }
  gloss(b, -22, 34, 8, 1.6, 0.5);
  bloom(l, 0, -4, 38, amber, 0.1);
}
