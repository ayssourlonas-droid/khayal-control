// World 18, Anvil Sky, the diver (see w18.js): THE LIGHTNING DART, a sleek arrow craft in a dive. A long silver-white
// needle of a hull with a pitot spike for a nose, swept delta wings tipped in electric blue with a yellow band, small tail
// fins, a yellow dorsal stripe and, amidships, a glass capsule with an arc running through it. Behind it (up the sprite)
// the engine throws a crackling trail: a jagged bolt with branches that is a different bolt on each beat. Everything that
// glows is on the lights layer (the capsule's arc, the wing lamps, the engine, the trail). The sprite is a little bigger
// than the usual 96 px, for the trail (w18.js sets its size, 120).
import { path, ink, lin, rgba, shade, mix, bloom, line, both, INK, IRON_D, STEEL, SPARK, VOLT, rivets, scuff, glare, bolt, jag, metal } from './w18-kit.js';

const BLUE = '#2f86ff';
const YELLOW = '#ffd23a';

function fuselage(g) {
  g.beginPath();
  g.moveTo(0, 44);
  g.bezierCurveTo(3, 30, 8.6, 14, 8.6, 2);
  g.bezierCurveTo(8.6, -8, 6.8, -18, 5.4, -27);
  g.lineTo(-5.4, -27);
  g.bezierCurveTo(-6.8, -18, -8.6, -8, -8.6, 2);
  g.bezierCurveTo(-8.6, 14, -3, 30, 0, 44);
  g.closePath();
}

const WING = [[7.2, 17], [20, 0], [33, -19], [35.5, -27], [16, -25], [7, -13]];

function wings(b, l, f, c) {
  both((s) => {
    const pts = WING.map(([x, y]) => [s * x, y]);
    path(b, pts);
    ink(b, lin(b, s * 7, 17, s * 35, -27, [[0, shade(c, 0.35)], [0.5, mix(c, '#8aa0d0', 0.32)], [1, mix(c, '#2a3a6a', 0.5)]]), 2.8);
    b.save();
    path(b, pts);
    b.clip();
    b.fillStyle = BLUE; // the blue leading edge, a stripe along the sweep
    b.beginPath();
    b.moveTo(s * 7.2, 17);
    b.lineTo(s * 33, -19);
    b.lineTo(s * 35.5, -27);
    b.lineTo(s * 28, -17);
    b.lineTo(s * 9, 14);
    b.closePath();
    b.fill();
    b.fillStyle = YELLOW; // and a yellow band across the tip
    b.beginPath();
    b.moveTo(s * 26, -9);
    b.lineTo(s * 36, -25);
    b.lineTo(s * 36, -21);
    b.lineTo(s * 28, -7);
    b.closePath();
    b.fill();
    for (const [x0, y0, x1, y1] of [[10, 2, 22, -20], [12, 8, 26, -14], [9, -6, 17, -22]]) { // panel lines
      b.beginPath();
      b.moveTo(s * x0, y0);
      b.lineTo(s * x1, y1);
      line(b, rgba('#1a2a50', 0.4), 0.8);
    }
    scuff(b, 8, 7, s * 18, -8, 10, 12, 0.18);
    b.restore();
    path(b, pts);
    line(b, INK, 2.6);
    path(b, [[s * 9.5, 13.4], [s * 31.5, -18.4]], true);
    line(b, rgba('#ffffff', 0.55), 0.9);
    rivets(b, s * 11, -14, s * 14, -21, 2, 0.8, STEEL);
    glare(l, s * 34.6, -26, 1.3, VOLT, 0.9); // the wing lamp
    bolt(l, jag(f ? 3 : 8, s * 24, -4, s * 33, -21, 3, 1.6), SPARK, 0.8, 0.7); // a spark skitters down the wing's edge
  });
}

// Little fins at the tail, behind the wings.
function fins(b, c) {
  both((s) => {
    path(b, [[s * 4.6, -16], [s * 12, -34], [s * 14.5, -33], [s * 6, -26]]);
    ink(b, lin(b, s * 5, -16, s * 14, -34, [[0, shade(c, -0.1)], [1, BLUE]]), 2);
  });
}

function hull(b, c) {
  fuselage(b);
  b.fillStyle = lin(b, -9, 0, 9, 0, [[0, shade(c, -0.45)], [0.22, '#ffffff'], [0.45, c], [0.78, mix(c, '#5a6ea8', 0.5)], [1, '#262f5a']]);
  b.fill();
  b.save();
  fuselage(b);
  b.clip();
  b.fillStyle = BLUE; // the dark nose cone
  b.beginPath();
  b.moveTo(-6, 28);
  b.quadraticCurveTo(0, 34, 6, 28);
  b.lineTo(0, 46);
  b.closePath();
  b.fill();
  b.fillStyle = INK; // a yellow stripe down the back with a dark line either side
  b.fillRect(-2.7, -27, 5.4, 56);
  b.fillStyle = YELLOW;
  b.fillRect(-1.5, -27, 3, 56);
  for (const y of [24, -12, -22]) { // panel seams
    b.beginPath();
    b.moveTo(-9, y);
    b.lineTo(9, y);
    line(b, rgba('#1a2a50', 0.5), 0.9);
  }
  scuff(b, 10, 2, 0, 0, 7, 24, 0.16);
  b.restore();
  fuselage(b);
  line(b, INK, 2.8);
  b.beginPath(); // the pitot spike
  b.moveTo(0, 43);
  b.lineTo(0, 53);
  line(b, INK, 2.4);
  b.beginPath();
  b.moveTo(0, 43);
  b.lineTo(0, 52);
  line(b, '#cfd8ee', 1);
}

// The glass capsule amidships and the arc inside it.
function capsule(b, l, f) {
  b.beginPath();
  b.moveTo(-3.8, 12);
  b.quadraticCurveTo(0, 17, 3.8, 12);
  b.lineTo(3.8, -4);
  b.quadraticCurveTo(0, -7, -3.8, -4);
  b.closePath();
  ink(b, lin(b, -4, 0, 4, 0, [[0, '#1a3a78'], [0.35, '#9fd8ff'], [1, '#12204a']]), 2.2);
  line(b, rgba('#ffffff', 0.5), 0.8);
  bloom(l, 0, 5, 9, VOLT, 0.6);
  l.save();
  l.beginPath();
  l.rect(-3.4, -4, 6.8, 16);
  l.clip();
  bolt(l, jag(f ? 11 : 12, 0, 12, 0, -4, 5, 3.2), '#ffffff', 1, 0.9); // the arc: from the nose end to the tail end
  l.restore();
}

function engine(b, l, f) {
  b.beginPath();
  b.moveTo(-5.4, -27);
  b.lineTo(-4.4, -31);
  b.lineTo(4.4, -31);
  b.lineTo(5.4, -27);
  b.closePath();
  ink(b, metal(b, -5, -31, 5, -27, IRON_D), 1.8);
  glare(l, 0, -31, f ? 3.2 : 4.2, VOLT, 1);
}

// The trail: a cone of blue plasma streaming up the sprite from the engine, a jagged main bolt through it and two branches,
// a different bolt on each beat. Drawn in the sprite's own frame, the engine at (0, -21).
function trail(l, f) {
  const seed = f ? 21 : 5;
  const cone = l.createLinearGradient(0, -21, 0, -58);
  cone.addColorStop(0, rgba(VOLT, 0.6));
  cone.addColorStop(1, rgba(VOLT, 0));
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = cone;
  l.beginPath();
  l.moveTo(-5, -21);
  l.lineTo(-11, -58);
  l.lineTo(11, -58);
  l.lineTo(5, -21);
  l.closePath();
  l.fill();
  l.restore();
  const main = jag(seed, 0, -21, f ? -3 : 3, -58, 6, 8);
  bolt(l, main, VOLT, 2.4, 1);
  bolt(l, jag(seed + 1, main[2][0], main[2][1], f ? -17 : 16, -50, 4, 4), VOLT, 1.4, 0.85);
  bolt(l, jag(seed + 2, main[4][0], main[4][1], f ? 15 : -14, -53, 4, 4), VOLT, 1.2, 0.7);
  bolt(l, jag(seed + 3, 0, -21, f ? 7 : -7, -40, 4, 3), SPARK, 1, 0.8);
}

export function dart(b, l, f, c) {
  trail(l, f);
  for (const g of [b, l]) { // the craft is drawn in its own frame, a little smaller, and set down toward the ship
    g.translate(0, 5);
    g.scale(0.8, 0.8);
  }
  fins(b, c);
  wings(b, l, f, c);
  hull(b, c);
  capsule(b, l, f);
  engine(b, l, f);
  glare(l, 0, 52, 1.2, SPARK, 0.9);
}
