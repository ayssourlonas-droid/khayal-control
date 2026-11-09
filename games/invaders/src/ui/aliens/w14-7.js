// World 14, Ember Carnival, the jack-in-the-box's insides (see w14-3.js): the doors in the box's belly, the
// compressed or the stretched spring, the jester's head on it with his lit eyes and his wide mouth (the
// muzzle), and the box's side crank. Sprites face down: the head pops out toward the ship.
import { path, ink, lin, rad, rgba, shade, bloom, eye, gloss, line, ellipse, both, INK } from './w14-kit.js';
import { CREAM, RED, NAVY, GILT, HOT, SPARK, TIN, rivet, spring, giltV, tinH, glint, halo, streak, star5 } from './w14-kit.js';

// The doors on the box's belly: shut but for a sliver on the resting beat, flung wide on the firing beat.
export function doors(b, f, c) {
  path(b, [[-11, -17], [11, -17], [11, 1], [-11, 1]]); // the opening, dark inside
  ink(b, '#14041c', 2);
  both((m) => {
    if (f) { // swung out: a thin leaf seen at an angle beside the opening
      path(b, [[m * 11, -17], [m * 17, -19], [m * 17, -1], [m * 11, 1]]);
      ink(b, lin(b, m * 11, 0, m * 17, 0, [[0, shade(c, -0.3)], [1, shade(c, -0.6)]]), 1.8);
      path(b, [[m * 12.5, -13], [m * 15.5, -14]], true);
      line(b, rgba(GILT, 0.8), 1);
    } else { // almost shut: a leaf each, a gap between them
      path(b, [[m * 11, -17], [m * 3, -17], [m * 3.6, 1], [m * 11, 1]]);
      ink(b, giltV(b, -17, 1), 1.8);
      path(b, [[m * 9, -15], [m * 5, -15], [m * 5.4, -1], [m * 9, -1]]);
      line(b, rgba(NAVY, 0.55), 0.9);
      star5(b, m * 7, -7.4, 2.2, RED);
    }
    rivet(b, m * 10, -15.5, 0.8, GILT);
  });
}

// The coil: compressed inside the box on the resting beat (two turns show in the gap), stretched out
// with the head on its end on the firing beat.
export function coil(b, f) {
  if (f) spring(b, 0, 0, 21, 7, 5);
  else spring(b, 0, -9, -1, 4.6, 2);
}

// The head on the end of the spring: a cream ball in a ruff and a jester's two-horned cap, rosy cheeks, a
// red nose and wild brows, the mouth stretched wide open. Eyes are bright on the lights layer.
export function head(b, l, f, c) {
  const [hx, hy] = [0, 33.4];
  for (let i = -3; i <= 3; i++) { // the ruff
    ellipse(b, i * 3.4, 23.2 + (i % 2 ? 0.8 : 0), 3.2, 2.8);
    ink(b, i % 2 ? CREAM : RED, 1.4);
  }
  for (const m of [-1, 1]) { // the cap's horns, a bell on each
    path(b, [[m * 6, 26], [m * 14, 22], [m * 19, 27.4], [m * 17, 33], [m * 11, 28]]);
    ink(b, m < 0 ? c : RED, 1.8);
    ellipse(b, m * 19.2, 30, 2.4, 2.4);
    ink(b, rad(b, m * 19.2, 30, 0.2, 2.6, [[0, '#fff3c8'], [0.6, GILT], [1, shade(GILT, -0.6)]], m * 18.4, 29), 1.2);
  }
  ellipse(b, hx, hy, 12.4, 11.6);
  ink(b, rad(b, hx, hy, 2, 15, [[0, '#ffffff'], [0.5, CREAM], [1, shade(CREAM, -0.45)]], -4, 28), 2.6);
  path(b, [[-12, 28.4], [-6, 25.2], [0, 27.4], [6, 25.2], [12, 28.4], [8, 24], [-8, 24]]); // the cap's band
  ink(b, rad(b, 0, 25, 1, 14, [[0, shade(c, 0.4)], [1, shade(c, -0.4)]]), 1.6);
  for (const m of [-1, 1]) {
    ellipse(b, m * 7.4, 35.6, 2.8, 2.2); // a rosy cheek
    b.fillStyle = rgba('#ff6a8a', 0.55);
    b.fill();
    ellipse(b, m * 4.4, 30.8, 2.7, 2.7); // an eye
    ink(b, '#ffffff', 1.1);
    ellipse(b, m * 4.2 + (f ? 0 : -m * 0.2), 31.2, 1.2, 1.4);
    b.fillStyle = '#10041a';
    b.fill();
    path(b, [[m * 8.4, 26.6], [m * 1.6, 28.8]], true); // a wild brow, angry inward
    line(b, INK, 1.7);
  }
  ellipse(b, 0, 34.4, 2.3, 2.3); // the red nose
  ink(b, rad(b, 0, 34.4, 0.3, 2.4, [[0, '#ffb0a0'], [0.5, RED], [1, shade(RED, -0.6)]], -0.8, 33.4), 1.2);
  ellipse(b, 0, 40, 8, f ? 3.8 : 2.2); // the mouth: wide open and fiery when it fires, a grin when it does not
  ink(b, '#14041c', 1.6);
  if (f) { // teeth along the upper lip
    for (const x of [-4.4, -1.4, 1.6, 4.6]) {
      path(b, [[x - 1, 37.4], [x + 1, 37.4], [x, 39.4]]);
      ink(b, CREAM, 0.8);
    }
  }
  gloss(b, -5, 27.6, 3.6, 1.5, 0.7, -0.4);
  eye(l, -4.2, 31, 1.5, HOT, 3);
  eye(l, 4.2, 31, 1.5, HOT, 3);
  for (const m of [-1, 1]) eye(l, m * 19.2, 30, 1.5, GILT, 2.4);
}

// The crank on the box's right side, turned a quarter between the beats, its red knob on the end.
export function crank(b, l, f) {
  ellipse(b, 24, -15, 3.4, 4.6);
  ink(b, tinH(b, 20, 28, TIN), 1.6);
  const a = f ? 0.9 : -0.9;
  b.save();
  b.translate(25, -15);
  b.rotate(a);
  path(b, [[0, -1.6], [11, -1.2], [11, 1.2], [0, 1.6]]);
  ink(b, tinH(b, 0, 11, TIN), 1.5);
  ellipse(b, 12.4, 0, 3.4, 3.4);
  ink(b, rad(b, 12.4, 0, 0.3, 3.6, [[0, '#ffb0a0'], [0.5, RED], [1, shade(RED, -0.6)]], 11.4, -1), 1.4);
  b.restore();
  rivet(b, 25, -15, 1.1, TIN);
  glint(l, 25 + Math.cos(a) * 12.4, -15 + Math.sin(a) * 12.4, 2.4, SPARK, 0.7);
}

// The fire at the mouth on the firing beat: a ragged white-hot star in a bloom and four streaks.
export function muzzle(l, x, y) {
  bloom(l, x, y, 7, HOT, 1);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    const r = i % 2 ? 2.2 : 4.4 + (i % 4 === 0 ? 1.2 : 0);
    l.lineTo(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 0.8);
  }
  l.closePath();
  l.fillStyle = rad(l, x, y, 0, 6, [[0, '#ffffff'], [0.5, SPARK], [1, HOT]]);
  l.fill();
  l.restore();
  for (const a of [-0.9, 0, 0.9]) streak(l, x, y, Math.sin(a) * 9, Math.cos(a) * 3.4 + 1.2, HOT, 1);
  halo(l, x, y, 3, 8, HOT, 0.4);
}
