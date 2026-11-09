// The mid layer of Starlit Archive: islands of stacked books floating in the nebula, each a crag of
// dark rock hung with roots and a lantern, its top heaped with books lying and standing, a ladder leaning on
// a pile and a brass reading lamp lit (lights that pulse softly); rope bridges sag between them, and the
// greatest island carries a brass orrery (parallax-archive-orrery.js, whose planets turn in flourish-7.js).
// L.lamp is the lamps' colour. See parallax-shapes.js for the painter contract.
import { rgba, lin, rad } from './sprites.js';
import { GOLD, LILAC, NIGHT, poly } from './parallax-archive-kit.js';
import { pile, row, ladder, readingLamp, bridge, lantern, banner } from './parallax-archive-props.js';
import { orrery } from './parallax-archive-orrery.js';

// The crag: a ragged top, sides running in to a tip, strata and cracks, lit warm from the lamps above and
// lilac on the right, dark under the keel; roots and stalactites hanging from it.
function rock(g, rng, L, cx, top, w, depth) {
  const side = (s) => Array.from({ length: 7 }, (_, i) => {
    const u = (i + 1) / 7;
    return [cx + s * (w / 2) * (1 - u ** 1.5) * (0.85 + rng() * 0.3), top + depth * u ** 0.8 + (rng() - 0.5) * 10];
  });
  const [right, left] = [side(1), side(-1)];
  g.beginPath();
  g.moveTo(cx - w / 2, top);
  for (let x = cx - w / 2; x < cx + w / 2; x += 18) g.lineTo(x, top + (rng() - 0.5) * 5);
  for (const p of right) g.lineTo(...p);
  g.lineTo(cx + (rng() - 0.5) * 24, top + depth);
  for (const p of left.toReversed()) g.lineTo(...p);
  g.closePath();
  g.fillStyle = L.color;
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, cx - w / 2, 0, cx + w / 2, 0, [[0, rgba(NIGHT, 0.4)], [0.6, rgba(NIGHT, 0)], [1, rgba(LILAC, 0.2)]]);
  g.fillRect(cx - w / 2, top, w, depth);
  g.fillStyle = rad(g, cx, top, 10, w * 0.7, [[0, rgba(GOLD, 0.18)], [1, rgba(GOLD, 0)]]);
  g.fillRect(cx - w / 2, top, w, depth);
  right.forEach(([x, y], i) => { // facets fanning from the keel, lit and shaded by turns
    const [px, py] = i ? right[i - 1] : [cx + w / 2, top];
    poly(g, [[px, py], [x, y], [cx, top + depth]]);
    g.fillStyle = i % 2 ? rgba(LILAC, 0.1) : rgba(NIGHT, 0.2);
    g.fill();
  });
  left.forEach(([x, y], i) => {
    const [px, py] = i ? left[i - 1] : [cx - w / 2, top];
    poly(g, [[px, py], [x, y], [cx, top + depth]]);
    g.fillStyle = i % 2 ? rgba(NIGHT, 0.25) : rgba(LILAC, 0.05);
    g.fill();
  });
  g.lineCap = 'round';
  for (let k = 1; k < 7; k++) { // strata, each sagging a little more toward the middle
    const y = top + depth * k * 0.13;
    g.beginPath();
    g.moveTo(cx - w / 2, y + (rng() - 0.5) * 8);
    g.quadraticCurveTo(cx, y + 6 + rng() * 10, cx + w / 2, y + (rng() - 0.5) * 8);
    g.strokeStyle = rgba(k % 2 ? LILAC : '#000000', k % 2 ? 0.1 : 0.22);
    g.lineWidth = 1.2 + rng() * 2;
    g.stroke();
  }
  for (let i = 0; i < 9; i++) { // cracks
    let [x, y] = [cx + (rng() - 0.5) * w * 0.8, top + 6 + rng() * depth * 0.4];
    g.beginPath();
    g.moveTo(x, y);
    for (let j = 0; j < 4; j++) g.lineTo((x += (rng() - 0.5) * 12), (y += 8 + rng() * 14));
    g.strokeStyle = rgba('#000000', 0.34);
    g.lineWidth = 1.2;
    g.stroke();
  }
  g.fillStyle = lin(g, 0, top + depth * 0.4, 0, top + depth, [[0, rgba(NIGHT, 0)], [1, rgba(NIGHT, 0.6)]]);
  g.fillRect(cx - w / 2, top, w, depth);
  g.fillStyle = rad(g, cx, top + depth * 0.9, 4, w * 0.4, [[0, rgba(GOLD, 0.3)], [1, rgba(GOLD, 0)]]); // the lantern's light thrown up the keel
  g.fillRect(cx - w / 2, top + depth * 0.4, w, depth * 0.6);
  g.strokeStyle = rgba('#4af0d8', 0.5); // runes cut in the rock, faintly burning
  g.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    const [rx, ry] = [cx + (rng() - 0.5) * w * 0.55, top + depth * (0.2 + rng() * 0.3)];
    g.beginPath();
    g.moveTo(rx, ry);
    g.lineTo(rx + 5, ry + 3 + rng() * 4);
    g.lineTo(rx - 2, ry + 9);
    g.moveTo(rx + 7, ry - 1);
    g.lineTo(rx + 7, ry + 11);
    g.stroke();
  }
  g.restore();
  g.fillStyle = rgba('#5a5a2a', 0.4); // a thin turf over the top
  g.fillRect(cx - w / 2 + 3, top - 1, w - 6, 3);
  g.strokeStyle = L.color; // roots, and a few thinner ones branching from them
  g.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const [x, y] = [cx + (rng() - 0.5) * w * 0.6, top + depth * (0.35 + rng() * 0.3)];
    const [ex, ey] = [x + (rng() - 0.5) * 30, y + 22 + rng() * 40];
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + (rng() - 0.5) * 20, (y + ey) / 2, ex, ey);
    g.moveTo((x + ex) / 2, (y + ey) / 2);
    g.lineTo((x + ex) / 2 + (rng() - 0.5) * 24, ey - 4);
    g.stroke();
  }
  g.fillStyle = L.color;
}

// One island and what it carries.
function island(g, out, rng, L, cx, top, w, depth, big) {
  rock(g, rng, L, cx, top, w, depth);
  if (big) orrery(g, out, rng, L, cx, top);
  const spots = big ? [-0.38, 0.4] : w > 300 ? [-0.3, 0, 0.3] : [-0.22, 0.2];
  const piles = spots.map((s) => {
    const [x, n] = [cx + s * w + (rng() - 0.5) * 16, 4 + Math.floor(rng() * 9)];
    return [x, pile(g, rng, L, x, top, 42 + rng() * 24, n), n];
  });
  row(g, rng, L, cx - w / 2 + 14, top, 4 + Math.floor(rng() * 5));
  row(g, rng, L, cx + w / 2 - 70, top, 3 + Math.floor(rng() * 4));
  const [lx, ly] = piles[0];
  ladder(g, lx + 52, top, lx + 12, ly + 6);
  const short = piles.reduce((a, p) => (p[1] > a[1] ? p : a));
  readingLamp(g, out, rng, L, short[0] - 8, short[1]);
  for (const s of [-0.36, 0.34]) banner(g, rng, cx + s * w, top + 2, 38 + rng() * 22, ['#3a2a8a', '#8a2a4a', '#1f5a6a'][Math.floor(rng() * 3)]);
  lantern(g, out, rng, cx + (rng() - 0.5) * w * 0.25, top + depth * 0.78, 26 + rng() * 18, L.lamp);
  g.fillStyle = L.color;
}

const ROSE = [680, 940]; // layer px: the stretch in front of the hall's rose window, kept clear
const ORRERY_X = 1250; // layer px: where the orrery likes to stand, clear of the hall and the galaxy

function isles(g, w, h, rng, L, out) {
  const spots = [];
  for (let x = 120; x < w - 260; ) {
    const iw = 230 + rng() * 220;
    if (x < ROSE[1] && x + iw > ROSE[0]) { // none stands in front of the hall's rose window
      x = ROSE[1];
      continue;
    }
    spots.push([x + iw / 2, 100 + rng() * 110, iw, 120 + rng() * 100]);
    x += iw + 90 + rng() * 150;
  }
  const big = spots.reduce((a, s, i) => (Math.abs(s[0] - ORRERY_X) < Math.abs(spots[a][0] - ORRERY_X) ? i : a), 0); // the greatest island is the one nearest the middle of the sky
  spots[big][1] = 232;
  spots[big][2] = Math.max(spots[big][2], 380);
  spots.forEach(([cx, top, iw, depth], i) => island(g, out, rng, L, cx, top, iw, depth, i === big));
  for (let i = 1; i < spots.length; i++) { // a rope bridge between neighbours
    const [[xa, ya, wa], [xb, yb, wb]] = [spots[i - 1], spots[i]];
    const gap = xb - wb / 2 - (xa + wa / 2);
    if (gap < 300) bridge(g, xa + wa / 2 - 20, ya, xb - wb / 2 + 20, yb);
  }
}

export const ISLES = { isles };
