// The Craving's eye (World 17, Ash to Air; see craving.js): a weak part 110 x 76, painted as the LEFT eye (the right is its mirror).
// A deep socket under a heavy brow ridge of charred ash (craving-eye-brow.js), the lids slanted in an angry frown (the inner corner
// low), and in them an eye of molten ember: a coal-red ball dark at its edges, a burning iris (white-gold round the pupil, amber,
// then orange to a dark limbus) split by radial cracks, and a black vertical slit of a pupil. The body layer holds all that colour;
// the lights layer blazes the iris as a ring round the slit (white-gold), washes the whole eye orange and runs the cracks hot. The
// hottest things on the boss with the maw and the tray. Eye coordinates (the part's centre is the origin). Bake-time only.
import { circle, heat, line, path, rad, rgba, ring, rng, TAU, COAL } from './craving-pkit.js';
import { almond, brow, cheek, curls, shadow, socket } from './craving-eye-brow.js';

export const IRIS = { x: 4, y: 3, r: 19 };

function slit(g, x, y) { // the pupil's lens, added to the current path
  g.moveTo(x, y - 25);
  g.quadraticCurveTo(x + 6.4, y, x, y + 25);
  g.quadraticCurveTo(x - 6.4, y, x, y - 25);
}

function ball(b, l, r) {
  const { x, y, r: R } = IRIS;
  b.save();
  almond(b);
  b.clip();
  b.fillStyle = rad(b, x, y, R * 0.6, 62, [[0, '#d2400f'], [0.45, '#8a2410'], [1, '#2a0806']]); // the white of the eye is a dull coal
  b.fillRect(-58, -34, 116, 70);
  b.fillStyle = rad(b, x, y, 0, R, [[0, '#fff0b0'], [0.28, '#ffcf60'], [0.62, '#ff8a22'], [0.9, '#c2380e'], [1, '#4a1008']]);
  circle(b, x, y, R);
  b.fill();
  for (let i = 0; i < 26; i++) { // radial cracks across the iris and the ball
    const a = (i * TAU) / 26 + r() * 0.2;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    const len = R * (0.55 + r() * 0.5) + (i % 3 ? 0 : 20);
    path(b, [[x + c * R * 0.34, y + s * R * 0.34], [x + c * len, y + s * len]], true);
    line(b, rgba('#5a1208', i % 3 ? 0.55 : 0.4), i % 3 ? 0.9 : 1.4);
  }
  circle(b, x, y, R);
  line(b, rgba('#1a0503', 0.85), 2.6); // the limbus
  b.beginPath(); // the slit pupil: a tall black lens
  slit(b, x, y);
  b.fillStyle = '#060101';
  b.fill();
  circle(b, x - 9, y - 9, 2.6); // a catchlight in the molten surface
  b.fillStyle = rgba('#fff6d0', 0.85);
  b.fill();
  b.restore();
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  l.rect(x - R - 1, y - R - 1, R * 2 + 2, R * 2 + 2);
  slit(l, x, y);
  l.clip('evenodd');
  l.fillStyle = rad(l, x, y, 0, R, [[0, rgba(COAL[5], 0)], [0.22, rgba(COAL[5], 0)], [0.34, rgba(COAL[5], 0.9)], [0.55, rgba(COAL[4], 0.7)], [0.85, rgba(COAL[3], 0.28)], [1, rgba(COAL[3], 0)]]);
  circle(l, x, y, R + 1);
  l.fill();
  l.restore();
}

export function eye(b, l) {
  const r = rng(53);
  b.save();
  l.save();
  socket(b);
  curls(b);
  cheek(b);
  ball(b, l, r);
  shadow(b);
  brow(b, l);
  heat(l, 4, 3, 62, COAL[1], 0.4);
  l.save();
  l.beginPath(); // the pupil takes no light: a hole in everything that follows
  l.rect(-60, -40, 120, 80);
  slit(l, IRIS.x, IRIS.y);
  l.clip('evenodd');
  ring(l, 4, 3, 5, 15, 44, COAL[3], 0.5);
  ring(l, 4, 3, 6, 11, 26, COAL[4], 0.5);
  l.restore();
  l.save();
  l.globalCompositeOperation = 'lighter';
  almond(l);
  line(l, rgba(COAL[3], 0.22), 5);
  l.restore();
  b.restore();
  l.restore();
}
