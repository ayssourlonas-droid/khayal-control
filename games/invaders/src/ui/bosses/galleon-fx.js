// The Thunder Galleon's live extras (World 13, Sunset Armada; galleon.js runs them): the sails breathing and
// then drawn up (galleon-furl.js), the propellers turning in a haze of brass with a glint chasing round
// their tips and steam off the stacks, pennants rippling at the mast and the yardarms, lanterns swinging
// from the rail and the crow's nest, the captain moving in the bridge's window, the windows' light
// breathing, sunset gold on the canvas and twinkles along the rigging. The furnace, the flames and the
// cannon fire are galleon-fire.js. In boss coordinates; cached sprites only, nothing allocated per
// frame. Everything opaque is drawn only in the boss's own pass (`own`): the darkness pass runs again
// over the aliens. A destroyed part takes what hangs on it along: no blades, no pennant, no glow.
import { glow, soft, star } from '../sprites.js';
import { TAU } from './kit.js';
import { alive } from './parts.js';
import { FAN, FAN_R } from './galleon-prop.js';
import { NEST_LAMP } from './galleon-mast.js';
import { WINDOWS } from './galleon-bridge.js';
import { HANGERS } from './galleon-deck.js';
import { TIERS } from './galleon-rig.js';
import { BOXES } from './galleon-sails.js';
import { drawSails, furled } from './galleon-furl.js';
import { blades, sweep, pennant, lamp, captain, wheel } from './galleon-sprites.js';

const OMEGA = [5, 9, 13]; // rad/s the blades turn per phase
const STACK_X = -15; // the stack's mouth in a pod's frame (its top is at y -64)
const GLINTS = [[150, -142], [196, -92], [88, -125], [130, -109], [220, -52], [172, -52]];
const WARM = '#ffcf6a';
const side = (n) => (n ? -1 : 1); // pod n: 0 the left, as drawn; 1 the right, mirrored; the blades turn the way it faces

const sway = (t, i, ph) => 0.16 * (1 + 0.45 * ph) * Math.sin(t * 1.5 + i * 1.7);

// The haze, the blades and a ghost of them behind; steam, or smoke in the last phase, from the stack.
function props(ctx, b, t, ph) {
  for (let n = 0; n < 2; n++) {
    const dir = side(n);
    const p = alive(b, n ? 'propR' : 'propL');
    if (!p) continue;
    const x = p.x - b.x + FAN[0];
    const y = p.y - b.y + FAN[1];
    const a = t * OMEGA[ph] * dir;
    ctx.globalAlpha = 0.16 + 0.12 * ph;
    ctx.drawImage(sweep(), x - FAN_R - 1, y - FAN_R - 1, FAN_R * 2 + 2, FAN_R * 2 + 2);
    for (let g = 0; g < 2; g++) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(g ? a : a - 0.22 * dir);
      ctx.globalAlpha = g ? 1 - 0.12 * ph : 0.3;
      ctx.drawImage(blades(), -50, -50);
      ctx.restore();
    }
    for (let j = 0; j < 3; j++) {
      const u = (t * 0.3 + j / 3 + n * 0.17) % 1;
      const r = 4 + 10 * u;
      ctx.globalAlpha = (1 - u) * Math.min(1, u * 7) * (0.5 + 0.1 * ph);
      ctx.drawImage(soft(ph > 1 ? '#c8aab0' : '#fff1e4'), p.x - b.x + dir * STACK_X + 14 * u + Math.sin(u * 6 + j) * 3 - r, p.y - b.y - 64 - 30 * u - r, r * 2, r * 1.6);
    }
  }
  ctx.globalAlpha = 1;
}

// A pennant flying right from (x, y); `flip` -1 for one flying left, `s` its scale.
function flag(ctx, x, y, n, flip, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip * s, s);
  ctx.drawImage(pennant(n), 0, -12);
  ctx.restore();
}

function pennants(ctx, b, t) {
  const n = Math.floor(t * 9);
  const m = alive(b, 'mast');
  if (m) flag(ctx, m.x - b.x + 3, m.y - b.y - 34, n, 1, 1);
  for (let i = 0; i < TIERS.length; i++) {
    flag(ctx, -TIERS[i].half, TIERS[i].yard - 7, n + i * 3, -1, 0.8);
    flag(ctx, TIERS[i].half, TIERS[i].yard - 7, n + i * 3 + 5, 1, 0.8);
  }
}

// Lanterns swinging from their hooks, four on the rail and one at the crow's nest: the body in the own
// pass, the light in every pass.
function lamps(ctx, b, t, k, own, ph) {
  const m = alive(b, 'mast');
  for (let i = 0; i <= HANGERS.length; i++) {
    const nest = i === HANGERS.length;
    if (nest && !m) continue;
    const hx = nest ? m.x - b.x + NEST_LAMP[0] : HANGERS[i][0];
    const hy = nest ? m.y - b.y + NEST_LAMP[1] : HANGERS[i][1];
    const a = sway(t, i, ph);
    if (own) {
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(a);
      ctx.drawImage(lamp(), -6.8, 0, 13.6, 23.8);
      ctx.restore();
    } else {
      ctx.globalAlpha = k * (0.5 + 0.15 * Math.sin(t * 7 + i * 2));
      ctx.drawImage(glow(WARM), hx - Math.sin(a) * 13 - 15, hy + Math.cos(a) * 13 - 15, 30, 30);
    }
  }
}

// The captain pacing the middle window and the wheel turning in the one beside it (own pass); the windows'
// warm light breathing, a glint on his spyglass.
function bridge(ctx, b, t, k, own) {
  const p = alive(b, 'bridge');
  if (!p) return;
  const bx = p.x - b.x;
  const by = p.y - b.y;
  const pace = 3.5 * Math.sin(t * 0.4);
  if (own) {
    ctx.drawImage(captain(), bx - 8 + pace, by - 20);
    ctx.save();
    ctx.translate(bx + WINDOWS[3][0], by - 2);
    ctx.rotate(0.9 * Math.sin(t * 0.3));
    ctx.drawImage(wheel(), -10, -10, 20, 20);
    ctx.restore();
    return;
  }
  for (let i = 0; i < WINDOWS.length; i++) {
    ctx.globalAlpha = k * (0.22 + 0.08 * Math.sin(t * 2.6 + i * 2));
    ctx.drawImage(glow(WARM), bx + WINDOWS[i][0] - 34, by - 36, 68, 68);
  }
  ctx.globalAlpha = k * Math.max(0, Math.sin(t * 0.8)) ** 12;
  ctx.drawImage(star('#fff6d0'), bx + pace - 2, by - 12, 16, 16);
}

// Twinkles along the rigging and on the brass of the yards, and sunset gold lying on the canvas.
function sheen(ctx, t, k, e) {
  for (let i = 0; i < GLINTS.length; i++) {
    for (let n = 0; n < 2; n++) {
      ctx.globalAlpha = k * Math.max(0, Math.sin(t * (0.8 + 0.13 * i) + i * 2.1 + n)) ** 12;
      ctx.drawImage(star('#fff0c0'), side(n) * GLINTS[i][0] - 9, GLINTS[i][1] - 9, 18, 18);
    }
  }
  if (e >= 1) return;
  ctx.globalAlpha = k * 0.24 * (1 - e);
  for (let n = 0; n < BOXES.length; n++) ctx.drawImage(soft('#ffb05a'), BOXES[n].ox, BOXES[n].oy + BOXES[n].h * 0.3, BOXES[n].w, BOXES[n].h * 0.8);
}

export function fx(ctx, b, t, k, own, since) {
  const ph = b.phase;
  let e = furled(ph, t, since);
  if (own) {
    ctx.globalCompositeOperation = 'source-over'; // opaque things, in the live pass's additive state
    e = drawSails(ctx, t, ph, since);
    props(ctx, b, t, ph);
    pennants(ctx, b, t);
    lamps(ctx, b, t, k, true, ph);
    bridge(ctx, b, t, k, true);
    ctx.globalCompositeOperation = 'lighter';
  }
  lamps(ctx, b, t, k, false, ph);
  bridge(ctx, b, t, k, false);
  sheen(ctx, t, k, e);
  for (let n = 0; n < 2; n++) { // a glint chasing round the blade tips
    const p = alive(b, n ? 'propR' : 'propL');
    if (!p) continue;
    const a = t * OMEGA[ph] * side(n);
    for (let i = 0; i < 4; i++) {
      const ai = a + (i * TAU) / 4;
      ctx.globalAlpha = k * 0.7 * Math.max(0, Math.cos(ai - 2.2)) ** 3;
      ctx.drawImage(star('#fff0c0'), p.x - b.x + FAN[0] + Math.cos(ai) * 36 - 9, p.y - b.y + FAN[1] + Math.sin(ai) * 36 - 9, 18, 18);
    }
  }
  ctx.globalAlpha = 1;
}
