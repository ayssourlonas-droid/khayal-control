// The Lantern Leviathan's pectoral fin (World 15, Lantern Deep; see angler.js): an armour part 120 x 150 for the hit
// box, painted once as the left fin and mirrored for the right, and big, a fan reaching out past its box (the part is
// margined for it). A muscular arm of dark flesh leaves the flank and ends in a swollen knuckle; from the knuckle
// nine long, fine, jointed rays fan out down and away, and between them a thin translucent membrane stretches, ribbed
// and blotched with pigment, pale along its rim, torn in places, one old puncture. A few teal photophores sit along
// the rays. The rays' geometry is angler-fin-rays.js, re-exported here for the live shimmer; the ripple that runs
// over the membrane is angler-ripple.js.
import { path, line, lin, rad, rgba, ellipse } from './kit.js';
import { hash } from '../sprites.js';
import { WRIST, RAYS, N, EDGES, rayAt, rayPts, wedge, trail } from './angler-fin-rays.js';
import { circle, lumpy, photophore, rng, AQUA, TEAL, INK } from './angler-kit.js';

export { WRIST, RAYS, rayAt };

// The membrane: an ink edge round the whole fan, then each wedge in layers (a dark root fading to a pale rim, all of
// it see-through), fine ribs, blotches of pigment, a soft and a crisp rim light along the trailing edge.
function web(b) {
  for (let i = 0; i < N - 1; i++) {
    wedge(b, i);
    line(b, rgba(INK, 0.7), 3.4);
  }
  for (let i = 0; i < N - 1; i++) {
    wedge(b, i);
    b.fillStyle = rad(b, WRIST[0], WRIST[1], 8, 118, [[0, rgba('#0a2438', 0.86)], [0.4, rgba('#1d4c70', 0.62)], [0.78, rgba('#3a88ac', 0.45)], [1, rgba('#9adcee', 0.4)]]);
    b.fill();
    b.save();
    wedge(b, i);
    b.clip();
    const r = rng(40 + i);
    for (let k = 0; k < 4; k++) { // blotches of pigment
      const rr = 8 + r() * 10;
      const [x, y] = [WRIST[0] + (EDGES[i][3][0] - WRIST[0]) * (0.3 + 0.5 * r()) + (r() - 0.5) * 20, WRIST[1] + (EDGES[i][3][1] - WRIST[1]) * (0.3 + 0.5 * r()) + (r() - 0.5) * 20];
      b.fillStyle = rad(b, x, y, 0, rr, [[0, rgba('#02101e', 0.34)], [1, rgba('#02101e', 0)]]);
      b.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (const j of [1, 3, 5]) { // fine ribs fanning to the rim
      const e = EDGES[i][j];
      path(b, [[WRIST[0] + (e[0] - WRIST[0]) * 0.18, WRIST[1] + (e[1] - WRIST[1]) * 0.18], e], true);
      line(b, rgba('#c8f2fc', 0.24), 0.9);
    }
    trail(b, i);
    line(b, rgba('#bfeaf8', 0.14), 8);
    line(b, rgba('#bfeaf8', 0.26), 3.4);
    b.restore();
    trail(b, i);
    line(b, rgba('#d0f4ff', 0.7), 1.3);
  }
}

// Old injuries: two scars across the membrane (a dark slash with a pale lip) and a puncture the water shows through.
function scars(b) {
  for (const [i, u, j, v] of [[1, 0.5, 2, 0.74], [5, 0.42, 6, 0.66]]) {
    const [p, q] = [rayAt(i, u), rayAt(j, v)];
    for (const [dy, col, w] of [[1.3, rgba('#d8f6ff', 0.4), 1.4], [0, rgba('#05101c', 0.75), 1.8]]) {
      b.beginPath();
      b.moveTo(p[0], p[1] + dy);
      b.quadraticCurveTo((p[0] + q[0]) / 2 + 3, (p[1] + q[1]) / 2 + dy - 3, q[0], q[1] + dy);
      line(b, col, w);
    }
  }
  const [pa, pb] = [rayAt(3, 0.62), rayAt(4, 0.62)];
  const [hx, hy] = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
  b.save();
  b.globalCompositeOperation = 'destination-out';
  ellipse(b, hx, hy, 4.6, 3.4, 0.5);
  b.fill();
  b.restore();
  ellipse(b, hx, hy, 5.4, 4.2, 0.5);
  line(b, rgba(INK, 0.9), 1.6);
  ellipse(b, hx, hy, 6.6, 5.4, 0.5);
  line(b, rgba('#bfeaf8', 0.3), 1);
}

// The rays: jointed bone, thick at the knuckle and fine at the tip, a pale lit edge, a small hook at the tip; teal
// photophores on some.
function rays(b, l) {
  for (let i = 0; i < N; i++) {
    const pts = rayPts(i);
    const w0 = i === 0 || i === N - 1 ? 6.4 : 5;
    for (const [extra, col, k] of [[2.4, INK, 0], [0, '#4a86a8', 0], [-w0 * 0.5, rgba('#d8f4ff', 0.55), 1]]) {
      for (let s = 1; s < pts.length; s++) {
        const w = Math.max(1, w0 * (1 - (s - 0.5) / (pts.length - 1) * 0.8)) + extra;
        b.beginPath();
        b.moveTo(pts[s - 1][0], pts[s - 1][1] - k * 1.1);
        b.lineTo(pts[s][0], pts[s][1] - k * 1.1);
        line(b, col, Math.max(0.8, w));
      }
    }
    for (let s = 2; s < pts.length - 1; s++) { // the joints: a dark tick across the bone
      const [x, y] = pts[s];
      path(b, [[x - RAYS[i].d[1] * 3, y + RAYS[i].d[0] * 3], [x + RAYS[i].d[1] * 3, y - RAYS[i].d[0] * 3]], true);
      line(b, rgba('#02101c', 0.5), 1);
    }
    const [tx, ty] = RAYS[i].p1;
    const [dx, dy] = RAYS[i].d.map((v) => -v);
    b.beginPath(); // the hook
    b.moveTo(tx, ty);
    b.quadraticCurveTo(tx + dx * 5 - dy * 3 * RAYS[i].side, ty + dy * 5 + dx * 3 * RAYS[i].side, tx + dx * 7 - dy * 6 * RAYS[i].side, ty + dy * 7 + dx * 6 * RAYS[i].side);
    line(b, '#cfe8f0', 1.4);
  }
  for (const [i, u] of [[1, 0.5], [1, 0.78], [3, 0.55], [3, 0.8], [5, 0.5], [5, 0.76], [7, 0.55]]) {
    const [x, y] = rayAt(i, u);
    photophore(b, l, x, y, 1.8, i % 4 === 1 ? TEAL : AQUA, 0.8);
  }
}

// The arm: a thick tapering lobe of dark flesh lit along its top, folds and swellings; its root fades into the flank.
function arm(b) {
  b.beginPath();
  b.moveTo(56, -14);
  b.bezierCurveTo(36, -18, 14, -9, WRIST[0] + 2, 0);
  b.lineTo(WRIST[0] + 2, 25);
  b.bezierCurveTo(14, 36, 36, 44, 56, 42);
  b.closePath();
  b.fillStyle = lin(b, 0, -14, 0, 44, [[0, '#2f6288'], [0.3, '#12385a'], [0.7, '#081a2c'], [1, '#040c16']]);
  b.fill();
  line(b, INK, 3);
  b.save();
  b.clip();
  for (const [y0, y1, a] of [[-6, 6, 0.5], [6, 12, 0.45], [20, 18, 0.4], [32, 25, 0.4]]) { // folds along the arm
    for (const [dy, col, w] of [[0, rgba('#02070e', a), 2], [1.4, rgba('#8fd0e8', a * 0.25), 1]]) {
      b.beginPath();
      b.moveTo(60, y0 + dy);
      b.quadraticCurveTo(30, y0 + dy - 3, WRIST[0], y1 + dy);
      line(b, col, w);
    }
  }
  ellipse(b, 30, -2, 20, 5, -0.28);
  b.fillStyle = rgba('#bfeaff', 0.16);
  b.fill();
  const r = rng(61);
  for (let i = 0; i < 9; i++) { // swellings of muscle
    const [x, y, rr] = [WRIST[0] + 6 + r() * 48, -6 + r() * 44, 5 + r() * 6];
    b.fillStyle = rad(b, x, y, 0, rr, [[0, rgba('#6aa0c0', 0.3)], [1, rgba('#000610', 0.3)]], x - rr * 0.3, y - rr * 0.3);
    circle(b, x, y, rr);
    b.fill();
  }
  for (let i = 0; i < 18; i++) { // speckle
    circle(b, WRIST[0] + 6 + hash(i) * 50, -4 + hash(i + 40) * 44, 1.1);
    b.fillStyle = rgba('#8fd0e8', 0.2);
    b.fill();
  }
  b.restore();
}

// The knuckle: a swollen joint of flesh where the rays begin, soft-edged where the arm runs into it, with a ring of
// fine lines running out along the rays.
function knuckle(b, l) {
  const [x, y] = WRIST;
  lumpy(b, x, y, 11.5, 14, 12);
  b.fillStyle = rad(b, x, y, 0, 13, [[0, '#4a7ea2'], [0.6, '#173f60'], [1, '#0a2036']], x - 4, y - 5);
  b.fill();
  line(b, rgba(INK, 0.8), 1.6);
  for (let i = 0; i < N - 1; i++) {
    trail(l, i);
    line(l, rgba(AQUA, 0.22), 1.4);
  }
}

export function fin(b, l) {
  web(b);
  scars(b);
  rays(b, l);
  arm(b);
  knuckle(b, l);
  b.save(); // the shoulder melts into the flank
  b.globalCompositeOperation = 'destination-out';
  b.fillStyle = lin(b, 30, 0, 58, 0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]);
  b.fillRect(30, -30, 40, 90);
  b.restore();
}
