// The cargo of World 18's balloon (w18-balloon.js): a wooden crate hung on four ropes, strapped in iron, its lid open and a
// golden prize glowing in it (the pickup the balloon carries), and a lantern swinging from its side. The crate sways with the
// beat and the lantern gutters. Lights: the prize, the light leaking between the planks, the lantern.
import { path, ink, lin, rad, rgba, shade, bloom, line, circle, INK, IRON, IRON_D, STEEL, FORGE, HOT, rivets, glare, scuff } from './w18-kit.js';

const WOOD = '#8a5a32';
const PRIZE = '#ffd25a';

// The four ropes from the net's foot (x0..) down to the crate's top corners, swinging with the crate by sway px.
export function ropes(b, sway) {
  for (const [x0, y0, x1, y1] of [[-13, 12, -10, 25], [-5, 14.4, -4, 25], [5, 14.4, 4, 25], [13, 12, 10, 25]]) {
    b.beginPath();
    b.moveTo(x0, y0);
    b.quadraticCurveTo((x0 + x1) / 2 + sway * 0.4, (y0 + y1) / 2, x1 + sway, y1);
    line(b, INK, 2.6);
    line(b, '#b08a58', 1.2);
  }
}

// The crate, drawn about its own centre (0, 0), 22 wide and 17 tall.
function crate(b, l, f) {
  b.beginPath();
  b.ellipse(0, -8, 10.6, 3, 0, 0, Math.PI * 2); // the open mouth, seen from just above
  ink(b, '#1c0e06', 2);
  path(b, [[-11, -7.6], [11, -7.6], [11, 9], [-11, 9]]);
  ink(b, lin(b, -11, -8, 11, 9, [[0, shade(WOOD, 0.35)], [0.5, WOOD], [1, shade(WOOD, -0.55)]]), 2.6);
  b.save();
  path(b, [[-11, -7.6], [11, -7.6], [11, 9], [-11, 9]]);
  b.clip();
  for (const x of [-5.5, 0, 5.5]) { // the planks' joints
    b.beginPath();
    b.moveTo(x, -8);
    b.lineTo(x, 9);
    line(b, rgba('#0a0402', 0.7), 0.9);
  }
  scuff(b, 8, 13, 0, 0, 10, 8, 0.2);
  b.restore();
  for (const y of [-6.2, 6.4]) { // iron straps across, with rivets
    b.beginPath();
    b.rect(-11.4, y - 1.6, 22.8, 3.2);
    ink(b, lin(b, 0, y - 2, 0, y + 2, [[0, shade(IRON, 0.3)], [1, IRON_D]]), 1.4);
    rivets(b, -9.2, y, 9.2, y, 4, 0.8, STEEL);
  }
  for (const x of [-5.5, 0, 5.5]) { // the prize's light leaks out between the planks
    l.fillStyle = rgba(PRIZE, f ? 0.4 : 0.55);
    l.fillRect(x - 0.5, -4.6, 1, 11);
  }
  bloom(l, 0, 1, 10, PRIZE, 0.34);
}

// The prize: a golden orb in the crate's mouth, a bright disc with a four-point star over it.
function prize(b, l, f) {
  b.save();
  b.beginPath();
  b.rect(-12, -16, 24, 8.4); // only what stands above the crate's front edge
  b.clip();
  circle(b, 0, -8.4, 5.4);
  ink(b, rad(b, -1.6, -10.4, 0, 7, [[0, '#ffffff'], [0.4, PRIZE], [1, '#b87a10']]), 1.8);
  b.restore();
  const r = f ? 6.5 : 8.5;
  bloom(l, 0, -9, 20, PRIZE, 0.75);
  glare(l, 0, -9.4, 3.4, PRIZE, 1);
  l.save();
  l.globalCompositeOperation = 'lighter';
  for (const [dx, dy] of [[1, 0], [0, 1]]) {
    l.beginPath();
    l.moveTo(-dx * r, -9.4 - dy * r);
    l.quadraticCurveTo(0, -9.4, dx * r, -9.4 + dy * r);
    l.quadraticCurveTo(0, -9.4, -dx * r, -9.4 - dy * r);
    l.fillStyle = rgba('#ffffff', 0.8);
    l.fill();
  }
  l.restore();
}

// The lantern on a hook at the crate's right: an iron frame round a flame, its light swelling and falling.
function lantern(b, l, f) {
  b.beginPath();
  b.moveTo(11, -1);
  b.lineTo(15.4, -1);
  line(b, INK, 2.2);
  path(b, [[13.4, 0], [17.6, 0], [17, 6.6], [14, 6.6]]);
  ink(b, lin(b, 13, 0, 18, 7, [[0, '#ffe8a8'], [1, '#d08a28']]), 1.6);
  b.beginPath();
  b.rect(13, -1.8, 5, 1.8);
  ink(b, IRON_D, 1.2);
  b.beginPath();
  b.rect(13.4, 6.4, 4.2, 1.6);
  ink(b, IRON_D, 1.2);
  bloom(l, 15.6, 3.4, f ? 6 : 8, FORGE, f ? 0.5 : 0.75);
  glare(l, 15.6, 3.6, f ? 1 : 1.4, HOT, 0.9);
}

// The whole cargo at its resting place (0, 33), swung sway px to one side by the beat.
export function pod(b, l, f, sway) {
  for (const g of [b, l]) {
    g.save();
    g.translate(sway, 33);
    g.rotate(sway * 0.03);
  }
  crate(b, l, f);
  prize(b, l, f);
  lantern(b, l, f);
  l.restore();
  b.restore();
}
