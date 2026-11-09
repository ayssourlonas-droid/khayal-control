// World 17, Ash to Air, the carrier's open top (w17-pack.js): what rises out of THE PLAIN PACK. Behind everything the
// lid, flipped up and back on its hinge, showing its shadowed inside and a burn hole with an ember lodged in it; in
// front of it a row of seven cigarettes standing in the box, white paper and a tan filter on each, their heights
// staggered; and round their feet a sleeve of crinkled silver foil, torn along its top edge. Beat 1 the lid
// has rocked the other way and every other cigarette has risen a hair. Nothing is printed on any of it.
import { path, lin, rad, rgba, line, circle, bloom, INK, PAPER, PAPER_D, TAN, TAN_D, CHAR, EMBER, HOT, RIM, hash, lerp, cyl, glint, grime } from './w17-kit.js';

const FOIL = '#b9bbb6';

// The lid: a cream panel hinged along the box's top edge (y = HINGE) and swung back, so its inside faces us.
export const HINGE = -24;

export function lid(b, l, f) {
  const a = f ? -0.045 : 0.05;
  const pts = [[-22.5, HINGE], [22.5, HINGE], [20.8, -45.4], [-21, -44.6]];
  b.save();
  b.translate(0, HINGE);
  b.rotate(a);
  b.translate(0, -HINGE);
  path(b, pts);
  b.fillStyle = lin(b, -23, 0, 23, 0, [[0, '#d2c8ae'], [0.3, '#c6bba0'], [1, '#9c927a']]);
  b.fill();
  b.save();
  path(b, pts);
  b.clip();
  b.fillStyle = lin(b, 0, HINGE, 0, -46, [[0, rgba('#40382c', 0.4)], [0.4, rgba('#40382c', 0)], [1, rgba('#ffffff', 0.25)]]);
  b.fillRect(-24, -47, 48, 24);
  grime(b, 14, 41, 0, -36, 20, 10, 0.35, '#5a4a34');
  b.beginPath(); // a crease where the lid was bent back
  b.moveTo(-22, -30.6);
  b.lineTo(-6, -31.8);
  b.lineTo(22, -30);
  line(b, rgba(PAPER_D, 0.8), 1);
  b.fillStyle = rad(b, 12.6, -38.4, 0, 4.6, [[0, rgba(CHAR, 1)], [0.5, rgba('#3a2412', 0.95)], [1, rgba('#6a4a28', 0)]]); // the burn hole
  b.fillRect(8, -43, 10, 10);
  b.restore();
  path(b, pts);
  line(b, INK, 2.2);
  b.beginPath();
  b.moveTo(-19.8, -43.8);
  b.lineTo(19.6, -44.6);
  line(b, rgba('#ffffff', 0.85), 1.1);
  l.save();
  l.translate(0, HINGE);
  l.rotate(a);
  l.translate(0, -HINGE);
  bloom(l, 12.6, -38.4, 7, EMBER, 0.35 + f * 0.4);
  l.globalCompositeOperation = 'lighter';
  circle(l, 12.6, -38.4, 1.5 + f * 0.7);
  l.fillStyle = rgba(HOT, 0.95);
  l.fill();
  l.restore();
  b.restore();
}

// Seven cigarettes standing in the box, filters up: a white tube, a tan filter with a dark ring, a rounded top.
export function tubes(b, f) {
  for (let i = 0; i < 7; i++) {
    const x = -18 + i * 6;
    const top = -32 - (i * 5 % 3) * 1.6 - (f && i % 2 ? 1.6 : 0);
    b.save();
    b.translate(x, 0);
    b.rotate((hash(i + 5) - 0.5) * 0.07);
    const body = (g) => {
      g.beginPath();
      g.moveTo(-2.9, -9);
      g.lineTo(-2.9, top + 3);
      g.quadraticCurveTo(-2.9, top, 0, top);
      g.quadraticCurveTo(2.9, top, 2.9, top + 3);
      g.lineTo(2.9, -9);
      g.closePath();
    };
    body(b);
    b.fillStyle = cyl(b, -3.1, 3.1, PAPER, 0.5);
    b.fill();
    b.save();
    body(b);
    b.clip();
    b.fillStyle = cyl(b, -3.1, 3.1, TAN, 0.55);
    b.fillRect(-4, top - 1, 8, 8.4);
    b.fillStyle = rgba(TAN_D, 0.8);
    b.fillRect(-4, top + 7.4, 8, 1.1);
    grime(b, 4, 51 + i, 0, top + 4, 3, 4, 0.5, TAN_D);
    b.restore();
    body(b);
    line(b, INK, 1.4);
    glint(b, -1.6, top + 1.8, -1.8, top + 6, 0.9, 0.5, RIM);
    b.restore();
  }
}

// The foil: a crinkled silver sleeve round the cigarettes' feet, its top edge torn into points.
export function foil(b, f) {
  const pts = [[-22, -7]];
  for (let i = 0; i <= 12; i++) pts.push([lerp(-22, 22, i / 12), i % 2 ? -20.4 - hash(i + 60) * 2.4 : -15.6 - hash(i + 70) * 1.8 + f * (i % 4 === 0 ? 0.8 : 0)]);
  pts.push([22, -7]);
  path(b, pts);
  b.fillStyle = lin(b, -22, 0, 22, 0, [[0, '#e6e8e4'], [0.35, FOIL], [0.7, '#9a9c98'], [1, '#6c6e6c']]);
  b.fill();
  b.save();
  path(b, pts);
  b.clip();
  for (let i = 0; i < 16; i++) { // crinkles: short facets, light then dark
    const x = -22 + hash(300 + i) * 44;
    const y = -21 + hash(310 + i) * 13;
    b.beginPath();
    b.moveTo(x, y);
    b.lineTo(x + (hash(320 + i) - 0.5) * 9, y + (hash(330 + i) - 0.3) * 7);
    line(b, i % 2 ? rgba('#ffffff', 0.7) : rgba('#4a4c4a', 0.5), 0.9);
  }
  b.restore();
  path(b, pts);
  line(b, INK, 1.8);
  b.beginPath();
  pts.slice(2, 13).forEach(([x, y], i) => (i ? b.lineTo(x, y + 0.9) : b.moveTo(x, y + 0.9)));
  line(b, rgba('#ffffff', 0.8), 0.8);
}
