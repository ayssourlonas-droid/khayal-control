// The jagged arc every electrical thing of Anvil Sky (world 18) is drawn with: the side guns' bolts (shots-storm.js), the coils'
// small arcs on the ship (ship-storm.js), the electric bursts of the fx (arc-fx-view.js) and the Tesla ring of the pickup's rim
// (pickup-storm.js). One path, thrown off its straight line by a hash of the seed, so the same seed is always the same bolt and
// nothing needs dice; a new seed (a time step, a slot) is a new bolt.
import { hash } from './sprites.js';

export const STORM_WORLD = 18;

// Add to the current path a line from (x0, y0) to (x1, y1) in n segments, each point between the ends thrown sideways by up to
// `jit` px (the same for the same seed). The caller strokes it; nothing is allocated.
export function arcPath(g, x0, y0, x1, y1, n, jit, seed) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const [nx, ny] = [-dy / len, dx / len];
  g.moveTo(x0, y0);
  for (let k = 1; k < n; k++) {
    const u = k / n;
    const j = (hash(seed * 31 + k * 7) - 0.5) * 2 * jit;
    g.lineTo(x0 + dx * u + nx * j, y0 + dy * u + ny * j);
  }
  g.lineTo(x1, y1);
}

// Stroke the path just built as a bolt: a wide soft halo, the colour, then a white-hot thread, all round-capped.
export function strokeBolt(g, color, halo, core, w = 1) {
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = halo;
  g.lineWidth = 7 * w;
  g.stroke();
  g.strokeStyle = color;
  g.lineWidth = 3.2 * w;
  g.stroke();
  g.strokeStyle = core;
  g.lineWidth = 1.3 * w;
  g.stroke();
}
