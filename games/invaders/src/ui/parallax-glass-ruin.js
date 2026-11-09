// The ruins of Glass Cathedral's far layer that stand apart from the nave and the west front (see parallax-glass.js):
// the south transept's end wall, a gable with three tall stained lancets and a round window over them; a free
// standing window frame whose tracery still holds a few panes of glass against the dawn; an arcade of pointed
// arches on piers, one whole, one half fallen, one gone; the faint skyline of a far-off cloister behind it
// all; and drifts of fallen stone. Glass is lit and carries a halo; the rest is stone in shadow with the dawn on
// its right-hand edges.
import { mix, rgba, lin } from './sprites.js';
import { TAU } from '../core/math.js';
import { poly, trace, toward, rimLight, wash, courses, pinnacle, archTop, riseOf, ragged, tint, lamp, ivy, JEWEL, DAWN, IVY } from './parallax-glass-kit.js';
import { glaze, oculus } from './parallax-glass-window.js';

// The far cloister, a faint run of arches and thin spires in the haze behind everything.
export function skyline(g, rng, w, base, L, haze) {
  const c = mix(L.color, haze, 0.5);
  g.save();
  g.globalAlpha = 0.5;
  g.strokeStyle = c;
  g.fillStyle = c;
  g.lineWidth = 6;
  for (let x = -20; x < w; x += 70 + rng() * 40) {
    const [hw, h] = [24 + rng() * 14, 110 + rng() * 70];
    g.fillRect(x - hw - 4, base - 70 - h, 8, h + 70);
    if (rng() < 0.7) {
      g.beginPath();
      g.moveTo(x - hw + 4, base - 70 - h * 0.55);
      archTop(g, x + hw * 0.4, base - 70 - h * 0.55, hw + 4, 1.1);
      g.stroke();
    }
    if (rng() < 0.4) pinnacle(g, x - hw - 4, base - 70 - h, 8, 46 + rng() * 60);
  }
  g.fillStyle = lin(g, 0, base - 96, 0, base - 40, [[0, rgba(c, 0)], [1, c]]); // its foot, a haze with no hard edge
  g.fillRect(0, base - 96, w, 140);
  g.restore();
}

// The transept's end wall at X: a gable with a triple lancet, a round window and a quatrefoil of tracery over it.
export function transept(g, out, rng, L, X, base) {
  const pts = [[X - 132, base], [X - 132, base - 262], ...ragged(rng, X - 132, X - 60, base - 266, 8, 7), [X - 40, base - 300], [X - 12, base - 346], [X - 2, base - 332], [X + 8, base - 352], [X + 30, base - 318],
    [X + 52, base - 304], [X + 66, base - 270], [X + 98, base - 262], [X + 110, base - 236], [X + 132, base - 240], [X + 132, base]];
  const build = (c, ox = 0, oy = 0) => trace(c, pts, ox, oy);
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  rimLight(g, build, toward(X), 2.4, DAWN, 0.8);
  wash(g, build, [X - 132, base - 352, X + 132, base - 100]);
  courses(g, rng, X - 132, base - 340, X + 132, base, 0.14, 11, build);
  ivy(g, rng, X + 68, X + 98, base - 264, 3, tint(L, IVY, 0.5), 40);
  ivy(g, rng, X - 126, X - 70, base - 260, 3, tint(L, IVY, 0.5), 34);
  glaze(g, out, rng, L, X, base - 54, 24, 196, { set: [JEWEL.ruby, JEWEL.gilt, JEWEL.sapphire], kind: 'medallion' });
  glaze(g, out, rng, L, X - 52, base - 54, 16, 154, { set: [JEWEL.sapphire, JEWEL.rose, JEWEL.gilt], kind: 'lozenge' });
  glaze(g, out, rng, L, X + 52, base - 54, 16, 154, { set: [JEWEL.amethyst, JEWEL.amber, JEWEL.ruby], kind: 'bands' });
  g.save(); // the round window over them
  g.globalCompositeOperation = 'destination-out';
  g.beginPath();
  g.arc(X, base - 292, 22, 0, TAU);
  g.fill();
  g.restore();
  oculus(g, X, base - 292, 21, [JEWEL.gilt, JEWEL.ruby, JEWEL.sapphire, JEWEL.rose]);
  lamp(out, X, base - 292, 40, JEWEL.rose, 'steady', 0, 0.3);
  g.fillStyle = L.color;
  for (const s of [-1, 1]) {
    poly(g, [[X + s * 124, base], [X + s * 124, base - 230], [X + s * 134, base - 240], [X + s * 150, base - 220], [X + s * 156, base]]);
    g.fill();
    pinnacle(g, X + s * 138, base - 238, 12, 56);
  }
}

// A free-standing window frame at X: two piers, a pointed rib, four lancet lights under a mullion and a head of three rings of
// tracery, with glass still in the rings and a few panes still hanging in the lower lights, the rest open to the dawn.
export function tracery(g, out, rng, L, X, base) {
  const [hw, spring] = [86, base - 232];
  g.save();
  g.fillStyle = L.color;
  g.strokeStyle = L.color;
  g.lineJoin = 'round';
  for (const s of [-1, 1]) {
    g.fillRect(X + s * (hw + 4) - 11, spring - 6, 22, base - spring + 6);
    pinnacle(g, X + s * (hw + 4), spring - 6, 14, 46);
  }
  g.lineWidth = 13;
  g.beginPath();
  g.moveTo(X - hw, spring + 2);
  g.lineTo(X - hw, spring);
  const rise = archTop(g, X, spring, hw, 1.05);
  g.lineTo(X + hw, spring + 2);
  g.stroke();
  g.lineWidth = 5.5;
  const [lhw, ls] = [hw * 0.25 - 3.5, spring + 50];
  g.beginPath(); // the four lancet lights and the mullions between them
  for (const u of [-0.75, -0.25, 0.25, 0.75]) {
    g.moveTo(X + u * hw - lhw, base - 34);
    g.lineTo(X + u * hw - lhw, ls);
    archTop(g, X + u * hw, ls, lhw, 1.2);
    g.lineTo(X + u * hw + lhw, base - 34);
  }
  g.moveTo(X, ls - riseOf(lhw, 1.2) * 0.3);
  g.lineTo(X, spring - 28);
  g.stroke();
  const rings = [[0, spring - 62, 30, JEWEL.ruby], [-hw * 0.5, spring - 4, 19, JEWEL.sapphire], [hw * 0.5, spring - 4, 19, JEWEL.amber]];
  g.lineWidth = 5;
  for (const [dx, y, r] of rings) {
    g.beginPath();
    g.arc(X + dx, y, r + 2, 0, TAU);
    g.stroke();
  }
  g.restore();
  for (const [dx, y, r, c] of rings) {
    oculus(g, X + dx, y, r - 1, [c, JEWEL.gilt, c, JEWEL.rose]);
    lamp(out, X + dx, y, r * 2.4, c, 'steady', 0, 0.28);
  }
  glaze(g, out, rng, L, X - hw * 0.25, base - 36, lhw - 1.5, 120, { set: [JEWEL.sapphire, JEWEL.rose, JEWEL.gilt], kind: 'lozenge', broken: 0.55 });
  glaze(g, out, rng, L, X + hw * 0.75, base - 36, lhw - 1.5, 120, { set: [JEWEL.ruby, JEWEL.amber, JEWEL.violet], kind: 'lozenge', broken: 0.7 });
  rimLight(g, (c, ox = 0, oy = 0) => trace(c, [[X + hw - 7, spring], [X + hw + 15, spring], [X + hw + 15, base], [X + hw - 7, base]], ox, oy), 1, 2, DAWN, 0.7, L.color);
}

// n arches on piers from x0 rightward, state[i] 'whole', 'half' (the right side is gone) or 'gone' (only its piers).
export function arcade(g, rng, L, x0, base, state, hw = 44) {
  const spring = base - 126;
  g.save();
  g.fillStyle = L.color;
  g.strokeStyle = L.color;
  g.lineWidth = 11;
  for (let i = 0; i <= state.length; i++) {
    const x = x0 + i * hw * 2;
    const hgt = state[i] === 'gone' && state[i - 1] === 'gone' ? 70 : 126 + (state[i - 1] === 'half' ? -34 : 0);
    g.fillRect(x - 12, base - hgt, 24, hgt);
    g.fillRect(x - 15, base - hgt - 6, 30, 8);
    g.fillRect(x - 17, base - 12, 34, 12);
  }
  state.forEach((s, i) => {
    if (s === 'gone') return;
    const cx = x0 + i * hw * 2 + hw;
    g.beginPath();
    g.moveTo(cx - hw + 8, spring);
    if (s === 'whole') archTop(g, cx, spring, hw - 8, 1.1);
    else {
      archTop(g, cx, spring, hw - 8, 1.1);
      g.stroke();
      g.save();
      g.globalCompositeOperation = 'destination-out'; // the fallen half: cut a ragged gap in the rib's right side
      g.beginPath();
      g.rect(cx + 6, spring - 120, hw, 100);
      g.fill();
      g.restore();
      return;
    }
    g.stroke();
  });
  g.restore();
}

// A drift of fallen stone along the foot from x0 to x1: blocks, drums and slivers.
export function rubble(g, rng, L, x0, x1, base) {
  g.fillStyle = L.color;
  for (let x = x0; x < x1; x += 14 + rng() * 22) {
    const [w, h] = [8 + rng() * 22, 5 + rng() * 11];
    poly(g, [[x, base + 4], [x + 2, base - h], [x + w * 0.6, base - h - rng() * 4], [x + w, base - h * 0.5], [x + w + 2, base + 4]]);
    g.fill();
  }
}
