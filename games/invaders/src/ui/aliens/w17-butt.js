// World 17, Ash to Air, the diver (see w17.js): THE FLICKED BUTT, tumbling as it dives. A half-smoked stub, bent double
// at a crumple: a soggy, nicotine-yellowed cork filter at the back, a creased and scorched paper stub with a hard little
// frown, and a shredded, charred head of paper tufts glowing where they tear. A comet of smoke streams UP behind it
// (the sprite faces down), tapering to a spike, and a few paper scraps and sparks fly off: the silhouette is a spiky
// teardrop so it reads as fast. Beat 0 the stub is flung over to the right, beat 1 it has tumbled to the left; the
// head's tufts, the smoke trail and the sparks are drawn anew each beat. Lights: the torn head's fire, the coal, the
// eyes, the sparks.
import { path, lin, rad, rgba, mix, line, circle, bloom, INK, PAPER, PAPER_D, TAN_D, CHAR, EMBER, HOT, RIM, lerp, tubePts, cyl, glint, grime, streaks, turned, ember } from './w17-kit.js';
import { glare, wisp, flake } from './w17-fx.js';

const FILTER = '#dec88c'; // soggy, yellowed cork
const LW = 1.8; // outline width (the stub is drawn 1.32 times larger)
const K = 1.32; // the stub is drawn at this scale
const POSE = [{ rot: 0.62, x: 6, y: 10.5 }, { rot: -0.5, x: -5, y: 12 }]; // the tumble, beat by beat
const KX = 5.4; // how far the fold shifts the head
const kink = (y) => KX / (1 + Math.exp(-(y - 3) * 0.7)); // the stub folds over at its crumple

function filterPart(b) {
  const pts = tubePts(() => 0, (y) => 7.6 - Math.max(0, -y - 20) * 1.1 - 1.6 * Math.exp(-(((y + 14) / 2.4) ** 2)) + 0.4 * Math.sin(y * 1.3), -23, -6, 16); // pinched where it was gripped
  path(b, pts);
  b.fillStyle = cyl(b, -8, 8, FILTER, 0.5);
  b.fill();
  b.save();
  path(b, pts);
  b.clip();
  grime(b, 22, 21, 0, -15, 7, 8, 0.4, '#9a7436');
  grime(b, 16, 22, -2, -17, 6, 6, 0.5, '#fff8de');
  b.fillStyle = lin(b, 0, -22, 0, -5, [[0, rgba('#c89a3c', 0.15)], [0.5, rgba('#b8862e', 0.42)], [1, rgba('#6a3e14', 0.8)]]); // nicotine soaked in toward the fire
  b.fillRect(-9, -22, 18, 17);
  streaks(b, 9, 24, -7, 7, -22, -5, '#6a3e14', 0.4, 0.8); // tar runs along the cork
  b.beginPath(); // a dent and a crease where it was pinched
  b.moveTo(-8, -17);
  b.quadraticCurveTo(-1, -14.4, 8, -17.6);
  b.moveTo(-8, -10);
  b.lineTo(-2.4, -9);
  line(b, rgba(TAN_D, 0.75), 1.1);
  b.restore();
  path(b, pts);
  line(b, INK, LW);
  glint(b, -5.2, -20, -5.6, -12, 1.3, 0.5, RIM);
}

function stub(b, l, f) {
  const pts = tubePts(kink, (y) => 7.8 - 2.4 * Math.exp(-(((y - 3) / 3.2) ** 2)) + 0.5 * Math.sin(y * 1.7), -7, 12, 18);
  path(b, pts);
  b.fillStyle = cyl(b, -8.4, 12, mix(PAPER, '#c9a45c', 0.62), 0.55);
  b.fill();
  b.save();
  path(b, pts);
  b.clip();
  streaks(b, 12, 6, -8, 11, -6, 12, PAPER_D, 0.24, 0.7);
  b.fillStyle = lin(b, 0, 2, 0, 12, [[0, 'rgba(150,100,40,0)'], [1, 'rgba(60,32,14,0.8)']]);
  b.fillRect(-9, 2, 22, 11);
  b.beginPath(); // the crumple: hard creases across the fold
  b.moveTo(-9, 1.2);
  b.lineTo(2, 4.6);
  b.lineTo(-2, 6.6);
  b.lineTo(10, 3);
  b.moveTo(-9, -3);
  b.lineTo(-3, -2.2);
  line(b, rgba(PAPER_D, 0.85), 1.2);
  b.beginPath();
  b.moveTo(-9, 2.4);
  b.lineTo(2, 5.8);
  line(b, rgba('#ffffff', 0.4), 0.8);
  grime(b, 26, 23, 2, 4, 9, 9, 0.5);
  b.restore();
  path(b, pts);
  line(b, INK, LW);
  glint(b, -5.6, -5, -5.6, 0, 1.2, 0.5, RIM);
  l.save();
  l.globalCompositeOperation = 'lighter';
  path(l, pts);
  l.clip();
  l.fillStyle = lin(l, 0, 4, 0, 13, [[0, rgba(EMBER, 0)], [1, rgba(EMBER, 0.34 + f * 0.1)]]);
  l.fillRect(-9, 4, 22, 10);
  l.restore();
}

// The torn head: shredded paper tufts, charred black, the fire showing in every rip. Beat 1 tears differently.
const TUFTS = [
  [[-4.4, 10], [-5.6, 14.4], [-2.6, 13], [-3.2, 20.6], [0.4, 14.6], [1.6, 23], [4, 15.2], [6.4, 21.4], [7.6, 14.4], [11.2, 17.6], [11.6, 11.4]],
  [[-4.4, 10], [-6.4, 17.6], [-2.2, 13.6], [-2.2, 22.4], [1, 15.4], [3.6, 21.6], [5.2, 14.6], [8.2, 23], [8.6, 15], [12.4, 15.8], [11.6, 11.4]],
];

function head(b, l, f) {
  const trace = (g) => path(g, TUFTS[f].map(([x, y]) => [x + KX - 3.6, y]));
  trace(b);
  b.fillStyle = lin(b, 0, 10, 0, 24, [[0, '#6a5030'], [0.3, '#2c2018'], [1, CHAR]]);
  b.fill();
  b.save();
  trace(b);
  b.clip();
  grime(b, 18, 31 + f, KX, 17, 8, 6, 0.55, '#8a6a40');
  b.restore();
  trace(b);
  line(b, INK, LW);
  glint(b, -3.6, 11, -4.6, 14, 1.1, 0.4, '#d8a870');
  l.save(); // the fire inside the head burns through every tear
  l.globalCompositeOperation = 'lighter';
  trace(l);
  l.clip();
  l.fillStyle = rad(l, KX + 0.2, 16.6, 0, 8.4, [[0, rgba('#ffffff', 0.95)], [0.22, rgba(HOT, 0.9)], [0.55, rgba(EMBER, 0.7 + f * 0.1)], [1, rgba('#a02a08', 0.1)]]);
  circle(l, KX + 0.2, 16.6, 7.2);
  l.fill();
  l.restore();
  bloom(l, KX + 0.2, 17, 8, EMBER, 0.4 + f * 0.08);
}

// The comet of smoke: wide at the head, thinning to a spike far above, swaying a little differently each beat; two
// short side streamers leave the head at a slant to make the silhouette spiky.
function stream(b, f, x0, y0, x1, y1, r0, n, sway, seed, fade = 0.5) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    pts.push([lerp(x0, x1, t) + Math.sin(t * 6.8 + f * 2.2 + seed) * sway * (0.3 + t), lerp(y0, y1, t), 2 + r0 * (1 - t) ** 1.2]);
  }
  wisp(b, pts, 0.97, EMBER, seed + f, fade);
}

const SCRAPS = [[[-18, 30, 2.8, 0.3], [20, 40, 2.1, 1.1]], [[17, 30, 2.8, 0.9], [-19, 40, 2.1, 0.2]]];
const SPARKS = [[[-15, 22], [16, 30], [-10, 38], [11, 39]], [[14, 20], [-17, 28], [9, 38], [-8, 39]]];

export function diver(b, l, f) {
  const { rot, x, y } = POSE[f];
  const [s, c] = [Math.sin(rot), Math.cos(rot)];
  const hx = x + (KX * c - 15 * s) * K;
  const hy = y + (KX * s + 15 * c) * K;
  stream(b, f, hx - 5, hy - 6, -9 + f * 18, hy - 24, 4, 14, 2, 3, 0.2);
  stream(b, f, hx + 5, hy - 6, 11 - f * 17, hy - 22, 3.6, 14, 2, 5, 0.2);
  stream(b, f, hx, hy - 2, 0.5 - f * 2, -42, 8.4, 40, 3.2, 7);
  turned(b, l, rot, x, y, () => {
    filterPart(b);
    stub(b, l, f);
    head(b, l, f);
    glare(b, l, 1.6, -0.5, 3.4, 2.6, 1.4, f);
  }, K);
  for (const [px, py, sz, r] of SCRAPS[f]) flake(b, px, py, sz, r, px);
  for (const [px, py] of SPARKS[f]) ember(l, px, py, 4, 0.7, 0.9, 0.95);
}
