// The drowned kingdom's palace, a cathedral on the far ridge (far layer of Lantern Deep, see parallax-deep.js):
// the west front with its steep gable, a rose window glowing teal in it (a sign, and a light that breathes),
// three pointed portals with steps up to them, an arcade of small windows, twin towers with cone spires
// either side; the nave, flying buttresses and the spire over the crossing are in parallax-deep-nave.js.
import { rgba } from './sprites.js';
import { TAU } from '../core/math.js';
import { TEAL, VIOLET, CORAL, GREEN, ABYSS, poly, lamp, tint, windows, wash, crust, moss, weed, stairs, barnacles } from './parallax-deep-kit.js';
import { tower } from './parallax-deep-towers.js';
import { nave } from './parallax-deep-nave.js';

const ROSE_R = 24; // the rose window's radius

// A pointed portal, x its centre, its sill at y, w x h.
function portal(g, x, y, w, h) {
  g.beginPath();
  g.moveTo(x - w / 2, y);
  g.lineTo(x - w / 2, y - h * 0.6);
  g.quadraticCurveTo(x - w / 2, y - h * 0.9, x, y - h);
  g.quadraticCurveTo(x + w / 2, y - h * 0.9, x + w / 2, y - h * 0.6);
  g.lineTo(x + w / 2, y);
  g.closePath();
  g.fillStyle = rgba(ABYSS, 0.78);
  g.fill();
}

// The rose window: a disc of teal light cut by twelve spokes and two rings of dark tracery.
function rose(g, out, rng, x, y) {
  g.fillStyle = rgba(TEAL, 0.4);
  g.beginPath();
  g.arc(x, y, ROSE_R, 0, TAU);
  g.fill();
  g.save();
  g.strokeStyle = rgba(ABYSS, 0.78);
  g.lineWidth = 1.5;
  g.beginPath();
  for (let i = 0; i < 12; i++) {
    g.moveTo(x + Math.cos((i * TAU) / 12) * 5, y + Math.sin((i * TAU) / 12) * 5);
    g.lineTo(x + Math.cos((i * TAU) / 12) * ROSE_R, y + Math.sin((i * TAU) / 12) * ROSE_R);
  }
  g.stroke();
  g.lineWidth = 2.2;
  for (const r of [ROSE_R, 13, 5]) {
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.stroke();
  }
  g.restore();
  lamp(out, x, y, 46, TEAL, 'pulse', rng(), 0.3);
  lamp(out, x, y, 96, VIOLET, 'steady', 0, 0.1);
  out.signs.push({ rose: true, x, y, r: ROSE_R });
}

// The palace with its west front centred on x and its foot on `base`.
export function palace(g, out, rng, L, x, base) {
  const front = (c) => poly(c, [[x - 68, base], [x - 68, base - 122], [x - 8, base - 184], [x - 3, base - 196], [x + 3, base - 196], [x + 8, base - 184], [x + 68, base - 122], [x + 68, base]]);
  nave(g, out, rng, L, x, base);
  tower(g, out, rng, L, x - 90, base, 52, 250, 'cone', { rh: 104, odds: 0.05 });
  tower(g, out, rng, L, x + 90, base, 52, 250, 'cone', { rh: 104, odds: 0.05 });
  g.fillStyle = L.color;
  g.beginPath();
  front(g);
  g.fill();
  g.fillRect(x - 1, base - 214, 2, 20); // a pinnacle on the gable
  wash(g, front, [x - 70, base - 200, x + 70, base], undefined, 0.3);
  rose(g, out, rng, x, base - 124);
  for (const px of [-34, 0, 34]) portal(g, x + px, base, 15, px ? 40 : 54);
  lamp(out, x, base - 24, 30, TEAL, 'pulse', rng(), 0.24);
  windows(g, out, rng, L, x, [-46, -30, -14, 14, 30, 46], base - 82, base - 74, 20, 4.4, 9, 0.07); // the arcade above the portals
  windows(g, out, rng, L, x, [-14, 14], base - 164, base - 160, 20, 4.4, 9, 0.08);
  g.fillStyle = rgba(ABYSS, 0.3); // string courses across the front
  for (const y of [base - 62, base - 98]) g.fillRect(x - 66, y, 132, 1.6);
  g.fillStyle = L.color;
  stairs(g, x - 76, base + 4, 8, 4, 2.2);
  stairs(g, x + 76, base + 4, 8, -4, 2.2);
  const [coral, green] = [tint(L, CORAL, 0.3), tint(L, GREEN, 0.28)];
  for (let t = 0; t < 1; t += 0.09) { // the gable's edges, coral-crusted
    crust(g, rng, x - 66 + t * 58, x - 60 + t * 58, base - 122 - t * 60, coral);
    crust(g, rng, x + 60 - t * 58, x + 66 - t * 58, base - 122 - t * 60, coral);
  }
  moss(g, rng, x - 66, x + 66, base - 62, green);
  weed(g, rng, x - 30, base - 62, 26, 8, green, 7);
  barnacles(g, rng, x - 66, base - 190, x + 66, base, 40);
}
