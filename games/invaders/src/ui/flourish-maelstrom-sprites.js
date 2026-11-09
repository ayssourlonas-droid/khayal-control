// The baked pieces of World 15's maelstrom (the whirlpool that stands in for world 8's well), drawn by
// flourish-maelstrom.js and painted once: three spiral arms (curved lanes of tiny bubbles, glints and streaks of
// light, the outer faint and wide, the inner bright and close, the middle one wound the other way), the dark throat
// with its thin bright aqua lip, the violet-and-teal funnel that turns inside it and the two comet arcs that run
// round the lip. The glassy bubble is in flourish-maelstrom-bubble.js. Every sprite is drawn about its own centre,
// so that it can be turned about it.
import { cached, glow, star, rgba, rad, hash } from './sprites.js';
import { TAU } from '../core/math.js';
import { LIP } from '../fx/react-maelstrom.js';

const AQUA = '#5af0ff';
const TEAL = '#3de8d0';
const PALE = '#9af4ff';
const VIOLET = '#b27cff';
export const R_IN = 44; // px from the centre at which the arms begin (just outside the lip, under the throat's soft edge)
export const WIND = 0.4; // how tightly an arm winds: it turns ln(r / R_IN) / WIND radians, one way or the other (dir)

// The three arms, outer to inner. dir: which way they wind; spin: radians a second the sprite turns (the same sign
// as dir, so each arm seems to be drawn inward as it turns); alpha: how bright it is drawn; dots: tiny bubbles and
// glints on each lane. The middle one winds and turns the other way.
export const ARMS = [
  { R: 232, lanes: 4, dir: 1, spin: 0.1, alpha: 0.65, dots: 36, seed: 11 },
  { R: 168, lanes: 3, dir: -1, spin: -0.17, alpha: 0.75, dots: 28, seed: 23 },
  { R: 112, lanes: 3, dir: 1, spin: 0.3, alpha: 0.95, dots: 22, seed: 37 },
];
export const armSize = (arm) => 2 * (arm.R + 4);

const fall = (s) => Math.min(1, s * 9) * (1 - s) ** 1.15; // an arm's light along it: in from nothing at the lip, then fading out to its tip

// Where lane j of an arm is at s (0 at the lip end, 1 at the tip; spaced evenly in log radius, so the little
// bubbles on it thin out toward the tip): [x, y, angle] about the sprite's centre.
function lanePoint(arm, j, s) {
  const r = R_IN * ((arm.R - 20) / R_IN) ** s;
  const a = (j / arm.lanes) * TAU + (arm.dir * Math.log(r / R_IN)) / WIND;
  return [Math.cos(a) * r, Math.sin(a) * r, a];
}

// A lane's streak of light: a soft wide stroke and a thin core, a segment at a time so the glow fades along it.
function streak(g, arm, j, color) {
  const steps = 34;
  g.lineCap = 'butt';
  for (let k = 0; k < steps; k++) {
    const [x0, y0] = lanePoint(arm, j, k / steps);
    const [x1, y1] = lanePoint(arm, j, (k + 1) / steps);
    const s = (k + 0.5) / steps;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.lineWidth = 8 - 4 * s;
    g.strokeStyle = rgba(color, 0.07 * fall(s));
    g.stroke();
    g.lineWidth = 1.5;
    g.strokeStyle = rgba(color, 0.5 * fall(s));
    g.stroke();
  }
}

// The little things strewn along a lane: rings of bubbles (half of them), soft motes and the odd four-point glint.
function dots(g, arm, j, color, other) {
  for (let i = 0; i < arm.dots; i++) {
    const h = (n) => hash(arm.seed * 1009 + j * 211 + i * 7 + n);
    const s = (i + 0.15 + 0.7 * h(1)) / arm.dots;
    const f = fall(s);
    if (f < 0.04) continue;
    const [x, y, a] = lanePoint(arm, j, s);
    const off = (h(2) - 0.5) * 2 * (5 + 8 * s);
    const [px, py] = [x + Math.cos(a) * off, y + Math.sin(a) * off];
    const c = h(3) < 0.2 ? other : color;
    const rho = 1.2 + 2.4 * h(5);
    const kind = h(4);
    if (kind < 0.5) {
      g.beginPath();
      g.arc(px, py, rho, 0, TAU);
      g.lineWidth = 0.9;
      g.strokeStyle = rgba(c, 0.8 * f);
      g.stroke();
      g.fillStyle = rgba(c, 0.12 * f);
      g.fill();
    } else if (kind < 0.85) {
      g.globalAlpha = 0.7 * f;
      g.drawImage(glow(c), px - rho * 2, py - rho * 2, rho * 4, rho * 4);
    } else {
      g.globalAlpha = 0.9 * f;
      g.drawImage(star(PALE), px - 6, py - 6, 12, 12);
    }
    g.globalAlpha = 1;
  }
}

export const arm = (i) => cached('deepmael-arm' + i, armSize(ARMS[i]), armSize(ARMS[i]), (g) => {
  const a = ARMS[i];
  g.translate(a.R + 4, a.R + 4);
  g.globalCompositeOperation = 'lighter';
  for (let j = 0; j < a.lanes; j++) {
    const color = j % 3 === 2 ? VIOLET : j % 2 ? TEAL : AQUA; // a little violet in the lanes
    streak(g, a, j, color);
    dots(g, a, j, color, PALE);
  }
});

// The throat: deep blue-black, darkest in the middle and feathering out past the lip, which is a thin bright aqua
// ring (a soft wide stroke, a brighter one and a pale core) just outside the 40 px at which the core swallows a bullet.
export const THROAT = 128;
export const throat = () => cached('deepmael-throat', THROAT, THROAT, (g) => {
  const half = THROAT / 2;
  g.translate(half, half);
  g.fillStyle = rad(g, 0, 0, 0, half - 2, [
    [0, rgba('#01030c', 0.97)], [0.5, rgba('#020718', 0.95)], [LIP / (half - 2), rgba('#04223e', 0.7)],
    [0.82, rgba('#063a60', 0.16)], [1, rgba('#063a60', 0)],
  ]);
  g.beginPath();
  g.arc(0, 0, half - 2, 0, TAU);
  g.fill();
  g.globalCompositeOperation = 'lighter';
  for (const [w, c, a] of [[10, TEAL, 0.1], [4.5, AQUA, 0.34], [1.5, '#d8fcff', 0.75]]) {
    g.beginPath();
    g.arc(0, 0, LIP, 0, TAU);
    g.lineWidth = w;
    g.strokeStyle = rgba(c, a);
    g.stroke();
  }
});

// The funnel inside the lip: three violet and teal lanes winding down into the dark, bright where they leave the
// lip and gone before the middle, with a faint violet glow at the bottom for depth.
export const FUNNEL = 96;
export const funnel = () => cached('deepmael-funnel', FUNNEL, FUNNEL, (g) => {
  const [c0, r0, r1, steps] = [FUNNEL / 2, LIP - 3, 5, 24];
  g.translate(c0, c0);
  g.globalCompositeOperation = 'lighter';
  g.lineCap = 'butt';
  const at = (j, s) => {
    const r = r0 * (r1 / r0) ** s;
    const a = (j / 3) * TAU + Math.log(r / r0) / 0.45;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };
  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < steps; k++) {
      const s = (k + 0.5) / steps;
      g.beginPath();
      g.moveTo(...at(j, k / steps));
      g.lineTo(...at(j, (k + 1) / steps));
      g.lineWidth = 3.4 - 2 * s;
      g.strokeStyle = rgba(j === 1 ? TEAL : VIOLET, 0.5 * (1 - s) ** 1.3);
      g.stroke();
    }
  }
  g.globalAlpha = 0.35;
  g.drawImage(glow(VIOLET), -14, -14, 28, 28);
});

// Two comet arcs round the lip, the head ahead (clockwise) and brightest, the tail fading behind; the second is
// half as bright. Turned, they make the lip seem to spin.
export const LIP_BOX = 112;
export const lipArc = () => cached('deepmael-lip', LIP_BOX, LIP_BOX, (g) => {
  const [half, span, steps] = [LIP_BOX / 2, 1.7, 16];
  g.translate(half, half);
  g.globalCompositeOperation = 'lighter';
  g.lineCap = 'butt';
  for (let q = 0; q < 2; q++) {
    const gain = q ? 0.45 : 0.85;
    const a0 = q * Math.PI;
    for (let k = 0; k < steps; k++) {
      g.beginPath();
      g.arc(0, 0, LIP, a0 + (k / steps) * span, a0 + ((k + 1) / steps) * span + 0.01);
      g.lineWidth = 3.2;
      g.strokeStyle = rgba(PALE, gain * ((k + 1) / steps) ** 1.5);
      g.stroke();
    }
    const head = a0 + span;
    g.globalAlpha = gain;
    g.drawImage(glow(PALE), Math.cos(head) * LIP - 9, Math.sin(head) * LIP - 9, 18, 18);
    g.globalAlpha = 1;
  }
});
