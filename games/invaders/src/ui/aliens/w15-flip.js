// World 15, Lantern Deep, the sea turtle's body (see w15-5.js): four paddle flippers with scaled skin and a
// claw at the tip, paddling in turn (on one beat the left front flipper strokes up and the right pushes
// down, on the next the other way round, the rear pair opposite); a short pointed tail; and the head, seen
// from the front: a round green head with a hooked beak, a smiling mouth line and big glossy eyes under
// heavy lids tilted up toward the middle, a friendly but wary look; the eyes glance to one side and then
// the other. The shell is in w15-9.js, the chest and lantern in w15-chest.js.
import { path, ink, lin, rad, rgba, shade, bloom, line, ellipse, circle, gloss, INK } from './w15-kit-2.js';

// A flipper rooted at (x, y), side m (1 right, -1 left), stroking at ang (radians, down is positive), len px
// long, k as wide as the standard one: a paddle with its leading edge lit, rows of scales and a dark claw.
export function flipper(b, x, y, m, ang, len, k, c, l = null) {
  for (const g of l ? [b, l] : [b]) {
    g.save();
    g.translate(x, y);
    g.scale(m, 1);
    g.rotate(ang);
    g.scale(len / 30, k);
  }
  const shape = () => {
    b.beginPath();
    b.moveTo(-1, -5.4);
    b.bezierCurveTo(10, -10, 22, -8, 30, 1.6);
    b.bezierCurveTo(22, 4.6, 12, 9.6, -1, 6.4);
    b.closePath();
  };
  shape();
  ink(b, lin(b, 0, -9, 0, 8, [[0, shade(c, 0.4)], [0.35, c], [1, shade(c, -0.5)]]), 2.4 / k);
  b.save();
  shape();
  b.clip();
  for (let i = 0; i < 5; i++) { // rows of scales
    for (let j = -1; j <= 1; j++) {
      b.beginPath();
      b.arc(5.5 + i * 4.8 + (j & 1) * 2.4, j * 3.4 + 0.8 + i * 0.1, 2.1 - i * 0.18, 0.2, Math.PI - 0.2);
      line(b, rgba(shade(c, -0.6), 0.45), 0.8);
    }
  }
  b.beginPath();
  b.moveTo(0, -6.4);
  b.bezierCurveTo(11, -9.6, 21, -7.4, 28, 0.4);
  line(b, rgba('#ffffff', 0.4), 1.2);
  b.restore();
  path(b, [[27.6, 0.2], [32.6, 2.2], [28.4, 3.6]]); // the claw
  ink(b, shade(c, -0.6), 1);
  if (l) for (const [px, py, r] of [[8, -3.4, 1.2], [13.6, -3.8, 1.1], [19, -2.8, 1], [24, -1, 0.9]]) bloom(l, px, py, r * 2.6, '#9affe0', 0.3); // a row of glowing spots along the leading edge
  for (const g of l ? [b, l] : [b]) g.restore();
}

// The tail: a short tapering wedge behind the top of the shell.
export function tail(b, c) {
  b.beginPath();
  b.moveTo(-5.4, -23);
  b.quadraticCurveTo(-3.6, -30, -0.4, -34.4);
  b.quadraticCurveTo(3.6, -30, 5.4, -23);
  b.closePath();
  ink(b, lin(b, -5, 0, 5, 0, [[0, shade(c, -0.45)], [0.4, shade(c, 0.02)], [1, shade(c, -0.55)]]), 2.4);
  path(b, [[-1.2, -25], [-0.6, -31]], true);
  line(b, rgba('#ffffff', 0.25), 0.9);
}

// An eye at (x, y) on side m looking `look` px to the side: a glossy eyeball, a pupil, a heavy lid tilted up
// toward the middle of the face, a gleam. The lights get a pinprick of gleam.
function eyeball(b, l, x, y, m, look, c) {
  b.save();
  circle(b, x, y, 3.6);
  b.clip();
  b.fillStyle = rad(b, x, y, 0.4, 4.2, [[0, '#ffffff'], [0.7, '#e4f4e8'], [1, '#8ab89a']], x - 1, y - 1);
  b.fillRect(x - 4, y - 4, 8, 8);
  circle(b, x + look, y + 0.6, 2.1);
  b.fillStyle = '#12281c';
  b.fill();
  circle(b, x + look - 0.7, y - 0.2, 0.8);
  b.fillStyle = '#ffffff';
  b.fill();
  path(b, [[x - 4.2, y - 4.2], [x + 4.2, y - 4.2], [x + 4.2, y - (m > 0 ? 0.4 : 2.6)], [x - 4.2, y - (m > 0 ? 2.6 : 0.4)]]);
  b.fillStyle = shade(c, -0.18);
  b.fill();
  b.restore();
  circle(b, x, y, 3.6);
  line(b, INK, 1.1);
  l.save();
  l.globalCompositeOperation = 'lighter';
  circle(l, x + look - 0.7, y - 0.2, 0.9);
  l.fillStyle = rgba('#d8fff0', 0.5);
  l.fill();
  l.restore();
}

// The neck for beat f, wrinkled, drawn under the shell so only what shows below its rim is seen.
export function neck(b, f, c) {
  const dy = f ? 0.7 : -0.7;
  ellipse(b, 0, 21 + dy * 0.5, 8.4, 7.4);
  ink(b, rad(b, 0, 21 + dy * 0.5, 1, 9, [[0, c], [1, shade(c, -0.4)]], 0, 18), 2.2);
  for (const y of [18.6, 21.4]) {
    b.beginPath();
    b.moveTo(-5.6, y + dy * 0.3);
    b.quadraticCurveTo(0, y + 1.8, 5.6, y + dy * 0.3);
    line(b, rgba(shade(c, -0.7), 0.45), 0.9);
  }
}

// The head for beat f: head, beak, cheeks, mouth, eyes.
export function head(b, l, f, c) {
  const dy = f ? 0.7 : -0.7;
  const look = f ? 1 : -1;
  ellipse(b, 0, 24 + dy, 10, 9.4);
  ink(b, rad(b, 0, 24 + dy, 1, 13, [[0, shade(c, 0.5)], [0.5, c], [1, shade(c, -0.3)]], -3, 20 + dy), 2.6);
  b.beginPath(); // the hooked beak, pale horn
  b.moveTo(-3.4, 29.4 + dy);
  b.quadraticCurveTo(0, 28 + dy, 3.4, 29.4 + dy);
  b.quadraticCurveTo(2.6, 33 + dy, 0.9, 35 + dy);
  b.quadraticCurveTo(0, 36 + dy, -0.9, 35 + dy);
  b.quadraticCurveTo(-2.6, 33 + dy, -3.4, 29.4 + dy);
  b.closePath();
  ink(b, rad(b, 0, 32 + dy, 0.5, 5, [[0, '#f4f2c8'], [1, '#98986a']], -0.8, 30.4 + dy), 1.3);
  for (const m of [-1, 1]) {
    ellipse(b, m * 6.6, 28.2 + dy, 2.5, 1.7);
    b.fillStyle = rgba(shade(c, 0.5), 0.5);
    b.fill();
    b.beginPath(); // the mouth line, a small smile back from the beak
    b.moveTo(m * 3.2, 31 + dy);
    b.quadraticCurveTo(m * 6.4, 32.4 + dy, m * 8.6, 29 + dy);
    line(b, rgba('#07201e', 0.7), 0.9);
    ellipse(b, m * 0.9, 31 + dy, 0.45, 0.6);
    b.fillStyle = '#4a4a2a';
    b.fill();
  }
  for (const m of [-1, 1]) eyeball(b, l, m * 4.9, 22.4 + dy, m, look * 0.9, c);
  gloss(b, -4, 19 + dy, 4.2, 1.7, 0.4, -0.3);
}
