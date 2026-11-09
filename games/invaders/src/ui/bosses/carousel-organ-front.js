// What stands in front of the band organ's pipes (World 14, Ember Carnival; carousel-organ.js): the sunburst
// medallion with its cyan lens, the striped bass drum at the left corner and the cymbal on its stand at the
// right. The lens is the heart of the weak point.
import { path, ink, line, lin, rad, rgba, ellipse, bloom, eye } from './kit.js';
import { GILT, GILT_D, STRIPE, STRIPE_D, CREAM, CYAN, INK, giltX, giltV, stud, bulb, circle, TAU } from './carousel-kit.js';

export const LENS = [0, 3]; // the lens's centre in the part's frame

// The medallion: a ring of bulbs, a gilt ring studded, sixteen rays in magenta and cream, an inner ring and the lens.
function medallion(b, l) {
  const [cx, cy] = LENS;
  for (let i = 0; i < 12; i++) {
    const a = (i * TAU) / 12 + 0.26;
    bulb(b, l, cx + Math.cos(a) * 25, cy + Math.sin(a) * 25, 2.3, ['#ffe9a0', '#ff9ad0', '#9ae8ff'][i % 3], 0.5);
  }
  circle(b, cx, cy, 22);
  ink(b, giltX(b, cx - 22, cx + 22), 3.4);
  b.save();
  circle(b, cx, cy, 18.6);
  b.clip();
  for (let i = 0; i < 16; i++) {
    path(b, [[cx, cy], [cx + Math.cos((i * TAU) / 16) * 26, cy + Math.sin((i * TAU) / 16) * 26], [cx + Math.cos(((i + 1) * TAU) / 16) * 26, cy + Math.sin(((i + 1) * TAU) / 16) * 26]]);
    b.fillStyle = i % 2 ? CREAM : STRIPE;
    b.fill();
  }
  b.fillStyle = rad(b, cx, cy, 6, 19, [[0, rgba('#10002a', 0)], [1, rgba('#10002a', 0.5)]]);
  b.fillRect(cx - 20, cy - 20, 40, 40);
  b.restore();
  circle(b, cx, cy, 18.6);
  line(b, INK, 1.4);
  for (let i = 0; i < 12; i++) stud(b, cx + Math.cos((i * TAU) / 12) * 20.4, cy + Math.sin((i * TAU) / 12) * 20.4, 1.3);
  circle(b, cx, cy, 11.4);
  ink(b, giltX(b, cx - 11, cx + 11, GILT_D), 2.4);
  circle(b, cx, cy, 8.6); // the lens: dark rim, a cyan iris, a glint
  ink(b, rad(b, cx, cy, 0, 8.6, [[0, '#e8ffff'], [0.4, CYAN], [1, '#0a5a78']], cx - 2.4, cy - 2.6), 1.6);
  ellipse(b, cx - 2.6, cy - 3, 2.4, 1.5, -0.6);
  b.fillStyle = rgba('#ffffff', 0.85);
  b.fill();
  circle(l, cx, cy, 8.4);
  l.fillStyle = rgba(CYAN, 0.8);
  l.fill();
  eye(l, cx, cy, 5, '#e8ffff', 4.2);
  bloom(l, cx, cy, 44, CYAN, 0.4);
  circle(l, cx, cy, 11.4);
  line(l, rgba(CYAN, 0.55), 1.2);
}

// The bass drum at the left corner: a dark shell behind, a cream skin with a magenta ring and a gilt star,
// gilt hoops, tension rods.
function bassDrum(b) {
  const [x, y] = [-60, 24];
  ellipse(b, x + 5, y, 13, 16);
  ink(b, lin(b, x, 0, x + 18, 0, [[0, STRIPE], [1, STRIPE_D]]), 1.8);
  for (const dy of [-9, -3, 3, 9]) {
    b.beginPath();
    b.moveTo(x + 1, y + dy);
    b.lineTo(x + 18, y + dy);
    line(b, rgba(GILT, 0.9), 1.1);
  }
  ellipse(b, x, y, 13, 16);
  ink(b, rad(b, x, y, 2, 16, [[0, '#ffffff'], [0.7, CREAM], [1, '#b89878']], x - 4, y - 5), 2.2);
  ellipse(b, x, y, 10, 12.6);
  line(b, STRIPE, 2);
  b.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * TAU) / 10 - Math.PI / 2;
    const r = i % 2 ? 3 : 7;
    b[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r);
  }
  b.closePath();
  ink(b, giltV(b, y - 7, y + 7), 1.2);
  ellipse(b, x, y, 13.6, 16.6);
  line(b, GILT, 1.6);
  for (let i = 0; i < 6; i++) stud(b, x + Math.cos((i * TAU) / 6) * 13.6, y + Math.sin((i * TAU) / 6) * 16.6, 1.3);
}

// The cymbal at the right corner on its stand: a thin gilt dish tilted toward us, a boss at its middle.
function cymbal(b, l) {
  const [x, y] = [62, 22];
  path(b, [[x - 1.4, y + 3], [x + 1.4, y + 3], [x + 2, y + 25], [x - 2, y + 25]]);
  ink(b, giltX(b, x - 2, x + 2, GILT_D), 1.2);
  ellipse(b, x, y, 17, 6.4, -0.22);
  ink(b, lin(b, x - 17, y - 6, x + 17, y + 6, [[0, '#fff2b8'], [0.5, GILT], [1, GILT_D]]), 2);
  ellipse(b, x, y, 10, 3.5, -0.22);
  line(b, rgba('#ffffff', 0.5), 0.9);
  circle(b, x, y - 0.4, 3.2);
  ink(b, rad(b, x, y - 0.4, 0, 3.2, [[0, '#ffffff'], [1, GILT_D]]), 1.2);
  eye(l, x - 8, y - 2.4, 1.2, '#fff6d0', 3);
}

export function front(b, l) {
  bassDrum(b);
  cymbal(b, l);
  medallion(b, l);
}
