// World 6, Code Rain: the Agent core. A cold machine mind built of the world's code: a faceted
// crystal core burning white-green at its heart, two dark lenses beneath it like a pair of shades
// (white-rimmed: weak points), a crown bar of scrolling glyph panels over it, two wireframe cube
// nodes at its shoulders, all held in a gunmetal lattice whose circuit traces glow green. Glyph
// columns light up across its frame as the fight goes on, and code falls through it.
import { path, sym, ink, lin, rad, line, eye, bloom, neon, gloss, rgba, shade, both, rrect, TAU } from './kit.js';
import { glow, hash } from '../sprites.js';

const GREEN = '#33ff66';
const MINT = '#9aff7a';
const WHITE = '#e8fff0';
const GUN = '#2a3a34';

const metal = (g, c, top, bot) => lin(g, 0, top, 0, bot, [[0, shade(c, 0.45)], [0.4, c], [1, '#030806']]);

// A pseudo-glyph: a few strokes on a 3 x 5 grid, seeded (no real script).
function glyph(g, x, y, s, seed, c, a = 1) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = rgba(c, a);
  g.lineWidth = Math.max(1, s * 0.22);
  g.lineCap = 'square';
  g.beginPath();
  for (let k = 0; k < 3; k++) {
    const h = (j) => hash(seed * 31 + k * 7 + j);
    const x0 = x + Math.floor(h(1) * 3) * s * 0.5 - s * 0.5;
    const y0 = y + Math.floor(h(2) * 5) * s * 0.5 - s;
    g.moveTo(x0, y0);
    g.lineTo(x0 + (h(3) < 0.5 ? s * 0.5 : 0), y0 + (h(3) < 0.5 ? 0 : s * 0.5) + (h(4) < 0.3 ? s * 0.5 : 0));
  }
  g.stroke();
  g.restore();
}

function columns(l, a, n) {
  for (let i = 0; i < n; i++) {
    const x = -260 + (i / (n - 1)) * 520;
    for (let j = 0; j < 9; j++) glyph(l, x, -110 + j * 22, 8, i * 13 + j, j ? GREEN : WHITE, a * (1 - j / 11));
  }
}

function hull(b, l) {
  const lattice = sym([[0, -150], [150, -150], [270, -80], [270, 20], [190, 120], [0, 140]]);
  path(b, lattice);
  ink(b, lin(b, 0, -150, 0, 140, [[0, rgba('#0e2a1a', 0.9)], [1, rgba('#020a06', 0.85)]]), 3);
  b.save();
  path(b, lattice);
  b.clip();
  for (let y = -150, row = 0; y < 150; y += 21, row++) {
    for (let x = -280 + (row % 2) * 18; x < 280; x += 36) {
      const hex = [0, 1, 2, 3, 4, 5].map((i) => [x + Math.cos((i * TAU) / 6) * 12, y + Math.sin((i * TAU) / 6) * 12]);
      path(b, hex);
      b.fillStyle = rgba(GREEN, 0.03 + 0.06 * hash(row * 31 + x));
      b.fill();
      line(b, rgba(GREEN, 0.12), 1);
    }
  }
  b.restore();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + TAU / 12;
    path(b, [[0, 10], [Math.cos(a) * 270, 10 + Math.sin(a) * 150]], true);
    line(b, '#0a0c10', 14);
    path(b, [[0, 10], [Math.cos(a) * 270, 10 + Math.sin(a) * 150]], true);
    line(b, GUN, 9);
    path(l, [[0, 10], [Math.cos(a) * 260, 10 + Math.sin(a) * 144]], true);
    neon(l, GREEN, 1, 0.5);
  }
  for (const r of [110, 150]) {
    b.beginPath();
    b.ellipse(0, 10, r * 1.5, r * 0.85, 0, 0, TAU);
    line(b, rgba(GREEN, 0.18), 1.5);
  }
  path(l, lattice);
  neon(l, GREEN, 1.2, 0.35);
  bloom(l, 0, 10, 180, GREEN, 0.12);
}

// The crown bar: a long dark-glass bar of glyph panels between two heavy caps.
function halo(b, l, p) {
  rrect(b, -p.w / 2 + 10, -14, p.w - 20, 28, 6);
  ink(b, lin(b, 0, -14, 0, 14, [[0, '#1a3a28'], [0.5, '#04100a'], [1, '#020604']]), 3);
  for (let i = 0; i < 14; i++) {
    const x = -p.w / 2 + 34 + (i * (p.w - 68)) / 13;
    rrect(b, x - 9, -9, 18, 18, 2);
    line(b, rgba(GREEN, 0.3), 1);
    glyph(l, x, 4, 8, i * 5 + 3, i % 4 ? GREEN : WHITE, 0.9);
  }
  both((s) => {
    rrect(b, s * (p.w / 2 - 14) - 14, -20, 28, 40, 5);
    ink(b, metal(b, GUN, -20, 20), 3);
    eye(l, s * (p.w / 2 - 14), 0, 3.2, MINT, 3);
  });
  path(l, [[-p.w / 2 + 14, -14], [p.w / 2 - 14, -14]], true);
  neon(l, GREEN, 1.4, 0.8);
}

// A cube node (drawn as the left one): a gunmetal cube seen from below-left, edges lit green.
function node(b, l) {
  const top = [[-30, -18], [4, -34], [34, -18], [0, -2]];
  const left = [[-30, -18], [0, -2], [0, 36], [-30, 20]];
  const right = [[0, -2], [34, -18], [34, 20], [0, 36]];
  for (const [f, c] of [[top, shade(GUN, 0.5)], [left, GUN], [right, shade(GUN, -0.4)]]) {
    path(b, f);
    ink(b, c, 2.5);
  }
  for (const f of [top, left, right]) {
    path(l, f);
    neon(l, GREEN, 1.3, 0.85);
  }
  glyph(l, -15, 12, 9, 77, WHITE);
  glyph(l, 17, 12, 9, 91, GREEN);
  eye(l, 0, -2, 3, WHITE, 3);
}

// The core: a faceted crystal, green at the rim and white-hot at the heart, an iris of light.
function core(b, l) {
  const r = 60;
  const pts = [];
  for (let i = 0; i < 8; i++) pts.push([Math.cos((i / 8) * TAU + TAU / 16) * r, Math.sin((i / 8) * TAU + TAU / 16) * r]);
  path(b, pts);
  ink(b, rad(b, 0, 0, 4, r, [[0, '#d8ffe0'], [0.4, '#2aa85a'], [1, '#04200e']], -14, -18), 3.5);
  for (let i = 0; i < 8; i++) {
    path(b, [[0, 0], pts[i]], true);
    line(b, rgba('#000000', 0.35), 1.6);
    path(b, [pts[i], pts[(i + 1) % 8], [pts[i][0] * 0.5, pts[i][1] * 0.5]]);
    b.fillStyle = rgba(i % 2 ? '#ffffff' : '#000000', i % 2 ? 0.1 : 0.15);
    b.fill();
  }
  path(l, pts);
  neon(l, WHITE, 1.6, 0.8);
  bloom(l, 0, 0, 90, GREEN, 0.6);
  eye(l, 0, 0, 16, WHITE, 2.6);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  l.arc(0, 0, 28, 0, TAU);
  l.lineWidth = 2;
  l.strokeStyle = rgba(MINT, 0.8);
  l.stroke();
  l.restore();
  gloss(b, -22, -28, 22, 10, 0.5, -0.5);
}

// A lens (drawn as the left one): dark glass shaped like one side of a pair of shades, a cold
// streak of reflection, a white rim.
function lens(b, l) {
  const shape = [[-32, -22], [30, -24], [32, -6], [18, 22], [-20, 24], [-34, 2]];
  path(b, [[30, -20], [44, -24]], true);
  line(b, '#0a0c10', 6);
  path(b, shape);
  ink(b, lin(b, 0, -24, 0, 24, [[0, '#1a2e24'], [0.5, '#020604'], [1, '#081a10']]), 3.5);
  path(l, shape);
  neon(l, WHITE, 1.6, 0.85);
  path(l, [[-20, -14], [6, -16], [-14, 10]]);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rgba(MINT, 0.35);
  l.fill();
  l.restore();
  bloom(l, 0, 0, 40, GREEN, 0.3);
}

export default {
  pad: 60,
  crack: GREEN,
  hull,
  parts: { halo, node, core, lens },
  rage: [null, (l) => columns(l, 0.55, 10), (l) => {
    columns(l, 0.9, 14);
    bloom(l, 0, 10, 300, GREEN, 0.22);
  }],
  // Code falling through the frame, and a scan of light running along the crown bar.
  live(ctx, b, t, k) {
    for (let i = 0; i < 10; i++) {
      const x = -250 + i * 55;
      const y = -140 + (((t * (60 + 30 * hash(i)) + hash(i * 5) * 280) % 280));
      ctx.globalAlpha = k * 0.55;
      ctx.drawImage(glow(i % 3 ? GREEN : WHITE), x - 6, y - 10, 12, 20);
    }
    const sx = Math.sin(t * 1.3) * 180;
    ctx.globalAlpha = k * 0.7;
    ctx.drawImage(glow(WHITE), sx - 30, -132, 60, 24);
    ctx.globalAlpha = 1;
  },
};
