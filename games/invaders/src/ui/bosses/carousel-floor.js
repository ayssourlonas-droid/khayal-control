// The Grand Carousel's floor and the bowl under it (World 14, Ember Carnival; see carousel.js): a round
// platform seen from a little above, its top a ring of painted boards, its gilt rim studded and ringed with
// bulbs, a row of arches under the rim, and below that the bowl the whole machine rides in, plum with gilt
// ribs and medallions, narrowing to the flat base the drum turns in. Baked into the hull. In boss coordinates.
import { path, ink, line, lin, rad, rgba, shade, ellipse } from './kit.js';
import { spline } from './galleon-kit.js';
import { GILT, GILT_L, GILT_D, GILT_DD, INK, giltV, bulb, stud, volute, circle } from './carousel-kit.js';

export const FLOOR = { y: 26, rx: 346, ry: 13 }; // the platform's top: an ellipse
const RIM = 15; // px the gilt rim stands below the top's near edge
const front = (x) => FLOOR.y + FLOOR.ry * Math.sqrt(Math.max(0, 1 - (x / FLOOR.rx) ** 2));

// The bowl: from the rim's ends in toward the base, one half (x >= 0), top to bottom.
const BOWL = [[346, 40], [326, 66], [286, 92], [226, 114], [150, 132], [76, 141]];

function bowlPath(b) {
  const pts = [...BOWL.map(([x, y]) => [-x, y]), ...BOWL.toReversed()];
  b.beginPath();
  b.moveTo(...pts[0]);
  spline(b, pts);
  b.closePath();
}

function bowl(b, plum) {
  bowlPath(b);
  b.fillStyle = lin(b, 0, 40, 0, 142, [[0, shade(plum, 0.42)], [0.35, shade(plum, 0.08)], [1, shade(plum, -0.5)]]);
  b.fill();
  b.save();
  bowlPath(b);
  b.clip();
  b.fillStyle = lin(b, -346, 0, 346, 0, [[0, rgba('#10002a', 0.5)], [0.28, rgba('#10002a', 0)], [0.7, rgba('#10002a', 0)], [1, rgba('#10002a', 0.55)]]);
  b.fillRect(-350, 38, 700, 110);
  for (const s of [-1, 1]) { // the gilt ribs: curves from the rim in to the base, and a medallion between each pair
    for (const x of [64, 142, 214, 282]) {
      b.beginPath();
      b.moveTo(s * x, 40);
      b.quadraticCurveTo(s * (x * 0.96), 100, s * (x * 0.3 + 14), 142);
      line(b, INK, 5);
      line(b, GILT, 3.2);
      b.beginPath();
      b.moveTo(s * x - 0.8, 41);
      b.quadraticCurveTo(s * (x * 0.96) - 0.8, 100, s * (x * 0.3 + 14) - 0.8, 140);
      line(b, rgba(GILT_L, 0.55), 0.9);
      for (const u of [0.18, 0.4, 0.62, 0.82]) { // pearls strung along the rib
        const v = 1 - u;
        stud(b, s * (v * v * x + 2 * u * v * x * 0.96 + u * u * (x * 0.3 + 14)), v * v * 40 + 2 * u * v * 100 + u * u * 142, 1.7, GILT_L);
      }
    }
    for (const [x, y, r] of [[103, 76, 12], [178, 88, 11], [248, 80, 9]]) {
      ellipse(b, s * x, y, r, r * 1.2);
      b.fillStyle = INK;
      b.fill();
      ellipse(b, s * x, y, r - 1, r * 1.2 - 1);
      b.fillStyle = rad(b, s * x, y, 1, r * 1.2, [[0, '#ff9ad0'], [0.5, '#c8306a'], [1, '#4a0f3a']], s * x - 3, y - 4);
      b.fill();
      ellipse(b, s * x, y, r + 1.2, r * 1.2 + 1.2);
      line(b, GILT, 1.8);
      volute(b, s * x, y + 1, r * 0.55, s, GILT_L, 1.5);
    }
  }
  b.restore();
  bowlPath(b);
  line(b, INK, 3.6);
}

// The platform's top: concentric boards in plum and rose-gold, the back edge in shade, a lit ring at the middle.
function top(b, plum) {
  ellipse(b, 0, FLOOR.y, FLOOR.rx, FLOOR.ry);
  b.fillStyle = rad(b, 0, FLOOR.y, 40, FLOOR.rx, [[0, shade(plum, 0.55)], [0.5, shade(plum, 0.1)], [1, shade(plum, -0.4)]]);
  b.fill();
  b.save();
  ellipse(b, 0, FLOOR.y, FLOOR.rx, FLOOR.ry);
  b.clip();
  for (let k = 1; k < 6; k++) {
    ellipse(b, 0, FLOOR.y, FLOOR.rx * (k / 6), FLOOR.ry * (k / 6));
    line(b, rgba(k % 2 ? GILT : '#000000', k % 2 ? 0.4 : 0.35), 1.1);
  }
  b.fillStyle = lin(b, 0, FLOOR.y - FLOOR.ry, 0, FLOOR.y + FLOOR.ry, [[0, rgba('#10002a', 0.55)], [0.6, rgba('#10002a', 0)], [1, rgba('#ffffff', 0.08)]]);
  b.fillRect(-FLOOR.rx, FLOOR.y - FLOOR.ry, FLOOR.rx * 2, FLOOR.ry * 2);
  b.restore();
  ellipse(b, 0, FLOOR.y, FLOOR.rx, FLOOR.ry);
  line(b, INK, 2.4);
}

// The rim: a band of gilt along the near edge with studs, a row of bulbs on it and a row of small arches
// under it, hung with a bead at each point.
function rim(b, l) {
  const pts = [];
  for (let i = 0; i <= 44; i++) {
    const x = -FLOOR.rx + (2 * FLOOR.rx * i) / 44;
    pts.push([x, front(x)]);
  }
  b.beginPath();
  pts.forEach(([x, y], k) => b[k ? 'lineTo' : 'moveTo'](x, y));
  pts.toReversed().forEach(([x, y]) => b.lineTo(x, y + RIM));
  b.closePath();
  b.fillStyle = giltV(b, FLOOR.y, FLOOR.y + FLOOR.ry + RIM);
  b.fill();
  line(b, INK, 3);
  b.beginPath();
  pts.forEach(([x, y], k) => b[k ? 'lineTo' : 'moveTo'](x, y + 1));
  line(b, rgba(GILT_L, 0.8), 1.1);
  b.beginPath();
  pts.forEach(([x, y], k) => b[k ? 'lineTo' : 'moveTo'](x, y + RIM - 1));
  line(b, rgba(GILT_DD, 0.7), 1.4);
  for (let i = 1; i < 44; i += 2) {
    const [x, y] = pts[i];
    bulb(b, l, x, y + 5.2, 2.7, ['#ffe9a0', '#ff9ad0', '#9ae8ff'][(i >> 1) % 3], 0.6);
  }
  for (let i = 2; i < 44; i += 2) stud(b, pts[i][0], pts[i][1] + 10.6, 1.5, GILT_L);
  for (let i = 0; i < 22; i++) { // arches hung under the rim
    const [x0, y0] = pts[i * 2];
    const [x1, y1] = pts[i * 2 + 2];
    b.beginPath();
    b.moveTo(x0, y0 + RIM);
    b.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + RIM + 9, x1, y1 + RIM);
    line(b, INK, 3);
    line(b, GILT_D, 1.8);
    line(b, rgba(GILT_L, 0.6), 0.7);
  }
}

// A short flight of boarding steps at x, three gilt treads widening as they come down the bowl, a post and
// ball at each end of the top one.
function steps(b, x, plum) {
  for (let i = 0; i < 3; i++) {
    const [w, y] = [32 + i * 7, 40 + i * 7];
    b.beginPath();
    b.roundRect(x - w / 2, y, w, 7.4, 2);
    ink(b, giltV(b, y, y + 7.4), 1.8);
    b.beginPath();
    b.moveTo(x - w / 2 + 2, y + 6);
    b.lineTo(x + w / 2 - 2, y + 6);
    line(b, rgba(shade(plum, -0.5), 0.8), 1.4);
    stud(b, x - w / 2 + 4, y + 3.7, 1.2);
    stud(b, x + w / 2 - 4, y + 3.7, 1.2);
  }
  for (const dx of [-17, 17]) {
    path(b, [[x + dx - 1.4, 40], [x + dx + 1.4, 40], [x + dx + 1.4, 30], [x + dx - 1.4, 30]]);
    ink(b, GILT, 1.2);
    circle(b, x + dx, 28.6, 3);
    ink(b, rad(b, x + dx, 28.6, 0, 3, [[0, '#ffffff'], [0.5, GILT_L], [1, GILT_D]], x + dx - 1, 27.6), 1.2);
  }
}

export function floor(b, l, plum) {
  bowl(b, plum);
  top(b, plum);
  rim(b, l);
  for (const s of [-1, 1]) steps(b, s * 104, plum);
}
