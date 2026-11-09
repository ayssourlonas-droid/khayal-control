// Things that stand on the roofs and in the streets of World 17's mid layer: the classic rooftop water tower (a wooden tank of
// staves bound with iron hoops under a conical lid, on a steel stilt frame with cross bracing, a ladder and a catwalk),
// and the empty billboard on its gantry (a steel frame on legs with a catwalk, lamp arms and a plain panel: in the
// smog a faded, stained, peeling one, in the morning a pale one with two quiet stripes; nothing is lettered or pictured).
// Each stands on `base` (the roof) at x; the palette gives every colour, so one drawing serves both modes. Dead and still:
// no smoke, no light.
import { box, poly, fade, strokes } from './parallax-smog-kit.js';
import { rgba } from './sprites.js';

export function waterTower(g, P, x, base, s = 1) {
  const [tw, th, lh, leg] = [46 * s, 52 * s, 26 * s, 44 * s];
  const [tb, tt] = [base - leg, base - leg - th];
  const frame = [[x - tw * 0.46, tb, x - tw * 0.62, base], [x + tw * 0.46, tb, x + tw * 0.62, base], [x, tb, x, base]];
  frame.push([x - tw * 0.52, tb + leg * 0.2, x + tw * 0.52, tb + leg * 0.72], [x + tw * 0.52, tb + leg * 0.2, x - tw * 0.52, tb + leg * 0.72]);
  for (const k of [0.3, 0.68]) frame.push([x - tw * (0.46 + 0.16 * k), tb + leg * k, x + tw * (0.46 + 0.16 * k), tb + leg * k]);
  strokes(g, P.iron, 2.2 * s, frame.slice(0, 3));
  strokes(g, P.iron, 1.2 * s, frame.slice(3));
  strokes(g, rgba(P.edge, P.edgeA * 0.8), 0.9, [[x + tw * 0.46 + 1, tb, x + tw * 0.62 + 1, base]]);
  const lad = x + tw * 0.74; // ladder
  strokes(g, P.iron, 1, [[lad, base, lad, tb + 4], [lad + 5, base, lad + 5, tb + 4]]);
  const rungs = [];
  for (let y = base - 4; y > tb + 6; y -= 5) rungs.push([lad, y, lad + 5, y]);
  strokes(g, P.iron, 0.8, rungs);
  box(g, P.iron, x - tw * 0.62, tb, tw * 1.24, 3 * s); // catwalk
  box(g, P.dust, x - tw * 0.62, tb - 0.6, tw * 1.24, 1, P.dustA);
  g.beginPath(); // the tank, slightly barrelled
  g.moveTo(x - tw / 2, tt);
  g.quadraticCurveTo(x - tw / 2 - 3 * s, (tt + tb) / 2, x - tw / 2, tb);
  g.lineTo(x + tw / 2, tb);
  g.quadraticCurveTo(x + tw / 2 + 3 * s, (tt + tb) / 2, x + tw / 2, tt);
  g.closePath();
  g.fillStyle = P.wood;
  g.fill();
  g.save();
  g.clip();
  fade(g, x - tw / 2 - 4, tt, tw + 8, th, [[0, rgba(P.shade, 0.5)], [0.55, rgba(P.shade, 0)], [0.9, rgba(P.edge, P.edgeA * 0.5)], [1, rgba(P.edge, P.edgeA * 0.8)]], true);
  const staves = [];
  for (let sx = x - tw / 2 + 4 * s; sx < x + tw / 2; sx += 4.4 * s) staves.push([sx, tt, sx, tb]);
  strokes(g, rgba(P.shade, 0.3), 0.8, staves);
  fade(g, x - tw / 2 - 4, tb - 12 * s, tw + 8, 12 * s, [[0, rgba(P.shade, 0)], [1, rgba(P.shade, 0.5)]]);
  g.restore();
  for (const k of [0.1, 0.48, 0.86]) { // iron hoops
    box(g, P.hoop, x - tw / 2 - 3.4 * s * Math.sin(k * 3.1), tt + th * k, tw + 6.8 * s * Math.sin(k * 3.1), 2.8 * s);
    box(g, P.edge, x - tw / 2, tt + th * k, tw, 0.8, P.edgeA * 0.6);
  }
  poly(g, [[x - tw / 2 - 3 * s, tt + 1], [x, tt - lh], [x + tw / 2 + 3 * s, tt + 1]]); // the lid
  g.fillStyle = P.roof;
  g.fill();
  poly(g, [[x, tt - lh], [x + tw / 2 + 3 * s, tt + 1], [x + 3 * s, tt + 1]]);
  g.fillStyle = rgba(P.edge, P.edgeA * 0.45);
  g.fill();
  for (let i = 1; i < 5; i++) strokes(g, rgba(P.shade, 0.35), 0.8, [[x - tw / 2 - 3 * s + i * 4, tt + 1 - i * 0.6, x + tw / 2 + 3 * s - i * 4, tt + 1 - i * 0.6]]);
  box(g, P.dust, x - tw / 2 - 3 * s, tt, tw + 6 * s, 1.2, P.dustA);
  strokes(g, P.iron, 1.2, [[x, tt - lh, x, tt - lh - 7 * s]]);
  g.beginPath();
  g.arc(x, tt - lh - 8 * s, 2 * s, 0, 6.3);
  g.fillStyle = P.hoop;
  g.fill();
  strokes(g, P.iron, 1.4 * s, [[x - 4, tb + 3, x - 4, base]]); // the feed pipe
  return tt - lh - 10 * s;
}

// An empty billboard on a gantry: `base` is the roof it stands on, the panel w x h with its foot `up` above it.
export function billboard(g, P, x, base, w = 190, h = 74, up = 40) {
  const [yb, yt] = [base - up, base - up - h];
  const legs = [x + 12, x + w * 0.5, x + w - 14];
  strokes(g, P.iron, 3, legs.map((lx) => [lx, yb, lx, base]));
  strokes(g, P.iron, 1.2, [[legs[0], yb + 6, legs[1], base], [legs[1], yb + 6, legs[0], base], [legs[1], yb + 6, legs[2], base], [legs[2], yb + 6, legs[1], base]]);
  box(g, P.iron, x - 8, yb, w + 16, 4); // catwalk
  box(g, P.dust, x - 8, yb - 0.6, w + 16, 1.2, P.dustA);
  const rail = [[x - 8, yb - 12, x + w + 8, yb - 12]];
  for (let rx = x - 8; rx <= x + w + 8; rx += 8) rail.push([rx, yb - 12, rx, yb]);
  strokes(g, P.iron, 0.9, rail);
  box(g, P.iron, x - 3, yt - 3, w + 6, h + 6); // frame
  box(g, P.panel, x, yt, w, h);
  fade(g, x, yt, w, h, [[0, rgba(P.panelB, 0.16)], [0.6, rgba(P.panelB, 0.05)], [1, rgba(P.shade, 0.32)]]);
  box(g, P.panelB, x, yt + h * 0.42, w, h * 0.1, 0.3); // two quiet stripes
  box(g, P.panelB, x, yt + h * 0.6, w, h * 0.05, 0.22);
  const seams = []; // the pasted sheets, in two rows, their joints not in line
  for (let k = 1; k < 4; k++) seams.push([x + (w * k) / 4 - 7, yt, x + (w * k) / 4 - 7, yt + h * 0.5], [x + (w * k) / 4 + 6, yt + h * 0.5, x + (w * k) / 4 + 6, yt + h]);
  seams.push([x, yt + h * 0.5, x + w, yt + h * 0.5]);
  strokes(g, rgba(P.shade, 0.34), 1, seams);
  strokes(g, rgba(P.edge, P.edgeA * 0.4), 0.8, seams.map(([a, b, c, d]) => [a + 1, b + 1, c + 1, d + 1]));
  for (let k = 0; k < 7; k++) fade(g, x + 8 + k * (w / 7.4), yt, 3 + (k % 3) * 2, h * (0.4 + (k % 4) * 0.15), [[0, rgba(P.soot, P.sootA)], [1, rgba(P.soot, 0)]]);
  poly(g, [[x + w - 34, yt], [x + w, yt], [x + w, yt + 28]]); // the torn corner, peeling away
  g.fillStyle = rgba(P.shade, 0.5);
  g.fill();
  poly(g, [[x + w - 34, yt], [x + w - 4, yt + 24], [x + w - 12, yt + 36], [x + w - 40, yt + 8]]);
  g.fillStyle = rgba(P.panel, 0.9);
  g.fill();
  strokes(g, rgba(P.edge, P.edgeA), 1, [[x + w + 2, yt - 3, x + w + 2, yb], [x, yt - 3, x + w, yt - 3]]);
  for (const lx of [x + w * 0.2, x + w * 0.5, x + w * 0.8]) { // dead lamp arms
    strokes(g, P.iron, 1.4, [[lx, yt - 3, lx, yt - 11], [lx, yt - 11, lx + 7, yt - 8]]);
    box(g, P.iron, lx + 5, yt - 9, 8, 3);
  }
}
