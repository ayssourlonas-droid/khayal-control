// The Craving's maw (World 17, Ash to Air; see craving.js): a weak part 150 x 112, the burning mouth. A tall ragged oval cut into
// the smoke of the head: a thick lip of charred ash round it, cracked, an ember glowing deep in every crack (the same cracks on the
// lights layer), its outer edge fraying into soot so it melts into the head behind; inside, a furnace. The body layer has the
// furnace's colour (a white-gold heart falling through orange and red to a black throat under the upper lip, a bed of coal at the
// bottom, tongues of flame in it); the lights layer blazes it, the brightest thing on the boss, and rims every tooth
// (craving-maw-teeth.js) and the lip. Maw coordinates (the part's centre is the origin). Bake-time only.
import { fringe, featherE } from './craving-pkit-edge.js';
import { blobPath, crack, crackPts, embers, grain, heat, line, lin, rad, rgba, rng, path, circle, streaks, TAU, SOOT, IRON, ASH, COAL } from './craving-pkit.js';
import { teeth } from './craving-maw-teeth.js';

export const RX = 50;
export const RY = 46;
export const CY = 2;
const ringPts = (off, jit, r) => Array.from({ length: 22 }, (_, i) => { // the outline `off` px outside the opening, ragged
  const a = (i * TAU) / 22;
  const f = 1 + (r() - 0.5) * jit;
  return [Math.cos(a) * (RX + off) * f, CY + Math.sin(a) * (RY + off) * f];
});
const topAt = (x) => CY - RY * Math.sqrt(Math.max(0, 1 - (x / RX) ** 2)) + 3;
const botAt = (x) => CY + RY * Math.sqrt(Math.max(0, 1 - (x / RX) ** 2)) - 3;

function lip(b, l, r) {
  fringe(b, 0, CY, RX + 13, RY + 10, 9, 48, 7);
  for (let i = 0; i < 20; i++) { // the soot fraying out into the head
    const a = (i * TAU) / 20 + r();
    const [x, y] = [Math.cos(a) * (RX + 14), CY + Math.sin(a) * (RY + 14)];
    circle(b, x, y, 24);
    b.fillStyle = rad(b, x, y, 0, 24, [[0, rgba(IRON[1], 0.85)], [0.5, rgba(IRON[1], 0.4)], [1, rgba(IRON[1], 0)]]);
    b.fill();
  }
  const outer = ringPts(15, 0.2, r);
  for (let i = 0; i < 16; i++) { // chunks of char that stand out of the rim: a ragged edge
    const a = (i * TAU) / 16 + r() * 0.3;
    const [x, y, s] = [Math.cos(a) * (RX + 14 + r() * 5), CY + Math.sin(a) * (RY + 14 + r() * 5), 5 + r() * 6];
    circle(b, x, y, s);
    b.fillStyle = r() < 0.5 ? IRON[1] : IRON[2];
    b.fill();
  }
  blobPath(b, outer);
  b.fillStyle = rad(b, 0, CY + 4, RX * 0.8, RX * 1.35, [[0, '#5a1a0c'], [0.3, IRON[2]], [0.7, IRON[1]], [1, IRON[0]]]);
  b.fill();
  b.save();
  blobPath(b, outer);
  b.clip();
  b.fillStyle = lin(b, 0, CY - 62, 0, CY + 62, [[0, 'rgba(160,170,190,0.16)'], [0.3, 'rgba(0,0,0,0)'], [1, 'rgba(255,110,40,0.2)']]); // cold rim above, ember below
  b.fillRect(-72, CY - 64, 144, 130);
  grain(b, -72, CY - 64, 144, 130, 1.2);
  embers(b, r, -72, CY - 64, 144, 130, 110, 0.55);
  streaks(b, r, -56, 56, CY - 40, CY + 60, 14, '#ff7a1a', 0.16, 0.5);
  for (let i = 0; i < 13; i++) { // radial cracks from the opening, glowing
    const a = (i * TAU) / 13 + r() * 0.3;
    const pts = crackPts(r, Math.cos(a) * (RX + 2), CY + Math.sin(a) * (RY + 2), a, 2, 5);
    crack(b, l, pts, 1.6, COAL[3], 0.5);
  }
  for (let i = 0; i < 12; i++) { // shards of crust: angular, pale on their lit edge
    const a = r() * TAU;
    const [x, y, s] = [Math.cos(a) * (RX + 5 + r() * 10), CY + Math.sin(a) * (RY + 5 + r() * 10), 4 + r() * 5];
    path(b, [[x - s, y - s * 0.4], [x - s * 0.2, y - s], [x + s, y - s * 0.3], [x + s * 0.6, y + s * 0.8], [x - s * 0.7, y + s * 0.6]]);
    b.fillStyle = rgba(ASH[0], 0.8);
    b.fill();
    line(b, rgba(SOOT, 0.8), 1);
    path(b, [[x - s, y - s * 0.4], [x - s * 0.2, y - s], [x + s, y - s * 0.3]], true);
    line(b, rgba(ASH[3], 0.4), 0.9);
  }
  b.restore();
  blobPath(b, outer);
  line(b, rgba(SOOT, 0.6), 2);
  featherE(b, 0, CY, RX, RY, RX + 11, RX + 22, 0.55); // the ring's outer edge softens into the smoke of the head, the ring itself stays
}

function furnace(b, l, r) {
  const hole = ringPts(0, 0.1, rng(99));
  b.save();
  blobPath(b, hole);
  b.clip();
  b.fillStyle = rad(b, 0, CY + 6, 2, 62, [[0, '#fff4c0'], [0.16, '#ffd070'], [0.38, '#ff8a22'], [0.66, '#c2380e'], [1, '#2a0806']]);
  b.fillRect(-RX - 4, CY - RY - 4, RX * 2 + 8, RY * 2 + 8);
  b.fillStyle = lin(b, 0, CY - RY, 0, CY + 6, [[0, 'rgba(8,2,2,0.9)'], [0.55, 'rgba(8,2,2,0.35)'], [1, 'rgba(8,2,2,0)']]); // the throat
  b.fillRect(-RX - 4, CY - RY - 4, RX * 2 + 8, RY + 12);
  for (let i = 0; i < 9; i++) { // tongues of flame
    const x = (i - 4) * 9 + (r() - 0.5) * 4;
    const h = 20 + r() * 26;
    path(b, [[x, CY + 36], [x + (r() - 0.5) * 12, CY + 36 - h * 0.5], [x + (r() - 0.5) * 8, CY + 36 - h]], true);
    line(b, rgba(COAL[4], 0.28), 3 + r() * 3);
  }
  b.fillStyle = lin(b, 0, CY + 22, 0, CY + RY, [[0, rgba(COAL[4], 0)], [0.5, rgba(COAL[3], 0.5)], [1, rgba(COAL[1], 0.8)]]); // coals at the bottom
  b.fillRect(-RX - 4, CY + 22, RX * 2 + 8, RY);
  b.restore();
  blobPath(b, hole);
  line(b, rgba(SOOT, 0.9), 3.4);
  return hole;
}

export function maw(b, l) {
  const r = rng(61);
  b.save();
  l.save();
  lip(b, l, r);
  const hole = furnace(b, l, r);
  for (const g of [b, l]) {
    g.save();
    blobPath(g, ringPts(4, 0.1, rng(99)));
    g.clip();
  }
  teeth(b, l, topAt, botAt, 17);
  b.restore();
  l.restore();
  l.save();
  l.globalCompositeOperation = 'lighter';
  blobPath(l, hole);
  line(l, rgba(COAL[3], 0.2), 7);
  l.restore();
  heat(l, 0, CY + 6, 90, COAL[1], 0.28);
  heat(l, 0, CY + 6, 64, COAL[3], 0.55);
  heat(l, 0, CY + 8, 40, COAL[4], 0.8);
  heat(l, 0, CY + 8, 20, COAL[5], 0.9);
  b.restore();
  l.restore();
}
