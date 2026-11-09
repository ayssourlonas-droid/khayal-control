// The Grand Grimoire's pages (World 12, Starlit Archive; see grimoire.js): a page block, drawn once as the
// left one and mirrored for the right. Aged parchment shaded dark into the gutter, the stacked edges of
// the leaves under it, a gilt border, a running head, an initial in gold leaf on lapis, ruled lines of
// gilded script in an invented hand and a diagram of rings and a star; a corner turned down at the top.
// The script is on the lights layer too, and glints crawl along it (grimoire-fx.js).
import { path, ink, line, lin, rad, rgba, bloom, ellipse, TAU } from './kit.js';
import { soft, hash, INK } from '../sprites.js';
import { GOLD, GILT, GOLD_D, PARCH, INK_B, leaf, gilt, stud, curl, scriptPath, sigil, LINES, SIGIL } from './grimoire-kit.js';

const FOLD = [[-128, -84], [-104, -111]]; // the turned-down corner's crease, from the fore-edge to the top edge
const CORNER = [-130, -112]; // the corner it turns over
const CAP = [-96, -85, 28, 34]; // the initial: x, y, w, h

// The point p reflected in the line a-b.
function reflect([px, py], [ax, ay], [bx, by]) {
  const [dx, dy] = [bx - ax, by - ay];
  const u = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  return [2 * (ax + u * dx) - px, 2 * (ay + u * dy) - py];
}

// The parchment: dark in the gutter, pale on the fore-edge, yellowed at the corners, foxed, with the
// stacked edges of the leaves beneath running round it.
function face(b) {
  leaf(b);
  ink(b, lin(b, 125, 0, -125, 0, [[0, '#7a5a30'], [0.1, '#c2a468'], [0.32, PARCH], [0.8, '#f6ebc8'], [1, '#d8c08a']]), 3);
  b.save();
  leaf(b);
  b.clip();
  b.fillStyle = rad(b, 0, 0, 40, 175, [[0, 'rgba(120,80,20,0)'], [1, 'rgba(120,80,20,0.42)']]);
  b.fillRect(-135, -125, 270, 250);
  for (let i = 0; i < 20; i++) { // foxing, brown stains blooming in the paper
    const r = 3 + hash(i + 70) * 9;
    b.globalAlpha = 0.1 + hash(i + 71) * 0.16;
    b.drawImage(soft('#8a5a20'), -120 + hash(i + 72) * 240 - r, -110 + hash(i + 73) * 215 - r, r * 2, r * 2);
  }
  b.globalAlpha = 1;
  b.fillStyle = lin(b, 40, 0, -20, 0, [[0, 'rgba(255,250,225,0)'], [0.5, 'rgba(255,250,225,0.24)'], [1, 'rgba(255,250,225,0)']]); // where the sheet rises from the gutter
  b.fillRect(-30, -125, 80, 250);
  b.fillStyle = lin(b, 125, 0, 66, 0, [[0, 'rgba(20,8,0,0.6)'], [1, 'rgba(20,8,0,0)']]); // the gutter's shadow
  b.fillRect(60, -125, 70, 250);
  b.restore();
  for (const k of [0.99, 0.978, 0.966]) { // the leaves beneath, their edges just showing
    b.save();
    b.scale(k, k);
    leaf(b);
    line(b, rgba(INK_B, 0.26), 1 / k);
    b.restore();
  }
  for (const [k, a] of [[0.925, 0.95], [0.94, 0.5]]) {
    b.save();
    b.scale(k, k * 0.985);
    leaf(b);
    gilt(b, 1.1, a);
    b.restore();
  }
}

// The initial: gold leaf scrolled on a field of lapis in a gilt frame, and a vine climbing the margin below.
function dropCap(b) {
  const [x, y, w, h] = CAP;
  path(b, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  ink(b, lin(b, x, y, x + w, y + h, [[0, '#3a3090'], [1, '#14104a']]), 2);
  path(b, [[x + 2.5, y + 2.5], [x + w - 2.5, y + 2.5], [x + w - 2.5, y + h - 2.5], [x + 2.5, y + h - 2.5]]);
  gilt(b, 1, 0.9);
  for (const [cy, d] of [[y + 11, 1], [y + 23, -1]]) { // two scrolls making an S
    b.beginPath();
    curl(b, x + w / 2, cy, 6.5, d, 1.5);
    line(b, INK, 3.2);
    line(b, GILT, 1.6);
  }
  for (const [dx, dy] of [[5, 5], [w - 5, 5], [5, h - 5], [w - 5, h - 5]]) stud(b, x + dx, y + dy, 1.2, GILT);
  b.beginPath();
  b.moveTo(-104, -44);
  for (let yy = -44; yy < 22; yy += 13) b.bezierCurveTo(-110, yy + 4, -98, yy + 6, -104, yy + 13);
  line(b, rgba('#5a3a14', 0.55), 1.1);
  for (let yy = -36; yy < 14; yy += 26) {
    ellipse(b, -99, yy, 3.4, 1.7, -0.6);
    b.fillStyle = rgba(GOLD, 0.9);
    b.fill();
  }
}

// The turned-down corner: the page's back in a darker parchment lit along the crease, a shadow under it.
function dogEar(b) {
  const [a, c] = FOLD;
  const r = reflect(CORNER, a, c);
  b.save();
  b.globalCompositeOperation = 'destination-out'; // the corner it leaves
  path(b, [a, c, [CORNER[0] - 6, CORNER[1] - 6]]);
  b.fill();
  b.restore();
  path(b, [a, [c[0] + 4, c[1] + 4], [c[0] + 8, c[1] + 12], [a[0] + 10, a[1] + 8]]);
  b.fillStyle = rgba('#000000', 0.3); // its shadow on the page
  b.fill();
  path(b, [a, c, r]);
  ink(b, lin(b, a[0], a[1], r[0], r[1], [[0, '#c8aa6e'], [1, '#8a6a38']]), 1.8);
  path(b, [a, c], true);
  line(b, rgba('#fff6d0', 0.8), 1.4);
}

export function page(b, l) {
  face(b);
  b.save();
  leaf(b);
  b.clip();
  dropCap(b);
  for (let k = 0; k < LINES.length; k++) { // gilded script: a dark edge under a thread of gold, the head in red
    scriptPath(b, k);
    line(b, rgba(INK_B, 0.9), 2);
    line(b, k === 0 ? '#d8482a' : GOLD, 0.95);
  }
  sigil(b);
  line(b, rgba(INK_B, 0.85), 1.1);
  sigil(b);
  line(b, rgba(GOLD, 0.5), 0.5);
  for (let i = 0; i < 7; i++) { // a bead of gold on each point of the star
    const a = (i * 3 * TAU) / 7 - Math.PI / 2;
    stud(b, SIGIL.x + Math.cos(a) * SIGIL.r * 0.78, SIGIL.y + Math.sin(a) * SIGIL.r * 0.78, 1.8, GOLD);
  }
  stud(b, SIGIL.x, SIGIL.y, 3.4, GILT);
  for (const [x, y] of [[-6, 100], [30, 102], [-114, 92]]) stud(b, x, y, 1.6, GOLD); // a pin or two through the foot
  b.restore();
  dogEar(b);
  l.save(); // the script and the diagram in light: a thread of gold with a faint glow
  l.globalCompositeOperation = 'lighter';
  leaf(l);
  l.clip();
  for (let k = 0; k < LINES.length; k++) {
    scriptPath(l, k);
    l.lineWidth = 2.2;
    l.strokeStyle = rgba(GOLD_D, 0.14);
    l.stroke();
    l.lineWidth = 0.9;
    l.strokeStyle = rgba(GILT, 0.42);
    l.stroke();
  }
  sigil(l);
  l.lineWidth = 3;
  l.strokeStyle = rgba(GOLD_D, 0.18);
  l.stroke();
  l.lineWidth = 1;
  l.strokeStyle = rgba(GILT, 0.6);
  l.stroke();
  l.restore();
  bloom(l, SIGIL.x, SIGIL.y, 34, GOLD, 0.12);
  bloom(l, CAP[0] + 14, CAP[1] + 17, 22, GOLD, 0.16);
}
