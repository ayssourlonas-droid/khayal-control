// More flourishes (contract in flourish.js): the rest of Starlit Archive's. A flock of paper cranes crossing
// the sky now and then, the orrery's planets turning on their rings, stars twinkling in the pools of ink
// on the gallery floor, and a page lifting and turning over on the open books along the rail. The orrery,
// the pools and the books are marked by signs in their layers (parallax-archive-2.js, -3.js).
import { W, hash, glow, soft, star, cached, byColor, lighter, normal } from './sprites.js';
import { layerX } from './parallax.js';
import { RINGS } from './parallax-archive-orrery.js';

const INK = '#2a1c08';

// One crane in flight, facing right, 72 x 52: a folded body, a long neck and a beak, a tail, and the near
// wing and the far one up, level and down (frames 0-2), each split on its crease into a lit face and a
// shaded one.
const paintCrane = (frame) => cached('crane' + frame, 72, 52, (g) => {
  const tip = [[34, 3], [18, 15], [30, 49]][frame];
  const tri = (pts, fill) => {
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 1.2;
    g.lineJoin = 'round';
    g.stroke();
  };
  tri([[27, 25], [tip[0] + 8, tip[1] - 1], [48, 23]], '#b8a070'); // the far wing, in shade
  tri([[12, 27], [4, 17], [26, 30]], '#e8dab0'); // the tail
  tri([[14, 28], [36, 40], [52, 29], [36, 23]], '#efe0b4'); // the body
  tri([[14, 28], [36, 40], [36, 28]], '#c8b484');
  tri([[50, 27], [55, 31], [65, 16], [62, 13]], '#e8dab0'); // the neck
  tri([[62, 13], [65, 16], [72, 19]], '#c8902a'); // the beak
  tri([[24, 27], tip, [35, 25]], '#fff6d8'); // the near wing
  tri([[35, 25], tip, [46, 24]], '#d8c690');
  g.strokeStyle = 'rgba(200,144,42,0.7)';
  g.lineWidth = 0.9;
  g.beginPath();
  g.moveTo(35, 25);
  g.lineTo(tip[0], tip[1]);
  g.stroke();
});

const WING = [0, 1, 2, 1];
const crane = byColor(paintCrane); // by frame, not colour: a bare Map get, so a flock builds no key
const SLOWEST = 170; // px/s, the slowest of the flock; the others add up to 45 more
const FLIGHT = (W + 240) / SLOWEST + 6 * 0.22 + 0.8; // s into the flight after which every crane is across

// A flock of seven in a loose V, crossing the sky from one side now and then, each beating to its own time,
// the leader a little larger.
function cranes(ctx, { t }) {
  const PERIOD = 53;
  const slot = Math.floor(t / PERIOD);
  const lt = t - slot * PERIOD - 3;
  if (lt < 0 || lt > FLIGHT || hash(slot * 5) > 0.65) return;
  const dir = hash(slot * 5 + 1) < 0.5 ? 1 : -1;
  const y0 = 170 + hash(slot * 5 + 2) * 150;
  for (let i = 0; i < 7; i++) {
    const age = lt - Math.ceil(i / 2) * 0.22 - hash(slot * 17 + i) * 0.3;
    const x = dir > 0 ? -80 + age * (SLOWEST + hash(i + 40) * 45) : W + 80 - age * (SLOWEST + hash(i + 40) * 45);
    if (x < -90 || x > W + 90) continue;
    const s = i ? 0.8 + hash(i + 41) * 0.2 : 1.25;
    const y = y0 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 34 + Math.sin(age * 1.3 + i) * 14;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir * s, s);
    ctx.rotate(Math.sin(age * 1.7 + i) * 0.08);
    ctx.drawImage(crane(WING[Math.floor(t * 4.2 + i * 1.3) & 3]), -36, -26);
    ctx.restore();
  }
}

// The mid layer's sign of this kind, found once.
const signs = (v, layer, key) => (v.cache[key] ??= v.layers[layer]?.signs.filter((s) => s[key]) ?? []);

// The orrery's planets, each on its own ring at its own pace, a little brighter and bigger on the near half
// of the ring; the teal one has a moon.
function orrery(ctx, { v, t }, x0, top) {
  const sun = signs(v, 1, 'orrery')[0];
  if (!sun) return;
  const [cx, cy] = [x0 + sun.x, top + sun.y];
  for (let i = 0; i < RINGS.length; i++) {
    const { rx, ry, tilt, speed, color, r } = RINGS[i];
    const a = t * speed + i * 1.7;
    const [ex, ey] = [Math.cos(a) * rx, Math.sin(a) * ry];
    const [x, y] = [cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), cy + ex * Math.sin(tilt) + ey * Math.cos(tilt)];
    const near = Math.sin(a) > 0;
    const k = near ? 1 : 0.7;
    lighter(ctx);
    ctx.globalAlpha = 0.45 * k;
    ctx.drawImage(glow(color), x - r * 3, y - r * 3, r * 6, r * 6);
    normal(ctx);
    ctx.globalAlpha = k;
    ctx.drawImage(soft(color), x - r * 1.4 * k, y - r * 1.4 * k, r * 2.8 * k, r * 2.8 * k);
    lighter(ctx);
    ctx.globalAlpha = 0.7 * k;
    ctx.drawImage(glow('#ffffff'), x - r * 0.9 - r * 0.3, y - r * 0.9 - r * 0.3, r * 1.2, r * 1.2);
    if (i === 2) { // the moon
      const m = t * 2.4;
      ctx.globalAlpha = 0.9 * k;
      ctx.drawImage(soft('#fff6d8'), x + Math.cos(m) * 15 - 3, y + Math.sin(m) * 6 - 3, 6, 6);
    }
    normal(ctx);
  }
}

// Stars on the pools of ink: a few in each, each swelling and sinking to a beat of its own.
function inkglint(ctx, { v, t, world }) {
  const L = v.layers[2];
  const x0 = layerX(L, world.ship?.x ?? W / 2);
  lighter(ctx);
  const pools = signs(v, 2, 'ink');
  for (let i = 0; i < pools.length; i++) {
    const p = pools[i];
    const x = x0 + p.x;
    if (x + p.rx < 0 || x - p.rx > W) continue;
    for (let k = 0; k < 3; k++) {
      const b = Math.max(0, Math.sin(t * (0.9 + hash(i * 3 + k) * 1.4) + i * 2 + k * 5)) ** 3;
      ctx.globalAlpha = 0.85 * b;
      const s = 9 + 8 * b;
      ctx.drawImage(star(k ? '#fff4d6' : '#cfd8ff'), x + (hash(i * 3 + k + 70) * 1.6 - 0.8) * p.rx - s, L.top + p.y + (hash(i * 3 + k + 71) * 1.2 - 0.6) * p.ry - s, s * 2, s * 2);
    }
  }
  normal(ctx);
}

const TURN = 1.2; // s a page takes to turn
const BEAT = 8.5; // s between one turn of a book and the next

// Gold motes rising off an open book like sparks of what is written in it, each swelling and fading on the
// way up, swaying a little.
function motes(ctx, x, y, t, i) {
  lighter(ctx);
  for (let k = 0; k < 3; k++) {
    const u = (t * 0.22 + i * 0.37 + k / 3) % 1;
    ctx.globalAlpha = Math.sin(Math.PI * u) * 0.85;
    const s = 5 + 4 * Math.sin(Math.PI * u);
    ctx.drawImage(star(k % 2 ? '#fff0c0' : '#ffd27a'), x + (k - 1) * 14 + Math.sin(t * 1.3 + k * 2 + i) * 6 - s, y - 8 - u * 70 - s, s * 2, s * 2);
  }
  normal(ctx);
}

// Each open book gives off gold motes, and now and then a page lifts from its right-hand leaf, arches over
// the spine and settles on the left, one book at a time: a thin leaf of parchment, lit on its upper face,
// seen as it swings.
function pageturn(ctx, { v, t, world }) {
  const x0 = layerX(v.layers[2], world.ship?.x ?? W / 2);
  const books = signs(v, 2, 'book');
  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    const lt = (t + i * 2.9) % BEAT;
    const x = x0 + b.x;
    if (x < -80 || x > W + 80) continue;
    motes(ctx, x, v.layers[2].top + b.y, t, i);
    if (lt > TURN) continue;
    const a = (lt / TURN) * Math.PI;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    const pw = b.w * 0.47;
    const y = v.layers[2].top + b.y;
    const tip = [x + c * pw, y - 4 - s * pw * 0.42];
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.quadraticCurveTo(x + c * pw * 0.5, y - 3 - s * pw * 0.78, ...tip);
    ctx.quadraticCurveTo(x + c * pw * 0.5, y - 1 - s * pw * 0.3, x, y - 1);
    ctx.closePath();
    ctx.fillStyle = c > 0 ? '#fff6d8' : '#d8c690';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export const FLOURISH7 = { cranes: { sky: cranes }, orrery: { mid: orrery }, inkglint: { near: inkglint }, pageturn: { near: pageturn } };
