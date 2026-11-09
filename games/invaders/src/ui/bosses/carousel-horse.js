// A carved carousel horse (World 14, Ember Carnival; the Grand Carousel, carousel.js): gilded wood, mid-leap,
// facing left, drawn centred on (0, 0) about 112 px long and 90 tall. Magenta mane and tail, a cream saddle
// blanket with a magenta seat, a bridle and a breast collar with a jewel; muscles are cut as dark arcs.
// carousel-pole.js stands it on its brass pole (the armour part, mirrored for the right flank) and the live
// pass draws the same horse smaller and darker as the back riders (`far`: no lights, no detail).
import { path, ink, line, lin, rad, rgba, shade, ellipse, eye, bloom } from './kit.js';
import { spline } from './galleon-kit.js';
import { GILT, GILT_L, GILT_DD, STRIPE, STRIPE_D, CREAM, CREAM_D, INK, circle, stud } from './carousel-kit.js';

const BODY = [[-68, -19], [-63, -26], [-54, -34], [-46, -41], [-40, -46], [-33, -42], [-25, -35], [-17, -27], [-11, -18], [0, -14], [14, -14], [26, -12], [36, -10], [43, -3], [43, 6], [34, 15], [20, 17], [6, 18], [-10, 18], [-20, 15], [-28, 8], [-32, -2], [-33, -14], [-34, -26], [-42, -24], [-52, -18], [-62, -14], [-67, -14], [-69, -17]];
const CREST = [[-38, -43], [-31, -39], [-24, -33], [-17, -26], [-11, -18]]; // where the mane grows

const gilt = (g, c, far) => lin(g, 0, -44, 0, 36, [[0, shade(c, far ? 0.05 : 0.6)], [0.4, shade(c, far ? -0.15 : 0.1)], [1, shade(c, far ? -0.5 : -0.5)]]);

// A leg as a jointed limb: a thick stroke through its joints with a hoof at the end.
function leg(b, pts, c, far) {
  path(b, pts, true);
  line(b, INK, 9.4);
  line(b, shade(c, far ? -0.5 : -0.3), 6.6);
  path(b, pts, true);
  line(b, shade(c, far ? -0.3 : 0.3), 3.2);
  const [x, y] = pts.at(-1);
  path(b, [[x - 4, y - 2], [x + 4, y - 2], [x + 5, y + 4], [x - 5, y + 4]]);
  ink(b, far ? shade(GILT_DD, 0) : '#3a2008', 1.4);
  path(b, [[x - 3.6, y - 1], [x + 3.6, y - 1]], true);
  line(b, rgba(GILT_L, far ? 0.15 : 0.6), 0.9);
}

// The tail: a plume of magenta streaming back and down, cut with flow lines, tipped in cream.
function tail(b, far) {
  const pts = [[41, -6], [52, -9], [62, -1], [66, 12], [63, 27], [55, 38], [58, 24], [54, 12], [46, 6]];
  b.beginPath();
  b.moveTo(...pts[0]);
  spline(b, pts);
  b.closePath();
  ink(b, lin(b, 40, -8, 66, 38, [[0, shade(STRIPE, far ? -0.5 : 0.1)], [1, shade(STRIPE_D, far ? -0.4 : 0)]]), 2.6);
  if (far) return;
  for (const [x0, y0, x1, y1] of [[46, -5, 58, 4], [50, -2, 60, 14], [52, 4, 59, 26], [54, 12, 57, 33]]) {
    b.beginPath();
    b.moveTo(x0, y0);
    b.quadraticCurveTo(x1 + 3, y0 + 8, x1, y1);
    line(b, rgba(CREAM, 0.7), 1);
  }
}

// The mane: locks of magenta streaming back from the crest like flame, each lit along its edge, and a forelock.
function mane(b, far) {
  CREST.forEach(([x, y], i) => {
    b.beginPath();
    b.moveTo(x - 4, y + 4);
    b.quadraticCurveTo(x + 1, y - 13, x + 14, y - 8 + i);
    b.quadraticCurveTo(x + 6, y - 4, x + 5, y + 6);
    b.closePath();
    ink(b, lin(b, x, y - 12, x + 10, y + 6, [[0, shade(STRIPE, far ? -0.4 : 0.3)], [1, shade(STRIPE_D, far ? -0.3 : 0)]]), 1.8);
    if (far) return;
    b.beginPath();
    b.moveTo(x - 1, y + 1);
    b.quadraticCurveTo(x + 3, y - 9, x + 11, y - 7 + i);
    line(b, rgba(CREAM, 0.75), 1);
  });
  b.beginPath(); // the forelock
  b.moveTo(-45, -42);
  b.quadraticCurveTo(-52, -50, -49, -56);
  b.quadraticCurveTo(-43, -50, -41, -43);
  b.closePath();
  ink(b, STRIPE, 1.4);
}

// Bridle, bit and reins, breast collar with its jewel, and the saddle: blanket, seat and tassels.
function harness(b, l) {
  b.beginPath(); // headstall, cheek strap, noseband
  b.moveTo(-46, -41);
  b.quadraticCurveTo(-47, -30, -46, -21);
  b.moveTo(-61, -28);
  b.quadraticCurveTo(-56, -22, -55, -17);
  b.moveTo(-50, -37);
  b.quadraticCurveTo(-57, -33, -62, -27);
  line(b, INK, 3.6);
  line(b, STRIPE, 2);
  stud(b, -46, -22, 1.7);
  stud(b, -46, -36, 1.5);
  stud(b, -58, -25, 1.5);
  b.beginPath(); // reins, drooping to the saddle
  b.moveTo(-66, -15);
  b.quadraticCurveTo(-42, 8, -8, -11);
  line(b, INK, 2.8);
  line(b, GILT_L, 1.2);
  b.beginPath(); // blanket: it follows the back and hangs in four scallops, trimmed in magenta
  b.moveTo(-9, -15);
  b.lineTo(21, -15);
  b.lineTo(24, 6);
  for (let i = 0; i < 4; i++) b.quadraticCurveTo(24 - i * 8.25 - 4.1, 12, 24 - (i + 1) * 8.25, 6);
  b.closePath();
  ink(b, lin(b, 0, -15, 0, 12, [[0, CREAM], [1, CREAM_D]]), 1.8);
  for (let i = 0; i < 4; i++) { // a magenta diamond in each scallop
    const x = 20 - i * 8.25;
    path(b, [[x, 1], [x + 3.4, 5], [x, 9], [x - 3.4, 5]]);
    b.fillStyle = i % 2 ? STRIPE : STRIPE_D;
    b.fill();
  }
  b.beginPath();
  b.moveTo(-9, -12);
  b.lineTo(22, -12);
  line(b, STRIPE, 2.2);
  b.beginPath(); // the seat
  b.moveTo(-8, -15);
  b.quadraticCurveTo(6, -23, 20, -15);
  b.lineTo(15, -11);
  b.quadraticCurveTo(6, -16, -3, -11);
  b.closePath();
  ink(b, lin(b, 0, -23, 0, -11, [[0, shade(STRIPE, 0.3)], [1, STRIPE_D]]), 1.8);
  stud(b, 6, -17.4, 1.6);
  for (const x of [22, 6, -8]) stud(b, x, -1, 1.2, GILT);
  b.beginPath();
  b.moveTo(-29, 6); // the breast collar: a chain with a jewel
  b.quadraticCurveTo(-24, 15, -10, 15);
  line(b, INK, 3);
  line(b, GILT, 1.6);
  circle(b, -30, 2, 4.2);
  ink(b, rad(b, -30, 2, 0, 4.2, [[0, '#fff0f8'], [0.5, '#ff5aa0'], [1, '#7a1048']], -31, 1), 1.4);
  l.beginPath();
  l.arc(-30, 2, 3, 0, 6.3);
  l.fillStyle = rgba('#ff9ad0', 0.6);
  l.fill();
  bloom(l, -30, 2, 10, '#ff9ad0', 0.5);
}

// The horse. `far` paints it plain and dark for the back riders; `l` is the lights layer (or null).
export function horseBody(b, l, c = GILT, far = false) {
  const pale = far ? 0 : 1;
  leg(b, [[-20, 10], [-31, 21], [-25, 31]], c, true); // the far legs, behind the body
  leg(b, [[26, 9], [37, 22], [35, 33]], c, true);
  tail(b, far);
  b.beginPath();
  b.moveTo(...BODY[0]);
  spline(b, BODY, true);
  b.closePath();
  ink(b, gilt(b, c, far), 3);
  b.save();
  b.clip();
  if (pale) { // muscles cut into the wood: shoulder, hip, belly, cheek
    for (const [x0, y0, x1, y1, cx, cy] of [[-24, -14, -22, 12, -34, -2], [26, -10, 24, 14, 36, 4], [-8, 14, 22, 14, 6, 10], [-58, -30, -46, -22, -52, -22]]) {
      b.beginPath();
      b.moveTo(x0, y0);
      b.quadraticCurveTo(cx, cy, x1, y1);
      line(b, rgba(GILT_DD, 0.42), 1.6);
      b.translate(1.2, 1);
      b.beginPath();
      b.moveTo(x0, y0);
      b.quadraticCurveTo(cx, cy, x1, y1);
      line(b, rgba('#ffffff', 0.32), 0.9);
      b.translate(-1.2, -1);
    }
  }
  b.fillStyle = lin(b, 0, 4, 0, 18, [[0, rgba(GILT_DD, 0)], [1, rgba(GILT_DD, far ? 0.3 : 0.55)]]);
  b.fillRect(-64, 4, 110, 16);
  b.restore();
  leg(b, [[-24, 8], [-42, 14], [-40, 26]], c, far); // the near foreleg, pawing
  leg(b, [[32, 6], [48, 20], [52, 31]], c, far); // the near hind leg, stretched back
  path(b, [[-44, -44], [-42, -56], [-37, -45]]); // an ear
  ink(b, shade(c, far ? -0.35 : 0.15), 1.6);
  mane(b, far);
  if (far) return;
  harness(b, l ?? b);
  ellipse(b, -49, -35, 2.6, 2); // the eye
  ink(b, '#1a0a30', 1.2);
  ellipse(b, -66, -19, 1.4, 2); // a nostril
  b.fillStyle = INK;
  b.fill();
  if (l) {
    eye(l, -49.6, -35.4, 1.4, '#fff6d0', 3.4);
    bloom(l, 0, -4, 70, '#ffb04a', 0.07);
  }
}
