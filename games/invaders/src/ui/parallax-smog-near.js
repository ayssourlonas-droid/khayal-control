// World 17's near layer, the street in front of the player's zone (2240 x 320, its top at screen y 760, speed 0.55): a park behind
// iron railings on a stone plinth (bare earth with dry tufts, a path of flags through the gate), pavement in slabs with cracks and
// ash drifts, a bench, bollards,
// a lamp-post stump, a litter bin, a sapling in its tree pit, the kerb, a gutter full of cigarette stubs and litter with its drain
// grates, the road with puddles and a manhole. Painter smogstreet(g, w, h, rng, L, out, mode): 'smog' is dark and
// grimy; 'clean' the same street washed (a clear gutter, wet paving catching the sky); 'over' is what grows back (lawn,
// beds, grass in the cracks, ivy, a sapling in leaf; parallax-smog-near-green.js). The shapes are one set (the plan,
// parallax-smog-near-plan.js; every element's own rng) so the passes agree; `rng` is not used (the street that heals is the same
// street at every level). Dark and calm: nothing small and bright, and no lights.
import { seeded } from './parallax-smog-kit.js';
import { nearPal } from './parallax-smog-pal.js';
import { Y } from './parallax-smog-near-plan.js';
import { earth, fence } from './parallax-smog-near-fence.js';
import { slabs, street, ash, gatePath } from './parallax-smog-near-ground.js';
import { props } from './parallax-smog-near-props.js';
import { nearGreen } from './parallax-smog-near-green.js';

export function smogstreet(g, w, h, rng, L, out, mode = 'smog') {
  const P = nearPal(mode);
  if (mode === 'over') return nearGreen(g, P, w);
  const r = seeded(31);
  g.save();
  earth(g, P, r, w);
  gatePath(g, P);
  fence(g, P, seeded(1));
  slabs(g, P, r, w);
  street(g, P, r, w, h);
  for (let x = r() * 80; x < w; x += 70 + r() * 90) ash(g, P, x, Y.pave + 2, 34 + r() * 40, 7); // drifts at the foot of the plinth and the kerb
  for (let x = r() * 80; x < w; x += 60 + r() * 100) ash(g, P, x, Y.kerb - 1, 40 + r() * 50, 5);
  props(g, P, r);
  g.restore();
}
