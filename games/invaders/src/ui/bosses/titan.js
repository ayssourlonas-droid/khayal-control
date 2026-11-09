// World 7, Iron Dawn: the Endoskeleton titan. A war machine stripped to its frame: polished chrome
// over dark steel like the aliens, a spine of stacked vertebrae, a ribcage round a red reactor, a
// massive shoulder yoke with exhaust stacks, two long hydraulic arms ending in rotary cannons with
// red-hot muzzles, and an armoured machine head (angular brow, two deep red lenses, a slatted jaw).
// The weak points burn red; the reactor heats as the fight goes on until the whole frame glows.
import { path, sym, ink, lin, rad, line, eye, bloom, gloss, chrome, rgba, shade, both, rrect, rivets, slats, TAU } from './kit.js';
import { glow } from '../sprites.js';

const RED = '#ff2a1a';
const HOT = '#ff6a3a';
const STEEL = '#6a7080';
const DARK = '#24262e';

const steel = (g, c, top, bot) => lin(g, 0, top, 0, bot, [[0, shade(c, 0.6)], [0.35, c], [1, shade(c, -0.7)]]);

// A chrome bar from a to b, w thick: dark outline, chrome fill across its width, a bright streak.
function bar(g, a, b2, w, c = STEEL) {
  path(g, [a, b2], true);
  line(g, '#0a0c16', w + 5);
  path(g, [a, b2], true);
  line(g, shade(c, -0.3), w);
  path(g, [[a[0] - w * 0.18, a[1]], [b2[0] - w * 0.18, b2[1]]], true);
  line(g, rgba('#ffffff', 0.55), w * 0.22);
}

function hull(b, l) {
  for (let i = 0; i < 9; i++) {
    const y = -100 + i * 26;
    rrect(b, -16 + i * 0.5, y, 32 - i, 20, 5);
    ink(b, steel(b, STEEL, y, y + 20), 2.5);
  }
  bloom(l, 0, 40, 120, RED, 0.35);
  b.beginPath();
  b.arc(0, 40, 34, 0, TAU);
  ink(b, rad(b, 0, 40, 0, 34, [[0, '#5a1008'], [1, '#14060a']]), 3);
  eye(l, 0, 40, 18, HOT, 2.4);
  path(b, sym([[0, 150], [70, 140], [96, 176], [0, 196]]));
  ink(b, steel(b, DARK, 140, 196), 3);
  both((s) => {
    bar(b, [s * 40, 150], [s * 74, 196], 18);
    path(b, [[s * 60, -130], [s * 200, -110], [s * 230, -100]], true);
    line(b, '#0a0c16', 8);
    for (let i = 0; i < 3; i++) {
      path(b, [[s * 30, -10 + i * 30], [s * (150 + i * 12), -60 + i * 50], [s * 205, -40 + i * 60]], true);
      line(b, rgba('#0a0c16', 0.9), 5);
    }
  });
}

// The shoulder yoke: a broad chrome beam, hydraulic rams, two exhaust stacks, red running lights.
function shoulders(b, l) {
  both((s) => {
    rrect(b, s * 200 - 22, -54, 44, 34, 4);
    ink(b, steel(b, DARK, -54, -20), 2.5);
    slats(b, s * 200 - 22, -54, 44, 34, 5, 0.7, 2);
    bloom(l, s * 200, -52, 30, HOT, 0.4);
  });
  path(b, sym([[0, -26], [230, -24], [280, -4], [272, 22], [120, 28], [0, 30]]));
  ink(b, chrome(b, STEEL, -280, 280), 3.5);
  path(b, sym([[0, -26], [230, -24], [280, -4], [272, 22], [120, 28], [0, 30]]));
  b.fillStyle = lin(b, 0, -26, 0, 30, [[0, rgba('#ffffff', 0.25)], [0.4, rgba('#ffffff', 0)], [1, rgba('#000000', 0.5)]]);
  b.fill();
  both((s) => {
    for (let x = 40; x < 260; x += 44) rivets(b, [[s * x, -16], [s * x, 18]], 2);
    path(b, [[s * 70, -24], [s * 70, 28]], true);
    line(b, rgba('#000000', 0.5), 2);
    for (let x = 90; x < 240; x += 30) eye(l, s * x, 2, 1.8, RED, 2.6);
  });
  gloss(b, -120, -14, 110, 5, 0.45);
}

// The head: an angular chrome cranium, a heavy brow over two deep red lenses, a slatted jaw.
function skull(b, l) {
  path(b, sym([[0, -54], [36, -50], [56, -26], [58, 8], [44, 28], [30, 50], [0, 54]]));
  ink(b, chrome(b, '#8a92a0', -60, 60), 3.5);
  path(b, sym([[0, -54], [36, -50], [56, -26], [58, 8], [44, 28], [30, 50], [0, 54]]));
  b.fillStyle = lin(b, 0, -54, 0, 54, [[0, rgba('#ffffff', 0.3)], [0.5, rgba('#ffffff', 0)], [1, rgba('#000000', 0.45)]]);
  b.fill();
  path(b, sym([[0, -14], [50, -18], [46, -4], [0, 0]]));
  ink(b, steel(b, DARK, -18, 0), 2.5);
  both((s) => {
    path(b, [[s * 10, 0], [s * 42, -2], [s * 38, 18], [s * 14, 18]]);
    ink(b, '#06070a', 2.5);
    eye(l, s * 26, 8, 6.5, RED, 3.6);
    eye(l, s * 26, 8, 2.2, '#ffffff', 1.5);
  });
  rrect(b, -26, 26, 52, 22, 4);
  ink(b, steel(b, DARK, 26, 48), 2.5);
  slats(b, -26, 26, 52, 22, 7, 0.8, 2.5);
  path(b, [[0, -50], [0, -16]], true);
  line(b, rgba('#000000', 0.4), 2);
  gloss(b, -22, -36, 20, 8, 0.6, -0.4);
}

// One side of the ribcage (drawn as the left one): curved chrome ribs off the spine.
function rib(b, l) {
  for (let i = 0; i < 5; i++) {
    const y = -62 + i * 30;
    b.beginPath();
    b.moveTo(30, y);
    b.quadraticCurveTo(-34, y - 6, -26, y + 18);
    line(b, '#0a0c16', 14);
    b.beginPath();
    b.moveTo(30, y);
    b.quadraticCurveTo(-34, y - 6, -26, y + 18);
    line(b, shade(STEEL, 0.2), 9);
    b.beginPath();
    b.moveTo(28, y - 2);
    b.quadraticCurveTo(-30, y - 8, -28, y + 12);
    line(b, rgba('#ffffff', 0.5), 2);
  }
  bloom(l, 20, 10, 50, RED, 0.25);
}

// An arm (drawn as the left one): a shoulder joint, a chrome upper arm and a forearm of twin
// hydraulic rams, an elbow with a lamp.
function arm(b, l) {
  b.beginPath();
  b.arc(0, -118, 30, 0, TAU);
  ink(b, chrome(b, STEEL, -30, 30), 3);
  bar(b, [0, -110], [0, -10], 46);
  rrect(b, -27, -92, 54, 40, 6);
  ink(b, steel(b, DARK, -92, -52), 2.5);
  slats(b, -27, -92, 54, 40, 6, 0.7, 2);
  b.beginPath();
  b.arc(0, -4, 24, 0, TAU);
  ink(b, steel(b, DARK, -28, 20), 3);
  eye(l, 0, -4, 5, RED, 3);
  for (const dx of [-17, 17]) bar(b, [dx, 10], [dx * 0.7, 128], 16, '#8a92a0');
  path(b, [[-30, 50], [30, 50], [26, 110], [-26, 110]]);
  ink(b, chrome(b, STEEL, -30, 30), 3);
  path(b, [[-30, 50], [30, 50], [26, 110], [-26, 110]]);
  b.fillStyle = lin(b, 0, 50, 0, 110, [[0, rgba('#ffffff', 0.2)], [1, rgba('#000000', 0.45)]]);
  b.fill();
  rivets(b, [[-20, 58], [20, 58], [-18, 100], [18, 100]], 2);
  path(b, [[-24, 80], [24, 80]], true);
  line(b, rgba('#000000', 0.5), 2);
}

// A rotary cannon (drawn as the left one): a drum of six barrels, glowing red-hot at the muzzles.
function cannon(b, l) {
  rrect(b, -40, -28, 80, 26, 8);
  ink(b, chrome(b, STEEL, -40, 40), 3);
  for (let i = 0; i < 5; i++) {
    const x = -24 + i * 12;
    rrect(b, x - 5, -4, 10, 30, 3);
    ink(b, lin(b, x - 5, 0, x + 5, 0, [[0, '#3a3e48'], [0.4, '#c8ccd8'], [1, '#2a2c34']]), 2);
    eye(l, x, 26, 3.2, i === 2 ? '#ffd0a0' : HOT, 2.4);
  }
  b.fillStyle = lin(b, 0, 8, 0, 26, [[0, rgba(RED, 0)], [1, rgba(RED, 0.6)]]);
  b.fillRect(-30, 8, 60, 18);
  bloom(l, 0, 24, 44, RED, 0.6);
  gloss(b, -12, -20, 22, 4, 0.5);
}

const heat = (a) => (l) => {
  bloom(l, 0, 40, 200, RED, a);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) eye(l, s * (40 + i * 30), -20 + i * 30, 2.4, HOT, 3);
};

export default {
  pad: 60,
  crack: HOT,
  hull,
  parts: { shoulders, skull, rib, arm, cannon },
  rage: [null, heat(0.3), (l) => {
    heat(0.5)(l);
    bloom(l, 0, -40, 320, RED, 0.18);
  }],
  // The reactor beating, heat shimmering off the stacks.
  live(ctx, b, t, k) {
    const beat = Math.max(0, Math.sin(t * (3 + b.phase * 2))) ** 4;
    ctx.globalAlpha = k * (0.3 + 0.5 * beat);
    ctx.drawImage(glow(RED), -60, -20, 120, 120);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const life = (t * 0.9 + i / 3 + (s > 0 ? 0.5 : 0)) % 1;
        const r = 12 + life * 16;
        ctx.globalAlpha = k * (1 - life) * 0.45;
        ctx.drawImage(glow(HOT), s * 200 - r, -205 - life * 50 - r, r * 2, r * 2);
      }
    }
    ctx.globalAlpha = 1;
  },
};
