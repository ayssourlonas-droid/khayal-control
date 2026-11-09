// One half-smoked cigarette for the Craving's crown (World 17, Ash to Air): drawn standing on its foot at (0, 0) with its tip at
// (0, -L), w wide, in five kinds, every one outlined dark so it stands out of the smoke. 'lit': a tan filter at the foot (sunk in the
// clay), a paper body gone dingy with nicotine stain, soot and dust, a seam down one side, a crumpled char ring, a dull ember band and a
// flared crumbling cap of grey ash; 'stub': the same, shorter and fatter; 'snap': the paper torn off ragged at the top with a curled
// flap and a spill of tobacco; 'filter': stood the other way up, the paper in the clay and the filter (a fibre face, a tipping ring)
// at the top; 'char': burnt right down, a black flaking tube split by embers. The lights carry only small dull embers (armour must
// stay darker than the weak points). Bake-time only.
import { ellipse, grain, heat, lin, line, path, rad, rgba, shade, streaks, rng, PAL, IRON, COAL, SOOT } from './craving-pkit.js';

const PAPER = '#c6bca6';

function tube(g, h, y0, y1, c, k = 1) { // a cylinder of colour c from y0 up to y1, lit on its upper left
  g.fillStyle = lin(g, -h, 0, h, 0, [[0, shade(c, -0.45 * k)], [0.22, shade(c, 0.08)], [0.42, shade(c, 0.14)], [0.78, shade(c, -0.24 * k)], [1, shade(c, -0.62 * k)]]);
  g.fillRect(-h, y1, h * 2, y0 - y1);
}

function outline(g, h, y0, y1) {
  g.beginPath();
  g.rect(-h, y1, h * 2, y0 - y1);
  line(g, rgba(SOOT, 0.9), 1.6);
}

function filterEnd(g, h, y0, y1, r, face) { // the tan filter: fibre speckle, a tipping ring, optionally its end face
  tube(g, h, y0, y1, PAL.filter);
  for (let i = 0; i < 30; i++) {
    g.fillStyle = rgba(r() < 0.5 ? '#6a4420' : '#f0d49a', 0.35);
    g.fillRect((r() - 0.5) * h * 1.8, y1 + r() * (y0 - y1), 1.3, 1);
  }
  g.fillStyle = rgba('#3a2412', 0.5);
  g.fillRect(-h, face ? y1 + 6 : y1, h * 2, 1.8);
  outline(g, h, y0, y1);
  if (face) {
    ellipse(g, 0, y1, h, h * 0.34);
    g.fillStyle = rad(g, 0, y1, 0, h, [[0, '#7a5028'], [0.7, '#c99a5e'], [1, '#e8c890']]);
    g.fill();
    for (let i = 0; i < 16; i++) {
      g.fillStyle = rgba('#3a2412', 0.5);
      g.fillRect((r() - 0.5) * h * 1.5, y1 + (r() - 0.5) * h * 0.4, 1, 1);
    }
    line(g, rgba('#3a2412', 0.8), 1.1);
  }
}

function paper(g, h, y0, y1, r, soot) { // the body: stain, soot toward the top, dust, streaks, a seam, creases
  tube(g, h, y0, y1, PAPER);
  g.save();
  g.beginPath();
  g.rect(-h, y1, h * 2, y0 - y1);
  g.clip();
  g.fillStyle = lin(g, 0, y0, 0, y1, [[0, rgba('#a8967a', 0.1)], [0.5, rgba('#a8863e', 0.32)], [1, rgba('#2a1e14', soot)]]);
  g.fillRect(-h, y1, h * 2, y0 - y1);
  grain(g, -h, y1, h * 2, y0 - y1, 1.5);
  streaks(g, r, -h, h, y1, y0, 7, SOOT, 0.4, 0.9);
  for (let i = 0; i < 3; i++) {
    ellipse(g, (r() - 0.5) * h, y1 + r() * (y0 - y1), h * (0.3 + r() * 0.4), 3 + r() * 6, 0);
    g.fillStyle = rgba(SOOT, 0.1 + r() * 0.12);
    g.fill();
  }
  path(g, [[h * 0.5, y0], [h * 0.5 + 0.8, y1]], true);
  line(g, rgba('#4a3a28', 0.55), 1);
  for (let i = 0; i < 3; i++) {
    const y = y1 + 6 + r() * (y0 - y1 - 10);
    path(g, [[-h, y], [0, y + (r() - 0.5) * 2], [h, y + 1]], true);
    line(g, rgba('#2a1e14', 0.26), 1);
  }
  g.restore();
  outline(g, h, y0, y1);
}

function ashCap(g, h, y, top, r) { // grey ash standing on the ember: flared, crumbling, cracked across
  const pts = [[-h * 1.05, y], [-h * 1.1, y - 3]];
  for (let i = 0; i <= 4; i++) pts.push([-h * 0.85 + (h * 1.7 * i) / 4 + (r() - 0.5) * 2.4, top + (i % 2 ? 2 : 0) + (r() - 0.5) * 3]);
  pts.push([h * 1.1, y - 3], [h * 1.05, y]);
  g.beginPath();
  g.moveTo(...pts[0]);
  for (let i = 1; i < pts.length - 1; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
  g.lineTo(...pts.at(-1));
  g.closePath();
  g.fillStyle = lin(g, -h, 0, h, 0, [[0, '#5a524c'], [0.35, '#a89d91'], [0.7, '#7c7269'], [1, '#403a36']]);
  g.fill();
  line(g, rgba(SOOT, 0.8), 1.3);
  for (let i = 0; i < 3; i++) {
    const yy = top + 3 + r() * (y - top - 4);
    path(g, [[-h * 0.9, yy], [-h * 0.1, yy + (r() - 0.5) * 2.4], [h * 0.8, yy + 0.8]], true);
    line(g, rgba(SOOT, 0.5), 0.9);
  }
}

function burnt(b, l, h, yp, top, r, fat, glow) { // char ring, ember band, ash cap, loose flakes
  b.beginPath();
  b.moveTo(-h, yp + 1);
  for (let i = 0; i <= 8; i++) b.lineTo(-h + (h * 2 * i) / 8, yp - 3.4 - (i % 2 ? 2 : 0) - r() * 1.6);
  b.lineTo(h, yp + 1);
  b.closePath();
  b.fillStyle = IRON[1];
  b.fill();
  line(b, rgba(SOOT, 0.9), 1.2);
  const ey = yp - 3.6 * fat;
  b.fillStyle = lin(b, 0, ey + 3, 0, ey - 3, [[0, '#2a0a04'], [0.45, '#b83a10'], [0.6, '#d8561a'], [1, '#3a0e06']]);
  b.fillRect(-h * 0.98, ey - 2.2, h * 1.96, 4.4 * fat);
  ashCap(b, h, ey - 2.4, top, r);
  for (let i = 0; i < 4; i++) {
    ellipse(b, (r() - 0.5) * h * 2.6, top + 3 + r() * 14, 1 + r() * 1.4, 0.9 + r(), r());
    b.fillStyle = rgba('#a89c90', 0.8);
    b.fill();
  }
  heat(l, 0, ey, 9 * fat + 4, COAL[3], glow);
}

function torn(b, h, y, r) { // paper ripped off ragged, a flap curled over, tobacco spilling
  const pts = [[-h, y + 2]];
  for (let i = 0; i <= 7; i++) pts.push([-h + (h * 2 * i) / 7, y - 1 - (i % 2 ? 5 : 0.6) - r() * 4]);
  pts.push([h, y + 2]);
  b.beginPath();
  pts.forEach(([px, py], i) => (i ? b.lineTo(px, py) : b.moveTo(px, py)));
  b.closePath();
  b.fillStyle = shade(PAPER, -0.25);
  b.fill();
  line(b, rgba(SOOT, 0.8), 1.2);
  for (let i = 0; i < 14; i++) {
    const x = (r() - 0.5) * h * 1.7;
    path(b, [[x, y - 1], [x + (r() - 0.5) * 6, y - 5 - r() * 8]], true);
    line(b, i % 3 ? '#4a2e16' : '#7a4e24', 1.4);
  }
  path(b, [[h * 0.2, y - 3], [h * 1.4, y - 10], [h * 1.2, y - 3]]);
  b.fillStyle = shade(PAPER, -0.35);
  b.fill();
  line(b, rgba(SOOT, 0.7), 1);
}

function charred(b, l, h, L, r) { // burnt right down: a black flaking tube, split by embers, crumbling at the top
  tube(b, h, 0, -L, IRON[2], 1.4);
  b.save();
  b.beginPath();
  b.rect(-h, -L, h * 2, L);
  b.clip();
  grain(b, -h, -L, h * 2, L, 1.6);
  streaks(b, r, -h, h, -L, 0, 6, SOOT, 0.5, 0.9);
  for (let i = 0; i < 4; i++) {
    const y = -L * (0.2 + r() * 0.7);
    path(b, [[-h, y], [-h * 0.2, y + (r() - 0.5) * 4], [h * 0.4, y + 1 + r() * 2], [h * 0.9, y + (r() - 0.5) * 3]], true);
    line(b, rgba(COAL[2], 0.5), 1.1); // an ember in the split
    if (i < 2) heat(l, 0, y, 7, COAL[2], 0.2);
  }
  b.restore();
  outline(b, h, 0, -L);
  ashCap(b, h * 0.95, -L + 6, -L - 2, r);
}

export function cig(b, l, { L, w, kind, seed, glow = 0.3 }) {
  const r = rng(seed);
  const fat = kind === 'stub' ? 1.5 : 1;
  const hh = (w / 2) * (kind === 'stub' ? 1.25 : 1);
  b.save();
  if (kind === 'char') charred(b, l, hh, L, r);
  else if (kind === 'filter') {
    paper(b, hh, 0, -(L - 15), r, 0.4);
    filterEnd(b, hh, -(L - 15), -L, r, true);
  } else {
    filterEnd(b, hh, 0, -L * 0.2, r, false);
    if (kind === 'snap') {
      paper(b, hh, -L * 0.2, -(L - 6), r, 0.55);
      torn(b, hh, -(L - 6), r);
    } else {
      paper(b, hh, -L * 0.2, -(L - 17), r, 0.7);
      burnt(b, l, hh, -(L - 17), -L, r, fat, glow);
    }
  }
  b.restore();
}
