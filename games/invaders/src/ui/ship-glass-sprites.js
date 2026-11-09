// The mirror twin's baked sprites (ship-glass.js draws them): the glass body at twice the ship's size (BOX, K), the
// fringe of split light round its edge and eight frames of the sheen that sweeps over it. The outline is the ship's
// own (ship-view.js hull, bank 0): two wings, the fuselage, the engine block. Painted once on first use.
import { rgba, cached, rad, lin } from './sprites.js';
import { TAU } from '../core/math.js';
import { prism, spectrum, pane, poly, LEAD, PRISM } from './glass-kit.js';

export const K = 2; // the sprite is baked at twice the ship's size
export const BOX = { w: 184, h: 176, ox: 92, oy: 100 }; // canvas size and where the ship's (0, 0) is in it
export const FRAMES = 8; // the sheen's sweep
const WING = (s) => [[6 * s, -12], [40 * s, 16], [38 * s, 27], [10 * s, 22]];
const BODY = [[0, -46], [9, -18], [12, 14], [8, 31], [-8, 31], [-12, 14], [-9, -18]];

const lay = (g) => {
  g.translate(BOX.ox, BOX.oy);
  g.scale(K, K);
  g.lineJoin = 'round';
};

// The union of the ship's outline, as the current path (the sheen is clipped to it).
function outline(g) {
  g.beginPath();
  for (const pts of [WING(-1), WING(1), BODY]) {
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
  }
}

function wing(g, s) {
  poly(g, WING(s));
  g.fillStyle = pane(g, 6 * s, 0, 40 * s, 0);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = prism(g, 6 * s, -12, 38 * s, 27, 0.3); // the rainbow a pane throws, caught in the wing
  g.fillRect(-45, -14, 90, 44);
  g.fillStyle = rgba('#ffffff', 0.22); // one facet, lit
  poly(g, [[6 * s, -12], [40 * s, 16], [24 * s, 16], [8 * s, 4]]);
  g.fill();
  g.restore();
  g.lineWidth = 0.9; // the facet line where the ship's own wing has its accent stripe
  g.strokeStyle = rgba('#ffffff', 0.7);
  g.beginPath();
  g.moveTo(12 * s, 6);
  g.lineTo(34 * s, 21);
  g.stroke();
  poly(g, WING(s));
  g.lineWidth = 2.3;
  g.strokeStyle = spectrum(g, -38, -12, 38, 28, 1);
  g.stroke();
  g.lineWidth = 0.5;
  g.strokeStyle = rgba('#ffffff', 0.25);
  g.stroke();
}

function fuselage(g) {
  poly(g, BODY);
  g.fillStyle = lin(g, 0, -46, 0, 31, [[0, rgba('#f4fcff', 0.7)], [0.5, rgba('#bfe4ff', 0.4)], [1, rgba('#a8c4ff', 0.3)]]);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = rgba('#ffffff', 0.3); // the left plane catches the light, the right is a little deeper
  poly(g, [[0, -46], [-9, -18], [-12, 14], [-8, 31], [0, 31]]);
  g.fill();
  g.fillStyle = rgba('#6a8ad8', 0.2);
  poly(g, [[0, -46], [9, -18], [12, 14], [8, 31], [0, 31]]);
  g.fill();
  g.fillStyle = prism(g, -12, -30, 12, 28, 0.2);
  g.fillRect(-14, -48, 28, 82);
  g.restore();
  g.lineWidth = 0.8; // the ridge down the middle and the cross-cuts of the panes
  g.strokeStyle = rgba('#ffffff', 0.7);
  g.beginPath();
  g.moveTo(0, -44);
  g.lineTo(0, 24);
  for (const y of [-26, -4, 16]) {
    g.moveTo(-10.4, y);
    g.lineTo(10.4, y);
  }
  g.stroke();
  poly(g, BODY);
  g.lineWidth = 2.3;
  g.strokeStyle = spectrum(g, -12, -40, 12, 28, 1);
  g.stroke();
  g.lineWidth = 0.5;
  g.strokeStyle = rgba('#ffffff', 0.25);
  g.stroke();
}

// The cockpit: the one nearly solid thing, a jewel of ice with a bright heart and a ring of the rainbow.
function jewel(g) {
  g.beginPath();
  g.ellipse(0, -13, 4.5, 11, 0, 0, TAU);
  g.fillStyle = rad(g, 0, -13, 0.5, 11, [[0, '#ffffff'], [0.35, rgba('#e4f8ff', 0.95)], [0.8, rgba('#7aa8ff', 0.7)], [1, rgba('#4a62c8', 0.6)]], -1, -17);
  g.fill();
  g.lineWidth = 1.2;
  g.strokeStyle = prism(g, 0, -24, 0, -2, 0.95);
  g.stroke();
  g.fillStyle = rgba('#ffffff', 0.95);
  g.beginPath();
  g.ellipse(-1.4, -18, 1.1, 3.2, 0.1, 0, TAU);
  g.fill();
}

export const body = () => cached('glassTwinBody', BOX.w, BOX.h, (g) => {
  lay(g);
  g.fillStyle = rgba('#3a4a8a', 0.5); // the engine block: smoked glass
  g.fillRect(-11, 24, 22, 7);
  g.lineWidth = 1;
  g.strokeStyle = rgba(LEAD, 0.7);
  g.strokeRect(-11, 24, 22, 7);
  wing(g, -1);
  wing(g, 1);
  fuselage(g);
  jewel(g);
});

// One frame of the sheen, lights only: a diagonal band of white and rainbow light at its place in the sweep.
export const sheen = (f) => cached('glassTwinSheen' + f, BOX.w, BOX.h, (g) => {
  lay(g);
  outline(g);
  g.clip();
  const u = f / (FRAMES - 1);
  const c = -70 + u * 140; // the band's centre along the diagonal
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = lin(g, c - 12, c * 0.3 - 20, c + 12, c * 0.3 + 20, [[0, rgba('#ffffff', 0)], [0.35, rgba(PRISM[1], 0.3)], [0.5, rgba('#ffffff', 0.55)], [0.65, rgba(PRISM[2], 0.3)], [1, rgba('#ffffff', 0)]]);
  g.fillRect(-42, -47, 84, 79);
});

// The glass splitting light at its edges: the outline three times over, a hair apart, in rose, ice and gold, added.
export const fringe = () => cached('glassTwinFringe', BOX.w, BOX.h, (g) => {
  lay(g);
  g.globalCompositeOperation = 'lighter';
  for (const [c, dx, dy] of [[PRISM[0], -1, 0], [PRISM[2], 1, 0], [PRISM[1], 0, -0.9]]) {
    g.save();
    g.translate(dx, dy);
    outline(g);
    g.lineWidth = 1.1;
    g.strokeStyle = rgba(c, 0.36);
    g.stroke();
    g.restore();
  }
});
