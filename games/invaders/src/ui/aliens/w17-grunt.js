// World 17, Ash to Air, the grunt (see w17.js): THE LIT CIGARETTE, diving nose-down and tilted. A tan, pitted cork
// filter at the back (top), a bent paper tube yellowed and scorched toward the fire with a faint seam, a black char
// ring whose jagged lip bites the paper like a row of teeth, and a crumbling cone of grey ash whose broken lower edge
// lets the ember show through; a thin curl of smoke streams back along its flank. Two angry slits glow on the paper
// just above the char. Beat 0/1: the coal flares and dims, the smoke curl sways the other way and the ash flakes
// tumble to new places. Lights: the coal (hot white in the middle), the seam, the cracks of the ash, the eyes and the
// paper's underglow. Drawn upright down the y axis, then turned about 17 degrees.
import { path, lin, rad, rgba, line, INK, PAPER, PAPER_D, TAN, TAN_D, CHAR, EMBER, HOT, RIM, lerp, tubePts, cyl, glint, grime, streaks, turned, ember } from './w17-kit.js';
import { glare, wisp, flake } from './w17-fx.js';
import { ash } from './w17-grunt-ash.js';

const bend = (y) => 1.0 * Math.sin(y * 0.085 + 0.6);

// The cork filter: a dome at the back, pitted, with a darker sleeve of tipping paper round its front half.
function filter(b) {
  const trace = (g) => {
    g.beginPath();
    g.moveTo(-9.6, -22);
    g.lineTo(-10, -35);
    g.quadraticCurveTo(-10, -42, 0, -42);
    g.quadraticCurveTo(10, -42, 10, -35);
    g.lineTo(9.6, -22);
    g.closePath();
  };
  trace(b);
  b.fillStyle = cyl(b, -10, 10, TAN, 0.62);
  b.fill();
  b.save();
  trace(b);
  b.clip();
  grime(b, 38, 3, 0, -33, 9, 9, 0.5, TAN_D);
  grime(b, 18, 4, -2, -35, 8, 7, 0.45, '#f4d9a0');
  b.fillStyle = lin(b, 0, -31, 0, -22, [[0, rgba(TAN_D, 0)], [1, rgba(TAN_D, 0.55)]]);
  b.fillRect(-11, -31, 22, 10);
  b.fillStyle = lin(b, -10, 0, 10, 0, [[0, rgba('#f3dfb0', 0.6)], [0.3, rgba('#f3dfb0', 0)], [1, rgba('#000', 0.15)]]);
  b.fillRect(-11, -43, 22, 22);
  b.beginPath();
  b.moveTo(-11, -29.5);
  b.lineTo(11, -29.5);
  line(b, rgba(TAN_D, 0.8), 1.1);
  b.beginPath();
  b.moveTo(-11, -28.4);
  b.lineTo(11, -28.4);
  line(b, rgba('#fff0cc', 0.35), 0.8);
  b.restore();
  trace(b);
  line(b, INK, 2.6);
  glint(b, -6.6, -39, -7.8, -31, 1.4, 0.55, RIM);
}

// The paper tube: warm white, a seam, fibres, nicotine yellow and soot creeping up from the fire, scorch marks.
function paper(b, l, f) {
  const hw = (y) => 9.8 + 0.3 * Math.sin(y * 0.2);
  const pts = tubePts(bend, hw, -23, 11, 14);
  path(b, pts);
  b.fillStyle = cyl(b, -10.4, 10.4, PAPER, 0.56);
  b.fill();
  b.save();
  path(b, pts);
  b.clip();
  streaks(b, 14, 5, -10, 10, -22, 11, PAPER_D, 0.22, 0.7);
  b.beginPath(); // the seam: a darker line with a pale lip, a touch right of centre
  b.moveTo(3.8, -23);
  b.bezierCurveTo(4.4, -10, 3.2, 0, 4, 11);
  line(b, rgba(PAPER_D, 0.65), 0.9);
  b.beginPath();
  b.moveTo(4.7, -23);
  b.bezierCurveTo(5.3, -10, 4.1, 0, 4.9, 11);
  line(b, rgba('#ffffff', 0.4), 0.7);
  b.fillStyle = lin(b, 0, -8, 0, 11, [[0, 'rgba(176,128,52,0)'], [0.55, 'rgba(176,128,52,0.38)'], [1, 'rgba(70,40,16,0.78)']]);
  b.fillRect(-12, -8, 24, 22);
  for (const [x, y, r] of [[-5, -15, 2.6], [5.6, -8, 2.1], [-3, 4, 1.7]]) { // scorch marks: brown rings round dark pits
    b.fillStyle = rad(b, x, y, 0, r * 1.9, [[0, rgba(CHAR, 0.9)], [0.42, rgba('#5a3a1c', 0.8)], [0.75, rgba('#b98a45', 0.4)], [1, rgba('#b98a45', 0)]]);
    b.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
  }
  b.beginPath(); // creases across the bent tube
  b.moveTo(-11, -12);
  b.lineTo(-3, -10.4);
  b.moveTo(11, -17);
  b.lineTo(4, -15.6);
  b.moveTo(-11, -1);
  b.lineTo(-6, 0.2);
  line(b, rgba(PAPER_D, 0.7), 0.9);
  grime(b, 34, 6, 0, 4, 10, 10, 0.5);
  b.restore();
  path(b, pts);
  line(b, INK, 2.6);
  glint(b, -7.2, -19, -7.6, -8, 1.3, 0.55, RIM);
  l.save(); // the fire lights the paper from below
  l.globalCompositeOperation = 'lighter';
  path(l, pts);
  l.clip();
  l.fillStyle = lin(l, 0, 0, 0, 12, [[0, rgba(EMBER, 0)], [1, rgba(EMBER, 0.3 + f * 0.1)]]);
  l.fillRect(-12, 0, 24, 13);
  l.restore();
}

// The char ring: burnt black with a jagged lip biting up into the paper, a hot seam along its lower edge.
function charRing(b, l, f) {
  const trace = (g) => {
    g.beginPath();
    g.moveTo(-11.4, 8);
    for (let i = 0; i <= 8; i++) g.lineTo(lerp(-11.4, 11.4, i / 8), i % 2 ? 6.6 - (i % 4) * 0.4 : 11.4 - (i % 3) * 0.6);
    g.lineTo(12, 16.4);
    g.lineTo(-12, 16.4);
    g.closePath();
  };
  trace(b);
  b.fillStyle = lin(b, -12, 0, 12, 0, [[0, '#4a3a2e'], [0.3, '#2b1f17'], [1, CHAR]]);
  b.fill();
  b.save();
  trace(b);
  b.clip();
  grime(b, 16, 8, 0, 12, 11, 4, 0.5, '#7a5c44');
  b.restore();
  trace(b);
  line(b, INK, 2.4);
  glint(b, -9.6, 8.6, -7.6, 9, 1.2, 0.4, '#d0a070');
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  l.moveTo(-11.2, 15.4);
  l.quadraticCurveTo(0, 17.6, 11.2, 15.4);
  line(l, rgba(EMBER, 0.85), 2.2);
  line(l, rgba(HOT, 0.8 + f * 0.1), 1);
  l.restore();
}

// A curl of smoke off the fire, sweeping back along the flank toward the filter, thin at the fire and billowing as it
// climbs; it sways with the beat.
function curl(b, f) {
  const pts = [];
  for (let i = 0; i < 25; i++) {
    const t = i / 24;
    pts.push([15 + t * 3.4 + Math.sin(t * 6.4 + f * 2) * (1 + t * 4.4), lerp(17, -25, t), 2.8 + t * 3.8 + Math.sin(t * 13 + f) * 0.6]);
  }
  wisp(b, pts, 0.95, EMBER, 3 + f);
}

const FLAKES = [[[-13, 31, 2, 0.4], [14.4, 29, 1.5, 1.2]], [[-11, 34, 1.6, 1.4], [15.4, 26, 2.1, 0.2]]];

const SPARKS = [[[-10, 37], [6, 38.4], [13, 34]], [[-7, 38.6], [10, 36], [-14, 33]]];

export function grunt(b, l, f) {
  turned(b, l, -0.3, 0, -1, () => {
    curl(b, f);
    filter(b);
    paper(b, l, f);
    charRing(b, l, f);
    ash(b, l, f);
    for (const [x, y, s, r] of FLAKES[f]) flake(b, x, y, s, r + f, x * 3);
    for (const [x, y] of SPARKS[f]) ember(l, x, y, 3.2, 0.7, 0.8, 0.9); // a few sparks thrown off the coal: tiny, and nothing like a bullet
    glare(b, l, 0, -3, 4.6, 3.4, 1.8, f);
  });
}
