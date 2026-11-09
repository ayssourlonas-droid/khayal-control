// The Craving's smoke dots and bumps (World 17, Ash to Air; craving-puff.js builds its billows from bumps, craving-wisp.js its ribbons from
// dots): a DOT is one of 15 cached soft sprites of a colour ramp (seven cool greys from charcoal to a pale ash white, six ember tones
// from burnt brown to orange, ember gold and white-hot), for ribbons and grain; a BUMP is one soft round head of smoke with a pale
// crest on its upper edge and an ember glow on its lower one, painted on a scratch canvas and scaled (bump, below). Bake-time only.
import { cached, makeCanvas, lin, rad, radial, rgba, mix, hash } from '../sprites.js';
import { PAL } from './craving-kit.js';
import { TAU } from '../../core/math.js';

const S = PAL.smoke;
const RAMP = ['#1c1816', '#2e2a2b', '#44444d', '#5b5b67', '#767784', '#9899a6', '#c2c6d3', '#2c1c14', '#55301c', '#7e3c16', '#b0501a', '#e07226', '#ffa04a', '#ffb347', '#ffe9b8'];
export const COOL0 = 0; // the cool greys, 0..6
export const WARM0 = 7; // the ember tones, 7..12
export const HOT = 13; // and the ramp's last two: ember gold and white-hot, for lit smoke drawn additively
const dots = [];
export const dot = (i) => (dots[i] ??= cached('cravsdot' + i, 32, 32, radial([[0, rgba(RAMP[i], 1)], [0.4, rgba(RAMP[i], 0.8)], [0.75, rgba(RAMP[i], 0.24)], [1, rgba(RAMP[i], 0)]])));
export const warmDots = () => RAMP.forEach((_, i) => dot(i));

// A BUMP of radius r at (x, y): one soft round head of smoke, the unit a billow's cauliflower is heaped from. It is made once on a
// scratch canvas (BS px) and drawn scaled: a vertical fall from a pale grey top through a mid grey to charcoal at the bottom; its edge
// feathered away over the outer fifth (destination-out), so that overlapping bumps melt into each other; then, source-atop, the pale CREST,
// a concentric gradient centred below the disc whose bands crowd the top edge (a thin cool crescent, brightest at the very top and gone
// at the sides; strength rim), and the ember BELLY, the same centred above, whose bands crowd the bottom edge (coal, orange, gold; strength
// glow). A bump painted over another lays its pale crest across the other's dark, warm belly: the crevice between two heads of a
// cauliflower. tone 0..1 darkens the body (the cores of a mass); seed varies each bump's grey and the place of its light a little.
const BS = 96;
let scratch = null;
export function bump(g, x, y, r, seed, rim = 1, glow = 1, tone = 1) {
  const v = Math.min(1, tone * (0.86 + 0.26 * hash(seed * 7 + 1)));
  const c = (hex, a = 1) => rgba(mix(hex, '#000000', 1 - v), a);
  if (!scratch) scratch = makeCanvas(BS, BS);
  const s = scratch.getContext('2d');
  const [m, q] = [BS / 2, BS * 0.47]; // the middle and the radius of the disc on the scratch canvas
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.clearRect(0, 0, BS, BS);
  s.globalCompositeOperation = 'source-over';
  s.fillStyle = lin(s, 0, m - q, 0, m + q, [[0, c('#4e4e59')], [0.35, c('#3a3a43')], [0.7, c('#27252b')], [1, c('#151315')]]);
  s.beginPath();
  s.arc(m, m, q, 0, TAU);
  s.fill();
  s.globalCompositeOperation = 'destination-out';
  s.fillStyle = rad(s, m, m, q * 0.8, q, [[0, 'rgba(0,0,0,0)'], [0.6, 'rgba(0,0,0,0.3)'], [1, 'rgba(0,0,0,1)']]);
  s.fillRect(0, 0, BS, BS);
  s.globalCompositeOperation = 'source-atop';
  if (rim > 0) {
    s.fillStyle = rad(s, m, m + 0.24 * q, 0.74 * q, 1.2 * q, [[0, rgba('#cfd3e0', 0)], [0.45, rgba('#b4b8c8', 0.55 * rim)], [1, rgba('#eef0f8', 0.95 * rim)]]);
    s.fillRect(0, 0, BS, BS);
  }
  if (glow > 0) {
    s.fillStyle = rad(s, m, m - 0.24 * q, 0.74 * q, 1.2 * q, [[0, rgba('#c0501a', 0)], [0.35, rgba('#c0501a', 0.55 * glow)], [0.7, rgba('#ff8a2a', 0.85 * glow)], [1, rgba('#ffc060', 0.95 * glow)]]);
    s.fillRect(0, 0, BS, BS);
  }
  g.drawImage(scratch, x - r * (m / q), y - r * (m / q), r * 2 * (m / q), r * 2 * (m / q)); // the disc fills 94% of the scratch canvas: draw it at 7% over r
}

// Grain inside whatever is already painted (source-atop: only where there is smoke): dark mottling and, on the upper half,
// pale flecks, scattered over the disc of radius R round (cx, cy).
export function grain(g, cx, cy, R, n, seed) {
  g.save();
  g.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < n * 2; i++) {
    const a = hash(seed + i * 5) * TAU;
    const d = Math.sqrt(hash(seed + i * 11 + 1)) * R;
    const [x, y] = [cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.9];
    const dark = i % 2 === 0;
    if (!dark && y > cy) continue;
    const r = R * (dark ? 0.05 + 0.12 * hash(seed + i * 3 + 2) : 0.02 + 0.04 * hash(seed + i * 3 + 2));
    g.fillStyle = rad(g, x, y, 0, r, [[0, rgba(dark ? S[0] : S[5], dark ? 0.26 : 0.16)], [1, rgba(dark ? S[0] : S[5], 0)]]);
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  }
  g.restore();
}
