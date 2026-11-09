// The Thunder Galleon's sails, live (World 13, Sunset Armada; galleon-fx.js runs this): in the first phase
// full and breathing, each sail cut into strips that rise and fall a little out of step so the cloth
// ripples, a belly swelling now and then; at the second phase they are drawn up to the yard over FURL
// seconds, folds fading in over the gathered cloth, until they match what the hull has baked (reefed(),
// galleon-sails.js), and from then on this draws nothing. Opaque, so only in the boss's own pass.
import { smooth } from '../../core/math.js';
import { BOXES, sailSprite, folds, REEF } from './galleon-sails.js';

const STRIPS = 9;
const FURL = 1.5; // s a sail takes to reef

export const furled = (phase, t, since) => (phase === 0 ? 0 : phase === 1 ? smooth((t - since) / FURL) : 1);

// Draws the sails (opaque: the caller sets 'source-over') and returns how far they have been drawn up,
// 0 (full) to 1 (reefed).
export function drawSails(ctx, t, phase, since) {
  const e = furled(phase, t, since);
  if (e >= 1) return e;
  const f = 1 - (1 - REEF) * e;
  for (let n = 0; n < BOXES.length; n++) {
    const { ox, oy, w, h } = BOXES[n];
    const img = sailSprite(n);
    const air = (1 - e) * (0.5 + 0.5 * Math.sin(t * 1.3 + (n >> 1) * 1.9 + (n & 1)));
    for (let k = 0; k < STRIPS; k++) {
      const sx = Math.floor((k * w) / STRIPS);
      const sw = Math.floor(((k + 1) * w) / STRIPS) - sx;
      const ph = t * 1.7 + k * 0.62 + (n >> 1) * 1.3 + (n & 1) * 4.2;
      const dh = 1 + (1 - e) * 0.035 * Math.sin(ph) + air * 0.07 * Math.sin((Math.PI * (k + 0.5)) / STRIPS);
      const dx = (1 - e) * 1.4 * Math.sin(ph * 0.8 + 1);
      ctx.drawImage(img, sx, 0, sw + 1, h, ox + sx + dx, oy, sw + 1, h * f * dh);
    }
    if (e > 0) {
      ctx.globalAlpha = e;
      ctx.drawImage(folds(n), ox, oy, w, h * f);
      ctx.globalAlpha = 1;
    }
  }
  return e;
}
