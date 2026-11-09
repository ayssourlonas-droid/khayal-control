// The ground of World 17's near layer, the street in front of the player's zone: a park's earth behind the railings, the
// pavement in slabs (rows narrowing toward the back, every slab a touch lighter or darker, joints, cracks, ash drifts at the
// foot of things), the kerb (a lit top, a face of stone blocks, chips), the gutter with its drain grates and the
// litter in it (tiny dull stubs of cigarettes, crumpled paper, a crushed plain box: only in the smog, `litterA`; in the morning the
// gutter is clear), and the road with its puddles (a dull sheen in the smog, the sky in the morning) and a manhole. All
// low in contrast and dark: enemy bullets are read against this layer. The palette (parallax-smog-pal.js) gives the colours;
// every random choice is made the same way in every mode (`litterA` and `ashA` only fade what is drawn).
import { box, poly, fade, speckle, strokes, seeded } from './parallax-smog-kit.js';
import { rgba, mix, rad } from './sprites.js';
import { Y, DRAINS, PUDDLES, MANHOLE, GATE } from './parallax-smog-near-plan.js';

// The cracks of the paving, as polylines of [x, y] (fixed: the 'over' pass grows grass along them).
function makeCracks(w) {
  const r = seeded(5);
  return Array.from({ length: 16 }, () => {
    let [x, y] = [r() * w, Y.pave + 6 + r() * (Y.kerb - Y.pave - 12)];
    const pts = [[x, y]];
    for (let k = 0; k < 5; k++) {
      x += (r() - 0.3) * 20;
      y += (r() - 0.5) * 7;
      pts.push([x, Math.min(Y.kerb - 2, Math.max(Y.pave + 2, y))]);
    }
    return pts;
  });
}
export const CRACKS = makeCracks(2240);

export function slabs(g, P, r, w) {
  box(g, P.paving, 0, Y.pave, w, Y.kerb - Y.pave);
  const rows = 6;
  for (let k = 0; k < rows; k++) {
    const y0 = Y.pave + (Y.kerb - Y.pave) * (k / rows) ** 1.25;
    const y1 = Y.pave + (Y.kerb - Y.pave) * ((k + 1) / rows) ** 1.25;
    const sw = 44 + k * 14;
    for (let x = -((k * 23) % sw); x < w; x += sw) {
      const c = r() < 0.5 ? P.paving2 : P.paving;
      box(g, mix(c, r() < 0.5 ? '#000000' : '#ffffff', 0.02 + r() * 0.05), x, y0, sw, y1 - y0);
      box(g, P.joint, x, y0, 1.2, y1 - y0, 0.55);
    }
    box(g, P.joint, 0, y0, w, 1.4, 0.6);
    box(g, P.edge, 0, y0 + 1.4, w, 0.9, P.edgeA * 0.22);
  }
  speckle(g, r, 0, Y.pave, w, Y.kerb - Y.pave, 700, [P.joint, P.edge, P.paving2], 0.18, 1.8);
  for (let i = 0; i < 14; i++) { // wet flags catching the sky (a dull sheen in the smog)
    const [sx, sy, sw] = [r() * w, Y.pave + 8 + r() * (Y.kerb - Y.pave - 16), 90 + r() * 140];
    fade(g, sx, sy, sw, 4, [[0, rgba(P.puddleHi, 0)], [0.5, rgba(P.puddleHi, P.sheenA)], [1, rgba(P.puddleHi, 0)]], true);
  }
  for (const pts of CRACKS) strokes(g, rgba(P.crack, 0.8), 1.1, pts.slice(1).map(([px, py], j) => [pts[j][0], pts[j][1], px, py]));
}

// The path of flags that leads through the gate into the park: a trapezoid narrowing away from the pavement, joints across it.
export function gatePath(g, P) {
  const [a, b, top] = [GATE.x0 + 4, GATE.x1 - 4, Y.soil + 22];
  poly(g, [[a - 6, Y.pave + 1], [a + 14, top], [b - 14, top], [b + 6, Y.pave + 1]]);
  g.fillStyle = mix(P.paving, '#ffffff', 0.1);
  g.fill();
  for (let k = 1; k < 5; k++) {
    const y = top + (Y.pave - top) * (k / 5) ** 1.3;
    const inset = 14 * (1 - (y - top) / (Y.pave - top)) + 1;
    box(g, P.joint, a - 6 + inset, y, b - a + 12 - inset * 2, 1.2, 0.6);
  }
  box(g, P.edge, a + 14, top, b - a - 28, 1, P.edgeA * 0.3);
}

function litter(g, P, r, x0, x1, y0, y1, n) {
  for (let i = 0; i < n; i++) {
    const near = r() < 0.5 ? DRAINS[Math.floor(r() * DRAINS.length)] + 22 + (r() + r() - 1) * 120 : x0 + r() * (x1 - x0); // litter gathers at the drains
    const [x, y, a, k] = [Math.min(x1, Math.max(x0, near)), y0 + r() * (y1 - y0), r() * 3.1, r()];
    g.save();
    g.translate(x, y);
    g.rotate(a);
    if (k < 0.58) { // a stub: a pale tube with a brown filter end
      box(g, P.butt, 0, 0, 5.5 + r() * 2, 2.1, P.litterA * 0.8);
      box(g, P.buttTip, 0, 0, 2.2, 2.1, P.litterA * 0.9);
    } else if (k < 0.74) { // a longer, thicker one with a dark burnt end
      box(g, P.butt, 0, 0, 9.5 + r() * 2.5, 3.1, P.litterA * 0.85);
      box(g, P.buttTip, 0, 0, 3.4, 3.1, P.litterA * 0.95);
      box(g, P.joint, 9.5, 0, 2.6, 3.1, P.litterA * 0.8);
    } else if (k < 0.9) { // a crumpled twist of paper
      poly(g, [[0, 0], [3, -2.4], [6.4, -0.6], [5.6, 2.6], [1.6, 3]]);
      g.fillStyle = rgba(P.paper, P.litterA * 0.55);
      g.fill();
    } else { // a crushed plain box
      box(g, P.paper, 0, 0, 9, 5.4, P.litterA * 0.6);
      box(g, P.joint, 4, 0, 1, 5.4, P.litterA * 0.5);
    }
    g.restore();
  }
}

export function ash(g, P, x, y, w, h) {
  g.save();
  g.translate(x, y);
  g.scale(1, h / w);
  g.fillStyle = rad(g, 0, 0, 0, w, [[0, rgba(P.ash, P.ashA)], [0.6, rgba(P.ash, P.ashA * 0.5)], [1, rgba(P.ash, 0)]]);
  g.beginPath();
  g.arc(0, 0, w, 0, 6.3);
  g.fill();
  g.restore();
}

export function street(g, P, r, w, h) {
  box(g, P.kerbTop, 0, Y.kerb, w, 6); // the kerb: a lit top and a face of blocks
  box(g, P.edge, 0, Y.kerb, w, 1.2, P.edgeA * 0.6);
  box(g, P.kerbFace, 0, Y.kerb + 6, w, Y.gutter - Y.kerb - 6);
  for (let x = r() * 40; x < w; x += 54 + r() * 40) box(g, P.joint, x, Y.kerb + 6, 1.2, Y.gutter - Y.kerb - 6, 0.7);
  speckle(g, r, 0, Y.kerb, w, Y.gutter - Y.kerb, 120, [P.joint, P.edge], 0.2, 2);
  fade(g, 0, Y.gutter, w, Y.road - Y.gutter, [[0, P.gutter], [1, mix(P.gutter, P.road, 0.7)]]);
  box(g, P.road, 0, Y.road, w, h - Y.road);
  speckle(g, r, 0, Y.road, w, h - Y.road, 520, [P.joint, P.edge, P.kerbFace], 0.18, 1.8);
  for (const x of DRAINS) { // drain grates in the gutter
    box(g, P.drain, x, Y.gutter + 1, 44, 11);
    const bars = [];
    for (let bx = x + 4; bx < x + 44; bx += 6) bars.push([bx, Y.gutter + 1, bx, Y.gutter + 12]);
    strokes(g, P.kerbFace, 1.6, bars);
    box(g, P.edge, x, Y.gutter + 1, 44, 1, P.edgeA * 0.4);
  }
  for (const [x, y, hw] of PUDDLES) {
    g.beginPath();
    g.ellipse(x, y, hw, hw * 0.1, 0, 0, 6.3);
    g.fillStyle = rgba(P.puddle, 0.58);
    g.fill();
    g.beginPath();
    g.ellipse(x + hw * 0.12, y - hw * 0.025, hw * 0.74, hw * 0.045, 0, 0, 6.3);
    g.fillStyle = rgba(P.puddleHi, 0.32);
    g.fill();
  }
  const m = MANHOLE;
  g.save();
  g.beginPath();
  g.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, 6.3);
  g.fillStyle = P.drain;
  g.fill();
  g.strokeStyle = rgba(P.kerbFace, 0.9);
  g.lineWidth = 1.4;
  for (const k of [1, 0.66, 0.34]) {
    g.beginPath();
    g.ellipse(m.x, m.y, m.rx * k, m.ry * k, 0, 0, 6.3);
    g.stroke();
  }
  g.restore();
  litter(g, P, r, 0, w, Y.gutter + 1, Y.road - 1, 84);
  litter(g, P, r, 0, w, Y.kerb - 14, Y.kerb - 2, 36);
  litter(g, P, r, 0, w, Y.road + 2, Y.road + 18, 14);
}
