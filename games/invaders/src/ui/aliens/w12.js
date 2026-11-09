// World 12, Starlit Archive: the guard of the stacks, made of ink, paper, leather and bronze. A wisp of
// living ink with two bright eyes and gold letters coming off it, and a paper crane diving wing-first
// at the ship, every fold written over; the spellbook that snaps open to fire and the bronze owl
// bookend are in w12-2.js, the lantern moth in w12-3.js. Anything that burns (eyes, glints, script,
// the spell, the lantern) is on the lights layer. Sprites face down, toward the ship.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { GOLD, script, rune, wisp } from './w12-kit.js';
import { gunner } from './w12-2.js';
import { armored } from './w12-4.js';
import { carrier } from './w12-3.js';

// The blot's outline: a dome that tapers to a point flicking toward s.
function blot(g, s) {
  g.beginPath();
  g.moveTo(0, -27);
  g.bezierCurveTo(14, -27, 22, -14, 22, -2);
  g.bezierCurveTo(22, 12, 12, 22, s * 4, 30);
  g.bezierCurveTo(-12, 22, -22, 12, -22, -2);
  g.bezierCurveTo(-22, -14, -14, -27, 0, -27);
  g.closePath();
}

// An ink wisp: a blot of living ink, glossy and darker than the night, edged in the light of whatever it
// swallowed, with two white eyes under angry lids, licks of ink leaping off its crown, arms that curl up
// on one beat and down on the other, a tail that flicks and sheds drops, and gold letters it has
// soaked up drifting round it.
function grunt(b, l, f, c) {
  const s = f ? 1 : -1;
  const [hi, mid, deep] = [shade(c, -0.12), shade(c, -0.6), shade(c, -0.86)];
  const body = (g) => lin(g, 0, -6, 0, 40, [[0, mid], [1, deep]]);
  for (const [x, tx, ty, w, bend] of [[0, s * 15, 43, 8.4, s * 10], [-11, -14 - s * 2, 36, 4.6, -3], [10, 13 + s * 2, 33, 4.2, 3]]) { // the tail, and two drips hanging off the belly
    wisp(b, x, 16, tx, ty, w, bend);
    ink(b, body(b), 2.4);
  }
  for (const [x, y, r] of [[s * 19, 32, 2.8], [-s * 10, 41, 2.2], [s * 5, 44.4, 1.5]]) { // drops it sheds
    ellipse(b, x, y, r * 0.85, r * 1.15);
    ink(b, mid, 1.6);
    ellipse(b, x - r * 0.3, y - r * 0.4, r * 0.28, r * 0.28);
    b.fillStyle = rgba('#ffffff', 0.7);
    b.fill();
  }
  both((m) => { // arms: curls of ink, reaching up or hanging down by the beat
    const up = f ? -13 : 9;
    wisp(b, m * 16, 3, m * 37, up, 7.6, m * 8);
    ink(b, lin(b, m * 17, 0, m * 36, up, [[0, mid], [1, shade(c, -0.25)]]), 2.4);
    ellipse(b, m * 37, up, 3, 3);
    ink(b, shade(c, -0.3), 1.6);
  });
  for (const [x, tx, ty, w, bend] of [[-11, -18 - f * 2, -34 - f * 5, 5, -3], [0, s * 2, -42 + f * 4, 6.4, s * 2], [11, 18 + (1 - f) * 2, -34 - (1 - f) * 5, 5, 3]]) {
    wisp(b, x, -17, tx, ty, w, bend); // licks of ink off the crown
    ink(b, shade(c, -0.42), 2.2);
  }
  blot(b, s);
  ink(b, rad(b, -7, -15, 2, 44, [[0, hi], [0.34, mid], [1, deep]]), 3);
  b.save();
  blot(b, s);
  b.clip();
  blot(b, s);
  b.lineWidth = 6.4; // the rim of light, strongest on the upper left
  b.strokeStyle = lin(b, -22, -28, 22, 24, [[0, rgba(c, 1)], [0.5, rgba(c, 0.4)], [1, rgba(c, 0.18)]]);
  b.stroke();
  for (let i = 0; i < 3; i++) { // swirls in the ink
    b.beginPath();
    b.ellipse(s * 3, 8 + i * 5, 12 - i * 2.4, 4.4, 0.2 * s, 0.4, 2.8);
    line(b, rgba(c, 0.2), 1.2);
  }
  for (const [x, y, r] of [[-13, 12, 1.6], [12, 15, 1.2], [-4, 21, 1], [15, -17, 1.4]]) { // bubbles
    ellipse(b, x, y, r, r);
    b.fillStyle = rgba('#ffffff', 0.32);
    b.fill();
  }
  b.restore();
  gloss(b, -10, -18, 8.4, 3.8, 0.7, -0.5);
  gloss(b, 14, 6, 2.2, 6, 0.35, 0.25);
  both((m) => { // eyes: a white of lavender under a slanted lid, the pupil looking down at the ship
    ellipse(b, m * 8.2, -5, 6.4, 7.4);
    ink(b, rad(b, m * 7, -8, 0, 9, [[0, '#ffffff'], [1, '#c4bcff']]), 1.8);
    b.save();
    ellipse(b, m * 8.2, -5, 6.4, 7.4);
    b.clip();
    path(b, [[m * 1.4, -14], [m * 16, -16], [m * 16, -9.6], [m * 1.4, -4.6]]);
    b.fillStyle = deep;
    b.fill();
    b.restore();
    path(b, [[m * 1.6, -5.4], [m * 15.4, -10.4]], true);
    line(b, INK, 1.4);
    ellipse(b, m * 8.6, -2.6, 3, 4.1);
    b.fillStyle = '#0a0824';
    b.fill();
    eye(l, m * 7.4, -4.2, 1.1, '#ffffff', 3);
    bloom(l, m * 8.2, -4, 13, c, 0.5);
  });
  bloom(l, 0, 0, 40, c, 0.16 + f * 0.05);
  const slide = f ? 2 : -2; // the letters drift as it beats
  [[-28 + slide, -21 - slide, 8.4, 0], [27 - slide, -29 + slide, 7.4, 1], [31 + slide * 0.5, 7, 7, 3], [-31 - slide, 15 + slide, 6.4, 2]].forEach(([x, y, r, k]) => rune(b, l, x, y, r, k, GOLD, 0.8 + 0.2 * f));
}

// A paper crane in a dive, head first, tail to the sky: folded from a leaf of old paper written over in
// brown ink, each wing a flat triangle broken into a lit facet and a shaded one by its crease, a fold
// turned back at the tip; the neck a long narrow prism, the head a triangle and a small gilt beak.
// The wings beat from raised to lowered; the writing glows faintly gold where the folds are.
function diver(b, l, f, c) {
  const ty = f ? 18 : -30;
  const lit = rgba('#ffffff', 0.55);
  const shd = rgba('#2a2260', 0.36);
  const sepia = rgba('#6a4a2a', 0.6);
  path(b, [[-3.6, -22], [0, -41], [3.6, -22]]); // the tail, a narrow folded tip
  ink(b, shade(c, -0.1), 2.2);
  path(b, [[0, -41], [3.6, -22], [0, -26]]);
  b.fillStyle = shd;
  b.fill();
  both((s) => {
    const [r1, r2, t, m] = [[s * 4, -19], [s * 5, 11], [s * 47, ty], [s * 23, ty * 0.36 - 3]];
    const along = (p, q, u) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
    const [lead, trail] = [along(r1, t, 0.7), along(r2, t, 0.7)];
    const fold = along(r2, t, 0.3);
    path(b, [r1, t, r2]);
    ink(b, lin(b, 0, 0, s * 47, 0, [[0, '#ffffff'], [0.6, c], [1, shade(c, -0.28)]]), 2.8);
    b.save();
    b.clip();
    path(b, [r1, t, m]); // the upper facet catches the light, the lower is in shade
    b.fillStyle = lit;
    b.fill();
    path(b, [m, t, r2]);
    b.fillStyle = shd;
    b.fill();
    for (const g of [b, l]) { // lines of script along the wing, shorter toward the tip
      g.save();
      g.translate(s * 5, -4);
      g.rotate(Math.atan2(t[1] + 4, t[0] - s * 5));
      for (let i = -2; i <= 2; i++) script(g, s > 0 ? 9 : -2, 34 - Math.abs(i) * 6, i * 3.4, g === b ? sepia : rgba(GOLD, 0.3), g === b ? 0.9 : 1.1, i + 3 + (s > 0 ? 0 : 7));
      g.restore();
    }
    path(b, [lead, t, trail]); // the tip turned back: gold on its other face
    b.fillStyle = lin(b, lead[0], lead[1], trail[0], trail[1], [[0, '#ffe08a'], [1, '#c8902a']]);
    b.fill();
    line(b, rgba('#6a4a14', 0.7), 1);
    path(b, [fold, r2, along(r2, m, 0.5)]); // and a flap folded under the trailing edge, in shade
    b.fillStyle = lin(b, fold[0], fold[1], r2[0], r2[1], [[0, '#d8a040'], [1, '#8a5a1a']]);
    b.fill();
    line(b, rgba('#4a2a08', 0.7), 1);
    path(b, [lead, trail], true);
    line(b, rgba('#6a4a14', 0.8), 1.2);
    path(b, [r1, m, r2], true);
    line(b, rgba('#2a2260', 0.5), 1.1);
    b.restore();
    path(b, [r1, t], true);
    line(b, rgba('#ffffff', 0.85), 1.4);
    path(l, [r1, m, r2], true);
    line(l, rgba(GOLD, 0.5), 1.2);
    path(l, [lead, trail], true);
    line(l, rgba(GOLD, 0.55), 1);
  });
  path(b, [[0, -26], [8.4, -6], [0, 15], [-8.4, -6]]); // the body, a folded diamond
  ink(b, rad(b, -3, -10, 1, 24, [[0, '#ffffff'], [0.6, c], [1, shade(c, -0.3)]]), 2.8);
  path(b, [[0, -26], [8.4, -6], [0, 15]]);
  b.fillStyle = shd;
  b.fill();
  path(b, [[0, -26], [-8.4, -6], [0, -6]]);
  b.fillStyle = lit;
  b.fill();
  path(b, [[-8.4, -6], [8.4, -6]], true);
  line(b, rgba('#2a2260', 0.4), 1);
  script(b, -5, 5, 2, sepia, 0.9, 4);
  script(b, -4, 4, 6, sepia, 0.9, 5);
  path(b, [[-4.4, 10], [4.4, 10], [2.4, 32], [-2.4, 32]]); // the neck, a prism: lit on the left, shaded on the right
  ink(b, c, 2.2);
  path(b, [[0, 10], [4.4, 10], [2.4, 32], [0, 32]]);
  b.fillStyle = shd;
  b.fill();
  path(b, [[-4.6, 30], [4.6, 30], [0, 43]]); // the head
  ink(b, shade(c, 0.05), 2.2);
  path(b, [[0, 30], [4.6, 30], [0, 43]]);
  b.fillStyle = shd;
  b.fill();
  path(b, [[-2.2, 38], [2.2, 38], [0, 46.4]]); // the beak, gilt
  ink(b, '#e8b84a', 1.6);
  both((s) => {
    ellipse(b, s * 2, 34, 1.1, 1.4);
    b.fillStyle = '#10122a';
    b.fill();
    eye(l, s * 1.7, 33.4, 0.7, '#ffffff', 2.6);
  });
  gloss(b, -3, -10, 3, 5.6, 0.45, 0.3);
  eye(l, 0, 45, 1.2, GOLD, 2.6);
  bloom(l, 0, 0, 42, c, 0.12 + f * 0.04);
}

export default { rate: 2, bob: 2, halo: 0.2, crack: '#ffd27a', grunt, diver, gunner, armored, carrier };
