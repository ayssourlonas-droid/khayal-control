// World 4, Ronin Moon: spirits of an ink-brush night. Paper lanterns that grin, a ninja riding a
// war kite, a straw-hat ronin, an empty helmet with a crest, a floating stone lantern. Thick brush
// outlines; paper and lantern-light glow from inside (lights layer, warm). They drift (bob).
import { path, sym, ink, lin, rad, rgba, shade, neon, eye, bloom, line, circle, ellipse, both, TAU } from './kit.js';

const FIRE = '#ffb04a';
const EMBER = '#ff5a3a';

// Paper lit from inside: hot middle, the paper colour, a darker rim.
const paper = (g, c, x, y, r) => rad(g, x, y, 0, r, [[0, shade(FIRE, 0.5)], [0.45, shade(c, 0.1)], [1, shade(c, -0.4)]]);

function slitEyes(b, l, y, gap, c, tilt = 3) {
  both((s) => {
    path(b, [[s * gap, y - tilt], [s * (gap + 7), y], [s * gap, y + 2]]);
    ink(b, '#1a0606', 1.6);
    path(l, [[s * gap, y - tilt + 0.6], [s * (gap + 6), y], [s * gap, y + 1.4]], true);
    neon(l, c, 1.2);
  });
}

// A paper lantern that has woken up: ribs, lacquer caps, burning eyes, a jagged grin.
function grunt(b, l, f, c) {
  path(b, [[0, -24], [0, -32]], true);
  line(b, '#1a0e0a', 2.5);
  ellipse(b, 0, 0, 20, 22);
  ink(b, paper(b, c, 0, 2, 22), 3.2);
  for (const y of [-14, -6, 2, 10]) {
    b.beginPath();
    b.ellipse(0, y, 19.5, 4, 0, 0, Math.PI);
    line(b, rgba('#5a3a20', 0.45), 1.2);
  }
  for (const y of [-23, 19]) {
    b.beginPath();
    b.roundRect(-10, y, 20, 5, 2);
    ink(b, '#1a0e0a', 2);
  }
  slitEyes(b, l, -6, 4, EMBER);
  const teeth = f ? [[-11, 5], [-7, 10], [-3, 6], [0, 11], [3, 6], [7, 10], [11, 5], [6, 13], [-6, 13]]
    : [[-11, 6], [-7, 9], [-3, 6], [0, 9], [3, 6], [7, 9], [11, 6], [5, 11], [-5, 11]];
  path(b, teeth);
  ink(b, '#1a0606', 1.6);
  path(l, teeth);
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rgba(FIRE, 0.9);
  l.fill();
  bloom(l, 0, 2, 26, FIRE, 0.35);
  bloom(l, 0, -30, 7 + f * 2, FIRE, 0.9);
}

// A ninja clinging to a red war kite, nose down, ribbons streaming behind.
function diver(b, l, f, c) {
  const wave = f ? 4 : -4;
  both((s) => {
    const tail = [[s * 2, -24], [s * 6 + wave, -30], [s * 4 - wave, -36], [s * 8 + wave * 0.5, -42]];
    path(b, tail, true);
    line(b, '#1a0606', 4);
    path(b, tail, true);
    line(b, s < 0 ? c : '#e8dcc8', 2);
  });
  const kite = [[0, -26], [24, -4], [0, 30], [-24, -4]];
  path(b, kite);
  ink(b, lin(b, 0, -26, 0, 30, [[0, shade(c, 0.25)], [0.6, c], [1, shade(c, -0.45)]]), 3);
  for (const s of [[[0, -26], [0, 30]], [[-24, -4], [24, -4]]]) {
    path(b, s, true);
    line(b, rgba('#3a1a0a', 0.8), 1.6);
  }
  b.beginPath(); // a brush circle left open where the stroke began and ended
  b.arc(0, 5, 8.5, -1.2, 4.6);
  line(b, rgba('#1a0606', 0.85), 3.4);
  both((s) => {
    circle(b, s * 21, -4, 3.4);
    ink(b, '#121016', 2);
  });
  circle(b, 0, -16, 7);
  ink(b, '#121016', 2.4);
  path(b, [[-5, -17], [5, -17]], true);
  line(b, '#e8dcc8', 2.4);
  eye(l, 0, -17, 1.4, '#ffffff', 3);
}

// A straw-hat ronin: the wide hat hides all but two embers; a throwing star ready at his chest.
function gunner(b, l, f, c) {
  const flap = f ? 2 : 0;
  path(b, sym([[0, -4], [12, -4], [18, 18 + flap], [10, 15], [5, 21 - flap], [0, 18]]));
  ink(b, lin(b, 0, -4, 0, 21, [[0, '#2a2028'], [1, '#0e0a10']]), 2.6);
  ellipse(b, 0, -6, 10, 7);
  ink(b, '#0a0608', 2);
  slitEyes(b, l, -5, 2, EMBER, 1.5);
  const hat = sym([[0, -26], [7, -22], [27, -10.5], [23.5, -7.5], [0, -8]]); // brim inside x +-29
  path(b, hat);
  ink(b, lin(b, 0, -26, 0, -7, [[0, shade(c, 0.35)], [0.7, c], [1, shade(c, -0.4)]]), 3);
  for (let i = -3; i <= 3; i++) {
    path(b, [[i * 2, -24], [i * 7.5, -8.5]], true);
    line(b, rgba('#5a4020', 0.45), 1);
  }
  b.save();
  b.translate(0, 8);
  b.rotate(f * 0.4);
  path(b, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const a = (i * TAU) / 8;
    return [Math.cos(a) * (i % 2 ? 2.4 : 7.5), Math.sin(a) * (i % 2 ? 2.4 : 7.5)];
  }));
  ink(b, lin(b, -7, -7, 7, 7, [[0, '#e8ecf4'], [1, '#6a7080']]), 1.6);
  b.restore();
  bloom(l, 0, 8, 12, '#ff8a6a', 0.35);
}

// An empty war helmet: a gold crescent crest, flared neck plates laced in red, a masked face.
function armored(b, l, f, c) {
  both((s) => {
    for (let k = 2; k >= 0; k--) {
      path(b, [[s * 12, -4 + k * 6], [s * (26 + k * 2), 2 + k * 7], [s * (24 + k * 2), 8 + k * 7], [s * 12, 4 + k * 6]]);
      ink(b, lin(b, 0, -4, 0, 24, [[0, shade(c, 0.3)], [1, shade(c, -0.45)]]), 2.4);
      path(b, [[s * 14, 1 + k * 6], [s * (23 + k * 2), 6 + k * 7]], true);
      line(b, '#c83a2a', 1.4);
    }
  });
  const crest = sym([[0, -15], [5, -21], [13, -29], [23, -37], [20, -27], [12, -18], [5, -13]]);
  path(b, crest);
  ink(b, lin(b, 0, -34, 0, -16, [[0, '#fff0a0'], [1, '#c8902a']]), 2.4);
  b.beginPath();
  b.arc(0, -4, 15, Math.PI, 0);
  b.closePath();
  ink(b, lin(b, 0, -19, 0, -4, [[0, shade(c, 0.5)], [1, shade(c, -0.3)]]), 3);
  b.beginPath();
  b.roundRect(-11, -5, 22, 21, 6);
  ink(b, lin(b, 0, -5, 0, 16, [[0, '#2a1416'], [1, '#100808']]), 2.6);
  for (const y of [9, 12]) {
    path(b, [[-6, y], [6, y]], true);
    line(b, rgba('#e8dcc8', 0.5), 1.2);
  }
  slitEyes(b, l, 2, 2, f ? '#ff3a2a' : EMBER, 2);
  bloom(l, 0, -27, 9, '#ffd27a', 0.4);
}

// A floating stone lantern: curved roof, a fire box burning gold, a short pillar.
function carrier(b, l, f, c) {
  const stone = (y0, y1) => lin(b, 0, y0, 0, y1, [[0, '#a8a090'], [1, '#4a443c']]);
  path(b, sym([[0, 10], [7, 10], [9, 22], [0, 22]]));
  ink(b, stone(10, 22), 2.4);
  b.beginPath();
  b.roundRect(-11, -8, 22, 18, 2);
  ink(b, stone(-8, 10), 2.6);
  b.beginPath();
  b.roundRect(-7, -5, 14, 12, 1);
  b.fillStyle = rad(b, 0, 1, 0, 9, [[0, '#ffffff'], [0.5, c], [1, shade(c, -0.3)]]);
  b.fill();
  path(b, sym([[0, -28], [4, -24], [16, -16], [27, -12], [26, -9], [14, -10], [0, -10]]));
  ink(b, stone(-28, -9), 3);
  circle(b, 0, -29, 3);
  ink(b, '#8a8274', 2);
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rgba(c, 0.85);
  l.fillRect(-7, -5, 14, 12);
  bloom(l, 0, 1, 30, c, 0.55 + f * 0.15);
  path(l, [[-7, 7], [7, 7]], true);
  neon(l, '#ffffff', 1, 0.6);
}

export default { rate: 2, bob: 3, halo: 0.22, crack: '#3a1a0a', grunt, diver, gunner, armored, carrier };
