// The floating islands of Sunset Armada, for the far and the mid layers: a crag of dark rock with its flanks
// lit gold on the side facing the sun and its keel warmed rose by the cloud sea below, strata and cracks in
// it, roots and a lantern hung from it; on top a turf cap with trees, a cottage with a lit window and, on
// the far layer's greatest, a watchtower with a beacon. A waterfall pours off the lip of some of them into
// the clouds (the water shimmers in flourish-9.js, which finds each fall in the layer's signs). See
// parallax-shapes.js for the painter contract.
import { rgba, lin, rad } from './sprites.js';
import { TAU } from '../core/math.js';
import { GOLD, EMBER, ROSE, NIGHT, poly, toward, rimLight, rope, pane } from './parallax-armada-kit.js';

// The crag's outline as a builder (see rimLight): a gently domed, ragged top, flanks running in by steps to
// a tip; and the spikes of rock that hang round the keel, drawn apart from it (rock()).
function crag(rng, cx, top, w, depth) {
  const side = (s) => Array.from({ length: 9 }, (_, i) => {
    const u = (i + 1) / 9;
    return [cx + s * (w / 2) * (1 - u ** 1.4) * (0.78 + rng() * 0.4), top + depth * u ** 0.85 + (rng() - 0.5) * 12];
  });
  const [right, left] = [side(1), side(-1)];
  const tipX = cx + (rng() - 0.5) * 24;
  const n = Math.ceil(w / 16);
  const tops = Array.from({ length: n + 1 }, (_, i) => [cx - w / 2 + i * 16, top - Math.sin((i / n) * Math.PI) * 9 + (rng() - 0.5) * 4]);
  const spikes = [-0.3, -0.12, 0.14, 0.32].map((k) => [cx + k * w * 0.5, top + depth * (0.45 + rng() * 0.15), 3 + rng() * 3, depth * (0.25 + rng() * 0.25)]);
  const build = (g, ox = 0, oy = 0) => {
    g.moveTo(cx - w / 2 + ox, top + oy);
    for (const [x, y] of tops) g.lineTo(x + ox, y + oy);
    for (const [x, y] of right) g.lineTo(x + ox, y + oy);
    g.lineTo(tipX + ox, top + depth + oy);
    for (const [x, y] of left.toReversed()) g.lineTo(x + ox, y + oy);
    g.closePath();
  };
  return { build, right, left, tipX, spikes };
}

function rock(g, rng, L, c, cx, top, w, depth) {
  const dir = toward(cx);
  g.beginPath();
  c.build(g);
  g.fillStyle = L.color;
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, cx - dir * w / 2, 0, cx + dir * w / 2, 0, [[0, rgba(NIGHT, 0.5)], [0.55, rgba(NIGHT, 0)], [1, rgba(GOLD, 0.34)]]);
  g.fillRect(cx - w / 2, top, w, depth);
  for (const [flank, lit] of [[c.right, dir > 0], [c.left, dir < 0]]) { // facets fanning to the keel, the sunward flank's lit by turns
    flank.forEach(([x, y], i) => {
      const [px, py] = i ? flank[i - 1] : [cx + (flank === c.right ? w / 2 : -w / 2), top];
      poly(g, [[px, py], [x, y], [c.tipX, top + depth]]);
      g.fillStyle = i % 2 ? rgba(lit ? GOLD : NIGHT, lit ? 0.16 : 0.2) : rgba(lit ? ROSE : '#000000', lit ? 0.1 : 0.12);
      g.fill();
    });
  }
  g.lineCap = 'round';
  for (let k = 1; k < 7; k++) { // strata, sagging a little more toward the middle
    const y = top + depth * k * 0.13;
    g.beginPath();
    g.moveTo(cx - w / 2, y + (rng() - 0.5) * 8);
    g.quadraticCurveTo(cx, y + 6 + rng() * 10, cx + w / 2, y + (rng() - 0.5) * 8);
    g.strokeStyle = rgba(k % 2 ? GOLD : '#000000', k % 2 ? 0.12 : 0.22);
    g.lineWidth = 1.2 + rng() * 2;
    g.stroke();
  }
  for (let i = 0; i < 7; i++) { // cracks
    let [x, y] = [cx + (rng() - 0.5) * w * 0.8, top + 6 + rng() * depth * 0.4];
    g.beginPath();
    g.moveTo(x, y);
    for (let j = 0; j < 4; j++) g.lineTo((x += (rng() - 0.5) * 12), (y += 8 + rng() * 14));
    g.strokeStyle = rgba('#000000', 0.34);
    g.lineWidth = 1.2;
    g.stroke();
  }
  g.fillStyle = rad(g, c.tipX, top + depth, 4, depth * 0.85, [[0, rgba(EMBER, 0.32)], [0.5, rgba(ROSE, 0.12)], [1, rgba(ROSE, 0)]]); // the cloud sea's light on the keel
  g.fillRect(cx - w / 2, top, w, depth);
  g.restore();
  for (const [x, y, sw, len] of c.spikes) { // the spikes: dark rock with the sun on the near edge
    poly(g, [[x - sw, y - 4], [x, y + len], [x + sw, y - 4]]);
    g.fillStyle = L.color;
    g.fill();
    g.strokeStyle = rgba(GOLD, 0.8);
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(x + dir * sw, y - 4);
    g.lineTo(x, y + len);
    g.stroke();
  }
  rimLight(g, c.build, dir, 3);
  g.fillStyle = L.color;
}

// A tree on the turf at (x, y): a dark crown of three overlapping lobes on a trunk, gilt on the sunward side.
function tree(g, rng, L, x, y, h, dir) {
  g.fillStyle = NIGHT;
  g.fillRect(x - 1.4, y - h * 0.4, 2.8, h * 0.4);
  const lobes = [[0, -h * 0.72, h * 0.34], [-h * 0.2, -h * 0.55, h * 0.26], [h * 0.2, -h * 0.55, h * 0.26]];
  for (const [dx, dy, r] of lobes) {
    g.beginPath();
    g.arc(x + dx, y + dy, r, 0, TAU);
    g.fillStyle = L.color;
    g.fill();
  }
  g.lineWidth = 1.8;
  g.strokeStyle = rgba(GOLD, 0.7);
  for (const [dx, dy, r] of lobes) {
    g.beginPath();
    g.arc(x + dx, y + dy, r, dir > 0 ? -1.2 : Math.PI - 0.5, dir > 0 ? 0.5 : Math.PI + 1.2, dir < 0);
    g.stroke();
  }
}

// A cottage with a steep roof, a chimney and a lit window; its sunward roof edge gilt.
function cottage(g, out, rng, L, x, y, s, dir) {
  g.fillStyle = L.color;
  g.fillRect(x - s * 0.7, y - s, s * 1.4, s);
  g.fillRect(x + dir * s * 0.3 - s * 0.12, y - s * 1.9, s * 0.24, s * 0.7);
  poly(g, [[x - s * 0.9, y - s], [x, y - s * 1.7], [x + s * 0.9, y - s]]);
  g.fill();
  g.strokeStyle = rgba(GOLD, 0.8);
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(x + dir * s * 0.9, y - s);
  g.lineTo(x, y - s * 1.7);
  g.stroke();
  pane(g, out, rng, x - dir * s * 0.18, y - s * 0.55, Math.max(2.4, s * 0.17), '#ffc86a', 'pulse');
  g.fillStyle = L.color;
}

// A waterfall over the lip at (x, y0) falling to y1: a sheet of pale gold, thin and bright where it leaves
// the rock, fanning out and fading into spray near the clouds; the foot is a bank of mist. A sign marks it.
export function fall(g, out, x, y0, y1, w) {
  const h = y1 - y0;
  g.beginPath();
  g.moveTo(x - w * 0.5, y0);
  g.bezierCurveTo(x - w * 0.6, y0 + h * 0.4, x - w * 0.9, y0 + h * 0.75, x - w * 1.5, y1);
  g.lineTo(x + w * 1.5, y1);
  g.bezierCurveTo(x + w * 0.9, y0 + h * 0.75, x + w * 0.6, y0 + h * 0.4, x + w * 0.5, y0);
  g.closePath();
  g.fillStyle = lin(g, 0, y0, 0, y1, [[0, rgba('#fff6e0', 0.95)], [0.5, rgba('#ffe4bc', 0.6)], [1, rgba('#ffd0b0', 0)]]);
  g.fill();
  g.strokeStyle = rgba('#ffffff', 0.5);
  g.lineWidth = 1;
  for (const k of [-0.35, 0.3]) {
    g.beginPath();
    g.moveTo(x + k * w, y0 + 4);
    g.lineTo(x + k * w * 1.6, y1 - h * 0.15);
    g.stroke();
  }
  out.signs.push({ fall: true, x, y0, y1, w });
  out.lights.push({ x, y: y1 - 6, r: w * 5, color: '#ffe0b8', mode: 'pulse', ph: x % 1, a: 0.5 });
}

// One island: crag, turf, trees, cottage(s), roots and a lantern under it. opts: { houses, trees, fall }.
export function isle(g, out, rng, L, cx, top, w, depth, opts = {}) {
  const c = crag(rng, cx, top, w, depth);
  const dir = toward(cx);
  rock(g, rng, L, c, cx, top, w, depth);
  g.fillStyle = rgba(NIGHT, 0.55);
  g.fillRect(cx - w / 2 + 3, top - 2, w - 6, 5); // the turf cap
  const trees = opts.trees ?? 4;
  for (let i = 0; i < trees; i++) tree(g, rng, L, cx + (rng() - 0.5) * w * 0.8, top, 14 + rng() * 22, dir);
  for (let i = 0; i < (opts.houses ?? 1); i++) cottage(g, out, rng, L, cx + ((i + 0.5) / (opts.houses ?? 1) - 0.5) * w * 0.6, top, 9 + rng() * 6, dir);
  g.strokeStyle = L.color; // roots
  g.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const [x, y] = [cx + (rng() - 0.5) * w * 0.55, top + depth * (0.35 + rng() * 0.3)];
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + (rng() - 0.5) * 20, y + 14, x + (rng() - 0.5) * 30, y + 22 + rng() * 34);
    g.stroke();
  }
  const [lx, ly] = [cx + (rng() - 0.5) * w * 0.2, top + depth * 0.8];
  rope(g, lx, ly, lx, ly + 22, 0, rgba(NIGHT, 0.8), 1.2); // a lantern on a chain under the keel
  g.fillStyle = rgba(NIGHT, 0.9);
  g.fillRect(lx - 3, ly + 22, 6, 8);
  out.lights.push({ x: lx, y: ly + 27, r: 30, color: EMBER, mode: 'flicker', ph: rng(), a: 0.85 });
  if (opts.fall) fall(g, out, cx + dir * w * 0.44, top + 2, top + depth + opts.fall, 8 + rng() * 6);
  return c;
}
