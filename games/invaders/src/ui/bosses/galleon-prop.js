// The Thunder Galleon's propeller pod (World 13, Sunset Armada; see galleon.js): a ducted fan hung off the
// hull on a bolted bracket, drawn once as the left one and mirrored for the right. A brass shroud, riveted
// and hooped, round a dark throat where the stator vanes stand (the blades turn in front of them, live,
// galleon-fx.js), a little stack on top that vents steam and a lamp low on the outer rim. An armour
// plate, 120 x 130 for the hit box: the fan's centre is FAN below.
import { path, ink, line, lin, rad, rgba, shade, bloom, eye, ellipse, TAU } from './kit.js';
import { BRASS_L, BRASS_D, IRON, IRON_L, TEAK_D, WARM, metalV, roundX, stud, circle } from './galleon-kit.js';

export const FAN = [0, 8]; // the fan's centre in the part's frame
export const FAN_R = 40; // the throat's radius: the blades reach it
const R = 52;

// The bracket that holds the pod to the hull: a flange plate on the inner side with bolts and a gusset.
function bracket(b, plate) {
  path(b, [[36, -6], [60, -12], [60, 34], [36, 28]]);
  ink(b, lin(b, 36, 0, 60, 0, [[0, shade(plate, -0.2)], [0.5, shade(plate, 0.3)], [1, shade(plate, -0.35)]]), 2.4);
  for (const [x, y] of [[52, -3], [52, 8], [52, 19], [52, 28]]) stud(b, x, y, 2.2);
  path(b, [[28, 48], [50, 34], [58, 36], [58, 52]]); // the gusset under it
  ink(b, lin(b, 0, 34, 0, 52, [[0, IRON_L], [1, IRON]]), 2);
}

// The stack: a tapering brass funnel with a flared lip and two bands.
function stack(b, plate) {
  path(b, [[-23, -42], [-21, -58], [-9, -58], [-7, -42]]);
  ink(b, roundX(b, -23, -7, plate), 2.2);
  path(b, [[-25, -57], [-23, -64], [-7, -64], [-5, -57]]);
  ink(b, lin(b, 0, -64, 0, -57, [[0, BRASS_L], [1, BRASS_D]]), 2);
  ellipse(b, -15, -63.5, 7.4, 1.6);
  b.fillStyle = '#120a06';
  b.fill();
  for (const y of [-47, -53]) {
    path(b, [[-22.4, y], [-7.6, y]], true);
    line(b, rgba('#000000', 0.5), 1.6);
  }
}

// The shroud: a brass ring lit from the upper left, a bright lip round the throat, hoops and rivets.
function shroud(b, l, plate) {
  const [cx, cy] = FAN;
  circle(b, cx, cy, R);
  ink(b, rad(b, cx, cy, R * 0.55, R, [[0, shade(plate, 0.5)], [0.55, plate], [1, shade(plate, -0.55)]], cx - 18, cy - 20), 3.4);
  circle(b, cx, cy, R - 7); // the hoop pressed round the ring
  line(b, rgba('#000000', 0.45), 1.6);
  circle(b, cx, cy + 0.8, R - 7);
  line(b, rgba('#ffe9a0', 0.3), 0.9);
  circle(b, cx, cy, FAN_R + 4);
  ink(b, rad(b, cx, cy, 0, FAN_R + 4, [[0, '#1a0e08'], [0.8, '#0a0604'], [1, '#2a1a0e']]), 2.6);
  circle(b, cx, cy, FAN_R + 2);
  line(b, rgba(BRASS_L, 0.7), 1.4);
  for (let i = 0; i < 16; i++) { // rivets round the ring
    const a = (i * TAU) / 16 + 0.2;
    stud(b, cx + Math.cos(a) * (R - 3.4), cy + Math.sin(a) * (R - 3.4), 1.7);
  }
  for (let i = 0; i < 8; i++) { // stator vanes behind the blades
    const a = (i * TAU) / 8 + 0.4;
    b.beginPath();
    b.moveTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8);
    b.lineTo(cx + Math.cos(a) * (FAN_R + 2), cy + Math.sin(a) * (FAN_R + 2));
    line(b, '#05030a', 4.4);
    line(b, IRON, 3);
    line(b, rgba(IRON_L, 0.8), 1);
  }
  circle(b, cx, cy, 11);
  ink(b, rad(b, cx, cy, 1, 11, [[0, shade(plate, 0.6)], [1, shade(plate, -0.5)]], cx - 3, cy - 4), 2.2);
  const g = rad(l, cx, cy, 2, FAN_R, [[0, rgba('#ff8a2a', 0.34)], [1, rgba('#ff8a2a', 0)]]); // the engine's glow deep in the throat
  l.fillStyle = g;
  circle(l, cx, cy, FAN_R);
  l.fill();
}

export function prop(b, l, p, S) {
  const { plate } = S.pal;
  bracket(b, plate);
  stack(b, plate);
  shroud(b, l, plate);
  b.fillStyle = metalV(b, 50, 66, plate); // a skid under the ring
  b.beginPath();
  b.roundRect(-22, 56, 44, 7, 3);
  b.fill();
  line(b, TEAK_D, 1.6);
  b.beginPath(); // the lamp low on the outer rim: a brass housing round a lit glass
  b.roundRect(-47, 33, 11, 12, 3);
  ink(b, lin(b, -47, 0, -36, 0, [[0, BRASS_D], [0.4, BRASS_L], [1, BRASS_D]]), 1.6);
  eye(l, -41.5, 39, 3.2, WARM, 3.4);
  l.beginPath();
  l.arc(...FAN, R - 1.2, Math.PI * 1.05, Math.PI * 1.62);
  line(l, rgba('#ffe2a0', 0.5), 1.6);
  bloom(l, 0, 8, 70, '#ffb04a', 0.06);
}
