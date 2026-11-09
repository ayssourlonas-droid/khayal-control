// Drawing the aurora (the model is aurora-model.js, the strips aurora-bake.js): each curtain is drawn
// as narrow vertical slices of its strip, side by side across the sky. A slice is placed on the
// curtain's hem and, where the hem slopes, sheared to follow it, so the hem is one unbroken line; its
// height, its brightness and where it reads the strip all follow the model, so folds travel along the
// curtain and the rays slide and shimmer. Additive, and cut to about two hundred drawImage calls:
// slices twice as wide and no third curtain when the view's quality is below 1.
import { W, soft } from './sprites.js';
import { CURTAINS, sample, warp } from './aurora-model.js';
import { strip, TW, TH } from './aurora-bake.js';

const HEM = 0.04; // the hem sits this far up from the strip's bottom
const TOP = 0.12; // the strip's faintest top is not drawn
const FLAT = 0.04; // a hem sloping less than this is not worth a shear
const A = { y: 0, h: 0, b: 0 }; // scratch: this slice's left edge, then the next one's
const B = { y: 0, h: 0, b: 0 };
const GLOWS = ['#3dffb0', '#52e0ff', '#c070ff']; // the sky each curtain lights

export function drawAurora(ctx, t, quality = 1) {
  const m = ctx.getTransform();
  const sw = quality < 1 ? 64 : 32;
  ctx.globalCompositeOperation = 'lighter';
  for (let c = CURTAINS.length - (quality < 1 ? 2 : 1); c >= 0; c--) {
    const k = CURTAINS[c];
    const img = strip(c);
    let sheared = false;
    sample(c, W / 2, t, A);
    ctx.globalAlpha = 0.1 * A.b; // the sky round the curtain, lit
    ctx.drawImage(soft(GLOWS[c]), 0, A.y - k.h * 0.9, W, k.h * 1.2);
    sample(c, 0, t, A);
    for (let i = 0, x = 0; x < W; i++, x += sw) {
      sample(c, x + sw, t, B);
      const s = (B.y - A.y) / sw;
      const a = (A.b + B.b) * 0.5 * (1 + 0.3 * Math.sin(t * 2.7 + i * 1.9) * Math.sin(t * 1.3 + i * 0.7)) * (1 + Math.min(Math.abs(s), 0.5) * 1.4); // a fold seen edge-on burns brighter
      if (a > 0.025) {
        if (Math.abs(s) > FLAT) {
          ctx.setTransform(m.a + m.c * s, m.b + m.d * s, m.c, m.d, m.e - m.c * s * x, m.f - m.d * s * x);
          sheared = true;
        } else if (sheared) {
          ctx.setTransform(m);
          sheared = false;
        }
        ctx.globalAlpha = Math.min(1, a * 1.15);
        const u = (((x * k.rho + t * k.drift + k.u0 + warp(c, x, t)) % TW) + TW) % TW;
        ctx.drawImage(img, u, TH * TOP, sw * k.rho, TH * (1 - TOP), x, A.y - A.h * (1 - HEM - TOP), sw, A.h * (1 - TOP));
      }
      A.y = B.y;
      A.h = B.h;
      A.b = B.b;
    }
    ctx.setTransform(m);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
