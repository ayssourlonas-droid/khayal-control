// The skies of worlds 9, 10 and 11 (see sky-bodies.js for the contract).
import { W, glow, soft, addGlow, rgba, hash, lin } from './sprites.js';
import { blobs, brush, horizonGlow, moon, stars } from './sky-paint.js';
import { TAU } from '../core/math.js';

// Tidal Siege: a storm over the harbour. A moon behind the cloud as a pale smear, banks of cloud in
// long dark strokes, the horizon lit green-teal from beneath by something in the water.
function stormsea(g) {
  addGlow(g, glow('#9fe8dc'), 1460, 230, 420, 0.3);
  addGlow(g, glow('#d8fff6'), 1460, 230, 120, 0.35);
  blobs(g, [
    [300, 120, 640, '#02080e', 0.7, 0.4], [1000, 90, 760, '#03090f', 0.75, 0.38], [1700, 140, 620, '#02080e', 0.7, 0.4],
    [600, 420, 800, '#0a2a2e', 0.4, 0.3], [1500, 460, 900, '#0c3236', 0.4, 0.3],
  ]);
  const banks = [
    [-60, 170, 1100, 44], [700, 120, 1000, 52], [1300, 250, 800, 40], [100, 330, 900, 34],
    [900, 380, 1000, 40], [1400, 150, 600, 30], [-120, 470, 800, 30], [1100, 540, 900, 26],
  ];
  banks.forEach(([x, y, len, wd], i) => brush(g, x, y, len, wd, rgba('#02060a', 0.78 - (i % 3) * 0.1), i + 7));
  for (let i = 0; i < 3; i++) addGlow(g, glow('#9fe8dc'), W * (0.2 + i * 0.3), 300 + i * 60, 600, 0.05, 0.22); // moonlit edges
  horizonGlow(g, '#2fd0b0', 0.4, 480);
}

// Hollow Night's harvest moon, where the bat flocks and the witch cross (flourish-4.js).
export const MOON = { x: 1330, y: 322, r: 214 };

// Craters on the disc: [dx, dy, r] in moon radii, each a dark bowl with a lit lip on its far side.
const CRATERS = [[-0.42, -0.2, 0.12], [-0.12, 0.34, 0.09], [0.3, -0.38, 0.1], [0.46, 0.12, 0.14], [-0.55, 0.28, 0.07], [0.08, -0.12, 0.06], [0.2, 0.52, 0.08], [-0.2, -0.55, 0.06]];

// Hollow Night: a huge harvest moon, bone-white with faint craters and maria, an orange halo round it
// and thin bands of cloud laid across it, lit orange from beneath; an amber glow along the horizon.
function harvestmoon(g) {
  const { x, y, r } = MOON;
  stars(g, 80, 61, 520, 0.5, false, { x, y, r: r * 1.5 });
  addGlow(g, glow('#ff7a1e'), x, y, r * 3.6, 0.42);
  addGlow(g, glow('#ffa850'), x, y, r * 2.2, 0.5);
  addGlow(g, glow('#ffd49a'), x, y, r * 1.4, 0.4);
  moon(g, x, y, r, '#fff6e2', '#cdb48c', '#a88c64', 23);
  g.save(); // maria and craters, clipped to the disc
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.clip();
  const maria = [[-0.3, -0.1, 0.5, 0.2], [0.25, 0.25, 0.42, 0.18], [0.1, -0.45, 0.3, 0.14], [-0.5, 0.4, 0.28, 0.14]];
  blobs(g, maria.map(([dx, dy, s, a]) => [x + dx * r, y + dy * r, s * r, '#8a7050', a]));
  CRATERS.forEach(([dx, dy, k]) => {
    const [cx, cy, cr] = [x + dx * r, y + dy * r, k * r];
    g.globalAlpha = 0.34;
    g.fillStyle = '#7a6244';
    g.beginPath();
    g.ellipse(cx, cy, cr, cr * 0.92, 0, 0, TAU);
    g.fill();
    g.globalAlpha = 0.5;
    g.strokeStyle = '#fff4dc';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(cx, cy, cr, 0.6, 2.4); // the lip catching the light on the lower left
    g.stroke();
  });
  g.globalAlpha = 1;
  g.drawImage(soft('#ff8a2a'), x - r * 1.15, y + r * 0.1, r * 2.3, r * 1.1); // the limb warms toward the horizon
  g.restore();
  const bands = [[x - 420, y - 58, 760, 20], [x - 300, y + 14, 700, 26], [x - 480, y + 96, 920, 16], [x - 150, y - 128, 520, 12]];
  bands.forEach(([bx, by, len, wd], i) => {
    brush(g, bx, by + wd * 0.42, len, wd, rgba('#ff8a3a', 0.2), i + 31); // the underlit edge
    brush(g, bx, by, len, wd, rgba('#150a22', 0.86 - (i % 2) * 0.08), i + 31);
  });
  blobs(g, [[300, 380, 620, '#2a1244', 0.4, 0.34], [1650, 470, 700, '#34163e', 0.34, 0.3], [800, 120, 520, '#0a0516', 0.5, 0.3]]);
  for (let i = 0; i < 7; i++) brush(g, hash(i + 80) * W - 200, 380 + hash(i + 81) * 160, 600 + hash(i + 82) * 500, 18 + hash(i + 83) * 20, rgba('#0c0618', 0.6), i + 50);
  horizonGlow(g, '#ff8a2a', 0.4, 400);
  horizonGlow(g, '#b8381e', 0.22, 520);
}

// Aurora Kingdom's moon: a thin crescent low over the glacier, lit from below as if the sun were just
// under the ice.
export const CRESCENT = { x: 1560, y: 452, r: 58 };

// Aurora Kingdom: the polar night. A great many stars, thick as the Milky Way toward the top, faint
// banks of cold light between them, the crescent with a halo and earthshine on its dark limb, and the
// horizon glowing blue-green from the ice. The aurora itself moves, so it is a flourish (aurora.js).
function polarnight(g) {
  const { x, y, r } = CRESCENT;
  const keep = { x, y, r: r * 1.6 };
  stars(g, 230, 111, 760, 0.95, false, keep);
  stars(g, 90, 211, 380, 0.85, false, keep);
  blobs(g, [[420, 220, 760, '#1a4a8a', 0.2, 0.34], [1250, 330, 880, '#243a9a', 0.16, 0.3], [820, 90, 700, '#0a2a5a', 0.3, 0.3], [1700, 160, 520, '#1a4a7a', 0.16, 0.34]]);
  addGlow(g, glow('#8ac8ff'), x, y, r * 3.4, 0.12);
  g.fillStyle = rgba('#a8c8f0', 0.05); // earthshine: the dark limb, just there
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
  g.save();
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.clip();
  g.beginPath(); // the lit crescent: the disc less one nearly its size, set up and to the right
  g.arc(x, y, r, 0, TAU);
  g.arc(x + r * 0.3, y - r * 0.26, r * 0.97, 0, TAU);
  g.fillStyle = lin(g, x - r, y + r, x + r * 0.2, y - r * 0.4, [[0, '#ffffff'], [0.5, '#e4f0ff'], [1, '#a8c4e8']]);
  g.fill('evenodd');
  g.restore();
  horizonGlow(g, '#3a9ad8', 0.34, 440);
  horizonGlow(g, '#58ffb0', 0.1, 600);
}

export const BODIES3 = { stormsea, harvestmoon, polarnight };
