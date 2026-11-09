// The Grand Carousel's crown (World 14, Ember Carnival; see carousel.js): the cupola on top of the canopy, an
// armour part 150 x 84 for the hit box. A finial and ball, a small onion dome striped like the canopy, a
// lantern drum of five lit arched windows between gilt pilasters, a collar, and a flared gilt skirt of
// scrolls and bulbs that spreads over the stripes below, hung with tassels. The pennant on the finial is
// live (carousel-fx.js); the highest nothing here reaches is the finial's tip, 2 px under the part's top.
import { path, ink, line, lin, rad, rgba, shade, ellipse, bloom, eye } from './kit.js';
import { spline } from './galleon-kit.js';
import { GILT, GILT_L, GILT_D, GILT_DD, STRIPE, CREAM, INK, giltV, giltX, stud, bulb, volute, tassel, circle } from './carousel-kit.js';

export const FINIAL = [0, -32.5]; // the ball's centre in the part's frame

// The dome: an onion of seven gores in magenta and cream, ribbed in gilt, a bright band left of centre.
const DOME = [[30, -8], [35, -16], [27, -24], [11, -28], [0, -31]];
function dome(b) {
  const pts = [...DOME.map(([x, y]) => [-x, y]), ...DOME.toReversed().slice(1)];
  b.beginPath();
  b.moveTo(...pts[0]);
  spline(b, pts);
  b.closePath();
  b.save();
  b.clip();
  for (let i = 0; i < 8; i++) {
    const [a0, a1] = [-Math.PI / 2 + (Math.PI * i) / 8, -Math.PI / 2 + (Math.PI * (i + 1)) / 8];
    const [x0, x1] = [40 * Math.sin(a0), 40 * Math.sin(a1)];
    path(b, [[0, -33], [x0, -8], [x1, -8]]);
    const c = i % 2 ? CREAM : STRIPE;
    b.fillStyle = lin(b, 0, -32, 0, -8, [[0, shade(c, -0.35)], [0.6, c], [1, shade(c, -0.1)]]);
    b.fill();
    path(b, [[0, -33], [x1, -8]], true);
    line(b, rgba(GILT, 0.95), 1.3);
  }
  b.fillStyle = lin(b, -34, 0, 34, 0, [[0, rgba('#10002a', 0.55)], [0.3, rgba('#ffffff', 0.2)], [0.5, rgba('#10002a', 0)], [1, rgba('#10002a', 0.6)]]);
  b.fillRect(-36, -34, 72, 28);
  b.restore();
  b.beginPath();
  b.moveTo(...pts[0]);
  spline(b, pts);
  b.closePath();
  line(b, INK, 2.6);
}

// The lantern drum: five arched windows lit warm between gilt pilasters, under a lip.
function lantern(b, l) {
  b.beginPath();
  b.rect(-29, -8, 58, 21);
  b.fillStyle = lin(b, -29, 0, 29, 0, [[0, '#3a1860'], [0.4, '#7a48b0'], [1, '#2a0f48']]);
  b.fill();
  line(b, INK, 2.4);
  for (let i = 0; i < 5; i++) {
    const [a0, a1] = [-1.0 + i * 0.4, -1.0 + (i + 1) * 0.4 - 0.1];
    const [x0, x1] = [29 * Math.sin(a0 + 0.05), 29 * Math.sin(a1)];
    if (x1 - x0 < 2.5) continue;
    const w = x1 - x0;
    b.beginPath();
    b.moveTo(x0, 11);
    b.lineTo(x0, -1 + w / 2);
    b.arc(x0 + w / 2, -1 + w / 2, w / 2, Math.PI, 0);
    b.lineTo(x1, 11);
    b.closePath();
    b.fillStyle = lin(b, 0, -2, 0, 11, [[0, '#fff0b0'], [1, '#ffb44a']]);
    b.fill();
    line(b, rgba(GILT_DD, 0.9), 1);
    b.beginPath();
    b.moveTo(x0 + w / 2, -2);
    b.lineTo(x0 + w / 2, 11);
    line(b, rgba(GILT_DD, 0.7), 0.9);
    l.beginPath();
    l.moveTo(x0, 11);
    l.lineTo(x0, -1 + w / 2);
    l.arc(x0 + w / 2, -1 + w / 2, w / 2, Math.PI, 0);
    l.lineTo(x1, 11);
    l.closePath();
    l.fillStyle = rgba('#ffd27a', 0.5);
    l.fill();
    bloom(l, x0 + w / 2, 4, 16, '#ffb44a', 0.3);
  }
  for (const i of [0, 1, 2, 3, 4, 5]) { // pilasters
    const x = 29 * Math.sin(-1.0 + i * 0.4);
    b.fillStyle = giltX(b, x - 2.4, x + 2.4);
    b.fillRect(x - 2.2, -8, 4.4, 21);
    line(b, INK, 1);
  }
}

// The skirt: a bell of gilt flaring from the collar over the canopy, edged with a scalloped fringe.
function skirt(b, l) {
  const half = [[38, 19], [44, 27], [58, 33], [75, 37]];
  b.beginPath();
  b.moveTo(-38, 19);
  spline(b, half.map(([x, y]) => [-x, y]));
  b.lineTo(-75, 41);
  for (let i = 0; i < 6; i++) b.quadraticCurveTo(-75 + i * 25 + 12.5, 47, -75 + (i + 1) * 25, 41); // the scalloped lower edge
  b.lineTo(75, 37);
  spline(b, [[75, 37], ...half.slice(0, 3).toReversed()]);
  b.closePath();
  b.fillStyle = giltV(b, 19, 44, GILT);
  b.fill();
  line(b, INK, 3);
  for (const s of [-1, 1]) { // carved scrolls in the bell
    volute(b, s * 54, 33, 6.4, -s, GILT_L, 2.4);
    volute(b, s * 32, 29, 5, s, GILT_L, 2.1);
  }
  b.beginPath();
  b.moveTo(-36, 21);
  b.lineTo(36, 21);
  line(b, rgba(GILT_L, 0.8), 1.1);
  for (let i = 0; i < 7; i++) bulb(b, l, -60 + i * 20, 35, 2.7, ['#ffe9a0', '#ff9ad0', '#9ae8ff'][i % 3], 0.6);
  for (const x of [-50, 0, 50]) tassel(b, x, 44, 10);
}

// The finial: a ball with a spear on it, on a short stem, a collar between it and the dome.
function finial(b, l) {
  b.beginPath();
  b.moveTo(0, -34);
  b.lineTo(0, -29);
  line(b, INK, 4);
  line(b, GILT, 2.2);
  ellipse(b, 0, -28.4, 6.4, 2.2);
  b.fillStyle = giltX(b, -7, 7);
  b.fill();
  line(b, INK, 1.4);
  circle(b, 0, FINIAL[1], 4.4);
  ink(b, rad(b, 0, FINIAL[1], 0, 4.4, [[0, '#ffffff'], [0.4, GILT_L], [1, GILT_D]], -1.4, FINIAL[1] - 1.6), 1.6);
  path(b, [[-1.8, FINIAL[1] - 3.6], [0, -38.6], [1.8, FINIAL[1] - 3.6]]);
  ink(b, giltX(b, -2, 2), 1.1);
  eye(l, 0, FINIAL[1], 2.4, '#fff0b0', 3.4);
}

export function crown(b, l, p) {
  skirt(b, l);
  lantern(b, l);
  dome(b);
  finial(b, l);
  ellipse(b, 0, 14.5, 38, 4.4); // the collar between drum and skirt
  b.fillStyle = giltX(b, -38, 38);
  b.fill();
  line(b, INK, 2);
  for (let i = -3; i <= 3; i++) stud(b, i * 10.5, 14.8, 1.5);
  bloom(l, 0, 6, 70, '#ffd27a', 0.1);
}
