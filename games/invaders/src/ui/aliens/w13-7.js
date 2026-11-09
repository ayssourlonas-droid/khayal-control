// World 13, Sunset Armada, the cargo zeppelin's outboard parts (see w13-6.js): the tail fins with their
// rudders, and the engine pods on their struts with propellers that turn between the beats.
import { path, ink, lin, rgba, shade, eye, bloom, line, ellipse, INK } from './kit.js';
import { BRASS, HOT, AETHER, RED, brass, rope, rivet, blade, glint, stitches } from './w13-kit.js';

// A tail fin on side m, swept back: cream canvas on ribs with a brass leading edge, and a rudder along its
// trailing edge that swings a little each beat; a nav light of aether at its tip, lit on one fin per beat.
export function fin(b, l, f, m, c) {
  const sw = f ? -1.8 : 1.8;
  const [A, B, C, D] = [[m * 6, -22], [m * 29, -36], [m * 27, -45], [m * 4, -42]];
  const hinge = (p, q) => [p[0] + (q[0] - p[0]) * 0.4, p[1] + (q[1] - p[1]) * 0.4];
  const [D2, C2] = [hinge(D, A), hinge(C, B)];
  path(b, [A, B, C2, D2]); // the fixed part
  ink(b, lin(b, 0, 0, m * 29, 0, [[0, shade(c, 0.2)], [1, shade(c, -0.2)]]), 2.4);
  b.save();
  b.clip();
  path(b, [[m * 4, -32], [m * 32, -36], [m * 32, -33.4], [m * 4, -29]]); // a coral stripe
  b.fillStyle = rgba(RED, 0.92);
  b.fill();
  for (const u of [0.35, 0.68]) {
    path(b, [[m * (6 + u * 23), -22 - u * 14], [m * (4 + u * 23), -42 + u * 6]], true);
    line(b, rgba('#5a3418', 0.5), 0.9);
  }
  b.restore();
  path(b, [A, B], true); // the leading edge, brass
  line(b, INK, 3.2);
  line(b, BRASS, 1.5);
  path(b, [D2, C2, [C[0] + m * 1, C[1] + sw], [D[0], D[1] + sw]]); // the rudder
  ink(b, lin(b, 0, 0, m * 29, 0, [[0, shade(c, 0.05)], [1, shade(c, -0.35)]]), 2);
  stitches(b, D2[0] + m * 3, D2[1] - 1, C2[0] - m * 2, C2[1] - 1, '#5a3418', 3, 1.3);
  rivet(b, ...C2, 1);
  rivet(b, ...D2, 1);
  const lit = (m > 0) === !!f;
  eye(l, B[0], B[1] + 0.4, lit ? 1.3 : 0.8, AETHER, lit ? 4 : 2.4);
}

// An engine pod on side m, braced to the envelope by struts: a brass capsule with a cooling grille and a
// cone for a nose, a propeller on the cone: two blades in a disc of blur, long on one beat, short on the other.
export function engine(b, l, f, m, c) {
  const x = m * 28.4;
  for (const [y0, y1] of [[-4, -3], [6, 4]]) rope(b, m * 16.4, y0, x, y1, 0, 0, 1);
  path(b, [[x - 3.8, -8], [x + 3.8, -8], [x + 4, 3], [x, 9.4], [x - 4, 3]]);
  ink(b, brass(b, x - 4, x + 4), 2);
  b.save();
  b.clip();
  for (let y = -5; y < 3; y += 2.4) { // the grille
    path(b, [[x - 4, y], [x + 4, y]], true);
    line(b, rgba('#2a1606', 0.6), 0.9);
  }
  b.restore();
  ellipse(b, x, -8, 3.8, 1.4); // the exhaust
  ink(b, '#2a2030', 1.3);
  rivet(b, x - 2.4, 2.2, 0.8);
  rivet(b, x + 2.4, 2.2, 0.8);
  const [cy, rx, ry] = [10.6, 8, 3];
  ellipse(b, x, cy, rx, ry);
  b.fillStyle = rgba(shade(c, 0.4), 0.2);
  b.fill();
  line(b, rgba(INK, 0.35), 0.8);
  const a = f ? 0.2 : 1.15;
  for (const k of [0, 1]) {
    const q = a + k * Math.PI;
    const [tx, ty] = [x + Math.cos(q) * rx, cy + Math.sin(q) * ry];
    blade(b, x, cy, tx, ty, 1.4, BRASS);
    glint(l, tx, ty, 2.2, '#fff6d0', 0.75);
  }
  ellipse(b, x, cy, 1.6, 1.4);
  ink(b, '#fff0c0', 1.1);
  bloom(l, x, 8, 6, HOT, 0.3);
}
