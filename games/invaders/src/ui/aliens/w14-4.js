// World 14, Ember Carnival, the tin drummer (see w14.js): a clockwork bandsman in a coral tunic, a gilt
// shako and cream cross-belts, a snare drum on his belly and a stick in each hand, a painted tin face with a
// curled moustache and lit eyes. The armoured one of the fair: plated, riveted and dented-looking, and the
// only toy that cracks; where it does, bare tin shows through the chipped paint. The drum, arms and
// sticks are in w14-8.js.
import { path, ink, lin, rad, rgba, shade, bloom, eye, gloss, line, ellipse, both, INK } from './w14-kit.js';
import { CREAM, RED, NAVY, GILT, HOT, rivet, star5, tinH, giltH, giltV, glint, halo } from './w14-kit.js';
import { drum, sticks } from './w14-8.js';

// Legs: tin trousers striped down the seam, a black boot with a gilt buckle, the foot lifting with the beat.
function legs(b, f, c) {
  for (const m of [-1, 1]) {
    const lift = (m < 0) === !!f ? 0 : -1.6;
    path(b, [[m * 3.4, 23], [m * 12.6, 23], [m * 12, 36 + lift], [m * 4, 36 + lift]]);
    ink(b, tinH(b, m * 3.4, m * 12.6, shade(c, -0.15)), 2.2);
    path(b, [[m * 11, 24], [m * 10.2, 35 + lift]], true);
    line(b, rgba(GILT, 0.9), 1.2);
    rivet(b, m * 7.6, 30 + lift, 1, GILT);
    path(b, [[m * 3, 35 + lift], [m * 13, 35 + lift], [m * 15.6, 41 + lift], [m * 14, 45 + lift], [m * 3, 45 + lift]]);
    ink(b, lin(b, 0, 35, 0, 45, [[0, '#5a4a6a'], [0.3, '#1c1426'], [1, '#06020c']]), 2.2);
    path(b, [[m * 4, 39 + lift], [m * 14.4, 39 + lift]], true);
    line(b, rgba('#ffffff', 0.3), 0.8);
    rivet(b, m * 8, 40 + lift, 1, GILT);
  }
}

// The torso above the drum: the tunic's shoulders and chest, cream cross-belts meeting in a gilt boss,
// gilt epaulettes with fringes, two columns of buttons and a stiff collar.
function torso(b, c) {
  path(b, [[-17, -10], [-9, -12.4], [9, -12.4], [17, -10], [19, 4], [-19, 4]]);
  ink(b, tinH(b, -19, 19, c), 3);
  b.save();
  path(b, [[-17, -10], [17, -10], [19, 4], [-19, 4]]);
  b.clip();
  both((m) => {
    path(b, [[m * 15, -10], [m * 11, -10], [-m * 11, 4], [-m * 15, 4]]); // a belt crossing the chest
    b.fillStyle = lin(b, 0, -10, 0, 4, [[0, '#ffffff'], [1, shade(CREAM, -0.3)]]);
    b.fill();
    line(b, rgba(NAVY, 0.5), 0.8);
  });
  b.fillStyle = lin(b, -19, 0, 19, 0, [[0, rgba('#000000', 0.4)], [0.3, rgba('#000000', 0)], [0.75, rgba('#000000', 0)], [1, rgba('#000000', 0.5)]]);
  b.fillRect(-20, -13, 40, 18);
  b.restore();
  ellipse(b, 0, -3.4, 3.4, 3.4);
  ink(b, rad(b, 0, -3.4, 0.4, 3.6, [[0, '#fff3c8'], [0.5, GILT], [1, shade(GILT, -0.6)]], -1, -4.4), 1.4);
  both((m) => { // epaulettes
    path(b, [[m * 12.6, -11.4], [m * 21.6, -9.6], [m * 21, -5.4], [m * 12, -7]]);
    ink(b, giltH(b, 12, 22), 1.6);
    for (let i = 0; i < 4; i++) { // fringe
      path(b, [[m * (14 + i * 2.2), -6], [m * (14 + i * 2.2), -3.2]], true);
      line(b, GILT, 1);
    }
    rivet(b, m * 17, -8.4, 0.9, GILT);
  });
  both((m) => { for (const y of [-8, 0]) rivet(b, m * 6.8, y, 1, GILT); });
}

// The head: a cream-tin face with rosy cheeks, dark eye sockets, a nose and a curled moustache, under a
// tall shako with a gilt band, a star plate and a red cockade; the strap runs under the chin.
function face(b, l, f, c) {
  ellipse(b, 0, -19, 9.6, 9.4);
  ink(b, rad(b, 0, -19, 1, 12, [[0, '#fff0e0'], [0.5, '#f0c8a8'], [1, '#a86a5a']], -3, -22), 2.8);
  for (const m of [-1, 1]) {
    ellipse(b, m * 6.6, -16.4, 2.5, 1.9);
    b.fillStyle = rgba('#ff6a8a', 0.6);
    b.fill();
    ellipse(b, m * 3.6, -20.4, 3.2, 2.9); // a painted eye, its pupil looking to a side
    ink(b, '#fffaf0', 0.9);
    ellipse(b, m * 3.6 + (f ? 0.9 : -0.9), -20.2, 1.6, 1.9);
    b.fillStyle = '#3a1608';
    b.fill();
    path(b, [[m * 6.8, -24.8], [m * 1.4, -24]], true); // a brow, a stern one
    line(b, INK, 1.3);
  }
  path(b, [[0, -19], [-1.2, -15.8], [1.2, -15.8]]);
  ink(b, '#e0a888', 1);
  b.beginPath(); // the moustache
  b.moveTo(0, -14.6);
  b.bezierCurveTo(-3, -16.6, -6.6, -14.6, -8.4, -16.8);
  b.moveTo(0, -14.6);
  b.bezierCurveTo(3, -16.6, 6.6, -14.6, 8.4, -16.8);
  line(b, INK, 2.2);
  gloss(b, -4.4, -24, 3.6, 1.6, 0.6, -0.5);
  path(b, [[-10.4, -26], [-9, -41], [9, -41], [10.4, -26]]); // the shako
  ink(b, tinH(b, -10.4, 10.4, shade(c, -0.35)), 3);
  ellipse(b, 0, -41, 9, 2.4);
  ink(b, lin(b, -9, -41, 9, -41, [[0, shade(c, 0.2)], [0.4, shade(c, 0.6)], [1, shade(c, -0.2)]]), 1.6);
  path(b, [[-10.2, -27], [10.2, -27], [10.4, -31.4], [-10.4, -31.4]]);
  ink(b, giltV(b, -31, -27), 1.4);
  path(b, [[-10.6, -25.4], [10.6, -25.4], [9.4, -27.6], [-9.4, -27.6]]); // the peak
  ink(b, lin(b, 0, -28, 0, -25, [[0, '#2a1230'], [1, '#08020e']]), 1.4);
  ellipse(b, 0, -35.6, 4.6, 4.4); // the plate
  ink(b, rad(b, 0, -35.6, 0.5, 5, [[0, '#fff3c8'], [0.5, GILT], [1, shade(GILT, -0.5)]], -1.4, -37), 1.4);
  star5(b, 0, -35.4, 2.8, RED);
  ellipse(b, -8.4, -38, 2.6, 2.6); // the cockade
  ink(b, rad(b, -8.4, -38, 0.2, 2.8, [[0, '#ffb0a0'], [0.5, RED], [1, shade(RED, -0.6)]]), 1.2);
  rivet(b, 8, -29.2, 0.8, GILT);
  for (const m of [-1, 1]) eye(l, m * 3.6 + (f ? 0.9 : -0.9), -20.2, 0.9, HOT, 2.2);
  glint(l, 0, -35.5, 3, '#fff6d0', 0.6);
}

// A tin drummer: the sticks trade places with every beat, the near boot lifts, and the plate gleams.
export function armored(b, l, f, c) {
  legs(b, f, c);
  torso(b, c);
  face(b, l, f, c);
  drum(b, l, f, c);
  sticks(b, l, f, c);
  bloom(l, 0, 0, 38, c, 0.1);
  halo(l, 0, -20, 8, 20, HOT, 0.12);
}
