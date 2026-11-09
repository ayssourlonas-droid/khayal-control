// The dead wood of Hollow Night (the middle layer): twisted bare trees with crows on them, a lantern
// or two hanging green and eyes watching from a trunk, a scarecrow on a rise and a ruined chapel whose belfry leans.
// L.lamp is the lanterns' colour, L.window the chapel's. See parallax-shapes.js for the painter contract.
import { pick } from '../core/rng.js';
import { profile, waves } from './parallax-kit.js';
import { taper } from './sky-bodies-2.js';
import { pane, lancet, spire } from './parallax-gothic-kit.js';
import { TAU } from '../core/math.js';

// A branch from (x, y) at angle `ang` (0 up), crooked as it goes; it forks into thinner ones.
function branch(g, rng, out, x, y, ang, len, w, depth) {
  const pts = [[x, y]];
  let a = ang;
  for (let i = 1; i <= 5; i++) {
    a += (rng() - 0.5) * 0.7;
    const [px, py] = pts[i - 1];
    pts.push([px + Math.sin(a) * len * 0.2, py - Math.cos(a) * len * 0.2]);
  }
  taper(g, pts, w, Math.max(1.2, w * 0.55));
  const [ex, ey] = pts[5];
  if (depth <= 0) {
    if (rng() < 0.3 && out) crow(g, ex, ey, rng() < 0.5 ? 1 : -1, 0.8 + rng() * 0.3);
    return;
  }
  const forks = depth > 2 ? 2 : 1 + (rng() < 0.7 ? 1 : 0);
  for (let k = 0; k < forks; k++) branch(g, rng, out, ex, ey, a + (k - (forks - 1) / 2) * (0.7 + rng() * 0.5), len * (0.62 + rng() * 0.15), w * 0.6, depth - 1);
  if (rng() < 0.45) { // a side twig hooking back
    const [mx, my] = pts[3];
    branch(g, rng, null, mx, my, a + (rng() < 0.5 ? -1.1 : 1.1), len * 0.4, w * 0.4, 0);
  }
}

// A crow perched on (x, y), facing dir.
function crow(g, x, y, dir, s) {
  g.save();
  g.translate(x, y);
  g.scale(dir * s, s);
  g.beginPath();
  g.ellipse(0, -7, 8, 5.5, -0.3, 0, TAU);
  g.moveTo(5, -10);
  g.lineTo(9, -15);
  g.lineTo(13, -11);
  g.lineTo(18, -10);
  g.lineTo(12, -8);
  g.moveTo(-6, -4);
  g.lineTo(-17, 2);
  g.lineTo(-12, -6);
  g.fill();
  g.restore();
}

// A dead tree: roots splayed in the earth, a twisted trunk, a crown of forked limbs; sometimes a
// lantern on a hook, sometimes eyes in the hollow of the trunk.
function tree(g, rng, out, L, x, base, s) {
  for (const d of [-1, 0, 1]) {
    g.beginPath();
    g.moveTo(x + d * 4 * s, base - 14 * s);
    g.quadraticCurveTo(x + d * 18 * s, base - 2 * s, x + d * 34 * s, base + 5);
    g.lineTo(x + d * 24 * s, base + 6);
    g.quadraticCurveTo(x + d * 10 * s, base - 4 * s, x + d * 2 * s, base - 6 * s);
    g.fill();
  }
  branch(g, rng, out, x, base - 6 * s, (rng() - 0.5) * 0.3, 150 * s, 17 * s, 4);
  if (rng() < 0.45) { // a lantern on a hook, burning green
    const lx = x + (rng() - 0.5) * 70 * s;
    const ly = base - (110 + rng() * 60) * s;
    g.fillRect(lx - 0.7, ly - 16, 1.4, 16);
    g.fillRect(lx - 4, ly, 8, 11);
    out.lights.push({ x: lx, y: ly + 6, r: 22, color: L.lamp, mode: 'flicker', ph: rng(), a: 0.85 });
    out.lights.push({ x: lx, y: ly + 6, r: 60, color: L.lamp, mode: 'flicker', ph: rng(), a: 0.18 });
  }
  if (rng() < 0.45) { // a pair of yellow eyes in the trunk's hollow, glimmering
    const [ex, ey, ph] = [x + (rng() - 0.5) * 6 * s, base - (34 + rng() * 40) * s, rng()];
    for (const d of [-5, 5]) out.lights.push({ x: ex + d * s, y: ey, r: 6, color: '#ffd24a', mode: 'pulse', ph, a: 0.9 });
  }
}

// A scarecrow on its post, arms out on a crossbar in ragged sleeves, a sagging hat, straw hanging.
function scarecrow(g, x, base) {
  g.fillRect(x - 3, base - 96, 6, 100);
  g.fillRect(x - 40, base - 78, 80, 5);
  g.beginPath();
  g.moveTo(x - 44, base - 79);
  g.lineTo(x - 36, base - 58);
  g.lineTo(x - 30, base - 74);
  g.lineTo(x - 24, base - 55);
  g.lineTo(x - 18, base - 72);
  g.moveTo(x + 44, base - 79);
  g.lineTo(x + 36, base - 56);
  g.lineTo(x + 30, base - 74);
  g.lineTo(x + 24, base - 54);
  g.lineTo(x + 18, base - 72);
  g.moveTo(x - 17, base - 76);
  g.lineTo(x - 21, base - 38);
  g.lineTo(x - 11, base - 46);
  g.lineTo(x - 4, base - 30);
  g.lineTo(x + 4, base - 44);
  g.lineTo(x + 12, base - 28);
  g.lineTo(x + 19, base - 42);
  g.lineTo(x + 17, base - 76);
  g.fill();
  g.beginPath();
  g.arc(x, base - 98, 10, 0, TAU);
  g.fill();
  g.beginPath(); // the hat, brim bent down on one side
  g.moveTo(x - 22, base - 100);
  g.quadraticCurveTo(x - 4, base - 106, x + 20, base - 98);
  g.lineTo(x + 24, base - 92);
  g.lineTo(x + 10, base - 101);
  g.lineTo(x + 8, base - 118);
  g.quadraticCurveTo(x - 2, base - 130, x - 9, base - 116);
  g.lineTo(x - 10, base - 101);
  g.fill();
  crow(g, x + 36, base - 79, 1, 0.9);
}

// The chapel: a nave under a broken roof, lancets lit, and a bell tower leaning over its porch with
// the belfry cut clean through (you see the sky in it) and the bell hanging dark inside.
function chapel(g, rng, out, L, x, base) {
  g.fillRect(x - 78, base - 82, 156, 86);
  g.beginPath(); // the roof, a bite out of the ridge where it has fallen in
  g.moveTo(x - 90, base - 80);
  g.lineTo(x - 30, base - 134);
  g.lineTo(x - 8, base - 118);
  g.lineTo(x + 6, base - 126);
  g.lineTo(x + 18, base - 104);
  g.lineTo(x + 36, base - 134);
  g.lineTo(x + 90, base - 80);
  g.fill();
  for (const dx of [-52, -14, 28]) pane(g, out, rng, x + dx, base - 10, 14, 44, pick(rng, [L.window, '#7dff5a']));
  g.save(); // the tower, leaning
  g.translate(x + 96, base + 4);
  g.rotate(0.07);
  g.fillRect(-26, -170, 52, 174);
  g.fillRect(-32, -176, 64, 8);
  spire(g, 0, -176, 52, 80, 6);
  g.globalCompositeOperation = 'destination-out';
  for (const dx of [-12, 12]) {
    lancet(g, dx, -118, 16, 54);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  g.beginPath(); // the bell
  g.moveTo(-6, -142);
  g.quadraticCurveTo(-8, -122, -11, -112);
  g.lineTo(11, -112);
  g.quadraticCurveTo(8, -122, 6, -142);
  g.fill();
  g.fillRect(-1, -150, 2, 10);
  pane(g, out, rng, 0, -50, 8, 20, L.window);
  g.restore();
  out.lights.push({ x: x + 100, y: base - 128, r: 22, color: L.window, mode: 'flicker', ph: rng(), a: 0.6 }); // a lantern up in the belfry
}

function deadwood(g, w, h, rng, L, out) {
  const f = waves(rng, 3, 0.005);
  const ground = (x) => h * (0.8 + 0.035 * f(x));
  profile(g, w, h, ground, 4);
  let x = 70;
  let n = 0;
  while (x < w - 60) {
    const base = ground(x) + 4;
    if (n === 2) {
      chapel(g, rng, out, L, x + 60, base);
      x += 340;
    } else if (n === 5) {
      scarecrow(g, x, base);
      x += 160;
    } else {
      tree(g, rng, out, L, x, base, 0.7 + rng() * 0.55);
      x += 150 + rng() * 210;
    }
    n += 1;
  }
}

export const DEAD = { deadwood };
