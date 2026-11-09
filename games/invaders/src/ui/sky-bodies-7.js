// The sky of world 15, Lantern Deep (see sky-bodies.js for the contract). Painted once per level over the water
// column's gradient, and the quietest sky of the game: nothing in it may look like a live effect, so it is all
// cool, soft and dim. A pale glow high at the top-centre where the surface is far above, a faint band of
// ripple along the very top, a few very broad hints of shafts of light (the live ones are in flourish-12.js),
// slow blotches of darker and lighter water, a backlight on the water behind the drowned kingdom so its
// silhouette reads, a handful of extremely dim lights far off, and the corners fall away to black.
import { W, H, glow, hash, rgba, lin, rad, addGlow } from './sprites.js';
import { blobs } from './sky-paint.js';

export const GLOW = { x: 960, y: -50, r: 800, alpha: 0.2 }; // the surface's glow: tune alpha for how bright the top reads
export const RIPPLES = 6; // lines of ripple under the surface
export const SHAFT_ALPHA = 0.03; // the broad shaft hints: very faint, the live shafts are the real ones
// The far lights: how many, and their colours (teal and violet, never warm).
export const FAR_LIGHTS = { n: 11, colors: ['#3de8d0', '#b27cff', '#5af0ff'], alpha: [0.1, 0.2] };

// Water darker and lighter than the gradient, in slow blotches: [x, y, r, colour, alpha, squash].
const BLOTCHES = [
  [300, 520, 520, '#010510', 0.28], [1500, 640, 600, '#010510', 0.26], [900, 930, 700, '#010510', 0.3], [1780, 260, 420, '#010510', 0.2, 0.7],
  [700, 270, 560, '#1a6a8e', 0.09, 0.6], [1400, 440, 600, '#1a6a8e', 0.08], [210, 150, 420, '#1a6a8e', 0.08], [1100, 740, 500, '#1a6a8e', 0.07, 0.5],
];

// The surface seen from far below: a pale glow, a sheen and wavering lines of ripple that fade out toward the sides.
function surface(g) {
  addGlow(g, glow('#8fd8f0'), GLOW.x, GLOW.y, GLOW.r, GLOW.alpha, 0.6);
  g.fillStyle = lin(g, 0, 0, 0, 80, [[0, rgba('#bfeaff', 0.1)], [1, rgba('#bfeaff', 0)]]);
  g.fillRect(0, 0, W, 80);
  g.lineWidth = 1.3;
  for (let i = 0; i < RIPPLES; i++) {
    const a = 0.12 - i * 0.017;
    g.strokeStyle = lin(g, 0, 0, W, 0, [[0, rgba('#bfeaff', 0)], [0.28, rgba('#bfeaff', a)], [0.72, rgba('#bfeaff', a)], [1, rgba('#bfeaff', 0)]]);
    g.beginPath();
    for (let x = 0; x <= W; x += 24) {
      const y = 7 + i * 9 + Math.sin(x * 0.011 + i * 1.7) * 2.6 + Math.sin(x * 0.027 + i * 0.6) * 1.4;
      g.lineTo(x, y);
    }
    g.stroke();
  }
}

// Five broad, faint shafts fanning down from the top: trapezoids lit at the top and gone by y 720.
function shafts(g) {
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const [top, lean] = [960 + (i - 2) * 200, (i - 2) * 120 + 60];
    const [wt, wb] = [28 + hash(i + 700) * 30, 100 + hash(i + 710) * 70];
    g.fillStyle = lin(g, 0, 0, 0, 720, [[0, rgba('#9ad8f0', SHAFT_ALPHA)], [1, rgba('#9ad8f0', 0)]]);
    g.beginPath();
    g.moveTo(top - wt, -10);
    g.lineTo(top + wt, -10);
    g.lineTo(top + lean + wb, 720);
    g.lineTo(top + lean - wb, 720);
    g.closePath();
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';
}

// A few lights far off in the dark: tiny, soft and dim.
function farLights(g) {
  for (let i = 0; i < FAR_LIGHTS.n; i++) {
    const [lo, hi] = FAR_LIGHTS.alpha;
    const c = FAR_LIGHTS.colors[i % FAR_LIGHTS.colors.length];
    addGlow(g, glow(c), 80 + hash(i * 3 + 800) * (W - 160), 300 + hash(i * 3 + 801) * 320, 9 + hash(i * 3 + 802) * 9, lo + hash(i + 820) * (hi - lo));
  }
}

function deepsea(g) {
  g.save();
  surface(g);
  shafts(g);
  blobs(g, BLOTCHES);
  addGlow(g, glow('#1a7a96'), 960, 740, 1000, 0.14, 0.35); // the backlight behind the kingdom
  farLights(g);
  g.fillStyle = rad(g, W / 2, H / 2, H * 0.4, Math.hypot(W, H) / 2, [[0, rgba('#00030a', 0)], [1, rgba('#00030a', 0.42)]]);
  g.fillRect(0, 0, W, H);
  g.restore();
}

export const BODIES7 = { deepsea };
