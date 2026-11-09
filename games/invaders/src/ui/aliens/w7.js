// World 7, Iron Dawn: the machines of a war that never ended. Polished chrome over dark steel,
// rivets and slats, and red eyes that never blink (lights). The wreck is the armored crawler
// broken open, waiting to pull itself back together (drawn by aliens/index.js wreck()).
import { path, sym, ink, lin, rgba, shade, chrome, eye, bloom, gloss, line, circle, ellipse, both, TAU } from './kit.js';

const RED = '#ff2a1a';

function slats(b, x0, x1, y0, y1, n) {
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    path(b, [[x, y0], [x, y1]], true);
    line(b, rgba('#000000', 0.6), 1.4);
  }
}

function rivets(b, pts) {
  for (const [x, y] of pts) {
    circle(b, x, y, 1.2);
    b.fillStyle = 'rgba(255,255,255,0.7)';
    b.fill();
  }
}

// A sentry pod: a chrome head wider at the brow, a visor with two red eyes, a slatted jaw.
function grunt(b, l, f, c) {
  both((s) => {
    path(b, [[s * 14, 2], [s * 25, -2], [s * 27, 8], [s * 15, 10]]);
    ink(b, chrome(b, c, s * 14, s * 27), 2.4);
    eye(l, s * 27, 3, 1, f ? '#ffb070' : RED, 2.5);
  });
  path(b, [[0, -22], [0, -30]], true);
  line(b, '#14161c', 2.4);
  path(b, sym([[0, -21], [12, -21], [18, -12], [15, 10], [9, 17], [0, 18]]));
  ink(b, chrome(b, c, -18, 18), 3);
  path(b, sym([[0, -9], [15, -9], [14, -2], [0, -2]]));
  ink(b, '#0a0a10', 1.6);
  path(b, sym([[0, 5], [10, 5], [8, 15], [0, 15]]));
  ink(b, lin(b, 0, 5, 0, 15, [[0, '#3a3e48'], [1, '#121418']]), 1.6);
  slats(b, -6, 6, 6, 14, 4);
  both((s) => eye(l, s * 7, -5.5, 2.2, RED, 3.4));
  gloss(b, -6, -16, 6, 2, 0.6);
  eye(l, 0, -30, 1.1, RED, 2.4);
}

// An aerial hunter: a flying wing slung between two ducted fans, a red sensor at its nose.
function diver(b, l, f, c) {
  path(b, sym([[0, -16], [16, -11], [18, -1], [8, 6], [5, 22], [0, 26]]));
  ink(b, chrome(b, c, -18, 18), 2.8);
  path(b, sym([[0, -10], [6, -8], [5, 12], [0, 16]]));
  b.fillStyle = rgba('#000000', 0.25);
  b.fill();
  both((s) => {
    circle(b, s * 20, -7, 9);
    ink(b, chrome(b, shade(c, -0.2), s * 11, s * 29), 2.8);
    circle(b, s * 20, -7, 6.3);
    b.fillStyle = '#0c0d12';
    b.fill();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + f * 0.6 * s;
      path(b, [[s * 20, -7], [s * 20 + Math.cos(a) * 5.8, -7 + Math.sin(a) * 5.8]], true);
      line(b, rgba('#a8b0c0', 0.75), 1.6);
    }
    circle(b, s * 20, -7, 2);
    b.fillStyle = '#a8b0c0';
    b.fill();
    eye(l, s * 20, 3, 1, RED, 2.4);
  });
  eye(l, 0, 22, 2.6, RED, 4);
  bloom(l, 0, 34, 10, RED, 0.25);
}

// A gun platform: chrome shoulders, two rotary cannons hanging down, one red slit of an eye.
function gunner(b, l, f, c) {
  both((s) => {
    b.beginPath();
    b.roundRect(s * 17 - 5, -2, 10, 22, 3);
    ink(b, chrome(b, shade(c, -0.35), s * 17 - 5, s * 17 + 5), 2.4);
    for (const dx of [-2.5, 0, 2.5]) {
      path(b, [[s * 17 + dx, 20], [s * 17 + dx, 29]], true);
      line(b, '#0e1014', 2.6);
    }
    eye(l, s * 17, 29, f ? 2.4 : 1, '#ffb070', 2.6);
    path(b, [[s * 8, -16], [s * 26, -12], [s * 25, 0], [s * 10, -2]]);
    ink(b, chrome(b, c, s * 8, s * 26), 2.6);
    rivets(b, [[s * 22, -9], [s * 13, -11]]);
  });
  path(b, sym([[0, -20], [9, -18], [11, 4], [6, 14], [0, 16]]));
  ink(b, chrome(b, c, -11, 11), 2.8);
  path(b, sym([[0, -9], [7, -9], [7, -5], [0, -5]]));
  ink(b, '#0a0a10', 1.4);
  path(l, [[-5, -7], [5, -7]], true);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.lineWidth = 2.6;
  l.strokeStyle = RED;
  l.stroke();
  l.restore();
  bloom(l, 0, -7, 12, RED, 0.7);
  slats(b, -4, 4, 2, 12, 3);
}

function tread(b, x, f) {
  b.beginPath();
  b.roundRect(x - 6, -20, 12, 42, 5);
  ink(b, lin(b, x - 6, 0, x + 6, 0, [[0, '#0e0f12'], [0.5, '#3a3c44'], [1, '#0e0f12']]), 2.4);
  for (let y = -17 + f * 3; y < 20; y += 6) {
    path(b, [[x - 5, y], [x + 5, y]], true);
    line(b, rgba('#8a8e98', 0.55), 1.6);
  }
}

// A crawler tank: treads on both flanks, a riveted wedge of a hull, a visor with one great eye.
function armored(b, l, f, c) {
  both((s) => tread(b, s * 24, f));
  path(b, sym([[0, -22], [14, -22], [19, -12], [19, 12], [12, 22], [0, 24]]));
  ink(b, lin(b, 0, -22, 0, 24, [[0, shade(c, 0.45)], [0.5, c], [1, shade(c, -0.55)]]), 3.2);
  path(b, sym([[0, -14], [12, -14], [12, 10], [0, 14]]));
  ink(b, chrome(b, c, -12, 12), 2);
  rivets(b, [[-16, -18], [16, -18], [-16, 16], [16, 16], [-9, 8], [9, 8]]);
  b.beginPath();
  b.roundRect(-9, -7, 18, 8, 3);
  ink(b, '#08080c', 1.8);
  eye(l, f ? 3 : -3, -3, 3, RED, 4);
}

// A courier: four rotors over a canister of glowing fuel.
function carrier(b, l, f, c) {
  both((s) => both((t) => {
    path(b, [[s * 8, t * 8], [s * 20, t * 16]], true);
    line(b, '#0e1014', 3.6);
    ellipse(b, s * 21, t * 17, 9, 2.6, f ? 0.4 * s : -0.3 * s);
    ink(b, rgba('#a8b0c0', 0.55), 1.6);
  }));
  b.beginPath();
  b.roundRect(-11, -18, 22, 36, 6);
  ink(b, chrome(b, '#a8b0c0', -11, 11), 2.8);
  b.beginPath();
  b.roundRect(-7, -12, 14, 24, 4);
  b.fillStyle = lin(b, -7, 0, 7, 0, [[0, shade(c, -0.4)], [0.4, shade(c, 0.6)], [1, shade(c, -0.3)]]);
  b.fill();
  for (const y of [-6, 0, 6]) {
    path(b, [[-7, y], [7, y]], true);
    line(b, rgba('#2a0a04', 0.6), 1.4);
  }
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rgba(c, 0.6);
  l.fillRect(-7, -12, 14, 24);
  bloom(l, 0, 0, 28, c, 0.55 + f * 0.1);
}

// The crawler knocked flat: a tread torn away, plates sprung, the eye barely alive.
function wreck(b, l) {
  b.save();
  b.rotate(0.22);
  tread(b, -24, 0);
  path(b, [[-19, -12], [-6, -22], [8, -18], [19, -6], [16, 10], [6, 20], [-12, 18], [-19, 8]]);
  ink(b, lin(b, 0, -22, 0, 20, [[0, '#4a4e58'], [1, '#141518']]), 3);
  path(b, [[-12, -14], [10, -8], [4, 12]], true);
  line(b, '#08080a', 3);
  path(b, [[4, -20], [10, -26], [16, -14]]);
  ink(b, '#2a2c32', 2);
  b.restore();
  eye(l, -3, -2, 2.2, RED, 3.4);
}

export default { rate: 2, halo: 0.1, crack: '#ff6a3a', grunt, diver, gunner, armored, carrier, wreck };
