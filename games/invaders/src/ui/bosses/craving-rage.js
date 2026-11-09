// The Craving's rage layers (World 17, Ash to Air; craving.js hands them to the boss cache): extra hull lights that fade in with a phase,
// art only (the core sends the attacks). Hull-sized, additive, drawn under the parts (the system skips them below quality 1), origin
// at the boss's centre. The HOVER phase rears: the maw blazes (it draws breath and fires its laser and homing shots now), the eyes
// flare, more coals come alive in the bowl and the heaps, the wall under the tray glows and the long crack in it lights up. The ORBIT
// phase thrashes: the maw at full, the eyes ablaze, the whole throne lit from inside, the crack and the rim burning white-gold, embers
// at the tops of the cigarettes of the seat back, the tray's heat flooding the wall. Nothing above y -156 (the HUD's edge is -158).
import { heat, line, lin, path, rgba, rng, COAL } from './craving-pkit.js';
import { wallCrack, wallCrack2 } from './craving-throne-wall.js';
import { MOUTH } from './craving-throne-geo.js';

const TOPY = -156;

function face(g, k) { // the maw and the eyes
  heat(g, 0, -14, 130, COAL[1], 0.26 * k, TOPY);
  heat(g, 0, -14, 78, COAL[3], 0.26 * k, TOPY);
  heat(g, 0, -12, 36, COAL[4], 0.2 * k, TOPY);
  for (const s of [-1, 1]) heat(g, s * 150, -36, 92, COAL[3], 0.2 * k, TOPY);
}

function coals(g, k, n) { // coals alive in the bowl, along the mouth of the dish
  const r = rng(141);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI;
    const [x, y] = [Math.cos(a) * MOUTH.rx * (0.55 + r() * 0.4), MOUTH.cy - 4 + Math.sin(a) * MOUTH.ry * 0.7];
    heat(g, x, y, 10 + r() * 10, i % 3 ? COAL[3] : COAL[4], (0.2 + r() * 0.2) * k);
  }
}

function glowCracks(g, a, w) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const pts of [wallCrack(), wallCrack2()]) {
    path(g, pts, true);
    line(g, rgba(COAL[3], a * 0.3), w * 3);
    path(g, pts, true);
    line(g, rgba(COAL[4], a), w);
  }
  g.restore();
}

export const rage = [
  null,
  (g) => {
    face(g, 0.8);
    coals(g, 1, 16);
    for (const s of [-1, 1]) heat(g, s * 165, 44, 80, COAL[2], 0.26);
    heat(g, 0, 112, 118, COAL[1], 0.2);
    glowCracks(g, 0.4, 1.6);
  },
  (g) => {
    face(g, 1.4);
    coals(g, 1.6, 34);
    for (const s of [-1, 1]) {
      heat(g, s * 165, 44, 96, COAL[3], 0.3);
    }
    heat(g, 0, 100, 128, COAL[2], 0.26);
    heat(g, 0, 30, 200, COAL[1], 0.12, TOPY);
    glowCracks(g, 0.85, 2.2);
    g.save();
    g.globalCompositeOperation = 'lighter';
    const fade = (a, c) => lin(g, -250, 0, 250, 0, [[0, rgba(c, 0)], [0.25, rgba(c, a)], [0.75, rgba(c, a)], [1, rgba(c, 0)]]); // not out over the claws
    g.beginPath();
    g.ellipse(MOUTH.cx, MOUTH.cy, MOUTH.rx, MOUTH.ry, 0, 0.1, Math.PI - 0.1);
    line(g, fade(0.3, COAL[3]), 8);
    g.beginPath();
    g.ellipse(MOUTH.cx, MOUTH.cy, MOUTH.rx, MOUTH.ry, 0, 0.1, Math.PI - 0.1);
    line(g, fade(0.5, COAL[4]), 2);
    g.restore();
  },
];
