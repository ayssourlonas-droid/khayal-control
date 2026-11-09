// World 17, Ash to Air, the gunner (see w17.js): THE TOBACCO PIPE, seen front-on and a little from above, its bowl
// turned toward the ship like a gun. The bowl is a dark burl-wood barrel (swirling grain, bird's-eye knots, varnish,
// scorch) whose mouth is a brass-collared rim looking down into a bed of coal; two angry slits are carved into its face.
// A short wooden shank, a brass band and a black vulcanite stem curve away up and to the right to a chewed mouthpiece.
// Beat 0 the coal glows low and a thin tendril of smoke trails from the mouth; beat 1 the pipe puffs: a cloud bursts
// from the bowl, the coal flares white and a few sparks spit. Lights: the coal bed, the eyes, the sparks.
import { lin, rad, rgba, mix, line, ellipse, circle, bloom, INK, CHAR, EMBER, HOT, RIM, ASH, hash, lerp, bez, grime, rod, band, turned, ember } from './w17-kit.js';
import { glare, wisp } from './w17-fx.js';
import { woodGrain, BRASS } from './w17-pipe-wood.js';

const RIMC = [-6, 22]; // the bowl's mouth: its centre
const STEM = bez([6, 0], [23, -4], [15, -26], [31, -41], 24);
const WIDTH = STEM.map((_, i) => 7 - (i / 24) * 3.8);

function bowlShape(g) {
  g.beginPath();
  g.moveTo(-27, 22);
  g.bezierCurveTo(-28, 8, -26, -6, -18, -12);
  g.bezierCurveTo(-12, -17, 2, -17, 8, -12);
  g.bezierCurveTo(13, -7, 15, 8, 15, 22);
  g.ellipse(RIMC[0], RIMC[1], 21, 8.5, 0, 0, Math.PI);
  g.closePath();
}

// The stem and shank: wood to the brass band, then glossy black vulcanite to a chewed tip.
function stem(b) {
  const wood = [['#0a0c16', 3.2, 1, 0, 0], ['#3a1c0e', 0, 1, 0, 0], ['#7a4524', 0, 0.62, -0.5, -0.6], ['#c98a52', 0, 0.22, -1.2, -1.4]];
  const black = [['#0a0c16', 3.2, 1, 0, 0], ['#171524', 0, 1, 0, 0], ['#33324a', 0, 0.66, -0.5, -0.6], ['#6a6a8c', 0, 0.3, -1.3, -1.5], [rgba('#ffffff', 0.6), 0, 0.1, -1.7, -1.9]];
  rod(b, STEM.slice(0, 9), WIDTH.slice(0, 9), wood);
  rod(b, STEM.slice(8), WIDTH.slice(8), black);
  const [a, c] = [STEM[8], STEM[9]];
  band(b, STEM[8], Math.atan2(c[1] - a[1], c[0] - a[0]), 4.4, WIDTH[8] + 1.5, BRASS);
  const tip = STEM[24];
  circle(b, tip[0], tip[1], 2.9); // the chewed tip: a lip ring and two bite marks
  b.fillStyle = '#0a0c16';
  b.fill();
  b.beginPath();
  b.moveTo(tip[0] - 2.4, tip[1] + 1.6);
  b.lineTo(tip[0] - 0.6, tip[1] + 0.2);
  b.moveTo(tip[0] + 0.2, tip[1] + 2.4);
  b.lineTo(tip[0] + 1.2, tip[1] + 0.7);
  line(b, rgba('#8a8aa8', 0.7), 0.8);
}

// The mouth of the bowl: a brass collar, a dark chamber, a crust of grey ash round the coal.
function mouth(b, l, f) {
  const [cx, cy] = RIMC;
  ellipse(b, cx, cy, 20.6, 8.3);
  line(b, INK, 7.2);
  ellipse(b, cx, cy, 20.6, 8.3);
  b.fillStyle = CHAR;
  b.fill();
  b.lineWidth = 3.8;
  b.strokeStyle = lin(b, -26, 0, 14, 0, [[0, '#6d4a14'], [0.22, '#f6d680'], [0.45, BRASS], [0.8, '#8a621c'], [1, '#4a3008']]);
  b.stroke();
  ellipse(b, cx, cy, 17.6, 6.1);
  b.fillStyle = rad(b, cx, cy + 1, 1, 18, [[0, '#2a0e06'], [0.7, '#1a0d08'], [1, '#0c0705']]);
  b.fill();
  ellipse(b, cx, cy, 17.6, 6.1);
  line(b, rgba('#000000', 0.7), 1.2);
  for (let i = 0; i < 12; i++) { // ash crusting the edge of the chamber
    const a = hash(40 + i) * Math.PI * 2;
    ellipse(b, cx + Math.cos(a) * 14.8, cy + Math.sin(a) * 4.9, 0.9 + hash(50 + i) * 1.1, 0.6 + hash(60 + i) * 0.6, a);
    b.fillStyle = rgba(mix(ASH, '#2a2420', 0.35), 0.55 + hash(70 + i) * 0.35);
    b.fill();
  }
  b.beginPath();
  b.ellipse(cx, cy, 20.6, 8.3, 0, Math.PI * 1.02, Math.PI * 1.42);
  line(b, rgba('#fff3c4', 0.85), 1);
  l.save(); // the coal bed: patches of fire in the chamber, hotter and wider on the puff
  l.globalCompositeOperation = 'lighter';
  ellipse(l, cx, cy, 17.2, 5.8);
  l.clip();
  for (let i = 0; i < 9; i++) {
    const a = hash(80 + i) * Math.PI * 2;
    const d = Math.sqrt(hash(90 + i)) * (0.55 + f * 0.25);
    const [x, y] = [cx + Math.cos(a) * d * 15, cy + 0.4 + Math.sin(a) * d * 4.6];
    const r = 3.2 + hash(100 + i) * 2.6 + f * 1.4;
    l.fillStyle = rad(l, x, y, 0, r, [[0, rgba('#ffffff', 0.22 + f * 0.3)], [0.3, rgba(HOT, 0.62 + f * 0.1)], [0.7, rgba(EMBER, 0.55)], [1, rgba('#b02a08', 0)]]);
    l.fillRect(x - r, y - r, r * 2, r * 2);
  }
  l.fillStyle = rgba(EMBER, 0.22 + f * 0.16);
  l.fillRect(cx - 18, cy - 7, 36, 14);
  l.restore();
  bloom(l, cx, cy + 3, 11 + f * 3, EMBER, 0.4 + f * 0.3);
}

function smoke(b, l, f) {
  const [cx, cy] = RIMC;
  const puff = [];
  const n = f ? 15 : 8;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    puff.push(f
      ? [lerp(cx - 21, cx + 15, t), cy + 15.4 - Math.sin(t * Math.PI) * 4.6 + Math.sin(t * 17) * 1.2, 3.6 + Math.sin(t * Math.PI) * 4.8]
      : [cx - 5 + t * 8 + Math.sin(t * 7) * 1.2, cy + 11.4 + t * 8, 2 + t * 2.6]);
  }
  wisp(b, puff, f ? 0.96 : 0.85, EMBER, 11 + f);
  if (!f) return;
  for (const [x, y] of [[cx - 21, cy + 10], [cx + 16, cy + 10], [cx - 3, cy + 20]]) ember(l, x, y, 3.6, 0.75, 0.9, 0.95);
}

function pipe(b, l, f) {
  stem(b);
  bowlShape(b);
  b.fillStyle = lin(b, -28, 0, 16, 0, [[0, '#a05a30'], [0.18, '#7a3c1e'], [0.55, '#40200f'], [1, '#150a05']]);
  b.fill();
  b.save();
  bowlShape(b);
  b.clip();
  woodGrain(b);
  grime(b, 40, 14, -6, 4, 20, 14, 0.45, '#0a0503');
  b.fillStyle = lin(b, 0, 10, 0, 30, [[0, rgba('#000000', 0)], [1, rgba('#000000', 0.6)]]); // scorched toward the rim
  b.fillRect(-30, 10, 50, 24);
  b.restore();
  bowlShape(b);
  line(b, INK, 2.8);
  b.beginPath(); // varnish: a long glint down the lit flank and a soft sheen over the shoulder
  b.moveTo(-22, 14);
  b.bezierCurveTo(-24, 4, -22, -4, -17, -9);
  line(b, rgba(RIM, 0.65), 1.5);
  b.beginPath();
  b.moveTo(-12, -13);
  b.quadraticCurveTo(-4, -15, 3, -12.6);
  line(b, rgba('#ffffff', 0.4), 1.1);
  mouth(b, l, f);
  glare(b, l, -6, 5.6, 7.6, 4.6, 2.3, f);
  smoke(b, l, f);
}

export function gunner(b, l, f) {
  turned(b, l, 0, 0, -2, () => pipe(b, l, f), 0.93);
}
