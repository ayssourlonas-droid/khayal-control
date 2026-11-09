// More landmarks of world 17's far skyline (parallax-smog-far.js places them from its plan; the mast and the crane are in
// parallax-smog-far-works.js): a domed hall with a portico, a gasometer in its guide frame, and a pair of cooling towers. Each is
// `kind(g, P, out, o)` with o = { x, w, top, s, tone, far } like the rest; x is the left edge. Lit from the right like everything else
// on the layer; in the morning the dome is oxidised copper.
import { rgba, lin } from './sprites.js';
import { GROUND, poly, fade, wall, windows } from './parallax-smog-far-kit.js';
import { TAU } from '../core/math.js';

// A domed hall: a long low front with a portico (pilasters under a pediment), a drum with arched windows, a ribbed dome and its
// lantern. In the morning the dome is oxidised copper.
export function dome(g, P, out, o) {
  const { x, w, top, s, tone, far } = o;
  const [cx, yb] = [x + w / 2, GROUND + 6];
  const [rd, wingTop] = [w * 0.2, top + 96];
  const mainTop = top + 62;
  wall(g, P, x, wingTop, w, yb - wingTop, tone, far); // the wings
  windows(g, P, out, x + 6, wingTop + 8, w * 0.28, yb - wingTop - 16, { cw: 3, ch: 8, gx: 6, gy: 8, seed: s, lit: 0.05 });
  windows(g, P, out, x + w * 0.72 - 6, wingTop + 8, w * 0.28, yb - wingTop - 16, { cw: 3, ch: 8, gx: 6, gy: 8, seed: s + 9, lit: 0.05 });
  wall(g, P, cx - w * 0.3, mainTop, w * 0.6, yb - mainTop, tone, far); // the portico block
  poly(g, [[cx - w * 0.32, mainTop + 1], [cx, mainTop - 16], [cx + w * 0.32, mainTop + 1]]); // pediment
  g.fillStyle = tone;
  g.fill();
  g.strokeStyle = rgba(P.top, P.edgeA * 0.8);
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(cx - w * 0.32, mainTop);
  g.lineTo(cx, mainTop - 16);
  g.lineTo(cx + w * 0.32, mainTop);
  g.stroke();
  g.fillStyle = rgba(P.edge, P.edgeA * 0.28); // the columns
  for (let k = 0; k < 8; k++) g.fillRect(cx - w * 0.27 + k * (w * 0.54 / 7), mainTop + 6, 2.2, yb - mainTop - 14);
  g.fillStyle = tone; // the drum
  g.fillRect(cx - rd - 3, top + 40, rd * 2 + 6, 24);
  g.fillStyle = rgba(P.win, 0.9);
  for (let k = 0; k < 5; k++) g.fillRect(cx - rd + 3 + k * ((rd * 2 - 8) / 4.4), top + 46, 3, 10);
  g.fillStyle = lin(g, cx - rd, 0, cx + rd, 0, [[0, P.dome], [0.62, P.domeHi], [1, P.dome]]); // the dome
  g.beginPath();
  g.ellipse(cx, top + 42, rd, 38, 0, Math.PI, TAU);
  g.fill();
  g.strokeStyle = rgba(P.edge, P.edgeA * 0.32);
  g.lineWidth = 0.9;
  g.beginPath();
  for (let k = -3; k <= 3; k++) {
    g.moveTo(cx + k * rd * 0.28, top + 42);
    g.quadraticCurveTo(cx + k * rd * 0.2, top + 10, cx + k * rd * 0.04, top + 4);
  }
  g.stroke();
  g.fillStyle = tone; // the lantern and its finial
  g.fillRect(cx - 4, top - 2, 8, 12);
  g.fillRect(cx - 0.8, top - 14, 1.6, 14);
  g.fillStyle = rgba(P.top, P.edgeA * 0.8);
  g.fillRect(cx + 0.2, top - 12, 0.8, 10);
}

// A gasometer: the guide frame of a gas holder, columns and rings and diagonal bracing over a bell, its roof a flat crown with a rail.
export function gas(g, P, out, o) {
  const { x, w, top, tone, far } = o;
  const [yb, h] = [GROUND + 6, GROUND + 6 - top];
  wall(g, P, x, top + 10, w, h - 10, tone, far);
  fade(g, x, top + 10, w, h - 10, [[0, rgba(P.gas, 0.5)], [1, rgba(P.gas, 0)]]);
  g.strokeStyle = rgba(P.steel, 0.85);
  g.lineWidth = 1.3;
  g.beginPath();
  const panels = Math.max(5, Math.round(w / 22));
  for (let i = 0; i <= panels; i++) {
    const px = x + (i / panels) * w;
    g.moveTo(px, top + 10);
    g.lineTo(px, yb);
  }
  for (const t of [0.12, 0.38, 0.64]) {
    g.moveTo(x, top + 10 + (h - 10) * t);
    g.lineTo(x + w, top + 10 + (h - 10) * t);
  }
  for (let i = 0; i < panels; i++) { // diagonals in the top two bays
    const px = x + (i / panels) * w;
    const [y0, y1] = [top + 10 + (h - 10) * 0.12, top + 10 + (h - 10) * 0.38];
    g.moveTo(px, i % 2 ? y1 : y0);
    g.lineTo(px + w / panels, i % 2 ? y0 : y1);
  }
  g.stroke();
  g.fillStyle = tone;
  g.fillRect(x - 2, top + 6, w + 4, 6);
  g.fillStyle = rgba(P.top, P.edgeA * 0.8);
  g.fillRect(x - 2, top + 6, w + 4, 1.4);
  g.strokeStyle = rgba(P.steel, 0.8);
  g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i <= 10; i++) {
    g.moveTo(x + (i / 10) * w, top + 6);
    g.lineTo(x + (i / 10) * w, top);
  }
  g.moveTo(x, top);
  g.lineTo(x + w, top);
  g.stroke();
  fade(g, x, top + 10, w, h - 10, [[0, rgba(P.shadeL, P.shadeA * 0.8)], [0.3, rgba(P.shadeL, 0)], [0.85, rgba(P.edge, 0)], [1, rgba(P.edge, P.edgeA * 0.3)]], true);
}

// One cooling tower: a hyperboloid, darker to the left and lit down the right, ribbed, its rim a lit ellipse.
function cooler(g, P, cx, wBot, wWaist, wTop, top, tone) {
  const [yb, h] = [GROUND + 6, GROUND + 6 - top];
  const half = (t) => { // t 0 top .. 1 foot
    const k = t < 0.34 ? (t - 0.34) / 0.34 : (t - 0.34) / 0.66;
    const a = wWaist / 2;
    return Math.sqrt(a * a + ((k > 0 ? wBot / 2 : wTop / 2) ** 2 - a * a) * k * k);
  };
  const L = [];
  const R = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    L.push([cx - half(t), top + h * t]);
    R.push([cx + half(t), top + h * t]);
  }
  poly(g, [...L, ...R.reverse()]);
  g.fillStyle = lin(g, cx - wBot / 2, 0, cx + wBot / 2, 0, [[0, rgba(P.shadeL, 0.6)], [0.05, tone], [0.7, tone], [1, P.gasHi]]);
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = rgba(P.steel, 0.3);
  g.lineWidth = 0.8;
  g.beginPath();
  for (let k = -8; k <= 8; k++) {
    g.moveTo(cx + k * (wTop / 16), top);
    g.lineTo(cx + k * (wBot / 16), yb);
  }
  g.stroke();
  fade(g, cx - wBot / 2, top, wBot, h, [[0, rgba(P.foot, 0)], [1, rgba(P.foot, 0.4)]]);
  g.restore();
  g.fillStyle = rgba(P.top, P.edgeA * 0.9);
  g.beginPath();
  g.ellipse(cx, top, wTop / 2, 3.2, 0, 0, TAU);
  g.fill();
  g.fillStyle = rgba(P.steel, 0.8);
  g.beginPath();
  g.ellipse(cx, top + 0.6, wTop / 2 - 2, 2, 0, 0, TAU);
  g.fill();
}

// The cooling-tower pair: two towers of different height side by side.
export function cool(g, P, out, o) {
  const { x, w, top, tone } = o;
  cooler(g, P, x + w * 0.27, w * 0.5, w * 0.34, w * 0.4, top + 14, tone);
  cooler(g, P, x + w * 0.74, w * 0.46, w * 0.31, w * 0.36, top, tone);
}
