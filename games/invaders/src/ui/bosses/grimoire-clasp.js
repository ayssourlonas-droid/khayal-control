// The Grand Grimoire's clasp (World 12, Starlit Archive; see grimoire.js): a stitched leather strap
// hanging from the anchor on the spine, ending in a shield of gold with scrolls chased into it and a
// teal gem in a collar of six claws, a drop of the same stone hanging from its point. A weak point,
// 90 x 90 for the hit box (the strap reaches up past it to the spine).
import { path, ink, line, lin, rad, rgba, shade, neon, bloom, eye, both, ellipse, TAU } from './kit.js';
import { mix } from '../sprites.js';
import { GOLD, GILT, GOLD_D, gilt, stud, curl, metal } from './grimoire-kit.js';

export const GEM_AT = [0, -2]; // the stone's centre in the clasp's frame

const shield = (g, k = 1) => {
  g.beginPath();
  g.moveTo(-29 * k, -30 * k);
  g.bezierCurveTo(-29 * k, -39 * k, 29 * k, -39 * k, 29 * k, -30 * k);
  g.lineTo(31 * k, -2 * k);
  g.bezierCurveTo(30 * k, 22 * k, 12 * k, 36 * k, 0, 46 * k);
  g.bezierCurveTo(-12 * k, 36 * k, -30 * k, 22 * k, -31 * k, -2 * k);
  g.closePath();
};

export function clasp(b, l, p, S) {
  const { plate, weak } = S.pal;
  const leather = mix(S.pal.hull, plate, 0.3);
  path(b, [[-10, -66], [10, -66], [11, -28], [-11, -28]]); // the strap
  ink(b, lin(b, -11, 0, 11, 0, [[0, shade(leather, -0.4)], [0.4, shade(leather, 0.25)], [1, shade(leather, -0.45)]]), 2.6);
  for (const x of [-7.2, 7.2]) { // stitching down each edge
    b.beginPath();
    b.moveTo(x, -64);
    b.lineTo(x, -29);
    b.setLineDash([3, 2.4]);
    line(b, rgba(GILT, 0.7), 1);
    b.setLineDash([]);
  }
  ellipse(b, 0, -50, 9, 4.5); // a buckle's tongue through a slot
  ink(b, '#06020f', 1.2);
  shield(b, 1.1); // the shield: a dark rim behind a gold one
  ink(b, shade(plate, -0.6), 3);
  shield(b);
  ink(b, lin(b, -30, -38, 30, 46, [[0, GILT], [0.4, GOLD], [1, GOLD_D]]), 2.4);
  b.save();
  shield(b, 0.88);
  b.clip();
  b.fillStyle = lin(b, 0, -34, 0, 44, [[0, shade(plate, 0.3)], [1, shade(plate, -0.6)]]); // the field, bronze, chased with scrolls
  b.fillRect(-30, -36, 60, 84);
  both((s) => {
    for (const [x, y, r, d] of [[s * 17, -22, 7, s], [s * 19, 4, 6, -s], [s * 11, 22, 5, s]]) {
      b.beginPath();
      curl(b, x, y, r, d, 1.5);
      line(b, rgba('#000000', 0.5), 2.4);
      line(b, rgba(GILT, 0.8), 1);
    }
  });
  b.restore();
  shield(b, 0.88);
  gilt(b, 1.3, 0.9);
  for (const [x, y] of [[-21, -30], [21, -30], [-24, 2], [24, 2], [0, 38]]) stud(b, x, y, 2.4, GILT);
  const [gx, gy] = GEM_AT;
  for (let i = 0; i < 6; i++) { // the claws
    const a = (i * TAU) / 6 + 0.26;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    path(b, [[gx + c * 13 - s * 4.4, gy + s * 13 + c * 4.4], [gx + c * 21 - s * 2.2, gy + s * 21 + c * 2.2], [gx + c * 21 + s * 2.2, gy + s * 21 - c * 2.2], [gx + c * 13 + s * 4.4, gy + s * 13 - c * 4.4]]);
    ink(b, metal(b, gy - 20, gy + 20), 1.4);
  }
  const ring = (r) => Array.from({ length: 8 }, (_, i) => [gx + Math.sin((i / 8) * TAU + 0.39) * r, gy - Math.cos((i / 8) * TAU + 0.39) * r]);
  const [outer, inner] = [ring(15.5), ring(7.5)];
  path(b, outer);
  ink(b, '#0a4a48', 2.2);
  outer.forEach((o, i) => { // eight facets, lit from the upper left
    const q = outer[(i + 1) % 8];
    path(b, [o, q, inner[(i + 1) % 8], inner[i]]);
    b.fillStyle = shade(weak, [0.3, 0.1, -0.15, -0.35, -0.3, -0.1, 0.15, 0.35][i] - 0.05);
    b.fill();
    line(b, rgba('#021a1a', 0.5), 0.8);
  });
  path(b, inner);
  b.fillStyle = rad(b, gx - 2, gy - 2, 0, 8, [[0, '#ffffff'], [0.6, shade(weak, 0.25)], [1, weak]]);
  b.fill();
  line(b, rgba('#ffffff', 0.7), 0.9);
  ellipse(b, 0, 52, 2.2, 2.2); // a ring and the drop of stone hanging below the point
  ink(b, GOLD, 1);
  b.beginPath();
  b.moveTo(0, 54);
  b.quadraticCurveTo(5.6, 61, 0, 68);
  b.quadraticCurveTo(-5.6, 61, 0, 54);
  ink(b, rad(b, -1.4, 61, 0, 7, [[0, '#d8fff6'], [0.5, weak], [1, '#0a5a58']]), 1.4);
  path(l, outer);
  l.fillStyle = rad(l, gx, gy, 0, 16, [[0, rgba('#ffffff', 0.45)], [0.5, rgba(weak, 0.5)], [1, rgba(weak, 0.18)]]);
  l.fill();
  neon(l, weak, 1.2, 0.55);
  shield(l);
  neon(l, GOLD, 0.9, 0.3);
  eye(l, gx, gy, 3, '#ffffff', 4);
  eye(l, 0, 61, 2.2, weak, 4.4);
  bloom(l, gx, gy, 56, weak, 0.3);
}
