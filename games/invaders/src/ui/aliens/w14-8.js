// World 14, Ember Carnival, the tin drummer's drum, arms and sticks (see w14-4.js): a cream lacquer snare
// drum on his belly with gilt hoops, red diamonds and zigzag cords, a sleeve and a tin hand on each side
// holding a stick; one stick is raised and the other on the drumhead on one beat, and the other way round on
// the next, a flash of light where the skin is struck.
import { path, ink, lin, rad, rgba, shade, bloom, gloss, line, ellipse, INK } from './w14-kit.js';
import { CREAM, RED, NAVY, GILT, HOT, SPARK, TIN, rivet, tinH, giltH, glint, halo } from './w14-kit.js';

const [TOP, BOT, RX, RY] = [2, 23, 18.5, 5.4]; // the drum: top skin and bottom hoop's centre lines, half-width, half-depth

// The drum seen from a little above: shell, diamonds, zigzag cords between two gilt hoops, the skin on top.
export function drum(b, l, f, c) {
  const shell = () => {
    b.beginPath();
    b.moveTo(-RX, TOP);
    b.lineTo(-RX, BOT);
    b.ellipse(0, BOT, RX, RY, 0, Math.PI, 0, true);
    b.lineTo(RX, TOP);
    b.closePath();
  };
  shell();
  ink(b, tinH(b, -RX, RX, CREAM), 3);
  b.save();
  shell();
  b.clip();
  for (let x = -RX + 3; x < RX; x += 7) { // red diamonds round the shell
    path(b, [[x, 10.4], [x + 3.4, 14.6], [x, 18.8], [x - 3.4, 14.6]]);
    b.fillStyle = rgba(RED, 0.92);
    b.fill();
    path(b, [[x, 12.2], [x + 1.6, 14.6], [x, 17], [x - 1.6, 14.6]]);
    b.fillStyle = rgba(GILT, 0.9);
    b.fill();
  }
  b.fillStyle = lin(b, -RX, 0, RX, 0, [[0, rgba('#000000', 0.42)], [0.25, rgba('#000000', 0)], [0.7, rgba('#000000', 0)], [1, rgba('#000000', 0.5)]]);
  b.fillRect(-RX - 1, TOP, RX * 2 + 2, BOT - TOP + RY + 1);
  b.restore();
  for (let x = -RX + 1.5; x < RX - 2; x += 5.6) { // the tension cords, a zigzag
    path(b, [[x, TOP + 3.4], [x + 2.8, BOT - 1], [x + 5.6, TOP + 3.4]], true);
    line(b, rgba('#7a4a22', 0.85), 0.9);
  }
  for (const y of [BOT - 0.4, TOP + 1]) { // the hoops
    b.beginPath();
    b.ellipse(0, y, RX + 0.6, RY + 0.6, 0, 0, Math.PI);
    line(b, INK, 4.6);
    line(b, giltH(b, -RX, RX), 2.8);
  }
  for (let x = -RX + 3; x < RX; x += 5.6) rivet(b, x, TOP + 5.4 + Math.abs(x) * 0.02, 0.7, GILT);
  ellipse(b, 0, TOP, RX, RY); // the skin
  ink(b, rad(b, 0, TOP, 1, RX, [[0, '#ffffff'], [0.7, CREAM], [1, shade(CREAM, -0.3)]], -5, TOP - 1.4), 3);
  ellipse(b, 0, TOP, RX - 3, RY - 1.6);
  line(b, rgba(NAVY, 0.5), 0.9);
  gloss(b, -7, TOP - 1.6, 6, 1.4, 0.5, -0.1);
  ellipse(l, 0, TOP + 0.4, RX - 2, RY - 1);
  l.fillStyle = rad(l, 0, TOP, 0, RX, [[0, rgba(c, 0.16)], [1, rgba(c, 0)]]);
  l.fill();
}

// A sleeve from the shoulder s through the elbow e to the wrist h: a coat-coloured tube with a highlight, a
// gilt button at the elbow, a cream cuff and a tin hand.
export function arm(b, s, e, h, c) {
  b.beginPath();
  b.moveTo(...s);
  b.lineTo(...e);
  b.lineTo(...h);
  line(b, INK, 8.4);
  line(b, c, 5.6);
  b.beginPath();
  b.moveTo(s[0] - 0.6, s[1] - 1);
  b.lineTo(e[0] - 0.6, e[1] - 1);
  b.lineTo(h[0] - 0.6, h[1] - 1);
  line(b, rgba('#ffffff', 0.3), 1.2);
  rivet(b, e[0], e[1], 1.5, GILT);
  ellipse(b, h[0], h[1], 3.7, 3.7);
  ink(b, rad(b, h[0], h[1], 0.4, 4, [[0, '#ffffff'], [0.5, CREAM], [1, shade(CREAM, -0.4)]], h[0] - 1, h[1] - 1), 1.5);
  ellipse(b, h[0], h[1], 2.3, 2.3);
  ink(b, rad(b, h[0], h[1], 0.2, 2.4, [[0, '#ffffff'], [0.6, TIN], [1, shade(TIN, -0.5)]]), 1);
}

// A drumstick from the hand (hx, hy) out to its tip (tx, ty): a pale wood shaft and a round cream head.
export function stick(b, hx, hy, tx, ty) {
  b.beginPath();
  b.moveTo(hx, hy);
  b.lineTo(tx, ty);
  line(b, INK, 4.4);
  line(b, '#f0d49a', 2.2);
  ellipse(b, tx, ty, 2.7, 2.7);
  ink(b, rad(b, tx, ty, 0.3, 3, [[0, '#ffffff'], [0.6, CREAM], [1, shade(CREAM, -0.4)]], tx - 0.8, ty - 0.8), 1.2);
}

// The sticks and arms for beat f: left stick raised and right on the skin on beat 0, the other way on beat 1.
export function sticks(b, l, f, c) {
  const down = (m) => (m < 0) === !f; // this side's stick is on the drumhead
  for (const m of [-1, 1]) {
    const hit = down(m);
    const s = [m * 18.6, -8];
    const e = [m * 29.6, hit ? 0.6 : -0.6];
    const h = hit ? [m * 21.4, -2.8] : [m * 29.4, -10.8];
    arm(b, s, e, h, c);
    if (hit) stick(b, h[0], h[1], m * 6.6, 1.2);
    else stick(b, h[0], h[1], m * 36, -29);
    if (hit) { // the strike
      bloom(l, m * 6.6, 1.2, 11, HOT, 0.8);
      glint(l, m * 6.6, 0.4, 3.4, SPARK, 0.95);
      halo(l, m * 6.6, 2, 3, 12, HOT, 0.4);
    } else {
      glint(l, m * 36, -29, 2.4, SPARK, 0.5);
    }
  }
}
