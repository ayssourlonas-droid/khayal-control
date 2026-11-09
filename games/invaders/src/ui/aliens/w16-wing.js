// World 16, Glass Cathedral, a wing of leaded glass (the swallow's in w16-2.js, the reliquary's in w16-5.js): a
// wing is two edges, a leading and a trailing one, each a polyline of the same length, and the glass between
// them is cut into a lattice: `rows` bands along the wing, `cols` panes down its length, each pane its own
// jewel (colour(i, j) picks it), a lead came round every pane and a heavier one round the whole wing. A pale
// line of dawn light runs along the leading edge. The lights get every pane at strength lit.
import { pane, poly, came, path, line, circle, lerp2, rgba, DAWN } from './w16-kit.js';

// The wing between edges le and te (arrays of [x, y], the same length, a multiple of cols plus one); stud, if given,
// is the colour of a small rivet set on the leading edge at every cross-came.
export function lattice(b, l, le, te, rows, cols, colour, lit = 0.14, stud = null) {
  const step = (le.length - 1) / cols;
  const lines = Array.from({ length: rows + 1 }, (_, j) => le.map((p, i) => lerp2(p, te[i], j / rows)));
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = i * step;
      const pts = [...lines[j].slice(a, a + step + 1), ...lines[j + 1].slice(a, a + step + 1).reverse()];
      const [xs, ys] = [pts.map((p) => p[0]), pts.map((p) => p[1])];
      const r = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2;
      pane(b, l, poly(pts), colour(i, j), [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, r], lit, 1.3);
    }
  }
  path(b, [...le, ...te.toReversed()]);
  came(b, 2.8);
  path(b, le, true);
  line(b, rgba(DAWN, 0.5), 0.9);
  if (!stud) return;
  for (let i = 0; i <= cols; i++) {
    const [x, y] = le[i * step];
    circle(b, x, y, 1.2);
    b.fillStyle = stud;
    b.fill();
  }
}
