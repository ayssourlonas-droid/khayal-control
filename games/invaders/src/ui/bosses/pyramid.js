// World 2, Neon Rain: the Corporate pyramid. A stepped tower of black glass, split down the middle
// by a lit lift shaft; amber office windows, cyan neon on every ledge, a pink beacon on top, a
// surveillance lens hanging in the shaft and two holo-billboards slung under the base (the weak
// points burn pink). In the dark world its body vanishes and only the neon draws it; two
// searchlights sweep the sky from its crown, red alarm strobes in the last phase.
import { path, sym, ink, lin, neon, eye, bloom, line, rgba, rrect, gloss, cone, TAU } from './kit.js';
import { glow, hash } from '../sprites.js';

const CYAN = '#2ef2ff';
const PINK = '#ff4fd8';
const AMBER = '#ffb02e';
const VIOLET = '#9a7aff';
const RED = '#ff2a4a';

const glass = (g, top, bot) => lin(g, 0, top, 0, bot, [[0, '#2c2650'], [0.25, '#14112a'], [1, '#05040c']]);

// The silhouette (right half, top to bottom): the steps of the tower.
const STEPS = [[0, -150], [10, -136], [44, -84], [108, -84], [110, -30], [158, -30], [160, 30], [224, 30], [226, 92], [0, 92]];

function windows(b, l, x0, y0, w, h, seed) {
  for (let y = y0 + 8; y < y0 + h - 5; y += 9) {
    for (let x = x0 + 7; x < x0 + w - 6; x += 10) {
      const on = hash(seed + x * 7 + y * 13) < 0.42;
      b.fillStyle = on ? '#6a4810' : '#1a1830';
      b.fillRect(x, y, 6, 4);
      if (on) {
        l.fillStyle = rgba(AMBER, 0.85);
        l.fillRect(x, y, 6, 4);
      }
    }
  }
}

function hull(b, l) {
  path(b, sym(STEPS));
  ink(b, glass(b, -150, 92), 3);
  rrect(b, -46, -84, 92, 176, 4);
  b.fillStyle = lin(b, -46, 0, 46, 0, [[0, '#04030a'], [0.5, '#1a1036'], [1, '#04030a']]);
  b.fill();
  for (let y = -76; y < 90; y += 12) {
    path(b, [[-44, y], [44, y]], true);
    line(b, rgba(VIOLET, 0.18), 1);
  }
  for (const s of [-1, 1]) {
    path(l, [[s * 38, -80], [s * 38, 88]], true);
    neon(l, CYAN, 2, 0.8);
  }
  bloom(l, 0, 0, 90, VIOLET, 0.25);
  path(l, sym(STEPS).slice(1, 9), true);
  neon(l, VIOLET, 1.6, 0.5);
}

// A tier of the tower (drawn as the left one): black glass with a sloped outer edge, office windows,
// a cyan neon ledge along its top and outer edge.
function tier(b, l, p) {
  const x0 = -p.w / 2;
  const y0 = -p.h / 2;
  const sl = p.h * 0.16;
  const outline = [[x0 + sl, y0], [-x0, y0], [-x0, -y0], [x0, -y0]];
  path(b, outline);
  ink(b, glass(b, y0, -y0), 3);
  b.save();
  path(b, outline);
  b.clip();
  windows(b, l, x0, y0, p.w, p.h, p.w * 3 + p.h);
  for (let x = x0 + 26; x < -x0; x += 30) {
    path(b, [[x, y0], [x, -y0]], true);
    line(b, rgba('#000000', 0.6), 2);
  }
  gloss(b, x0 + p.w * 0.35, y0 + 8, p.w * 0.35, 4, 0.18);
  b.restore();
  path(l, outline);
  l.fillStyle = lin(l, 0, y0, 0, -y0, [[0, rgba(VIOLET, 0.16)], [1, rgba(VIOLET, 0)]]);
  l.fill();
  path(l, [[x0, -y0], [x0 + sl, y0], [-x0, y0]], true);
  neon(l, CYAN, 2.2);
}

// The beacon: a little pyramid of pink glass, a white-hot lamp at its tip, an antenna.
function spire(b, l) {
  path(b, [[0, -34], [0, -18]], true);
  line(b, '#14112a', 3);
  path(b, sym([[0, -20], [28, 28], [0, 28]]));
  ink(b, lin(b, 0, -20, 0, 28, [[0, '#ff9ae8'], [0.4, '#a01a88'], [1, '#2a0624']]), 3);
  path(b, [[0, -20], [0, 28]], true);
  line(b, rgba('#ffffff', 0.25), 2);
  path(l, sym([[0, -20], [28, 28], [0, 28]]));
  neon(l, PINK, 2.4);
  for (let y = 0; y < 26; y += 8) {
    path(l, [[-(y + 20) * 0.5 + 6, y], [(y + 20) * 0.5 - 6, y]], true);
    neon(l, PINK, 1.2, 0.6);
  }
  eye(l, 0, -30, 4, '#ffffff', 5);
  bloom(l, 0, 0, 44, PINK, 0.45);
}

// The lens: a black housing slung in the shaft, a great pink iris, a ring of tiny status lamps.
function lens(b, l, p) {
  rrect(b, -p.w / 2, -p.h / 2, p.w, p.h, 12);
  ink(b, glass(b, -p.h / 2, p.h / 2), 3);
  b.beginPath();
  b.arc(0, 0, 18, 0, TAU);
  ink(b, '#1a0418', 3);
  eye(l, 0, 0, 12, PINK, 3);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  l.arc(0, 0, 17, 0, TAU);
  l.lineWidth = 2;
  l.strokeStyle = rgba(PINK, 0.9);
  l.stroke();
  l.restore();
  eye(l, -4, -4, 2.4, '#ffffff', 1.5);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) eye(l, s * (26 + i * 5), 8, 1.2, i ? CYAN : AMBER, 2);
}

// A holo-billboard (drawn as the left one): a pink neon frame, a pyramid mark and bars of glyphs.
function sign(b, l, p) {
  const w = p.w;
  const h = p.h;
  path(b, [[w * 0.3, -h / 2 - 12], [w * 0.3, -h / 2]], true);
  line(b, '#14112a', 3);
  rrect(b, -w / 2, -h / 2, w, h, 4);
  ink(b, rgba('#1a0a24', 0.92), 3);
  rrect(l, -w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 3);
  neon(l, PINK, 2);
  path(l, [[-w / 2 + 12, 8], [-w / 2 + 22, -10], [-w / 2 + 32, 8]]);
  neon(l, CYAN, 1.6);
  for (let i = 0; i < 3; i++) {
    const len = 30 + 14 * hash(i + 3);
    l.fillStyle = rgba(i === 1 ? AMBER : PINK, 0.85);
    l.fillRect(-w / 2 + 42, -10 + i * 8, len * (w / 90) * 0.9, 4);
  }
  l.fillStyle = rgba(PINK, 0.08);
  l.fillRect(-w / 2, -h / 2, w, h);
}

function strobes(l) {
  for (const [x, y] of sym(STEPS).filter((pt) => pt[1] < 90)) {
    eye(l, x, y, 3, RED, 4);
  }
  bloom(l, 0, -20, 160, RED, 0.18);
}

export default {
  pad: 60,
  hull,
  parts: { cap: tier, mid: tier, base: tier, spire, eye: lens, sign },
  rage: [null, (l) => bloom(l, 0, 0, 120, PINK, 0.25), strobes],
  // Two searchlights sweeping from the crown, a lift car riding the shaft, strobes blinking.
  live(ctx, b, t, k) {
    const img = cone('#c8f8ff');
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * 18, -128);
      ctx.rotate(s * (0.95 + 0.4 * Math.sin(t * 0.7 + s)));
      ctx.globalAlpha = 0.22 * k;
      ctx.drawImage(img, -60, -700, 120, 700);
      ctx.restore();
    }
    const y = -60 + 120 * (0.5 + 0.5 * Math.sin(t * 0.9));
    ctx.globalAlpha = 0.8 * k;
    ctx.drawImage(glow(CYAN), -26, y - 16, 52, 32);
    if (b.phase === 2 && Math.sin(t * 9) > 0.3) {
      ctx.globalAlpha = 0.5 * k;
      ctx.drawImage(glow(RED), -200, -200, 400, 400);
    }
    ctx.globalAlpha = 1;
  },
};
