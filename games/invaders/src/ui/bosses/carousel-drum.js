// The Grand Carousel's drum (World 14, Ember Carnival; see carousel.js): a weak part 120 x 88 for the hit box,
// the machine turning under the floor. A cylinder of plum and magenta staves between gilt hoops, a round
// gilt-grilled port in its middle with the cyan aether core burning behind the bars, a ring of marquee
// bulbs above and another below (they chase, live: carousel-fx.js reads BULBS), and a gilt hub at its foot.
import { path, ink, line, lin, rad, rgba, shade, ellipse, bloom, eye } from './kit.js';
import { GILT, GILT_L, GILT_D, STRIPE_D, CYAN, INK, giltX, giltV, stud, bulb, circle, TAU } from './carousel-kit.js';

export const CORE = [0, -1]; // the core's centre in the part's frame
const RX = 56; // the cylinder's radius

// Where the two rings of bulbs sit: nine across the front of each, evenly in angle. The upper ring curves
// down toward us, the lower one hangs with the hoop below it.
export const BULBS = [-23, 19].flatMap((y, ring) => Array.from({ length: 9 }, (_, i) => {
  const a = -1.25 + (2.5 * i) / 8;
  return { x: (RX - 4) * Math.sin(a), y: y + 3 * Math.cos(a) + (ring ? 2 : 0), i: i + ring * 9 };
}));

// The staves: bands of colour by angle round the cylinder, so they narrow toward the edges; a bright band
// left of centre, shadow at both sides.
function body(b) {
  b.beginPath();
  b.moveTo(-RX, -34);
  b.lineTo(-RX, 30);
  b.quadraticCurveTo(0, 41, RX, 30);
  b.lineTo(RX, -34);
  b.closePath();
  b.fillStyle = '#2a0f48';
  b.fill();
  b.save();
  b.clip();
  for (let i = 0; i < 9; i++) {
    const [a0, a1] = [-Math.PI / 2 + (Math.PI * i) / 9, -Math.PI / 2 + (Math.PI * (i + 1)) / 9];
    const [x0, x1] = [RX * Math.sin(a0), RX * Math.sin(a1)];
    b.fillStyle = lin(b, 0, -36, 0, 40, [[0, shade(i % 2 ? '#e0488a' : '#5a2a86', 0.1)], [1, shade(i % 2 ? STRIPE_D : '#2a0f48', -0.2)]]);
    b.fillRect(x0, -36, x1 - x0 + 0.6, 80);
    b.beginPath();
    b.moveTo(x1, -34);
    b.lineTo(x1, 36);
    line(b, rgba(GILT, 0.85), 1.4);
  }
  b.fillStyle = lin(b, -RX, 0, RX, 0, [[0, rgba('#10002a', 0.6)], [0.18, rgba('#10002a', 0.1)], [0.32, rgba('#ffffff', 0.2)], [0.5, rgba('#10002a', 0)], [1, rgba('#10002a', 0.62)]]);
  b.fillRect(-RX, -36, RX * 2, 80);
  b.restore();
  b.beginPath();
  b.moveTo(-RX, -34);
  b.lineTo(-RX, 30);
  b.quadraticCurveTo(0, 41, RX, 30);
  b.lineTo(RX, -34);
  line(b, INK, 3.4);
}

// A gilt hoop round the cylinder at y, studded; `low` curves it downward at its middle.
function hoop(b, y, h = 7) {
  b.beginPath();
  b.moveTo(-RX - 3, y);
  b.quadraticCurveTo(0, y + h * 1.6, RX + 3, y);
  b.lineTo(RX + 3, y + 6);
  b.quadraticCurveTo(0, y + h * 1.6 + 6, -RX - 3, y + 6);
  b.closePath();
  ink(b, giltV(b, y - 2, y + h * 1.6 + 6), 2.2);
  for (let i = 0; i < 9; i++) {
    const a = -1.3 + (2.6 * i) / 8;
    stud(b, (RX - 3) * Math.sin(a), y + 3 + h * 0.8 * (1 + Math.cos(a)) * 0.5 + 2.4, 1.5);
  }
}

// The port: a gilt ring with eight spokes over the cyan core, a boss at the hub.
function port(b, l) {
  const [cx, cy] = CORE;
  circle(b, cx, cy, 21);
  ink(b, giltX(b, cx - 21, cx + 21), 3.2);
  circle(b, cx, cy, 17.6);
  ink(b, rad(b, cx, cy, 0, 17.6, [[0, '#e8ffff'], [0.3, CYAN], [0.8, '#0a6a88'], [1, '#04203a']]), 1.8);
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8 + 0.2;
    path(b, [[cx, cy], [cx + Math.cos(a) * 17.6, cy + Math.sin(a) * 17.6]], true);
    line(b, INK, 3.4);
    line(b, GILT_D, 2);
    path(b, [[cx, cy], [cx + Math.cos(a) * 17.6, cy + Math.sin(a) * 17.6]], true);
    line(b, rgba(GILT_L, 0.45), 0.8);
  }
  circle(b, cx, cy, 5);
  ink(b, rad(b, cx, cy, 0, 5, [[0, '#ffffff'], [0.5, GILT_L], [1, GILT_D]], cx - 1.5, cy - 1.6), 1.6);
  for (let i = 0; i < 12; i++) stud(b, cx + Math.cos((i * TAU) / 12) * 19.6, cy + Math.sin((i * TAU) / 12) * 19.6, 1.2);
  circle(l, cx, cy, 17.2);
  l.fillStyle = rgba(CYAN, 0.7);
  l.fill();
  eye(l, cx, cy, 6, '#e8ffff', 4);
  bloom(l, cx, cy, 52, CYAN, 0.42);
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8 + 0.2;
    l.beginPath();
    l.moveTo(cx, cy);
    l.lineTo(cx + Math.cos(a) * 17, cy + Math.sin(a) * 17);
    line(l, rgba('#e8ffff', 0.3), 0.8);
  }
}

// The hub under the cylinder: a gilt cone and a ball.
function hub(b) {
  path(b, [[-14, 36], [14, 36], [6, 44], [-6, 44]]);
  ink(b, giltX(b, -14, 14), 1.8);
  ellipse(b, 0, 44.4, 6.6, 2.4);
  ink(b, giltV(b, 42, 47), 1.4);
}

export function drum(b, l) {
  hub(b);
  body(b);
  hoop(b, -40, 5);
  hoop(b, 27, 5);
  port(b, l);
  for (const p of BULBS) bulb(b, l, p.x, p.y, 2.7, ['#ffe9a0', '#ff9ad0', '#9ae8ff'][p.i % 3], 0.6);
}
