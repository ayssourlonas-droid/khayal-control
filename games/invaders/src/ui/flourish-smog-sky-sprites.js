// The sprites of world 17's sky flourishes (flourish-smog-sky.js draws them), each painted once in a warm function and keyed
// `smogsky...`: a bank of smoke (wide and low, baked from noise: lumpy on top, flat underneath, lit along its top edge by the
// sun on the right and shaded umber beneath), a shaft of sunlight (a long soft wedge, bright where it leaves the sun and gone by
// its foot, feathered along both sides), and a bird in three poses of its wing (up, level, down), dark blue-grey. All of it is soft
// and quiet: the smoke stays under the sky's own darkness, the light is golden-white and faint, the birds are small silhouettes.
import { cached, rgba, lin, noise2 } from './sprites.js';
import { clamp } from '../core/math.js';
import { field, smoothstep } from './sky-bodies-9-kit.js';

export const BANK = { w: 920, h: 150, n: 3 }; // a bank's sprite, and the number of different banks
export const BEAM = { w: 260, h: 1000 }; // a shaft: its sprite (its apex is the middle of the top edge)
export const BIRD = { w: 34, h: 18, frames: 3 };

// Bank k: a mound with a flat base, noise along its upper edge, the body darker toward the bottom and lit on top.
export const bankSprite = (k) => cached(`smogskyBank${k}`, BANK.w, BANK.h, (g, w, h) => {
  const tex = field(2, (x, y, px) => {
    const u = (x / w) * 2 - 1;
    const v = 1 - y / h;
    const top = (1 - Math.abs(u) ** 1.6) * (0.62 + 0.3 * noise2(x, 0, 150, k + 3));
    const d = top - v + 0.34 * (noise2(x, y, 60, k) - 0.5) + 0.18 * (noise2(x, y, 24, k + 9) - 0.5) + 0.07 * (noise2(x, y, 9, k + 15) - 0.5);
    const a = smoothstep(-0.04, 0.16, d) * smoothstep(0, 0.5, v + 0.06 * (noise2(x, 0, 40, k + 6) - 0.5));
    if (a <= 0) return;
    const lit = clamp(0.35 + (0.2 - d) * 1.4 + 0.2 * u, 0, 1);
    px[0] = 34 + lit * 70;
    px[1] = 26 + lit * 50;
    px[2] = 21 + lit * 34;
    px[3] = a;
  }, w, h);
  g.drawImage(tex, 0, 0, w, h);
});

// A shaft: a wedge widening from the middle of the top edge to the whole width at the foot, in five nested layers so its sides are soft,
// brightest at the top, gone by the foot; warm white.
export const beamSprite = () => cached('smogskyBeam', BEAM.w, BEAM.h, (g, w, h) => {
  for (let j = 0; j < 5; j++) {
    const s = 1 - j * 0.17;
    g.fillStyle = lin(g, 0, 0, 0, h, [[0, rgba('#fff4d0', 0.5)], [0.3, rgba('#ffeab0', 0.26)], [0.7, rgba('#ffe2a0', 0.08)], [1, rgba('#ffe2a0', 0)]]);
    g.beginPath();
    g.moveTo(w / 2 - 6 * s, 0);
    g.lineTo(w / 2 + 6 * s, 0);
    g.lineTo(w / 2 + (w / 2 - 4) * s, h);
    g.lineTo(w / 2 - (w / 2 - 4) * s, h);
    g.closePath();
    g.fill();
  }
});

// A bird in wing pose f (0 up, 1 level, 2 down), 34 x 18: a body, a head and two curved wings, tapered, dark blue-grey.
export const birdSprite = (f) => cached(`smogskyBird${f}`, BIRD.w, BIRD.h, (g, w, h) => {
  const [cx, cy] = [w / 2, h * 0.55];
  const lift = [-9, -2, 6][f];
  g.fillStyle = '#394a60';
  g.beginPath();
  g.ellipse(cx, cy, 3.6, 1.7, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(cx + 3.6, cy - 0.4, 1.3, 0, Math.PI * 2);
  g.fill();
  for (const s of [-1, 1]) { // a wing: a tapering curve out and up or down
    g.beginPath();
    g.moveTo(cx, cy - 1.2);
    g.quadraticCurveTo(cx + s * 8, cy + lift * 0.3 - 3, cx + s * 15.5, cy + lift);
    g.quadraticCurveTo(cx + s * 8, cy + lift * 0.3 + 0.6, cx, cy + 1.4);
    g.closePath();
    g.fill();
  }
});

export function warmSkyFxSprites() {
  for (let k = 0; k < BANK.n; k++) bankSprite(k);
  beamSprite();
  for (let f = 0; f < BIRD.frames; f++) birdSprite(f);
}
