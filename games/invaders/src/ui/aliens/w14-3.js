// World 14, Ember Carnival, the jack-in-the-box turret (see w14.js): a gilded tin box printed with navy
// panels and stars, a red ribbon round its middle, marquee bulbs along its top and a crank on its side,
// hanging over the ship. Its doors are ajar on one beat, eyes glinting in the gap; on the other they are
// flung wide and the jester springs out on his coil, his mouth a flash of fire. The doors, spring, head and
// crank are in w14-7.js.
import { path, ink, lin, rgba, shade, bloom, gloss, line, ellipse, both } from './w14-kit.js';
import { CREAM, RED, NAVY, GILT, HOT, rivet, star5, stripes, tinV, giltH, bulb, puff, glint } from './w14-kit.js';
import { doors, coil, head, crank, muzzle } from './w14-7.js';

const BOX = [[-24, -33], [24, -33], [24, 2], [-24, 2]];

// The box's front: gilt tin shaded top to bottom, side panels printed navy with a cream star and a stripe
// border, a ribbon across the middle, brass corner brackets and rivets.
function box(b, c) {
  path(b, BOX);
  ink(b, tinV(b, -33, 2, c), 3);
  b.save();
  path(b, BOX);
  b.clip();
  both((m) => {
    path(b, [[m * 12.4, -16.6], [m * 21, -16.6], [m * 21, -2], [m * 12.4, -2]]); // a printed panel
    ink(b, lin(b, 0, -17, 0, -2, [[0, shade(NAVY, 0.25)], [1, shade(NAVY, -0.4)]]), 1.4);
    b.save();
    path(b, [[m * 12.4, -16.6], [m * 21, -16.6], [m * 21, -2], [m * 12.4, -2]]);
    b.clip();
    stripes(b, m > 0 ? 12.4 : -21, -17, m > 0 ? 21 : -12.4, -2, 4.4, 1.4, rgba(c, 0.5), 0.5);
    b.restore();
    star5(b, m * 16.7, -9.4, 3.6, CREAM);
  });
  for (let i = 0; i < 6; i++) { // a scalloped awning under the lid, red and cream
    const x0 = -24 + i * 8;
    b.beginPath();
    b.moveTo(x0, -33);
    b.lineTo(x0 + 8, -33);
    b.lineTo(x0 + 8, -30.4);
    b.arc(x0 + 4, -30.4, 4, 0, Math.PI);
    b.lineTo(x0, -30.4);
    b.closePath();
    b.fillStyle = lin(b, 0, -33, 0, -26, [[0, i % 2 ? '#ffffff' : shade(RED, 0.3)], [1, i % 2 ? shade(CREAM, -0.25) : shade(RED, -0.35)]]);
    b.fill();
    line(b, rgba(NAVY, 0.65), 0.9);
  }
  b.fillStyle = lin(b, 0, -23, 0, -17.6, [[0, shade(RED, 0.35)], [0.5, RED], [1, shade(RED, -0.5)]]); // the ribbon
  b.fillRect(-25, -23, 50, 5.6);
  path(b, [[-25, -23], [25, -23]], true);
  line(b, rgba('#ffffff', 0.45), 0.8);
  for (let x = -22; x <= 22; x += 6) star5(b, x, -20.2, 1.4, rgba(CREAM, 0.9));
  b.fillStyle = lin(b, -24, 0, 24, 0, [[0, rgba('#000000', 0.38)], [0.16, rgba('#000000', 0)], [0.8, rgba('#000000', 0)], [1, rgba('#000000', 0.5)]]);
  b.fillRect(-25, -34, 50, 37);
  b.restore();
  path(b, [[-24, -33], [24, -33], [26, -37], [-26, -37]]); // the lid's trim
  ink(b, giltH(b, -26, 26), 2.4);
  for (const x of [-18, -6, 6, 18]) rivet(b, x, -35, 0.9, GILT);
  both((m) => { // brass brackets on the bottom corners
    path(b, [[m * 24, -7], [m * 17, 2], [m * 24, 2]]);
    ink(b, giltH(b, 17, 24), 1.5);
    rivet(b, m * 21.6, -0.6, 0.8, GILT);
  });
  gloss(b, -14, -29, 8, 1.8, 0.5, 0);
}

// The bulbs along the box's lid, every other one lit on each beat so they seem to chase.
function marquee(b, l, f) {
  [-21, -14, -7, 7, 14, 21].forEach((x, i) => { // the middle of the lid is left clear, where a shell's fuse stands
    const on = (i + f) % 2 === 0;
    bulb(b, l, x, -39, on ? 2.5 : 2.3, on ? HOT : '#8a5a2a', on ? 1 : 0.15);
  });
}

// A jack-in-the-box turret: shut and peeking on beat 0, sprung out and firing on beat 1.
export function gunner(b, l, f, c) {
  const col = '#ffc233';
  box(b, col);
  doors(b, f, col);
  if (f) coil(b, f);
  else { // eyes in the dark gap, the spring coiled under them
    coil(b, f);
    ellipse(b, -2.2, -11, 1.5, 1.2);
    ellipse(b, 2.2, -11, 1.5, 1.2);
    b.fillStyle = '#ffffff';
    b.fill();
  }
  crank(b, l, f);
  marquee(b, l, f);
  if (f) {
    puff(b, -13, 17, 3.2);
    puff(b, 14, 20, 2.6);
    for (const g of [b, l]) { // the head sits a little higher on its coil so that its fire is all on the canvas
      g.save();
      g.translate(0, -3);
    }
    head(b, l, f, c);
    muzzle(l, 0, 41);
    for (const g of [b, l]) g.restore();
  }
  if (!f) {
    bloom(l, 0, -9, 8, HOT, 0.55);
    for (const m of [-1, 1]) bloom(l, m * 2.2, -11, 3.4, HOT, 0.9);
  } else {
    bloom(l, 0, 6, 10, HOT, 0.45);
  }
  glint(l, -18, -30, 3, '#fff6d0', 0.7);
  bloom(l, 0, -6, 38, col, 0.1);
}
