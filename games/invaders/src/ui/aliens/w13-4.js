// World 13, Sunset Armada, the ironclad gunboat (see w13.js): a riveted iron hull with brass trim and a
// ram, three gun ports with their lids open and furnace light behind the cannon, a casemate with a slit
// where a captain's eyes glow, a smokestack that puffs, and two small canvas balloons that lift it. It is
// the one that is hurt and lives: cracks.js splits its plates, with the furnace showing in the cracks.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { BRASS, GOLD, HOT, AETHER, brass, brassV, rope, rivet, sunlit, glint } from './w13-kit.js';
import { balloon, stack, smoke } from './w13-5.js';

// The hull seen bow on from above: a wide shoulder at the deck, narrowing to the ram.
function hull(g) {
  g.beginPath();
  g.moveTo(-37, 0);
  g.lineTo(37, 0);
  g.quadraticCurveTo(41, 15, 26, 29);
  g.quadraticCurveTo(13, 35, 0, 45.5);
  g.quadraticCurveTo(-13, 35, -26, 29);
  g.quadraticCurveTo(-41, 15, -37, 0);
  g.closePath();
}

// A gun port at (x, y) w wide: a brass frame round a dark hole, its lid propped open above, a cannon's
// mouth in it with the furnace burning behind (lights: bright on the beat it fires).
function port(b, l, x, y, w, k, c) {
  const h = w * 0.76;
  path(b, [[x - w / 2 - 1, y - h / 2 - 3.6], [x + w / 2 + 1, y - h / 2 - 3.6], [x + w / 2 - 0.4, y - h / 2 - 0.4], [x - w / 2 + 0.4, y - h / 2 - 0.4]]);
  ink(b, lin(b, 0, y - h / 2 - 4, 0, y - h / 2, [[0, shade(c, 0.4)], [1, shade(c, -0.4)]]), 1.4); // the lid
  b.beginPath();
  b.roundRect(x - w / 2 - 1.2, y - h / 2 - 1.2, w + 2.4, h + 2.4, 2);
  ink(b, brass(b, x - w / 2, x + w / 2), 1.8);
  b.beginPath();
  b.roundRect(x - w / 2 + 0.8, y - h / 2 + 0.8, w - 1.6, h - 1.6, 1.4);
  b.fillStyle = '#0a0a12';
  b.fill();
  ellipse(b, x, y + 0.4, w * 0.36, w * 0.36); // the cannon, head on: an iron ring, a brass band and the bore
  ink(b, rad(b, x, y, 0.6, w * 0.4, [[0, shade(c, 0.5)], [1, shade(c, -0.55)]], x - 1, y - 1.4), 1.3);
  ellipse(b, x, y + 0.4, w * 0.25, w * 0.25);
  line(b, BRASS, 0.9);
  ellipse(b, x, y + 0.6, w * 0.16, w * 0.16);
  b.fillStyle = '#05050a';
  b.fill();
  for (const px of [x - w / 2 - 0.4, x + w / 2 + 0.4]) rivet(b, px, y - h / 2 - 0.6, 0.8);
  ellipse(l, x, y + 0.6, w * 0.15, w * 0.15);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rgba(HOT, 0.4 + k * 0.6);
  l.fill();
  l.restore();
  bloom(l, x, y + 0.6, w * (0.7 + k * 0.5), HOT, 0.25 + k * 0.6);
  ellipse(l, x, y + 0.4, w * 0.25, w * 0.25);
  l.strokeStyle = rgba(HOT, 0.2 + k * 0.7);
  l.lineWidth = 1;
  l.stroke();
  if (k > 0.5) glint(l, x, y + 0.6, 2.6, '#fff0c0', 0.9);
}

// An ironclad gunboat: the broadside rolls across the beats (the outer guns glow on one, the great gun on
// the other), the stack puffs, the balloons bob and the captain's eyes glow in his slit.
export function armored(b, l, f, c) {
  for (const g of [b, l]) {
    g.save();
    g.scale(0.96, 0.96); // a touch smaller, so the ram and the smoke stay inside the sprite
  }
  const bob = f ? -1.5 : 1.5;
  for (const m of [-1, 1]) { // the balloons, and the ropes that hold them to the deck
    rope(b, m * 29.4, -6.4 + bob, m * 31, -1, m * -0.8, 0, 0.9);
    rope(b, m * 32.6, -6.4 + bob, m * 35, -1, m * 0.8, 0, 0.9);
    balloon(b, l, m * 31, -18.4 + bob, m * (f ? 0.06 : -0.06), m);
  }
  stack(b, l, f, c);
  smoke(b, f);
  hull(b);
  ink(b, lin(b, -40, 0, 40, 0, [[0, shade(c, 0.1)], [0.35, shade(c, 0.28)], [0.7, c], [1, shade(c, -0.5)]]), 3);
  b.save();
  hull(b);
  b.clip();
  b.fillStyle = lin(b, 0, 0, 0, 46, [[0, rgba('#ffffff', 0.18)], [0.5, rgba('#000000', 0)], [1, rgba('#1a1030', 0.4)]]);
  b.fillRect(-42, 0, 84, 46);
  for (const [i, y] of [8, 21, 31].entries()) { // courses of plates, rivets and staggered joints
    b.beginPath();
    b.moveTo(-44, y);
    b.quadraticCurveTo(0, y + 3, 44, y);
    line(b, rgba('#000000', 0.5), 1.3);
    b.beginPath();
    b.moveTo(-44, y + 1.2);
    b.quadraticCurveTo(0, y + 4.2, 44, y + 1.2);
    line(b, rgba('#ffffff', 0.22), 0.8);
    const y2 = [8, 21, 31, 40][i + 1];
    for (let x = -42 + (i % 2) * 7; x < 44; x += 14) {
      b.beginPath();
      b.moveTo(x * (1 - i * 0.04), y + 2);
      b.lineTo(x * (1 - (i + 1) * 0.04), y2 + 2);
      line(b, rgba('#000000', 0.38), 1);
    }
    for (let x = -35; x <= 35; x += 7) if (Math.abs(x) > 3) rivet(b, x * (1 - i * 0.04), y + 3 + 1.5 * Math.cos(x / 22), 1, c);
  }
  b.fillStyle = lin(b, 0, 0, 0, 12, [[0, rgba('#000000', 0)], [1, rgba('#000000', 0.38)]]); // soot streaks down from the ports
  for (const x of [-22, 0, 22]) b.fillRect(x - 5, 9, 10, 12);
  for (const [x, y] of [[-14, 15], [13, 27], [-26, 26]]) { // rust weeping from the rivets
    b.fillStyle = lin(b, 0, y, 0, y + 9, [[0, rgba('#b0643a', 0.34)], [1, rgba('#b0643a', 0)]]);
    b.fillRect(x, y, 1.6, 9);
  }
  for (const [x, y, r] of [[-30, 17, 3.6], [17.6, 22.6, 2.8]]) { // dents: shaded on the top left, lit on the lower right
    ellipse(b, x, y, r, r * 0.8);
    b.fillStyle = rad(b, x, y, 0, r, [[0, rgba('#000000', 0.12)], [0.7, rgba('#000000', 0.34)], [1, rgba('#000000', 0)]], x + r * 0.4, y + r * 0.3);
    b.fill();
    b.beginPath();
    b.ellipse(x, y, r, r * 0.8, 0, 0.1, 1.5);
    line(b, rgba('#ffffff', 0.55), 1);
  }
  sunlit(b, 16, 46, 0.5);
  b.restore();
  path(b, [[-12, 34], [12, 34], [0, 46.4]]); // the ram
  ink(b, brass(b, -12, 12), 2.2);
  path(b, [[-6, 38], [0, 43]], true);
  line(b, rgba('#ffffff', 0.6), 1.2);
  path(b, [[-39, -2.6], [39, -2.6], [38.2, 4.2], [-38.2, 4.2]]); // the brass gunwale
  ink(b, brassV(b, -3, 4.4), 2);
  for (let x = -34; x <= 34; x += 8.5) rivet(b, x, 0.8, 1, BRASS);
  port(b, l, -22, 14, 12, f ? 0 : 1, c);
  port(b, l, 0, 14, 15, f ? 1 : 0.1, c);
  port(b, l, 22, 14, 12, f ? 0 : 1, c);
  path(b, [[-19, -2], [19, -2], [13, -17], [-13, -17]]); // the casemate
  ink(b, lin(b, -19, 0, 19, 0, [[0, shade(c, 0.35)], [0.5, c], [1, shade(c, -0.55)]]), 2.6);
  path(b, [[-13, -17], [13, -17], [14.2, -14.4], [-14.2, -14.4]]);
  ink(b, brassV(b, -17, -14), 1.5);
  both((m) => {
    path(b, [[m * 14, -3], [m * 9.8, -15]], true);
    line(b, rgba('#ffffff', 0.25), 1);
    rivet(b, m * 15.6, -5.4, 0.95, c);
    rivet(b, m * 11.6, -12.6, 0.95, c);
  });
  path(b, [[10, -16], [10, -31]], true); // a pennant mast on the roof, and the ship's bell
  line(b, INK, 2.2);
  line(b, shade(c, 0.3), 0.9);
  b.beginPath();
  b.moveTo(10.4, -30.8);
  b.quadraticCurveTo(14, -31.8 + f * 1.4, f ? 16.8 : 17.6, f ? -28 : -30);
  b.quadraticCurveTo(14, -28.2, 10.4, -27.6);
  b.closePath();
  ink(b, '#ff7a4a', 1.2);
  path(b, [[-12, -17], [-7, -17], [-7.6, -20.6], [-8.4, -22.4], [-10.6, -22.4], [-11.4, -20.6]]);
  ink(b, brass(b, -12, -7), 1.4);
  ellipse(b, -9.5, -17.2, 1, 0.9);
  b.fillStyle = INK;
  b.fill();
  b.beginPath(); // the captain's slit, with a lit brow
  b.roundRect(-8.4, -11.4, 16.8, 4.2, 1.4);
  ink(b, '#06060c', 1.5);
  both((m) => {
    ellipse(l, m * 2.8, -9.2, 0.9, 0.9);
    l.save();
    l.globalCompositeOperation = 'lighter';
    l.fillStyle = rgba(GOLD, 1);
    l.fill();
    l.restore();
    bloom(l, m * 2.8, -9.2, 5, HOT, 0.6);
  });
  gloss(b, -8, -13, 6, 1.6, 0.4, -0.1);
  both((m) => { // aether lamps at the bow corners
    ellipse(b, m * 35, 7, 2.5, 3);
    ink(b, rad(b, m * 35, 7, 0.3, 3.4, [[0, '#e6fdff'], [0.5, '#37b8d6'], [1, '#0a3c58']]), 1.5);
    eye(l, m * 35, 7, 1.1, AETHER, 4);
  });
  bloom(l, 0, 12, 40, c, 0.08);
  for (const g of [b, l]) g.restore();
}
