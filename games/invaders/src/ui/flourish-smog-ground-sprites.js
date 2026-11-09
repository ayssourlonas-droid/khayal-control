// The sprites of World 17's ground flourishes (flourish-smog-ground.js draws them), each painted once: kites in muted fabric
// (a diamond kite of four panels, two tones, on crossed spars with a stitched edge; a box kite of two bands on a frame), the
// small bows of a kite's tail, and a low bank of smog (a long soft bank built from overlapping blots, brown-grey, which the
// flourish draws at a few hundredths of alpha). Colours are sky blue, sun yellow, white, leaf green and terracotta: never
// magenta or pink (the bullets), never a bright saturated dot.
import { cached, rgba, mix, lin, soft, hash } from './sprites.js';

export const FABRIC = ['#6fb0e0', '#f0c850', '#f4f0e6', '#6fb25a', '#d0704c']; // sky blue, sun yellow, white, leaf green, terracotta
export const KITE = { w: 40, h: 54, boxW: 34, boxH: 46 };
export const BOW = { w: 12, h: 9 };
export const BANK = { w: 720, h: 150 };
const SPAR = '#5a4636';

// Diamond kite in fabric colour k: four panels, lit ones on the sun side, spars and a stitched edge.
export const diamond = (k) => cached('smogkiteDiamond' + (k % FABRIC.length), KITE.w, KITE.h, (g, w, h) => {
  const c = FABRIC[k % FABRIC.length];
  const [top, right, bot, left, mid] = [[w / 2, 2], [w - 2, h * 0.38], [w / 2, h - 2], [2, h * 0.38], [w / 2, h * 0.38]];
  const panels = [[top, right, mid, mix(c, '#ffffff', 0.3)], [top, left, mid, mix(c, '#ffffff', 0.08)], [bot, right, mid, mix(c, '#000000', 0.06)], [bot, left, mid, mix(c, '#000000', 0.2)]];
  for (const [a, b, m, fill] of panels) {
    g.beginPath();
    g.moveTo(...a);
    g.lineTo(...b);
    g.lineTo(...m);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
  }
  g.strokeStyle = rgba(SPAR, 0.75);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(...top);
  g.lineTo(...bot);
  g.moveTo(...left);
  g.lineTo(...right);
  g.stroke();
  g.strokeStyle = rgba(mix(c, '#000000', 0.45), 0.8);
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(...top);
  g.lineTo(...right);
  g.lineTo(...bot);
  g.lineTo(...left);
  g.closePath();
  g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.35)';
  g.lineWidth = 0.8;
  g.beginPath();
  g.moveTo(w / 2 + 2, 8);
  g.lineTo(w - 8, h * 0.36);
  g.stroke();
});

// A box kite, front view: two bands of fabric (k and white) on a frame of spars with diagonal braces.
export const boxKite = (k) => cached('smogkiteBox' + (k % FABRIC.length), KITE.boxW, KITE.boxH, (g, w, h) => {
  const c = FABRIC[k % FABRIC.length];
  for (const [y0, y1, fill] of [[2, 15, c], [h - 16, h - 3, mix(c, '#ffffff', 0.45)]]) {
    g.fillStyle = lin(g, 0, y0, 0, y1, [[0, mix(fill, '#ffffff', 0.18)], [1, mix(fill, '#000000', 0.12)]]);
    g.fillRect(4, y0, w - 8, y1 - y0);
    g.strokeStyle = rgba(mix(fill, '#000000', 0.45), 0.8);
    g.lineWidth = 1;
    g.strokeRect(4, y0, w - 8, y1 - y0);
  }
  g.strokeStyle = rgba(SPAR, 0.85);
  g.lineWidth = 1.2;
  g.beginPath();
  for (const x of [5, w - 5]) {
    g.moveTo(x, 2);
    g.lineTo(x, h - 3);
  }
  g.moveTo(5, 15);
  g.lineTo(w - 5, h - 16);
  g.moveTo(w - 5, 15);
  g.lineTo(5, h - 16);
  g.stroke();
});

// A bow on a tail, BOW.w x BOW.h: two small triangles and a knot.
export const bow = (k) => cached('smogkiteBow' + (k % FABRIC.length), BOW.w, BOW.h, (g, w, h) => {
  const c = FABRIC[k % FABRIC.length];
  g.fillStyle = c;
  g.beginPath();
  g.moveTo(w / 2, h / 2);
  g.lineTo(1.6, 1.6);
  g.lineTo(2, h - 1.6);
  g.moveTo(w / 2, h / 2);
  g.lineTo(w - 1.6, 1.6);
  g.lineTo(w - 2, h - 1.6);
  g.fill();
  g.fillStyle = mix(c, '#000000', 0.25);
  g.fillRect(w / 2 - 1.2, h / 2 - 1.4, 2.4, 2.8);
});

// A low bank of smog, BANK.w x BANK.h: soft blots along a line, thicker in the middle, fading to nothing at every edge.
export const bank = () => cached('smogbankBank', BANK.w, BANK.h, (g, w, h) => {
  for (let i = 0; i < 44; i++) {
    const u = i / 43;
    const r = (34 + 40 * Math.sin(u * Math.PI)) * (0.7 + 0.6 * hash(i * 3 + 5));
    const [x, y] = [90 + u * (w - 180), h * 0.55 + (hash(i * 7 + 2) - 0.5) * h * 0.3];
    g.globalAlpha = 0.5;
    g.drawImage(soft('#8a7660'), x - r, y - r * 0.55, r * 2, r * 1.1);
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'destination-in';
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, 'rgba(0,0,0,0)'], [0.45, 'rgba(0,0,0,1)'], [1, 'rgba(0,0,0,0)']]);
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
});
