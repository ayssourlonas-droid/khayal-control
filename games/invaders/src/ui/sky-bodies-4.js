// The sky of world 12 (see sky-bodies.js for the contract). Painted once per level into the sky canvas;
// the constellations' lines that draw themselves across it are a flourish (flourish-6.js).
import { W, glow, addGlow, rgba, hash, lin, rad } from './sprites.js';
import { blobs, brush, horizonGlow, stars } from './sky-paint.js';
import { TAU } from '../core/math.js';

// The spiral galaxy turning over the library: where it sits, its radius, how far it is tilted from the
// plane of the sky (rotation, then squash of the disc's height).
export const GALAXY = { x: 1400, y: 290, r: 270, tilt: -0.46, squash: 0.44 };

// The constellations: each star a closed book (the library's stars are books), the lines between them
// drawn by the 'constellation' flourish. Stars [x, y] and the links between them [from, to].
export const CONSTELLATIONS = [
  { stars: [[120, 330], [215, 255], [300, 300], [410, 215], [350, 400], [250, 420], [180, 170]], links: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [1, 6]] },
  { stars: [[560, 230], [660, 170], [760, 205], [850, 150], [900, 260], [790, 300]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 2]] },
  { stars: [[1650, 230], [1730, 170], [1820, 215], [1790, 320], [1700, 380], [1860, 430]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5]] },
  { stars: [[1010, 420], [1090, 360], [1170, 410], [1130, 480]], links: [[0, 1], [1, 2], [2, 3], [3, 0]] },
];

// A star-book: a glow, then a tiny open book seen from the front, two pale pages lifted either side of a
// gold spine.
function book(g, x, y, s, a) {
  addGlow(g, glow('#ffd98a'), x, y, 15 * s, 0.55 * a);
  addGlow(g, glow('#ffffff'), x, y, 6 * s, 0.7 * a);
  g.globalAlpha = a;
  for (const d of [-1, 1]) {
    g.beginPath();
    g.moveTo(x, y + 2.6 * s);
    g.lineTo(x + d * 6.4 * s, y - 0.4 * s);
    g.lineTo(x + d * 5.6 * s, y - 3.4 * s);
    g.lineTo(x, y - 0.8 * s);
    g.closePath();
    g.fillStyle = d < 0 ? '#fff4d6' : '#e8cf92';
    g.fill();
  }
  g.fillStyle = '#c8902a';
  g.fillRect(x - 0.6 * s, y - 0.9 * s, 1.2 * s, 3.8 * s);
  g.globalAlpha = 1;
}

// A point on arm k of the galaxy, in the disc's own plane: u 0 at the core to 1 at the rim, the arm turning
// about 0.9 of a turn on the way.
const spiral = (k, u, dev = 0) => [Math.cos(k * Math.PI + u * 5.5 + dev) * u, Math.sin(k * Math.PI + u * 5.5 + dev) * u];

// One arm, in the disc's plane: first a ribbon of unresolved starlight (warm near the core, blue at the
// rim), then the stars themselves, thick on the arm's spine and thinning to either side, and a few knots
// of pink where stars are being born.
function arm(g, r, k) {
  g.lineCap = 'round';
  for (const [w, al] of [[0.3, 0.05], [0.19, 0.07], [0.1, 0.1], [0.05, 0.12]]) {
    for (let i = 0; i < 56; i++) {
      const [u0, u1] = [0.04 + i * 0.017, 0.04 + (i + 1) * 0.017];
      const [x0, y0] = spiral(k, u0);
      const [x1, y1] = spiral(k, u1);
      g.beginPath();
      g.moveTo(x0 * r, y0 * r);
      g.lineTo(x1 * r, y1 * r);
      g.lineWidth = w * r * (1.15 - u0 * 0.6);
      g.strokeStyle = rgba(u0 < 0.35 ? '#ffd8a0' : u0 < 0.6 ? '#d0c4ff' : '#8f9aff', al * (1.2 - u0 * 0.9));
      g.stroke();
    }
  }
  for (let i = 0; i < 3600; i++) {
    const h = (j) => hash(k * 90001 + i * 7 + j);
    const u = 0.03 + 0.97 * h(1) ** 1.25;
    const dev = (h(2) + h(3) + h(4) - 1.5) * (0.5 / (1 + 3 * u)) * 1.6;
    const [x, y] = spiral(k, u, dev);
    g.globalAlpha = (0.35 + 0.65 * h(5)) * (1 - u * 0.5);
    g.fillStyle = u < 0.3 ? '#ffe6b0' : u < 0.62 ? '#fff6e4' : h(6) > 0.5 ? '#b8caff' : '#dcd0ff';
    g.fillRect(x * r, y * r, h(7) > 0.97 ? 2.2 : 1.2, h(7) > 0.97 ? 2.2 : 1.2);
  }
  g.globalAlpha = 1;
  for (let i = 0; i < 20; i++) { // star-forming knots
    const u = 0.3 + hash(k * 31 + i) * 0.62;
    const [x, y] = spiral(k, u, (hash(k * 31 + i + 99) - 0.5) * 0.18);
    addGlow(g, glow(i % 3 ? '#ff8ad0' : '#9ab8ff'), x * r, y * r, 6 + hash(i + 400) * 9, 0.26 + 0.2 * hash(i + 500));
  }
}

// The dust lane hugging the inside of an arm: a dark ribbon that eats the starlight behind it.
function lane(g, r, k) {
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const [w, al] of [[0.05, 0.16], [0.028, 0.22], [0.012, 0.3]]) {
    g.beginPath();
    for (let i = 0; i <= 40; i++) {
      const [x, y] = spiral(k, 0.18 + (i / 40) * 0.7, -0.17 - 0.04 * Math.sin(i * 0.9));
      g.lineTo(x * r, y * r);
    }
    g.strokeStyle = rgba('#02021a', al);
    g.lineWidth = w * r;
    g.stroke();
  }
}

function galaxy(g) {
  const { x, y, r, tilt, squash } = GALAXY;
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  g.scale(1, squash);
  addGlow(g, glow('#5a56e0'), 0, 0, r * 1.5, 0.3);
  addGlow(g, glow('#b890ff'), 0, 0, r * 0.85, 0.18);
  arm(g, r, 0);
  arm(g, r, 1);
  lane(g, r, 0);
  lane(g, r, 1);
  g.fillStyle = rad(g, 0, 0, 0, r * 0.3, [[0, rgba('#fff8e4', 1)], [0.35, rgba('#ffd890', 0.55)], [1, rgba('#ffb060', 0)]]);
  g.beginPath();
  g.arc(0, 0, r * 0.3, 0, TAU);
  g.fill();
  addGlow(g, glow('#ffe6b0'), 0, 0, r * 0.22, 0.9);
  g.restore();
}

// Starlit Archive: a deep indigo nebula in banks of violet and blue with a thread of teal, stars
// thick as spilled sand and warm among the cool, the galaxy at the upper right, and the library's own
// light glowing gold along the horizon. A few of the brightest stars are books (constellations).
function archive(g) {
  const keep = { x: GALAXY.x, y: GALAXY.y, r: GALAXY.r * 0.62 };
  stars(g, 900, 311, 820, 1, false, keep);
  stars(g, 340, 411, 460, 0.95, false, keep);
  for (let i = 0; i < 1100; i++) { // fine dust of faint stars
    g.fillStyle = rgba(i % 4 ? '#cfd8ff' : '#ffe9c0', 0.22 + 0.4 * hash(i * 3 + 1300));
    g.fillRect(hash(i * 3 + 1301) * W, hash(i * 3 + 1302) * 820, 1.3, 1.3);
  }
  for (let i = 0; i < 70; i++) { // warm stars among the cool
    const [x, y] = [hash(i * 3 + 900) * W, hash(i * 3 + 901) ** 1.2 * 700];
    g.fillStyle = rgba(i % 3 ? '#ffe2a0' : '#ffc890', 0.35 + 0.5 * hash(i * 3 + 902));
    g.fillRect(x, y, 1.5, 1.5);
  }
  blobs(g, [
    [300, 250, 780, '#2a2aa0', 0.3, 0.36], [1000, 130, 900, '#3a2090', 0.28, 0.3], [1700, 420, 700, '#2a3ab0', 0.24, 0.34],
    [620, 520, 760, '#5a2a8a', 0.28, 0.3], [1280, 560, 860, '#4a2a8a', 0.24, 0.28], [180, 560, 500, '#1a4a8a', 0.26, 0.3],
    [900, 330, 420, '#0a6a7a', 0.16, 0.22], [1500, 90, 560, '#1a5a8a', 0.2, 0.24], // a thread of teal in the blue
    [900, 640, 1000, '#e8a050', 0.12, 0.22], // and a warm cloud low down, where the stacks' light lifts
    [520, 140, 300, '#7a5ad8', 0.2, 0.4], [1180, 300, 260, '#5a7ae8', 0.18, 0.4], [60, 300, 300, '#8a4ac8', 0.2, 0.5], // knots of brighter gas
  ]);
  for (let i = 0; i < 5; i++) brush(g, hash(i + 60) * W - 300, 120 + hash(i + 61) * 400, 800 + hash(i + 62) * 500, 24 + hash(i + 63) * 26, rgba(i % 2 ? '#8a7aff' : '#b88aff', 0.05), i + 3); // veils of gas
  for (let i = 0; i < 4; i++) brush(g, hash(i + 70) * W - 300, 160 + hash(i + 71) * 340, 700 + hash(i + 72) * 500, 20 + hash(i + 73) * 24, rgba('#02021a', 0.3), i + 11); // and dust against it
  galaxy(g);
  addGlow(g, glow('#ffe6b0'), W * 0.5, 1180, 1100, 0.18, 0.5);
  g.fillStyle = lin(g, 0, 440, 0, 1080, [[0, rgba('#8a5acf', 0)], [1, rgba('#c89a8a', 0.18)]]);
  g.fillRect(0, 440, W, 640);
  horizonGlow(g, '#e8a860', 0.2, 560);
  for (const c of CONSTELLATIONS) c.stars.forEach(([x, y], i) => book(g, x, y, 1 + 0.25 * (i % 3), 0.95));
}

export const BODIES4 = { archive };
