// More sprites for the Lantern Leviathan's live extras (World 15, Lantern Deep; angler-fx.js, angler-lure.js): the two
// starbursts that flare from the lure, and warm(), which paints every sprite the live extras draw ahead of the fight
// (warmBoss calls it), the lure's from angler-sprites.js, the jaw's and the fins' among them, so that none is baked
// mid-fight. Cache keys are all 'angler...'.
import { cached, glow, star } from '../sprites.js';
import { lin, rgba } from './kit.js';
import { TAU, TEAL, AQUA, VIOLET, PALE } from './angler-kit.js';
import { stalk, stalkGlow, tether, bulb, filaments, filamentGlow } from './angler-sprites.js';
import { jawBody, jawLights } from './angler-jaw-sprite.js';
import { warmRipple } from './angler-ripple.js';

// A starburst 120 square for the lure: n = 0 eight rays, the four along the axes long; n = 1 eight even, finer ones
// turned a sixteenth. Each ray fades from white-cyan at the middle to nothing.
export const rays = (n) => cached('anglerLureRays' + n, 120, 120, (g) => {
  g.translate(60, 60);
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8 + (n ? TAU / 16 : 0);
    const len = n ? 46 : i % 2 ? 31 : 57;
    const half = n ? 2.4 : i % 2 ? 3 : 4.4;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    g.fillStyle = lin(g, 0, 0, c * len, s * len, [[0, rgba('#e8ffff', 0.9)], [0.45, rgba(AQUA, 0.38)], [1, rgba(AQUA, 0)]]);
    g.beginPath();
    g.moveTo(-s * half, c * half);
    g.lineTo(c * len, s * len);
    g.lineTo(s * half, -c * half);
    g.closePath();
    g.fill();
  }
});

// The colours of the glows and stars the live extras take from the shared caches.
export const GLOWS = ['#ffffff', TEAL, AQUA, VIOLET, PALE];
export const STARS = ['#ffffff', PALE];

export function warm() {
  for (const sprite of [stalk, stalkGlow, tether, bulb, filaments, filamentGlow, jawBody, jawLights]) sprite();
  rays(0);
  rays(1);
  warmRipple();
  for (const c of GLOWS) glow(c);
  for (const c of STARS) star(c);
}
