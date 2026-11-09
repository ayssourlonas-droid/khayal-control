// The sprites of Ember Carnival's fireworks, each painted once (flourish-10.js draws the live shows from them,
// sky-bodies-6.js hangs a few faded ones high in the baked sky): the three kinds of burst, in any of five hues;
// a lit bulb; and the searchlight's beam. All additive light, drawn with 'lighter'. A burst sprite is BLOOM.w x
// BLOOM.h with its centre at (cx, cy) and no spark reaching further than r from it (the willow's droop hangs
// below), so nothing is cut off at the edge (test/ui/art-carnival.test.js measures it).
import { cached, byColor, glow, rgba, shade, hash, lin, lighter } from './sprites.js';
import { TAU } from '../core/math.js';

export const HUES = ['#ff3fa0', '#ffc233', '#4be08a', '#a77bff', '#4de3ff']; // magenta, gold, mint, violet, cyan
export const KINDS = ['chrys', 'willow', 'ring'];
export const BLOOM = { w: 340, h: 420, cx: 170, cy: 170, r: 150 };

// A soft spark of light: a glow sprite r px round, at alpha a.
function spark(g, x, y, r, color, a) {
  g.globalAlpha = a;
  g.drawImage(glow(color), x - r, y - r, r * 2, r * 2);
  g.globalAlpha = 1;
}

// A streak from (x0, y0) to (x1, y1) that fades in toward the far end.
function streak(g, x0, y0, x1, y1, color, a, w) {
  g.strokeStyle = lin(g, x0, y0, x1, y1, [[0, rgba(color, 0)], [1, rgba(color, a)]]);
  g.lineWidth = w;
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  g.stroke();
}

// Set the painter up at the burst's centre in light, and put the context back afterwards.
const burst = (paint) => (g, color) => {
  g.save();
  g.translate(BLOOM.cx, BLOOM.cy);
  g.lineCap = 'round';
  lighter(g);
  paint(g, color);
  g.restore();
};

// A chrysanthemum: thirty-six rays with comet trails burning brighter toward white-hot tips, beads along
// them, a shorter pale star inside and a flash at the heart.
export const chrys = burst((g, color) => {
  const pale = shade(color, 0.55);
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * TAU + (hash(i + 900) - 0.5) * 0.07;
    const len = BLOOM.r * (0.74 + 0.26 * hash(i + 901));
    const [ux, uy] = [Math.cos(a), Math.sin(a)];
    streak(g, ux * len * 0.2, uy * len * 0.2, ux * len, uy * len, color, 0.85, 2.8);
    streak(g, ux * len * 0.55, uy * len * 0.55, ux * len, uy * len, '#fff4d8', 0.8, 1);
    for (let j = 1; j < 4; j++) spark(g, ux * len * (0.3 + 0.17 * j), uy * len * (0.3 + 0.17 * j), 3.4, pale, 0.5);
    spark(g, ux * len, uy * len, 11, color, 0.9);
    spark(g, ux * len, uy * len, 3.6, '#ffffff', 1);
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * TAU + 0.09;
    streak(g, 0, 0, Math.cos(a) * BLOOM.r * 0.46, Math.sin(a) * BLOOM.r * 0.46, pale, 0.7, 2);
    spark(g, Math.cos(a) * BLOOM.r * 0.46, Math.sin(a) * BLOOM.r * 0.46, 6, pale, 0.8);
  }
  spark(g, 0, 0, 30, '#ffffff', 0.55);
});

// A willow: long arcs of slow gold-edged sparks that leave the centre and then hang, drooping, a trail of
// beads thinning toward the ends.
export const willow = burst((g, color) => {
  const pale = shade(color, 0.4);
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * TAU + (hash(i + 920) - 0.5) * 0.08;
    const reach = BLOOM.r * (0.5 + 0.3 * hash(i + 921));
    const drop = BLOOM.r * (0.3 + 0.3 * hash(i + 922));
    const [c, e] = [[Math.cos(a) * reach * 0.9, Math.sin(a) * reach * 0.9 - 10], [Math.cos(a) * reach * 1.05, Math.sin(a) * reach * 1.05 + drop]];
    g.strokeStyle = lin(g, 0, 0, e[0], e[1], [[0, rgba(color, 0)], [0.4, rgba(color, 0.5)], [1, rgba(pale, 0.85)]]);
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(c[0], c[1], e[0], e[1]);
    g.stroke();
    for (let j = 0; j < 8; j++) {
      const t = 0.42 + j * 0.075;
      const u = 1 - t;
      spark(g, 2 * u * t * c[0] + t * t * e[0], 2 * u * t * c[1] + t * t * e[1], 3.4 - j * 0.25, pale, 0.85 - j * 0.07);
    }
    spark(g, e[0], e[1], 5, '#fff4d8', 0.7);
  }
  spark(g, 0, 0, 34, color, 0.5);
  spark(g, 0, 0, 16, '#ffffff', 0.7);
});

// A ring: an outer circle of thirty sparks with short trails drawn in from the centre, an inner ring of
// eighteen and a four-point star at the heart.
export const ring = burst((g, color) => {
  const pale = shade(color, 0.5);
  for (const [n, rr, c, tail, size] of [[30, 0.78, color, 22, 8], [18, 0.46, pale, 12, 6]]) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const [ux, uy] = [Math.cos(a), Math.sin(a)];
      const R = BLOOM.r * rr;
      streak(g, ux * (R - tail), uy * (R - tail), ux * R, uy * R, c, 0.9, 2.4);
      spark(g, ux * R, uy * R, size + 2, c, 0.85);
      spark(g, ux * R, uy * R, 2.6, '#ffffff', 1);
    }
  }
  g.fillStyle = rgba('#fff4d8', 0.9);
  g.beginPath();
  for (let i = 0; i < 8; i++) g.lineTo(Math.cos((i * TAU) / 8) * (i % 2 ? 5 : 26), Math.sin((i * TAU) / 8) * (i % 2 ? 5 : 26));
  g.fill();
  spark(g, 0, 0, 30, color, 0.6);
});

const MAKERS = { chrys, willow, ring };
const sets = Object.fromEntries(KINDS.map((k) => [k, byColor((color) => cached('carnBloom' + k + color, BLOOM.w, BLOOM.h, (g) => MAKERS[k](g, color)))]));
export const bloom = (kind, color) => sets[kind](color);

// A lit bulb, 32 x 32: a halo, a coloured glass and a white-hot core.
export const bulbSprite = byColor((color) => cached('carnBulb' + color, 32, 32, (g) => {
  g.drawImage(glow(color), 0, 0, 32, 32);
  g.drawImage(glow(shade(color, 0.5)), 8, 8, 16, 16);
  g.drawImage(glow('#ffffff'), 11, 11, 10, 10);
}));

export const BEAM = { w: 130, h: 1400 };
export const BEAM_COLORS = ['#ffe9b0', '#7ff4ff']; // the two searchlights: warm and cool
// A searchlight's beam, apex at the bottom middle, widening and fading toward the top, feathered at both sides.
export const beamSprite = byColor((color) => cached('carnBeam' + color, BEAM.w, BEAM.h, (g, w, h) => {
  g.fillStyle = lin(g, 0, h, 0, 0, [[0, rgba(color, 0.55)], [0.4, rgba(color, 0.22)], [1, rgba(color, 0)]]);
  g.beginPath();
  g.moveTo(w / 2 - 3, h);
  g.lineTo(0, 0);
  g.lineTo(w, 0);
  g.lineTo(w / 2 + 3, h);
  g.fill();
  g.globalCompositeOperation = 'destination-in';
  g.fillStyle = lin(g, 0, 0, w, 0, [[0, 'rgba(0,0,0,0)'], [0.32, 'rgba(0,0,0,1)'], [0.68, 'rgba(0,0,0,1)'], [1, 'rgba(0,0,0,0)']]);
  g.fillRect(0, 0, w, h);
}));

// Paint every sprite the shows draw, so none is baked mid-fight (warm-carnival.js).
export function warmBlooms() {
  for (const k of KINDS) for (const c of HUES) bloom(k, c);
  for (const c of HUES) bulbSprite(c);
  bulbSprite('#ffe9a0');
  for (const c of BEAM_COLORS) beamSprite(c);
}
