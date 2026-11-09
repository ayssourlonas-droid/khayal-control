// The glass scales that shake loose from the Vesper Moth's wings in the last phase (World 16, Glass Cathedral;
// moth-fx.js draws them): little leaves of jewel glass that leave the margin of a wing, flutter and tumble as they
// fall, and fade out. They are decoration, only light: a fixed pool of POOL sprites drawn additively at about half
// strength, nothing like the lime rain bullets. Each scale's cycle is the boss's scale clock (moth-motion.js) times its
// own speed, its starting point one of the margin's cusps, drawn from a hash of the scale and its cycle, so nothing is
// stored and nothing allocated per frame. A scale hangs on its wing: a destroyed wing sheds none. All of it starts at
// or under the wing's top (y -126 and lower) and falls, so none is above the HUD. Sprites 'mothScale0'..'mothScale4'.
import { cached, hash } from '../sprites.js';
import { ROSE, COBALT, AMBER, VIOLET, GOLD } from './moth-kit.js';
import { shard } from './moth-fur.js';
import { ARCHES, ROWS } from './moth-wing-geo.js';
import { alive } from './parts.js';

export const POOL = 14;
const FALL = 160; // px a scale falls in a cycle
const COLS = [ROSE, COBALT, AMBER, VIOLET, GOLD];
const SRC = ARCHES[ROWS + 1].map((a) => a.apex); // where a scale can come from: the wing's margin (the left wing's own coordinates)

const sprites = [];
export const scaleSprite = (i) => (sprites[i] ??= cached('mothScale' + i, 30, 20, (g) => {
  g.translate(3, 10);
  shard(g, 24, 12, COLS[i]);
}));

export function warmScales() {
  for (let i = 0; i < COLS.length; i++) scaleSprite(i);
}

// The scales in flight: `fall` 0..1 is how fully the last phase has come up, `clock` the boss's scale clock.
export function scales(ctx, b, fall, clock, k) {
  if (fall < 0.02) return;
  const left = alive(b, 'wingL');
  const right = alive(b, 'wingR');
  for (let i = 0; i < POOL; i++) {
    const side = i % 2;
    if (!(side ? right : left)) continue;
    const c = clock * (0.3 + 0.12 * hash(i * 5 + 1)) + hash(i * 11 + 2) * 9;
    const cyc = Math.floor(c);
    const u = c - cyc;
    const h = hash(i * 131 + cyc * 17);
    const src = SRC[Math.floor(h * SRC.length)];
    const dir = side ? -1 : 1; // the left wing's scales drift in toward the body, the right's likewise
    const x = (side ? 245 - src[0] : src[0] - 245) + dir * (u * 12 + 8 * Math.sin(u * 7 + i));
    const y = -58 + src[1] + FALL * u ** 1.3 + 4 * Math.sin(u * 11 + i * 2);
    ctx.globalAlpha = k * fall * 0.55 * Math.sin(Math.PI * u) ** 0.8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(h * 6.28 + u * (2 + 3 * hash(i * 3 + cyc)) * dir + 0.6 * Math.sin(u * 9 + i));
    ctx.drawImage(scaleSprite(Math.floor(hash(i * 7 + cyc * 3 + 5) * COLS.length)), -3, -10);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
