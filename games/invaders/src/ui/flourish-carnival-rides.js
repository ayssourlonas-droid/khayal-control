// The sprites of Ember Carnival's moving rides (flourish-11.js draws them), each painted once: the Ferris wheel's
// rim and spokes, a gondola, a coaster car, and a cluster of party balloons. The wheel and the gondolas are
// opaque, dark steel and bright paint; their bulbs are drawn separately as light.
import { cached, byColor, glow, rgba, shade, lin, rad, INK } from './sprites.js';
import { TAU } from '../core/math.js';
import { PARTY } from './parallax-carnival-kit.js';
import { bulbSprite } from './flourish-carnival-sprites.js';
import { WHEEL } from './parallax-carnival-wheel.js';

const STEEL = '#33206c';
const RIM = WHEEL.r;
export const WHEEL_BOX = (RIM + 16) * 2; // the wheel sprite's edge; its hub is at the middle

// The wheel: a double rim braced by a zigzag truss, sixteen spokes crossed by a second set, a hub with bolts, and a
// gold pin on the rim for each gondola to hang from.
export const wheelSprite = () => cached('carnWheel', WHEEL_BOX, WHEEL_BOX, (g) => {
  const c = WHEEL_BOX / 2;
  g.translate(c, c);
  g.lineCap = 'round';
  g.strokeStyle = STEEL;
  for (const [r, w] of [[RIM, 7], [RIM - 16, 4]]) {
    g.lineWidth = w;
    g.beginPath();
    g.arc(0, 0, r, 0, TAU);
    g.stroke();
  }
  g.lineWidth = 1.5;
  g.beginPath();
  for (let i = 0; i < 48; i++) {
    const [a, b] = [(i / 48) * TAU, ((i + 0.5) / 48) * TAU];
    g.moveTo(Math.cos(a) * RIM, Math.sin(a) * RIM);
    g.lineTo(Math.cos(b) * (RIM - 16), Math.sin(b) * (RIM - 16));
    g.lineTo(Math.cos(a + TAU / 48) * RIM, Math.sin(a + TAU / 48) * RIM);
  }
  g.stroke();
  for (const [n, w, off] of [[WHEEL.n, 3.4, 0], [WHEEL.n, 1.3, 0.28]]) {
    g.lineWidth = w;
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const a = ((i + off) / n) * TAU;
      g.moveTo(Math.cos(a + 0.26) * 14, Math.sin(a + 0.26) * 14);
      g.lineTo(Math.cos(a) * (RIM - 16), Math.sin(a) * (RIM - 16));
    }
    g.stroke();
  }
  g.strokeStyle = rgba('#ff9ad0', 0.65); // a pale edge on the outer rim
  g.lineWidth = 1.6;
  g.beginPath();
  g.arc(0, 0, RIM + 3.2, 0, TAU);
  g.stroke();
  g.strokeStyle = rgba('#c8a0ff', 0.4); // the lamps' light along each main spoke
  g.lineWidth = 0.9;
  g.beginPath();
  for (let i = 0; i < WHEEL.n; i++) {
    const a = (i / WHEEL.n) * TAU;
    g.moveTo(Math.cos(a + 0.26) * 14, Math.sin(a + 0.26) * 14 - 1.4);
    g.lineTo(Math.cos(a) * (RIM - 16), Math.sin(a) * (RIM - 16) - 1.4);
  }
  g.stroke();
  g.fillStyle = STEEL;
  g.beginPath();
  g.arc(0, 0, 18, 0, TAU);
  g.fill();
  g.strokeStyle = rgba('#ffc86a', 0.7);
  g.lineWidth = 2;
  g.beginPath();
  g.arc(0, 0, 11, 0, TAU);
  g.stroke();
  g.fillStyle = '#ffd890';
  for (let i = 0; i < WHEEL.n; i++) {
    g.beginPath();
    g.arc(Math.cos((i / WHEEL.n) * TAU) * RIM, Math.sin((i / WHEEL.n) * TAU) * RIM, 2.6, 0, TAU);
    g.fill();
  }
});

export const CABIN = { w: 30, h: 42, px: 15, py: 2 }; // the gondola sprite, and the pin it hangs by
// A gondola: a hanger, a rounded cabin painted in `color` with a pale stripe, a lit window, a lamp on its roof.
export const cabin = byColor((color) => cached('carnCabin' + color, CABIN.w, CABIN.h, (g) => {
  g.strokeStyle = INK;
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(15, 2);
  g.lineTo(15, 12);
  g.stroke();
  g.beginPath();
  g.roundRect(3, 12, 24, 24, 6);
  g.fillStyle = lin(g, 0, 12, 0, 36, [[0, shade(color, 0.35)], [0.5, color], [1, shade(color, -0.5)]]);
  g.fill();
  g.lineWidth = 1.4;
  g.stroke();
  g.fillStyle = rgba('#fff4d0', 0.5);
  g.fillRect(4, 28, 22, 3);
  g.fillStyle = rad(g, 15, 22, 0, 7, [[0, '#fffbe8'], [1, '#ffc86a']]);
  g.fillRect(9, 17, 12, 9);
  g.fillStyle = '#ffe9a0';
  g.beginPath();
  g.arc(15, 11, 2.2, 0, TAU);
  g.fill();
  g.drawImage(glow('#ffc86a'), 5, 12, 20, 20);
}));

export const CAR = { w: 28, h: 16 };
// A coaster car facing right: a long body in `color` with a bright nose, two riders with their arms up, a lamp.
export const car = byColor((color) => cached('carnCar' + color, CAR.w, CAR.h, (g) => {
  g.fillStyle = INK;
  g.beginPath();
  g.roundRect(0, 5, 28, 9, 4);
  g.fill();
  g.fillStyle = lin(g, 0, 6, 0, 13, [[0, shade(color, 0.4)], [1, shade(color, -0.35)]]);
  g.beginPath();
  g.roundRect(1.2, 6, 25.6, 7, 3);
  g.fill();
  g.fillStyle = '#ffe9a0';
  g.fillRect(23, 7, 3.4, 4);
  g.fillStyle = INK;
  for (const x of [7, 15]) {
    g.beginPath();
    g.arc(x, 3.4, 2.2, 0, TAU);
    g.fill();
    g.fillRect(x - 3.4, 0, 1.2, 4);
    g.fillRect(x + 2.2, 0, 1.2, 4);
  }
}));

export const CLUSTER = { w: 96, h: 150 };
// Three party balloons on strings that meet in one hand, 96 x 150, in the colours from `k` on: glossy, a rim of
// light from the fair on one side, a knot, a highlight.
export const cluster = byColor((k) => cached('carnCluster' + k, CLUSTER.w, CLUSTER.h, (g) => {
  const at = [[28, 40, 22], [64, 34, 24], [47, 70, 21]];
  g.strokeStyle = rgba(INK, 0.85);
  g.lineWidth = 1;
  for (const [x, y, r] of at) {
    g.beginPath();
    g.moveTo(x, y + r * 1.25);
    g.quadraticCurveTo(x, 110, 48, 148);
    g.stroke();
  }
  at.forEach(([x, y, r], i) => {
    const color = PARTY[(k + i * 2) % PARTY.length];
    g.beginPath();
    g.ellipse(x, y, r, r * 1.18, 0, 0, TAU);
    g.fillStyle = rad(g, x, y, r * 0.1, r * 1.3, [[0, shade(color, 0.55)], [0.5, color], [1, shade(color, -0.55)]], x - r * 0.35, y - r * 0.4);
    g.fill();
    g.lineWidth = 1.4;
    g.strokeStyle = INK;
    g.stroke();
    g.beginPath();
    g.moveTo(x - 2.6, y + r * 1.2);
    g.lineTo(x + 2.6, y + r * 1.2);
    g.lineTo(x, y + r * 1.2 + 4.4);
    g.fillStyle = shade(color, -0.3);
    g.fill();
    g.beginPath();
    g.ellipse(x - r * 0.38, y - r * 0.42, r * 0.2, r * 0.3, -0.5, 0, TAU);
    g.fillStyle = rgba('#ffffff', 0.7);
    g.fill();
    g.beginPath();
    g.ellipse(x, y, r, r * 1.18, 0, 0.5, 1.7);
    g.strokeStyle = rgba('#ffc86a', 0.8);
    g.lineWidth = 1.6;
    g.stroke();
  });
}));

// Paint every sprite the rides draw, so none is baked mid-fight (warm-carnival.js).
export function warmRides() {
  wheelSprite();
  for (const c of PARTY) {
    cabin(c);
    car(c);
    bulbSprite(c);
  }
  for (let k = 0; k < PARTY.length; k++) cluster(k);
}
