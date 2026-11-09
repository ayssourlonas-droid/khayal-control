// The pieces of one little craft of the breath (world 17), drawn by breath-craft.js into its sprite, in the craft's own
// space: the hull's middle at 0, 0, the nose up (y -37), the engine's nozzle at y 29, units of one pixel at the size the craft
// is shown (the sprite is baked at twice that). Leaf-shaped wings, a pair of leaf canards, two small tail leaves, the white
// teardrop hull with its green trim, its glass canopy and its round white emblem with a green leaf (the vapour that streams
// below the engine is breath-craft-vapour.js). Frames 0 and 1 differ in the wings' tilt, their tips up or down.
// Everything is outlined in deep green so the craft reads on the bright morning as well as in the smog. Paint-time only.
import { lin, rad, rgba } from './sprites.js';
import { leafPath, veins, RIM } from './breath-leaf.js';

export const MINT = '#8ff0b4'; // the craft's light green (the vapour's too: breath-craft-vapour.js)
const GREEN = '#35b868';

function wing(g, side, f) {
  const tip = [36, f ? 7 : 19];
  g.save();
  g.scale(side, 1);
  leafPath(g, 5, 1, tip[0], tip[1], f ? 11 : 12.5, 0.46);
  g.fillStyle = lin(g, 0, f ? -8 : 0, 0, 24, [[0, '#c4f9ad'], [0.5, '#66d283'], [1, '#2b9f58']]);
  g.fill();
  g.save();
  g.clip();
  hullPath(g); // the hull's soft shadow on the wing
  g.lineWidth = 8;
  g.strokeStyle = rgba('#06301a', 0.3);
  g.stroke();
  g.strokeStyle = rgba('#ffffff', 0.55); // the light along the leading edge
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(8, -4);
  g.quadraticCurveTo(24, f ? -8 : 0, tip[0] - 2, tip[1] - 1.5);
  g.stroke();
  veins(g, 5, 1, tip[0], tip[1], f ? 11 : 12.5, rgba('#ffffff', 0.38));
  g.strokeStyle = rgba('#e6ffd8', 0.95); // the midrib
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(5, 1);
  g.lineTo(tip[0] - 1.5, tip[1] - 0.8);
  g.stroke();
  g.restore();
  leafPath(g, 5, 1, tip[0], tip[1], f ? 11 : 12.5, 0.46);
  g.lineWidth = 2;
  g.lineJoin = 'round';
  g.strokeStyle = RIM;
  g.stroke();
  g.restore();
}

function small(g, side, ax, ay, tx, ty, wid) {
  g.save();
  g.scale(side, 1);
  leafPath(g, ax, ay, tx, ty, wid, 0.45);
  g.fillStyle = lin(g, ax, ay - wid, tx, ty + wid, [[0, '#c4f9ad'], [1, '#38ad63']]);
  g.fill();
  g.lineWidth = 1.7;
  g.lineJoin = 'round';
  g.strokeStyle = RIM;
  g.stroke();
  g.restore();
}

export function leaves(g, f) {
  for (const side of [-1, 1]) {
    small(g, side, 4, 19, 12.5, f ? 32 : 34, 4.2); // under the hull: tail leaves
    wing(g, side, f);
    small(g, side, 7, -12, 21, f ? -20 : -17.5, 4.6); // canards
  }
}

function hullPath(g) {
  g.beginPath();
  g.moveTo(0, -37);
  g.bezierCurveTo(4.5, -32, 9.6, -17, 9.8, -3);
  g.bezierCurveTo(10, 8, 8, 19, 6, 26);
  g.lineTo(-6, 26);
  g.bezierCurveTo(-8, 19, -10, 8, -9.8, -3);
  g.bezierCurveTo(-9.6, -17, -4.5, -32, 0, -37);
  g.closePath();
}

const band = (g, y0, y1) => {
  g.fillStyle = lin(g, 0, y0, 0, y1, [[0, MINT], [1, GREEN]]);
  g.fillRect(-12, y0, 24, y1 - y0);
  g.fillStyle = rgba(RIM, 0.75);
  g.fillRect(-12, y0 - 0.4, 24, 0.9);
  g.fillRect(-12, y1 - 0.5, 24, 0.9);
};

export function hull(g) {
  hullPath(g);
  g.fillStyle = lin(g, -10, 0, 10, 0, [[0, '#ffffff'], [0.4, '#f3fbff'], [0.75, '#cde3ea'], [1, '#98bcc8']]);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, 0, -38, 0, -28, [[0, '#d6ffe4'], [1, '#3fbf70']]); // the green nose
  g.fillRect(-12, -40, 24, 11);
  g.fillStyle = rgba(RIM, 0.8);
  g.fillRect(-12, -29.4, 24, 1);
  band(g, -26, -22);
  band(g, 18, 22.5);
  g.fillStyle = rgba('#8fb0bb', 0.6); // a seam
  g.fillRect(-12, 12, 24, 0.7);
  g.fillStyle = lin(g, 0, -28, 0, 20, [[0, rgba('#ffffff', 0.95)], [1, rgba('#ffffff', 0)]]); // the lit left side
  g.fillRect(-7.2, -28, 2.6, 48);
  g.fillStyle = rgba('#1e5a6e', 0.16); // and the shaded right
  g.fillRect(4.5, -30, 6, 60);
  g.restore();
  hullPath(g);
  g.lineWidth = 2;
  g.lineJoin = 'round';
  g.strokeStyle = RIM;
  g.stroke();
}

export function canopy(g) { // glass over the pilot's seat: no face, just a dome of pale mint with a glint
  g.beginPath();
  g.ellipse(0, -12.5, 4.2, 6.4, 0, 0, Math.PI * 2);
  g.fillStyle = rad(g, 0, -12.5, 0, 8, [[0, '#f2fffa'], [0.55, '#9be8cf'], [1, '#3a9f84']], -1.6, -15);
  g.fill();
  g.lineWidth = 1.2;
  g.strokeStyle = RIM;
  g.stroke();
  g.strokeStyle = rgba('#ffffff', 0.9);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(-2.4, -14.5);
  g.lineTo(-1.4, -17.4);
  g.stroke();
}

export function emblem(g) { // a white roundel with a green leaf on it
  g.beginPath();
  g.arc(0, 7, 9.6, 0, Math.PI * 2);
  g.fillStyle = rad(g, 0, 7, 0, 10, [[0, '#ffffff'], [0.8, '#eef8f4'], [1, '#cfe6e0']], -3, 3.5);
  g.fill();
  g.lineWidth = 1.7;
  g.strokeStyle = RIM;
  g.stroke();
  g.beginPath();
  g.arc(0, 7, 7.9, 0, Math.PI * 2);
  g.lineWidth = 0.9;
  g.strokeStyle = rgba(GREEN, 0.8);
  g.stroke();
  g.lineCap = 'round';
  g.lineWidth = 1.2;
  g.strokeStyle = RIM; // the stem
  g.beginPath();
  g.moveTo(-6, 14.6);
  g.lineTo(-3.4, 12.2);
  g.stroke();
  leafPath(g, -3.4, 12.2, 5.2, -0.2, 4.9, 0.45);
  g.fillStyle = lin(g, -3, 11, 5, 0, [[0, '#17893f'], [0.55, '#3fc268'], [1, '#a6f08a']]);
  g.fill();
  g.lineWidth = 1;
  g.lineJoin = 'round';
  g.stroke();
  g.strokeStyle = rgba('#e6ffd8', 0.95);
  g.lineWidth = 0.8;
  g.beginPath();
  g.moveTo(-3, 11.6);
  g.lineTo(4, 1.2);
  g.stroke();
}

export function nozzle(g) {
  g.beginPath();
  g.moveTo(-6.2, 23.5);
  g.lineTo(6.2, 23.5);
  g.lineTo(7.6, 29.8);
  g.lineTo(-7.6, 29.8);
  g.closePath();
  g.fillStyle = lin(g, 0, 23, 0, 30, [[0, '#3f9a63'], [1, '#14452b']]);
  g.fill();
  g.lineWidth = 1.6;
  g.lineJoin = 'round';
  g.strokeStyle = RIM;
  g.stroke();
  g.beginPath();
  g.ellipse(0, 29.8, 5.4, 2.3, 0, 0, Math.PI * 2);
  g.fillStyle = '#effffa';
  g.fill();
}
