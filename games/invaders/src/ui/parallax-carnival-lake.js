// The lake under Ember Carnival's far shore: dark water that picks up the sky's rose at the waterline and
// deepens to indigo, and the reflections of everything that burns on the shore, each a column of short
// dashes that thin and shorten with depth, wavering. Lights flicker in it where the big ones stand (the
// bursts' own reflections are live, in flourish-10.js). See parallax-shapes.js for the painter contract.
import { rgba, lin } from './sprites.js';
import { SHORE, MAGENTA } from './parallax-carnival-kit.js';

// `spots` is [[x, colour, strength]] for every light worth a reflection on the shore.
export function lake(g, w, h, rng, out, spots) {
  g.fillStyle = lin(g, 0, SHORE, 0, h, [[0, '#2e1668'], [0.3, '#1c0e4c'], [1, '#0a0530']]);
  g.fillRect(0, SHORE, w, h - SHORE);
  g.fillStyle = lin(g, 0, SHORE, 0, SHORE + 110, [[0, rgba(MAGENTA, 0.24)], [1, rgba(MAGENTA, 0)]]); // the sky's rose lying on the water
  g.fillRect(0, SHORE, w, 110);
  g.fillStyle = rgba('#ffc0e0', 0.35);
  g.fillRect(0, SHORE, w, 1.5);
  for (const [x, color, a] of spots) {
    for (let k = 0; k < 9; k++) {
      const wd = (26 - k * 2.2) * (0.6 + rng() * 0.8);
      g.fillStyle = rgba(color, a * (0.62 - k * 0.06));
      g.fillRect(x + (rng() - 0.5) * (6 + k * 3) - wd / 2, SHORE + 7 + k * 15 + rng() * 6, wd, 2.2);
    }
  }
  for (const [x, color] of spots.filter((_, i) => i % 5 === 0)) out.lights.push({ x, y: SHORE + 36, r: 54, color, mode: 'flicker', ph: rng(), a: 0.3 });
}
