// The frames of the Vesper Moth's slow wingbeat (World 16, Glass Cathedral; moth-wing-live.js draws them), baked ahead of
// the fight (warmFrames): the forewing painted whole at POSES poses of the beat (moth-wing.js paintWing; pose k is
// k / (POSES - 1), and pose 0 is the part's own static body, which the hull, the poster and the collapse show). Each
// frame is the whole wing re-painted a little larger and tipped up, brighter, its sheen further out and the wave of light
// at its row, so its silhouette holds every smaller pose's and the static art never shows round it. The live pass draws
// the frame for the beat's pose, and the next one fading in over it, each placed as exactly the pose the wing is at
// now (`pose` below: a frame painted at one pose, turned and swelled a hair to another), so the lead never doubles
// while the light cross-fades; mirrored for the right wing. A frame is a canvas of the box FB in the part's own
// coordinates, with its lights (soft, so at LS of the size) beside it. Also baked here: the flash (a white wing for a
// moment after a hit) and the two damage layers (cracks and shattered panes in lead and light, clipped to the wing,
// drawn with the pose itself so they stay on its glass). Keys 'mothWing...' (the frames' and the layers').
import { makeCanvas, hash } from '../sprites.js';
import { line, lin, rgba, shade } from './kit.js';
import { LEAD, GOLD } from './moth-kit.js';
import { paintWing, TILT, GROW } from './moth-wing.js';
import { HUB, NV, ROWS, RING, ARCHES, outline, cellPath } from './moth-wing-geo.js';

export const FB = { x: -184, y: -94, w: 376, h: 216 }; // the top is -156 from the boss's centre: under the HUD
export const POSES = 8;
export const LS = 0.5;
const KEYS = Array.from({ length: POSES }, (_, k) => 'mothWing' + k); // the frames' keys, made once
const frames = new Map(); // 'mothWing3' -> { body, lights }
const layers = new Map(); // 'mothWingCrack1', 'mothWingFlash': the sprites' keys

// The soft light fades out toward the edges of its canvas, so that it never ends in a line (and, at the top, never
// reaches the HUD).
function fadeEdges(l, w, h, m = 16) {
  l.setTransform(1, 0, 0, 1, 0, 0);
  l.globalCompositeOperation = 'destination-out';
  const fade = (x0, y0, x1, y1, rect) => {
    l.fillStyle = lin(l, x0, y0, x1, y1, [[0, 'rgba(0,0,0,1)'], [1, 'rgba(0,0,0,0)']]);
    l.fillRect(...rect);
  };
  fade(0, 0, m, 0, [0, 0, m, h]);
  fade(w, 0, w - m, 0, [w - m, 0, m, h]);
  fade(0, 0, 0, m, [0, 0, w, m]);
  fade(0, h, 0, h - m, [0, h - m, w, m]);
  l.globalCompositeOperation = 'source-over';
}

export function wingFrame(k) {
  let f = frames.get(KEYS[k]);
  if (!f) {
    const body = makeCanvas(FB.w, FB.h);
    const lights = makeCanvas(FB.w * LS, FB.h * LS);
    const [b, l] = [body.getContext('2d'), lights.getContext('2d')];
    b.translate(-FB.x, -FB.y);
    l.scale(LS, LS);
    l.translate(-FB.x, -FB.y);
    paintWing(b, l, k / (POSES - 1));
    fadeEdges(l, lights.width, lights.height);
    f = { body, lights };
    frames.set(KEYS[k], f);
  }
  return f;
}

// The turn and swell of pose p about the wing's base, as a canvas transform. `from` is the pose a frame was painted at:
// a frame drawn with this is placed exactly as pose p, so the poses a frame is cross-faded between never double the lead
// (the frames differ in light and sheen, not in where their cames lie).
export function pose(ctx, p, from = 0) {
  ctx.translate(HUB[0], HUB[1]);
  ctx.rotate(TILT * (p - from));
  ctx.scale((1 + GROW[0] * p) / (1 + GROW[0] * from), (1 + GROW[1] * p) / (1 + GROW[1] * from));
  ctx.translate(-HUB[0], -HUB[1]);
}

function layer(key, paint) {
  let c = layers.get(key);
  if (!c) {
    c = makeCanvas(FB.w, FB.h);
    const g = c.getContext('2d');
    g.translate(-FB.x, -FB.y);
    paint(g);
    layers.set(key, c);
  }
  return c;
}

export const wingFlash = () => layer('mothWingFlash', (g) => {
  outline(g);
  g.fillStyle = '#ffffff';
  g.fill();
});

// A crack: a jagged run from (x, y) wandering along `a`, in `n` steps of about `step` px.
function crack(g, x, y, a, n, step, seed) {
  g.beginPath();
  g.moveTo(x, y);
  for (let i = 0; i < n; i++) {
    a += (hash(seed + i * 7) - 0.5) * 1.6;
    [x, y] = [Math.min(150, Math.max(-146, x + Math.cos(a) * step * (0.6 + hash(seed + i * 3)))), Math.min(84, Math.max(-76, y + Math.sin(a) * step * (0.6 + hash(seed + i * 5))))];
    g.lineTo(x, y);
  }
}

// The runs of one stage's cracks, each from the apex of a pane's arch: stroked by `paint` (lead, then light).
function cracks(g, stage, paint) {
  for (let c = 0; c < stage * 3 + 1; c++) {
    const [i, r] = [Math.floor(hash(c * 11 + stage) * (NV - 1)), 1 + Math.floor(hash(c * 17 + 3) * ROWS)];
    crack(g, ...ARCHES[r][i].apex, hash(c * 5 + stage * 9) * 6.28, 4 + stage * 2, 11, c * 101 + stage);
    paint();
  }
}

// Stage 1: a few cracks through the lead. Stage 2: more, and three panes gone dark and splintered.
export const crackLayer = (stage) => layer('mothWingCrack' + stage, (g) => {
  g.save();
  outline(g);
  g.clip();
  for (const [i, r] of stage > 1 ? [[2, 2], [3, 3], [1, 4]] : []) {
    cellPath(g, i, r);
    g.fillStyle = rgba('#0a0620', 0.8);
    g.fill();
    const [mx, my] = [(RING[r][i][0] + RING[r + 1][i + 1][0]) / 2, (RING[r][i][1] + RING[r + 1][i + 1][1]) / 2];
    g.save();
    cellPath(g, i, r);
    g.clip();
    g.beginPath();
    for (let s = 0; s < 6; s++) { // splinters running out from the middle of the broken pane
      const a = hash(i * 31 + r * 7 + s) * 6.28;
      g.moveTo(mx, my);
      g.lineTo(mx + Math.cos(a) * 30, my + Math.sin(a) * 30);
    }
    line(g, rgba(shade(GOLD, 0.3), 0.5), 0.9);
    g.restore();
  }
  cracks(g, stage, () => line(g, rgba(LEAD, 0.95), 2.8));
  cracks(g, stage, () => line(g, rgba(shade(GOLD, 0.4), 0.8), 0.9));
  g.restore();
});

export function warmFrames() {
  for (let k = 1; k < POSES; k++) wingFrame(k);
  wingFlash();
  crackLayer(1);
  crackLayer(2);
}
