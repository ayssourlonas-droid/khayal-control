// The Thunder Galleon's keel (World 13, Sunset Armada; see galleon.js): the furnace in the belly, a boiler
// of dark iron banded in brass hanging under the hull. A round fire door in a bolted bezel, a grate across
// the fire and, hovering in front of it, the aether crystal that feeds the ship (the weak colour), a
// gauge and a valve wheel on either side, pipes going up into the hull, vent slits low down and a flared
// nozzle under it all where the exhaust rolls out (the flames and the heat are live, galleon-fx.js). A
// weak point, 140 x 90 for the hit box, drawn on a canvas with 40 px more all round for the nozzle.
import { path, ink, line, lin, rad, rgba, shade, bloom, eye, both, ellipse, neon, TAU } from './kit.js';
import {
  BRASS_L, BRASS_D, IRON, IRON_L, FIRE, metalV, stud, studRow, circle,
} from './galleon-kit.js';

export const GAUGE = [-50, -14]; // the pressure gauge's centre; its needle is live
export const DOOR = [0, -4, 29]; // the fire door's centre and the bezel's radius
export const NOZZLE_Y = 52; // the lip of the nozzle, where the exhaust leaves
const POD = [[64, -45], [69, -28], [66, 2], [56, 26], [41, 38], [31, 43]];

// The boiler's outline: a pot with a short neck.
function shellPath(b) {
  b.beginPath();
  b.moveTo(-64, -45);
  b.lineTo(64, -45);
  for (let i = 0; i < POD.length - 1; i++) {
    const [[x0, y0], [x1, y1]] = [POD[i], POD[i + 1]];
    b.quadraticCurveTo(x0 + (x1 - x0) * 0.2 + 2, y0 + (y1 - y0) * 0.6, x1, y1);
  }
  b.lineTo(-31, 43);
  for (let i = POD.length - 1; i > 0; i--) {
    const [[x0, y0], [x1, y1]] = [POD[i], POD[i - 1]];
    b.quadraticCurveTo(-(x0 + (x1 - x0) * 0.2 + 2), y0 + (y1 - y0) * 0.6, -x1, y1);
  }
  b.closePath();
}

// The shell itself: dark iron, lit a little from the left.
function shell(b) {
  shellPath(b);
  ink(b, lin(b, -69, 0, 69, 0, [[0, '#14101a'], [0.22, '#3a3044'], [0.42, '#52465e'], [0.7, '#2c2434'], [1, '#100c16']]), 3.4);
}

// A brass hoop round the boiler at y, riveted.
function hoop(b, y, h = 6) {
  b.fillStyle = metalV(b, y - h / 2, y + h / 2, '#c8902a');
  b.fillRect(-70, y - h / 2, 140, h);
  line(b, rgba('#000000', 0.6), 1.2);
  studRow(b, -62, y, 62, y, 12, 1.5);
}

// The fire behind the door: a coal-bed of white and orange, the dark of the firebox at its rim, tongues.
function fire(b, l) {
  const [x, y, r] = DOOR;
  circle(b, x, y, r - 5);
  b.fillStyle = rad(b, x, y + 4, 2, r - 5, [[0, '#fff6c8'], [0.22, '#ffd060'], [0.55, '#f07a1c'], [0.85, '#9a2c0c'], [1, '#3a0e06']]);
  b.fill();
  l.fillStyle = rad(l, x, y + 4, 2, r - 5, [[0, rgba('#fff0b0', 0.3)], [0.4, rgba(FIRE, 0.28)], [1, rgba('#c02808', 0.06)]]);
  circle(l, x, y, r - 5);
  l.fill();
  for (let i = 0; i < 7; i++) { // tongues licking up
    const a = -Math.PI / 2 + (i - 3) * 0.34;
    const [bx, by] = [x + Math.cos(a + Math.PI) * 0, y + 14];
    path(l, [[bx + Math.sin(a) * 13, by], [x + Math.sin(a) * 20 + (i % 2 ? 2 : -2), y - 18 + Math.abs(i - 3) * 4], [bx - Math.sin(a) * 13 + 4, by]]);
    l.fillStyle = rgba(i % 2 ? '#ffd060' : FIRE, 0.14);
    l.fill();
  }
  b.save();
  circle(b, x, y, r - 5);
  b.clip();
  for (let i = -2; i <= 2; i++) { // the grate
    path(b, [[x - r, y + i * 9], [x + r, y + i * 9]], true);
    line(b, '#07040a', 3);
    line(b, rgba(IRON_L, 0.55), 1);
  }
  b.restore();
}

// The aether crystal hanging in front of the grate: a tall faceted gem, a white heart.
function crystal(b, l, weak) {
  const [x, y] = [DOOR[0], DOOR[1]];
  path(b, [[x, y - 17], [x + 8, y - 5], [x + 6, y + 9], [x, y + 17], [x - 6, y + 9], [x - 8, y - 5]]);
  ink(b, lin(b, x - 8, y - 17, x + 8, y + 17, [[0, '#c8fbff'], [0.35, weak], [1, '#0a6a94']]), 1.6);
  for (const pts of [[[x, y - 17], [x + 2, y], [x - 8, y - 5]], [[x + 2, y], [x + 8, y - 5], [x + 6, y + 9]], [[x + 2, y], [x, y + 17], [x - 6, y + 9]]]) {
    path(b, pts);
    b.fillStyle = rgba('#ffffff', 0.12);
    b.fill();
  }
  path(b, [[x, y - 17], [x + 2, y], [x, y + 17]], true);
  line(b, rgba('#ffffff', 0.6), 0.9);
  eye(l, x, y, 2.4, weak, 3);
  bloom(l, x, y, 40, weak, 0.45);
  path(l, [[x, y - 17], [x + 8, y - 5], [x + 6, y + 9], [x, y + 17], [x - 6, y + 9], [x - 8, y - 5]]);
  neon(l, weak, 1.1, 0.8);
}

// The bezel: a thick brass ring round the door with its bolts, a hinge on the left, a latch on the right.
function bezel(b, plate) {
  const [x, y, r] = DOOR;
  circle(b, x, y, r + 1);
  ink(b, rad(b, x, y, r - 8, r + 1, [[0, shade(plate, -0.4)], [0.5, shade(plate, 0.45)], [1, shade(plate, -0.35)]], x - 8, y - 12), 3);
  circle(b, x, y, r - 5);
  line(b, rgba('#000000', 0.8), 2.6);
  circle(b, x, y, r - 5.4);
  line(b, rgba('#ffe9a0', 0.35), 0.8);
  for (let i = 0; i < 12; i++) stud(b, x + Math.cos((i * TAU) / 12) * (r - 2.6), y + Math.sin((i * TAU) / 12) * (r - 2.6), 1.7, BRASS_L);
  b.beginPath();
  b.roundRect(x + r - 4, y - 5, 12, 10, 2); // the latch
  ink(b, lin(b, 0, y - 5, 0, y + 5, [[0, IRON_L], [1, IRON]]), 1.6);
  path(b, [[x + r + 2, y], [x + r + 2, y + 14]], true);
  line(b, IRON, 3.4);
  circle(b, x + r + 2, y + 15, 3);
  ink(b, '#c8902a', 1.2);
}

// A dial: a brass bezel, a pale face with ticks, the last of them red; the needle is live (galleon-fire.js).
function gauge(b, l, x, y) {
  circle(b, x, y, 9.5);
  ink(b, lin(b, 0, y - 9, 0, y + 9, [[0, BRASS_L], [1, BRASS_D]]), 1.6);
  circle(b, x, y, 7);
  b.fillStyle = rad(b, x, y, 0, 7, [[0, '#fff8e0'], [1, '#d8c08c']]);
  b.fill();
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * 0.75 + (i * Math.PI * 1.5) / 8;
    path(b, [[x + Math.cos(a) * 5, y + Math.sin(a) * 5], [x + Math.cos(a) * 6.8, y + Math.sin(a) * 6.8]], true);
    line(b, i > 6 ? '#c82a1a' : '#3a2208', 0.9);
  }
  circle(l, x - 2, y - 2, 2.2);
  l.fillStyle = rgba('#ffffff', 0.18);
  l.fill();
}

// A valve wheel: a spoked iron wheel on a brass hub.
function valve(b, x, y) {
  circle(b, x, y, 9);
  line(b, '#07040a', 4.2);
  line(b, IRON_L, 2.4);
  for (let i = 0; i < 4; i++) {
    const a = (i * TAU) / 8;
    path(b, [[x - Math.cos(a) * 9, y - Math.sin(a) * 9], [x + Math.cos(a) * 9, y + Math.sin(a) * 9]], true);
    line(b, '#07040a', 3);
    line(b, IRON_L, 1.4);
  }
  circle(b, x, y, 3);
  ink(b, BRASS_L, 1.2);
}

// The vent slits low on the boiler, glowing a little.
function vents(b, l) {
  both((s) => {
    for (let i = 0; i < 4; i++) {
      const vy = 14 + i * 4.4;
      path(b, [[s * 42, vy], [s * 56, vy - 2]], true);
      line(b, '#05030a', 2.6);
      path(l, [[s * 42, vy], [s * 56, vy - 2]], true);
      line(l, rgba(FIRE, 0.7), 1);
    }
  });
}

// The nozzle: a bell flaring from the boiler's foot to a brass lip, its throat white-hot.
function nozzle(b, l, plate) {
  path(b, [[-31, 41], [31, 41], [40, NOZZLE_Y], [-40, NOZZLE_Y]]);
  ink(b, lin(b, -40, 0, 40, 0, [[0, '#2a1c16'], [0.3, '#5a3c24'], [0.6, '#3a2418'], [1, '#1c120e']]), 3);
  ellipse(b, 0, NOZZLE_Y, 40, 5.4);
  ink(b, lin(b, 0, NOZZLE_Y - 5, 0, NOZZLE_Y + 5, [[0, shade(plate, 0.5)], [1, shade(plate, -0.5)]]), 2.4);
  ellipse(b, 0, NOZZLE_Y + 0.6, 34, 3.4);
  b.fillStyle = rad(b, 0, NOZZLE_Y, 0, 34, [[0, '#fff0b8'], [0.4, '#ff9a30'], [1, '#6a1c08']]);
  b.fill();
  ellipse(l, 0, NOZZLE_Y + 0.6, 34, 3.4);
  l.fillStyle = rad(l, 0, NOZZLE_Y, 0, 34, [[0, rgba('#fff0b8', 0.9)], [0.5, rgba(FIRE, 0.6)], [1, rgba('#c02808', 0.1)]]);
  l.fill();
  studRow(b, -34, 44.4, 34, 44.4, 8, 1.5);
}

export function keel(b, l, p, S) {
  const { plate, weak } = S.pal;
  nozzle(b, l, plate);
  shell(b);
  vents(b, l);
  hoop(b, -40);
  hoop(b, 31);
  b.save();
  shellPath(b);
  b.clip();
  b.fillStyle = rad(b, 0, -4, 20, 62, [[0, rgba('#000000', 0)], [1, rgba('#000000', 0.38)]]); // the shell darkening away from the door
  b.fillRect(-70, -45, 140, 90);
  b.restore();
  fire(b, l);
  bezel(b, plate);
  crystal(b, l, weak);
  gauge(b, l, GAUGE[0], GAUGE[1]);
  valve(b, 51, -15);
  bloom(l, 0, -4, 80, FIRE, 0.18);
  bloom(l, 0, 40, 60, FIRE, 0.2);
}
