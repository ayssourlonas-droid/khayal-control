// What the Glass Cathedral adds to the player's ship (ship-view.js draws it): the mirror twin, a glass copy of the
// fighter that flies where the core says it is (core/ship.js twinOf: the ship mirrored across the field's centre
// line, the same place its shots start from), for the power's 10 s. It is the ship's outline in see-through glass:
// pale blue-white panes with facets, a prismatic rim (a rainbow that runs across it), a bright jewel for a
// cockpit, a sheen of light that sweeps over it every couple of seconds, engine flames of ice and wing-tip glints
// in rose and ice. It banks the way a reflection would (against the ship's own roll) and fades in as the power
// starts and out as it ends, blinking in its last two seconds as the shield and the other twins of the armada
// and the deep do. `alpha` is the ship's own (it blinks while invulnerable) and goes down to EVERY part of the
// twin: halo, flames, body, sheen, glints, wing-tip lights. Its shots are shots-glass.js, its muzzle flash fx
// (fx/react-glass.js). Everything but the transform is a baked sprite: one body, a fringe and eight sheen frames (ship-glass-sprites.js).
import { glow, star, addGlow } from './sprites.js';
import { clamp } from '../core/math.js';
import { twinOf, SHIP_SPEED } from '../core/ship.js';
import { powerTime } from '../core/powerups.js';
import { ICE, PRISM } from './glass-kit.js';
import { K, BOX, FRAMES, body, fringe, sheen } from './ship-glass-sprites.js';

const COME = 0.35; // s the twin takes to fade in when the power starts, and out at its end

// Paint the body, the sheen and the glows now, so none is baked at the first pickup (warm-glass.js).
export function warmTwin() {
  body();
  fringe();
  for (let f = 0; f < FRAMES; f++) sheen(f);
  for (const c of ['#bfe8ff', '#ffffff', PRISM[0], ICE]) glow(c);
  star('#ffffff');
  star(PRISM[0]);
  star(PRISM[2]);
}

// How far the twin has come (0 when the power starts or ends, 1 in between) and its blink in the last 2 s.
export function appear(left, t) {
  const k = Math.min(clamp((powerTime('mirror') - left) / COME, 0, 1), clamp(left / COME, 0, 1));
  const eased = k * k * (3 - 2 * k);
  return left < 2 && Math.floor(t * 10) % 2 ? eased * 0.45 : eased;
}

// The twin: halo and flames under it, the body, the sheen and the glints over it, at the place twinOf gives.
export function drawTwin(ctx, s, look, t, alpha) {
  const [tw] = twinOf(s);
  if (!tw) return;
  const a = alpha * appear(s.power.left, t);
  if (a <= 0.01) return;
  const bank = clamp(-s.vx / SHIP_SPEED, -1, 1); // a reflection rolls against the ship
  const flame = 18 + Math.sin(t * 37 + 1.3) * 4;
  addGlow(ctx, glow('#bfe8ff'), tw.x, tw.y + 4, 62, 0.24 * a); // the halo, quieter than the ship's
  addGlow(ctx, glow(PRISM[0]), tw.x - 10, tw.y + 10, 34, 0.1 * a);
  for (const nx of [-9, 9]) {
    addGlow(ctx, glow('#bfe8ff'), tw.x + nx, tw.y + 36 + flame * 0.3, 11, 0.7 * a);
    addGlow(ctx, glow('#ffffff'), tw.x + nx, tw.y + 30 + flame * 0.15, 5, 0.6 * a);
  }
  ctx.save();
  ctx.translate(tw.x, tw.y);
  ctx.rotate(bank * 0.1);
  ctx.scale(1 - 0.14 * Math.abs(bank), 1);
  ctx.globalAlpha = a;
  ctx.drawImage(body(), -BOX.ox / K, -BOX.oy / K, BOX.w / K, BOX.h / K);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.9 * a;
  ctx.drawImage(fringe(), -BOX.ox / K, -BOX.oy / K, BOX.w / K, BOX.h / K);
  const u = (t * 0.5) % 1; // a sweep of light, then a rest
  if (u < 0.7) {
    ctx.globalAlpha = 0.85 * a;
    ctx.drawImage(sheen(Math.floor((u / 0.7) * FRAMES)), -BOX.ox / K, -BOX.oy / K, BOX.w / K, BOX.h / K);
  }
  ctx.restore();
  const tip = 0.6 + 0.4 * Math.sin(t * 5.3 + 2);
  addGlow(ctx, star(PRISM[0]), tw.x - 38 * (1 - 0.3 * Math.max(0, bank)), tw.y + 22, 10, tip * a); // rose to port, ice to starboard
  addGlow(ctx, star(PRISM[2]), tw.x + 38 * (1 - 0.3 * Math.max(0, -bank)), tw.y + 22, 10, (1.2 - tip) * a);
  addGlow(ctx, star('#ffffff'), tw.x, tw.y - 46, 12 + 3 * Math.sin(t * 3), (0.4 + 0.4 * Math.max(0, Math.sin(t * 2.2))) * a); // a glint on the nose
  ctx.globalAlpha = 1;
}
