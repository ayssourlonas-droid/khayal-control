// Smoke streaming off the Craving (World 17, Ash to Air; craving-fx.js draws it over the parts, in the boss's own pass only: it is
// opaque): eight ribbons of pale ash-grey smoke peeling off the shoulders and the arms and the crown's ends, four a side, each rising and
// drifting up and outward along its own line and thinning out, the faster and the denser the more the smoke has thickened (hover, orbit).
// Pale, so that they read over the dark smoke of the arms and against the sky. None lies over a weak point (all are at x beyond +-140 and
// clear of the eyes). Stateless: a place comes from an index, the motion record's clock (craving-motion.js) and a fixed table; only
// cached sprites. Each ribbon is a sprite whose tilted box stays under y -158 along its run. A destroyed part sheds none.
import { puff } from './craving-puff.js';
import { alive } from './parts.js';
import { frac } from './craving-motion.js';
import { TAU } from '../../core/math.js';

// [x0, y0, x1, y1, size, phase, what it hangs on]: the line it rises along, for the left side; the right is its mirror.
const PLUMES = [
  [-306, 44, -338, -26, 144, 0.0, 'claw'], [-332, 14, -352, -58, 144, 0.5, 'claw'], [-282, 62, -318, 6, 144, 0.25, 'claw'], [-150, -102, -180, -120, 64, 0.75, 'crown'],
];
export function plumes(ctx, b, m, k) {
  for (let i = 0; i < 8; i++) {
    const p = PLUMES[i >> 1];
    const mirror = i & 1 ? -1 : 1;
    if (!alive(b, p[6] === 'crown' ? 'crown' : i & 1 ? 'clawR' : 'clawL')) continue;
    const u = frac(m.beat / TAU * (0.2 + 0.12 * m.thick) + p[5]);
    const sprite = puff('wispPale', p[4], i);
    ctx.save();
    ctx.translate((p[0] + (p[2] - p[0]) * u) * mirror, p[1] + (p[3] - p[1]) * u);
    ctx.scale(mirror, 1);
    ctx.rotate(Math.atan2(p[3] - p[1], p[2] - p[0])); // the ribbon's long axis lies along its line: up and away
    ctx.globalAlpha = k * (0.6 + 0.3 * m.thick) * Math.sin(Math.PI * u) ** 0.7;
    ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
    ctx.restore();
  }
}

export function warmPlumes() {
  for (let i = 0; i < 8; i++) puff('wispPale', PLUMES[i >> 1][4], i);
}
