// The stonework of Glass Cathedral's mid layer (parallax-glass-mid.js): fluted columns with carved capitals and the
// stumps of the vault's ribs still springing from them, a pointed rib spanning two columns (a chandelier's anchor),
// a free-standing window frame with empty tracery, and a flying buttress. All of it is darker than the far
// cathedral behind it, with the dawn's rim on the right-hand edges and a pale wash of sky on top; the lit windows of
// the far layer shine through the gaps, and nothing here is bright. The parts are deterministic from `rng`.
import { rgba } from './sprites.js';
import { TAU } from '../core/math.js';
import { trace, toward, rimLight, wash, courses, pinnacle, archTop, ribArc, riseOf, ragged, tint, ivy, DAWN, IVY } from './parallax-glass-kit.js';

const stroke = (g, L, w) => {
  g.strokeStyle = L.color;
  g.lineWidth = w;
  g.lineJoin = 'round';
};

// A rib springing from (x, y) toward dir (-1 left, 1 right), the arch that would have spanned `hw` px of the vault, broken
// off after `frac` of it: a band with a moulding along its upper edge.
function ribStub(g, L, x, y, dir, frac, hw = 120, th = 10) {
  g.save();
  stroke(g, L, th);
  g.lineCap = 'butt';
  g.beginPath();
  g.moveTo(x, y + 6);
  ribArc(g, x, y, hw, dir, frac);
  g.stroke();
  g.strokeStyle = rgba(DAWN, 0.35);
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(x + dir * th * 0.5, y);
  ribArc(g, x + dir * th * 0.5, y, hw, dir, frac * 0.97);
  g.stroke();
  g.restore();
}

// A column at x with its foot on y: plinth, fluted shaft, capital with foliage, ribs springing from it (o.ribs: [left, right]
// lengths) or, with o.broken, a shaft snapped off ragged at the given height.
export function column(g, rng, L, x, y, w, h, o = {}) {
  const [hw, top] = [w / 2, y - h];
  const stop = o.broken ? y - o.broken : top + 34;
  const snap = o.broken ? ragged(rng, x - hw * 0.93, x + hw * 0.93, stop, 9, 6) : [[x + hw * 0.93, stop]]; // drawn once so every pass of shaft() agrees
  const shaft = (c, ox = 0, oy = 0) => trace(c, [[x - hw * 1.04, y - 22], [x - hw * 1.08, y - h * 0.4], [x - hw * 0.93, stop], ...snap, [x + hw * 1.08, y - h * 0.4], [x + hw * 1.04, y - 22]], ox, oy);
  g.fillStyle = L.color;
  g.beginPath();
  shaft(g);
  g.fill();
  g.fillRect(x - hw * 1.5, y - 14, w * 1.5, 14); // plinth and torus
  g.fillRect(x - hw * 1.3, y - 24, w * 1.3, 11);
  rimLight(g, shaft, toward(x), 2.6, DAWN, 0.8);
  wash(g, shaft, [x - hw, stop, x + hw, y - 80], '#d8a8e0', 0.16);
  g.save();
  g.strokeStyle = rgba('#000000', 0.22); // the flutes
  g.lineWidth = 1.1;
  g.beginPath();
  for (let i = -2; i <= 2; i++) {
    g.moveTo(x + i * hw * 0.38, y - 24);
    g.lineTo(x + i * hw * 0.34, stop + 4);
  }
  g.stroke();
  g.restore();
  if (o.broken) return;
  g.fillStyle = L.color;
  g.beginPath(); // the capital: a bell flaring to the abacus, foliage lumps on it
  g.moveTo(x - hw * 0.93, top + 36);
  g.quadraticCurveTo(x - hw * 1.2, top + 22, x - hw * 1.42, top + 9);
  g.lineTo(x + hw * 1.42, top + 9);
  g.quadraticCurveTo(x + hw * 1.2, top + 22, x + hw * 0.93, top + 36);
  g.closePath();
  g.fill();
  g.fillRect(x - hw * 1.55, top, w * 1.55, 10);
  for (let i = -3; i <= 3; i++) {
    g.beginPath();
    g.arc(x + i * hw * 0.38, top + 22 + Math.abs(i) * 2, 5.4, 0, TAU);
    g.fill();
  }
  rimLight(g, (c, ox = 0, oy = 0) => trace(c, [[x - hw * 1.55, top], [x + hw * 1.55, top], [x + hw * 1.55, top + 10], [x - hw * 1.55, top + 10]], ox, oy), toward(x), 2, DAWN, 0.8);
  ivy(g, rng, x - hw * 1.3, x + hw * 1.3, top + 12, 3, tint(L, IVY, 0.42), 38);
  const [rl, rr] = o.ribs ?? [0, 0];
  if (rl) ribStub(g, L, x - hw * 0.5, top + 2, -1, rl);
  if (rr) ribStub(g, L, x + hw * 0.5, top + 2, 1, rr);
}

// A pointed rib spanning from x0 to x1 at its springing y, with a boss at the crown. Returns the crown's y.
export function span(g, L, x0, x1, ys, th = 10, k = 0.62) {
  const [cx, hw] = [(x0 + x1) / 2, (x1 - x0) / 2];
  g.save();
  stroke(g, L, th);
  g.beginPath();
  g.moveTo(x0, ys + 14);
  g.lineTo(x0, ys);
  const rise = archTop(g, cx, ys, hw, k);
  g.lineTo(x1, ys + 14);
  g.stroke();
  g.fillStyle = L.color;
  g.beginPath();
  g.arc(cx, ys - rise + th * 0.5, th * 0.85, 0, TAU);
  g.fill();
  g.strokeStyle = rgba(DAWN, 0.3); // the dawn along the rib's upper edge
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(x0 + 2, ys);
  archTop(g, cx, ys, hw + th / 2 - 1, k);
  g.stroke();
  g.restore();
  return ys - rise + th;
}

// A free-standing window frame at x, its foot on y: two piers, a pointed rib, a mullion between two lancet lights with
// a ring of tracery above them. Empty: the far cathedral shines through. The right pier is broken short.
export function frame(g, rng, L, x, y, hw, h) {
  const spring = y - h + hw * 1.6;
  g.save();
  g.fillStyle = L.color;
  g.fillRect(x - hw - 13, spring, 26, y - spring);
  const stub = [[x + hw - 13, y], [x + hw - 13, spring + 56], ...ragged(rng, x + hw - 13, x + hw + 13, spring + 56, 14, 6), [x + hw + 13, y]];
  g.beginPath();
  trace(g, stub);
  g.fill();
  pinnacle(g, x - hw, spring + 2, 15, 44);
  stroke(g, L, 13);
  g.beginPath();
  g.moveTo(x - hw, spring + 2);
  g.lineTo(x - hw, spring);
  const rise = archTop(g, x, spring, hw, 1.05);
  g.lineTo(x + hw, spring + 40);
  g.stroke();
  stroke(g, L, 6);
  const [lhw, ls] = [hw / 2 - 5, spring + 58];
  g.beginPath(); // the two lancet lights and the mullion between them
  for (const s of [-1, 1]) {
    g.moveTo(x + s * hw / 2 - lhw, y - 26);
    g.lineTo(x + s * hw / 2 - lhw, ls);
    archTop(g, x + s * hw / 2, ls, lhw, 1.2);
    g.lineTo(x + s * hw / 2 + lhw, y - 26);
  }
  g.moveTo(x, ls - riseOf(lhw, 1.2) * 0.5);
  g.lineTo(x, y - 26);
  g.moveTo(x - hw, y - 92);
  g.lineTo(x + hw, y - 92);
  g.stroke();
  stroke(g, L, 5);
  g.beginPath();
  g.arc(x, spring - rise * 0.34, hw * 0.34, 0, TAU);
  g.stroke();
  g.fillStyle = L.color;
  for (const a of [0, 1, 2, 3, 4, 5]) { // the cusps of the ring
    g.beginPath();
    g.arc(x + Math.cos((a * TAU) / 6) * hw * 0.34, spring - rise * 0.34 + Math.sin((a * TAU) / 6) * hw * 0.34, 4.6, 0, TAU);
    g.fill();
  }
  g.restore();
  rimLight(g, (c, ox = 0, oy = 0) => trace(c, stub, ox, oy), 1, 2.4, DAWN, 0.8, L.color);
}

// A flying buttress: a tall pier at x with a pinnacle and a flyer arching out to a lower pier `reach` px away (dir -1 or 1).
export function buttress(g, rng, L, x, y, h, reach, dir) {
  const [lx, ly] = [x + dir * reach, y - h * 0.46];
  g.fillStyle = L.color;
  const pier = (c, ox = 0, oy = 0) => trace(c, [[x - 24, y], [x - 20, y - h], [x - 24, y - h - 8], [x + 24, y - h - 8], [x + 20, y - h], [x + 24, y]], ox, oy);
  g.beginPath();
  pier(g);
  g.fill();
  rimLight(g, pier, toward(x), 2.6, DAWN, 0.8);
  pinnacle(g, x, y - h - 8, 18, 74);
  g.fillRect(lx - 14, ly, 28, y - ly);
  pinnacle(g, lx, ly, 18, 44);
  const [ax, ay] = [x + dir * 20, y - h * 0.82];
  const fly = (c, ox = 0, oy = 0) => {
    c.moveTo(ax + ox, ay + oy);
    c.lineTo(lx - dir * 8 + ox, ly - 2 + oy);
    c.lineTo(lx - dir * 6 + ox, ly + 18 + oy);
    c.quadraticCurveTo((ax + lx - dir * 6) / 2 + ox, ay + 46 + (ly + 18 - ay - 46) * 0.1 + oy, ax + ox, ay + 46 + oy); // the intrados, an arch thinning toward its crown
    c.closePath();
  };
  g.beginPath();
  fly(g);
  g.fill();
  rimLight(g, fly, toward(x), 2, DAWN, 0.7);
  courses(g, rng, x - 20, y - h, x + 20, y, 0.16, 10);
}
