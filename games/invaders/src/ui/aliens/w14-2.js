// World 14, Ember Carnival, the firework rocket (see w14.js): a paper tube wrapped in the world's colour and
// printed with a star, a cream nose cone with a gilt tip, cream fins striped to match, a clay nozzle with
// two paper streamers, diving nose first at the ship. Its tail is at the top of the sprite and it sparks:
// on one beat the sparks fan wide and short, on the other long and thin, the streamers leaning with them.
import { path, ink, lin, rad, rgba, shade, bloom, eye, gloss, line, ellipse, INK } from './w14-kit.js';
import { CREAM, RED, NAVY, GILT, HOT, SPARK, rivet, star5, stripes, tinH, tinV, giltH, glint, streak } from './w14-kit.js';

// A fin on side m: a swept trapezoid of cream paper with stripes of the rocket's colour, a printed star and
// a gilt leading edge (drawn on the right, mirrored for the left).
function fin(b, m, c) {
  const pts = [[9, -3], [24, -24], [24, -33], [9, -26]];
  b.save();
  b.scale(m, 1);
  path(b, pts);
  ink(b, lin(b, 9, 0, 24, 0, [[0, shade(CREAM, -0.1)], [0.5, '#ffffff'], [1, CREAM]]), 2.8);
  b.save();
  path(b, pts);
  b.clip();
  stripes(b, 9, -33, 25, -3, 6.2, 3.4, rgba(c, 1), 0.85);
  star5(b, 17.4, -22, 3.4, RED);
  path(b, [[9, -3], [24, -24]], true);
  line(b, GILT, 2);
  b.fillStyle = lin(b, 0, -33, 0, -3, [[0, rgba('#ffffff', 0.3)], [1, rgba('#000000', 0.16)]]);
  b.fillRect(8, -34, 18, 32);
  b.restore();
  rivet(b, 12.4, -10, 0.9, GILT);
  b.restore();
}

// The two streamers of crepe paper tied round the nozzle, flying to one side and then the other.
function streamers(b, f) {
  for (const [m, col] of [[-1, RED], [1, GILT]]) {
    const lean = f ? 1 : -1;
    b.beginPath();
    b.moveTo(m * 4, -30);
    b.bezierCurveTo(m * 6 + lean * 2, -35, m * 3 + lean * 7, -37, m * 5 + lean * 9, -42);
    line(b, INK, 5);
    line(b, col, 3);
    b.beginPath();
    b.moveTo(m * 4 - 0.5, -30);
    b.bezierCurveTo(m * 6 + lean * 2 - 0.5, -35, m * 3 + lean * 7 - 0.5, -37, m * 5 + lean * 9 - 0.5, -42);
    line(b, rgba('#ffffff', 0.5), 0.6);
  }
}

// The sparks out of the nozzle, on the lights layer: a fan on each side of an empty middle, so a shell's fuse
// can stand there. Beat 0 is short and wide, beat 1 long and thin.
function sparks(l, f) {
  const fan = f ? [[-0.35, 11], [-0.72, 8], [0.4, 12], [0.8, 7], [-0.1, 7]] : [[-0.62, 9], [-1.0, 6], [0.58, 10], [1.05, 6], [0.18, 6]];
  for (const [a, len] of fan) {
    if (Math.abs(a) < 0.15) continue;
    streak(l, Math.sin(a) * 5, -33, Math.sin(a) * len, -Math.cos(a) * len * 0.8, HOT, 0.8);
    glint(l, Math.sin(a) * (len + 3), -33 - Math.cos(a) * len * 0.8 - 1, 1.4, SPARK, 0.8);
  }
  bloom(l, 0, -33, 13, HOT, 0.6);
  eye(l, 0, -32, 2.8, '#ffffff', 2.4);
}

// A diving firework rocket: tube, printed star, gilt bands, cone, fins, nozzle, streamers and sparks.
export function diver(b, l, f, c) {
  fin(b, -1, c);
  fin(b, 1, c);
  path(b, [[-10, 11], [-9, 24], [-4, 37], [0, 44], [4, 37], [9, 24], [10, 11]]); // the nose cone
  ink(b, lin(b, -10, 0, 10, 0, [[0, shade(CREAM, -0.4)], [0.3, '#ffffff'], [0.6, CREAM], [1, shade(CREAM, -0.55)]]), 3);
  b.save();
  b.beginPath();
  b.moveTo(-10, 11);
  b.bezierCurveTo(-9, 24, -4, 37, 0, 44);
  b.bezierCurveTo(4, 37, 9, 24, 10, 11);
  b.closePath();
  b.clip();
  stripes(b, -10, 11, 10, 44, 7, 2.4, rgba(c, 0.8), 0.4);
  b.fillStyle = rad(b, 0, 40, 0, 7, [[0, RED], [1, rgba(RED, 0)]]);
  b.fillRect(-10, 30, 20, 16);
  b.restore();
  path(b, [[-10, -26], [10, -26], [10, 12], [-10, 12]]); // the tube
  ink(b, tinH(b, -10, 10, c), 3);
  b.save();
  path(b, [[-10, -26], [10, -26], [10, 12], [-10, 12]]);
  b.clip();
  stripes(b, -10, -26, 10, 12, 8.4, 2.6, rgba(CREAM, 0.8), 0.9); // the wrapping paper's spiral
  for (const [y0, y1] of [[-25, -20], [7, 12]]) { // gilt bands
    b.fillStyle = giltH(b, -10, 10);
    b.fillRect(-10, y0, 20, y1 - y0);
    path(b, [[-10, y0], [10, y0], [-10, y1], [10, y1]], true);
    line(b, rgba(NAVY, 0.55), 0.8);
  }
  ellipse(b, 0, -5, 7.4, 7.4); // the printed star on a cream roundel
  b.fillStyle = CREAM;
  b.fill();
  line(b, NAVY, 1.1);
  star5(b, 0, -4.6, 5.4, RED);
  for (let i = 0; i < 6; i++) {
    const a = i * 1.047 + 0.3;
    ellipse(b, Math.cos(a) * 5.9, -5 + Math.sin(a) * 5.9, 0.7, 0.7);
    b.fillStyle = NAVY;
    b.fill();
  }
  b.fillStyle = lin(b, -10, 0, 10, 0, [[0, rgba('#000000', 0.4)], [0.3, rgba('#000000', 0)], [0.7, rgba('#000000', 0)], [1, rgba('#000000', 0.5)]]);
  b.fillRect(-10, -26, 20, 38);
  b.restore();
  gloss(b, -5.6, -12, 1.8, 9, 0.6, 0);
  path(b, [[-8, -26], [-6, -32], [6, -32], [8, -26]]); // the nozzle
  ink(b, tinV(b, -32, -26, '#b4825a'), 2.4);
  ellipse(b, 0, -32, 6, 2.2);
  ink(b, '#1a0a14', 1.6);
  for (const x of [-4, 4]) rivet(b, x, -28, 0.8, GILT);
  streamers(b, f);
  eye(l, 0, 40.4, 1.8, RED, 3); // the tip glows, a bulb under the paper
  for (const k of [0, 1, 2]) eye(l, (k - 1) * 5.4, 9.5, 1.1, f === (k & 1) ? HOT : GILT, 2.4);
  sparks(l, f);
  bloom(l, 0, 0, 30, c, 0.11);
}
