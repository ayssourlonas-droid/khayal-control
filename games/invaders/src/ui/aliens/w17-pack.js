// World 17, Ash to Air, the carrier (see w17.js): THE PLAIN PACK, a cream cardboard box of cigarettes seen head-on and a
// little tilted, nothing printed on it anywhere: worn cream card shading to grey, a darker-cream side face, a gleaming
// paper edge, a dog-eared crumpled corner, stains and soot. The open top (w17-pack-top.js): a lid flipped up and back,
// a row of cigarettes with tan filters, crinkled foil. On its front two angry slits glow over a jagged tear that
// grins. Beat 0/1: the box rocks one way then the other, the lid and the row jiggle, the ember in the lid pulses.
// Destroyed, it frees the pickup it carried (the game's halo is its soft pale glow). Lights: the eyes, the grin, the
// ember in the lid.
import { path, lin, rad, rgba, line, INK, PAPER_D, EMBER, hash, lerp, grime, streaks, turned } from './w17-kit.js';
import { glare } from './w17-fx.js';
import { lid, tubes, foil } from './w17-pack-top.js';

const CARD = '#e4dac2'; // the card
const [X0, X1, Y0, Y1] = [-22, 22, -10, 36]; // the front face

const face = (g) => path(g, [[X0, Y0], [X1, Y0], [X1, 26], [X1 - 1.4, Y1 - 6], [X1 - 3, Y1], [X0 + 2, Y1], [X0, Y1 - 3]]);

// The right-hand side of the box, a narrow darker face turned away from the light.
function side(b) {
  const pts = [[X1, Y0], [28.4, Y0 - 3.2], [28.6, Y1 - 6.2], [X1 - 1.4, Y1 - 6]];
  path(b, pts);
  b.fillStyle = lin(b, X1, 0, 29, 0, [[0, '#b0a488'], [1, '#867c64']]);
  b.fill();
  b.save();
  path(b, pts);
  b.clip();
  streaks(b, 5, 11, X1, 28, Y0 - 3, Y1, '#5a4e38', 0.25, 0.7);
  grime(b, 8, 12, 25.4, 14, 3, 20, 0.4, '#3a2e20');
  b.restore();
  path(b, pts);
  line(b, INK, 2.2);
}

// The front: cream card, light from the upper left, soot and stains gathering low, the folded dog-ear top right.
function front(b) {
  face(b);
  b.fillStyle = lin(b, X0, Y0, X1, Y1, [[0, '#f4ecd8'], [0.4, CARD], [0.8, '#bdb298'], [1, '#9d937c']]);
  b.fill();
  b.save();
  face(b);
  b.clip();
  b.fillStyle = lin(b, 0, 16, 0, Y1, [[0, rgba('#6a5a40', 0)], [1, rgba('#4a3c2a', 0.5)]]);
  b.fillRect(X0 - 1, 16, 46, 26);
  streaks(b, 12, 21, X0, X1, Y0, Y1, PAPER_D, 0.18, 0.7);
  grime(b, 34, 22, -4, 24, 20, 14, 0.4, '#4a3c2a');
  grime(b, 12, 23, 12, 28, 8, 8, 0.45, '#2a2018'); // soot
  b.beginPath(); // creases across the card, each with a pale lip
  for (const [x0, y0, x1, y1] of [[-22, 28, -9, 30.4], [-2, 33, 10, 31.4], [8, 16, 22, 18.6]]) {
    b.moveTo(x0, y0);
    b.lineTo(x1, y1);
  }
  line(b, rgba(PAPER_D, 0.85), 1);
  b.beginPath();
  for (const [x0, y0, x1, y1] of [[-22, 29.2, -9, 31.6], [-2, 34.2, 10, 32.6], [8, 17.2, 22, 19.8]]) {
    b.moveTo(x0, y0);
    b.lineTo(x1, y1);
  }
  line(b, rgba('#ffffff', 0.55), 0.8);
  b.fillStyle = lin(b, 0, Y0, 0, Y0 + 5, [[0, rgba('#ffffff', 0.5)], [1, rgba('#ffffff', 0)]]); // the lit top edge
  b.fillRect(X0, Y0, 44, 5);
  b.fillStyle = lin(b, X0, 0, X0 + 7, 0, [[0, rgba('#ffffff', 0.6)], [1, rgba('#ffffff', 0)]]); // and the lit left edge
  b.fillRect(X0, Y0, 7, 46);
  b.restore();
  face(b);
  line(b, INK, 2.5);
  b.beginPath(); // the gleaming paper edge
  b.moveTo(X0 + 1.3, Y1 - 5);
  b.lineTo(X0 + 1.3, Y0 + 2);
  b.lineTo(X1 - 2, Y0 + 1.4);
  line(b, rgba('#ffffff', 0.9), 1.2);
  b.beginPath(); // the dog-ear: a corner folded over, its underside darker, a shadow beneath it
  b.moveTo(X1 - 12, Y0);
  b.lineTo(X1, Y0 + 11);
  b.lineTo(X1 - 12.4, Y0 + 10);
  b.closePath();
  b.fillStyle = lin(b, X1 - 12, Y0, X1, Y0 + 11, [[0, '#cfc4a8'], [1, '#9c9078']]);
  b.fill();
  line(b, INK, 1.4);
  b.beginPath();
  b.moveTo(X1 - 12, Y0 + 1);
  b.lineTo(X1 - 11.4, Y0 + 9.4);
  line(b, rgba('#fff6dc', 0.7), 0.8);
}

// The cruel face: angry slits glowing over a jagged tear that grins, the ember glowing faintly inside it.
function grin(b, l, f) {
  const top = [];
  const low = [];
  for (let i = 0; i <= 10; i++) {
    const x = lerp(-13.5, 13.5, i / 10);
    const sag = 4.6 * (1 - ((x / 13.5) ** 2)); // the corners lift, the middle droops
    top.push([x, 18.6 + (i % 2 ? 2.8 : -0.4) - sag * 0.3 + hash(i + 120)]);
    low.push([x, 24.6 + sag + (i % 2 ? -1.4 : 1.8)]);
  }
  const tear = [...top, ...low.toReversed()];
  path(b, tear);
  b.fillStyle = lin(b, 0, 17, 0, 30, [[0, '#0e0806'], [1, '#2a140a']]);
  b.fill();
  line(b, INK, 1.6);
  b.beginPath();
  top.forEach(([x, y], i) => (i ? b.lineTo(x, y - 0.8) : b.moveTo(x, y - 0.8)));
  line(b, rgba('#ffffff', 0.5), 0.8);
  l.save();
  l.globalCompositeOperation = 'lighter';
  path(l, tear);
  l.clip();
  l.fillStyle = rad(l, 0, 24, 0, 14, [[0, rgba(EMBER, 0.42 + f * 0.2)], [1, rgba('#a02a08', 0)]]);
  l.fillRect(-15, 16, 30, 16);
  l.restore();
  glare(b, l, 0, 6.4, 7.8, 5, 2.6, f, EMBER, 0.45);
}

export function carrier(b, l, f) {
  turned(b, l, f ? 0.035 : -0.05, 0, 3, () => {
    lid(b, l, f);
    tubes(b, f);
    foil(b, f);
    side(b);
    front(b);
    grin(b, l, f);
  }, 0.97);
}
