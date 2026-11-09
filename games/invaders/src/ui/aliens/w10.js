// World 10, Hollow Night: the night's guests. A sheet ghost with a wailing mouth and eye holes that
// burn witch-fire green, and a bat with ragged wings and red eyes; the jack-o'-lantern spitting embers
// and the coffin are in w10-2.js, the cauldron in w10-3.js. Everything that glows is on the lights
// layer, so the eye holes, the carved faces, the brew and the embers are what Hollow Night's darkness
// leaves of them. Sprites face down, toward the ship.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { gunner, armored } from './w10-2.js';
import { carrier } from './w10-3.js';

// A sheet ghost: a dome of cloth falling to a rippling hem that sways between frames, two arms
// lifted under the sheet, folds hanging from the shoulders, eye holes and a wailing mouth.
function grunt(b, l, f, c) {
  const up = f ? -2 : 0;
  const hem = (x) => 25 + up + Math.sin((x + 26) * 0.42 + f * Math.PI) * 4.2;
  for (let i = 0; i < 3; i++) { // wisps trailing off the hem
    const x = -12 + i * 12;
    b.beginPath();
    b.moveTo(x, hem(x));
    b.quadraticCurveTo(x + (f ? 4 : -4), hem(x) + 6, x + (f ? -1 : 2), hem(x) + 10 + (i % 2) * 4);
    line(b, rgba(c, 0.4), 2.6);
  }
  both((s) => { // an arm under the sheet, raised on one beat and lowered on the other
    b.save();
    b.translate(s * 24, 1);
    b.rotate(s * (f ? -0.95 : -0.35));
    ellipse(b, 0, 6, 5.6, 12);
    ink(b, lin(b, 0, -6, 0, 18, [[0, shade(c, 0.15)], [1, shade(c, -0.55)]]), 2.6);
    b.fillStyle = rgba('#2a2a58', 0.3);
    b.fill();
    b.restore();
  });
  b.beginPath();
  b.moveTo(-25, 18 + up);
  b.bezierCurveTo(-29, -18, -15, -31, 0, -31);
  b.bezierCurveTo(15, -31, 29, -18, 25, 18 + up);
  for (let x = 25; x >= -25; x -= 2.5) b.lineTo(x, hem(x));
  b.closePath();
  ink(b, lin(b, 0, -31, 0, 30, [[0, shade(c, 0.3)], [0.45, c], [1, shade(c, -0.5)]]), 3);
  b.save();
  b.clip();
  b.fillStyle = rad(b, 0, -4, 6, 34, [[0, rgba('#ffffff', 0)], [1, rgba('#2a2a58', 0.55)]], -8, -14); // the cloth turns away at its edges
  b.fillRect(-32, -34, 64, 70);
  for (const [x, bend] of [[-17, -3], [-8, 2], [8, -2], [17, 3]]) { // folds hanging from the shoulders
    b.beginPath();
    b.moveTo(x * 0.5, -14);
    b.quadraticCurveTo(x + bend, 4, x * 1.15 + bend, 28);
    line(b, rgba('#1a1a44', 0.22), 3);
    b.beginPath();
    b.moveTo(x * 0.5 + 2.5, -14);
    b.quadraticCurveTo(x + bend + 2.5, 4, x * 1.15 + bend + 2.5, 28);
    line(b, rgba('#ffffff', 0.3), 1.2);
  }
  for (let x = -22; x < 24; x += 2.5) { // a crease in every dip of the hem
    if (Math.sin((x + 26) * 0.42 + f * Math.PI) < 0.8) continue;
    b.beginPath();
    b.moveTo(x, hem(x));
    b.lineTo(x * 0.8, hem(x) - 10);
    line(b, rgba('#1a1a44', 0.28), 1.6);
  }
  b.restore();
  gloss(b, -9, -21, 9, 4.4, 0.6, -0.4);
  both((s) => {
    ellipse(b, s * 9, -8, 4.8, 7.6);
    ink(b, '#0a0612', 1.8);
    ellipse(l, s * 9, -8, 4.6, 7.4);
    l.fillStyle = rad(l, s * 9, -8, 0, 8, [[0, '#ffffff'], [0.3, '#a8ffa0'], [0.7, rgba('#5aff4a', 0.8)], [1, rgba('#5aff4a', 0)]]);
    l.fill();
    eye(l, s * 9, -8, 2.6 + f * 0.5, '#7dff5a', 4.2);
  });
  ellipse(b, 0, 10, 3.6 + f * 1.4, 5.4 + f * 3);
  ink(b, '#0a0612', 1.8);
  ellipse(l, 0, 10, 3.2 + f * 1.4, 5 + f * 3);
  l.fillStyle = rgba('#5aff4a', 0.28 + f * 0.1);
  l.fill();
  bloom(l, 0, -2, 36, '#aef0c8', 0.2);
}

// A bat: wings of torn membrane on four finger bones, beating up and down; a furred body, big ears,
// two red eyes burning in sockets and a pair of fangs.
function diver(b, l, f, c) {
  const ty = f ? -22 : 9; // wing tips: up, then down
  const dark = shade(c, -0.72);
  both((s) => {
    const wrist = [s * 21, ty * 0.5 - 12];
    const tips = [[s * 44, ty - 2], [s * 41, ty + 14], [s * 32, ty + 25], [s * 19, ty + 27]];
    const membrane = (g) => {
      g.beginPath();
      g.moveTo(s * 6, -7);
      g.lineTo(...wrist);
      g.lineTo(...tips[0]);
      g.quadraticCurveTo(s * 36, ty + 3, ...tips[1]); // the trailing edge, scalloped and torn
      g.lineTo(s * 37, ty + 11);
      g.lineTo(s * 36, ty + 18);
      g.quadraticCurveTo(s * 37, ty + 20, ...tips[2]);
      g.quadraticCurveTo(s * 26, ty + 17, ...tips[3]);
      g.quadraticCurveTo(s * 11, ty + 18, s * 7, 12);
      g.closePath();
    };
    membrane(b);
    ink(b, lin(b, 0, 0, s * 44, 0, [[0, shade(c, -0.42)], [0.55, dark], [1, shade(c, -0.82)]]), 2.8);
    membrane(l); // a thread of crimson along the torn edge: the wings hold their shape in the dark
    l.save();
    l.globalCompositeOperation = 'lighter';
    line(l, rgba(c, 0.32), 1.4);
    l.restore();
    for (const t of tips) { // the finger bones, a thin lit edge on each
      path(b, [wrist, t], true);
      line(b, INK, 3.2);
      line(b, shade(c, -0.35), 1.4);
    }
    path(b, [[s * 6, -7], wrist], true);
    line(b, INK, 4);
    line(b, shade(c, -0.25), 2.2);
    path(b, [wrist, [wrist[0] + s * 4, wrist[1] - 7], [wrist[0] + s, wrist[1] - 2]]);
    ink(b, '#d8d0c8', 1.2); // the thumb claw
  });
  ellipse(b, 0, 4, 9.5, 14); // the body, furred
  ink(b, rad(b, -3, -2, 1, 16, [[0, shade(c, -0.15)], [1, shade(c, -0.8)]]), 2.6);
  b.save();
  b.clip();
  for (let i = 0; i < 16; i++) {
    const x = -8 + (i % 4) * 5.3;
    const y = -7 + Math.floor(i / 4) * 5.8;
    path(b, [[x, y], [x + 1.6 * (i % 2 ? -1 : 1), y + 4]], true);
    line(b, rgba('#ffffff', 0.17), 1);
  }
  b.restore();
  both((s) => { // ears, the inside lit
    path(b, [[s * 3, -16], [s * 8, -30], [s * 11, -13]]);
    ink(b, shade(c, -0.45), 2.4);
    path(b, [[s * 5, -17], [s * 8.2, -25], [s * 9.4, -15]]);
    b.fillStyle = rgba('#ff6a8a', 0.5);
    b.fill();
  });
  ellipse(b, 0, -9, 9, 8.4);
  ink(b, rad(b, -2, -12, 1, 11, [[0, shade(c, -0.2)], [1, shade(c, -0.78)]]), 2.6);
  ellipse(b, 0, -5, 4.6, 3.6);
  ink(b, shade(c, -0.55), 1.6);
  ellipse(b, 0, -6.4, 1.6, 1);
  b.fillStyle = INK;
  b.fill();
  both((s) => {
    path(b, [[s * 2, -3.6], [s * 1.3, 3.4], [s * 3.4, -2.4]]); // the fangs
    ink(b, '#f4efe4', 1);
    ellipse(b, s * 4.2, -11, 2.6, 2.1);
    ink(b, '#14020a', 1.3);
    eye(l, s * 4.2, -11, 1.6, '#ff2a3a', 3.8);
    path(b, [[s * 7.6, -15.4], [s * 1.4, -12.8]], true); // an angry brow
    line(b, INK, 1.8);
  });
  gloss(b, -3, -13, 4, 2, 0.35, -0.4);
  bloom(l, 0, -2, 26, '#ff2a3a', 0.12);
}

export default { rate: 2, bob: 2, halo: 0.2, crack: '#9dff5a', grunt, diver, gunner, armored, carrier };
