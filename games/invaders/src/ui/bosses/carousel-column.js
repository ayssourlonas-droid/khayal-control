// The inside of the Grand Carousel (World 14, Ember Carnival; see carousel.js), as far as the parts leave it
// showing: the dark hollow under the canopy lit warm from above, the central column with its mirrored panels
// and gilt cornice, the far poles the back horses ride (carousel-fx.js draws them bobbing, in the own pass)
// and the end posts at the rim. Baked into the hull. In boss coordinates.
import { line, lin, rad, rgba, ellipse } from './kit.js';
import { R, eaveY } from './carousel-canopy.js';
import { FLOOR } from './carousel-floor.js';
import { GILT_D, INK, giltV, giltX, mirror, twist, stud, bulb, scrollRow } from './carousel-kit.js';

export const COLUMN = 122; // the central column's radius
export const POLE_X = 160; // where the far poles stand, left and right
export const POLE_TOP = -50;

// The hollow: deep plum under the eave, warming to rose-gold toward the floor.
function hollow(b) {
  b.beginPath();
  b.moveTo(-R + 6, -76);
  b.lineTo(R - 6, -76);
  b.lineTo(R - 2, FLOOR.y);
  b.lineTo(-R + 2, FLOOR.y);
  b.closePath();
  b.fillStyle = lin(b, 0, -76, 0, FLOOR.y, [[0, '#0a0220'], [0.5, '#1c0a3c'], [1, '#4a1a5e']]);
  b.fill();
  b.fillStyle = rad(b, 0, 0, 20, 330, [[0, rgba('#ff8ac8', 0.22)], [1, rgba('#ff8ac8', 0)]]);
  b.fill();
}

// The column: a cylinder of plum cloth shaded across, a cornice with scrolls and bulbs at its top, five
// mirrored panels (those near the middle are for the organ to stand in front of) between gilt pilasters,
// a plinth.
function column(b, l) {
  const [x0, x1, top, bot] = [-COLUMN, COLUMN, -46, 20];
  b.fillStyle = lin(b, x0, 0, x1, 0, [[0, '#14062e'], [0.3, '#4a2a7a'], [0.5, '#6a3a92'], [0.7, '#4a2a7a'], [1, '#14062e']]);
  b.fillRect(x0, top, x1 - x0, bot - top);
  line(b, INK, 2.4);
  for (let i = 0; i < 5; i++) {
    const [a0, a1] = [-1.2 + i * 0.48 + 0.06, -1.2 + (i + 1) * 0.48 - 0.06];
    const [px0, px1] = [COLUMN * Math.sin(a0), COLUMN * Math.sin(a1)];
    if (px1 - px0 > 4) mirror(b, l, px0, -34, px1 - px0, 42, 0.3);
  }
  for (let i = 0; i <= 5; i++) { // pilasters between the panels
    const x = COLUMN * Math.sin(-1.2 + i * 0.48);
    b.fillStyle = giltX(b, x - 3, x + 3);
    b.fillRect(x - 2.6, -38, 5.2, 50);
    line(b, INK, 1.2);
  }
  b.beginPath(); // the cornice
  b.rect(x0 - 4, top - 4, x1 - x0 + 8, 11);
  b.fillStyle = giltV(b, top - 4, top + 7);
  b.fill();
  line(b, INK, 2.2);
  scrollRow(b, x0 + 8, x1 - 8, top + 1.5, 18, 4.6);
  for (let x = x0 + 10; x < x1; x += 20) bulb(b, l, x, top - 9.5, 2.5, ['#ffe9a0', '#ff9ad0', '#9ae8ff'][((x - x0) / 20) % 3 | 0], 0.5);
  b.beginPath(); // the plinth
  b.rect(x0 - 5, bot - 4, x1 - x0 + 10, 9);
  b.fillStyle = giltV(b, bot - 4, bot + 5, GILT_D);
  b.fill();
  line(b, INK, 2);
}

// A far pole and its brass cap: the back horse slides along it.
function farPole(b, x) {
  twist(b, x, POLE_TOP, FLOOR.y - 2, 6, GILT_D);
  ellipse(b, x, POLE_TOP - 1, 5, 3);
  b.fillStyle = giltX(b, x - 5, x + 5);
  b.fill();
  line(b, INK, 1.4);
}

// An end post at the rim: a twist pole standing on the floor with a gilt ball on its capital, three studs.
function post(b, l, x) {
  twist(b, x, eaveY(x) + 4, FLOOR.y + 4, 8);
  for (const y of [-30, -4, 18]) stud(b, x, y, 2.4);
  b.beginPath();
  b.arc(x, FLOOR.y + 10, 8, 0, 6.3);
  b.fillStyle = giltV(b, FLOOR.y + 2, FLOOR.y + 18);
  b.fill();
  line(b, INK, 2);
  bulb(b, l, x, eaveY(x) + 14, 3);
}

// The end posts, drawn after the floor so they stand on its rim.
export function posts(b, l) {
  for (const s of [-1, 1]) post(b, l, s * (R - 6));
}

export function inside(b, l) {
  hollow(b);
  column(b, l);
  for (const s of [-1, 1]) farPole(b, s * POLE_X);
  b.fillStyle = lin(b, 0, -74, 0, -30, [[0, rgba('#ffcf8a', 0.3)], [1, rgba('#ffcf8a', 0)]]); // the canopy's bulbs light the inner rim
  b.fillRect(-R + 8, -74, 2 * R - 16, 44);
}
