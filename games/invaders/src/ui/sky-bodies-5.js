// The sky of world 13 (see sky-bodies.js for the contract). Painted once per level into the sky canvas:
// golden hour. A fan of rays from a huge low sun, towering cumulus lit gold and rose on the sunward side
// and violet-blue away from it, a sea of cloud tops along the horizon, thin cirrus high up, a pale
// daytime moon and the first stars at the top. The rays that shift and the gulls are live (flourish-8.js).
import { W, H, glow, addGlow, rgba, hash, lin, rad, makeCanvas } from './sprites.js';
import { blobs, brush, stars } from './sky-paint.js';
import { makeRng } from '../core/rng.js';
import { TAU } from '../core/math.js';
import { SUN, TONES, hazed, bank, lobes } from './cloud-kit.js';

const SEA = 780; // y of the cloud sea's crest behind the layers

// The rays: wedges fanning up from the sun, each fading out with distance, brighter near the disc.
// RAYS is shared with flourish-8.js, whose live shafts lie along the same angles.
export const RAYS = Array.from({ length: 18 }, (_, i) => ({
  a: -Math.PI + 0.1 + (i / 17) * (Math.PI - 0.2) + (hash(i + 700) - 0.5) * 0.14,
  w: 0.025 + hash(i + 710) * 0.055,
  al: 0.035 + hash(i + 720) * 0.05,
}));

function rays(g) {
  const c = makeCanvas(W / 4, H / 4); // drawn small and scaled up, which softens every edge
  const r = c.getContext('2d');
  r.scale(0.25, 0.25);
  r.globalCompositeOperation = 'lighter';
  for (const { a, w, al } of RAYS) {
    r.fillStyle = lin(r, SUN.x, SUN.y, SUN.x + Math.cos(a) * 1500, SUN.y + Math.sin(a) * 1500, [[0, rgba('#ffe0a0', al * 1.6)], [0.5, rgba('#ffc890', al * 0.8)], [1, rgba('#ffc890', 0)]]);
    r.beginPath();
    r.moveTo(SUN.x, SUN.y);
    r.lineTo(SUN.x + Math.cos(a - w) * 1700, SUN.y + Math.sin(a - w) * 1700);
    r.lineTo(SUN.x + Math.cos(a + w) * 1700, SUN.y + Math.sin(a + w) * 1700);
    r.closePath();
    r.fill();
  }
  g.globalCompositeOperation = 'lighter';
  g.imageSmoothingEnabled = true;
  g.drawImage(c, 0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
}

// The sun itself: a disc burning white at the heart and deep gold at the limb, with a wide halo round it.
function sun(g) {
  addGlow(g, glow('#ff9a60'), SUN.x, SUN.y, 1300, 0.55, 0.8);
  addGlow(g, glow('#ffd890'), SUN.x, SUN.y, 720, 0.6);
  addGlow(g, glow('#fff0c0'), SUN.x, SUN.y, SUN.r * 2.2, 0.55);
  g.fillStyle = rad(g, SUN.x, SUN.y, 0, SUN.r, [[0, '#ffffff'], [0.55, '#fff6d0'], [0.88, '#ffd878'], [1, '#ffb048']]);
  g.beginPath();
  g.arc(SUN.x, SUN.y, SUN.r, 0, TAU);
  g.fill();
}

// High streaks of cirrus, gold on their sunward edge and violet beneath.
function cirrus(g) {
  for (let i = 0; i < 9; i++) {
    const [x, y, len, w] = [hash(i + 760) * W - 200, 90 + hash(i + 761) * 420, 600 + hash(i + 762) * 700, 14 + hash(i + 763) * 16];
    for (const [k, a] of [[2.4, 0.05], [1.5, 0.08], [0.8, 0.12]]) {
      brush(g, x, y + 8, len, w * k, rgba('#4a3a98', a), i + 5);
      brush(g, x, y, len, w * k * 0.8, rgba(i % 3 ? '#ffb88a' : '#ffe2b0', a * 1.6), i + 5);
    }
  }
}

// A far bank of towers, pale and soft in the haze, then the near ones, bigger and clearer.
function banks(g, rng) {
  const far = hazed(TONES, '#f0a0a0', 0.5);
  const mid = hazed(TONES, '#e090a0', 0.2);
  for (let x = -100; x < W + 100; x += 130 + rng() * 150) bank(g, lobes(rng, x, SEA + 40, 200 + rng() * 160, 170 + rng() * 150), far);
  for (let x = -60; x < W + 60; x += 280 + rng() * 260) {
    if (Math.abs(x - SUN.x) < 230) continue; // the sun keeps a clearing
    bank(g, lobes(rng, x, SEA + 60, 280 + rng() * 200, 260 + rng() * 280), mid);
  }
}

// Cloud strips lying across the sun's lower face, dark rose against the glare, edged in light.
function across(g) {
  for (const [dy, len, h, a] of [[96, 700, 20, 0.5], [128, 900, 28, 0.62], [60, 420, 12, 0.34]]) {
    brush(g, SUN.x - len * 0.46, SUN.y + dy, len, h, rgba('#a8508a', a), dy);
    brush(g, SUN.x - len * 0.46, SUN.y + dy - h * 0.5, len, h * 0.3, rgba('#ffe8b0', a * 0.7), dy + 1);
  }
}

function sunset(g) {
  const rng = makeRng(1313);
  stars(g, 90, 1301, 190, 0.75);
  addGlow(g, glow('#fff4e0'), 330, 190, 40, 0.5); // a pale moon already up, ahead of the dusk
  g.fillStyle = rgba('#fff6e8', 0.55);
  g.beginPath();
  g.arc(330, 190, 15, 0, TAU);
  g.fill();
  g.fillStyle = rgba('#8a78c0', 0.4);
  g.beginPath();
  g.arc(324, 187, 12, 0, TAU);
  g.fill();
  blobs(g, [[300, 330, 760, '#3a2a98', 0.2, 0.32], [1650, 250, 700, '#4a3aa8', 0.18, 0.3], [820, 130, 640, '#2a2a88', 0.2, 0.3]]);
  cirrus(g);
  rays(g);
  sun(g);
  banks(g, rng);
  across(g);
  const sea = [];
  for (let x = -80; x < W + 80; x += 90) for (const [dy, r] of [[0, 50], [40, 64], [90, 80]]) sea.push([x + hash(x + dy) * 80, SEA + 30 + dy, r * (0.8 + hash(x * 3 + dy) * 0.5)]);
  bank(g, sea, hazed(TONES, '#f09898', 0.1)); // the sea of cloud tops running out to the horizon
  addGlow(g, glow('#ffb060'), SUN.x, SUN.y, 560, 0.4); // the light wraps round every cloud nearest the sun
  g.fillStyle = lin(g, 0, 700, 0, 1080, [[0, rgba('#ffa060', 0)], [1, rgba('#ff9070', 0.25)]]);
  g.fillRect(0, 700, W, 380);
}

export const BODIES5 = { sunset };
