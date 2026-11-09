// The slow ripple that runs over the Lantern Leviathan's pectoral fins (World 15, Lantern Deep; angler-fx.js draws
// it): the membrane is baked once, so the wave is light, a set of soft rings of pale cyan spreading outward from the
// knuckle over every wedge of the fan, eight frames that loop. Each frame is a cached sprite 'anglerRipple<n>', the
// size of RB (the fan's box in the fin's own frame); the right fin draws the same frame mirrored. Painted once on
// first use; warmRipple paints all of them ahead of the fight.
import { cached } from '../sprites.js';
import { rgba } from './kit.js';
import { AQUA } from './angler-kit.js';
import { WRIST, N, wedge } from './angler-fin-rays.js';

export const RB = { x: -104, y: -28, w: 124, h: 140 };
export const FRAMES = 8;
const PERIOD = 30; // px between two rings
const REACH = 128; // how far the rings run from the knuckle

const frame = (f) => cached('anglerRipple' + f, RB.w, RB.h, (g) => {
  g.translate(-RB.x, -RB.y);
  const stops = Array.from({ length: 43 }, (_, s) => {
    const r = (s / 42) * REACH;
    const wave = Math.max(0, Math.sin((Math.PI * 2 * (r - (f / FRAMES) * PERIOD)) / PERIOD)) ** 2;
    return [s / 42, rgba(AQUA, 0.55 * wave * Math.min(1, r / 20) * (1 - 0.5 * (r / REACH) ** 2))];
  });
  const gr = g.createRadialGradient(WRIST[0], WRIST[1], 0, WRIST[0], WRIST[1], REACH);
  for (const [at, c] of stops) gr.addColorStop(at, c);
  g.fillStyle = gr;
  for (let i = 0; i < N - 1; i++) {
    g.save();
    wedge(g, i);
    g.clip();
    g.fillRect(RB.x, RB.y, RB.w, RB.h);
    g.restore();
  }
});

// The frame for a ripple phase in radians (summed per boss).
export const rippleFrame = (rip) => frame(Math.floor(((((rip / (Math.PI * 2)) % 1) + 1) % 1) * FRAMES));
export function warmRipple() {
  for (let f = 0; f < FRAMES; f++) frame(f);
}
