// The west front of Glass Cathedral and its two towers (far layer, see parallax-glass.js): a broad wall whose gable
// is broken off on one side, the great rose window in it (parallax-glass-rose.js), three pointed portals under
// triple mouldings with the dawn glowing through them, a row of blind arches, two stained lancets either side of
// the rose, stepped buttresses with pinnacles, a flight of steps, and fallen stone at the foot. The left tower keeps
// its belfry: two open arches with a bell hung in one (a sign, { bell, x, y, len }, for the swinging bell in
// flourish-glass-2.js) under a broken parapet; the right tower is a ragged stump.
import { rgba, lin } from './sprites.js';
import { poly, trace, toward, rimLight, wash, courses, pinnacle, lamp, archPath, tint, lancetPath, ragged, ivy, DAWN, JEWEL, LEAD, IVY } from './parallax-glass-kit.js';
import { glaze } from './parallax-glass-window.js';
import { rose } from './parallax-glass-rose.js';

const ROSE_R = 84;

// A closed polygon filled in the layer colour, with the dawn's rim on the edge that faces the sun.
function solid(g, L, pts, x, rim = 0.7) {
  const build = (c, ox = 0, oy = 0) => trace(c, pts, ox, oy);
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  rimLight(g, build, toward(x), 2.2, DAWN, rim);
  return build;
}

// A portal: a pointed opening that shows the dawn lit in the nave behind it, ringed by three mouldings.
function portal(g, out, L, x, base, hw, h) {
  g.save();
  g.globalCompositeOperation = 'destination-out';
  archPath(g, x, base, hw, base - h + hw * 1.3, 1.1);
  g.fill();
  g.restore();
  archPath(g, x, base, hw, base - h + hw * 1.3, 1.1);
  g.fillStyle = lin(g, 0, base - h, 0, base, [[0, rgba('#8a3a78', 0.9)], [0.6, rgba('#e8708a', 0.92)], [1, rgba('#ffc08a', 0.95)]]);
  g.fill();
  g.strokeStyle = rgba(tint(L, '#d8b8e8', 0.45), 0.5);
  g.lineWidth = 1.4;
  for (let i = 1; i <= 3; i++) {
    archPath(g, x, base, hw + i * 4.2, base - h + (hw + i * 4.2) * 1.3, 1.1);
    g.stroke();
  }
  lamp(out, x, base - h * 0.35, hw * 2.6, '#ffa88a', 'steady', 0, 0.26);
}

// The belfry: an open stage with two pointed openings, in the left one a bell's yoke and its sign.
function belfry(g, out, L, x, top, hw) {
  for (const s of [-1, 1]) {
    g.save();
    g.globalCompositeOperation = 'destination-out';
    archPath(g, x + s * hw * 0.48, top + 80, hw * 0.34, top + 80 - 52, 1.2);
    g.fill();
    g.restore();
  }
  g.fillStyle = rgba(LEAD, 0.55); // the dark inside the stage, a beam across it
  g.fillRect(x - hw * 0.84, top + 40, hw * 1.68, 3);
  out.signs.push({ bell: true, x: x - hw * 0.48, y: top + 36, len: 40, hw: hw * 0.3 });
}

// A tower at x, w wide, from base up to top; belfry opens the top stage, else its top is a ragged stump.
export function tower(g, out, rng, L, x, base, w, top, o = {}) {
  const hw = w / 2;
  const cut = ragged(rng, x - hw, x + hw, top, o.belfry ? 5 : 16, 8);
  const pts = [[x - hw - 4, base], [x - hw, top + 20], ...cut, [x + hw, top + 20], [x + hw + 4, base]];
  const build = solid(g, L, pts, x);
  wash(g, build, [x - hw, top, x + hw, base - 120]);
  courses(g, rng, x - hw, top, x + hw, base, 0.16, 11, build);
  ivy(g, rng, x - hw + 6, x + hw - 6, top + 4, o.belfry ? 2 : 4, tint(L, IVY, 0.5), 34);
  if (o.belfry) belfry(g, out, L, x, top, hw);
  for (const dy of o.slits ?? [150, 250]) glaze(g, out, rng, L, x, base - dy + 40, 5, 52, { set: [JEWEL.gilt, JEWEL.amber, JEWEL.ruby], kind: 'bands', a: 0.28 });
  g.fillStyle = L.color;
  for (const s of [-1, 1]) pinnacle(g, x + s * (hw + 1), top + 12 + (o.belfry ? 0 : 22 * (s > 0)), 9, o.belfry ? 54 : 26);
}

// The dawn spilling out of the portals over the steps and the terrace in front of them: a soft additive fan, peach near the
// door and rose further out. Drawn last (after the terrace), so it lies on the ground.
export function spill(g, X, base) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const [k, a] of [[1, 0.5], [0.72, 0.6], [0.44, 0.7]]) { // three nested fans, so the sides of the beam are soft
    g.fillStyle = lin(g, 0, base - 10, 0, base + 150, [[0, rgba('#ffb08a', 0.14 * a)], [0.5, rgba('#ff8a9a', 0.06 * a)], [1, rgba('#ff8a9a', 0)]]);
    g.beginPath();
    trace(g, [[X - 36 * k, base - 4], [X + 36 * k, base - 4], [X + 130 * k, base + 150], [X - 130 * k, base + 150]]);
    g.fill();
  }
  g.restore();
}

// The west front centred on X, its foot on `base`: wall, rose, portals, flank windows, buttresses, steps and rubble.
export function front(g, out, rng, L, X, base) {
  const top = base - 330;
  const peak = [X - 14, base - 436];
  const gable = [[X - 150, base], [X - 150, top - 8], ...ragged(rng, X - 150, X - 118, top - 6, 7, 6), [X - 118, top - 10], [peak[0], peak[1] + 8], [peak[0] + 3, peak[1] - 6], [peak[0] + 9, peak[1] + 4], [X + 1, peak[1] + 22],
    [X + 26, base - 396], [X + 40, base - 408], [X + 52, base - 380], [X + 70, base - 384], [X + 78, base - 352], [X + 104, base - 336], [X + 112, base - 318], [X + 132, base - 322], [X + 150, base - 296], [X + 150, base]];
  const build = solid(g, L, gable, X, 0.85);
  wash(g, build, [X - 150, base - 440, X + 150, base - 120]);
  courses(g, rng, X - 150, base - 436, X + 150, base, 0.15, 12, build);
  g.fillStyle = L.color; // the buttresses at the corners, stepped, each with a pinnacle
  for (const s of [-1, 1]) {
    poly(g, [[X + s * 138, base], [X + s * 138, base - 250], [X + s * 150, base - 260], [X + s * 164, base - 240], [X + s * 170, base]]);
    g.fill();
    pinnacle(g, X + s * 152, base - 258, 12, 64);
  }
  for (const [ix, iy] of [[X + 70, base - 384], [X + 106, base - 336], [X + 134, base - 322]]) ivy(g, rng, ix - 5, ix + 5, iy, 2, tint(L, IVY, 0.5), 44); // hangs from the broken gable
  rose(g, out, rng, L, X, base - 262, ROSE_R);
  for (const s of [-1, 1]) glaze(g, out, rng, L, X + s * 122, base - 176, 15, 104, { kind: 'medallion', set: s < 0 ? [JEWEL.sapphire, JEWEL.gilt, JEWEL.ruby] : [JEWEL.ruby, JEWEL.gilt, JEWEL.cobalt] });
  g.fillStyle = rgba(LEAD, 0.5); // a row of blind arches above the portals
  for (let i = -6; i <= 6; i++) {
    lancetPath(g, X + i * 20, base - 166, 7, 26, 1.2);
    g.fill();
  }
  portal(g, out, L, X, base, 32, 150);
  portal(g, out, L, X - 88, base, 21, 104);
  portal(g, out, L, X + 88, base, 21, 104);
  g.strokeStyle = rgba('#000000', 0.2);
  g.lineWidth = 1.2;
  g.beginPath(); // the string courses across the front
  for (const y of [base - 172, base - 342]) {
    g.moveTo(X - 150, y);
    g.lineTo(X + 150, y);
  }
  g.stroke();
  g.fillStyle = L.color; // steps up to the portals and a drift of fallen stone
  for (let i = 0; i < 4; i++) g.fillRect(X - 52 - i * 8, base + 2 - i * 4 - 4, 104 + i * 16, 5);
  for (let i = 0; i < 14; i++) g.fillRect(X - 190 + rng() * 380, base - 4 + rng() * 8, 6 + rng() * 14, 4 + rng() * 5);
  tower(g, out, rng, L, X - 214, base, 86, base - 410, { belfry: true, slits: [60, 160] });
  tower(g, out, rng, L, X + 212, base, 80, base - 292, { slits: [60, 150] });
}
