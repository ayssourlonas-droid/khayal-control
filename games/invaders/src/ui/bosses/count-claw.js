// The Crimson Count's hands (World 10, Hollow Night; see count-parts.js): claw is drawn once, as the
// left one, in boss coordinates (the painter moves its origin to where the part sits), and mirrored
// for the right.
import { path, ink, lin, line, eye, bloom, gloss, rgba, shade, ellipse } from './kit.js';
import { PALE } from './count-parts.js';

// The outline of a limb along a cubic bezier [from, c1, c2, to], w0 wide at the start and w1 at the
// end, as the current path of g; returns where it ends and which way it points, for the nail.
function band(g, [p0, c1, c2, p1], w0, w1) {
  const left = [];
  const right = [];
  let tip = null;
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const v = 1 - u;
    const at = (k) => v * v * v * p0[k] + 3 * v * v * u * c1[k] + 3 * v * u * u * c2[k] + u * u * u * p1[k];
    const dt = (k) => 3 * v * v * (c1[k] - p0[k]) + 6 * v * u * (c2[k] - c1[k]) + 3 * u * u * (p1[k] - c2[k]);
    const d = Math.hypot(dt(0), dt(1)) || 1;
    const w = (w0 + (w1 - w0) * u) / 2;
    left.push([at(0) - (dt(1) / d) * w, at(1) + (dt(0) / d) * w]);
    right.push([at(0) + (dt(1) / d) * w, at(1) - (dt(0) / d) * w]);
    tip = [at(0), at(1), dt(0) / d, dt(1) / d];
  }
  g.beginPath();
  for (const [x, y] of left) g.lineTo(x, y);
  for (const [x, y] of right.toReversed()) g.lineTo(x, y);
  g.closePath();
  return tip;
}

// A clawed hand (the left one), seen from the front, holding the cape's lower corner: a black sleeve
// and its lace cuff, a pale palm with knuckles and tendons, four long fingers hooked down and a
// thumb, black nails; in the palm a crimson charge gathers.
function claw(b, l, p, S) {
  const { hull, plate, weak } = S.pal;
  for (const g of [b, l]) g.translate(300, -85);
  b.beginPath(); // the sleeve, draped from the cape's border to the wrist
  b.moveTo(-250, 30);
  b.quadraticCurveTo(-292, 36, -318, 58);
  b.lineTo(-312, 70);
  b.lineTo(-282, 70);
  b.quadraticCurveTo(-268, 58, -250, 54);
  b.closePath();
  ink(b, lin(b, -280, 30, -290, 70, [[0, shade(hull, 0.3)], [0.5, hull], [1, shade(hull, -0.2)]]), 2.6);
  for (const [x0, y0, x1, y1] of [[-262, 38, -300, 56], [-258, 46, -290, 62]]) { // folds
    path(b, [[x0, y0], [x1, y1]], true);
    line(b, rgba('#ffffff', 0.12), 1.6);
  }
  path(b, [[-316, 62], [-284, 70]], true);
  line(b, shade(plate, -0.35), 2.6); // the lining where the cuff opens
  for (let i = 0; i < 6; i++) { // lace ruffling the cuff
    const x = -318 + i * 6.8;
    b.beginPath();
    b.arc(x + 3, 62 + i * 1.4, 4.6, Math.PI * 0.05, Math.PI * 1.05, true);
    b.closePath();
    ink(b, shade(PALE, 0.15 - (i % 2) * 0.1), 1.5);
  }
  const hand = [
    [[[-309, 90], [-318, 104], [-318, 118], [-308, 131]], 6.6, 3],
    [[[-299, 93], [-308, 110], [-307, 126], [-297, 138]], 7.4, 3],
    [[[-289, 94], [-297, 112], [-295, 131], [-284, 142]], 7.8, 3],
    [[[-279, 92], [-285, 108], [-283, 124], [-272, 133]], 7.2, 3],
    [[[-272, 78], [-262, 84], [-259, 97], [-268, 106]], 8.2, 3.4],
  ];
  for (const [pts, w0, w1] of hand) {
    const [tx, ty, ux, uy] = band(b, pts, w0, w1);
    ink(b, lin(b, pts[0][0] - w0, 0, pts[0][0] + w0, 0, [[0, shade(PALE, 0.28)], [0.45, PALE], [1, shade(PALE, -0.42)]]), 2.2);
    b.beginPath(); // a crease at each knuckle
    for (const u of [0.38, 0.7]) {
      const [kx, ky] = [pts[0][0] + (pts[3][0] - pts[0][0]) * u, pts[0][1] + (pts[3][1] - pts[0][1]) * u];
      b.moveTo(kx - w0 * 0.34, ky - 0.6);
      b.lineTo(kx + w0 * 0.34, ky + 0.6);
    }
    line(b, rgba('#3a1a58', 0.5), 1.2);
    b.beginPath(); // the nail, black, long and hooked on
    b.moveTo(tx - uy * 2.6, ty + ux * 2.6);
    b.quadraticCurveTo(tx + ux * 7 - uy * 3.4, ty + uy * 7 + ux * 3.4, tx + ux * 12 + uy * 4, ty + uy * 12 - ux * 4);
    b.quadraticCurveTo(tx + ux * 8 + uy * 3, ty + uy * 8 - ux * 3, tx + uy * 2.6, ty - ux * 2.6);
    ink(b, '#14060e', 1.4);
    eye(l, tx + ux * 10, ty + uy * 10, 1.1, weak, 3.4);
  }
  b.beginPath(); // the palm, over the roots of the fingers
  b.moveTo(-313, 66);
  b.lineTo(-286, 64);
  b.quadraticCurveTo(-270, 72, -270, 90);
  b.quadraticCurveTo(-292, 99, -315, 94);
  b.quadraticCurveTo(-324, 80, -313, 66);
  ink(b, lin(b, -316, 62, -272, 98, [[0, shade(PALE, 0.18)], [0.6, PALE], [1, shade(PALE, -0.4)]]), 2.8);
  for (const x of [-308, -297.5, -287, -277]) { // knuckles along the bottom edge
    ellipse(b, x, 92.4, 4.4, 3.2);
    b.fillStyle = rgba('#ffffff', 0.2);
    b.fill();
    path(b, [[x - 3, 95], [x + 3, 95]], true);
    line(b, rgba('#3a1a58', 0.35), 1.2);
  }
  for (const [x, y] of [[-305, 72], [-295, 70], [-285, 72]]) { // tendons running to the knuckles
    path(b, [[x, y], [x + 1.4, y + 17]], true);
    line(b, rgba('#3a1a58', 0.4), 1.3);
  }
  b.beginPath();
  b.moveTo(-302, 80);
  b.quadraticCurveTo(-290, 86, -278, 78);
  line(b, rgba('#3a1a58', 0.3), 1.2);
  gloss(b, -304, 72, 8, 3.4, 0.4, -0.3);
  ellipse(l, -294, 80, 6, 5);
  l.fillStyle = rgba(weak, 0.35);
  l.fill();
  bloom(l, -294, 80, 32, weak, 0.3);
  eye(l, -294, 80, 2.4, '#ffe0e6', 4);
}

export const HAND = { claw };
