// The storm hornet's wings (w18-grunt.js): two pairs of veined, translucent wings that beat between two poses. On beat 0
// they are raised (swept back and up the sprite), on beat 1 they are lowered and spread out; each beat also carries a faint
// ghost of the other pose, the blur of a wing that never stops. A wing is drawn in its own frame, root at the origin and
// the tip along +x, then turned and mirrored into place.
import { rgba, line, INK, lerp } from './w18-kit.js';

const AMBER_VEIN = '#4a2e12';

// The outline of one wing: length L, half-width W; the leading edge (the top) is the straighter one.
function trace(g, L, W) {
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(L * 0.22, -W * 1.05, L * 0.78, -W * 0.95, L, -W * 0.12);
  g.bezierCurveTo(L * 0.86, W * 0.62, L * 0.36, W * 0.86, 0, W * 0.14);
  g.closePath();
}

// One wing, not yet turned: a pale glassy membrane with an amber root, dark veins, a leading edge and a sheen.
function wing(g, L, W, a) {
  trace(g, L, W);
  const fill = g.createLinearGradient(0, 0, L, 0);
  fill.addColorStop(0, rgba('#ffd890', 0.88 * a));
  fill.addColorStop(0.3, rgba('#e8eeff', 0.66 * a));
  fill.addColorStop(1, rgba('#b8c8ff', 0.34 * a));
  g.fillStyle = fill;
  g.fill();
  g.save();
  trace(g, L, W);
  g.clip();
  for (const [k, spread] of [[0.95, -0.9], [0.9, -0.45], [0.88, 0.05], [0.8, 0.5], [0.62, 0.85]]) { // veins fanning from the root
    g.beginPath();
    g.moveTo(1, 0);
    g.quadraticCurveTo(L * 0.5, W * spread * 0.55, L * k, W * spread * 0.78);
    line(g, rgba(AMBER_VEIN, 0.66 * a), 0.9);
  }
  for (const k of [0.34, 0.5, 0.66, 0.8]) { // cross veins
    g.beginPath();
    g.moveTo(L * k, -W * 0.76 * Math.sin(k * 2.7));
    g.lineTo(L * k + 2, W * 0.7 * Math.sin(k * 2.4));
    line(g, rgba(AMBER_VEIN, 0.3 * a), 0.7);
  }
  g.fillStyle = rgba('#ffffff', 0.5 * a); // the sheen along the upper half
  g.beginPath();
  g.ellipse(L * 0.5, -W * 0.42, L * 0.3, W * 0.12, -0.06, 0, Math.PI * 2);
  g.fill();
  g.restore();
  trace(g, L, W);
  line(g, rgba(INK, 0.92 * a), 1.7);
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(L * 0.22, -W * 1.05, L * 0.78, -W * 0.95, L, -W * 0.12);
  line(g, rgba('#1c1208', 0.9 * a), 2.2); // the leading edge, thicker
}

// The poses: [angle of the fore wing, of the hind wing] in radians, for the right-hand side (y down: negative turns up).
const POSE = [[-1.12, -0.74], [0.12, 0.42]];

// Both wings on both sides, in pose f, at strength a.
function pair(b, f, a, sy) {
  const [fore, hind] = POSE[f];
  for (const side of [-1, 1]) {
    b.save();
    b.translate(side * 8, sy);
    b.scale(side, 1);
    b.rotate(hind);
    wing(b, 23, 8, a);
    b.restore();
    b.save();
    b.translate(side * 8, sy - 1);
    b.scale(side, 1);
    b.rotate(fore);
    wing(b, 34, 11, a);
    b.restore();
  }
}

export function wings(b, f) {
  pair(b, 1 - f, 0.2, lerp(-3, -1, f)); // the ghost of the other pose
  pair(b, f, 1, -2);
}
