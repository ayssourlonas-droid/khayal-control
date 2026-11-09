// The far layer of Starlit Archive: the stacks, shelf towers rising like cathedral spires into the nebula,
// three ranks of them going back into the haze. Behind, pale silhouettes with a window or two; in front
// the ones with their shelves of books showing, pointed windows lit warm, flying arches thrown between
// them, spiral stairs wound round the turrets; and in the middle the great reading hall (parallax-
// archive-hall.js). L.window is the windows' colours, L.rose and L.accent the rose window's glass.
// The mid layer (parallax-archive-2.js) and the near one (-3.js) are registered with this one. See
// parallax-shapes.js for the painter contract.
import { W, rgba, shade, lin } from './sprites.js';
import { pick } from '../core/rng.js';
import { spire as roof } from './parallax-gothic-kit.js';
import { LILAC, NIGHT, poly, shelves, faces, casement, pinnacle, stairs, span, buttress } from './parallax-archive-kit.js';
import { hall, HALL_X } from './parallax-archive-hall.js';
import { ISLES } from './parallax-archive-2.js';
import { GALLERY } from './parallax-archive-3.js';

const BASE = 600; // where the stacks stand, in layer px

// A spire with its right face lit by the galaxy and its left in shade.
function needle(g, L, x, y, w, h) {
  roof(g, x, y, w, h, 6);
  poly(g, [[x, y - h], [x - w / 2 - 6, y + 2], [x, y + 2]]);
  g.fillStyle = rgba(NIGHT, 0.34);
  g.fill();
  poly(g, [[x, y - h], [x + w / 2 + 6, y + 2], [x + w * 0.2, y + 2]]);
  g.fillStyle = rgba(LILAC, 0.2);
  g.fill();
  g.fillStyle = L.color;
}

// One tier of a tower: a shaft with its shelves of books, lit on the right and shaded on the left, and a
// cornice over it.
function tier(g, rng, L, x, base, w, h) {
  g.beginPath();
  g.rect(x - w / 2, base - h, w, h);
  g.fill();
  g.save();
  g.clip();
  shelves(g, rng, x - w / 2, base - h, w, h);
  faces(g, x - w / 2, base - h, w, h);
  g.restore();
  g.fillStyle = L.color;
  g.fillRect(x - w / 2 - 4, base - h - 7, w + 8, 7);
  g.fillStyle = rgba('#d8ccff', 0.4);
  g.fillRect(x - w / 2 - 4, base - h - 7, w + 8, 1.2);
  g.fillStyle = L.color;
}

// Rows of pointed windows up a tier, some of them lit, a few of those casting light.
function windows(g, out, rng, L, x, base, w, h) {
  const cols = Math.max(1, Math.floor((w - 8) / 24));
  for (let y = base - 24; y > base - h + 34; y -= 46 + rng() * 8) {
    for (let c = 0; c < cols; c++) {
      const state = rng() < 0.26 ? 0 : rng() < 0.3 ? 2 : 1;
      casement(g, out, rng, x - w / 2 + (w * (c + 0.5)) / cols, y, 9, 24, pick(rng, L.window), pick(rng, ['steady', 'pulse', 'steady']), state);
    }
  }
  g.fillStyle = L.color;
}

// Three tiers drawing in, a pinnacle at each set-back, a needle on top.
function spireTower(g, out, rng, L, x, base, w, h) {
  let y = base;
  [[w, h * 0.5], [w * 0.78, h * 0.3], [w * 0.56, h * 0.2]].forEach(([tw, th], i) => {
    tier(g, rng, L, x, y, tw, th);
    windows(g, out, rng, L, x, y, tw, th);
    if (i < 2) for (const s of [-1, 1]) pinnacle(g, x + s * (tw / 2 - 1), y - th - 6, 9, 34 - i * 8);
    y -= th + 7;
  });
  needle(g, L, x, y + 7, w * 0.56 + 8, h * 0.4);
}

// A round turret with a stair spiralling up its face, a balcony, a conical cap.
function turret(g, out, rng, L, x, base, w, h) {
  tier(g, rng, L, x, base, w, h);
  g.save();
  g.beginPath();
  g.rect(x - w / 2, base - h, w, h);
  g.clip();
  g.fillStyle = lin(g, x - w / 2, 0, x + w / 2, 0, [[0, rgba(NIGHT, 0.5)], [0.5, rgba(NIGHT, 0.05)], [0.85, rgba(LILAC, 0.22)], [1, rgba(LILAC, 0.05)]]); // rounded, lit on the right
  g.fillRect(x - w / 2, base - h, w, h);
  stairs(g, x - w / 2, x + w / 2, base - 12, base - h + 24, h / 80);
  g.restore();
  g.fillStyle = L.color;
  g.fillRect(x - w / 2 - 7, base - h * 0.68, w + 14, 5);
  g.fillRect(x - w / 2 - 7, base - h * 0.68 - 9, 2, 9);
  g.fillRect(x + w / 2 + 5, base - h * 0.68 - 9, 2, 9);
  for (let y = base - 30, i = 0; y > base - h + 30; y -= 54, i++) casement(g, out, rng, x + (i % 2 ? 6 : -6), y, 8, 22, pick(rng, L.window), 'flicker', i % 3 ? 1 : 2);
  g.fillStyle = L.color;
  needle(g, L, x, base - h - 7, w + 16, h * 0.55);
}

// A broad block of shelves under a roofline of gables, twin spires at its corners.
function block(g, out, rng, L, x, base, w, h) {
  tier(g, rng, L, x, base, w, h * 0.78);
  windows(g, out, rng, L, x, base, w, h * 0.78);
  const top = base - h * 0.78 - 7;
  for (let gx = x - w / 2; gx < x + w / 2 - 12; gx += 24) {
    poly(g, [[gx, top], [gx + 12, top - 22], [gx + 24, top]]);
    g.fill();
    g.fillRect(gx + 11, top - 28, 2, 8);
  }
  for (const s of [-1, 1]) needle(g, L, x + s * (w / 2 - 6), top + 4, 20, h * 0.34);
  for (const s of [-1, 1]) buttress(g, x + (s * w) / 2, base - h * 0.5, s, base);
  g.fillStyle = L.color;
}

// A needle: a slender shaft rising far over its neighbours, its windows in single file, balconies, a very
// tall spire.
function needleTower(g, out, rng, L, x, base, h) {
  const [w, top] = [26, base - h * 0.78];
  tier(g, rng, L, x, base, w, h * 0.78);
  for (let y = base - 30, i = 0; y > top + 20; y -= 40, i++) casement(g, out, rng, x, y, 7, 22, pick(rng, L.window), 'steady', i % 4 ? i % 2 : 2);
  g.fillStyle = L.color;
  for (let y = base - 90; y > top; y -= 120) g.fillRect(x - w / 2 - 5, y, w + 10, 4);
  needle(g, L, x, top - 7, w + 10, h * 0.22 + 60);
}

// A far tower: just its outline, in tiers with a needle, and a window or two, in the haze.
function ghost(g, rng, x, base, w, h, color) {
  let y = base;
  for (const [k, f] of [[1, 0.55], [0.74, 0.3], [0.5, 0.15]]) {
    g.fillRect(x - (w * k) * 0.5, y - h * f, w * k, h * f + 1);
    if (k < 1) for (const s of [-1, 1]) pinnacle(g, x + s * w * k * 0.5, y - h * f, 7, 20 + h * 0.03);
    y -= h * f;
  }
  poly(g, [[x - w * 0.25 - 2, y], [x, y - h * (0.36 + rng() * 0.3)], [x + w * 0.25 + 2, y]]);
  g.fill();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = rgba('#ffd98a', 0.12 + rng() * 0.3);
    g.fillRect(x - w * 0.5 + 6 + rng() * (w - 14), base - h * 0.85 + rng() * h * 0.8, 2, 4);
    g.fillStyle = color;
  }
}

function stacks(g, w, h, rng, L, out) {
  const cx = HALL_X + (w - W) / 2;
  const ghosts = [shade(L.color, 0.07), shade(L.color, 0.035)];
  g.fillStyle = ghosts[0];
  for (let x = 60; x < w; x += 70 + rng() * 80) ghost(g, rng, x, BASE, 46 + rng() * 40, 300 + rng() * 240, ghosts[0]);
  g.fillStyle = ghosts[1];
  for (let x = 20; x < w; x += 110 + rng() * 110) ghost(g, rng, x, BASE, 56 + rng() * 40, 260 + rng() * 200, ghosts[1]);
  g.fillStyle = L.color;
  const made = [];
  for (let x = 40 + rng() * 40; x < w - 30; ) {
    const kind = Math.floor(rng() * 4);
    const tw = kind === 3 ? 26 : 56 + rng() * 44;
    if (Math.abs(x - cx) < 330 + tw / 2) { // the hall's ground
      x += 60;
      continue;
    }
    const th = kind === 3 ? 480 + rng() * 80 : 250 + rng() * 270;
    const bw = kind === 2 ? tw + 26 : tw;
    [spireTower, turret, block, needleTower][kind](g, out, rng, L, x, BASE, kind === 3 ? th : bw, kind === 3 ? undefined : th);
    made.push([x, bw, th]);
    x += bw + 16 + rng() * 90;
  }
  for (let i = 1; i < made.length; i++) { // arches thrown between neighbours
    const [[xa, wa, ha], [xb, wb, hb]] = [made[i - 1], made[i]];
    if (xb - wb / 2 - (xa + wa / 2) < 160 && rng() < 0.7) span(g, xa + wa / 2 - 2, xb - wb / 2 + 2, BASE - Math.min(ha, hb) * (0.42 + rng() * 0.4), 24 + rng() * 12);
  }
  g.fillStyle = L.color;
  hall(g, out, rng, L, cx, BASE);
  g.fillStyle = L.color;
  g.fillRect(0, BASE - 6, w, h); // the ground under all of it, sinking into the dark
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = lin(g, 0, BASE - 160, 0, BASE + 20, [[0, rgba(NIGHT, 0)], [1, rgba(NIGHT, 0.6)]]);
  g.fillRect(0, BASE - 160, w, h);
  g.globalCompositeOperation = 'source-over';
}

export const ARCHIVE = { stacks, ...ISLES, ...GALLERY };
