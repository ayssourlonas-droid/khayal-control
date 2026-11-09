// The tops of World 17's older blocks (parallax-smog-mid-house.js): the silhouette of each roof type (a flat parapet with a
// cornice, a gable end with bargeboards and an attic window, a crow-stepped gable, a mansard with dormers) and what stands on
// it: chimney stacks with clay pots (dead: no smoke, and a dust of ash on the ledges), a TV aerial, a dish. `outline` adds
// a block's whole silhouette to the path and `roofY` says where the roof stands at an x, so a chimney or an aerial can be set on
// it. Deterministic from the block's own rng; the colours are the palette's alone.
import { box, poly, strokes, fade } from './parallax-smog-kit.js';
import { rgba } from './sprites.js';
import { sash, GLASS } from './parallax-smog-mid-window.js';

const RISE = 0.34; // a gable's rise, of the block's width
const MANSARD = 30; // the height of a mansard roof

export function outline(g, b, yb) {
  const [x0, x1, y0, xm] = [b.x, b.x + b.w, b.top, b.x + b.w / 2];
  if (b.roof === 'gable') return poly(g, [[x0, yb], [x0, y0], [xm, y0 - b.w * RISE], [x1, y0], [x1, yb]]);
  if (b.roof === 'step') {
    const pts = [[x0, yb], [x0, y0]];
    const n = 4;
    for (let i = 0; i < n; i++) pts.push([x0 + (b.w / 2) * (i / n), y0 - i * 9 - 9], [x0 + (b.w / 2) * ((i + 1) / n), y0 - i * 9 - 9]);
    for (let i = n - 1; i >= 0; i--) pts.push([x1 - (b.w / 2) * ((i + 1) / n), y0 - i * 9 - 9], [x1 - (b.w / 2) * (i / n), y0 - i * 9 - 9]);
    pts.push([x1, y0], [x1, yb]);
    return poly(g, pts);
  }
  if (b.roof === 'mansard') return poly(g, [[x0, yb], [x0, y0], [x0 + 9, y0 - MANSARD], [x1 - 9, y0 - MANSARD], [x1, y0], [x1, yb]]);
  return poly(g, [[x0, yb], [x0, y0 - 2], [x1, y0 - 2], [x1, yb]]);
}

// Where the roof stands (y) at x.
export function roofY(b, x) {
  const u = Math.abs((x - (b.x + b.w / 2)) / (b.w / 2));
  if (b.roof === 'gable') return b.top - b.w * RISE * (1 - u);
  if (b.roof === 'step') return b.top - 9 - Math.min(3, Math.floor((1 - u) * 4)) * 9;
  return b.roof === 'mansard' ? b.top - MANSARD : b.top - 2;
}

// A chimney stack on the roof at x, h tall, in the wall's colour with a corbelled cap and two clay pots.
export function stack(g, P, wall, x, base, w, h, r) {
  const top = base - h;
  box(g, wall, x, top, w, h + 8);
  fade(g, x, top, w, h, [[0, rgba(P.edge, 0.12)], [1, rgba(P.shade, 0.35)]]);
  box(g, P.edge, x + w - 1.6, top, 1.6, h, P.edgeA * 0.8);
  box(g, P.trim, x - 2, top - 3, w + 4, 4);
  box(g, P.edge, x - 2, top - 3, w + 4, 1, P.edgeA * 0.8);
  box(g, P.dust, x - 2, top - 4, w + 4, 1.2, P.dustA);
  const pots = w > 15 ? 2 : 1;
  for (let i = 0; i < pots; i++) {
    const [px, ph] = [x + (w * (i + 0.5)) / pots - 2.6, 7 + Math.floor(r() * 5)];
    poly(g, [[px, top - 3], [px + 0.8, top - 3 - ph], [px + 4.4, top - 3 - ph], [px + 5.2, top - 3]]);
    g.fillStyle = P.roof;
    g.fill();
    box(g, P.edge, px + 4, top - 3 - ph, 0.9, ph, P.edgeA * 0.6);
    box(g, P.trim, px - 0.6, top - 4 - ph, 6.2, 1.8);
  }
}

// A cowl vent: a short pipe with a collar and a swan-neck cowl turned from the wind (dead: nothing comes out of it).
export function vent(g, P, x, base) {
  box(g, P.iron, x - 2.2, base - 14, 4.4, 15);
  box(g, P.trim, x - 4, base - 4, 8, 3);
  box(g, P.edge, x + 1.2, base - 14, 1, 14, P.edgeA * 0.7);
  g.save();
  g.strokeStyle = P.iron;
  g.lineWidth = 4;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x, base - 13);
  g.quadraticCurveTo(x, base - 24, x - 8, base - 21);
  g.stroke();
  g.restore();
  box(g, P.dust, x - 4, base - 15, 8, 1, P.dustA);
}

// A TV aerial: a mast with five crossbars shrinking toward the top and a guy line.
export function aerial(g, P, x, base, h) {
  const segs = [[x, base, x, base - h]];
  for (let i = 0; i < 5; i++) {
    const [y, hw] = [base - h + 4 + i * 5, 9 - i * 1.4];
    segs.push([x - hw, y, x + hw, y]);
  }
  segs.push([x, base - h * 0.55, x + 12, base]);
  strokes(g, P.iron, 1.1, segs);
  box(g, P.edge, x + 0.3, base - h, 0.8, h, P.edgeA * 0.5);
}

// A satellite dish on a short arm: an ellipse with a bright rim, an arm and a bracket.
export function dish(g, P, x, y, s = 1) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  strokes(g, P.iron, 1.2, [[0, 0, 0, 9], [0, 4, 5, 2]]);
  g.beginPath();
  g.ellipse(0, -3, 6, 7, -0.5, 0, 6.3);
  g.fillStyle = P.stone;
  g.fill();
  g.strokeStyle = rgba(P.edge, P.edgeA);
  g.lineWidth = 1;
  g.stroke();
  g.restore();
}

// The dressing of a roof type: cornice, bargeboards and attic window, step caps, or slates and dormers.
export function dress(g, P, b, wall, r) {
  const [x0, x1, y0, xm] = [b.x, b.x + b.w, b.top, b.x + b.w / 2];
  if (b.roof === 'flat') {
    box(g, P.trim, x0 - 3, y0 - 4, b.w + 6, 6);
    box(g, P.edge, x0 - 3, y0 - 4, b.w + 6, 1.2, P.edgeA * 0.8);
    box(g, P.dust, x0 - 3, y0 - 5, b.w + 6, 1.4, P.dustA);
    box(g, P.shade, x0 - 1, y0 + 2, b.w + 2, 4, 0.36);
    for (let x = x0 + 2; x < x1 - 3; x += 7) box(g, P.shade, x, y0 + 2.6, 3, 3, 0.3);
  } else if (b.roof === 'gable') {
    const apex = y0 - b.w * RISE;
    strokes(g, P.roof, 3.4, [[x0 - 2, y0 + 1, xm, apex - 1], [xm, apex - 1, x1 + 2, y0 + 1]]);
    strokes(g, rgba(P.edge, P.edgeA), 1, [[xm, apex - 2, x1 + 2, y0]]);
    strokes(g, rgba(P.dust, P.dustA), 1, [[x0 - 2, y0 - 1, xm, apex - 3]]);
    sash(g, P, xm - 5, y0 - b.w * RISE * 0.62, 10, 14, GLASS, r() < 0.2);
    box(g, P.roof, xm - 1.2, apex - 8, 2.4, 8);
  } else if (b.roof === 'step') {
    for (let i = 0; i < 4; i++) {
      const y = y0 - i * 9 - 9;
      for (const [xa, xb] of [[x0 + (b.w / 2) * (i / 4), x0 + (b.w / 2) * ((i + 1) / 4)], [x1 - (b.w / 2) * ((i + 1) / 4), x1 - (b.w / 2) * (i / 4)]]) {
        box(g, P.trim, xa - 1, y - 2.6, xb - xa + 2, 3.4);
        box(g, P.edge, xa - 1, y - 2.6, xb - xa + 2, 1, P.edgeA * 0.7);
      }
    }
    g.beginPath();
    g.arc(xm, y0 - 3 * 9 - 14, 3.4, 0, 6.3);
    g.fillStyle = P.trim;
    g.fill();
  } else {
    const [top, a] = [y0 - MANSARD, P.roof];
    fade(g, x0 + 9, top, b.w - 18, MANSARD, [[0, rgba(P.edge, 0.2)], [1, rgba(P.shade, 0.3)]]);
    for (let y = top + 4; y < y0; y += 4) box(g, a, x0 + 9 - (y - top) * 0.3, y, b.w - 18 + (y - top) * 0.6, 0.9, 0.5);
    box(g, P.trim, x0 + 9, top - 2, b.w - 18, 3);
    box(g, P.edge, x0 + 9, top - 2, b.w - 18, 1, P.edgeA * 0.8);
    box(g, P.trim, x0 - 3, y0, b.w + 6, 5);
    box(g, P.shade, x0 - 1, y0 + 5, b.w + 2, 3, 0.34);
    const n = Math.max(1, Math.floor(b.w / 50));
    for (let i = 0; i < n; i++) {
      const dx = x0 + ((i + 0.5) * b.w) / n - 7;
      poly(g, [[dx - 2, y0], [dx - 2, top + 12], [dx + 7, top + 3], [dx + 16, top + 12], [dx + 16, y0]]);
      g.fillStyle = wall;
      g.fill();
      sash(g, P, dx + 1, top + 12, 11, 14, GLASS, r() < 0.15);
    }
  }
}
