// World 18's sky body (registry; BODIES10): the dusk inside a thunderstorm, baked once over the gradient the builder laid (look.sky,
// near-black indigo overhead to a sullen orange at the horizon). A cloud deck covers nearly everything, heavy and dark and billowing,
// a few ragged holes in it showing a deep blue-green sky, its lumps catching a cold lilac light from within (lightning that has
// not struck yet) in soft pockets; low on the right a slit of clear sky lies under the deck and over the sea of cloud, with a small
// orange sun burning in it, its top hidden behind the deck's ragged lower edge. The deck's underside near the sun is lit warm, the way
// a storm's belly glows at sunset, and the darkest cloud stays overhead where the fight is. The cloud is one height field of noise
// baked small (sky-bodies-9-kit.js field) and stretched, shaded by what falls away from it above and below.
import { cached, glow, rgba, hash, rad, addGlow, noise2, soft } from './sprites.js';
import { clamp, TAU } from '../core/math.js';
import { field, over, W, H } from './sky-bodies-9-kit.js';
import { SUN, CLOUD, density, slit, smoothstep } from './sky-bodies-10-kit.js';

const STEP = 4; // the cloud is baked at a quarter of the frame: it is soft, and a level's build should be short on a Pi

function cloud(x, y, px) {
  const near = Math.exp(-(((x - SUN.x) / 760) ** 2));
  const s = slit(x, y);
  const D = density(x, y);
  const open = smoothstep(0.6, 0.8, noise2(x, y, 620, 55)) * (1 - smoothstep(380, 640, y)); // where the deck thins into a hole
  const bias = 0.24 + 0.1 * (1 - smoothstep(0, 420, y)) + 0.14 * smoothstep(860, 930, y) - 0.5 * s - 0.4 * open; // a heavy deck, heavier overhead and in the sea
  const scud = s * smoothstep(0.5, 0.78, density(x * 0.4, y * 2.4, 21)) * 0.85; // low rags of cloud crossing the slit and the sun
  const a = Math.max(smoothstep(0.47, 0.57, D + bias), scud);
  if (a <= 0.01) {
    const hole = smoothstep(0.42, 0.14, D + bias) * (1 - smoothstep(480, 680, y)) * 0.7; // a hole in the deck: a deep blue-green sky
    if (hole > 0) over(px, ...CLOUD.teal, hole * 0.85);
    if (s > 0.05) over(px, 150, 46, 24, s * 0.42 * (1 - 0.9 * Math.exp(-(((x - SUN.x) ** 2 + (y - SUN.y) ** 2) / 4900)))); // the slit's sky is a deeper dusk orange, not a pastel one, except round the sun itself
    return;
  }
  const down = density(x + 10, y + 16);
  const lit = clamp(0.4 + (D - down) * 2.6, 0, 1); // a face turned up catches the glow, a face turned down is in shadow
  const k = clamp((D - 0.42) * 1.5 * lit + lit * 0.35 - 0.12, 0, 1);
  const [c0, c1] = k < 0.4 ? [CLOUD.shadow, CLOUD.mid] : [CLOUD.mid, CLOUD.lit];
  const f = k < 0.4 ? k / 0.4 : (k - 0.4) / 0.6;
  px[0] = c0[0] + (c1[0] - c0[0]) * f;
  px[1] = c0[1] + (c1[1] - c0[1]) * f;
  px[2] = c0[2] + (c1[2] - c0[2]) * f;
  px[3] = a;
  const pocket = smoothstep(0.45, 0.8, density(x * 0.8 + 400, y * 0.9 + 90, 11)) * smoothstep(0.5, 0.66, D + bias) * (1 - smoothstep(560, 760, y)); // lit from within
  if (pocket > 0) over(px, ...CLOUD.glow, pocket * 0.62 * (0.45 + 0.55 * lit));
  const belly = clamp(0.62 - (D - down) * 2.6, 0, 1) * (a < 0.98 ? 1 : 0.7); // the underside of the deck and of the rags, near the sun
  const warm = belly * (0.25 + 0.75 * near) * smoothstep(640, 790, y) * (1 - smoothstep(880, 940, y));
  if (warm > 0) over(px, ...CLOUD.warm, warm * 0.85);
  const dark = 0.62 * (1 - smoothstep(0, 380, y)); // the darkest cloud is overhead
  if (dark > 0) over(px, 3, 5, 14, dark);
}

const grain = () => cached('stormskyGrain', 128, 128, (g) => {
  for (let i = 0; i < 2000; i++) {
    g.fillStyle = hash(i * 3 + 2) < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(190,200,255,0.035)';
    g.fillRect((hash(i * 3) * 128) | 0, (hash(i * 3 + 1) * 128) | 0, 1, 1);
  }
});

// The sun: a small hot disc (radius 40) of white-yellow going to orange at its rim, a wide bloom round it, a long low glow along the slit.
function sunDisc(g) {
  addGlow(g, glow('#ff6a24'), SUN.x, SUN.y, 700, 0.5, 0.42);
  addGlow(g, glow('#ff9a40'), SUN.x, SUN.y, 250, 0.8);
  g.fillStyle = rad(g, SUN.x, SUN.y, 0, 50, [[0, '#ffffff'], [0.7, '#fff0c0'], [0.95, '#ffc070'], [1, 'rgba(255,170,80,0)']]);
  g.beginPath();
  g.arc(SUN.x, SUN.y, 50, 0, TAU);
  g.fill();
  for (const [dx, dy, w, h, a] of [[-30, -22, 380, 28, 0.85], [30, 14, 260, 12, 0.35]]) { // two rags of cloud across it
    g.globalAlpha = a;
    g.drawImage(soft('#3a2c4c'), SUN.x + dx - w / 2, SUN.y + dy - h / 2, w, h);
  }
  g.globalAlpha = 1;
}

function stormdusk(g) {
  sunDisc(g);
  g.drawImage(field(STEP, cloud), 0, 0, W, H);
  addGlow(g, glow('#ff8a3a'), SUN.x, SUN.y, 520, 0.26, 0.5); // the light scattered through the deck's thin edges
  addGlow(g, glow('#ffe2a0'), SUN.x, SUN.y + 6, 130, 0.8); // and the sun's hot core, through the rags and the haze
  g.fillStyle = g.createPattern(grain(), 'repeat') ?? rgba('#000', 0);
  g.fillRect(0, 0, W, H);
}

export const BODIES10 = { stormdusk };
