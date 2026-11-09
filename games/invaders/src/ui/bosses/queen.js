// World 5, Hive: the Hive queen. Glossy black chitin lit from within by acid bioluminescence, the
// aliens' material grown to a monarch: a crown of curved tusks, a ribbed thorax, veined membrane
// wings spread behind her, two scythe forelimbs, and the weak points glowing lime: a many-eyed head
// with mandibles round an acid mouth, and two translucent egg sacs with brood curled inside. Her
// veins light up as the fight goes on; acid drips from her jaws.
import { path, sym, ink, lin, rad, line, eye, bloom, neon, gloss, rgba, shade, both, ellipse, TAU } from './kit.js';
import { glow, hash } from '../sprites.js';

const ACID = '#c8ff3a';
const LIME = '#d8ff6a';
const CHITIN = '#3a4a42';

const chitin = (g, c, top, bot) => lin(g, 0, top, 0, bot, [[0, shade(c, 0.35)], [0.35, c], [1, '#040806']]);

// A curved tusk from (x, y) sweeping by (dx, dy), w wide at the root.
function tusk(b, x, y, dx, dy, w) {
  b.beginPath();
  b.moveTo(x - w / 2, y);
  b.quadraticCurveTo(x + dx * 0.2, y + dy * 0.7, x + dx, y + dy);
  b.quadraticCurveTo(x + dx * 0.5, y + dy * 0.4, x + w / 2, y);
  b.closePath();
  ink(b, chitin(b, CHITIN, y + dy, y), 2.5);
}

function veins(l, a, w) {
  for (let i = 0; i < 14; i++) {
    const s = i % 2 ? 1 : -1;
    const x0 = s * (30 + 20 * hash(i));
    const y0 = -60 + 80 * hash(i * 3);
    l.beginPath();
    l.moveTo(x0, y0);
    l.quadraticCurveTo(x0 + s * (70 + 90 * hash(i * 5)), y0 - 40 + 80 * hash(i * 7), x0 + s * (150 + 120 * hash(i * 9)), y0 - 80 + 120 * hash(i * 11));
    neon(l, ACID, w, a);
  }
}

function hull(b, l) {
  both((s) => {
    path(b, [[s * 60, -80], [s * 330, -150], [s * 320, -60], [s * 300, 40], [s * 120, 30]]);
    ink(b, lin(b, s * 60, 0, s * 330, 0, [[0, rgba('#1a2a22', 0.95)], [1, rgba('#2a3a30', 0.5)]]), 3);
    for (let i = 0; i < 5; i++) {
      path(b, [[s * 70, -60 + i * 18], [s * (320 - i * 6), -140 + i * 42]], true);
      line(b, rgba('#000000', 0.5), 2.5);
      path(l, [[s * 70, -60 + i * 18], [s * (320 - i * 6), -140 + i * 42]], true);
      neon(l, ACID, 0.8, 0.25);
    }
    for (let i = 0; i < 4; i++) {
      path(b, [[s * 90, 10 + i * 6], [s * (180 + i * 20), 40 + i * 14], [s * (210 + i * 20), 80 + i * 10]], true);
      line(b, '#050806', 9);
      path(b, [[s * 90, 10 + i * 6], [s * (180 + i * 20), 40 + i * 14], [s * (210 + i * 20), 80 + i * 10]], true);
      line(b, shade(CHITIN, -0.2), 5);
    }
  });
  ellipse(b, 0, -20, 120, 130);
  ink(b, chitin(b, '#2a3a32', -150, 110), 3);
  for (let y = -130; y < 100; y += 20) {
    b.beginPath();
    b.ellipse(0, y, 100 - Math.abs(y) * 0.3, 8, 0, 0, Math.PI);
    line(b, rgba('#000000', 0.5), 2);
  }
  bloom(l, 0, 0, 200, ACID, 0.1);
}

// The crown: a fan of curved tusks rising from a ridged band, glossy.
function crown(b, l) {
  for (let i = -4; i <= 4; i++) {
    const a = i / 4;
    tusk(b, a * 70, 10, a * 40 + Math.sign(a) * 20 * a * a, -50 + Math.abs(a) * 22, 22 - Math.abs(i) * 2);
  }
  path(b, sym([[0, -4], [90, 0], [100, 30], [0, 36]]));
  ink(b, chitin(b, CHITIN, -4, 36), 3);
  for (let x = -80; x <= 80; x += 20) {
    path(b, [[x, 2], [x * 1.05, 32]], true);
    line(b, rgba('#000000', 0.5), 2);
  }
  gloss(b, -30, 8, 40, 5, 0.4);
  for (let i = -2; i <= 2; i++) eye(l, i * 36, 18, 2.4, ACID, 3);
}

// The thorax: overlapping ribbed plates, glossy, with acid vents breathing between them.
function thorax(b, l) {
  path(b, sym([[0, -55], [100, -48], [130, -10], [110, 40], [60, 55], [0, 58]]));
  ink(b, chitin(b, CHITIN, -55, 58), 3.5);
  for (let i = 0; i < 4; i++) {
    const y = -40 + i * 24;
    b.beginPath();
    b.ellipse(0, y, 118 - i * 12, 18, 0, 0.1, Math.PI - 0.1);
    line(b, '#040806', 3);
    path(l, [[-70 + i * 8, y + 14], [70 - i * 8, y + 14]], true);
    neon(l, ACID, 1, 0.45);
  }
  both((s) => gloss(b, s * 60, -34, 30, 8, 0.45, s * 0.2));
  path(b, [[0, -52], [0, 54]], true);
  line(b, rgba('#000000', 0.4), 3);
}

// The head (facing down at the player): a broad carapace, six eyes, mandibles round an acid mouth.
function head(b, l) {
  both((s) => {
    path(b, [[s * 30, 20], [s * 56, 34], [s * 40, 58], [s * 14, 52], [s * 26, 40]]);
    ink(b, chitin(b, '#4a5a52', 20, 58), 2.5);
  });
  const shell = sym([[0, -54], [50, -46], [64, -10], [48, 26], [20, 40], [0, 42]]);
  path(b, shell);
  ink(b, chitin(b, '#2e3c36', -54, 42), 3.5);
  path(l, shell);
  neon(l, ACID, 1.4, 0.55);
  ellipse(b, 0, 26, 22, 18);
  ink(b, rad(b, 0, 26, 0, 22, [[0, '#6a9a10'], [1, '#0a1404']]), 2);
  bloom(l, 0, 28, 60, ACID, 0.85);
  eye(l, 0, 28, 9, LIME, 2.5);
  for (const [x, y, r] of [[20, -10, 6], [36, -22, 4.5], [40, 2, 4]]) {
    both((s) => {
      ellipse(b, s * x, y, r + 2, r + 1.5);
      ink(b, '#0a1004', 1.6);
      eye(l, s * x, y, r * 0.75, ACID, 2.6);
    });
  }
  gloss(b, -16, -36, 22, 8, 0.45, -0.2);
}

// An egg sac (drawn as the left one): a translucent veined bladder, something curled asleep inside.
function sac(b, l) {
  path(b, [[40, -10], [56, -26]], true);
  line(b, '#0a100c', 10);
  ellipse(b, -2, 4, 50, 44);
  ink(b, rad(b, -2, 4, 4, 50, [[0, '#6a8a20'], [0.6, '#2a4010'], [1, '#0e1806']]), 3);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, -2, 6, 0, 46, [[0, rgba(LIME, 0.55)], [0.7, rgba(ACID, 0.18)], [1, rgba(ACID, 0)]]);
  l.fillRect(-60, -50, 120, 110);
  l.restore();
  b.beginPath();
  b.arc(-4, 6, 16, 0.6, TAU - 0.4);
  line(b, rgba('#0a1404', 0.75), 7);
  ellipse(b, 8, -2, 7, 6);
  b.fillStyle = rgba('#0a1404', 0.75);
  b.fill();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.3;
    path(l, [[-2 + Math.cos(a) * 18, 4 + Math.sin(a) * 16], [-2 + Math.cos(a + 0.3) * 46, 4 + Math.sin(a + 0.3) * 40]], true);
    neon(l, ACID, 1, 0.5);
  }
  gloss(b, -20, -20, 18, 9, 0.6, -0.5);
}

// A scythe forelimb (drawn as the left one): segmented, ending in a hooked blade.
function claw(b, l) {
  const seg = [[16, -74], [4, -20], [-6, 30]];
  for (let i = 0; i < 2; i++) {
    path(b, [seg[i], seg[i + 1]], true);
    line(b, '#040806', 34);
    path(b, [seg[i], seg[i + 1]], true);
    line(b, shade(CHITIN, 0.1), 27);
    path(b, [[seg[i][0] - 6, seg[i][1] + 8], [seg[i + 1][0] - 6, seg[i + 1][1] - 8]], true);
    line(b, rgba('#ffffff', 0.3), 3);
    eye(l, seg[i + 1][0], seg[i + 1][1], 3, ACID, 3);
  }
  path(b, [[-22, 22], [14, 26], [18, 52], [0, 80], [-34, 70], [-12, 60], [-10, 44]]);
  ink(b, lin(b, 0, 24, 0, 78, [[0, '#6a7a70'], [0.5, '#c8d8c0'], [1, '#3a4a42']]), 3);
  path(b, [[0, 30], [4, 52], [-4, 72]], true);
  line(b, rgba('#ffffff', 0.5), 1.4);
}

const glowVeins = (a, w) => (l) => {
  veins(l, a, w);
  bloom(l, 0, 0, 260, ACID, a * 0.3);
};

export default {
  pad: 50,
  crack: ACID,
  hull,
  parts: { crown, thorax, head, sac, claw },
  rage: [null, glowVeins(0.45, 1.4), glowVeins(0.8, 2)],
  // Acid dripping from the jaws while the head lives, quicker as she rages.
  live(ctx, b, t, k) {
    const h = b.parts.find((p) => p.id === 'head');
    if (!h || h.hp <= 0) return;
    for (let i = 0; i < 3; i++) {
      const life = (t * (0.8 + b.phase * 0.3) + i / 3) % 1;
      const x = (i - 1) * 9;
      const y = 108 + life * life * 90;
      ctx.globalAlpha = k * (1 - life) * 0.9;
      ctx.drawImage(glow(ACID), x - 9, y - 12, 18, 24);
    }
    ctx.globalAlpha = 1;
  },
};
