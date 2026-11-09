// World 2, Neon Rain: police-style hover drones of the megacity, black lacquer hulls that are
// nearly invisible in the dark, drawn by their neon: light bars, headlamps, sirens and thrust.
// Darkness dims the bodies; the lights layer (drawAlienLights) is what still burns.
import { path, sym, ink, lin, rgba, shade, mix, neon, eye, bloom, gloss, line, ellipse, both, TAU } from './kit.js';

// Black hull lit faintly from above, a cold rim of the drone's own colour along its top edge.
const hull = (g, c, top, bot) => lin(g, 0, top, 0, bot, [
  [0, mix('#3c3a5c', c, 0.18)], [0.35, '#1b1a2e'], [1, '#07060e'],
]);

function rim(b, c, pts) {
  path(b, pts, true);
  line(b, rgba(shade(c, 0.3), 0.75), 1.6);
}

function thrust(l, x, y, c, f, r = 9) {
  eye(l, x, y, r * 0.35, c, 2.6 + f * 0.8);
  bloom(l, x, y + 6, r * 1.6, c, 0.35);
}

// A wide cruiser: canopy, light bar across the nose, headlamps, turbines underneath.
function grunt(b, l, f, c) {
  const body = sym([[0, -12], [13, -12], [22, -5], [30, 3], [27, 11], [14, 14], [0, 14]]);
  both((s) => {
    ellipse(b, s * 24, 11, 7, 6);
    ink(b, hull(b, c, 5, 17), 2.5);
  });
  path(b, body);
  ink(b, hull(b, c, -12, 14));
  b.beginPath();
  b.ellipse(0, -12, 12, 9, 0, Math.PI, 0);
  ink(b, lin(b, 0, -21, 0, -12, [[0, rgba(c, 0.55)], [1, '#0c1626']]), 2.5);
  gloss(b, -4, -16, 5, 2.2, 0.45);
  rim(b, c, [[-21, -5], [-13, -12], [13, -12], [21, -5]]);
  path(l, [[-19, 3], [19, 3]], true);
  neon(l, c, 2.4);
  both((s) => {
    eye(l, s * 9, 9, 2.2, '#ffffff', 2.2);
    thrust(l, s * 24, 15, c, f);
  });
  if (!f) eye(l, 0, -20, 1.6, '#ff3a5a', 3);
}

// A dart diving nose-first: swept wings outlined in neon, the engine burning at its tail.
function diver(b, l, f, c) {
  const flex = f ? 3 : 0;
  const wing = sym([[0, 30], [7, 8], [28, -16 + flex], [24, -22 + flex], [7, -14], [4, -26]]);
  path(b, wing);
  ink(b, hull(b, c, -26, 30));
  path(b, sym([[0, 22], [4, 6], [3, -10]]));
  b.fillStyle = lin(b, 0, -10, 0, 22, [[0, '#0a1020'], [0.6, rgba(c, 0.5)], [1, '#1a0a1a']]);
  b.fill();
  rim(b, c, [[-24, -22 + flex], [-7, -14], [-4, -26], [4, -26], [7, -14], [24, -22 + flex]]);
  both((s) => {
    path(l, [[0, 30], [s * 7, 8], [s * 28, -16 + flex]], true);
    neon(l, c, 2.2);
  });
  eye(l, 0, 24, 1.8, '#ffffff', 2.4);
  thrust(l, 0, -27, c, f, 10 + f * 3);
}

// A patrol car with a siren bar on its roof (the two lamps swap each frame) and a gun beneath.
function gunner(b, l, f, c) {
  both((s) => {
    path(b, [[s * 4, 12], [s * 7, 12], [s * 7, 25], [s * 4, 25]]);
    ink(b, '#141320', 2.5);
  });
  path(b, sym([[0, -12], [20, -12], [27, -3], [27, 9], [20, 15], [0, 15]]));
  ink(b, hull(b, c, -12, 15));
  b.beginPath();
  b.roundRect(-19, -21, 38, 8, 3);
  ink(b, '#141320', 2.5);
  rim(b, c, [[-26, -3], [-20, -12], [20, -12], [26, -3]]);
  path(b, sym([[0, -6], [14, -6], [18, 2], [0, 2]]));
  b.fillStyle = lin(b, 0, -6, 0, 2, [[0, rgba(c, 0.35)], [1, '#06080e']]);
  b.fill();
  path(l, [[-23, 9], [23, 9]], true);
  neon(l, c, 2);
  const [left, right] = f ? ['#ffffff', c] : [c, '#ffffff'];
  path(l, [[-15, -17], [-4, -17]], true);
  neon(l, left, 3.2);
  path(l, [[4, -17], [15, -17]], true);
  neon(l, right, 3.2);
  both((s) => eye(l, s * 5.5, 24, 1.6, c, 2.5));
  both((s) => eye(l, s * 10, -1, 1.8, '#ffffff', 2));
}

// An armoured transport: a heavy octagon, neon seams between its plates, a visor that sweeps.
function armored(b, l, f, c) {
  const oct = sym([[0, -26], [16, -26], [29, -13], [29, 13], [16, 24], [0, 24]]);
  path(b, oct);
  ink(b, hull(b, c, -26, 24), 3.2);
  path(b, sym([[0, -19], [12, -19], [22, -9], [22, 9], [12, 17], [0, 17]]));
  line(b, rgba('#000000', 0.6), 2);
  rim(b, c, [[-28, -13], [-16, -26], [16, -26], [28, -13]]);
  b.beginPath();
  b.roundRect(-17, -7, 34, 9, 4);
  ink(b, '#05040a', 2);
  for (const pts of [[[-22, -9], [-12, -19], [12, -19], [22, -9]], [[-22, 9], [-12, 17], [12, 17], [22, 9]]]) {
    path(l, pts, true);
    neon(l, c, 1.6, 0.85);
  }
  const x = f ? 7 : -7;
  path(l, [[x - 6, -2.5], [x + 6, -2.5]], true);
  neon(l, c, 3.2);
  eye(l, x, -2.5, 1.6, '#ffffff', 3);
  both((s) => eye(l, s * 26, 0, 1.4, '#ff3a5a', 3));
}

// A holo-billboard drone: four rotors carrying a glowing screen whose pattern flips each frame.
function carrier(b, l, f, c) {
  both((s) => {
    for (const y of [-19, 19]) { // rotors kept inside x +-30, the hit circle and a little
      path(b, [[s * 14, y * 0.7], [s * 20, y]], true);
      line(b, '#0c0b16', 4);
      ellipse(b, s * 21, y, 7, 2.6);
      ink(b, rgba('#8a88a8', 0.6), 2);
    }
  });
  b.beginPath();
  b.roundRect(-19, -16, 38, 32, 4);
  ink(b, '#0e0d1a', 3);
  b.beginPath();
  b.roundRect(-15, -12, 30, 24, 2);
  b.fillStyle = lin(b, 0, -12, 0, 12, [[0, mix('#1a1408', c, 0.35)], [1, '#0c0904']]);
  b.fill();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rgba(c, 0.16);
  l.fillRect(-15, -12, 30, 24);
  bloom(l, 0, 0, 30, c, 0.4);
  l.fillStyle = c; // the advert: a bar chart, then a ring
  if (f) {
    l.beginPath();
    l.arc(0, 0, 8, 0, TAU);
    l.arc(0, 0, 4, 0, TAU, true);
    l.fill();
  } else {
    for (const [x, h] of [[-9, 11], [-3, 17], [3, 8], [9, 14]]) l.fillRect(x - 2, 9 - h, 4, h);
  }
  b.fillStyle = rgba('#000000', 0.45);
  for (let y = -11; y < 12; y += 3) b.fillRect(-15, y, 30, 1);
  both((s) => both((t) => eye(l, s * 21, t * 19, 1.2, '#ffffff', 2.5)));
}

export default { rate: 2.5, bob: 2.5, halo: 0.22, grunt, diver, gunner, armored, carrier };
