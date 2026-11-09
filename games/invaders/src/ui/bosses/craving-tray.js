// The Craving's tray (World 17, Ash to Air; see craving.js): a weak part 280 x 88 at the front of the throne, the ashtray's glowing
// mouth. A wide scoop is cut out of the rim and the wall between the two inner rests, framed in cast iron (a thick lip under it and
// shoulders at its ends that blend into the wall), and heaped in it a bed of coals and smouldering butts that rises above the rim:
// lump on lump (craving-tray-coals.js), white-gold at their hearts, orange, then crusted grey, three butts burning in it, a few lumps
// spilled over the lip and down the iron. A hot line runs along the lip's edge. The body carries the colour, the lights blaze it: the
// brightest weak point after the maw. Tray coordinates (the part's centre, boss (0, 96), is the origin). Bake-time only.
import { blobPath, grain, heat, heatE, line, lin, path, rad, rgba, rng, streaks, SOOT, IRON, ASH, COAL } from './craving-pkit.js';
import { coal, butt } from './craving-tray-coals.js';

const BAY = [[-134, -22], [-128, 4], [-108, 24], [-60, 33], [0, 36], [60, 33], [108, 24], [128, 4], [134, -22], [112, -33], [70, -40], [0, -43], [-70, -40], [-112, -33]];
const bay = (g) => blobPath(g, BAY);

function frame(b) { // the iron lip under the scoop and its shoulders
  const r = rng(111);
  b.beginPath();
  b.moveTo(-150, -26);
  b.quadraticCurveTo(-150, 20, -118, 34);
  b.quadraticCurveTo(0, 56, 118, 34);
  b.quadraticCurveTo(150, 20, 150, -26);
  b.lineTo(138, -26);
  b.quadraticCurveTo(138, 12, 112, 26);
  b.quadraticCurveTo(0, 46, -112, 26);
  b.quadraticCurveTo(-138, 12, -138, -26);
  b.closePath();
  b.fillStyle = lin(b, 0, 20, 0, 52, [[0, IRON[5]], [0.35, IRON[3]], [1, IRON[1]]]);
  b.fill();
  b.save();
  b.clip();
  grain(b, -150, -30, 300, 90, 1.2);
  streaks(b, r, -140, 140, 20, 52, 18, SOOT, 0.4, 0.9);
  b.restore();
  b.lineWidth = 2.4;
  line(b, SOOT, 2.4);
  path(b, [[-118, 30], [-60, 40], [0, 43], [60, 40], [118, 30]], true);
  line(b, rgba(ASH[3], 0.4), 1.2);
}

export function tray(b, l) {
  const r = rng(113);
  b.save();
  l.save();
  b.beginPath();
  b.rect(-172, -78, 344, 156);
  b.clip();
  frame(b);
  bay(b);
  b.fillStyle = rad(b, 0, -4, 6, 140, [[0, '#d2400f'], [0.5, COAL[1]], [1, COAL[0]]]);
  b.fill();
  b.save();
  bay(b);
  b.clip();
  for (let row = 0; row < 7; row++) { // the heap, back to front: each row lower and a little bigger
    const y = -38 + row * 10.5;
    const w = 128 - Math.abs(row - 2) * 3;
    for (let x = -w; x < w; x += 15 + r() * 6) {
      const crest = Math.max(0, 1 - Math.abs(x) / 150); // the middle is heaped higher
      coal(b, l, x + (r() - 0.5) * 6, y + (r() - 0.5) * 5 + (1 - crest) * 5, 10 + r() * 7 + row * 0.9, Math.min(1, (0.3 + 0.9 * crest * (1 - Math.abs(row - 3.4) / 5.5)) * (0.55 + r() * 0.85)), r);
    }
  }
  butt(b, l, -66, -16, 0.5, 30);
  butt(b, l, 22, -22, 2.7, 26);
  butt(b, l, 74, -8, 0.15, 28);
  b.fillStyle = lin(b, 0, -44, 0, 36, [[0, 'rgba(10,4,2,0.35)'], [0.35, 'rgba(10,4,2,0)'], [1, 'rgba(10,4,2,0.28)']]);
  b.fillRect(-150, -46, 300, 84);
  b.restore();
  bay(b);
  line(b, rgba(SOOT, 0.85), 2.4);
  for (const [x, y, s] of [[-86, 38, 8], [-20, 46, 6], [58, 44, 7], [104, 34, 6]]) coal(b, l, x, y, s, 0.5 + r() * 0.3, r); // spilled over the lip
  l.save();
  l.globalCompositeOperation = 'lighter';
  path(l, [[-116, 25], [-60, 33], [0, 36], [60, 33], [116, 25]], true);
  line(l, rgba(COAL[3], 0.3), 6);
  path(l, [[-116, 25], [-60, 33], [0, 36], [60, 33], [116, 25]], true);
  line(l, rgba(COAL[5], 0.85), 1.6); // the hot line along the lip
  l.restore();
  heatE(l, 0, -2, 172, 74, COAL[1], 0.3);
  heatE(l, 0, -8, 110, 56, COAL[3], 0.26);
  heat(l, 0, -10, 50, COAL[4], 0.24);
  b.restore();
  l.restore();
}
