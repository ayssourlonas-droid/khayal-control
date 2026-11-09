// World 14, Ember Carnival, the tin drone's wings and feet (see w14.js): leaf-shaped pressed-tin wings
// printed with the drone's colour, ribbed and riveted at the root, that stand raised on one beat and sweep
// down on the other; two stubby boots that step.
import { path, ink, lin, rgba, shade, line, ellipse } from './w14-kit.js';
import { TIN, CREAM, RED, NAVY, rivet, star5, stripes, tinV } from './w14-kit.js';

// One wing from its root (rx, ry), mirrored by m (1 right, -1 left) and turned by ang (negative lifts the tip).
export function wing(b, m, rx, ry, ang, c) {
  b.save();
  b.translate(rx, ry);
  b.scale(m, 1);
  b.rotate(ang);
  const leaf = () => {
    b.beginPath();
    b.moveTo(-1, -4.6);
    b.bezierCurveTo(8, -10, 22, -9, 30, -1.2);
    b.bezierCurveTo(22, 7.6, 9, 7.8, -1, 4.6);
    b.closePath();
  };
  leaf();
  ink(b, lin(b, 0, -9, 0, 8, [[0, '#ffffff'], [0.45, TIN], [1, shade(TIN, -0.5)]]), 3);
  b.save();
  leaf();
  b.clip();
  stripes(b, 9, -10, 30, 9, 6.4, 2.8, rgba(c, 0.95)); // the printed bands
  stripes(b, 12.4, -10, 30, 9, 6.4, 0.9, rgba(CREAM, 0.9));
  star5(b, 5.6, -0.2, 3, RED);
  path(b, [[2, 0], [27, -0.4]], true); // the pressed ribs fan out from the root
  line(b, rgba(NAVY, 0.35), 0.8);
  b.fillStyle = lin(b, 0, -9, 0, 8, [[0, rgba('#ffffff', 0.55)], [0.3, rgba('#ffffff', 0)], [0.7, rgba('#000000', 0)], [1, rgba('#000000', 0.4)]]);
  leaf();
  b.fill();
  b.restore();
  leaf();
  line(b, rgba('#ffffff', 0.35), 0.8);
  ellipse(b, 1.4, 0, 4, 4.4); // the hinge
  ink(b, lin(b, -2, -4, 5, 5, [[0, '#ffffff'], [0.5, TIN], [1, shade(TIN, -0.6)]]), 1.6);
  rivet(b, 1.4, 0, 1.2, TIN);
  b.restore();
}

// A boot stepping: a leg of tin, an ankle disc and a rounded toe-cap; `lift` is how far down the foot is.
export function boot(b, x, y, c) {
  path(b, [[x - 2, 15], [x + 2, 15], [x + 1.6, y - 1.6], [x - 1.6, y - 1.6]]);
  ink(b, tinV(b, 15, y, TIN), 1.5);
  ellipse(b, x, y - 1.2, 3.2, 3.2);
  ink(b, lin(b, x - 3, y - 4, x + 3, y + 2, [[0, '#ffffff'], [0.5, TIN], [1, shade(TIN, -0.5)]]), 1.4);
  path(b, [[x - 5.4, y + 1.6], [x - 4, y - 0.4], [x + 4.8, y - 0.4], [x + 6.4, y + 1.6], [x + 5.6, y + 3.2], [x - 5.4, y + 3.2]]);
  ink(b, tinV(b, y - 1, y + 3.2, c), 1.8);
  path(b, [[x - 5, y + 2.2], [x + 5.6, y + 2.2]], true);
  line(b, rgba(NAVY, 0.45), 0.9);
  rivet(b, x - 3, y + 0.8, 0.8, TIN);
}
