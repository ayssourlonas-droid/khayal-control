// World 9, Tidal Siege: the Abyssal behemoth. A sea beast rising out of the harbour, straight at
// the ship: a wet slate hide in scales and crusted with barnacles, a ridge of dorsal spines along its
// shoulders, a crest, a skull with amber eyes, an open maw and two gills burning with the deep's cyan
// (the weak points), two raised claws, and a skirt of black water dragging off it, foaming, streaming
// from its edge. Parts are in behemoth-parts.js. Each phase brightens the spines and the veins and
// reddens the eyes; the maw and the gills breathe; water drips from its claws and its skirt.
import { path, sym, both, ink, line, bloom, neon, rgba, shade, lin } from './kit.js';
import { glow, hash } from '../sprites.js';
import { PARTS, hide, barnacles } from './behemoth-parts.js';
import { alive, glowAt } from './parts.js';

// Dorsal spines along the shoulder (the right side, mirrored): [x, y on the hide's edge, length, lean].
const SPINES = [[100, -99, 38, 0.1], [150, -113, 46, 0.22], [190, -106, 56, 0.38], [230, -84, 62, 0.52], [268, -59, 58, 0.68], [300, -14, 48, 0.85]];
const tipOf = ([x, y, len, lean]) => [x + Math.sin(lean) * len, y - Math.cos(lean) * len];
// The hide's outline, right half: shoulders rise either side of the neck, the flanks sink into the water.
const SHOULDER = [[0, -70], [70, -80], [130, -118], [200, -104], [290, -44], [318, 40]];
const TORSO = sym([...SHOULDER, [306, 92], [262, 126], [0, 142]]);
const EDGE = [...SHOULDER.map(([x, y]) => [-x, y]).reverse(), ...SHOULDER]; // the lit top edge, open
const CREST_TIPS = [-3, -2, -1, 0, 1, 2, 3].map((i) => [i * 34 + i * 5, 8 - (56 - Math.abs(i) * 8)]); // in the crest's frame
const DRIPS = [-290, -230, -170, -110, -50, 10, 70, 130, 190, 250, 300];

// Veins of cyan under the hide, out from the chest to the shoulders.
function veins(l, S, a) {
  both((s) => {
    for (let i = 0; i < 4; i++) {
      l.beginPath();
      l.moveTo(s * 70, -40 + i * 28);
      l.quadraticCurveTo(s * 170, -70 + i * 44, s * (250 + i * 18), -20 + i * 34);
      neon(l, S.pal.weak, 1.3, a);
    }
  });
}

// The water the beast drags up with it: a dark skirt whose top edge foams and whose bottom tears
// into streams.
function water(b, l, S) {
  const span = (x) => (Math.abs(x) / 340) ** 4; // the skirt thins out toward the shoulders
  const top = (x) => 108 - 40 * span(x) + Math.sin(x * 0.05) * 5 + Math.sin(x * 0.13 + 1) * 3;
  const bot = (x) => 168 - 90 * span(x) + Math.sin(x * 0.04 + 2) * 8 + Math.sin(x * 0.17) * 4;
  b.beginPath();
  for (let x = -340; x <= 340; x += 5) b.lineTo(x, top(x));
  for (let x = 340; x >= -340; x -= 5) b.lineTo(x, bot(x));
  b.closePath();
  b.fillStyle = lin(b, 0, 80, 0, 176, [[0, '#14565e'], [0.4, '#0b3840'], [1, '#04181e']]);
  b.fill();
  for (let x = -330; x < 340; x += 22 + hash(x) * 20) { // streams hanging off the lower edge
    b.beginPath();
    b.moveTo(x, bot(x) - 4);
    b.lineTo(x + 1, bot(x) + 10 + hash(x + 3) * 32);
    line(b, '#0b3840', 3 + hash(x + 5) * 3);
  }
  b.beginPath();
  for (let x = -340; x <= 340; x += 5) b.lineTo(x, top(x));
  line(b, rgba('#d8f6f2', 0.8), 3);
  b.beginPath();
  for (let x = -340; x <= 340; x += 5) b.lineTo(x, top(x) + 9 + Math.sin(x * 0.09) * 2);
  line(b, rgba('#d8f6f2', 0.28), 2);
  b.fillStyle = rgba('#d8f6f2', 0.6);
  for (let i = 0; i < 70; i++) {
    const x = -330 + hash(i * 3 + 1) * 660;
    b.fillRect(x, top(x) - 2 + hash(i * 3 + 2) * 26, 2.2, 2.2);
  }
  bloom(l, 0, 134, 300, S.pal.weak, 0.1);
}

function hull(b, l, S) {
  const { hull: HULL, plate } = S.pal;
  both((s) => SPINES.forEach((sp) => {
    const [tx, ty] = tipOf(sp);
    path(b, [[s * (sp[0] - 15), sp[1] + 12], [s * tx, ty], [s * (sp[0] + 15), sp[1] + 12]]);
    ink(b, lin(b, 0, ty, 0, sp[1], [[0, shade(plate, 0.2)], [1, shade(plate, -0.5)]]), 2.8);
  }));
  path(b, TORSO);
  ink(b, hide(b, HULL, -130, 164), 4);
  b.save();
  path(b, TORSO);
  b.clip();
  for (let row = 0; row < 16; row++) { // scales, in staggered rows
    for (let x = -330 + (row % 2) * 11; x < 330; x += 22) {
      b.beginPath();
      b.arc(x, -112 + row * 16, 10, 0.15 * Math.PI, 0.85 * Math.PI);
      line(b, rgba('#000000', 0.3), 1.4);
      b.beginPath();
      b.arc(x, -113 + row * 16, 10, 0.2 * Math.PI, 0.8 * Math.PI);
      line(b, rgba('#ffffff', 0.07), 1);
    }
  }
  b.fillStyle = lin(b, -330, 0, 330, 0, [[0, rgba('#000000', 0.5)], [0.3, rgba('#000000', 0)], [0.7, rgba('#000000', 0)], [1, rgba('#000000', 0.5)]]);
  b.fillRect(-330, -140, 660, 310);
  b.restore();
  path(l, EDGE, true);
  l.save();
  l.globalCompositeOperation = 'lighter';
  line(l, rgba(S.pal.weak, 0.22), 2); // the storm's cold light along the hide's edge
  l.restore();
  barnacles(b, [[-250, -20, 50], [250, 10, 50], [-200, 60, 40], [210, 70, 40], [-110, 96, 40], [120, 92, 40], [-290, 60, 24], [290, -40, 24]], 11);
  veins(l, S, 0.3);
  bloom(l, 0, 0, 260, S.pal.weak, 0.07);
  water(b, l, S);
}

const spines = (a, w) => (l, S) => {
  both((s) => SPINES.forEach((sp) => {
    const [tx, ty] = tipOf(sp);
    l.beginPath();
    l.moveTo(s * sp[0], sp[1] + 4);
    l.lineTo(s * tx, ty);
    neon(l, S.pal.weak, w, a);
    bloom(l, s * tx, ty + 2, 22, S.pal.weak, a * 0.6);
  }));
};

export default {
  pad: 60,
  crack: '#4ff3ff',
  hull,
  parts: PARTS,
  rage: [null, (l, S) => {
    spines(0.55, 1.6)(l, S);
    veins(l, S, 0.3);
  }, (l, S) => {
    spines(1, 2.4)(l, S);
    veins(l, S, 0.55);
    bloom(l, 0, -20, 300, S.pal.weak, 0.16);
  }],
  // The maw and the gills breathing, the eyes reddening and the crest burning with the phase, drops
  // falling from the water skirt and the claws.
  live(ctx, b, t, k) {
    const ph = b.phase;
    const maw = alive(b, 'maw');
    if (maw) glowAt(ctx, b, maw, '#4ff3ff', 0, 0, 74 + 14 * Math.sin(t * (2.4 + ph * 1.2)), k * (0.2 + 0.14 * Math.sin(t * (2.4 + ph * 1.2))));
    for (const id of ['gillL', 'gillR']) {
      const g = alive(b, id);
      if (g) glowAt(ctx, b, g, '#4ff3ff', 0, 0, 46, k * (0.32 + 0.22 * Math.sin(t * 3.1 + (id === 'gillR' ? Math.PI : 0))));
    }
    const skull = alive(b, 'skull');
    if (skull && ph > 0) {
      for (const s of [-1, 1]) {
        const a = k * (ph === 1 ? 0.55 : 0.9) * (0.85 + 0.15 * Math.sin(t * 6 + s));
        glowAt(ctx, b, skull, '#ff2a1a', s * 40, -1, 32, a);
        glowAt(ctx, b, skull, '#ff7a5a', s * 40, -1, 11, a);
      }
    }
    const crest = alive(b, 'crest');
    if (crest && ph > 0) for (const [x, y] of CREST_TIPS) glowAt(ctx, b, crest, '#4ff3ff', x, y + 3, 14 + 4 * ph, k * 0.3 * ph);
    for (let i = 0; i < DRIPS.length; i++) {
      const tau = (t / (1.5 + hash(i + 40) * 1.4) + hash(i + 41)) % 1;
      ctx.globalAlpha = k * (1 - tau) * 0.6;
      ctx.drawImage(glow('#bfeceb'), DRIPS[i] - 3, 168 + tau * tau * 120, 6, 14);
    }
    for (const id of ['clawL', 'clawR']) {
      const c = alive(b, id);
      if (!c) continue;
      const s = id === 'clawL' ? 1 : -1;
      for (const [i, dx] of [[0, -4], [1, 9]]) {
        const tau = (t / 1.7 + i * 0.5 + (s > 0 ? 0 : 0.25)) % 1;
        glowAt(ctx, b, c, '#bfeceb', s * dx, -66 + tau * tau * 150, 4, k * (1 - tau) * 0.6);
      }
    }
    ctx.globalAlpha = 1;
  },
};
