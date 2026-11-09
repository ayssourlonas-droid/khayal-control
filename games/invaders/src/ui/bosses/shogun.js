// World 4, Ronin Moon: the Shogun mecha. A giant suit of lacquered armour walking the ink night:
// a horned helmet with a flame crest and a war mask whose eyes are embers, laced lamellar plates in
// red-black and gold, great square shoulder guards, two long blades held point down at its sides
// (their edges glow red-hot: weak points) and a furnace heart under a brush-circle (the core). Thick
// brush outlines like the aliens; its fighting spirit burns as a red aura that grows by phase.
import { path, sym, ink, lin, rad, line, eye, bloom, neon, rgba, shade, both, rrect, seams, TAU } from './kit.js';
import { glow, hash } from '../sprites.js';

const LACQUER = '#7a1a16';
const IRON = '#2a2226';
const GOLD = '#d8a640';
const EMBER = '#ff4a4a';
const FIRE = '#ffb04a';

const lacquer = (g, c, top, bot) => lin(g, 0, top, 0, bot, [[0, shade(c, 0.35)], [0.3, c], [1, shade(c, -0.6)]]);

// Rows of laced lames filling a box: each a lacquered strip, gold lacing in pairs between.
function lames(b, x, y, w, h, rows, c = LACQUER) {
  const rh = h / rows;
  for (let i = 0; i < rows; i++) {
    rrect(b, x, y + i * rh, w, rh + 1, 3);
    ink(b, lacquer(b, c, y + i * rh, y + (i + 1) * rh), 2.2);
    for (let lx = x + 8; lx < x + w - 4; lx += 12) {
      path(b, [[lx, y + i * rh + rh - 3], [lx + 4, y + i * rh + rh + 3]], true);
      line(b, GOLD, 1.6);
    }
  }
}

function hull(b, l) {
  const bone = (pts, w) => {
    for (const [c, k] of [['#0a0c16', 5], [IRON, 0]]) {
      path(b, pts, true);
      line(b, c, w + k);
    }
  };
  bloom(l, 0, -20, 260, EMBER, 0.12);
  bone([[0, -150], [0, 40]], 34);
  both((s) => {
    bone([[s * 150, -62], [s * 210, -46], [s * 262, -40]], 26);
    bone([[s * 40, 40], [s * 120, 110]], 34);
    path(b, [[s * 262, -40], [s * 284, -40]], true);
    line(b, '#0a0c16', 26);
    rrect(b, s * 270 - 15, -56, 30, 30, 8);
    ink(b, lacquer(b, IRON, -56, -26), 3);
    path(b, [[s * 263, -48], [s * 277, -48]], true);
    line(b, GOLD, 2);
    lames(b, s > 0 ? 46 : -122, 34, 76, 66, 3);
  });
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) eye(l, s * (182 + i * 18), -50, 1.4, FIRE, 2.2);
}

// The helmet: a lacquered bowl with ridges, swept side flaps, two horns and a flame crest in gold on
// its brow, under it a war mask with ember eyes. Nothing rises above y -48 (5 px over the rect), so
// at rest (helm centre y 150) the crest clears the boss bar's panel (y 97) with room to spare.
function helm(b, l) {
  both((s) => {
    path(b, [[s * 30, -26], [s * 50, -42], [s * 62, -46], [s * 47, -34], [s * 40, -22]]);
    ink(b, lin(b, 0, -46, 0, -22, [[0, '#f8f0e0'], [1, '#8a7a60']]), 2.5);
    path(b, [[s * 40, -14], [s * 74, -24], [s * 70, 8], [s * 44, 12]]);
    ink(b, lacquer(b, LACQUER, -24, 12), 3);
    path(b, [[s * 46, -8], [s * 68, -14]], true);
    line(b, GOLD, 2);
  });
  b.beginPath();
  b.ellipse(0, -10, 48, 34, 0, Math.PI, 0);
  b.lineTo(48, 4);
  b.lineTo(-48, 4);
  b.closePath();
  ink(b, lacquer(b, '#3a1418', -44, 4), 3.5);
  for (let x = -36; x <= 36; x += 12) {
    path(b, [[x * 0.9, -40 + Math.abs(x) * 0.3], [x, 2]], true);
    line(b, rgba('#000000', 0.45), 2);
  }
  path(b, sym([[0, -4], [9, -24], [4, -33], [13, -30], [19, -48], [23, -26], [15, -4]])); // the crest
  ink(b, lin(b, 0, -48, 0, -4, [[0, '#fff0b0'], [0.5, GOLD], [1, shade(GOLD, -0.5)]]), 2.5);
  path(b, sym([[0, 4], [30, 4], [34, 22], [22, 42], [0, 46]]));
  ink(b, lin(b, 0, 4, 0, 46, [[0, '#2a1a1c'], [1, '#0a0608']]), 3);
  both((s) => {
    path(b, [[s * 8, 16], [s * 26, 12], [s * 24, 19], [s * 10, 21]]);
    ink(b, '#1a0404', 1.6);
    path(l, [[s * 10, 18], [s * 24, 15]], true);
    neon(l, EMBER, 2.4);
  });
  path(b, [[-14, 32], [-6, 36], [0, 32], [6, 36], [14, 32]], true);
  line(b, GOLD, 2);
  bloom(l, 0, 16, 40, EMBER, 0.4);
}

// The cuirass: lamellar rows, a gold-trimmed breast plate, lacing down the middle.
function torso(b, l) {
  path(b, sym([[0, -76], [92, -70], [100, -20], [88, 76], [0, 80]]));
  ink(b, lacquer(b, '#2a1416', -76, 80), 3.5);
  b.save();
  path(b, sym([[0, -76], [92, -70], [100, -20], [88, 76], [0, 80]]));
  b.clip();
  lames(b, -100, -10, 200, 90, 4);
  b.restore();
  path(b, sym([[0, -70], [70, -64], [76, -16], [0, -10]]));
  ink(b, lacquer(b, LACQUER, -70, -10), 3);
  path(b, sym([[0, -66], [64, -60], [70, -18], [0, -14]]), true);
  line(b, GOLD, 2);
  for (const [c, w] of [['#0a0606', 7], [GOLD, 4]]) { // a brush circle in gold leaf, an ember inside
    b.beginPath();
    b.arc(0, -40, 16, 0.3, TAU - 0.2);
    line(b, c, w);
  }
  eye(l, 0, -40, 3, FIRE, 3);
}

// A shoulder guard (drawn as the left one): a broad square of laced lames, tilted out.
function pauldron(b, l) {
  b.save();
  b.rotate(0.12);
  rrect(b, -52, -54, 104, 18, 5);
  ink(b, lacquer(b, '#3a1418', -54, -36), 3);
  lames(b, -50, -38, 100, 92, 5);
  path(b, [[-50, -36], [50, -36]], true);
  line(b, GOLD, 2.5);
  b.restore();
}

// The furnace heart: a round iron grate, the fire visible through it, a gold brush circle round it.
function core(b, l) {
  b.beginPath();
  b.arc(0, 0, 40, 0, TAU);
  ink(b, rad(b, 0, 0, 0, 40, [[0, '#5a1a10'], [1, '#1a0808']]), 3.5);
  for (let i = 0; i < 6; i++) seams(b, [[[-34, -28 + i * 11], [34, -28 + i * 11]]], 0.9, 3);
  bloom(l, 0, 0, 60, EMBER, 0.8);
  eye(l, 0, 0, 18, FIRE, 2);
  b.beginPath();
  b.arc(0, 0, 40, 0.5, TAU - 0.15);
  line(b, GOLD, 4);
}

// A leg (drawn as the left one): a laced thigh skirt, an iron knee, a lacquered shin, a broad foot.
function leg(b, l) {
  lames(b, -40, -84, 80, 70, 4);
  rrect(b, -16, -16, 32, 24, 8);
  ink(b, lacquer(b, IRON, -16, 8), 3);
  path(b, [[-30, 8], [30, 8], [24, 64], [-24, 64]]);
  ink(b, lacquer(b, LACQUER, 8, 64), 3);
  for (const y of [20, 34, 48]) {
    path(b, [[-22, y], [22, y]], true);
    line(b, GOLD, 1.6);
  }
  path(b, [[-42, 66], [34, 66], [42, 84], [-44, 84]]);
  ink(b, lacquer(b, IRON, 66, 84), 3);
}

// A blade held point down (drawn as the left one): a gold guard, a long steel blade with a temper
// line, its edge glowing red-hot along its length.
function blade(b, l, p) {
  const top = -p.h / 2;
  path(b, [[-6, top + 30], [6, top + 30], [5, p.h / 2 - 16], [0, p.h / 2], [-7, p.h / 2 - 22]]);
  ink(b, lin(b, -7, 0, 6, 0, [[0, '#c8ccd8'], [0.5, '#f4f6ff'], [1, '#6a7080']]), 2.5);
  path(b, [[1, top + 34], [1, p.h / 2 - 20]], true);
  line(b, rgba('#ffffff', 0.7), 1.2);
  b.beginPath();
  b.ellipse(0, top + 28, 18, 6, 0, 0, TAU);
  ink(b, lin(b, 0, top + 22, 0, top + 34, [[0, '#fff0b0'], [1, shade(GOLD, -0.4)]]), 2.5);
  rrect(b, -6, top, 12, 24, 3);
  ink(b, '#1a0e10', 2.5);
  for (let y = top + 4; y < top + 22; y += 6) {
    path(b, [[-6, y], [6, y + 4]], true);
    line(b, GOLD, 1.4);
  }
  path(l, [[-6, top + 36], [-7, p.h / 2 - 22], [0, p.h / 2]], true);
  neon(l, EMBER, 2.2);
  for (let i = 0; i < 5; i++) bloom(l, -5, top + 60 + i * 38, 22, EMBER, 0.4);
}

// The spirit aura, rising by phase: a red glow round the whole figure, then gold-edged.
const aura = (a, gold) => (l) => {
  bloom(l, 0, -30, 330, EMBER, a);
  if (gold) bloom(l, 0, -120, 200, FIRE, 0.18);
};

export default {
  pad: 60,
  hull,
  parts: { helm, torso, pauldron, core, leg, blade },
  rage: [null, aura(0.22, false), aura(0.32, true)],
  // Embers flickering up off the armour once it fights in earnest.
  live(ctx, b, t, k) {
    if (!b.phase) return;
    for (let i = 0; i < 8; i++) {
      const life = (t * 0.6 + hash(i * 7)) % 1;
      const x = (hash(i * 3) - 0.5) * 420;
      const y = 120 - life * 340;
      const r = 10 + 10 * hash(i * 5);
      ctx.globalAlpha = k * Math.sin(Math.PI * life) * (0.4 + 0.2 * b.phase);
      ctx.drawImage(glow(i % 2 ? EMBER : FIRE), x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  },
};
