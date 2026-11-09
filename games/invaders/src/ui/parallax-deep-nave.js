// The nave of the drowned kingdom's palace (far layer of Lantern Deep; the west front and the towers are in
// parallax-deep-palace.js): a long roof running off to the right of the front, tall windows down its wall,
// flying buttresses on piers topped with pinnacles, a turret at the east end and a slender spire over the
// crossing, crocketed, with a ball on its tip. Coral along the ridge, moss and weed under the eaves.
import { rgba } from './sprites.js';
import { TAU } from '../core/math.js';
import { CORAL, GREEN, ABYSS, poly, tint, windows, wash, crust, weed, moss, barnacles } from './parallax-deep-kit.js';
import { tower } from './parallax-deep-towers.js';

const PIERS = [158, 214, 270, 326]; // the buttress piers, from the front's centre
const CROSSING = 242; // the spire's place

// The nave with the palace's front centred on x and its foot on `base`.
export function nave(g, out, rng, L, x, base) {
  const build = (c) => poly(c, [[x + 100, base], [x + 100, base - 122], [x + 110, base - 152], [x + 352, base - 152], [x + 362, base - 122], [x + 362, base]]);
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  g.beginPath(); // the lower roof of the aisle, a lean-to along the foot of the wall
  g.moveTo(x + 96, base - 56);
  g.lineTo(x + 366, base - 56);
  g.lineTo(x + 366, base);
  g.lineTo(x + 96, base);
  g.fill();
  wash(g, build, [x + 96, base - 156, x + 366, base - 40], undefined, 0.3);
  PIERS.forEach((p, i) => { // piers with pinnacles, and the flying arch from each up to the wall
    g.fillStyle = L.color;
    g.fillRect(x + p - 5, base - 84, 10, 84);
    poly(g, [[x + p - 6, base - 84], [x + p, base - 108], [x + p + 6, base - 84]]);
    g.fill();
    g.save();
    g.strokeStyle = L.color;
    g.lineWidth = 5.5;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x + p - 3, base - 92);
    g.quadraticCurveTo(x + p - 20, base - 112, x + p - 40, base - 112 - (i % 2) * 2);
    g.stroke();
    g.restore();
    crust(g, rng, x + p - 6, x + p + 6, base - 84, tint(L, CORAL, 0.3));
  });
  windows(g, out, rng, L, x, PIERS.map((p) => p - 26), base - 138, base - 100, 40, 6, 28, 0.08); // tall windows, a bay each
  windows(g, out, rng, L, x, PIERS.map((p) => p - 26), base - 48, base - 20, 30, 5, 12, 0.05); // low windows under the aisle roof
  g.fillStyle = rgba(ABYSS, 0.3);
  g.fillRect(x + 100, base - 60, 262, 1.6);
  tower(g, out, rng, L, x + 388, base, 38, 120, 'cone', { rh: 72, odds: 0.06 }); // the east turret
  g.fillStyle = L.color;
  const sx = x + CROSSING; // the spire over the crossing, 0 to 142 above the ridge
  poly(g, [[sx - 9, base - 150], [sx - 7, base - 178], [sx - 1.6, base - 288], [sx + 1.6, base - 288], [sx + 7, base - 178], [sx + 9, base - 150]]);
  g.fill();
  for (let k = 0; k < 7; k++) { // crockets up the edges
    const [y, half] = [base - 176 - k * 15, 6 - k * 0.7];
    g.fillRect(sx - half - 2.4, y, 2.6, 3);
    g.fillRect(sx + half - 0.2, y, 2.6, 3);
  }
  g.beginPath();
  g.arc(sx, base - 291, 2.2, 0, TAU);
  g.fill();
  out.signs.push({ spire: true, x: sx, y: base - 293 });
  const [coral, green] = [tint(L, CORAL, 0.3), tint(L, GREEN, 0.28)];
  crust(g, rng, x + 110, x + 352, base - 152, coral);
  moss(g, rng, x + 100, x + 362, base - 56, green);
  weed(g, rng, x + 118, base - 56, 28, 12, green, 6);
  weed(g, rng, x + 250, base - 56, 22, 14, green, 6);
  barnacles(g, rng, x + 100, base - 150, x + 362, base, 50);
}
