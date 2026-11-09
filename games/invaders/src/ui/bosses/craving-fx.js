// The Craving's live smoke and embers (World 17, Ash to Air; craving.js runs them): `behind` draws the churning body under the parts
// (own pass only; opaque), `fx` the embers and breath over them (additive), `warm` bakes every sprite and frame ahead of the fight.
//   behind: the smoke figure's frames (craving-frames.js) crossfaded at the churn's pose (craving-motion.js), over the hull's frozen
//     frame of the same figure; the second, fatter layer (craving-thick.js) fading in with the hover phase; in the last phase
//     the whole mass heaving by a few px. Two to five drawImage calls.
//   fx: the glow in the eyes, maw and tray, the maw's breath, embers rising and raining, wisps off the arms (craving-ember.js).
// A destroyed part leaves no glow. Nothing is drawn above y = -158. Only cached sprites are drawn.
import { clamp } from '../../core/math.js';
import { motion } from './craving-motion.js';
import { frame, POSES, warmFrames } from './craving-frames.js';
import { thickFrame, THICK_POSES, warmThick } from './craving-thick.js';
import { FB } from './craving-paint.js';
import { warmPuffs } from './craving-puff.js';
import { glows, breath, embers, rain, wisps, glints, warmEmbers } from './craving-ember.js';
import { plumes, warmPlumes } from './craving-plume.js';

const SHUDDER = 2.5; // px it shudders sideways at most
const HEAVE = 4; // px the mass heaves down at most (never up: the figure's box already reaches the HUD's edge)

// A cycle drawn as two frames: the one the pose is in at full strength, the next fading in over it.
function cycle(ctx, pick, n, churn, x, y, a) {
  const u = (churn - Math.floor(churn)) * n;
  const i = Math.floor(u);
  const f = u - i;
  ctx.globalAlpha = a;
  ctx.drawImage(pick(i % n), x, y);
  if (f > 0.004) {
    ctx.globalAlpha = a * f;
    ctx.drawImage(pick((i + 1) % n), x, y);
  }
}

export function behind(ctx, b, t) {
  const m = motion(b, t, clamp(b.phase, 0, 2));
  const y = FB.y + HEAVE * m.heave * (0.5 - 0.5 * Math.cos(m.beat));
  const x = FB.x + SHUDDER * m.heave * Math.sin(m.beat * 1.7 + 1); // and shudders sideways a little
  cycle(ctx, frame, POSES, m.churn, x, y, 1);
  if (m.thick > 0.01) cycle(ctx, thickFrame, THICK_POSES, m.churn * 0.7, x, y, m.thick);
  ctx.globalAlpha = 1;
}

export function fx(ctx, b, t, k, own) {
  const m = motion(b, t, clamp(b.phase, 0, 2));
  glows(ctx, b, m, t, k);
  breath(ctx, b, m, k);
  embers(ctx, b, m, t, k);
  glints(ctx, m, t, k);
  rain(ctx, m, k);
  wisps(ctx, b, m, k);
  if (own) {
    ctx.globalCompositeOperation = 'source-over'; // the dark ribbons are opaque: the boss's own pass only
    plumes(ctx, b, m, k);
    ctx.globalCompositeOperation = 'lighter';
  }
  ctx.globalAlpha = 1;
}

export function warm() {
  warmPuffs();
  warmFrames();
  warmThick();
  warmEmbers();
  warmPlumes();
}
