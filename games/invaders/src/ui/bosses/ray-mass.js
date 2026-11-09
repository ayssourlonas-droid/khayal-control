// The Squall Ray's body of cloud (World 18, Anvil Sky; ray-hull.js paints it), painted the way the storm's own towers are
// (parallax-storm-field.js paintCloud: a pile of soft discs, a dark mass of big ones inside the shape, a ragged crowd of small ones along its
// edge, a lighter tone and a rim of cold light on the discs that face the light, pockets of light glowing inside), but in a deep indigo with
// violet pockets, so that the ray is darker, bluer and more saturated than the slate thunderheads it flies in front of. It is built in layers, each
// a shape of ray-shape.js painted over the one before: the two wings (the left is the right one painted through a mirror, with the
// pouches that hang under it; the discs shrink toward the tip, so that it stays a point, and a row of small ones is laid along the tip's ribbon), then the
// torso over the wings' roots, so that its own rim of light parts the body from the wings; then the cephalic lobes, each with a roll wound into its end. Last a shading over all of it: the
// belly and the head darker, the back lighter. The painter draws through `capped` (a context that crops every image at TOP, the HUD's line).
// crisp() hardens the edge of the finished picture, so that the billows are lumps and not mist. Everything comes from the seed. Bake-time only.
import { noise2, makeCanvas, soft } from '../sprites.js';
import { paintCloud, unit } from '../parallax-storm-field.js';
import { clamp } from '../../core/math.js';
import { PAL, TOP, rng, lin, rgba, path, line } from './ray-kit.js';
import { WING, TORSO, HORN, TIP, POUCHES, WING_TIP, polyDepth, ribbonDepth } from './ray-shape.js';

// g with every drawImage cropped at `top`: what is above the line is not drawn.
export function capped(g, top = TOP) {
  const draw = (img, x, y, w, h) => {
    if (y + h <= top) return;
    if (y >= top) g.drawImage(img, x, y, w, h);
    else g.drawImage(img, 0, ((top - y) / h) * img.height, img.width, img.height - ((top - y) / h) * img.height, x, top, w, h - (top - y));
  };
  return new Proxy(g, {
    get: (o, k) => (k === 'drawImage' ? draw : typeof o[k] === 'function' ? o[k].bind(o) : o[k]),
    set: (o, k, v) => {
      o[k] = v;
      return true;
    },
  });
}

const LIGHT = unit(-0.3, -0.95);
const BASE = { color: PAL.hull, light: LIGHT, lit: 1, pockets: 0, pocketA: 0 };
const WINGS = { ...BASE, mid: '#34358c', cold: '#a8c4ff', glow: '#7a5cff', n: 800, edge: 1600, rMax: 30, rEdge: 12, pockets: 7, pocketA: 0.3, squash: (x) => { const k = clamp((WING_TIP[0] - x) / 130, 0.3, 1); return [k, k]; } };
const TORSOS = { ...BASE, mid: '#30308a', cold: '#b4ccff', glow: '#8a6cff', n: 700, edge: 1100, rMax: 30, rEdge: 12, pockets: 5, pocketA: 0.2 };
const FINS = { ...BASE, mid: '#4a4ab0', cold: '#c0d4ff', n: 80, edge: 240, rMax: 18, rEdge: 10, lit: 0.9 };

const noisy = (seed, f) => (x, y) => Math.min(f(x, y) + 8 * (noise2(x, y, 30, seed) - 0.5), (y - TOP - 26) * 1.5); // a ceiling: no disc of the edge reaches the HUD

// Small discs of the cloud's own colour along a ribbon, thick to thin: the tip's point is solid however few discs a random pick lands there.
function along(g, { pts, r0, r1 }, a = 0.95) {
  const n = 36;
  g.globalAlpha = a;
  for (let i = 0; i <= n; i++) {
    const f = (i / n) * (pts.length - 1);
    const k = Math.min(pts.length - 2, Math.floor(f));
    const [x, y] = [0, 1].map((c) => pts[k][c] + (pts[k + 1][c] - pts[k][c]) * (f - k));
    const r = (r0 + (r1 - r0) * (i / n)) * 0.95 + 1.5;
    g.drawImage(soft(PAL.hull), x - r, y - r, r * 2, r * 2);
  }
  g.globalAlpha = 1;
}

// The roll at the end of a lobe: a spiral wound into the paddle's end, a dark groove with a thin light beside it, painted only where there is cloud.
function roll(g) {
  const [cx, cy] = HORN.pts.at(-1);
  const arm = Array.from({ length: 16 }, (_, i) => {
    const t = i / 15;
    return [cx - 1 + Math.cos(0.9 + 5.6 * t) * (13 - 9 * t), cy - 6 + Math.sin(0.9 + 5.6 * t) * (13 - 9 * t)];
  });
  g.save();
  g.globalCompositeOperation = 'source-atop';
  path(g, arm, true);
  line(g, rgba(PAL.cloud[0], 0.55), 3);
  path(g, arm.map(([x, y]) => [x - 1.5, y - 1.5]), true);
  line(g, rgba(PAL.ice, 0.35), 1.2);
  g.restore();
}

export function cloud(g, seed = 7) {
  const r = rng(seed);
  const cg = capped(g);
  for (const side of [-1, 1]) {
    g.save();
    g.scale(side, 1);
    const wing = (x, y) => POUCHES.reduce((d, [px, py, pr]) => Math.max(d, pr - Math.hypot(x - px, y - py)), Math.max(polyDepth(WING, x, y), ribbonDepth(TIP, x, y)));
    paintCloud(cg, r, noisy(seed, wing), [30, -140, 495, 260], WINGS);
    along(cg, TIP);
    g.restore();
  }
  paintCloud(cg, r, noisy(seed + 1, (x, y) => polyDepth(TORSO, x, y)), [-125, -150, 250, 300], TORSOS);
  for (const side of [-1, 1]) {
    g.save();
    g.scale(side, 1);
    paintCloud(cg, r, (x, y) => ribbonDepth(HORN, x, y), [60, 70, 110, 150], FINS);
    roll(g);
    g.restore();
  }
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = lin(g, 0, -20, 0, 150, [[0, rgba(PAL.cloud[0], 0)], [1, rgba(PAL.cloud[0], 0.5)]]);
  g.fillRect(-540, -20, 1080, 260);
  g.fillStyle = lin(g, 0, TOP, 0, 0, [[0, rgba(PAL.volt, 0.18)], [1, rgba(PAL.volt, 0)]]); // and the sky's light on the back
  g.fillRect(-540, TOP, 1080, -TOP);
  g.restore();
}

// A copy of a cloud's canvas with its soft edge hardened: laid over itself n times, a pixel that was a third opaque ends up two thirds, and an edge that
// faded over ten px fades over four. The silhouette grows by a px or two, and its rim of light is a line instead of a haze.
export function crisp(c, n = 3) {
  const e = makeCanvas(c.width, c.height);
  const g = e.getContext('2d');
  for (let i = 0; i < n; i++) g.drawImage(c, 0, 0);
  return e;
}
