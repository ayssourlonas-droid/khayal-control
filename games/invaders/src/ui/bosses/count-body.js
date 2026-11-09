// The Crimson Count's body (World 10, Hollow Night; see count.js): the cape's lining falling behind a
// buttoned black coat, a pale shirt with a silk cravat, lapels piped in crimson, a brass chain down to
// the amulet; and the cape's ghost, its outline in light, which the later phases widen.
import { path, sym, both, ink, line, bloom, neon, rgba, shade, lin, ellipse } from './kit.js';
import { PALE, BRASS, EYE } from './count-parts.js';
import { SHOULDER, EDGE, edge } from './count-cape.js';

const COAT = sym([[0, -92], [48, -96], [88, -84], [96, -60], [84, -10], [66, 40], [72, 100], [60, 150], [34, 128], [0, 112]]);

// The cape's lining falling behind the coat to a pointed hem.
function drape(b, S) {
  const { plate } = S.pal;
  both((s) => {
    path(b, [[s * 30, -70], [s * 118, -76], [s * 142, 40], [s * 130, 138], [s * 100, 120], [s * 74, 152], [s * 40, 128]]);
    ink(b, lin(b, 0, -70, 0, 150, [[0, shade(plate, -0.45)], [1, shade(plate, -0.7)]]), 3);
  });
}

// The coat: shoulders, a nipped waist and two long tails; the waistcoat, shirt and lapels on it.
function coat(b, l, S) {
  const { hull, plate, weak } = S.pal;
  path(b, COAT);
  ink(b, lin(b, -96, 0, 96, 0, [[0, shade(hull, 0.16)], [0.3, hull], [0.7, hull], [1, shade(hull, 0.16)]]), 3.6);
  b.save();
  b.clip();
  b.fillStyle = lin(b, 0, -96, 0, 150, [[0, rgba('#ffffff', 0.12)], [0.3, rgba('#ffffff', 0)], [1, rgba('#000000', 0.5)]]);
  b.fillRect(-100, -100, 200, 252);
  both((s) => {
    path(b, [[s * 58, 30], [s * 62, 90], [s * 56, 148]], true); // tail seams
    line(b, rgba('#000000', 0.5), 2);
    path(b, [[s * 60, 31], [s * 64, 90], [s * 58, 148]], true);
    line(b, rgba('#ffffff', 0.1), 1);
  });
  b.restore();
  path(b, [[-20, 18], [20, 18], [26, 120], [-26, 120]]); // the waistcoat
  ink(b, lin(b, 0, 18, 0, 120, [[0, shade(plate, -0.2)], [1, shade(plate, -0.7)]]), 2.4);
  path(b, [[-28, -40], [28, -40], [20, 22], [0, 66], [-20, 22]]); // the shirt's V
  ink(b, lin(b, 0, -40, 0, 66, [[0, shade(PALE, 0.2)], [1, shade(PALE, -0.4)]]), 2.4);
  both((s) => { // lapels, piped in crimson
    path(b, [[s * 26, -92], [s * 70, -84], [s * 60, -30], [s * 42, 40], [s * 26, 66], [s * 20, 22], [s * 24, -34]]);
    ink(b, lin(b, s * 20, -90, s * 70, 40, [[0, shade(hull, 0.3)], [1, hull]]), 2.8);
    path(b, [[s * 26, -90], [s * 66, -83], [s * 58, -32], [s * 42, 38], [s * 27, 64]], true);
    line(b, rgba(weak, 0.55), 1.6);
    path(l, [[s * 26, -90], [s * 66, -83], [s * 58, -32], [s * 42, 38], [s * 27, 64]], true);
    neon(l, weak, 0.8, 0.28);
    path(b, [[s * 64, -76], [s * 50, -50]], true); // the notch
    line(b, '#05020a', 2.4);
  });
  both((s) => { // the cravat's two silk tails falling over the shirt
    path(b, [[s * 7, -24], [s * 22, -4], [s * 16, 16], [s * 5, 0]]);
    ink(b, lin(b, 0, -24, 0, 16, [[0, shade(plate, 0.25)], [1, shade(plate, -0.5)]]), 2);
    path(b, [[s * 9, -20], [s * 17, -2]], true);
    line(b, rgba('#ffffff', 0.25), 1);
  });
  ellipse(b, 0, -25, 12, 6.8); // the knot
  ink(b, lin(b, 0, -32, 0, -18, [[0, shade(plate, 0.4)], [1, shade(plate, -0.4)]]), 2.2);
  for (const k of [-1, 1]) {
    path(b, [[k * 3, -31], [k * 6, -25], [k * 3, -19]], true);
    line(b, rgba('#000000', 0.3), 1);
  }
  for (const y of [-6, 8, 22]) { // buttons
    ellipse(b, 0, y, 1.9, 1.9);
    b.fillStyle = BRASS;
    b.fill();
  }
  both((s) => { // the chain from the collar down to the amulet's ring
    b.beginPath();
    b.moveTo(s * 40, -52);
    b.quadraticCurveTo(s * 38, -4, 0, 20);
    line(b, '#05020a', 3.8);
    b.setLineDash([3.2, 2.4]);
    line(b, BRASS, 2.4);
    b.setLineDash([]);
  });
  ellipse(b, 0, -25, 2.8, 2.8); // a brass pin with a crimson stone
  ink(b, BRASS, 1.4);
  ellipse(b, 0, -25, 1.3, 1.3);
  b.fillStyle = EYE;
  b.fill();
  bloom(l, 0, -25, 12, EYE, 0.45);
}

export function body(b, l, S) {
  drape(b, S);
  coat(b, l, S);
  bloom(l, 0, 40, 200, S.pal.weak, 0.07);
}

// The cape's ghost: its outline in light, k times as wide about the shoulder, drawn in the lights.
export function ghost(l, S, k, a) {
  const { weak } = S.pal;
  both((s) => {
    l.save();
    l.scale(s, 1);
    l.translate(...SHOULDER);
    l.scale(k, k);
    l.translate(-SHOULDER[0], -SHOULDER[1]);
    l.beginPath();
    edge(l);
    l.fillStyle = rgba(weak, 0.07 * a);
    l.fill();
    neon(l, weak, 1.2, 0.5 * a);
    for (const [x, y] of EDGE.slice(0, 8)) {
      path(l, [SHOULDER, [x, y]], true);
      neon(l, weak, 0.7, 0.28 * a);
    }
    l.restore();
  });
}
