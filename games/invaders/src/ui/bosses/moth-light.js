// The light that moves over the Vesper Moth's weak points (World 16, Glass Cathedral; moth-fx.js draws it), all of it
// cached sprites painted once, ahead of the fight (warmLight): the rose window's light turning (ROSE_FRAMES frames of
// eight beams of white-gold light running out from the hub along the petals, the beams turning by one eighth of a
// turn over the set, so the set loops), the light that circles each eyespot's rings (SPIN_FRAMES frames of three
// comets a third of a turn apart, the right eyespot drawing the same frames mirrored so it circles the other way) and
// a glow for each slit between the abdomen's bands. Each sprite is additive light on a transparent canvas, cache keys
// 'moth...'.
import { cached } from '../sprites.js';
import { line, rad, rgba, bloom } from './kit.js';
import { TAU, WEAK, GOLD, AMBER, circle } from './moth-kit.js';
import { HEART } from './moth-heart.js';
import { SPOT } from './moth-spot.js';
import { ring, SLITS } from './moth-tail.js';

export const ROSE_FRAMES = 8;
export const SPIN_FRAMES = 16;
export const RS = 112; // the rose sprite's size, centred
export const SS = { w: 150, h: 134 }; // the eyespot ring sprite's size, centred
export const SL = { w: 140, h: 40 }; // a slit sprite's size, centred on the tube's middle at the slit's y

const rose = [];
export const roseFrame = (f) => (rose[f] ??= cached('mothRose' + f, RS, RS, (g) => {
  g.translate(RS / 2, RS / 2);
  g.save();
  circle(g, 0, 0, 41);
  g.clip();
  const turn = (f / ROSE_FRAMES) * (TAU / HEART.petals);
  for (let k = 0; k < HEART.petals; k++) {
    g.save();
    g.rotate(turn + (k * TAU) / HEART.petals);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(44, -6.5);
    g.lineTo(44, 6.5);
    g.closePath();
    g.fillStyle = rad(g, 0, 0, 4, 44, [[0, rgba('#ffffff', 0.9)], [0.35, rgba(WEAK, 0.5)], [1, rgba(AMBER, 0)]]);
    g.fill();
    g.restore();
  }
  g.restore();
  for (let k = 0; k < HEART.petals; k++) { // glints on the frame's ring
    const a = turn + ((k + 0.5) * TAU) / HEART.petals;
    bloom(g, Math.cos(a) * 44.2, Math.sin(a) * 44.2, 6, '#ffffff', 0.85);
  }
  bloom(g, 0, 0, 16, '#ffffff', 0.7);
}));

const spin = [];
export const spinFrame = (f) => (spin[f] ??= cached('mothSpin' + f, SS.w, SS.h, (g) => {
  g.translate(SS.w / 2, SS.h / 2);
  g.scale(1, SPOT.ry / SPOT.rx);
  const a0 = (f / SPIN_FRAMES) * (TAU / 3);
  for (let c = 0; c < 3; c++) {
    for (let j = 0; j < 12; j++) {
      const a = a0 + (c * TAU) / 3 - j * 0.07;
      const [x, y] = [Math.cos(a) * 46, Math.sin(a) * 46];
      const e = (1 - j / 12) ** 1.6;
      bloom(g, x, y, 4 + 6 * e, j < 2 ? '#ffffff' : WEAK, 0.85 * e);
    }
  }
}));

const slit = [];
export const slitGlow = (k) => (slit[k] ??= cached('mothSlit' + k, SL.w, SL.h, (g) => {
  g.translate(SL.w / 2, SL.h / 2 - SLITS[k]);
  g.beginPath();
  ring(SLITS[k], 16).forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y));
  line(g, rgba(GOLD, 0.16), 15);
  line(g, rgba(WEAK, 0.3), 8);
  line(g, rgba('#fff6d8', 0.7), 2.4);
}));

export function warmLight() {
  for (let f = 0; f < ROSE_FRAMES; f++) roseFrame(f);
  for (let f = 0; f < SPIN_FRAMES; f++) spinFrame(f);
  for (let k = 0; k < SLITS.length; k++) slitGlow(k);
}
