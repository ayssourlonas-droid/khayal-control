// The Grand Carousel's carved horse on its pole (World 14, Ember Carnival; see carousel.js): an armour part
// 130 x 140 for the hit box, drawn once as the left one, facing out, and mirrored for the right. A brass
// barley-twist pole stands on a flange on the floor, carries a gilt ball above (its pennant is live, carousel-fx.js), and runs
// through the horse (rings at the back and the belly); the horse itself is carousel-horse.js, set a little
// low so its ears stay under the canopy's valance.
import { ink, line, rad, rgba, ellipse, eye, bloom } from './kit.js';
import { GILT, GILT_L, GILT_D, INK, giltX, giltV, twist, stud, circle } from './carousel-kit.js';
import { horseBody } from './carousel-horse.js';

export const POLE = 3; // the pole's x in the part's frame
export const DROP = 12; // how far the horse hangs below the part's middle

function ring(b, y) {
  ellipse(b, POLE, y, 6.6, 2.5);
  b.fillStyle = giltX(b, POLE - 7, POLE + 7);
  b.fill();
  line(b, INK, 1.6);
}

export function horse(b, l, p) {
  const bot = p.h / 2 - 8; // the flange stands this far down
  twist(b, POLE, -60, bot, 7, GILT);
  circle(b, POLE, -64.4, 4.6); // the ball on top
  ink(b, rad(b, POLE, -64.4, 0, 4.6, [[0, '#ffffff'], [0.4, GILT_L], [1, GILT_D]], POLE - 1.4, -66), 1.6);
  ellipse(b, POLE, bot + 2, 17, 5); // the flange on the floor, studded
  b.fillStyle = giltV(b, bot - 3, bot + 7);
  b.fill();
  line(b, INK, 2.2);
  for (const dx of [-11, -4, 4, 11]) stud(b, POLE + dx, bot + 2.6, 1.4);
  for (const g of [b, l]) {
    g.save();
    g.translate(0, DROP);
  }
  horseBody(b, l, GILT, false);
  b.restore();
  l.restore();
  ring(b, DROP - 14.4);
  ring(b, DROP + 18.4);
  eye(l, POLE, -64.4, 2.4, '#fff0b0', 4);
  bloom(l, POLE + 12, -57, 14, '#ff9ad0', 0.22);
  l.beginPath(); // a gleam along the pole
  l.moveTo(POLE - 1.6, -56);
  l.lineTo(POLE - 1.6, -20);
  line(l, rgba('#fff0b0', 0.4), 1);
}
