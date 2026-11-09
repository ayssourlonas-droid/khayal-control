// World 16, Glass Cathedral, the reliquary itself (see w16-5.js): a house-shaped shrine of beaten gold seen from the
// front. A gabled roof of gold scales with a ruby under its ridge, a sapphire and an emerald on its slopes, and a
// finial on top; a cornice of beads; walls with a tall arched window that blazes white-gold (it is the lights
// layer's brightest thing), blind arches and filigree scrolls beside it; a plinth with ball feet and, hanging from
// it, a chain and a ruby drop. Gold is lit from the upper left (a pale band, the colour, a deep amber-brown
// edge). The emerald leans teal, away from the bullets' lime.
import { path, ink, lin, rad, rgba, shade, mix, bloom, circle, line, came, grain, star4, streak, spark, LEAD, RUBY, SAPPHIRE, EMERALD, DAWN } from './w16-kit.js';

const goldV = (g, y0, y1, c) => lin(g, 0, y0, 0, y1, [[0, shade(c, 0.5)], [0.4, c], [1, mix(c, '#5a3208', 0.6)]]);
const goldH = (g, x0, x1, c) => lin(g, x0, 0, x1, 0, [[0, shade(c, 0.55)], [0.3, shade(c, 0.12)], [0.65, c], [1, mix(c, '#5a3208', 0.62)]]);

// A cut gem: a lit dome with a white heart, a lead setting and a glint; on the lights its colour shines.
export function gem(b, l, x, y, r, c, a = 0.8) {
  circle(b, x, y, r + 0.9);
  b.fillStyle = mix('#c89a2a', LEAD, 0.3);
  b.fill();
  circle(b, x, y, r);
  ink(b, rad(b, x, y, 0.1, r * 1.15, [[0, '#ffffff'], [0.38, shade(c, 0.3)], [1, mix(c, '#12082a', 0.55)]], x - r * 0.3, y - r * 0.35), Math.min(1.2, r * 0.5));
  star4(b, x - r * 0.3, y - r * 0.35, r * 0.62, '#ffffff', 0.85);
  spark(l, x, y, r * 0.4, c, a * 0.7);
}

// A filigree scroll: an S of two spirals in darker gold with a pale thread over it, side m, at (x, y), s big.
function scroll(b, x, y, m, s) {
  for (const [w, col] of [[1.7, rgba('#3a2208', 0.85)], [0.8, rgba('#fff0b0', 0.7)]]) {
    b.beginPath();
    b.moveTo(x, y + 5 * s);
    b.bezierCurveTo(x + m * 4 * s, y + 3 * s, x + m * 4 * s, y - 1 * s, x + m * 1 * s, y - 2 * s);
    b.bezierCurveTo(x - m * 1.6 * s, y - 3 * s, x - m * 1.4 * s, y + 0.2 * s, x + m * 0.6 * s, y);
    line(b, col, w);
  }
}

// The roof: a gable of gold with rows of scales, a moulded edge, a ruby, a sapphire and an emerald, and the finial.
function roof(b, l, c) {
  const tri = [[-24, 2.6], [0, -22], [24, 2.6]];
  path(b, tri);
  ink(b, goldV(b, -22, 3, c), 2.6);
  b.save();
  path(b, tri);
  b.clip();
  for (let row = 0; row < 5; row++) { // scales
    const y = -2 - row * 5;
    for (let k = -5; k <= 5; k++) {
      const x = k * 6.4 + (row % 2) * 3.2;
      b.beginPath();
      b.arc(x, y, 3.2, 0.1, Math.PI - 0.1);
      line(b, rgba('#4a2a06', 0.5), 1);
      b.beginPath();
      b.arc(x - 0.4, y - 0.4, 3.2, 0.2, Math.PI - 0.6);
      line(b, rgba('#fff4c0', 0.4), 0.7);
    }
  }
  b.fillStyle = lin(b, -24, -22, 20, 4, [[0, rgba('#ffffff', 0.3)], [0.5, rgba('#ffffff', 0)], [1, rgba('#2a1404', 0.3)]]);
  b.fillRect(-25, -23, 50, 27);
  b.restore();
  path(b, [[-24.4, 2.6], [-0.4, -22.6]], true); // the dawn on the left slope only
  line(b, rgba(DAWN, 0.8), 1.1);
  path(b, [[-1.2, -22], [-1.2, -28], [1.2, -28], [1.2, -22]]); // the finial: a stem and a gem
  ink(b, goldH(b, -1.2, 1.2, c), 1.2);
  gem(b, l, 0, -31, 2.6, RUBY);
  gem(b, l, 0, -12, 3.1, RUBY, 0.9);
  gem(b, l, -10.6, -3.6, 2.4, SAPPHIRE);
  gem(b, l, 10.6, -3.6, 2.4, EMERALD);
}

// The walls: a plinth, a beaded cornice, the gold front with its blazing arched window, blind arches and scrolls.
function front(b, l, c) {
  path(b, [[-20, 29], [20, 29], [18, 23], [-18, 23]]); // the plinth
  ink(b, goldV(b, 23, 29, shade(c, -0.1)), 2.2);
  for (const m of [-1, 1]) { // ball feet
    circle(b, m * 14.4, 30.4, 3.2);
    ink(b, rad(b, m * 14.4, 30.4, 0.3, 3.6, [[0, '#fff2b0'], [0.5, c], [1, mix(c, '#5a3208', 0.7)]], m * 14.4 - 1, 29.4), 1.4);
  }
  path(b, [[-18, 3], [18, 3], [18, 23], [-18, 23]]);
  ink(b, goldH(b, -18, 18, c), 2.6);
  b.save();
  b.clip();
  grain(b, 30, 4, 0, 13, 17, 10, 0.16);
  b.restore();
  for (const m of [-1, 1]) { // blind arches either side of the window, with a scroll in each
    const x = m * 12.6;
    b.beginPath();
    b.moveTo(x - 3.2, 20.4);
    b.lineTo(x - 3.2, 8.6);
    b.quadraticCurveTo(x - 3.2, 5, x, 4.4);
    b.quadraticCurveTo(x + 3.2, 5, x + 3.2, 8.6);
    b.lineTo(x + 3.2, 20.4);
    b.closePath();
    ink(b, rgba('#5a3208', 0.55), 1.2);
    scroll(b, x, 10, m, 0.9);
  }
  path(b, [[-23, 0.4], [23, 0.4], [22, 4.4], [-22, 4.4]]); // the cornice
  ink(b, goldH(b, -23, 23, shade(c, 0.05)), 2);
  for (let k = -5; k <= 5; k++) {
    circle(b, k * 4, 2.4, 1);
    b.fillStyle = k % 2 ? rgba('#fff4c0', 0.8) : rgba('#4a2a06', 0.6);
    b.fill();
  }
}

// The window: a pointed arch blazing white-gold, a lead cross and a trefoil in it, a bright spill on the lights.
function window(b, l, f, c) {
  const arch = (g) => {
    g.beginPath();
    g.moveTo(-6.6, 22);
    g.lineTo(-6.6, 11);
    g.quadraticCurveTo(-6.6, 6.4, 0, 3.8);
    g.quadraticCurveTo(6.6, 6.4, 6.6, 11);
    g.lineTo(6.6, 22);
    g.closePath();
  };
  arch(b);
  b.fillStyle = rad(b, 0, 14, 0, 12, [[0, '#ffffff'], [0.4, '#fff3b0'], [1, mix(c, '#e07a10', 0.5)]]);
  b.fill();
  came(b, 2.2);
  for (const [x0, y0, x1, y1] of [[0, 5, 0, 22], [-6.6, 14.6, 6.6, 14.6]]) {
    path(b, [[x0, y0], [x1, y1]], true);
    line(b, rgba('#6a4010', 0.8), 1.3);
  }
  circle(b, 0, 10, 2.1);
  line(b, rgba('#6a4010', 0.8), 1);
  streak(b, -4.6, 9.4, -4.6, 13, 1, 0.6);
  l.save();
  l.globalCompositeOperation = 'lighter';
  arch(l);
  l.fillStyle = rgba('#fff4c0', 0.22 + f * 0.14);
  l.fill();
  l.restore();
  bloom(l, 0, 13, 24 + f * 3, '#ffd96a', 0.45 + f * 0.15);
  spark(l, 0, 13, 1.6, '#ffffff', 0.7);
}

// The chain and the ruby drop that hang from the plinth.
function pendant(b, l) {
  path(b, [[0, 29], [0.6, 33.4]], true);
  line(b, LEAD, 3);
  line(b, '#e8c050', 1.4);
  path(b, [[0, 32.4], [3.4, 36.4], [0, 41], [-3.4, 36.4]]);
  ink(b, lin(b, -3, 33, 3, 42, [[0, '#ffc0d0'], [0.4, RUBY], [1, '#6a0a28']]), 1.5);
  streak(b, -1.6, 34.4, -0.6, 36.8, 0.9, 0.7);
  spark(l, 0, 37, 1.4, RUBY, 0.8);
}

export function shrine(b, l, f, c0) {
  const c = mix(c0, '#d89a20', 0.5); // the gold itself: richer than the pale gilt of the palette
  front(b, l, c);
  window(b, l, f, c);
  roof(b, l, c);
  pendant(b, l);
  star4(b, f ? 12 : -12, f ? -8 : 8, 3.6, '#ffffff', 0.85);
}
