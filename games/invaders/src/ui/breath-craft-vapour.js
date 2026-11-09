// The vapour that streams below a little craft's engine (world 17's breath; breath-craft.js paints it first, under the craft), in
// the craft's own space (the nozzle at 0, 29, the plume running down to about y 118). Paint-time only.
import { lin, rad, rgba, shade } from './sprites.js';
import { MINT } from './breath-craft-parts.js';

// The vapour streaming down from the nozzle: a plume that swells and thins to nothing, a bright thread in it, a little curl of
// wisp either side and a few soft puffs and green motes in it. The sway (`s`, -1 or 1) and the length differ between frames.
export function vapour(g, f) {
  const s = f ? 1 : -1;
  const end = f ? 108 : 118;
  g.beginPath();
  g.moveTo(-4.8, 29);
  g.bezierCurveTo(-11 + s, 46, -14 - s, 74, -2.5 * s, end);
  g.lineTo(2.5 * s, end);
  g.bezierCurveTo(14 + s, 74, 11 - s, 46, 4.8, 29);
  g.closePath();
  g.fillStyle = lin(g, 0, 29, 0, end, [[0, rgba('#ffffff', 0.92)], [0.22, rgba('#c4ecff', 0.72)], [0.6, rgba('#9fd8f2', 0.42)], [1, rgba('#8cc8ea', 0)]]);
  g.fill();
  g.beginPath();
  g.moveTo(-2, 30);
  g.quadraticCurveTo(-3 * s, 60, 0, end - 24);
  g.quadraticCurveTo(3 * s, 60, 2, 30);
  g.fillStyle = lin(g, 0, 30, 0, end - 24, [[0, rgba('#ffffff', 0.9)], [1, rgba('#ffffff', 0)]]);
  g.fill();
  g.save();
  g.lineCap = 'round';
  g.lineWidth = 1.1;
  for (const side of [-1, 1]) { // a curl of wisp on each side
    g.strokeStyle = lin(g, 0, 34, 0, 70, [[0, rgba('#e4f7ff', 0.6)], [1, rgba('#e4f7ff', 0)]]);
    g.beginPath();
    g.moveTo(side * 6.5, 33);
    g.bezierCurveTo(side * (11 + s), 40, side * (12 + s), 50, side * (8 - s), 54);
    g.bezierCurveTo(side * (5 - s), 57, side * (6 - s), 62, side * (9 - s), 61);
    g.stroke();
  }
  g.restore();
  const puffs = [[42, 9, 0.4], [58, 11, 0.32], [76, 12.5, 0.24], [96, 13, 0.14]];
  for (const [y, r, a] of puffs) {
    const x = s * 1.6 * (y / 60);
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = rad(g, x, y, 0, r, [[0, rgba('#ffffff', a)], [1, rgba('#ffffff', 0)]]);
    g.fill();
  }
  g.fillStyle = rgba(shade(MINT, 0.1), 0.9);
  for (const [x, y, r] of [[-9, 50, 1.3], [8.5, 62, 1.1], [-6, 80, 1], [4, 92, 1.2], [-3, 104, 1]]) {
    g.beginPath();
    g.arc(x + s * 0.8, y, r, 0, Math.PI * 2);
    g.fill();
  }
}
