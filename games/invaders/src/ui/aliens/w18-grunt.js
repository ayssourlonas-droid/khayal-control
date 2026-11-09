// World 18, Anvil Sky, the grunt (see w18.js): THE STORM HORNET, a wasp-like fighter drone diving nose-down. A tail
// of amber and black armoured segments ends in a glowing vent, a narrow waist joins it to a ridged thorax on riveted
// shoulders, and a wide head (w18-grunt-head.js) carries two great faceted eyes under angry brows and an emitter barrel with
// a spark at its tip. Two pairs of veined wings beat (w18-grunt-wing.js): raised on beat 0, lowered on beat 1. Lights: the eyes, the
// vent, the seams between the segments and the spark.
import { path, ink, lin, rgba, shade, line, ellipse, both, INK, IRON, STEEL, FORGE, rivet, scuff, glare, metal } from './w18-kit.js';
import { wings } from './w18-grunt-wing.js';
import { head, emitter } from './w18-grunt-head.js';

const BLACK = '#1d1824';
const SEG = [-42, -37, -32, -27, -22, -17, -12, -9]; // where the abdomen's segments break

// Half the abdomen's width at y: a teardrop, pointed at the tail and pinched at the waist.
const hw = (y) => 11.2 * Math.sin(Math.PI * Math.min(1, (y + 42) / 33.4) ** 0.8);

function abdomenOutline(g) {
  g.beginPath();
  for (let y = -42; y <= -9; y += 1) g.lineTo(-hw(y), y);
  for (let y = -9; y >= -42; y -= 1) g.lineTo(hw(y), y);
  g.closePath();
}

function abdomen(b, l, f, c) {
  b.save();
  abdomenOutline(b);
  b.fillStyle = lin(b, -13, 0, 13, 0, [[0, shade(c, -0.5)], [0.22, shade(c, 0.5)], [0.45, c], [0.78, shade(c, -0.3)], [1, shade(c, -0.62)]]);
  b.fill();
  b.clip();
  for (let i = 1; i < SEG.length - 1; i += 2) { // the black bands
    b.fillStyle = lin(b, -13, 0, 13, 0, [[0, '#060509'], [0.25, '#4a4258'], [0.5, BLACK], [1, '#050408']]);
    b.beginPath();
    b.moveTo(-14, SEG[i] - 1);
    b.quadraticCurveTo(0, SEG[i] + 4, 14, SEG[i] - 1);
    b.lineTo(14, SEG[i + 1] - 1);
    b.quadraticCurveTo(0, SEG[i + 1] + 4, -14, SEG[i + 1] - 1);
    b.fill();
  }
  for (const y of SEG.slice(1)) { // the seams, bowed toward the head, with a bright lip under each
    b.beginPath();
    b.moveTo(-14, y - 1);
    b.quadraticCurveTo(0, y + 4, 14, y - 1);
    line(b, INK, 1.8);
    b.beginPath();
    b.moveTo(-12, y + 0.4);
    b.quadraticCurveTo(0, y + 5.2, 12, y + 0.4);
    line(b, rgba('#fff2d0', 0.34), 0.8);
  }
  scuff(b, 14, 3, 0, -25, 9, 15, 0.2);
  b.restore();
  abdomenOutline(b);
  line(b, INK, 2.8);
  const lit = f ? 0.2 : 0.34; // the seams leak a little warmth, flickering with the beat
  for (const y of SEG.slice(1, -1)) {
    l.beginPath();
    l.moveTo(-hw(y) * 0.86, y);
    l.quadraticCurveTo(0, y + 4.6, hw(y) * 0.86, y);
    l.lineWidth = 1.6;
    l.strokeStyle = rgba(FORGE, lit);
    l.stroke();
  }
}

// The vent at the tail: an iron nozzle with an ember in it.
function vent(b, l, f) {
  b.beginPath();
  b.moveTo(-3.6, -41);
  b.lineTo(-4.6, -46);
  b.lineTo(4.6, -46);
  b.lineTo(3.6, -41);
  b.closePath();
  ink(b, metal(b, -4, -43, 4, -37, IRON), 2);
  ellipse(b, 0, -46, 4.1, 1.6);
  ink(b, '#050408', 1.4);
  glare(l, 0, -45, f ? 1.2 : 1.8, FORGE, 0.8);
}

function legs(b) {
  both((s) => {
    for (const [y, k] of [[-1, 0], [4, 1], [9, 2]]) {
      const pts = [[s * 7, y], [s * (14 + k * 1.2), y - 1 + k * 2.4], [s * (18 + k * 1.6), y + 6 + k * 3.4]];
      path(b, pts, true);
      line(b, INK, 3.2);
      line(b, '#3a3046', 1.6);
      path(b, pts.slice(0, 2), true);
      line(b, rgba(STEEL, 0.55), 0.7);
    }
  });
}

function thorax(b, c) {
  b.beginPath();
  b.moveTo(-4, -4);
  b.bezierCurveTo(-13, -3, -13, 9, -7, 13);
  b.lineTo(7, 13);
  b.bezierCurveTo(13, 9, 13, -3, 4, -4);
  b.closePath();
  ink(b, lin(b, -12, -4, 12, 12, [[0, shade(c, 0.45)], [0.45, c], [1, shade(c, -0.6)]]), 2.8);
  b.save();
  b.beginPath();
  b.moveTo(-4, -4);
  b.bezierCurveTo(-13, -3, -13, 9, -7, 13);
  b.lineTo(7, 13);
  b.bezierCurveTo(13, 9, 13, -3, 4, -4);
  b.closePath();
  b.clip();
  b.fillStyle = BLACK; // the dark stripe down the middle, and a ridge either side of it
  b.fillRect(-2.6, -5, 5.2, 20);
  for (const x of [-7.2, 7.2]) {
    b.beginPath();
    b.moveTo(x * 0.7, -3);
    b.quadraticCurveTo(x * 1.2, 4, x * 0.8, 12);
    line(b, rgba('#fff0c0', 0.4), 1);
  }
  scuff(b, 8, 5, 0, 4, 9, 8, 0.2);
  b.restore();
  both((s) => { // armoured shoulders where the wings hinge
    ellipse(b, s * 9.4, -1.2, 4.6, 3.6, s * 0.4);
    ink(b, metal(b, s * 6, -4, s * 12, 2, IRON), 2);
    rivet(b, s * 9.6, -1.4, 1.1);
  });
}

export function grunt(b, l, f, c) {
  b.translate(0, 2); // set a little low: the vent at the tail needs the room above
  l.translate(0, 2);
  wings(b, f);
  legs(b);
  abdomen(b, l, f, c);
  vent(b, l, f);
  b.beginPath(); // the waist
  b.rect(-3.2, -10, 6.4, 8);
  ink(b, lin(b, -3, 0, 3, 0, [[0, '#2a2236'], [0.4, '#6a6080'], [1, '#0c0a12']]), 2);
  thorax(b, c);
  emitter(b, l, f);
  head(b, l, f, c);
}
