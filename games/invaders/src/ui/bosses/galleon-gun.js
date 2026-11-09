// The Thunder Galleon's gun deck (World 13, Sunset Armada; see galleon.js): a battery hung off the lower hull
// like a sponson, drawn once as the left one and mirrored for the right. A teak box in a heavy brass frame
// on a bolted flange, two rows of three open ports with their lids propped up and a cannon in each, its
// brass muzzle ring round a bore that burns with the weak colour, and an aether feed along the foot
// that lights them. A weak point, 110 x 80 for the hit box; GUNS are the muzzles' places for the live
// extras (the flashes and smoke of the last phase).
import { path, ink, line, lin, rad, rgba, shade, bloom, eye } from './kit.js';
import { BRASS_L, IRON_L, metalV, planks, stud, studRow, circle } from './galleon-kit.js';

export const FEED = [-46, 38, 29]; // the aether feed along the foot of the box: its two ends and its height
export const GUNS = [-30, -4, 22].flatMap((x) => [-13, 14].map((y) => [x, y]));

// One cannon seen muzzle on: the dark port with the carriage's wheels in its corners, the barrel's swell, its
// bands, a ring of brass round the mouth, the bore alight.
function cannon(b, l, x, y, weak) {
  b.beginPath();
  b.roundRect(x - 10, y - 10, 20, 20, 3);
  ink(b, lin(b, 0, y - 10, 0, y + 10, [[0, '#1a0a06'], [1, '#3e1c10']]), 2.4);
  for (const s of [-1, 1]) { // the carriage's trucks
    circle(b, x + s * 7.2, y + 6.8, 2.7);
    ink(b, '#4a2a14', 0.9);
    circle(b, x + s * 7.2, y + 6.8, 0.9);
    b.fillStyle = BRASS_L;
    b.fill();
  }
  circle(b, x, y, 8.4);
  ink(b, rad(b, x, y, 1, 8.4, [[0, '#7a6450'], [0.7, '#2e2218'], [1, '#100a08']], x - 2.6, y - 3), 1.2);
  circle(b, x, y, 7.2); // a band round the swell
  line(b, rgba('#000000', 0.55), 0.9);
  circle(b, x, y, 5.9);
  line(b, '#1a0e06', 3.4);
  line(b, '#d9a23a', 2.1);
  b.beginPath();
  b.arc(x, y, 5.9, Math.PI * 1.1, Math.PI * 1.75);
  line(b, '#fff2c0', 0.9);
  circle(b, x, y, 4);
  line(b, '#06080c', 1.4);
  circle(b, x, y, 3.1);
  b.fillStyle = rad(b, x, y, 0, 3.2, [[0, '#0a1c28'], [1, '#02040a']]);
  b.fill();
  b.beginPath(); // the lid, propped up above the port
  b.roundRect(x - 10, y - 15, 20, 4.4, 1.4);
  ink(b, lin(b, 0, y - 15, 0, y - 10, [[0, '#6a3e1c'], [1, '#2a160a']]), 1.4);
  eye(l, x, y, 1.5, weak, 2.4);
}

// The aether feed: a brass pipe along the foot of the box with a glass run lit from inside.
function feed(b, l, weak) {
  const y = FEED[2];
  path(b, [[FEED[0], y], [FEED[1], y]], true);
  line(b, '#05080e', 8);
  line(b, metalV(b, 24, 34, '#c8902a'), 6);
  for (let x = -40; x < 34; x += 18) {
    path(b, [[x, y], [x + 11, y]], true);
    line(b, '#bff6ff', 4);
    line(b, rgba(weak, 0.8), 2.4);
    path(l, [[x, y], [x + 11, y]], true);
    line(l, rgba(weak, 0.4), 6);
    line(l, rgba('#ffffff', 0.85), 1.6);
    stud(b, x + 14.5, y, 1.6, IRON_L);
  }
}

export function gun(b, l, p, S) {
  const { plate, weak } = S.pal;
  b.beginPath(); // the box
  b.roundRect(-55, -37, 110, 74, 13);
  ink(b, lin(b, 0, -37, 0, 37, [[0, shade(plate, 0.45)], [0.4, plate], [1, shade(plate, -0.6)]]), 3.4);
  b.save();
  b.beginPath();
  b.roundRect(-48, -31, 90, 62, 7);
  b.clip();
  planks(b, -48, -31, 42, 31, '#3a2210', 7, 8);
  b.restore();
  b.beginPath();
  b.roundRect(-48, -31, 90, 62, 7);
  line(b, rgba('#000000', 0.7), 2);
  for (const [x, y] of GUNS) cannon(b, l, x, y, weak);
  feed(b, l, weak);
  path(b, [[42, -37], [55, -33], [55, 33], [42, 37]]); // the flange
  ink(b, lin(b, 42, 0, 55, 0, [[0, shade(plate, 0.3)], [1, shade(plate, -0.45)]]), 2);
  studRow(b, 49, -26, 49, 26, 5, 2);
  for (const [x, y] of [[-49, -32], [-49, 32], [40, -34], [40, 34]]) stud(b, x, y, 2.6, IRON_L);
  path(b, [[-50, -35], [40, -35]], true);
  line(b, rgba('#fff4c8', 0.45), 1.1);
  bloom(l, -4, 0, 70, weak, 0.1);
}
