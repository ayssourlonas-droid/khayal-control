// The shared sprites of the giant cigarettes' tall part that are light and smoke (flourish-smog-sky-cig.js draws them), each painted
// once in a warm function and keyed `smogcig...`: the ember (additive, dim and orange, nothing in it a hot white dot), dust for the
// break, a puff of smoke (a lumpy cloud baked from noise, lit from the upper right: amber on its lit side, umber in its shadow) and the
// plume's ribbon, a tall column of smoke with an S-curve that widens as it climbs, billowed by noise, dark in its body and
// amber-grey on its lit flank, fading toward the top. Two ribbons, out of step, are crossfaded so the column writhes.
import { cached, rad, noise2 } from './sprites.js';
import { field } from './sky-bodies-9-kit.js';
import { clamp, smooth } from '../core/math.js';

const smokeN = (x, y, cell, seed) => noise2(x, y, cell, seed * 13 + 5); // smooth noise for the baked puffs

// Each sprite is made when first asked for and kept in a slot, so a call of a frame builds neither its key nor its painter.
let ember = null;
let dust = null;
const PUFFS = [];
const RIBBONS = [];

// The ember: a dim, orange glow that sits on the burning band, additive; its edge is soft and nothing in it is a hot white dot.
export const emberSprite = () => (ember ??= cached('smogcigEmber', 128, 64, (g, w, h) => {
  g.save();
  g.translate(0, h / 2);
  g.scale(1, 0.5);
  g.translate(0, -h / 2);
  g.fillStyle = rad(g, w / 2, h / 2, 0, w / 2, [[0, 'rgba(255,160,70,0.95)'], [0.3, 'rgba(255,120,45,0.5)'], [1, 'rgba(255,90,30,0)']]);
  g.fillRect(0, -h / 2, w, h * 2);
  g.restore();
}));

// Dust: a soft grey-brown puff for the break.
export const dustSprite = () => (dust ??= cached('smogcigDust', 96, 96, (g) => {
  g.fillStyle = rad(g, 48, 48, 0, 48, [[0, 'rgba(150,130,108,0.7)'], [0.5, 'rgba(120,102,86,0.3)'], [1, 'rgba(110,94,80,0)']]);
  g.fillRect(0, 0, 96, 96);
}));

// Smoke: a puff, a lumpy cloud lit from the upper right (amber on its lit side, umber in its shadow), baked from noise; k 0..2.
export const puffSprite = (k) => (PUFFS[k] ??= cached(`smogcigPuff${k}`, 160, 160, (g, w, h) => {
  const tex = field(1, (x, y, px) => {
    const [dx, dy] = [(x - 80) / 62, (y - 80) / 62];
    const d = 1 - Math.hypot(dx, dy) + 0.55 * (smokeN(x, y, 46, k) - 0.5) + 0.3 * (smokeN(x, y, 19, k + 3) - 0.5);
    const a = clamp(d * 2.6, 0, 1);
    if (a <= 0) return;
    const lit = clamp(0.5 + (dx * 0.5 - dy * 0.5) * 0.8 + 0.5 * (smokeN(x, y, 30, k + 7) - 0.5), 0, 1);
    px[0] = 58 + lit * 150;
    px[1] = 46 + lit * 104;
    px[2] = 38 + lit * 56;
    px[3] = a * 0.9;
  }, w, h);
  g.drawImage(tex, 0, 0);
}));

// The plume's ribbon, k 0..1: a tall column of smoke, 150 x 480, rising from the foot of the sprite with an S-curve that leans to the
// right (the flourish mirrors it for the cigarettes on the left), widening as it climbs, billowed by noise, dark in its body and
// amber-grey on its lit right flank, fading out toward the top. Two of them, out of step, are crossfaded so the column writhes.
export const RIBBON = { w: 150, h: 480 }; // the sprite's size
export const ribbonSprite = (k) => (RIBBONS[k] ??= cached(`smogcigRibbon${k}`, RIBBON.w, RIBBON.h, (g, w, h) => {
  const ph = k * 2.6;
  const tex = field(1, (x, y, px) => {
    const t = clamp((h - 10 - y) / (h - 40), 0, 1.2);
    if (t > 1) return;
    const cx = w * 0.4 + 26 * Math.sin(t * 3.4 + ph) * t ** 0.7 + 30 * t;
    const hw = 5 + 50 * t ** 0.78;
    const dx = (x - cx) / hw;
    const d = 1 - Math.abs(dx) + 0.5 * (smokeN(x, y, 38, k + 20) - 0.5) + 0.3 * (smokeN(x, y, 16, k + 24) - 0.5);
    const a = clamp(d * 2.4, 0, 1) * smooth(t / 0.07) * (1 - t ** 1.5);
    if (a <= 0) return;
    const lit = clamp(0.38 + dx * 0.4 + 0.4 * (smokeN(x, y, 26, k + 28) - 0.5), 0, 1);
    px[0] = 54 + lit * 118;
    px[1] = 43 + lit * 90;
    px[2] = 36 + lit * 56;
    px[3] = a * 0.85;
  }, w, h);
  g.drawImage(tex, 0, 0);
}));

export function warmCigSmoke() {
  emberSprite();
  dustSprite();
  ribbonSprite(0);
  ribbonSprite(1);
  for (let k = 0; k < 3; k++) puffSprite(k);
}
