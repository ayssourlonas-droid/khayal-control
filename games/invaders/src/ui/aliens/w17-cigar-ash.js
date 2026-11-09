// World 17, Ash to Air, the armored's ash (w17-cigar.js): THE FAT CIGAR's lit end. The wrapper ends in a ragged black
// char edge; past it a thick grey cone of ash built of three heavy, bevelled plates stacked toward the fire, each
// narrower than the last and the last one broken into jagged teeth, with a crater of coal showing under them. Embers
// glow in short slits down the seams between the plates; on beat 1 they flare and a chunk of ash has flaked off.
// Lights: the seam embers, the coal, a wash of firelight over the broken edge and the char.
import { path, lin, rad, rgba, line, ellipse, bloom, INK, ASH, ASH_D, CHAR, EMBER, HOT, hash, lerp, TAU, cyl, glint, grime, blocked } from './w17-kit.js';
import { coal, flake } from './w17-fx.js';

// Each plate: its outline, top to bottom. Plate 0 sits on the leaf, plate 2 is the broken tip.
const FAT = 1.1; // the barrel's girth, matched in w17-cigar.js
const PLATES = [
  [[-16.2, 17], [-17.2, 21], [-16.4, 25.6], [-8, 27.2], [0, 27.8], [8, 27.2], [16.4, 25.6], [17.2, 21], [16.2, 17]],
  [[-14.8, 24.4], [-15.8, 28.4], [-14.6, 32.4], [-7, 33.8], [0, 34.2], [7, 33.8], [14.6, 32.4], [15.8, 28.4], [14.8, 24.4]],
  [[-12.6, 31], [-13.4, 34.4], [-10.4, 34], [-9, 38.6], [-5.6, 34.6], [-3, 39.8], [0.6, 35], [3.6, 39], [6.4, 34.4], [9.8, 37.4], [11.2, 33.8], [13.4, 34.4], [12.6, 31]],
].map((pts) => pts.map(([x, y]) => [x * FAT, y]));
const TONES = [ASH, '#9a938b', '#8e8780'];

// The wrapper's burnt end: a ragged black rim with a thin red-hot line along it.
function charEdge(b, l, f) {
  const pts = [[-18.2, 14.6]];
  for (let i = 0; i <= 12; i++) pts.push([lerp(-18.2, 18.2, i / 12), i % 2 ? 13.6 : 17.8 - hash(i + 3) * 1.6]);
  pts.push([18.4, 19.4], [-18.4, 19.4]);
  path(b, pts);
  b.fillStyle = lin(b, -17, 0, 17, 0, [[0, '#4a3a2e'], [0.35, '#2b1f17'], [1, CHAR]]);
  b.fill();
  line(b, INK, 1.8);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  for (let i = 0; i <= 12; i += 2) l.lineTo(lerp(-18.2, 18.2, i / 12), 17.6 - hash(i + 3) * 1.6);
  line(l, rgba(EMBER, 0.5 + f * 0.2), 1.4);
  l.restore();
}

// A few embers along the seam under plate k: where the ash has split, small hot spots show, which of them burn
// brightest swapping with the beat.
function seam(l, k, f) {
  const pts = PLATES[k];
  const lo = pts[Math.floor(pts.length / 2)][1];
  for (let i = 0; i < 4; i++) {
    const x = -11 + i * 7.3 + (hash(k * 9 + i) - 0.5) * 3;
    const on = (i + f + k) % 2 ? 1 : 0.5;
    bloom(l, x, lo - 0.8, 5.2, EMBER, 0.5 * on);
    l.save();
    l.globalCompositeOperation = 'lighter';
    l.beginPath();
    l.ellipse(x, lo - 0.8, 1.6 + hash(k * 13 + i), 0.8, 0, 0, TAU);
    l.fillStyle = rgba(HOT, 0.45 + 0.45 * on);
    l.fill();
    l.restore();
  }
}

export function ash(b, l, f) {
  const tip = (g) => path(g, PLATES[2]);
  charEdge(b, l, f);
  l.save(); // the coal under the broken tip, cut away where plates stand in front of it
  coal(l, 0, 37.2, 7, 3.4, f);
  for (const k of [2, 1, 0]) blocked(l, (g) => path(g, PLATES[k]));
  l.restore();
  ellipse(b, 0, 37, 9.4, 3.6);
  b.fillStyle = CHAR;
  b.fill();
  for (const k of [2, 1, 0]) { // the lowest plate first: each higher one overlaps it
    const trace = (g) => path(g, PLATES[k]);
    const y0 = PLATES[k][0][1];
    trace(b);
    b.fillStyle = cyl(b, -19, 19, TONES[k], 0.6);
    b.fill();
    b.save();
    trace(b);
    b.clip();
    b.fillStyle = lin(b, 0, y0, 0, y0 + 7, [[0, rgba('#fffaf0', 0.36)], [1, rgba('#fffaf0', 0)]]); // the bevel: lit top edge
    b.fillRect(-20, y0, 40, 7);
    b.fillStyle = lin(b, 0, y0 + 4, 0, y0 + 14, [[0, rgba('#000000', 0)], [1, rgba('#000000', 0.38)]]);
    b.fillRect(-20, y0 + 4, 40, k === 2 ? 8 : 14);
    grime(b, 22, 70 + k, 0, y0 + 5, 16, 5, 0.5, ASH_D);
    grime(b, 12, 80 + k, -4, y0 + 3, 14, 3, 0.5, '#fffaf0');
    for (let c = 0; c < 2; c++) { // hairline fissures
      const x = -9 + c * 12 + k * 3;
      b.beginPath();
      b.moveTo(x, y0 + 1);
      b.lineTo(x + 2.4, y0 + 4);
      b.lineTo(x - 0.6, y0 + 6.6);
      line(b, rgba(ASH_D, 0.85), 1);
    }
    b.restore();
    trace(b);
    line(b, INK, 2.3);
    glint(b, -14, y0 + 3, -14.8, y0 + 6.4, 1.3, 0.55, '#fffaf0');
  }
  seam(l, 0, f);
  seam(l, 1, f);
  l.save(); // a wash of firelight over the broken tip's teeth
  l.globalCompositeOperation = 'lighter';
  tip(l);
  l.clip();
  l.fillStyle = rad(l, 0, 38.6, 0, 13, [[0, rgba(EMBER, 0.55 + f * 0.15)], [1, rgba(EMBER, 0)]]);
  l.fillRect(-15, 30, 30, 11);
  l.restore();
  flake(b, f ? 15 : -15, f ? 38 : 34, f ? 2.6 : 2, 0.4 + f, 4);
  flake(b, f ? -16.4 : 16.4, f ? 27 : 30, 1.5, 1.1 + f, 9);
}
