// The sprites of the giant cigarettes' tall part (flourish-smog-sky-cig.js draws them), painted once in a warm function. Per cigarette
// (CIGS in parallax-smog-far-cig.js) and per palette (smog, clean, crossfaded by alpha as the smog thins), keyed `smogcig...`:
//   lit    the whole cigarette standing: the paper column with soot stains running down from the lit end, the burnt band, the ash
//   col    the paper column alone, flat on top, which the crumbling crops to the height it has crumbled to
//   cold   the cap of a cold cigarette: dead grey ash and a black band       crack  hairlines across the top of the column
//   snap   the broken top the crumbling leaves at the cut (the same snapped edge as the layer's stump, so the two meet)
// and the chunks of paper and ash that fall. The light and smoke sprites (ember, dust, puffs, ribbons) are in
// flourish-smog-sky-cig-smoke.js. Nothing is cut at its sprite's edge (the sprites carry a margin). A getter builds its key and painter when its sprite is first asked for, not on every call of a frame.
import { cached, byVariant, rgba, lin, hash } from './sprites.js';
import { warmCigSmoke } from './flourish-smog-sky-cig-smoke.js';
import { cigPal, cigBody, raggedTop, CIGS } from './parallax-smog-far-cig.js';
import { TAU } from '../core/math.js';

export const M = 10; // margin round a sprite
export const CAP = 90; // the cap's height above the column's flat top
export const SNAP = { h: 70, base: 66, top: 28 }; // the snap sprite: its height, the baseline (where the column's crop ends) and the y a tooth stands at
const ASH = { smog: ['#413c37', '#7d766d', '#9a9288', '#6c665e', '#34302c'], clean: ['#a8a8ae', '#e2dfda', '#fbf8f2', '#dcd8d2', '#a4a4ac'] };
const CHAR = { smog: '#0e0a08', clean: '#2a2420' };
const MODES = ['smog', 'clean'];
const CRACKS = []; // crackSprite(i), made when first asked for

const cigW = (c) => c.w + M * 2;

// The ash column of a cap: a grey cylinder narrowing a little, its top rounded and uneven, flecked and cracked, its foot on y0.
// `lean` tilts the top (a slumping column); dead ash is darker and more cracked.
function ash(g, mode, w, y0, h, lean, dead) {
  const A = ASH[mode];
  const [x0, tw] = [M + w * 0.05, w * 0.9];
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x0 + w * 0.03 + lean * 0.3, y0 - h * 0.78);
  g.quadraticCurveTo(x0 + tw * 0.2 + lean * 0.6, y0 - h * 1.02, x0 + tw * 0.46 + lean, y0 - h * 0.97);
  g.quadraticCurveTo(x0 + tw * 0.74 + lean, y0 - h * 1.08, x0 + tw - w * 0.03 + lean * 0.3, y0 - h * 0.76);
  g.lineTo(x0 + tw, y0);
  g.closePath();
  g.fillStyle = lin(g, x0, 0, x0 + tw, 0, [[0, A[0]], [0.16, A[1]], [0.6, A[2]], [0.84, A[3]], [1, A[4]]]);
  g.fill();
  g.save();
  g.clip();
  for (let i = 0; i < 46; i++) { // flecks of lighter and darker ash
    g.fillStyle = rgba(i % 3 ? A[0] : A[2], 0.42);
    g.fillRect(x0 + hash(i * 5 + w) * tw, y0 - hash(i * 5 + 1 + w) * h, 1 + hash(i * 5 + 2) * 2.6, 1 + hash(i * 5 + 3) * 1.8);
  }
  g.fillStyle = lin(g, 0, y0, 0, y0 - h * 0.5, [[0, 'rgba(24,16,12,0.5)'], [1, 'rgba(24,16,12,0)']]); // the heat has darkened its foot
  g.fillRect(x0 - 4, y0 - h * 0.5, tw + 8, h * 0.5);
  g.strokeStyle = rgba(A[0], dead ? 0.7 : 0.45); // cracks: a few thin broken lines, each its own
  g.lineWidth = 1;
  g.beginPath();
  for (let k = 0; k < (dead ? 4 : 2); k++) {
    let [cx, cy] = [x0 + tw * (0.18 + 0.64 * hash(k * 7 + w)), y0 - h * (0.12 + 0.3 * hash(k * 7 + w + 1))];
    g.moveTo(cx, cy);
    for (let j = 0; j < 3; j++) {
      cx += (hash(k * 13 + j * 5 + w) - 0.5) * 9;
      cy -= 6 + hash(k * 11 + j * 3 + w) * 9;
      g.lineTo(cx, cy);
    }
  }
  g.stroke();
  g.restore();
}

// The burnt end of the paper: a scorch, brown-black at the lit end and fading down into the paper, its upper edge ragged. Lit, a ring
// of ember lies along it, orange with a pale core, redder toward the paper, shaded round the cylinder like the paper.
function band(g, mode, w, y0, lit) {
  g.fillStyle = lin(g, 0, y0 - 12, 0, y0 + 24, [[0, CHAR[mode]], [0.45, rgba(CHAR[mode], 0.85)], [1, rgba(CHAR[mode], 0)]]);
  g.beginPath();
  g.moveTo(M, y0 + 24);
  for (let x = 0; x <= w; x += 3) g.lineTo(M + x, y0 - 10 - hash(x * 3 + w) * 5);
  g.lineTo(M + w, y0 + 24);
  g.closePath();
  g.fill();
  if (!lit) return;
  g.fillStyle = lin(g, 0, y0 - 12, 0, y0 + 6, [[0, 'rgba(240,160,80,0)'], [0.25, 'rgba(214,134,70,0.62)'], [0.55, 'rgba(196,96,44,0.62)'], [1, 'rgba(130,46,24,0.5)']]);
  g.fillRect(M + 1, y0 - 12, w - 2, 18);
  g.fillStyle = lin(g, M, 0, M + w, 0, [[0, 'rgba(40,8,4,0.55)'], [0.25, 'rgba(40,8,4,0)'], [0.8, 'rgba(255,200,120,0)'], [1, 'rgba(255,200,120,0.3)']]);
  g.fillRect(M, y0 - 12, w, 18);
}

// Soot streaks running down the paper from the lit end: dark strokes, thin and long, fading before the middle.
function soot(g, mode, w, len, s) {
  const k = mode === 'smog' ? 0.46 : 0.14;
  g.fillStyle = lin(g, 0, 0, 0, len * 0.4, [[0, rgba(cigPal(mode).soot, k)], [1, rgba(cigPal(mode).soot, 0)]]);
  g.fillRect(M, 0, w, len * 0.4);
  for (let i = 0; i < 5; i++) {
    const [x, sl] = [M + hash(s + i) * (w - 6), len * (0.15 + 0.3 * hash(s + 20 + i))];
    g.fillStyle = lin(g, 0, 0, 0, sl, [[0, rgba(cigPal(mode).soot, k * 0.5)], [1, rgba(cigPal(mode).soot, 0)]]);
    g.fillRect(x, 0, 3 + hash(s + 40 + i) * 7, sl);
  }
}

const colPaint = (c, mode) => (g, w, h) => {
  cigBody(g, cigPal(mode), M, 0, c.w, h, c.seed, false);
  g.save();
  g.beginPath();
  g.rect(M, 0, c.w, h);
  g.clip();
  soot(g, mode, c.w, c.h, c.seed);
  g.restore();
};

export const colSprite = byVariant((i, mode) => cached(`smogcigCol${i}${mode}`, cigW(CIGS[i]), CIGS[i].h, colPaint(CIGS[i], mode)));

// The whole lit cigarette: the column under its cap, the cap's foot at the column's top.
export const litSprite = byVariant((i, mode) => cached(`smogcigLit${i}${mode}`, cigW(CIGS[i]), CIGS[i].h + CAP, (g) => {
  g.drawImage(colSprite(i, mode), 0, CAP);
  band(g, mode, CIGS[i].w, CAP, true);
  ash(g, mode, CIGS[i].w, CAP - 8, 64, 0, false);
}));

// The cap of a cold cigarette, slumped a little: dead ash, black band.
export const coldSprite = byVariant((i, mode) => cached(`smogcigCold${i}${mode}`, cigW(CIGS[i]), CAP + 24, (g) => {
  band(g, mode, CIGS[i].w, CAP, false);
  ash(g, mode, CIGS[i].w, CAP - 8, 60, CIGS[i].w * 0.1, true);
}));

// The snapped top: the paper between the baseline and the jagged edge of raggedTop, shaded as the column, with the break's lip lit.
export const snapSprite = byVariant((i, mode) => cached(`smogcigSnap${i}${mode}`, cigW(CIGS[i]), SNAP.h, (g) => {
  const [c, C] = [CIGS[i], cigPal(mode)];
  const pts = raggedTop(M, c.w, SNAP.top, c.seed);
  g.beginPath();
  [[M, SNAP.base + 2], ...pts, [M + c.w, SNAP.base + 2]].forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fillStyle = lin(g, M, 0, M + c.w, 0, [[0, C.paper[0]], [0.14, C.paper[1]], [0.58, C.paper[2]], [0.82, C.paper[3]], [1, C.paper[4]]]);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = rgba(C.rim, C.rimA);
  g.fillRect(M + c.w - 2.4, 0, 2.4, SNAP.base + 2);
  g.restore();
}));

// Hairline cracks across the column's top: a crack sprite per cigarette, jagged strokes in dark soot.
export const crackSprite = (i) => (CRACKS[i] ??= cached(`smogcigCrack${i}`, cigW(CIGS[i]), 170, (g) => {
  const c = CIGS[i];
  g.strokeStyle = 'rgba(12,8,6,0.55)';
  g.lineWidth = 1.2;
  g.beginPath();
  for (let k = 0; k < 6; k++) {
    let [x, y] = [M + hash(c.seed * 9 + k) * c.w, 6 + hash(c.seed * 9 + k + 7) * 50];
    g.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x = Math.max(M + 3, Math.min(M + c.w - 3, x + (hash(c.seed * 9 + k * 11 + j) - 0.5) * 12));
      y += 8 + hash(c.seed * 13 + k + j) * 14;
      g.lineTo(x, y);
    }
  }
  g.stroke();
}));

// A chunk of paper and ash that falls: an irregular shard of the tube, 46 x 40: the outer paper curved and lit from the right, the
// hollow of the tube showing as a darker crescent of tobacco along one side, a lit lip along the tear, grey ash clinging to it.
export const chunkSprite = byVariant((k, mode) => cached(`smogcigChunk${k}${mode}`, 46, 40, (g) => {
  const [C, A] = [cigPal(mode), ASH[mode]];
  const path = () => {
    g.beginPath();
    const n = 7;
    for (let j = 0; j < n; j++) {
      const a = (j / n) * TAU + hash(k * 7 + j) * 0.6;
      const r = (j % 2 ? 9 : 16) + hash(k * 11 + j) * 4;
      g.lineTo(23 + Math.cos(a) * r, 20 + Math.sin(a) * r * 0.85);
    }
    g.closePath();
  };
  path();
  g.fillStyle = lin(g, 4, 0, 42, 0, [[0, C.paper[0]], [0.3, C.paper[1]], [0.62, C.paper[2]], [1, C.paper[3]]]);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = mode === 'smog' ? '#5a4a3c' : '#a8987e'; // the hollow of the tube
  g.beginPath();
  g.ellipse(23, 29, 20, 10, -0.3 + k * 0.12, 0, TAU);
  g.fill();
  g.fillStyle = rgba(A[1], 0.85); // ash on it
  g.beginPath();
  g.ellipse(14 + k * 5, 9, 11, 5, 0.3, 0, TAU);
  g.fill();
  g.fillStyle = rgba(C.soot, mode === 'smog' ? 0.28 : 0.1);
  g.fillRect(0, 20, 46, 20);
  g.restore();
  path();
  g.strokeStyle = rgba(C.rim, 0.6); // the tear catches the light
  g.lineWidth = 1.3;
  g.stroke();
}));

export function warmCigs() {
  CIGS.forEach((_, i) => {
    for (const m of MODES) {
      litSprite(i, m);
      colSprite(i, m);
      coldSprite(i, m);
      snapSprite(i, m);
    }
    crackSprite(i);
  });
  for (let k = 0; k < 4; k++) for (const m of MODES) chunkSprite(k, m);
  warmCigSmoke();
}
