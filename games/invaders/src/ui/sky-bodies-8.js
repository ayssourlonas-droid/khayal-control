// The sky of world 16, Glass Cathedral (see sky-bodies.js for the contract): a deep dawn seen through the broken vault of
// a cathedral whose roof has fallen. Painted once per level over the gradient (indigo high, violet and plum in the
// middle, a rose-coral glow at the horizon), and as quiet as the sky of any world: the top half, where the boss
// fights, holds only the last stars, a few long clouds, the ribs of the vault springing in from the two top corners and
// breaking off against the sky, and a few very faint shafts of colour. Low in the frame, behind the west front, the
// sun is about to rise: a wide rose-gold glow with a pale core, and a faint fan of rays. Everything is dim and soft.
import { W, H, glow, soft, rgba, lin, rad, addGlow, hash } from './sprites.js';
import { stars } from './sky-paint.js';
import { TAU } from '../core/math.js';

export const SUN = { x: 1170, y: 905 }; // the sun, low behind the west front
export const GLOW_ALPHA = { wide: 0.46, core: 0.5, haze: 0.2 }; // the dawn's three glows, additive
export const SHAFT_ALPHA = 0.032; // the baked shaft hints: fainter than the live ones (flourish-glass.js)
export const CLOUD_ALPHA = 0.5; // a cloud's dark body at its strongest
const STONE = '#1b1236';
const RIM = '#ff9a8c';

// Long clouds: [x, y, width, height]. Dark violet above, lit rose-gold along their undersides by the low sun.
const CLOUDS = [
  [260, 480, 560, 70], [830, 410, 700, 58], [1520, 470, 600, 66], [1010, 590, 820, 52], [120, 640, 540, 46],
  [1730, 620, 500, 46], [520, 300, 440, 40], [1380, 290, 420, 36], [900, 200, 520, 30],
];

function clouds(g) {
  CLOUDS.forEach(([x, y, w, h], i) => {
    const near = Math.min(1, Math.hypot(x - SUN.x, (y - SUN.y) * 0.6) / 900); // how far the cloud is from the sun
    for (let k = 0; k < 3; k++) {
      g.globalAlpha = CLOUD_ALPHA * (0.9 - k * 0.2);
      g.drawImage(soft('#241048'), x - w / 2 + k * w * 0.1, y - h / 2 - k * 3, w * (1 - k * 0.14), h * (1 + k * 0.12));
    }
    addGlow(g, glow(i % 3 ? '#ff9ab0' : '#ffc890'), x + (SUN.x - x) * 0.1, y + h * 0.3, w * 0.46, 0.3 * (1.1 - near), 0.22);
  });
  g.globalAlpha = 1;
}

// The dawn: a wide rose glow along the horizon, a pale warm core where the sun is about to clear the front, a
// faint haze above it, and a fan of rays.
function dawn(g) {
  addGlow(g, glow('#ff8a90'), SUN.x, SUN.y, 980, GLOW_ALPHA.wide, 0.5);
  addGlow(g, glow('#ffc8a0'), SUN.x, SUN.y + 20, 420, GLOW_ALPHA.core, 0.42);
  addGlow(g, glow('#ff7aa8'), SUN.x, SUN.y - 120, 760, GLOW_ALPHA.haze, 0.8);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.2;
    g.fillStyle = lin(g, SUN.x, SUN.y, SUN.x + Math.cos(a) * 900, SUN.y + Math.sin(a) * 900, [[0, rgba(i % 2 ? '#ffb0a0' : '#ffd8a0', 0.05)], [1, rgba('#ffb0a0', 0)]]);
    g.beginPath();
    g.moveTo(SUN.x, SUN.y);
    g.lineTo(SUN.x + Math.cos(a - 0.04) * 900, SUN.y + Math.sin(a - 0.04) * 900);
    g.lineTo(SUN.x + Math.cos(a + 0.04) * 900, SUN.y + Math.sin(a + 0.04) * 900);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';
}

// One rib of the vault: a curve from p0 through control c to p1, `w` thick, a darker band with a paler core, a catchlight of
// the dawn along its lower edge, and (broken) a splintered end.
function rib(g, [x0, y0], [cx, cy], [x1, y1], w, broken) {
  g.save();
  g.lineCap = 'butt';
  g.lineJoin = 'round';
  const path = () => {
    g.beginPath();
    g.moveTo(x0, y0);
    g.quadraticCurveTo(cx, cy, x1, y1);
  };
  g.strokeStyle = STONE;
  g.lineWidth = w;
  path();
  g.stroke();
  g.strokeStyle = rgba('#4a3a7a', 0.45);
  g.lineWidth = w * 0.42;
  path();
  g.stroke();
  g.save();
  g.translate(w * 0.34, w * 0.3);
  g.strokeStyle = rgba(RIM, 0.42);
  g.lineWidth = 2.2;
  path();
  g.stroke();
  g.restore();
  if (broken) { // a splintered end: two ragged teeth
    const a = Math.atan2(y1 - cy, x1 - cx);
    const [ux, uy, nx, ny] = [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a)];
    g.fillStyle = STONE;
    g.beginPath();
    g.moveTo(x1 + nx * w * 0.5, y1 + ny * w * 0.5);
    g.lineTo(x1 + ux * w * 0.5 + nx * w * 0.25, y1 + uy * w * 0.5 + ny * w * 0.25);
    g.lineTo(x1 + ux * w * 0.14, y1 + uy * w * 0.14);
    g.lineTo(x1 + ux * w * 0.78 - nx * w * 0.2, y1 + uy * w * 0.78 - ny * w * 0.2);
    g.lineTo(x1 - nx * w * 0.5, y1 - ny * w * 0.5);
    g.closePath();
    g.fill();
  }
  g.restore();
}

const bez = ([x0, y0], [cx, cy], [x1, y1], t) => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1];

// A fragment of the vault's web hanging between two ribs (curves [from, control, to]), from their springing up to the fraction t1 of their
// length, in the stone of the ribs but a little paler, with a jagged outer edge where it has fallen away.
function web(g, A, B, t1, seed) {
  const pts = [];
  for (let i = 0; i <= 8; i++) pts.push(bez(...A, (t1 * i) / 8));
  const [[ax, ay], [bx, by]] = [bez(...A, t1), bez(...B, t1)];
  for (let i = 1; i < 7; i++) {
    const u = i / 7;
    const out = i % 2 ? 1 : -0.4; // teeth: every other point stands out toward the sky, the rest bite in
    pts.push([ax + (bx - ax) * u + (hash(seed + i) - 0.3) * 26 * out, ay + (by - ay) * u + (hash(seed + i + 9) - 0.7) * 30 * out]);
  }
  for (let i = 8; i >= 0; i--) pts.push(bez(...B, (t1 * i) / 8));
  g.fillStyle = rgba('#241a48', 0.9);
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
  g.strokeStyle = rgba(RIM, 0.28); // the dawn along the broken edge
  g.lineWidth = 1.6;
  g.beginPath();
  pts.slice(9, 16).forEach(([x, y], i) => (i ? g.lineTo(x + 2, y + 2) : g.moveTo(x + 2, y + 2)));
  g.stroke();
}

// The vault's springing in the left top corner (the right one is this mirrored, with its own ribs): a wall shaft with its capital, ribs
// fanning out of it, webs of the vault's shell still hanging between them, one rib broken off in mid-sky.
function springing(g, k) {
  g.fillStyle = STONE;
  g.fillRect(-70, 560, 90, 400); // the shaft, which goes on down behind the far layer
  g.fillRect(-80, 540, 108, 26); // the capital
  g.fillRect(-84, 524, 118, 18);
  g.fillStyle = rgba(RIM, 0.3);
  g.fillRect(18, 566, 2.4, 300);
  const A = [[-10, 540], [70, 150], [330 * k, -30]];
  const B = [[20, 540], [150, 190], [560 * k, -30]];
  const C = k === 1 ? [[40, 540], [250, 260], [610, 170]] : [[40, 540], [170, 330], [430, 210]];
  web(g, A, B, 0.5, k * 100);
  web(g, B, C, k === 1 ? 0.72 : 0.62, k * 100 + 40);
  rib(g, ...A, 46, false);
  rib(g, ...B, 34, false);
  rib(g, ...C, k === 1 ? 26 : 24, true);
  g.fillStyle = STONE; // a boss where the ribs meet at the top
  g.beginPath();
  g.arc(330 * k, 8, 20, 0, TAU);
  g.fill();
}

function shafts(g) {
  g.globalCompositeOperation = 'lighter';
  [[1500, '#ff7aa8'], [1100, '#ffc86a'], [700, '#6a9aff'], [300, '#a47cff']].forEach(([x, c], i) => {
    g.fillStyle = lin(g, 0, 0, 0, 720, [[0, rgba(c, SHAFT_ALPHA)], [1, rgba(c, 0)]]);
    g.beginPath();
    g.moveTo(x - 40, -10);
    g.lineTo(x + 40, -10);
    g.lineTo(x - 420 + i * 24 + 110, 720);
    g.lineTo(x - 420 + i * 24 - 110, 720);
    g.fill();
  });
  g.globalCompositeOperation = 'source-over';
}

function glassvault(g) {
  g.save();
  stars(g, 46, 61, 360, 0.55);
  clouds(g);
  dawn(g);
  shafts(g);
  g.save();
  springing(g, 1);
  g.translate(W, 0);
  g.scale(-1, 1);
  springing(g, 0.8);
  g.restore();
  g.fillStyle = rad(g, W / 2, H / 2, H * 0.42, Math.hypot(W, H) / 2, [[0, rgba('#05021a', 0)], [1, rgba('#05021a', 0.36)]]);
  g.fillRect(0, 0, W, H);
  g.restore();
}

export const BODIES8 = { glassvault };
