// The sprites of Glass Cathedral's moving things (flourish-glass-2.js draws them), each painted once: a glass dove in four
// frames of its wingbeat (a pale body of blue-white glass shading to rose at the belly, five lancet feathers a wing, lead
// round every piece), a bronze bell with its lip banded in gilt, and a chandelier of dark iron: a ring of six candles with a
// small flame each, a second ring under it and drops of jewel glass hanging from that. The chain and the bell's clapper
// are drawn each frame; the flames' glows are drawn from FLAMES.
import { cached, rgba, lin, rad } from './sprites.js';
import { TAU } from '../core/math.js';

export const DOVE = { w: 76, h: 60, frames: 4 };
export const WINGBEAT = [0, 1, 2, 3, 2, 1]; // the frames of one beat, down and up again
const WING = [-1.95, -2.55, 3.0, 2.25]; // each frame's wing direction (rad from the beak: up and back, back and up, level back, down and back)
export const BELL = { w: 48, h: 54, yoke: 7, lip: 46 }; // the box; the yoke's y (the pivot) and the lip's y
export const CHANDELIER = { w: 104, h: 92 };
export const FLAMES = Array.from({ length: 6 }, (_, i) => [52 + Math.cos((i * TAU) / 6 + 0.5) * 38, 33 + Math.sin((i * TAU) / 6 + 0.5) * 7.5 - 14]); // where a flame stands

const LEADC = 'rgba(10,6,24,0.7)';
const feather = (g, x, y, a, len, wd) => {
  const [c, s] = [Math.cos(a), Math.sin(a)];
  const at = (u, v) => [x + c * u - s * v, y + s * u + c * v];
  g.beginPath();
  g.moveTo(...at(0, 0));
  g.quadraticCurveTo(...at(len * 0.45, -wd), ...at(len, 0));
  g.quadraticCurveTo(...at(len * 0.45, wd), ...at(0, 0));
  g.closePath();
};

// One wing from the shoulder (40, 30.5) pointing along angle a: a shell of coverts at the root, and six long feathers fanned toward the
// tail, each a lancet with a lead edge, in glass shading from blue-white to rose; `dim` fades the far wing.
function wing(g, a, dim) {
  const [sx, sy, k] = [40, 30.5, Math.sin(a) < 0 ? -1 : 1]; // k: the way the feathers fan, toward the tail
  const LENS = [28, 27, 25.5, 23.5, 21, 17.5];
  const fillWith = () => lin(g, 0, 4, 0, 54, [[0, `rgba(226,240,255,${0.74 * dim})`], [1, `rgba(255,190,216,${0.66 * dim})`]]);
  for (let i = LENS.length - 1; i >= 0; i--) {
    feather(g, sx, sy, a + k * i * 0.13, LENS[i], 4.6);
    g.fillStyle = fillWith();
    g.fill();
    g.strokeStyle = LEADC;
    g.lineWidth = 0.9;
    g.stroke();
  }
  g.beginPath();
  g.ellipse(sx + Math.cos(a) * 6, sy + Math.sin(a) * 6, 10, 5.6, a, 0, TAU);
  g.fillStyle = fillWith();
  g.fill();
  g.stroke();
}

// A dove facing right in wing frame f (0 wings up .. 3 wings down), 76 x 60: the far wing behind the body, dimmer, then a slim body of
// blue-white glass shading to rose at the belly, cut by lead into panels, a small head with a gilt beak and an eye of lead, a
// fanned tail, and the near wing in front.
export const doveFrame = (f) => cached('glassfxDove' + f, DOVE.w, DOVE.h, (g) => {
  wing(g, WING[f] + 0.2, 0.5);
  g.beginPath();
  g.moveTo(62, 26);
  g.bezierCurveTo(60, 20.6, 52.5, 20.4, 51.4, 27);
  g.bezierCurveTo(47, 28, 40, 26.4, 30, 29);
  g.lineTo(5, 30.4);
  g.lineTo(2.4, 34.6);
  g.lineTo(9, 37.6);
  g.bezierCurveTo(22, 43.6, 38, 45, 49, 38.4);
  g.bezierCurveTo(54, 35, 58.6, 31.4, 62, 26);
  g.closePath();
  g.fillStyle = lin(g, 0, 22, 0, 46, [[0, 'rgba(230,242,255,0.82)'], [0.55, 'rgba(214,226,255,0.78)'], [1, 'rgba(255,176,206,0.8)']]);
  g.fill();
  g.strokeStyle = LEADC;
  g.lineWidth = 1;
  g.stroke();
  g.lineWidth = 0.8;
  g.beginPath(); // the lead between the panels of the body, and the tail's feathers
  g.moveTo(31, 29);
  g.lineTo(35, 42.4);
  g.moveTo(43, 27.6);
  g.lineTo(46, 39.6);
  g.moveTo(51.4, 27);
  g.lineTo(53, 35.4);
  g.moveTo(24, 30);
  g.lineTo(14, 37.2);
  g.moveTo(18, 30);
  g.lineTo(8, 36.4);
  g.stroke();
  g.fillStyle = 'rgba(255,214,120,0.92)';
  g.beginPath();
  g.moveTo(61.2, 25);
  g.lineTo(67.4, 27.2);
  g.lineTo(61, 28.4);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(10,6,24,0.85)';
  g.beginPath();
  g.arc(56.6, 24.8, 1, 0, TAU);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.7)'; // the glint along the back
  g.fillRect(31, 28.4, 12, 1.1);
  wing(g, WING[f], 1);
});

// A bell, 48 x 54, hung from a yoke at y 7: a dome shoulder flaring to a lip, lit from the right, a gilt band on the lip and a
// narrow gilt band at the shoulder. The clapper is drawn separately.
export const bellSprite = () => cached('glassfxBell', BELL.w, BELL.h, (g, w) => {
  g.translate(0, 2); // clear of the top edge
  g.fillStyle = '#0a0612';
  g.fillRect(w / 2 - 17, 0, 34, 6);
  g.beginPath();
  g.moveTo(w / 2 - 6, 6);
  g.lineTo(w / 2 + 6, 6);
  g.bezierCurveTo(w / 2 + 12, 12, w / 2 + 11, 26, w / 2 + 18, BELL.lip - 6);
  g.quadraticCurveTo(w / 2 + 22, BELL.lip - 2, w / 2 + 19, BELL.lip);
  g.lineTo(w / 2 - 19, BELL.lip);
  g.quadraticCurveTo(w / 2 - 22, BELL.lip - 2, w / 2 - 18, BELL.lip - 6);
  g.bezierCurveTo(w / 2 - 11, 26, w / 2 - 12, 12, w / 2 - 6, 6);
  g.closePath();
  g.fillStyle = lin(g, 0, 0, w, 0, [[0, '#5a4048'], [0.6, '#a07a60'], [1, '#e0b078']]);
  g.fill();
  g.fillStyle = 'rgba(255,214,120,0.8)';
  g.fillRect(w / 2 - 19, BELL.lip - 5, 38, 2.4);
  g.fillRect(w / 2 - 9, 17, 18, 1.8);
});

// A chandelier, 104 x 92, its chain's end at the top centre: the finial, six arms to a ring of six candles, a smaller ring and
// seven drops of jewel glass hung under it. Dark iron with a pale rim on the sunward side.
export const chandelierSprite = () => cached('glassfxChandelier', CHANDELIER.w, CHANDELIER.h, (g, w) => {
  const m = w / 2;
  g.strokeStyle = '#08040f';
  g.fillStyle = '#08040f';
  g.lineCap = 'round';
  g.lineWidth = 2.6;
  g.beginPath();
  g.ellipse(m, 33, 38, 7.5, 0, 0, TAU);
  g.stroke();
  g.beginPath();
  g.ellipse(m, 56, 22, 5, 0, 0, TAU);
  g.stroke();
  g.lineWidth = 1.8;
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * TAU) / 6 + 0.5;
    g.moveTo(m, 6);
    g.quadraticCurveTo(m + Math.cos(a) * 20, 14, m + Math.cos(a) * 38, 33 + Math.sin(a) * 7.5);
  }
  g.moveTo(m, 6);
  g.lineTo(m, 56);
  g.stroke();
  g.beginPath();
  g.arc(m, 5, 4, 0, TAU);
  g.fill();
  for (const [fx, fy] of FLAMES) {
    g.fillStyle = 'rgba(214,190,196,0.6)';
    g.fillRect(fx - 2, fy + 3, 4, 13);
    g.beginPath();
    g.moveTo(fx - 1.4, fy + 3);
    g.quadraticCurveTo(fx - 2.2, fy - 1, fx, fy - 5);
    g.quadraticCurveTo(fx + 2.2, fy - 1, fx + 1.4, fy + 3);
    g.fillStyle = 'rgba(255,184,120,0.85)';
    g.fill();
  }
  const jewels = ['#d83a68', '#3a78e0', '#ffd470', '#8c5ee8', '#1c9e86', '#f0709c', '#3a78e0'];
  jewels.forEach((c, i) => {
    const x = m - 21 + i * 7;
    const y = 58 + (i % 2) * 8;
    g.strokeStyle = 'rgba(8,4,15,0.7)';
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(x, 57);
    g.lineTo(x, y + 4);
    g.stroke();
    g.beginPath();
    g.moveTo(x, y + 2);
    g.lineTo(x + 3.6, y + 8);
    g.lineTo(x, y + 15);
    g.lineTo(x - 3.6, y + 8);
    g.closePath();
    g.fillStyle = rgba(c, 0.8);
    g.fill();
    g.stroke();
  });
  g.fillStyle = rad(g, m, 33, 0, 46, [[0, 'rgba(255,200,150,0.1)'], [1, 'rgba(255,200,150,0)']]);
  g.fillRect(m - 46, 2, 92, 68);
});
