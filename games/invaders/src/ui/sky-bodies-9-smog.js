// The smog sky of world 17 at h 0 (smogsky; sky-bodies-9.js registers it): a low, heavy ceiling of smoke over the umber
// gradient. The strata are one soft texture baked small and stretched (sky-bodies-9-kit.js field): long horizontal banks
// of brown-grey with darker underbellies, a thin lit edge along the top of each bank, paler seams where the haze is thin,
// and the sun's side warmed amber. The top of the frame, where the Craving and the aliens fight, stays dark and quiet (a
// faint mottle, no hard shapes); the contrast grows toward a dirty amber horizon, which carries a band of brighter smog.
// The sun is a dull pale coin seen through the smoke: a fuzzy flat disc of radius about 46 with a wide faint amber halo,
// two soft banks of smoke across it, and no rays. A last film of grain keeps the dark top from banding.
import { cached, glow, rgba, lin, rad, addGlow, hash, noise2 } from './sprites.js';
import { clamp } from '../core/math.js';
import { brush } from './sky-paint.js';
import { W, H, SUN, field, over, smoothstep } from './sky-bodies-9-kit.js';

export const COIN_R = 46; // the sun's coin in the smog
const DARK = [22, 16, 13]; // the bellies of the banks
const BODY = [66, 51, 40]; // a bank's body, where the sun reaches it
const PALE = [196, 160, 112]; // the seams, where the haze is thin
const EDGE = [226, 186, 128]; // the lit top edge of a bank
const WARM = [226, 168, 96]; // smoke near the sun
const STEP = 3; // the texture is baked at a third of the frame

// The banks: B (0 thin haze .. 1 smoke) is a stretched, warped noise run through a soft threshold, so a bank has a body, a
// soft edge, a lit top and a shaded belly; streaks of finer noise break up its body. How strong each may be at height u
// (0 top .. 1 bottom): calm and dark up high, bolder and paler toward the horizon.
const bankK = (u) => 0.5 + 0.3 * Math.sin(Math.PI * clamp(u * 1.25, 0, 1));
const edgeK = (u) => 0.1 + 0.4 * u ** 1.1;
const seamK = (u) => 0.03 + 0.4 * u ** 1.5;

function bank(x, y) {
  const warp = noise2(x, y * 2, 1100, 5);
  return smoothstep(0.44, 0.6, noise2(x + warp * 500, y * 5.2 + warp * 90, 620, 9) * 0.78 + noise2(x, y * 9, 260, 17) * 0.22);
}

function smog(x, y, px) {
  const u = y / H;
  const b = bank(x, y);
  const near = Math.exp(-(((x - SUN.x) / 560) ** 2 + ((y - SUN.y) / 380) ** 2));
  const tex = 0.6 + 0.55 * noise2(x, y * 15, 210, 21) * (0.4 + 0.9 * noise2(x, y * 26, 110, 23)) + 0.25 * (noise2(x, y * 44, 330, 25) - 0.5);
  const above = bank(x, y - 22);
  const below = bank(x, y + 22);
  const shade = clamp((above - below) * 1.2 + 0.2, 0, 1); // the belly of a bank: smoke above it, thinner below
  const body = BODY[0] + (DARK[0] - BODY[0]) * shade;
  over(px, body, BODY[1] + (DARK[1] - BODY[1]) * shade, BODY[2] + (DARK[2] - BODY[2]) * shade, b * bankK(u) * tex);
  const lit = clamp((below - above) * 1.2, 0, 1); // the top of a bank, catching the sun
  if (lit > 0) over(px, EDGE[0], EDGE[1], EDGE[2], lit * edgeK(u) * (0.55 + 0.9 * near));
  if (b < 0.5) over(px, PALE[0], PALE[1], PALE[2], (1 - b * 2) * seamK(u) * (0.4 + 0.8 * noise2(x, y * 8, 400, 31))); // the haze between the banks
  if (near > 0.02) over(px, WARM[0], WARM[1], WARM[2], near * 0.3 * (1 - b * 0.5));
}

// Grain: a small tile of faint light and dark specks, laid over the whole sky.
const grain = () => cached('smogskyGrain', 128, 128, (g) => {
  for (let i = 0; i < 2600; i++) {
    const [x, y] = [hash(i * 3) * 128, hash(i * 3 + 1) * 128];
    g.fillStyle = hash(i * 3 + 2) < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,230,190,0.04)';
    g.fillRect(x | 0, y | 0, 1, 1);
  }
});

// The coin, baked once: a fuzzy flat disc of dull cream-grey, seen through smoke that veils it unevenly (a gradient of
// alpha down its height, thin at the crown, thick in two layers lower down), so it is never a clean ball.
const SPR = 240; // the sprite's side
const coinSprite = () => cached('smogskyCoin', SPR, SPR, (g) => {
  const [m, R] = [SPR / 2, COIN_R * 1.45];
  g.fillStyle = rad(g, m, m, 0, R, [[0, rgba('#dccfb2', 0.9)], [0.58, rgba('#d0c2a4', 0.88)], [0.76, rgba('#c2b08c', 0.7)], [1, rgba('#b09a7a', 0)]]);
  g.fillRect(0, 0, SPR, SPR);
  g.globalCompositeOperation = 'destination-in';
  g.fillStyle = lin(g, 0, m - R, 0, m + R, [[0, 'rgba(0,0,0,0.82)'], [0.34, 'rgba(0,0,0,1)'], [0.52, 'rgba(0,0,0,0.9)'], [0.6, 'rgba(0,0,0,0.5)'], [0.7, 'rgba(0,0,0,0.78)'], [0.82, 'rgba(0,0,0,0.42)'], [1, 'rgba(0,0,0,0.2)']]);
  g.fillRect(0, 0, SPR, SPR);
});

function coin(g) {
  addGlow(g, glow('#d89a52'), SUN.x, SUN.y, 380, 0.24);
  addGlow(g, glow('#e0b078'), SUN.x, SUN.y, 150, 0.2);
  g.drawImage(coinSprite(), SUN.x - SPR / 2, SUN.y - SPR / 2);
}

// Thin wisps of smoke, long tapered strokes laid along the banks: darker ones in the dark, paler ones where it is light.
function wisps(g) {
  for (let i = 0; i < 16; i++) {
    const y = 50 + hash(i * 5) ** 1.2 * 640;
    const dark = hash(i * 5 + 1) < 0.55 + (1 - y / 700) * 0.2;
    const a = (dark ? 0.085 : 0.07) * (0.5 + hash(i * 5 + 2)) * (0.5 + y / 1000);
    const len = 300 + hash(i * 5 + 4) * 520;
    brush(g, -150 + hash(i * 5 + 3) * (W - len + 300), y, len, 9 + hash(i * 5 + 6) * 20, rgba(dark ? '#140e0c' : '#d8b684', a), i + 1);
  }
}

export function smogsky(g) {
  g.save();
  g.drawImage(cached('smogskyStrata', Math.ceil(W / STEP), Math.ceil(H / STEP), (c) => c.drawImage(field(STEP, smog), 0, 0)), 0, 0, W, H);
  // the band of brighter smog at the horizon
  g.fillStyle = lin(g, 0, 640, 0, 960, [[0, rgba('#d9a65a', 0)], [0.5, rgba('#d9a65a', 0.2)], [1, rgba('#c08a48', 0.08)]]);
  g.fillRect(0, 640, W, 320);
  wisps(g);
  coin(g);
  g.fillStyle = g.createPattern(grain(), 'repeat');
  g.fillRect(0, 0, W, H);
  g.restore();
}
