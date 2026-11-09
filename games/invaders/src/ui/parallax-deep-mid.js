// The mid layer of Lantern Deep: the kelp wood on the sea bed. Forests of kelp stand between coral arches and
// the chimneys of drowned towers, a big wooden wreck lists on the slope with a few portholes still lit,
// stacks of rock stand furred with weed, and sea fans glow among them, with sparks of small living things.
// The dark bases of everything are baked here; the hero strands of kelp are only marked (signs) and swayed
// in flourish-deep-sway.js, the rest of the kelp is thin dark ribbons standing back. The pieces are in
// parallax-deep-mid-kelp.js, -ruins.js, -ship.js and -growth.js, their helpers in parallax-deep-kit-2.js. L.lamp
// is the portholes' colour, L.kelp the weed's. The far layer is parallax-deep.js, which registers this one.
// See parallax-shapes.js for the painter contract.
import { rgba, lin } from './sprites.js';
import { profile, waves } from './parallax-kit.js';
import { backKelp, stand } from './parallax-deep-mid-kelp.js';
import { arch, chimney, rubble } from './parallax-deep-mid-ruins.js';
import { wreck, silt } from './parallax-deep-mid-ship.js';
import { stack, bedlife } from './parallax-deep-mid-growth.js';

const BED = 0.8; // the sea bed's mean height in the layer, of its height

function kelpwood(g, w, h, rng, L, out) {
  const wave = waves(rng, 3, 0.0042);
  const floor = (x) => h * BED + 13 * wave(x);
  g.fillStyle = L.color;
  for (const [x, n, spread, tall] of [[230, 26, 420, 220], [1010, 32, 480, 230], [1930, 28, 420, 220], [660, 9, 200, 140], [1500, 7, 240, 120]]) backKelp(g, rng, L, x, floor, n, spread, tall);
  g.fillStyle = L.color;
  chimney(g, out, rng, L, 900, floor(900), 54, 250, -0.045);
  chimney(g, out, rng, L, 2115, floor(2115), 46, 190, 0.07);
  arch(g, out, rng, L, 650, floor(650), 230, 215);
  arch(g, out, rng, L, 1990, floor(1990), 150, 150);
  stack(g, out, rng, L, 1210, floor, 58, 84);
  stack(g, out, rng, L, 150, floor, 70, 100);
  wreck(g, out, rng, L, 1500, floor(1500), 1.05);
  silt(g, rng, L, 1500, floor(1500), 1.05);
  const [lo, hi] = [h * BED - 12, h * BED + 32]; // the bed itself, its top edge faded in so the teal rim leaves no line across the ship's path
  g.fillStyle = lin(g, 0, lo, 0, hi, [[0, rgba(L.color, 0)], [1, L.color]]);
  profile(g, w, h, floor);
  g.fillStyle = L.color;
  g.fillRect(0, hi, w, h - hi);
  for (const x of [900, 650, 1990, 2115]) rubble(g, rng, L, x, floor(x), 150);
  bedlife(g, out, rng, L, floor, [360, 560, 920, 1120, 1760, 1990]);
  stand(g, out, rng, L, 230, floor, 4, 270);
  stand(g, out, rng, L, 1010, floor, 4, 310);
  stand(g, out, rng, L, 1185, floor, 2, 80);
  stand(g, out, rng, L, 1930, floor, 4, 270);
  g.fillStyle = L.color;
}

export const MID = { kelpwood };
