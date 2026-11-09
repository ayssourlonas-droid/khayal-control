// More flourishes (contract in flourish.js): the storm of Tidal Siege.
import { W, hash, glow, soft, lighter, normal } from './sprites.js';

const PERIOD = 6.5; // s between flashes, each a little off the beat

// 0 to 1 to 0 across [a, b]
const tri = (t, a, b) => Math.max(0, 1 - Math.abs(((t - a) / (b - a)) * 2 - 1));

// Sheet lightning: the cloud bank lit from inside in a double flicker, somewhere new each time.
function sheet(ctx, { t }) {
  const slot = Math.floor(t / PERIOD);
  const lt = t - slot * PERIOD - hash(slot * 3) * 3;
  if (lt < 0 || lt > 0.55) return;
  const k = Math.max(tri(lt, 0, 0.16), 0.85 * tri(lt, 0.2, 0.5));
  const x = 300 + hash(slot * 3 + 1) * (W - 600);
  lighter(ctx);
  ctx.globalAlpha = 0.5 * k;
  ctx.drawImage(soft('#9fe8dc'), x - 620, 20, 1240, 460);
  ctx.globalAlpha = 0.45 * k;
  ctx.drawImage(glow('#ffffff'), x - 200, 80, 400, 240);
  normal(ctx);
}

export const FLOURISH3 = { sheet: { sky: sheet } };
