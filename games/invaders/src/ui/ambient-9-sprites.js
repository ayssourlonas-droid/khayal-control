// The sprites of World 17's ambient kinds (ambient-9.js draws them), each painted once and kept: three shapes of ash (a speck, a curl of
// burnt paper, a thin sliver), each in a colour of the entry, grey and soft with a darker flank and a feathered edge;
// ribbons of smoke (a soft curving streak built from overlapping blots that thin toward their ends, three different curls);
// and a seed of fluff (a hair-fine stem with a spray of filaments and a pale head). Everything is soft and dim on purpose: the
// bullets are hot magenta and small, so no flake here is bright or round and nothing has a hard outline.
import { cached, byColor, byVariant, soft, rgba, mix, lin, hash } from './sprites.js';
import { TAU } from '../core/math.js';

export const FLAKE = { box: 24, shapes: 3 };
export const RIBBON = { w: 360, h: 100, variants: 3 };
export const SEED = { box: 22 };

// The painter of a flake of ash in shape k (0 speck, 1 curl, 2 sliver) in `color`.
const paintFlake = (k, color) => (g, w) => {
  const [lo, hi] = [mix(color, '#000000', 0.36), mix(color, '#ffffff', 0.34)];
  g.translate(w / 2, w / 2);
  g.fillStyle = lin(g, -8, -8, 8, 8, [[0, rgba(hi, 0.95)], [1, rgba(lo, 0.95)]]);
  g.strokeStyle = g.fillStyle;
  g.lineCap = 'round';
  if (k === 0) {
    const pts = Array.from({ length: 7 }, (_, i) => [Math.cos((i / 7) * TAU) * (3.4 + hash(i * 3 + color.length) * 4.2), Math.sin((i / 7) * TAU) * (2.8 + hash(i * 3 + 1) * 3.4)]);
    g.globalAlpha = 0.3;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x * 1.25, y * 1.25) : g.moveTo(x * 1.25, y * 1.25)));
    g.fill();
    g.globalAlpha = 1;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
  } else if (k === 1) {
    g.lineWidth = 5;
    g.globalAlpha = 0.35;
    g.beginPath();
    g.arc(0, 0, 7, -0.4 * Math.PI, 1.05 * Math.PI);
    g.stroke();
    g.globalAlpha = 1;
    g.lineWidth = 3.6;
    g.beginPath();
    g.arc(0, 0, 6.4, -0.35 * Math.PI, 1 * Math.PI);
    g.stroke();
    g.strokeStyle = rgba(lo, 0.9);
    g.lineWidth = 0.9;
    g.beginPath();
    g.arc(0, 0, 5.4, 0, 0.9 * Math.PI);
    g.stroke();
  } else {
    g.rotate(-0.45);
    g.beginPath();
    g.moveTo(-10, 0);
    g.quadraticCurveTo(0, -2.4, 10, 0);
    g.quadraticCurveTo(0, 2.1, -10, 0);
    g.closePath();
    g.fill();
  }
};

// A flake of ash, FLAKE.box square. The key and the painter are built when a shape in a colour is first asked for, not on every call
// (byVariant): a frame draws about a hundred of them.
export const flake = byVariant((k, color) => cached(`smogambFlake${k}${color}`, FLAKE.box, FLAKE.box, paintFlake(k, color)));

// A ribbon of smoke in curl v, RIBBON.w x RIBBON.h: a streak along a sine that thins toward both ends, in `color`.
const paintRibbon = (v, color) => (g, w, h) => {
  const [amp, turns] = [[16, 1.4], [26, 2.1], [10, 0.8]][v % RIBBON.variants];
  g.globalAlpha = 0.42;
  for (let i = 0; i < 30; i++) {
    const u = i / 29;
    const r = (14 + 22 * Math.sin(u * Math.PI)) * (0.8 + 0.4 * hash(i * 7 + v));
    const [x, y] = [30 + u * (w - 60), h / 2 + Math.sin(u * turns * TAU + v) * amp + (hash(i + v * 11) - 0.5) * 8];
    g.drawImage(soft(color), x - r, y - r * 0.6, r * 2, r * 1.2);
  }
  g.globalAlpha = 0.5;
  g.strokeStyle = rgba(mix(color, '#ffffff', 0.18), 0.5);
  g.lineWidth = 3;
  g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    const [x, y] = [34 + u * (w - 68), h / 2 + Math.sin(u * turns * TAU + v) * amp - 4];
    g.lineTo(x, y);
  }
  g.stroke();
};
export const ribbon = byVariant((v, color) => cached(`smogambRibbon${v}${color}`, RIBBON.w, RIBBON.h, paintRibbon(v, color)));

// A seed of fluff, SEED.box square: a short curved stem, twelve filaments radiating from its tip and a tiny pale head.
export const seed = byColor((color) => cached('smogambSeed' + color, SEED.box, SEED.box, (g, w) => {
  const [cx, cy] = [w / 2, w * 0.4];
  g.strokeStyle = rgba(color, 0.9);
  g.lineWidth = 0.9;
  g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * 6.2, cy + Math.sin(a) * 6.2);
  }
  g.stroke();
  g.beginPath();
  g.moveTo(cx, cy);
  g.quadraticCurveTo(cx + 2, cy + 5, cx, w - 4);
  g.stroke();
  g.fillStyle = rgba(color, 0.95);
  g.beginPath();
  g.arc(cx, cy, 1.4, 0, TAU);
  g.fill();
}));
