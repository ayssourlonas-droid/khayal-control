// The sprites of Lantern Deep's two sky flourishes (flourish-12.js draws them), each painted once: a shaft of
// light slanting down from a surface nobody can see, in a broad cut and a narrow one; and the far whale in six
// frames of its body wave, a dark silhouette with a faint pale rim along its back, pleats under the chin, a few
// bioluminescent spots down its flank, a flipper and flukes that follow the wave. The fish, the jellyfish and
// the caustics are in flourish-deep-sprites-2.js and -3.js.
import { cached, rgba, lin, glow } from './sprites.js';
import { TAU } from '../core/math.js';

export const SHAFT = { w: 260, h: 640 };
const CUTS = [{ top: 50, foot: 118 }, { top: 26, foot: 64 }]; // half the width at the head and at the foot of each cut

// A shaft, 260 x 640, its head centred on the top edge: a wedge widening downward in five nested layers (so its
// sides are feathered), brightest at the head and gone by the foot, with three faint streaks where the light
// breaks up in the water.
export const shaftSprite = (cut) => cached('deepfxShaft' + cut, SHAFT.w, SHAFT.h, (g, w, h) => {
  const { top, foot } = CUTS[cut];
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, rgba('#cfeeff', 0.3)], [0.3, rgba('#cfeeff', 0.17)], [0.65, rgba('#bfe4ff', 0.05)], [1, rgba('#bfe4ff', 0)]]);
  for (let j = 0; j < 5; j++) {
    const k = 1 - j * 0.19;
    g.beginPath();
    g.moveTo(w / 2 - top * k, 0);
    g.lineTo(w / 2 + top * k, 0);
    g.lineTo(w / 2 + foot * k, h);
    g.lineTo(w / 2 - foot * k, h);
    g.closePath();
    g.fill();
  }
  g.strokeStyle = lin(g, 0, 0, 0, h, [[0, 'rgba(255,255,255,0.22)'], [0.7, 'rgba(255,255,255,0)']]);
  [[-0.45, 3], [0.1, 6], [0.55, 4]].forEach(([f, lw]) => {
    g.lineWidth = lw;
    g.beginPath();
    g.moveTo(w / 2 + f * top, 0);
    g.lineTo(w / 2 + f * foot, h);
    g.stroke();
  });
});

export const WHALE = { w: 640, h: 250, frames: 6 };
const [HEAD, TAIL, MID, AMP] = [570, 140, 125, 38]; // the nose and the tail root (x), the swimming line (y), the tail's swing (px)
const STEPS = 40;

// Where the spine is at s (0 the nose, 1 the tail root) in a wave phase, the way the body's top lies (normal) and
// its half thickness there: deepest just behind the head, thinning to the tail, a hump at the dorsal fin.
function at(s, phase) {
  const spine = (u) => [HEAD - (HEAD - TAIL) * u, MID + AMP * u ** 1.8 * Math.sin(phase - 4.2 * u)];
  const [x, y] = spine(s);
  const [ax, ay] = spine(Math.max(0, s - 0.01));
  const [bx, by] = spine(Math.min(1, s + 0.01));
  const len = Math.hypot(bx - ax, by - ay);
  const hw = 44 * Math.sin(Math.PI * s ** 0.55) ** 0.9 + 6 * s * s;
  return { x, y, nx: -(by - ay) / len, ny: (bx - ax) / len, hw, top: hw * 0.88 + 13 * Math.exp(-(((s - 0.66) / 0.04) ** 2)), bottom: hw * 1.08 };
}

// A line along the body at s0..s1 and `f` of the way from the spine to the belly (f < 0) or the back (f > 0).
function along(g, phase, s0, s1, f) {
  g.beginPath();
  for (let i = 0; i <= 12; i++) {
    const p = at(s0 + ((s1 - s0) * i) / 12, phase);
    const d = f * p.hw;
    g.lineTo(p.x + p.nx * d, p.y + p.ny * d);
  }
  g.stroke();
}

// The flukes, 34 px behind the tail root and 58 across each way, turned to the line the tail ends on.
function flukes(g, phase) {
  const p = at(1, phase);
  g.save();
  g.translate(p.x, p.y);
  g.rotate(Math.atan2(-p.nx, p.ny));
  for (const sgn of [-1, 1]) {
    g.beginPath();
    g.moveTo(-8, sgn * 4);
    g.quadraticCurveTo(6, sgn * 24, 34, sgn * 58);
    g.quadraticCurveTo(38, sgn * 26, 14, 0);
    g.closePath();
    g.fill();
  }
  g.restore();
}

// The long flipper under the body, hanging back and down from a third of the way along, sculling with the wave.
function flipper(g, phase) {
  const p = at(0.3, phase);
  const [x, y] = [p.x - p.nx * p.hw * 0.9, p.y - p.ny * p.hw * 0.9];
  g.beginPath();
  g.moveTo(x - 14, y);
  g.quadraticCurveTo(x - 30, y + 40, x - 66, y + 50 + 9 * Math.sin(phase + 1));
  g.quadraticCurveTo(x - 20, y + 36, x + 10, y - 4);
  g.closePath();
  g.fill();
}

// One frame of the whale, facing right, at body-wave phase `phase`.
function paintWhale(g, phase) {
  g.fillStyle = lin(g, 0, 70, 0, 180, [[0, '#02080f'], [0.55, '#041320'], [1, '#0a2a40']]);
  flukes(g, phase);
  flipper(g, phase);
  const pts = Array.from({ length: STEPS + 1 }, (_, i) => at(i / STEPS, phase));
  g.beginPath();
  pts.forEach((p) => g.lineTo(p.x + p.nx * p.top, p.y + p.ny * p.top));
  for (let i = STEPS; i >= 0; i--) g.lineTo(pts[i].x - pts[i].nx * pts[i].bottom, pts[i].y - pts[i].ny * pts[i].bottom);
  g.closePath();
  g.fill();
  g.strokeStyle = rgba('#7ad4f0', 0.28); // the faint light on the back
  g.lineWidth = 1.6;
  g.beginPath();
  pts.forEach((p) => g.lineTo(p.x + p.nx * p.top, p.y + p.ny * p.top));
  g.stroke();
  g.strokeStyle = rgba('#8fd0e8', 0.18); // pleats under the chin
  g.lineWidth = 1;
  for (let j = 0; j < 6; j++) along(g, phase, 0.04, 0.42, -(0.3 + 0.1 * j));
  g.strokeStyle = rgba('#3a7a9a', 0.5); // the line of the mouth
  g.lineWidth = 1.4;
  along(g, phase, 0.0, 0.2, -0.3);
  for (let j = 0; j < 9; j++) { // spots down the flank, teal and violet in turn: a small glow and a pin of light
    const p = at(0.1 + j * 0.085, phase);
    const color = j % 3 === 1 ? '#b27cff' : '#3de8d0';
    const [x, y] = [p.x - p.nx * p.hw * 0.5, p.y - p.ny * p.hw * 0.5];
    g.globalAlpha = 0.4;
    g.drawImage(glow(color), x - 7, y - 7, 14, 14);
    g.globalAlpha = 1;
    g.fillStyle = rgba(color, 0.9);
    g.beginPath();
    g.arc(x, y, 1.3, 0, TAU);
    g.fill();
  }
}

export const whaleFrame = (k) => cached('deepfxWhale' + k, WHALE.w, WHALE.h, (g) => paintWhale(g, (k / WHALE.frames) * TAU));
