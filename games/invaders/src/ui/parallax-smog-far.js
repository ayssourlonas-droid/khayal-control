// The far layer of world 17, Ash to Air: a dense skyline seen across the smog (painter smogcity(g, w, h, rng, L, out, mode), 2240 x
// 700, its top at screen y 380, speed 0.06 so it barely shifts). Three tiers of buildings (parallax-smog-far-plan.js has every
// place) in the palette of the mode: glass slab towers, stepped art-deco towers, brick blocks, a TV mast whose red lamp blinks,
// a domed hall, a gasometer, a cooling-tower pair, two tower cranes, rooftop tanks. They stand on a terrace, and on it the
// stumps of the six giant cigarettes (parallax-smog-far-cig.js; the tall part is the flourish's) stand in two groups
// outside the middle of the frame. In 'smog' mode the city is a grimy amber-lit brown with a few sickly windows; in 'clean' mode
// the same silhouette is blue-grey with sun-struck glass; 'over' (parallax-smog-far-over.js) draws only what grows back. The
// plan and the seeds are fixed, so no rng is consumed in any mode: the twins share one silhouette to the call.
// heal-layers.js adds the generic haze and the lit top rim after this. Lights: windows (pulse, dim) and the mast's lamp (blink).
import { rgba, mix } from './sprites.js';
import { GROUND, palFor, fade } from './parallax-smog-far-kit.js';
import { PLAN, TIER_MIX } from './parallax-smog-far-plan.js';
import { slab, deco, block } from './parallax-smog-far-towers.js';
import { mast, crane } from './parallax-smog-far-works.js';
import { dome, gas, cool } from './parallax-smog-far-works-2.js';
import { CIGS, cigPal, stump } from './parallax-smog-far-cig.js';
import { overFar } from './parallax-smog-far-over.js';

export { GROUND, PLAN };
export { CIGS } from './parallax-smog-far-cig.js';
const LAST = [0, 1, 2].map((t) => PLAN.findLast((b) => b.t === t)); // each tier's last building: the veil goes over the whole tier
const KINDS = { slab, deco, block, mast, crane, dome, gas, cool };

// The smog between two tiers: a haze that is thin at the roofs and thick at the foot, over everything painted so far, so the
// far towers rise out of it and the nearer ones stand clearer.
function veil(g, P, w, a) {
  fade(g, 0, 140, w, GROUND - 140, [[0, rgba(P.haze, 0)], [0.55, rgba(P.haze, a * 0.4)], [1, rgba(P.haze, a)]]);
}

// The terrace: a stone embankment with its coping lit by the sun, piers and a dark foot, over what the towers stand on.
function terrace(g, P, w, h) {
  g.fillStyle = P.tones[0];
  g.fillRect(0, GROUND, w, h - GROUND);
  fade(g, 0, GROUND, w, h - GROUND, [[0, rgba(P.foot, 0.15)], [0.12, rgba(P.foot, 0.55)], [1, rgba(P.foot, 0.9)]]);
  g.fillStyle = rgba(P.top, P.edgeA * 0.5);
  g.fillRect(0, GROUND, w, 2);
  g.fillStyle = rgba(P.edge, P.edgeA * 0.16);
  for (let x = 40; x < w; x += 116) g.fillRect(x, GROUND + 6, 2.4, 90); // piers
}

export function smogcity(g, w, h, rng, L, out, mode = 'smog') { // takes no rng (the plan is fixed), so the twins cannot drift apart
  const P = palFor(mode);
  g.save();
  if (mode === 'over') {
    overFar(g, w, h);
    g.restore();
    return;
  }
  for (const b of PLAN) {
    const tone = mix(P.tones[b.s % P.tones.length], P.haze, TIER_MIX[b.t]);
    KINDS[b.k](g, P, out, { ...b, tone, far: b.t === 0 ? 1 : 0 });
    if (b === LAST[b.t] && P.veil[b.t]) veil(g, P, w, P.veil[b.t]); // the smog gathers between the tiers
  }
  terrace(g, P, w, h);
  const C = cigPal(mode);
  for (const c of CIGS) stump(g, C, c);
  g.restore();
}
