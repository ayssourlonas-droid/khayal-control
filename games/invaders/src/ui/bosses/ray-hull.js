// The Squall Ray's hull (World 18, Anvil Sky; see ray.js): the body of cloud (ray-mass.js: wings, torso and lobes, painted on a canvas of its own, with the
// parts' seats (ray-seat.js), and hardened at the edge, so that its edge can be read back for the lights) and everything that sits on it which is not a part
// (the studs and bands of the trim, the lit points of the wing tips, the eyes, and, over the faded top, the tail). The body layer has the cloud over a dark halo of its own shadow (ray-glow.js), which parts it from the slate sky
// behind. The lights layer is the cloud lit from within (ray-glow.js: the rim of cold light along every edge and a halo, pockets of violet and cyan held inside the
// cloud; ray-vein.js: veins of lightning through the wings, rain). The parts (the spine, the wing armour, the heart, the coils, the maw) are painted over this by
// the boss cache; the phases' own lights are ray-rage.js. Boss coordinates. Nothing is drawn above y -158, the HUD's edge, and both layers fade out over the 26 px
// under it (feather) instead of being cut.
import { makeCanvas } from '../sprites.js';
import { TOP, feather } from './ray-kit.js';
import { cloud, crisp } from './ray-mass.js';
import { seats } from './ray-seat.js';
import { shadow, rims, pockets } from './ray-glow.js';
import { veins, rain } from './ray-vein.js';
import { tips } from './ray-tip.js';
import { eyes } from './ray-eye.js';
import { trim } from './ray-trim.js';
import { tail } from './ray-tail.js';

export function hull(b, l, S) {
  const c = makeCanvas(S.W, S.H);
  const g = c.getContext('2d');
  g.translate(S.W / 2, S.H / 2);
  cloud(g);
  seats(g);
  const k = crisp(c);
  const top = TOP + S.H / 2; // the canvas row of the HUD's line
  b.save();
  l.save();
  b.drawImage(shadow(k), 0, top, S.W, S.H - top, -S.W / 2, TOP, S.W, S.H - top);
  b.drawImage(k, 0, top, S.W, S.H - top, -S.W / 2, TOP, S.W, S.H - top);
  trim(b, l);
  tips(b, l);
  eyes(b, l);
  rims(l, k);
  pockets(l, k);
  veins(l);
  rain(l);
  feather(b, S.W);
  feather(l, S.W);
  tail(b, l); // after the fade: it is iron, and stays under the HUD's line by itself
  b.restore();
  l.restore();
}
