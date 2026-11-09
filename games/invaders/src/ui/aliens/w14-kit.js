// What World 14's painters share (w14.js .. w14-9.js): the toys of the prize booths are pressed tin, enamel
// and gilt paper, lit by the fair. Rivets, tabs, printed stars and stripes, springs and winding keys, bulbs,
// and the sparks of anything that burns. Every shape is painted once, at load: nothing here runs per frame.
import { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, both, TAU, INK } from './kit.js';

export const GILT = '#f0b83a'; // gilded tin and brass
export const CREAM = '#f6ead2'; // paper, enamel, the printed ground
export const RED = '#d8362e';
export const NAVY = '#2a1858'; // the printed night
export const TIN = '#c9d2de'; // bare tin: wings, springs, bezels
export const HOT = '#ffb54a'; // anything that burns: fuses, sparks, flame
export const SPARK = '#fff0b0'; // the white-hot heart of a spark

// Painted tin across x (a bright band left of centre) or down y (bright on top), in colour c.
export const tinH = (g, x0, x1, c) => lin(g, x0, 0, x1, 0, [[0, shade(c, -0.35)], [0.28, shade(c, 0.6)], [0.6, c], [1, shade(c, -0.6)]]);
export const tinV = (g, y0, y1, c) => lin(g, 0, y0, 0, y1, [[0, shade(c, 0.5)], [0.4, c], [1, shade(c, -0.55)]]);
export const giltH = (g, x0, x1) => tinH(g, x0, x1, GILT);
export const giltV = (g, y0, y1) => tinV(g, y0, y1, GILT);
export const silverH = (g, x0, x1) => tinH(g, x0, x1, TIN);

// A domed rivet head with a glint.
export function rivet(g, x, y, r = 1.3, c = TIN) {
  ellipse(g, x, y, r, r);
  ink(g, shade(c, 0.12), 0.9);
  ellipse(g, x - r * 0.3, y - r * 0.35, r * 0.38, r * 0.38);
  g.fillStyle = rgba('#ffffff', 0.8);
  g.fill();
}

// A five-pointed star filled in c, r px to the points, a point straight up unless turned by rot.
export function star5(g, x, y, r, c, rot = -Math.PI / 2) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5;
    const k = i % 2 ? r * 0.42 : r;
    g.lineTo(x + Math.cos(a) * k, y + Math.sin(a) * k);
  }
  g.closePath();
  g.fillStyle = c;
  g.fill();
}

// Printed stripes slanted across the box (x0, y0)-(x1, y1), `step` apart and `w` wide, each leaning to the
// right as it climbs by `slant` px per px of height; every stripe is cut at the box's sides, so the paint
// never reaches beyond it. Clip first if the box is not the shape.
export function stripes(g, x0, y0, x1, y1, step, w, col, slant = 0.7) {
  const h = y1 - y0;
  const dx = h * slant;
  g.beginPath();
  for (let x = x0 - dx; x < x1; x += step) {
    let [xs, ys, xe, ye] = [x, y1, x + dx, y0];
    if (xs < x0) [xs, ys] = [x0, y1 - ((x0 - xs) / dx) * h];
    if (xe > x1) [xe, ye] = [x1, y0 + ((xe - x1) / dx) * h];
    if (xe <= xs && dx > 0) continue;
    g.moveTo(xs, ys);
    g.lineTo(xe, ye);
  }
  line(g, col, w);
}

// A coil spring down x from y0 to y1, w wide, `turns` turns of tin wire.
export function spring(g, x, y0, y1, w, turns, c = TIN) {
  const pts = [];
  for (let i = 0; i <= turns * 2; i++) pts.push([x + (i % 2 ? w : -w) * (i === 0 || i === turns * 2 ? 0.5 : 1), y0 + ((y1 - y0) * i) / (turns * 2)]);
  path(g, pts, true);
  line(g, INK, 3.6);
  line(g, c, 1.9);
  path(g, pts.map(([px, py]) => [px - 0.5, py - 0.6]), true);
  line(g, rgba('#ffffff', 0.55), 0.7);
}

// A butterfly winding key standing on (x, y), turned by rot (0 stands upright), s times its natural size.
export function key(b, x, y, rot, s = 1) {
  b.save();
  b.translate(x, y);
  b.rotate(rot);
  b.scale(s, s);
  path(b, [[-1.5, 0], [1.5, 0], [1.2, -9], [-1.2, -9]]);
  ink(b, giltH(b, -1.5, 1.5), 1.6);
  for (const m of [-1, 1]) {
    b.beginPath();
    b.ellipse(m * 5.2, -12.4, 5.2, 4, m * -0.35, 0, TAU);
    b.ellipse(m * 5.4, -12.5, 2.5, 1.7, m * -0.35, 0, TAU);
    b.fillStyle = giltH(b, -10, 10);
    b.fill('evenodd');
    line(b, INK, 1.5);
    b.beginPath();
    b.ellipse(m * 5.2, -12.4, 4.2, 3, m * -0.35, Math.PI * 1.15, Math.PI * 1.7);
    line(b, rgba('#ffffff', 0.7), 0.8);
  }
  ellipse(b, 0, -11, 2.1, 2.5);
  ink(b, rad(b, 0, -11, 0.3, 2.6, [[0, '#fff3c8'], [0.6, GILT], [1, shade(GILT, -0.6)]]), 1.3);
  b.restore();
}

// A lit bulb, r px across, glass over a socket stub: the glass on the body, its light and hot core on `l`.
export function bulb(b, l, x, y, r, c, a = 1) {
  path(b, [[x - r * 0.55, y + r * 0.7], [x + r * 0.55, y + r * 0.7], [x + r * 0.5, y + r * 1.5], [x - r * 0.5, y + r * 1.5]]);
  ink(b, giltH(b, x - r, x + r), 1.1);
  ellipse(b, x, y, r, r * 1.06);
  ink(b, rad(b, x, y, 0.2, r * 1.15, [[0, '#ffffff'], [0.4, shade(c, 0.45)], [1, shade(c, -0.15)]], x - r * 0.3, y - r * 0.35), 1.2);
  eye(l, x, y, r * 0.62, c, 3.4 * a);
}

// A glint on the lights layer: a four-point star in a small bloom, in colour c.
export function glint(l, x, y, r, c = SPARK, a = 1) {
  bloom(l, x, y, r * 1.8, HOT, 0.45 * a);
  const k = r * 0.16;
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  l.moveTo(x, y - r);
  l.quadraticCurveTo(x + k, y - k, x + r, y);
  l.quadraticCurveTo(x + k, y + k, x, y + r);
  l.quadraticCurveTo(x - k, y + k, x - r, y);
  l.quadraticCurveTo(x - k, y - k, x, y - r);
  l.fillStyle = rgba(c, a);
  l.fill();
  l.restore();
}

// A ring of light on the lights layer: nothing inside r0, the colour at r0, fading out by r1.
export function halo(l, x, y, r0, r1, c, a = 0.5) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, x, y, 0, r1, [[0, rgba(c, 0)], [r0 / r1, rgba(c, a)], [1, rgba(c, 0)]]);
  l.fillRect(x - r1, y - r1, r1 * 2, r1 * 2);
  l.restore();
}

// A puff of powder smoke: three lobes outlined as one, cream on top and lilac in its shade.
export function puff(g, x, y, r) {
  const lobes = [[0, 0, r], [-r * 0.78, r * 0.22, r * 0.62], [r * 0.8, r * 0.18, r * 0.7]];
  for (const [dx, dy, k] of lobes) {
    ellipse(g, x + dx, y + dy, k + 1.5, k + 1.5);
    g.fillStyle = INK;
    g.fill();
  }
  for (const [dx, dy, k] of lobes) {
    ellipse(g, x + dx, y + dy, k, k);
    g.fillStyle = rad(g, x + dx, y + dy, 0, k * 1.3, [[0, '#fff6ea'], [0.55, '#d6c4e0'], [1, '#9a82b8']], x + dx - k * 0.35, y + dy - k * 0.4);
    g.fill();
  }
}

// A spark on the lights layer: a hot streak from (x, y) out to (x + dx, y + dy), white-hot at the head.
export function streak(l, x, y, dx, dy, c = HOT, w = 1.2) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  l.moveTo(x, y);
  l.lineTo(x + dx, y + dy);
  line(l, rgba(c, 0.55), w * 2.2);
  l.beginPath();
  l.moveTo(x, y);
  l.lineTo(x + dx * 0.55, y + dy * 0.55);
  line(l, rgba(SPARK, 0.95), w);
  l.restore();
}

export { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, both, TAU, INK };
