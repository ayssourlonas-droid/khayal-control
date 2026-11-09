// The Thunder Galleon's hull (World 13, Sunset Armada; see galleon.js): a deep teak hull seen from astern,
// its upper band a stern gallery of lit windows between carved pilasters, a belt of brass moulding
// under it and, below, strakes of riveted brass plate laid along the curve of the hull, held by iron
// straps, with the hatches of the lower gun ports and a name plate on the transom. The rail, deck stores,
// yards, rigging and sails are in galleon-deck.js and galleon-rig.js; the parts stand over all of it.
import { path, ink, line, lin, rad, rgba, shade, bloom, both, ellipse } from './kit.js';
import { hash } from '../sprites.js';
import { BRASS_L, BRASS_D, TEAK_D, IRON, IRON_L, WARM, FIRE, sheer, metalV, roundX, planks, stud, studRow, ring, spline } from './galleon-kit.js';
import { window, letters } from './galleon-glass.js';

const BELT = (x) => 24 + 5 * (1 - (x / 236) ** 2); // where the gallery ends and the plating begins
const SIDE = [[232, -32], [238, -8], [235, 16], [224, 44], [206, 70], [184, 94], [156, 115], [123, 132], [88, 143], [50, 150], [0, 152]];

// The hull's outline: the rail's sweep across the top, the two flanks curving in to the keel.
export function hullPath(g) {
  g.beginPath();
  g.moveTo(-232, -32);
  g.quadraticCurveTo(0, -16, 232, -32);
  spline(g, SIDE);
  spline(g, SIDE.toReversed().map(([x, y]) => [-x, y]));
  g.closePath();
}

// The hull's lower edge at |x|: straight down the flank until it curves in under the keel.
function lowerY(x) {
  const a = Math.abs(x);
  if (a >= 224) return 44;
  for (let i = 3; i < SIDE.length - 1; i++) {
    const [[x0, y0], [x1, y1]] = [SIDE[i], SIDE[i + 1]];
    if (a <= x0 && a >= x1) return y0 + ((y1 - y0) * (x0 - a)) / (x0 - x1);
  }
  return 152;
}

const ROWS = 8;
const rowY = (x, k) => BELT(x) + ((lowerY(x) - BELT(x)) * k) / ROWS;

// Strakes of brass plate, each course a belt of plates between two curves that follow the hull, the
// joints staggered, each plate lit from above with rivets at its corners.
function plating(b, S) {
  const { plate } = S.pal;
  for (let k = 0; k < ROWS; k++) {
    for (let x = -250 - hash(k) * 60; x < 250; ) {
      const w = 46 + hash(k * 31 + Math.round(x)) * 28;
      const [xa, xb] = [x, x + w];
      const t = shade(plate, (hash(k * 7 + Math.round(x * 0.3)) - 0.5) * 0.24 - 0.1 - k * 0.02);
      const ys = [rowY(xa, k), rowY(xb, k), rowY(xb, k + 1), rowY(xa, k + 1)];
      path(b, [[xa, ys[0]], [xb, ys[1]], [xb, ys[2]], [xa, ys[3]]]);
      ink(b, lin(b, 0, Math.min(ys[0], ys[1]), 0, Math.max(ys[2], ys[3]), [[0, shade(t, 0.3)], [0.3, shade(t, 0)], [1, shade(t, -0.55)]]), 1.6);
      path(b, [[xa + 2, ys[0] + 2.4], [xb - 2, ys[1] + 2.4]], true);
      line(b, rgba('#fff4c8', 0.3), 1);
      studRow(b, xa + 5, ys[0] + 5, xa + 5, ys[3] - 5, 2, 1.5);
      studRow(b, xb - 5, ys[1] + 5, xb - 5, ys[2] - 5, 2, 1.5);
      x = xb;
    }
  }
}

// An iron strap down the hull at x, 9 wide, studded, its foot swelling a little where it ends.
function strap(b, x, y0, y1) {
  b.fillStyle = roundX(b, x - 5, x + 5, IRON_L);
  b.fillRect(x - 5, y0, 10, y1 - y0);
  b.strokeStyle = TEAK_D;
  b.lineWidth = 1.6;
  b.strokeRect(x - 5, y0, 10, y1 - y0);
  studRow(b, x, y0 + 9, x, y1 - 6, Math.round((y1 - y0) / 17), 1.7, IRON_L);
}

// The brass belt where gallery meets plating: a moulding as thick as a hawser along BELT.
function belt(b) {
  const top = [];
  const bot = [];
  for (let x = -238; x <= 238; x += 14) {
    top.push([x, BELT(x) - 6]);
    bot.unshift([x, BELT(x) + 4]);
  }
  path(b, [...top, ...bot]);
  ink(b, lin(b, 0, 14, 0, 36, [[0, BRASS_L], [0.5, '#b07c20'], [1, BRASS_D]]), 2);
  for (let x = -230; x <= 230; x += 12) { // egg and dart
    ellipse(b, x, BELT(x) - 1, 3.4, 2);
    b.fillStyle = rgba('#3a2208', 0.55);
    b.fill();
  }
}

// The stern gallery: carved pilasters and arched windows along the upper hull, five to a side.
function gallery(b, l) {
  b.save();
  hullPath(b);
  b.clip();
  planks(b, -250, -34, 250, BELT(0), '#3a2210', 5, 8);
  for (let x = -250; x <= 250; x += 6) { // the cornice under the rail
    b.fillStyle = rgba(x % 12 ? '#f8dc8c' : '#5c3410', 0.85);
    b.fillRect(x, sheer(x) + 3, 5, 4);
  }
  both((s) => {
    for (let i = 0; i < 5; i++) {
      const x = s * (101 + i * 26.5) - 6.5;
      window(b, l, x, -12, 13, 20, 0.8 + 0.2 * hash(i + (s > 0 ? 9 : 0)));
      b.fillStyle = metalV(b, -14, 12, BRASS_D);
      b.fillRect(x + 15.5, -14, 3.4, 26); // the pilaster beside it
    }
    for (let i = 0; i < 9; i++) { // a gilt rosette on the panel under the windows
      const rx = s * (96 + i * 15);
      ellipse(b, rx, 16, 3.8, 3.8);
      ink(b, rad(b, rx - 1, 15, 0, 4, [[0, BRASS_L], [1, BRASS_D]]), 1);
    }
  });
  b.restore();
}

// A closed gun port: a teak hatch with an iron strap and a ring to lift it by.
function hatch(b, x, y) {
  b.beginPath();
  b.roundRect(x - 11, y - 8, 22, 16, 2);
  ink(b, lin(b, 0, y - 8, 0, y + 8, [[0, '#5a3218'], [1, '#2a160a']]), 1.8);
  path(b, [[x - 11, y - 3], [x + 11, y - 3]], true);
  line(b, IRON, 2.6);
  ring(b, x, y + 2, 2.6, 1.4);
  studRow(b, x - 8, y - 5, x + 8, y - 5, 2, 1.2);
}

// The name plate on the transom under the bridge: brass, studded, its letters cut in.
function plaque(b) {
  b.beginPath();
  b.roundRect(-58, 29, 116, 20, 4);
  ink(b, lin(b, 0, 29, 0, 49, [[0, BRASS_L], [0.5, '#c8902a'], [1, BRASS_D]]), 2.2);
  for (const [x, y] of [[-52, 35], [52, 35], [-52, 43], [52, 43]]) stud(b, x, y, 1.8);
  letters(b, 'THUNDER', 0, 39.6, 11);
  line(b, rgba('#fff0b0', 0.55), 3.6);
  letters(b, 'THUNDER', 0, 39, 11);
  line(b, '#2a1608', 2.4);
}

export function hullBody(b, l, S) {
  hullPath(b);
  ink(b, lin(b, 0, -32, 0, 152, [[0, shade(S.pal.hull, 0.2)], [1, S.pal.hull]]), 4);
  gallery(b, l);
  b.save();
  hullPath(b);
  b.clip();
  plating(b, S);
  both((s) => {
    strap(b, s * 100, BELT(100) - 2, 150);
    strap(b, s * 196, BELT(196) - 2, 150);
    for (const [x, y] of [[96, 70], [123, 94], [96, 96]]) hatch(b, s * x, y);
  });
  b.fillStyle = lin(b, 0, 24, 0, 152, [[0, rgba('#1a0a02', 0)], [1, rgba('#1a0a02', 0.38)]]); // the hull darkening toward the keel
  b.fillRect(-250, 24, 500, 130);
  b.fillStyle = lin(b, -240, 0, 240, 0, [[0, rgba('#1a0a02', 0.4)], [0.22, rgba('#1a0a02', 0)], [0.78, rgba('#1a0a02', 0)], [1, rgba('#1a0a02', 0.4)]]);
  b.fillRect(-250, 24, 500, 130);
  belt(b);
  b.restore();
  plaque(b);
  hullPath(b); // the outline once more over the plating
  line(b, '#0a0c16', 3.6);
}

// The hull's own lights: the sun's gold along the keel line and the lower flanks, a cool thread along the
// rail, the gallery windows already lit. Phase 2 burns the furnace through the belly, phase 3 adds the fires.
export function hullLights(l) {
  both((s) => {
    l.save();
    l.scale(s, 1);
    l.beginPath();
    l.moveTo(SIDE[5][0] - 1, SIDE[5][1] - 3);
    spline(l, SIDE.slice(5).map(([x, y]) => [x - 3, y - 3.4]));
    for (const [w, a] of [[7, 0.06], [3.4, 0.16], [1.4, 0.55]]) line(l, rgba('#ffc060', a), w);
    l.restore();
  });
  l.beginPath();
  l.moveTo(-228, sheer(-228) + 1.5);
  l.quadraticCurveTo(0, -16, 228, sheer(228) + 1.5);
  line(l, rgba('#cfc4ff', 0.34), 1.1);
  bloom(l, 0, 130, 90, FIRE, 0.06);
}

// The glows are kept to what the hull's canvas holds: nothing goes on past y 230.
export const rage = [null, (l) => {
  bloom(l, 0, 91, 84, FIRE, 0.36); // the door's light spilling over the plating round it
  bloom(l, 0, 128, 100, FIRE, 0.22);
  bloom(l, 0, 138, 64, WARM, 0.2);
  both((s) => bloom(l, s * 49, 106, 20, FIRE, 0.4)); // the vents
}, (l) => {
  bloom(l, 0, 91, 90, FIRE, 0.46);
  bloom(l, 0, 128, 100, FIRE, 0.3);
  bloom(l, 0, 138, 76, WARM, 0.26);
  both((s) => {
    bloom(l, s * 49, 106, 24, FIRE, 0.5);
    bloom(l, s * 190, 84, 80, FIRE, 0.18); // the guns' breaths
  });
}];
