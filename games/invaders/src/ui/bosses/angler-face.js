// The Lantern Leviathan's upper face (World 15, Lantern Deep; see angler.js), the hull's share: a swollen mound of
// flesh round each eye socket (the eyes, angler-eye.js, sit in them) with the folds and bags of skin round it, and on
// the crown the knob the lure's stalk grows from, a swelling of pale flesh with skin gathered round it. The
// forehead between the eyes is kept dark and bare, so the lure hangs in front of it.
import { path, line, rad, rgba } from './kit.js';
import { SOCKET, STALK, INK, FLESH, rng, lumpy, headPath, circle } from './angler-kit.js';
import { lumps } from './angler-skin.js';

// One eye socket on the side s (-1 left, 1 right): the mound, its folds, a heavy bag under it and a few swellings
// round the rim.
function socket(b, s) {
  const x = s * SOCKET.x;
  const { y, r } = SOCKET;
  lumpy(b, x, y + 3, r + 14, 5 + s);
  b.fillStyle = rad(b, x, y + 3, r * 0.5, r + 16, [[0, '#254a6a'], [0.6, '#143450'], [1, '#08192b']], x - s * 6, y - 12);
  b.fill();
  line(b, INK, 2.6);
  for (let a = 0.1; a < Math.PI * 1.9; a += 0.3) { // folds of skin radiating from the lids
    const [c, d] = [Math.cos(a), Math.sin(a)];
    path(b, [[x + c * (r + 1), y + d * (r + 1)], [x + c * (r + 10 + 5 * Math.sin(a * 5)), y + d * (r + 10 + 5 * Math.sin(a * 5))]], true);
    line(b, rgba('#000812', 0.42), 1.5);
  }
  const j = rng(17 + s);
  for (let i = 0; i < 9; i++) { // swellings round the rim
    const a = Math.PI * (0.9 + i * 0.22) + j() * 0.2;
    const rr = 5 + j() * 4;
    const [px, py] = [x + Math.cos(a) * (r + 10), y + 3 + Math.sin(a) * (r + 10)];
    b.fillStyle = rad(b, px, py, 0, rr, [[0, rgba('#6aa0c0', 0.4)], [0.55, rgba(FLESH, 0.2)], [1, rgba('#000610', 0.36)]], px - rr * 0.3, py - rr * 0.35);
    circle(b, px, py, rr);
    b.fill();
  }
  b.beginPath(); // the bag under the eye
  b.ellipse(x, y + r + 7, r * 0.8, 7, 0, 0.1, Math.PI - 0.1);
  line(b, rgba('#000812', 0.5), 3);
  b.beginPath();
  b.ellipse(x, y + r + 10, r * 0.76, 6, 0, 0.2, Math.PI - 0.2);
  line(b, rgba('#a8dcf0', 0.16), 1.2);
}

// The crown's swollen knob and the stalk's socket in it: a ring of pale flesh round a deep pit, skin gathered round.
function crown(b) {
  b.save();
  headPath(b);
  b.clip(); // the swelling is on the dome, not above it
  lumpy(b, 0, -104, 70, 31, 18, 1, 0.6);
  b.fillStyle = rad(b, 0, -108, 6, 80, [[0, rgba('#2c5470', 0.9)], [0.6, rgba('#12304a', 0.6)], [1, rgba('#08192b', 0)]], -8, -126);
  b.fill();
  b.restore();
  for (let i = -6; i <= 6; i++) { // skin folds radiating from the socket
    path(b, [[STALK.x + i * 4, STALK.y + 6], [STALK.x + i * 11 + 2 * Math.sin(i), STALK.y + 32]], true);
    line(b, rgba('#000812', 0.3), 1.4);
  }
  b.beginPath(); // the stalk's knob: a swelling of pale flesh the stalk grows out of, no pit, no collar
  b.ellipse(STALK.x, STALK.y + 3, 21, 11, 0, 0, Math.PI * 2);
  b.fillStyle = rad(b, STALK.x, STALK.y, 2, 24, [[0, '#7aa8c4'], [0.6, '#3a6888'], [1, '#12304a']], STALK.x - 5, STALK.y - 4);
  b.fill();
  line(b, INK, 2);
  for (let k = -3; k <= 3; k++) { // folds of skin gathering round its root
    path(b, [[STALK.x + k * 5, STALK.y + 7], [STALK.x + k * 8, STALK.y + 12]], true);
    line(b, rgba('#000812', 0.36), 1.2);
  }
}

// The forehead between the eyes: bare and dark, but for a few heavy swellings and creases, so that it is skin and
// not a wall.
function brow(b) {
  b.save();
  headPath(b);
  b.clip();
  lumps(b, 91, [-92, -104, 92, -66], 7, 1.1, 10, 20);
  for (const [x0, y0, x1, y1] of [[-86, -84, -50, -90], [52, -88, 88, -82], [-70, -74, -34, -70]]) {
    path(b, [[x0, y0], [(x0 + x1) / 2, y0 - 3], [x1, y1]], true);
    line(b, rgba('#000812', 0.4), 1.6);
    path(b, [[x0, y0 + 2], [(x0 + x1) / 2, y0 - 1], [x1, y1 + 2]], true);
    line(b, rgba('#a8dcf0', 0.12), 1);
  }
  b.restore();
}

export function face(b) {
  brow(b);
  crown(b);
  socket(b, -1);
  socket(b, 1);
}
