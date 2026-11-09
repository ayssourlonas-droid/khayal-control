// World 17, Ash to Air, the armored (see w17.js): THE FAT CIGAR, the tank of the five. Half again as thick as a
// cigarette, leaf-brown and armoured in overlapping plates of wrapper leaf (each with its own veins, shingled toward the
// fire), a plain cream paper band round its middle (no print, a darker worn edge, a flap where the ends meet), a clipped
// cut end at the back (top), and a thick plated cone of grey ash at the lit end (w17-cigar-ash.js). Two angry slits
// glow under a heavy leaf brow. Hurt, the generic cracks split it down the middle through plates and band alike.
// Beat 0/1: the embers in the ash seams flare, the eyes burn brighter and flakes of ash fall away differently.
// Lights: the eyes, the seams and coal in the ash. Drawn upright, then turned a little to the left of the dive.
import { path, lin, rad, rgba, mix, line, ellipse, INK, PAPER, PAPER_D, RIM, lerp, tubePts, cyl, glint, grime, streaks, turned } from './w17-kit.js';
import { glare } from './w17-fx.js';
import { clamp } from '../../core/math.js';
import { ash } from './w17-cigar-ash.js';
import { scales } from './w17-cigar-leaf.js';

const LEAF = '#8c5a2c';
const GIRTH = [[-34, 11.6], [-28, 16], [-20, 19.4], [-8, 20.4], [6, 20.4], [14, 19.2], [19, 17.4]]; // half-width along the cigar: a torpedo
const hw = (y) => {
  const i = Math.max(1, GIRTH.findIndex(([gy]) => gy >= y));
  const [[y0, w0], [y1, w1]] = [GIRTH[i - 1], GIRTH[i]];
  return lerp(w0, w1, clamp((y - y0) / (y1 - y0), 0, 1));
};

// The wrapper: shingled leaf scales over a shaded cylinder, then light and shadow across the whole barrel.
function wrapper(b) {
  const pts = tubePts(() => 0, hw, -34, 19, 20);
  path(b, pts);
  b.fillStyle = cyl(b, -20.4, 20.4, LEAF, 0.62);
  b.fill();
  b.save();
  path(b, pts);
  b.clip();
  scales(b, hw, -30, 15.5, 8);
  grime(b, 30, 91, 0, -8, 17, 27, 0.25, '#1a0c04');
  b.fillStyle = lin(b, -20.4, 0, 20.4, 0, [[0, rgba('#ffe0b0', 0.4)], [0.22, rgba('#ffe0b0', 0)], [0.62, rgba('#000000', 0)], [1, rgba('#000000', 0.5)]]);
  b.fillRect(-21, -40, 42, 62);
  b.restore();
  path(b, pts);
  line(b, INK, 2.5);
  glint(b, -14.2, -24, -15.4, -14, 1.5, 0.5, RIM);
  glint(b, -16.4, 0, -16.6, 12, 1.4, 0.45, RIM);
}

// The clipped end: a slanted cut across the top, the wrapper ring dark, the filler a tight spiral of tobacco.
function cutEnd(b) {
  ellipse(b, 0, -33, 11.8, 4.2);
  b.fillStyle = '#3a210f';
  b.fill();
  ellipse(b, 0, -33, 9.4, 3.1);
  b.fillStyle = rad(b, 0, -33, 0.5, 10, [[0, '#d0924c'], [0.55, '#8a5a2a'], [1, '#4a2a12']]);
  b.fill();
  b.save();
  ellipse(b, 0, -33, 9.4, 3.1);
  b.clip();
  for (let r = 1; r <= 3; r++) {
    ellipse(b, 0.4, -33, r * 2.8, r * 0.95, 0.1);
    line(b, rgba('#2a1408', 0.55), 0.8);
  }
  grime(b, 14, 95, 0, -33, 8, 2.4, 0.5, '#2a1408');
  b.restore();
  ellipse(b, 0, -33, 11.8, 4.2);
  line(b, INK, 2.4);
  b.beginPath();
  b.ellipse(0, -33, 11.8, 4.2, 0, Math.PI * 1.05, Math.PI * 1.5);
  line(b, rgba(RIM, 0.7), 1.2);
}

// The plain paper band: cream, worn, with a darker edge, a flap where it overlaps, a crease and a few stains.
function band(b) {
  const [y0, y1] = [-14.4, -4.8];
  const w = hw(-9) + 1.5;
  const trace = (g) => {
    g.beginPath();
    g.moveTo(-w, y0);
    g.quadraticCurveTo(0, y0 + 2.4, w, y0);
    g.lineTo(w + 0.4, y1);
    g.quadraticCurveTo(0, y1 + 2.8, -w - 0.4, y1);
    g.closePath();
  };
  b.fillStyle = lin(b, 0, y0 - 2, 0, y1 + 4, [[0, 'rgba(0,0,0,0.5)'], [0.3, 'rgba(0,0,0,0)']]); // its shadow on the leaf
  b.fillRect(-w, y0 - 2, w * 2, 3);
  trace(b);
  b.fillStyle = cyl(b, -w, w, mix(PAPER, '#e8dcc0', 0.4), 0.5);
  b.fill();
  b.save();
  trace(b);
  b.clip();
  streaks(b, 12, 97, -w, w, y0, y1, PAPER_D, 0.2, 0.6);
  grime(b, 7, 98, 0, -9, w, 4, 0.2);
  b.fillStyle = rgba('#fff8e6', 0.5); // the flap where the ends overlap
  b.fillRect(6.4, y0 - 1, 6, 14);
  b.beginPath();
  b.moveTo(6.4, y0);
  b.lineTo(6.4, y1 + 3);
  line(b, rgba(PAPER_D, 0.9), 1);
  b.beginPath();
  b.moveTo(-w, -10.4);
  b.lineTo(-w * 0.3, -9.4);
  b.lineTo(-w * 0.6, -7);
  line(b, rgba(PAPER_D, 0.7), 0.8);
  b.restore();
  trace(b);
  line(b, '#5a4a30', 1.6);
  b.beginPath();
  b.moveTo(-w + 1, y0 + 1.3);
  b.quadraticCurveTo(0, y0 + 3.4, w - 1, y0 + 1.3);
  line(b, rgba('#ffffff', 0.75), 1);
}

export function armored(b, l, f) {
  turned(b, l, 0.2, 0, -3, () => {
    wrapper(b);
    cutEnd(b);
    band(b);
    glare(b, l, 0, 5.6, 8.6, 5.2, 2.6, f);
    ash(b, l, f);
  });
}
