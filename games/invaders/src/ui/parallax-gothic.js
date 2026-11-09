// The castle of Hollow Night (the far layer) on a crag over the foothills, its windows lit warm; the
// dead wood (parallax-gothic-2.js) and the graveyard (parallax-graves.js) are registered with it. See parallax-shapes.js for the painter
// contract. The great castle stands under the moon (MOON.x), L.window its lit colours.
import { W, rgba } from './sprites.js';
import { MOON } from './sky-bodies-3.js';
import { pick } from '../core/rng.js';
import { profile, waves } from './parallax-kit.js';
import { pane, lancet, spire, merlons } from './parallax-gothic-kit.js';
import { DEAD } from './parallax-gothic-2.js';
import { GRAVES } from './parallax-graves.js';

const RED = '#ff2a3a';
const WARM = '#ff9a4a';

// A tower's body with coursed stone and a moon-lit edge, widening at the foot, corbelled out at the top.
function shaft(g, x, base, w, h) {
  g.beginPath();
  g.moveTo(x - w / 2 - 4, base);
  g.lineTo(x - w / 2, base - h);
  g.lineTo(x - w / 2 - 6, base - h);
  g.lineTo(x - w / 2 - 6, base - h - 7);
  g.lineTo(x + w / 2 + 6, base - h - 7);
  g.lineTo(x + w / 2 + 6, base - h);
  g.lineTo(x + w / 2, base - h);
  g.lineTo(x + w / 2 + 4, base);
  g.fill();
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = rgba('#000000', 0.2);
  for (let y = base - 10; y > base - h; y -= 13) g.fillRect(x - w / 2 - 2, y, w + 4, 1);
  g.fillStyle = rgba(WARM, 0.13); // the moon is on the right
  g.fillRect(x + w / 2 - 5, base - h - 6, 5, h + 6);
  g.fillStyle = rgba('#000000', 0.28);
  g.fillRect(x - w / 2, base - h - 6, 6, h + 6);
  g.restore();
}

// A tower: shaft, windows up its face, arrow slits, and a roof (spire > 0) or parapet.
function tower(g, out, rng, L, x, base, w, h, spireH = 0) {
  shaft(g, x, base, w, h);
  if (spireH) spire(g, x, base - h - 7, w + 8, spireH);
  else merlons(g, x - w / 2 - 6, x + w / 2 + 6, base - h - 7);
  const rows = Math.max(1, Math.floor(h / 70));
  for (let i = 0; i < rows; i++) {
    const y = base - 36 - i * 62 - rng() * 10;
    if (i % 2 === 0) {
      rng(); // unused, kept so the draws after it, and the seeded layout with them, stay as they were
      pane(g, out, rng, x, y, 8, 17, pick(rng, L.window));
    } else {
      g.fillStyle = rgba('#0a0412', 0.8);
      g.fillRect(x - 1.5, y - 14, 3, 14); // an arrow slit
      g.fillStyle = L.color;
    }
  }
}

// Broken towers on a far hill, a lit window or two: a ruin, `s` times the castle's size.
function ruin(g, out, rng, L, x, y, s) {
  tower(g, out, rng, L, x, y + 4, 60 * s, 170 * s);
  g.beginPath(); // the broken crown
  g.moveTo(x - 36 * s, y - 170 * s - 4);
  g.lineTo(x - 14 * s, y - 196 * s);
  g.lineTo(x + 2 * s, y - 180 * s);
  g.lineTo(x + 24 * s, y - 204 * s);
  g.lineTo(x + 36 * s, y - 170 * s - 4);
  g.fill();
  g.fillRect(x + 50 * s, y - 70 * s, 130 * s, 74 * s); // a wall with two gaps
  merlons(g, x + 50 * s, x + 180 * s, y - 70 * s, 9, 11);
  tower(g, out, rng, L, x + 200 * s, y + 4, 44 * s, 110 * s, 80 * s);
}

// Rock under the castle: a plateau, cliffs with jagged shoulders, strata lit on the moon's side.
function crag(g, rng, cx, top, base) {
  g.beginPath();
  g.moveTo(cx - 470, base);
  const side = (dir) => {
    const pts = [];
    for (let i = 0; i <= 9; i++) {
      const u = i / 9;
      pts.push([cx + dir * (250 + 215 * u ** 1.5 + (rng() - 0.5) * 22), top + (base - top) * (1 - (1 - u) ** 1.6) + (rng() - 0.5) * 12]);
    }
    return pts;
  };
  const l = side(-1);
  for (let i = l.length - 1; i >= 0; i--) g.lineTo(...l[i]);
  g.lineTo(cx - 236, top - 4);
  g.lineTo(cx + 236, top - 4);
  for (const p of side(1)) g.lineTo(...p);
  g.lineTo(cx + 470, base);
  g.fill();
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.lineCap = 'round';
  for (let i = 0; i < 34; i++) {
    const x = cx - 270 + rng() * 540;
    const y = top + 14 + rng() * (base - top - 20);
    const len = 14 + rng() * 40;
    g.strokeStyle = x > cx ? rgba(WARM, 0.1 + rng() * 0.08) : rgba('#000000', 0.3);
    g.lineWidth = 1.2 + rng() * 1.6;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len * (x > cx ? -0.5 : 0.5), y + len * 0.7);
    g.stroke();
  }
  g.restore();
}

function castle(g, w, h, rng, L, out) {
  const cx = MOON.x + (w - W) / 2;
  const top = h * 0.45;
  const hills = waves(rng, 3, 0.0035);
  profile(g, w, h, (x) => h * (0.64 + 0.05 * hills(x)));
  ruin(g, out, rng, L, cx - 820, h * 0.64, 0.6);
  ruin(g, out, rng, L, cx + 700, h * 0.62, 0.5);
  crag(g, rng, cx, top, h * 0.7);
  g.fillRect(cx - 238, top - 50, 476, 60); // the curtain wall, with a walkway of merlons
  merlons(g, cx - 238, cx + 238, top - 50, 12, 14);
  tower(g, out, rng, L, cx - 205, top + 6, 56, 150, 120); // the round west tower
  tower(g, out, rng, L, cx + 178, top + 6, 54, 200, 130); // the Count's tower
  tower(g, out, rng, L, cx - 70, top + 6, 38, 180, 90); // a needle turret
  g.fillRect(cx - 28, top - 188, 118, 190); // the keep, under a stepped gable
  merlons(g, cx - 28, cx + 90, top - 188, 12, 14);
  g.beginPath();
  g.moveTo(cx - 20, top - 188);
  g.lineTo(cx + 31, top - 252);
  g.lineTo(cx + 82, top - 188);
  g.fill();
  spire(g, cx + 31, top - 248, 6, 36, 2);
  pane(g, out, rng, cx + 31, top - 100, 24, 64, L.window[1], 'flicker'); // the great hall
  pane(g, out, rng, cx + 4, top - 150, 9, 22, L.window[0]);
  pane(g, out, rng, cx + 58, top - 150, 9, 22, L.window[2]);
  g.beginPath(); // the gatehouse and its dark arch, lit from inside
  g.rect(cx - 150, top - 90, 62, 100);
  merlons(g, cx - 150, cx - 88, top - 90, 12, 11);
  g.fill();
  lancet(g, cx - 119, top + 8, 26, 50);
  g.fillStyle = '#05020a';
  g.fill();
  g.fillStyle = L.color;
  out.lights.push({ x: cx - 119, y: top - 14, r: 30, color: '#ffb347', mode: 'flicker', ph: rng(), a: 0.5 });
  pane(g, out, rng, cx - 119, top - 52, 8, 17, L.window[0]);
  g.fillRect(cx + 232, top - 70, 100, 80); // the chapel hall to the east, lancets along it
  g.beginPath();
  g.moveTo(cx + 226, top - 70);
  g.lineTo(cx + 282, top - 112);
  g.lineTo(cx + 338, top - 70);
  g.fill();
  for (const x of [250, 282, 314]) pane(g, out, rng, cx + x, top - 8, 9, 34, L.window[x % 3]);
  pane(g, out, rng, cx + 178, top - 168, 8, 18, RED, 'pulse'); // the Count's window, red
  out.lights.push({ x: cx + 178, y: top - 175, r: 34, color: RED, mode: 'pulse', ph: 0.2, a: 0.55 });
  out.lights.push({ x: cx - 205, y: top - 130, r: 15, color: '#7dff5a', mode: 'flicker', ph: 0.6, a: 0.7 }); // a witch-light in the west tower
}

export const GOTHIC = { castle, ...DEAD, ...GRAVES };
