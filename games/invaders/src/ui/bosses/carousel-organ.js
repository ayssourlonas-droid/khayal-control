// The Grand Carousel's band organ (World 14, Ember Carnival; see carousel.js): a weak part 170 x 100 for the
// hit box, the carousel's heart. A gilt case with an arched, scrolled crest holds a mountain of eleven gilt
// pipes whose mouths burn cyan; in front of the middle of them hangs the sunburst medallion with its cyan
// lens (carousel-organ-front.js), a ledge of keys runs along the foot, and a bass drum and a cymbal stand at
// the corners. Cyan is the weak point: pipe mouths, keys, the lens. The pipes pulse and breathe steam live
// (carousel-fx.js reads PIPES).
import { path, ink, line, lin, rgba, ellipse, bloom, eye } from './kit.js';
import { spline } from './galleon-kit.js';
import { GILT_L, GILT_D, GILT_DD, CYAN, INK, giltX, giltV, stud, scrollRow, circle } from './carousel-kit.js';
import { front } from './carousel-organ-front.js';

export const PIPES = Array.from({ length: 11 }, (_, i) => {
  const x = -66 + i * 13.2;
  return { x, top: -41 + 13 * (Math.abs(x) / 66) ** 1.4, mouth: -8 + 5 * (Math.abs(x) / 66), foot: 20, i };
});

// The case: a plum-black back with an arched crest, a gilt frame and a ledge under it.
function casing(b) {
  const arch = [[-80, -16], [-66, -33], [-36, -45], [0, -49], [36, -45], [66, -33], [80, -16]];
  b.beginPath();
  b.moveTo(-80, 47);
  b.lineTo(-80, -16);
  spline(b, arch);
  b.lineTo(80, 47);
  b.closePath();
  b.fillStyle = lin(b, 0, -49, 0, 47, [[0, '#4a2078'], [0.5, '#2a0f48'], [1, '#1a0830']]);
  b.fill();
  line(b, INK, 6.6);
  line(b, giltX(b, -80, 80, GILT_D), 4.4);
  b.beginPath();
  b.moveTo(-77, -16);
  spline(b, arch.map(([x, y]) => [x * 0.96, y + 2.6]));
  line(b, rgba(GILT_L, 0.8), 1.2);
  b.beginPath(); // the ledge
  b.rect(-84, 40, 168, 9);
  b.fillStyle = giltV(b, 40, 49);
  b.fill();
  line(b, INK, 2.2);
  for (const x of [-72, -48, -24, 0, 24, 48, 72]) stud(b, x, 44.6, 1.6);
}

// A gilt pipe: a round body with bands, its dark mouth (the cyan goes on the lights layer), a foot cone.
function pipe(b, l, p) {
  const w = 10.4;
  b.beginPath();
  b.roundRect(p.x - w / 2, p.top, w, p.foot - p.top, 2.6);
  ink(b, giltX(b, p.x - w / 2, p.x + w / 2), 2);
  ellipse(b, p.x, p.top + 1, w / 2 - 1, 2); // the open top
  b.fillStyle = '#1a0830';
  b.fill();
  path(b, [[p.x - w / 2 + 1, p.foot - 1], [p.x + w / 2 - 1, p.foot - 1], [p.x + 1.4, p.foot + 8], [p.x - 1.4, p.foot + 8]]);
  ink(b, giltX(b, p.x - 5, p.x + 5, GILT_D), 1.4);
  for (const y of [p.top + 8, p.foot - 8]) {
    b.beginPath();
    b.moveTo(p.x - w / 2, y);
    b.lineTo(p.x + w / 2, y);
    line(b, rgba(GILT_DD, 0.8), 1.4);
    b.beginPath();
    b.moveTo(p.x - w / 2, y + 1.4);
    b.lineTo(p.x + w / 2, y + 1.4);
    line(b, rgba(GILT_L, 0.55), 0.8);
  }
  b.beginPath(); // the mouth: a dark slot under a lip
  b.roundRect(p.x - 3.6, p.mouth, 7.2, 6, 1.6);
  ink(b, '#06021a', 1.4);
  l.beginPath();
  l.roundRect(p.x - 3.1, p.mouth + 0.6, 6.2, 4.8, 1.4);
  l.fillStyle = rgba(CYAN, 0.9);
  l.fill();
  bloom(l, p.x, p.mouth + 3, 10, CYAN, 0.42);
}

// Keys along the foot of the case, cream and ink, lit cyan between.
function keys(b, l) {
  b.beginPath();
  b.roundRect(-44, 26, 88, 13, 2);
  ink(b, '#10002a', 1.8);
  for (let i = 0; i < 14; i++) {
    const x = -42 + i * 6.2;
    b.fillStyle = lin(b, 0, 27, 0, 38, [[0, '#ffffff'], [1, '#c8d8e8']]);
    b.fillRect(x, 27.5, 5.2, 10.4);
    b.beginPath();
    b.rect(x, 27.5, 5.2, 10.4);
    line(b, rgba(INK, 0.7), 0.8);
    l.fillStyle = rgba(CYAN, i % 3 === 0 ? 0.55 : 0.25);
    l.fillRect(x + 0.4, 38.2, 4.4, 2);
  }
  for (let i = 0; i < 13; i++) if (i % 7 !== 2 && i % 7 !== 6) {
    b.fillStyle = '#10002a';
    b.fillRect(-42 + i * 6.2 + 3.8, 27.5, 3.2, 6.6);
  }
  bloom(l, 0, 40, 40, CYAN, 0.2);
}

export function organ(b, l) {
  casing(b);
  for (const p of PIPES) pipe(b, l, p);
  keys(b, l);
  scrollRow(b, -62, 62, -44.5, 19, 6, GILT_L);
  circle(b, 0, -49, 4.6); // the crest's finial
  ink(b, giltV(b, -54, -44), 1.6);
  eye(l, 0, -49, 2.2, '#fff0b0', 4);
  front(b, l);
}
